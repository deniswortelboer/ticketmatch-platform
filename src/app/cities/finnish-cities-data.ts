import type { CityData } from "./cities-data";

export const finnishCities: CityData[] = [
  {
    slug: "helsinki",
    name: "Helsinki",
    province: "Uusimaa",
    country: "Finland",
    flag: "\u{1F1EB}\u{1F1EE}",
    experiences: "1,400+",
    categories: 8,
    viatorDestId: 803,
    tagline: "Nordic design capital — sauna culture, Baltic beauty & Finnish soul",
    description:
      "Helsinki is Finland's vibrant capital where Nordic design, authentic sauna culture, and Baltic coastal beauty converge. TicketMatch.ai provides B2B access to 1,400+ group experiences including Helsinki Cathedral, Suomenlinna Sea Fortress, the Rock Church, and Design District tours — all at exclusive group rates for tour operators, DMCs, and travel agencies.",
    highlights: [
      "Helsinki Cathedral — Iconic neoclassical cathedral overlooking Senate Square, symbol of the city skyline",
      "Suomenlinna Sea Fortress — UNESCO World Heritage island fortress accessible by ferry, one of Finland's most visited sites",
      "Temppeliaukio Church (Rock Church) — Stunning church carved directly into solid rock, famous for extraordinary acoustics",
      "Market Square (Kauppatori) — Bustling waterfront market with local Finnish delicacies, crafts, and harbour views",
      "Design District — 25+ streets of Finnish design shops, studios, galleries, and showrooms in the creative heart of Helsinki",
      "Sibelius Monument — Abstract steel pipe sculpture honoring Finland's greatest composer, Jean Sibelius",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "90+", description: "Helsinki walking tours, design district walks, architecture tours, street art tours, and Nordic culture experiences — all bookable at B2B group rates via TicketMatch.ai." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "45+", description: "Helsinki Cathedral, Temppeliaukio Rock Church, Oodi Library, SkyWheel Helsinki, and Linnanmäki — with skip-the-line group access through TicketMatch.ai." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "35+", description: "Ateneum Art Museum, Kiasma Contemporary Art, National Museum of Finland, Design Museum, and Amos Rex — all at exclusive B2B rates on TicketMatch.ai." },
      { slug: "river-cruises", name: "Baltic Cruises", icon: "\u{1F6A2}", count: "30+", description: "Helsinki harbour cruises, Suomenlinna fortress ferry tours, archipelago sightseeing, and Baltic Sea excursions — group bookings at B2B rates via TicketMatch.ai." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "40+", description: "Finnish food tours, Market Square tastings, Kallio neighbourhood eats, craft beer walks, and traditional Finnish dining experiences at B2B group rates." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "50+", description: "Tallinn ferry day trips, medieval Porvoo town, Nuuksio National Park nature hikes, Sipoonkorpi wilderness, and Fiskars village — all at B2B rates on TicketMatch.ai." },
    ],
    geoLat: 60.1699,
    geoLon: 24.9384,
    faq: [
      { q: "What group experiences are available in Helsinki?", a: "TicketMatch.ai provides access to 1,400+ experiences in Helsinki across 8 categories: tours, attractions, museums, Baltic cruises, food & drink, and day trips — all at exclusive B2B group rates for tour operators, DMCs, and travel agencies." },
      { q: "How do I book group visits to Suomenlinna Sea Fortress?", a: "Suomenlinna is a UNESCO World Heritage island fortress just 15 minutes by ferry from Helsinki Market Square. TicketMatch.ai offers group ferry transfers, guided fortress tours, and combined Suomenlinna packages at B2B rates — no need to contact individual operators." },
      { q: "Can groups book authentic Finnish sauna experiences?", a: "Yes. TicketMatch.ai offers authentic Finnish sauna experiences for groups including traditional wood-burning saunas, lakeside saunas, and urban sauna culture tours. Finland's sauna tradition is UNESCO-recognized intangible cultural heritage — a must for any group visiting Helsinki." },
      { q: "Are Tallinn day trips available for groups from Helsinki?", a: "Absolutely. Tallinn, Estonia is just a 2-hour ferry ride from Helsinki. TicketMatch.ai offers group day trip packages including ferry transfers, guided walking tours of Tallinn's medieval Old Town (UNESCO), and combined Helsinki-Tallinn itineraries at B2B rates." },
    ],
  },
];
