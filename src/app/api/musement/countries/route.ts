import { NextRequest, NextResponse } from "next/server";
import { getCountries } from "@/lib/musement";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const language = searchParams.get("lang") || "en";

  try {
    const countries = await getCountries(language);
    return NextResponse.json({
      countries: countries.map((c) => ({
        id: c.id,
        name: c.name,
        iso: c.iso_code,
      })),
      totalCount: countries.length,
    });
  } catch (err) {
    console.error("Musement countries route error:", err);
    return NextResponse.json(
      { error: "Failed to fetch Musement countries" },
      { status: 502 }
    );
  }
}
