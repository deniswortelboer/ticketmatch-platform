export interface CityCategory {
  slug: string;
  name: string;
  icon: string;
  count: string;
  description: string;
}

export interface CityData {
  slug: string;
  name: string;
  province: string;
  country: string;
  flag: string;
  experiences: string;
  categories: number;
  tagline: string;
  description: string;
  highlights: string[];
  topCategories: CityCategory[];
  geoLat: number;
  geoLon: number;
  faq: { q: string; a: string }[];
  viatorDestId: number;
}

export const dutchCities: CityData[] = [
  {
    slug: "amsterdam",
    name: "Amsterdam",
    province: "North Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "8,400+",
    categories: 12,
    viatorDestId: 525,
    tagline: "Europe's #1 group travel destination",
    description:
      "Amsterdam is the capital of the Netherlands and Europe's top destination for group travel. TicketMatch.ai provides B2B access to 8,400+ experiences including the Rijksmuseum, Van Gogh Museum, Anne Frank House, canal cruises, food tours, and more — all at exclusive group rates for tour operators, DMCs, and travel agencies.",
    highlights: [
      "Rijksmuseum — The Netherlands' national art museum with Rembrandt, Vermeer, and 8,000+ masterpieces",
      "Van Gogh Museum — The world's largest collection of Van Gogh paintings and letters",
      "Anne Frank House — The historic hiding place of Anne Frank during WWII",
      "Amsterdam Canal Cruises — UNESCO World Heritage canal ring boat tours for groups",
      "Heineken Experience — Interactive brewery tour with group packages",
      "NDSM Wharf — Creative cultural district for alternative group experiences",
      "A'DAM Lookout — 360° panoramic view and Europe's highest swing",
      "Artis Royal Zoo — The oldest zoo in the Netherlands, founded 1838",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "120+", description: "Rijksmuseum, Van Gogh Museum, Anne Frank House, Stedelijk Museum, NEMO Science Museum, Moco Museum, and 100+ more museums — all bookable at B2B group rates." },
      { slug: "canal-cruises", name: "Canal Cruises", icon: "\u{26F5}", count: "45+", description: "UNESCO World Heritage canal ring boat tours, private group cruises, dinner cruises, open boats, and luxury yacht charters through Amsterdam's 165 canals." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "200+", description: "Walking tours, bike tours, Red Light District tours, food tours, pub crawls, photography tours, street art tours, and themed group walking experiences." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "85+", description: "Dutch food tours, cheese tasting, craft beer tours, Foodhallen visits, cooking workshops, group dining, and Michelin-star group experiences." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "60+", description: "Madame Tussauds, Amsterdam Dungeon, Body Worlds, A'DAM Lookout, Heineken Experience, House of Bols — with skip-the-line group access." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "90+", description: "Street art tours, gallery visits, Banksy exhibition, Moco Museum, photography exhibits, theater shows, and immersive cultural experiences for groups." },
    ],
    geoLat: 52.3676,
    geoLon: 4.9041,
    faq: [
      { q: "How do I book group museum tickets in Amsterdam?", a: "With TicketMatch.ai, you can book group tickets for all major Amsterdam museums (Rijksmuseum, Van Gogh Museum, Anne Frank House, Stedelijk, NEMO, Moco, and 100+ more) directly through one B2B platform. Simply search, compare B2B rates, and book — no more calling individual venues. AI assistant Emma helps you find the perfect combination." },
      { q: "What B2B rates are available for Amsterdam canal cruises?", a: "TicketMatch.ai offers exclusive B2B group rates for Amsterdam canal cruises from multiple operators. Rates are typically 15-30% below retail prices and are only visible to verified tour operators, DMCs, and travel agencies. Choose from 45+ cruise options including private boats, dinner cruises, and open boats." },
      { q: "Can I check live busyness for Amsterdam venues?", a: "Yes. TicketMatch.ai shows real-time busyness data for Amsterdam venues powered by Google Places API and BestTime API. This helps you plan group visits to the Rijksmuseum, Van Gogh Museum, and other popular venues during quieter times — resulting in a better experience for your groups." },
      { q: "How many group experiences are available in Amsterdam?", a: "TicketMatch.ai provides access to 8,400+ experiences in Amsterdam across 12 categories: museums, canal cruises, walking tours, food tours, attractions, art & culture, outdoor activities, transport, shows, classes, day trips, and private tours. All aggregated from 10 supplier APIs at exclusive B2B rates." },
      { q: "What is the best time for group visits to Amsterdam museums?", a: "TicketMatch.ai's live busyness feature shows that weekday mornings (9-11 AM) are generally the quietest times for Amsterdam museums. Tuesday and Wednesday are the least busy days. Our AI assistant Emma can recommend the optimal schedule for your specific group itinerary." },
      { q: "Can I create complete Amsterdam group itineraries on TicketMatch?", a: "Yes. TicketMatch.ai's package builder lets you combine multiple Amsterdam experiences into one itinerary — for example, a morning at the Rijksmuseum, afternoon canal cruise, and evening food tour. Our route planner optimizes walking distances between venues, and you get one QR voucher for the entire package." },
    ],
  },
  {
    slug: "rotterdam",
    name: "Rotterdam",
    province: "South Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "2,100+",
    categories: 11,
    viatorDestId: 4211,
    tagline: "Europe's rising group travel hotspot",
    description:
      "Rotterdam is Europe's next group travel hotspot — a city of modern architecture, world-class museums, and vibrant food culture. TicketMatch.ai connects tour operators to 2,100+ experiences including the Cube Houses, Kunsthal, Erasmus Bridge, harbour tours, and food halls at exclusive B2B rates.",
    highlights: [
      "Cube Houses — Piet Blom's iconic tilted cube architecture, group visits available",
      "Kunsthal — World-renowned contemporary art museum with rotating exhibitions",
      "Markthal — Stunning market hall with 100+ food stalls and the largest artwork in the Netherlands",
      "Erasmus Bridge — The Swan of Rotterdam, iconic landmark and starting point for harbour tours",
      "SS Rotterdam — Former Holland America Line flagship, now hotel and event venue for groups",
      "Depot Boijmans Van Beuningen — World's first publicly accessible art depot with 151,000 artworks",
      "Euromast — 185-meter observation tower with abseiling experience for adventurous groups",
      "Fenix Food Factory — Authentic food hall in a former warehouse on Katendrecht",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "35+", description: "Kunsthal, Depot Boijmans, Maritime Museum, Chabot Museum, Wereldmuseum, and 30+ more museums — all at B2B group rates." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "25+", description: "Cube Houses, Euromast, Miniworld Rotterdam, Rotterdam Zoo (Diergaarde Blijdorp), SS Rotterdam — with group packages." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "60+", description: "Architecture tours, harbour cruises, street art walks, food tours, bike tours, and rooftop experiences." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "40+", description: "Markthal food tours, Fenix Food Factory visits, craft beer tours, Dutch cuisine workshops, and group dining." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "30+", description: "Street art tours, gallery walks, Depot Boijmans, live music venues, theater shows, and cultural workshops." },
      { slug: "transport", name: "Transport & Passes", icon: "\u{1F68C}", count: "15+", description: "Water taxis, harbour tours, hop-on-hop-off buses, and Rotterdam Welcome Card for groups." },
    ],
    geoLat: 51.9225,
    geoLon: 4.4792,
    faq: [
      { q: "What group experiences are available in Rotterdam?", a: "TicketMatch.ai provides access to 2,100+ experiences in Rotterdam: modern architecture tours, Kunsthal, Depot Boijmans, Markthal food tours, harbour cruises, Euromast visits, and more. All bookable at B2B group rates through one platform." },
      { q: "Is Rotterdam good for group travel?", a: "Absolutely. Rotterdam is Europe's rising group travel destination with modern architecture, world-class museums, excellent food halls, and easy access from Schiphol Airport (25 min). TicketMatch.ai provides live busyness data to plan optimal visit times for your groups." },
      { q: "How does TicketMatch.ai help with Rotterdam group bookings?", a: "TicketMatch.ai aggregates all Rotterdam experiences from 10 supplier APIs into one platform. You get exclusive B2B rates, AI-powered search with Emma, real-time venue busyness data, QR vouchers for entry, and a route planner to optimize your group's walking distances." },
      { q: "What architecture tours are available in Rotterdam for groups?", a: "Rotterdam is famous for its modern architecture. TicketMatch.ai offers guided architecture tours covering the Cube Houses, Markthal, Erasmus Bridge, De Rotterdam, Central Station, and more. Private group tours can be customized to your group's interests." },
      { q: "Can I combine Rotterdam with other Dutch cities for a group trip?", a: "Yes. Rotterdam is centrally located and easy to combine with The Hague (20 min), Delft (15 min), Gouda (25 min), and Dordrecht (20 min). TicketMatch.ai's package builder lets you create multi-city itineraries with B2B rates across all cities." },
    ],
  },
  {
    slug: "den-haag",
    name: "The Hague",
    province: "South Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "1,200+",
    categories: 10,
    viatorDestId: 5436,
    tagline: "City of peace, justice & world-class art",
    description:
      "The Hague is the seat of the Dutch government and home to world-class museums, the International Court of Justice, and the famous Scheveningen beach. TicketMatch.ai offers B2B access to 1,200+ group experiences including the Mauritshuis, Panorama Mesdag, and Madurodam.",
    highlights: [
      "Mauritshuis — Home of Vermeer's Girl with a Pearl Earring and Rembrandt's The Anatomy Lesson",
      "Madurodam — Miniature park showcasing the Netherlands in small, perfect for groups",
      "Panorama Mesdag — World's largest 360-degree cylindrical painting from 1881",
      "Scheveningen — Famous beach resort, pier, SEA LIFE centre, and Kurhaus for group day trips",
      "Peace Palace — Seat of the International Court of Justice, guided tours available",
      "Escher in The Palace — M.C. Escher museum in a former royal palace",
      "Binnenhof — Historic parliamentary complex (guided group tours)",
      "Kunstmuseum Den Haag — Major Mondrian collection and decorative arts",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "40+", description: "Mauritshuis, Escher in The Palace, Kunstmuseum, Louwman Museum, Museon, and 35+ more museums at B2B rates." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "20+", description: "Madurodam, SEA LIFE Scheveningen, Pier, Binnenhof tours, Peace Palace, and more." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "45+", description: "Political walking tours, royal tours, Scheveningen beach tours, bike tours, and art walks." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "25+", description: "Herring tasting, Indonesian rijsttafel, Chinatown food tours, and group dining at Scheveningen." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "15+", description: "Beach activities, dune walks, Westbroekpark, cycling tours, and watersports at Scheveningen." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "20+", description: "Gallery walks, Mondrian tours, theater shows at Zuiderstrandtheater, and cultural workshops." },
    ],
    geoLat: 52.0705,
    geoLon: 4.3007,
    faq: [
      { q: "What museums can I book for groups in The Hague?", a: "TicketMatch.ai provides group access to Mauritshuis (Girl with a Pearl Earring), Panorama Mesdag, Escher in The Palace, Kunstmuseum Den Haag (Mondrian), Louwman Museum (classic cars), Museon, and 35+ more — all at exclusive B2B rates." },
      { q: "Can I combine The Hague and Scheveningen for group tours?", a: "Yes. TicketMatch.ai's package builder lets you combine The Hague city museums with Scheveningen beach activities in one itinerary. Morning at Mauritshuis, lunch in Scheveningen, afternoon at Madurodam — our route planner optimizes the schedule." },
      { q: "Is the Peace Palace open for group visits?", a: "Yes. The Peace Palace (International Court of Justice) offers guided group tours. TicketMatch.ai can help you book these alongside other Hague experiences at B2B rates. Tours cover the history of international law and the beautiful palace interiors." },
      { q: "How far is The Hague from Amsterdam?", a: "The Hague is 50 minutes from Amsterdam by train and 25 minutes from Rotterdam. It's easy to add to any multi-city Dutch group itinerary. TicketMatch.ai's package builder makes multi-city planning simple with B2B rates across all Dutch cities." },
      { q: "What makes The Hague special for group travel?", a: "The Hague combines world-class art (Mauritshuis, Escher), political history (Binnenhof, Peace Palace), and beach leisure (Scheveningen) — a unique mix no other Dutch city offers. Fewer tourists than Amsterdam means less crowding for groups." },
    ],
  },
  {
    slug: "utrecht",
    name: "Utrecht",
    province: "Utrecht",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "950+",
    categories: 9,
    viatorDestId: 24976,
    tagline: "The beating heart of the Netherlands",
    description:
      "Utrecht is the heart of the Netherlands — a charming medieval city with unique wharf cellars, the iconic Dom Tower, and a thriving cultural scene. Just 25 minutes from Amsterdam, it's the perfect addition to any group itinerary. TicketMatch.ai connects tour operators to 950+ experiences at exclusive B2B group rates.",
    highlights: [
      "Dom Tower — The tallest church tower in the Netherlands at 112 meters, with panoramic views",
      "Museum Catharijneconvent — Premier museum of Christian art in the Netherlands",
      "Centraal Museum — Utrecht's main art and culture museum with Rietveld collection",
      "Utrecht Canals — Unique two-level wharf cellars with waterside restaurants and terraces",
      "Railway Museum — Interactive national railway museum, perfect for groups",
      "Kasteel de Haar — The largest and most luxurious castle in the Netherlands",
      "DOMunder — Underground archaeological experience beneath Domplein",
      "Rietveld Schroder House — UNESCO World Heritage De Stijl architecture",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "30+", description: "Centraal Museum, Catharijneconvent, Railway Museum, Aboriginal Art Museum, Speelklok Museum, and more." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "40+", description: "Canal tours through wharf cellars, Dom Tower climbs, city walks, bike tours, and street art tours." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "15+", description: "Dom Tower, DOMunder, Railway Museum, Kasteel de Haar, TivoliVredenburg concert hall." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "20+", description: "Wharf cellar dining, cheese tasting, Dutch food tours, craft beer walks, and cooking workshops." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "15+", description: "Rietveld Schroder House, Dick Bruna (Miffy) tours, gallery visits, and cultural workshops." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "10+", description: "Cycling to Kasteel de Haar, Amelisweerd forest walks, and Utrecht Hill Ridge day trips." },
    ],
    geoLat: 52.0907,
    geoLon: 5.1214,
    faq: [
      { q: "What group tours are available in Utrecht?", a: "TicketMatch.ai offers 950+ experiences in Utrecht: canal boat tours through the unique wharf cellars, Dom Tower climbs for groups, museum visits, food tours, day trips to Kasteel de Haar, and more — all at exclusive B2B rates." },
      { q: "Is Utrecht worth visiting for groups?", a: "Absolutely. Utrecht is centrally located (25 min from Amsterdam), has a compact walkable center, unique wharf cellars found nowhere else, excellent museums, and far fewer crowds than Amsterdam. TicketMatch.ai's busyness data helps plan optimal group visits." },
      { q: "What makes Utrecht's canals unique?", a: "Utrecht has two-level canals with wharf cellars — medieval storage spaces converted into waterside restaurants and terraces at water level. No other Dutch city has this. TicketMatch.ai offers canal boat tours and wharf cellar dining experiences for groups." },
      { q: "Can I visit Kasteel de Haar with a group?", a: "Yes. Kasteel de Haar is the largest castle in the Netherlands, just 20 minutes from Utrecht center. TicketMatch.ai offers group tours of the castle, gardens, and surrounding estate at B2B rates." },
      { q: "How do I combine Utrecht with Amsterdam for groups?", a: "Utrecht is just 25 minutes from Amsterdam by train. TicketMatch.ai's package builder creates multi-city itineraries — morning in Amsterdam, afternoon in Utrecht — with B2B rates and optimized schedules across both cities." },
    ],
  },
  {
    slug: "eindhoven",
    name: "Eindhoven",
    province: "North Brabant",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "680+",
    categories: 8,
    viatorDestId: 24978,
    tagline: "Technology & design capital of the Netherlands",
    description:
      "Eindhoven is the Netherlands' technology and design capital — home to Philips, the world-famous GLOW light festival, and the creative Strijp-S district. TicketMatch.ai offers B2B access to 680+ group experiences for tour operators and DMCs.",
    highlights: [
      "Van Abbemuseum — World-renowned modern and contemporary art collection",
      "Strijp-S — Creative tech district in former Philips factories, the Dutch Silicon Valley",
      "Philips Museum — History of the Philips electronics empire, from light bulbs to tech giant",
      "GLOW Festival — Annual international light art festival (November)",
      "Evoluon — Iconic flying saucer-shaped conference and event center",
      "DAF Museum — Classic vehicle museum in the former DAF truck factory",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "15+", description: "Van Abbemuseum, Philips Museum, DAF Museum, PreHistorisch Dorp, and design galleries." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "25+", description: "Strijp-S tech tours, design walks, street art tours, and innovation hub visits." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "20+", description: "Brabant cuisine tours, craft beer walks, food markets, and group dining at Strijp-S." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "10+", description: "Evoluon, Glow Route, PSV Stadium tours, and tech campus visits." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "15+", description: "Dutch Design Week venues, Kazerne design hotel, MU Artspace, and gallery tours." },
      { slug: "classes", name: "Classes & Workshops", icon: "\u{1F3A8}", count: "10+", description: "Design thinking workshops, tech masterclasses, creative coding, and innovation labs." },
    ],
    geoLat: 51.4416,
    geoLon: 5.4697,
    faq: [
      { q: "What group experiences are available in Eindhoven?", a: "TicketMatch.ai offers 680+ experiences in Eindhoven: the Van Abbemuseum, Strijp-S creative district tours, Philips Museum, DAF Museum, tech campus visits, craft beer tours, and more — all at exclusive B2B rates." },
      { q: "What is Strijp-S and can groups visit?", a: "Strijp-S is Eindhoven's creative tech district — former Philips factories transformed into studios, restaurants, and innovation hubs. TicketMatch.ai offers guided group tours covering the area's history, street art, and tech scene." },
      { q: "Is Eindhoven suitable for corporate group events?", a: "Yes. Eindhoven's tech and design scene makes it ideal for corporate groups. TicketMatch.ai offers innovation tours, design thinking workshops, and tech campus visits alongside cultural experiences — perfect for team building and incentive trips." },
      { q: "When is the GLOW Festival in Eindhoven?", a: "GLOW Festival takes place annually in November. It's a free outdoor light art festival attracting 750,000+ visitors. TicketMatch.ai offers special group packages during GLOW including guided light tours and VIP experiences." },
      { q: "How far is Eindhoven from Amsterdam?", a: "Eindhoven is 90 minutes from Amsterdam by train. With its own international airport (Eindhoven Airport), it's an easy standalone destination. TicketMatch.ai's multi-city package builder makes combining Eindhoven with other Dutch cities simple." },
    ],
  },
  {
    slug: "groningen",
    name: "Groningen",
    province: "Groningen",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "340+",
    categories: 6,
    viatorDestId: 26476,
    tagline: "The vibrant student city of the North",
    description:
      "Groningen is a vibrant student city in the north of the Netherlands with a rich cultural scene, the iconic Martinitoren, and the stunning postmodern Groninger Museum. TicketMatch.ai provides B2B access to 340+ group experiences.",
    highlights: [
      "Groninger Museum — Postmodern architecture with world-class exhibitions by Alessandro Mendini",
      "Martinitoren — Groningen's iconic 97-meter church tower (\"d'Olle Grieze\"), city views",
      "Northern Maritime Museum — Maritime heritage of the northern Netherlands",
      "Prinsentuin — Beautiful Renaissance garden behind the Prinsenhof",
      "Forum Groningen — Cultural center with rooftop terrace and panoramic views",
      "Noorderplantsoen — Charming city park for group walks",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "12+", description: "Groninger Museum, Northern Maritime Museum, University Museum, Comics Museum, and more." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "15+", description: "Historical city walks, canal tours, student life tours, and Martinitoren climbs." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "10+", description: "Groningen food tours, mustard tasting (Groninger Mosterd), and northern Dutch cuisine." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "10+", description: "Street art walks, gallery tours, Forum cultural center, and live music venues." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "8+", description: "Wadden Sea day trips, cycling tours, Noorderplantsoen walks, and Paterswoldsemeer lake." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "8+", description: "Martinitoren, Forum rooftop, Escape rooms, and northern Dutch heritage sites." },
    ],
    geoLat: 53.2194,
    geoLon: 6.5665,
    faq: [
      { q: "What can groups do in Groningen?", a: "TicketMatch.ai offers 340+ group experiences in Groningen: the Groninger Museum, Martinitoren tower climbs, canal tours, walking tours, food experiences, Forum Groningen visits, and Wadden Sea day trips — all at B2B group rates." },
      { q: "Is Groningen good for group travel?", a: "Yes. Groningen is compact, walkable, and has a vibrant atmosphere. The postmodern Groninger Museum is world-famous, and the city has far fewer tourists than Amsterdam. It's also the gateway to the UNESCO Wadden Sea." },
      { q: "Can groups visit the Wadden Sea from Groningen?", a: "Yes. TicketMatch.ai offers Wadden Sea day trips from Groningen including mudflat walking (wadlopen), seal watching, and island ferries to Schiermonnikoog — all at B2B group rates." },
      { q: "What is the Groninger Museum?", a: "The Groninger Museum is a postmodern architectural masterpiece designed by Alessandro Mendini, with rotating world-class exhibitions. TicketMatch.ai offers group tickets at B2B rates with optional guided tours." },
      { q: "How far is Groningen from Amsterdam?", a: "Groningen is 2 hours from Amsterdam by train. It's the main city of the northern Netherlands and serves as a base for Wadden Sea and northern Dutch experiences. TicketMatch.ai makes multi-city Dutch group planning easy." },
    ],
  },
  {
    slug: "maastricht",
    name: "Maastricht",
    province: "Limburg",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "470+",
    categories: 7,
    viatorDestId: 22820,
    tagline: "Where three countries meet — Burgundian soul",
    description:
      "Maastricht is the most international city in the Netherlands — where three countries meet (NL/BE/DE), with Roman ruins, the famous Boekhandel Dominicanen bookstore, and a vibrant Burgundian food culture. TicketMatch.ai offers 470+ B2B group experiences.",
    highlights: [
      "Boekhandel Dominicanen — The world's most beautiful bookstore in a 13th-century Dominican church",
      "Fort Sint Pieter & Maastricht Underground — Limestone caves and fortifications from 1701",
      "Bonnefantenmuseum — Art museum in a striking building designed by Aldo Rossi",
      "Vrijthof Square — Historic central square with St. Servatius Basilica and St. Jan's Church",
      "Maastricht Underground — Tours through centuries-old limestone tunnels and WWII shelters",
      "Drielandenpunt — The point where Netherlands, Belgium, and Germany meet",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "15+", description: "Bonnefantenmuseum, Natural History Museum, Centre Ceramique, and regional art galleries." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "20+", description: "Underground cave tours, historic center walks, Maas river cruises, and cross-border day trips." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "15+", description: "Burgundian food tours, Limburg pie tasting, wine tours, and regional cuisine experiences." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "10+", description: "Bonnefantenmuseum, theater at Theater aan het Vrijthof, and cultural heritage walks." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "10+", description: "Sint Pietersberg hikes, Maas river cycling, Drielandenpunt visit, and Limburg hill country." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "8+", description: "Maastricht Underground, Fort Sint Pieter, Helpoort (oldest city gate in NL), and caves." },
    ],
    geoLat: 50.8514,
    geoLon: 5.6910,
    faq: [
      { q: "What group tours are available in Maastricht?", a: "TicketMatch.ai offers 470+ experiences in Maastricht: underground cave tours, Bonnefantenmuseum, walking tours of the historic center, Burgundian food tours, Maas river cruises, and cross-border day trips to Belgium and Germany." },
      { q: "Can groups visit the Maastricht Underground caves?", a: "Yes. The Maastricht Underground (Sint Pietersberg caves) offers guided group tours through 20,000+ limestone tunnels with centuries of history, WWII shelters, and charcoal drawings. TicketMatch.ai provides B2B group bookings." },
      { q: "What is Burgundian culture in Maastricht?", a: "Maastricht has a 'Burgundian' lifestyle — enjoying good food, wine, and social gatherings. TicketMatch.ai offers Burgundian food tours, regional wine tastings, Limburg pie workshops, and group dining experiences celebrating this culture." },
      { q: "Can I do a three-country tour from Maastricht?", a: "Yes. Maastricht is at the Drielandenpunt where Netherlands, Belgium, and Germany meet. TicketMatch.ai offers cross-border day trips including Aachen (Germany), Liege (Belgium), and the Drielandenpunt — all at B2B group rates." },
      { q: "Is Maastricht the most beautiful bookstore in the world?", a: "Boekhandel Dominicanen in Maastricht is regularly voted the world's most beautiful bookstore — a 13th-century Dominican church converted into a stunning bookshop. Group visits can be arranged through TicketMatch.ai." },
    ],
  },
  {
    slug: "haarlem",
    name: "Haarlem",
    province: "North Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "520+",
    categories: 8,
    viatorDestId: 26223,
    tagline: "Amsterdam's elegant Golden Age neighbor",
    description:
      "Haarlem is Amsterdam's elegant neighbor — a city of Frans Hals, Teylers Museum, and beautiful medieval architecture. Just 15 minutes from Amsterdam, it's the perfect addition to any group itinerary. TicketMatch.ai offers 520+ B2B experiences.",
    highlights: [
      "Teylers Museum — The oldest museum in the Netherlands (1784), art, science & natural history",
      "Frans Hals Museum — Masterpieces of the Dutch Golden Age in a 17th-century almshouse",
      "Grote Kerk (St. Bavo) — Gothic church with the famous 5,068-pipe Christian M\u00fcller organ",
      "Corrie ten Boom House — WWII hiding place museum, the 'Hiding Place' story",
      "Hofjes — Hidden medieval courtyards unique to Haarlem",
      "Jopenkerk — Craft brewery in a former church, group tastings available",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "15+", description: "Teylers Museum, Frans Hals Museum, De Hallen, ABC Architecture Centre, and 10+ more." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "20+", description: "Golden Age walks, hofjes (courtyard) tours, canal tours, and Haarlem-Amsterdam combo tours." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "15+", description: "Jopenkerk brewery tours, food market walks, Dutch cuisine tastings, and group dining." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "10+", description: "Frans Hals trail, Grote Kerk organ concerts, gallery walks, and art history tours." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "8+", description: "Beach at Bloemendaal, Kennemerland dunes, tulip tours (spring), and cycling routes." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "5+", description: "Grote Kerk tower, windmill De Adriaan, and Keukenhof day trips (spring)." },
    ],
    geoLat: 52.3874,
    geoLon: 4.6462,
    faq: [
      { q: "Can I combine Haarlem with Amsterdam for groups?", a: "Yes. Haarlem is just 15 minutes from Amsterdam by train. TicketMatch.ai's package builder creates combined Amsterdam-Haarlem itineraries — morning at the Rijksmuseum, afternoon in Haarlem's Golden Age center — with B2B rates for both cities." },
      { q: "What museums are in Haarlem for groups?", a: "Haarlem has 15+ museums: Teylers Museum (oldest in NL), Frans Hals Museum (Golden Age), De Hallen (contemporary art), ABC Architecture Centre, and more. TicketMatch.ai offers group bookings at B2B rates." },
      { q: "What are Haarlem's hofjes?", a: "Hofjes are hidden medieval courtyards — Haarlem has 21 of them, more than any Dutch city. TicketMatch.ai offers guided hofjes tours for groups, revealing these secret gardens behind ordinary street facades." },
      { q: "Can groups visit the Jopenkerk brewery?", a: "Yes. Jopenkerk is a craft brewery in a former church. TicketMatch.ai offers group brewery tours with tastings at B2B rates — a unique Haarlem experience combining history, architecture, and Dutch craft beer." },
      { q: "Is Haarlem close to Keukenhof?", a: "Yes. Haarlem is just 25 minutes from Keukenhof Gardens (open March-May). TicketMatch.ai offers Keukenhof group tickets combined with Haarlem city tours — the perfect spring day trip package." },
    ],
  },
  {
    slug: "delft",
    name: "Delft",
    province: "South Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "380+",
    categories: 7,
    viatorDestId: 26505,
    tagline: "City of Vermeer & iconic blue pottery",
    description:
      "Delft is the city of Vermeer, Delft Blue pottery, and the Dutch Royal Family — a charming canal city with rich history and artisanal heritage. TicketMatch.ai offers B2B access to 380+ group experiences including pottery workshops and Vermeer walking tours.",
    highlights: [
      "Royal Delft — The last remaining original Delftware factory from the 17th century",
      "Vermeer Centrum — Dedicated to the life and work of Johannes Vermeer",
      "Nieuwe Kerk — Gothic church with the Royal burial vault of the House of Orange",
      "Museum Prinsenhof — Where William of Orange was assassinated in 1584",
      "Delft Blue pottery workshops — Paint your own tile experience for groups",
      "TU Delft Campus — Innovation tours at the Netherlands' top technical university",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "10+", description: "Vermeer Centrum, Museum Prinsenhof, Royal Delft, Science Centre Delft, and more." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "15+", description: "Vermeer walking tours, canal tours, Golden Age walks, and TU Delft campus tours." },
      { slug: "classes", name: "Classes & Workshops", icon: "\u{270F}\u{FE0F}", count: "10+", description: "Delft Blue painting workshops, pottery classes, and traditional craft experiences." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "8+", description: "Dutch food tours, market visits, cheese tasting, and group dining in historic venues." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "8+", description: "Vermeer trail, gallery walks, church visits, and art history workshops." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "5+", description: "Nieuwe Kerk tower, Oude Kerk, city gates, and windmill tours." },
    ],
    geoLat: 52.0116,
    geoLon: 4.3571,
    faq: [
      { q: "Can groups visit the Delft Blue pottery factory?", a: "Yes. TicketMatch.ai offers B2B group bookings for Royal Delft — the only remaining original 17th-century Delftware factory. Groups can tour the factory, see master painters at work, visit the museum, and even paint their own Delft Blue tile." },
      { q: "What Vermeer experiences are available in Delft?", a: "Delft is Vermeer's birthplace. TicketMatch.ai offers the Vermeer Centrum, Vermeer walking tours visiting locations from his paintings, and combination packages with the Mauritshuis in The Hague (where Girl with a Pearl Earring hangs)." },
      { q: "Can I combine Delft with Rotterdam or The Hague?", a: "Absolutely. Delft is just 15 minutes from both Rotterdam and The Hague by train. TicketMatch.ai's package builder creates multi-city South Holland itineraries with B2B rates — perfect for a full day exploring the region." },
      { q: "Are Delft Blue painting workshops available for groups?", a: "Yes. TicketMatch.ai offers group Delft Blue painting workshops where participants learn the traditional technique and paint their own tile to take home. Available at Royal Delft and smaller artisan workshops — all at B2B rates." },
      { q: "What is the historical significance of Delft?", a: "Delft is where William of Orange (Father of the Nation) was assassinated in 1584, where Vermeer painted his masterpieces, and where Delft Blue pottery became world-famous. All these stories come alive through TicketMatch.ai's guided group tours." },
    ],
  },
  {
    slug: "leiden",
    name: "Leiden",
    province: "South Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "380+",
    categories: 7,
    viatorDestId: 26505,
    tagline: "City of knowledge — Rembrandt's birthplace",
    description:
      "Leiden is a city of knowledge — home to the oldest university in the Netherlands (1575), Rembrandt's birthplace, and world-class museums. TicketMatch.ai offers 380+ B2B group experiences in this compact, walkable city of canals and culture.",
    highlights: [
      "Naturalis Biodiversity Center — National natural history museum with T-Rex and more",
      "Museum De Lakenhal — Leiden's city museum with Rembrandt's earliest works",
      "National Museum of Antiquities (Rijksmuseum van Oudheden) — Egypt, Greece, Rome collections",
      "Hortus Botanicus — One of the oldest botanical gardens in Europe (1590)",
      "Leiden University — The oldest university in the Netherlands, Einstein once lectured here",
      "Rembrandt's Birthplace — Walk in the footsteps of the master painter",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "15+", description: "Naturalis, De Lakenhal, Museum of Antiquities, CORPUS body museum, Museum Volkenkunde, and more." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "15+", description: "Rembrandt walking tours, canal tours, university tours, and Pilgrim Fathers history walks." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "10+", description: "Rembrandt trail, Museum De Lakenhal, wall poems, and gallery walks." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "8+", description: "Hortus Botanicus, Kaag Lakes, tulip tours (spring), and cycling routes." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "5+", description: "Leiden market food tours, student quarter walks, and group dining in historic venues." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "5+", description: "Burcht van Leiden, windmill De Valk, Pieterskerk, and CORPUS body experience." },
    ],
    geoLat: 52.1601,
    geoLon: 4.4970,
    faq: [
      { q: "What museums are available for groups in Leiden?", a: "TicketMatch.ai offers group bookings for Naturalis Biodiversity Center, Museum De Lakenhal, National Museum of Antiquities, CORPUS body museum, Museum Volkenkunde, and more — all at exclusive B2B rates." },
      { q: "Can I do a Rembrandt tour in Leiden for groups?", a: "Yes. Leiden is Rembrandt's birthplace. TicketMatch.ai offers Rembrandt walking tours visiting his childhood home location, Museum De Lakenhal (his earliest works), and other sites connected to the master painter." },
      { q: "What is CORPUS in Leiden?", a: "CORPUS is a unique 'journey through the human body' experience near Leiden. Groups walk through a giant human body learning about anatomy. TicketMatch.ai offers group bookings at B2B rates — very popular with school and corporate groups." },
      { q: "Is Leiden close to Keukenhof?", a: "Yes. Leiden is just 20 minutes from Keukenhof Gardens (open March-May) and surrounded by tulip fields. TicketMatch.ai offers Keukenhof + Leiden combination packages for groups at B2B rates." },
      { q: "What is the Pilgrim Fathers connection to Leiden?", a: "The Pilgrims who sailed to America on the Mayflower lived in Leiden for 11 years before departing. TicketMatch.ai offers Pilgrim Fathers walking tours visiting the Pieterskerk, their homes, and the American Pilgrim Museum." },
    ],
  },
  {
    slug: "arnhem",
    name: "Arnhem",
    province: "Gelderland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "290+",
    categories: 6,
    viatorDestId: 26525,
    tagline: "Green city of nature, fashion & WWII history",
    description:
      "Arnhem is a green city of fashion, nature, and WWII history — home to the famous Battle of Arnhem sites, the Netherlands Open Air Museum, and gateway to the Hoge Veluwe National Park with the Kr\u00f6ller-M\u00fcller Museum. TicketMatch.ai offers 290+ B2B group experiences.",
    highlights: [
      "Netherlands Open Air Museum — 80+ historic buildings in a park, living Dutch history",
      "Airborne Museum Hartenstein — Battle of Arnhem / A Bridge Too Far, WWII history",
      "Burgers' Zoo — One of the largest and most innovative zoos in Europe",
      "Kr\u00f6ller-M\u00fcller Museum — Second-largest Van Gogh collection, in the Hoge Veluwe forest",
      "Hoge Veluwe National Park — 5,400 hectares of forest, heathland, and free white bicycles",
      "John Frost Bridge — The actual 'Bridge Too Far' from the 1944 battle",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "10+", description: "Open Air Museum, Airborne Museum, Kr\u00f6ller-M\u00fcller, Museum Arnhem, and more." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "8+", description: "Burgers' Zoo, Hoge Veluwe, John Frost Bridge, and fashion district." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "15+", description: "WWII battlefield tours, nature walks, fashion walks, and cycling tours." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "12+", description: "Hoge Veluwe cycling, Posbank viewpoint, Veluwezoom hikes, and river cruises." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "8+", description: "Kr\u00f6ller-M\u00fcller sculpture garden, Museum Arnhem, and fashion galleries." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "5+", description: "Gelderland cuisine tours, wine tastings, and group dining." },
    ],
    geoLat: 51.9851,
    geoLon: 5.8987,
    faq: [
      { q: "What WWII experiences are available in Arnhem for groups?", a: "TicketMatch.ai offers group bookings for the Airborne Museum Hartenstein, Battle of Arnhem walking tours, John Frost Bridge visits, Arnhem War Cemetery, and guided 'Bridge Too Far' tours — all at B2B rates." },
      { q: "Can groups visit the Kr\u00f6ller-M\u00fcller Museum?", a: "Yes. The Kr\u00f6ller-M\u00fcller Museum in the Hoge Veluwe has the second-largest Van Gogh collection plus a world-famous sculpture garden. TicketMatch.ai offers combined park + museum group tickets at B2B rates." },
      { q: "What is the Netherlands Open Air Museum?", a: "The Netherlands Open Air Museum in Arnhem features 80+ historic buildings from across the Netherlands — farms, windmills, factories — in a beautiful park. Groups experience 500 years of Dutch daily life. Bookable via TicketMatch.ai at B2B rates." },
      { q: "Is Hoge Veluwe good for group excursions?", a: "Absolutely. Hoge Veluwe National Park offers 5,400 hectares of nature with free white bicycles, the Kr\u00f6ller-M\u00fcller Museum, and wildlife spotting. TicketMatch.ai provides group entry tickets and guided nature tours at B2B rates." },
      { q: "How far is Arnhem from Amsterdam?", a: "Arnhem is 70 minutes from Amsterdam by train. It's the gateway to the Veluwe nature region and WWII history. TicketMatch.ai's package builder combines Arnhem with nearby Nijmegen for multi-day group itineraries." },
    ],
  },
  {
    slug: "nijmegen",
    name: "Nijmegen",
    province: "Gelderland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "260+",
    categories: 5,
    viatorDestId: 26498,
    tagline: "The oldest city in the Netherlands — 2,000+ years",
    description:
      "Nijmegen is the oldest city in the Netherlands — over 2,000 years of Roman history, home to the famous Four Days Marches, and a vibrant student city on the Waal river. TicketMatch.ai offers 260+ B2B group experiences.",
    highlights: [
      "Museum Het Valkhof — Roman and medieval art and archaeology on the Waal",
      "Nationaal Bevrijdingsmuseum — National Liberation Museum, WWII and freedom",
      "De Waagh — Historic weigh house dating back to 1612, now a restaurant",
      "Stevenskerk — Gothic church with tower views over the Waal river",
      "Valkhof Park — Roman ruins with panoramic river views",
      "Four Days Marches Route — Follow the world's largest walking event route",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "8+", description: "Museum Het Valkhof, Liberation Museum, Afrika Museum, and Roman history exhibits." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "12+", description: "Roman history walks, WWII liberation tours, river walks, and Four Days Marches route." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "8+", description: "Brewery tours, local cuisine walks, and group dining at historic venues like De Waagh." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "5+", description: "Gallery walks, Stevenskerk visits, and cultural heritage experiences." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "5+", description: "Waal river walks, cycling tours, and Ooijpolder nature reserve." },
    ],
    geoLat: 51.8126,
    geoLon: 5.8372,
    faq: [
      { q: "What historical group tours are available in Nijmegen?", a: "TicketMatch.ai offers Roman history walking tours, WWII liberation tours, Museum Het Valkhof group visits, and city heritage tours — the oldest city in the Netherlands has 2,000+ years of history to explore at B2B rates." },
      { q: "What is the Four Days Marches?", a: "The Vierdaagse (Four Days Marches) is the world's largest walking event, held annually in July in Nijmegen. TicketMatch.ai offers group packages around the event including guided route walks and festivity experiences." },
      { q: "Can I combine Nijmegen with Arnhem?", a: "Yes. Nijmegen and Arnhem are just 20 minutes apart. TicketMatch.ai's package builder creates Gelderland region itineraries combining Nijmegen's Roman history with Arnhem's WWII sites and Hoge Veluwe — all at B2B rates." },
      { q: "What Roman ruins are in Nijmegen?", a: "Nijmegen was the Roman city of Noviomagus. Valkhof Park has Roman ruins with river views, Museum Het Valkhof displays Roman artifacts, and guided tours explore the 2,000-year-old foundations beneath the modern city." },
    ],
  },
  {
    slug: "alkmaar",
    name: "Alkmaar",
    province: "North Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "190+",
    categories: 5,
    viatorDestId: 26416,
    tagline: "The cheese capital of the Netherlands",
    description:
      "Alkmaar is the cheese capital of the Netherlands — famous for its traditional cheese market, historic city center, and charming canal-side architecture. TicketMatch.ai offers 190+ B2B group experiences including cheese tours and tastings.",
    highlights: [
      "Alkmaar Cheese Market — Traditional Friday morning cheese market (April-September)",
      "Dutch Cheese Museum — History of Dutch cheese making in a 14th-century building",
      "National Beer Museum De Boom — Dutch brewing heritage and tasting",
      "Stedelijk Museum Alkmaar — City art and history, including Golden Age paintings",
      "Grote Kerk — Late-Gothic church with historic Schnitger organ",
      "Canal boat tours — Explore Alkmaar's medieval canals by boat",
    ],
    topCategories: [
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "12+", description: "Cheese market tours, cheese tasting workshops, beer museum, and Dutch food experiences." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "10+", description: "Cheese market guided tours, canal tours, Golden Age walks, and city history tours." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "5+", description: "Dutch Cheese Museum, Beer Museum De Boom, Stedelijk Museum, and Beatles Museum." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "3+", description: "Grote Kerk organ concerts, gallery walks, and cultural heritage tours." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "3+", description: "Cheese market experience, windmill visits, and traditional Dutch craft demonstrations." },
    ],
    geoLat: 52.6324,
    geoLon: 4.7534,
    faq: [
      { q: "Can groups attend the Alkmaar cheese market?", a: "Yes. TicketMatch.ai offers B2B group experiences around the famous Alkmaar Cheese Market (Fridays, April-September). This includes guided tours explaining the traditions, VIP viewing spots, and cheese tasting workshops afterward." },
      { q: "When is the Alkmaar Cheese Market?", a: "The Alkmaar Cheese Market runs every Friday morning from April to September, 10:00-13:00. TicketMatch.ai offers year-round cheese experiences including the Dutch Cheese Museum and tasting workshops, even outside market season." },
      { q: "What else can groups do in Alkmaar besides the cheese market?", a: "Alkmaar has canal boat tours, the National Beer Museum, Stedelijk Museum, Golden Age walking tours, Beatles Museum, and beautiful canal-side architecture. TicketMatch.ai offers 190+ experiences at B2B rates." },
      { q: "How far is Alkmaar from Amsterdam?", a: "Alkmaar is 35 minutes from Amsterdam by train. It's the perfect half-day addition to an Amsterdam group itinerary — especially on Fridays for the cheese market. TicketMatch.ai makes combining cities easy." },
    ],
  },
  {
    slug: "dordrecht",
    name: "Dordrecht",
    province: "South Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "140+",
    categories: 4,
    viatorDestId: 26382,
    tagline: "The oldest city in Holland — island city on the water",
    description:
      "Dordrecht is the oldest city in Holland — an island city surrounded by water, with a rich Golden Age heritage, the largest inner-city harbor in the Netherlands, and gateway to the famous Kinderdijk windmills. TicketMatch.ai offers 140+ B2B group experiences.",
    highlights: [
      "Dordrechts Museum — Old Master paintings including Albert Cuyp and Ferdinand Bol",
      "Grote Kerk — Gothic church with panoramic views from the unfinished tower",
      "Huis van Gijn — Perfectly preserved 19th-century collector's house museum",
      "Kinderdijk Windmills — UNESCO World Heritage site, just 15 minutes away",
      "Boat tours — Water tours around the island of Dordrecht, where three rivers meet",
      "Dordrecht Inner Harbor — The largest inner-city harbor in the Netherlands",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "5+", description: "Dordrechts Museum, Huis van Gijn, National Education Museum, and more." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "8+", description: "Kinderdijk excursions, Golden Age walks, harbor tours, and river cruises." },
      { slug: "art-culture", name: "Art & Culture", icon: "\u{1F3A8}", count: "3+", description: "Grote Kerk, gallery walks, and cultural heritage experiences." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "3+", description: "Harbor dining, regional food tours, and group dining at historic venues." },
    ],
    geoLat: 51.8133,
    geoLon: 4.6901,
    faq: [
      { q: "Can groups visit Kinderdijk from Dordrecht?", a: "Yes. Kinderdijk UNESCO windmills are just 15 minutes from Dordrecht. TicketMatch.ai offers combined Dordrecht + Kinderdijk group packages including waterbus transport, windmill visits, and guided tours — all at B2B rates." },
      { q: "What is special about Dordrecht?", a: "Dordrecht is the oldest city in Holland (city rights since 1220), an island where three rivers meet, has the largest inner-city harbor in NL, and is the gateway to Kinderdijk windmills. TicketMatch.ai offers 140+ group experiences at B2B rates." },
      { q: "What museums are in Dordrecht?", a: "Dordrechts Museum has Golden Age paintings by Cuyp and Bol. Huis van Gijn is a perfectly preserved 19th-century house. The National Education Museum is unique in the Netherlands. All bookable at B2B group rates via TicketMatch.ai." },
    ],
  },
  {
    slug: "gouda",
    name: "Gouda",
    province: "South Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "150+",
    categories: 4,
    viatorDestId: 26397,
    tagline: "World-famous cheese, stroopwafels & stained glass",
    description:
      "Gouda is world-famous for its cheese, stroopwafels, and stunning stained glass windows in Sint-Janskerk. TicketMatch.ai offers 150+ B2B group experiences in this charming South Holland city perfect for food-loving groups.",
    highlights: [
      "Gouda Cheese Market — Traditional Thursday morning cheese market (April-August)",
      "Sint-Janskerk — Longest church in the Netherlands with 72 magnificent stained glass windows",
      "Museum Gouda — Art, history, and the famous Gouda clay pipes",
      "Stroopwafel Workshop — Traditional syrup waffle making for groups",
      "Gouda City Hall — One of the oldest Gothic city halls in the Netherlands",
      "Cheese farms — Visit working cheese farms around Gouda",
    ],
    topCategories: [
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "10+", description: "Cheese market tours, stroopwafel workshops, cheese farm visits, and Dutch food experiences." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "8+", description: "Cheese market guided tours, city walks, Sint-Janskerk tours, and canal boat trips." },
      { slug: "classes", name: "Classes & Workshops", icon: "\u{270F}\u{FE0F}", count: "5+", description: "Stroopwafel baking workshops, cheese making classes, and traditional craft experiences." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "3+", description: "Museum Gouda, GoudA chocolate museum, and Sint-Janskerk stained glass tours." },
    ],
    geoLat: 52.0115,
    geoLon: 4.7113,
    faq: [
      { q: "Can groups attend the Gouda Cheese Market?", a: "Yes. TicketMatch.ai offers group experiences around the Gouda Cheese Market (Thursdays, April-August) including guided tours, VIP access, cheese tasting, and stroopwafel workshops — all at B2B rates." },
      { q: "What is a stroopwafel workshop?", a: "In a stroopwafel workshop, groups learn to make traditional Gouda stroopwafels (syrup waffles) by hand — pressing the waffle, filling it with warm caramel syrup, and taking home their creations. Bookable via TicketMatch.ai at B2B rates." },
      { q: "Can groups visit cheese farms near Gouda?", a: "Yes. TicketMatch.ai offers visits to working cheese farms around Gouda where groups see traditional Gouda cheese being made, taste different ages, and learn about the 700-year-old cheese tradition." },
      { q: "What are the stained glass windows of Sint-Janskerk?", a: "Sint-Janskerk in Gouda has 72 stained glass windows — the finest collection in the Netherlands, some dating to the 16th century. TicketMatch.ai offers group tours with expert guides explaining each window's biblical and historical story." },
    ],
  },
  {
    slug: "zaandam",
    name: "Zaandam",
    province: "North Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "180+",
    categories: 5,
    viatorDestId: 22382,
    tagline: "Iconic windmills & living Dutch heritage",
    description:
      "Zaandam and the Zaanse Schans are the Netherlands' most iconic windmill destination — a living museum of Dutch heritage just 20 minutes from Amsterdam. TicketMatch.ai offers 180+ B2B group experiences including windmill tours and traditional craft workshops.",
    highlights: [
      "Zaanse Schans — Open-air museum with working windmills, clog workshop, and cheese farm",
      "Windmill tours — Visit working paint, oil, mustard, and sawmill windmills",
      "Clog-making workshops — Traditional wooden shoe (klomp) carving demonstrations",
      "Catherine Hoeve Cheese Farm — Traditional Dutch cheese making and tasting",
      "Inntel Hotels Zaandam — Iconic stacked houses facade, architectural landmark",
      "Czar Peter House — Where Russian Czar Peter the Great lived while learning shipbuilding",
    ],
    topCategories: [
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "15+", description: "Zaanse Schans guided tours, windmill tours, Amsterdam-Zaandam combo tours, and boat trips." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "10+", description: "Working windmills, Czar Peter House, Inntel Hotels facade, and heritage sites." },
      { slug: "classes", name: "Classes & Workshops", icon: "\u{270F}\u{FE0F}", count: "8+", description: "Clog-making workshops, cheese making, chocolate workshops, and traditional crafts." },
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "5+", description: "Zaans Museum, Verkade Experience, Honig Breethuis, and windmill museums." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "5+", description: "Cheese tasting, chocolate workshops, Dutch pancakes, and traditional Zaan treats." },
    ],
    geoLat: 52.4389,
    geoLon: 4.8263,
    faq: [
      { q: "Can I book Zaanse Schans windmill tours for groups?", a: "Yes. TicketMatch.ai offers B2B group bookings for Zaanse Schans including working windmill visits, clog-making workshops, cheese farm tours, chocolate workshops, and combined Amsterdam-Zaandam day trips — all at exclusive group rates." },
      { q: "How far is Zaanse Schans from Amsterdam?", a: "Zaanse Schans is just 20 minutes from Amsterdam by train. It's the most popular day trip from Amsterdam for groups. TicketMatch.ai offers combined Amsterdam + Zaanse Schans packages at B2B rates with transport included." },
      { q: "What can groups do at Zaanse Schans?", a: "Groups can visit working windmills (paint, oil, mustard), watch clog-making demonstrations, visit cheese farms, join chocolate workshops, and explore the Zaans Museum. TicketMatch.ai offers full-day and half-day group packages at B2B rates." },
      { q: "Are the windmills at Zaanse Schans real?", a: "Yes. Zaanse Schans has 8+ real, working windmills relocated from the Zaanstreek region. Several are open for visits — groups can climb inside and see traditional Dutch industries in action. Bookable via TicketMatch.ai at B2B rates." },
    ],
  },
  {
    slug: "hoorn",
    name: "Hoorn",
    province: "North Holland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "120+",
    categories: 4,
    viatorDestId: 26383,
    tagline: "Golden Age VOC harbor town on the IJsselmeer",
    description:
      "Hoorn is a historic VOC (Dutch East India Company) harbor town on the IJsselmeer — rich in Golden Age maritime heritage with a beautifully preserved city center. Cape Horn is named after this city. TicketMatch.ai offers 120+ B2B group experiences.",
    highlights: [
      "Westfries Museum — Regional history in a stunning 1632 Dutch Renaissance building",
      "Museum of the 20th Century — Nostalgic museum of Dutch daily life through the decades",
      "VOC Heritage Walk — Follow the Golden Age trade routes through the historic harbor",
      "Steam Train to Medemblik — Historic railway along the IJsselmeer with connecting boat",
      "Hoorn Harbor — Beautiful Golden Age harbor with historic ships and waterfront terraces",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "4+", description: "Westfries Museum, Museum of the 20th Century, and maritime heritage exhibits." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "5+", description: "VOC heritage walks, harbor tours, steam train rides, and sailing excursions." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "3+", description: "Historic steam train, harbor cruise, and Hoorn tower climb." },
      { slug: "food-drink", name: "Food & Drink", icon: "\u{1F37D}\u{FE0F}", count: "3+", description: "Harbor dining, local fish specialties, and group meals at historic venues." },
    ],
    geoLat: 52.6424,
    geoLon: 5.0602,
    faq: [
      { q: "What group experiences are available in Hoorn?", a: "TicketMatch.ai offers VOC heritage walks, Westfries Museum group visits, the historic steam train to Medemblik (with boat return), sailing on the IJsselmeer, and Golden Age harbor tours — all at B2B rates." },
      { q: "What is the connection between Hoorn and Cape Horn?", a: "Cape Horn at the southern tip of South America was named after the city of Hoorn by Dutch explorers who first rounded it in 1616. The VOC heritage walk in Hoorn tells this and other Golden Age maritime stories." },
      { q: "Can groups take the steam train from Hoorn?", a: "Yes. The historic steam train runs from Hoorn to Medemblik along the IJsselmeer, with a boat connection back. TicketMatch.ai offers group packages for this popular day trip at B2B rates." },
    ],
  },
  {
    slug: "middelburg",
    name: "Middelburg",
    province: "Zeeland",
    country: "Netherlands",
    flag: "\u{1F1F3}\u{1F1F1}",
    experiences: "110+",
    categories: 4,
    viatorDestId: 26475,
    tagline: "Medieval Zeeland capital & gateway to Delta Works",
    description:
      "Middelburg is the capital of Zeeland province — a beautifully restored medieval city with a rich VOC history, stunning abbey complex, and gateway to the Delta Works engineering marvel. TicketMatch.ai offers 110+ B2B group experiences.",
    highlights: [
      "Middelburg Abbey — Medieval abbey complex with the 90m Lange Jan tower",
      "Zeeuws Museum — Regional art, culture, and maritime history in the abbey",
      "Delta Works (Neeltje Jans) — One of the Seven Wonders of the Modern World",
      "Miniature Walcheren — Miniature park showcasing Zeeland peninsula at 1:20 scale",
      "Middelburg City Hall — Late-Gothic masterpiece on the Markt square",
      "VOC building — Former headquarters of the Zeeland chamber of the Dutch East India Company",
    ],
    topCategories: [
      { slug: "museums", name: "Museums", icon: "\u{1F3DB}\u{FE0F}", count: "5+", description: "Zeeuws Museum, Roosevelt Study Center, Terra Maris nature museum, and abbey exhibits." },
      { slug: "tours", name: "Tours & Sightseeing", icon: "\u{1F6B6}", count: "5+", description: "Abbey tours, city walks, Delta Works excursions, and canal boat trips." },
      { slug: "outdoor", name: "Outdoor", icon: "\u{1F33F}", count: "5+", description: "Delta Works visits, beach excursions, cycling Walcheren, and nature reserves." },
      { slug: "attractions", name: "Attractions", icon: "\u{1F3A0}", count: "3+", description: "Lange Jan tower, Miniature Walcheren, and Delta Park Neeltje Jans." },
    ],
    geoLat: 51.4988,
    geoLon: 3.6109,
    faq: [
      { q: "Can groups visit the Delta Works from Middelburg?", a: "Yes. TicketMatch.ai offers day trips from Middelburg to Delta Park Neeltje Jans, including guided tours of the Oosterscheldekering storm surge barrier — one of the Seven Wonders of the Modern World. All at B2B group rates." },
      { q: "What is the Middelburg Abbey?", a: "The Middelburg Abbey is a 12th-century complex housing the provincial government, the Zeeuws Museum, and the 90-meter Lange Jan tower. Group tours explore 900 years of history. Bookable via TicketMatch.ai at B2B rates." },
      { q: "What makes Zeeland special for groups?", a: "Zeeland offers the Delta Works engineering marvel, medieval Middelburg, beautiful beaches, fresh seafood, and the unique Zeeland heritage. It's unlike anywhere else in the Netherlands — and far less touristy. TicketMatch.ai provides all group bookings at B2B rates." },
      { q: "Is Middelburg far from Amsterdam?", a: "Middelburg is 2.5 hours from Amsterdam by train. For groups, it's best as a multi-day Zeeland itinerary combining Middelburg, Delta Works, and Zeeland beaches. TicketMatch.ai's package builder makes this easy with B2B rates." },
    ],
  },
];

