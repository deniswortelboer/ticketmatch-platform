/**
 * TUI Musement Partner API v3 - Merchant Connector
 * Handles product search, availability, booking, and cancellation
 * TicketMatch is Merchant of Record - we handle payments, tickets, and first-line support
 */

const MUSEMENT_API_BASE = process.env.MUSEMENT_API_BASE || "https://sandbox.musement.com/api/v3";
const MUSEMENT_APP_HEADER = process.env.MUSEMENT_APP_HEADER || "";
const MUSEMENT_CLIENT_ID = process.env.MUSEMENT_CLIENT_ID || "";
const MUSEMENT_CLIENT_SECRET = process.env.MUSEMENT_CLIENT_SECRET || "";
// Market code controls catalog/pricing scope. Final value pending from
// Musement (Mario) — sandbox accepts "nl" but production code may differ.
const MUSEMENT_MARKET = process.env.MUSEMENT_MARKET || "nl";

// CID = commission-attribution channel id. Musement uses this on order
// requests to credit the right partner-channel in their reporting.
// Without it, sales may not show up in our channel breakdown.
// Set via env (MUSEMENT_DEFAULT_CID); per-reseller override supported
// via the optional `cid` parameter on createCart / confirmOrder.
const MUSEMENT_DEFAULT_CID = process.env.MUSEMENT_DEFAULT_CID || "";

function withCid(url: string, cid?: string): string {
  const value = cid || MUSEMENT_DEFAULT_CID;
  if (!value) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}cid=${encodeURIComponent(value)}`;
}

// Hard cap on list-endpoint pagination. Musement docs warn that limit > 20
// degrades exponentially; the API allows up to 100 but we never want it.
const MAX_LIST_LIMIT = 20;

// ─── Types ───────────────────────────────────────────────────────────────────

export type MusementProduct = {
  uuid: string;
  title: string;
  description: string;            // short (kept at 300 chars for card display)
  descriptionFull?: string;       // full unsliced version for detail view
  duration: string;
  rating: number;
  reviewCount: number;
  pricing: {
    currency: string;
    netPrice: number;       // What we pay Musement
    retailPrice: number;    // Suggested selling price
    formatted: string;      // Display price for customers
    margin: number;         // Our margin percentage
    serviceFee?: number;    // Musement service fee (optional display)
  };
  images: { url: string; caption?: string }[];
  categories: string[];
  location: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  bookingType: "merchant";  // Always merchant - we handle the sale
  flags: string[];
  languages: string[];
  isOwnOffer: boolean;      // TUI Musement in-house product
  // Musement taxonomy for global discovery UI
  verticals: { id: number; name: string }[];   // 7 top-level buckets
  flavours: { id: number; name: string }[];    // Tour format (Guided/Private/Audio/Entrance)
  // Curated rails — set true when Musement flags the activity as such
  topSeller: boolean;
  mustSee: boolean;
  likelyToSellOut: boolean;
  exclusive: boolean;
  bestPrice: boolean;
  specialOffer: boolean;
  // Synthetic — combo / multi-activity bundle (detected from title)
  isCombo: boolean;
  cancellationPolicy?: string;
  musementUrl: string;
  // Required fields per Musement Quality Check #3 (Display Activity Information)
  highlights?: string[];
  inclusions?: string[];
  exclusions?: string[];
  meetingPoint?: string;
  whereText?: string;
  info?: string;                  // "What to remember"
  maxConfirmationTime?: string;   // ISO-8601 duration, e.g. "PT30M"
  voucherType?: string;           // voucher_access_usage
  refundPolicies?: { period?: string; percentage?: number; applicableUntil?: string }[];
};

export type MusementSearchParams = {
  cityId?: number;
  cityName?: string;
  categoryId?: number;
  verticalId?: number;            // Filter by Musement vertical (1..7)
  comboOnly?: boolean;            // Synthetic — keep only multi-activity bundles
  pickupOnly?: boolean;           // feature_in=tours-and-activities-with-pickup
  priceMin?: number;              // default_price_range lower bound (in currency units)
  priceMax?: number;              // default_price_range upper bound (in currency units)
  limit?: number;
  offset?: number;
  currency?: string;
  language?: string;
  sortBy?: "relevance" | "rating" | "price";
};

export type MusementSearchResult = {
  products: MusementProduct[];
  totalCount: number;
  hasMore: boolean;
};

export type MusementAvailability = {
  date: string;
  available: boolean;
  slots: {
    id: string;
    time?: string;
    languages: string[];
    maxBuy: number;
    minBuy: number;
    netPrice: number;
    retailPrice: number;
  }[];
};

export type MusementBookingRequest = {
  activityUuid: string;
  dateId: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  language?: string;
};

export type MusementBooking = {
  orderId: string;
  status: "confirmed" | "pending" | "failed";
  tickets: {
    ticketId: string;
    barcode?: string;
    qrCode?: string;
    pdfUrl?: string;
    // Per-item lifecycle status from Musement: OK, PENDING, KO, REFUNDED,
    // CANCELLATION_ERROR. KO items are non-billable + already cancelled
    // by the supplier — never re-cancel them via DELETE.
    itemStatus?: string;
  }[];
  totalNetPrice: number;
  totalRetailPrice: number;
};

// ─── Dutch City ID Mapping ──────────────────────────────────────────────────
// Musement uses city UUIDs/IDs - these are for the Netherlands focus
// IDs will be resolved dynamically via the Cities API on first call

const NL_CITY_NAMES = [
  "amsterdam", "rotterdam", "utrecht", "the hague", "den haag",
  "eindhoven", "haarlem", "leiden", "groningen", "maastricht",
  "delft", "arnhem", "nijmegen", "leeuwarden", "breda",
  "tilburg", "apeldoorn", "deventer", "zwolle", "alkmaar",
  "dordrecht", "middelburg", "amersfoort", "gouda", "hoorn",
  "texel", "volendam", "giethoorn", "scheveningen",
  "'s-hertogenbosch", "den bosch",
];

// Cache for city lookups (cityName -> cityId)
const cityIdCache: Map<string, number> = new Map();

// ─── API Helpers ────────────────────────────────────────────────────────────

// Catalog endpoints (cities, categories, activities metadata, venues) are
// cacheable up to 7 days per Musement guidance. Date/availability endpoints
// must NEVER be cached — they live in the timeslots route and are left
// uncached deliberately.
const CATALOG_CACHE = {
  cache: "force-cache" as RequestCache,
  next: { revalidate: 604800, tags: ["musement-catalog"] },
};

// ─── OAuth token manager ──────────────────────────────────────────────────
// Musement's Partner API v3 authenticates merchant flows with two credentials:
//  1. `x-musement-application` header — present on every request, identifies
//     the partner application.
//  2. `Authorization: Bearer {accessToken}` — required for merchant-of-record
//     endpoints in production. Tokens are obtained via POST /login with
//     client_id/client_secret and expire after ~3600 seconds.
//
// In sandbox the application header alone authenticates every call we need,
// so the token manager is a no-op (returns null, callers omit the header).
// This scaffold is production-ready: the moment prod credentials arrive,
// setting MUSEMENT_CLIENT_ID + MUSEMENT_CLIENT_SECRET activates the Bearer
// flow with automatic refresh-before-expiry.

type TokenCache = { token: string; expiresAt: number } | null;
let tokenCache: TokenCache = null;
// Refresh 5 minutes before actual expiry to avoid races under load.
const TOKEN_EXPIRY_BUFFER_MS = 5 * 60 * 1000;

async function getAccessToken(): Promise<string | null> {
  if (!MUSEMENT_CLIENT_ID || !MUSEMENT_CLIENT_SECRET) return null;

  const now = Date.now();
  if (tokenCache && tokenCache.expiresAt - TOKEN_EXPIRY_BUFFER_MS > now) {
    return tokenCache.token;
  }

  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(MUSEMENT_APP_HEADER ? { "x-musement-application": MUSEMENT_APP_HEADER } : {}),
      },
      body: JSON.stringify({
        client_id: MUSEMENT_CLIENT_ID,
        client_secret: MUSEMENT_CLIENT_SECRET,
        grant_type: "client_credentials",
      }),
    });

    if (!res.ok) {
      console.error(`Musement /login failed: HTTP ${res.status}`);
      tokenCache = null;
      return null;
    }

    const data = (await res.json()) as {
      access_token?: string;
      expires_in?: number;
      token_type?: string;
    };

    if (!data.access_token) {
      console.error("Musement /login returned no access_token");
      tokenCache = null;
      return null;
    }

    const expiresInMs = (data.expires_in ?? 3600) * 1000;
    tokenCache = { token: data.access_token, expiresAt: Date.now() + expiresInMs };
    return data.access_token;
  } catch (err) {
    console.error("Musement /login threw:", err);
    tokenCache = null;
    return null;
  }
}

function getHeaders(language = "en") {
  // Musement Partner API v3 authenticates every request with the
  // `x-musement-application` header (partner identifier). Bearer-token auth
  // is only required for specific merchant-of-record endpoints; for reads
  // and standard merchant booking flows the header is sufficient. The
  // Bearer token is attached separately via getAuthHeaders() for the
  // endpoints that require it.
  return {
    "Accept": "application/json",
    "Accept-Language": language,
    "X-Musement-Version": "3.5.0",
    "X-Musement-Currency": "EUR",
    "X-Musement-Market": MUSEMENT_MARKET,
    ...(MUSEMENT_APP_HEADER ? { "x-musement-application": MUSEMENT_APP_HEADER } : {}),
    "Content-Type": "application/json",
  };
}

/**
 * Headers for endpoints that require authenticated (Bearer) access in
 * production. Silently falls back to the header-only shape when no OAuth
 * credentials are configured, preserving the sandbox behaviour.
 */
export async function getAuthHeaders(language = "en"): Promise<Record<string, string>> {
  const base = getHeaders(language);
  const token = await getAccessToken();
  return token ? { ...base, Authorization: `Bearer ${token}` } : base;
}

/**
 * Returns true if Musement credentials are configured and the lib will
 * attempt live API calls. Useful to gate mock/live behavior from callers.
 */
export function isMusementLive(): boolean {
  return Boolean(MUSEMENT_APP_HEADER && MUSEMENT_API_BASE);
}

/**
 * Health-check / debug helper — verifies connectivity and auth by fetching
 * the first city from the configured environment.
 */
export async function musementHealthCheck(): Promise<{
  ok: boolean;
  env: string;
  base: string;
  sampleCity?: string;
  error?: string;
}> {
  const env = MUSEMENT_API_BASE.includes("sandbox") ? "sandbox" : "production";
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/cities?limit=1`, {
      headers: getHeaders(),
      ...CATALOG_CACHE,
    });
    if (!res.ok) {
      return { ok: false, env, base: MUSEMENT_API_BASE, error: `HTTP ${res.status}` };
    }
    const data = (await res.json()) as Array<{ name?: string }>;
    return {
      ok: true,
      env,
      base: MUSEMENT_API_BASE,
      sampleCity: Array.isArray(data) ? data[0]?.name : undefined,
    };
  } catch (err) {
    return { ok: false, env, base: MUSEMENT_API_BASE, error: (err as Error).message };
  }
}

