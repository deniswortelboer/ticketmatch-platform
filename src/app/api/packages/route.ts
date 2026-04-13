import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

// GET: fetch packages for current user's company
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ packages: [] });

  const { data: packages } = await admin
    .from("packages")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ packages: packages || [] });
}

// POST: create or update a package
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, name, description, city, items, total_price, discount_pct, status } = body;

  if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company" }, { status: 400 });

  const packageData = {
    company_id: profile.company_id,
    name,
    description: description || null,
    city: city || "Amsterdam",
    items: items || [],
    total_price: total_price || 0,
    discount_pct: discount_pct || 0,
    status: status || "draft",
  };

  if (id) {
    // Update existing package
    const { data: pkg, error } = await admin
      .from("packages")
      .update(packageData)
      .eq("id", id)
      .eq("company_id", profile.company_id)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ package: pkg });
  } else {
    // Create new package
    const { data: pkg, error } = await admin
      .from("packages")
      .insert(packageData)
      .select()
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ package: pkg });
  }
}

// DELETE: remove a package
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const packageId = searchParams.get("id");
  if (!packageId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();

  await admin.from("packages").delete().eq("id", packageId).eq("company_id", profile?.company_id || "");
  return NextResponse.json({ success: true });
}
