import { NextRequest, NextResponse } from "next/server";
import { getPickups } from "@/lib/musement";

/**
 * GET /api/musement/pickups?activityUuid=...
 *
 * Returns the list of pickup points for an activity. Empty array for
 * non-pickup activities — the UI uses that to decide whether to show
 * a pickup selector before the date picker.
 */
export async function GET(request: NextRequest) {
  const activityUuid = request.nextUrl.searchParams.get("activityUuid");
  if (!activityUuid) {
    return NextResponse.json(
      { error: "activityUuid is required" },
      { status: 400 }
    );
  }
  const pickups = await getPickups(activityUuid, "en");
  return NextResponse.json({ pickups });
}
