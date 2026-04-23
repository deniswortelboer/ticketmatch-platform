import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════════════════
// POST /api/musement/timeslots
//
// For a given Musement activity + specific date, returns a flattened list
// of bookable slots with their product_identifiers (needed for cart items).
//
// Used by /dashboard/bookings/new so the reseller can pick a specific
// time (when the activity is CALENDAR-TIMESLOTS) instead of the system
// blindly defaulting to the first slot.
//
// Body: { activityUuid: string, date: "YYYY-MM-DD" }
// Response: { slots: [{ time, groupName, productId, priceEur, currency,
//                       languages, maxBuy, minBuy }] }
// ═══════════════════════════════════════════════════════════════════════

const MUSEMENT_API_BASE =
  process.env.MUSEMENT_API_BASE || "https://sandbox.musement.com/api/v3";
const APP_HEADER = process.env.MUSEMENT_APP_HEADER || "";

export async function POST(request: NextRequest) {
  try {
    const { activityUuid, date } = await request.json();
    if (!activityUuid || !date) {
      return NextResponse.json(
        { error: "activityUuid and date are required" },
        { status: 400 }
      );
    }

    const res = await fetch(
      `${MUSEMENT_API_BASE}/activities/${activityUuid}/dates/${date}`,
      {
        headers: {
          Accept: "application/json",
          "X-Musement-Version": "3.5.0",
          "X-Musement-Currency": "EUR",
          ...(APP_HEADER ? { "x-musement-application": APP_HEADER } : {}),
        },
      }
    );

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `Musement ${res.status}`, detail: body.slice(0, 400) },
        { status: res.status }
      );
    }

    type MusementProductEntry = {
      product_id?: string | number;
      holder_code?: string;
      holder_code_normalized?: string;
      name?: string;
      retail_price?: { value?: number; currency?: string };
      max_buy?: number;
      min_buy?: number;
    };
    type MusementSlotEntry = {
      time?: string;
      languages?: Array<{ code?: string; name?: string }>;
      products?: MusementProductEntry[];
    };
    type MusementGroupEntry = {
      name?: string;
      feature_code?: string;
      slots?: MusementSlotEntry[];
    };

    const data = (await res.json()) as Array<{ groups?: MusementGroupEntry[] }>;
    const slots: Array<{
      time: string;
      groupName: string;
      holderCode: string;
      productId: string;
      priceEur: number;
      currency: string;
      languages: string[];
      maxBuy: number;
      minBuy: number;
    }> = [];

    for (const entry of data) {
      for (const group of entry.groups || []) {
        for (const slot of group.slots || []) {
          // Prefer the adult/primary-holder product; fallback to the first
          const adult =
            (slot.products || []).find(
              (p) => p.holder_code_normalized === "ADULT"
            ) || (slot.products || [])[0];
          if (!adult?.product_id) continue;

          slots.push({
            time: slot.time || "",
            groupName: group.name || "Tour",
            holderCode: adult.holder_code_normalized || adult.holder_code || "ADULT",
            productId: String(adult.product_id),
            priceEur: Number(adult.retail_price?.value) || 0,
            currency: adult.retail_price?.currency || "EUR",
            languages: (slot.languages || [])
              .map((l) => l.code)
              .filter((x): x is string => typeof x === "string"),
            maxBuy: adult.max_buy ?? -1,
            minBuy: adult.min_buy ?? 1,
          });
        }
      }
    }

    return NextResponse.json({ slots });
  } catch (err) {
    console.error("Musement timeslots route error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch timeslots" },
      { status: 502 }
    );
  }
}
