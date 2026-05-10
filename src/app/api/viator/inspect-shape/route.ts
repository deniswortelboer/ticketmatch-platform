// TEMP debug route — exposes the raw shape of one Viator destination
// (Amsterdam id=525) so we can see what the parent-fields are actually
// called. Delete after diagnostic.
import { NextResponse } from "next/server";

const VIATOR_API_BASE = "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY || "";

export async function GET() {
  const res = await fetch(`${VIATOR_API_BASE}/destinations`, {
    headers: {
      "Accept": "application/json;version=2.0",
      "exp-api-key": VIATOR_API_KEY,
      "Content-Type": "application/json",
    },
  });
  if (!res.ok) return NextResponse.json({ status: res.status });
  const data = await res.json() as { destinations?: Array<Record<string, unknown>> };
  const items = data.destinations || [];
  const ams = items.find((x) => x.destinationId === 525);
  const buenos = items.find((x) => x.destinationId === 901);
  const nl = items.find((x) => x.destinationId === 60);
  // Find first 3 CITY-type items as sample
  const cities = items.filter((x) => x.type === "CITY").slice(0, 3);
  // Distinct top-level fields seen across the first 50 items
  const fields = new Set<string>();
  for (const it of items.slice(0, 50)) for (const k of Object.keys(it)) fields.add(k);
  return NextResponse.json({
    totalDestinations: items.length,
    distinctFieldsInFirst50: Array.from(fields).sort(),
    amsterdam_525: ams,
    buenosAires_901: buenos,
    netherlands_60: nl,
    sample_cities: cities,
  });
}
