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

// City destination IDs for Viator
const DESTINATION_IDS: Record<string, number> = {
  // Netherlands
  all: 60,
  amsterdam: 525,
  rotterdam: 4211,
  "the hague": 5436,
  "den haag": 5436,
  utrecht: 24976,
  eindhoven: 24978,
  haarlem: 26223,
  maastricht: 22820,
  leiden: 26505,
  groningen: 26476,
  leeuwarden: 26514,
  arnhem: 26525,
  alkmaar: 26416,
  gouda: 26397,
  dordrecht: 26382,
  zaandam: 22382,
  hoorn: 26383,
  nijmegen: 26498,
  middelburg: 26475,
  // Europe
  brussels: 458,
  paris: 479,
  london: 737,
  barcelona: 562,
  berlin: 488,
  madrid: 566,
  rome: 511,
  lisbon: 538,
  vienna: 454,
  prague: 462,
  copenhagen: 463,
  budapest: 499,
  dublin: 503,
  stockholm: 907,
};

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
  const destId = DESTINATION_IDS[params.city.toLowerCase()];
  if (!destId) {
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
  try {
    // Check local mapping first
    const localKey = query.toLowerCase();
    if (DESTINATION_IDS[localKey]) {
      return [{ id: DESTINATION_IDS[localKey], name: query, type: "CITY" }];
    }

    const res = await fetch(`${VIATOR_API_BASE}/destinations`, {
      method: "GET",
      headers: getHeaders(),
    });

    if (!res.ok) return [];

    const data = await res.json();
    const q = query.toLowerCase();
    return (data.destinations || [])
      .filter((d: Record<string, unknown>) =>
        (d.name as string)?.toLowerCase().includes(q) && d.type === "CITY"
      )
      .slice(0, 10)
      .map((d: Record<string, unknown>) => ({
        id: d.destinationId as number,
        name: d.name as string,
        type: d.type as string,
      }));
  } catch (err) {
    console.error("Viator destination search error:", err);
    return [];
  }
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

// Export types
export type { ViatorProduct, ViatorSearchParams, ViatorSearchResult };
