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
    const body = await request.text();
    // Mollie sends the ID as form data
    const params = new URLSearchParams(body);
    const id = params.get("id");

    if (!id) return NextResponse.json({ ok: true });

    // Payment links use a different status check
    // When a payment is made through a payment link, Mollie sends the payment ID
    const res = await fetch(`${MOLLIE_API}/payments/${id}`, {
      headers: { "Authorization": `Bearer ${process.env.MOLLIE_API_KEY}` },
    });
    const payment = await res.json();

    let metadata: Record<string, string> = {};
    try {
      metadata = typeof payment.metadata === "string"
        ? JSON.parse(payment.metadata)
        : payment.metadata || {};
    } catch {}

    const admin = getAdminClient();

    if (payment.status === "paid" && metadata.companyId) {
      // Mark bookings for this group as paid
      if (metadata.groupId) {
        await admin
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("group_id", metadata.groupId)
          .eq("company_id", metadata.companyId)
          .eq("status", "pending");
      }

      console.log(
        `Invoice ${metadata.invoiceNumber || "?"} paid by ${metadata.companyName || metadata.companyId}`
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Invoice webhook error:", err);
    return NextResponse.json({ ok: true });
  }
}
