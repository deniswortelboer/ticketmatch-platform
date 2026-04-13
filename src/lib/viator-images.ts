/**
 * Viator Image Fetcher — Server-side cached image URLs
 * Fetches top-rated product images per category/city for use on public pages
 */

const VIATOR_API_BASE = "https://api.viator.com/partner";
const VIATOR_API_KEY = process.env.VIATOR_API_KEY || "";

const HEADERS = {
  "Accept": "application/json;version=2.0",
  "Accept-Language": "en",
  "exp-api-key": VIATOR_API_KEY,
  "Content-Type": "application/json",
};

// Destination IDs (same as viator.ts)
const DEST_IDS: Record<string, number> = {
  amsterdam: 525, rotterdam: 4211, "the hague": 5436, utrecht: 24976,
  eindhoven: 24978, haarlem: 26223, maastricht: 22820, leiden: 26505,
  groningen: 26476, arnhem: 26525, nijmegen: 26498, leeuwarden: 26514,
  alkmaar: 26416, gouda: 26397, dordrecht: 26382, zaandam: 22382,
  hoorn: 26383, middelburg: 26475,
  brussels: 458, paris: 479, london: 737, barcelona: 562, berlin: 488,
  rome: 511, prague: 462, lisbon: 538, vienna: 454, budapest: 499,
  copenhagen: 463, dublin: 503, madrid: 566, stockholm: 907,
};

// Category tag IDs from Viator taxonomy
const CATEGORY_TAGS: Record<string, number> = {
  "museums": 21910,
  "tours": 21913,
  "attractions": 12520,
  "water": 21442,
  "food": 21911,
  "tickets": 21912,
  "outdoor": 21909,
  "classes": 21915,
  "transport": 21914,
  "luxury": 11938,
  "special": 21916,
  "activities": 12520,
};

// In-memory cache (survives for the duration of the serverless function)
const imageCache = new Map<string, { url: string; caption: string; timestamp: number }[]>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

function extractImageUrl(product: Record<string, unknown>): string {
  const images = (product.images || []) as Record<string, unknown>[];
  if (!images.length) return "";
  const first = images[0];
  const variants = (first.variants || []) as Record<string, unknown>[];
  // Try 480px, then 360px, then any
  const v480 = variants.find((v) => v.width === 480);
  const v360 = variants.find((v) => v.width === 360);
  const vAny = variants[0];
  return (v480?.url || v360?.url || vAny?.url || first.url || "") as string;
}

/**
 * Get top product images for a city
 */
export async function getCityImages(city: string, count = 3): Promise<{ url: string; caption: string }[]> {
  const cacheKey = `city:${city.toLowerCase()}`;
  const cached = imageCache.get(cacheKey);
  if (cached && cached[0]?.timestamp > Date.now() - CACHE_TTL) {
    return cached.slice(0, count);
  }

  const destId = DEST_IDS[city.toLowerCase()];
  if (!destId || !VIATOR_API_KEY) return [];

  try {
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        filtering: { destination: destId.toString() },
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        pagination: { start: 1, count: Math.max(count * 2, 10) },
        currency: "EUR",
      }),
      next: { revalidate: 3600 }, // Next.js cache: 1 hour
    });

    if (!res.ok) return [];
    const data = await res.json();

    const images = (data.products || [])
      .map((p: Record<string, unknown>) => ({
        url: extractImageUrl(p),
        caption: (p.title as string) || "",
        timestamp: Date.now(),
      }))
      .filter((img: { url: string }) => img.url);

    imageCache.set(cacheKey, images);
    return images.slice(0, count);
  } catch {
    return [];
  }
}

/**
 * Get top product images for a category (in Amsterdam as default)
 */
export async function getCategoryImages(
  category: string,
  city = "amsterdam",
  count = 1
): Promise<{ url: string; caption: string }[]> {
  const cacheKey = `cat:${category}:${city}`;
  const cached = imageCache.get(cacheKey);
  if (cached && cached[0]?.timestamp > Date.now() - CACHE_TTL) {
    return cached.slice(0, count);
  }

  const destId = DEST_IDS[city.toLowerCase()];
  const tagId = CATEGORY_TAGS[category.toLowerCase()];
  if (!destId || !tagId || !VIATOR_API_KEY) return [];

  try {
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        filtering: {
          destination: destId.toString(),
          tags: [tagId],
        },
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        pagination: { start: 1, count: Math.max(count * 2, 6) },
        currency: "EUR",
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = await res.json();

    const images = (data.products || [])
      .map((p: Record<string, unknown>) => ({
        url: extractImageUrl(p),
        caption: (p.title as string) || "",
        timestamp: Date.now(),
      }))
      .filter((img: { url: string }) => img.url);

    imageCache.set(cacheKey, images);
    return images.slice(0, count);
  } catch {
    return [];
  }
}

/**
 * Batch fetch: get one image per category for homepage display
 * Each category uses a DIFFERENT city to avoid duplicates (e.g. Anne Frank)
 */
