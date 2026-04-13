import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = sp.get("lat") || "52.3676";
  const lng = sp.get("lng") || "4.9041";
  const tz = sp.get("tz") || "Europe/Amsterdam";

  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,relative_humidity_2m,apparent_temperature,precipitation,weather_code,wind_speed_10m,cloud_cover&hourly=temperature_2m,precipitation_probability,weather_code&forecast_days=1&timezone=${encodeURIComponent(tz)}`,
      { next: { revalidate: 600 } }
    );

    if (!res.ok) throw new Error("Weather API error");

    const data = await res.json();
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Weather unavailable" }, { status: 500 });
  }
}
