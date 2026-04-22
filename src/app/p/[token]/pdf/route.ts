import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { generateTicketPDF, type TicketPDFTicket } from "@/lib/pdf-tickets";
import { verifyPassengerToken, parsePassengersFromNotes } from "@/lib/passengers";

// ═══════════════════════════════════════════════════════════════
// GET /p/[token]/pdf
// Returns one multi-page PDF with ALL tickets for a single passenger
// across all bookings in their group.
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
       companies(name, branding_mode, primary_color, support_email, support_phone)`
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
  const me = passengers.find((p) => p.index === passengerIndex) ?? null;
  const passengerName = me?.name || `Guest #${passengerIndex + 1}`;

  const { data: bookings } = await admin
    .from("bookings")
    .select("id, venue_name, venue_city, scheduled_date, tickets")
    .eq("group_id", groupId)
    .order("scheduled_date", { ascending: true, nullsFirst: false });

  const bookingsList = (bookings || []) as Array<{
    id: string;
    venue_name: string;
    venue_city: string | null;
    scheduled_date: string | null;
    tickets: TicketPDFTicket[] | null;
  }>;

  // Combine: one PDF page per (booking, passengerIndex ticket) pair.
  // We call generateTicketPDF once per booking with just THIS passenger's ticket.
  // To keep the output as a single multi-page PDF, we'll inline-assemble using
  // a single pdfLib doc. But for simplicity, we concatenate by generating a
  // single pdf with multiple tickets formatted as "one page per booking".
  //
  // generateTicketPDF already supports multiple tickets in one PDF. We feed it
  // one synthetic ticket per booking, where guest_name is the passenger and
  // venueName is the booking venue. To reuse generateTicketPDF's page layout
  // (header + venue + QR), we call it once per booking and concat... but
  // actually, simplest: build a synthetic list where each "ticket" carries
  // its own booking context via the notes field.
  //
  // Cleanest: call generateTicketPDF once with N tickets, but override venueName
  // per call is not possible. So we'll call it N times and concatenate using
  // pdf-lib, OR generate one PDF per booking in a single call by embedding
  // the booking name inside the "notes" (acceptable compromise).
  //
  // For this MVP we pick: multi-call + concat via pdf-lib. However pdf-lib
  // isn't installed. Fallback: build one document through multiple
  // generateTicketPDF calls and use only the first; for simplicity we generate
  // a single PDF using generateTicketPDF with one "composite" per booking as
  // its own ticket. This uses the first booking as the venue header in the
  // current version — acceptable for v1; we can refine later if Denis wants.

  // Simplest V1: loop bookings, build a single tickets array where each
  // ticket's guest_name/notes convey the booking context, venueName is the
  // group name.

  const syntheticTickets: TicketPDFTicket[] = bookingsList
    .map((b) => {
      const arr: TicketPDFTicket[] = Array.isArray(b.tickets) ? b.tickets : [];
      const t = arr[passengerIndex];
      if (!t) return null;
      return {
        guest_name: passengerName,
        qr_data: t.qr_data,
        seat: t.seat ?? null,
        notes: `${b.venue_name}${b.venue_city ? ` · ${b.venue_city}` : ""}${
          b.scheduled_date ? ` · ${b.scheduled_date}` : ""
        }`,
      } as TicketPDFTicket;
    })
    .filter((x): x is TicketPDFTicket => !!x);

  if (syntheticTickets.length === 0) {
    return NextResponse.json({ error: "No tickets yet" }, { status: 404 });
  }

  const pdfBuffer = await generateTicketPDF({
    venueName: group.name || "Je trip",
    venueCity: null,
    scheduledDate: null,
    groupName: group.name || null,
    bookingRef: `${groupId}-${passengerIndex}`,
    tickets: syntheticTickets,
    brandingMode:
      (group.companies?.branding_mode as
        | "white_label_light"
        | "co_branded"
        | "full_managed") || "co_branded",
    companyName: group.companies?.name || "TicketMatch",
    primaryColor: group.companies?.primary_color || "#0369a1",
    supportEmail: group.companies?.support_email ?? null,
    supportPhone: group.companies?.support_phone ?? null,
  });

  const safeName = passengerName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
  const filename = `tickets-${safeName}.pdf`;

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    },
  });
}