function formatPrice(amount: number | undefined, currency: string): string {
  if (!amount) return "";
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency }).format(amount);
}

function formatDuration(durationStr: string | undefined): string {
  if (!durationStr) return "";
  // Musement returns duration like "2 hours", "1 hour 30 minutes", "45 minutes"
  return durationStr;
}

// ─── City Resolution ────────────────────────────────────────────────────────

/**
 * Resolve a city name to a Musement city ID
 * Results are cached for performance
 */
export async function resolveCityId(cityName: string, language = "en"): Promise<number | null> {
  const key = cityName.toLowerCase().trim();

  // Check cache first
  if (cityIdCache.has(key)) {
    return cityIdCache.get(key)!;
  }

  try {
    // Musement assigns id=124 to Netherlands (NOT 82, that was a long-standing
    // bug — for example Rotterdam (id=356) lives on page 2 of NL cities by
    // weight, so a low limit also missed it). We fetch a generous slice of
    // each priority country so we can resolve the most-asked NL/EU cities
    // without paginating per request.
    const PRIORITY_COUNTRIES: Array<{ iso: string; id: number }> = [
      { iso: "NL", id: 124 },
      { iso: "BE", id: 17 },
      { iso: "DE", id: 64 },
      { iso: "FR", id: 60 },
      { iso: "IT", id: 82 },
      { iso: "ES", id: 161 },
      { iso: "GB", id: 183 },
    ];

    // Musement enforces a hard ceiling of 100 results per /cities call.
    // For each priority country we paginate up to MAX_PAGES so larger
    // catalogs (FR, IT, ES) are fully indexed.
    const PAGE_SIZE = 100;
    const MAX_PAGES = 5; // up to 500 cities per country, more than enough

    async function loadCountry(countryId: number) {
      for (let page = 0; page < MAX_PAGES; page++) {
        const res = await fetch(
          `${MUSEMENT_API_BASE}/cities?limit=${PAGE_SIZE}&offset=${page * PAGE_SIZE}&sort_by=weight&country_in=${countryId}`,
          { headers: getHeaders(language), ...CATALOG_CACHE }
        );
        if (!res.ok) return;
        const cities = (await res.json()) as Record<string, unknown>[];
        if (!Array.isArray(cities) || cities.length === 0) return;
        for (const city of cities) {
          const name = (city.name as string)?.toLowerCase();
          if (name && city.id) cityIdCache.set(name, city.id as number);
        }
        if (cities.length < PAGE_SIZE) return; // last page
      }
    }

    await Promise.all(PRIORITY_COUNTRIES.map((c) => loadCountry(c.id)));

    if (cityIdCache.has(key)) return cityIdCache.get(key)!;

    // Last-ditch global fallback (top 100 cities by weight worldwide) for
    // anything outside our priority markets. This stays at 100 (Musement's
    // hard cap) — for deeper coverage we'd rely on cityId from the UI.
    const fallbackRes = await fetch(
      `${MUSEMENT_API_BASE}/cities?limit=100&offset=0&sort_by=weight`,
      { headers: getHeaders(language), ...CATALOG_CACHE }
    );
    if (!fallbackRes.ok) return null;
    const cities = (await fallbackRes.json()) as Record<string, unknown>[];
    if (!Array.isArray(cities)) return null;
    for (const city of cities) {
      const name = (city.name as string)?.toLowerCase();
      if (name && city.id) cityIdCache.set(name, city.id as number);
    }
    return cityIdCache.get(key) || null;
  } catch (err) {
    console.error("Musement city resolution error:", err);
    return null;
  }
}

/**
 * Get all available Dutch cities from Musement
 */
export async function getDutchCities(language = "en"): Promise<{ id: number; name: string; uuid: string; count: number }[]> {
  try {
    // country_in=82 is Netherlands in Musement
    const res = await fetch(
      `${MUSEMENT_API_BASE}/cities?limit=50&offset=0&sort_by=weight&country_in=82`,
      { headers: getHeaders(language), ...CATALOG_CACHE }
    );

    if (!res.ok) return [];

    const cities = await res.json();
    return (cities as Record<string, unknown>[]).map((c) => ({
      id: c.id as number,
      name: c.name as string,
      uuid: c.uuid as string,
      count: (c.activities_count as number) || 0,
    }));
  } catch (err) {
    console.error("Musement Dutch cities error:", err);
    return [];
  }
}

// ─── Catalog Taxonomy (Countries / Cities by country / Verticals) ───────────
// Musement's own taxonomy is the source of truth for global discovery:
//  • /countries — used as top-level picker (~150 countries)
//  • /cities    — sandbox ignores country_in, so we fetch the global slice once
//                 and group client-side on `city.country.iso_code`. Production
//                 may honour the filter; we'll still cache the global list.
//  • /verticals — 7 language-neutral buckets (Museums & art, Tours & attractions,
//                 Food & wine, Active & adventure, Performances, Sports, Nightlife)
// All three are heavily cached (CATALOG_CACHE = 7d revalidation).

export type MusementCountry = {
  id: number;
  name: string;
  iso_code: string;
};

export type MusementCityLite = {
  id: number;
  name: string;
  countryIso: string;
  countryName: string;
  weight: number;
  activitiesCount: number;
  lat?: number;
  lng?: number;
  timezone?: string;
};

export type MusementVertical = {
  id: number;
  name: string;
};

