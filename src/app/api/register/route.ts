import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendAdminNewRegistrationEmail } from "@/lib/email";
import { notifyAdmin } from "@/lib/notify";

// ════════════════════════════════════════════════════════════
// SECURITY: Registration endpoint with input validation
// - Validates all required fields
// - Whitelist on companyType
// - Length limits on strings
// - UUID format check on userId
// ════════════════════════════════════════════════════════════

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ALLOWED_COMPANY_TYPES = ["tour_operator", "tour-operator", "dmc", "travel_agency", "travel-agency", "reseller", "corporate", "developer", "other"];

function sanitize(str: string | undefined | null, maxLength = 255): string {
  if (!str || typeof str !== "string") return "";
  return str.trim().slice(0, maxLength);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const userId = sanitize(body.userId, 36);
    const companyName = sanitize(body.companyName, 200);
    const companyType = sanitize(body.companyType, 50);
    const phone = sanitize(body.phone, 30);
    const contactName = sanitize(body.contactName, 150);
    const email = sanitize(body.email, 255);
    const message = body.message;

    // ── Required field validation ──
    if (!userId || !UUID_REGEX.test(userId)) {
      return NextResponse.json({ error: "Invalid user ID" }, { status: 400 });
    }
    if (!companyName || companyName.length < 2) {
      return NextResponse.json({ error: "Company name is required (min 2 characters)" }, { status: 400 });
    }
    if (!companyType || !ALLOWED_COMPANY_TYPES.includes(companyType)) {
      return NextResponse.json({ error: "Invalid company type" }, { status: 400 });
    }
    if (!contactName || contactName.length < 2) {
      return NextResponse.json({ error: "Contact name is required" }, { status: 400 });
    }
    if (!email || !EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    // Merge approval flag into the message JSON
    let messageObj: Record<string, unknown> = {};
    if (message) {
      try { messageObj = typeof message === "string" ? JSON.parse(message) : message; } catch { messageObj = { text: sanitize(String(message), 1000) }; }
    }
    messageObj.approved = false;
    const messageStr = JSON.stringify(messageObj);

    // 1. Create company record
    const { data: company, error: companyError } = await supabaseAdmin
      .from("companies")
      .insert({
        name: companyName,
        company_type: companyType,
        phone: phone || null,
        message: messageStr,
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

    // 3. Send admin notification email (non-blocking)
    const isReseller = companyType === "reseller" || (messageObj.role === "reseller");
    sendAdminNewRegistrationEmail({
      contactName,
      companyName,
      companyType,
      email,
      phone,
      isReseller,
      message: typeof message === "string" ? message : undefined,
    }).catch(() => {});

    // 4. Sync to HubSpot (non-blocking)
    const origin = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
    fetch(`${origin}/api/hubspot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyName, contactName, email, phone, companyType, message }),
    }).catch(() => {});

    // 5. Notify via n8n webhook (non-blocking)
    const webhookUrl = process.env.N8N_REGISTER_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, contactName, email, phone, companyType, message, registeredAt: new Date().toISOString() }),
      }).catch(() => {});
    }

    // 6. Telegram + WhatsApp notification (non-blocking)
    const typeLabel = isReseller ? "🤝 Reseller" : `🏢 ${companyType}`;
    notifyAdmin(`🆕 Nieuwe aanmelding!\n\n${typeLabel}\n📋 ${companyName}\n👤 ${contactName}\n📧 ${email}\n📱 ${phone || "—"}\n\n→ ticketmatch.ai/dashboard/admin`);

    return NextResponse.json({ success: true, companyId: company.id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