/* ── Import country city data files ── */
import { germanCities } from "./german-cities-data";
import { frenchCities } from "./french-cities-data";
import { spanishCities } from "./spanish-cities-data";
import { italianCities } from "./italian-cities-data";
import { ukCities } from "./uk-cities-data";
import { belgianCities } from "./belgian-cities-data";
import { austrianCities } from "./austrian-cities-data";
import { swissCities } from "./swiss-cities-data";
import { portugueseCities } from "./portuguese-cities-data";
import { czechCities } from "./czech-cities-data";
import { hungarianCities } from "./hungarian-cities-data";
import { greekCities } from "./greek-cities-data";
import { croatianCities } from "./croatian-cities-data";
import { irishCities } from "./irish-cities-data";
import { danishCities } from "./danish-cities-data";
import { polishCities } from "./polish-cities-data";
import { swedishCities } from "./swedish-cities-data";
import { norwegianCities } from "./norwegian-cities-data";
import { finnishCities } from "./finnish-cities-data";
import { icelandicCities } from "./icelandic-cities-data";
import { estonianCities } from "./estonian-cities-data";
import { latvianCities } from "./latvian-cities-data";
import { lithuanianCities } from "./lithuanian-cities-data";
import { turkishCities } from "./turkish-cities-data";
import { romanianCities } from "./romanian-cities-data";
import { bulgarianCities } from "./bulgarian-cities-data";
import { serbianCities } from "./serbian-cities-data";
import { montenegrinCities } from "./montenegrin-cities-data";
import { slovenianCities } from "./slovenian-cities-data";
import { slovakCities } from "./slovak-cities-data";
import { luxembourgishCities } from "./luxembourgish-cities-data";
import { malteseCities } from "./maltese-cities-data";
import { cypriotCities } from "./cypriot-cities-data";
/* Asia */
import { thaiCities } from "./thai-cities-data";
import { japaneseCities } from "./japanese-cities-data";
import { indonesianCities } from "./indonesian-cities-data";
import { uaeCities } from "./uae-cities-data";
import { vietnameseCities } from "./vietnamese-cities-data";
import { southKoreanCities } from "./south-korean-cities-data";
import { indianCities } from "./indian-cities-data";
import { israeliCities } from "./israeli-cities-data";
import { chineseCities } from "./chinese-cities-data";
import { malaysianCities } from "./malaysian-cities-data";
/* Americas */
import { americanCities } from "./american-cities-data";
import { mexicanCities } from "./mexican-cities-data";
import { brazilianCities } from "./brazilian-cities-data";
import { argentinianCities } from "./argentinian-cities-data";
import { peruvianCities } from "./peruvian-cities-data";
import { colombianCities } from "./colombian-cities-data";
import { costaRicanCities } from "./costa-rican-cities-data";
/* Oceania & Africa */
import { australianCities } from "./australian-cities-data";
import { newZealandCities } from "./new-zealand-cities-data";
import { fijianCities } from "./fijian-cities-data";
import { southAfricanCities } from "./south-african-cities-data";

