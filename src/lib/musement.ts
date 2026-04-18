/**
 * TUI Musement Partner API v3 - Merchant Connector
 * Handles product search, availability, booking, and cancellation
 * TicketMatch is Merchant of Record - we handle payments, tickets, and first-line support
 */

const MUSEMENT_API_BASE = process.env.MUSEMENT_API_BASE || "https://api.musement.com/api/v3";
const MUSEMENT_API_KEY = process.env.MUSEMENT_API_KEY || "";

// ─── Types ───────────────────────────────────────────────────────────────────

export type MusementProduct = {
  uuid: string;
  title: string;
  description: string;
  duration: string;
  rating: number;
  reviewCount: number;
  pricing: {
    currency: string;
    netPrice: number;       // What we pay Musement
    retailPrice: number;    // Suggested selling price
    formatted: string;      // Display price for customers
    margin: number;         // Our margin percentage
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
  cancellationPolicy?: string;
  musementUrl: string;
};

export type MusementSearchParams = {
  cityId?: number;
  cityName?: string;
  categoryId?: number;
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

function getHeaders(language = "en") {
  return {
    "Accept": "application/json",
    "Accept-Language": language,
    "X-Musement-Version": "3.5.0",
    "X-Musement-Currency": "EUR",
    ...(MUSEMENT_API_KEY ? { "Authorization": `Bearer ${MUSEMENT_API_KEY}` } : {}),
    "Content-Type": "application/json",
  };
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
    const res = await fetch(
      `${MUSEMENT_API_BASE}/cities?limit=10&offset=0&sort_by=weight&country_in=82`,
      { headers: getHeaders(language) }
    );

    if (!res.ok) {
      // Fallback: search all cities by name
      const searchRes = await fetch(
        `${MUSEMENT_API_BASE}/cities?limit=10&offset=0&sort_by=weight`,
        { headers: getHeaders(language) }
      );
      if (!searchRes.ok) return null;

      const cities = await searchRes.json();
      const match = (cities as Record<string, unknown>[]).find(
        (c) => (c.name as string)?.toLowerCase() === key
      );
      if (match) {
        cityIdCache.set(key, match.id as number);
        return match.id as number;
      }
      return null;
    }

    const cities = await res.json();

    // Cache all Dutch cities from this response
    for (const city of cities as Record<string, unknown>[]) {
      const name = (city.name as string)?.toLowerCase();
      if (name) {
        cityIdCache.set(name, city.id as number);
      }
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
      { headers: getHeaders(language) }
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

  const limit = params.limit || 20;
  const offset = params.offset || 0;
  const currency = params.currency || "EUR";

  try {
    let url = `${MUSEMENT_API_BASE}/cities/${cityId}/activities?limit=${limit}&offset=${offset}`;

    if (params.sortBy === "price") {
      url += "&sort_by=price";
    } else if (params.sortBy === "rating") {
      url += "&sort_by=rating";
    } else {
      url += "&sort_by=relevance";
    }

    const res = await fetch(url, {
      headers: {
        ...getHeaders(params.language),
        "X-Musement-Currency": currency,
      },
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

    const products: MusementProduct[] = activities.map((a: Record<string, unknown>) =>
      mapActivityToProduct(a, params.cityName || "", currency)
    );

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
  const limit = params.limit || 20;
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
export async function getActivity(uuid: string, language = "en", currency = "EUR"): Promise<MusementProduct | null> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/activities/${uuid}`, {
      headers: {
        ...getHeaders(language),
        "X-Musement-Currency": currency,
      },
    });

    if (!res.ok) return null;

    const a = await res.json();
    return mapActivityToProduct(a, "", currency);
  } catch (err) {
    console.error("Musement activity detail error:", err);
    return null;
  }
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

// ─── Cart & Booking (Merchant of Record) ────────────────────────────────────

/**
 * Create a cart for booking
 */
export async function createCart(language = "en"): Promise<string | null> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/carts`, {
      method: "POST",
      headers: getHeaders(language),
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
 * Add an item to the cart
 */
export async function addToCart(
  cartUuid: string,
  activityUuid: string,
  dateId: string,
  quantity: number,
  language = "en"
): Promise<boolean> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/carts/${cartUuid}/items`, {
      method: "POST",
      headers: getHeaders(language),
      body: JSON.stringify({
        activity_uuid: activityUuid,
        date_id: dateId,
        quantity,
        type: "FULL_PRICE",
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Musement add to cart error:", err);
    return false;
  }
}

/**
 * Set customer info on cart
 */
export async function setCartCustomer(
  cartUuid: string,
  customer: { firstName: string; lastName: string; email: string; phone?: string },
  language = "en"
): Promise<boolean> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/carts/${cartUuid}/customer`, {
      method: "PUT",
      headers: getHeaders(language),
      body: JSON.stringify({
        firstname: customer.firstName,
        lastname: customer.lastName,
        email: customer.email,
        ...(customer.phone ? { phone_number: customer.phone } : {}),
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Musement set customer error:", err);
    return false;
  }
}

/**
 * Confirm the order (creates a Reservation Notification to Musement)
 * Returns the order with E-tickets
 */
export async function confirmOrder(
  cartUuid: string,
  language = "en"
): Promise<MusementBooking | null> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/carts/${cartUuid}/order`, {
      method: "POST",
      headers: getHeaders(language),
    });

    if (!res.ok) {
      console.error(`Musement order error: ${res.status} ${res.statusText}`);
      return null;
    }

    const order = await res.json();
    return {
      orderId: (order.uuid as string) || (order.id as string),
      status: mapOrderStatus(order.status as string),
      tickets: ((order.items || []) as Record<string, unknown>[]).map((item) => ({
        ticketId: (item.uuid as string) || "",
        barcode: item.barcode as string,
        qrCode: item.qr_code as string,
        pdfUrl: item.voucher_url as string,
      })),
      totalNetPrice: order.total_net_price as number || 0,
      totalRetailPrice: order.total_retail_price as number || 0,
    };
  } catch (err) {
    console.error("Musement confirm order error:", err);
    return null;
  }
}

/**
 * Get order details (including E-tickets)
 */
export async function getOrder(orderId: string, language = "en"): Promise<MusementBooking | null> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/orders/${orderId}`, {
      headers: getHeaders(language),
    });

    if (!res.ok) return null;

    const order = await res.json();
    return {
      orderId: (order.uuid as string) || (order.id as string),
      status: mapOrderStatus(order.status as string),
      tickets: ((order.items || []) as Record<string, unknown>[]).map((item) => ({
        ticketId: (item.uuid as string) || "",
        barcode: item.barcode as string,
        qrCode: item.qr_code as string,
        pdfUrl: item.voucher_url as string,
      })),
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
export async function cancelOrderItem(
  orderId: string,
  itemId: string,
  reason?: string,
  language = "en"
): Promise<boolean> {
  try {
    const res = await fetch(`${MUSEMENT_API_BASE}/orders/${orderId}/items/${itemId}/cancel`, {
      method: "POST",
      headers: getHeaders(language),
      body: JSON.stringify({
        reason: reason || "Customer request",
      }),
    });

    return res.ok;
  } catch (err) {
    console.error("Musement cancel error:", err);
    return false;
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

function mapActivityToProduct(a: Record<string, unknown>, cityName: string, currency: string): MusementProduct {
  const netPrice = (a.net_price as number) || (a.retail_price as Record<string, unknown>)?.value as number || 0;
  const retailPrice = (a.retail_price as Record<string, unknown>)?.value as number
    || (a.retail_price as number)
    || (a.original_retail_price as Record<string, unknown>)?.value as number
    || netPrice;

  const margin = retailPrice > 0 ? ((retailPrice - netPrice) / retailPrice) * 100 : 18;

  // Extract city from the activity data
  const city = (a.city as Record<string, unknown>)?.name as string || cityName;
  const country = (a.country as Record<string, unknown>)?.name as string
    || (a.city as Record<string, unknown>)?.country as Record<string, unknown>
    ? ((a.city as Record<string, unknown>)?.country as Record<string, unknown>)?.name as string
    : "";

  return {
    uuid: a.uuid as string,
    title: a.title as string || "",
    description: ((a.description as string) || (a.about as string) || "").slice(0, 300),
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
    },
    images: ((a.cover_image_url as string)
      ? [{ url: a.cover_image_url as string }]
      : ((a.images || []) as Record<string, unknown>[]).slice(0, 5).map((img) => ({
          url: (img.url as string) || "",
          caption: (img.caption as string) || "",
        }))
    ),
    categories: ((a.taxonomies || []) as Record<string, unknown>[]).map(
      (t) => (t.name as string) || ""
    ).filter(Boolean).slice(0, 3),
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
    cancellationPolicy: (a.free_cancellation as boolean) ? "Free cancellation" : "Non-refundable",
    musementUrl: (a.url as string) || "",
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
