import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generatePassengerToken, parsePassengersFromNotes } from "@/lib/passengers";
import { notifyAdmin } from "@/lib/notify";

// ═══════════════════════════════════════════════════════════════
// POST /api/groups/:id/send-to-passengers
// Dispatches per-passenger co-branded ticket links to every
// passenger in the group that has an email (and optionally phone
// for WhatsApp). Each passenger gets a unique /p/[token] URL
// containing ONLY their own tickets across all bookings.
//
// Body: { includeWhatsApp?: boolean }
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

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
}

function buildEmailHtml(opts: {
  primaryColor: string;
  headerTitle: string;
  companyName: string;
  passengerFirstName: string;
  bookingCount: number;
  ticketUrl: string;
  brandingMode: string;
  supportEmail?: string | null;
  supportPhone?: string | null;
}) {
  const {
    primaryColor,
    headerTitle,
    companyName,
    passengerFirstName,
    bookingCount,
    ticketUrl,
    brandingMode,
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
        <p style="margin:24px 0 4px;color:#0f172a">Veel plezier op je trip!<br/><strong>${companyName}</strong></p>
        <p style="margin:16px 0 0;color:#94a3b8;font-size:11px">Verzonden via TicketMatch</p>
      `;

  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Helvetica,Arial,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)">
      <div style="background:${primaryColor};padding:24px;color:#ffffff">
        <h1 style="margin:0;font-size:20px;font-weight:700;letter-spacing:-0.01em">${headerTitle}</h1>
        <p style="margin:4px 0 0;font-size:14px;opacity:0.9">Je persoonlijke tickets</p>
      </div>
      <div style="padding:28px 24px">
        <h2 style="margin:0 0 12px;font-size:18px">Hi ${passengerFirstName}! 👋</h2>
        <p style="margin:0 0 20px;color:#334155">
          Je persoonlijke ${bookingCount === 1 ? "ticket is" : "tickets zijn"} klaar. Je hebt ${bookingCount} activiteit${bookingCount !== 1 ? "en" : ""} tijdens je trip.
        </p>
        <a href="${ticketUrl}"
           style="display:inline-block;background:${primaryColor};color:#ffffff;text-decoration:none;
                  padding:14px 24px;border-radius:10px;font-weight:600;font-size:15px">
          Bekijk mijn tickets
        </a>
        <p style="margin:18px 0 0;color:#64748b;font-size:13px">
          Op deze pagina kun je je tickets opslaan in Apple Wallet, Google Wallet,
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
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: groupId } = await params;
  if (!groupId || !UUID_REGEX.test(groupId)) {
    return NextResponse.json({ error: "Valid group ID required" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as {
    includeWhatsApp?: boolean;
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

  const { data: groupRaw } = await admin
    .from("groups")
    .select(
      `id, name, notes,
       company_id,
       companies(name, branding_mode, primary_color, support_email, support_phone)`
    )
    .eq("id", groupId)
    .eq("company_id", profile.company_id)
    .single();

  if (!groupRaw) {
    return NextResponse.json({ error: "Group not found or access denied" }, { status: 404 });
  }

  type GroupRow = {
    id: string;
    name: string | null;
    notes: string | null;
    companies?: {
      name?: string | null;
      branding_mode?: string | null;
      primary_color?: string | null;
      support_email?: string | null;
      support_phone?: string | null;
    } | null;
  };
  const group = groupRaw as unknown as GroupRow;

  const passengers = parsePassengersFromNotes(group.notes);
  if (passengers.length === 0) {
    return NextResponse.json(
      { error: "No passengers parsed from group notes" },
      { status: 400 }
    );
  }

  // Count how many bookings in this group currently have tickets at each
  // passenger index (for the email count).
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, tickets")
    .eq("group_id", groupId);

  const bookingList = (bookings || []) as Array<{
    id: string;
    tickets: Array<unknown> | null;
  }>;

  const brandingMode = group.companies?.branding_mode || "co_branded";
  const primaryColor = group.companies?.primary_color || "#0369a1";
  const companyName = group.companies?.name || "TicketMatch";
  const headerTitle = brandingMode === "full_managed" ? "TicketMatch.ai" : companyName;

  const results: Array<{
    index: number;
    name: string;
    emailSent: boolean;
    whatsappSent: boolean;
    reason?: string;
  }> = [];

  for (const p of passengers) {
    const token = generatePassengerToken(groupId, p.index);
    const ticketUrl = `${siteUrl()}/p/${token}`;
    const firstName = p.name.split(" ")[0] || p.name;

    const bookingCount = bookingList.filter((b) => {
      const arr = Array.isArray(b.tickets) ? b.tickets : [];
      return arr[p.index] !== undefined;
    }).length;

    let emailSent = false;
    let whatsappSent = false;
    let reason: string | undefined;

    // ─── Email ─────────────────────────────────────────────
    if (resend && p.email) {
      try {
        await resend.emails.send({
          from: FROM_EMAIL,
          to: p.email,
          subject: `🎟️ Je persoonlijke tickets${group.name ? ` — ${group.name}` : ""}`,
          html: buildEmailHtml({
            primaryColor,
            headerTitle,
            companyName,
            passengerFirstName: firstName,
            bookingCount: bookingCount || 1,
            ticketUrl,
            brandingMode,
            supportEmail: group.companies?.support_email ?? null,
            supportPhone: group.companies?.support_phone ?? null,
          }),
        });
        emailSent = true;
      } catch (err) {
        reason = `email: ${err instanceof Error ? err.message : "unknown"}`;
      }
    } else if (!p.email) {
      reason = "no email";
    }

    // ─── WhatsApp (optional, 24h window caveat applies) ───
    if (
      body.includeWhatsApp &&
      p.phone &&
      process.env.WHATSAPP_TOKEN &&
      process.env.WHATSAPP_PHONE_ID
    ) {
      try {
        const to = p.phone.replace(/[^0-9]/g, "");
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
                preview_url: true,
                body: `🎟️ Hi ${firstName}, je persoonlijke tickets zijn klaar.\n\nBekijk: ${ticketUrl}\n\n— ${headerTitle}`,
              },
            }),
          }
        );
        whatsappSent = true;
      } catch (err) {
        reason = (reason ? reason + "; " : "") + `whatsapp: ${err instanceof Error ? err.message : "unknown"}`;
      }
    }

    results.push({
      index: p.index,
      name: p.name,
      emailSent,
      whatsappSent,
      reason,
    });
  }

  const emailsSent = results.filter((r) => r.emailSent).length;
  const wasSent = results.filter((r) => r.whatsappSent).length;

  notifyAdmin(
    `📤 Per-passenger delivery\n\n` +
      `🏢 ${companyName}\n` +
      `👥 Groep: ${group.name || "-"}\n` +
      `✅ ${emailsSent} email${emailsSent !== 1 ? "s" : ""} verstuurd\n` +
      `💬 ${wasSent} WhatsApp${wasSent !== 1 ? "s" : ""} verstuurd\n` +
      `📋 Totaal passagiers: ${passengers.length}`
  );

  return NextResponse.json({
    ok: true,
    passengersCount: passengers.length,
    emailsSent,
    whatsappSent: wasSent,
    results,
  });
}
