import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendBookingStatusEmail, sendSmartApprovalEmail } from "@/lib/email";
import { notifyAdmin } from "@/lib/notify";

// SECURITY: Admin emails from environment variable (not hardcoded in source code)
// Set ADMIN_EMAILS=email1@x.com,email2@x.com in .env.local
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

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// GET: fetch all data for admin dashboard
export async function GET() {
  const user = await getAuthUser();
  if (!user || !ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getAdminClient();

  const [companiesRes, profilesRes, bookingsRes, groupsRes] = await Promise.all([
    admin.from("companies").select("*").order("created_at", { ascending: false }),
    admin.from("profiles").select("*, companies(name)").order("created_at", { ascending: false }),
    admin.from("bookings").select("*, groups(name), companies(name)").order("created_at", { ascending: false }),
    admin.from("groups").select("*, companies(name)").order("created_at", { ascending: false }),
  ]);

  return NextResponse.json({
    companies: companiesRes.data || [],
    profiles: profilesRes.data || [],
    bookings: bookingsRes.data || [],
    groups: groupsRes.data || [],
  });
}

// PATCH: update booking status
export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user || !ADMIN_EMAILS.includes((user.email || "").toLowerCase())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { type, id, status } = body;

  const admin = getAdminClient();

  if (type === "booking") {
    // Get booking details BEFORE updating (for the email)
    const { data: booking } = await admin
      .from("bookings")
      .select("*, groups(name), companies(name)")
      .eq("id", id)
      .single();

    const { error } = await admin.from("bookings").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Send status email to all team members of the booking's company
    if (booking?.company_id) {
      const { data: teamMembers } = await admin
        .from("profiles")
        .select("email")
        .eq("company_id", booking.company_id)
        .not("email", "is", null);

      const emails = (teamMembers || [])
        .map((m: { email: string | null }) => m.email)
        .filter(Boolean) as string[];

      const companyData = booking.companies as unknown as { name: string } | { name: string }[] | null;
      const companyName = Array.isArray(companyData) ? companyData[0]?.name : companyData?.name || "Your company";
      const groupData = booking.groups as unknown as { name: string } | { name: string }[] | null;
      const groupName = Array.isArray(groupData) ? groupData[0]?.name : groupData?.name || "Unknown group";

      // Fire-and-forget — don't block the response
      sendBookingStatusEmail({
        to: emails,
        companyName,
        venueName: booking.venue_name || "Unknown venue",
        groupName,
        scheduledDate: booking.scheduled_date,
        numberOfGuests: booking.number_of_guests || 0,
        status,
        notes: booking.notes || undefined,
      }).catch((err) => console.error("Email send error:", err));

      const statusEmoji = status === "confirmed" ? "✅" : status === "cancelled" ? "❌" : "⏳";
      notifyAdmin(`${statusEmoji} Booking ${status}!\n\n📍 ${booking.venue_name}\n🏢 ${companyName}\n👥 ${booking.number_of_guests} gasten`);
    }
  } else if (type === "company") {
    // Get the current company to merge message JSON
    const { data: company } = await admin
      .from("companies")
      .select("message, name, company_type")
      .eq("id", id)
      .single();

    // Update the status column
    const { error } = await admin.from("companies").update({ status }).eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Update the approved flag in the message JSON
    let messageObj: Record<string, unknown> = {};
    try { messageObj = company?.message ? JSON.parse(company.message) : {}; } catch {}
    messageObj.approved = status === "approved";
    const { error: msgError } = await admin
      .from("companies")
      .update({ message: JSON.stringify(messageObj) })
      .eq("id", id);
    if (msgError) console.error("Failed to update message JSON:", msgError);

    // Send approval email to all team members when approved
    if (status === "approved") {
      const { data: teamMembers } = await admin
        .from("profiles")
        .select("email")
        .eq("company_id", id)
        .not("email", "is", null);

      const emails = (teamMembers || [])
        .map((m: { email: string | null }) => m.email)
        .filter(Boolean) as string[];

      // Determine company type from company_type column or message JSON
      let companyType = company?.company_type || "tour-operator";
      try {
        const msg = company?.message ? JSON.parse(company.message) : {};
        if (msg.role === "reseller") companyType = "reseller";
      } catch {}

      sendSmartApprovalEmail({
        to: emails,
        companyName: company?.name || "Your company",
        companyType,
      }).catch((err) => console.error("Approval email error:", err));

      notifyAdmin(`✅ Bedrijf goedgekeurd!\n\n🏢 ${company?.name}\n📋 ${companyType}`);
    }
  }

  return NextResponse.json({ success: true, emailSent: type === "booking" || (type === "company" && status === "approved") });
}
