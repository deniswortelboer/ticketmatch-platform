import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/knowledge — Returns knowledge base entries + user plan
 * Uses service role key to bypass RLS restrictions
 */
export async function GET() {
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

  // Get user plan
  const { data: profile } = await admin
    .from("profiles")
    .select("company_id, companies(message)")
    .eq("id", user.id)
    .single();

  let plan = "free";
  try {
    const companies = profile?.companies as unknown as { message: string } | { message: string }[] | null;
    const comp = Array.isArray(companies) ? companies[0] : companies;
    const msg = comp?.message ? JSON.parse(comp.message) : {};
    if (msg.plan) plan = msg.plan;
  } catch {}

  // Fetch all active knowledge entries
  const { data: entries } = await admin
    .from("knowledge_base")
    .select("id, title, content, category, tier")
    .eq("active", true)
    .order("category")
    .order("tier");

  return NextResponse.json({
    plan,
    entries: entries || [],
  });
}