export async function getAllCategoryImages(): Promise<Record<string, string>> {
  const cacheKey = "all-categories-v2";
  const cached = imageCache.get(cacheKey);
  if (cached && cached[0]?.timestamp > Date.now() - CACHE_TTL) {
    const result: Record<string, string> = {};
    cached.forEach((c) => { result[c.caption] = c.url; });
    return result;
  }

  // Each category gets a different city for unique, diverse photos
  const categoryCity: Record<string, string> = {
    museums: "paris",
    tours: "barcelona",
    attractions: "rome",
    water: "amsterdam",
    food: "amsterdam",
    tickets: "london",
    outdoor: "lisbon",
    classes: "barcelona",
    transport: "rome",
    luxury: "paris",
    special: "prague",
    activities: "berlin",
  };

  const categories = Object.keys(CATEGORY_TAGS);
  const results: Record<string, string> = {};
  const seenUrls = new Set<string>();

  // Fetch in parallel
  await Promise.all(
    categories.map(async (cat) => {
      const city = categoryCity[cat] || "amsterdam";
      const images = await getCategoryImages(cat, city, 6);
      // Filter out Anne Frank and duplicates
      const valid = images.find((img) => {
        if (seenUrls.has(img.url)) return false;
        if (img.caption.toLowerCase().includes("anne frank")) return false;
        return true;
      });
      if (valid) {
        seenUrls.add(valid.url);
        results[cat] = valid.url;
      }
    })
  );

  // Store in cache
  const cacheEntries = Object.entries(results).map(([cat, url]) => ({
    url,
    caption: cat,
    timestamp: Date.now(),
  }));
  imageCache.set(cacheKey, cacheEntries);

  return results;
}

/**
 * Batch fetch: get multiple images per category for sliding display
 * Each category uses a different city to avoid duplicate photos
 */
export async function getAllCategoryImageSets(count = 4): Promise<Record<string, string[]>> {
  const categories = Object.keys(CATEGORY_TAGS);
  // Rotate cities per category so each gets unique photos
  const citiesPool = ["amsterdam", "paris", "barcelona", "rome", "london", "berlin", "prague", "lisbon", "vienna", "budapest", "copenhagen", "dublin"];
  const results: Record<string, string[]> = {};
  const seenUrls = new Set<string>();

  await Promise.all(
    categories.map(async (cat, i) => {
      const city = citiesPool[i % citiesPool.length];
      const images = await getCategoryImages(cat, city, count + 4);
      if (images.length > 0) {
        // Filter out any duplicates across categories
        const unique = images
          .filter((img) => {
            if (seenUrls.has(img.url)) return false;
            seenUrls.add(img.url);
            return true;
          })
          .slice(0, count);
        results[cat] = unique.map((img) => img.url);
      }
    })
  );

  return results;
}

/**
 * Hero carousel: fetch unique images for categories across multiple cities
 * Skips first N results to avoid duplicates with category cards
 */
export async function getHeroCarouselImages(
  categories: string[] = ["museums", "attractions"],
  count = 12
): Promise<string[]> {
  const cities = ["amsterdam", "paris", "barcelona", "rome", "london", "berlin"];
  const urls: string[] = [];
  const seen = new Set<string>();

  await Promise.all(
    cities.map(async (city) => {
      for (const cat of categories) {
        const images = await getCategoryImages(cat, city, 6);
        // Skip first 2 (those are used in category cards) and take the rest
        const unique = images.slice(2).filter((img) => {
          if (seen.has(img.url)) return false;
          // Filter out Anne Frank related
          if (img.caption.toLowerCase().includes("anne frank")) return false;
          seen.add(img.url);
          return true;
        });
        for (const img of unique) {
          urls.push(img.url);
        }
      }
    })
  );

  // Shuffle to mix cities and categories
  for (let i = urls.length - 1; i > 0; i--) {
    const j = Math.floor((i * 7 + 3) % (i + 1)); // deterministic shuffle
    [urls[i], urls[j]] = [urls[j], urls[i]];
  }

  return urls.slice(0, count);
}

/**
 * Batch fetch: get one image per city for homepage display
 */
export async function getAllCityImages(cities: string[]): Promise<Record<string, string>> {
  const results: Record<string, string> = {};

  await Promise.all(
    cities.map(async (city) => {
      const images = await getCityImages(city, 1);
      if (images.length > 0) {
        results[city.toLowerCase()] = images[0].url;
      }
    })
  );

  return results;
}

/**
 * Batch fetch: get multiple images per city for sliding display
 */
export async function getAllCityImageSets(cities: string[], count = 4): Promise<Record<string, string[]>> {
  const results: Record<string, string[]> = {};

  await Promise.all(
    cities.map(async (city) => {
      const images = await getCityImages(city, count);
      if (images.length > 0) {
        results[city.toLowerCase()] = images.map((img) => img.url);
      }
    })
  );

  return results;
}
