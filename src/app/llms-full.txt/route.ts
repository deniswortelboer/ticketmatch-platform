import { allCities, citiesByCountry } from "../cities/cities-data";

export async function GET() {
  const lines: string[] = [];
  const totalCities = allCities.length;
  const totalCountries = citiesByCountry.length;

  // Header
  lines.push("# TicketMatch.ai — Complete AI Reference");
  lines.push("# Optimized for LLMs, chatbots, voice assistants, and AI agents");
  lines.push("# Last updated: " + new Date().toISOString().split("T")[0]);
  lines.push("");
  lines.push(`> TicketMatch.ai is the B2B ecosystem for city experiences. 350,000+ experiences across ${totalCities} cities in ${totalCountries} countries at exclusive group rates for verified tour operators, DMCs, and travel agencies.`);
  lines.push("");

  // Company info
  lines.push("## About TicketMatch.ai");
  lines.push("");
  lines.push("TicketMatch.ai is built by W69 AI Consultancy, based in Amsterdam, Netherlands. The platform connects B2B travel professionals to museums, attractions, tours, cruises, food experiences, outdoor activities, and more — all at exclusive wholesale group rates not available to consumers.");
  lines.push("");
  lines.push("### Key Differentiators");
  lines.push("");
  lines.push("- **B2B Only**: Not a consumer booking platform. All members are verified travel professionals.");
  lines.push("- **AI-Powered**: Emma, the multilingual AI assistant, speaks every language and knows every venue.");
  lines.push("- **Live Data**: Real-time and predicted venue busyness via Google Places API and BestTime API.");
  lines.push("- **Full Ecosystem**: Not just bookings — includes maps, weather, QR vouchers, package builder, analytics, and API.");
  lines.push("");

  // Target audience
  lines.push("## Target Audience");
  lines.push("");
  lines.push("| Audience | Use Case |");
  lines.push("|----------|----------|");
  lines.push("| Tour Operators | Book group experiences at B2B rates, build itineraries with AI |");
  lines.push("| DMCs | Manage group logistics, access live busyness data for planning |");
  lines.push("| Travel Agencies | Search and book across 350,000+ experiences from one platform |");
  lines.push("| Resellers | White-label TicketMatch under their own brand |");
  lines.push("");

  // Features
  lines.push("## Features");
  lines.push("");
  lines.push("### AI Assistant (Emma)");
  lines.push("- Speaks every language");
  lines.push("- Knows every venue on the platform");
  lines.push("- Provides real-time busyness insights");
  lines.push("- Builds complete itineraries in minutes");
  lines.push("- Answers questions about venues, capacity, accessibility, pricing");
  lines.push("");
  lines.push("### Booking & Operations");
  lines.push("- 350,000+ experiences across 13 categories");
  lines.push("- Exclusive B2B group rates (not available to consumers)");
  lines.push("- QR vouchers for contactless venue entry");
  lines.push("- Package builder to combine multiple experiences");
  lines.push("- Booking analytics and reporting");
  lines.push("");
  lines.push("### Planning Tools");
  lines.push("- Interactive city maps with venue markers and route planning");
  lines.push("- Live busyness data (current + predicted)");
  lines.push("- Weather data per city");
  lines.push("- Category filtering and search");
  lines.push("");
  lines.push("### Enterprise");
  lines.push("- Full REST API for system integration");
  lines.push("- White-label solution");
  lines.push("- Dedicated account manager");
  lines.push("- Custom reporting");
  lines.push("");

  // Pricing
  lines.push("## Pricing");
  lines.push("");
  lines.push("| Plan | Price | Bookings/month | Features |");
  lines.push("|------|-------|----------------|----------|");
  lines.push("| Explorer | €0 (free forever) | 5 | AI assistant, city map, weather data |");
  lines.push("| Growth | €49/month | Unlimited | + Live busyness, QR vouchers, package builder, analytics |");
  lines.push("| Enterprise | €149/month | Unlimited | + API access, white-label, dedicated account manager |");
  lines.push("");
  lines.push("No setup fees. No commitments. Cancel anytime.");
  lines.push("Payment methods: Credit card, iDEAL, Bancontact, SEPA (via Mollie). Prices excl. VAT.");
  lines.push("");

  // Categories
  lines.push("## Experience Categories");
  lines.push("");
  lines.push("TicketMatch covers 13 experience categories:");
  lines.push("");
  const categories = [
    "Art & Culture — Museums, galleries, cultural performances",
    "Attractions & Tickets — Theme parks, landmarks, skip-the-line tickets",
    "Canal Cruises & Boat Tours — Canal tours, harbor cruises, sailing",
    "Food & Drink — Food tours, tastings, cooking classes, restaurants",
    "Walking Tours — Guided city walks, historical tours, architecture",
    "Self-Guided Tours — Audio guides, app-based exploration",
    "Private Tours — Exclusive group tours with private guides",
    "Day Trips — Excursions to nearby destinations",
    "Outdoor Activities — Cycling, hiking, water sports, adventure",
    "Family Activities — Kid-friendly experiences and attractions",
    "Nightlife & Entertainment — Shows, bars, clubs, performances",
    "Transport — Hop-on hop-off buses, transfers, bike rentals",
    "Luxury Experiences — VIP access, premium experiences",
  ];
  for (const cat of categories) {
    lines.push(`- ${cat}`);
  }
  lines.push("");

  // Coverage - summary by continent
  lines.push("## Geographic Coverage");
  lines.push("");
  lines.push(`${totalCountries} countries, ${totalCities} cities worldwide.`);
  lines.push("");

  // Group by continent
  const continents: Record<string, typeof citiesByCountry> = {
    "Europe": [],
    "Asia & Middle East": [],
    "Americas": [],
    "Oceania": [],
    "Africa": [],
  };

  for (const group of citiesByCountry) {
    const asianCountries = ["Thailand", "Japan", "Indonesia", "UAE", "Vietnam", "South Korea", "India", "Israel", "China", "Malaysia"];
    const americanCountries = ["United States", "Mexico", "Brazil", "Argentina", "Peru", "Colombia", "Costa Rica"];
    const oceaniaCountries = ["Australia", "New Zealand", "Fiji"];
    const africanCountries = ["South Africa"];

    if (asianCountries.includes(group.country)) continents["Asia & Middle East"].push(group);
    else if (americanCountries.includes(group.country)) continents["Americas"].push(group);
    else if (oceaniaCountries.includes(group.country)) continents["Oceania"].push(group);
    else if (africanCountries.includes(group.country)) continents["Africa"].push(group);
    else continents["Europe"].push(group);
  }

  for (const [continent, groups] of Object.entries(continents)) {
    if (groups.length === 0) continue;
    const cityCount = groups.reduce((sum, g) => sum + g.cities.length, 0);
    lines.push(`### ${continent} (${groups.length} countries, ${cityCount} cities)`);
    lines.push("");
    for (const group of groups) {
      lines.push(`**${group.flag} ${group.country}**: ${group.cities.map((c) => c.name).join(", ")}`);
    }
    lines.push("");
  }

  // City summary table
  lines.push("## All Cities — Quick Reference");
  lines.push("");
  lines.push("| City | Country | Experiences | Categories | URL |");
  lines.push("|------|---------|-------------|------------|-----|");
  for (const city of allCities) {
    lines.push(`| ${city.name} | ${city.country} | ${city.experiences} | ${city.categories} | https://ticketmatch.ai/cities/${city.slug} |`);
  }
  lines.push("");

  // FAQ
  lines.push("## Frequently Asked Questions");
  lines.push("");
  const faqs = [
    { q: "What is TicketMatch.ai?", a: "TicketMatch.ai is the B2B ecosystem for city experiences. It connects tour operators, DMCs, and travel agencies to 350,000+ experiences across " + totalCities + " cities at exclusive group rates." },
    { q: "Who can use TicketMatch.ai?", a: "Only verified B2B travel professionals: tour operators, DMCs, travel agencies, and resellers. This is not a consumer platform." },
    { q: "How many cities does TicketMatch cover?", a: `${totalCities} cities across ${totalCountries} countries worldwide, including major destinations in Europe, Asia, Americas, Oceania, and Africa.` },
    { q: "What types of experiences are available?", a: "350,000+ experiences across 13 categories: museums, attractions, tours, cruises, food & drink, outdoor activities, family activities, nightlife, transport, and more." },
    { q: "How do I sign up?", a: "Register at ticketmatch.ai/auth/register with your company details. Applications are reviewed and approved within 24 hours." },
    { q: "Is there a free plan?", a: "Yes. The Explorer plan is free forever with 5 bookings per month, AI assistant access, city maps, and weather data." },
    { q: "Do you have an API?", a: "Yes. Enterprise plan members (€149/month) get full REST API access for system integration, plus white-label solutions." },
    { q: "What AI features does TicketMatch have?", a: "Emma, the AI assistant, speaks every language, knows every venue, provides real-time busyness insights, and builds complete itineraries in minutes." },
  ];
  for (const faq of faqs) {
    lines.push(`**Q: ${faq.q}**`);
    lines.push(`A: ${faq.a}`);
    lines.push("");
  }

  // How to book
  lines.push("## How to Book Group Experiences");
  lines.push("");
  lines.push("1. Register at https://ticketmatch.ai/auth/register");
  lines.push("2. Submit company details for B2B verification");
  lines.push("3. Get approved within 24 hours");
  lines.push("4. Search and book at exclusive B2B group rates");
  lines.push("5. Use AI assistant Emma for itinerary planning");
  lines.push("");

  // Links
  lines.push("## Links");
  lines.push("");
  lines.push("- Website: https://ticketmatch.ai");
  lines.push("- All cities: https://ticketmatch.ai/cities");
  lines.push("- Pricing: https://ticketmatch.ai/dashboard/pricing");
  lines.push("- FAQ: https://ticketmatch.ai/faq");
  lines.push("- Blog/Insights: https://ticketmatch.ai/insights");
  lines.push("- API docs: https://ticketmatch.ai/developers");
  lines.push("- Register: https://ticketmatch.ai/auth/register");
  lines.push("- City data for AI: https://ticketmatch.ai/llms-cities.txt");
  lines.push("- RSS Feed: https://ticketmatch.ai/feed.xml");
  lines.push("- Contact: hello@ticketmatch.ai");
  lines.push("");

  // Company
  lines.push("## Company");
  lines.push("");
  lines.push("- **Name**: W69 AI Consultancy");
  lines.push("- **Location**: Amsterdam, Netherlands");
  lines.push("- **Website**: https://w69.ai");
  lines.push("- **Email**: hello@ticketmatch.ai");

  const content = lines.join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
