import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const { userId, companyName, companyType, phone, message, contactName, email } =
      await request.json();

    // 1. Create company record (bypasses RLS with service role)
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: companyName,
        company_type: companyType,
        phone,
        message,
      })
      .select()
      .single();

    if (companyError) {
      return NextResponse.json({ error: companyError.message }, { status: 500 });
    }

    // 2. Create profile linked to user and company
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .insert({
        id: userId,
        company_id: company.id,
        full_name: contactName,
        email,
        role: "owner",
      });

    if (profileError) {
      return NextResponse.json({ error: profileError.message }, { status: 500 });
    }

    // 3. Sync to HubSpot (non-blocking)
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
    fetch(`${origin}/api/hubspot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyName,
        contactName,
        email,
        phone,
        companyType,
        message,
      }),
    }).catch(() => {});

    // 4. Notify via n8n webhook (non-blocking)
    const webhookUrl = process.env.N8N_REGISTER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName,
          email,
          phone,
          companyType,
          message,
          registeredAt: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    return NextResponse.json({ success: true, companyId: company.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
