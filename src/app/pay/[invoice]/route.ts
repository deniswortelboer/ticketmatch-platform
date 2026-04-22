import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

// ═══════════════════════════════════════════════════════════════════════
// GET /pay/:invoice
//
// Short, branded redirect URL for invoice payments.
// Looks up the persisted Stripe Checkout Session URL in the `invoices`
// table and redirects to it.
//
// PDF invoices show this clean URL ("ticketmatch.ai/pay/TM-202604-834")
// instead of the long checkout.stripe.com link directly.
//
// No Stripe Search API call — that method is not available for
// Checkout Sessions in any SDK version. Session URL is persisted at
// invoice-generation time (see /api/invoices/generate).
// ═══════════════════════════════════════════════════════════════════════

const INVOICE_REGEX = /^TM-\d{6}-\d{1,4}$/;

// Service-role client: /pay/[invoice] is a public redirect with no
// authenticated user, so it bypasses RLS to look up the invoice row.
function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoice: string }> },
) {
  const { invoice } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";

  if (!invoice || !INVOICE_REGEX.test(invoice)) {
    return new NextResponse("Invalid invoice number", { status: 400 });
  }

  try {
    const admin = getAdminClient();
    const { data: row, error } = await admin
      .from("invoices")
      .select("stripe_session_url, status, expires_at")
      .eq("invoice_number", invoice)
      .maybeSingle();

    if (error) {
      console.error(`[/pay/${invoice}] DB lookup failed:`, error);
      return new NextResponse("Payment link unavailable", { status: 500 });
    }

    if (!row || !row.stripe_session_url) {
      return NextResponse.redirect(
        `${siteUrl}/pay/expired?invoice=${invoice}`,
        { status: 302 },
      );
    }

    // Guard against already-paid / cancelled / expired sessions
    const isExpired =
      row.status !== "open" ||
      (row.expires_at && new Date(row.expires_at).getTime() < Date.now());

    if (isExpired) {
      return NextResponse.redirect(
        `${siteUrl}/pay/expired?invoice=${invoice}&reason=${row.status}`,
        { status: 302 },
      );
    }

    return NextResponse.redirect(row.stripe_session_url, { status: 302 });
  } catch (err) {
    console.error(`[/pay/${invoice}] Unexpected error:`, err);
    return new NextResponse("Payment link unavailable", { status: 500 });
  }
}
