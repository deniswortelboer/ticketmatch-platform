import { NextRequest, NextResponse } from "next/server";

// Persistent cache (survives across requests, cleared on redeploy)
const forecastCache = new Map<string, { data: Record<string, unknown>; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

// Export so other routes can read the cache
export { forecastCache };

export async function POST(req: NextRequest) {
  const body = await req.json();
  const venues: { name: string; address: string }[] = body.venues || [];
  const limit = Math.min(venues.length, 45); // Max 45 to stay under 100 F credits (45 x 2 = 90)

  const privateKey = process.env.BESTTIME_API_KEY_PRIVATE;
  if (!privateKey) {
    return NextResponse.json({ error: "No BestTime API key" }, { status: 500 });
  }

  const results: Record<string, unknown>[] = [];
  let creditsUsed = 0;

  for (let i = 0; i < limit; i++) {
    const v = venues[i];
    const cacheKey = `${v.name}_${v.address}`.toLowerCase();

    // Skip if already cached
    const cached = forecastCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      results.push({ ...cached.data, cached: true });
      continue;
    }

    try {
      const params = new URLSearchParams({
        api_key_private: privateKey,
        venue_name: v.name,
        venue_address: v.address,
      });

      const res = await fetch(`https://besttime.app/api/v1/forecasts?${params.toString()}`, {
        method: "POST",
      });

      if (!res.ok) {
        results.push({ venue_name: v.name, error: "API error", status: res.status });
        continue;
      }

      const data = await res.json();
      creditsUsed += 2;

      if (data.status === "OK" || data.venue_info) {
        const venueInfo = data.venue_info || {};
        const analysis = data.analysis || [];

        // Get today's data
        const jsDay = new Date().getDay();
        const btDay = jsDay === 0 ? 6 : jsDay - 1;
        const todayData = analysis.find((d: Record<string, unknown>) =>
          (d.day_info as Record<string, unknown>)?.day_int === btDay
        );

        const dayRaw = todayData?.day_raw as number[] | undefined;
        const currentHour = new Date().getHours();

        const result = {
          venue_name: venueInfo.venue_name || v.name,
          venue_id: venueInfo.venue_id || null,
          venue_type: venueInfo.venue_type || null,
          now_busyness: dayRaw?.[currentHour] ?? null,
          today_hourly: dayRaw || null,
          busy_hours: todayData?.busy_hours || [],
          quiet_hours: todayData?.quiet_hours || [],
          source: "besttime_live",
        };

        forecastCache.set(cacheKey, { data: result, timestamp: Date.now() });
        results.push(result);
      } else {
        results.push({ venue_name: v.name, error: "No data", raw_status: data.status });
      }

      // Small delay to avoid rate limiting
      if (i < limit - 1) {
        await new Promise((r) => setTimeout(r, 300));
      }
    } catch (err) {
      results.push({ venue_name: v.name, error: String(err) });
    }
  }

  return NextResponse.json({
    total: results.length,
    credits_used: creditsUsed,
    results,
  });
}

// GET: Read cached data for a city
export async function GET(req: NextRequest) {
  const city = req.nextUrl.searchParams.get("city") || "amsterdam";

  const cached: Record<string, unknown>[] = [];
  forecastCache.forEach((entry, key) => {
    if (key.toLowerCase().includes(city.toLowerCase()) && Date.now() - entry.timestamp < CACHE_TTL) {
      cached.push(entry.data);
    }
  });

  return NextResponse.json({ city, total: cached.length, venues: cached });
}
