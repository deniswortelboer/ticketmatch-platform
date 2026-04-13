import type { CityData } from "./cities-data";

export const croatianCities: CityData[] = [
  {
    slug: "dubrovnik",
    name: "Dubrovnik",
    province: "Dubrovnik-Neretva",
    country: "Croatia",
    flag: "\u{1F1ED}\u{1F1F7}",
    experiences: "2,200+",
    categories: 9,
    viatorDestId: 936,
    tagline: "The Pearl of the Adriatic — medieval walls, Game of Thrones & crystal seas",
    description:
      "Dubrovnik is Croatia's crown jewel — a UNESCO-listed walled city of marble streets, baroque churches, and stunning Adriatic coastline. Famous as King's Landing in Game of Thrones, TicketMatch.ai provides B2B access to 2,200+ group experiences at exclusive rates.",
    highlights: [
      "City Walls — The most complete medieval fortification system in Europe, 2km of walkable walls with sea views",
      "Old Town (Stari Grad) — UNESCO marble-paved old town with Stradun, Rector's Palace, and baroque churches",
      "Game of Thrones Filming Locations — King's Landing, the Walk of Shame, the Red Keep, and more",
      "Lokrum Island — Forested island 15 minutes by ferry with botanical gardens and a Dead Sea salt lake",
      "Cable Car — Panoramic ride to Mt. Srđ (412m) with spectacular views over the old town and islands",
      "Elaphiti Islands — Archipelago of car-free islands with beaches, villages, and Renaissance palaces",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "120+", description: "City wall walks, Game of Thrones tours, old town walks, cable car, and Dubrovnik by night." },
      { slug: "river-cruises", name: "Boat Tours", icon: "\u{1F6A2}", count: "60+", description: "Elaphiti Islands cruises, Lokrum ferry, sunset sailing, kayaking tours, and Blue Cave trips." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "40+", description: "Sea kayaking along the walls, snorkeling, cliff jumping, zip-lining, and island beach hopping." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "50+", description: "Dalmatian cooking classes, wine tastings (Pelješac), oyster tours in Ston, and old town food walks." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "60+", description: "Montenegro (Kotor), Mostar (Bosnia), Pelješac wine peninsula, Korčula island, and Mljet National Park." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "25+", description: "City Walls, Fort Lovrijenac, Rector's Palace, Cable Car, and Dubrovnik Aquarium." },
    ],
    geoLat: 42.6507,
    geoLon: 18.0944,
    faq: [
      { q: "What group experiences are available in Dubrovnik?", a: "TicketMatch.ai provides access to 2,200+ experiences: city wall walks, Game of Thrones tours, island cruises, Montenegro day trips, and more — all at exclusive B2B group rates." },
      { q: "What Game of Thrones tours are available?", a: "TicketMatch.ai offers group GoT tours covering all King's Landing filming locations: Fort Lovrijenac (Red Keep), Jesuit Stairs (Walk of Shame), and Trsteno Gardens at B2B rates." },
      { q: "Can I book Montenegro day trips?", a: "Yes. The Bay of Kotor is 2 hours from Dubrovnik. TicketMatch.ai offers group day trips to Kotor, Perast, Budva, and combined Montenegro coast tours at B2B rates." },
      { q: "Is Dubrovnik good for group travel?", a: "Yes, with planning. The old town is compact and can be crowded. TicketMatch.ai's busyness data helps plan visits at optimal times and includes island excursions for balance." },
    ],
  },
];
