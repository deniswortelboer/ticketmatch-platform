import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { notifyAdmin } from "@/lib/notify";

// ═══════════════════════════════════════════════════════════════
// POST /api/musement/webhook
//
// Receives status updates for orders we placed via Musement Partner API.
// Per docs the payload is:
//   {
//     order_id, order_uuid, order_version,
//     order_item_uuid, order_item_status, order_item_version,
//     order_status, ... timestamps
//   }
// Possible order_item_status values:
//   OK | PENDING | KO | REFUNDED | CANCELLATION_ERROR
//
// Idempotency:
//   The musement_webhook_events table has PRIMARY KEY
//   (order_uuid, order_item_uuid, order_item_version). Replay-safe by
//   construction — duplicate INSERT collides and we return 200.
//
// Auth (interim):
//   Musement docs do not document HMAC signing yet (2026-04-28). Until
//   Mario confirms, we accept either:
//     - Basic Auth (user/pass set in MUSEMENT_WEBHOOK_USER / _PASS), or
//     - a static secret in `X-Musement-Webhook-Secret` header.
//   Without any of those env vars set we accept all (dev/sandbox).
// ═══════════════════════════════════════════════════════════════

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function authorize(request: Request): boolean {
  const expectedUser = process.env.MUSEMENT_WEBHOOK_USER;
  const expectedPass = process.env.MUSEMENT_WEBHOOK_PASS;
  const expectedSecret = process.env.MUSEMENT_WEBHOOK_SECRET;

  // No auth configured → accept (dev/sandbox)
  if (!expectedUser && !expectedSecret) return true;

  // Static secret header
  if (expectedSecret) {
    const got = request.headers.get("x-musement-webhook-secret");
    if (got === expectedSecret) return true;
  }

  // Basic Auth fallback
  if (expectedUser && expectedPass) {
    const auth = request.headers.get("authorization") || "";
    if (auth.startsWith("Basic ")) {
      const decoded = Buffer.from(auth.slice(6), "base64").toString("utf8");
      const [user, ...passParts] = decoded.split(":");
      const pass = passParts.join(":");
      if (user === expectedUser && pass === expectedPass) return true;
    }
  }

  return false;
}

type WebhookPayload = {
  order_id?: string;
  order_uuid?: string;
  order_version?: number;
  order_item_uuid?: string;
  order_item_status?: string;
  order_item_version?: number;
};

const TERMINAL_OK = new Set(["OK", "REFUNDED"]);
const TERMINAL_FAIL = new Set(["KO"]);
const TRANSIENT = new Set(["PENDING", "CANCELLATION_ERROR"]);

export async function POST(request: Request) {
  const ts = new Date().toISOString();

  if (!authorize(request)) {
    console.warn(`[${ts}] musement webhook: unauthorized`);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let payload: WebhookPayload;
  try {
    payload = (await request.json()) as WebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const orderUuid = payload.order_uuid;
  const itemUuid = payload.order_item_uuid;
  const itemVersion = payload.order_item_version;
  const status = payload.order_item_status;

  if (!orderUuid || !itemUuid || typeof itemVersion !== "number" || !status) {
    console.warn(`[${ts}] musement webhook: missing required fields`, payload);
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const admin = getAdminClient();

  // Atomic dedupe: try to insert. Conflict on PK (order_uuid, item_uuid,
  // item_version) means this version was already seen — return 200 so
  // Musement stops retrying.
  const { error: insertErr } = await admin
    .from("musement_webhook_events")
    .insert({
      order_uuid: orderUuid,
      order_item_uuid: itemUuid,
      order_item_version: itemVersion,
      order_id: payload.order_id ?? null,
      order_version: payload.order_version ?? null,
      order_item_status: status,
      raw: payload,
    });

  if (insertErr) {
    // Conflict = duplicate event = already processed. Treat as success.
    if (insertErr.code === "23505") {
      console.log(`[${ts}] musement webhook: duplicate ${itemUuid}@${itemVersion}, ignoring`);
      return NextResponse.json({ ok: true, duplicate: true });
    }
    console.error(`[${ts}] musement webhook: insert failed`, insertErr);
    return NextResponse.json({ error: "Storage failed" }, { status: 500 });
  }

  // Find the booking this order belongs to.
  const { data: booking } = await admin
    .from("bookings")
    .select("id, status, musement_status, stripe_payment_intent_id, total_price, currency, customer_email, venue_name")
    .eq("musement_order_id", orderUuid)
    .maybeSingle();

  if (!booking) {
    // Either we don't track this order yet, or it's for a different env
    // (sandbox vs production crossed wires). Mark processed and move on.
    console.warn(`[${ts}] musement webhook: no booking for order_uuid=${orderUuid}`);
    await admin
      .from("musement_webhook_events")
      .update({ processed_at: new Date().toISOString(), process_error: "no_booking" })
      .eq("order_uuid", orderUuid)
      .eq("order_item_uuid", itemUuid)
      .eq("order_item_version", itemVersion);
    return NextResponse.json({ ok: true, booking: "not_found" });
  }

  // Status routing.
  let processError: string | null = null;
  try {
    if (TERMINAL_OK.has(status)) {
      const newStatus = status === "REFUNDED" ? "refunded" : "confirmed";
      await admin
        .from("bookings")
        .update({ musement_status: newStatus })
        .eq("id", booking.id);
    } else if (TERMINAL_FAIL.has(status)) {
      // KO = supplier rejected. Mark failed + alert admin. Stripe refund is
      // handled by the cancel-route flow once an admin acts on the alert.
      await admin
        .from("bookings")
        .update({ musement_status: "failed" })
        .eq("id", booking.id);
      await notifyAdmin(
        "Musement order rejected (KO)",
        `Booking ${booking.id} (${booking.venue_name}) was rejected by Musement supplier. ` +
          `Customer paid ${booking.currency} ${booking.total_price} via Stripe ` +
          `(${booking.stripe_payment_intent_id ?? "no payment intent"}). Refund manually via /admin.`
      );
    } else if (TRANSIENT.has(status)) {
      // PENDING = still processing, just store latest. CANCELLATION_ERROR =
      // temporary Musement-side hiccup; they will retry. Alert ops if stuck.
      if (status === "CANCELLATION_ERROR") {
        await notifyAdmin(
          "Musement CANCELLATION_ERROR",
          `Booking ${booking.id} item ${itemUuid} hit CANCELLATION_ERROR. Musement retries automatically; investigate if event repeats.`
        );
      }
    } else {
      processError = `unknown_status:${status}`;
    }
  } catch (err) {
    processError = err instanceof Error ? err.message : "unknown_error";
    console.error(`[${ts}] musement webhook: processing failed`, err);
  }

  await admin
    .from("musement_webhook_events")
    .update({
      processed_at: new Date().toISOString(),
      process_error: processError,
    })
    .eq("order_uuid", orderUuid)
    .eq("order_item_uuid", itemUuid)
    .eq("order_item_version", itemVersion);

  return NextResponse.json({ ok: true, booking_id: booking.id, status });
}
