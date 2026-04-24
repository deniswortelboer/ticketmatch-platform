import { NextRequest, NextResponse } from "next/server";
import { getActivityRequirements } from "@/lib/musement";

// GET /api/musement/activity-schema?uuid={activityUuid}&lang=en
//
// Returns the required extra_customer_data + participant-info fields for a
// Musement activity, using the cart-less preview endpoints. Consumed by the
// reseller UI before a booking is confirmed so the dynamic form can be
// rendered and answers collected up-front.
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");
  const language = searchParams.get("lang") || "en";

  if (!uuid) {
    return NextResponse.json({ error: "uuid is required" }, { status: 400 });
  }

  try {
    const requirements = await getActivityRequirements(uuid, language);
    return NextResponse.json(requirements);
  } catch (err) {
    console.error("Musement activity-schema route error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch activity schema" },
      { status: 502 }
    );
  }
}
