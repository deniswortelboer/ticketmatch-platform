import type { CityData } from "./cities-data";

export const czechCities: CityData[] = [
  {
    slug: "prague",
    name: "Prague",
    province: "Central Bohemia",
    country: "Czech Republic",
    flag: "\u{1F1E8}\u{1F1FF}",
    experiences: "4,600+",
    categories: 12,
    viatorDestId: 462,
    tagline: "The City of a Hundred Spires — Gothic grandeur, beer & bohemian charm",
    description:
      "Prague is one of Europe's most beautiful and affordable capitals — a fairy-tale city of Gothic spires, baroque palaces, and the world's best beer. From Charles Bridge to Prague Castle, TicketMatch.ai provides B2B access to 4,600+ group experiences at exclusive rates for tour operators, DMCs, and travel agencies.",
    highlights: [
      "Prague Castle — The world's largest ancient castle complex, seat of Czech rulers for over 1,000 years",
      "Charles Bridge — Iconic 14th-century stone bridge with 30 baroque statues spanning the Vltava river",
      "Old Town Square — Stunning medieval square with the Astronomical Clock, Týn Church, and Old Town Hall",
      "St. Vitus Cathedral — Magnificent Gothic cathedral inside Prague Castle with stunning stained glass",
      "Astronomical Clock — The 600-year-old astronomical clock with its hourly procession of apostles",
      "Jewish Quarter (Josefov) — Historic Jewish ghetto with six synagogues, Old Jewish Cemetery, and museum",
      "Petřín Hill — Prague's 'Eiffel Tower' lookout with funicular, mirror maze, and rose gardens",
      "Dancing House — Frank Gehry's iconic modern building nicknamed 'Fred and Ginger'",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "280+", description: "Prague Castle tours, Charles Bridge walks, Old Town ghost tours, communist history, and underground tours." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "180+", description: "Czech beer tastings, microbrewery tours, trdelník baking, medieval tavern dinners, and Bohemian wine tours." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "100+", description: "Prague Castle, Astronomical Clock, Petřín Tower, Jewish Quarter, and Prague Zoo." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "60+", description: "National Gallery, Jewish Museum, Kafka Museum, National Technical Museum, and Museum of Communism." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "120+", description: "Kutná Hora (Bone Church), Český Krumlov, Karlštejn Castle, Terezín, and Bohemian Switzerland." },
      { slug: "river-cruises", name: "River Cruises", icon: "\u{1F6A2}", count: "30+", description: "Vltava dinner cruises, sightseeing boats, jazz boats, and Devil's Channel boat rides." },
    ],
    geoLat: 50.0755,
    geoLon: 14.4378,
    faq: [
      { q: "What group experiences are available in Prague?", a: "TicketMatch.ai provides access to 4,600+ experiences: Prague Castle tours, beer tastings, Charles Bridge walks, Kutná Hora day trips, and more — all at exclusive B2B group rates." },
      { q: "How do I book group Prague Castle tickets?", a: "Through TicketMatch.ai, book group skip-the-line Prague Castle tickets including St. Vitus Cathedral, Golden Lane, Old Royal Palace, and guided tours at wholesale B2B rates." },
      { q: "What beer experiences are available?", a: "Prague is the beer capital of the world. TicketMatch.ai offers group brewery tours, beer tastings, beer spa experiences, medieval tavern dinners, and beer + food pairing at B2B rates." },
      { q: "Can I book Kutná Hora (Bone Church) for groups?", a: "Yes. Kutná Hora is 1 hour from Prague. TicketMatch.ai offers group day trips to the Sedlec Ossuary (Bone Church), St. Barbara's Cathedral, and the silver mines at B2B rates." },
      { q: "Is Prague good for group travel?", a: "Outstanding. Prague is affordable, compact, walkable, and culturally rich. TicketMatch.ai's busyness data helps avoid crowds at Charles Bridge and Prague Castle." },
    ],
  },
];
