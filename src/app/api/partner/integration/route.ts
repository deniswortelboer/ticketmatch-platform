import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

export async function POST(request: Request) {
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

  const body = await request.json();
  const { companyId, integration } = body;

  if (!companyId) return NextResponse.json({ error: "Missing company ID" }, { status: 400 });

  const admin = getAdminClient();

  // Verify user belongs to this company
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (profile?.company_id !== companyId) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  // Get existing message data
  const { data: company } = await admin.from("companies").select("message").eq("id", companyId).single();
  let messageData: Record<string, unknown> = {};
  try { messageData = company?.message ? JSON.parse(company.message) : {}; } catch {}

  // Save integration data into message
  await admin.from("companies").update({
    message: JSON.stringify({
      ...messageData,
      integration,
      integration_updated_at: new Date().toISOString(),
    }),
  }).eq("id", companyId);

  return NextResponse.json({ success: true });
}
