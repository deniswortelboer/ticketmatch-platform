"use client";

import { useState, useRef, useEffect, useCallback } from "react";

interface CityInfo {
  name: string;
  country: string;
  flag: string;
  experiences: string;
  categories: number;
  trending?: boolean;
}

const cityData: CityInfo[] = [
  // Netherlands
  { name: "Amsterdam", country: "Netherlands", flag: "🇳🇱", experiences: "8,400+", categories: 12, trending: true },
  { name: "Rotterdam", country: "Netherlands", flag: "🇳🇱", experiences: "2,100+", categories: 11, trending: true },
  { name: "The Hague", country: "Netherlands", flag: "🇳🇱", experiences: "1,200+", categories: 10 },
  { name: "Utrecht", country: "Netherlands", flag: "🇳🇱", experiences: "950+", categories: 9 },
  { name: "Eindhoven", country: "Netherlands", flag: "🇳🇱", experiences: "680+", categories: 8 },
  { name: "Haarlem", country: "Netherlands", flag: "🇳🇱", experiences: "520+", categories: 8 },
  { name: "Maastricht", country: "Netherlands", flag: "🇳🇱", experiences: "470+", categories: 7 },
  { name: "Leiden", country: "Netherlands", flag: "🇳🇱", experiences: "380+", categories: 7 },
  { name: "Groningen", country: "Netherlands", flag: "🇳🇱", experiences: "340+", categories: 6 },
  { name: "Arnhem", country: "Netherlands", flag: "🇳🇱", experiences: "290+", categories: 6 },
  { name: "Nijmegen", country: "Netherlands", flag: "🇳🇱", experiences: "260+", categories: 5 },
  { name: "Leeuwarden", country: "Netherlands", flag: "🇳🇱", experiences: "210+", categories: 5 },
  { name: "Alkmaar", country: "Netherlands", flag: "🇳🇱", experiences: "190+", categories: 5 },
  { name: "Gouda", country: "Netherlands", flag: "🇳🇱", experiences: "150+", categories: 4 },
  { name: "Dordrecht", country: "Netherlands", flag: "🇳🇱", experiences: "140+", categories: 4 },
  { name: "Zaandam", country: "Netherlands", flag: "🇳🇱", experiences: "180+", categories: 5 },
  { name: "Hoorn", country: "Netherlands", flag: "🇳🇱", experiences: "120+", categories: 4 },
  { name: "Middelburg", country: "Netherlands", flag: "🇳🇱", experiences: "110+", categories: 4 },
  // Europe
  { name: "London", country: "United Kingdom", flag: "🇬🇧", experiences: "22,000+", categories: 12, trending: true },
  { name: "Paris", country: "France", flag: "🇫🇷", experiences: "18,000+", categories: 12, trending: true },
  { name: "Rome", country: "Italy", flag: "🇮🇹", experiences: "16,000+", categories: 12 },
  { name: "Barcelona", country: "Spain", flag: "🇪🇸", experiences: "14,000+", categories: 12, trending: true },
  { name: "Madrid", country: "Spain", flag: "🇪🇸", experiences: "11,000+", categories: 11 },
  { name: "Berlin", country: "Germany", flag: "🇩🇪", experiences: "9,800+", categories: 11 },
  { name: "Lisbon", country: "Portugal", flag: "🇵🇹", experiences: "8,600+", categories: 10 },
  { name: "Prague", country: "Czech Republic", flag: "🇨🇿", experiences: "7,200+", categories: 10 },
  { name: "Vienna", country: "Austria", flag: "🇦🇹", experiences: "6,400+", categories: 9 },
  { name: "Budapest", country: "Hungary", flag: "🇭🇺", experiences: "5,800+", categories: 9 },
  { name: "Brussels", country: "Belgium", flag: "🇧🇪", experiences: "5,200+", categories: 9 },
  { name: "Dublin", country: "Ireland", flag: "🇮🇪", experiences: "5,100+", categories: 8 },
  { name: "Copenhagen", country: "Denmark", flag: "🇩🇰", experiences: "4,200+", categories: 8 },
  { name: "Stockholm", country: "Sweden", flag: "🇸🇪", experiences: "3,800+", categories: 7 },
];

const popularCities = ["Amsterdam", "Paris", "London", "Barcelona", "Rotterdam", "Prague"];