let countriesCache: MusementCountry[] | null = null;
let citiesGlobalCache: MusementCityLite[] | null = null;
let verticalsCache: MusementVertical[] | null = null;

/** All Musement countries with iso_code, alphabetised. */
export async function getCountries(language = "en"): Promise<MusementCountry[]> {
  if (countriesCache) return countriesCache;
  const all: MusementCountry[] = [];
  const PAGE = 100;
  for (let offset = 0; offset < 500; offset += PAGE) {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/countries?limit=${PAGE}&offset=${offset}`,
      { headers: getHeaders(language), ...CATALOG_CACHE }
    );
    if (!res.ok) break;
    const page = (await res.json()) as MusementCountry[];
    if (!Array.isArray(page) || page.length === 0) break;
    all.push(...page);
    if (page.length < PAGE) break;
  }
  countriesCache = all
    .filter((c) => c?.iso_code)
    .sort((a, b) => a.name.localeCompare(b.name));
  return countriesCache;
}

/** Internal: paginate the global /cities list once and keep an in-memory copy. */
async function loadGlobalCities(language = "en"): Promise<MusementCityLite[]> {
  if (citiesGlobalCache) return citiesGlobalCache;
  const all: MusementCityLite[] = [];
  const PAGE = 100;
  // Cap at 3000 cities — Musement's full catalog is ~2.5k.
  for (let offset = 0; offset < 3000; offset += PAGE) {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/cities?limit=${PAGE}&offset=${offset}&sort_by=weight`,
      { headers: getHeaders(language), ...CATALOG_CACHE }
    );
    if (!res.ok) break;
    const page = (await res.json()) as Record<string, unknown>[];
    if (!Array.isArray(page) || page.length === 0) break;
    for (const c of page) {
      const country = c.country as Record<string, unknown> | undefined;
      const iso = country?.iso_code as string | undefined;
      if (!iso) continue;
      all.push({
        id: c.id as number,
        name: c.name as string,
        countryIso: iso,
        countryName: (country?.name as string) || "",
        weight: (c.weight as number) ?? 0,
        activitiesCount: (c.activities_count as number) ?? 0,
        lat: typeof c.latitude === "number" ? (c.latitude as number) : undefined,
        lng: typeof c.longitude === "number" ? (c.longitude as number) : undefined,
        timezone: typeof c.time_zone === "string" ? (c.time_zone as string) : undefined,
      });
    }
    if (page.length < PAGE) break;
  }
  citiesGlobalCache = all;
  return all;
}

/** Cities for a given ISO 2-letter country code, sorted by weight desc. */
export async function getCitiesByCountry(
  iso: string,
  language = "en"
): Promise<MusementCityLite[]> {
  const all = await loadGlobalCities(language);
  const target = iso.toUpperCase();
  return all
    .filter((c) => c.countryIso.toUpperCase() === target)
    .sort((a, b) => b.weight - a.weight || a.name.localeCompare(b.name));
}

/** Musement's 7 top-level verticals. Language-neutral by ID. */
export async function getVerticals(language = "en"): Promise<MusementVertical[]> {
  if (verticalsCache) return verticalsCache;
  const res = await fetch(`${MUSEMENT_API_BASE}/verticals?limit=50`, {
    headers: getHeaders(language),
    ...CATALOG_CACHE,
  });
  if (!res.ok) return [];
  const data = (await res.json()) as Array<{ id: number; name: string }>;
  if (!Array.isArray(data)) return [];
  verticalsCache = data.map((v) => ({ id: v.id, name: v.name }));
  return verticalsCache;
}

// ─── Product Search ─────────────────────────────────────────────────────────

/**
 * Search activities in a city
 */
export async function searchActivities(params: MusementSearchParams): Promise<MusementSearchResult> {
  let cityId = params.cityId;

  // Resolve city name to ID if needed
  if (!cityId && params.cityName) {
    cityId = await resolveCityId(params.cityName, params.language) ?? undefined;
    if (!cityId) {
      return { products: [], totalCount: 0, hasMore: false };
    }
  }

  if (!cityId) {
    return { products: [], totalCount: 0, hasMore: false };
  }

  const limit = Math.min(params.limit || 20, MAX_LIST_LIMIT);
  const offset = params.offset || 0;
  const currency = params.currency || "EUR";

  try {
    let url = `${MUSEMENT_API_BASE}/cities/${cityId}/activities?limit=${limit}&offset=${offset}`;

    // Sort defaults — per Musement Quality Checklist:
    //   sort_by=price   → HIGHEST price first
    //   sort_by=-price  → LOWEST price first
    //   sort_by=rating  → highest rating first (descending implicit)
    //   sort_by=-relevance → most relevant first (without minus = least relevant first)
    // Customer "Sort by price" UX expectation = cheapest first → -price.
    if (params.sortBy === "price") {
      url += "&sort_by=-price";
    } else if (params.sortBy === "rating") {
      url += "&sort_by=rating";
    } else {
      url += "&sort_by=-relevance";
    }

    if (params.verticalId) {
      url += `&vertical_in=${params.verticalId}`;
    }

    // Pickup-at-hotel filter — Musement's `tours-and-activities-with-pickup`
    // feature flag. Reseller-side surfaced as a checkbox; high-priority filter
    // for groups that want their hotel-pickup options pre-narrowed.
    if (params.pickupOnly) {
      url += `&feature_in=tours-and-activities-with-pickup`;
    }

    // Price range — Musement expects `default_price_range=min,max` as integer
    // currency units. Either bound may be omitted; we always send both with
    // a 0 floor / a generous ceiling when only one side is set so Musement
    // doesn't reject the param.
    if (typeof params.priceMin === "number" || typeof params.priceMax === "number") {
      const lo = Math.max(0, Math.round(params.priceMin ?? 0));
      const hi = Math.max(lo, Math.round(params.priceMax ?? 9999));
      url += `&default_price_range=${lo},${hi}`;
    }

    const res = await fetch(url, {
      headers: {
        ...getHeaders(params.language),
        "X-Musement-Currency": currency,
      },
      ...CATALOG_CACHE,
    });

    if (!res.ok) {
      console.error(`Musement API error: ${res.status} ${res.statusText}`);
      return { products: [], totalCount: 0, hasMore: false };
    }

    const data = await res.json();
    const activities = Array.isArray(data) ? data : (data.data || []);
    const totalCount = Array.isArray(data)
      ? activities.length + (activities.length === limit ? 1 : 0)
      : (data.meta?.count || activities.length);

    let products: MusementProduct[] = activities.map((a: Record<string, unknown>) =>
      mapActivityToProduct(a, params.cityName || "", currency)
    );

    // Sandbox ignores vertical_in AND under-tags activities (e.g. "Van Gogh
    // Museum ticket" carries only Tours & attractions, no Museums & art).
    // We post-filter using BOTH signals — the structured verticals array
    // (production-correct) OR a vertical-specific title heuristic (sandbox
    // fallback). Either signal matching keeps the activity.
    if (params.verticalId) {
      products = products.filter((p) =>
        p.verticals.some((v) => v.id === params.verticalId) ||
        matchesVerticalByTitle(p.title, params.verticalId!)
      );
    }

    // Synthetic "Combos" bucket — title-detected multi-activity bundles.
    if (params.comboOnly) {
      products = products.filter((p) => p.isCombo);
    }

    return {
      products,
      totalCount,
      hasMore: activities.length === limit,
    };
  } catch (err) {
    console.error("Musement search error:", err);
    return { products: [], totalCount: 0, hasMore: false };
  }
}

/**
 * Search activities by category in a city
 */
