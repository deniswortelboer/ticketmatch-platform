"use client";

import { useRouter } from "next/navigation";
import { useState, useCallback, useEffect, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import {
  NL_CITIES,
  CATEGORIES,
  CATEGORY_COLORS,
  CATEGORY_ICONS,
  getVenueBusyness,
  getHourlyBusyness,
  getBusynessFromPercentage,
} from "@/lib/cities";
import type { GoogleVenue, BusynessInfo } from "@/lib/cities";

/* ── Weather helpers ── */
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Freezing fog", icon: "🌫️" },
  51: { label: "Drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  80: { label: "Showers", icon: "🌦️" },
  81: { label: "Heavy showers", icon: "🌧️" },
  95: { label: "Thunder", icon: "⛈️" },
};

type WeatherCurrent = {
  temperature_2m: number;
  apparent_temperature: number;
  weather_code: number;
  wind_speed_10m: number;
};

/* ── Viator types ── */
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
  bookingUrl: string;
  flags: string[];
};

/* ── Viator category filters ── */
const VIATOR_CATEGORIES = [
  { label: "All", value: "" },
  { label: "Museums", value: "21514" },
  { label: "Attractions", value: "12716" },
  { label: "Canal Cruises", value: "21709" },
  { label: "Tours", value: "21913" },
  { label: "Food & Drink", value: "21911" },
];

/* ── Viator city name mapping ── */
const VIATOR_CITY_MAP: Record<string, string | null> = {
  amsterdam: "amsterdam",
  rotterdam: "rotterdam",
  "den-haag": "the hague",
  utrecht: "utrecht",
  eindhoven: "eindhoven",
  groningen: "groningen",
  maastricht: "maastricht",
  haarlem: "haarlem",
  delft: null,
  leiden: "leiden",
  arnhem: "arnhem",
  nijmegen: "nijmegen",
  alkmaar: "alkmaar",
  dordrecht: "dordrecht",
  gouda: "gouda",
  zaandam: "zaandam",
  hoorn: "hoorn",
  middelburg: "middelburg",
};

/* ── Utility functions ── */
function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function walkingTime(km: number) {
  return Math.round((km / 4.5) * 60);
}

function getSmartTip(code: number, temp: number) {
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code);
  if (isRainy) return "🏠 Rain — plan indoor activities";
  if (temp > 25) return "☀️ Hot — stay hydrated, outdoor is great";
  if (temp < 5) return "🧥 Cold — museums & indoor venues recommended";
  if (temp > 15) return "👍 Perfect weather for all activities";
  return "🌤️ Mild — good for mixed indoor/outdoor";
}

/* ── Sub-components ── */
function BusynessChart({
  category,
  liveHourly,
}: {
  category: string;
  liveHourly?: number[] | null;
}) {
  const simulated = getHourlyBusyness(category);
  const currentHour = new Date().getHours();
  const hourly = liveHourly
    ? liveHourly.map((pct, hour) => ({ hour, pct }))
    : simulated;

  return (
    <div className="flex items-end gap-[2px] h-10">
      {hourly
        .filter((h) => h.hour >= 7 && h.hour <= 21)
        .map((h) => {
          const isCurrent = h.hour === currentHour;
          const barColor =
            h.pct >= 75
              ? "bg-red-400"
              : h.pct >= 50
                ? "bg-orange-400"
                : h.pct >= 20
                  ? "bg-amber-400"
                  : "bg-green-400";
          return (
            <div
              key={h.hour}
              className="flex flex-col items-center gap-0.5"
              title={`${h.hour}:00 — ${h.pct}%`}
            >
              <div
                className={`w-[6px] rounded-t-sm ${isCurrent ? "ring-1 ring-blue-500 opacity-100" : "opacity-60"} ${barColor}`}
                style={{ height: `${Math.max(2, (h.pct / 100) * 36)}px` }}
              />
              {(h.hour % 3 === 0 || isCurrent) && (
                <span
                  className={`text-[7px] ${isCurrent ? "text-blue-600 font-bold" : "text-gray-400"}`}
                >
                  {h.hour}
                </span>
              )}
            </div>
          );
        })}
    </div>
  );
}