export default function CitySearchPreview() {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState<CityInfo | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const previewTimerRef = useRef<NodeJS.Timeout | null>(null);

  const filteredCities = query.trim()
    ? cityData
        .filter((city) => {
          const q = query.toLowerCase();
          return (
            city.name.toLowerCase().includes(q) ||
            city.country.toLowerCase().includes(q)
          );
        })
        .slice(0, 6)
    : [];

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Auto-collapse preview after 3 seconds
  useEffect(() => {
    if (showPreview) {
      previewTimerRef.current = setTimeout(() => {
        setShowPreview(false);
        setSelectedCity(null);
      }, 3000);
    }
    return () => {
      if (previewTimerRef.current) clearTimeout(previewTimerRef.current);
    };
  }, [showPreview]);

  const handleCityClick = useCallback((city: CityInfo) => {
    setQuery(city.name);
    setIsOpen(false);
    setSelectedCity(city);
    setShowPreview(true);
  }, []);

  const handleChipClick = useCallback(
    (cityName: string) => {
      const city = cityData.find((c) => c.name === cityName);
      if (city) {
        setQuery(city.name);
        setSelectedCity(city);
        setShowPreview(true);
        setIsOpen(false);
      }
    },
    []
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    setIsOpen(true);
    setShowPreview(false);
    setSelectedCity(null);
  };

  return (
    <div ref={containerRef} className="w-full max-w-2xl mx-auto">
      <div className="rounded-2xl border border-card-border bg-card-bg p-1">
        {/* Search input */}
        <div className="relative">
          <svg
            className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z"
            />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onFocus={() => {
              if (query.trim()) setIsOpen(true);
            }}
            placeholder="Search any city... Amsterdam, Paris, Barcelona"
            className="rounded-xl bg-surface-alt border-0 px-12 py-4 text-[16px] w-full focus:outline-none focus:ring-2 focus:ring-accent/30 placeholder:text-muted-foreground/60"
          />
          {query && (
            <button
              onClick={() => {
                setQuery("");
                setIsOpen(false);
                setShowPreview(false);
                setSelectedCity(null);
                inputRef.current?.focus();
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {/* Results dropdown */}
        {isOpen && filteredCities.length > 0 && (
          <div className="mt-1 rounded-xl bg-card-bg border border-card-border/50 shadow-lg overflow-hidden">
            {filteredCities.map((city) => (
              <button
                key={city.name}
                onClick={() => handleCityClick(city)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-alt rounded-lg cursor-pointer transition-colors w-full text-left"
              >
                <span className="text-xl flex-shrink-0">{city.flag}</span>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-foreground">{city.name}</span>
                  <span className="text-muted-foreground text-sm ml-1.5">{city.country}</span>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {city.trending && (
                    <span className="bg-emerald-500/10 text-emerald-600 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                      Trending
                    </span>
                  )}
                  <span className="text-muted-foreground text-xs">{city.categories} cat.</span>
                  <span className="text-accent font-semibold text-sm">{city.experiences}</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* No results */}
        {isOpen && query.trim() && filteredCities.length === 0 && (
          <div className="mt-1 rounded-xl bg-card-bg border border-card-border/50 shadow-lg px-4 py-6 text-center">
            <p className="text-muted-foreground text-sm">
              No cities found for &ldquo;{query}&rdquo;
            </p>
            <p className="text-muted-foreground/60 text-xs mt-1">
              Try Amsterdam, Paris, or Barcelona
            </p>
          </div>
        )}

        {/* Popular chips (when no query and no preview) */}
        {!query && !showPreview && (
          <div className="flex items-center gap-2 px-3 py-2.5 flex-wrap">
            <span className="text-muted-foreground text-xs font-medium">Popular:</span>
            {popularCities.map((cityName) => (
              <button
                key={cityName}
                onClick={() => handleChipClick(cityName)}
                className="text-xs font-medium px-3 py-1.5 rounded-full bg-surface-alt hover:bg-accent/10 hover:text-accent text-muted-foreground transition-colors"
              >
                {cityData.find((c) => c.name === cityName)?.flag} {cityName}
              </button>
            ))}
          </div>
        )}

        {/* Selected city preview card */}
        <div
          className={`overflow-hidden transition-all duration-500 ease-in-out ${
            showPreview && selectedCity ? "max-h-48 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {selectedCity && (
            <div className="mx-1 mb-1 mt-2 rounded-xl bg-surface-alt p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-foreground">
                    {selectedCity.flag} {selectedCity.name}
                  </h3>
                  <p className="text-muted-foreground text-sm">{selectedCity.country}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-accent">{selectedCity.experiences}</p>
                  <p className="text-muted-foreground text-xs">experiences</p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {selectedCity.categories} categories available
                </span>
                <a
                  href="#signup"
                  className="text-sm font-semibold text-accent hover:text-accent/80 transition-colors"
                >
                  Sign up to explore B2B rates &rarr;
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
