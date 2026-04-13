import type { CityData } from "./cities-data";

export const americanCities: CityData[] = [
  {
    slug: "new-york",
    name: "New York",
    province: "New York",
    country: "United States",
    flag: "\u{1F1FA}\u{1F1F8}",
    experiences: "2,600+",
    categories: 10,
    viatorDestId: 687,
    tagline: "The City That Never Sleeps — iconic skyline, Broadway & boundless energy",
    description:
      "New York City is the cultural and financial capital of the world, where towering skyscrapers meet world-class museums, Broadway theaters, and neighborhoods bursting with character. From the Statue of Liberty to Central Park, TicketMatch.ai provides B2B access to 2,600+ group experiences at exclusive rates for tour operators, DMCs, and travel agencies.",
    highlights: [
      "Statue of Liberty & Ellis Island — America's most iconic landmark and the gateway for millions of immigrants",
      "Empire State Building — The legendary Art Deco skyscraper with 360° observation decks on the 86th and 102nd floors",
      "Central Park — 843 acres of green space in the heart of Manhattan with lakes, bridges, and Bethesda Fountain",
      "Times Square — The dazzling crossroads of the world, lit by massive LED billboards and Broadway marquees",
      "Brooklyn Bridge — The 1883 Gothic-towered suspension bridge connecting Manhattan and Brooklyn",
      "Metropolitan Museum of Art — The largest art museum in the Americas with over 2 million works spanning 5,000 years",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "350+", description: "Walking tours of Manhattan, Harlem gospel, Brooklyn street art, NYC movie & TV locations, helicopter tours, and behind-the-scenes Broadway — all at B2B group rates." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "200+", description: "Statue of Liberty, Empire State Building, Top of the Rock, One World Observatory, 9/11 Memorial, and SUMMIT One Vanderbilt." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "150+", description: "The Met, MoMA, American Museum of Natural History, Guggenheim, Whitney, Intrepid Sea-Air-Space, and 130+ more at B2B group rates." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "120+", description: "NYC pizza tours, Chinatown food walks, craft cocktail experiences, rooftop bar crawls, Chelsea Market tastings, and Harlem soul food tours." },
      { slug: "river-cruises", name: "River Cruises", icon: "\u{1F6A2}", count: "80+", description: "NYC Harbor cruises, Hudson River sunset sails, Statue of Liberty ferry, East River dinner cruises, and speedboat thrill rides around Manhattan." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "60+", description: "Niagara Falls, Washington DC, Philadelphia, Woodbury Common outlets, Hudson Valley wineries, and the Hamptons — group day trips from NYC." },
    ],
    geoLat: 40.7128,
    geoLon: -74.0060,
    faq: [
      { q: "What group experiences are available in New York?", a: "TicketMatch.ai provides access to 2,600+ experiences: Statue of Liberty tours, Empire State Building skip-the-line, Broadway shows, Central Park bike tours, harbor cruises, and more — all at exclusive B2B group rates." },
      { q: "How do I book group Broadway tickets?", a: "Through TicketMatch.ai, book group Broadway tickets including orchestra seats, pre-show dinners, backstage tours, and combined Broadway + Times Square walking tour packages at wholesale B2B rates." },
      { q: "Can I book Statue of Liberty tours for groups?", a: "Yes. TicketMatch.ai offers group Statue of Liberty + Ellis Island packages, including pedestal access, crown tickets (limited), ferry priority boarding, and guided island tours at B2B rates." },
      { q: "Is New York suitable for large group travel?", a: "Absolutely. NYC has world-class public transit, thousands of group-ready venues, and multilingual guides. TicketMatch.ai's busyness data helps avoid peak hours at top attractions like the Met and the Empire State Building." },
    ],
  },
];
