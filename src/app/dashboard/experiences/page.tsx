"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

/* ───── Types ───── */
type ViatorProduct = {
  productCode: string;
  title: string;
  description: string;
  duration: string;
  rating: number;
  reviewCount: number;
  pricing: { currency: string; amount: number; formatted: string };
  images: { url: string; caption?: string }[];
  categories: string[];
  location: { city: string; country: string; lat?: number; lng?: number };
  bookingUrl: string;
  trackingUrl: string;
  flags: string[];
};

type MusementProduct = {
  uuid: string;
  title: string;
  description: string;
  duration: string;
  rating: number;
  reviewCount: number;
  pricing: {
    currency: string;
    netPrice: number;
    retailPrice: number;
    formatted: string;
    margin: number;
  };
  images: { url: string; caption?: string }[];
  categories: string[];
  location: { city: string; country: string; lat?: number; lng?: number };
  bookingType: "merchant";
  flags: string[];
  languages: string[];
  isOwnOffer: boolean;
  cancellationPolicy?: string;
  musementUrl: string;
};

// Unified product type for display
type UnifiedProduct = {
  id: string;
  source: "viator" | "musement";
  title: string;
  description: string;
  duration: string;
  rating: number;
  reviewCount: number;
  price: number;
  priceFormatted: string;
  currency: string;
  images: { url: string; caption?: string }[];
  categories: string[];
  location: { city: string; country: string; lat?: number; lng?: number };
  bookingUrl?: string;     // Viator affiliate link
  bookingType: "affiliate" | "merchant";
  flags: string[];
  isOwnOffer?: boolean;    // Musement TUI in-house
  cancellationPolicy?: string;
  margin?: number;         // Musement margin %
};

function viatorToUnified(p: ViatorProduct): UnifiedProduct {
  return {
    id: p.productCode,
    source: "viator",
    title: p.title,
    description: p.description,
    duration: p.duration,
    rating: p.rating,
    reviewCount: p.reviewCount,
    price: p.pricing.amount,
    priceFormatted: p.pricing.formatted,
    currency: p.pricing.currency,
    images: p.images,
    categories: p.categories,
    location: p.location,
    bookingUrl: p.bookingUrl,
    bookingType: "affiliate",
    flags: p.flags,
  };
}

function musementToUnified(p: MusementProduct): UnifiedProduct {
  return {
    id: p.uuid,
    source: "musement",
    title: p.title,
    description: p.description,
    duration: p.duration,
    rating: p.rating,
    reviewCount: p.reviewCount,
    price: p.pricing.retailPrice,
    priceFormatted: p.pricing.formatted,
    currency: p.pricing.currency,
    images: p.images,
    categories: p.categories,
    location: p.location,
    bookingType: "merchant",
    flags: p.flags,
    isOwnOffer: p.isOwnOffer,
    cancellationPolicy: p.cancellationPolicy,
    margin: p.pricing.margin,
  };
}

type ProductSource = "all" | "viator" | "musement";

/* ───── Constants ───── */
const NL_CITIES = [
  { label: "Amsterdam", value: "amsterdam" },
  { label: "Rotterdam", value: "rotterdam" },
  { label: "Den Haag", value: "the hague" },
  { label: "Utrecht", value: "utrecht" },
  { label: "Eindhoven", value: "eindhoven" },
  { label: "Haarlem", value: "haarlem" },
  { label: "Maastricht", value: "maastricht" },
  { label: "Leiden", value: "leiden" },
  { label: "Groningen", value: "groningen" },
  { label: "All NL", value: "all" },
];

const MORE_NL_CITIES = [
  { label: "Arnhem", value: "arnhem" },
  { label: "Alkmaar", value: "alkmaar" },
  { label: "Gouda", value: "gouda" },
  { label: "Dordrecht", value: "dordrecht" },
  { label: "Zaandam", value: "zaandam" },
  { label: "Hoorn", value: "hoorn" },
  { label: "Nijmegen", value: "nijmegen" },
  { label: "Middelburg", value: "middelburg" },
];

const EU_CITIES = [
  { label: "Brussels", value: "brussels" },
  { label: "Paris", value: "paris" },
  { label: "London", value: "london" },
  { label: "Barcelona", value: "barcelona" },
  { label: "Berlin", value: "berlin" },
  { label: "Madrid", value: "madrid" },
  { label: "Rome", value: "rome" },
  { label: "Lisbon", value: "lisbon" },
  { label: "Vienna", value: "vienna" },
  { label: "Prague", value: "prague" },
];

