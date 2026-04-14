import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/me — Returns the current user's profile + company data
 * Uses service role key to bypass RLS restrictions
 */
export async function GET() {
  const cookieStore = await cookies();

  // First get the authenticated user via their session cookie
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

  const { data: { user: authUser } } = await supabase.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Use service role to bypass RLS and fetch profile + company
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: { getAll: () => [], setAll: () => {} },
    }
  );

  const { data: profile } = await adminSupabase
    .from("profiles")
    .select("full_name, company_id, companies(name, message)")
    .eq("id", authUser.id)
    .single();

  const name = profile?.full_name || authUser.user_metadata?.full_name || authUser.user_metadata?.name || authUser.email?.split("@")[0] || "";
  const companies = profile?.companies as unknown as { name: string; message: string } | { name: string; message: string }[] | null;
  const comp = Array.isArray(companies) ? companies[0] : companies;
  const company = comp?.name || authUser.user_metadata?.company_name || "";

  let isSupplier = false;
  let isReseller = false;
  let isDeveloper = false;
  let isApproved = true;
  let plan = "free";
  let resellerSlug = "";

  try {
    const msg = comp?.message ? JSON.parse(comp.message) : {};
    isSupplier = msg.role === "supplier";
    isReseller = msg.role === "reseller";
    isDeveloper = msg.role === "developer";
    if (msg.approved === false) isApproved = false;
    if (msg.plan) plan = msg.plan;
    if (msg.reseller_slug) resellerSlug = msg.reseller_slug;

    // Auto-expire trial if past end date
    if (msg.trial && msg.trial_ends_at && new Date(msg.trial_ends_at) < new Date()) {
      plan = "free";
      // Update in background (don't block the response)
      adminSupabase.from("companies").update({
        message: JSON.stringify({ ...msg, plan: "free", trial: false, trial_expired: true }),
      }).eq("id", profile?.company_id).then(() => {});
    }
  } catch {}

  const parts = name.split(" ").filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : name.substring(0, 2).toUpperCase();

  return NextResponse.json({
    name,
    company,
    initials,
    email: authUser.email || "",
    isSupplier,
    isReseller,
    isDeveloper,
    isApproved,
    plan,
    resellerSlug,
  });
}
