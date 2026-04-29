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
// POST /api/stripe/portal
//
// Creates a Stripe Billing Portal session for the authenticated user's
// company and returns its URL. The portal lets the user update their
// payment method, view/download invoices, and cancel their subscription
// — all handled by Stripe, no custom UI needed.
//
// Requires stripe_customer_id in companies.message JSON (written by the
// subscription webhook on first paid checkout).
// ═══════════════════════════════════════════════════════════════════════

export async function POST() {
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
    return NextResponse.json({ error: "No company found" }, { status: 400 });
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
    return NextResponse.json(
      { error: "No Stripe customer found. Subscribe to a paid plan first." },
      { status: 400 },
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";

  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${siteUrl}/dashboard/settings?tab=billing`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("[/api/stripe/portal] Failed to create portal session:", err);
    return NextResponse.json(
      { error: "Failed to create billing portal session" },
      { status: 500 },
    );
  }
}
