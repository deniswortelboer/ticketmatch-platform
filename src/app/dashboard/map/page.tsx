"use client";

import { useState, useCallback, useEffect, useMemo } from "react";
import { APIProvider, Map, AdvancedMarker, InfoWindow } from "@vis.gl/react-google-maps";
import { NL_CITIES, CATEGORIES, CATEGORY_COLORS, CATEGORY_ICONS, getVenueBusyness, getHourlyBusyness, getBusynessFromPercentage } from "@/lib/cities";
import type { GoogleVenue, BusynessInfo } from "@/lib/cities";

/* ── Weather helpers ── */
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear", icon: "☀️" }, 1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" }, 3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" }, 48: { label: "Freezing fog", icon: "🌫️" },
  51: { label: "Drizzle", icon: "🌦️" }, 53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" }, 61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" }, 65: { label: "Heavy rain", icon: "🌧️" },
  80: { label: "Showers", icon: "🌦️" }, 81: { label: "Heavy showers", icon: "🌧️" },
  95: { label: "Thunder", icon: "⛈️" },
};

type WeatherCurrent = { temperature_2m: number; apparent_temperature: number; weather_code: number; wind_speed_10m: number };

function haversine(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function walkingTime(km: number) { return Math.round((km / 4.5) * 60); }

function getSmartTip(code: number, temp: number) {
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95].includes(code);
  if (isRainy) return "🏠 Rain — plan indoor activities";
  if (temp > 25) return "☀️ Hot — stay hydrated, outdoor is great";
  if (temp < 5) return "🧥 Cold — museums & indoor venues recommended";
  if (temp > 15) return "👍 Perfect weather for all activities";
  return "🌤️ Mild — good for mixed indoor/outdoor";
}

