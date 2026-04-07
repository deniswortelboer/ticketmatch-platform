import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
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

    const { error, data } = await supabase.auth.exchangeCodeForSession(code);
    if (!error && data.user) {
      const user = data.user;
      const fullName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.email?.split("@")[0] ||
        "";
      const email = user.email || "";

      // Check if this user already has a profile (returning user)
      const adminSupabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        { cookies: { getAll: () => [], setAll: () => {} } }
      );

      const { data: existingProfile } = await adminSupabase
        .from("profiles")
        .select("id")
        .eq("id", user.id)
        .single();

      // Only sync new users (first-time OAuth login)
      const isNewUser = !existingProfile;
      if (isNewUser) {
        // Create company + profile in Supabase
        const { data: company } = await adminSupabase
          .from("companies")
          .insert({ name: `${fullName}'s Company`, company_type: "unknown", message: JSON.stringify({ approved: false }) })
          .select("id")
          .single();

        if (company) {
          await adminSupabase.from("profiles").insert({
            id: user.id,
            company_id: company.id,
            full_name: fullName,
            email,
            role: "admin",
          });
        }

        // Sync to HubSpot (non-blocking)
        fetch(`${origin}/api/hubspot`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            companyName: `${fullName}'s Company`,
            contactName: fullName,
            email,
            phone: "",
            companyType: "Google OAuth signup",
          }),
        }).catch(() => {});

        // Notify via n8n webhook (non-blocking)
        const n8nUrl = process.env.N8N_REGISTER_WEBHOOK_URL;
        if (n8nUrl) {
          fetch(n8nUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyName: `${fullName}'s Company`,
              contactName: fullName,
              email,
              phone: "",
              companyType: "Google OAuth signup",
              message: "Signed up via Google",
              registeredAt: new Date().toISOString(),
            }),
          }).catch(() => {});
        }
      }

      // New users go to onboarding, returning users go to dashboard
      const redirectPath = isNewUser ? "/dashboard/onboarding" : next;
      return NextResponse.redirect(`${origin}${redirectPath}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_failed`);
}
