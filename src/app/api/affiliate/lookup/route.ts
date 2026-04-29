import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Build on Vercel evaluates this module during page-data collection, when
// env vars are not always populated. Lazy-init the client inside the handler
// so missing env vars only surface at request time (and never break the build).
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

// Force dynamic rendering — this route always reads query params, never
// pre-rendered. Belt-and-suspenders against future page-data attempts.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const supabaseAdmin = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");

  if (!code || code.length < 8) {
    return NextResponse.json({ error: "Missing or invalid code" }, { status: 400 });
  }

  // The referral code is the first 8 hex chars of the user UUID (uppercased, hyphens stripped).
  // UUID format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  // So the first 8 chars of the UUID (before the first hyphen) match the code.
  const uuidPrefix = code.toLowerCase();

  // Find the profile whose ID starts with this prefix
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("id, company_id, full_name, companies(id, name)")
    .like("id", `${uuidPrefix}%`)
    .limit(1);

  if (!profiles || profiles.length === 0) {
    return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
  }

  const profile = profiles[0];
  const company = Array.isArray(profile.companies)
    ? profile.companies[0]
    : profile.companies;

  if (!company) {
    return NextResponse.json({ error: "Referral code not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: company.id,
    name: company.name,
    referrerName: profile.full_name,
  });
}
