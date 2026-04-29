import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// ═══════════════════════════════════════════════════════════════════════
// POST /api/company/whitelabel
//
// Persists the reseller's white-label preferences to the companies row
// so they actually take effect on customer-facing tickets, vouchers, and
// emails. Until this route shipped, the Settings → White Label tab only
// wrote to localStorage — the toggles looked saved but never reached the
// delivery code (which reads `companies.branding_mode` + `primary_color`).
//
// Body (all optional — only provided fields are updated):
//   { primaryColor, secondaryColor, showPoweredBy }
//
// branding_mode mapping (see src/lib/pdf-tickets.ts + send-tickets route):
//   showPoweredBy === true   → "co_branded"        (partner + small TM line)
//   showPoweredBy === false  → "white_label_light" (partner ONLY, premium)
//   `full_managed` is reserved for admin override (TicketMatch-only branding)
//   and is never set from this user-facing endpoint.
// ═══════════════════════════════════════════════════════════════════════

const HEX_RE = /^#?[0-9a-fA-F]{6}$/;
const normaliseHex = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  if (!HEX_RE.test(trimmed)) return null;
  return trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
};

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll() {},
      },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } },
  );

  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  let body: Record<string, unknown> = {};
  try { body = await request.json(); } catch {}

  const updates: Record<string, unknown> = {};

  // Map showPoweredBy → branding_mode. Allow explicit override via brandingMode
  // for admin tooling but block "full_managed" from the user endpoint.
  const explicitMode = typeof body.brandingMode === "string" ? body.brandingMode : null;
  if (explicitMode === "co_branded" || explicitMode === "white_label_light") {
    updates.branding_mode = explicitMode;
  } else if (typeof body.showPoweredBy === "boolean") {
    updates.branding_mode = body.showPoweredBy ? "co_branded" : "white_label_light";
  }

  const primary = normaliseHex(body.primaryColor);
  if (primary) updates.primary_color = primary;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  // Tier gate: white_label_light is a premium feature. Free-plan companies
  // cannot select it — silently fall back to co_branded so we never silently
  // strip TicketMatch attribution for non-paying customers.
  if (updates.branding_mode === "white_label_light") {
    const { data: company } = await admin
      .from("companies")
      .select("message")
      .eq("id", profile.company_id)
      .single();
    let messageData: Record<string, unknown> = {};
    if (company?.message) {
      try {
        messageData = typeof company.message === "string"
          ? JSON.parse(company.message)
          : (company.message as Record<string, unknown>);
      } catch {}
    }
    const plan = (messageData.plan as string) || "free";
    if (plan === "free") {
      updates.branding_mode = "co_branded";
    }
  }

  const { error } = await admin
    .from("companies")
    .update(updates)
    .eq("id", profile.company_id);

  if (error) {
    console.error("[/api/company/whitelabel] update failed:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }

  return NextResponse.json({ ok: true, applied: updates });
}
