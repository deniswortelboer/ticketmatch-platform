"use client";

import { useState, useEffect } from "react";
import { APIProvider, Map, AdvancedMarker } from "@vis.gl/react-google-maps";

const AMSTERDAM = { lat: 52.3676, lng: 4.9041 };

const SAMPLE_VENUES = [
  { id: "1", name: "Rijksmuseum", lat: 52.3600, lng: 4.8852, cat: "museum", color: "#10B981" },
  { id: "2", name: "Anne Frank House", lat: 52.3752, lng: 4.8840, cat: "museum", color: "#10B981" },
  { id: "3", name: "Van Gogh Museum", lat: 52.3584, lng: 4.8811, cat: "museum", color: "#10B981" },
  { id: "4", name: "A'DAM Lookout", lat: 52.3843, lng: 4.9015, cat: "attraction", color: "#8B5CF6" },
  { id: "5", name: "Moco Museum", lat: 52.3577, lng: 4.8843, cat: "museum", color: "#10B981" },
  { id: "6", name: "Canal Cruise", lat: 52.3769, lng: 4.8986, cat: "cruise", color: "#3B82F6" },
  { id: "7", name: "Heineken Experience", lat: 52.3579, lng: 4.8919, cat: "attraction", color: "#8B5CF6" },
  { id: "8", name: "NEMO Science", lat: 52.3738, lng: 4.9123, cat: "museum", color: "#10B981" },
  { id: "9", name: "Foodhallen", lat: 52.3620, lng: 4.8697, cat: "restaurant", color: "#F59E0B" },
  { id: "10", name: "Madame Tussauds", lat: 52.3724, lng: 4.8929, cat: "attraction", color: "#8B5CF6" },
  { id: "11", name: "Artis Zoo", lat: 52.3660, lng: 4.9163, cat: "attraction", color: "#8B5CF6" },
  { id: "12", name: "This Is Holland", lat: 52.3905, lng: 4.8990, cat: "experience", color: "#EF4444" },
];

const BUSYNESS_HOURS = [
  { hour: 9, pct: 20 }, { hour: 10, pct: 35 }, { hour: 11, pct: 55 },
  { hour: 12, pct: 70 }, { hour: 13, pct: 80 }, { hour: 14, pct: 95 },
  { hour: 15, pct: 85 }, { hour: 16, pct: 70 }, { hour: 17, pct: 50 },
  { hour: 18, pct: 35 }, { hour: 19, pct: 25 }, { hour: 20, pct: 15 },
];

export default function HomepageMap() {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY || "";
  const [hovered, setHovered] = useState<string | null>(null);
  const [currentHour, setCurrentHour] = useState(14);

  useEffect(() => {
    setCurrentHour(new Date().getHours());
  }, []);

  if (!apiKey) {
    return (
      <div className="flex h-full items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
        <p className="text-sm text-muted">Map loading...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <APIProvider apiKey={apiKey}>
        <Map
          defaultCenter={AMSTERDAM}
          defaultZoom={13}
          mapId="1a3172e8a192f4b578d440bb"
          gestureHandling="cooperative"
          disableDefaultUI={true}
          zoomControl={true}
          style={{ width: "100%", height: "100%" }}
        >
          {SAMPLE_VENUES.map((v) => (
            <AdvancedMarker
              key={v.id}
              position={{ lat: v.lat, lng: v.lng }}
              onMouseEnter={() => setHovered(v.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <div className="flex flex-col items-center">
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white shadow-lg text-[9px] font-bold text-white transition-transform"
                  style={{
                    backgroundColor: v.color,
                    transform: hovered === v.id ? "scale(1.3)" : "scale(1)",
                  }}
                >
                  {v.name[0]}
                </div>
                {hovered === v.id && (
                  <div className="mt-1 whitespace-nowrap rounded-md bg-white/95 px-2 py-1 text-[9px] font-semibold shadow-lg backdrop-blur-sm">
                    {v.name}
                  </div>
                )}
              </div>
            </AdvancedMarker>
          ))}
        </Map>
      </APIProvider>

      {/* Live Busyness overlay */}
      <div className="absolute bottom-3 left-3 rounded-xl bg-white/95 backdrop-blur-sm p-3 shadow-lg border border-border/40">
        <p className="text-[9px] font-semibold text-muted uppercase tracking-wider mb-2">Live Busyness · Amsterdam</p>
        <div className="flex items-end gap-[3px]">
          {BUSYNESS_HOURS.map((h) => {
            const isCurrent = h.hour === currentHour;
            const color = h.pct >= 80 ? "bg-red-400" : h.pct >= 50 ? "bg-amber-400" : "bg-emerald-400";
            return (
              <div key={h.hour} className="flex flex-col items-center gap-0.5">
                <div
                  className={`w-[7px] rounded-t-sm transition-all ${isCurrent ? "ring-1 ring-blue-500" : "opacity-70"} ${color}`}
                  style={{ height: `${Math.max(3, h.pct * 0.35)}px` }}
                />
                {(h.hour % 2 === 0) && (
                  <span className={`text-[6px] ${isCurrent ? "text-blue-600 font-bold" : "text-gray-400"}`}>{h.hour}</span>
                )}
              </div>
            );
          })}
        </div>
        <div className="mt-1.5 flex items-center gap-3 text-[7px] text-muted">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Quiet</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Moderate</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-red-400" />Busy</span>
        </div>
      </div>

      {/* Route planner badge */}
      <div className="absolute top-3 right-3 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-2.5 shadow-lg border border-border/40">
        <p className="text-[9px] font-semibold">🗺️ Day Route Planner</p>
        <p className="text-[8px] text-muted mt-0.5">4 venues · 2.3 km · 45 min walk</p>
      </div>

      {/* Category legend */}
      <div className="absolute bottom-3 right-3 rounded-xl bg-white/95 backdrop-blur-sm px-3 py-2.5 shadow-lg border border-border/40">
        <div className="flex flex-col gap-1">
          {[
            { color: "#10B981", label: "Museums", count: 4 },
            { color: "#8B5CF6", label: "Attractions", count: 4 },
            { color: "#3B82F6", label: "Cruises", count: 1 },
            { color: "#F59E0B", label: "Restaurants", count: 1 },
            { color: "#EF4444", label: "Experiences", count: 1 },
          ].map((c) => (
            <div key={c.label} className="flex items-center gap-1.5 text-[8px]">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: c.color }} />
              <span className="text-gray-600">{c.label}</span>
              <span className="text-gray-400 ml-auto">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Venue count badge */}
      <div className="absolute top-3 left-3 rounded-xl bg-blue-600 px-3 py-2 shadow-lg text-white">
        <p className="text-[10px] font-bold">Amsterdam</p>
        <p className="text-[8px] text-blue-200">12 venues shown · 120+ available</p>
      </div>
    </div>
  );
}