export async function searchActivitiesByCategory(
  cityId: number,
  categoryId: number,
  params: Omit<MusementSearchParams, "cityId" | "categoryId">
): Promise<MusementSearchResult> {
  const limit = Math.min(params.limit || 20, MAX_LIST_LIMIT);
  const offset = params.offset || 0;

  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/categories/${categoryId}/activities?limit=${limit}&offset=${offset}&city_in=${cityId}`,
      {
        headers: {
          ...getHeaders(params.language),
          "X-Musement-Currency": params.currency || "EUR",
        },
      }
    );

    if (!res.ok) return { products: [], totalCount: 0, hasMore: false };

    const data = await res.json();
    const activities = Array.isArray(data) ? data : (data.data || []);

    const products: MusementProduct[] = activities.map((a: Record<string, unknown>) =>
      mapActivityToProduct(a, "", params.currency || "EUR")
    );

    return {
      products,
      totalCount: activities.length,
      hasMore: activities.length === limit,
    };
  } catch (err) {
    console.error("Musement category search error:", err);
    return { products: [], totalCount: 0, hasMore: false };
  }
}

// ─── Product Detail ─────────────────────────────────────────────────────────

/**
 * Get detailed activity information
 */
export type GetActivityResult =
  | { ok: true; product: MusementProduct }
  | { ok: false; code: "unavailable" | "not_found" | "api_error"; status: number; detail?: string };

/**
 * Detailed activity fetch — distinguishes "permanently gone" from
 * "temporarily unavailable" so callers can render the right UX.
 *
 * Per Musement docs, activities can flap from ONLINE back to
 * DRAFT/REVIEW/UNAVAILABLE/ARCHIVED. The API returns 403 for activities
 * that exist but aren't currently bookable (DRAFT/REVIEW/UNAVAILABLE)
 * and 404 for actually missing ones — we surface both cases distinctly.
 */
export async function getActivityResult(
  uuid: string,
  language = "en",
  currency = "EUR"
): Promise<GetActivityResult> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/activities/${uuid}`, {
      headers: {
        ...getHeaders(language),
        "X-Musement-Currency": currency,
      },
      ...CATALOG_CACHE,
    });

    if (res.ok) {
      const a = await res.json();
      return { ok: true, product: mapActivityToProduct(a, "", currency) };
    }

    if (res.status === 403) {
      console.warn(`[musement] activity ${uuid} returned 403 — likely flapped to DRAFT/REVIEW`);
      return { ok: false, code: "unavailable", status: 403 };
    }
    if (res.status === 404) {
      return { ok: false, code: "not_found", status: 404 };
    }
    const detail = (await res.text()).slice(0, 300);
    return { ok: false, code: "api_error", status: res.status, detail };
  } catch (err) {
    console.error("Musement activity detail error:", err);
    return {
      ok: false,
      code: "api_error",
      status: 0,
      detail: err instanceof Error ? err.message : "unknown",
    };
  }
}

/**
 * Backward-compatible wrapper — returns the product or null. New
 * callers should use getActivityResult to differentiate 403/404/5xx.
 */
export async function getActivity(uuid: string, language = "en", currency = "EUR"): Promise<MusementProduct | null> {
  const r = await getActivityResult(uuid, language, currency);
  return r.ok ? r.product : null;
}

// ─── Availability ───────────────────────────────────────────────────────────

/**
 * Get available dates for an activity
 */
export async function getAvailability(
  uuid: string,
  dateFrom: string,
  dateTo: string,
  language = "en",
  currency = "EUR"
): Promise<MusementAvailability[]> {
  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/activities/${uuid}/dates?date_from=${dateFrom}&date_to=${dateTo}`,
      {
        headers: {
          ...getHeaders(language),
          "X-Musement-Currency": currency,
        },
      }
    );

    if (!res.ok) return [];

    const dates = await res.json();
    return (dates as Record<string, unknown>[]).map((d) => ({
      date: d.date as string,
      available: (d.availability as number) > 0,
      slots: ((d.slots || []) as Record<string, unknown>[]).map((s) => ({
        id: (s.id as string) || "",
        time: s.time as string,
        languages: (s.languages || []) as string[],
        maxBuy: (s.max_buy as number) || 10,
        minBuy: (s.min_buy as number) || 1,
        netPrice: (s.net_price as number) || 0,
        retailPrice: (s.retail_price as number) || 0,
      })),
    }));
  } catch (err) {
    console.error("Musement availability error:", err);
    return [];
  }
}

/**
 * Resolve a bookable `product_identifier` for an activity on (or near) a
 * given travel date. Required when we have `musement_activity_uuid` but
 * never picked a specific slot (e.g. pending bookings created from the
 * Experiences "Book Direct" flow).
 *
 * Strategy:
 *   1. Fetch the date range [targetDate, targetDate + toleranceDays]
 *   2. If toleranceDays=0 and no hit, widen to +14 (sandbox test data has gaps)
 *   3. For the first non-sold-out day, fetch the detail endpoint to get
 *      groups[].slots[].products[].product_id (first adult-priced product)
 *
 * Returns { date, productId, priceEur } or null if nothing is bookable.
 */
export async function resolveProductIdentifier(
  activityUuid: string,
  targetDate: string,
  toleranceDays = 14,
  language = "en"
): Promise<{ date: string; productId: string; priceEur: number } | null> {
  try {
    const from = targetDate;
    const to = toleranceDays > 0
      ? new Date(new Date(targetDate).getTime() + toleranceDays * 86400_000)
          .toISOString()
          .slice(0, 10)
      : targetDate;

    const datesRes = await fetch(
      `${MUSEMENT_API_BASE}/activities/${activityUuid}/dates?date_from=${from}&date_to=${to}`,
      { headers: getHeaders(language) }
    );
    if (!datesRes.ok) {
      console.error(`Musement resolveProductIdentifier dates HTTP ${datesRes.status}`);
      return null;
    }
    const dates = (await datesRes.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(dates) || dates.length === 0) return null;

    // Pick first non-sold-out day
    const firstOpen = dates.find((d) => !d.sold_out) ?? dates[0];
    const day = firstOpen.day as string;

    const detailRes = await fetch(
      `${MUSEMENT_API_BASE}/activities/${activityUuid}/dates/${day}`,
      { headers: getHeaders(language) }
    );
    if (!detailRes.ok) return null;

    const detail = (await detailRes.json()) as Array<Record<string, unknown>>;
    // Navigate: [0].groups[0].slots[0].products[0]
    const group = (detail[0]?.groups as Array<Record<string, unknown>>)?.[0];
    const slot = (group?.slots as Array<Record<string, unknown>>)?.[0];
    const product = (slot?.products as Array<Record<string, unknown>>)?.[0];
    if (!product?.product_id) return null;

    const priceEur =
      (product.retail_price as Record<string, unknown>)?.value as number || 0;

    return {
      date: day,
      productId: String(product.product_id),
      priceEur,
    };
  } catch (err) {
    console.error("Musement resolveProductIdentifier error:", err);
    return null;
  }
}

// ─── Cart & Booking (Merchant of Record) ────────────────────────────────────

/**
 * Create a cart for booking
 */
export async function createCart(
  language = "en",
  cid?: string
): Promise<string | null> {
  try {
    const res = await fetch(withCid(`${MUSEMENT_API_BASE}/carts`, cid), {
      method: "POST",
      headers: await getAuthHeaders(language),
      body: JSON.stringify({}),
    });

    if (!res.ok) return null;

    const cart = await res.json();
    return cart.uuid as string;
  } catch (err) {
    console.error("Musement create cart error:", err);
    return null;
  }
}

/**
 * Add an item to the cart.
 *
 * Per Musement Partner API v3 docs:
 * - Body is an **array of items** (not a single object)
 * - Each item has `type`, `product_identifier`, `quantity`, optional `language`, optional `pickup`
 * - `product_identifier` comes from GET /activities/{uuid}/dates/{date} → products[].product_id
 *
 * @param productIdentifier numeric string id from the date-detail endpoint (e.g. "4445382728")
 */
export async function addToCart(
  cartUuid: string,
  productIdentifier: string,
  quantity: number,
  language = "en",
  opts?: { pickup?: string }
): Promise<boolean> {
  try {
    const item: Record<string, unknown> = {
      type: "musement",
      product_identifier: productIdentifier,
      quantity,
      language,
    };
    if (opts?.pickup) item.pickup = opts.pickup;

    const res = await fetch(`${MUSEMENT_API_BASE}/carts/${cartUuid}/items`, {
      method: "POST",
      headers: await getAuthHeaders(language),
      body: JSON.stringify([item]),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Musement addToCart HTTP ${res.status}:`, body.slice(0, 400));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Musement add to cart error:", err);
    return false;
  }
}

/**
 * Get the list of cart items (with their uuids). Needed to address the
 * right cart item when submitting participant info via
 * PUT /carts/{cartUuid}/items/{cartItemUuid}/participants.
 */
