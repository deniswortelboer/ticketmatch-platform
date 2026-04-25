import { NextRequest, NextResponse } from "next/server";
import { getVerticals } from "@/lib/musement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("lang") || "en";

  try {
    const verticals = await getVerticals(language);
    return NextResponse.json({
      verticals,
      totalCount: verticals.length,
    });
  } catch (err) {
    console.error("Musement verticals route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Musement verticals" },
      { status: 502 }
    );
  }
}
