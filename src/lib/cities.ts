export type Venue = {
  id: string;
  name: string;
  category: string;
  lat: number;
  lng: number;
  price_b2b: number;
  price_retail: number;
  duration: string;
  max_group: number;
  rating: number;
  image: string;
  description: string;
  indoor: boolean;
};

/* ── Google Places venue type ── */
export type GoogleVenue = {
  id: string;
  place_id: string;
  name: string;
  lat: number;
  lng: number;
  rating: number;
  reviews: number;
  types: string[];
  category: string;
  address: string;
  photo: string | null;
  open_now: boolean | null;
  price_level: number | null;
  indoor: boolean;
};

export type City = {
  id: string;
  name: string;
  country: string;
  flag: string;
  lat: number;
  lng: number;
  timezone: string;
  zoom: number;
  venues: Venue[];
};

export const CATEGORIES = [
  { id: "all", label: "All", icon: "📍" },
  { id: "museum", label: "Museums", icon: "🏛️" },
  { id: "cruise", label: "Cruises", icon: "🚢" },
  { id: "experience", label: "Attractions", icon: "🎯" },
  { id: "outdoor", label: "Outdoor", icon: "🌳" },
  { id: "food", label: "Food & Drink", icon: "🍽️" },
  { id: "tour", label: "Tours", icon: "🏮" },
  { id: "nightlife", label: "Nightlife", icon: "🌙" },
  { id: "entertainment", label: "Shows", icon: "🎭" },
];

export const CATEGORY_COLORS: Record<string, string> = {
  museum: "bg-blue-500",
  cruise: "bg-cyan-500",
  experience: "bg-purple-500",
  outdoor: "bg-green-500",
  food: "bg-orange-500",
  tour: "bg-red-500",
  nightlife: "bg-indigo-500",
  shopping: "bg-pink-500",
  wellness: "bg-teal-500",
  entertainment: "bg-violet-500",
  transport: "bg-slate-500",
};

export const CATEGORY_ICONS: Record<string, string> = {
  museum: "🏛️",
  cruise: "🚢",
  experience: "🎯",
  outdoor: "🌳",
  food: "🍽️",
  tour: "🏮",
  nightlife: "🌙",
  shopping: "🛍️",
  wellness: "💆",
  entertainment: "🎭",
  transport: "🚌",
};

/* ── Busyness / Popular Times simulation (fallback when no BestTime data) ── */
const BUSY_PATTERNS: Record<string, number[]> = {
  museum:     [0,0,0,0,0,0,0,5,10,30,55,75,90,85,80,70,60,45,25,10,5,0,0,0],
  cruise:     [0,0,0,0,0,0,0,0,5,20,40,60,70,75,80,70,55,40,30,15,5,0,0,0],
  experience: [0,0,0,0,0,0,0,5,10,25,45,65,80,85,80,70,60,50,35,20,10,5,0,0],
  outdoor:    [0,0,0,0,0,0,5,10,20,35,50,65,75,80,75,65,55,40,25,15,5,0,0,0],
  food:       [0,0,0,0,0,0,0,0,5,10,20,45,80,70,40,30,40,65,90,85,60,30,10,0],
  tour:       [0,0,0,0,0,0,0,5,10,30,55,70,65,55,60,65,50,35,20,10,5,0,0,0],
  nightlife:  [0,0,0,0,0,0,0,0,0,0,0,0,5,5,10,15,20,30,50,70,85,95,90,70],
  shopping:   [0,0,0,0,0,0,0,0,5,15,35,55,70,65,50,45,55,60,40,20,5,0,0,0],
  wellness:   [0,0,0,0,0,0,0,5,15,35,50,60,55,45,40,50,55,45,30,15,5,0,0,0],
  entertainment:[0,0,0,0,0,0,0,0,5,10,25,40,50,55,60,65,55,45,55,70,80,65,40,15],
  transport:  [0,0,0,0,0,5,10,30,60,70,50,40,35,40,45,50,55,65,70,50,30,15,5,0],
};

export type BusynessLevel = "quiet" | "moderate" | "busy" | "very_busy";

export type BusynessInfo = {
  level: BusynessLevel;
  percentage: number;
  label: string;
  color: string;
  bgColor: string;
  icon: string;
  tip: string;
};

export function getBusynessFromPercentage(pct: number): BusynessInfo {
  if (pct < 20) return { level: "quiet", percentage: pct, label: "Quiet", color: "text-green-600", bgColor: "bg-green-500", icon: "🟢", tip: "Great time to visit — no crowds expected" };
  if (pct < 50) return { level: "moderate", percentage: pct, label: "Moderate", color: "text-amber-600", bgColor: "bg-amber-500", icon: "🟡", tip: "Average crowd levels — comfortable visit" };
  if (pct < 75) return { level: "busy", percentage: pct, label: "Busy", color: "text-orange-600", bgColor: "bg-orange-500", icon: "🟠", tip: "Expect queues — book skip-the-line if possible" };
  return { level: "very_busy", percentage: pct, label: "Very Busy", color: "text-red-600", bgColor: "bg-red-500", icon: "🔴", tip: "Peak hours — consider alternative time slots" };
}

