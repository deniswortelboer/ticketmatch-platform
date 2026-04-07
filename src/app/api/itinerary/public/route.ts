import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import { validateShareToken } from "@/lib/share-token";

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

// GET: Fetch public itinerary data (no auth required)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token is required" }, { status: 400 });
  }

  const groupId = validateShareToken(token);
  if (!groupId) {
    return NextResponse.json({ error: "Invalid or expired link" }, { status: 403 });
  }

  const admin = getAdminClient();

  // Fetch group info
  const { data: group } = await admin
    .from("groups")
    .select("id, name, travel_date, number_of_guests, contact_person, status")
    .eq("id", groupId)
    .single();

  if (!group) {
    return NextResponse.json({ error: "Itinerary not found" }, { status: 404 });
  }

  // Fetch bookings WITHOUT prices
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, venue_name, venue_category, venue_city, scheduled_date, number_of_guests, status")
    .eq("group_id", groupId)
    .order("scheduled_date", { ascending: true });

  // Fetch company name for branding
  const { data: groupFull } = await admin
    .from("groups")
    .select("company_id")
    .eq("id", groupId)
    .single();

  let companyName = null;
  if (groupFull?.company_id) {
    const { data: company } = await admin
      .from("companies")
      .select("name")
      .eq("id", groupFull.company_id)
      .single();
    companyName = company?.name || null;
  }

  return NextResponse.json({
    group,
    bookings: bookings || [],
    companyName,
  });
}
