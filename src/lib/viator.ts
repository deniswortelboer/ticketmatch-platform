/**
 * Viator Partner API v2 - Affiliate Connector
 * Handles product search, availability, and booking links
 */

const VIATOR_API_BASE = "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY || "";
const VIATOR_PARTNER_ID = process.env.VIATOR_PARTNER_ID || "P00296455";

type ViatorProduct = {
  productCode: string;
  title: string;
  description: string;
  duration: string;
  rating: number;
  reviewCount: number;
  pricing: {
    currency: string;
    amount: number;
    formatted: string;
  };
  images: { url: string; caption?: string }[];
  categories: string[];
  location: {
    city: string;
    country: string;
    lat?: number;
    lng?: number;
  };
  bookingUrl: string;
  trackingUrl: string;
  flags: string[];
};

type ViatorSearchParams = {
  city: string;
  category?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  start?: number;
  currency?: string;
  language?: string;
};

type ViatorSearchResult = {
  products: ViatorProduct[];
  totalCount: number;
  hasMore: boolean;
};

// ─── Destination resolution ────────────────────────────────────────────────
// Source of truth = Viator's live /destinations endpoint (3.389 entries
// worldwide). Previously this lib kept a hardcoded ~30-entry city → id map
// which silently failed for any city outside that list (Buenos Aires,
// Tokyo, Mendoza, etc. all returned 0 products even though Viator has full
// catalogues for them). Removed 2026-05-10 — same rule we apply to
// Musement: never substitute supplier data with our own.
//
// In-memory cache populates from the FIRST live response. Subsequent
// resolutions are O(1) within a warm Vercel worker. Cache key = lowercased
// destination name; value = { id, type } so we can prefer CITY over
// REGION/PROVINCE when both exist (e.g. Tokyo CITY 334 vs Tokyo Prefecture
// REGION 50157).

type ViatorDestination = {
  id: number;
  name: string;
  type: string;
  /** Chain of parent destinations (e.g. CITY → REGION → COUNTRY). Last
   *  entry is typically the country. Used to filter cities by country. */
  parentDestinationIds: number[];
  /** ISO country code if Viator exposes one (e.g. "NL", "AR"). Optional. */
  iso?: string;
};
let viatorDestinationsCache: ViatorDestination[] | null = null;
const viatorIdByName: Map<string, ViatorDestination> = new Map();
const viatorById: Map<number, ViatorDestination> = new Map();

const VIATOR_FETCH_TIMEOUT_MS_CATALOG = 15_000;
const VIATOR_FETCH_TIMEOUT_MS_SEARCH = 12_000;

/**
 * Strip diacritics (NFD-normalize then drop combining marks). Pure Unicode
 * normalization — no content fabrication. Used so that Musement-side names
 * ("São Paulo", "Köln", "Curaçao") still match Viator-side records that
 * store accent-free spellings ("Sao Paulo", etc).
 */
function stripAccents(s: string): string {
  return s.normalize("NFD").replace(/\p{Diacritic}/gu, "");
}

async function loadViatorDestinations(): Promise<ViatorDestination[]> {
  if (viatorDestinationsCache) return viatorDestinationsCache;
  try {
    const res = await fetch(`${VIATOR_API_BASE}/destinations`, {
      method: "GET",
      headers: getHeaders(),
      signal: AbortSignal.timeout(VIATOR_FETCH_TIMEOUT_MS_CATALOG),
      cache: "force-cache" as RequestCache,
      next: { revalidate: 86400, tags: ["viator-destinations"] },
    });
    if (!res.ok) {
      console.error(`[loadViatorDestinations] Viator ${res.status} ${res.statusText}`);
      return [];
    }
    const data = (await res.json()) as { destinations?: Array<Record<string, unknown>> };
    const list: ViatorDestination[] = (data.destinations || [])
      .map((d) => {
        // Viator returns parents either as `parentDestinationIds` (newer) or
        // `parentId` (legacy). Defensive coercion handles both.
        let parents: number[] = [];
        const raw = (d.parentDestinationIds || d.parents || d.parentId) as unknown;
        if (Array.isArray(raw)) {
          parents = (raw as unknown[]).map((n) => Number(n)).filter((n) => Number.isFinite(n));
        } else if (typeof raw === "number") {
          parents = [raw];
        }
        return {
          id: d.destinationId as number,
          name: (d.name as string) || "",
          type: (d.type as string) || "",
          parentDestinationIds: parents,
          iso: typeof d.iso === "string" ? d.iso as string : undefined,
        };
      })
      .filter((d) => d.id && d.name);
    viatorDestinationsCache = list;
    // Index for O(1) lookup. When the same name maps to multiple types
    // (CITY, REGION, PROVINCE), prefer CITY. We index BOTH the raw lowercased
    // name AND the accent-stripped version so a Musement-style query like
    // "São Paulo" still finds Viator's "Sao Paulo" entry.
    const setIfBetter = (k: string, d: ViatorDestination) => {
      const existing = viatorIdByName.get(k);
      if (!existing || (d.type === "CITY" && existing.type !== "CITY")) {
        viatorIdByName.set(k, d);
      }
    };
    for (const d of list) {
      viatorById.set(d.id, d);
      const key = d.name.toLowerCase();
      setIfBetter(key, d);
      const stripped = stripAccents(key);
      if (stripped !== key) setIfBetter(stripped, d);
    }
    return list;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    if (isTimeout) {
      console.error(`[loadViatorDestinations] timed out after ${VIATOR_FETCH_TIMEOUT_MS_CATALOG}ms`);
    } else {
      console.error("[loadViatorDestinations] fetch error:", err);
    }
    return [];
  }
}