export async function getCartItems(
  cartUuid: string,
  language = "en"
): Promise<Array<{ uuid: string; quantity: number; activityUuid?: string }>> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/carts/${cartUuid}`, {
      headers: await getAuthHeaders(language),
    });
    if (!res.ok) return [];
    const cart = (await res.json()) as Record<string, unknown>;
    const items = (cart.items || []) as Array<Record<string, unknown>>;
    return items.map((i) => ({
      uuid: (i.uuid as string) || "",
      quantity: (i.quantity as number) || 0,
      activityUuid:
        ((i.product as Record<string, unknown>)?.activity as Record<string, unknown>)?.uuid as
          | string
          | undefined,
    }));
  } catch (err) {
    console.error("Musement getCartItems error:", err);
    return [];
  }
}

/**
 * Preview the extra_customer_data + participant-info requirements for an
 * activity WITHOUT having to create a cart first. Per Musement: this is a
 * convenience endpoint for UI-preview purposes; the authoritative check
 * remains the cart-scoped schema at confirm time.
 *
 * Returns flattened required-field arrays so a dynamic form can render
 * straight off of the result.
 */
export type MusementActivityRequirements = {
  extraCustomerData: Array<{
    fieldName: string;
    title: string;
    type: string;
    required: boolean;
    enum?: string[];
    enumTitles?: string[];
  }>;
  participantsRequired: boolean;
  participantFields: Array<{
    fieldName: string;
    title: string;
    type: string;
    required: boolean;
  }>;
};

function flattenSchemaProperties(
  schema: Record<string, unknown> | null | undefined
): MusementActivityRequirements["extraCustomerData"] {
  if (!schema) return [];
  const props = (schema.properties as Record<string, unknown>) || {};
  const required = new Set<string>((schema.required as string[]) || []);
  const out: MusementActivityRequirements["extraCustomerData"] = [];
  for (const [fieldName, fieldSchema] of Object.entries(props)) {
    const f = fieldSchema as Record<string, unknown>;
    out.push({
      fieldName,
      title: (f.title as string) || fieldName,
      type: (f.type as string) || "string",
      required: required.has(fieldName),
      enum: f.enum as string[] | undefined,
      enumTitles: f.enum_titles as string[] | undefined,
    });
  }
  // Stable display order: preserve propertyOrder when present, else alpha.
  return out.sort((a, b) => a.fieldName.localeCompare(b.fieldName));
}

export async function getActivityRequirements(
  activityUuid: string,
  language = "en"
): Promise<MusementActivityRequirements> {
  const [ecdRes, participantsRes] = await Promise.all([
    fetch(
      `${MUSEMENT_API_BASE}/activities/${activityUuid}/extra-customer-data/schema`,
      { headers: await getAuthHeaders(language) }
    ).catch(() => null),
    fetch(
      `${MUSEMENT_API_BASE}/activities/${activityUuid}/participants-info/schema`,
      { headers: await getAuthHeaders(language) }
    ).catch(() => null),
  ]);

  let ecdSchema: Record<string, unknown> | null = null;
  if (ecdRes?.ok) {
    ecdSchema = (await ecdRes.json().catch(() => null)) as Record<string, unknown> | null;
  }

  let participantsSchema: Record<string, unknown> | null = null;
  if (participantsRes?.ok) {
    participantsSchema = (await participantsRes.json().catch(() => null)) as Record<string, unknown> | null;
  }

  const extraCustomerData = flattenSchemaProperties(ecdSchema);
  const participantFields = flattenSchemaProperties(participantsSchema);

  return {
    extraCustomerData,
    participantsRequired: participantFields.some((f) => f.required),
    participantFields,
  };
}

/**
 * Fetch the activity-specific customer schema for the items in this cart.
 *
 * Per Musement Quality Check #8 (Booking questions), partners must collect
 * any mandatory `extra_customer_data` fields and per-participant information
 * listed in the schema before confirming the order. The schema is cart-scoped
 * because it unions the requirements of every item in the cart.
 *
 * Returns the raw JSON schema on success. Callers can inspect
 * `schema.properties.extra_customer_data` (per activity uuid) and any
 * participant-info requirements to decide whether to render a form.
 */
export type MusementCustomerSchema = {
  raw: Record<string, unknown>;
  requiredExtraFields: Array<{ activityUuid: string; fieldName: string; title?: string; type?: string }>;
  participantsRequired: boolean;
};

export async function getCustomerSchema(
  cartUuid: string,
  language = "en"
): Promise<MusementCustomerSchema | null> {
  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/carts/${cartUuid}/customer/schema`,
      { headers: await getAuthHeaders(language) }
    );
    if (!res.ok) return null;
    const schema = (await res.json()) as Record<string, unknown>;

    // Flatten extra_customer_data required fields (per-activity).
    const requiredExtraFields: MusementCustomerSchema["requiredExtraFields"] = [];
    const props = (schema.properties as Record<string, unknown>) || {};
    const ecd = (props.extra_customer_data as Record<string, unknown>) || {};
    const ecdProps = (ecd.properties as Record<string, unknown>) || {};
    for (const [activityUuid, activitySchema] of Object.entries(ecdProps)) {
      const a = activitySchema as Record<string, unknown>;
      const required = (a.required as string[]) || [];
      const aProps = (a.properties as Record<string, unknown>) || {};
      for (const fieldName of required) {
        const f = (aProps[fieldName] as Record<string, unknown>) || {};
        requiredExtraFields.push({
          activityUuid,
          fieldName,
          title: (f.title as string) || fieldName,
          type: (f.type as string) || "string",
        });
      }
    }

    // Detect participant info requirement. Musement signals this via a
    // `participants` property on the cart-item schema; presence implies
    // that participant details are required before order confirmation.
    const participantsRequired = Boolean(
      (schema.properties as Record<string, unknown>)?.participants
    );

    return { raw: schema, requiredExtraFields, participantsRequired };
  } catch (err) {
    console.error("Musement customer schema error:", err);
    return null;
  }
}

// Musement sandbox requires lead-booker fields to be literally TEST / TEST /
// test@test.com — using real customer data in sandbox is a documented violation
// and can get a partner's sandbox access revoked. Prod uses real values.
const IS_SANDBOX = MUSEMENT_API_BASE.includes("sandbox");
// Per Musement docs, the lead-booker payload requires these 4 GDPR
// consent flags. Sandbox accepts requests without them; production
// rejects with a 400. We default all 4 to "NO" — TicketMatch is B2B,
// no marketing comms from Musement to the lead booker via Musement.
const REQUIRED_LEAD_CONSENTS = {
  musement_newsletter: "NO",
  allow_profiling: "NO",
  thirdparty_newsletter: "NO",
  events_related_newsletter: "NO",
} as const;

const SANDBOX_LEAD_BOOKER = {
  firstname: "TEST",
  lastname: "TEST",
  email: "test@test.com",
} as const;

/**
 * Set customer info on cart.
 *
 * Optionally carries `extra_customer_data` payloads (per activity uuid) for
 * activity-specific booking questions, per Musement Quality Check #8. The
 * shape of `extraCustomerData` must match the schema returned by
 * `getCustomerSchema()`.
 */
export async function setCartCustomer(
  cartUuid: string,
  customer: { firstName: string; lastName: string; email: string; phone?: string },
  language = "en",
  extraCustomerData?: Record<string, Record<string, unknown>>
): Promise<boolean> {
  try {
    const leadBooker = IS_SANDBOX
      ? {
          ...SANDBOX_LEAD_BOOKER,
          ...REQUIRED_LEAD_CONSENTS,
          ...(customer.phone ? { phone_number: customer.phone } : {}),
        }
      : {
          firstname: customer.firstName,
          lastname: customer.lastName,
          email: customer.email,
          ...REQUIRED_LEAD_CONSENTS,
          ...(customer.phone ? { phone_number: customer.phone } : {}),
        };

    const body: Record<string, unknown> = { ...leadBooker };
    if (extraCustomerData && Object.keys(extraCustomerData).length > 0) {
      body.extra_customer_data = extraCustomerData;
    }

    const res = await fetch(`${MUSEMENT_API_BASE}/carts/${cartUuid}/customer`, {
      method: "PUT",
      headers: await getAuthHeaders(language),
      body: JSON.stringify(body),
    });

    return res.ok;
  } catch (err) {
    console.error("Musement set customer error:", err);
    return false;
  }
}

