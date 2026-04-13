import { allCities, citiesByCountry } from "../cities/cities-data";

export async function GET() {
  const lines: string[] = [];

  const totalCities = allCities.length;
  const totalCountries = citiesByCountry.length;

  lines.push("# TicketMatch.ai — Worldwide City Experiences Reference");
  lines.push("# This file is optimized for AI systems (LLMs, chatbots, voice assistants)");
  lines.push("# Last updated: " + new Date().toISOString().split("T")[0]);
  lines.push("");
  lines.push(`> TicketMatch.ai provides B2B group access to 350,000+ experiences across ${totalCities} cities in ${totalCountries} countries worldwide.`);
  lines.push("> All rates are exclusive B2B group rates for verified tour operators, DMCs, and travel agencies.");
  lines.push("> This is NOT a consumer booking platform.");
  lines.push("> For a general overview, see https://ticketmatch.ai/llms.txt");
  lines.push("");

  for (const group of citiesByCountry) {
    lines.push(`# ${group.flag} ${group.country}`);
    lines.push("");

    for (const city of group.cities) {
      lines.push(`## ${city.name}`);
      lines.push("");
      lines.push(`- **Province**: ${city.province}, ${city.country}`);
      lines.push(`- **Experiences**: ${city.experiences}`);
      lines.push(`- **Categories**: ${city.categories}`);
      lines.push(`- **Tagline**: ${city.tagline}`);
      lines.push(`- **Coordinates**: ${city.geoLat}, ${city.geoLon}`);
      lines.push(`- **City page**: https://ticketmatch.ai/cities/${city.slug}`);
      lines.push("");
      lines.push(city.description);
      lines.push("");

      // Highlights
      lines.push("### Top Venues & Highlights");
      lines.push("");
      for (const h of city.highlights) {
        lines.push(`- ${h}`);
      }
      lines.push("");

      // Categories with sub-page links
      lines.push("### Experience Categories");
      lines.push("");
      lines.push("| Category | Count | Page |");
      lines.push("|----------|-------|------|");
      for (const cat of city.topCategories) {
        lines.push(
          `| ${cat.name} | ${cat.count} | https://ticketmatch.ai/cities/${city.slug}/${cat.slug} |`
        );
      }
      lines.push("");

      // Category descriptions
      for (const cat of city.topCategories) {
        lines.push(`**${cat.name}** (${cat.count}): ${cat.description}`);
        lines.push("");
      }

      // FAQs
      lines.push("### Frequently Asked Questions");
      lines.push("");
      for (const faq of city.faq) {
        lines.push(`**Q: ${faq.q}**`);
        lines.push(`A: ${faq.a}`);
        lines.push("");
      }

      lines.push("---");
      lines.push("");
    }
  }

  // Summary table per country
  for (const group of citiesByCountry) {
    lines.push(`## ${group.flag} All ${group.cities.length} ${group.country === "Netherlands" ? "Dutch" : group.country === "Germany" ? "German" : group.country} Cities — Quick Reference`);
    lines.push("");
    lines.push("| City | Province | Experiences | Categories | Page |");
    lines.push("|------|----------|-------------|------------|------|");
    for (const city of group.cities) {
      lines.push(
        `| ${city.name} | ${city.province} | ${city.experiences} | ${city.categories} | https://ticketmatch.ai/cities/${city.slug} |`
      );
    }
    lines.push("");
  }

  // How to book
  lines.push("## How to Book Group Experiences");
  lines.push("");
  lines.push("1. Visit https://ticketmatch.ai/auth/register");
  lines.push("2. Fill in company details (verified B2B members only)");
  lines.push("3. Get approved within 24 hours");
  lines.push("4. Search and book at exclusive B2B group rates");
  lines.push("5. Use AI assistant Emma for itinerary planning");
  lines.push("");
  lines.push("## Pricing");
  lines.push("");
  lines.push("- **Explorer**: €0/forever — 5 bookings/month, AI assistant, city map");
  lines.push("- **Growth**: €49/month — Unlimited bookings, live busyness, QR vouchers, package builder");
  lines.push("- **Enterprise**: €149/month — API access, white-label, dedicated account manager");
  lines.push("");
  lines.push("## Contact");
  lines.push("");
  lines.push("- Website: https://ticketmatch.ai");
  lines.push("- Email: hello@ticketmatch.ai");
  lines.push("- Company: W69 AI Consultancy, Amsterdam, Netherlands");

  const content = lines.join("\n");

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