/** Resolve a city name to Viator's destinationId via the live catalogue. */
async function resolveViatorDestinationId(city: string): Promise<number | null> {
  if (!city) return null;
  // Special-case "all" (the legacy "all of NL" sentinel) — Viator's
  // Netherlands country destination is 60.
  if (city.toLowerCase() === "all") return 60;
  await loadViatorDestinations();
  const lower = city.toLowerCase();
  // Try the raw lowercased name first; fall back to the accent-stripped
  // form so "São Paulo" → "sao paulo", "Köln" → "koln", etc. still resolve.
  const hit = viatorIdByName.get(lower) || viatorIdByName.get(stripAccents(lower));
  return hit ? hit.id : null;
}

// ─── Source-aware destination listing (countries + cities) ─────────────────
// These power the Experiences page's country/city dropdowns when source is
// Viator. The whole flow respects the "supplier API is source of truth"
// rule — never substitute, never fabricate. Counts come from real
// /products/search calls (totalCount field), so what the user sees in the
// dropdown is exactly what they'll get on click.

export type ViatorCountrySummary = { id: number; name: string };
export type ViatorCityWithCount = { id: number; name: string; count: number };

/** Live list of all COUNTRY-type destinations Viator sells. */
export async function getViatorCountries(): Promise<ViatorCountrySummary[]> {
  await loadViatorDestinations();
  const all = viatorDestinationsCache || [];
  return all
    .filter((d) => d.type === "COUNTRY")
    .map((d) => ({ id: d.id, name: d.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get the totalCount of Viator products for a destination. Uses the
 * /products/search endpoint with count=1 (we don't need the products,
 * only the totalCount field). ~300-1000ms per call. Cached per cold start.
 */
const viatorCountByDestId: Map<number, number> = new Map();

async function getViatorProductCount(destinationId: number): Promise<number> {
  if (viatorCountByDestId.has(destinationId)) {
    return viatorCountByDestId.get(destinationId)!;
  }
  try {
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        filtering: { destination: destinationId.toString() },
        pagination: { start: 1, count: 1 },
        currency: "EUR",
      }),
      signal: AbortSignal.timeout(VIATOR_FETCH_TIMEOUT_MS_SEARCH),
    });
    if (!res.ok) {
      viatorCountByDestId.set(destinationId, 0);
      return 0;
    }
    const data = (await res.json()) as { totalCount?: number };
    const count = typeof data.totalCount === "number" ? data.totalCount : 0;
    viatorCountByDestId.set(destinationId, count);
    return count;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    if (isTimeout) {
      console.warn(`[getViatorProductCount] dest=${destinationId} timed out`);
    } else {
      console.error(`[getViatorProductCount] dest=${destinationId} error:`, err);
    }
    return 0;
  }
}

/**
 * List Viator's CITY-type destinations under a given country. Each city is
 * returned with its REAL totalCount of Viator products — sorted desc by
 * count, and cities with count=0 are omitted entirely (per Denis's
 * "what you see is what you get" rule).
 *
 * Counts are fetched in parallel with a concurrency cap so we don't blast
 * Viator with 200+ requests at once. Cold-start latency for a country
 * with N cities ≈ ceil(N/8) * ~600ms.
 */
