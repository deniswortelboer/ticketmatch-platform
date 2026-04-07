import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const MOLLIE_API = "https://api.mollie.com/v2";

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.formData();
    const paymentId = body.get("id") as string;

    if (!paymentId) return NextResponse.json({ ok: true });

    // Fetch payment from Mollie
    const res = await fetch(`${MOLLIE_API}/payments/${paymentId}`, {
      headers: { "Authorization": `Bearer ${process.env.MOLLIE_API_KEY}` },
    });
    const payment = await res.json();

    let metadata: Record<string, string> = {};
    try { metadata = typeof payment.metadata === "string" ? JSON.parse(payment.metadata) : payment.metadata || {}; } catch {}

    if (!metadata.companyId) return NextResponse.json({ ok: true });

    const admin = getAdminClient();

    // Get existing data
    const { data: company } = await admin.from("companies").select("message").eq("id", metadata.companyId).single();
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

      console.log(`Plan activated: ${planName} for company ${metadata.companyId}`);
    } else if (["failed", "canceled", "expired"].includes(payment.status)) {
      await admin.from("companies").update({
        message: JSON.stringify({
          ...messageData,
          last_payment_status: payment.status,
          last_payment_id: paymentId,
          pending_plan: null,
        }),
      }).eq("id", metadata.companyId);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
