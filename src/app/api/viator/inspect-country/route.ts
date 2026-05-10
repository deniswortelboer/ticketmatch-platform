// TEMP one-shot debug — exposes raw fields of one Viator COUNTRY entry so
// we can see whether an ISO / countryCode field exists. Delete after use.
import { NextResponse } from "next/server";

const VIATOR_API_BASE = "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY || "";

export async function GET() {
  const r = await fetch(`${VIATOR_API_BASE}/destinations`, {
    headers: {
      Accept: "application/json;version=2.0",
      "Accept-Language": "en",
      "exp-api-key": VIATOR_API_KEY,
    },
  });
  if (!r.ok) return NextResponse.json({ status: r.status });
  const data = (await r.json()) as { destinations?: Array<Record<string, unknown>> };
  const items = data.destinations || [];
  const samples: Record<string, unknown> = {};
  for (const id of [60, 78, 144, 207]) {
    // Netherlands, Argentina, Japan, USA (likely)
    const m = items.find((x) => x.destinationId === id);
    if (m) samples[`country_${id}`] = m;
  }
  // Just return the first 3 COUNTRY-typed items to see all field names
  const firstCountries = items.filter((x) => x.type === "COUNTRY").slice(0, 3);
  return NextResponse.json({ samples, firstCountries });
}
