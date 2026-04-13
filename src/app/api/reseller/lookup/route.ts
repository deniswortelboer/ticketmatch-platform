import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  if (!slug) {
    return NextResponse.json({ error: "Missing slug" }, { status: 400 });
  }

  // Find company with role=reseller and matching reseller_slug in message JSON
  const { data: companies } = await supabaseAdmin
    .from("companies")
    .select("id, name, message")
    .order("created_at", { ascending: false });

  if (!companies) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const reseller = companies.find((c) => {
    try {
      const msg = c.message ? JSON.parse(c.message) : {};
      return msg.role === "reseller" && msg.reseller_slug === slug.toLowerCase();
    } catch {
      return false;
    }
  });

  if (!reseller) {
    return NextResponse.json({ error: "Reseller not found" }, { status: 404 });
  }

  return NextResponse.json({ id: reseller.id, name: reseller.name });
}
