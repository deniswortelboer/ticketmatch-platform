import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const publicPages = [
    "/",
    "/about",
    "/faq",
    "/partners",
    "/partners/tech",
    "/partners/advertise",
    "/become-reseller",
    "/developers",
    "/insights",
    "/blog",
    "/cities",
    "/llms.txt",
    "/llms-full.txt",
    "/ai.txt",
    "/feed.xml",
    "/llms-cities.txt",
    "/.well-known/ai-plugin.json",
    "/api/openapi.json",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // OpenAI crawlers
      {
        userAgent: "GPTBot",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      {
        userAgent: "ChatGPT-User",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Google AI (Gemini, AI Overviews, SGE)
      {
        userAgent: "Google-Extended",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Anthropic (Claude)
      {
        userAgent: "ClaudeBot",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Perplexity AI
      {
        userAgent: "PerplexityBot",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Microsoft / Bing AI (Copilot)
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Meta AI
      {
        userAgent: "FacebookBot",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Apple (Siri, Spotlight)
      {
        userAgent: "Applebot",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Common Crawl (training data for many AI models)
      {
        userAgent: "CCBot",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // Cohere AI
      {
        userAgent: "cohere-ai",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
      // You.com AI
      {
        userAgent: "YouBot",
        allow: publicPages,
        disallow: ["/dashboard/", "/api/", "/auth/"],
      },
    ],
    sitemap: "https://ticketmatch.ai/sitemap.xml",
  };
}
