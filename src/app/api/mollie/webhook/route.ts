import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// ════════════════════════════════════════════════════════════
// SECURITY: Mollie subscription webhook
// - Validates payment ID format (tr_XXXXXXXXXX)
// - Fetches payment status from Mollie API (source of truth)
// - Validates metadata fields and companyId UUID format
// - Verifies company exists before updating
// - Audit logging for all webhook calls
// ════════════════════════════════════════════════════════════

const MOLLIE_API = "https://api.mollie.com/v2";

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MOLLIE_ID_REGEX = /^tr_[a-zA-Z0-9]+$/;

export async function POST(request: Request) {
  const ts = new Date().toISOString();

  try {
    const body = await request.formData();
    const paymentId = body.get("id") as string;

    if (!paymentId) {
      console.warn(`[${ts}] Mollie webhook: empty payment ID`);
      return NextResponse.json({ ok: true });
    }

    // Validate payment ID format
    if (!MOLLIE_ID_REGEX.test(paymentId)) {
      console.warn(`[${ts}] Mollie webhook: invalid ID format "${paymentId}"`);
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
    }

    // Fetch payment from Mollie (source of truth — never trust webhook body alone)
    const res = await fetch(`${MOLLIE_API}/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${process.env.MOLLIE_API_KEY}` },
    });

    if (!res.ok) {
      console.warn(`[${ts}] Mollie webhook: Mollie API ${res.status} for ${paymentId}`);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const payment = await res.json();

    let metadata: Record<string, string> = {};
    try {
      metadata = typeof payment.metadata === "string"
        ? JSON.parse(payment.metadata)
        : payment.metadata || {};
    } catch {
      console.warn(`[${ts}] Mollie webhook: invalid metadata for ${paymentId}`);
      return NextResponse.json({ ok: true });
    }

    if (!metadata.companyId) return NextResponse.json({ ok: true });

    // Validate companyId format
    if (!UUID_REGEX.test(metadata.companyId)) {
      console.warn(`[${ts}] Mollie webhook: invalid companyId "${metadata.companyId}"`);
      return NextResponse.json({ error: "Invalid company" }, { status: 400 });
    }

    const admin = getAdminClient();

    // Verify company exists
    const { data: company } = await admin
      .from("companies")
      .select("message")
      .eq("id", metadata.companyId)
      .single();

    if (!company) {
      console.warn(`[${ts}] Mollie webhook: company not found ${metadata.companyId}`);
      return NextResponse.json({ ok: true });
    }

    let messageData: Record<string, unknown> = {};
    try { messageData = company?.message ? JSON.parse(company.message) : {}; } catch {}

    if (payment.status === "paid") {
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
          last_payment_id: paymentId,
          pending_plan: null,
        }),
      }).eq("id", metadata.companyId);

      console.log(`[${ts}] PAID: ${planName} for ${metadata.companyId} (${paymentId})`);
    } else if (["failed", "canceled", "expired"].includes(payment.status)) {
      await admin.from("companies").update({
        message: JSON.stringify({
          ...messageData,
          last_payment_status: payment.status,
          last_payment_id: paymentId,
          pending_plan: null,
        }),
      }).eq("id", metadata.companyId);

      console.log(`[${ts}] ${payment.status.toUpperCase()}: ${metadata.companyId} (${paymentId})`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[${ts}] Webhook error:`, err);
    return NextResponse.json({ ok: true });
  }
}

// Block non-POST methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
