import type { CityData } from "./cities-data";

export const turkishCities: CityData[] = [
  {
    slug: "istanbul",
    name: "Istanbul",
    province: "Istanbul",
    country: "Turkey",
    flag: "🇹🇷",
    experiences: "4,500+",
    categories: 11,
    viatorDestId: 585,
    tagline: "Where East Meets West — two continents, one legendary city",
    description:
      "Istanbul is the only city in the world straddling two continents, where Byzantine grandeur meets Ottoman splendour across the shimmering Bosphorus. From the soaring dome of Hagia Sophia to the spice-scented lanes of the Grand Bazaar, TicketMatch.ai provides B2B access to 4,500+ group experiences at exclusive rates.",
    highlights: [
      "Hagia Sophia — The iconic 6th-century cathedral-turned-mosque with its massive dome and Byzantine mosaics",
      "Blue Mosque (Sultan Ahmed) — Six-minaret Ottoman masterpiece with over 20,000 handmade Iznik tiles",
      "Grand Bazaar — One of the world's oldest and largest covered markets with 4,000+ shops across 61 streets",
      "Topkapi Palace — The opulent Ottoman imperial residence housing the Treasury, Harem, and sacred relics",
      "Bosphorus Strait — The legendary waterway dividing Europe and Asia, lined with palaces, fortresses, and waterside mansions",
      "Basilica Cistern — Atmospheric underground Byzantine water reservoir with 336 marble columns and Medusa heads",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "🚶", count: "350+", description: "Guided walks through Sultanahmet, Beyoğlu, and the Golden Horn — including skip-the-line Hagia Sophia and Topkapi tours." },
      { slug: "attractions", name: "Attractions", icon: "🎠", count: "200+", description: "Hagia Sophia, Blue Mosque, Topkapi Palace, Dolmabahçe Palace, Galata Tower, and Basilica Cistern." },
      { slug: "river-cruises", name: "Bosphorus Cruises", icon: "🚢", count: "180+", description: "Bosphorus sunset cruises, dinner cruises with Turkish entertainment, private yacht charters, and full-strait sailings." },
      { slug: "food-drink", name: "Food & Drink", icon: "🍽️", count: "150+", description: "Street food walks, Turkish cooking classes, spice market tours, rooftop dining, and raki tasting evenings." },
      { slug: "museums", name: "Museums", icon: "🏛️", count: "80+", description: "Istanbul Archaeological Museums, Turkish and Islamic Arts, Rahmi Koç Industrial Museum, and Istanbul Modern." },
      { slug: "day-trips", name: "Day Trips", icon: "🚐", count: "120+", description: "Cappadocia flights, Ephesus day tours, Princes' Islands ferry excursions, Bursa silk road trips, and Troy visits." },
    ],
    geoLat: 41.0082,
    geoLon: 28.9784,
    faq: [
      { q: "What group experiences are available in Istanbul?", a: "TicketMatch.ai provides access to 4,500+ experiences: Hagia Sophia and Topkapi Palace skip-the-line tours, Bosphorus cruises, Grand Bazaar walks, Turkish cooking classes, and day trips to Cappadocia — all at exclusive B2B group rates." },
      { q: "Can I book Bosphorus cruise experiences for groups?", a: "Yes. TicketMatch.ai offers group Bosphorus cruises including sunset sailings, dinner cruises with live entertainment, private yacht charters, and full-length strait tours — all at B2B rates." },
      { q: "Are day trips to Cappadocia and Ephesus available?", a: "Absolutely. TicketMatch.ai provides group day trips via domestic flights to Cappadocia (hot air balloons, fairy chimneys) and guided Ephesus tours from Istanbul at competitive B2B rates." },
      { q: "Is Istanbul suitable for large group travel?", a: "Yes. Istanbul is well-equipped for groups of all sizes with dedicated tour operators, large-capacity venues, and excellent transport. TicketMatch.ai's B2B platform streamlines booking and offers group-optimised pricing across all experiences." },
    ],
  },
];
