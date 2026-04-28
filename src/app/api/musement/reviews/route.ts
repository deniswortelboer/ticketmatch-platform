import { NextRequest, NextResponse } from "next/server";
import { getActivityReviews } from "@/lib/musement";

// ═══════════════════════════════════════════════════════════════
// GET /api/musement/reviews?uuid=...&limit=10&offset=0&lang=en
//
// Public read-through to Musement's per-activity reviews. Aggregates
// (rating average + count) already arrive on the activity-detail
// endpoint as `reviews_avg` / `reviews_number`; this route is for the
// per-review text pagination shown beneath the rating-stars block.
// ═══════════════════════════════════════════════════════════════

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");
  const limit = parseInt(searchParams.get("limit") ?? "10", 10);
  const offset = parseInt(searchParams.get("offset") ?? "0", 10);
  const language = searchParams.get("lang") ?? "en";

  if (!uuid) {
    return NextResponse.json({ error: "uuid is required" }, { status: 400 });
  }

  const reviews = await getActivityReviews(uuid, { limit, offset, language });
  return NextResponse.json({ reviews, count: reviews.length });
}