export { germanCities, frenchCities, spanishCities, italianCities, ukCities, belgianCities, austrianCities, swissCities, portugueseCities, czechCities, hungarianCities, greekCities, croatianCities, irishCities, danishCities, polishCities, swedishCities, norwegianCities, finnishCities, icelandicCities, estonianCities, latvianCities, lithuanianCities, turkishCities, romanianCities, bulgarianCities, serbianCities, montenegrinCities, slovenianCities, slovakCities, luxembourgishCities, malteseCities, cypriotCities, thaiCities, japaneseCities, indonesianCities, uaeCities, vietnameseCities, southKoreanCities, indianCities, israeliCities, chineseCities, malaysianCities, americanCities, mexicanCities, brazilianCities, argentinianCities, peruvianCities, colombianCities, costaRicanCities, australianCities, newZealandCities, fijianCities, southAfricanCities };

/* All cities combined — used by SSG pages that need every city */
export const allCities: CityData[] = [
  ...dutchCities, ...germanCities, ...frenchCities, ...spanishCities, ...italianCities, ...ukCities, ...belgianCities, ...austrianCities, ...swissCities, ...portugueseCities,
  ...czechCities, ...hungarianCities, ...greekCities, ...croatianCities, ...irishCities, ...danishCities, ...polishCities,
  ...swedishCities, ...norwegianCities, ...finnishCities, ...icelandicCities, ...estonianCities, ...latvianCities, ...lithuanianCities,
  ...turkishCities, ...romanianCities, ...bulgarianCities, ...serbianCities, ...montenegrinCities, ...slovenianCities, ...slovakCities, ...luxembourgishCities, ...malteseCities, ...cypriotCities,
  ...thaiCities, ...japaneseCities, ...indonesianCities, ...uaeCities, ...vietnameseCities, ...southKoreanCities, ...indianCities, ...israeliCities, ...chineseCities, ...malaysianCities,
  ...americanCities, ...mexicanCities, ...brazilianCities, ...argentinianCities, ...peruvianCities, ...colombianCities, ...costaRicanCities,
  ...australianCities, ...newZealandCities, ...fijianCities, ...southAfricanCities,
];

