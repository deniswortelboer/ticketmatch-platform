import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateTicketToken } from "@/lib/ticket-token";
import { notifyAdmin, sendWhatsApp } from "@/lib/notify";

// ═══════════════════════════════════════════════════════════════
// POST /api/bookings/:id/send-tickets
//
// Prepares and sends a ticket delivery link to the booker.
//   1. Ensures the booking has an access_token (generates one if missing)
//   2. If no tickets stored yet → generates placeholder QRs (one per guest)
//      (to be replaced with real Musement QRs once integration is live)
//   3. Updates bookings.tickets + delivered_at + delivery_channels
//   4. Sends email (Resend), WhatsApp (if recipient known), Telegram (admin)
//
// Body (all optional):
//   { recipientEmail?: string, recipientPhone?: string,
//     regenerateTickets?: boolean }
// ═══════════════════════════════════════════════════════════════

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM_EMAIL = "TicketMatch <notifications@ticketmatch.ai>";

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {}
        },
      },
    }
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function generatePlaceholderTickets(count: number, bookingId: string) {
  return Array.from({ length: count }, (_, i) => ({
    guest_name: null as string | null,
    qr_data: `TICKETMATCH-${bookingId}-${i + 1}-${Date.now().toString(36)}`,
    seat: null as string | null,
    notes: null as string | null,
  }));
}

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
}

