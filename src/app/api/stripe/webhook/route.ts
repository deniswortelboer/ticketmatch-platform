import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  const ts = new Date().toISOString();
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    console.warn(`[${ts}] Stripe webhook: missing signature`);
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    console.warn(`[${ts}] Stripe webhook: invalid signature`, err);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const admin = getAdminClient();

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const metadata = session.metadata || {};

    // Route by metadata.kind — invoice payments and membership upgrades
    // both come through this event but need different fulfillment.
    if (metadata.kind === "ticket_invoice") {
      await handleTicketInvoicePaid(admin, session, metadata, ts);
      return NextResponse.json({ ok: true });
    }

    // Default = membership subscription (no kind, or kind = membership)
    if (!metadata.companyId) {
      console.warn(`[${ts}] Stripe webhook: no companyId in metadata`);
      return NextResponse.json({ ok: true });
    }

    const { data: company } = await admin
      .from("companies")
      .select("message")
      .eq("id", metadata.companyId)
      .single();

    if (!company) {
      console.warn(`[${ts}] Stripe webhook: company not found ${metadata.companyId}`);
      return NextResponse.json({ ok: true });
    }

    let messageData: Record<string, unknown> = {};
    try { messageData = company?.message ? JSON.parse(company.message) : {}; } catch {}

    const planId = metadata.planId || String(messageData.pending_plan || "");
    let planName = "free";
    if (planId.startsWith("pro")) planName = "pro";
    if (planId.startsWith("enterprise")) planName = "enterprise";

    await admin.from("companies").update({
      message: JSON.stringify({
        ...messageData,
        plan: planName,
        plan_id: planId,
        plan_activated_at: new Date().toISOString(),
        last_payment_status: "paid",
        stripe_customer_id: session.customer,
        stripe_subscription_id: session.subscription,
        pending_plan: null,
      }),
    }).eq("id", metadata.companyId);

    console.log(`[${ts}] STRIPE PAID (membership): ${planName} for ${metadata.companyId}`);
  }

  if (event.type === "customer.subscription.deleted") {
    const subscription = event.data.object as Stripe.Subscription;
    const customerId = subscription.customer as string;

    // Find company by stripe customer ID
    const { data: companies } = await admin
      .from("companies")
      .select("id, message")
      .like("message", `%${customerId}%`);

    if (companies && companies.length > 0) {
      const comp = companies[0];
      let messageData: Record<string, unknown> = {};
      try { messageData = comp.message ? JSON.parse(comp.message) : {}; } catch {}

      await admin.from("companies").update({
        message: JSON.stringify({
          ...messageData,
          plan: "free",
          plan_cancelled_at: new Date().toISOString(),
          stripe_subscription_id: null,
          pending_plan: null,
        }),
      }).eq("id", comp.id);

      console.log(`[${ts}] STRIPE CANCELLED: ${comp.id}`);
    }
  }

  return NextResponse.json({ ok: true });
}

// ═══════════════════════════════════════════════════════════════════════
// Ticket invoice paid — mark all bookings in the invoice as confirmed
// and stamp them with the Stripe session for reconciliation.
//
// Ticket delivery itself stays a deliberate action by the reseller
// (they often want to time it, e.g. send 24h before the activity).
// The Bookings UI will enable the ✈️ Send Tickets button once status
// flips to "confirmed".
// ═══════════════════════════════════════════════════════════════════════
async function handleTicketInvoicePaid(
  admin: ReturnType<typeof getAdminClient>,
  session: Stripe.Checkout.Session,
  metadata: Record<string, string>,
  ts: string,
) {
  const { invoiceNumber, groupId, companyId, bookingIds } = metadata;
  if (!invoiceNumber || !groupId || !companyId || !bookingIds) {
    console.warn(`[${ts}] ticket_invoice webhook: missing required metadata`, metadata);
    return;
  }

  const ids = bookingIds.split(",").filter(Boolean);
  if (ids.length === 0) {
    console.warn(`[${ts}] ticket_invoice webhook: empty bookingIds for ${invoiceNumber}`);
    return;
  }

  const paymentNote = `Paid via Stripe ${session.id} on ${ts} (invoice ${invoiceNumber})`;

  const { error } = await admin
    .from("bookings")
    .update({
      status: "confirmed",
      notes: paymentNote,
    })
    .in("id", ids)
    .eq("company_id", companyId);

  if (error) {
    console.error(`[${ts}] ticket_invoice webhook: failed to mark bookings paid`, error);
    return;
  }

  console.log(
    `[${ts}] STRIPE PAID (ticket_invoice ${invoiceNumber}): ${ids.length} booking(s) confirmed for company ${companyId}`,
  );
}