function BusynessDot({
  info,
  size = "sm",
}: {
  info: BusynessInfo;
  size?: "sm" | "md";
}) {
  if (size === "md") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          info.level === "quiet"
            ? "bg-green-50 text-green-600"
            : info.level === "moderate"
              ? "bg-amber-50 text-amber-600"
              : info.level === "busy"
                ? "bg-orange-50 text-orange-600"
                : "bg-red-50 text-red-600"
        }`}
      >
        {info.icon} {info.label}
      </span>
    );
  }
  return (
    <span
      className="text-[10px]"
      title={`${info.label} (${info.percentage}%)`}
    >
      {info.icon}
    </span>
  );
}

function VenuePhoto({
  photo,
  name,
  size = "sm",
}: {
  photo: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  if (!photo) {
    return (
      <div
        className={`${size === "md" ? "h-10 w-10" : "h-9 w-9"} shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs`}
      >
        📍
      </div>
    );
  }
  return (
    <img
      src={`/api/places/photo?ref=${photo}&maxwidth=${size === "md" ? "200" : "100"}`}
      alt={name}
      className={`${size === "md" ? "h-10 w-10" : "h-9 w-9"} shrink-0 rounded-lg object-cover`}
    />
  );
}

/* ── Tabs ── */
type TabId = "explore" | "route" | "booked";

/* ══════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════════ */
export default function CommandCenterPage() {
  const router = useRouter();
  /* ── City state ── */
  const [cityIdx, setCityIdx] = useState(0);
  const city = NL_CITIES[cityIdx];
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

  /* ── Map / venue state ── */
  const [venues, setVenues] = useState<GoogleVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVenue, setSelectedVenue] = useState<GoogleVenue | null>(null);
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");

  /* ── Weather state ── */
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);

  /* ── Route state ── */
  const [route, setRoute] = useState<GoogleVenue[]>([]);

  /* ── BestTime live busyness ── */
  const [liveBusyness, setLiveBusyness] = useState<
    Record<string, { now: number; hourly: number[] | null; source: string }>
  >({});
  const [liveLoaded, setLiveLoaded] = useState(false);
  const [loadingVenueId, setLoadingVenueId] = useState<string | null>(null);

  /* ── Viator state (legacy, kept until Musement is fully validated) ── */
  const [activeTab, setActiveTab] = useState<TabId>("explore");
  const [viatorProducts, setViatorProducts] = useState<ViatorProduct[]>([]);
  const [viatorLoading, setViatorLoading] = useState(false);
  const [viatorCategory, setViatorCategory] = useState("");
  const [viatorTotal, setViatorTotal] = useState(0);
  const [viatorPage, setViatorPage] = useState(1);
  const [viatorLoadingMore, setViatorLoadingMore] = useState(false);

  /* ── Musement route (Phase 3.3) — bookable activities the reseller has
       picked. Parallel to the Google Places `route` so existing flow is
       untouched; rendered together in the Route tab. ── */
  /* ── Musement state — primary supplier in Explore tab (Phase 3.1) ── */
  type MusementCard = {
    uuid: string;
    title: string;
    description: string;
    duration: string;
    rating: number;
    reviewCount: number;
    pricing: { currency: string; retailPrice: number; formatted: string };
    images: { url: string; caption?: string }[];
    cancellationPolicy?: string;
    flags: string[];
    isCombo?: boolean;
    exclusive?: boolean;
    topSeller?: boolean;
    mustSee?: boolean;
    location?: { city?: string; country?: string; lat?: number; lng?: number };
  };
  type VerticalOpt = { id: number; name: string };
  const VERTICAL_ICONS: Record<string, string> = {
    "Museums & art": "📚",
    "Tours & attractions": "🎯",
    "Food & wine": "🍷",
    "Active & adventure": "🚴",
    "Performances": "🎭",
    "Sports": "⚽",
    "Nightlife": "🌃",
  };
  const [verticals, setVerticals] = useState<VerticalOpt[]>([]);
  // 0 = All, -1 = synthetic Combos, else Musement vertical id
  const [verticalSel, setVerticalSel] = useState<number>(0);
  const [musementProducts, setMusementProducts] = useState<MusementCard[]>([]);
  const [musementLoading, setMusementLoading] = useState(false);
  const [musementTotal, setMusementTotal] = useState(0);
  // Map-pin selection — separate from selectedVenue (Google Places) so both
  // info-windows can co-exist; clicking a Musement pin clears any Google one.
  const [selectedMusement, setSelectedMusement] = useState<MusementCard | null>(null);
  // Musement-route + save-to-group state
  const [routeMusement, setRouteMusement] = useState<MusementCard[]>([]);
  // Time planner: start-time (HH:MM) + per-stop duration (minutes, keyed by id).
  const [routeStartTime, setRouteStartTime] = useState("09:00");
  const [stopDurations, setStopDurations] = useState<Record<string, number>>({});
  const [saveOpen, setSaveOpen] = useState(false);
  const [saveGroupId, setSaveGroupId] = useState("");
  const [saveGroups, setSaveGroups] = useState<Array<{ id: string; name: string; notes: string | null; number_of_guests: number; travel_date: string | null; contact_person: string | null }>>([]);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  /* ── Fetch Google Places venues ── */
  useEffect(() => {
    setLoading(true);
    setVenues([]);
    setSelectedVenue(null);
    setRoute([]);
    setRouteMusement([]);
    fetch(`/api/places?lat=${city.lat}&lng=${city.lng}&city=${city.name}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.venues) setVenues(d.venues);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  /* ── Fetch weather ── */
  useEffect(() => {
    setWeather(null);
    fetch(
      `/api/weather?lat=${city.lat}&lng=${city.lng}&tz=${encodeURIComponent(city.timezone)}`,
    )
      .then((r) => r.json())
      .then((d) => {
        if (d.current) setWeather(d.current);
      })
      .catch(() => {});
  }, [city]);

  /* ── Fetch Viator experiences ── */
  const fetchViator = useCallback(
    async (
      cityId: string,
      cat: string,
      page: number = 1,
      append: boolean = false,
    ) => {
      const viatorCity = VIATOR_CITY_MAP[cityId];
      if (!viatorCity) {
        if (!append) {
          setViatorProducts([]);
          setViatorTotal(0);
        }
        return;
      }
      if (append) {
        setViatorLoadingMore(true);
      } else {
        setViatorLoading(true);
      }
      try {
        const payload: Record<string, unknown> = {
          city: viatorCity,
          limit: 20,
          start: (page - 1) * 20 + 1,
          currency: "EUR",
        };
        if (cat) payload.category = cat;
        const res = await fetch("/api/viator/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        if (append) {
          setViatorProducts((prev) => [...prev, ...(data.products || [])]);
        } else {
          setViatorProducts(data.products || []);
        }
        setViatorTotal(data.totalCount || 0);
        setViatorPage(page);
      } catch {
        if (!append) setViatorProducts([]);
      } finally {
        setViatorLoading(false);
        setViatorLoadingMore(false);
      }
    },
    [],
  );

  useEffect(() => {
    setViatorPage(1);
    fetchViator(city.id, viatorCategory, 1, false);
  }, [city.id, viatorCategory, fetchViator]);

  /* ── Load Musement verticals once ── */
  useEffect(() => {
    fetch("/api/musement/verticals")
      .then((r) => r.json())
      .then((d) => setVerticals(d.verticals || []))
      .catch(() => {});
  }, []);

  /* ── Fetch Musement experiences ── */
  const fetchMusement = useCallback(
    async (cityName: string, vSel: number) => {
      setMusementLoading(true);
      try {
        const useVertical = vSel > 0;
        const useCombo = vSel === -1;
        const payload: Record<string, unknown> = {
          cityName,
          limit: 100,
          offset: 0,
          currency: "EUR",
          language: "en",
          sortBy: "relevance",
        };
        if (useVertical) payload.verticalId = vSel;
        if (useCombo) payload.comboOnly = true;

        const res = await fetch("/api/musement/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = res.ok ? await res.json() : { products: [], totalCount: 0 };
        setMusementProducts(data.products || []);
        setMusementTotal(data.totalCount || 0);
      } catch {
        setMusementProducts([]);
        setMusementTotal(0);
      } finally {
        setMusementLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    fetchMusement(city.name, verticalSel);
  }, [city.name, verticalSel, fetchMusement]);

  /* ── Busyness helpers ── */
  const busynessMap = useMemo(() => {
    const map: Record<string, BusynessInfo> = {};
    venues.forEach((v) => {
      map[v.id] = getVenueBusyness(v.category);
    });
    return map;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues.length, city.id]);

  const getVenueBusy = useCallback(
    (
      venue: GoogleVenue,
    ): BusynessInfo & { isLive?: boolean; hourly?: number[] | null } => {
      const live = liveBusyness[venue.id];
      if (live) {
        const info = getBusynessFromPercentage(live.now);
        return { ...info, isLive: true, hourly: live.hourly };
      }
      return { ...busynessMap[venue.id], isLive: false, hourly: null };
    },
    [liveBusyness, busynessMap],
  );

  /* ── Filter venues ── */
  const [quietOnly, setQuietOnly] = useState(false);
  const [indoorOnly, setIndoorOnly] = useState(false);
  const baseFiltered = venues.filter((v) => {
    if (category !== "all" && v.category !== category) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase()))
      return false;
    if (indoorOnly && !v.indoor) return false;
    return true;
  });
  const filtered = quietOnly
    ? baseFiltered.filter((v) => getVenueBusy(v).level === "quiet")
    : baseFiltered;

  // Indoor-friendly Musement filter — uses the structured vertical id when
  // available (production-correct: 1 Museums & art, 3 Food & wine,
  // 4 Performances, 7 Nightlife) and falls back to a title-keyword scan so
  // sandbox data (which mostly tags everything "Tours & attractions") is
  // still usable.
  const INDOOR_VERTICAL_IDS = new Set([1, 3, 4, 7]);
  const INDOOR_TITLE_RE = /\bmuseum|gallery|exhibition|theatre|theater|opera|concert|show|workshop|cooking|tasting|spa|wellness|indoor|cinema\b/i;
  const visibleMusement = indoorOnly
    ? musementProducts.filter((p) => {
        // verticals isn't on MusementCard locally, fall back to title.
        return INDOOR_TITLE_RE.test(p.title);
      })
    : musementProducts;
  // weather-aware suggestion: rainy codes match the smart-tip detection.
  const isRainy = !!weather && [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(weather.weather_code);

  const quietCount = baseFiltered.filter(
    (v) => getVenueBusy(v).level === "quiet",
  ).length;

  /* ── BestTime single load ── */
  const loadSingleLive = async (venue: GoogleVenue) => {
    if (loadingVenueId || liveBusyness[venue.id]) return;
    setLoadingVenueId(venue.id);
    try {
      const res = await fetch("/api/busyness/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venues: [{ name: venue.name, address: venue.address }],
        }),
      });
      const data = await res.json();
      if (data.results?.[0]) {
        const r = data.results[0];
        if (r.now_busyness !== null && r.now_busyness !== undefined) {
          setLiveBusyness((prev) => ({
            ...prev,
            [venue.id]: {
              now: r.now_busyness as number,
              hourly: (r.today_hourly as number[]) || null,
              source: (r.source as string) || "besttime",
            },
          }));
          setLiveLoaded(true);
        }
      }
    } catch {
      // ignore
    } finally {
      setLoadingVenueId(null);
    }
  };

  /* ── Route helpers ── */
  const addToRoute = (venue: GoogleVenue) => {
    if (!route.find((v) => v.id === venue.id)) setRoute([...route, venue]);
  };
  const removeFromRoute = (id: string) => {
    setRoute(route.filter((v) => v.id !== id));
  };
  const moveInRoute = (i: number, d: -1 | 1) => {
    const n = [...route];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setRoute(n);
  };

  /* ── Musement-route helpers ── */
  const addMusementToRoute = (p: MusementCard) => {
    if (typeof p.location?.lat !== "number" || typeof p.location?.lng !== "number") return;
    if (!routeMusement.find((m) => m.uuid === p.uuid)) {
      setRouteMusement((prev) => [...prev, p]);
    }
  };
  const removeMusementFromRoute = (uuid: string) => {
    setRouteMusement((prev) => prev.filter((m) => m.uuid !== uuid));
  };
  const moveMusementInRoute = (i: number, d: -1 | 1) => {
    const n = [...routeMusement];
    const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]];
    setRouteMusement(n);
  };

  const routeDistance = route.reduce(
    (t, v, i) =>
      i === 0
        ? 0
        : t + haversine(route[i - 1].lat, route[i - 1].lng, v.lat, v.lng),
    0,
  );
  const routeWalkMins = walkingTime(routeDistance);

  /* ── Time planner — compute per-stop arrival across both route arrays ── */
  const timeToMinutes = (t: string): number => {
    const [h, m] = t.split(":").map(Number);
    return (h || 0) * 60 + (m || 0);
  };
  const minutesToTime = (m: number): string => {
    const total = ((m % (24 * 60)) + 24 * 60) % (24 * 60);
    const h = Math.floor(total / 60);
    const mm = Math.round(total % 60);
    return `${String(h).padStart(2, "0")}:${String(mm).padStart(2, "0")}`;
  };
  const DEFAULT_VENUE_MIN = 60;
  const DEFAULT_MUSEMENT_MIN = 90;
  const schedule = (() => {
    // Combined sequence: route (Google) followed by routeMusement.
    type Seq = { id: string; lat: number; lng: number; defaultMin: number };
    const seq: Seq[] = [];
    for (const v of route) seq.push({ id: `g-${v.id}`, lat: v.lat, lng: v.lng, defaultMin: DEFAULT_VENUE_MIN });
    for (const m of routeMusement) {
      if (typeof m.location?.lat === "number" && typeof m.location?.lng === "number") {
        seq.push({ id: `m-${m.uuid}`, lat: m.location.lat, lng: m.location.lng, defaultMin: DEFAULT_MUSEMENT_MIN });
      }
    }
    const map: Record<string, { arrival: string; departure: string; durationMin: number; walkMin: number }> = {};
    let cursor = timeToMinutes(routeStartTime);
    for (let i = 0; i < seq.length; i++) {
      const item = seq[i];
      const prev = i > 0 ? seq[i - 1] : null;
      const walkMin = prev ? Math.round(walkingTime(haversine(prev.lat, prev.lng, item.lat, item.lng)) * 1.3) : 0;
      cursor += walkMin;
      const arrivalMin = cursor;
      const durationMin = stopDurations[item.id] ?? item.defaultMin;
      cursor += durationMin;
      map[item.id] = {
        arrival: minutesToTime(arrivalMin),
        departure: minutesToTime(cursor),
        durationMin,
        walkMin,
      };
    }
    return map;
  })();
  const dayEndsAt = (() => {
    const ids = [...route.map((v) => `g-${v.id}`), ...routeMusement.filter((m) => typeof m.location?.lat === "number").map((m) => `m-${m.uuid}`)];
    const last = ids[ids.length - 1];
    return last ? schedule[last]?.departure : null;
  })();
  const setDurationFor = (id: string, mins: number) => {
    setStopDurations((prev) => ({ ...prev, [id]: Math.max(5, Math.min(720, mins)) }));
  };
  const clearWholeRoute = () => {
    if (route.length + routeMusement.length === 0) return;
    if (typeof window !== "undefined" && !window.confirm("Clear all route stops?")) return;
    setRoute([]);
    setRouteMusement([]);
    setStopDurations({});
  };

  /* ── Save-to-group: lazy load groups when opening the panel ── */
  const openSavePanel = async () => {
    setSaveOpen(true);
    setSaveStatus("");
    if (saveGroups.length === 0) {
      try {
        const res = await fetch("/api/groups");
        const data = await res.json();
        const list = data.groups || [];
        setSaveGroups(list);
        if (list[0]) setSaveGroupId(list[0].id);
      } catch {
        setSaveStatus("Could not load groups");
      }
    }
  };

  const handleSaveItinerary = async () => {
    const grp = saveGroups.find((g) => g.id === saveGroupId);
    if (!grp) { setSaveStatus("Pick a group first"); return; }
    setSaving(true);
    setSaveStatus("");
    try {
      const dateStr = new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
      const stops: string[] = [];
      route.forEach((v, i) => {
        const sch = schedule[`g-${v.id}`];
        const time = sch?.arrival ?? "";
        stops.push(`${i + 1}. ${time ? time + " · " : ""}${v.name}${v.address ? ` — ${v.address}` : ""}`);
      });
      const offset = route.length;
      routeMusement.forEach((m, i) => {
        const sch = schedule[`m-${m.uuid}`];
        const time = sch?.arrival ?? "";
        stops.push(`${offset + i + 1}. ${time ? time + " · " : ""}🎫 ${m.title} (${m.pricing.formatted || "—"})`);
      });
      const headerExtra = (route.length + routeMusement.length) > 0
        ? ` — start ${routeStartTime}${dayEndsAt ? `, ends ${dayEndsAt}` : ""}`
        : "";
      const block = `\n\n--- Itinerary saved ${dateStr} (${city.name})${headerExtra} ---\n${stops.join("\n")}`;
      const nextNotes = (grp.notes || "") + block;
      const res = await fetch("/api/groups", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: grp.id,
          name: grp.name,
          travelDate: grp.travel_date,
          numberOfGuests: grp.number_of_guests,
          contactPerson: grp.contact_person,
          notes: nextNotes,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setSaveStatus(err.error || "Failed to save");
      } else {
        setSaveStatus(`Saved to ${grp.name} ✓`);
        setSaveGroups((prev) => prev.map((g) => g.id === grp.id ? { ...g, notes: nextNotes } : g));
      }
    } catch {
      setSaveStatus("Network error — try again");
    } finally {
      setSaving(false);
    }
  };

  /* ── City change ── */
  const handleCityChange = (idx: number) => {
    setCityIdx(idx);
    setCategory("all");
    setSearch("");
    setSelectedVenue(null);
    setRoute([]);
    setRouteMusement([]);
  };

  const handleMarkerClick = useCallback((venue: GoogleVenue) => {
    setSelectedVenue(venue);
  }, []);

  /* ── Weather derived ── */
  const weatherInfo = weather
    ? WMO[weather.weather_code] || { label: "Unknown", icon: "🌡️" }
    : null;

  const viatorHasMore = viatorProducts.length < viatorTotal;
  const viatorCityName = VIATOR_CITY_MAP[city.id];

  /* ══════════════════════════════════════════════════════════════════
     RENDER
     ══════════════════════════════════════════════════════════════════ */
  return (
    <div className="space-y-4">
      {/* ── HEADER BAR ── */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-5 text-white shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          {/* Left: title + city buttons */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
                <svg
                  width="22"
                  height="22"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                  <path d="M2 12h20" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold">Discover</h1>
                <p className="text-sm text-blue-200">
                  Map + Experiences + Busyness for {city.name}
                </p>
              </div>
            </div>
            <div className="flex gap-1 overflow-x-auto pb-1">
              {NL_CITIES.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => handleCityChange(i)}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-medium transition-all ${
                    cityIdx === i
                      ? "bg-white text-blue-700 shadow-md"
                      : "bg-white/15 text-white/90 hover:bg-white/25"
                  }`}
                >
                  {c.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right: weather + stats */}
          <div className="flex items-center gap-4">
            {weather && weatherInfo && (
              <div className="flex items-center gap-2 rounded-xl bg-white/10 px-3 py-2">
                <span className="text-2xl">{weatherInfo.icon}</span>
                <div>
                  <p className="text-lg font-bold leading-tight">
                    {Math.round(weather.temperature_2m)}°C
                  </p>
                  <p className="text-[10px] text-blue-200">
                    {weatherInfo.label}
                  </p>
                </div>
              </div>
            )}
            <div className="h-8 w-px bg-white/20" />
            <div className="text-center">
              <p className="text-2xl font-bold">{filtered.length}</p>
              <p className="text-xs text-blue-200">Venues</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <button
              type="button"
              onClick={() => setQuietOnly((v) => !v)}
              title={quietOnly ? "Showing only quiet venues — click to show all" : "Click to filter map to quiet venues only"}
              disabled={quietCount === 0}
              className={`text-center rounded-lg px-2 py-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                quietOnly
                  ? "bg-green-300/30 ring-1 ring-green-300/60"
                  : "hover:bg-white/10"
              }`}
            >
              <p className="text-2xl font-bold text-green-300">
                🟢 {quietCount}
              </p>
              <p className="text-xs text-blue-200">{quietOnly ? "Quiet only ✓" : "Quiet now"}</p>
            </button>
          </div>
        </div>

        {/* Smart tip strip */}
        {weather && (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <span className="text-xs">💡</span>
            <p className="text-xs text-blue-100">
              {getSmartTip(weather.weather_code, weather.temperature_2m)}
            </p>
            <span className="ml-auto text-[10px] text-blue-300">
              Google Places + Open-Meteo + Musement
            </span>
          </div>
        )}
      </div>

      {/* ── Musement vertical filter (single source of truth, drives the
          right-column Explore feed). Replaces the legacy Google-Places
          category pills + the duplicate row that lived inside Explore. ── */}
      <div className="flex gap-1.5 flex-wrap items-center">
        <button
          onClick={() => setVerticalSel(0)}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            verticalSel === 0
              ? "bg-foreground text-background shadow-sm"
              : "bg-white border border-border/60 text-muted hover:bg-gray-50"
          }`}
        >
          All
        </button>
        {verticals.map((v) => (
          <button
            key={v.id}
            onClick={() => setVerticalSel(v.id)}
            className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
              verticalSel === v.id
                ? "bg-accent text-white shadow-sm"
                : "bg-white border border-border/60 text-muted hover:bg-gray-50"
            }`}
          >
            <span className="mr-1">{VERTICAL_ICONS[v.name] || "•"}</span>{v.name}
          </button>
        ))}
        <button
          onClick={() => setVerticalSel(-1)}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            verticalSel === -1
              ? "bg-accent text-white shadow-sm"
              : "border-2 border-dashed border-accent/40 bg-accent/5 text-accent hover:border-accent hover:bg-accent/10"
          }`}
        >
          🎁 Combos
        </button>
        <button
          onClick={() => setIndoorOnly((v) => !v)}
          title={isRainy && !indoorOnly ? "Rain forecast — try Indoor only" : indoorOnly ? "Showing indoor only — click to clear" : "Filter to indoor venues only"}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-all relative ${
            indoorOnly
              ? "bg-emerald-500 text-white shadow-sm"
              : isRainy
                ? "bg-blue-50 border-2 border-blue-300 text-blue-700 hover:bg-blue-100"
                : "bg-white border border-border/60 text-muted hover:bg-gray-50"
          }`}
        >
          🏠 Indoor only
          {isRainy && !indoorOnly && (
            <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] text-white animate-pulse">
              💧
            </span>
          )}
        </button>
        <div className="relative flex-1 sm:max-w-[200px] ml-2">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search ${city.name}...`}
            className="h-9 w-full rounded-lg border border-border/60 bg-white pl-9 pr-3 text-xs outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
          />
        </div>
      </div>

      {/* ── MAIN SPLIT VIEW ── */}
      <div className="flex gap-4 flex-col lg:flex-row">
        {/* ── LEFT: Map (60%) ── */}
        <div className="w-full lg:w-[60%] space-y-3">
          <div
            className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden"
            style={{ height: "600px" }}
          >
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <p className="text-sm text-muted mt-3">
                    Loading venues in {city.name}...
                  </p>
                </div>
              </div>
            ) : (
              <APIProvider apiKey={apiKey}>
                <Map
                  key={city.id}
                  defaultCenter={{ lat: city.lat, lng: city.lng }}
                  defaultZoom={city.zoom}
                  mapId="1a3172e8a192f4b578d440bb"
                  gestureHandling="greedy"
                  disableDefaultUI={false}
                  style={{ width: "100%", height: "100%" }}
                >
                  {filtered.map((venue) => {
                    const inRoute = route.find((v) => v.id === venue.id);
                    const routeIdx = route.findIndex(
                      (v) => v.id === venue.id,
                    );
                    const busy = getVenueBusy(venue);
                    return (
                      <AdvancedMarker
                        key={venue.id}
                        position={{ lat: venue.lat, lng: venue.lng }}
                        onClick={() => handleMarkerClick(venue)}
                      >
                        <div className="relative">
                          <div
                            className={`flex h-8 w-8 items-center justify-center rounded-full ${CATEGORY_COLORS[venue.category] || "bg-gray-500"} text-white text-sm shadow-lg ring-2 ${
                              inRoute
                                ? "ring-amber-400 scale-110"
                                : quietOnly
                                  ? "ring-green-400"
                                  : "ring-white"
                            } cursor-pointer hover:scale-110 transition-transform`}
                          >
                            {CATEGORY_ICONS[venue.category] || "📍"}
                          </div>
                          {inRoute && (
                            <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white">
                              {routeIdx + 1}
                            </div>
                          )}
                          {/* Busyness indicator: bigger badge in the corner */}
                          {busy?.icon && (
                            <div className="absolute -bottom-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[11px] leading-none shadow ring-1 ring-black/5">
                              {busy.icon}
                            </div>
                          )}
                        </div>
                      </AdvancedMarker>
                    );
                  })}

                  {/* Musement bookable pins — orange, distinct from Google
                      Places venue markers. Filtered by the active vertical
                      (right-column feed already does the filter, we mirror it). */}
                  {visibleMusement.map((p) => {
                    const lat = p.location?.lat;
                    const lng = p.location?.lng;
                    if (typeof lat !== "number" || typeof lng !== "number") return null;
                    return (
                      <AdvancedMarker
                        key={`m-${p.uuid}`}
                        position={{ lat, lng }}
                        onClick={() => { setSelectedMusement(p); setSelectedVenue(null); }}
                      >
                        <div className="relative">
                          <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-white text-[11px] shadow-lg ring-2 ring-white cursor-pointer hover:scale-110 transition-transform">
                            🎫
                          </div>
                          {p.exclusive && (
                            <div className="absolute -top-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-purple-500 text-[8px] text-white ring-1 ring-white">
                              💎
                            </div>
                          )}
                        </div>
                      </AdvancedMarker>
                    );
                  })}

                  {/* Musement pin InfoWindow — mini preview + Book Direct CTA */}
                  {selectedMusement && typeof selectedMusement.location?.lat === "number" && typeof selectedMusement.location?.lng === "number" && (
                    <InfoWindow
                      position={{ lat: selectedMusement.location.lat, lng: selectedMusement.location.lng }}
                      onCloseClick={() => setSelectedMusement(null)}
                    >
                      <div className="w-64 max-w-[260px]">
                        {selectedMusement.images?.[0]?.url && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={selectedMusement.images[0].url}
                            alt={selectedMusement.title}
                            className="mb-2 h-24 w-full rounded-lg object-cover"
                          />
                        )}
                        <p className="text-xs font-bold uppercase tracking-wider text-orange-600">Musement</p>
                        <h4 className="mt-0.5 text-sm font-semibold leading-tight line-clamp-2">{selectedMusement.title}</h4>
                        <div className="mt-1.5 flex items-center gap-2 text-[11px]">
                          {selectedMusement.rating > 0 && (
                            <span className="text-amber-500">★ {selectedMusement.rating.toFixed(1)}</span>
                          )}
                          {selectedMusement.duration && <span className="text-gray-500">⏱ {selectedMusement.duration}</span>}
                          {selectedMusement.cancellationPolicy === "Free cancellation" && (
                            <span className="text-green-600 font-medium">✓ Free cancel</span>
                          )}
                        </div>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-base font-bold text-accent">
                            {selectedMusement.pricing.retailPrice > 0 ? selectedMusement.pricing.formatted : "—"}
                          </span>
                          <button
                            onClick={() => router.push(
                              `/dashboard/bookings/new?source=musement&activityUuid=${selectedMusement.uuid}&title=${encodeURIComponent(selectedMusement.title)}&price=${selectedMusement.pricing.retailPrice}&currency=${selectedMusement.pricing.currency}`
                            )}
                            className="rounded-lg bg-orange-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-600 transition-colors"
                          >
                            Book Direct →
                          </button>
                        </div>
                        {(() => {
                          const inRoute = !!routeMusement.find((m) => m.uuid === selectedMusement.uuid);
                          return (
                            <button
                              onClick={() =>
                                inRoute ? removeMusementFromRoute(selectedMusement.uuid) : addMusementToRoute(selectedMusement)
                              }
                              className={`mt-2 w-full rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                                inRoute
                                  ? "bg-amber-500 text-white hover:bg-amber-600"
                                  : "border border-amber-400 text-amber-700 hover:bg-amber-50"
                              }`}
                            >
                              {inRoute ? "✓ In day route" : "+ Add to day route"}
                            </button>
                          );
                        })()}
                      </div>
                    </InfoWindow>
                  )}

                  {selectedVenue && (
                    <InfoWindow
                      position={{
                        lat: selectedVenue.lat,
                        lng: selectedVenue.lng,
                      }}
                      onCloseClick={() => setSelectedVenue(null)}
                      pixelOffset={[0, -40]}
                    >
                      <div className="max-w-[280px] p-1">
                        <div className="flex items-center gap-2 mb-1">
                          <VenuePhoto
                            photo={selectedVenue.photo}
                            name={selectedVenue.name}
                            size="md"
                          />
                          <div>
                            <h3 className="font-bold text-sm leading-tight">
                              {selectedVenue.name}
                            </h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-amber-500">
                                ★ {selectedVenue.rating}
                              </span>
                              <span className="text-[10px] text-gray-400">
                                ({selectedVenue.reviews.toLocaleString()})
                              </span>
                              <BusynessDot
                                info={getVenueBusy(selectedVenue)}
                                size="md"
                              />
                              {getVenueBusy(selectedVenue).isLive && (
                                <span className="text-[8px] text-red-500 font-bold">
                                  LIVE
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2">
                          {selectedVenue.address}
                        </p>

                        <div className="mb-2 rounded-lg bg-gray-50 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[9px] font-medium text-gray-500">
                              Popular times today
                            </p>
                            {getVenueBusy(selectedVenue).isLive && (
                              <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-medium">
                                🔴 Live data
                              </span>
                            )}
                          </div>
                          <BusynessChart
                            category={selectedVenue.category}
                            liveHourly={getVenueBusy(selectedVenue).hourly}
                          />
                          <p className="text-[9px] text-gray-400 mt-1 italic">
                            {getVenueBusy(selectedVenue)?.tip}
                          </p>
                        </div>

                        {!getVenueBusy(selectedVenue).isLive && (
                          <button
                            onClick={() => loadSingleLive(selectedVenue)}
                            disabled={loadingVenueId === selectedVenue.id}
                            className="w-full mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors"
                          >
                            {loadingVenueId === selectedVenue.id
                              ? "⏳ Loading live data..."
                              : "🔴 Load real busyness (2 credits)"}
                          </button>
                        )}

                        <div className="flex items-center gap-3 text-xs">
                          {selectedVenue.open_now !== null && (
                            <span
                              className={`font-medium ${selectedVenue.open_now ? "text-green-600" : "text-red-500"}`}
                            >
                              {selectedVenue.open_now
                                ? "✓ Open now"
                                : "✗ Closed"}
                            </span>
                          )}
                          <span className="text-gray-500">
                            {selectedVenue.indoor ? "🏠 Indoor" : "☀️ Outdoor"}
                          </span>
                        </div>
                        <button
                          onClick={() => addToRoute(selectedVenue)}
                          disabled={
                            !!route.find((v) => v.id === selectedVenue.id)
                          }
                          className="mt-2 w-full rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                        >
                          {route.find((v) => v.id === selectedVenue.id)
                            ? "✓ In route"
                            : "+ Add to day route"}
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            )}
          </div>

          {/* Legend strip */}
          <div className="rounded-2xl border border-border/60 bg-white p-3 shadow-sm">
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold text-muted">Categories:</p>
              {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
                <div key={cat} className="flex items-center gap-1.5">
                  <div className={`h-3 w-3 rounded-full ${color}`} />
                  <span className="text-xs text-muted capitalize">{cat}</span>
                </div>
              ))}
              <div className="h-4 w-px bg-gray-200" />
              <div className="flex items-center gap-1.5">
                <div className="flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[9px] text-white">🎫</div>
                <span className="text-xs text-muted">Musement (bookable)</span>
              </div>
              <div className="h-4 w-px bg-gray-200" />
              <span className="text-xs text-muted">🟢 Quiet</span>
              <span className="text-xs text-muted">🟡 Moderate</span>
              <span className="text-xs text-muted">🟠 Busy</span>
              <span className="text-xs text-muted">🔴 Very busy</span>
              <span className="ml-auto text-[10px] text-gray-400">
                Google Places{liveLoaded ? " + BestTime" : ""}
              </span>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Tabbed sidebar (40%) ── */}
        <div className="w-full lg:w-[40%]">
          <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
            {/* Tab bar */}
            <div className="flex border-b border-border/30">
              {(
                [
                  { id: "explore" as TabId, label: "Explore", icon: "🎯" },
                  { id: "route" as TabId, label: "Route", icon: "🗺️" },
                  { id: "booked" as TabId, label: "Booked", icon: "📋" },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "border-b-2 border-accent text-accent font-semibold"
                      : "text-muted hover:text-foreground"
                  }`}
                >
                  <span className="mr-1">{tab.icon}</span> {tab.label}
                  {tab.id === "route" && (route.length + routeMusement.length) > 0 && (
                    <span className="ml-1.5 inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                      {route.length + routeMusement.length}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {/* ── Tab: Explore (Musement — Phase 3.1) ── */}
            {activeTab === "explore" && (
              <div>
                {/* Verticals chip row lives ABOVE the map now (single source of
                    truth — no duplicate filter inside the right column). */}

                {musementLoading && (
                  <div className="p-6 space-y-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                      <div key={i} className="flex gap-3 animate-pulse">
                        <div className="h-20 w-20 shrink-0 rounded-xl bg-gray-100" />
                        <div className="flex-1 space-y-2 py-1">
                          <div className="h-3 w-3/4 rounded bg-gray-100" />
                          <div className="h-3 w-1/2 rounded bg-gray-100" />
                          <div className="h-3 w-1/3 rounded bg-gray-100" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {!musementLoading && (
                  <div className="overflow-y-auto" style={{ maxHeight: "540px" }}>
                    {visibleMusement.length === 0 ? (
                      <div className="p-8 text-center text-sm text-muted">
                        {indoorOnly
                          ? `No indoor experiences for this filter in ${city.name}.`
                          : `No Musement experiences for this filter in ${city.name}.`}
                      </div>
                    ) : (
                      <>
                        <div className="px-3 py-2 text-[11px] text-muted">
                          {indoorOnly
                            ? `${visibleMusement.length} indoor of ${musementTotal.toLocaleString()} in ${city.name} · click any card to book`
                            : `${musementTotal.toLocaleString()} experiences in ${city.name} · click any card to book`}
                        </div>
                        {visibleMusement.map((p) => {
                          const inRoute = !!routeMusement.find((m) => m.uuid === p.uuid);
                          const hasCoords = typeof p.location?.lat === "number" && typeof p.location?.lng === "number";
                          return (
                          <div
                            key={p.uuid}
                            className="flex gap-3 border-b border-border/20 px-3 py-3 hover:bg-blue-50/30 transition-colors"
                          >
                            {/* Thumbnail */}
                            <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                              {p.images[0]?.url ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                  src={p.images[0].url}
                                  alt={p.title}
                                  className="h-full w-full object-cover"
                                  loading="lazy"
                                />
                              ) : (
                                <div className="flex h-full items-center justify-center text-gray-400 text-lg">🎯</div>
                              )}
                              {p.duration && (
                                <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 text-[9px] font-medium text-white">
                                  {p.duration}
                                </span>
                              )}
                              {p.isCombo && (
                                <span className="absolute top-1 right-1 rounded bg-foreground/90 px-1.5 py-0.5 text-[9px] font-semibold text-background">Combo</span>
                              )}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold leading-tight line-clamp-2">{p.title}</h4>
                              <div className="mt-1 flex items-center gap-2">
                                {p.rating > 0 && (
                                  <span className="text-xs text-amber-500">★ {p.rating.toFixed(1)}</span>
                                )}
                                {p.reviewCount > 0 && (
                                  <span className="text-[10px] text-gray-400">({p.reviewCount.toLocaleString()})</span>
                                )}
                              </div>
                              <div className="mt-1.5 flex items-center gap-2">
                                {p.cancellationPolicy === "Free cancellation" && (
                                  <span className="text-[9px] text-green-600 font-medium">Free cancel</span>
                                )}
                                {p.exclusive && (
                                  <span className="text-[9px] text-purple-600 font-medium">💎 Exclusive</span>
                                )}
                                {p.topSeller && (
                                  <span className="text-[9px] text-orange-600 font-medium">🔥 Top seller</span>
                                )}
                              </div>
                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <span className="text-sm font-bold text-accent">
                                  {p.pricing.retailPrice > 0 ? p.pricing.formatted : "Price TBD"}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {hasCoords && (
                                    <button
                                      onClick={() =>
                                        inRoute ? removeMusementFromRoute(p.uuid) : addMusementToRoute(p)
                                      }
                                      className={`rounded-lg px-2 py-1.5 text-[10px] font-semibold transition-colors ${
                                        inRoute
                                          ? "bg-amber-500 text-white"
                                          : "border border-amber-300 text-amber-600 hover:bg-amber-50"
                                      }`}
                                      title={inRoute ? "Remove from day route" : "Add to day route"}
                                    >
                                      {inRoute ? "✓ In route" : "+ Route"}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => router.push(
                                      `/dashboard/bookings/new?source=musement&activityUuid=${p.uuid}&title=${encodeURIComponent(p.title)}&price=${p.pricing.retailPrice}&currency=${p.pricing.currency}`
                                    )}
                                    className="rounded-xl bg-foreground px-3 py-1.5 text-[11px] font-semibold text-background hover:opacity-90"
                                  >
                                    Book Direct →
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                          );
                        })}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Route ── */}
            {activeTab === "route" && (
              <div>
                <div className="border-b border-border/30 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base">🗺️</span>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">Day Route Planner</p>
                        <p className="text-[10px] text-muted truncate">
                          {route.length + routeMusement.length === 0
                            ? "Add venues + Musement activities to plan a day"
                            : `${route.length + routeMusement.length} stops${dayEndsAt ? ` · ends ${dayEndsAt}` : ""}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {(route.length + routeMusement.length) > 0 && (
                        <>
                          <label className="flex items-center gap-1 text-[11px] text-gray-700">
                            <span className="text-gray-500">Start</span>
                            <input
                              type="time"
                              value={routeStartTime}
                              onChange={(e) => setRouteStartTime(e.target.value || "09:00")}
                              className="h-7 rounded-md border border-border bg-white px-2 text-[11px] tabular-nums"
                            />
                          </label>
                          <button
                            onClick={clearWholeRoute}
                            title="Clear all stops"
                            className="flex h-7 w-7 items-center justify-center rounded-md text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="3 6 5 6 21 6" />
                              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                              <path d="M10 11v6" />
                              <path d="M14 11v6" />
                              <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {route.length === 0 && routeMusement.length === 0 ? (
                  <div className="px-4 py-12 text-center">
                    <p className="text-3xl mb-3">🗺️</p>
                    <p className="text-sm text-muted">
                      No stops in your route yet
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Map venues → &quot;+ Add to day route&quot; · Musement cards → &quot;+ Route&quot;
                    </p>
                  </div>
                ) : (
                  <div
                    className="overflow-y-auto"
                    style={{ maxHeight: "560px" }}
                  >
                    {route.length > 0 && (
                    <div className="divide-y divide-border/20">
                      {route.map((v, i) => {
                        const dist =
                          i > 0
                            ? haversine(
                                route[i - 1].lat,
                                route[i - 1].lng,
                                v.lat,
                                v.lng,
                              )
                            : 0;
                        const busy = getVenueBusy(v);
                        return (
                          <div key={v.id}>
                            {i > 0 && (
                              <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50/50">
                                <span className="text-[10px] text-gray-400">
                                  🚶 {(dist * 1.3).toFixed(1)}km • ~
                                  {Math.round(walkingTime(dist) * 1.3)}min
                                </span>
                                <div className="flex-1 border-t border-dashed border-gray-200" />
                              </div>
                            )}
                            <div className="flex items-center gap-3 px-4 py-2.5">
                              <div className="flex flex-col items-center shrink-0">
                                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">
                                  {i + 1}
                                </div>
                                <span className="mt-1 text-[10px] font-semibold tabular-nums text-amber-700">
                                  {schedule[`g-${v.id}`]?.arrival ?? "—"}
                                </span>
                              </div>
                              <VenuePhoto photo={v.photo} name={v.name} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <p className="text-sm font-medium truncate">
                                    {v.name}
                                  </p>
                                  <BusynessDot info={busy} size="md" />
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                  <span>★ {v.rating}</span>
                                  <span>{v.indoor ? "🏠" : "☀️"}</span>
                                  <label className="flex items-center gap-0.5 text-gray-500 ml-auto">
                                    <input
                                      type="number"
                                      min={5}
                                      max={720}
                                      step={15}
                                      value={schedule[`g-${v.id}`]?.durationMin ?? DEFAULT_VENUE_MIN}
                                      onChange={(e) => setDurationFor(`g-${v.id}`, Number(e.target.value))}
                                      className="h-5 w-12 rounded border border-border bg-white px-1 text-[10px] tabular-nums"
                                    />
                                    <span>min</span>
                                  </label>
                                </div>
                              </div>
                              <div className="flex items-center gap-1">
                                <button
                                  onClick={() => moveInRoute(i, -1)}
                                  className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M18 15l-6-6-6 6" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => moveInRoute(i, 1)}
                                  className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M6 9l6 6 6-6" />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => removeFromRoute(v.id)}
                                  className="rounded p-1 text-gray-300 hover:text-red-500 hover:bg-red-50"
                                >
                                  <svg
                                    width="14"
                                    height="14"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                  >
                                    <path d="M18 6L6 18M6 6l12 12" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      <div className="px-4 py-3 bg-amber-50/50">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-gray-600">
                            📍 {route.length} venue{route.length !== 1 ? "s" : ""} • 🚶{" "}
                            {(routeDistance * 1.3).toFixed(1)}km • ⏱️ ~
                            {Math.round(routeWalkMins * 1.3)}min walking
                          </span>
                        </div>
                      </div>
                    </div>
                    )}

                    {/* Musement bookable activities in the route */}
                    {routeMusement.length > 0 && (
                      <div className="divide-y divide-border/20 border-t-2 border-orange-100">
                        <div className="px-4 py-2 bg-orange-50/60 text-[11px] font-semibold uppercase tracking-wider text-orange-700">
                          🎫 Musement bookable stops · {routeMusement.length}
                        </div>
                        {routeMusement.map((m, i) => {
                          const lat = m.location?.lat ?? 0;
                          const lng = m.location?.lng ?? 0;
                          const prev = i > 0 ? routeMusement[i - 1] : null;
                          const dist = prev && prev.location?.lat && prev.location?.lng
                            ? haversine(prev.location.lat, prev.location.lng, lat, lng)
                            : 0;
                          return (
                            <div key={`mr-${m.uuid}`}>
                              {i > 0 && (
                                <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50/50">
                                  <span className="text-[10px] text-gray-400">
                                    🚶 {(dist * 1.3).toFixed(1)}km • ~{Math.round(walkingTime(dist) * 1.3)}min
                                  </span>
                                  <div className="flex-1 border-t border-dashed border-gray-200" />
                                </div>
                              )}
                              <div className="flex items-center gap-3 px-4 py-2.5">
                                <div className="flex flex-col items-center shrink-0">
                                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
                                    {route.length + i + 1}
                                  </div>
                                  <span className="mt-1 text-[10px] font-semibold tabular-nums text-orange-700">
                                    {schedule[`m-${m.uuid}`]?.arrival ?? "—"}
                                  </span>
                                </div>
                                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                  {m.images?.[0]?.url ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={m.images[0].url} alt={m.title} className="h-full w-full object-cover" />
                                  ) : (
                                    <div className="grid h-full place-items-center text-sm">🎫</div>
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">{m.title}</p>
                                  <div className="flex items-center gap-2 text-[10px] text-gray-400">
                                    {m.rating > 0 && <span>★ {m.rating.toFixed(1)}</span>}
                                    <span className="font-semibold text-accent">
                                      {m.pricing.retailPrice > 0 ? m.pricing.formatted : "—"}
                                    </span>
                                    <label className="flex items-center gap-0.5 text-gray-500 ml-auto">
                                      <input
                                        type="number"
                                        min={5}
                                        max={720}
                                        step={15}
                                        value={schedule[`m-${m.uuid}`]?.durationMin ?? DEFAULT_MUSEMENT_MIN}
                                        onChange={(e) => setDurationFor(`m-${m.uuid}`, Number(e.target.value))}
                                        className="h-5 w-12 rounded border border-border bg-white px-1 text-[10px] tabular-nums"
                                      />
                                      <span>min</span>
                                    </label>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <button
                                    onClick={() => moveMusementInRoute(i, -1)}
                                    className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M18 15l-6-6-6 6" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => moveMusementInRoute(i, 1)}
                                    className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M6 9l6 6 6-6" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => removeMusementFromRoute(m.uuid)}
                                    className="rounded p-1 text-gray-300 hover:text-red-500 hover:bg-red-50"
                                  >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M18 6L6 18M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* Save-to-group panel — bottom of route tab */}
                    <div className="border-t-2 border-amber-100 p-4 space-y-3 bg-amber-50/30">
                      {!saveOpen ? (
                        <button
                          onClick={openSavePanel}
                          className="w-full rounded-xl bg-foreground px-4 py-2.5 text-sm font-semibold text-background hover:opacity-90"
                        >
                          💾 Save as itinerary to a group
                        </button>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">Save to group</p>
                          {saveGroups.length === 0 ? (
                            <p className="text-xs text-muted">No groups yet — create one in Groups first.</p>
                          ) : (
                            <select
                              value={saveGroupId}
                              onChange={(e) => setSaveGroupId(e.target.value)}
                              className="h-9 w-full rounded-lg border border-border bg-white px-3 text-sm"
                              disabled={saving}
                            >
                              {saveGroups.map((g) => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                              ))}
                            </select>
                          )}
                          <div className="flex gap-2">
                            <button
                              onClick={() => { setSaveOpen(false); setSaveStatus(""); }}
                              disabled={saving}
                              className="flex-1 rounded-lg border border-border bg-white px-3 py-2 text-xs font-semibold hover:bg-gray-50 disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveItinerary}
                              disabled={saving || !saveGroupId}
                              className="flex-1 rounded-lg bg-amber-500 px-3 py-2 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-50"
                            >
                              {saving ? "Saving…" : "Save itinerary"}
                            </button>
                          </div>
                          {saveStatus && (
                            <p className={`text-xs ${saveStatus.includes("✓") ? "text-emerald-700" : "text-amber-700"}`}>
                              {saveStatus}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Booked ── */}
            {activeTab === "booked" && (
              <div className="px-4 py-16 text-center">
                <p className="text-4xl mb-4">📋</p>
                <p className="text-sm font-medium text-foreground">
                  Your booked experiences will appear here
                </p>
                <p className="text-xs text-muted mt-2">
                  Book experiences from the Explore tab to track them here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── BOTTOM STRIP: Busyness timeline + smart tip ── */}
      {selectedVenue && weather && (
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <VenuePhoto
                photo={selectedVenue.photo}
                name={selectedVenue.name}
                size="md"
              />
              <div>
                <p className="text-sm font-semibold">{selectedVenue.name}</p>
                <BusynessDot info={getVenueBusy(selectedVenue)} size="md" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-medium text-gray-500 mb-1">
                Popular times today
              </p>
              <BusynessChart
                category={selectedVenue.category}
                liveHourly={getVenueBusy(selectedVenue).hourly}
              />
            </div>
            <div className="shrink-0 rounded-lg bg-blue-50 px-3 py-2 text-xs text-blue-700">
              💡{" "}
              {getSmartTip(weather.weather_code, weather.temperature_2m)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