/**
 * Submit per-participant info (firstname, lastname, date_of_birth, etc) for
 * a specific cart item. Per Musement Quality Check #8 the participant count
 * MUST exactly match the cart-item quantity. Call this once per cart item
 * that requires participant info.
 */
export type MusementParticipant = {
  salutation?: "Mr" | "Mrs" | "Ms";
  firstname: string;
  lastname: string;
  date_of_birth?: string; // YYYY-MM-DD
  email?: string;
  nationality?: string;
  passport?: string;
  passport_expiry_date?: string;
  phone_number?: string;
  medical_notes?: string;
  weight?: number;
  address?: string;
  fan_card?: string;
};

export async function setParticipants(
  cartUuid: string,
  cartItemUuid: string,
  participants: MusementParticipant[],
  language = "en"
): Promise<boolean> {
  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/carts/${cartUuid}/items/${cartItemUuid}/participants`,
      {
        method: "PUT",
        headers: await getAuthHeaders(language),
        body: JSON.stringify(participants),
      }
    );
    return res.ok;
  } catch (err) {
    console.error("Musement set participants error:", err);
    return false;
  }
}

/**
 * Confirm the order — creates an order from a cart.
 *
 * Per Musement Partner API v3 docs: `POST /orders` (not `/carts/{id}/order`).
 * Body must include `cart_uuid`. Email notification is disabled via
 * "NONE" because sandbox doesn't send emails and in production we
 * send our own TicketMatch branded emails via Resend.
 *
 * Returns the normalized booking with the Musement identifier,
 * status, and ticket data per item.
 */
export async function confirmOrder(
  cartUuid: string,
  language = "en",
  cid?: string
): Promise<MusementBooking | null> {
  try {
    const res = await fetch(withCid(`${MUSEMENT_API_BASE}/orders`, cid), {
      method: "POST",
      headers: await getAuthHeaders(language),
      body: JSON.stringify({
        cart_uuid: cartUuid,
        email_notification: "NONE",
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`Musement confirmOrder HTTP ${res.status}:`, body.slice(0, 400));
      return null;
    }

    const order = await res.json();
    return {
      orderId:
        (order.identifier as string) ||
        (order.uuid as string) ||
        (order.id as string),
      status: mapOrderStatus(order.status as string),
      tickets: ((order.items || []) as Record<string, unknown>[]).map((item) => {
        const product = (item.product || {}) as Record<string, unknown>;
        return {
          ticketId:
            (item.uuid as string) ||
            (item.transaction_code as string) ||
            "",
          barcode: (item.barcode as string) || (product.barcode as string),
          qrCode: (item.qr_code as string),
          pdfUrl: (item.voucher_url as string) || (item.voucher_pdf_url as string),
        };
      }),
      totalNetPrice: (order.total_net_price as number) || 0,
      totalRetailPrice: (order.total_retail_price as number) || 0,
    };
  } catch (err) {
    console.error("Musement confirm order error:", err);
    return null;
  }
}

/**
 * Finalise the order via the Musement no-payment flow.
 *
 * Per Musement Partner API v3 docs ("Make a payment" → "No-payment flow"):
 *   POST /payments/no/payment  with `{ uuid: orderUuid }`
 * Required for Merchant-of-Record partners (we collect payment via Stripe,
 * then tell Musement the order is paid). Without this call the order stays
 * `is_paid: false` and vouchers are NEVER generated, even on instant-confirm
 * activities. This is THE step that was missing previously.
 *
 * Note: Musement requires special authorization on the partner account to
 * use the no-payment flow in production. Sandbox accepts it without prior
 * authorization. Confirmed against sandbox order MUS1334525 (2026-04-27).
 *
 * Pass the order UUID (not the human identifier like "MUS1334525").
 */
export async function markOrderPaid(
  orderUuid: string,
  language = "en"
): Promise<boolean> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/payments/no/payment`, {
      method: "POST",
      headers: await getAuthHeaders(language),
      body: JSON.stringify({ uuid: orderUuid }),
    });
    if (!res.ok) {
      const body = await res.text();
      console.error(`Musement no-payment HTTP ${res.status}:`, body.slice(0, 400));
      return false;
    }
    return true;
  } catch (err) {
    console.error("Musement markOrderPaid error:", err);
    return false;
  }
}

// ─── Reviews ────────────────────────────────────────────────────────────────

export type MusementReview = {
  id?: string;
  rating: number;            // 1-5 normalized
  title?: string;
  body?: string;
  author?: string;
  language?: string;
  date?: string;             // ISO 8601
};

/**
 * Fetch customer reviews for an activity. Most Musement responses return
 * an array of review objects; some endpoints wrap in `{ data: [...] }`.
 * We normalize both shapes and map to a TicketMatch-internal type so the
 * UI doesn't depend on Musement's wire format.
 *
 * Reviews are public — no Bearer token needed, just the standard headers.
 */
export async function getActivityReviews(
  uuid: string,
  options: { limit?: number; offset?: number; language?: string } = {}
): Promise<MusementReview[]> {
  const limit = Math.min(options.limit ?? 10, MAX_LIST_LIMIT);
  const offset = options.offset ?? 0;
  const language = options.language ?? "en";

  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/activities/${uuid}/reviews?limit=${limit}&offset=${offset}`,
      { headers: getHeaders(language), ...CATALOG_CACHE }
    );
    if (!res.ok) {
      // 404 = no reviews yet, that's normal — return empty.
      if (res.status === 404) return [];
      console.error(`Musement reviews HTTP ${res.status} for ${uuid}`);
      return [];
    }
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.data || [];

    return items.map((r: Record<string, unknown>): MusementReview => ({
      id: (r.id as string) || (r.uuid as string),
      rating:
        (r.rating as number) ??
        (r.score as number) ??
        (r.stars as number) ??
        0,
      title: r.title as string | undefined,
      body: (r.body as string) || (r.text as string) || (r.comment as string),
      author:
        (r.author as string) ||
        ((r.user as Record<string, unknown> | undefined)?.name as string),
      language: (r.language as string) || (r.locale as string),
      date: (r.created_at as string) || (r.date as string) || (r.published_at as string),
    }));
  } catch (err) {
    console.error("Musement reviews error:", err);
    return [];
  }
}

/**
 * Fetch activity-update events since the given date. Per Musement docs
 * this is the only sync mechanism — there are no push notifications for
 * catalog changes. Run daily and invalidate cached activity details for
 * any UUID returned.
 *
 * `date` must be an ISO date (YYYY-MM-DD).
 */
export async function getCatalogUpdates(
  date: string,
  language = "en"
): Promise<{ uuid: string; updated_at?: string; status?: string }[]> {
  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/catalog/updates/${date}`,
      { headers: getHeaders(language) }
    );
    if (!res.ok) {
      console.error(`Musement catalog/updates HTTP ${res.status}`);
      return [];
    }
    const data = await res.json();
    const items = Array.isArray(data) ? data : data.data || [];
    return items.map((it: Record<string, unknown>) => ({
      uuid: (it.uuid as string) || (it.activity_uuid as string) || "",
      updated_at: it.updated_at as string | undefined,
      status: it.status as string | undefined,
    })).filter((it: { uuid: string }) => it.uuid);
  } catch (err) {
    console.error("Musement catalog updates error:", err);
    return [];
  }
}

// Re-export the pure duration formatter from lib/duration so server
// callers can keep importing from `@/lib/musement` even though the
// implementation lives in a client-safe file.
export { formatIso8601Duration } from "./duration";

/**
 * Poll the order endpoint until vouchers/QR codes appear, or until we
 * hit the timeout. Used as a fallback for PENDING → OK transitions when
 * the webhook either hasn't fired yet or isn't configured (sandbox).
 *
 * Returns the final booking (with tickets) on success, or null on timeout.
 */
export async function waitForVouchers(
  orderId: string,
  options: { intervalMs?: number; timeoutMs?: number; language?: string } = {}
): Promise<MusementBooking | null> {
  const interval = options.intervalMs ?? 30_000; // 30s default
  const timeout = options.timeoutMs ?? 300_000;  // 5 min default
  const language = options.language ?? "en";
  const deadline = Date.now() + timeout;

  while (Date.now() < deadline) {
    const order = await getOrder(orderId, language);
    if (order && order.tickets.length > 0) {
      const ready = order.tickets.every(
        (t) => Boolean(t.qrCode || t.barcode || t.pdfUrl)
      );
      if (ready) return order;
    }
    await new Promise((r) => setTimeout(r, interval));
  }
  return null;
}

