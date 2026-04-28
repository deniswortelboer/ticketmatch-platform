import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  createCart,
  addToCart,
  setCartCustomer,
  confirmOrder,
  markOrderPaid,
  resolveProductIdentifier,
  getCustomerSchema,
  getCartItems,
  setParticipants,
  type MusementParticipant,
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

  const body = (await req.json().catch(() => ({}))) as {
    guestNames?: string[];
    bookingAnswers?: Record<string, Record<string, unknown>>;
    participants?: MusementParticipant[];
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
       musement_activity_uuid, musement_date_id, musement_order_id, musement_status,
       holder_breakdown,
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

  type HolderBreakdownRow = {
    code: string;
    name?: string;
    qty: number;
    product_id: string;
    unit_price: number;
    currency?: string;
  };
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
    holder_breakdown: HolderBreakdownRow[] | null;
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
  // Go live with Musement if we have credentials + an activity UUID. The
  // product_identifier (stored in musement_date_id historically) can be
  // resolved from the travel date when missing.
  const canPlaceReal =
    !!process.env.MUSEMENT_APP_HEADER &&
    !!booking.musement_activity_uuid;

  let tickets: TicketRow[] = [];
  let musementOrderId: string | null = null;
  let mode: "real" | "mock" = "mock";

  try {
    if (canPlaceReal) {
      mode = "real";

      // Two cart-construction paths:
      //
      //  (a) Multi-holder bookings: holder_breakdown is set → loop through
      //      each holder type and call addToCart once per holder with that
      //      product_id + qty. Sum of qtys matches booking.number_of_guests.
      //
      //  (b) Legacy single-holder bookings: musement_date_id holds the one
      //      product_id; fall back to resolveProductIdentifier from the
      //      travel date when missing (sparse sandbox availability).
      const cartUuid = await createCart("en");
      if (!cartUuid) throw new Error("createCart returned null");

      const breakdownItems: HolderBreakdownRow[] = booking.holder_breakdown || [];
      if (breakdownItems.length > 0) {
        for (const h of breakdownItems) {
          const ok = await addToCart(cartUuid, h.product_id, h.qty, "en");
          if (!ok) throw new Error(`addToCart failed for holder ${h.code} (${h.product_id})`);
        }
      } else {
        let productIdentifier = booking.musement_date_id;
        if (!productIdentifier) {
          const anchor =
            booking.scheduled_date ||
            new Date(Date.now() + 31 * 86400_000).toISOString().slice(0, 10); // 31 days out — default, sandbox requires ≥1 month
          const resolved = await resolveProductIdentifier(
            booking.musement_activity_uuid!,
            anchor,
            14
          );
          if (!resolved) {
            throw new Error(
              `No Musement availability for activity ${booking.musement_activity_uuid} around ${anchor}`
            );
          }
          productIdentifier = resolved.productId;
          // Persist what we resolved so retries are idempotent
          await admin
            .from("bookings")
            .update({ musement_date_id: productIdentifier })
            .eq("id", id);
        }

        const added = await addToCart(cartUuid, productIdentifier, quantity, "en");
        if (!added) throw new Error("addToCart failed");
      }

      // Per Musement Quality Check #8, fetch the cart-scoped schema to see
      // which booking-question fields this activity requires. If the request
      // did not supply answers (`body.bookingAnswers`) and the schema has
      // required fields, return 422 with the schema so the UI can render a
      // dynamic form and retry with answers.
      const schema = await getCustomerSchema(cartUuid, "en");
      const suppliedAnswers = (body.bookingAnswers || {}) as Record<
        string,
        Record<string, unknown>
      >;
      const suppliedParticipants = (body.participants || []) as MusementParticipant[];

      if (schema && schema.requiredExtraFields.length > 0) {
        const missing = schema.requiredExtraFields.filter(
          (f) => suppliedAnswers[f.activityUuid]?.[f.fieldName] === undefined
        );
        if (missing.length > 0) {
          return NextResponse.json(
            {
              error: "This activity requires booking-question answers before it can be confirmed.",
              code: "MISSING_BOOKING_QUESTIONS",
              requiredFields: schema.requiredExtraFields,
              missingFields: missing,
            },
            { status: 422 }
          );
        }
      }

      if (schema?.participantsRequired && suppliedParticipants.length !== quantity) {
        return NextResponse.json(
          {
            error: `This activity requires per-participant info. Expected ${quantity} participants, got ${suppliedParticipants.length}.`,
            code: "MISSING_PARTICIPANTS",
            expectedCount: quantity,
          },
          { status: 422 }
        );
      }

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

      const customerSet = await setCartCustomer(
        cartUuid,
        customer,
        "en",
        Object.keys(suppliedAnswers).length > 0 ? suppliedAnswers : undefined
      );
      if (!customerSet) throw new Error("setCartCustomer failed");

      // If the activity needs per-participant info, submit it against each
      // cart item. We only have one cart item in this flow (single activity
      // per booking), but we fetch and iterate to stay forward-compatible.
      if (schema?.participantsRequired && suppliedParticipants.length > 0) {
        const cartItems = await getCartItems(cartUuid, "en");
        for (const ci of cartItems) {
          if (!ci.uuid) continue;
          const slice = suppliedParticipants.slice(0, ci.quantity);
          const ok = await setParticipants(cartUuid, ci.uuid, slice, "en");
          if (!ok) throw new Error(`setParticipants failed for item ${ci.uuid}`);
        }
      }

      const order = await confirmOrder(cartUuid, "en");
      if (!order) throw new Error("confirmOrder returned null");

      // Required step for Merchant-of-Record partners: tell Musement the
      // order is paid (we collected payment via Stripe earlier). Without
      // this, vouchers are never generated and the order stays PENDING
      // indefinitely. Sandbox accepts the call without prior auth; prod
      // requires Musement to flip the no-payment-flow flag on our partner
      // account (request via business-support@musement.com).
      if (order.orderId) {
        const paid = await markOrderPaid(order.orderId, "en");
        if (!paid) throw new Error("markOrderPaid failed");
      }

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