export function getVenueBusyness(category: string, hour?: number): BusynessInfo {
  const h = hour ?? new Date().getHours();
  const pattern = BUSY_PATTERNS[category] || BUSY_PATTERNS.experience;
  const base = pattern[h] || 0;
  const jitter = Math.round((Math.random() - 0.5) * 16);
  const pct = Math.max(0, Math.min(100, base + jitter));
  return getBusynessFromPercentage(pct);
}

export function getHourlyBusyness(category: string): { hour: number; pct: number }[] {
  const pattern = BUSY_PATTERNS[category] || BUSY_PATTERNS.experience;
  return pattern.map((pct, hour) => ({ hour, pct }));
}

/* ── Dutch cities (focus market) ── */
export const NL_CITIES = [
  { id: "amsterdam", name: "Amsterdam", lat: 52.3676, lng: 4.9041, timezone: "Europe/Amsterdam", zoom: 13 },
  { id: "rotterdam", name: "Rotterdam", lat: 51.9225, lng: 4.4792, timezone: "Europe/Amsterdam", zoom: 13 },
  { id: "den-haag", name: "Den Haag", lat: 52.0705, lng: 4.3007, timezone: "Europe/Amsterdam", zoom: 13 },
  { id: "utrecht", name: "Utrecht", lat: 52.0907, lng: 5.1214, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "eindhoven", name: "Eindhoven", lat: 51.4416, lng: 5.4697, timezone: "Europe/Amsterdam", zoom: 13 },
  { id: "groningen", name: "Groningen", lat: 53.2194, lng: 6.5665, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "maastricht", name: "Maastricht", lat: 50.8514, lng: 5.6910, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "haarlem", name: "Haarlem", lat: 52.3874, lng: 4.6462, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "delft", name: "Delft", lat: 52.0116, lng: 4.3571, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "leiden", name: "Leiden", lat: 52.1601, lng: 4.4970, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "arnhem", name: "Arnhem", lat: 51.9851, lng: 5.8987, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "nijmegen", name: "Nijmegen", lat: 51.8126, lng: 5.8372, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "alkmaar", name: "Alkmaar", lat: 52.6324, lng: 4.7534, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "dordrecht", name: "Dordrecht", lat: 51.8133, lng: 4.6901, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "gouda", name: "Gouda", lat: 52.0115, lng: 4.7104, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "zaandam", name: "Zaandam", lat: 52.4389, lng: 4.8263, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "hoorn", name: "Hoorn", lat: 52.6424, lng: 5.0602, timezone: "Europe/Amsterdam", zoom: 14 },
  { id: "middelburg", name: "Middelburg", lat: 51.4988, lng: 3.6109, timezone: "Europe/Amsterdam", zoom: 14 },
];

/* ── Legacy hardcoded cities for weather page fallback ── */
export const CITIES: City[] = [
  {
    id: "amsterdam", name: "Amsterdam", country: "Netherlands", flag: "🇳🇱",
    lat: 52.3676, lng: 4.9041, timezone: "Europe/Amsterdam", zoom: 13, venues: [],
  },
  {
    id: "rotterdam", name: "Rotterdam", country: "Netherlands", flag: "🇳🇱",
    lat: 51.9225, lng: 4.4792, timezone: "Europe/Amsterdam", zoom: 13, venues: [],
  },
  {
    id: "den-haag", name: "Den Haag", country: "Netherlands", flag: "🇳🇱",
    lat: 52.0705, lng: 4.3007, timezone: "Europe/Amsterdam", zoom: 13, venues: [],
  },
  {
    id: "utrecht", name: "Utrecht", country: "Netherlands", flag: "🇳🇱",
    lat: 52.0907, lng: 5.1214, timezone: "Europe/Amsterdam", zoom: 14, venues: [],
  },
  {
    id: "eindhoven", name: "Eindhoven", country: "Netherlands", flag: "🇳🇱",
    lat: 51.4416, lng: 5.4697, timezone: "Europe/Amsterdam", zoom: 13, venues: [],
  },
  {
    id: "groningen", name: "Groningen", country: "Netherlands", flag: "🇳🇱",
    lat: 53.2194, lng: 6.5665, timezone: "Europe/Amsterdam", zoom: 14, venues: [],
  },
  {
    id: "maastricht", name: "Maastricht", country: "Netherlands", flag: "🇳🇱",
    lat: 50.8514, lng: 5.6910, timezone: "Europe/Amsterdam", zoom: 14, venues: [],
  },
  {
    id: "haarlem", name: "Haarlem", country: "Netherlands", flag: "🇳🇱",
    lat: 52.3874, lng: 4.6462, timezone: "Europe/Amsterdam", zoom: 14, venues: [],
  },
  {
    id: "delft", name: "Delft", country: "Netherlands", flag: "🇳🇱",
    lat: 52.0116, lng: 4.3571, timezone: "Europe/Amsterdam", zoom: 14, venues: [],
  },
  {
    id: "leiden", name: "Leiden", country: "Netherlands", flag: "🇳🇱",
    lat: 52.1601, lng: 4.4970, timezone: "Europe/Amsterdam", zoom: 14, venues: [],
  },
];
