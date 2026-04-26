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

// GET: fetch groups for current user's company
export async function GET() {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = getAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ groups: [] });
  }

  const { data: groups } = await admin
    .from("groups")
    .select("*")
    .eq("company_id", profile.company_id)
    .order("created_at", { ascending: false });

  return NextResponse.json({ groups: groups || [] });
}

// POST: create a new group
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { name, travelDate, numberOfGuests, contactPerson, notes } = body;

  if (!name) {
    return NextResponse.json({ error: "Group name is required" }, { status: 400 });
  }

  const admin = getAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  const { data: group, error } = await admin
    .from("groups")
    .insert({
      company_id: profile.company_id,
      name,
      travel_date: travelDate || null,
      number_of_guests: numberOfGuests || 0,
      contact_person: contactPerson || null,
      notes: notes || null,
      status: "draft",
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ group });
}

// PUT: update an existing group (used by /groups/[id] Passengers-tab drop-zone
// to append parsed passengers to the existing notes field, plus normal edits).
export async function PUT(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, name, travelDate, numberOfGuests, contactPerson, notes, status } = body;

  if (!id) {
    return NextResponse.json({ error: "Group id is required" }, { status: 400 });
  }

  const admin = getAdminClient();

  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile?.company_id) {
    return NextResponse.json({ error: "No company found" }, { status: 400 });
  }

  const patch: Record<string, unknown> = {};
  if (name !== undefined) patch.name = name;
  if (travelDate !== undefined) patch.travel_date = travelDate || null;
  if (numberOfGuests !== undefined) patch.number_of_guests = numberOfGuests || 0;
  if (contactPerson !== undefined) patch.contact_person = contactPerson || null;
  if (notes !== undefined) patch.notes = notes || null;
  if (status !== undefined) patch.status = status;

  const { data: group, error } = await admin
    .from("groups")
    .update(patch)
    .eq("id", id)
    .eq("company_id", profile.company_id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ group });
}

// DELETE: remove a group
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const groupId = searchParams.get("id");
  if (!groupId) return NextResponse.json({ error: "Missing group ID" }, { status: 400 });

  const admin = getAdminClient();

  // Verify ownership
  const { data: profile } = await admin
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .single();

  const { error } = await admin
    .from("groups")
    .delete()
    .eq("id", groupId)
    .eq("company_id", profile?.company_id || "");

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
