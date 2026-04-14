import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { allCities, dutchCities } from "../cities-data";
import cityHeroCache from "../city-hero-cache.json";

/* ── Static Params for SSG ── */
export function generateStaticParams() {
  return allCities.map((city) => ({ city: city.slug }));
}

/* ── Dynamic Metadata ── */
export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city: slug } = await params;
  const city = allCities.find((c) => c.slug === slug);
  if (!city) return {};

  const title = `${city.name} Group Experiences — B2B Tickets & Tours | TicketMatch.ai`;
  const description = `Book ${city.experiences} group experiences in ${city.name}, ${city.country}. B2B rates for tour operators, DMCs & travel agencies. Museums, tours, cruises & more. AI-powered platform.`;

  return {
    title,
    description,
    alternates: { canonical: `/cities/${city.slug}` },
    openGraph: {
      title,
      description,
      url: `https://ticketmatch.ai/cities/${city.slug}`,
      siteName: "TicketMatch.ai",
      type: "website",
      locale: "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: `${city.name} — ${city.experiences} B2B Group Experiences`,
      description,
    },
    keywords: [
      /* Primary keywords */
      `${city.name} group tickets`,
      `${city.name} B2B booking`,
      `${city.name} tour operator`,
      `${city.name} group travel`,
      `${city.name} museum tickets groups`,
      `${city.name} experiences wholesale`,
      `group tours ${city.name}`,
      `DMC ${city.name}`,
      `travel agency ${city.name}`,
      /* Category keywords */
      ...city.topCategories.map((cat) => `${cat.name.toLowerCase()} ${city.name}`),
      /* LSI / Semantic keywords — topical authority */
      `${city.name} bulk booking`,
      `${city.name} venue access`,
      `skip the line ${city.name} groups`,
      `${city.name} itinerary planner`,
      `wholesale tickets ${city.name}`,
      `${city.name} group discount`,
      `${city.name} incentive travel`,
      `corporate group ${city.name}`,
      `${city.name} sightseeing pass groups`,
      `${city.name} excursions B2B`,
    ],
    other: {
      /* Geo meta tags for AI city detection (ChatGPT, Gemini, Perplexity) */
      "geo.region": ({ Germany: "DE", France: "FR", Spain: "ES", Italy: "IT", "United Kingdom": "GB", Netherlands: "NL", Belgium: "BE", Austria: "AT", Switzerland: "CH", Portugal: "PT", "Czech Republic": "CZ", Hungary: "HU", Greece: "GR", Croatia: "HR", Ireland: "IE", Denmark: "DK", Poland: "PL", Sweden: "SE", Norway: "NO", Finland: "FI", Iceland: "IS", Estonia: "EE", Latvia: "LV", Lithuania: "LT", Turkey: "TR", Romania: "RO", Bulgaria: "BG", Serbia: "RS", Montenegro: "ME", Slovenia: "SI", Slovakia: "SK", Luxembourg: "LU", Malta: "MT", Cyprus: "CY", Thailand: "TH", Japan: "JP", Indonesia: "ID", UAE: "AE", Vietnam: "VN", "South Korea": "KR", India: "IN", Israel: "IL", China: "CN", Malaysia: "MY", "United States": "US", Mexico: "MX", Brazil: "BR", Argentina: "AR", Peru: "PE", Colombia: "CO", "Costa Rica": "CR", Australia: "AU", "New Zealand": "NZ", Fiji: "FJ", "South Africa": "ZA" } as Record<string, string>)[city.country] || "EU",
      "geo.placename": city.name,
      "geo.position": `${city.geoLat};${city.geoLon}`,
      "ICBM": `${city.geoLat}, ${city.geoLon}`,
    },
  };
}

/* ── Wikidata Entity IDs for AI entity linking ── */
const WIKIDATA_IDS: Record<string, string> = {
  amsterdam: "Q727", rotterdam: "Q34370", "den-haag": "Q36600", utrecht: "Q39297",
  eindhoven: "Q9832", groningen: "Q749", maastricht: "Q1309", haarlem: "Q9920",
  leiden: "Q43631", delft: "Q33432", arnhem: "Q1310", nijmegen: "Q47887",
  alkmaar: "Q16977", zaandam: "Q131596", gouda: "Q84125", dordrecht: "Q26421",
  hoorn: "Q43998", middelburg: "Q52101",
  /* German cities */
  berlin: "Q64", munich: "Q1726", hamburg: "Q1055", frankfurt: "Q1794",
  cologne: "Q365", dresden: "Q1731", dusseldorf: "Q1718", stuttgart: "Q1022",
  /* French cities */
  paris: "Q90", lyon: "Q456", nice: "Q33959", marseille: "Q2634",
  bordeaux: "Q1479", strasbourg: "Q6602", toulouse: "Q7880", avignon: "Q6397",
  /* Spanish cities */
  barcelona: "Q1492", madrid: "Q2807", seville: "Q8717", valencia: "Q8818",
  malaga: "Q8851", granada: "Q8810", bilbao: "Q8692", "san-sebastian": "Q10313",
  /* Italian cities */
  rome: "Q220", florence: "Q2044", venice: "Q641", milan: "Q490",
  naples: "Q2634", turin: "Q495", "cinque-terre": "Q107390", "amalfi-coast": "Q212935",
  /* UK cities */
  london: "Q84", edinburgh: "Q23436", manchester: "Q18125", liverpool: "Q24826",
  oxford: "Q34217", cambridge: "Q350", bath: "Q22889", york: "Q42462",
  /* Belgian cities */
  brussels: "Q239", bruges: "Q12994", ghent: "Q1296", antwerp: "Q12892",
  /* Austrian cities */
  vienna: "Q1741", salzburg: "Q34713", innsbruck: "Q1735", hallstatt: "Q180734",
  /* Swiss cities */
  zurich: "Q72", lucerne: "Q4191", interlaken: "Q68097", geneva: "Q71",
  /* Portuguese cities */
  lisbon: "Q597", porto: "Q36433", sintra: "Q182650", faro: "Q203191",
  /* Czech cities */
  prague: "Q1085",
  /* Hungarian cities */
  budapest: "Q1781",
  /* Greek cities */
  athens: "Q1524", santorini: "Q173432",
  /* Croatian cities */
  dubrovnik: "Q1722",
  /* Irish cities */
  dublin: "Q1761",
  /* Danish cities */
  copenhagen: "Q1748",
  /* Polish cities */
  krakow: "Q31487",
  /* Swedish cities */
  stockholm: "Q1754",
  /* Norwegian cities */
  oslo: "Q585", bergen: "Q26793",
  /* Finnish cities */
  helsinki: "Q1757",
  /* Icelandic cities */
  reykjavik: "Q1764",
  /* Estonian cities */
  tallinn: "Q1770",
  /* Latvian cities */
  riga: "Q1773",
  /* Lithuanian cities */
  vilnius: "Q216",
  /* Turkish cities */
  istanbul: "Q406",
  /* Romanian cities */
  bucharest: "Q19660",
  /* Bulgarian cities */
  sofia: "Q472",
  /* Serbian cities */
  belgrade: "Q3711",
  /* Montenegrin cities */
  kotor: "Q182582",
  /* Slovenian cities */
  ljubljana: "Q437",
  /* Slovak cities */
  bratislava: "Q1780",
  /* Luxembourgish cities */
  "luxembourg-city": "Q1842",
  /* Maltese cities */
  valletta: "Q19660",
  /* Cypriot cities */
  paphos: "Q178066",
  /* Thai cities */
  bangkok: "Q1861", phuket: "Q192142", "chiang-mai": "Q52028",
  /* Japanese cities */
  tokyo: "Q1490", kyoto: "Q34600", osaka: "Q35765",
  /* Indonesian cities */
  bali: "Q3125978",
  /* UAE cities */
  dubai: "Q612", "abu-dhabi": "Q613",
  /* Vietnamese cities */
  hanoi: "Q1858", "ho-chi-minh-city": "Q1854",
  /* South Korean cities */
  seoul: "Q8684",
  /* Indian cities */
  delhi: "Q1353", jaipur: "Q10056", mumbai: "Q1156",
  /* Israeli cities */
  jerusalem: "Q1218", "tel-aviv": "Q33935",
  /* Chinese cities */
  beijing: "Q956", shanghai: "Q8686",
  /* Malaysian cities */
  "kuala-lumpur": "Q1865",
  /* American cities */
  "new-york": "Q60",
  /* Mexican cities */
  cancun: "Q8969", "mexico-city": "Q1489",
  /* Brazilian cities */
  "rio-de-janeiro": "Q8678",
  /* Argentinian cities */
  "buenos-aires": "Q1486",
  /* Peruvian cities */
  cusco: "Q190089",
  /* Colombian cities */
  medellin: "Q48278",
  /* Costa Rican cities */
  "san-jose-cr": "Q3070",
  /* Australian cities */
  sydney: "Q3130",
  /* New Zealand cities */
  auckland: "Q37100", queenstown: "Q1357783",
  /* Fijian cities */
  fiji: "Q712",
  /* South African cities */
  "cape-town": "Q5465",
};