/* ── Components ── */
function BusynessChart({ category, liveHourly }: { category: string; liveHourly?: number[] | null }) {
  const simulated = getHourlyBusyness(category);
  const currentHour = new Date().getHours();

  // Use live data if available, otherwise simulated
  const hourly = liveHourly
    ? liveHourly.map((pct, hour) => ({ hour, pct }))
    : simulated;

  return (
    <div className="flex items-end gap-[2px] h-10">
      {hourly.filter((h) => h.hour >= 7 && h.hour <= 21).map((h) => {
        const isCurrent = h.hour === currentHour;
        const barColor = h.pct >= 75 ? "bg-red-400" : h.pct >= 50 ? "bg-orange-400" : h.pct >= 20 ? "bg-amber-400" : "bg-green-400";
        return (
          <div key={h.hour} className="flex flex-col items-center gap-0.5" title={`${h.hour}:00 — ${h.pct}%`}>
            <div className={`w-[6px] rounded-t-sm ${isCurrent ? "ring-1 ring-blue-500 opacity-100" : "opacity-60"} ${barColor}`}
              style={{ height: `${Math.max(2, (h.pct / 100) * 36)}px` }} />
            {(h.hour % 3 === 0 || isCurrent) && (
              <span className={`text-[7px] ${isCurrent ? "text-blue-600 font-bold" : "text-gray-400"}`}>{h.hour}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function BusynessDot({ info, size = "sm" }: { info: BusynessInfo; size?: "sm" | "md" }) {
  if (size === "md") {
    return (
      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
        info.level === "quiet" ? "bg-green-50 text-green-600" :
        info.level === "moderate" ? "bg-amber-50 text-amber-600" :
        info.level === "busy" ? "bg-orange-50 text-orange-600" : "bg-red-50 text-red-600"
      }`}>{info.icon} {info.label}</span>
    );
  }
  return <span className="text-[10px]" title={`${info.label} (${info.percentage}%)`}>{info.icon}</span>;
}

function VenuePhoto({ photo, name, size = "sm" }: { photo: string | null; name: string; size?: "sm" | "md" }) {
  if (!photo) {
    return (
      <div className={`${size === "md" ? "h-10 w-10" : "h-9 w-9"} shrink-0 rounded-lg bg-gray-200 flex items-center justify-center text-gray-400 text-xs`}>
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

export default function CityMapPage() {
  const [cityIdx, setCityIdx] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState<GoogleVenue | null>(null);
  const [category, setCategory] = useState("all");
  const [indoorOnly, setIndoorOnly] = useState(false);
  const [search, setSearch] = useState("");
  const [weather, setWeather] = useState<WeatherCurrent | null>(null);
  const [route, setRoute] = useState<GoogleVenue[]>([]);
  const [venues, setVenues] = useState<GoogleVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [liveBusyness, setLiveBusyness] = useState<Record<string, { now: number; hourly: number[] | null; source: string }>>({});
  const [liveLoaded, setLiveLoaded] = useState(false);

  const city = NL_CITIES[cityIdx];
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";

  // Fetch venues from Google Places
  useEffect(() => {
    setLoading(true);
    setVenues([]);
    setSelectedVenue(null);
    setRoute([]);
    fetch(`/api/places?lat=${city.lat}&lng=${city.lng}&city=${city.name}`)
      .then((r) => r.json())
      .then((d) => { if (d.venues) setVenues(d.venues); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [city]);

  // Fetch weather
  useEffect(() => {
    setWeather(null);
    fetch(`/api/weather?lat=${city.lat}&lng=${city.lng}&tz=${encodeURIComponent(city.timezone)}`)
      .then((r) => r.json())
      .then((d) => { if (d.current) setWeather(d.current); })
      .catch(() => {});
  }, [city]);

  // Cache busyness per venue
  const busynessMap = useMemo(() => {
    const map: Record<string, BusynessInfo> = {};
    venues.forEach((v) => { map[v.id] = getVenueBusyness(v.category); });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [venues.length, city.id]);

  const filtered = venues.filter((v) => {
    if (category !== "all" && v.category !== category) return false;
    if (indoorOnly && !v.indoor) return false;
    if (search && !v.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Load BestTime data for a single venue (2 credits)
  const [loadingVenueId, setLoadingVenueId] = useState<string | null>(null);

  const loadSingleLive = async (venue: GoogleVenue) => {
    if (loadingVenueId || liveBusyness[venue.id]) return;
    setLoadingVenueId(venue.id);
    try {
      const res = await fetch("/api/busyness/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ venues: [{ name: venue.name, address: `${venue.address}` }] }),
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

  // Get busyness for a venue (live if available, otherwise simulated)
  const getVenueBusy = useCallback((venue: GoogleVenue): BusynessInfo & { isLive?: boolean; hourly?: number[] | null } => {
    const live = liveBusyness[venue.id];
    if (live) {
      const info = getBusynessFromPercentage(live.now);
      return { ...info, isLive: true, hourly: live.hourly };
    }
    return { ...busynessMap[venue.id], isLive: false, hourly: null };
  }, [liveBusyness, busynessMap]);

  const handleMarkerClick = useCallback((venue: GoogleVenue) => { setSelectedVenue(venue); }, []);
  const handleCityChange = (idx: number) => {
    setCityIdx(idx);
    setCategory("all");
    setSearch("");
    setIndoorOnly(false);
  };

  const addToRoute = (venue: GoogleVenue) => { if (!route.find((v) => v.id === venue.id)) setRoute([...route, venue]); };
  const removeFromRoute = (id: string) => { setRoute(route.filter((v) => v.id !== id)); };
  const moveInRoute = (i: number, d: -1 | 1) => {
    const n = [...route]; const j = i + d;
    if (j < 0 || j >= n.length) return;
    [n[i], n[j]] = [n[j], n[i]]; setRoute(n);
  };

  const routeDistance = route.reduce((t, v, i) => i === 0 ? 0 : t + haversine(route[i-1].lat, route[i-1].lng, v.lat, v.lng), 0);
  const routeWalkMins = walkingTime(routeDistance);
  const weatherInfo = weather ? (WMO[weather.weather_code] || { label: "Unknown", icon: "🌡️" }) : null;
  const quietCount = filtered.filter((v) => getVenueBusy(v).level === "quiet").length;
  const busyCount = filtered.filter((v) => getVenueBusy(v).level === "busy" || getVenueBusy(v).level === "very_busy").length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Live City Map</h1>
              <p className="text-blue-200 text-sm">🇳🇱 {city.name} — {loading ? "loading..." : `${filtered.length} venues`}</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-right">
            {weather && weatherInfo && (
              <>
                <div className="flex items-center gap-2 bg-white/10 rounded-xl px-3 py-2">
                  <span className="text-2xl">{weatherInfo.icon}</span>
                  <div>
                    <p className="text-lg font-bold leading-tight">{Math.round(weather.temperature_2m)}°C</p>
                    <p className="text-[10px] text-blue-200">{weatherInfo.label}</p>
                  </div>
                </div>
                <div className="h-8 w-px bg-white/20" />
              </>
            )}
            <div>
              <p className="text-2xl font-bold">{filtered.length}</p>
              <p className="text-blue-200 text-xs">Venues</p>
            </div>
            <div className="h-8 w-px bg-white/20" />
            <div>
              <p className="text-2xl font-bold text-green-300">🟢 {quietCount}</p>
              <p className="text-blue-200 text-xs">Quiet now</p>
            </div>
          </div>
        </div>
        {weather && (
          <div className="mt-3 flex items-center gap-3 rounded-lg bg-white/10 px-3 py-2 text-sm">
            <span className="text-xs">💡</span>
            <p className="text-blue-100 text-xs">{getSmartTip(weather.weather_code, weather.temperature_2m)}</p>
            {busyCount > 0 && <span className="text-amber-200 text-[10px] ml-2">⚠️ {busyCount} busy now</span>}
            <span className="text-blue-300 text-[10px] ml-auto">Powered by Google Places + Open-Meteo</span>
          </div>
        )}
      </div>

      {/* City Selector — NL cities */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {NL_CITIES.map((c, i) => (
          <button key={c.id} onClick={() => handleCityChange(i)}
            className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
              cityIdx === i ? "bg-blue-600 text-white shadow-md shadow-blue-500/20" : "bg-white border border-border/60 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
            }`}>
            <span className="text-base">🇳🇱</span>
            <span>{c.name}</span>
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 sm:max-w-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder={`Search venues in ${city.name}...`}
            className="h-11 w-full rounded-xl border border-border/60 bg-white pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10" />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {CATEGORIES.map((c) => (
            <button key={c.id} onClick={() => setCategory(c.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                category === c.id ? "bg-foreground text-white shadow-sm" : "bg-white border border-border/60 text-muted hover:bg-gray-50"
              }`}>
              <span className="mr-1">{c.icon}</span> {c.label}
            </button>
          ))}
        </div>
        <button onClick={() => setIndoorOnly(!indoorOnly)}
          className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
            indoorOnly ? "bg-amber-500 text-white shadow-sm" : "bg-white border border-border/60 text-muted hover:bg-gray-50"
          }`}>
          🏠 Indoor only
        </button>
      </div>

      {/* Map + Sidebar */}
      <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
        <div className="space-y-4">
          {/* Map */}
          <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden" style={{ height: "480px" }}>
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
                  <p className="text-sm text-muted mt-3">Loading venues in {city.name}...</p>
                </div>
              </div>
            ) : (
              <APIProvider apiKey={apiKey}>
                <Map key={city.id} defaultCenter={{ lat: city.lat, lng: city.lng }} defaultZoom={city.zoom}
                  mapId="1a3172e8a192f4b578d440bb" gestureHandling="greedy" disableDefaultUI={false}
                  style={{ width: "100%", height: "100%" }}>
                  {filtered.map((venue) => {
                    const inRoute = route.find((v) => v.id === venue.id);
                    const routeIdx = route.findIndex((v) => v.id === venue.id);
                    const busy = getVenueBusy(venue);
                    return (
                      <AdvancedMarker key={venue.id} position={{ lat: venue.lat, lng: venue.lng }} onClick={() => handleMarkerClick(venue)}>
                        <div className="relative">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-full ${CATEGORY_COLORS[venue.category] || "bg-gray-500"} text-white text-sm shadow-lg ring-2 ${inRoute ? "ring-amber-400 scale-110" : "ring-white"} cursor-pointer hover:scale-110 transition-transform`}>
                            {CATEGORY_ICONS[venue.category] || "📍"}
                          </div>
                          {inRoute && (
                            <div className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white ring-2 ring-white">
                              {routeIdx + 1}
                            </div>
                          )}
                          <div className="absolute -bottom-1 -left-1 text-[8px]">{busy?.icon}</div>
                        </div>
                      </AdvancedMarker>
                    );
                  })}

                  {selectedVenue && (
                    <InfoWindow position={{ lat: selectedVenue.lat, lng: selectedVenue.lng }} onCloseClick={() => setSelectedVenue(null)} pixelOffset={[0, -40]}>
                      <div className="max-w-[280px] p-1">
                        <div className="flex items-center gap-2 mb-1">
                          <VenuePhoto photo={selectedVenue.photo} name={selectedVenue.name} size="md" />
                          <div>
                            <h3 className="font-bold text-sm leading-tight">{selectedVenue.name}</h3>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-xs text-amber-500">★ {selectedVenue.rating}</span>
                              <span className="text-[10px] text-gray-400">({selectedVenue.reviews.toLocaleString()})</span>
                              <BusynessDot info={getVenueBusy(selectedVenue)} size="md" />
                              {getVenueBusy(selectedVenue).isLive && <span className="text-[8px] text-red-500 font-bold">LIVE</span>}
                            </div>
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 mb-2">{selectedVenue.address}</p>

                        <div className="mb-2 rounded-lg bg-gray-50 p-2">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[9px] font-medium text-gray-500">Popular times today</p>
                            {getVenueBusy(selectedVenue).isLive && <span className="text-[8px] bg-red-50 text-red-500 px-1.5 py-0.5 rounded-full font-medium">🔴 Live data</span>}
                          </div>
                          <BusynessChart category={selectedVenue.category} liveHourly={getVenueBusy(selectedVenue).hourly} />
                          <p className="text-[9px] text-gray-400 mt-1 italic">{getVenueBusy(selectedVenue)?.tip}</p>
                        </div>

                        {!getVenueBusy(selectedVenue).isLive && (
                          <button onClick={() => loadSingleLive(selectedVenue)} disabled={loadingVenueId === selectedVenue.id}
                            className="w-full mb-2 rounded-lg bg-red-50 border border-red-200 px-3 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-100 disabled:opacity-50 transition-colors">
                            {loadingVenueId === selectedVenue.id ? "⏳ Loading live data..." : "🔴 Load real busyness (2 credits)"}
                          </button>
                        )}

                        <div className="flex items-center gap-3 text-xs">
                          {selectedVenue.open_now !== null && (
                            <span className={`font-medium ${selectedVenue.open_now ? "text-green-600" : "text-red-500"}`}>
                              {selectedVenue.open_now ? "✓ Open now" : "✗ Closed"}
                            </span>
                          )}
                          <span className="text-gray-500">{selectedVenue.indoor ? "🏠 Indoor" : "☀️ Outdoor"}</span>
                        </div>
                        <button onClick={() => addToRoute(selectedVenue)}
                          disabled={!!route.find((v) => v.id === selectedVenue.id)}
                          className="mt-2 w-full rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                          {route.find((v) => v.id === selectedVenue.id) ? "✓ In route" : "+ Add to day route"}
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </Map>
              </APIProvider>
            )}
          </div>

          {/* Route Planner */}
          <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-border/30 px-4 py-3 bg-gradient-to-r from-amber-50 to-orange-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-base">🗺️</span>
                  <div>
                    <p className="text-sm font-semibold">Day Route Planner</p>
                    <p className="text-[10px] text-muted">Click venues → add to your route</p>
                  </div>
                </div>
                {route.length > 0 && (
                  <div className="flex items-center gap-3 text-xs">
                    <span className="font-medium text-gray-500">🚶 {(routeDistance * 1.3).toFixed(1)}km</span>
                    <span className="font-medium text-gray-500">⏱️ ~{Math.round(routeWalkMins * 1.3)}min</span>
                  </div>
                )}
              </div>
            </div>
            {route.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <p className="text-sm text-muted">No venues in your route yet</p>
                <p className="text-xs text-gray-400 mt-1">Click a venue → &quot;Add to day route&quot;</p>
              </div>
            ) : (
              <div className="divide-y divide-border/20">
                {route.map((v, i) => {
                  const dist = i > 0 ? haversine(route[i-1].lat, route[i-1].lng, v.lat, v.lng) : 0;
                  const busy = getVenueBusy(v);
                  return (
                    <div key={v.id}>
                      {i > 0 && (
                        <div className="flex items-center gap-2 px-4 py-1.5 bg-gray-50/50">
                          <span className="text-[10px] text-gray-400">🚶 {(dist * 1.3).toFixed(1)}km • ~{Math.round(walkingTime(dist) * 1.3)}min</span>
                          <div className="flex-1 border-t border-dashed border-gray-200" />
                        </div>
                      )}
                      <div className="flex items-center gap-3 px-4 py-2.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-amber-500 text-xs font-bold text-white">{i + 1}</div>
                        <VenuePhoto photo={v.photo} name={v.name} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium truncate">{v.name}</p>
                            <BusynessDot info={busy} size="md" />
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-gray-400">
                            <span>★ {v.rating}</span>
                            <span>{v.indoor ? "🏠" : "☀️"}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <button onClick={() => moveInRoute(i, -1)} className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 15l-6-6-6 6" /></svg>
                          </button>
                          <button onClick={() => moveInRoute(i, 1)} className="rounded p-1 text-gray-300 hover:text-gray-500 hover:bg-gray-100">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6" /></svg>
                          </button>
                          <button onClick={() => removeFromRoute(v.id)} className="rounded p-1 text-gray-300 hover:text-red-500 hover:bg-red-50">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" /></svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div className="px-4 py-3 bg-amber-50/50">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-gray-600">📍 {route.length} stops • 🚶 {(routeDistance * 1.3).toFixed(1)}km • ⏱️ ~{Math.round(routeWalkMins * 1.3)}min walking</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Venue sidebar */}
        <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-border/30 px-4 py-3 bg-gray-50/50">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{filtered.length} venues in {city.name}</p>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-[10px] text-gray-400">🟢 {quietCount} quiet</span>
                  <span className="text-[10px] text-gray-400">🔴 {busyCount} busy</span>
                  {liveLoaded ? (
                    <span className="text-[10px] text-red-500 font-medium">🔴 Live busyness active ({Object.keys(liveBusyness).length} venues)</span>
                  ) : (
                    <span className="text-[10px] text-green-500 font-medium">Real Google data</span>
                  )}
                </div>
              </div>
              {liveLoaded && (
                <span className="shrink-0 text-[9px] bg-red-50 text-red-500 px-2 py-1 rounded-full font-medium">🔴 {Object.keys(liveBusyness).length} live</span>
              )}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "920px" }}>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
              </div>
            ) : filtered.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-muted">No venues found</div>
            ) : (
              filtered.map((v) => {
                const inRoute = !!route.find((r) => r.id === v.id);
                const busy = getVenueBusy(v);
                return (
                  <div key={v.id}
                    className={`w-full text-left px-4 py-3 border-b border-border/20 hover:bg-blue-50/50 transition-colors ${
                      selectedVenue?.id === v.id ? "bg-blue-50 border-l-2 border-l-blue-500" : ""
                    } ${inRoute ? "bg-amber-50/30" : ""}`}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => setSelectedVenue(v)} className={`${inRoute ? "ring-2 ring-amber-400 rounded-lg" : ""}`}>
                        <VenuePhoto photo={v.photo} name={v.name} />
                      </button>
                      <button onClick={() => setSelectedVenue(v)} className="flex-1 min-w-0 text-left">
                        <div className="flex items-center gap-1.5">
                          <p className="text-sm font-semibold truncate">{v.name}</p>
                          <BusynessDot info={busy} />
                        </div>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-amber-500">★ {v.rating}</span>
                          <span className="text-[10px] text-gray-400">({v.reviews.toLocaleString()})</span>
                          <span className="text-[10px]">{v.indoor ? "🏠" : "☀️"}</span>
                          {v.open_now !== null && (
                            <span className={`text-[10px] font-medium ${v.open_now ? "text-green-500" : "text-red-400"}`}>
                              {v.open_now ? "Open" : "Closed"}
                            </span>
                          )}
                        </div>
                        <div className="mt-1.5 flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                            <div className={`h-full rounded-full ${busy?.bgColor || "bg-gray-300"}`}
                              style={{ width: `${busy?.percentage || 0}%` }} />
                          </div>
                          <span className={`text-[9px] font-medium ${busy?.color || "text-gray-400"}`}>{busy?.label}</span>
                          {busy?.isLive && <span className="text-[7px] text-red-500 font-bold">LIVE</span>}
                        </div>
                      </button>
                      <button onClick={() => inRoute ? removeFromRoute(v.id) : addToRoute(v)}
                        className={`shrink-0 rounded-lg px-2 py-1 text-[10px] font-bold transition-all ${
                          inRoute ? "bg-amber-100 text-amber-600 hover:bg-red-100 hover:text-red-600" : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                        }`}>
                        {inRoute ? "✓" : "+"}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-xs font-semibold text-muted">Categories:</p>
          {Object.entries(CATEGORY_COLORS).map(([cat, color]) => (
            <div key={cat} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-full ${color}`} />
              <span className="text-xs text-muted capitalize">{cat}</span>
            </div>
          ))}
          <div className="h-4 w-px bg-gray-200" />
          <span className="text-xs text-muted">🟢 Quiet</span>
          <span className="text-xs text-muted">🟡 Moderate</span>
          <span className="text-xs text-muted">🟠 Busy</span>
          <span className="text-xs text-muted">🔴 Very busy</span>
          <span className="ml-auto text-[10px] text-gray-400">Data by Google Places API{liveLoaded ? " + BestTime.app" : ""}</span>
        </div>
      </div>
    </div>
  );
}