export async function getViatorCitiesByCountry(
  countryName: string
): Promise<ViatorCityWithCount[]> {
  await loadViatorDestinations();
  const all = viatorDestinationsCache || [];
  // Find the country destination by name (case-insensitive, accent-tolerant).
  const targetLower = countryName.toLowerCase();
  const targetStripped = stripAccents(targetLower);
  const country = all.find(
    (d) =>
      d.type === "COUNTRY" &&
      (d.name.toLowerCase() === targetLower ||
        stripAccents(d.name.toLowerCase()) === targetStripped)
  );
  if (!country) {
    console.warn(`[getViatorCitiesByCountry] no COUNTRY match for "${countryName}"`);
    return [];
  }
  // Cities = type=CITY whose parent chain includes the country id.
  const cities = all.filter(
    (d) => d.type === "CITY" && d.parentDestinationIds.includes(country.id)
  );
  if (cities.length === 0) return [];

  // Fetch counts in parallel with a concurrency cap.
  const CONCURRENCY = 8;
  const results: ViatorCityWithCount[] = [];
  for (let i = 0; i < cities.length; i += CONCURRENCY) {
    const slice = cities.slice(i, i + CONCURRENCY);
    const counts = await Promise.all(slice.map((c) => getViatorProductCount(c.id)));
    for (let j = 0; j < slice.length; j++) {
      results.push({ id: slice[j].id, name: slice[j].name, count: counts[j] });
    }
  }
  // WYSIWYG: drop cities with zero Viator products, sort by count desc.
  return results
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

function getHeaders(language = "en") {
  return {
    "Accept": "application/json;version=2.0",
    "Accept-Language": language,
    "exp-api-key": VIATOR_API_KEY,
    "Content-Type": "application/json",
  };
}

function slugify(text: string): string {
  return text
    .replace(/['']/g, "")
    .replace(/&/g, "and")
    .replace(/[^a-zA-Z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 100);
}

function buildAffiliateUrl(productCode: string, productUrl?: string, title?: string): string {
  // Builds affiliate URL with pid/mcid for commission tracking
  // Viator redirects to destination page with "You selected" on the product
  // This is required until we integrate the Viator Booking API
  const affiliate = `pid=${VIATOR_PARTNER_ID}&mcid=42383&medium=link&campaign=ticketmatch`;
  const slug = title ? slugify(title) : productCode;

  if (productUrl) {
    const path = productUrl.startsWith("http")
      ? new URL(productUrl).pathname
      : productUrl;

    if (path.startsWith("/tours/") && path.includes(`-${productCode}`)) {
      return `https://www.viator.com${path}?${affiliate}`;
    }

    const destMatch = path.match(/\/d(\d+)/);
    if (destMatch) {
      const cityMatch = path.match(/^\/([^/]+)\//);
      const city = cityMatch ? cityMatch[1] : "experience";
      return `https://www.viator.com/tours/${city}/${slug}/d${destMatch[1]}-${productCode}?${affiliate}`;
    }
  }

  return `https://www.viator.com/tours/${slug}/${productCode}?${affiliate}`;
}

/**
 * Search for products/experiences in a city
 */
export async function searchProducts(params: ViatorSearchParams): Promise<ViatorSearchResult> {
  // Live destinationId lookup against Viator's /destinations catalogue.
  // Was a hardcoded ~30-entry map that silently failed for any city
  // outside that list (Buenos Aires, Tokyo, Mendoza, ...).
  const destId = await resolveViatorDestinationId(params.city);
  if (!destId) {
    console.warn(`[searchProducts] Viator has no destinationId for "${params.city}"`);
    return { products: [], totalCount: 0, hasMore: false };
  }

  const body: Record<string, unknown> = {
    filtering: {
      destination: destId.toString(),
    },
    sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
    // Fetch extra for first page so we can re-sort by popularity
    pagination: {
      start: params.start || 1,
      count: (params.start || 1) === 1
        ? Math.max((params.limit || 20) * 2, 50)
        : (params.limit || 20),
    },
    currency: params.currency || "EUR",
  };

  if (params.startDate) {
    (body.filtering as Record<string, unknown>).startDate = params.startDate;
  }
  if (params.endDate) {
    (body.filtering as Record<string, unknown>).endDate = params.endDate;
  }
  if (params.category) {
    (body.filtering as Record<string, unknown>).tags = [Number(params.category)];
  }

  try {
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: "POST",
      headers: getHeaders(params.language),
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      console.error(`Viator API error: ${res.status} ${res.statusText}`);
      return { products: [], totalCount: 0, hasMore: false };
    }

    const data = await res.json();

    const products: ViatorProduct[] = (data.products || []).map((p: Record<string, unknown>) => ({
      productCode: p.productCode,
      title: p.title,
      description: (p.description as string)?.slice(0, 300) || "",
      duration: formatDuration(p.duration as Record<string, unknown>),
      rating: (p.reviews as Record<string, unknown>)?.combinedAverageRating || 0,
      reviewCount: (p.reviews as Record<string, unknown>)?.totalReviews || 0,
      pricing: {
        currency: (p.pricing as Record<string, unknown>)?.currency || "EUR",
        amount: ((p.pricing as Record<string, unknown>)?.summary as Record<string, unknown>)?.fromPrice || 0,
        formatted: formatPrice(
          ((p.pricing as Record<string, unknown>)?.summary as Record<string, unknown>)?.fromPrice as number,
          (p.pricing as Record<string, unknown>)?.currency as string || "EUR"
        ),
      },
      images: ((p.images || []) as Record<string, unknown>[]).slice(0, 3).map((img) => ({
        url: (img.variants as Record<string, unknown>[])?.find((v: Record<string, unknown>) => v.width === 480)?.url || img.url || "",
        caption: img.caption || "",
      })),
      categories: mapTagsToCategories((p.tags || []) as number[]),
      location: {
        city: params.city,
        country: "",
        lat: (p.location as Record<string, unknown>)?.latitude as number,
        lng: (p.location as Record<string, unknown>)?.longitude as number,
      },
      bookingUrl: buildAffiliateUrl(p.productCode as string, p.productUrl as string, p.title as string),
      trackingUrl: "",
      flags: (p.flags || []) as string[],
    }));

    // Sort first page by popularity (review count), keep subsequent pages as-is
    const isFirstPage = (params.start || 1) === 1;
    const sorted = isFirstPage
      ? products.sort((a, b) => b.reviewCount - a.reviewCount)
      : products;

    // Trim to requested limit
    const trimmed = sorted.slice(0, params.limit || 20);

    return {
      products: trimmed,
      totalCount: data.totalCount || products.length,
      hasMore: (data.totalCount || 0) > (params.limit || 20),
    };
  } catch (err) {
    console.error("Viator search error:", err);
    return { products: [], totalCount: 0, hasMore: false };
  }
}

/**
 * Get detailed product information
 */
export async function getProduct(productCode: string, language = "en"): Promise<ViatorProduct | null> {
  try {
    const res = await fetch(`${VIATOR_API_BASE}/products/${productCode}`, {
      method: "GET",
      headers: getHeaders(language),
    });

    if (!res.ok) return null;

    const p = await res.json();

    return {
      productCode: p.productCode,
      title: p.title,
      description: p.description || "",
      duration: formatDuration(p.duration),
      rating: p.reviews?.combinedAverageRating || 0,
      reviewCount: p.reviews?.totalReviews || 0,
      pricing: {
        currency: p.pricing?.currency || "EUR",
        amount: p.pricing?.summary?.fromPrice || 0,
        formatted: formatPrice(p.pricing?.summary?.fromPrice, p.pricing?.currency || "EUR"),
      },
      images: (p.images || []).slice(0, 5).map((img: Record<string, unknown>) => ({
        url: (img.variants as Record<string, unknown>[])?.find((v: Record<string, unknown>) => v.width === 480)?.url || img.url || "",
        caption: img.caption || "",
      })),
      categories: mapTagsToCategories((p.tags || []) as number[]),
      location: {
        city: "",
        country: "",
        lat: p.location?.latitude,
        lng: p.location?.longitude,
      },
      bookingUrl: buildAffiliateUrl(p.productCode, p.productUrl, p.title),
      trackingUrl: "",
      flags: p.flags || [],
    };
  } catch (err) {
    console.error("Viator product error:", err);
    return null;
  }
}

/**
 * Get product availability for a date range
 */
export async function getAvailability(
  productCode: string,
  startDate: string,
  endDate: string,
  currency = "EUR"
): Promise<{ available: boolean; dates: { date: string; available: boolean; price?: number }[] }> {
  try {
    const res = await fetch(`${VIATOR_API_BASE}/availability/schedules/${productCode}`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        productCode,
        startDate,
        endDate,
        currency,
      }),
    });

    if (!res.ok) return { available: false, dates: [] };

    const data = await res.json();
    const dates = (data.bookableItems || []).map((item: Record<string, unknown>) => ({
      date: item.date,
      available: (item.seasons as Record<string, unknown>[])?.some(
        (s: Record<string, unknown>) => (s.pricingRecords as Record<string, unknown>[])?.length > 0
      ),
      price: ((item.seasons as Record<string, unknown>[])?.[0]?.pricingRecords as Record<string, unknown>[] | undefined)?.[0]?.price,
    }));

    return {
      available: dates.some((d: { available: boolean }) => d.available),
      dates,
    };
  } catch (err) {
    console.error("Viator availability error:", err);
    return { available: false, dates: [] };
  }
}

