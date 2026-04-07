import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const MOLLIE_API = "https://api.mollie.com/v2";

const PLANS: Record<string, { price: string; description: string }> = {
  "pro-monthly": { price: "49.00", description: "TicketMatch Pro — Monthly" },
  "pro-annual": { price: "470.00", description: "TicketMatch Pro — Annual (save 20%)" },
  "enterprise-monthly": { price: "149.00", description: "TicketMatch Enterprise — Monthly" },
  "enterprise-annual": { price: "1430.00", description: "TicketMatch Enterprise — Annual (save 20%)" },
};

async function getAuthUser() {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
        },
      },
    }
  );
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { planId } = body;

  const plan = PLANS[planId];
  if (!plan) return NextResponse.json({ error: "Invalid plan" }, { status: 400 });

  const admin = getAdminClient();

  // Try finding profile by user ID first, then by email as fallback
  let profile = (await admin.from("profiles").select("company_id, email").eq("id", user.id).single()).data;
  if (!profile?.company_id && user.email) {
    profile = (await admin.from("profiles").select("company_id, email").eq("email", user.email).single()).data;
  }
  if (!profile?.company_id) {
    console.error("No company found for user:", user.id, user.email);
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";

    // Create Mollie payment via REST API
    const res = await fetch(`${MOLLIE_API}/payments`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MOLLIE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: { currency: "EUR", value: plan.price },
        description: plan.description,
        redirectUrl: `${siteUrl}/dashboard/pricing?success=true`,
        webhookUrl: `${siteUrl}/api/mollie/webhook`,
        metadata: JSON.stringify({
          userId: user.id,
          companyId: profile.company_id,
          planId,
          email: profile.email || user.email,
        }),
      }),
    });

    const payment = await res.json();

    if (!res.ok) {
      console.error("Mollie error:", payment);
      return NextResponse.json({ error: payment.detail || "Payment creation failed" }, { status: 500 });
    }

    // Store payment reference
    const { data: company } = await admin.from("companies").select("message").eq("id", profile.company_id).single();
    let messageData: Record<string, unknown> = {};
    try { messageData = company?.message ? JSON.parse(company.message) : {}; } catch {}

    await admin.from("companies").update({
      message: JSON.stringify({
        ...messageData,
        pending_plan: planId,
        last_payment_id: payment.id,
      }),
    }).eq("id", profile.company_id);

    return NextResponse.json({ checkoutUrl: payment._links?.checkout?.href });
  } catch (err) {
    console.error("Mollie error:", err);
    return NextResponse.json({ error: "Payment creation failed" }, { status: 500 });
  }
}
