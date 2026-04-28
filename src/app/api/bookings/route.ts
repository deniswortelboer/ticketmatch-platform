import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendBookingStatusEmail } from "@/lib/email";
import { notifyAdmin } from "@/lib/notify";
import { generateTicketToken } from "@/lib/ticket-token";

// ════════════════════════════════════════════════════════════
// SECURITY: Bookings endpoint with input validation
// - All routes require authentication
// - Company ownership check on all operations
// - Group ownership verification on create
// - Input validation (types, ranges, formats)
// ════════════════════════════════════════════════════════════

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function sanitize(str: unknown, maxLength = 500): string | null {
  if (!str || typeof str !== "string") return null;
  return str.trim().slice(0, maxLength) || null;
}

// GET: fetch bookings for current user's company
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ bookings: [] });

  const { data: bookings } = await admin
    .from("bookings")
    .select("*, groups(name, contact_person)")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ bookings: bookings || [] });
}

// POST: create a booking
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const groupId = sanitize(body.groupId, 36);
  const venueName = sanitize(body.venueName, 300);
  const venueCategory = sanitize(body.venueCategory, 100);
  const venueCity = sanitize(body.venueCity, 100);
  const scheduledDate = sanitize(body.scheduledDate, 10);
  const notes = sanitize(body.notes, 2000);

  // ── Validate required fields ──
  if (!groupId || !UUID_REGEX.test(groupId)) {
    return NextResponse.json({ error: "Valid group ID is required" }, { status: 400 });
  }
  if (!venueName || venueName.length < 2) {
    return NextResponse.json({ error: "Venue name is required" }, { status: 400 });
  }

  // ── Validate numeric fields ──
  const numberOfGuests = Math.max(0, Math.min(10000, Math.round(Number(body.numberOfGuests) || 0)));
  const unitPrice = Math.max(0, Math.min(100000, Number(body.unitPrice) || 0));

  // ── Validate date format if provided ──
  if (scheduledDate && !/^\d{4}-\d{2}-\d{2}$/.test(scheduledDate)) {
    return NextResponse.json({ error: "Invalid date format (use YYYY-MM-DD)" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company" }, { status: 400 });

  // ── SECURITY: Verify the group belongs to this company ──
  const { data: group } = await admin
    .from("groups")
    .select("id, name")
    .eq("id", groupId)
    .eq("company_id", profile.company_id)
    .single();

  if (!group) {
    return NextResponse.json({ error: "Group not found or access denied" }, { status: 403 });
  }

  const totalPrice = Math.round(numberOfGuests * unitPrice * 100) / 100;

  // Optional Musement fields — populated when the reseller picks a Musement
  // activity from Experiences or Discover. Stored on the pending booking so
  // the later confirm-order flow can execute the real Musement API call.
  const musementActivityUuid = sanitize(body.musementActivityUuid, 64);
  const musementDateId = sanitize(body.musementDateId, 64);

  // Optional per-holder breakdown for activities with multiple ticket
  // holder types (e.g. "2 ADULT @ €40 + 1 CHILD @ €20"). When present,
  // numberOfGuests/totalPrice are recomputed from the breakdown so the
  // sums always reconcile.
  type IncomingHolder = {
    code?: unknown;
    name?: unknown;
    qty?: unknown;
    productId?: unknown;
    unitPrice?: unknown;
    currency?: unknown;
  };
  const HOLDER_CODE_REGEX = /^[A-Z0-9_-]{1,32}$/;
  let holderBreakdown:
    | Array<{
        code: string;
        name: string;
        qty: number;
        product_id: string;
        unit_price: number;
        currency: string;
      }>
    | null = null;
  if (Array.isArray(body.holderBreakdown) && body.holderBreakdown.length > 0) {
    const cleaned = (body.holderBreakdown as IncomingHolder[])
      .map((h) => {
        const code = typeof h.code === "string" ? h.code.toUpperCase().slice(0, 32) : "";
        const productId = typeof h.productId === "string" ? h.productId.slice(0, 64) : "";
        const qty = Math.max(0, Math.min(10000, Math.round(Number(h.qty) || 0)));
        const unitPriceH = Math.max(0, Math.min(100000, Number(h.unitPrice) || 0));
        const name = typeof h.name === "string" ? h.name.slice(0, 100) : code;
        const cur = typeof h.currency === "string" ? h.currency.slice(0, 8) : "EUR";
        if (!HOLDER_CODE_REGEX.test(code) || !productId || qty <= 0) return null;
        return { code, name, qty, product_id: productId, unit_price: unitPriceH, currency: cur };
      })
      .filter((x): x is NonNullable<typeof x> => x !== null);
    if (cleaned.length > 0) holderBreakdown = cleaned;
  }

  // Reconcile guests + price with the breakdown when supplied so the
  // booking row, invoice, and confirm-order all see the same numbers.
  const finalGuests = holderBreakdown
    ? holderBreakdown.reduce((s, h) => s + h.qty, 0)
    : numberOfGuests;
  const finalTotalPrice = holderBreakdown
    ? Math.round(
        holderBreakdown.reduce((s, h) => s + h.qty * h.unit_price, 0) * 100,
      ) / 100
    : totalPrice;
  const finalUnitPrice =
    holderBreakdown && finalGuests > 0
      ? Math.round((finalTotalPrice / finalGuests) * 100) / 100
      : unitPrice;

  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      group_id: groupId,
      company_id: profile.company_id,
      venue_name: venueName,
      venue_category: venueCategory,
      venue_city: venueCity,
      scheduled_date: scheduledDate,
      number_of_guests: finalGuests,
      unit_price: finalUnitPrice,
      total_price: finalTotalPrice,
      notes,
      status: "pending",
      // Unique per-booking token used in /t/[token] ticket URLs (NOT NULL in schema)
      access_token: generateTicketToken(),
      ...(musementActivityUuid && { musement_activity_uuid: musementActivityUuid }),
      // musement_date_id is only meaningful for single-holder bookings.
      // Multi-holder ones leave it null and rely on holder_breakdown[].product_id.
      ...(musementDateId && !holderBreakdown && { musement_date_id: musementDateId }),
      ...(holderBreakdown && { holder_breakdown: holderBreakdown }),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send confirmation email for new booking
  if (booking) {
    const { data: company } = await admin.from("companies").select("name").eq("id", profile.company_id).single();
    const { data: teamMembers } = await admin
      .from("profiles")
      .select("email")
      .eq("company_id", profile.company_id)
      .not("email", "is", null);

    const emails = (teamMembers || [])
      .map((m: { email: string | null }) => m.email)
      .filter(Boolean) as string[];

    sendBookingStatusEmail({
      to: emails,
      companyName: company?.name || "Your company",
      venueName: venueName,
      groupName: group.name || "Your group",
      scheduledDate: scheduledDate || null,
      numberOfGuests: finalGuests || 0,
      status: "pending",
      notes: notes || undefined,
    }).catch((err) => console.error("Email send error:", err));

    const breakdownLine = holderBreakdown
      ? `\n   ${holderBreakdown.map((h) => `${h.qty}× ${h.code}`).join(" + ")}`
      : "";
    notifyAdmin(`🟡 Pending booking — awaiting payment\n\n🏢 ${company?.name || "—"}\n📍 ${venueName}${venueCity ? ` (${venueCity})` : ""}\n👥 ${finalGuests} gasten${breakdownLine}\n📅 ${scheduledDate || "Geen datum"}\n💰 €${finalTotalPrice.toFixed(2)}\n\nStatus flips to "confirmed" once Stripe webhook fires.\n→ ticketmatch.ai/dashboard/admin`);
  }

  return NextResponse.json({ booking });
}

// DELETE: remove a booking
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("id");

  if (!bookingId || !UUID_REGEX.test(bookingId)) {
    return NextResponse.json({ error: "Valid booking ID required" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company" }, { status: 400 });

  // Only delete if booking belongs to user's company
  const { count } = await admin
    .from("bookings")
    .delete({ count: "exact" })
    .eq("id", bookingId)
    .eq("company_id", profile.company_id);

  if (!count) {
    return NextResponse.json({ error: "Booking not found or access denied" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
