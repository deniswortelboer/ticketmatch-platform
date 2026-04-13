import { NextRequest, NextResponse } from "next/server";
import { searchProducts, searchProductsByDestinationId } from "@/lib/viator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { city, destinationId, category, startDate, endDate, limit, start, currency, language } = body;

    // Search by destination ID (custom city search)
    if (destinationId) {
      const results = await searchProductsByDestinationId(Number(destinationId), {
        city: city || "",
        category,
        limit: limit || 20,
        start: start || 1,
        currency: currency || "EUR",
        language: language || "en",
      });
      return NextResponse.json(results);
    }

    // Search by city name (preset cities)
    if (!city) {
      return NextResponse.json({ error: "City or destinationId is required" }, { status: 400 });
    }

    const results = await searchProducts({
      city,
      category,
      startDate,
      endDate,
      limit: limit || 20,
      start: start || 1,
      currency: currency || "EUR",
      language: language || "en",
    });

    return NextResponse.json(results);
  } catch {
    return NextResponse.json({ error: "Search unavailable" }, { status: 502 });
  }
}
