import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════════════════
// POST /api/musement/timeslots
//
// For a given Musement activity + specific date, returns a flattened list
// of bookable slots with the FULL set of holder products per slot
// (ADULT/CHILD/INFANT/STUDENT/SENIOR/etc). The booking UI uses this to
// render a multi-holder quantity picker.
//
// Body: { activityUuid: string, date: "YYYY-MM-DD" }
// Response: {
//   slots: [{
//     time, groupName, languages, currency,
//     // legacy single-product mirrors (= primary holder, for back-compat):
//     productId, priceEur, holderCode, minBuy, maxBuy,
//     // NEW: full holder breakdown per slot
//     holders: [
//       { code, name, productId, priceEur, minBuy, maxBuy, isPrimary }
//     ]
//   }]
// }
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

    const headers = {
      Accept: "application/json",
      "X-Musement-Version": "3.5.0",
      "X-Musement-Currency": "EUR",
      ...(APP_HEADER ? { "x-musement-application": APP_HEADER } : {}),
    };

    // Fetch activity + slots in parallel. We need the activity-level
    // booking_type to know whether slot.time is real (CALENDAR-TIMESLOTS)
    // or randomly generated (CALENDAR-NO-TIMESLOTS / open-date). Per
    // Musement docs, day-based times must NOT be shown to customers.
    const [res, activityRes] = await Promise.all([
      fetch(`${MUSEMENT_API_BASE}/activities/${activityUuid}/dates/${date}`, { headers }),
      fetch(`${MUSEMENT_API_BASE}/activities/${activityUuid}`, { headers }),
    ]);

    if (!res.ok) {
      const body = await res.text();
      return NextResponse.json(
        { error: `Musement ${res.status}`, detail: body.slice(0, 400) },
        { status: res.status }
      );
    }

    let dayBased = false;
    if (activityRes.ok) {
      const activity = await activityRes.json();
      const bookingType = (activity?.booking_type as string) || "";
      const isOpenDate = activity?.open === true;
      // CALENDAR-NO-TIMESLOTS = date-only (daily=true); time is fake.
      // Open-date activities likewise have no real time.
      dayBased = bookingType === "CALENDAR-NO-TIMESLOTS" || isOpenDate || activity?.daily === true;
    }

    type MusementProductEntry = {
      product_id?: string | number;
      holder_code?: string;
      holder_code_normalized?: string;
      name?: string;
      retail_price?: { value?: number; currency?: string };
      max_buy?: number;
      min_buy?: number;
      default?: boolean;
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

    type Holder = {
      code: string;          // e.g. "ADULT", "CHILD"
      name: string;          // human-friendly: "Adult", "Child"
      productId: string;
      priceEur: number;
      minBuy: number;
      maxBuy: number;        // -1 = unlimited
      isPrimary: boolean;    // true for the slot's default/ADULT row
    };
    type Slot = {
      time: string;
      groupName: string;
      languages: string[];
      currency: string;
      // legacy mirrors (primary holder)
      holderCode: string;
      productId: string;
      priceEur: number;
      maxBuy: number;
      minBuy: number;
      // new: full holder list
      holders: Holder[];
    };

    const data = (await res.json()) as Array<{ groups?: MusementGroupEntry[] }>;
    const slots: Slot[] = [];

    for (const entry of data) {
      for (const group of entry.groups || []) {
        for (const slot of group.slots || []) {
          const products = (slot.products || []).filter((p) => p.product_id);
          if (products.length === 0) continue;

          const holders: Holder[] = products.map((p) => ({
            code: p.holder_code_normalized || p.holder_code || "ADULT",
            name: p.name || p.holder_code_normalized || p.holder_code || "Adult",
            productId: String(p.product_id),
            priceEur: Number(p.retail_price?.value) || 0,
            minBuy: p.min_buy ?? 0,
            maxBuy: p.max_buy ?? -1,
            isPrimary: false, // set below
          }));

          // Pick the primary holder: explicit `default: true` wins, else
          // ADULT-normalized, else the first row.
          const explicit = products.findIndex((p) => p.default === true);
          const adultIdx = products.findIndex(
            (p) => p.holder_code_normalized === "ADULT"
          );
          const primaryIdx = explicit >= 0 ? explicit : adultIdx >= 0 ? adultIdx : 0;
          holders[primaryIdx].isPrimary = true;
          const primary = holders[primaryIdx];

          slots.push({
            // For day-based / open-date activities Musement returns a
            // randomly generated time that we MUST NOT display per docs.
            time: dayBased ? "" : (slot.time || ""),
            groupName: group.name || "Tour",
            languages: (slot.languages || [])
              .map((l) => l.code)
              .filter((x): x is string => typeof x === "string"),
            currency: products[0].retail_price?.currency || "EUR",
            // legacy single-product mirrors
            holderCode: primary.code,
            productId: primary.productId,
            priceEur: primary.priceEur,
            maxBuy: primary.maxBuy,
            minBuy: primary.minBuy,
            // new
            holders,
          });
        }
      }
    }

    return NextResponse.json({ slots, dayBased });
  } catch (err) {
    console.error("Musement timeslots route error:", err);
    return NextResponse.json(
      { error: (err as Error).message || "Failed to fetch timeslots" },
      { status: 502 }
    );
  }
}