// Viator tag IDs for main categories
const CATEGORIES = [
  { label: "All Categories", value: "" },
  { label: "Museums", value: "21514" },
  { label: "Attractions", value: "12716" },
  { label: "Canal Cruises", value: "21709" },
  { label: "Tours & Sightseeing", value: "21913" },
  { label: "Art & Culture", value: "21910" },
  { label: "Food & Drink", value: "21911" },
  { label: "Outdoor", value: "21909" },
  { label: "Tickets & Passes", value: "21912" },
  { label: "Activities", value: "12520" },
  { label: "Shows", value: "21635" },
  { label: "Classes", value: "21915" },
  { label: "Transport", value: "21914" },
];

// Musement doesn't expose category info per activity, and its API doesn't
// reliably honour the city + category combination via /activities. To still
// give users a useful category filter on Musement results we filter
// client-side: fetch the full city catalog, then keep only products whose
// title or description matches the category's keyword regex. Coverage is
// best-effort — a few activities will be miscategorised because the title
// doesn't contain the obvious keyword. Keys mirror CATEGORIES + SUB_CATEGORIES
// values so we can apply both main and sub filters.
const MUSEMENT_CATEGORY_KEYWORDS: Record<string, RegExp> = {
  // Main categories
  "21514": /museum|gallery|exhibition|painting|sculpture|monument/i,
  "12716": /attraction|theme.?park|zoo|aquarium|tower|observation|stadium/i,
  "21709": /\bcruise|\bcanal|\bboat|sailing|\bferry/i,
  "21913": /\btour\b|sightseeing|hop.?on|hop.?off|excursion|guide/i,
  "21910": /\bart\b|gallery|museum|theatre|theater|cultural|concert|exhibition/i,
  "21911": /food|wine|beer|tasting|culinary|drink|chef|cooking|dinner|brewery|cheese|chocolate|coffee/i,
  "21909": /outdoor|hiking|bike|bicycle|cycling|nature|garden|adventure|forest|countryside/i,
  "21912": /\bpass\b|\bticket\b|skip.?the.?line|access|combo|entry/i,
  "12520": /./i, // Activities = catch-all by design
  "21635": /\bshow\b|theatre|theater|musical|\bopera\b|comedy|performance|concert/i,
  "21915": /\bclass\b|workshop|lesson|cooking|painting|making|craft/i,
  "21914": /transport|airport|transfer|\bbus\b|\btrain\b|metro|tram|\bferry\b|car.rental/i,

  // Sub-categories (Museums)
  "11901": /museum|exhibition/i,
  "21598": /gallery|\bart\b/i,
  "12031": /art tour|gallery tour/i,
  "12029": /historical|history|heritage/i,
  "12013": /architecture|building/i,

  // Sub-categories (Attractions)
  "11909": /theme.?park|amusement.?park/i,
  "12074": /skip.?the.?line|fast.?track/i,
  "11931": /city.?pass|combo|package/i,
  "11927": /\bzoo\b/i,
  "13110": /observation|deck|tower|skywalk/i,

  // Sub-categories (Canal Cruises)
  "11965": /dinner.cruise|romantic.cruise/i,
  "21729": /sightseeing.?cruise|canal.?cruise/i,
  "11887": /night.?cruise|evening.?cruise/i,
  "11963": /sunset.?cruise/i,
  "11885": /day.?cruise/i,

  // Sub-categories (Tours & Sightseeing)
  "12046": /walking/i,
  "12075": /city.?tour/i,
  "21702": /bike|bicycle/i,
  "11889": /day.?trip|excursion/i,
  "11930": /bus.?tour/i,
  "12058": /hop.?on|hop.?off/i,
  "20255": /boat.?tour|boat.?trip/i,
  "12057": /night.?tour|evening.?tour/i,
  "11941": /private.?tour/i,
};

function filterMusementByCategory<T extends { title?: string; description?: string }>(
  products: T[],
  categoryValue: string
): T[] {
  const re = MUSEMENT_CATEGORY_KEYWORDS[categoryValue];
  if (!re) return products;
  return products.filter((p) => {
    const haystack = `${p.title || ""} ${p.description || ""}`;
    return re.test(haystack);
  });
}

