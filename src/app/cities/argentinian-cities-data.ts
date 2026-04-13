import type { CityData } from "./cities-data";

export const argentinianCities: CityData[] = [
  {
    slug: "buenos-aires",
    name: "Buenos Aires",
    province: "Buenos Aires",
    country: "Argentina",
    flag: "\u{1F1E6}\u{1F1F7}",
    experiences: "1,500+",
    categories: 8,
    viatorDestId: 901,
    tagline: "The Paris of South America — tango, steak & barrio soul",
    description:
      "Buenos Aires is a city of grand European architecture, passionate tango, and world-renowned cuisine. From the colorful streets of La Boca to the elegant plazas of Recoleta, TicketMatch.ai provides B2B access to 1,500+ group experiences at exclusive rates for tour operators, DMCs, and travel agencies.",
    highlights: [
      "La Boca & Caminito — The vibrant, colorfully painted neighborhood and open-air street museum that is the birthplace of tango",
      "Recoleta Cemetery — An extraordinary city of marble mausoleums where Eva Peron and Argentina's elite rest among stunning sculptures",
      "Plaza de Mayo — The historic political heart of Buenos Aires, flanked by the Casa Rosada presidential palace and the Metropolitan Cathedral",
      "San Telmo Market — Buenos Aires' oldest neighborhood hosts a legendary Sunday antique market with live tango and street performers",
      "Teatro Colon — One of the world's top five opera houses, an architectural masterpiece with flawless acoustics",
      "Puerto Madero — The revitalized waterfront district with modern skyscrapers, upscale restaurants, and the Puente de la Mujer bridge",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "250+", description: "Historic city walks, La Boca and San Telmo tours, Recoleta guided visits, Palermo street art tours, and evening bar crawls — all at B2B group rates." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "200+", description: "Asado BBQ experiences, Malbec wine tastings, empanada-making classes, San Telmo market tours, parrilla dinners, and mate ceremonies." },
      { slug: "tango-shows", name: "Tango Shows", icon: "\u{1F483}", count: "80+", description: "World-class tango dinner shows, milonga dance experiences, tango lesson packages, La Boca street tango, and exclusive group tango nights at B2B rates." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "100+", description: "Estancia gaucho ranch days, Tigre Delta boat trips, Colonia del Sacramento (Uruguay), Lujan, and Mendoza wine country flights." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "80+", description: "Teatro Colon backstage tours, Casa Rosada, Obelisco, MALBA contemporary art, La Bombonera stadium, and Palermo parks." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "60+", description: "Street art tours in Palermo, MALBA and MACBA galleries, independent theater, tango history walks, and fileteado portenio workshops." },
    ],
    geoLat: -34.6037,
    geoLon: -58.3816,
    faq: [
      { q: "What group experiences are available in Buenos Aires?", a: "TicketMatch.ai provides access to 1,500+ experiences: tango dinner shows, La Boca walking tours, asado experiences, estancia day trips, Teatro Colon visits, and more — all at exclusive B2B group rates." },
      { q: "How do I book group tango shows?", a: "Through TicketMatch.ai, book group tango dinner shows at iconic venues like Cafe de los Angelitos, Senor Tango, and Esquina Carlos Gardel — including dinner, drinks, and VIP seating at wholesale B2B rates." },
      { q: "Can I book estancia day trips for groups?", a: "Yes. TicketMatch.ai offers group estancia (ranch) day trips including gaucho horse shows, traditional asado lunch, horseback riding, folk music, and transport from Buenos Aires at B2B rates." },
      { q: "Is Buenos Aires suitable for large group travel?", a: "Absolutely. Buenos Aires has extensive public transit, thousands of group-ready venues, and passionate bilingual guides. TicketMatch.ai helps plan combined city, tango, food, and estancia group itineraries." },
    ],
  },
];
