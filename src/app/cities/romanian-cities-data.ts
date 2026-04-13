import type { CityData } from "./cities-data";

export const romanianCities: CityData[] = [
  {
    slug: "bucharest",
    name: "Bucharest",
    province: "Bucharest",
    country: "Romania",
    flag: "🇷🇴",
    experiences: "1,000+",
    categories: 7,
    viatorDestId: 4216,
    tagline: "The Little Paris of the East — belle époque elegance meets Balkan soul",
    description:
      "Bucharest blends belle époque boulevards with communist-era megastructures and a thriving creative scene. Home to the world's heaviest building — the Palace of Parliament — and a booming Old Town nightlife quarter, TicketMatch.ai provides B2B access to 1,000+ group experiences at exclusive rates.",
    highlights: [
      "Palace of Parliament — The world's heaviest building and second-largest administrative structure, with 1,100 rooms and 12 storeys",
      "Old Town (Lipscani) — Bucharest's historic heart with cobblestone streets, craft beer bars, and vibrant nightlife",
      "Romanian Athenaeum — A neoclassical concert hall and national landmark with a stunning 70-metre fresco inside its dome",
      "Village Museum (Muzeul Satului) — Open-air museum in Herăstrău Park with 300+ authentic rural buildings from across Romania",
      "Stavropoleos Monastery — An exquisite 18th-century Romanian Brâncovenesc-style church hidden in the Old Town",
      "Revolution Square — Historic plaza where the 1989 Revolution unfolded, flanked by the former Royal Palace and National Art Museum",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "🚶", count: "120+", description: "Communist-era tours, Old Town walks, Palace of Parliament guided visits, and Bucharest by night." },
      { slug: "attractions", name: "Attractions", icon: "🎠", count: "60+", description: "Palace of Parliament, Romanian Athenaeum, Village Museum, Triumphal Arch, and CEC Palace." },
      { slug: "food-drink", name: "Food & Drink", icon: "🍽️", count: "50+", description: "Romanian cooking classes, Old Town food tours, wine tastings (Dealu Mare), craft beer crawls, and traditional tavern dinners." },
      { slug: "museums", name: "Museums", icon: "🏛️", count: "40+", description: "National Art Museum, National History Museum, Grigore Antipa Natural History, and the Village Museum." },
      { slug: "day-trips", name: "Day Trips", icon: "🚐", count: "80+", description: "Transylvania day trips to Bran Castle (Dracula's Castle), Peleș Castle in Sinaia, Brașov old town, and the Carpathian Mountains." },
      { slug: "art-culture", name: "Art & Culture", icon: "🎭", count: "30+", description: "Street art tours, Romanian Athenaeum concerts, opera nights, art gallery walks, and traditional folk performances." },
    ],
    geoLat: 44.4268,
    geoLon: 26.1025,
    faq: [
      { q: "What group experiences are available in Bucharest?", a: "TicketMatch.ai provides access to 1,000+ experiences: Palace of Parliament tours, Old Town walks, Transylvania day trips to Bran Castle, Romanian food tours, and more — all at exclusive B2B group rates." },
      { q: "Can I book Transylvania and Dracula Castle day trips?", a: "Yes. TicketMatch.ai offers group day trips from Bucharest to Bran Castle (Dracula's Castle), Peleș Castle, and Brașov — including transport and guided tours at B2B rates." },
      { q: "What food and drink experiences are available?", a: "TicketMatch.ai provides group Romanian cooking classes, Old Town food walks, Dealu Mare wine tastings, and traditional tavern dinners — all bookable at competitive B2B rates." },
      { q: "Is Bucharest good for group travel?", a: "Absolutely. Bucharest offers excellent value, large venues, and easy access to Transylvania. TicketMatch.ai's B2B platform provides group-optimised pricing and seamless booking for all experiences." },
    ],
  },
];
