import { NextRequest, NextResponse } from "next/server";
import { getDutchCities } from "@/lib/musement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("lang") || "en";

  try {
    const cities = await getDutchCities(language);

    return NextResponse.json({
      cities,
      totalCount: cities.length,
    });
  } catch (err) {
    console.error("Musement cities route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Musement cities" },
      { status: 502 }
    );
  }
}
