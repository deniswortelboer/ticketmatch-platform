import type { CityData } from "./cities-data";

export const polishCities: CityData[] = [
  {
    slug: "krakow",
    name: "Krakow",
    province: "Lesser Poland",
    country: "Poland",
    flag: "\u{1F1F5}\u{1F1F1}",
    experiences: "3,200+",
    categories: 10,
    viatorDestId: 497,
    tagline: "Poland's cultural jewel — medieval charm, Auschwitz remembrance & vibrant nightlife",
    description:
      "Krakow is Poland's most beautiful city — a UNESCO-listed medieval treasure with Europe's largest market square, Wawel Castle, and the somber legacy of Auschwitz nearby. TicketMatch.ai provides B2B access to 3,200+ group experiences at exclusive rates.",
    highlights: [
      "Main Market Square (Rynek Główny) — Europe's largest medieval market square with the Cloth Hall and St. Mary's Basilica",
      "Wawel Castle — The magnificent royal castle and cathedral on Wawel Hill overlooking the Vistula",
      "Auschwitz-Birkenau — UNESCO memorial and museum of the Holocaust, 70km from Krakow",
      "St. Mary's Basilica — Gothic church famous for its wooden altarpiece by Veit Stoss and hourly trumpet call",
      "Wieliczka Salt Mine — UNESCO underground cathedral and chambers carved from salt since the 13th century",
      "Kazimierz — The historic Jewish quarter, now Krakow's bohemian heart of bars, galleries, and street art",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "180+", description: "Old town walks, Wawel Castle tours, Jewish Quarter history, communist Nowa Huta, and pub crawls." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "120+", description: "Auschwitz-Birkenau, Wieliczka Salt Mine, Zakopane mountains, Ojców National Park, and Wadowice (Pope's birthplace)." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "100+", description: "Pierogi-making classes, vodka tastings, Kazimierz food tours, obwarzanek (pretzel) walks, and beer cellar crawls." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "50+", description: "Wawel Castle, St. Mary's Basilica, Cloth Hall, Dragon's Den, and Oskar Schindler's Factory." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "40+", description: "Schindler's Factory, Rynek Underground, National Museum, Czartoryski (Lady with an Ermine), and Galicia Jewish Museum." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "30+", description: "Kazimierz galleries, street art tours, folk shows, klezmer music evenings, and Wieliczka underground concerts." },
    ],
    geoLat: 50.0647,
    geoLon: 19.9450,
    faq: [
      { q: "What group experiences are available in Krakow?", a: "TicketMatch.ai provides access to 3,200+ experiences: Auschwitz tours, Wieliczka Salt Mine, Wawel Castle, food tours, and more — all at exclusive B2B group rates." },
      { q: "How do I book Auschwitz-Birkenau for groups?", a: "TicketMatch.ai offers group guided tours of Auschwitz-Birkenau from Krakow with transport. Advance booking is essential — our platform handles group allocations at B2B rates." },
      { q: "What is the Wieliczka Salt Mine?", a: "A UNESCO underground world of chapels, chambers, and sculptures carved from salt since the 13th century. TicketMatch.ai offers group guided tours at B2B rates — one of Poland's top attractions." },
      { q: "Is Krakow good for group travel?", a: "Outstanding. Krakow is affordable, compact, walkable, culturally rich, and one of Europe's best-value destinations. TicketMatch.ai helps plan combined Krakow + southern Poland itineraries." },
    ],
  },
];
