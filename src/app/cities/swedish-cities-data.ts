import type { CityData } from "./cities-data";

export const swedishCities: CityData[] = [
  {
    slug: "stockholm",
    name: "Stockholm",
    province: "Stockholm County",
    country: "Sweden",
    flag: "\u{1F1F8}\u{1F1EA}",
    experiences: "2,200+",
    categories: 9,
    viatorDestId: 907,
    tagline: "Venice of the North — Gamla Stan, world-class museums & stunning archipelago",
    description:
      "Stockholm is Scandinavia's stunning capital, spread across 14 islands where Lake Mälaren meets the Baltic Sea. From the medieval cobblestones of Gamla Stan to the iconic Vasa Museum and the legendary ABBA Museum, the city blends centuries of royal history with cutting-edge Nordic design. TicketMatch.ai provides B2B access to 2,200+ group experiences at exclusive rates.",
    highlights: [
      "Gamla Stan — Stockholm's medieval old town with narrow cobblestone streets dating back to the 13th century",
      "Vasa Museum — Home to the world's best-preserved 17th-century warship, salvaged after 333 years on the seabed",
      "ABBA The Museum — Interactive tribute to Sweden's most famous pop group on the island of Djurgården",
      "Stockholm Royal Palace — One of Europe's largest palaces with 600+ rooms and the daily Changing of the Guard",
      "Skansen Open-Air Museum — The world's oldest open-air museum (1891) showcasing five centuries of Swedish life",
      "Stockholm Archipelago — Over 30,000 islands, skerries, and rocks stretching into the Baltic Sea",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "120+", description: "Gamla Stan walking tours, Södermalm neighbourhood walks, Viking history tours, and Stockholm by bike." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3F0}", count: "60+", description: "Stockholm Royal Palace, Skansen, Gröna Lund, Stockholm City Hall, and Drottningholm Palace." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "45+", description: "Vasa Museum, ABBA The Museum, Fotografiska, Nobel Prize Museum, and Moderna Museet." },
      { slug: "river-cruises", name: "Boat Tours", icon: "\u{1F6A2}", count: "35+", description: "Archipelago cruises, canal tours under Stockholm's bridges, kayaking between islands, and dinner boat experiences." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "70+", description: "Swedish fika tours, Östermalm food hall tastings, meatball workshops, craft beer walks, and New Nordic dining experiences." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "30+", description: "Drottningholm Palace (UNESCO), Uppsala Viking heritage, Sigtuna oldest town, archipelago island hopping, and Birka Viking settlement." },
    ],
    geoLat: 59.3293,
    geoLon: 18.0686,
    faq: [
      { q: "What group experiences are available in Stockholm?", a: "TicketMatch.ai provides access to 2,200+ experiences: Gamla Stan walking tours, Vasa Museum visits, archipelago cruises, ABBA Museum, food tours, and more — all at exclusive B2B group rates." },
      { q: "Can groups visit the Stockholm Archipelago?", a: "Absolutely. The archipelago offers over 30,000 islands to explore. TicketMatch.ai offers group boat tours, island-hopping day trips, and private charter cruises at B2B rates year-round." },
      { q: "What museums are best for group visits in Stockholm?", a: "The Vasa Museum, ABBA The Museum, Skansen, and the Nobel Prize Museum are top picks for groups. TicketMatch.ai arranges skip-the-line group tickets and guided tours at B2B rates." },
      { q: "Is Stockholm suitable for large group travel?", a: "Very much so. Stockholm is walkable, well-connected by metro and ferry, and offers diverse group experiences from medieval history to modern design. TicketMatch.ai helps plan complete Scandinavian group itineraries." },
    ],
  },
];
