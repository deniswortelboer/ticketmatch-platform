import { allCities, citiesByCountry } from "../cities/cities-data";

export async function GET() {
  const totalCities = allCities.length;
  const totalCountries = citiesByCountry.length;

  const content = `# TicketMatch.ai

> B2B group travel platform for tour operators, DMCs, and travel agencies.

## What is TicketMatch.ai?

TicketMatch.ai is the B2B ecosystem for city experiences worldwide. It connects verified travel professionals to 350,000+ experiences across ${totalCities} cities in ${totalCountries} countries — museums, attractions, tours, cruises, food experiences, and more — all at exclusive group rates.

This is NOT a consumer platform. Only verified B2B travel professionals can access rates and make bookings.

## Who is it for?

- **Tour Operators** organizing group travel
- **DMCs** (Destination Management Companies) managing group logistics
- **Travel Agencies** booking group experiences
- **Resellers** offering white-label access to their own clients

## Key Features

- **AI Assistant (Emma)**: Multilingual AI that knows every venue, provides real-time busyness data, and builds itineraries in minutes
- **350,000+ Experiences**: Museums, attractions, tours, cruises, food & drink, outdoor activities across ${totalCities} cities
- **B2B Group Rates**: Exclusive wholesale pricing not available to consumers
- **Live Busyness Data**: Real-time and predicted venue busyness (Google Places + BestTime API)
- **QR Vouchers**: Digital vouchers for contactless venue entry
- **Package Builder**: Combine multiple experiences into group packages
- **Interactive City Maps**: Route planning with venue markers
- **API Access**: Full REST API for enterprise integrations
- **White-Label**: Offer TicketMatch under your own brand

## Coverage

${totalCountries} countries, ${totalCities} cities worldwide including:

${citiesByCountry.map((g) => `- ${g.flag} **${g.country}**: ${g.cities.map((c) => c.name).join(", ")}`).join("\n")}

## Pricing

| Plan | Price | Bookings | Key Features |
|------|-------|----------|--------------|
| Explorer | Free forever | 5/month | AI assistant, city map, weather |
| Growth | €49/month | Unlimited | + Live busyness, QR vouchers, package builder |
| Enterprise | €149/month | Unlimited | + API access, white-label, account manager |

## How to Join

1. Register at https://ticketmatch.ai/auth/register
2. Submit company details for B2B verification
3. Get approved within 24 hours
4. Start booking at exclusive B2B rates

## Links

- Website: https://ticketmatch.ai
- Cities: https://ticketmatch.ai/cities
- Pricing: https://ticketmatch.ai/dashboard/pricing
- FAQ: https://ticketmatch.ai/faq
- Full AI reference: https://ticketmatch.ai/llms-full.txt
- City-specific data: https://ticketmatch.ai/llms-cities.txt
- Contact: hello@ticketmatch.ai

## Company

W69 AI Consultancy
Amsterdam, Netherlands
https://w69.ai
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