// Tag ID to category name mapping (from Viator taxonomy)
const TAG_CATEGORIES: Record<number, string> = {
  // Main categories
  21913: "Tours & Sightseeing",
  12519: "Tours",
  21910: "Art & Culture",
  21911: "Food & Drink",
  21909: "Outdoor Activities",
  21912: "Tickets & Passes",
  21915: "Classes & Workshops",
  21914: "Transportation",
  12518: "Transportation",
  21916: "Special Occasions",
  21635: "Shows & Performances",
  12520: "Activities",
  12521: "Events",
  21074: "Unique Experiences",
  // Popular sub-categories
  12046: "Walking Tours",
  12028: "Cultural Tours",
  12029: "Historical Tours",
  11941: "Private Tours",
  12075: "City Tours",
  12031: "Art Tours",
  11929: "Half-day Tours",
  21510: "Crime Tours",
  20255: "Water Tours",
  21442: "On the Water",
  11938: "Private & Luxury",
  20757: "Likely to Sell Out",
  22083: "Likely to Sell Out",
  21972: "Excellent Quality",
};

function mapTagsToCategories(tagIds: number[]): string[] {
  const cats = new Set<string>();
  for (const id of tagIds) {
    const name = TAG_CATEGORIES[id];
    if (name && name !== "Likely to Sell Out" && name !== "Excellent Quality") {
      cats.add(name);
    }
  }
  return Array.from(cats).slice(0, 3);
}

