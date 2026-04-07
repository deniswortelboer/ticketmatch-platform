import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { companyId, userId, companyName, companyType, phone, kvkNumber, vatNumber, fullName, email, role } = body;

  if (!companyId || !userId) {
    return NextResponse.json({ error: "Missing IDs" }, { status: 400 });
  }

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
  if (!user || user.id !== userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  await adminSupabase.from("companies").update({
    name: companyName,
    company_type: companyType,
    phone: phone || null,
    kvk_number: kvkNumber || null,
    vat_number: vatNumber || null,
  }).eq("id", companyId);

  await adminSupabase.from("profiles").update({
    full_name: fullName,
    email,
    role: role || "admin",
  }).eq("id", userId);

  return NextResponse.json({ success: true });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const { companyId, name: companyName, phone, kvk_number, vat_number, country, city, address, website } = body;

  if (!companyId) {
    return NextResponse.json({ error: "Missing company ID" }, { status: 400 });
  }

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminSupabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  // Verify user belongs to this company
  const { data: profile } = await adminSupabase.from("profiles").select("company_id").eq("id", user.id).single();
  if (profile?.company_id !== companyId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get existing message data to preserve other fields
  const { data: existing } = await adminSupabase.from("companies").select("message").eq("id", companyId).single();
  let messageData: Record<string, unknown> = {};
  try { messageData = existing?.message ? JSON.parse(existing.message) : {}; } catch {}

  // Update company fields
  await adminSupabase.from("companies").update({
    name: companyName || undefined,
    phone: phone || null,
    kvk_number: kvk_number || null,
    vat_number: vat_number || null,
    message: JSON.stringify({
      ...messageData,
      country: country || messageData.country,
      city: city || messageData.city,
      address: address || messageData.address,
      website: website || messageData.website,
    }),
  }).eq("id", companyId);

  return NextResponse.json({ success: true });
}