// Sub-categories per main category
const SUB_CATEGORIES: Record<string, { label: string; value: string }[]> = {
  "21514": [
    { label: "Museum Tickets", value: "11901" },
    { label: "Art Galleries", value: "21598" },
    { label: "Art Tours", value: "12031" },
    { label: "Historical Tours", value: "12029" },
    { label: "Architecture", value: "12013" },
  ],
  "12716": [
    { label: "Theme Parks", value: "11909" },
    { label: "Skip the Line", value: "12074" },
    { label: "City Packages", value: "11931" },
    { label: "Zoo Tickets", value: "11927" },
    { label: "Observation Decks", value: "13110" },
  ],
  "21709": [
    { label: "Dinner Cruises", value: "11965" },
    { label: "Sightseeing Cruises", value: "21729" },
    { label: "Night Cruises", value: "11887" },
    { label: "Sunset Cruises", value: "11963" },
    { label: "Day Cruises", value: "11885" },
  ],
  "21913": [
    { label: "Walking Tours", value: "12046" },
    { label: "City Tours", value: "12075" },
    { label: "Bike Tours", value: "21702" },
    { label: "Canal Cruises", value: "21709" },
    { label: "Day Trips", value: "11889" },
    { label: "Bus Tours", value: "11930" },
    { label: "Hop on Hop Off", value: "12058" },
    { label: "Boat Tours", value: "20255" },
    { label: "Night Tours", value: "12057" },
    { label: "Private Tours", value: "11941" },
    { label: "Half-day Tours", value: "11929" },
    { label: "Full-day Tours", value: "11928" },
  ],
  "21910": [
    { label: "Museums", value: "21514" },
    { label: "Art Galleries", value: "21598" },
    { label: "Historical Tours", value: "12029" },
    { label: "Cultural Tours", value: "12028" },
    { label: "Castle Tours", value: "21606" },
    { label: "Art Tours", value: "12031" },
    { label: "Ghost Tours", value: "12066" },
    { label: "Theater Shows", value: "11908" },
    { label: "Nightlife", value: "12054" },
    { label: "Photography Tours", value: "11969" },
    { label: "Architecture", value: "12013" },
    { label: "Street Art", value: "21519" },
  ],
  "21911": [
    { label: "Food Tours", value: "21567" },
    { label: "Culinary Tours", value: "12053" },
    { label: "Cooking Classes", value: "12034" },
    { label: "Wine Tastings", value: "11891" },
    { label: "Beer & Brewery", value: "11953" },
    { label: "Bar Tours", value: "21559" },
    { label: "Coffee & Tea", value: "21560" },
    { label: "Street Food", value: "20245" },
    { label: "Dining", value: "11890" },
    { label: "Markets", value: "20226" },
    { label: "Chocolate Tours", value: "20205" },
    { label: "Pub Tours", value: "12033" },
  ],
  "21909": [
    { label: "Hiking", value: "11902" },
    { label: "Kayaking", value: "12047" },
    { label: "Bike Rentals", value: "12009" },
    { label: "Sailing", value: "11888" },
    { label: "Snorkeling", value: "11912" },
    { label: "Scuba Diving", value: "12021" },
    { label: "Fishing", value: "12036" },
    { label: "Climbing", value: "11949" },
    { label: "Surfing", value: "12048" },
    { label: "Whale Watching", value: "12052" },
    { label: "Nature & Wildlife", value: "11903" },
    { label: "Zoos & Parks", value: "21456" },
  ],
  "21912": [
    { label: "Museum Tickets", value: "11901" },
    { label: "Theme Parks", value: "11909" },
    { label: "City Packages", value: "11931" },
    { label: "Skip the Line", value: "12074" },
    { label: "Concerts", value: "21609" },
    { label: "Musicals", value: "21628" },
    { label: "Sporting Events", value: "12040" },
    { label: "Comedy Shows", value: "11907" },
    { label: "Zoo Tickets", value: "11927" },
    { label: "Observation Decks", value: "13110" },
  ],
  "21915": [
    { label: "Cooking Classes", value: "12034" },
    { label: "Art Classes", value: "20202" },
    { label: "Dance Lessons", value: "20209" },
    { label: "Yoga", value: "11976" },
    { label: "Painting", value: "20233" },
    { label: "Pottery", value: "20237" },
    { label: "Language Classes", value: "20223" },
    { label: "Craft Classes", value: "20208" },
  ],
};

const PAGE_SIZE = 30;