// Helper: format duration object
function formatDuration(duration: Record<string, unknown> | undefined): string {
  if (!duration) return "";
  const hours = duration.fixedDurationInMinutes
    ? Math.floor(duration.fixedDurationInMinutes as number / 60)
    : 0;
  const mins = duration.fixedDurationInMinutes
    ? (duration.fixedDurationInMinutes as number) % 60
    : 0;
  if (hours && mins) return `${hours}h ${mins}m`;
  if (hours) return `${hours}h`;
  if (mins) return `${mins}m`;
  return duration.description as string || "";
}

// Helper: format price
function formatPrice(amount: number | undefined, currency: string): string {
  if (!amount) return "";
  return new Intl.NumberFormat("nl-NL", { style: "currency", currency }).format(amount);
}

/**
 * Search for city destinations by name
 */
export async function searchDestinations(query: string): Promise<{ id: number; name: string; type: string }[]> {
  // Source of truth = Viator's live /destinations catalogue (loaded once
  // and indexed). Free-text query against the indexed list — no
  // hardcoded shortcut.
  await loadViatorDestinations();
  const q = query.toLowerCase();
  if (!q) return [];
  return (viatorDestinationsCache || [])
    .filter((d) => d.type === "CITY" && d.name.toLowerCase().includes(q))
    .slice(0, 10)
    .map((d) => ({ id: d.id, name: d.name, type: d.type }));
}

/**
 * Search products by destination ID directly (for custom city search)
 */
export async function searchProductsByDestinationId(
  destinationId: number,
  params: Omit<ViatorSearchParams, "city"> & { city?: string }
): Promise<ViatorSearchResult> {
  const body: Record<string, unknown> = {
    filtering: {
      destination: destinationId.toString(),
    },
    sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
    pagination: {
      start: params.start || 1,
      count: (params.start || 1) === 1
        ? Math.max((params.limit || 20) * 2, 50)
        : (params.limit || 20),
    },
    currency: params.currency || "EUR",
  };

  if (params.category) {
    (body.filtering as Record<string, unknown>).tags = [Number(params.category)];
  }

  try {
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: "POST",
      headers: getHeaders(params.language),
      body: JSON.stringify(body),
    });

    if (!res.ok) return { products: [], totalCount: 0, hasMore: false };

    const data = await res.json();

    const products: ViatorProduct[] = (data.products || []).map((p: Record<string, unknown>) => ({
      productCode: p.productCode,
      title: p.title,
      description: (p.description as string)?.slice(0, 300) || "",
      duration: formatDuration(p.duration as Record<string, unknown>),
      rating: (p.reviews as Record<string, unknown>)?.combinedAverageRating || 0,
      reviewCount: (p.reviews as Record<string, unknown>)?.totalReviews || 0,
      pricing: {
        currency: (p.pricing as Record<string, unknown>)?.currency || "EUR",
        amount: ((p.pricing as Record<string, unknown>)?.summary as Record<string, unknown>)?.fromPrice || 0,
        formatted: formatPrice(
          ((p.pricing as Record<string, unknown>)?.summary as Record<string, unknown>)?.fromPrice as number,
          (p.pricing as Record<string, unknown>)?.currency as string || "EUR"
        ),
      },
      images: ((p.images || []) as Record<string, unknown>[]).slice(0, 3).map((img) => ({
        url: (img.variants as Record<string, unknown>[])?.find((v: Record<string, unknown>) => v.width === 480)?.url || img.url || "",
        caption: img.caption || "",
      })),
      categories: mapTagsToCategories((p.tags || []) as number[]),
      location: {
        city: params.city || "",
        country: "",
        lat: (p.location as Record<string, unknown>)?.latitude as number,
        lng: (p.location as Record<string, unknown>)?.longitude as number,
      },
      bookingUrl: buildAffiliateUrl(p.productCode as string, p.productUrl as string, p.title as string),
      trackingUrl: "",
      flags: (p.flags || []) as string[],
    }));

    const isFirstPage = (params.start || 1) === 1;
    const sorted = isFirstPage
      ? products.sort((a, b) => b.reviewCount - a.reviewCount)
      : products;
    const trimmed = sorted.slice(0, params.limit || 20);

    return {
      products: trimmed,
      totalCount: data.totalCount || products.length,
      hasMore: (data.totalCount || 0) > (params.limit || 20),
    };
  } catch (err) {
    console.error("Viator destination search error:", err);
    return { products: [], totalCount: 0, hasMore: false };
  }
}

