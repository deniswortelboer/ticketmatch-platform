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

// Destination IDs — audited & corrected April 2026
const DEST_IDS: Record<string, number> = {
  amsterdam: 525, rotterdam: 4211, "the hague": 5436, utrecht: 24976,
  eindhoven: 24978, haarlem: 26223, maastricht: 22820, leiden: 26505,
  groningen: 26476, arnhem: 26525, nijmegen: 26498, leeuwarden: 26514,
  alkmaar: 26416, gouda: 26397, dordrecht: 26382, zaandam: 22382,
  hoorn: 26383, middelburg: 26475,
  /* German cities */
  berlin: 488, munich: 487, hamburg: 777, frankfurt: 489,
  cologne: 923, dresden: 22375, dusseldorf: 5631, stuttgart: 28716,
  /* French cities */
  paris: 479, lyon: 829, nice: 478, marseille: 485,
  bordeaux: 468, strasbourg: 5502, toulouse: 812, avignon: 483,
  /* Spanish cities */
  barcelona: 562, madrid: 566, seville: 556, valencia: 811,
  malaga: 956, granada: 554, bilbao: 4485, "san-sebastian": 5505,
  /* Italian cities */
  rome: 511, florence: 519, venice: 522, milan: 512,
  naples: 508, turin: 802, "cinque-terre": 22149, "amalfi-coast": 33601,
  /* UK cities */
  london: 737, edinburgh: 739, manchester: 4056, liverpool: 940,
  oxford: 5537, cambridge: 22327, bath: 27175, york: 5446,
  /* Belgian cities */
  brussels: 458, bruges: 4836, ghent: 23079, antwerp: 764,
  /* Austrian cities */
  vienna: 454, salzburg: 451, innsbruck: 5173, hallstatt: 25793,
  /* Swiss cities */
  zurich: 577, lucerne: 576, interlaken: 5011, geneva: 578,
  /* Portuguese cities */
  lisbon: 538, porto: 26879, sintra: 50861, faro: 23402,
  /* Czech cities */
  prague: 462,
  /* Hungarian cities */
  budapest: 499,
  /* Greek cities */
  athens: 496, santorini: 959,
  /* Croatian cities */
  dubrovnik: 904,
  /* Irish cities */
  dublin: 503,
  /* Danish cities */
  copenhagen: 463,
  /* Polish cities */
  krakow: 529,
  /* Swedish cities */
  stockholm: 907,
  /* Norwegian cities */
  oslo: 902, bergen: 4318,
  /* Finnish cities */
  helsinki: 803,
  /* Icelandic cities */
  reykjavik: 905,
  /* Estonian cities */
  tallinn: 4147,
  /* Latvian cities */
  riga: 4480,
  /* Lithuanian cities */
  vilnius: 5479,
  /* Turkish cities */
  istanbul: 585,
  /* Romanian cities */
  bucharest: 22134,
  /* Bulgarian cities */
  sofia: 5630,
  /* Serbian cities */
  belgrade: 22817,
  /* Montenegrin cities */
  kotor: 23078,
  /* Slovenian cities */
  ljubljana: 5257,
  /* Slovak cities */
  bratislava: 5561,
  /* Luxembourgish cities */
  "luxembourg-city": 36689,
  /* Maltese cities */
  valletta: 4142,
  /* Cypriot cities */
  paphos: 5629,
  /* Thai cities */
  bangkok: 343, phuket: 349, "chiang-mai": 5267,
  /* Japanese cities */
  tokyo: 334, kyoto: 332, osaka: 333,
  /* Indonesian cities */
  bali: 98,
  /* UAE cities */
  dubai: 828, "abu-dhabi": 4474,
  /* Vietnamese cities */
  hanoi: 351, "ho-chi-minh-city": 352,
  /* South Korean cities */
  seoul: 973,
  /* Indian cities */
  delhi: 804, jaipur: 4627, mumbai: 953,
  /* Israeli cities */
  jerusalem: 921, "tel-aviv": 920,
  /* Chinese cities */
  beijing: 321, shanghai: 325,
  /* Malaysian cities */
  "kuala-lumpur": 335,
  /* American cities */
  "new-york": 687,
  /* Mexican cities */
  cancun: 631, "mexico-city": 628,
  /* Brazilian cities */
  "rio-de-janeiro": 712,
  /* Argentinian cities */
  "buenos-aires": 901,
  /* Peruvian cities */
  cusco: 937,
  /* Colombian cities */
  medellin: 4563,
  /* Costa Rican cities */
  "san-jose-cr": 793,
  /* Australian cities */
  sydney: 357,
  /* New Zealand cities */
  auckland: 391, queenstown: 407,
  /* Fijian cities */
  fiji: 23,
  /* South African cities */
  "cape-town": 318,
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

function extractImageUrl(product: Record<string, unknown>, imageIndex = 0): string {
  const images = (product.images || []) as Record<string, unknown>[];
  if (!images.length) return "";
  const img = images[Math.min(imageIndex, images.length - 1)];
  const variants = (img.variants || []) as Record<string, unknown>[];
  // Try 480px, then 360px, then any
  const v480 = variants.find((v) => v.width === 480);
  const v360 = variants.find((v) => v.width === 360);
  const vAny = variants[0];
  return (v480?.url || v360?.url || vAny?.url || img.url || "") as string;
}

/**
 * Extract multiple image URLs from a single product (uses different images from same product)
 */
function extractMultipleImageUrls(product: Record<string, unknown>, maxImages = 3): string[] {
  const images = (product.images || []) as Record<string, unknown>[];
  const urls: string[] = [];
  for (let i = 0; i < Math.min(images.length, maxImages); i++) {
    const url = extractImageUrl(product, i);
    if (url) urls.push(url);
  }
  return urls;
}

/**
 * Get top product images for a city
 * Uses offset to avoid duplicates with category-specific pages (which start at position 1)
 * Also extracts multiple images per product for more variety
 */
export async function getCityImages(city: string, count = 3, offset = 0): Promise<{ url: string; caption: string }[]> {
  const cacheKey = `city:${city.toLowerCase()}:o${offset}`;
  const cached = imageCache.get(cacheKey);
  if (cached && cached[0]?.timestamp > Date.now() - CACHE_TTL) {
    return cached.slice(0, count);
  }

  const destId = DEST_IDS[city.toLowerCase()];
  if (!destId || !VIATOR_API_KEY) return [];

  try {
    // Fetch more products and start later to avoid overlap with category pages
    const fetchCount = Math.max(count * 3, 18);
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        filtering: { destination: destId.toString() },
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        pagination: { start: 1 + offset, count: fetchCount },
        currency: "EUR",
      }),
      next: { revalidate: 86400 }, // Next.js cache: 24 hours
    });

    if (!res.ok) return [];
    const data = await res.json();

    const seen = new Set<string>();
    const images: { url: string; caption: string; timestamp: number }[] = [];

    for (const p of (data.products || []) as Record<string, unknown>[]) {
      // Extract multiple images per product for more diversity
      const urls = extractMultipleImageUrls(p, 2);
      const caption = (p.title as string) || "";
      // Skip Anne Frank related
      if (caption.toLowerCase().includes("anne frank")) continue;
      for (const url of urls) {
        if (!url || seen.has(url)) continue;
        seen.add(url);
        images.push({ url, caption, timestamp: Date.now() });
      }
    }

    imageCache.set(cacheKey, images);
    return images.slice(0, count);
  } catch {
    return [];
  }
}

