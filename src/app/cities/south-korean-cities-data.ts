import type { CityData } from "./cities-data";

export const southKoreanCities: CityData[] = [
  {
    slug: "seoul",
    name: "Seoul",
    province: "Seoul",
    country: "South Korea",
    flag: "🇰🇷",
    experiences: "1,200+",
    categories: 8,
    viatorDestId: 973,
    tagline: "K-Wave Capital — ancient palaces, K-pop beats, and the world's most connected city",
    description:
      "Seoul is a high-octane capital where Joseon-dynasty palaces sit beneath gleaming skyscrapers and K-pop culture radiates to every corner of the globe. From the ornate gates of Gyeongbokgung to the tense border of the DMZ, TicketMatch.ai provides B2B access to 1,200+ group experiences at exclusive rates.",
    highlights: [
      "Gyeongbokgung Palace — The grandest of Seoul's Five Grand Palaces, built in 1395, with a dramatic royal guard-changing ceremony",
      "Bukchon Hanok Village — A hillside neighbourhood of 600-year-old traditional Korean houses nestled between two palaces",
      "N Seoul Tower — The iconic landmark atop Namsan Mountain offering 360-degree panoramas and thousands of love locks",
      "Myeongdong — Seoul's premier shopping and K-beauty district with flagship stores, street food stalls, and neon energy",
      "DMZ (Demilitarized Zone) — The heavily fortified border dividing North and South Korea, one of the world's most surreal destinations",
      "Insadong — The cultural heart of Seoul filled with art galleries, teahouses, antique shops, and traditional craft stores",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "🚶", count: "250+", description: "Palace circuit tours, Bukchon Hanok walks, K-pop neighbourhood guides, and Gangnam district explorations." },
      { slug: "culture", name: "Culture & Arts", icon: "🎭", count: "200+", description: "Hanbok rental experiences, K-pop dance classes, temple stays, kimchi-making workshops, and traditional tea ceremonies." },
      { slug: "attractions", name: "Attractions", icon: "🎠", count: "180+", description: "Gyeongbokgung Palace, N Seoul Tower, Lotte World, COEX Starfield Library, War Memorial, and Changdeokgung Secret Garden." },
      { slug: "food-drink", name: "Food & Drink", icon: "🍽️", count: "150+", description: "Korean BBQ crawls, Gwangjang Market tastings, kimchi and bibimbap classes, soju tours, and temple food experiences." },
      { slug: "day-trips", name: "Day Trips", icon: "🚐", count: "180+", description: "DMZ and JSA border tours, Nami Island, Suwon Hwaseong Fortress, Korean Folk Village, and Everland theme park." },
      { slug: "nightlife", name: "Nightlife", icon: "🌃", count: "100+", description: "Hongdae indie bar hopping, Itaewon pub crawls, Han River night cruises, K-pop club nights, and rooftop bar tours." },
    ],
    geoLat: 37.5665,
    geoLon: 126.9780,
    faq: [
      { q: "What group experiences are available in Seoul?", a: "TicketMatch.ai provides access to 1,200+ experiences: Gyeongbokgung Palace tours, DMZ border visits, K-pop dance classes, Korean BBQ crawls, and Nami Island day trips — all at exclusive B2B group rates." },
      { q: "Can I book DMZ tours for groups?", a: "Yes. TicketMatch.ai offers group DMZ and JSA tours including Third Tunnel visits, Dorasan Observatory, and Freedom Bridge — all at competitive B2B rates with expert guides." },
      { q: "Are K-pop and cultural experiences available for groups?", a: "Absolutely. TicketMatch.ai provides group K-pop dance classes, hanbok rental experiences, K-beauty workshops, and K-drama filming location tours at B2B rates." },
      { q: "Is Seoul suitable for large group travel?", a: "Yes. Seoul has a world-class subway system, multilingual guides, and large-capacity venues. TicketMatch.ai's B2B platform streamlines booking across all 1,200+ experiences with group-optimised pricing." },
    ],
  },
];
