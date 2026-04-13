import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// ═══════════════��═══════════════════════════════════��═══════
// SECURITY: This endpoint is locked behind admin authentication
// AND an environment variable kill-switch.
// Set ALLOW_TEST_ACCOUNTS=true in .env.local to enable.
// ════════════════════════════��══════════════════════════════

const ADMIN_EMAILS = ["wortelboerdenis@gmail.com", "patekrolexvc@gmail.com"];

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const TEST_PASSWORD = "TestTM2026!";

const TEST_ACCOUNTS = [
  {
    email: "test-operator@ticketmatch.ai",
    name: "Test Operator",
    company: "Test Tour Agency",
    companyType: "tour_operator",
    role: "operator",
    redirect: "/dashboard",
    extra: {},
  },
  {
    email: "test-reseller@ticketmatch.ai",
    name: "Test Reseller",
    company: "Test Reseller BV",
    companyType: "reseller",
    role: "reseller",
    redirect: "/dashboard/reseller",
    extra: { reseller_slug: "test-reseller-bv", commission_rate: 10 },
  },
  {
    email: "test-developer@ticketmatch.ai",
    name: "Test Developer",
    company: "Test Dev Studio",
    companyType: "developer",
    role: "developer",
    redirect: "/dashboard/partner/docs",
    extra: {},
  },
];

async function verifyAdmin(): Promise<boolean> {
  // Kill-switch: must be explicitly enabled
  if (process.env.ALLOW_TEST_ACCOUNTS !== "true") {
    return false;
  }

  try {
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
    if (!user?.email || !ADMIN_EMAILS.includes(user.email)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

export async function POST(request: Request) {
  // ── Security gate ──
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return NextResponse.json(
      { error: "Forbidden — admin authentication required and ALLOW_TEST_ACCOUNTS must be enabled" },
      { status: 403 }
    );
  }

  const { action, accountType } = await request.json();

  if (action === "setup") {
    const results = [];
    for (const account of TEST_ACCOUNTS) {
      const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
      const existing = existingUsers?.users?.find((u) => u.email === account.email);

      let userId: string;

      if (existing) {
        userId = existing.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: TEST_PASSWORD,
          email_confirm: true,
        });
        const { data: profile } = await supabaseAdmin
          .from("profiles")
          .select("company_id")
          .eq("id", userId)
          .single();
        if (profile?.company_id) {
          await supabaseAdmin
            .from("companies")
            .update({
              message: JSON.stringify({
                role: account.role,
                approved: true,
                test_account: true,
                ...account.extra,
              }),
            })
            .eq("id", profile.company_id);
        }
      } else {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: account.email,
          password: TEST_PASSWORD,
          email_confirm: true,
        });
        if (error) {
          results.push({ email: account.email, error: error.message });
          continue;
        }
        userId = data.user.id;

        const { data: company } = await supabaseAdmin
          .from("companies")
          .insert({
            name: account.company,
            company_type: account.companyType,
            message: JSON.stringify({
              role: account.role,
              approved: true,
              test_account: true,
              ...account.extra,
            }),
          })
          .select()
          .single();

        if (company) {
          await supabaseAdmin.from("profiles").insert({
            id: userId,
            company_id: company.id,
            full_name: account.name,
            email: account.email,
            role: "owner",
          });
        }
      }

      results.push({ email: account.email, status: "ready" });
    }

    return NextResponse.json({ results, password: TEST_PASSWORD });
  }

  if (action === "login") {
    const account = TEST_ACCOUNTS.find((a) => a.companyType === accountType);
    if (!account) {
      return NextResponse.json({ error: "Unknown account type" }, { status: 400 });
    }
    return NextResponse.json({
      email: account.email,
      password: TEST_PASSWORD,
      redirect: account.redirect,
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
