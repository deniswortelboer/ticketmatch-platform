import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { getCatalogUpdates } from "@/lib/musement";

// ═══════════════════════════════════════════════════════════════
// GET /api/musement/catalog-sync?date=YYYY-MM-DD
//
// Pulls the list of activities Musement has changed on or after `date`
// and writes them to the musement_catalog_updates table for downstream
// cache invalidation. Defaults to "yesterday" so a daily launchd job
// catches everything that flipped since the last run.
//
// Auth: requires CRON_SECRET in `Authorization: Bearer ...` header so
// this can be safely scheduled from launchd or Vercel Cron without
// exposing the endpoint to the public internet.
// ═══════════════════════════════════════════════════════════════

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

function yesterdayIso(): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  const expected = process.env.CRON_SECRET;
  if (expected) {
    const auth = request.headers.get("authorization") || "";
    if (auth !== `Bearer ${expected}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const { searchParams } = new URL(request.url);
  const date = searchParams.get("date") || yesterdayIso();

  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date must be YYYY-MM-DD" },
      { status: 400 }
    );
  }

  const updates = await getCatalogUpdates(date);
  const admin = getAdminClient();

  // Upsert into a tracking table so other parts of the app can react
  // (cache invalidation, re-sync, sitemap regeneration). Idempotent on
  // (uuid, batch_date) — re-running for the same date is safe.
  if (updates.length > 0) {
    await admin.from("musement_catalog_updates").upsert(
      updates.map((u) => ({
        activity_uuid: u.uuid,
        batch_date: date,
        musement_updated_at: u.updated_at ?? null,
        musement_status: u.status ?? null,
      })),
      { onConflict: "activity_uuid,batch_date" }
    );
  }

  return NextResponse.json({
    ok: true,
    date,
    count: updates.length,
    sample: updates.slice(0, 5),
  });
}
