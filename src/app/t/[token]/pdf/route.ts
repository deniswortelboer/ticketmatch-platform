import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateTicketPDF, type TicketPDFTicket } from "@/lib/pdf-tickets";

// ═══════════════════════════════════════════════════════════════
// GET /t/[token]/pdf — download tickets as a multi-page PDF
// Public route, gated by access_token.
// ═══════════════════════════════════════════════════════════════

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
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
  const { data: booking } = await admin
    .from("bookings")
    .select(
      `id, access_token, venue_name, venue_city, scheduled_date, tickets,
       groups(name),
       companies(name, branding_mode, primary_color, support_email, support_phone)`
    )
    .eq("access_token", token)
    .maybeSingle();

  if (!booking) {
    return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
  }

  type Row = {
    id: string;
    venue_name: string;
    venue_city: string | null;
    scheduled_date: string | null;
    tickets: TicketPDFTicket[] | null;
    groups?: { name: string } | null;
    companies?: {
      name?: string;
      branding_mode?: string | null;
      primary_color?: string | null;
      support_email?: string | null;
      support_phone?: string | null;
    } | null;
  };
  const b = booking as unknown as Row;

  const tickets: TicketPDFTicket[] = Array.isArray(b.tickets) ? b.tickets : [];

  const pdfBuffer = await generateTicketPDF({
    venueName: b.venue_name,
    venueCity: b.venue_city ?? null,
    scheduledDate: b.scheduled_date ?? null,
    groupName: b.groups?.name ?? null,
    bookingRef: b.id,
    tickets,
    brandingMode:
      (b.companies?.branding_mode as
        | "white_label_light"
        | "co_branded"
        | "full_managed") || "co_branded",
    companyName: b.companies?.name || "TicketMatch",
    primaryColor: b.companies?.primary_color || "#0369a1",
    supportEmail: b.companies?.support_email ?? null,
    supportPhone: b.companies?.support_phone ?? null,
  });

  const filename = `tickets-${b.venue_name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
