import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const {
    companyId,
    userId,
    companyName,
    companyType,
    phone,
    kvkNumber,
    vatNumber,
    groupVolume,
    interestedCities,
    fullName,
    email,
    role,
  } = body;

  if (!companyId || !userId) {
    return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
  }

  // Verify the user is authenticated
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Ignore
          }
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Use service role for updates
  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Update company
  const { error: companyError } = await adminSupabase
    .from("companies")
    .update({
      name: companyName,
      company_type: companyType,
      phone: phone || null,
      kvk_number: kvkNumber || null,
      vat_number: vatNumber || null,
      status: "approved",
      message: JSON.stringify({
        group_volume: groupVolume,
        interested_cities: interestedCities,
        onboarding_completed: true,
        onboarding_date: new Date().toISOString(),
      }),
    })
    .eq("id", companyId);

  if (companyError) {
    return NextResponse.json(
      { error: "Failed to update company", details: companyError.message },
      { status: 500 }
    );
  }

  // Update profile
  const { error: profileError } = await adminSupabase
    .from("profiles")
    .update({
      full_name: fullName,
      email,
      role: role || "admin",
    })
    .eq("id", userId);

  if (profileError) {
    return NextResponse.json(
      { error: "Failed to update profile", details: profileError.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true });
}
