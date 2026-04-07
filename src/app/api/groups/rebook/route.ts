import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

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

// POST: duplicate a group + all its bookings
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { groupId, newName, newTravelDate } = body;

  if (!groupId) return NextResponse.json({ error: "Group ID required" }, { status: 400 });

  const admin = getAdminClient();

  // Get user's company
  const { data: profile } = await admin.from("profiles").select("company_id").eq("id", user.id).single();
  if (!profile?.company_id) return NextResponse.json({ error: "No company found" }, { status: 400 });

  // Get original group (verify ownership)
  const { data: originalGroup } = await admin
    .from("groups")
    .select("*")
    .eq("id", groupId)
    .eq("company_id", profile.company_id)
    .single();

  if (!originalGroup) return NextResponse.json({ error: "Group not found" }, { status: 404 });

  // Get original bookings
  const { data: originalBookings } = await admin
    .from("bookings")
    .select("*")
    .eq("group_id", groupId)
    .eq("company_id", profile.company_id);

  // Create new group
  const groupName = newName || `${originalGroup.name} (Rebooked)`;

  // Calculate date offset if new travel date provided
  let dateOffset = 0;
  if (newTravelDate && originalGroup.travel_date) {
    const origDate = new Date(originalGroup.travel_date + "T00:00:00");
    const newDate = new Date(newTravelDate + "T00:00:00");
    dateOffset = Math.round((newDate.getTime() - origDate.getTime()) / (1000 * 60 * 60 * 24));
  }

  const { data: newGroup, error: groupError } = await admin
    .from("groups")
    .insert({
      company_id: profile.company_id,
      name: groupName,
      travel_date: newTravelDate || originalGroup.travel_date,
      number_of_guests: originalGroup.number_of_guests,
      contact_person: originalGroup.contact_person,
      notes: originalGroup.notes ? `Rebooked from: ${originalGroup.name}\n${originalGroup.notes}` : `Rebooked from: ${originalGroup.name}`,
      status: "draft",
    })
    .select()
    .single();

  if (groupError) return NextResponse.json({ error: groupError.message }, { status: 500 });

  // Duplicate all bookings with new group ID
  if (originalBookings && originalBookings.length > 0) {
    const newBookings = originalBookings.map((b) => {
      // Shift booking dates by the same offset
      let newScheduledDate = b.scheduled_date;
      if (b.scheduled_date && dateOffset !== 0) {
        const d = new Date(b.scheduled_date + "T00:00:00");
        d.setDate(d.getDate() + dateOffset);
        newScheduledDate = d.toISOString().split("T")[0];
      }

      return {
        group_id: newGroup.id,
        company_id: profile.company_id,
        venue_name: b.venue_name,
        venue_category: b.venue_category,
        venue_city: b.venue_city,
        scheduled_date: newScheduledDate,
        number_of_guests: b.number_of_guests,
        unit_price: b.unit_price,
        total_price: b.total_price,
        notes: b.notes,
        status: "pending", // All rebooked bookings start as pending
      };
    });

    const { error: bookingsError } = await admin.from("bookings").insert(newBookings);
    if (bookingsError) {
      console.error("Failed to duplicate bookings:", bookingsError);
    }
  }

  return NextResponse.json({
    success: true,
    group: newGroup,
    bookingsCount: originalBookings?.length || 0,
    message: `Successfully rebooked "${originalGroup.name}" with ${originalBookings?.length || 0} activities`,
  });
}