/* ── Wikipedia entity URLs for top attractions — AI entity disambiguation ── */
const WIKI_ENTITIES: Record<string, Record<string, string>> = {
  amsterdam: {
    "Rijksmuseum": "https://en.wikipedia.org/wiki/Rijksmuseum",
    "Van Gogh Museum": "https://en.wikipedia.org/wiki/Van_Gogh_Museum",
    "Anne Frank House": "https://en.wikipedia.org/wiki/Anne_Frank_House",
    "Heineken Experience": "https://en.wikipedia.org/wiki/Heineken_Experience",
    "A'DAM Lookout": "https://en.wikipedia.org/wiki/A%27DAM_Toren",
    "Artis Royal Zoo": "https://en.wikipedia.org/wiki/Artis",
  },
  rotterdam: {
    "Cube Houses": "https://en.wikipedia.org/wiki/Cube_house",
    "Kunsthal": "https://en.wikipedia.org/wiki/Kunsthal",
    "Erasmus Bridge": "https://en.wikipedia.org/wiki/Erasmusbrug",
    "Euromast": "https://en.wikipedia.org/wiki/Euromast",
    "SS Rotterdam": "https://en.wikipedia.org/wiki/SS_Rotterdam",
    "Markthal": "https://en.wikipedia.org/wiki/Markthal",
  },
  "den-haag": {
    "Mauritshuis": "https://en.wikipedia.org/wiki/Mauritshuis",
    "Madurodam": "https://en.wikipedia.org/wiki/Madurodam",
    "Peace Palace": "https://en.wikipedia.org/wiki/Peace_Palace",
    "Panorama Mesdag": "https://en.wikipedia.org/wiki/Panorama_Mesdag",
    "Binnenhof": "https://en.wikipedia.org/wiki/Binnenhof",
  },
  utrecht: {
    "Dom Tower": "https://en.wikipedia.org/wiki/Dom_Tower_of_Utrecht",
    "Centraal Museum": "https://en.wikipedia.org/wiki/Centraal_Museum",
    "Rietveld Schroder House": "https://en.wikipedia.org/wiki/Rietveld_Schr%C3%B6der_House",
    "Kasteel de Haar": "https://en.wikipedia.org/wiki/De_Haar_Castle",
  },
  haarlem: {
    "Teylers Museum": "https://en.wikipedia.org/wiki/Teylers_Museum",
    "Frans Hals Museum": "https://en.wikipedia.org/wiki/Frans_Hals_Museum",
    "Grote Kerk": "https://en.wikipedia.org/wiki/Grote_Kerk,_Haarlem",
  },
  maastricht: {
    "Bonnefantenmuseum": "https://en.wikipedia.org/wiki/Bonnefantenmuseum",
    "Boekhandel Dominicanen": "https://en.wikipedia.org/wiki/Boekhandel_Dominicanen",
  },
  arnhem: {
    "Kröller-Müller": "https://en.wikipedia.org/wiki/Kr%C3%B6ller-M%C3%BCller_Museum",
    "Hoge Veluwe": "https://en.wikipedia.org/wiki/Hoge_Veluwe_National_Park",
  },
  delft: {
    "Royal Delft": "https://en.wikipedia.org/wiki/Royal_Delft",
    "Vermeer Centrum": "https://en.wikipedia.org/wiki/Vermeer_Centre_Delft",
  },
  /* German cities */
  berlin: {
    "Brandenburg Gate": "https://en.wikipedia.org/wiki/Brandenburg_Gate",
    "Museum Island": "https://en.wikipedia.org/wiki/Museum_Island",
    "East Side Gallery": "https://en.wikipedia.org/wiki/East_Side_Gallery",
    "Reichstag": "https://en.wikipedia.org/wiki/Reichstag_building",
    "Checkpoint Charlie": "https://en.wikipedia.org/wiki/Checkpoint_Charlie",
    "Berlin TV Tower": "https://en.wikipedia.org/wiki/Fernsehturm_Berlin",
  },
  munich: {
    "Marienplatz": "https://en.wikipedia.org/wiki/Marienplatz",
    "Neuschwanstein Castle": "https://en.wikipedia.org/wiki/Neuschwanstein_Castle",
    "Deutsches Museum": "https://en.wikipedia.org/wiki/Deutsches_Museum",
    "Nymphenburg Palace": "https://en.wikipedia.org/wiki/Nymphenburg_Palace",
    "BMW Welt": "https://en.wikipedia.org/wiki/BMW_Welt",
    "Englischer Garten": "https://en.wikipedia.org/wiki/English_Garden,_Munich",
  },
  hamburg: {
    "Miniatur Wunderland": "https://en.wikipedia.org/wiki/Miniatur_Wunderland",
    "Elbphilharmonie": "https://en.wikipedia.org/wiki/Elbphilharmonie",
    "Speicherstadt": "https://en.wikipedia.org/wiki/Speicherstadt",
    "Reeperbahn": "https://en.wikipedia.org/wiki/Reeperbahn",
    "St. Pauli": "https://en.wikipedia.org/wiki/Hamburg-St._Pauli",
  },
  frankfurt: {
    "Römerberg": "https://en.wikipedia.org/wiki/R%C3%B6merberg",
    "Städel Museum": "https://en.wikipedia.org/wiki/St%C3%A4del",
    "Main Tower": "https://en.wikipedia.org/wiki/Main_Tower",
    "Palmengarten": "https://en.wikipedia.org/wiki/Palmengarten",
  },
  cologne: {
    "Cologne Cathedral": "https://en.wikipedia.org/wiki/Cologne_Cathedral",
    "Museum Ludwig": "https://en.wikipedia.org/wiki/Museum_Ludwig",
    "Chocolate Museum": "https://en.wikipedia.org/wiki/Chocolate_Museum_(Cologne)",
    "Old Town": "https://en.wikipedia.org/wiki/Altstadt,_Cologne",
  },
  dresden: {
    "Frauenkirche": "https://en.wikipedia.org/wiki/Dresden_Frauenkirche",
    "Zwinger": "https://en.wikipedia.org/wiki/Zwinger_(Dresden)",
    "Semperoper": "https://en.wikipedia.org/wiki/Semperoper",
    "Green Vault": "https://en.wikipedia.org/wiki/Green_Vault",
  },
  dusseldorf: {
    "Königsallee": "https://en.wikipedia.org/wiki/K%C3%B6nigsallee",
    "Altstadt": "https://en.wikipedia.org/wiki/Altstadt_(D%C3%BCsseldorf)",
    "Rhine Tower": "https://en.wikipedia.org/wiki/Rheinturm",
    "K21": "https://en.wikipedia.org/wiki/K21_Ständehaus",
  },
  stuttgart: {
    "Mercedes-Benz Museum": "https://en.wikipedia.org/wiki/Mercedes-Benz_Museum",
    "Porsche Museum": "https://en.wikipedia.org/wiki/Porsche_Museum",
    "Wilhelma": "https://en.wikipedia.org/wiki/Wilhelma",
    "Staatsgalerie": "https://en.wikipedia.org/wiki/Staatsgalerie_Stuttgart",
  },
  /* French cities */
  paris: {
    "Eiffel Tower": "https://en.wikipedia.org/wiki/Eiffel_Tower",
    "Louvre Museum": "https://en.wikipedia.org/wiki/Louvre",
    "Musée d'Orsay": "https://en.wikipedia.org/wiki/Mus%C3%A9e_d%27Orsay",
    "Palace of Versailles": "https://en.wikipedia.org/wiki/Palace_of_Versailles",
    "Arc de Triomphe": "https://en.wikipedia.org/wiki/Arc_de_Triomphe",
    "Notre-Dame": "https://en.wikipedia.org/wiki/Notre-Dame_de_Paris",
    "Sacré-Cœur": "https://en.wikipedia.org/wiki/Sacr%C3%A9-C%C5%93ur,_Paris",
    "Moulin Rouge": "https://en.wikipedia.org/wiki/Moulin_Rouge",
  },
  lyon: {
    "Basilique Notre-Dame de Fourvière": "https://en.wikipedia.org/wiki/Basilica_of_Notre-Dame_de_Fourvi%C3%A8re",
    "Musée des Confluences": "https://en.wikipedia.org/wiki/Mus%C3%A9e_des_Confluences",
    "Les Halles de Lyon": "https://en.wikipedia.org/wiki/Les_Halles_de_Lyon_Paul_Bocuse",
    "Vieux Lyon": "https://en.wikipedia.org/wiki/Vieux_Lyon",
  },
  nice: {
    "Promenade des Anglais": "https://en.wikipedia.org/wiki/Promenade_des_Anglais",
    "Musée Matisse": "https://en.wikipedia.org/wiki/Mus%C3%A9e_Matisse_(Nice)",
    "Castle Hill": "https://en.wikipedia.org/wiki/Castle_Hill,_Nice",
    "Place Masséna": "https://en.wikipedia.org/wiki/Place_Mass%C3%A9na",
  },
  marseille: {
    "Calanques National Park": "https://en.wikipedia.org/wiki/Calanques_National_Park",
    "Notre-Dame de la Garde": "https://en.wikipedia.org/wiki/Notre-Dame_de_la_Garde",
    "MuCEM": "https://en.wikipedia.org/wiki/Mus%C3%A9e_des_civilisations_de_l%27Europe_et_de_la_M%C3%A9diterran%C3%A9e",
    "Château d'If": "https://en.wikipedia.org/wiki/Ch%C3%A2teau_d%27If",
  },
  bordeaux: {
    "Cité du Vin": "https://en.wikipedia.org/wiki/La_Cit%C3%A9_du_Vin",
    "Place de la Bourse": "https://en.wikipedia.org/wiki/Place_de_la_Bourse_(Bordeaux)",
    "Saint-Émilion": "https://en.wikipedia.org/wiki/Saint-%C3%89milion",
    "Bordeaux Cathedral": "https://en.wikipedia.org/wiki/Bordeaux_Cathedral",
  },
  strasbourg: {
    "Strasbourg Cathedral": "https://en.wikipedia.org/wiki/Strasbourg_Cathedral",
    "Petite France": "https://en.wikipedia.org/wiki/Petite_France,_Strasbourg",
    "European Parliament": "https://en.wikipedia.org/wiki/European_Parliament",
    "Palais Rohan": "https://en.wikipedia.org/wiki/Palais_Rohan,_Strasbourg",
  },
  toulouse: {
    "Cité de l'Espace": "https://en.wikipedia.org/wiki/Cit%C3%A9_de_l%27espace",
    "Basilique Saint-Sernin": "https://en.wikipedia.org/wiki/Basilica_of_Saint-Sernin,_Toulouse",
    "Canal du Midi": "https://en.wikipedia.org/wiki/Canal_du_Midi",
    "Place du Capitole": "https://en.wikipedia.org/wiki/Place_du_Capitole",
  },
  avignon: {
    "Palais des Papes": "https://en.wikipedia.org/wiki/Palais_des_Papes",
    "Pont d'Avignon": "https://en.wikipedia.org/wiki/Pont_Saint-B%C3%A9n%C3%A9zet",
    "Festival d'Avignon": "https://en.wikipedia.org/wiki/Festival_d%27Avignon",
  },
  /* Spanish cities */
  barcelona: {
    "Sagrada Família": "https://en.wikipedia.org/wiki/Sagrada_Fam%C3%ADlia",
    "Park Güell": "https://en.wikipedia.org/wiki/Park_G%C3%BCell",
    "Casa Batlló": "https://en.wikipedia.org/wiki/Casa_Batll%C3%B3",
    "La Rambla": "https://en.wikipedia.org/wiki/La_Rambla,_Barcelona",
    "Camp Nou": "https://en.wikipedia.org/wiki/Camp_Nou",
    "La Boqueria": "https://en.wikipedia.org/wiki/La_Boqueria",
  },
  madrid: {
    "Prado Museum": "https://en.wikipedia.org/wiki/Museo_del_Prado",
    "Royal Palace": "https://en.wikipedia.org/wiki/Royal_Palace_of_Madrid",
    "Reina Sofía": "https://en.wikipedia.org/wiki/Museo_Nacional_Centro_de_Arte_Reina_Sof%C3%ADa",
    "Retiro Park": "https://en.wikipedia.org/wiki/Buen_Retiro_Park",
    "Plaza Mayor": "https://en.wikipedia.org/wiki/Plaza_Mayor,_Madrid",
    "Santiago Bernabéu": "https://en.wikipedia.org/wiki/Santiago_Bernab%C3%A9u_Stadium",
  },
  seville: {
    "Real Alcázar": "https://en.wikipedia.org/wiki/Alc%C3%A1zar_of_Seville",
    "Seville Cathedral": "https://en.wikipedia.org/wiki/Seville_Cathedral",
    "Plaza de España": "https://en.wikipedia.org/wiki/Plaza_de_Espa%C3%B1a,_Seville",
    "Giralda": "https://en.wikipedia.org/wiki/Giralda",
    "Metropol Parasol": "https://en.wikipedia.org/wiki/Metropol_Parasol",
  },
  valencia: {
    "City of Arts and Sciences": "https://en.wikipedia.org/wiki/City_of_Arts_and_Sciences",
    "La Lonja de la Seda": "https://en.wikipedia.org/wiki/Llotja_de_la_Seda",
    "Oceanogràfic": "https://en.wikipedia.org/wiki/Oceanogr%C3%A0fic",
    "Central Market": "https://en.wikipedia.org/wiki/Mercado_Central,_Valencia",
  },
  malaga: {
    "Picasso Museum": "https://en.wikipedia.org/wiki/Museo_Picasso_M%C3%A1laga",
    "Alcazaba": "https://en.wikipedia.org/wiki/Alcazaba_of_M%C3%A1laga",
    "Caminito del Rey": "https://en.wikipedia.org/wiki/Caminito_del_Rey",
    "Centre Pompidou Málaga": "https://en.wikipedia.org/wiki/Centre_Pompidou_M%C3%A1laga",
  },
  granada: {
    "Alhambra": "https://en.wikipedia.org/wiki/Alhambra",
    "Generalife": "https://en.wikipedia.org/wiki/Generalife",
    "Albaicín": "https://en.wikipedia.org/wiki/Albaic%C3%ADn",
    "Sacromonte": "https://en.wikipedia.org/wiki/Sacromonte",
  },
  bilbao: {
    "Guggenheim Bilbao": "https://en.wikipedia.org/wiki/Guggenheim_Museum_Bilbao",
    "San Juan de Gaztelugatxe": "https://en.wikipedia.org/wiki/San_Juan_de_Gaztelugatxe",
    "Vizcaya Bridge": "https://en.wikipedia.org/wiki/Vizcaya_Bridge",
    "Casco Viejo": "https://en.wikipedia.org/wiki/Casco_Viejo,_Bilbao",
  },
  "san-sebastian": {
    "La Concha Beach": "https://en.wikipedia.org/wiki/La_Concha",
    "Monte Igueldo": "https://en.wikipedia.org/wiki/Monte_Igueldo",
    "San Telmo Museum": "https://en.wikipedia.org/wiki/San_Telmo_Museum",
    "Kursaal": "https://en.wikipedia.org/wiki/Kursaal_(San_Sebasti%C3%A1n)",
  },
  /* Italian cities */
  rome: {
    "Colosseum": "https://en.wikipedia.org/wiki/Colosseum",
    "Vatican Museums": "https://en.wikipedia.org/wiki/Vatican_Museums",
    "Sistine Chapel": "https://en.wikipedia.org/wiki/Sistine_Chapel",
    "St. Peter's Basilica": "https://en.wikipedia.org/wiki/St._Peter%27s_Basilica",
    "Pantheon": "https://en.wikipedia.org/wiki/Pantheon,_Rome",
    "Trevi Fountain": "https://en.wikipedia.org/wiki/Trevi_Fountain",
    "Roman Forum": "https://en.wikipedia.org/wiki/Roman_Forum",
  },
  florence: {
    "Uffizi Gallery": "https://en.wikipedia.org/wiki/Uffizi",
    "David (Michelangelo)": "https://en.wikipedia.org/wiki/David_(Michelangelo)",
    "Florence Cathedral": "https://en.wikipedia.org/wiki/Florence_Cathedral",
    "Ponte Vecchio": "https://en.wikipedia.org/wiki/Ponte_Vecchio",
    "Palazzo Pitti": "https://en.wikipedia.org/wiki/Palazzo_Pitti",
    "Boboli Gardens": "https://en.wikipedia.org/wiki/Boboli_Gardens",
  },
  venice: {
    "St. Mark's Basilica": "https://en.wikipedia.org/wiki/St_Mark%27s_Basilica",
    "Doge's Palace": "https://en.wikipedia.org/wiki/Doge%27s_Palace",
    "Grand Canal": "https://en.wikipedia.org/wiki/Grand_Canal_(Venice)",
    "Rialto Bridge": "https://en.wikipedia.org/wiki/Rialto_Bridge",
    "Murano": "https://en.wikipedia.org/wiki/Murano",
    "Burano": "https://en.wikipedia.org/wiki/Burano",
  },
  milan: {
    "Milan Cathedral": "https://en.wikipedia.org/wiki/Milan_Cathedral",
    "The Last Supper": "https://en.wikipedia.org/wiki/The_Last_Supper_(Leonardo)",
    "La Scala": "https://en.wikipedia.org/wiki/La_Scala",
    "Galleria Vittorio Emanuele II": "https://en.wikipedia.org/wiki/Galleria_Vittorio_Emanuele_II",
    "Pinacoteca di Brera": "https://en.wikipedia.org/wiki/Pinacoteca_di_Brera",
  },
  naples: {
    "Pompeii": "https://en.wikipedia.org/wiki/Pompeii",
    "Mount Vesuvius": "https://en.wikipedia.org/wiki/Mount_Vesuvius",
    "Amalfi Coast": "https://en.wikipedia.org/wiki/Amalfi_Coast",
    "Naples Underground": "https://en.wikipedia.org/wiki/Napoli_Sotterranea",
    "National Archaeological Museum": "https://en.wikipedia.org/wiki/Naples_National_Archaeological_Museum",
  },
  turin: {
    "Egyptian Museum": "https://en.wikipedia.org/wiki/Museo_Egizio",
    "Mole Antonelliana": "https://en.wikipedia.org/wiki/Mole_Antonelliana",
    "Royal Palace of Turin": "https://en.wikipedia.org/wiki/Royal_Palace_of_Turin",
    "Lingotto": "https://en.wikipedia.org/wiki/Lingotto",
  },
  "cinque-terre": {
    "Vernazza": "https://en.wikipedia.org/wiki/Vernazza",
    "Manarola": "https://en.wikipedia.org/wiki/Manarola",
    "Monterosso al Mare": "https://en.wikipedia.org/wiki/Monterosso_al_Mare",
    "Riomaggiore": "https://en.wikipedia.org/wiki/Riomaggiore",
  },
  "amalfi-coast": {
    "Positano": "https://en.wikipedia.org/wiki/Positano",
    "Amalfi": "https://en.wikipedia.org/wiki/Amalfi",
    "Ravello": "https://en.wikipedia.org/wiki/Ravello",
    "Path of the Gods": "https://en.wikipedia.org/wiki/Path_of_the_Gods",
  },
  /* UK cities */
  london: {
    "Tower of London": "https://en.wikipedia.org/wiki/Tower_of_London",
    "Buckingham Palace": "https://en.wikipedia.org/wiki/Buckingham_Palace",
    "British Museum": "https://en.wikipedia.org/wiki/British_Museum",
    "Westminster Abbey": "https://en.wikipedia.org/wiki/Westminster_Abbey",
    "Tower Bridge": "https://en.wikipedia.org/wiki/Tower_Bridge",
    "London Eye": "https://en.wikipedia.org/wiki/London_Eye",
    "St Paul's Cathedral": "https://en.wikipedia.org/wiki/St_Paul%27s_Cathedral",
  },
  edinburgh: {
    "Edinburgh Castle": "https://en.wikipedia.org/wiki/Edinburgh_Castle",
    "Royal Mile": "https://en.wikipedia.org/wiki/Royal_Mile",
    "Arthur's Seat": "https://en.wikipedia.org/wiki/Arthur%27s_Seat",
    "Holyroodhouse": "https://en.wikipedia.org/wiki/Palace_of_Holyroodhouse",
    "Edinburgh Fringe": "https://en.wikipedia.org/wiki/Edinburgh_Festival_Fringe",
  },
  manchester: {
    "Old Trafford": "https://en.wikipedia.org/wiki/Old_Trafford",
    "Etihad Stadium": "https://en.wikipedia.org/wiki/Etihad_Stadium_(Manchester)",
    "John Rylands Library": "https://en.wikipedia.org/wiki/John_Rylands_Library",
    "Northern Quarter": "https://en.wikipedia.org/wiki/Northern_Quarter,_Manchester",
  },
  liverpool: {
    "The Beatles Story": "https://en.wikipedia.org/wiki/The_Beatles_Story",
    "Anfield": "https://en.wikipedia.org/wiki/Anfield",
    "Royal Albert Dock": "https://en.wikipedia.org/wiki/Royal_Albert_Dock,_Liverpool",
    "Cavern Club": "https://en.wikipedia.org/wiki/The_Cavern_Club",
    "Liverpool Cathedral": "https://en.wikipedia.org/wiki/Liverpool_Cathedral",
  },
  oxford: {
    "Bodleian Library": "https://en.wikipedia.org/wiki/Bodleian_Library",
    "Christ Church": "https://en.wikipedia.org/wiki/Christ_Church,_Oxford",
    "Radcliffe Camera": "https://en.wikipedia.org/wiki/Radcliffe_Camera",
    "Ashmolean Museum": "https://en.wikipedia.org/wiki/Ashmolean_Museum",
  },
  cambridge: {
    "King's College Chapel": "https://en.wikipedia.org/wiki/King%27s_College_Chapel,_Cambridge",
    "Trinity College": "https://en.wikipedia.org/wiki/Trinity_College,_Cambridge",
    "Fitzwilliam Museum": "https://en.wikipedia.org/wiki/Fitzwilliam_Museum",
    "The Backs": "https://en.wikipedia.org/wiki/The_Backs",
  },
  bath: {
    "Roman Baths": "https://en.wikipedia.org/wiki/Roman_Baths_(Bath)",
    "Royal Crescent": "https://en.wikipedia.org/wiki/Royal_Crescent",
    "Bath Abbey": "https://en.wikipedia.org/wiki/Bath_Abbey",
    "Pulteney Bridge": "https://en.wikipedia.org/wiki/Pulteney_Bridge",
  },
  york: {
    "York Minster": "https://en.wikipedia.org/wiki/York_Minster",
    "The Shambles": "https://en.wikipedia.org/wiki/The_Shambles",
    "JORVIK Viking Centre": "https://en.wikipedia.org/wiki/Jorvik_Viking_Centre",
    "National Railway Museum": "https://en.wikipedia.org/wiki/National_Railway_Museum",
  },
  /* Belgian cities */
  brussels: {
    "Grand-Place": "https://en.wikipedia.org/wiki/Grand-Place",
    "Atomium": "https://en.wikipedia.org/wiki/Atomium",
    "Manneken Pis": "https://en.wikipedia.org/wiki/Manneken_Pis",
    "Magritte Museum": "https://en.wikipedia.org/wiki/Magritte_Museum",
    "European Parliament": "https://en.wikipedia.org/wiki/European_Parliament",
  },
  bruges: {
    "Belfry of Bruges": "https://en.wikipedia.org/wiki/Belfry_of_Bruges",
    "Markt": "https://en.wikipedia.org/wiki/Markt_(Bruges)",
    "Basilica of the Holy Blood": "https://en.wikipedia.org/wiki/Basilica_of_the_Holy_Blood",
    "Groeningemuseum": "https://en.wikipedia.org/wiki/Groeningemuseum",
    "Minnewater": "https://en.wikipedia.org/wiki/Minnewater",
  },
  ghent: {
    "St. Bavo's Cathedral": "https://en.wikipedia.org/wiki/St_Bavo%27s_Cathedral,_Ghent",
    "Ghent Altarpiece": "https://en.wikipedia.org/wiki/Ghent_Altarpiece",
    "Gravensteen": "https://en.wikipedia.org/wiki/Gravensteen",
    "Graslei": "https://en.wikipedia.org/wiki/Graslei",
  },
  antwerp: {
    "Cathedral of Our Lady": "https://en.wikipedia.org/wiki/Cathedral_of_Our_Lady_(Antwerp)",
    "MAS": "https://en.wikipedia.org/wiki/Museum_aan_de_Stroom",
    "Rubens House": "https://en.wikipedia.org/wiki/Rubens_House",
    "Antwerp Central Station": "https://en.wikipedia.org/wiki/Antwerp-Central_railway_station",
    "Plantin-Moretus Museum": "https://en.wikipedia.org/wiki/Museum_Plantin-Moretus",
  },
  /* Austrian cities */
  vienna: {
    "Schönbrunn Palace": "https://en.wikipedia.org/wiki/Sch%C3%B6nbrunn_Palace",
    "St. Stephen's Cathedral": "https://en.wikipedia.org/wiki/St._Stephen%27s_Cathedral,_Vienna",
    "Hofburg": "https://en.wikipedia.org/wiki/Hofburg",
    "Belvedere": "https://en.wikipedia.org/wiki/Belvedere,_Vienna",
    "Vienna State Opera": "https://en.wikipedia.org/wiki/Vienna_State_Opera",
    "Kunsthistorisches Museum": "https://en.wikipedia.org/wiki/Kunsthistorisches_Museum",
    "Prater": "https://en.wikipedia.org/wiki/Prater",
  },
  salzburg: {
    "Hohensalzburg Fortress": "https://en.wikipedia.org/wiki/Hohensalzburg_Fortress",
    "Mozart's Birthplace": "https://en.wikipedia.org/wiki/Mozart%27s_birthplace",
    "Mirabell Palace": "https://en.wikipedia.org/wiki/Mirabell_Palace",
    "Hellbrunn Palace": "https://en.wikipedia.org/wiki/Hellbrunn_Palace",
    "Salzburg Cathedral": "https://en.wikipedia.org/wiki/Salzburg_Cathedral",
  },
  innsbruck: {
    "Golden Roof": "https://en.wikipedia.org/wiki/Goldenes_Dachl",
    "Nordkette": "https://en.wikipedia.org/wiki/Nordkette",
    "Bergisel": "https://en.wikipedia.org/wiki/Bergisel",
    "Swarovski Crystal Worlds": "https://en.wikipedia.org/wiki/Swarovski_Crystal_Worlds",
    "Ambras Castle": "https://en.wikipedia.org/wiki/Ambras_Castle",
  },
  hallstatt: {
    "Hallstatt": "https://en.wikipedia.org/wiki/Hallstatt",
    "Salzwelten": "https://en.wikipedia.org/wiki/Hallstatt_salt_mine",
    "Dachstein": "https://en.wikipedia.org/wiki/Dachstein_(mountain)",
    "Five Fingers": "https://en.wikipedia.org/wiki/5fingers",
  },
  /* Swiss cities */
  zurich: {
    "Lake Zurich": "https://en.wikipedia.org/wiki/Lake_Zurich",
    "Grossmünster": "https://en.wikipedia.org/wiki/Grossm%C3%BCnster",
    "Kunsthaus Zürich": "https://en.wikipedia.org/wiki/Kunsthaus_Z%C3%BCrich",
    "Bahnhofstrasse": "https://en.wikipedia.org/wiki/Bahnhofstrasse",
    "Swiss National Museum": "https://en.wikipedia.org/wiki/Swiss_National_Museum",
  },
  lucerne: {
    "Chapel Bridge": "https://en.wikipedia.org/wiki/Chapel_Bridge",
    "Lion Monument": "https://en.wikipedia.org/wiki/Lion_Monument",
    "Lake Lucerne": "https://en.wikipedia.org/wiki/Lake_Lucerne",
    "Mount Pilatus": "https://en.wikipedia.org/wiki/Mount_Pilatus",
    "Mount Rigi": "https://en.wikipedia.org/wiki/Rigi",
  },
  interlaken: {
    "Jungfraujoch": "https://en.wikipedia.org/wiki/Jungfraujoch",
    "Harder Kulm": "https://en.wikipedia.org/wiki/Harder_Kulm",
    "Lake Thun": "https://en.wikipedia.org/wiki/Lake_Thun",
    "Schilthorn": "https://en.wikipedia.org/wiki/Schilthorn",
    "Eiger": "https://en.wikipedia.org/wiki/Eiger",
  },
  geneva: {
    "Jet d'Eau": "https://en.wikipedia.org/wiki/Jet_d%27Eau",
    "Lake Geneva": "https://en.wikipedia.org/wiki/Lake_Geneva",
    "CERN": "https://en.wikipedia.org/wiki/CERN",
    "Palais des Nations": "https://en.wikipedia.org/wiki/Palace_of_Nations",
    "Patek Philippe Museum": "https://en.wikipedia.org/wiki/Patek_Philippe_Museum",
  },
  /* Portuguese cities */
  lisbon: {
    "Belém Tower": "https://en.wikipedia.org/wiki/Bel%C3%A9m_Tower",
    "Jerónimos Monastery": "https://en.wikipedia.org/wiki/Jer%C3%B3nimos_Monastery",
    "São Jorge Castle": "https://en.wikipedia.org/wiki/S%C3%A3o_Jorge_Castle",
    "Tram 28": "https://en.wikipedia.org/wiki/Tram_28",
    "Praça do Comércio": "https://en.wikipedia.org/wiki/Pra%C3%A7a_do_Com%C3%A9rcio",
  },
  porto: {
    "Livraria Lello": "https://en.wikipedia.org/wiki/Livraria_Lello",
    "Dom Luís I Bridge": "https://en.wikipedia.org/wiki/Dom_Lu%C3%ADs_I_Bridge",
    "São Bento Station": "https://en.wikipedia.org/wiki/S%C3%A3o_Bento_railway_station",
    "Ribeira": "https://en.wikipedia.org/wiki/Ribeira_Square",
    "Clérigos Tower": "https://en.wikipedia.org/wiki/Cl%C3%A9rigos_Church",
  },
  sintra: {
    "Pena Palace": "https://en.wikipedia.org/wiki/Pena_Palace",
    "Quinta da Regaleira": "https://en.wikipedia.org/wiki/Quinta_da_Regaleira",
    "Moorish Castle": "https://en.wikipedia.org/wiki/Castle_of_the_Moors",
    "Monserrate Palace": "https://en.wikipedia.org/wiki/Monserrate_Palace",
  },
  faro: {
    "Benagil Cave": "https://en.wikipedia.org/wiki/Benagil#Sea_cave",
    "Ria Formosa": "https://en.wikipedia.org/wiki/Ria_Formosa",
    "Ponta da Piedade": "https://en.wikipedia.org/wiki/Ponta_da_Piedade",
    "Cape St. Vincent": "https://en.wikipedia.org/wiki/Cape_St._Vincent",
  },
  /* Czech cities */
  prague: {
    "Prague Castle": "https://en.wikipedia.org/wiki/Prague_Castle",
    "Charles Bridge": "https://en.wikipedia.org/wiki/Charles_Bridge",
    "Old Town Square": "https://en.wikipedia.org/wiki/Old_Town_Square_(Prague)",
    "Astronomical Clock": "https://en.wikipedia.org/wiki/Prague_astronomical_clock",
    "St. Vitus Cathedral": "https://en.wikipedia.org/wiki/St._Vitus_Cathedral",
    "Jewish Quarter": "https://en.wikipedia.org/wiki/Josefov",
  },
  /* Hungarian cities */
  budapest: {
    "Buda Castle": "https://en.wikipedia.org/wiki/Buda_Castle",
    "Hungarian Parliament": "https://en.wikipedia.org/wiki/Hungarian_Parliament_Building",
    "Széchenyi Thermal Bath": "https://en.wikipedia.org/wiki/Sz%C3%A9chenyi_thermal_bath",
    "Fisherman's Bastion": "https://en.wikipedia.org/wiki/Fisherman%27s_Bastion",
    "Chain Bridge": "https://en.wikipedia.org/wiki/Sz%C3%A9chenyi_Chain_Bridge",
    "St. Stephen's Basilica": "https://en.wikipedia.org/wiki/St._Stephen%27s_Basilica",
  },
  /* Greek cities */
  athens: {
    "Acropolis": "https://en.wikipedia.org/wiki/Acropolis_of_Athens",
    "Parthenon": "https://en.wikipedia.org/wiki/Parthenon",
    "Acropolis Museum": "https://en.wikipedia.org/wiki/Acropolis_Museum",
    "Ancient Agora": "https://en.wikipedia.org/wiki/Ancient_Agora_of_Athens",
    "Temple of Poseidon": "https://en.wikipedia.org/wiki/Temple_of_Poseidon,_Sounion",
    "Monastiraki": "https://en.wikipedia.org/wiki/Monastiraki",
  },
  santorini: {
    "Oia": "https://en.wikipedia.org/wiki/Oia,_Greece",
    "Akrotiri": "https://en.wikipedia.org/wiki/Akrotiri_(prehistoric_city)",
    "Fira": "https://en.wikipedia.org/wiki/Fira",
    "Red Beach": "https://en.wikipedia.org/wiki/Red_Beach_(Santorini)",
  },
  /* Croatian cities */
  dubrovnik: {
    "Dubrovnik City Walls": "https://en.wikipedia.org/wiki/Walls_of_Dubrovnik",
    "Stradun": "https://en.wikipedia.org/wiki/Stradun_(street)",
    "Rector's Palace": "https://en.wikipedia.org/wiki/Rector%27s_Palace_(Dubrovnik)",
    "Lokrum": "https://en.wikipedia.org/wiki/Lokrum",
    "Fort Lovrijenac": "https://en.wikipedia.org/wiki/Lovrijenac",
  },
  /* Irish cities */
  dublin: {
    "Guinness Storehouse": "https://en.wikipedia.org/wiki/Guinness_Storehouse",
    "Trinity College": "https://en.wikipedia.org/wiki/Trinity_College_Dublin",
    "Book of Kells": "https://en.wikipedia.org/wiki/Book_of_Kells",
    "Temple Bar": "https://en.wikipedia.org/wiki/Temple_Bar,_Dublin",
    "Kilmainham Gaol": "https://en.wikipedia.org/wiki/Kilmainham_Gaol",
    "Dublin Castle": "https://en.wikipedia.org/wiki/Dublin_Castle",
  },
  /* Danish cities */
  copenhagen: {
    "Tivoli Gardens": "https://en.wikipedia.org/wiki/Tivoli_Gardens",
    "Nyhavn": "https://en.wikipedia.org/wiki/Nyhavn",
    "The Little Mermaid": "https://en.wikipedia.org/wiki/The_Little_Mermaid_(statue)",
    "Christiansborg Palace": "https://en.wikipedia.org/wiki/Christiansborg_Palace",
    "Rosenborg Castle": "https://en.wikipedia.org/wiki/Rosenborg_Castle",
    "Freetown Christiania": "https://en.wikipedia.org/wiki/Freetown_Christiania",
  },
  /* Polish cities */
  krakow: {
    "Main Market Square": "https://en.wikipedia.org/wiki/Main_Market_Square,_Krak%C3%B3w",
    "Wawel Castle": "https://en.wikipedia.org/wiki/Wawel_Castle",
    "Auschwitz-Birkenau": "https://en.wikipedia.org/wiki/Auschwitz_concentration_camp",
    "St. Mary's Basilica": "https://en.wikipedia.org/wiki/St._Mary%27s_Basilica,_Krak%C3%B3w",
    "Wieliczka Salt Mine": "https://en.wikipedia.org/wiki/Wieliczka_Salt_Mine",
    "Kazimierz": "https://en.wikipedia.org/wiki/Kazimierz",
  },
  /* Swedish cities */
  stockholm: {
    "Gamla Stan": "https://en.wikipedia.org/wiki/Gamla_stan",
    "Vasa Museum": "https://en.wikipedia.org/wiki/Vasa_Museum",
    "ABBA Museum": "https://en.wikipedia.org/wiki/ABBA:_The_Museum",
    "Stockholm Palace": "https://en.wikipedia.org/wiki/Stockholm_Palace",
    "Skansen": "https://en.wikipedia.org/wiki/Skansen",
    "Stockholm Archipelago": "https://en.wikipedia.org/wiki/Stockholm_archipelago",
  },
  /* Norwegian cities */
  oslo: {
    "Viking Ship Museum": "https://en.wikipedia.org/wiki/Viking_Ship_Museum_(Oslo)",
    "Oslo Opera House": "https://en.wikipedia.org/wiki/Oslo_Opera_House",
    "Vigeland Sculpture Park": "https://en.wikipedia.org/wiki/Vigeland_sculpture_park",
    "Akershus Fortress": "https://en.wikipedia.org/wiki/Akershus_Fortress",
    "Munch Museum": "https://en.wikipedia.org/wiki/Munch_Museum",
    "Holmenkollen": "https://en.wikipedia.org/wiki/Holmenkollen_ski_jump",
  },
  bergen: {
    "Bryggen": "https://en.wikipedia.org/wiki/Bryggen",
    "Fløibanen": "https://en.wikipedia.org/wiki/Fl%C3%B8ibanen",
    "Mount Fløyen": "https://en.wikipedia.org/wiki/Fl%C3%B8yen",
    "Bergen Fish Market": "https://en.wikipedia.org/wiki/Fish_Market_(Bergen)",
    "Edvard Grieg Museum": "https://en.wikipedia.org/wiki/Troldhaugen",
  },
  /* Finnish cities */
  helsinki: {
    "Helsinki Cathedral": "https://en.wikipedia.org/wiki/Helsinki_Cathedral",
    "Suomenlinna": "https://en.wikipedia.org/wiki/Suomenlinna",
    "Temppeliaukio Church": "https://en.wikipedia.org/wiki/Temppeliaukio_Church",
    "Market Square": "https://en.wikipedia.org/wiki/Market_Square,_Helsinki",
    "Sibelius Monument": "https://en.wikipedia.org/wiki/Sibelius_Monument",
  },
  /* Icelandic cities */
  reykjavik: {
    "Blue Lagoon": "https://en.wikipedia.org/wiki/Blue_Lagoon_(geothermal_spa)",
    "Hallgrímskirkja": "https://en.wikipedia.org/wiki/Hallgr%C3%ADmskirkja",
    "Þingvellir": "https://en.wikipedia.org/wiki/%C3%9Eingvellir",
    "Geysir": "https://en.wikipedia.org/wiki/Geysir",
    "Gullfoss": "https://en.wikipedia.org/wiki/Gullfoss",
    "Jökulsárlón": "https://en.wikipedia.org/wiki/J%C3%B6kuls%C3%A1rl%C3%B3n",
  },
  /* Estonian cities */
  tallinn: {
    "Tallinn Old Town": "https://en.wikipedia.org/wiki/Tallinn_Old_Town",
    "Toompea Castle": "https://en.wikipedia.org/wiki/Toompea_Castle",
    "Alexander Nevsky Cathedral": "https://en.wikipedia.org/wiki/Alexander_Nevsky_Cathedral,_Tallinn",
    "Kadriorg Palace": "https://en.wikipedia.org/wiki/Kadriorg_Palace",
    "Telliskivi": "https://en.wikipedia.org/wiki/Telliskivi_Creative_City",
  },
  /* Latvian cities */
  riga: {
    "Riga Old Town": "https://en.wikipedia.org/wiki/Old_Town_(Riga)",
    "House of Blackheads": "https://en.wikipedia.org/wiki/House_of_the_Blackheads_(Riga)",
    "Art Nouveau District": "https://en.wikipedia.org/wiki/Art_Nouveau_architecture_in_Riga",
    "Riga Central Market": "https://en.wikipedia.org/wiki/Riga_Central_Market",
    "Riga Cathedral": "https://en.wikipedia.org/wiki/Riga_Cathedral",
    "Freedom Monument": "https://en.wikipedia.org/wiki/Freedom_Monument",
  },
  /* Lithuanian cities */
  vilnius: {
    "Vilnius Old Town": "https://en.wikipedia.org/wiki/Vilnius_Old_Town",
    "Gediminas Tower": "https://en.wikipedia.org/wiki/Gediminas%27_Tower",
    "Gate of Dawn": "https://en.wikipedia.org/wiki/Gate_of_Dawn",
    "Užupis": "https://en.wikipedia.org/wiki/U%C5%BEupis",
    "Vilnius Cathedral": "https://en.wikipedia.org/wiki/Vilnius_Cathedral",
    "Trakai Castle": "https://en.wikipedia.org/wiki/Trakai_Island_Castle",
  },
  /* Turkish cities */
  istanbul: {
    "Hagia Sophia": "https://en.wikipedia.org/wiki/Hagia_Sophia",
    "Blue Mosque": "https://en.wikipedia.org/wiki/Sultan_Ahmed_Mosque",
    "Grand Bazaar": "https://en.wikipedia.org/wiki/Grand_Bazaar,_Istanbul",
    "Topkapi Palace": "https://en.wikipedia.org/wiki/Topkap%C4%B1_Palace",
    "Bosphorus": "https://en.wikipedia.org/wiki/Bosphorus",
    "Basilica Cistern": "https://en.wikipedia.org/wiki/Basilica_Cistern",
  },
  /* Romanian cities */
  bucharest: {
    "Palace of Parliament": "https://en.wikipedia.org/wiki/Palace_of_the_Parliament",
    "Romanian Athenaeum": "https://en.wikipedia.org/wiki/Romanian_Athenaeum",
    "Stavropoleos Monastery": "https://en.wikipedia.org/wiki/Stavropoleos_Monastery",
    "Village Museum": "https://en.wikipedia.org/wiki/Dimitrie_Gusti_National_Village_Museum",
    "Bran Castle": "https://en.wikipedia.org/wiki/Bran_Castle",
  },
  /* Bulgarian cities */
  sofia: {
    "Alexander Nevsky Cathedral": "https://en.wikipedia.org/wiki/Alexander_Nevsky_Cathedral,_Sofia",
    "Vitosha": "https://en.wikipedia.org/wiki/Vitosha",
    "Boyana Church": "https://en.wikipedia.org/wiki/Boyana_Church",
    "St. George Rotunda": "https://en.wikipedia.org/wiki/Church_of_St._George,_Sofia",
    "Rila Monastery": "https://en.wikipedia.org/wiki/Rila_Monastery",
  },
  /* Serbian cities */
  belgrade: {
    "Belgrade Fortress": "https://en.wikipedia.org/wiki/Belgrade_Fortress",
    "St. Sava Temple": "https://en.wikipedia.org/wiki/Church_of_Saint_Sava",
    "Skadarlija": "https://en.wikipedia.org/wiki/Skadarlija",
    "Knez Mihailova": "https://en.wikipedia.org/wiki/Knez_Mihailova_Street",
    "Ada Ciganlija": "https://en.wikipedia.org/wiki/Ada_Ciganlija",
  },
  /* Montenegrin cities */
  kotor: {
    "Kotor Old Town": "https://en.wikipedia.org/wiki/Kotor",
    "Bay of Kotor": "https://en.wikipedia.org/wiki/Bay_of_Kotor",
    "San Giovanni Fortress": "https://en.wikipedia.org/wiki/Castle_of_San_Giovanni_(Kotor)",
    "Perast": "https://en.wikipedia.org/wiki/Perast",
    "Our Lady of the Rocks": "https://en.wikipedia.org/wiki/Our_Lady_of_the_Rocks",
  },
  /* Slovenian cities */
  ljubljana: {
    "Ljubljana Castle": "https://en.wikipedia.org/wiki/Ljubljana_Castle",
    "Triple Bridge": "https://en.wikipedia.org/wiki/Triple_Bridge",
    "Dragon Bridge": "https://en.wikipedia.org/wiki/Dragon_Bridge_(Ljubljana)",
    "Lake Bled": "https://en.wikipedia.org/wiki/Lake_Bled",
    "Postojna Cave": "https://en.wikipedia.org/wiki/Postojna_Cave",
  },
  /* Slovak cities */
  bratislava: {
    "Bratislava Castle": "https://en.wikipedia.org/wiki/Bratislava_Castle",
    "St. Martin's Cathedral": "https://en.wikipedia.org/wiki/St._Martin%27s_Cathedral,_Bratislava",
    "Blue Church": "https://en.wikipedia.org/wiki/Church_of_St._Elizabeth_(Bratislava)",
    "Devín Castle": "https://en.wikipedia.org/wiki/Dev%C3%ADn_Castle",
    "UFO Bridge": "https://en.wikipedia.org/wiki/Most_SNP",
  },
  /* Luxembourgish cities */
  "luxembourg-city": {
    "Bock Casemates": "https://en.wikipedia.org/wiki/Casemates_du_Bock",
    "Grand Ducal Palace": "https://en.wikipedia.org/wiki/Grand_Ducal_Palace,_Luxembourg",
    "Chemin de la Corniche": "https://en.wikipedia.org/wiki/Chemin_de_la_Corniche",
    "Mudam": "https://en.wikipedia.org/wiki/Mus%C3%A9e_d%27Art_Moderne_Grand-Duc_Jean",
    "Vianden Castle": "https://en.wikipedia.org/wiki/Vianden_Castle",
  },
  /* Maltese cities */
  valletta: {
    "St. John's Co-Cathedral": "https://en.wikipedia.org/wiki/Saint_John%27s_Co-Cathedral",
    "Upper Barrakka Gardens": "https://en.wikipedia.org/wiki/Upper_Barrakka_Gardens",
    "Mdina": "https://en.wikipedia.org/wiki/Mdina",
    "Hypogeum": "https://en.wikipedia.org/wiki/%C4%A6al-Saflieni_Hypogeum",
    "Blue Grotto": "https://en.wikipedia.org/wiki/Blue_Grotto_(Malta)",
  },
  /* Cypriot cities */
  paphos: {
    "Paphos Archaeological Park": "https://en.wikipedia.org/wiki/Paphos_Archaeological_Park",
    "Tombs of the Kings": "https://en.wikipedia.org/wiki/Tombs_of_the_Kings_(Paphos)",
    "Aphrodite's Rock": "https://en.wikipedia.org/wiki/Petra_tou_Romiou",
    "Paphos Castle": "https://en.wikipedia.org/wiki/Paphos_Castle",
  },
  /* Thai cities */
  bangkok: {
    "Grand Palace": "https://en.wikipedia.org/wiki/Grand_Palace",
    "Wat Pho": "https://en.wikipedia.org/wiki/Wat_Pho",
    "Wat Arun": "https://en.wikipedia.org/wiki/Wat_Arun",
    "Chatuchak Market": "https://en.wikipedia.org/wiki/Chatuchak_weekend_market",
  },
  phuket: {
    "Phi Phi Islands": "https://en.wikipedia.org/wiki/Phi_Phi_Islands",
    "Phang Nga Bay": "https://en.wikipedia.org/wiki/Phang_Nga_Bay",
    "Big Buddha": "https://en.wikipedia.org/wiki/Big_Buddha_(Phuket)",
  },
  "chiang-mai": {
    "Doi Suthep": "https://en.wikipedia.org/wiki/Wat_Phra_That_Doi_Suthep",
    "Night Bazaar": "https://en.wikipedia.org/wiki/Night_Bazaar,_Chiang_Mai",
  },
  /* Japanese cities */
  tokyo: {
    "Senso-ji": "https://en.wikipedia.org/wiki/Sens%C5%8D-ji",
    "Shibuya Crossing": "https://en.wikipedia.org/wiki/Shibuya_crossing",
    "Meiji Shrine": "https://en.wikipedia.org/wiki/Meiji_Shrine",
    "Tokyo Skytree": "https://en.wikipedia.org/wiki/Tokyo_Skytree",
    "Tsukiji Market": "https://en.wikipedia.org/wiki/Tsukiji_fish_market",
  },
  kyoto: {
    "Fushimi Inari": "https://en.wikipedia.org/wiki/Fushimi_Inari-taisha",
    "Kinkaku-ji": "https://en.wikipedia.org/wiki/Kinkaku-ji",
    "Arashiyama": "https://en.wikipedia.org/wiki/Arashiyama",
    "Kiyomizu-dera": "https://en.wikipedia.org/wiki/Kiyomizu-dera",
    "Nijo Castle": "https://en.wikipedia.org/wiki/Nij%C5%8D_Castle",
  },
  osaka: {
    "Osaka Castle": "https://en.wikipedia.org/wiki/Osaka_Castle",
    "Dotonbori": "https://en.wikipedia.org/wiki/D%C5%8Dtonbori",
    "Kuromon Market": "https://en.wikipedia.org/wiki/Kuromon_Market",
  },
  /* Indonesian cities */
  bali: {
    "Uluwatu Temple": "https://en.wikipedia.org/wiki/Uluwatu_Temple",
    "Tegallalang Rice Terraces": "https://en.wikipedia.org/wiki/Tegallalang_Rice_Terrace",
    "Tanah Lot": "https://en.wikipedia.org/wiki/Tanah_Lot",
    "Sacred Monkey Forest": "https://en.wikipedia.org/wiki/Ubud_Monkey_Forest",
  },
  /* UAE cities */
  dubai: {
    "Burj Khalifa": "https://en.wikipedia.org/wiki/Burj_Khalifa",
    "Palm Jumeirah": "https://en.wikipedia.org/wiki/Palm_Jumeirah",
    "Dubai Mall": "https://en.wikipedia.org/wiki/The_Dubai_Mall",
    "Dubai Frame": "https://en.wikipedia.org/wiki/Dubai_Frame",
    "Dubai Marina": "https://en.wikipedia.org/wiki/Dubai_Marina",
  },
  "abu-dhabi": {
    "Sheikh Zayed Grand Mosque": "https://en.wikipedia.org/wiki/Sheikh_Zayed_Grand_Mosque",
    "Louvre Abu Dhabi": "https://en.wikipedia.org/wiki/Louvre_Abu_Dhabi",
    "Ferrari World": "https://en.wikipedia.org/wiki/Ferrari_World",
    "Qasr Al Watan": "https://en.wikipedia.org/wiki/Qasr_Al_Watan",
  },
  /* Vietnamese cities */
  hanoi: {
    "Ho Chi Minh Mausoleum": "https://en.wikipedia.org/wiki/Ho_Chi_Minh_Mausoleum",
    "Hoan Kiem Lake": "https://en.wikipedia.org/wiki/Ho%C3%A0n_Ki%E1%BA%BFm_Lake",
    "Temple of Literature": "https://en.wikipedia.org/wiki/Temple_of_Literature,_Hanoi",
    "Ha Long Bay": "https://en.wikipedia.org/wiki/H%E1%BA%A1_Long_Bay",
  },
  "ho-chi-minh-city": {
    "Cu Chi Tunnels": "https://en.wikipedia.org/wiki/C%E1%BB%A7_Chi_tunnels",
    "War Remnants Museum": "https://en.wikipedia.org/wiki/War_Remnants_Museum",
    "Ben Thanh Market": "https://en.wikipedia.org/wiki/B%E1%BA%BFn_Th%C3%A0nh_Market",
  },
  /* South Korean cities */
  seoul: {
    "Gyeongbokgung": "https://en.wikipedia.org/wiki/Gyeongbokgung",
    "Bukchon Hanok Village": "https://en.wikipedia.org/wiki/Bukchon_Hanok_Village",
    "N Seoul Tower": "https://en.wikipedia.org/wiki/N_Seoul_Tower",
    "DMZ": "https://en.wikipedia.org/wiki/Korean_Demilitarized_Zone",
  },
  /* Indian cities */
  delhi: {
    "Red Fort": "https://en.wikipedia.org/wiki/Red_Fort",
    "Qutub Minar": "https://en.wikipedia.org/wiki/Qutb_Minar",
    "Humayun's Tomb": "https://en.wikipedia.org/wiki/Humayun%27s_Tomb",
    "India Gate": "https://en.wikipedia.org/wiki/India_Gate",
    "Jama Masjid": "https://en.wikipedia.org/wiki/Jama_Masjid,_Delhi",
  },
  jaipur: {
    "Amber Fort": "https://en.wikipedia.org/wiki/Amber_Fort",
    "Hawa Mahal": "https://en.wikipedia.org/wiki/Hawa_Mahal",
    "City Palace": "https://en.wikipedia.org/wiki/City_Palace,_Jaipur",
    "Jantar Mantar": "https://en.wikipedia.org/wiki/Jantar_Mantar,_Jaipur",
  },
  mumbai: {
    "Gateway of India": "https://en.wikipedia.org/wiki/Gateway_of_India",
    "Elephanta Caves": "https://en.wikipedia.org/wiki/Elephanta_Caves",
    "Chhatrapati Shivaji Terminus": "https://en.wikipedia.org/wiki/Chhatrapati_Shivaji_Maharaj_Terminus",
    "Marine Drive": "https://en.wikipedia.org/wiki/Marine_Drive,_Mumbai",
  },
  /* Israeli cities */
  jerusalem: {
    "Western Wall": "https://en.wikipedia.org/wiki/Western_Wall",
    "Church of the Holy Sepulchre": "https://en.wikipedia.org/wiki/Church_of_the_Holy_Sepulchre",
    "Dome of the Rock": "https://en.wikipedia.org/wiki/Dome_of_the_Rock",
    "Yad Vashem": "https://en.wikipedia.org/wiki/Yad_Vashem",
    "Via Dolorosa": "https://en.wikipedia.org/wiki/Via_Dolorosa",
  },
  "tel-aviv": {
    "Jaffa": "https://en.wikipedia.org/wiki/Jaffa",
    "Carmel Market": "https://en.wikipedia.org/wiki/Carmel_Market",
    "White City": "https://en.wikipedia.org/wiki/White_City_(Tel_Aviv)",
  },
  /* Chinese cities */
  beijing: {
    "Great Wall of China": "https://en.wikipedia.org/wiki/Great_Wall_of_China",
    "Forbidden City": "https://en.wikipedia.org/wiki/Forbidden_City",
    "Temple of Heaven": "https://en.wikipedia.org/wiki/Temple_of_Heaven",
    "Summer Palace": "https://en.wikipedia.org/wiki/Summer_Palace",
    "Tiananmen Square": "https://en.wikipedia.org/wiki/Tiananmen_Square",
  },
  shanghai: {
    "The Bund": "https://en.wikipedia.org/wiki/The_Bund",
    "Yu Garden": "https://en.wikipedia.org/wiki/Yu_Garden",
    "Shanghai Tower": "https://en.wikipedia.org/wiki/Shanghai_Tower",
    "Jade Buddha Temple": "https://en.wikipedia.org/wiki/Jade_Buddha_Temple",
  },
  /* Malaysian cities */
  "kuala-lumpur": {
    "Petronas Twin Towers": "https://en.wikipedia.org/wiki/Petronas_Towers",
    "Batu Caves": "https://en.wikipedia.org/wiki/Batu_Caves",
    "KL Tower": "https://en.wikipedia.org/wiki/Kuala_Lumpur_Tower",
  },
  /* American cities */
  "new-york": {
    "Statue of Liberty": "https://en.wikipedia.org/wiki/Statue_of_Liberty",
    "Empire State Building": "https://en.wikipedia.org/wiki/Empire_State_Building",
    "Central Park": "https://en.wikipedia.org/wiki/Central_Park",
    "Brooklyn Bridge": "https://en.wikipedia.org/wiki/Brooklyn_Bridge",
    "Metropolitan Museum": "https://en.wikipedia.org/wiki/Metropolitan_Museum_of_Art",
  },
  /* Mexican cities */
  cancun: {
    "Chichen Itza": "https://en.wikipedia.org/wiki/Chichen_Itza",
    "Isla Mujeres": "https://en.wikipedia.org/wiki/Isla_Mujeres",
    "Xcaret": "https://en.wikipedia.org/wiki/Xcaret",
    "Tulum": "https://en.wikipedia.org/wiki/Tulum",
  },
  "mexico-city": {
    "Teotihuacán": "https://en.wikipedia.org/wiki/Teotihuacan",
    "Frida Kahlo Museum": "https://en.wikipedia.org/wiki/Frida_Kahlo_Museum",
    "Chapultepec Castle": "https://en.wikipedia.org/wiki/Chapultepec_Castle",
    "Palacio de Bellas Artes": "https://en.wikipedia.org/wiki/Palacio_de_Bellas_Artes",
    "Xochimilco": "https://en.wikipedia.org/wiki/Xochimilco",
  },
  /* Brazilian cities */
  "rio-de-janeiro": {
    "Christ the Redeemer": "https://en.wikipedia.org/wiki/Christ_the_Redeemer_(statue)",
    "Sugarloaf Mountain": "https://en.wikipedia.org/wiki/Sugarloaf_Mountain",
    "Copacabana": "https://en.wikipedia.org/wiki/Copacabana,_Rio_de_Janeiro",
    "Maracanã": "https://en.wikipedia.org/wiki/Maracan%C3%A3_Stadium",
  },
  /* Argentinian cities */
  "buenos-aires": {
    "La Boca": "https://en.wikipedia.org/wiki/La_Boca",
    "Recoleta Cemetery": "https://en.wikipedia.org/wiki/La_Recoleta_Cemetery",
    "Plaza de Mayo": "https://en.wikipedia.org/wiki/Plaza_de_Mayo",
    "Teatro Colón": "https://en.wikipedia.org/wiki/Teatro_Col%C3%B3n",
  },
  /* Peruvian cities */
  cusco: {
    "Machu Picchu": "https://en.wikipedia.org/wiki/Machu_Picchu",
    "Sacred Valley": "https://en.wikipedia.org/wiki/Sacred_Valley",
    "Sacsayhuamán": "https://en.wikipedia.org/wiki/Sacsayhuam%C3%A1n",
    "Rainbow Mountain": "https://en.wikipedia.org/wiki/Vinicunca",
  },
  /* Colombian cities */
  medellin: {
    "Comuna 13": "https://en.wikipedia.org/wiki/Comuna_13",
    "Botero Plaza": "https://en.wikipedia.org/wiki/Plaza_Botero",
    "Guatapé": "https://en.wikipedia.org/wiki/Guatap%C3%A9",
  },
  /* Costa Rican cities */
  "san-jose-cr": {
    "Arenal Volcano": "https://en.wikipedia.org/wiki/Arenal_Volcano",
    "Monteverde": "https://en.wikipedia.org/wiki/Monteverde",
    "Manuel Antonio": "https://en.wikipedia.org/wiki/Manuel_Antonio_National_Park",
  },
  /* Australian cities */
  sydney: {
    "Sydney Opera House": "https://en.wikipedia.org/wiki/Sydney_Opera_House",
    "Sydney Harbour Bridge": "https://en.wikipedia.org/wiki/Sydney_Harbour_Bridge",
    "Bondi Beach": "https://en.wikipedia.org/wiki/Bondi_Beach",
    "Blue Mountains": "https://en.wikipedia.org/wiki/Blue_Mountains_(New_South_Wales)",
  },
  /* New Zealand cities */
  auckland: {
    "Sky Tower": "https://en.wikipedia.org/wiki/Sky_Tower_(Auckland)",
    "Waiheke Island": "https://en.wikipedia.org/wiki/Waiheke_Island",
    "Hobbiton": "https://en.wikipedia.org/wiki/Hobbiton_Movie_Set",
    "Rangitoto": "https://en.wikipedia.org/wiki/Rangitoto_Island",
  },
  queenstown: {
    "Milford Sound": "https://en.wikipedia.org/wiki/Milford_Sound",
    "Skyline Gondola": "https://en.wikipedia.org/wiki/Skyline_Queenstown",
    "Lake Wakatipu": "https://en.wikipedia.org/wiki/Lake_Wakatipu",
  },
  /* Fijian cities */
  fiji: {
    "Mamanuca Islands": "https://en.wikipedia.org/wiki/Mamanuca_Islands",
    "Yasawa Islands": "https://en.wikipedia.org/wiki/Yasawa_Islands",
  },
  /* South African cities */
  "cape-town": {
    "Table Mountain": "https://en.wikipedia.org/wiki/Table_Mountain",
    "Cape of Good Hope": "https://en.wikipedia.org/wiki/Cape_of_Good_Hope",
    "Robben Island": "https://en.wikipedia.org/wiki/Robben_Island",
    "Kirstenbosch": "https://en.wikipedia.org/wiki/Kirstenbosch_National_Botanical_Garden",
    "Bo-Kaap": "https://en.wikipedia.org/wiki/Bo-Kaap",
  },
};

