import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { buildGoogleWalletSaveUrl } from "@/lib/google-wallet";

// ═══════════════════════════════════════════════════════════════
// GET /t/[token]/google
// Builds a Google Wallet save URL for the booking and redirects.
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
  if (!token || token.length < 16) {
    return NextResponse.json({ error: "Invalid token" }, { status: 404 });
  }

  const admin = getAdminClient();
  const { data: bookingRaw } = await admin
    .from("bookings")
    .select(
      `id, venue_name, venue_city, scheduled_date, tickets,
       companies(name, primary_color)`
    )
    .eq("access_token", token)
    .maybeSingle();

  if (!bookingRaw) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }

  type Row = {
    id: string;
    venue_name: string;
    venue_city: string | null;
    scheduled_date: string | null;
    tickets: Array<{ qr_data?: string }> | null;
    companies?: { name?: string | null; primary_color?: string | null } | null;
  };
  const b = bookingRaw as unknown as Row;

  const firstTicket = Array.isArray(b.tickets) ? b.tickets[0] : null;
  const qrValue = firstTicket?.qr_data || b.id;
  const voucherCode = b.id.slice(0, 8).toUpperCase();

  try {
    const saveUrl = await buildGoogleWalletSaveUrl({
      ticketId: b.id,
      venueName: b.venue_name,
      venueCity: b.venue_city || "—",
      date: fmtDate(b.scheduled_date),
      voucherCode,
      qrValue,
      organizationName: b.companies?.name || "TicketMatch",
      backgroundColor: b.companies?.primary_color || "#0369a1",
    });
    return NextResponse.redirect(saveUrl, 302);
  } catch (err) {
    console.error("Google Wallet (booking) error:", err);
    return NextResponse.json(
      { error: "Failed to create Google Wallet pass", details: String(err) },
      { status: 500 }
    );
  }
}
