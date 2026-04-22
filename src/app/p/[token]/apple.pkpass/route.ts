import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { buildBookingVoucher } from "@/lib/apple-wallet";
import { verifyPassengerToken, parsePassengersFromNotes } from "@/lib/passengers";

// ═══════════════════════════════════════════════════════════════
// GET /p/[token]/apple.pkpass
// Per-passenger Apple Wallet pass.
// Uses the FIRST booking-in-the-group's ticket for this passenger.
// For multi-booking trips, additional passes can be added to wallet
// by clicking the wallet link from each booking card individually
// (v2: multi-pass bundle).
// ═══════════════════════════════════════════════════════════════

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function fmtDate(iso: string | null): string {
  if (!iso) return "TBD";
  const d = new Date(iso.length === 10 ? iso + "T00:00:00" : iso);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const decoded = verifyPassengerToken(token);
  if (!decoded) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const { groupId, passengerIndex } = decoded;
  const admin = getAdminClient();

  const { data: groupRaw } = await admin
    .from("groups")
    .select(
      `id, name, notes,
       companies(name, primary_color)`
    )
    .eq("id", groupId)
    .maybeSingle();

  if (!groupRaw) {
    return NextResponse.json({ error: "Group not found" }, { status: 404 });
  }

  type GroupRow = {
    id: string;
    name: string | null;
    notes: string | null;
    companies?: { name?: string | null; primary_color?: string | null } | null;
  };
  const group = groupRaw as unknown as GroupRow;

  const passengers = parsePassengersFromNotes(group.notes);
  const me = passengers.find((p) => p.index === passengerIndex) ?? null;
  const passengerName = me?.name || `Guest #${passengerIndex + 1}`;

  const { data: bookings } = await admin
    .from("bookings")
    .select("id, venue_name, venue_city, scheduled_date, tickets")
    .eq("group_id", groupId)
    .order("scheduled_date", { ascending: true, nullsFirst: false });

  type BookingRow = {
    id: string;
    venue_name: string;
    venue_city: string | null;
    scheduled_date: string | null;
    tickets: Array<{ qr_data?: string }> | null;
  };
  const list = (bookings || []) as BookingRow[];

  // Find first booking that has a ticket at this passenger's index
  const firstMatch = list.find((b) => {
    const t = Array.isArray(b.tickets) ? b.tickets[passengerIndex] : null;
    return t !== undefined && t !== null;
  });

  if (!firstMatch) {
    return NextResponse.json({ error: "No tickets yet" }, { status: 404 });
  }

  const ticket = (firstMatch.tickets as Array<{ qr_data?: string }>)[passengerIndex];
  const qrValue = ticket.qr_data || firstMatch.id;
  const voucherCode = `${firstMatch.id.slice(0, 6)}-${passengerIndex + 1}`.toUpperCase();

  try {
    const pass = await buildBookingVoucher({
      bookingId: `${firstMatch.id}-${passengerIndex}`,
      venueName: firstMatch.venue_name,
      venueCity: firstMatch.venue_city || "—",
      date: fmtDate(firstMatch.scheduled_date),
      time: "",
      guests: 1,
      passengerName,
      voucherCode,
      qrValue,
      organizationName: group.companies?.name || "TicketMatch",
      logoText: group.companies?.name || "TicketMatch",
      backgroundColor: group.companies?.primary_color || "#0369a1",
    });
    const buffer = pass.getAsBuffer();

    return new Response(buffer as unknown as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.apple.pkpass",
        "Content-Disposition": `attachment; filename="ticket-${voucherCode}.pkpass"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err) {
    console.error("Apple Wallet (passenger) pass error:", err);
    return NextResponse.json(
      { error: "Failed to create pass", details: String(err) },
      { status: 500 }
    );
  }
}