// ────────────────────────────────────────────────────────────────────────────
// Booking layer — Viator TAP / Affiliate Full + Booking Access
// ────────────────────────────────────────────────────────────────────────────
//
// Built 2026-05-10 to mirror lib/musement.ts so the UI can route Musement +
// Viator bookings through one supplier-agnostic flow. Today this runs in
// MOCK MODE because we don't yet have "Full + Booking Access" provisioned
// on Partner ID P00300314 — Carmen needs to approve that separately.
//
// Endpoints we'll call once live (per Viator's partner-API docs):
//   POST  /partner/v1/bookings/hold        — temporarily reserve a slot (~30 min)
//   POST  /partner/v1/bookings/book        — confirm after payment
//   GET   /partner/v1/bookings/{ref}       — poll status (PENDING → CONFIRMED)
//   POST  /partner/v1/bookings/{ref}/cancel-quote   — refund estimate
//   POST  /partner/v1/bookings/{ref}/cancel         — actually cancel
//
// Mock-mode contract: every booking helper returns a realistically-shaped
// object so the UI/database wiring can be exercised end-to-end before the
// first real Viator credentials land. Swap to live = flip
// VIATOR_TAP_LIVE=true + provide VIATOR_PARTNER_API_KEY.
// ────────────────────────────────────────────────────────────────────────────

const VIATOR_TAP_LIVE = process.env.VIATOR_TAP_LIVE === "true";
const VIATOR_PARTNER_API_BASE =
  process.env.VIATOR_PARTNER_API_BASE || "https://api.viator.com/partner/v1";
const VIATOR_PARTNER_API_KEY = process.env.VIATOR_PARTNER_API_KEY || "";
const VIATOR_FETCH_TIMEOUT_MS = 12_000;

/**
 * Returns true when live Viator booking credentials are configured. Until
 * Carmen approves "Full + Booking Access" on P00300314 this stays false
 * and the booking helpers below operate in mock mode.
 */
export function isViatorTapLive(): boolean {
  return VIATOR_TAP_LIVE && Boolean(VIATOR_PARTNER_API_KEY);
}

/** AbortSignal that aborts after VIATOR_FETCH_TIMEOUT_MS — same pattern as musement.ts. */
function viatorTimeoutSignal(): AbortSignal {
  return AbortSignal.timeout(VIATOR_FETCH_TIMEOUT_MS);
}

/** Authentication headers for Viator's partner API. exp-api-key per Viator docs. */
function viatorAuthHeaders(): Record<string, string> {
  return {
    "Accept": "application/json;version=2.0",
    "Content-Type": "application/json",
    ...(VIATOR_PARTNER_API_KEY ? { "exp-api-key": VIATOR_PARTNER_API_KEY } : {}),
  };
}

// ─── Types ──────────────────────────────────────────────────────────────────

export type ViatorTraveller = {
  bandId?: string;       // e.g. "ADULT", "CHILD" — Viator product-specific
  firstName: string;
  lastName: string;
  dateOfBirth?: string;  // ISO date if required by product
};

export type ViatorBookingHoldRequest = {
  productCode: string;
  productOptionCode?: string;
  travelDate: string;          // ISO date "YYYY-MM-DD"
  startTime?: string;          // "09:30" if time-slotted
  travellers: ViatorTraveller[];
  bookingQuestionAnswers?: Array<{
    question: string;
    answer: string;
  }>;
  pickupLocation?: string;
  /**
   * Required: agent's user id (e.g. U00806230). For TAP all bookings flow
   * under the agency Partner ID (P00300314) — the agent is recorded for
   * commission attribution and audit.
   */
  agentUserRef: string;
  /** Reseller's reference for our internal pipeline, surfaced on voucher. */
  resellerBookingRef?: string;
  /** TicketMatch's idempotency key — replays the same hold instead of re-creating. */
  idempotencyKey: string;
};

export type ViatorBookingHold = {
  /** Viator's hold reference, valid ~30 min. Pass to confirmViatorBooking. */
  holdRef: string;
  /** When the hold expires; UI should warn / auto-refresh near this time. */
  expiresAt: string;
  /** Final per-booking pricing once Viator has resolved it. */
  pricing: {
    currency: string;
    retailPrice: number;          // what the customer pays
    commissionAmount: number;     // 10% under TAP boost, 8% standard
    commissionRate: number;       // 0.10 / 0.08
  };
  cancellationPolicy: {
    /** ISO timestamp; cancellation before this is fully refundable. */
    freeUntil?: string;
    summary: string;
  };
  voucherRequirements: string[];
  /** Mock-mode echo so callers can confirm shape without a live booking. */
  mock?: boolean;
};

export type ViatorBookingConfirmRequest = {
  holdRef: string;
  /**
   * In Affiliate Full + Booking the customer pays Viator directly via an
   * embedded widget. Once payment lands we call confirm with the
   * payment-token Viator returned to our UI. In Merchant API this becomes
   * a Stripe charge token. Field stays generic so one shape covers both.
   */
  paymentToken?: string;
  agentNotes?: string;
};

