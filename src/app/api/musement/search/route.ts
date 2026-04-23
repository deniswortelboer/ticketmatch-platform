import { NextRequest, NextResponse } from "next/server";
import { searchActivities, searchActivitiesByCategory } from "@/lib/musement";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      cityId,
      cityName,
      categoryId,
      limit = 20,
      offset = 0,
      currency = "EUR",
      language = "en",
      sortBy = "relevance",
    } = body;

    if (!cityId && !cityName) {
      return NextResponse.json(
        { error: "Either cityId or cityName is required" },
        { status: 400 }
      );
    }

    let result;

    if (categoryId && cityId) {
      result = await searchActivitiesByCategory(cityId, categoryId, {
        limit,
        offset,
        currency,
        language,
        sortBy,
      });
    } else {
      result = await searchActivities({
        cityId,
        cityName,
        limit,
        offset,
        currency,
        language,
        sortBy,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error("Musement search route error:", err);
    return NextResponse.json(
      { error: "Failed to search Musement activities" },
      { status: 502 }
    );
  }
}