/**
 * Get top product images for a category (in Amsterdam as default)
 * Extracts multiple images per product for more variety and deduplicates
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
    const fetchCount = Math.max(count * 2, 10);
    const res = await fetch(`${VIATOR_API_BASE}/products/search`, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        filtering: {
          destination: destId.toString(),
          tags: [tagId],
        },
        sorting: { sort: "TRAVELER_RATING", order: "DESCENDING" },
        pagination: { start: 1, count: fetchCount },
        currency: "EUR",
      }),
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];
    const data = await res.json();

    const seen = new Set<string>();
    const images: { url: string; caption: string; timestamp: number }[] = [];

    for (const p of (data.products || []) as Record<string, unknown>[]) {
      const caption = (p.title as string) || "";
      if (caption.toLowerCase().includes("anne frank")) continue;
      // Use multiple images per product for more variety
      const imgsPerProduct = count > 4 ? 2 : 1;
      const urls = extractMultipleImageUrls(p, imgsPerProduct);
      for (const url of urls) {
        if (!url || seen.has(url)) continue;
        seen.add(url);
        images.push({ url, caption, timestamp: Date.now() });
      }
    }

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
  // Check persistent cache first
  const cacheKey = "all-city-images-v2";
  const cached = imageCache.get(cacheKey);
  if (cached && cached[0]?.timestamp > Date.now() - CACHE_TTL * 24) {
    const result: Record<string, string> = {};
    cached.forEach((c) => { result[c.caption] = c.url; });
    return result;
  }

  const results: Record<string, string> = {};
  const BATCH_SIZE = 5;
  const DELAY_MS = 200;

  // Batch requests with delay to avoid Viator API rate limiting
  for (let i = 0; i < cities.length; i += BATCH_SIZE) {
    const batch = cities.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async (city) => {
        try {
          const images = await getCityImages(city, 1);
          if (images.length > 0) {
            results[city.toLowerCase()] = images[0].url;
          }
        } catch {
          // Skip failed cities silently
        }
      })
    );
    // Small delay between batches to avoid rate limiting
    if (i + BATCH_SIZE < cities.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS));
    }
  }

  // Store in persistent cache (24 hours)
  const cacheEntries = Object.entries(results).map(([city, url]) => ({
    url,
    caption: city,
    timestamp: Date.now(),
  }));
  if (cacheEntries.length > 0) {
    imageCache.set(cacheKey, cacheEntries);
  }

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
