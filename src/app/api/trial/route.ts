import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * POST /api/trial — Activate a 14-day Pro trial
 * Sets plan to "pro" with trial flag and expiration date
 */
export async function POST() {
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
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Get profile + company
  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  // Get current company data
  const { data: company } = await admin
    .from("companies")
    .select("message")
    .eq("id", profile.company_id)
    .single();

  let msg: Record<string, unknown> = {};
  try { msg = company?.message ? JSON.parse(company.message) : {}; } catch {}

  // Check if already on a paid plan
  if (msg.plan === "pro" && !msg.trial) {
    return NextResponse.json({ error: "Already on Pro plan" }, { status: 400 });
  }
  if (msg.plan === "enterprise") {
    return NextResponse.json({ error: "Already on Enterprise plan" }, { status: 400 });
  }

  // Check if trial was already used
  if (msg.trial_used) {
    return NextResponse.json({ error: "Trial already used. Please purchase a plan." }, { status: 400 });
  }

  // Activate 14-day trial
  const trialEndsAt = new Date();
  trialEndsAt.setDate(trialEndsAt.getDate() + 14);

  await admin.from("companies").update({
    message: JSON.stringify({
      ...msg,
      plan: "pro",
      trial: true,
      trial_used: true,
      trial_started_at: new Date().toISOString(),
      trial_ends_at: trialEndsAt.toISOString(),
    }),
  }).eq("id", profile.company_id);

  return NextResponse.json({
    success: true,
    plan: "pro",
    trial: true,
    trialEndsAt: trialEndsAt.toISOString(),
  });
}
