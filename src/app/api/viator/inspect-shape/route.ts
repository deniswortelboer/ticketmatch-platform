// TEMP debug route — probes Viator's /destinations endpoint with multiple
// Accept-version headers + paths to find what works. Delete after diagnostic.
import { NextResponse } from "next/server";

const VIATOR_API_BASE = "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY || "";

export async function GET() {
  const attempts = [
    { url: `${VIATOR_API_BASE}/destinations`, ver: "2.0", method: "GET", lang: "en" },
    { url: `${VIATOR_API_BASE}/destinations`, ver: "2.0", method: "GET", lang: "en-US" },
    { url: `${VIATOR_API_BASE}/destinations`, ver: "2.5", method: "GET", lang: "en" },
  ];
  const probes: Array<Record<string, unknown>> = [];
  for (const a of attempts) {
    try {
      const r = await fetch(a.url, {
        method: a.method,
        headers: {
          "Accept": `application/json;version=${a.ver}`,
          "Accept-Language": a.lang,
          "exp-api-key": VIATOR_API_KEY,
          "Content-Type": "application/json",
        },
      });
      const txt = await r.text();
      // Try to parse JSON for structure
      let sample: unknown = null;
      let count = 0;
      try {
        const j = JSON.parse(txt);
        const items = (j.destinations || j.data || []) as Array<Record<string, unknown>>;
        count = items.length;
        sample = items.find((x) => x.destinationId === 525) || items[0] || null;
      } catch { /* not JSON */ }
      probes.push({
        attempt: a,
        status: r.status,
        count,
        sample,
        bodyHead: !sample ? txt.slice(0, 300) : undefined,
      });
    } catch (e) {
      probes.push({ attempt: a, error: String(e) });
    }
  }
  return NextResponse.json({ probes });
}
