import { NextRequest, NextResponse } from "next/server";
import { getActivityResult } from "@/lib/musement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const uuid = searchParams.get("uuid");
  const language = searchParams.get("lang") || "en";
  const currency = searchParams.get("currency") || "EUR";

  if (!uuid) {
    return NextResponse.json(
      { error: "Activity UUID is required" },
      { status: 400 }
    );
  }

  const result = await getActivityResult(uuid, language, currency);

  if (result.ok) return NextResponse.json(result.product);

  // Activity-flap handling: an "unavailable" activity (Musement 403)
  // exists but flipped back to DRAFT/REVIEW. Show a clear, recoverable
  // message instead of a generic 404 — the user might want to retry
  // later or pick a different activity.
  if (result.code === "unavailable") {
    return NextResponse.json(
      {
        error: "This activity is temporarily unavailable from Musement. Please try again later or choose another activity.",
        code: "unavailable",
      },
      { status: 503 }
    );
  }

  if (result.code === "not_found") {
    return NextResponse.json(
      { error: "Activity not found", code: "not_found" },
      { status: 404 }
    );
  }

  console.error("Musement product route error:", result);
  return NextResponse.json(
    { error: "Failed to fetch Musement activity", code: "api_error" },
    { status: 502 }
  );
}
