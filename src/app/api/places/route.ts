import { NextRequest, NextResponse } from "next/server";

// Cache results in memory to avoid hitting API on every request
const cache = new Map<string, { data: unknown; timestamp: number }>();
const CACHE_TTL = 1000 * 60 * 60; // 1 hour

const PLACE_TYPES = [
  "museum",
  "tourist_attraction",
  "art_gallery",
  "amusement_park",
  "aquarium",
  "zoo",
  "church",
  "park",
  "night_club",
  "spa",
  "shopping_mall",
  "stadium",
  "movie_theater",
  "bar",
];

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const lat = sp.get("lat") || "52.3676";
  const lng = sp.get("lng") || "4.9041";
  const radius = sp.get("radius") || "8000"; // 8km radius
  const cityName = sp.get("city") || "amsterdam";

  const cacheKey = `places_${cityName}_${lat}_${lng}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return NextResponse.json(cached.data);
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  try {
    const allPlaces: GooglePlace[] = [];
    const seenIds = new Set<string>();

    // Search for each place type
    for (const type of PLACE_TYPES) {
      const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=${type}&language=en&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (data.results) {
        for (const place of data.results) {
          if (!seenIds.has(place.place_id)) {
            seenIds.add(place.place_id);
            allPlaces.push(place);
          }
        }
      }
    }

    // Also do a text search for more categories
    for (const query of [`attractions in ${cityName}`, `boat tours ${cityName}`, `wellness spa ${cityName}`, `nightlife ${cityName}`, `shopping ${cityName}`]) {
      const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&location=${lat},${lng}&radius=${radius}&language=en&key=${apiKey}`;
      const res = await fetch(url);
      if (!res.ok) continue;

      const data = await res.json();
      if (data.results) {
        for (const place of data.results) {
          if (!seenIds.has(place.place_id)) {
            seenIds.add(place.place_id);
            allPlaces.push(place);
          }
        }
      }
    }

    // Transform to our format
    const venues = allPlaces
      .filter((p) => p.geometry?.location && p.name)
      .filter((p) => (p.rating || 0) >= 3.5) // Only well-rated places
      .filter((p) => (p.user_ratings_total || 0) >= 50) // At least 50 reviews
      .map((p) => ({
        id: p.place_id,
        place_id: p.place_id,
        name: p.name,
        lat: p.geometry.location.lat,
        lng: p.geometry.location.lng,
        rating: p.rating || 0,
        reviews: p.user_ratings_total || 0,
        types: p.types || [],
        category: mapCategory(p.types || []),
        address: p.vicinity || p.formatted_address || "",
        photo: p.photos?.[0]?.photo_reference || null,
        open_now: p.opening_hours?.open_now ?? null,
        price_level: p.price_level ?? null,
        indoor: isIndoor(p.types || []),
      }))
      .sort((a, b) => b.reviews - a.reviews) // Sort by popularity
      .slice(0, 80); // Top 80 venues

    const result = { venues, total: venues.length, city: cityName };
    cache.set(cacheKey, { data: result, timestamp: Date.now() });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Places API error", details: String(err) }, { status: 500 });
  }
}

type GooglePlace = {
  place_id: string;
  name: string;
  geometry: { location: { lat: number; lng: number } };
  rating?: number;
  user_ratings_total?: number;
  types?: string[];
  vicinity?: string;
  formatted_address?: string;
  photos?: { photo_reference: string }[];
  opening_hours?: { open_now?: boolean };
  price_level?: number;
};

function mapCategory(types: string[]): string {
  if (types.includes("museum") || types.includes("art_gallery")) return "museum";
  if (types.includes("night_club") || types.includes("casino")) return "nightlife";
  if (types.includes("bar") && !types.includes("restaurant")) return "nightlife";
  if (types.includes("spa") || types.includes("beauty_salon") || types.includes("gym")) return "wellness";
  if (types.includes("shopping_mall") || types.includes("clothing_store") || types.includes("department_store")) return "shopping";
  if (types.includes("movie_theater") || types.includes("stadium") || types.includes("bowling_alley")) return "entertainment";
  if (types.includes("zoo") || types.includes("aquarium")) return "outdoor";
  if (types.includes("park") || types.includes("campground")) return "outdoor";
  if (types.includes("amusement_park")) return "experience";
  if (types.includes("church") || types.includes("place_of_worship")) return "museum";
  if (types.includes("restaurant") || types.includes("food") || types.includes("cafe") || types.includes("bakery")) return "food";
  if (types.includes("transit_station") || types.includes("bus_station") || types.includes("train_station")) return "transport";
  return "experience";
}

function isIndoor(types: string[]): boolean {
  const indoorTypes = ["museum", "art_gallery", "aquarium", "shopping_mall", "restaurant", "cafe", "bar"];
  const outdoorTypes = ["park", "zoo", "stadium", "campground"];
  if (outdoorTypes.some((t) => types.includes(t))) return false;
  if (indoorTypes.some((t) => types.includes(t))) return true;
  return true; // default indoor
}
