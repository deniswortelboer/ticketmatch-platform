import { NextRequest, NextResponse } from "next/server";

// Cache busyness data (forecasts are valid for a week)
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60 * 24; // 24 hours

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const venueName = sp.get("venue");
  const venueAddress = sp.get("address");
  const venueId = sp.get("venue_id"); // BestTime venue_id if we already have it

  if (!venueName && !venueId) {
    return NextResponse.json({ error: "Missing venue name or venue_id" }, { status: 400 });
  }

  const cacheKey = venueId || `${venueName}_${venueAddress}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const privateKey = process.env.BESTTIME_API_KEY_PRIVATE;
  const publicKey = process.env.BESTTIME_API_KEY_PUBLIC;

  if (!privateKey || !publicKey) {
    return NextResponse.json({ error: "No BestTime API keys" }, { status: 500 });
  }

  try {
    // If we have a venue_id, query existing forecast
    if (venueId) {
      const url = `https://besttime.app/api/v1/forecasts/now?api_key_public=${publicKey}&venue_id=${venueId}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        if (data.status === "OK") {
          const result = formatBusynessData(data);
          cache.set(cacheKey, { data: result, timestamp: Date.now() });
          return NextResponse.json(result);
        }
      }
    }

    // Otherwise create a new forecast
    const params = new URLSearchParams({
      api_key_private: privateKey,
      venue_name: venueName || "",
      venue_address: venueAddress || "",
    });

    const res = await fetch(`https://besttime.app/api/v1/forecasts?${params.toString()}`, {
      method: "POST",
    });

    if (!res.ok) {
      const errText = await res.text();
      return NextResponse.json({ error: "BestTime API error", details: errText }, { status: res.status });
    }

    const data = await res.json();

    if (data.status === "OK" || data.venue_info) {
      const result = formatForecastData(data);
      cache.set(cacheKey, { data: result, timestamp: Date.now() });
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "No data available", raw: data }, { status: 404 });
  } catch (err) {
    return NextResponse.json({ error: "BestTime error", details: String(err) }, { status: 500 });
  }
}

function formatBusynessData(data: Record<string, unknown>) {
  const analysis = data.analysis as Record<string, unknown> | undefined;
  return {
    venue_id: (data.venue_info as Record<string, unknown>)?.venue_id || null,
    venue_name: (data.venue_info as Record<string, unknown>)?.venue_name || null,
    now_busyness: analysis?.venue_live_busyness ?? analysis?.venue_forecasted_busyness ?? null,
    forecasted_busyness: analysis?.venue_forecasted_busyness ?? null,
    source: "besttime",
  };
}

function formatForecastData(data: Record<string, unknown>) {
  const venueInfo = data.venue_info as Record<string, unknown> | undefined;
  const analysis = data.analysis as Record<string, unknown>[] | undefined;

  // Get today's day of week (0=Monday in BestTime)
  const jsDay = new Date().getDay(); // 0=Sunday
  const btDay = jsDay === 0 ? 6 : jsDay - 1; // Convert to BestTime format

  const todayData = analysis?.find(
    (d) => (d.day_info as Record<string, unknown>)?.day_int === btDay
  );

  const dayRaw = (todayData as Record<string, unknown>)?.day_raw as number[] | undefined;
  const currentHour = new Date().getHours();
  const currentBusyness = dayRaw?.[currentHour] ?? null;

  return {
    venue_id: venueInfo?.venue_id || null,
    venue_name: venueInfo?.venue_name || null,
    venue_type: venueInfo?.venue_type || null,
    now_busyness: currentBusyness,
    today_hourly: dayRaw || null,
    busy_hours: (todayData as Record<string, unknown>)?.busy_hours || [],
    quiet_hours: (todayData as Record<string, unknown>)?.quiet_hours || [],
    peak_hours: (todayData as Record<string, unknown>)?.peak_hours || [],
    source: "besttime",
  };
}