export type ViatorBookingConfirmed = {
  bookingRef: string;            // VTR-2026-XXXXXXX, customer-visible
  status: "CONFIRMED" | "PENDING" | "AWAITING_SUPPLIER";
  voucher: {
    /** Customer-facing voucher URL (PDF). Always Viator-branded under TAP. */
    url: string;
    /** Best-effort barcode payload — used to render a QR client-side. */
    barcode?: string;
    deliveryEmail: string;
  };
  pricing: ViatorBookingHold["pricing"];
  /** When does Viator pay this commission out? Typically post-travel. */
  commissionPayout: {
    /** ISO date the commission becomes payable. */
    expectedAt: string;
    status: "PENDING_TRAVEL" | "PAYABLE" | "PAID";
  };
  mock?: boolean;
};

export type ViatorBookingStatus = {
  bookingRef: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED" | "FAILED" | "AWAITING_SUPPLIER";
  lastUpdatedAt: string;
  voucher?: ViatorBookingConfirmed["voucher"];
  failureReason?: string;
  mock?: boolean;
};

export type ViatorCancelQuote = {
  bookingRef: string;
  refundable: boolean;
  refundAmount: number;
  currency: string;
  /** Viator's free-cancellation deadline; null = past it. */
  freeUntil: string | null;
  summary: string;
  mock?: boolean;
};

export type ViatorCancelResult =
  | {
      ok: true;
      bookingRef: string;
      refundAmount: number;
      cancelledAt: string;
      mock?: boolean;
    }
  | {
      ok: false;
      bookingRef: string;
      reason: string;
      mock?: boolean;
    };

// ─── Mock-mode helpers ─────────────────────────────────────────────────────

function mockBookingRef(): string {
  // Same shape as Viator's customer-facing references — predictable enough
  // for fixtures, random enough not to collide.
  const yr = new Date().getFullYear();
  const rand = Math.floor(100000 + Math.random() * 900000);
  return `VTR-${yr}-${rand}`;
}

function mockHoldRef(): string {
  const rand = Math.random().toString(36).slice(2, 12).toUpperCase();
  return `HOLD-${rand}`;
}

function isoDaysFromNow(days: number): string {
  return new Date(Date.now() + days * 86_400_000).toISOString();
}

// ─── 1) HOLD ───────────────────────────────────────────────────────────────

/**
 * Reserve a Viator slot for ~30 minutes pending payment. Idempotent on
 * `idempotencyKey` — replaying with the same key returns the same hold.
 *
 * Live: POST /partner/v1/bookings/hold
 * Mock: returns a synthetic hold so the UI/db can be exercised end-to-end.
 */
export async function holdViatorBooking(
  request: ViatorBookingHoldRequest
): Promise<ViatorBookingHold | null> {
  if (!isViatorTapLive()) {
    // Mock-mode: pretend the hold succeeded with the boosted 10% commission
    // we negotiated with Carmen. Pricing is a stand-in until we have real
    // product-pricing wired up in the search layer.
    const retail = 65.0;
    return {
      holdRef: mockHoldRef(),
      expiresAt: new Date(Date.now() + 30 * 60_000).toISOString(),
      pricing: {
        currency: "EUR",
        retailPrice: retail,
        commissionAmount: +(retail * 0.1).toFixed(2),
        commissionRate: 0.1,
      },
      cancellationPolicy: {
        freeUntil: isoDaysFromNow(2),
        summary: "Free cancellation up to 24 hours before travel.",
      },
      voucherRequirements: ["mobile-ticket-accepted"],
      mock: true,
    };
  }

  try {
    const res = await fetch(`${VIATOR_PARTNER_API_BASE}/bookings/hold`, {
      method: "POST",
      headers: viatorAuthHeaders(),
      body: JSON.stringify(request),
      signal: viatorTimeoutSignal(),
    });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.text()).slice(0, 500); } catch {}
      console.error(
        `[holdViatorBooking] Viator ${res.status} ${res.statusText} body=${detail}`
      );
      return null;
    }
    const data = (await res.json()) as ViatorBookingHold;
    return data;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    if (isTimeout) {
      console.error(`[holdViatorBooking] upstream timed out after ${VIATOR_FETCH_TIMEOUT_MS}ms`);
    } else {
      console.error("Viator hold error:", err);
    }
    return null;
  }
}

// ─── 2) CONFIRM ────────────────────────────────────────────────────────────

/**
 * Confirm a previously-held booking after payment has been collected. In
 * Affiliate Full + Booking, payment runs through Viator's embedded widget
 * and we receive a payment-token to pass through here.
 *
 * Live: POST /partner/v1/bookings/book
 * Mock: returns a fake CONFIRMED booking with a placeholder voucher URL.
 */
