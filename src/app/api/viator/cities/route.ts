import { NextRequest, NextResponse } from "next/server";
import { getViatorCitiesByCountry } from "@/lib/viator";

/**
 * GET /api/viator/cities?country=Netherlands
 *
 * Returns Viator's CITY-type destinations under a country, each with the
 * REAL totalCount of products (sorted desc by count). Cities with count=0
 * are omitted entirely — what the user sees in the dropdown is what
 * they'll get on click.
 *
 * Cold-start cost: ~ceil(N/8) × ~600ms where N is the country's city count.
 * Subsequent calls per worker are O(1) (counts are cached in-memory).
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const country = searchParams.get("country");
  if (!country) {
    return NextResponse.json(
      { error: "country query param is required (use the Viator country name, e.g. 'Netherlands')" },
      { status: 400 }
    );
  }
  try {
    const cities = await getViatorCitiesByCountry(country);
    return NextResponse.json({ cities, totalCount: cities.length });
  } catch (err) {
    console.error("Viator cities route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Viator cities", cities: [] },
      { status: 502 }
    );
  }
}
