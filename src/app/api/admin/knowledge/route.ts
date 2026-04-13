import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const ADMIN_EMAILS = ["wortelboerdenis@gmail.com", "patekrolexvc@gmail.com"];

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

// GET: fetch all knowledge_base entries
export async function GET() {
  const user = await getAuthUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("knowledge_base")
    .select("*")
    .order("category", { ascending: true })
    .order("tier", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entries: data || [] });
}

// POST: create a new knowledge_base entry
export async function POST(request: Request) {
  const user = await getAuthUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { title, content, category, tier } = body;

  if (!title || !content || !category || !tier) {
    return NextResponse.json({ error: "Missing required fields: title, content, category, tier" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("knowledge_base")
    .insert({ title, content, category, tier, active: true })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data });
}

// PATCH: update a knowledge_base entry
export async function PATCH(request: Request) {
  const user = await getAuthUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Only allow known fields
  const allowed: Record<string, unknown> = {};
  for (const key of ["title", "content", "category", "tier", "active"]) {
    if (updates[key] !== undefined) allowed[key] = updates[key];
  }
  allowed.updated_at = new Date().toISOString();

  const admin = getAdminClient();
  const { data, error } = await admin
    .from("knowledge_base")
    .update(allowed)
    .eq("id", id)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ entry: data });
}

// DELETE: delete a knowledge_base entry
export async function DELETE(request: Request) {
  const user = await getAuthUser();
  if (!user || !ADMIN_EMAILS.includes(user.email || "")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  const admin = getAdminClient();
  const { error } = await admin
    .from("knowledge_base")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
