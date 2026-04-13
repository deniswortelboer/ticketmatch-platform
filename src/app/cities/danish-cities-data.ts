import type { CityData } from "./cities-data";

export const danishCities: CityData[] = [
  {
    slug: "copenhagen",
    name: "Copenhagen",
    province: "Capital Region",
    country: "Denmark",
    flag: "\u{1F1E9}\u{1F1F0}",
    experiences: "2,400+",
    categories: 10,
    viatorDestId: 463,
    tagline: "Happiest city on Earth — Tivoli, hygge, design & New Nordic cuisine",
    description:
      "Copenhagen is the Scandinavian capital of cool — a city of world-class design, Michelin-starred New Nordic cuisine, colorful Nyhavn waterfront, and the legendary Tivoli Gardens. TicketMatch.ai provides B2B access to 2,400+ group experiences at exclusive rates.",
    highlights: [
      "Tivoli Gardens — The world's second-oldest amusement park (1843) that inspired Walt Disney",
      "Nyhavn — Copenhagen's iconic colorful waterfront with 17th-century townhouses and canal boats",
      "The Little Mermaid — Hans Christian Andersen's famous bronze statue on the Langelinie promenade",
      "Christiansborg Palace — Home to the Danish Parliament, Supreme Court, and Royal Reception Rooms",
      "Rosenborg Castle — Renaissance castle housing the Danish Crown Jewels and royal collections",
      "Freetown Christiania — Self-proclaimed autonomous neighborhood, Copenhagen's alternative community since 1971",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "130+", description: "Nyhavn walks, canal boat tours, hygge tours, Danish design walks, and Copenhagen by bike." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "50+", description: "Tivoli Gardens, Little Mermaid, Rosenborg Castle, Round Tower, and Copenhagen Zoo." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "80+", description: "New Nordic food tours, Torvehallerne market, smørrebrød tastings, craft beer tours, and hygge experiences." },
      { slug: "river-cruises", name: "Canal Cruises", icon: "\u{1F6A2}", count: "25+", description: "Nyhavn canal tours, harbour cruises, kayaking, and GoBoat self-drive picnic boats." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "30+", description: "National Museum, Ny Carlsberg Glyptotek, Louisiana Modern Art, Danish Design Museum, and Viking Ship Museum." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "40+", description: "Kronborg Castle (Hamlet), Roskilde Viking Museum, Malmö (Sweden), Dragør fishing village, and North Zealand." },
    ],
    geoLat: 55.6761,
    geoLon: 12.5683,
    faq: [
      { q: "What group experiences are available in Copenhagen?", a: "TicketMatch.ai provides access to 2,400+ experiences: Tivoli Gardens, canal cruises, food tours, Hamlet's castle day trips, and more — all at exclusive B2B group rates." },
      { q: "What is hygge and can groups experience it?", a: "Hygge is the Danish concept of cozy well-being. TicketMatch.ai offers group hygge experiences: candlelit dinners, cozy café tours, design walks, and Danish lifestyle workshops at B2B rates." },
      { q: "Can I visit Hamlet's castle for groups?", a: "Yes. Kronborg Castle (UNESCO) in Helsingør is 45 minutes from Copenhagen. TicketMatch.ai offers group day trips with guided castle tours and combined Kronborg + Louisiana Museum at B2B rates." },
      { q: "Is Copenhagen good for group travel?", a: "Excellent. Copenhagen is bike-friendly, compact, design-forward, and incredibly welcoming. TicketMatch.ai helps plan Scandinavian group itineraries." },
    ],
  },
];
