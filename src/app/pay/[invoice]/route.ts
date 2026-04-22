import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

// ═══════════════════════════════════════════════════════════════════════
// GET /pay/:invoice
//
// Short, branded redirect URL for invoice payments.
// Looks up the most-recent Stripe Checkout Session with metadata.invoiceNumber
// matching the URL param and redirects to it.
//
// PDF invoices show this clean URL ("ticketmatch.ai/pay/TM-202604-834")
// instead of the long checkout.stripe.com link directly.
// ═══════════════════════════════════════════════════════════════════════

const INVOICE_REGEX = /^TM-\d{6}-\d{1,4}$/;

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ invoice: string }> },
) {
  const { invoice } = await params;

  if (!invoice || !INVOICE_REGEX.test(invoice)) {
    return new NextResponse("Invalid invoice number", { status: 400 });
  }

  try {
    // Stripe Search API supports filtering by metadata
    const result = await stripe.checkout.sessions.search({
      query: `metadata['invoiceNumber']:'${invoice}' AND status:'open'`,
      limit: 1,
    });

    const session = result.data[0];
    if (!session?.url) {
      // Either expired (24h default), already paid, or never created
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
      return NextResponse.redirect(
        `${siteUrl}/pay/expired?invoice=${invoice}`,
        { status: 302 },
      );
    }

    return NextResponse.redirect(session.url, { status: 302 });
  } catch (err) {
    console.error(`[/pay/${invoice}] Failed to find Stripe session:`, err);
    return new NextResponse("Payment link unavailable", { status: 500 });
  }
}