/* ── Icons ── */
function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* ── Page ── */
export default async function CityPage({ params }: { params: Promise<{ city: string }> }) {
  const { city: slug } = await params;
  const city = allCities.find((c) => c.slug === slug);
  if (!city) notFound();

  /* Use pre-fetched static hero image cache (no API calls needed) */
  const cacheKey = city.name.toLowerCase() === "the hague" ? "the hague" : city.slug;
  const heroImages = (cityHeroCache as Record<string, { url: string; caption: string }[]>)[cacheKey] || [];

  /* Wikidata entity ID for this city */
  const wikidataId = WIKIDATA_IDS[city.slug];

  /* JSON-LD: TouristDestination + FAQPage + WebPage + BreadcrumbList + Speakable */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "TouristDestination",
        name: city.name,
        description: city.description,
        geo: {
          "@type": "GeoCoordinates",
          latitude: city.geoLat,
          longitude: city.geoLon,
        },
        containedInPlace: {
          "@type": "AdministrativeArea",
          name: city.province,
          containedInPlace: { "@type": "Country", name: city.country },
        },
        touristType: ["Tour Operator", "DMC", "Travel Agency", "Group Travel Professional"],
        includesAttraction: city.highlights.map((h) => ({
          "@type": "TouristAttraction",
          name: h.split(" — ")[0],
          description: h,
        })),
        /* Entity linking — connects to Wikidata/Wikipedia knowledge graph */
        ...(wikidataId && {
          sameAs: [
            `https://www.wikidata.org/wiki/${wikidataId}`,
            `https://en.wikipedia.org/wiki/${encodeURIComponent(city.name)}`,
          ],
        }),
        /* Entity mentions — links highlights to real Wikipedia entities for AI disambiguation */
        ...(WIKI_ENTITIES[city.slug] && {
          mentions: Object.entries(WIKI_ENTITIES[city.slug]).map(([name, url]) => ({
            "@type": "TouristAttraction",
            name,
            sameAs: url,
          })),
        }),
      },
      {
        "@type": "FAQPage",
        mainEntity: city.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "WebPage",
        name: `${city.name} Group Experiences — TicketMatch.ai`,
        description: city.description,
        url: `https://ticketmatch.ai/cities/${city.slug}`,
        isPartOf: { "@id": "https://ticketmatch.ai/#website" },
        about: { "@type": "TouristDestination", name: city.name },
        provider: { "@id": "https://ticketmatch.ai/#organization" },
        specialty: `B2B group travel experiences in ${city.name}`,
        /* Speakable — tells AI/voice assistants which content to read aloud */
        speakable: {
          "@type": "SpeakableSpecification",
          cssSelector: ["h1", "h2", ".speakable"],
        },
      },
      /* BreadcrumbList — rich breadcrumbs in Google + AI search */
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: "https://ticketmatch.ai" },
          { "@type": "ListItem", position: 2, name: "Cities", item: "https://ticketmatch.ai/cities" },
          { "@type": "ListItem", position: 3, name: `${city.name} Group Experiences`, item: `https://ticketmatch.ai/cities/${city.slug}` },
        ],
      },
      /* ItemList — enables rich snippets for categories in Google search results */
      {
        "@type": "ItemList",
        name: `Top Experience Categories in ${city.name}`,
        description: `Browse ${city.experiences} group experiences across ${city.categories} categories in ${city.name}`,
        numberOfItems: city.topCategories.length,
        itemListElement: city.topCategories.map((cat, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: cat.name,
          url: `https://ticketmatch.ai/cities/${city.slug}/${cat.slug}`,
          description: `${cat.count} ${cat.name.toLowerCase()} experiences in ${city.name} at B2B rates`,
        })),
      },
      /* Product + AggregateOffer — shows "X experiences available" in Google search */
      {
        "@type": "Product",
        name: `${city.name} Group Experiences — B2B`,
        description: `${city.experiences} group experiences in ${city.name}, ${city.country}. Exclusive B2B rates for tour operators, DMCs and travel agencies.`,
        brand: { "@type": "Brand", name: "TicketMatch.ai" },
        offers: {
          "@type": "AggregateOffer",
          offerCount: city.experiences,
          availability: "https://schema.org/InStock",
          priceCurrency: "EUR",
          lowPrice: "0",
          eligibleCustomerType: "https://schema.org/Business",
          seller: { "@id": "https://ticketmatch.ai/#organization" },
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ═══════ HERO WITH VIATOR IMAGES ═══════ */}
      <section className="relative overflow-hidden">
        {/* Background gradient blurs */}
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />

        <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cities", href: "/cities" },
              { label: city.name },
            ]}
          />

          <div className="mt-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <span className="text-lg">{city.flag}</span>
              <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">
                {city.province}, {city.country}
              </span>
            </div>

            <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[3rem]">
              {city.name}{" "}
              <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Group Experiences
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-[14px] italic text-accent/80">
              {city.tagline}
            </p>

            <p className="speakable mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-muted">
              {city.description}
            </p>

            {/* Stats Bar */}
            <div className="mt-8 inline-flex items-center gap-6 rounded-2xl border border-card-border bg-card-bg px-8 py-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">{city.experiences}</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Experiences</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">{city.categories}</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Categories</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">B2B</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Exclusive Rates</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">AI</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Powered</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-[box-shadow,filter] hover:shadow-accent/40 hover:brightness-110"
              >
                Access {city.name} Experiences <IconArrow />
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-[13px] font-semibold transition-colors hover:bg-surface-alt"
              >
                How B2B group booking works
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ VIATOR PHOTO GRID ═══════ */}
      {heroImages.length > 0 && (
        <section className="py-8 bg-background">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {heroImages.slice(0, 6).map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-card-border shadow-sm"
                >
                  <Image
                    src={img.url}
                    alt={img.caption || `${city.name} experience ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-[10px] font-medium text-white leading-tight line-clamp-2">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CATEGORIES — Rich Cards with Links to Sub-Pages ═══════ */}
      <section className="py-16 bg-surface transition-colors">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Explore {city.name} by Category
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-[15px] text-muted">
              Browse {city.experiences} experiences across {city.categories} categories — all available at exclusive B2B rates for verified travel professionals.
            </p>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {city.topCategories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/cities/${city.slug}/${cat.slug}`}
                className="group flex flex-col rounded-2xl border border-card-border bg-card-bg p-6 transition-[box-shadow,transform,border-color] hover:shadow-xl hover:scale-[1.02] hover:border-accent/20"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-2xl">
                    {cat.icon}
                  </div>
                  <div>
                    <h3 className="text-[15px] font-bold group-hover:text-accent transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[12px] font-semibold text-accent">{cat.count} experiences</p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] leading-[1.6] text-muted line-clamp-3">
                  {cat.description}
                </p>
                <div className="mt-auto pt-4 flex items-center gap-1 text-[12px] font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                  View {cat.name} <IconArrow />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HIGHLIGHTS ═══════ */}
      <section className="py-16 bg-background transition-colors">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Top Venues & Highlights
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              Featured venues and experiences available for group bookings in {city.name} through TicketMatch.ai.
            </p>
          </div>
          <div className="mt-10 grid gap-3 sm:grid-cols-2">
            {city.highlights.map((highlight, i) => {
              const [name, desc] = highlight.split(" — ");
              return (
                <div
                  key={i}
                  className="flex items-start gap-4 rounded-2xl border border-card-border bg-card-bg p-5 transition-colors hover:border-accent/20"
                >
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <IconCheck />
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold">{name}</h3>
                    {desc && <p className="mt-1 text-[13px] text-muted leading-[1.6]">{desc}</p>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ WHY TICKETMATCH — Social proof ═══════ */}
      <section className="py-16 bg-surface transition-colors">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Why Book {city.name} with TicketMatch.ai?
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: "🤖", title: "AI-Powered Search", desc: `Ask Emma AI to find the best ${city.name} experiences for your group — in any language.` },
              { icon: "📊", title: "Live Busyness Data", desc: `Real-time venue busyness for ${city.name} venues. Plan visits during quieter times.` },
              { icon: "🎟️", title: "QR Vouchers", desc: "Digital tickets with QR codes. No paper needed. Instant group entry." },
              { icon: "🗺️", title: "Route Planner", desc: `Optimize walking routes between ${city.name} venues for your group itinerary.` },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-card-border bg-card-bg p-6 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <h3 className="text-[14px] font-bold">{item.title}</h3>
                <p className="mt-2 text-[12px] text-muted leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FAQ ═══════ */}
      <section className="py-16 bg-background transition-colors">
        <div className="mx-auto max-w-3xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Frequently Asked Questions — {city.name}
            </h2>
            <p className="mt-3 text-[15px] text-muted">
              Everything you need to know about booking group experiences in {city.name}.
            </p>
          </div>
          <div className="mt-8 space-y-0 divide-y divide-border rounded-2xl border border-card-border bg-card-bg overflow-hidden">
            {city.faq.map((f, i) => (
              <details key={i} className="group">
                <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[14px] font-semibold transition-colors hover:text-accent">
                  {f.q}
                  <svg width="18" height="18" viewBox="0 0 16 16" fill="none" className="shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true">
                    <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </summary>
                <div className="px-6 pb-5 -mt-1">
                  <p className="text-[13px] leading-[1.7] text-muted">{f.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CTA ═══════ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#1a2744] to-gray-900 p-10 md:p-14 text-center shadow-2xl">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/5" />
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-accent/10 blur-[60px]" />
            <h2 className="relative text-2xl font-extrabold text-white">
              Ready to book {city.name} for your groups?
            </h2>
            <p className="relative mt-3 text-[15px] text-gray-400">
              Join TicketMatch.ai and access {city.experiences} experiences at exclusive B2B rates. Free to start.
            </p>
            <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-gray-900 shadow-lg transition-[transform,box-shadow] hover:shadow-white/20 hover:scale-[1.02]"
              >
                Request Membership <IconArrow />
              </Link>
              <Link
                href="/cities"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Explore all Dutch cities
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ OTHER CITIES ═══════ */}
      <section className="py-16 bg-surface transition-colors">
        <div className="mx-auto max-w-5xl px-6">
          <h2 className="text-xl font-extrabold tracking-tight">
            More cities on TicketMatch.ai
          </h2>
          <div className="mt-6 flex flex-wrap gap-2">
            {allCities
              .filter((c) => c.slug !== slug)
              .map((c) => (
                <Link
                  key={c.slug}
                  href={`/cities/${c.slug}`}
                  className="rounded-full border border-border bg-card-bg px-4 py-2 text-[13px] font-medium transition-colors hover:border-accent/30 hover:text-accent"
                >
                  {c.flag} {c.name}
                  <span className="ml-1.5 text-muted text-[11px]">{c.experiences}</span>
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
