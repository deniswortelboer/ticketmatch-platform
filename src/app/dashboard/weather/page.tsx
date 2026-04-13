"use client";

import { useState, useEffect, useCallback } from "react";
import { CITIES, CATEGORY_COLORS, CATEGORY_ICONS } from "@/lib/cities";
import type { City, GoogleVenue } from "@/lib/cities";

/* ── Weather code → label + icon mapping ── */
const WMO: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mostly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Freezing fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "❄️" },
  75: { label: "Heavy snow", icon: "❄️" },
  80: { label: "Rain showers", icon: "🌦️" },
  81: { label: "Heavy showers", icon: "🌧️" },
  82: { label: "Violent showers", icon: "⛈️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunderstorm + hail", icon: "⛈️" },
  99: { label: "Thunderstorm + heavy hail", icon: "⛈️" },
};

function getWeatherInfo(code: number) {
  return WMO[code] || { label: "Unknown", icon: "🌡️" };
}

/* ── Smart suggestion logic ── */
function getSuggestions(code: number, temp: number, wind: number) {
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
  const isCold = temp < 8;
  const isHot = temp > 25;
  const isWindy = wind > 30;
  const isNice = !isRainy && !isCold && !isWindy && temp > 12;

  const tips: { text: string; type: "indoor" | "outdoor" | "tip" }[] = [];

  if (isRainy) {
    tips.push({ text: "It's raining — recommend indoor activities to your groups", type: "indoor" });
    tips.push({ text: "Boat cruises have covered options — still a great choice!", type: "tip" });
  }
  if (isCold) {
    tips.push({ text: "Cold weather — museums and indoor experiences are ideal", type: "indoor" });
  }
  if (isHot) {
    tips.push({ text: "Warm day — perfect for cruises and outdoor walks", type: "outdoor" });
    tips.push({ text: "Remind groups to bring water and sunscreen", type: "tip" });
  }
  if (isWindy) {
    tips.push({ text: "Strong winds — consider indoor alternatives today", type: "tip" });
  }
  if (isNice) {
    tips.push({ text: "Beautiful weather — outdoor activities are perfect today!", type: "outdoor" });
    tips.push({ text: "Great day for walking tours and park visits", type: "outdoor" });
  }
  if (tips.length === 0) {
    tips.push({ text: "Mix of indoor and outdoor activities works well today", type: "tip" });
  }

  return tips;
}

function getRecommendedGoogleVenues(venues: GoogleVenue[], code: number, temp: number, wind: number): GoogleVenue[] {
  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(code);
  const isCold = temp < 8;
  const isWindy = wind > 30;
  const preferIndoor = isRainy || isCold || isWindy;

  return venues
    .filter((v) => (preferIndoor ? v.indoor : true))
    .sort((a, b) => b.reviews - a.reviews)
    .slice(0, 6);
}

type WeatherData = {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    precipitation: number;
    weather_code: number;
    wind_speed_10m: number;
    cloud_cover: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    precipitation_probability: number[];
    weather_code: number[];
  };
};

