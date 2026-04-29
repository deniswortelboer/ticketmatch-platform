import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Lazy-init for Vercel build safety.
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════
// GET /api/stripe/billing-summary
//
// Returns the subscription status + recent invoices for the authenticated
// user's company. Used by the Plan & Billing settings tab to render:
//   - status badge (active / past_due / canceled / trialing / unpaid)
//   - next billing date + amount
//   - invoices table (date, amount, status, hosted/pdf URLs)
//
// Returns 200 with empty placeholder data when no Stripe customer exists
// (free-tier users), so the UI doesn't have to special-case that.
// ═══════════════════════════════════════════════════════════════════════

type InvoiceRow = {
  id: string;
  number: string | null;
  date: number; // unix seconds
  amount: number; // major units (EUR)
  currency: string;
  status: string | null;
  hostedUrl: string | null;
  pdfUrl: string | null;
};

type SubscriptionSummary = {
  hasSubscription: boolean;
  status: string | null;
  productName: string | null;
  amount: number | null; // major units
  currency: string | null;
  interval: string | null; // month | year
  currentPeriodEnd: number | null; // unix seconds
  cancelAtPeriodEnd: boolean;
};

export async function GET() {
  const stripe = getStripe();
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return emptyResponse();
  }

  const { data: company } = await admin
    .from("companies")
    .select("message")
    .eq("id", profile.company_id)
    .single();

  let messageData: Record<string, unknown> = {};
  if (company?.message) {
    try {
      messageData = typeof company.message === "string"
        ? JSON.parse(company.message)
        : (company.message as Record<string, unknown>);
    } catch {
      messageData = {};
    }
  }

  const stripeCustomerId = messageData.stripe_customer_id as string | undefined;
  if (!stripeCustomerId) {
    return emptyResponse();
  }

  // ── Subscription (most recent active/past — Stripe sorts newest first) ──
  let subscription: SubscriptionSummary = {
    hasSubscription: false,
    status: null,
    productName: null,
    amount: null,
    currency: null,
    interval: null,
    currentPeriodEnd: null,
    cancelAtPeriodEnd: false,
  };

  try {
    const subs = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: "all",
      limit: 1,
      expand: ["data.items.data.price.product"],
    });
    const sub = subs.data[0];
    if (sub) {
      const item = sub.items.data[0];
      const price = item?.price;
      const product = price?.product as Stripe.Product | undefined;
      subscription = {
        hasSubscription: true,
        status: sub.status,
        productName: product?.name || null,
        amount: price?.unit_amount != null ? price.unit_amount / 100 : null,
        currency: price?.currency?.toUpperCase() || null,
        interval: price?.recurring?.interval || null,
        currentPeriodEnd:
          (sub as unknown as { current_period_end?: number }).current_period_end ?? null,
        cancelAtPeriodEnd: sub.cancel_at_period_end || false,
      };
    }
  } catch (err) {
    console.warn("[/api/stripe/billing-summary] subscription fetch failed:", err);
  }

  // ── Recent invoices (last 12) ──
  let invoices: InvoiceRow[] = [];
  try {
    const list = await stripe.invoices.list({
      customer: stripeCustomerId,
      limit: 12,
    });
    invoices = list.data.map((inv) => ({
      id: inv.id || "",
      number: inv.number,
      date: inv.created,
      amount: (inv.amount_paid ?? inv.amount_due ?? 0) / 100,
      currency: inv.currency.toUpperCase(),
      status: inv.status,
      hostedUrl: inv.hosted_invoice_url ?? null,
      pdfUrl: inv.invoice_pdf ?? null,
    }));
  } catch (err) {
    console.warn("[/api/stripe/billing-summary] invoices fetch failed:", err);
  }

  return NextResponse.json({ subscription, invoices });
}

function emptyResponse() {
  return NextResponse.json({
    subscription: {
      hasSubscription: false,
      status: null,
      productName: null,
      amount: null,
      currency: null,
      interval: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    } satisfies SubscriptionSummary,
    invoices: [] as InvoiceRow[],
  });
}