/**
 * Get order details (including vouchers/E-tickets).
 *
 * Vouchers live in `items[].vouchers[]` (array of { url, ... }) — they
 * appear after `markOrderPaid` succeeds AND Musement has generated them.
 * For instant-confirmation activities this is near-immediate; for "needs
 * confirmation" types it may take minutes-to-hours, so callers should poll
 * or rely on Musement webhooks.
 */
export async function getOrder(orderId: string, language = "en"): Promise<MusementBooking | null> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/orders/${orderId}`, {
      headers: await getAuthHeaders(language),
    });

    if (!res.ok) return null;

    const order = await res.json();
    return {
      orderId: (order.uuid as string) || (order.id as string),
      status: mapOrderStatus(order.status as string),
      tickets: ((order.items || []) as Record<string, unknown>[]).map((item) => {
        const vouchers = (item.vouchers as Array<Record<string, unknown>>) || [];
        const firstVoucher = vouchers[0] || {};
        return {
          ticketId:
            (item.code as string) ||
            (item.uuid as string) ||
            (item.transaction_code as string) ||
            "",
          barcode: (item.barcode as string) || (firstVoucher.barcode as string),
          qrCode: (item.qr_code as string) || (firstVoucher.qr_code as string),
          pdfUrl:
            (firstVoucher.url as string) ||
            (item.voucher_url as string) ||
            (item.voucher_pdf_url as string),
          itemStatus: (item.status as string) || undefined,
        };
      }),
      totalNetPrice: order.total_net_price as number || 0,
      totalRetailPrice: order.total_retail_price as number || 0,
    };
  } catch (err) {
    console.error("Musement get order error:", err);
    return null;
  }
}

// ─── Cancellation ───────────────────────────────────────────────────────────

/**
 * Cancel an order item
 */
export type MusementRefundPolicy = {
  applicableUntil?: string;
  remainingTime?: string;
  refundPercentage?: number;
};

export type MusementCancellationResult =
  | { ok: true; refunded: boolean; policy?: MusementRefundPolicy }
  | { ok: false; reason: "NO_REFUND_POLICIES" | "REFUND_WINDOW_CLOSED" | "API_ERROR"; detail?: string };

/**
 * Fetch refund eligibility for a specific order item.
 * Per Musement Quality Check #10, this MUST be called before attempting
 * cancellation — partners should not blind-fire DELETE on items with no
 * refund policies (charge always stands) or outside the applicable window.
 */
export async function getRefundEligibility(
  orderId: string,
  itemId: string,
  language = "en"
): Promise<MusementCancellationResult> {
  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/orders/${orderId}/items/${itemId}/refund-policies`,
      { headers: await getAuthHeaders(language) }
    );

    if (!res.ok) {
      // Activities without a refund policy return 404 here — this is Musement's
      // signal that the item is non-refundable and cannot be cancelled.
      if (res.status === 404) {
        return { ok: false, reason: "NO_REFUND_POLICIES" };
      }
      const detail = (await res.text()).slice(0, 300);
      return { ok: false, reason: "API_ERROR", detail };
    }

    const policies = (await res.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(policies) || policies.length === 0) {
      return { ok: false, reason: "NO_REFUND_POLICIES" };
    }

    // Pick the most favorable policy whose applicable_until is still in the future.
    const now = Date.now();
    const eligible = policies
      .map((p) => ({
        applicableUntil: p.applicable_until as string | undefined,
        remainingTime: p.remaining_time as string | undefined,
        refundPercentage:
          (p.refund_percentage as number) ?? (p.percentage as number) ?? undefined,
      }))
      .filter((p) =>
        p.applicableUntil ? new Date(p.applicableUntil).getTime() > now : true
      )
      .sort((a, b) => (b.refundPercentage ?? 0) - (a.refundPercentage ?? 0))[0];

    if (!eligible) {
      return { ok: false, reason: "REFUND_WINDOW_CLOSED" };
    }

    return { ok: true, refunded: (eligible.refundPercentage ?? 0) > 0, policy: eligible };
  } catch (err) {
    console.error("Musement refund-eligibility error:", err);
    return { ok: false, reason: "API_ERROR", detail: (err as Error).message };
  }
}

export async function cancelOrderItem(
  orderId: string,
  itemId: string,
  reason?: string,
  language = "en"
): Promise<MusementCancellationResult> {
  // Gate 1 — refund eligibility per Musement Quality Check #10.
  const eligibility = await getRefundEligibility(orderId, itemId, language);
  if (!eligibility.ok) return eligibility;

  // Gate 2 — actual cancellation. Per docs this is a DELETE on the item with a
  // mandatory cancellation_reason taken from the enumerated list.
  try {
    const res = await fetch(
      `${MUSEMENT_API_BASE}/orders/${orderId}/items/${itemId}`,
      {
        method: "DELETE",
        headers: await getAuthHeaders(language),
        body: JSON.stringify({
          cancellation_reason: reason || "CANCELLED-BY-CUSTOMER",
        }),
      }
    );

    if (!res.ok) {
      const detail = (await res.text()).slice(0, 300);
      return { ok: false, reason: "API_ERROR", detail };
    }
    return { ok: true, refunded: eligibility.refunded, policy: eligibility.policy };
  } catch (err) {
    console.error("Musement cancel error:", err);
    return { ok: false, reason: "API_ERROR", detail: (err as Error).message };
  }
}

// ─── Categories ─────────────────────────────────────────────────────────────

/**
 * Get all Musement categories
 */
