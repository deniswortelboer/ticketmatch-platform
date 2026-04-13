import { posts } from "../blog/posts";
import { dutchCities } from "../cities/cities-data";

export async function GET() {
  const baseUrl = "https://ticketmatch.ai";

  const blogItems = posts
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(
      (post) => `    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${baseUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${baseUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.description}]]></description>
      <pubDate>${new Date(post.date).toUTCString()}</pubDate>
      <category>${post.category}</category>
    </item>`
    )
    .join("\n");

  const cityItems = dutchCities
    .map(
      (city) => `    <item>
      <title><![CDATA[${city.name} — ${city.experiences} B2B Group Experiences]]></title>
      <link>${baseUrl}/cities/${city.slug}</link>
      <guid isPermaLink="true">${baseUrl}/cities/${city.slug}</guid>
      <description><![CDATA[${city.description.slice(0, 200)}]]></description>
      <category>City Experiences</category>
    </item>`
    )
    .join("\n");

  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>TicketMatch.ai — B2B City Experiences</title>
    <link>${baseUrl}</link>
    <description>The B2B ecosystem for city experiences. 300,000+ experiences across 3,000+ cities for tour operators, DMCs, and travel agencies.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    <image>
      <url>${baseUrl}/icon-512.png</url>
      <title>TicketMatch.ai</title>
      <link>${baseUrl}</link>
    </image>
${blogItems}
${cityItems}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
