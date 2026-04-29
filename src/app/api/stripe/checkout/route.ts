import Stripe from "stripe";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

// Lazy-init for Vercel build safety.
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY!);
}

export const dynamic = "force-dynamic";

const PLANS: Record<string, { priceAmount: number; name: string; interval?: "month" | "year" }> = {
  "pro-monthly": { priceAmount: 4900, name: "TicketMatch Growth — Monthly", interval: "month" },
  "pro-annual": { priceAmount: 47000, name: "TicketMatch Growth — Annual (save 20%)", interval: "year" },
  "enterprise-monthly": { priceAmount: 14900, name: "TicketMatch Enterprise — Monthly", interval: "month" },
  "enterprise-annual": { priceAmount: 143000, name: "TicketMatch Enterprise — Annual (save 20%)", interval: "year" },
};

export async function POST(request: Request) {
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
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { planId } = body;

  const plan = PLANS[planId];
  if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("company_id, email")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: profile.email || user.email || undefined,
      line_items: [
        {
          price_data: {
            currency: "eur",
            product_data: {
              name: plan.name,
              description: "Full access to TicketMatch platform features",
            },
            unit_amount: plan.priceAmount,
            recurring: { interval: plan.interval || "month" },
          },
          quantity: 1,
        },
      ],
      metadata: {
        userId: user.id,
        companyId: profile.company_id,
        planId,
      },
      success_url: `${siteUrl}/dashboard/pricing?success=true`,
      cancel_url: `${siteUrl}/dashboard/pricing`,
      allow_promotion_codes: true,
      billing_address_collection: "auto",
      tax_id_collection: { enabled: true },
    });

    // Store pending plan
    const { data: company } = await admin.from("companies").select("message").eq("id", profile.company_id).single();
    let messageData: Record<string, unknown> = {};
    try { messageData = company?.message ? JSON.parse(company.message) : {}; } catch {}

    await admin.from("companies").update({
      message: JSON.stringify({
        ...messageData,
        pending_plan: planId,
        last_stripe_session: session.id,
      }),
    }).eq("id", profile.company_id);

    return NextResponse.json({ url: session.url });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Stripe checkout error:", message, err);
    return NextResponse.json({ error: `Failed to create checkout: ${message}` }, { status: 500 });
  }
}
