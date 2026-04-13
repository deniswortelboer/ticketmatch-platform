import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

// ════════════════════════════════════════════════════════════
// SECURITY: Mollie invoice payment webhook
// - Validates payment ID format
// - Fetches payment status from Mollie API (source of truth)
// - Validates metadata fields and UUID formats
// - Audit logging
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
    const body = await request.text();
    const params = new URLSearchParams(body);
    const id = params.get("id");

    if (!id) {
      console.warn(`[${ts}] Invoice webhook: empty payment ID`);
      return NextResponse.json({ ok: true });
    }

    // Validate payment ID format
    if (!MOLLIE_ID_REGEX.test(id)) {
      console.warn(`[${ts}] Invoice webhook: invalid ID format "${id}"`);
      return NextResponse.json({ error: "Invalid payment ID" }, { status: 400 });
    }

    // Fetch payment from Mollie (source of truth)
    const res = await fetch(`${MOLLIE_API}/payments/${id}`, {
      headers: { "Authorization": `Bearer ${process.env.MOLLIE_API_KEY}` },
    });

    if (!res.ok) {
      console.warn(`[${ts}] Invoice webhook: Mollie API ${res.status} for ${id}`);
      return NextResponse.json({ error: "Payment verification failed" }, { status: 400 });
    }

    const payment = await res.json();

    let metadata: Record<string, string> = {};
    try {
      metadata = typeof payment.metadata === "string"
        ? JSON.parse(payment.metadata)
        : payment.metadata || {};
    } catch {
      console.warn(`[${ts}] Invoice webhook: invalid metadata for ${id}`);
      return NextResponse.json({ ok: true });
    }

    // Validate required metadata fields
    if (!metadata.companyId || !UUID_REGEX.test(metadata.companyId)) {
      console.warn(`[${ts}] Invoice webhook: invalid companyId for ${id}`);
      return NextResponse.json({ ok: true });
    }

    if (metadata.groupId && !UUID_REGEX.test(metadata.groupId)) {
      console.warn(`[${ts}] Invoice webhook: invalid groupId for ${id}`);
      return NextResponse.json({ ok: true });
    }

    const admin = getAdminClient();

    if (payment.status === "paid" && metadata.companyId) {
      // Mark bookings for this group as paid
      if (metadata.groupId) {
        const { count } = await admin
          .from("bookings")
          .update({ status: "confirmed" })
          .eq("group_id", metadata.groupId)
          .eq("company_id", metadata.companyId)
          .eq("status", "pending");

        console.log(
          `[${ts}] INVOICE PAID: ${metadata.invoiceNumber || "?"} by ${metadata.companyName || metadata.companyId} — ${count || 0} bookings confirmed`
        );
      }
    } else if (["failed", "canceled", "expired"].includes(payment.status)) {
      console.log(`[${ts}] INVOICE ${payment.status.toUpperCase()}: ${metadata.invoiceNumber || "?"} (${id})`);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(`[${ts}] Invoice webhook error:`, err);
    return NextResponse.json({ ok: true });
  }
}

// Block non-POST methods
export async function GET() {
  return NextResponse.json({ error: "Method not allowed" }, { status: 405 });
}
