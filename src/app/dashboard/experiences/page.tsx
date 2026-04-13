"use client";

import { useEffect, useState, useCallback } from "react";

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
  const [city, setCity] = useState("amsterdam");
  const [customCity, setCustomCity] = useState<CustomCity>(null);
  const [citySearch, setCitySearch] = useState("");
  const [cityResults, setCityResults] = useState<{ id: number; name: string; type: string }[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState("21514");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [search, setSearch] = useState("");
  const [products, setProducts] = useState<ViatorProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [showMoreNL, setShowMoreNL] = useState(false);

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

  const fetchExperiences = useCallback(async (selectedCity: string, selectedCategory: string, destId?: number, startPage = 1, append = false) => {
    if (append) {
      setLoadingMore(true);
    } else {
      setLoading(true);
    }
    setError("");
    try {
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
      if (!res.ok) throw new Error("Failed to load experiences");
      const data = await res.json();
      if (append) {
        setProducts((prev) => [...prev, ...(data.products || [])]);
      } else {
        setProducts(data.products || []);
      }
      setTotalCount(data.totalCount || 0);
      setPage(startPage);
    } catch {
      setError("Could not load experiences. Please try again.");
      if (!append) setProducts([]);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    setPage(1);
    setSearch("");
    const activeTag = subCategoryFilter || categoryFilter;
    if (customCity) {
      fetchExperiences(customCity.name, activeTag, customCity.id, 1, false);
    } else {
      fetchExperiences(city, activeTag, undefined, 1, false);
    }
  }, [city, customCity, categoryFilter, subCategoryFilter, fetchExperiences]);

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

  // Client-side search filter only (categories are handled server-side)
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

  const hasMore = products.length < totalCount;

  const activeCityLabel = customCity
    ? customCity.name
    : [...NL_CITIES, ...MORE_NL_CITIES, ...EU_CITIES].find((c) => c.value === city)?.label || city;

  return (
    <div onClick={() => { setShowCityDropdown(false); setShowMoreNL(false); }}>
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

      {/* Banner 1: The Netherlands */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted/70">🇳🇱 Netherlands</span>
        {NL_CITIES.map((c) => (
          <button
            key={c.value}
            onClick={() => handleSelectCity(c.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              city === c.value && !customCity
                ? c.value === "all" ? "bg-foreground text-white" : "bg-accent text-white"
                : c.value === "all" ? "border border-foreground/30 bg-white text-foreground hover:bg-foreground hover:text-white" : "border border-border bg-white text-muted hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
        {/* More NL cities dropdown */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowMoreNL(!showMoreNL)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              MORE_NL_CITIES.some((c) => c.value === city) && !customCity
                ? "bg-accent text-white"
                : "border-2 border-dashed border-accent/40 bg-accent/5 text-accent hover:border-accent hover:bg-accent/10"
            }`}
          >
            {MORE_NL_CITIES.find((c) => c.value === city && !customCity)?.label || "More NL"} ▾
          </button>
          {showMoreNL && (
            <div className="absolute left-0 top-9 z-50 w-44 rounded-xl border border-border bg-white py-1 shadow-xl">
              {MORE_NL_CITIES.map((c) => (
                <button
                  key={c.value}
                  onClick={() => { handleSelectCity(c.value); setShowMoreNL(false); }}
                  className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                    city === c.value && !customCity
                      ? "bg-accent/10 text-accent font-medium"
                      : "hover:bg-accent/5 text-foreground"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Banner 2: More Cities (Europe) */}
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="mr-1 text-xs font-semibold uppercase tracking-wider text-muted/70">🌍 More Cities</span>
        {EU_CITIES.map((c) => (
          <button
            key={c.value}
            onClick={() => handleSelectCity(c.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors ${
              city === c.value && !customCity
                ? "bg-accent text-white"
                : "border border-border bg-white text-muted hover:text-foreground"
            }`}
          >
            {c.label}
          </button>
        ))}
        {/* Custom city search */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <input
            type="text"
            placeholder="Search 3,000+ cities..."
            value={customCity && !citySearch ? customCity.name : citySearch}
            onChange={(e) => { setCitySearch(e.target.value); if (customCity) setCustomCity(null); }}
            onFocus={() => { if (cityResults.length > 0) setShowCityDropdown(true); }}
            className={`h-[30px] w-44 rounded-full border-2 border-dashed px-4 text-xs font-medium outline-none transition-all ${
              customCity
                ? "border-accent bg-accent text-white placeholder:text-white/70"
                : "border-accent/40 bg-accent/5 text-accent placeholder:text-accent/50 hover:border-accent hover:bg-accent/10 focus:border-accent focus:bg-white focus:ring-2 focus:ring-accent/10"
            }`}
          />
          {showCityDropdown && cityResults.length > 0 && (
            <div className="absolute left-0 top-9 z-50 w-56 rounded-xl border border-border bg-white py-1 shadow-xl">
              {cityResults.map((dest) => (
                <button
                  key={dest.id}
                  onClick={() => handleSelectCustomCity(dest)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-accent/5 transition-colors"
                >
                  {dest.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Category filters */}
      <div className="mb-3 flex flex-wrap gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat.value}
            onClick={() => { setCategoryFilter(cat.value); setSubCategoryFilter(""); }}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              categoryFilter === cat.value
                ? "bg-foreground text-white"
                : "border border-border bg-white text-muted hover:text-foreground"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Sub-category filters */}
      {subCats.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-1.5">
          <button
            onClick={() => setSubCategoryFilter("")}
            className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
              !subCategoryFilter
                ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                : "border border-accent/20 bg-accent/5 text-accent/70 hover:bg-accent/10"
            }`}
          >
            All {CATEGORIES.find(c => c.value === categoryFilter)?.label}
          </button>
          {subCats.map((sub) => (
            <button
              key={sub.value}
              onClick={() => setSubCategoryFilter(sub.value)}
              className={`rounded-full px-3 py-1.5 text-[11px] font-medium transition-colors ${
                subCategoryFilter === sub.value
                  ? "bg-accent/20 text-accent ring-1 ring-accent/30"
                  : "border border-accent/20 bg-accent/5 text-accent/70 hover:bg-accent/10"
              }`}
            >
              {sub.label}
            </button>
          ))}
        </div>
      )}

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
                key={product.productCode}
                className="group overflow-hidden rounded-2xl border border-border/60 bg-white transition-all hover:border-border hover:shadow-lg hover:shadow-black/[0.03]"
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
                  {/* Flags */}
                  {product.flags.includes("LIKELY_TO_SELL_OUT") && (
                    <span className="absolute right-2 top-2 rounded-lg bg-red-500 px-2 py-0.5 text-[11px] font-bold text-white">
                      Selling fast!
                    </span>
                  )}
                  {product.flags.includes("FREE_CANCELLATION") && (
                    <span className="absolute left-2 top-2 rounded-lg bg-green-600 px-2 py-0.5 text-[11px] font-medium text-white">
                      Free cancellation
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
                        className="rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-medium text-accent"
                      >
                        {cat}
                      </span>
                    ))}
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
                      {product.pricing.amount > 0 ? (
                        <>
                          <p className="text-lg font-bold text-accent">{product.pricing.formatted}</p>
                          <p className="text-xs text-muted">per person</p>
                        </>
                      ) : (
                        <p className="text-sm font-medium text-muted">Price on request</p>
                      )}
                    </div>
                    <a
                      href={product.bookingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl bg-foreground px-4 py-2.5 text-xs font-semibold text-white transition-all hover:bg-gray-800"
                    >
                      View & Book
                    </a>
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
          Experiences powered by Viator &mdash; Prices shown are retail rates
        </p>
      </div>
    </div>
  );
}