function buildEmailHtml(opts: {
  headerTitle: string;
  primaryColor: string;
  venueName: string;
  dateText: string;
  guestsCount: number;
  ticketUrl: string;
  brandingMode: string;
  companyName: string;
  supportEmail?: string | null;
  supportPhone?: string | null;
}) {
  const {
    headerTitle,
    primaryColor,
    venueName,
    dateText,
    guestsCount,
    ticketUrl,
    brandingMode,
    companyName,
    supportEmail,
    supportPhone,
  } = opts;

  const footer =
    brandingMode === "full_managed"
      ? `
        <p style="margin:24px 0 4px;color:#0f172a;font-weight:600">TicketMatch Support</p>
        ${supportEmail ? `<p style="margin:0;color:#64748b;font-size:13px">${supportEmail}</p>` : ""}
        ${supportPhone ? `<p style="margin:0;color:#64748b;font-size:13px">${supportPhone}</p>` : ""}
      `
      : `
        <p style="margin:24px 0 4px;color:#0f172a">Met vriendelijke groet,<br/><strong>${companyName}</strong></p>
        <p style="margin:16px 0 0;color:#94a3b8;font-size:11px">Verzonden via TicketMatch</p>
      `;

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <div style="background:${primaryColor};padding:24px;color:#ffffff">
        <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.01em">${headerTitle}</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.9">Je tickets zijn klaar</p>
      </div>
      <div style="padding:28px 24px">
        <h2 style="margin:0 0 16px;font-size:18px">🎟️ ${venueName}</h2>
        ${dateText ? `<p style="margin:0 0 6px;color:#334155">📅 ${dateText}</p>` : ""}
        <p style="margin:0 0 20px;color:#334155">👥 ${guestsCount} gasten</p>
        <a href="${ticketUrl}"
           style="display:inline-block;background:${primaryColor};color:#ffffff;text-decoration:none;
                  padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px">
          Bekijk je tickets
        </a>
        <p style="margin:18px 0 0;color:#64748b;font-size:13px">
          Op deze pagina kan je je tickets opslaan in Apple Wallet, Google Wallet,
          downloaden als PDF, of printen.
        </p>
        <hr style="border:none;border-top:1px solid #e2e8f0;margin:28px 0"/>
        ${footer}
      </div>
    </div>
  </div>
  `;
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Valid booking ID required" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    recipientEmail?: string;
    recipientPhone?: string;
    regenerateTickets?: boolean;
  };

  const admin = getAdminClient();
  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();
  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company" }, { status: 400 });
  }

  // Fetch booking (ownership check)
  const { data: bookingRaw } = await admin
    .from("bookings")
    .select(
      `id, venue_name, venue_city, scheduled_date, number_of_guests, status,
       access_token, tickets, delivery_channels,
       company_id, group_id,
       groups(name, contact_person),
       companies(name, branding_mode, primary_color, support_email, support_phone)`
    )
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .single();

  if (!bookingRaw) {
    return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 });
  }

  type BookingRow = {
    id: string;
    venue_name: string;
    venue_city: string | null;
    scheduled_date: string | null;
    number_of_guests: number;
    status: string;
    access_token: string | null;
    tickets: Array<{ qr_data: string; guest_name?: string | null; seat?: string | null; notes?: string | null }> | null;
    delivery_channels: string[] | null;
    group_id: string;
    groups?: { name: string | null; contact_person: string | null } | null;
    companies?: {
      name?: string | null;
      branding_mode?: string | null;
      primary_color?: string | null;
      support_email?: string | null;
      support_phone?: string | null;
    } | null;
  };
  const booking = bookingRaw as unknown as BookingRow;

  // Ensure access_token (should exist from migration backfill, but safety)
  let accessToken = booking.access_token;
  if (!accessToken) {
    accessToken = generateTicketToken();
    await admin.from("bookings").update({ access_token: accessToken }).eq("id", id);
  }

  // Ensure tickets exist
  let tickets = Array.isArray(booking.tickets) ? booking.tickets : [];
  if (tickets.length === 0 || body.regenerateTickets) {
    tickets = generatePlaceholderTickets(booking.number_of_guests || 1, booking.id);
  }

  const ticketUrl = `${siteUrl()}/t/${accessToken}`;
  const brandingMode = booking.companies?.branding_mode || "co_branded";
  const primaryColor = booking.companies?.primary_color || "#0369a1";
  const companyName = booking.companies?.name || "TicketMatch";
  const headerTitle = brandingMode === "full_managed" ? "TicketMatch.ai" : companyName;
  const dateText = booking.scheduled_date
    ? new Date(booking.scheduled_date.length === 10 ? booking.scheduled_date + "T00:00:00" : booking.scheduled_date).toLocaleDateString(
        "nl-NL",
        { weekday: "long", day: "numeric", month: "long", year: "numeric" }
      )
    : "";

  // Determine recipient email: body override > group.contact_person > team member
  const recipientEmail =
    body.recipientEmail?.trim() ||
    booking.groups?.contact_person ||
    undefined;

  const usedChannels: string[] = [];

  // ─── EMAIL ─────────────────────────────────────────────────
  if (resend && recipientEmail) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: recipientEmail,
        subject: `🎟️ Je tickets voor ${booking.venue_name}`,
        html: buildEmailHtml({
          headerTitle,
          primaryColor,
          venueName: booking.venue_name,
          dateText,
          guestsCount: booking.number_of_guests,
          ticketUrl,
          brandingMode,
          companyName,
          supportEmail: booking.companies?.support_email ?? null,
          supportPhone: booking.companies?.support_phone ?? null,
        }),
      });
      usedChannels.push("email");
    } catch (err) {
      console.error("Resend send failed:", err);
    }
  }

  // ─── WHATSAPP (if recipientPhone provided — free-form text only works in 24h window) ───
  if (body.recipientPhone?.trim() && process.env.WHATSAPP_TOKEN && process.env.WHATSAPP_PHONE_ID) {
    try {
      const to = body.recipientPhone.replace(/[^0-9]/g, "");
      await fetch(
        `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_ID}/messages`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
          },
          body: JSON.stringify({
            messaging_product: "whatsapp",
            to,
            type: "text",
            text: {
              body: `🎟️ Je tickets voor ${booking.venue_name}${dateText ? ` op ${dateText}` : ""} zijn klaar.\n\nBekijk je tickets: ${ticketUrl}\n\n— ${headerTitle}`,
            },
          }),
        }
      );
      usedChannels.push("whatsapp");
    } catch (err) {
      console.error("WhatsApp send failed:", err);
    }
  }

  // ─── TELEGRAM (admin notification) + optional customer WhatsApp fallback ───
  sendWhatsApp(
    `📤 Tickets verstuurd\n\n🏢 ${companyName}\n📍 ${booking.venue_name}\n👥 ${booking.number_of_guests} gasten\n📅 ${dateText || "-"}\n\n→ ${ticketUrl}`
  );
  notifyAdmin(
    `📤 Tickets verstuurd voor ${booking.venue_name}\n→ ${ticketUrl}${
      recipientEmail ? `\n📧 ${recipientEmail}` : ""
    }`
  );

  // ─── Persist ──────────────────────────────────────────────
  const { error: updErr } = await admin
    .from("bookings")
    .update({
      tickets,
      delivered_at: new Date().toISOString(),
      delivery_channels: usedChannels,
    })
    .eq("id", id);
  if (updErr) {
    console.error("Failed to update booking after delivery:", updErr);
  }

  return NextResponse.json({
    ok: true,
    access_token: accessToken,
    ticket_url: ticketUrl,
    tickets_count: tickets.length,
    delivered_channels: usedChannels,
    recipient_email: recipientEmail || null,
  });
}