export default function WeatherPage() {
  const [cityId, setCityId] = useState("amsterdam");
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [venues, setVenues] = useState<GoogleVenue[]>([]);

  const city: City = CITIES.find((c) => c.id === cityId) || CITIES[0];

  const fetchWeather = useCallback(async (c: City) => {
    setLoading(true);
    setWeather(null);
    try {
      const res = await fetch(
        `/api/weather?lat=${c.lat}&lng=${c.lng}&tz=${encodeURIComponent(c.timezone)}`
      );
      const data = await res.json();
      if (!data.error) setWeather(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather(city);
  }, [city, fetchWeather]);

  // Fetch Google Places venues
  useEffect(() => {
    setVenues([]);
    fetch(`/api/places?lat=${city.lat}&lng=${city.lng}&city=${city.name}`)
      .then((r) => r.json())
      .then((d) => { if (d.venues) setVenues(d.venues); })
      .catch(() => {});
  }, [city]);

  const handleCityChange = (newCityId: string) => {
    setCityId(newCityId);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {/* City selector while loading */}
        <CitySelector cityId={cityId} onChange={handleCityChange} />
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="h-8 w-8 mx-auto animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            <p className="text-sm text-muted mt-3">Loading weather for {city.name}...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!weather) {
    return (
      <div className="space-y-4">
        <CitySelector cityId={cityId} onChange={handleCityChange} />
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-red-600 font-medium">Weather data unavailable</p>
          <p className="text-sm text-red-400 mt-1">Please try again later</p>
        </div>
      </div>
    );
  }

  const current = weather.current;
  const info = getWeatherInfo(current.weather_code);
  const suggestions = getSuggestions(current.weather_code, current.temperature_2m, current.wind_speed_10m);
  const recommended = getRecommendedGoogleVenues(venues, current.weather_code, current.temperature_2m, current.wind_speed_10m);

  // Get next 12 hours forecast
  const now = new Date();
  const currentHour = now.getHours();
  const hourlyForecast = weather.hourly.time
    .map((t, i) => ({
      time: t,
      hour: new Date(t).getHours(),
      temp: weather.hourly.temperature_2m[i],
      rainChance: weather.hourly.precipitation_probability[i],
      code: weather.hourly.weather_code[i],
    }))
    .filter((h) => h.hour >= currentHour)
    .slice(0, 12);

  const isRainy = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99].includes(current.weather_code);

  return (
    <div className="space-y-4">
      {/* City Selector */}
      <CitySelector cityId={cityId} onChange={handleCityChange} />

      {/* Header */}
      <div className={`rounded-2xl p-6 text-white shadow-lg ${
        isRainy
          ? "bg-gradient-to-r from-slate-600 via-slate-700 to-gray-700"
          : current.temperature_2m > 20
          ? "bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500"
          : "bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-5xl">{info.icon}</div>
            <div>
              <h1 className="text-xl font-bold">Weather & Smart Suggestions</h1>
              <p className={`text-sm ${isRainy ? "text-slate-300" : current.temperature_2m > 20 ? "text-orange-100" : "text-blue-200"}`}>
                {city.flag} {city.name}, {city.country} — Live conditions
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-right">
            <div>
              <p className="text-4xl font-bold">{Math.round(current.temperature_2m)}°C</p>
              <p className={`text-xs ${isRainy ? "text-slate-300" : current.temperature_2m > 20 ? "text-orange-100" : "text-blue-200"}`}>
                Feels like {Math.round(current.apparent_temperature)}°C
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Current conditions grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-sm">🌡️</div>
            <p className="text-xs font-medium text-muted">Temperature</p>
          </div>
          <p className="text-2xl font-bold">{Math.round(current.temperature_2m)}°C</p>
          <p className="text-xs text-muted mt-0.5">Feels like {Math.round(current.apparent_temperature)}°C</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cyan-50 text-sm">💧</div>
            <p className="text-xs font-medium text-muted">Humidity</p>
          </div>
          <p className="text-2xl font-bold">{current.relative_humidity_2m}%</p>
          <p className="text-xs text-muted mt-0.5">{current.precipitation > 0 ? `${current.precipitation}mm rain` : "No precipitation"}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-sm">💨</div>
            <p className="text-xs font-medium text-muted">Wind</p>
          </div>
          <p className="text-2xl font-bold">{Math.round(current.wind_speed_10m)} km/h</p>
          <p className="text-xs text-muted mt-0.5">{current.wind_speed_10m > 30 ? "Strong winds" : current.wind_speed_10m > 15 ? "Breezy" : "Light breeze"}</p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-50 text-sm">☁️</div>
            <p className="text-xs font-medium text-muted">Cloud Cover</p>
          </div>
          <p className="text-2xl font-bold">{current.cloud_cover}%</p>
          <p className="text-xs text-muted mt-0.5">{info.label}</p>
        </div>
      </div>

      {/* Smart Suggestions + Hourly Forecast */}
      <div className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        {/* Smart Suggestions */}
        <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-border/30 px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">💡</span>
              <p className="text-sm font-semibold">Smart Suggestions</p>
            </div>
            <p className="text-xs text-muted mt-0.5">AI-powered recommendations for {city.name}</p>
          </div>
          <div className="p-4 space-y-3">
            {suggestions.map((s, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs ${
                  s.type === "indoor"
                    ? "bg-blue-50 text-blue-500"
                    : s.type === "outdoor"
                    ? "bg-green-50 text-green-500"
                    : "bg-amber-50 text-amber-500"
                }`}>
                  {s.type === "indoor" ? "🏠" : s.type === "outdoor" ? "☀️" : "💡"}
                </div>
                <div>
                  <p className="text-sm font-medium">{s.text}</p>
                  <p className="text-[10px] text-muted uppercase tracking-wide mt-0.5">
                    {s.type === "indoor" ? "Indoor tip" : s.type === "outdoor" ? "Outdoor tip" : "Pro tip"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Forecast */}
        <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-border/30 px-5 py-3 bg-gradient-to-r from-sky-50 to-blue-50">
            <div className="flex items-center gap-2">
              <span className="text-lg">📊</span>
              <p className="text-sm font-semibold">Today&apos;s Forecast — {city.name}</p>
            </div>
            <p className="text-xs text-muted mt-0.5">Hourly outlook for planning activities</p>
          </div>
          <div className="p-4 overflow-x-auto">
            <div className="flex gap-2 min-w-max">
              {hourlyForecast.map((h, i) => {
                const hInfo = getWeatherInfo(h.code);
                return (
                  <div key={i} className="flex flex-col items-center gap-1.5 rounded-xl border border-border/40 bg-gray-50/50 px-3 py-2.5 min-w-[60px]">
                    <p className="text-[10px] font-medium text-muted">
                      {h.hour === currentHour ? "Now" : `${h.hour}:00`}
                    </p>
                    <span className="text-lg">{hInfo.icon}</span>
                    <p className="text-sm font-bold">{Math.round(h.temp)}°</p>
                    {h.rainChance > 0 && (
                      <p className="text-[10px] text-blue-500 font-medium">💧{h.rainChance}%</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recommended Venues */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-border/30 px-5 py-3 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center gap-2">
            <span className="text-lg">⭐</span>
            <p className="text-sm font-semibold">Recommended in {city.name} Today</p>
          </div>
          <p className="text-xs text-muted mt-0.5">
            {isRainy
              ? "Rain expected — showing indoor activities for your groups"
              : current.temperature_2m > 20
              ? "Warm weather — great day for all activities"
              : "Top-rated venues sorted by conditions"
            }
          </p>
        </div>
        <div className="grid gap-0 sm:grid-cols-2 lg:grid-cols-3">
          {recommended.map((v) => (
            <div key={v.id} className="flex items-start gap-3 border-b border-r border-border/20 p-4 hover:bg-green-50/30 transition-colors">
              {v.photo ? (
                <img src={`/api/places/photo?ref=${v.photo}&maxwidth=200`} alt={v.name}
                  className="h-10 w-10 shrink-0 rounded-xl object-cover" />
              ) : (
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${CATEGORY_COLORS[v.category] || "bg-gray-500"} text-white text-lg`}>
                  {CATEGORY_ICONS[v.category] || "📍"}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold truncate">{v.name}</p>
                  <span className="shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded bg-green-50 text-green-600 border border-green-100">
                    {v.indoor ? "🏠 Indoor" : "☀️ Outdoor"}
                  </span>
                </div>
                <p className="text-xs text-muted mt-0.5 line-clamp-1">{v.address}</p>
                <div className="flex items-center gap-3 mt-1.5">
                  <span className="text-[10px] text-amber-500">★ {v.rating}</span>
                  <span className="text-[10px] text-gray-400">({v.reviews.toLocaleString()} reviews)</span>
                  {v.open_now !== null && (
                    <span className={`text-[10px] font-medium ${v.open_now ? "text-green-500" : "text-red-400"}`}>
                      {v.open_now ? "Open" : "Closed"}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Weather disclaimer */}
      <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-50 text-sm">ℹ️</div>
          <div>
            <p className="text-xs text-muted">Weather data by Open-Meteo. Venue data by Google Places. Updated every 10 minutes. Smart suggestions help tour operators plan the best experience for their groups across {CITIES.length} Dutch cities.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── City Selector component ── */
function CitySelector({ cityId, onChange }: { cityId: string; onChange: (id: string) => void }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {CITIES.map((c) => (
        <button
          key={c.id}
          onClick={() => onChange(c.id)}
          className={`flex items-center gap-2 shrink-0 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
            cityId === c.id
              ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
              : "bg-white border border-border/60 text-gray-600 hover:bg-blue-50 hover:border-blue-200"
          }`}
        >
          <span className="text-base">{c.flag}</span>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}
