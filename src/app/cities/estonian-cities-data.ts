import type { CityData } from "./cities-data";

export const estonianCities: CityData[] = [
  {
    slug: "tallinn",
    name: "Tallinn",
    province: "Harju",
    country: "Estonia",
    flag: "\u{1F1EA}\u{1F1EA}",
    experiences: "1,200+",
    categories: 7,
    viatorDestId: 4147,
    tagline: "Medieval meets modern — UNESCO Old Town, digital innovation & Baltic charm",
    description:
      "Tallinn is Estonia's enchanting capital where a perfectly preserved medieval Old Town meets one of Europe's most digitally advanced societies. With cobblestone streets, gothic spires, and a thriving creative scene, TicketMatch.ai provides B2B access to 1,200+ group experiences at exclusive rates.",
    highlights: [
      "Tallinn Old Town — UNESCO World Heritage medieval city centre with cobblestone streets, merchant houses, and gothic churches",
      "Toompea Castle — Historic hilltop fortress overlooking the Lower Town, home to Estonia's parliament since the 13th century",
      "Alexander Nevsky Cathedral — Magnificent Russian Orthodox cathedral with onion domes and stunning mosaics on Toompea Hill",
      "KGB Museum — Chilling Cold War museum in the former Hotel Viru revealing Soviet-era surveillance operations in Estonia",
      "Kadriorg Palace — Baroque palace and park built by Peter the Great, now housing the Kumu Art Museum and presidential gardens",
      "Telliskivi Creative City — Trendy cultural quarter in converted industrial buildings with galleries, street art, cafés, and pop-up markets",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "80+", description: "Old Town walking tours, medieval history walks, Toompea Hill tours, and Tallinn by night experiences." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "50+", description: "Toompea Castle, Town Hall Square, St. Olaf's Church tower, Tallinn TV Tower, and Seaplane Harbour." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "40+", description: "KGB Museum, Kumu Art Museum, Estonian Maritime Museum, Occupation Museum, and Marzipan Museum." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "35+", description: "Estonian craft beer tastings, medieval banquet experiences, Old Town food walks, and Baltic cuisine tours." },
      { slug: "day-trips", name: "Day Trips", icon: "\u{1F690}", count: "30+", description: "Lahemaa National Park, Pärnu beach town, Rakvere Castle, bog walking tours, and Finnish Gulf coast excursions." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "25+", description: "Telliskivi Creative City tours, street art walks, Estonian folk culture experiences, and gallery visits." },
    ],
    geoLat: 59.4370,
    geoLon: 24.7536,
    faq: [
      { q: "What group experiences are available in Tallinn?", a: "TicketMatch.ai provides access to 1,200+ experiences: Old Town walking tours, medieval history walks, KGB Museum visits, Kadriorg Palace tours, and more — all at exclusive B2B group rates." },
      { q: "Can I book Lahemaa National Park day trips for groups?", a: "Yes. Lahemaa National Park is just 70km east of Tallinn. TicketMatch.ai offers group day trips including manor house visits, coastal hikes, and bog walking at B2B rates." },
      { q: "What makes Tallinn good for group tours?", a: "Tallinn's compact, walkable Old Town is ideal for groups. TicketMatch.ai provides B2B rates on medieval walking tours, food experiences, and cultural visits with group-friendly logistics." },
      { q: "Are there food and drink experiences for groups?", a: "Yes. TicketMatch.ai offers group Estonian cuisine tours, craft beer tastings, medieval-themed banquets, and Old Town food walks — all bookable at exclusive B2B group rates." },
    ],
  },
];
