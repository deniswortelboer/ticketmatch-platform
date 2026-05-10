import { NextResponse } from "next/server";
import { getViatorCountries } from "@/lib/viator";

/**
 * GET /api/viator/countries
 *
 * Live list of every COUNTRY-type destination Viator sells. Powers the
 * Country dropdown when source = Viator on the Experiences page. Source
 * of truth = Viator's /destinations endpoint, no hardcoded list.
 */
export async function GET() {
  try {
    const countries = await getViatorCountries();
    return NextResponse.json({ countries, totalCount: countries.length });
  } catch (err) {
    console.error("Viator countries route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Viator countries", countries: [] },
      { status: 502 }
    );
  }
}