export async function confirmViatorBooking(
  request: ViatorBookingConfirmRequest
): Promise<ViatorBookingConfirmed | null> {
  if (!isViatorTapLive()) {
    const ref = mockBookingRef();
    return {
      bookingRef: ref,
      status: "CONFIRMED",
      voucher: {
        url: `https://mock.viator.local/voucher/${ref}.pdf`,
        barcode: ref,
        deliveryEmail: "lead-traveller@example.com",
      },
      pricing: {
        currency: "EUR",
        retailPrice: 65.0,
        commissionAmount: 6.5,
        commissionRate: 0.1,
      },
      commissionPayout: {
        expectedAt: isoDaysFromNow(14),
        status: "PENDING_TRAVEL",
      },
      mock: true,
    };
  }

  try {
    const res = await fetch(`${VIATOR_PARTNER_API_BASE}/bookings/book`, {
      method: "POST",
      headers: viatorAuthHeaders(),
      body: JSON.stringify(request),
      signal: viatorTimeoutSignal(),
    });
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.text()).slice(0, 500); } catch {}
      console.error(
        `[confirmViatorBooking] Viator ${res.status} ${res.statusText} body=${detail}`
      );
      return null;
    }
    const data = (await res.json()) as ViatorBookingConfirmed;
    return data;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    if (isTimeout) {
      console.error(`[confirmViatorBooking] upstream timed out after ${VIATOR_FETCH_TIMEOUT_MS}ms`);
    } else {
      console.error("Viator confirm error:", err);
    }
    return null;
  }
}

// ─── 3) STATUS ─────────────────────────────────────────────────────────────

/**
 * Poll a booking's status. Used post-confirm when status starts as
 * AWAITING_SUPPLIER (Viator forwards to the operator) and we need to wait
 * for them to confirm before we surface the voucher to the customer.
 */
export async function getViatorBookingStatus(
  bookingRef: string
): Promise<ViatorBookingStatus | null> {
  if (!isViatorTapLive()) {
    return {
      bookingRef,
      status: "CONFIRMED",
      lastUpdatedAt: new Date().toISOString(),
      voucher: {
        url: `https://mock.viator.local/voucher/${bookingRef}.pdf`,
        barcode: bookingRef,
        deliveryEmail: "lead-traveller@example.com",
      },
      mock: true,
    };
  }

  try {
    const res = await fetch(
      `${VIATOR_PARTNER_API_BASE}/bookings/${encodeURIComponent(bookingRef)}`,
      {
        headers: viatorAuthHeaders(),
        signal: viatorTimeoutSignal(),
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as ViatorBookingStatus;
  } catch (err) {
    console.error("Viator status error:", err);
    return null;
  }
}

// ─── 4) CANCEL QUOTE ───────────────────────────────────────────────────────

/**
 * Estimate a refund without actually cancelling. Surface in UI before the
 * reseller confirms a cancellation so they can tell the customer exactly
 * how much they'll get back (and warn if it's past the free-cancel window).
 */
export async function getViatorCancelQuote(
  bookingRef: string
): Promise<ViatorCancelQuote | null> {
  if (!isViatorTapLive()) {
    return {
      bookingRef,
      refundable: true,
      refundAmount: 65.0,
      currency: "EUR",
      freeUntil: isoDaysFromNow(2),
      summary: "Full refund available (within 24h-before-travel window).",
      mock: true,
    };
  }

  try {
    const res = await fetch(
      `${VIATOR_PARTNER_API_BASE}/bookings/${encodeURIComponent(bookingRef)}/cancel-quote`,
      {
        method: "POST",
        headers: viatorAuthHeaders(),
        signal: viatorTimeoutSignal(),
      }
    );
    if (!res.ok) return null;
    return (await res.json()) as ViatorCancelQuote;
  } catch (err) {
    console.error("Viator cancel-quote error:", err);
    return null;
  }
}

// ─── 5) CANCEL ─────────────────────────────────────────────────────────────

/**
 * Actually cancel the booking. Returns the refunded amount on success or
 * a reason string on failure (e.g. past the free-cancellation deadline,
 * supplier already issued voucher, etc.).
 */
export async function cancelViatorBooking(
  bookingRef: string,
  reason?: string
): Promise<ViatorCancelResult> {
  if (!isViatorTapLive()) {
    return {
      ok: true,
      bookingRef,
      refundAmount: 65.0,
      cancelledAt: new Date().toISOString(),
      mock: true,
    };
  }

  try {
    const res = await fetch(
      `${VIATOR_PARTNER_API_BASE}/bookings/${encodeURIComponent(bookingRef)}/cancel`,
      {
        method: "POST",
        headers: viatorAuthHeaders(),
        body: JSON.stringify({ reason: reason || "" }),
        signal: viatorTimeoutSignal(),
      }
    );
    if (!res.ok) {
      let detail = "";
      try { detail = (await res.text()).slice(0, 200); } catch {}
      return {
        ok: false,
        bookingRef,
        reason: `Viator ${res.status}: ${detail || res.statusText}`,
      };
    }
    return (await res.json()) as ViatorCancelResult;
  } catch (err) {
    const isTimeout = err instanceof Error && err.name === "TimeoutError";
    return {
      ok: false,
      bookingRef,
      reason: isTimeout ? "Viator upstream timed out" : "Viator cancel error",
    };
  }
}

// Export types
export type { ViatorProduct, ViatorSearchParams, ViatorSearchResult };
