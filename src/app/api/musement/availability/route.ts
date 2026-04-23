import { NextRequest, NextResponse } from "next/server";
import { getAvailability } from "@/lib/musement";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      uuid,
      dateFrom,
      dateTo,
      language = "en",
      currency = "EUR",
    } = body;

    if (!uuid || !dateFrom || !dateTo) {
      return NextResponse.json(
        { error: "uuid, dateFrom, and dateTo are required" },
        { status: 400 }
      );
    }

    const availability = await getAvailability(uuid, dateFrom, dateTo, language, currency);

    return NextResponse.json({
      available: availability.some((d) => d.available),
      dates: availability,
    });
  } catch (err) {
    console.error("Musement availability route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Musement availability" },
      { status: 502 }
    );
  }
}
