import type { CityData } from "./cities-data";

export const australianCities: CityData[] = [
  {
    slug: "sydney",
    name: "Sydney",
    province: "New South Wales",
    country: "Australia",
    flag: "\u{1F1E6}\u{1F1FA}",
    experiences: "1,000+",
    categories: 8,
    viatorDestId: 357,
    tagline: "Where the harbour sparkles — iconic sails, golden sand & boundless adventure Down Under",
    description:
      "Sydney is Australia's dazzling harbour city — a sun-kissed metropolis of world-famous landmarks, pristine beaches, and cosmopolitan culture. From the soaring sails of the Opera House to the surf breaks of Bondi Beach, TicketMatch.ai provides B2B access to 1,000+ group experiences at exclusive rates.",
    highlights: [
      "Sydney Opera House — UNESCO World Heritage masterpiece and Australia's most iconic performing arts venue on Bennelong Point",
      "Sydney Harbour Bridge — Climb the 134-metre steel arch for breathtaking 360-degree panoramas of the harbour and city skyline",
      "Bondi Beach — Australia's most famous beach with golden sand, world-class surf, and the stunning coastal walk to Coogee",
      "Taronga Zoo — Harbourside wildlife sanctuary home to over 4,000 animals with unbeatable views of the Sydney skyline",
      "Blue Mountains — UNESCO-listed wilderness of ancient eucalyptus forests, dramatic cliffs, and the Three Sisters rock formation",
      "The Rocks — Sydney's oldest neighbourhood with cobblestone laneways, weekend markets, heritage pubs, and convict-era history",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "200+", description: "Harbour cruises, Sydney walking tours, Blue Mountains day trips, and behind-the-scenes Opera House tours." },
      { slug: "outdoor", name: "Outdoor & Nature", icon: "\u{1F3DE}\u{FE0F}", count: "150+", description: "Bondi to Coogee walks, Blue Mountains hikes, whale watching cruises, and harbour kayaking adventures." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "100+", description: "Sydney Opera House, BridgeClimb, SEA LIFE Aquarium, Sydney Tower Eye, and Madame Tussauds." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "80+", description: "Harbour dinner cruises, Chinatown food walks, craft brewery tours, and Sydney wine tasting experiences." },
      { slug: "water-sports", name: "Water Sports", icon: "\u{1F3C4}", count: "70+", description: "Surf lessons at Bondi, harbour jet boat rides, stand-up paddleboarding, and sailing experiences." },
      { slug: "wildlife", name: "Wildlife", icon: "\u{1F998}", count: "60+", description: "Taronga Zoo encounters, Blue Mountains wildlife tours, whale watching, and native animal sanctuary visits." },
    ],
    geoLat: -33.8688,
    geoLon: 151.2093,
    faq: [
      { q: "What group experiences are available in Sydney?", a: "TicketMatch.ai provides access to 1,000+ experiences: Opera House tours, BridgeClimb, Blue Mountains day trips, harbour cruises, and Bondi surf lessons — all at exclusive B2B group rates." },
      { q: "Can I book Blue Mountains tours for groups?", a: "Yes. TicketMatch.ai offers group day trips to the Blue Mountains including Three Sisters, Scenic World, wildlife encounters, and bushwalking at B2B rates." },
      { q: "What harbour experiences are available for groups?", a: "Sydney Harbour offers spectacular group options. TicketMatch.ai provides B2B rates on harbour cruises, tall ship sailing, jet boat rides, dinner cruises, and BridgeClimb experiences." },
      { q: "Is Sydney good for group travel?", a: "Outstanding. Sydney's world-class infrastructure, iconic landmarks, beautiful beaches, and diverse dining scene make it ideal for groups. TicketMatch.ai helps plan complete Sydney group itineraries." },
    ],
  },
];
