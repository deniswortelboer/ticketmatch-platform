import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "wortelboerdenis@gmail.com,patekrolexvc@gmail.com,denis.wortelboer@w69.nl")
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

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

/**
 * GET /api/admin/activity — Returns all Supabase auth users with login timestamps
 */
export async function GET() {
  const user = await getAuthUser();
  if (!user || !ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const adminClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );

  const { data, error } = await adminClient.auth.admin.listUsers();
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also fetch profiles to get company info
  const { data: profiles } = await adminClient
    .from("profiles")
    .select("id, full_name, company_id, companies(name, message)")
    .order("created_at", { ascending: false });

  const profileMap = new Map<string, { name: string; company: string; companyMessage: string | null }>();
  for (const p of profiles || []) {
    const companies = p.companies as unknown as { name: string; message: string | null } | { name: string; message: string | null }[] | null;
    const comp = Array.isArray(companies) ? companies[0] : companies;
    profileMap.set(p.id, {
      name: p.full_name || "",
      company: comp?.name || "",
      companyMessage: comp?.message || null,
    });
  }

  const users = data.users.map((u) => {
    const profile = profileMap.get(u.id);
    let isBlocked = false;
    try {
      const msg = profile?.companyMessage ? JSON.parse(profile.companyMessage) : {};
      isBlocked = msg.blocked === true;
    } catch {}

    return {
      email: u.email || "",
      name: profile?.name || u.user_metadata?.full_name || u.user_metadata?.name || "",
      company: profile?.company || "",
      lastSignIn: u.last_sign_in_at || null,
      createdAt: u.created_at,
      provider: u.app_metadata?.provider || "email",
      banned: !!u.banned_until,
      blocked: isBlocked,
    };
  }).sort((a, b) => new Date(b.lastSignIn || 0).getTime() - new Date(a.lastSignIn || 0).getTime());

  return NextResponse.json({ users });
}