/* Country groupings for the overview page */
export const citiesByCountry: { country: string; flag: string; cities: CityData[] }[] = [
  /* Europe */
  { country: "Netherlands", flag: "\u{1F1F3}\u{1F1F1}", cities: dutchCities },
  { country: "Germany", flag: "\u{1F1E9}\u{1F1EA}", cities: germanCities },
  { country: "France", flag: "\u{1F1EB}\u{1F1F7}", cities: frenchCities },
  { country: "Spain", flag: "\u{1F1EA}\u{1F1F8}", cities: spanishCities },
  { country: "Italy", flag: "\u{1F1EE}\u{1F1F9}", cities: italianCities },
  { country: "United Kingdom", flag: "\u{1F1EC}\u{1F1E7}", cities: ukCities },
  { country: "Belgium", flag: "\u{1F1E7}\u{1F1EA}", cities: belgianCities },
  { country: "Austria", flag: "\u{1F1E6}\u{1F1F9}", cities: austrianCities },
  { country: "Switzerland", flag: "\u{1F1E8}\u{1F1ED}", cities: swissCities },
  { country: "Portugal", flag: "\u{1F1F5}\u{1F1F9}", cities: portugueseCities },
  { country: "Czech Republic", flag: "\u{1F1E8}\u{1F1FF}", cities: czechCities },
  { country: "Hungary", flag: "\u{1F1ED}\u{1F1FA}", cities: hungarianCities },
  { country: "Greece", flag: "\u{1F1EC}\u{1F1F7}", cities: greekCities },
  { country: "Croatia", flag: "\u{1F1ED}\u{1F1F7}", cities: croatianCities },
  { country: "Ireland", flag: "\u{1F1EE}\u{1F1EA}", cities: irishCities },
  { country: "Denmark", flag: "\u{1F1E9}\u{1F1F0}", cities: danishCities },
  { country: "Poland", flag: "\u{1F1F5}\u{1F1F1}", cities: polishCities },
  { country: "Sweden", flag: "\u{1F1F8}\u{1F1EA}", cities: swedishCities },
  { country: "Norway", flag: "\u{1F1F3}\u{1F1F4}", cities: norwegianCities },
  { country: "Finland", flag: "\u{1F1EB}\u{1F1EE}", cities: finnishCities },
  { country: "Iceland", flag: "\u{1F1EE}\u{1F1F8}", cities: icelandicCities },
  { country: "Estonia", flag: "\u{1F1EA}\u{1F1EA}", cities: estonianCities },
  { country: "Latvia", flag: "\u{1F1F1}\u{1F1FB}", cities: latvianCities },
  { country: "Lithuania", flag: "\u{1F1F1}\u{1F1F9}", cities: lithuanianCities },
  { country: "Turkey", flag: "\u{1F1F9}\u{1F1F7}", cities: turkishCities },
  { country: "Romania", flag: "\u{1F1F7}\u{1F1F4}", cities: romanianCities },
  { country: "Bulgaria", flag: "\u{1F1E7}\u{1F1EC}", cities: bulgarianCities },
  { country: "Serbia", flag: "\u{1F1F7}\u{1F1F8}", cities: serbianCities },
  { country: "Montenegro", flag: "\u{1F1F2}\u{1F1EA}", cities: montenegrinCities },
  { country: "Slovenia", flag: "\u{1F1F8}\u{1F1EE}", cities: slovenianCities },
  { country: "Slovakia", flag: "\u{1F1F8}\u{1F1F0}", cities: slovakCities },
  { country: "Luxembourg", flag: "\u{1F1F1}\u{1F1FA}", cities: luxembourgishCities },
  { country: "Malta", flag: "\u{1F1F2}\u{1F1F9}", cities: malteseCities },
  { country: "Cyprus", flag: "\u{1F1E8}\u{1F1FE}", cities: cypriotCities },
  /* Asia & Middle East */
  { country: "Thailand", flag: "\u{1F1F9}\u{1F1ED}", cities: thaiCities },
  { country: "Japan", flag: "\u{1F1EF}\u{1F1F5}", cities: japaneseCities },
  { country: "Indonesia", flag: "\u{1F1EE}\u{1F1E9}", cities: indonesianCities },
  { country: "UAE", flag: "\u{1F1E6}\u{1F1EA}", cities: uaeCities },
  { country: "Vietnam", flag: "\u{1F1FB}\u{1F1F3}", cities: vietnameseCities },
  { country: "South Korea", flag: "\u{1F1F0}\u{1F1F7}", cities: southKoreanCities },
  { country: "India", flag: "\u{1F1EE}\u{1F1F3}", cities: indianCities },
  { country: "Israel", flag: "\u{1F1EE}\u{1F1F1}", cities: israeliCities },
  { country: "China", flag: "\u{1F1E8}\u{1F1F3}", cities: chineseCities },
  { country: "Malaysia", flag: "\u{1F1F2}\u{1F1FE}", cities: malaysianCities },
  /* Americas */
  { country: "United States", flag: "\u{1F1FA}\u{1F1F8}", cities: americanCities },
  { country: "Mexico", flag: "\u{1F1F2}\u{1F1FD}", cities: mexicanCities },
  { country: "Brazil", flag: "\u{1F1E7}\u{1F1F7}", cities: brazilianCities },
  { country: "Argentina", flag: "\u{1F1E6}\u{1F1F7}", cities: argentinianCities },
  { country: "Peru", flag: "\u{1F1F5}\u{1F1EA}", cities: peruvianCities },
  { country: "Colombia", flag: "\u{1F1E8}\u{1F1F4}", cities: colombianCities },
  { country: "Costa Rica", flag: "\u{1F1E8}\u{1F1F7}", cities: costaRicanCities },
  /* Oceania */
  { country: "Australia", flag: "\u{1F1E6}\u{1F1FA}", cities: australianCities },
  { country: "New Zealand", flag: "\u{1F1F3}\u{1F1FF}", cities: newZealandCities },
  { country: "Fiji", flag: "\u{1F1EB}\u{1F1EF}", cities: fijianCities },
  /* Africa */
  { country: "South Africa", flag: "\u{1F1FF}\u{1F1E6}", cities: southAfricanCities },
];