export async function getCategories(language = "en"): Promise<{ id: number; name: string; slug: string }[]> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/categories`, {
      headers: getHeaders(language),
      ...CATALOG_CACHE,
    });

    if (!res.ok) return [];

    const categories = await res.json();
    return (categories as Record<string, unknown>[]).map((c) => ({
      id: c.id as number,
      name: c.name as string,
      slug: (c.slug as string) || "",
    }));
  } catch (err) {
    console.error("Musement categories error:", err);
    return [];
  }
}

// ─── Internal Helpers ───────────────────────────────────────────────────────

/**
 * Detect a multi-activity combo from the activity title. Musement does not
 * expose a "combo" flag in the catalog, but bundle products are reliably
 * recognisable from titles like "X and Y entrance", "X + Y combo ticket",
 * "Heineken Experience and canal cruise". Curated test on 50 Amsterdam
 * activities matched 17 combos correctly with no false positives.
 */
/**
 * Sandbox under-tags activity verticals (and ignores the vertical_in filter).
 * This title-keyword heuristic gives a usable fallback so the verticals chip
 * row produces visibly different result sets even on sandbox data. In
 * production, well-tagged activities will already match via the structured
 * `verticals` field — this fallback is purely additive.
 *
 * Vertical IDs follow Musement's /verticals taxonomy:
 *   1 Museums & art · 2 Tours & attractions · 3 Food & wine
 *   4 Performances  · 5 Sports               · 6 Active & adventure
 *   7 Nightlife
 */
function matchesVerticalByTitle(title: string, verticalId: number): boolean {
  if (!title) return false;
  const t = title.toLowerCase();
  switch (verticalId) {
    case 1: // Museums & art
      return /\bmuseum|gallery|exhibition|art|rijks|van gogh|stedelijk|hermitage|louvre|prado|uffizi|moma\b/.test(t);
    case 2: // Tours & attractions
      return /\btour|attraction|sightseeing|stadium|hop[\s-]?on|landmark|cruise|excursion|day[\s-]?trip\b/.test(t);
    case 3: // Food & wine
      return /\bfood|wine|tasting|dinner|lunch|cocktail|brewery|brewing|cooking|cuisine|chef|tapas|coffee|chocolate|cheese\b/.test(t);
    case 4: // Performances
      return /\bshow|concert|theater|theatre|performance|musical|ballet|opera|circus|comedy\b/.test(t);
    case 5: // Sports
      return /\bsport|football|soccer|formula|f1|motogp|race|stadium tour|match|game day\b/.test(t);
    case 6: // Active & adventure
      return /\bhik|bik|cycl|kayak|surf|ski|snorkel|adventure|outdoor|climb|paragliding|diving|safari|trail\b/.test(t);
    case 7: // Nightlife
      return /\bnightlife|club|bar crawl|pub crawl|cocktail|nightclub|disco|after[\s-]?dark\b/.test(t);
    default:
      return false;
  }
}

function detectCombo(title: string): boolean {
  if (!title) return false;
  const t = title.toLowerCase();
  if (/\bcombo\b|\bbundle\b|\bpackage\b|\b2-?in-?1\b|\b3-?in-?1\b/.test(t)) return true;
  if (/\bticket and\b|\b and ticket\b|\b& ticket\b/.test(t)) return true;
  if (/\bcruise (and|with|\+)\b|\b(and|\+) (canal )?cruise\b/.test(t)) return true;
  if (/\b(museum|tour|entrance) (and|\+|with) (museum|tour|entrance|cruise|dinner|lunch)\b/.test(t)) return true;
  return false;
}

function mapActivityToProduct(a: Record<string, unknown>, cityName: string, currency: string): MusementProduct {
  const apiNetPrice = (a.net_price as number) || 0;
  // Per Musement Quality Checklist (activity-info), "Starting price" must
  // use retail_price_without_service_fee — that's the base price without
  // the booking fee. retail_price (which includes the fee) is reserved
  // for the final cart total. Prefer the without-service-fee field;
  // fall back gracefully when the API doesn't return it.
  const retailPrice = (a.retail_price_without_service_fee as Record<string, unknown>)?.value as number
    || (a.retail_price_without_service_fee as number)
    || (a.retail_price as Record<string, unknown>)?.value as number
    || (a.retail_price as number)
    || (a.original_retail_price as Record<string, unknown>)?.value as number
    || apiNetPrice;

  // Sandbox + Affiliate-tier responses don't carry net_price — synthesise a
  // representative net using the industry-standard 18% reseller margin so
  // the UI can show "you earn €X" from day one. Once production credentials
  // arrive, Musement will send the real net_price and we use that directly.
  const ASSUMED_MARGIN_PCT = 18;
  const netPrice = apiNetPrice > 0
    ? apiNetPrice
    : Math.round(retailPrice * (1 - ASSUMED_MARGIN_PCT / 100) * 100) / 100;
  const margin = retailPrice > 0 ? ((retailPrice - netPrice) / retailPrice) * 100 : ASSUMED_MARGIN_PCT;

  // Extract city from the activity data
  const city = (a.city as Record<string, unknown>)?.name as string || cityName;
  const country = (a.country as Record<string, unknown>)?.name as string
    || (a.city as Record<string, unknown>)?.country as Record<string, unknown>
    ? ((a.city as Record<string, unknown>)?.country as Record<string, unknown>)?.name as string
    : "";

  const fullDescription = ((a.description as string) || (a.about as string) || "");

  // Taxonomies carry inclusions/exclusions/highlights on Musement activities
  const taxonomies = (a.taxonomies || []) as Record<string, unknown>[];
  const pickTaxonomy = (code: string) =>
    taxonomies
      .filter((t) => {
        const tc = ((t.code as string) || (t.type as string) || "").toLowerCase();
        return tc === code.toLowerCase();
      })
      .map((t) => (t.name as string) || "")
      .filter(Boolean);

  const highlights = pickTaxonomy("highlights");
  const inclusions = pickTaxonomy("inclusions");
  const exclusions = pickTaxonomy("exclusions");

  const meetingPoint =
    (a.meeting_point as string) ||
    ((a.meeting_point as Record<string, unknown>)?.description as string) ||
    "";
  const whereText = (a.where_text as string) || "";
  const info = (a.info as string) || (a.what_to_remember as string) || "";
  const maxConfirmationTime = (a.max_confirmation_time as string) || "";
  const voucherType = (a.voucher_access_usage as string) || "";
  const serviceFee = ((a.service_fee as Record<string, unknown>)?.value as number) || undefined;

  const refundPoliciesRaw = (a.refund_policies || []) as Record<string, unknown>[];
  const refundPolicies = refundPoliciesRaw.map((rp) => ({
    period: (rp.period as string) || undefined,
    percentage: (rp.refund_percentage as number) ?? (rp.percentage as number) ?? undefined,
    applicableUntil: (rp.applicable_until as string) || undefined,
  }));

  return {
    uuid: a.uuid as string,
    title: a.title as string || "",
    description: fullDescription.slice(0, 300),
    descriptionFull: fullDescription,
    duration: formatDuration(
      (a.duration_range as Record<string, unknown>)?.max as string
      || (a.duration as string)
      || ""
    ),
    rating: (a.reviews_avg as number) || 0,
    reviewCount: (a.reviews_number as number) || 0,
    pricing: {
      currency,
      netPrice,
      retailPrice,
      formatted: formatPrice(retailPrice, currency),
      margin: Math.round(margin * 100) / 100,
      serviceFee,
    },
    images: (() => {
      // Combine the activity cover, any extra activity images, and the
      // cover_image_url of each venue. Combos (e.g. Van Gogh + Rijksmuseum)
      // each carry venue covers and visibly populate the gallery this way.
      const out: Array<{ url: string; caption?: string }> = [];
      const cover = a.cover_image_url as string | undefined;
      if (cover) out.push({ url: cover });
      for (const img of ((a.images || []) as Record<string, unknown>[]).slice(0, 6)) {
        const url = img.url as string;
        if (url) out.push({ url, caption: (img.caption as string) || "" });
      }
      for (const v of ((a.venues || []) as Record<string, unknown>[]).slice(0, 4)) {
        const url = v.cover_image_url as string;
        if (url) out.push({ url, caption: (v.name as string) || "" });
      }
      const seen = new Set<string>();
      return out.filter((i) => {
        if (!i.url || seen.has(i.url)) return false;
        seen.add(i.url);
        return true;
      }).slice(0, 8);
    })(),
    categories: taxonomies
      .map((t) => (t.name as string) || "")
      .filter(Boolean)
      .slice(0, 3),
    location: {
      city,
      country,
      lat: (a.latitude as number) || ((a.gps_coordinates as Record<string, unknown>)?.latitude as number),
      lng: (a.longitude as number) || ((a.gps_coordinates as Record<string, unknown>)?.longitude as number),
    },
    bookingType: "merchant",
    flags: ((a.features || []) as Record<string, unknown>[]).map(
      (f) => (f.name as string) || ""
    ).filter(Boolean),
    languages: ((a.languages || []) as Record<string, unknown>[]).map(
      (l) => (l.code as string) || (l as unknown as string)
    ).filter(Boolean),
    isOwnOffer: (a.supplier_type as string) === "OWN" || (a.own_offer as boolean) === true,
    verticals: ((a.verticals || []) as Record<string, unknown>[])
      .map((v) => ({ id: (v.id as number) ?? 0, name: (v.name as string) || "" }))
      .filter((v) => v.id),
    flavours: ((a.flavours || []) as Record<string, unknown>[])
      .map((f) => ({ id: (f.id as number) ?? 0, name: (f.name as string) || "" }))
      .filter((f) => f.id),
    topSeller: (a.top_seller as boolean) === true,
    mustSee: (a.must_see as boolean) === true,
    likelyToSellOut: (a.likely_to_sell_out as boolean) === true,
    exclusive: (a.exclusive as boolean) === true,
    bestPrice: (a.best_price as boolean) === true,
    specialOffer: (a.special_offer as boolean) === true,
    isCombo: detectCombo((a.title as string) || ""),
    cancellationPolicy: (a.free_cancellation as boolean) ? "Free cancellation" : "Non-refundable",
    musementUrl: (a.url as string) || "",
    highlights: highlights.length ? highlights : undefined,
    inclusions: inclusions.length ? inclusions : undefined,
    exclusions: exclusions.length ? exclusions : undefined,
    meetingPoint: meetingPoint || undefined,
    whereText: whereText || undefined,
    info: info || undefined,
    maxConfirmationTime: maxConfirmationTime || undefined,
    voucherType: voucherType || undefined,
    refundPolicies: refundPolicies.length ? refundPolicies : undefined,
  };
}

function mapOrderStatus(status: string): "confirmed" | "pending" | "failed" {
  switch (status?.toUpperCase()) {
    case "CONFIRMED":
    case "COMPLETED":
    case "ACTIVE":
      return "confirmed";
    case "PENDING":
    case "PROCESSING":
      return "pending";
    default:
      return "failed";
  }
}
