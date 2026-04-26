import { NextRequest, NextResponse } from "next/server";
import { getCitiesByCountry, getDutchCities } from "@/lib/musement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("lang") || "en";
  const country = searchParams.get("country");

  try {
    if (country) {
      const cities = await getCitiesByCountry(country, language);
      return NextResponse.json({
        cities: cities.map((c) => ({
          id: c.id,
          name: c.name,
          count: c.activitiesCount,
          weight: c.weight,
          countryIso: c.countryIso,
          countryName: c.countryName,
          lat: c.lat,
          lng: c.lng,
          timezone: c.timezone,
        })),
        totalCount: cities.length,
      });
    }

    // Backwards compat: no country param ⇒ Dutch cities
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