// ISO 3166-1 alpha-2 → flag emoji (regional indicator pair).
function isoToFlag(iso: string): string {
  if (!iso || iso.length !== 2) return "🏳";
  const A = 0x1f1e6 - "A".charCodeAt(0);
  return String.fromCodePoint(iso.toUpperCase().charCodeAt(0) + A, iso.toUpperCase().charCodeAt(1) + A);
}

// Iconography for Musement's 7 verticals (taal-neutraal — keyed by English name).
const VERTICAL_ICONS: Record<string, string> = {
  "Museums & art": "📚",
  "Tours & attractions": "🎯",
  "Food & wine": "🍷",
  "Active & adventure": "🚴",
  "Performances": "🎭",
  "Sports": "⚽",
  "Nightlife": "🌃",
};

function StarRating({ rating, count }: { rating: number; count: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-amber-500">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className="h-3.5 w-3.5" fill={i < full ? "currentColor" : i === full && half ? "url(#half)" : "none"} stroke="currentColor" strokeWidth={1.5} viewBox="0 0 20 20">
          {i === full && half && (
            <defs>
              <linearGradient id="half">
                <stop offset="50%" stopColor="currentColor" />
                <stop offset="50%" stopColor="transparent" />
              </linearGradient>
            </defs>
          )}
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="ml-0.5 text-muted">
        {rating.toFixed(1)} ({count.toLocaleString()})
      </span>
    </span>
  );
}

type CustomCity = { id: number; name: string } | null;

export default function ExperiencesPage() {
  const router = useRouter();
  const [city, setCity] = useState("amsterdam");
  const [customCity, setCustomCity] = useState<CustomCity>(null);
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<{ id: number; name: string; type: string }[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("21514");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<UnifiedProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [showMoreNL, setShowMoreNL] = useState(false);
  // Musement is primary supplier (live since 2026-04-23). Viator Affiliate
  // kept as fallback for cities Musement doesn't cover yet.
  const [source, setSource] = useState<ProductSource>("musement");

  // ─── Country → City → Vertical hierarchy (Musement taxonomy) ──────────────
  type CountryOpt = { id: number; name: string; iso: string };
  type CityOpt = { id: number; name: string; count: number; weight: number };
  type VerticalOpt = { id: number; name: string };
  const [country, setCountry] = useState<string>("NL"); // ISO 2-letter
  const [countries, setCountries] = useState<CountryOpt[]>([]);
  const [countryCities, setCountryCities] = useState<CityOpt[]>([]);
  const [verticals, setVerticals] = useState<VerticalOpt[]>([]);
  // 0 = "All", -1 = synthetic "Combos" bucket, else a real Musement vertical id.
  const [verticalSel, setVerticalSel] = useState<number>(0);
  const [showCountryDD, setShowCountryDD] = useState(false);
  const [countrySearch, setCountrySearch] = useState("");
  const [showCityDD2, setShowCityDD2] = useState(false);

  // City search with debounce
  useEffect(() => {
    if (citySearch.length < 2) { setCityResults([]); return; }
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/viator/destinations?q=${encodeURIComponent(citySearch)}`);
        const data = await res.json();
        setCityResults(data.destinations || []);
        setShowCityDropdown(true);
      } catch { setCityResults([]); }
    }, 300);
    return () => clearTimeout(timer);
  }, [citySearch]);

  // Load Musement countries + verticals once on mount.
  useEffect(() => {
    (async () => {
      try {
        const [cRes, vRes] = await Promise.all([
          fetch("/api/musement/countries"),
          fetch("/api/musement/verticals"),
        ]);
        const cData = await cRes.json();
        const vData = await vRes.json();
        setCountries(cData.countries || []);
        setVerticals(vData.verticals || []);
      } catch {
        // non-fatal — UI gracefully renders the legacy chip rows
      }
    })();
  }, []);

  // Load cities whenever country changes.
  useEffect(() => {
    if (!country) return;
    (async () => {
      try {
        const res = await fetch(`/api/musement/cities?country=${country}`);
        const data = await res.json();
        const list: CityOpt[] = data.cities || [];
        setCountryCities(list);
        // Auto-select first city of new country if current city isn't in list.
        if (list.length && !list.some((c) => c.name.toLowerCase() === city)) {
          setCity(list[0].name.toLowerCase());
          setCustomCity(null);
        }
      } catch {
        setCountryCities([]);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country]);

  // Fetch from Viator
  const fetchViator = useCallback(async (selectedCity: string, selectedCategory: string, destId?: number, startPage = 1): Promise<{ products: UnifiedProduct[]; totalCount: number }> => {
    const payload: Record<string, unknown> = {
      limit: PAGE_SIZE,
      start: (startPage - 1) * PAGE_SIZE + 1,
      currency: "EUR",
    };
    if (destId) {
      payload.destinationId = destId;
      payload.city = selectedCity;
    } else {
      payload.city = selectedCity;
    }
    if (selectedCategory) {
      payload.category = selectedCategory;
    }
    const res = await fetch("/api/viator/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { products: [], totalCount: 0 };
    const data = await res.json();
    return {
      products: (data.products || []).map(viatorToUnified),
      totalCount: data.totalCount || 0,
    };
  }, []);

  // Fetch from Musement.
  //
  // When a category is active we widen the upstream batch (Musement's hard
  // ceiling is 100/page) so the client-side keyword filter has enough raw
  // material to surface a useful subset. Without a category we keep PAGE_SIZE
  // for normal pagination behaviour.
  const fetchMusement = useCallback(async (
    selectedCity: string,
    selectedCategory: string,
    startPage = 1,
  ): Promise<{ products: UnifiedProduct[]; totalCount: number }> => {
    // Vertical filter (real Musement taxonomy) takes precedence over the
    // legacy keyword-based category filter. -1 = synthetic "Combos" bucket.
    const useVertical = verticalSel > 0;
    const useCombo = verticalSel === -1;
    const wantsCategoryFilter =
      !useVertical && !useCombo &&
      !!selectedCategory && !!MUSEMENT_CATEGORY_KEYWORDS[selectedCategory];
    const upstreamLimit = (wantsCategoryFilter || useCombo) ? 100 : PAGE_SIZE;
    const payload: Record<string, unknown> = {
      cityName: selectedCity,
      limit: upstreamLimit,
      offset: (startPage - 1) * upstreamLimit,
      currency: "EUR",
      language: "en",
      sortBy: "relevance",
    };
    if (useVertical) payload.verticalId = verticalSel;
    if (useCombo) payload.comboOnly = true;

    const res = await fetch("/api/musement/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) return { products: [], totalCount: 0 };
    const data = await res.json();
    const rawProducts = (data.products || []) as MusementProduct[];
    const filteredRaw = wantsCategoryFilter
      ? filterMusementByCategory(rawProducts, selectedCategory)
      : rawProducts;
    return {
      products: filteredRaw.map(musementToUnified),
      totalCount: (wantsCategoryFilter || useCombo) ? filteredRaw.length : (data.totalCount || 0),
    };
  }, [verticalSel]);

  const fetchExperiences = useCallback(async (selectedCity: string, selectedCategory: string, destId?: number, startPage = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
      let allProducts: UnifiedProduct[] = [];
      let allCount = 0;

      if (source === "viator" || source === "all") {
        const viatorData = await fetchViator(selectedCity, selectedCategory, destId, startPage);
        allProducts = [...allProducts, ...viatorData.products];
        allCount += viatorData.totalCount;
      }

      if (source === "musement" || source === "all") {
        const musementData = await fetchMusement(selectedCity, selectedCategory, startPage);
        allProducts = [...allProducts, ...musementData.products];
        allCount += musementData.totalCount;
      }

      // Sort merged results: Musement first (higher margin), then by rating
      if (source === "all") {
        allProducts.sort((a, b) => {
          // Musement products first
          if (a.source !== b.source) return a.source === "musement" ? -1 : 1;
          // Then by rating
          return b.rating - a.rating;
        });
      }

      if (append) {
        setProducts((prev) => [...prev, ...allProducts]);
      } else {
        setProducts(allProducts);
      }
      setTotalCount(allCount);
      setPage(startPage);
    } catch {
      setError("Could not load experiences. Please try again.");
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [source, fetchViator, fetchMusement]);

  useEffect(() => {
    setPage(1);
    setSearch("");
    const activeTag = subCategoryFilter || categoryFilter;
    if (customCity) {
      fetchExperiences(customCity.name, activeTag, customCity.id, 1, false);
    } else {
      fetchExperiences(city, activeTag, undefined, 1, false);
    }
  }, [city, customCity, categoryFilter, subCategoryFilter, source, verticalSel, fetchExperiences]);

  const handleLoadMore = () => {
    const activeTag = subCategoryFilter || categoryFilter;
    if (customCity) {
      fetchExperiences(customCity.name, activeTag, customCity.id, page + 1, true);
    } else {
      fetchExperiences(city, activeTag, undefined, page + 1, true);
    }
  };

  const handleSelectCity = (preset: string) => {
    setCity(preset);
    setCustomCity(null);
    setCitySearch("");
    setShowCityDropdown(false);
  };

  const handleSelectCustomCity = (dest: { id: number; name: string }) => {
    setCustomCity(dest);
    setCity("");
    setCitySearch("");
    setShowCityDropdown(false);
    setCityResults([]);
  };

  const subCats = SUB_CATEGORIES[categoryFilter] || [];

  // Client-side search filter
  const filtered = search
    ? products.filter((p) => {
        const q = search.toLowerCase();
        return (
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.categories.some((c) => c.toLowerCase().includes(q))
        );
      })
    : products;

  const viatorCount = products.filter((p) => p.source === "viator").length;
  const musementCount = products.filter((p) => p.source === "musement").length;

  const hasMore = products.length < totalCount;

  const activeCityLabel = customCity
    ? customCity.name
    : [...NL_CITIES, ...MORE_NL_CITIES, ...EU_CITIES].find((c) => c.value === city)?.label || city;

  return (
    <div onClick={() => { setShowCityDropdown(false); setShowMoreNL(false); setShowCountryDD(false); setShowCityDD2(false); }}>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Experiences{customCity ? ` — ${customCity.name}` : ""}
          </h1>
          <p className="mt-1 text-sm text-muted">
            Discover tours, activities, and attractions for your groups.
            {totalCount > 0 && (
              <span className="ml-2 font-medium text-accent">
                {totalCount.toLocaleString()} experiences available
              </span>
            )}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search in results..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-10 w-64 rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
        />
      </div>

      {/* Source Toggle */}
      <div className="mb-4 flex items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted/70">Source</span>
        {([
          { key: "musement" as ProductSource, label: "Musement", icon: "🎫", sublabel: "Primary · Merchant" },
          { key: "viator" as ProductSource, label: "Viator", icon: "🌐", sublabel: "Fallback · Affiliate" },
          { key: "all" as ProductSource, label: "All Sources", icon: "🔗" },
        ]).map((s) => (
          <button
            key={s.key}
            onClick={() => setSource(s.key)}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-semibold transition-all ${
              source === s.key
                ? s.key === "musement"
                  ? "bg-orange-500 text-white shadow-md shadow-orange-500/20"
                  : s.key === "viator"
                  ? "bg-accent text-white shadow-md shadow-accent/20"
                  : "bg-foreground text-white shadow-md"
                : "border border-border bg-white text-muted hover:text-foreground hover:border-foreground/30"
            }`}
          >
            <span>{s.icon}</span>
            <span>{s.label}</span>
            {source === s.key && s.sublabel && (
              <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-[10px]">{s.sublabel}</span>
            )}
          </button>
        ))}
        {source === "all" && musementCount > 0 && (
          <span className="ml-2 text-xs text-muted">
            {musementCount} Musement + {viatorCount} Viator
          </span>
        )}
      </div>

      {/* Country + City pickers (Musement taxonomy) */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        {/* Country */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowCountryDD(!showCountryDD)}
            className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted/60">Country</span>
            <span className="text-base leading-none">{isoToFlag(country)}</span>
            <span>{countries.find(c => c.iso === country)?.name || country}</span>
            <span className="text-muted">▾</span>
          </button>
          {showCountryDD && (
            <div className="absolute left-0 top-12 z-50 max-h-96 w-72 overflow-auto rounded-xl border border-border bg-white py-1 shadow-xl">
              <div className="sticky top-0 bg-white p-1">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search country…"
                  value={countrySearch}
                  onChange={(e) => setCountrySearch(e.target.value)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full rounded-lg border border-border px-3 py-1.5 text-sm outline-none focus:border-accent"
                />
              </div>
              {countries
                .filter((c) => {
                  const q = countrySearch.toLowerCase();
                  return !q || c.name.toLowerCase().includes(q) || c.iso.toLowerCase().includes(q);
                })
                .map((c) => (
                  <button
                    key={c.iso}
                    onClick={() => { setCountry(c.iso); setShowCountryDD(false); setCountrySearch(""); }}
                    className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors ${
                      country === c.iso ? "bg-accent/10 font-medium text-accent" : "hover:bg-accent/5"
                    }`}
                  >
                    <span className="text-base leading-none">{isoToFlag(c.iso)}</span>
                    <span className="flex-1">{c.name}</span>
                    <span className="text-xs text-muted/60">{c.iso}</span>
                  </button>
                ))}
              {!countries.length && (
                <div className="px-3 py-2 text-sm text-muted">Loading countries…</div>
              )}
            </div>
          )}
        </div>

        {/* City */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowCityDD2(!showCityDD2)}
            disabled={!countryCities.length}
            className="flex items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <span className="text-[10px] uppercase tracking-wider text-muted/60">City</span>
            <span className="capitalize">
              {customCity?.name
                || countryCities.find((c) => c.name.toLowerCase() === city)?.name
                || (countryCities.length ? "Select…" : "—")}
            </span>
            <span className="text-muted">▾</span>
          </button>
          {showCityDD2 && countryCities.length > 0 && (
            <div className="absolute left-0 top-12 z-50 max-h-96 w-64 overflow-auto rounded-xl border border-border bg-white py-1 shadow-xl">
              {countryCities.map((c) => (
                <button
                  key={c.id}
                  onClick={() => { handleSelectCity(c.name.toLowerCase()); setShowCityDD2(false); }}
                  className={`flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors ${
                    city === c.name.toLowerCase() && !customCity
                      ? "bg-accent/10 font-medium text-accent"
                      : "hover:bg-accent/5"
                  }`}
                >
                  <span>{c.name}</span>
                  {c.count > 0 && <span className="text-xs text-muted/60">{c.count}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Verticals taxonomy row (Musement's own 7 buckets + synthetic Combos) */}
      <div className="mb-6 flex flex-wrap gap-1.5">
        <button
          onClick={() => setVerticalSel(0)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            verticalSel === 0
              ? "bg-foreground text-white"
              : "border border-border bg-white text-muted hover:text-foreground"
          }`}
        >
          All
        </button>
        {verticals.map((v) => (
          <button
            key={v.id}
            onClick={() => setVerticalSel(v.id)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              verticalSel === v.id
                ? "bg-accent text-white"
                : "border border-border bg-white text-muted hover:text-foreground"
            }`}
          >
            {VERTICAL_ICONS[v.name] || "•"} {v.name}
          </button>
        ))}
        <button
          onClick={() => setVerticalSel(-1)}
          className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
            verticalSel === -1
              ? "bg-accent text-white"
              : "border-2 border-dashed border-accent/40 bg-accent/5 text-accent hover:border-accent hover:bg-accent/10"
          }`}
        >
          🎁 Combos
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-border/60 bg-white">
              <div className="h-44 w-full animate-pulse bg-gray-100" />
              <div className="space-y-3 p-5">
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-full animate-pulse rounded bg-gray-100" />
                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">{error}</p>
          <button
            onClick={() => fetchExperiences(city, "")}
            className="mt-3 rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Product grid */}
      {!loading && !error && (
        <>
          {/* Results count */}
          <div className="mb-4 text-sm text-muted">
            Showing {filtered.length} of {totalCount.toLocaleString()} experiences
            {subCategoryFilter && <span> in <strong>{subCats.find(c => c.value === subCategoryFilter)?.label}</strong></span>}
            {categoryFilter && !subCategoryFilter && <span> in <strong>{CATEGORIES.find(c => c.value === categoryFilter)?.label}</strong></span>}
            {search && <span> matching &ldquo;{search}&rdquo;</span>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <div
                key={`${product.source}-${product.id}`}
                className={`group overflow-hidden rounded-2xl border bg-white transition-all hover:shadow-lg hover:shadow-black/[0.03] ${
                  product.source === "musement"
                    ? "border-orange-200 hover:border-orange-300"
                    : "border-border/60 hover:border-border"
                }`}
              >
                {/* Image */}
                <div className="relative h-44 w-full overflow-hidden bg-gray-100">
                  {product.images[0]?.url ? (
                    <img
                      src={product.images[0].url}
                      alt={product.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-muted">
                      <svg className="h-10 w-10" fill="none" stroke="currentColor" strokeWidth={1} viewBox="0 0 24 24">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {/* Duration badge */}
                  {product.duration && (
                    <span className="absolute bottom-2 left-2 rounded-lg bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                      {product.duration}
                    </span>
                  )}
                  {/* Source badge */}
                  <span className={`absolute right-2 bottom-2 rounded-lg px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-sm ${
                    product.source === "musement" ? "bg-orange-500" : "bg-accent"
                  }`}>
                    {product.source === "musement" ? "Musement" : "Viator"}
                  </span>
                  {/* Flags */}
                  {product.flags.includes("LIKELY_TO_SELL_OUT") && (
                    <span className="absolute right-2 top-2 rounded-lg bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                      Selling fast!
                    </span>
                  )}
                  {(product.cancellationPolicy === "Free cancellation" || product.flags.includes("FREE_CANCELLATION")) && (
                    <span className="absolute left-2 top-2 rounded-lg bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white">
                      Free cancellation
                    </span>
                  )}
                  {/* Musement: Own Offer badge — public label scrubs TUI per brand rules */}
                  {product.isOwnOffer && (
                    <span className="absolute left-2 top-8 rounded-lg bg-orange-600 px-2 py-0.5 text-[10px] font-bold text-white">
                      Featured
                    </span>
                  )}
                </div>

                {/* Content */}
                <div className="p-5">
                  {/* Categories */}
                  <div className="mb-2 flex flex-wrap items-center gap-1.5">
                    {product.categories.slice(0, 2).map((cat) => (
                      <span
                        key={cat}
                        className={`rounded-full px-2.5 py-0.5 text-[11px] font-medium ${
                          product.source === "musement"
                            ? "bg-orange-50 text-orange-600"
                            : "bg-accent/10 text-accent"
                        }`}
                      >
                        {cat}
                      </span>
                    ))}
                    {/* Removed internal margin %-chip per brand rule (never show percentages publicly) */}
                  </div>

                  {/* Title */}
                  <h3 className="line-clamp-2 font-semibold leading-snug">{product.title}</h3>

                  {/* Rating */}
                  {product.rating > 0 && (
                    <div className="mt-1.5">
                      <StarRating rating={product.rating} count={product.reviewCount} />
                    </div>
                  )}

                  {/* Description */}
                  <p className="mt-2 line-clamp-2 text-[13px] leading-relaxed text-muted">
                    {product.description}
                  </p>

                  {/* Price + Book button */}
                  <div className="mt-4 flex items-end justify-between border-t border-border/40 pt-4">
                    <div>
                      {product.price > 0 ? (
                        <>
                          <p className={`text-lg font-bold ${product.source === "musement" ? "text-orange-600" : "text-accent"}`}>
                            {product.priceFormatted}
                          </p>
                          <p className="text-xs text-muted">per person</p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-muted">Price on request</p>
                      )}
                    </div>
                    {product.bookingType === "merchant" ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/dashboard/bookings/new?source=musement&activityUuid=${product.id}&title=${encodeURIComponent(product.title)}&price=${product.price}&currency=${product.currency}`
                          )
                        }
                        className="rounded-xl bg-orange-500 px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-orange-600 hover:shadow-md"
                      >
                        Book Direct
                      </button>
                    ) : (
                      <a
                        href={product.bookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800"
                      >
                        View & Book
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Load More button */}
          {hasMore && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="rounded-xl border border-border bg-white px-8 py-3 text-sm font-semibold text-foreground transition-all hover:bg-gray-50 hover:shadow-md disabled:opacity-50"
              >
                {loadingMore ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-20" />
                      <path d="M12 2a10 10 0 0110 10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                    Loading more...
                  </span>
                ) : (
                  `Load more experiences (${products.length} of ${totalCount.toLocaleString()})`
                )}
              </button>
            </div>
          )}
        </>
      )}

      {/* Empty state */}
      {!loading && !error && filtered.length === 0 && (
        <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <p className="text-sm text-muted">
            {search || categoryFilter
              ? "No experiences found matching your filters. Try a different category or search term."
              : "No experiences available for this city yet."}
          </p>
          {(search || categoryFilter) && (
            <button
              onClick={() => { setSearch(""); setCategoryFilter(""); setSubCategoryFilter(""); }}
              className="mt-3 rounded-xl bg-accent px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Powered by */}
      <div className="mt-8 text-center">
        <p className="text-xs text-muted/60">
          Experiences powered by Musement &amp; Viator &mdash; Prices shown are retail rates
        </p>
      </div>
    </div>
  );
}
