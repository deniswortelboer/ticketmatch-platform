import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createCart,
  addToCart,
  setCartCustomer,
  confirmOrder,
} from "@/lib/musement";
import { notifyAdmin } from "@/lib/notify";

// ═══════════════════════════════════════════════════════════════
// POST /api/bookings/:id/confirm-order
//
// Places the Musement order for a TicketMatch booking.
//  - If MUSEMENT_API_KEY + musement_activity_uuid + musement_date_id
//    are all present → calls the real Musement Merchant API
//    (createCart → addToCart → setCartCustomer → confirmOrder).
//  - Otherwise → MOCK MODE: generates placeholder QR codes so the
//    downstream delivery flow can be exercised without real credentials.
//
// Body (optional):
//   { guestNames?: string[] }
//
// On success: writes bookings.tickets (per-guest QRs), sets
// musement_status = 'confirmed', status = 'confirmed', writes
// musement_order_id, returns summary.
// ═══════════════════════════════════════════════════════════════

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

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

type TicketRow = {
  guest_name: string | null;
  qr_data: string;
  seat: string | null;
  notes: string | null;
};

function mockTickets(
  bookingId: string,
  count: number,
  guestNames?: string[]
): TicketRow[] {
  return Array.from({ length: count }, (_, i) => ({
    guest_name: guestNames?.[i] ?? null,
    qr_data: `TICKETMATCH-MOCK-${bookingId}-${i + 1}-${Date.now().toString(36)}`,
    seat: null,
    notes: null,
  }));
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getAuthUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!id || !UUID_REGEX.test(id)) {
    return NextResponse.json({ error: "Valid booking ID required" }, { status: 400 });
  }

  const body = (await req.json().catch(() => ({}))) as { guestNames?: string[] };

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
       musement_activity_uuid, musement_date_id, musement_order_id, musement_status,
       company_id, group_id,
       groups(name, contact_person),
       companies(name)`
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
    musement_activity_uuid: string | null;
    musement_date_id: string | null;
    musement_order_id: string | null;
    musement_status: string | null;
    groups?: { name: string | null; contact_person: string | null } | null;
    companies?: { name: string | null } | null;
  };
  const booking = bookingRaw as unknown as BookingRow;

  if (booking.musement_status === "confirmed" && booking.musement_order_id) {
    return NextResponse.json({
      ok: true,
      alreadyConfirmed: true,
      musement_order_id: booking.musement_order_id,
    });
  }

  // Mark as "placing" so we don't double-fire
  await admin
    .from("bookings")
    .update({ musement_status: "placing" })
    .eq("id", id);

  const quantity = Math.max(1, booking.number_of_guests || 1);
  const canPlaceReal =
    !!process.env.MUSEMENT_API_KEY &&
    !!booking.musement_activity_uuid &&
    !!booking.musement_date_id;

  let tickets: TicketRow[] = [];
  let musementOrderId: string | null = null;
  let mode: "real" | "mock" = "mock";

  try {
    if (canPlaceReal) {
      mode = "real";
      const cartUuid = await createCart("en");
      if (!cartUuid) throw new Error("createCart returned null");

      const added = await addToCart(
        cartUuid,
        booking.musement_activity_uuid!,
        booking.musement_date_id!,
        quantity,
        "en"
      );
      if (!added) throw new Error("addToCart failed");

      // Use group contact_person for customer info (split name heuristically)
      const contact = booking.groups?.contact_person || "TicketMatch Customer";
      const [firstName, ...rest] = contact.split(" ");
      const customer = {
        firstName: firstName || "Guest",
        lastName: rest.join(" ") || "Booker",
        email: booking.groups?.contact_person?.includes("@")
          ? booking.groups.contact_person
          : "travel@w69.ai",
      };

      const customerSet = await setCartCustomer(cartUuid, customer, "en");
      if (!customerSet) throw new Error("setCartCustomer failed");

      const order = await confirmOrder(cartUuid, "en");
      if (!order) throw new Error("confirmOrder returned null");

      musementOrderId = order.orderId || null;
      tickets = (order.tickets || []).map((t, i) => ({
        guest_name: body.guestNames?.[i] ?? null,
        qr_data: t.qrCode || t.ticketId || `MISSING-${i}`,
        seat: null,
        notes: t.pdfUrl ? `Musement voucher: ${t.pdfUrl}` : null,
      }));

      // Fall back to mock if Musement returned zero tickets
      if (tickets.length === 0) {
        tickets = mockTickets(booking.id, quantity, body.guestNames);
      }
    } else {
      tickets = mockTickets(booking.id, quantity, body.guestNames);
      musementOrderId = `mock-${Date.now()}`;
    }

    await admin
      .from("bookings")
      .update({
        tickets,
        musement_order_id: musementOrderId,
        musement_status: "confirmed",
        status: "confirmed",
      })
      .eq("id", id);

    notifyAdmin(
      `🎫 Order bevestigd (${mode})\n\n` +
        `🏢 ${booking.companies?.name || "-"}\n` +
        `📍 ${booking.venue_name}\n` +
        `👥 ${quantity} tickets\n` +
        `📅 ${booking.scheduled_date || "-"}\n` +
        `🔖 Ref: ${musementOrderId}\n\n` +
        `Klik "Send Tickets" om te versturen.`
    );

    return NextResponse.json({
      ok: true,
      mode,
      musement_order_id: musementOrderId,
      tickets_count: tickets.length,
    });
  } catch (err) {
    console.error("[confirm-order] Musement order failed:", err);
    await admin
      .from("bookings")
      .update({ musement_status: "failed" })
      .eq("id", id);
    notifyAdmin(
      `⚠️ Musement order FAILED voor ${booking.venue_name}: ${
        err instanceof Error ? err.message : "unknown"
      }`
    );
    return NextResponse.json(
      { error: "Musement order failed", details: String(err) },
      { status: 502 }
    );
  }
}
