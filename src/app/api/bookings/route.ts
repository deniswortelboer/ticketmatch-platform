import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { sendBookingStatusEmail } from "@/lib/email";

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

// GET: fetch bookings for current user's company
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ bookings: [] });

  const { data: bookings } = await admin
    .from("bookings")
    .select("*, groups(name)")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ bookings: bookings || [] });
}

// POST: create a booking
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { groupId, venueName, venueCategory, venueCity, scheduledDate, numberOfGuests, unitPrice, notes } = body;

  if (!groupId || !venueName) {
    return NextResponse.json({ error: "Group and venue are required" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company" }, { status: 400 });

  const totalPrice = (numberOfGuests || 0) * (unitPrice || 0);

  const { data: booking, error } = await admin
    .from("bookings")
    .insert({
      group_id: groupId,
      company_id: profile.company_id,
      venue_name: venueName,
      venue_category: venueCategory || null,
      venue_city: venueCity || null,
      scheduled_date: scheduledDate || null,
      number_of_guests: numberOfGuests || 0,
      unit_price: unitPrice || 0,
      total_price: totalPrice,
      notes: notes || null,
      status: "pending",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Send confirmation email for new booking
  if (booking) {
    const { data: company } = await admin.from("companies").select("name").eq("id", profile.company_id).single();
    const { data: group } = await admin.from("groups").select("name").eq("id", groupId).single();
    const { data: teamMembers } = await admin
      .from("profiles")
      .select("email")
      .eq("company_id", profile.company_id)
      .not("email", "is", null);

    const emails = (teamMembers || [])
      .map((m: { email: string | null }) => m.email)
      .filter(Boolean) as string[];

    sendBookingStatusEmail({
      to: emails,
      companyName: company?.name || "Your company",
      venueName: venueName,
      groupName: group?.name || "Your group",
      scheduledDate: scheduledDate || null,
      numberOfGuests: numberOfGuests || 0,
      status: "pending",
      notes: notes || undefined,
    }).catch((err) => console.error("Email send error:", err));
  }

  return NextResponse.json({ booking });
}

// DELETE: remove a booking
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const bookingId = searchParams.get("id");
  if (!bookingId) return NextResponse.json({ error: "Missing ID" }, { status: 400 });

  const admin = getAdminClient();
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();

  await admin.from("bookings").delete().eq("id", bookingId).eq("company_id", profile?.company_id || "");
  return NextResponse.json({ success: true });
}
