import type { CityData } from "./cities-data";

export const irishCities: CityData[] = [
  {
    slug: "dublin",
    name: "Dublin",
    province: "Leinster",
    country: "Ireland",
    flag: "\u{1F1EE}\u{1F1EA}",
    experiences: "2,800+",
    categories: 10,
    viatorDestId: 503,
    tagline: "Literary capital of the world — Guinness, Georgian charm & Celtic soul",
    description:
      "Dublin is Ireland's vibrant capital — a literary city of Georgian squares, legendary pubs, and warm hospitality. Home to Guinness, Trinity College, and countless Nobel laureates, TicketMatch.ai provides B2B access to 2,800+ group experiences at exclusive rates.",
    highlights: [
      "Guinness Storehouse — Ireland's #1 attraction with seven floors of brewing history and a rooftop Gravity Bar",
      "Trinity College & Book of Kells — Ireland's oldest university housing the 1,200-year-old illuminated manuscript",
      "Temple Bar — Dublin's famous cultural quarter of cobblestone streets, pubs, and live music",
      "St. Patrick's Cathedral — Ireland's largest church, founded in 1191 with Jonathan Swift connections",
      "Kilmainham Gaol — Historic prison central to Irish independence, beautifully preserved",
      "Dublin Castle — 800 years of Irish history from Viking fortress to British rule to Irish state",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "150+", description: "Literary Dublin walks, Georgian squares, Viking history, pub crawls, and Dublin by night." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "120+", description: "Guinness Storehouse, whiskey distillery tours (Jameson, Teeling), pub crawls, and Irish food walks." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "50+", description: "Guinness Storehouse, Book of Kells, Kilmainham Gaol, Dublin Castle, and EPIC Immigration Museum." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "100+", description: "Cliffs of Moher, Giant's Causeway, Wicklow Mountains, Newgrange, Galway, and Belfast." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "30+", description: "National Museum, EPIC, National Gallery, Chester Beatty Library, and Little Museum of Dublin." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "30+", description: "Traditional music sessions, Abbey Theatre, literary pub crawl, and Celtic cultural experiences." },
    ],
    geoLat: 53.3498,
    geoLon: -6.2603,
    faq: [
      { q: "What group experiences are available in Dublin?", a: "TicketMatch.ai provides access to 2,800+ experiences: Guinness Storehouse, Book of Kells, Cliffs of Moher trips, whiskey tours, and more — all at exclusive B2B group rates." },
      { q: "Can I book Cliffs of Moher for groups?", a: "Yes. TicketMatch.ai offers group day trips to the Cliffs of Moher from Dublin, including Burren, Galway, and Wild Atlantic Way stops at B2B rates." },
      { q: "What whiskey experiences are available?", a: "Dublin has multiple distilleries. TicketMatch.ai offers group tours at Jameson, Teeling, Roe & Co, and Pearse Lyons, plus whiskey tasting masterclasses at B2B rates." },
      { q: "Is Dublin good for group travel?", a: "Excellent. Dublin is compact, friendly, English-speaking, and the gateway to Ireland's Wild Atlantic Way. TicketMatch.ai helps plan Dublin + Ireland group itineraries." },
    ],
  },
];
