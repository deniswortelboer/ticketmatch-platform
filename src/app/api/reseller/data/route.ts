import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

/**
 * GET /api/reseller/data — Returns reseller dashboard data
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

  // Get reseller's own company info
  const { data: profile } = await admin
    .from("profiles")
    .select("company_id, companies(id, name, message)")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "No profile" }, { status: 404 });
  }

  const companies = profile.companies as unknown as { id: string; name: string; message: string } | { id: string; name: string; message: string }[] | null;
  const comp = Array.isArray(companies) ? companies[0] : companies;
  if (!comp) {
    return NextResponse.json({ error: "No company" }, { status: 404 });
  }

  let msg: Record<string, unknown> = {};
  try { msg = comp.message ? JSON.parse(comp.message) : {}; } catch {}

  let slug = (msg.reseller_slug as string) || "";
  const rate = (msg.commission_rate as number) || 10;

  // Auto-generate slug if missing
  if (!slug && comp.name) {
    slug = comp.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .substring(0, 30);
    const updatedMsg = { ...msg, reseller_slug: slug, role: msg.role || "reseller", commission_rate: rate };
    await admin
      .from("companies")
      .update({ message: JSON.stringify(updatedMsg) })
      .eq("id", comp.id);
    msg = updatedMsg;
  }

  // Find all companies referred by this reseller
  const { data: allCompanies } = await admin
    .from("companies")
    .select("id, name, company_type, status, message, created_at");

  const referredCompanies = (allCompanies || []).filter((c) => {
    if (c.id === comp.id) return false;
    try {
      const m = c.message ? JSON.parse(c.message) : {};
      return m.referred_by === comp.id || m.reseller_slug === slug;
    } catch { return false; }
  });

  // Get bookings for referred companies
  const companyIds = referredCompanies.map((c) => c.id);
  let bookings: { company_id: string; total_price: number; status: string }[] = [];
  if (companyIds.length > 0) {
    const { data: bks } = await admin
      .from("bookings")
      .select("company_id, total_price, status")
      .in("company_id", companyIds);
    bookings = bks || [];
  }

  // Build agency list
  const agencies = referredCompanies.map((c) => {
    const compBookings = bookings.filter((b) => b.company_id === c.id);
    const rev = compBookings.reduce((sum, b) => sum + Number(b.total_price), 0);
    return {
      id: c.id,
      name: c.name,
      company_type: c.company_type,
      status: c.status,
      created_at: c.created_at,
      bookingCount: compBookings.length,
      totalRevenue: rev,
    };
  });

  const totalBookings = bookings.length;
  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const totalCommission = totalRevenue * (rate / 100);

  return NextResponse.json({
    userEmail: user.email || "",
    userId: user.id,
    companyId: comp.id,
    companyName: comp.name || "",
    companyMessage: msg,
    resellerSlug: slug,
    commissionRate: rate,
    agencies,
    totalBookings,
    totalRevenue,
    totalCommission,
  });
}

/**
 * PATCH /api/reseller/data — Update company message (e.g. reseller slug)
 */
export async function PATCH(request: Request) {
  const body = await request.json();
  const { companyId, message } = body;

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

  // Verify user belongs to this company
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (profile?.company_id !== companyId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await admin
    .from("companies")
    .update({ message: JSON.stringify(message) })
    .eq("id", companyId);

  return NextResponse.json({ success: true });
}
