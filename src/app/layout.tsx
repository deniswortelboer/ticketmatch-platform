import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import PWARegister from "@/components/PWARegister";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import CookieConsent from "@/components/CookieConsent";
import ThemeProvider from "@/components/ThemeProvider";
import FloatingEmma from "@/components/ui/FloatingEmma";
import ScrollToTop from "@/components/ui/ScrollToTop";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://ticketmatch.ai"),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "TicketMatch.ai | The B2B Ecosystem for City Experiences",
    template: "%s | TicketMatch.ai",
  },
  description:
    "The B2B ecosystem that connects tour operators, DMCs and travel agencies to museums, attractions, cruises, restaurants and experiences across Europe. AI-powered, real-time data, built to scale.",
  keywords: [
    "B2B ticketing platform",
    "tour operator software",
    "group booking platform",
    "museum tickets B2B",
    "city attractions booking",
    "DMC platform Europe",
    "travel agency software",
    "group travel management",
    "venue booking system",
    "city experience platform",
    "AI travel assistant",
    "live busyness data",
    "QR voucher system",
    "tour operator ecosystem",
    "Amsterdam group bookings",
    "Rotterdam attractions",
    "European city tours B2B",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TicketMatch",
  },
  openGraph: {
    title: "TicketMatch.ai | The B2B Ecosystem for City Experiences",
    description:
      "Connect your travel business to 300,000+ experiences across 3,000+ cities worldwide. 10 supplier APIs, AI agents, live data — one powerful B2B platform.",
    url: "https://ticketmatch.ai",
    siteName: "TicketMatch.ai",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "TicketMatch.ai — The B2B Ecosystem for City Experiences",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TicketMatch.ai | The B2B Ecosystem for City Experiences",
    description:
      "Connect your travel business to 300,000+ experiences across 3,000+ cities. AI-powered, 10 supplier APIs, built to scale.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add these when you have the codes:
    // google: "your-google-verification-code",
    // yandex: "your-yandex-verification-code",
  },
  category: "technology",
};

/* ── JSON-LD Structured Data ── */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": ["Organization", "LocalBusiness"],
      "@id": "https://ticketmatch.ai/#organization",
      name: "TicketMatch.ai",
      legalName: "W69 AI Consultancy",
      url: "https://ticketmatch.ai",
      logo: {
        "@type": "ImageObject",
        url: "https://ticketmatch.ai/icon-512.png",
        width: 512,
        height: 512,
      },
      image: "https://ticketmatch.ai/og-image.png",
      description:
        "The B2B ecosystem that connects tour operators, DMCs and travel agencies to 300,000+ experiences across 3,000+ cities worldwide. Powered by 10 supplier APIs, 8 AI agents, and real-time data. Based in Amsterdam, serving the Netherlands, Europe and beyond.",
      email: "hello@ticketmatch.ai",
      address: {
        "@type": "PostalAddress",
        streetAddress: "Amsterdam",
        addressLocality: "Amsterdam",
        addressRegion: "North Holland",
        postalCode: "1012",
        addressCountry: "NL",
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: 52.3676,
        longitude: 4.9041,
      },
      areaServed: [
        { "@type": "Country", name: "Netherlands" },
        { "@type": "Country", name: "Belgium" },
        { "@type": "Country", name: "Germany" },
        { "@type": "Country", name: "France" },
        { "@type": "Country", name: "Spain" },
        { "@type": "Country", name: "United Kingdom" },
        { "@type": "Country", name: "Italy" },
        { "@type": "Country", name: "Czech Republic" },
        { "@type": "Country", name: "Portugal" },
        { "@type": "Country", name: "Austria" },
        { "@type": "Country", name: "Hungary" },
        { "@type": "Country", name: "Denmark" },
        { "@type": "Country", name: "Sweden" },
        { "@type": "Country", name: "Ireland" },
        { "@type": "Country", name: "Greece" },
        { "@type": "Country", name: "Switzerland" },
        { "@type": "Country", name: "Poland" },
        { "@type": "Country", name: "Croatia" },
        { "@type": "City", name: "Amsterdam" },
        { "@type": "City", name: "Rotterdam" },
        { "@type": "City", name: "The Hague" },
        { "@type": "City", name: "Utrecht" },
        { "@type": "City", name: "Brussels" },
        { "@type": "City", name: "Berlin" },
        { "@type": "City", name: "Paris" },
        { "@type": "City", name: "Barcelona" },
        { "@type": "City", name: "London" },
        { "@type": "City", name: "Rome" },
        { "@type": "City", name: "Prague" },
        { "@type": "City", name: "Lisbon" },
        { "@type": "City", name: "Vienna" },
        { "@type": "City", name: "Budapest" },
      ],
      priceRange: "€0 - €149/month",
      currenciesAccepted: "EUR",
      paymentAccepted: "Credit Card, iDEAL, Bancontact, SEPA",
      foundingDate: "2024",
      numberOfEmployees: { "@type": "QuantitativeValue", value: "1-10" },
      knowsAbout: [
        "B2B ticketing",
        "group tour bookings",
        "museum tickets Europe",
        "city experience platform",
        "tour operator software",
        "DMC technology",
        "travel agency software",
        "Amsterdam attractions",
        "Rotterdam venues",
        "Brussels experiences",
        "AI travel assistant",
        "live busyness data",
        "QR voucher system",
        "group travel management",
        "European city tours B2B",
        "multi-supplier API aggregation",
      ],
      knowsLanguage: ["en", "nl", "de", "fr", "es", "it", "pt", "pl", "cs", "hu"],
      contactPoint: {
        "@type": "ContactPoint",
        email: "hello@ticketmatch.ai",
        contactType: "customer service",
        availableLanguage: ["English", "Dutch", "German", "French", "Spanish"],
      },
      sameAs: [
        "https://www.linkedin.com/company/ticketmatch-ai",
        "https://ticketmatch.ai",
      ],
      /* Additional identifiers for Knowledge Graph matching */
      identifier: {
        "@type": "PropertyValue",
        propertyID: "KVK",
        value: "W69 AI Consultancy",
      },
      /* Aggregate rating placeholder — helps AI show star ratings */
      slogan: "The B2B Ecosystem for City Experiences",
      brand: {
        "@type": "Brand",
        name: "TicketMatch.ai",
        logo: "https://ticketmatch.ai/icon-512.png",
      },
      /* Parent organization link */
      parentOrganization: {
        "@type": "Organization",
        name: "W69 AI Consultancy",
        url: "https://w69.ai",
      },
    },
    {
      "@type": "WebApplication",
      "@id": "https://ticketmatch.ai/#webapp",
      name: "TicketMatch.ai",
      url: "https://ticketmatch.ai",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      offers: [
        {
          "@type": "Offer",
          name: "Explorer",
          price: "0",
          priceCurrency: "EUR",
          description: "Free plan with 5 bookings per month, AI assistant, and city map access.",
        },
        {
          "@type": "Offer",
          name: "Growth",
          price: "49",
          priceCurrency: "EUR",
          priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
          description: "Unlimited bookings, live busyness data, QR vouchers, package builder, and more.",
        },
        {
          "@type": "Offer",
          name: "Enterprise",
          price: "149",
          priceCurrency: "EUR",
          priceSpecification: { "@type": "UnitPriceSpecification", billingDuration: "P1M" },
          description: "Everything in Growth plus unlimited team members, API access, white-label, and dedicated account manager.",
        },
      ],
      featureList: [
        "AI-powered booking assistant",
        "Live venue busyness data via Google API",
        "Interactive city map with route planner",
        "QR voucher system with digital tickets",
        "Real-time weather and best-time insights",
        "Package builder for group experiences",
        "PDF invoices and itineraries",
        "Multi-city management across Europe",
        "Telegram and WhatsApp notifications",
        "Analytics dashboard",
      ],
      screenshot: "https://ticketmatch.ai/og-image.png",
      creator: { "@id": "https://ticketmatch.ai/#organization" },
    },
    {
      "@type": "WebSite",
      "@id": "https://ticketmatch.ai/#website",
      url: "https://ticketmatch.ai",
      name: "TicketMatch.ai",
      description: "The B2B ecosystem for city experiences — 300,000+ experiences across 3,000+ cities worldwide.",
      publisher: { "@id": "https://ticketmatch.ai/#organization" },
      inLanguage: "en",
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: "https://ticketmatch.ai/cities/{search_term}",
        },
        "query-input": "required name=search_term",
      },
    },
    {
      "@type": "Service",
      "@id": "https://ticketmatch.ai/#service",
      name: "B2B Group Experience Booking",
      description: "Aggregated access to 300,000+ experiences across 3,000+ cities for tour operators, DMCs, and travel agencies. Exclusive B2B group rates, AI-powered search, live busyness data, QR vouchers, and route planning.",
      provider: { "@id": "https://ticketmatch.ai/#organization" },
      serviceType: "B2B Travel Technology Platform",
      areaServed: [
        { "@type": "City", name: "Amsterdam", containedInPlace: { "@type": "Country", name: "Netherlands" } },
        { "@type": "City", name: "Rotterdam", containedInPlace: { "@type": "Country", name: "Netherlands" } },
        { "@type": "City", name: "The Hague", containedInPlace: { "@type": "Country", name: "Netherlands" } },
        { "@type": "City", name: "Utrecht", containedInPlace: { "@type": "Country", name: "Netherlands" } },
        { "@type": "Country", name: "Netherlands" },
        { "@type": "Country", name: "Belgium" },
        { "@type": "Continent", name: "Europe" },
      ],
      audience: {
        "@type": "BusinessAudience",
        audienceType: "Tour Operators, DMCs, Travel Agencies",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "City Experiences",
        numberOfItems: "300000+",
        itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Museum & Art Group Tickets" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Tours & Sightseeing" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Canal Cruises & Boat Tours" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Attractions & Theme Parks" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Food & Drink Experiences" } },
        ],
      },
    },
    {
      "@type": "FAQPage",
      "@id": "https://ticketmatch.ai/#faq",
      mainEntity: [
        {
          "@type": "Question",
          name: "What is TicketMatch.ai?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TicketMatch.ai is a B2B ecosystem that connects tour operators, DMCs and travel agencies to museums, attractions, cruises, restaurants and experiences across Europe. It provides AI-powered tools, live busyness data, QR vouchers, and route planning in one platform.",
          },
        },
        {
          "@type": "Question",
          name: "How much does TicketMatch.ai cost?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TicketMatch offers three plans: Explorer (free forever, 5 bookings/month), Growth (€49/month, unlimited bookings + full features), and Enterprise (€149/month, API access + white-label + dedicated support). No setup fees, cancel anytime.",
          },
        },
        {
          "@type": "Question",
          name: "Which cities does TicketMatch cover?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TicketMatch covers 3,000+ cities worldwide. Primary focus is the Netherlands (18 cities including Amsterdam, Rotterdam, The Hague, Utrecht) with deep inventory, plus 14+ European capitals and thousands of global destinations.",
          },
        },
        {
          "@type": "Question",
          name: "What types of experiences are available on TicketMatch?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TicketMatch provides access to 300,000+ experiences across 13 categories including Museums & Art, Tours & Sightseeing, Attractions, Canal Cruises, Food & Drink, Outdoor Activities, Transport & Passes, Shows, Classes and more — aggregated from 10 supplier APIs.",
          },
        },
        {
          "@type": "Question",
          name: "Does TicketMatch have an AI assistant?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. TicketMatch includes AI agents powered by advanced language models. The AI assistant speaks every language, knows every venue, provides real-time busyness insights, and helps build itineraries in minutes. Different agent roles exist for operators, partners, resellers, and developers.",
          },
        },
        {
          "@type": "Question",
          name: "How does the live busyness feature work?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TicketMatch uses Google Places API and BestTime API to show real-time and predicted busyness levels for venues. This helps tour operators plan visits during quieter times, improving the experience for their groups.",
          },
        },
        {
          "@type": "Question",
          name: "Is TicketMatch.ai available for individual tourists?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. TicketMatch.ai is exclusively for B2B travel professionals — tour operators, DMCs, and travel agencies. All members are manually verified. Individual tourists should book directly through consumer platforms.",
          },
        },
        {
          "@type": "Question",
          name: "What payment methods does TicketMatch accept?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TicketMatch accepts all major cards, iDEAL, Bancontact, Apple Pay, Google Pay, Link, SEPA Direct Debit and more through Stripe. All prices are in EUR and exclusive of VAT. No setup fees, cancel anytime.",
          },
        },
        {
          "@type": "Question",
          name: "Can I try TicketMatch for free?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "Yes. The Explorer plan is completely free forever with 5 bookings per month, access to the AI assistant Emma, interactive city map, and weather data. No credit card required to get started.",
          },
        },
        {
          "@type": "Question",
          name: "How many supplier APIs does TicketMatch aggregate?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "TicketMatch aggregates inventory from 10 supplier APIs including Viator, GetYourGuide, Tiqets, Musement, and others — providing access to 300,000+ experiences across 3,000+ cities in one platform.",
          },
        },
      ],
    },
    {
      "@type": "HowTo",
      "@id": "https://ticketmatch.ai/#howto",
      name: "How to get started with TicketMatch.ai",
      description: "Three steps to smarter group bookings with TicketMatch.ai",
      step: [
        {
          "@type": "HowToStep",
          position: 1,
          name: "Request Access",
          text: "Sign up for free with your company details. We review and approve new members within 24 hours.",
        },
        {
          "@type": "HowToStep",
          position: 2,
          name: "Discover & Book",
          text: "Browse 300,000+ experiences across 3,000+ cities, check live busyness data, compare B2B rates, and book directly through the platform.",
        },
        {
          "@type": "HowToStep",
          position: 3,
          name: "Manage & Scale",
          text: "Use AI agents, route planning, QR vouchers, and analytics to manage your bookings and scale your business.",
        },
      ],
    },
    /* DefinedTermSet — helps AI understand industry-specific terms */
    {
      "@type": "DefinedTermSet",
      "@id": "https://ticketmatch.ai/#glossary",
      name: "Travel Industry B2B Glossary",
      hasDefinedTerm: [
        {
          "@type": "DefinedTerm",
          name: "DMC",
          description: "Destination Management Company — a local partner that manages group logistics, accommodation, transport, and activities in a specific destination city or country.",
          inDefinedTermSet: { "@id": "https://ticketmatch.ai/#glossary" },
        },
        {
          "@type": "DefinedTerm",
          name: "B2B",
          description: "Business-to-Business — commercial transactions between businesses, not involving individual consumers. TicketMatch.ai exclusively serves B2B travel professionals.",
          inDefinedTermSet: { "@id": "https://ticketmatch.ai/#glossary" },
        },
        {
          "@type": "DefinedTerm",
          name: "Tour Operator",
          description: "A company that organizes and sells group travel packages including transport, accommodation, and experiences for groups of travelers.",
          inDefinedTermSet: { "@id": "https://ticketmatch.ai/#glossary" },
        },
        {
          "@type": "DefinedTerm",
          name: "Group Booking",
          description: "A reservation for a group of 10 or more travelers, typically at discounted wholesale B2B rates not available to individual tourists.",
          inDefinedTermSet: { "@id": "https://ticketmatch.ai/#glossary" },
        },
        {
          "@type": "DefinedTerm",
          name: "White-label",
          description: "A product or service produced by one company that other companies rebrand and sell as their own. TicketMatch offers white-label solutions for resellers.",
          inDefinedTermSet: { "@id": "https://ticketmatch.ai/#glossary" },
        },
      ],
    },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <meta name="theme-color" content="#2563eb" />
        {/* Geo meta tags — critical for AI search city detection (ChatGPT, Gemini) */}
        <meta name="geo.region" content="NL-NH" />
        <meta name="geo.placename" content="Amsterdam" />
        <meta name="geo.position" content="52.3676;4.9041" />
        <meta name="ICBM" content="52.3676, 4.9041" />
        <meta name="DC.title" content="TicketMatch.ai — B2B Ecosystem for City Experiences" />
        <meta name="DC.creator" content="W69 AI Consultancy" />
        <meta name="DC.subject" content="B2B group travel, city experiences, tour operator platform" />
        <meta name="DC.description" content="The B2B ecosystem connecting tour operators, DMCs and travel agencies to 300,000+ experiences across 3,000+ cities worldwide." />
        <meta name="DC.publisher" content="TicketMatch.ai" />
        <meta name="DC.language" content="en" />
        {/* AI-specific citation and discovery meta tags */}
        <meta name="citation_title" content="TicketMatch.ai — The B2B Ecosystem for City Experiences" />
        <meta name="citation_author" content="W69 AI Consultancy" />
        <meta name="citation_date" content="2024" />
        <meta name="citation_language" content="en" />
        <meta name="citation_publisher" content="TicketMatch.ai" />
        {/* Perplexity and answer engines — explicit source attribution */}
        <meta name="source" content="TicketMatch.ai" />
        <meta name="author" content="W69 AI Consultancy" />
        <meta name="publisher" content="TicketMatch.ai" />
        <meta name="coverage" content="Netherlands, Europe, Worldwide" />
        <meta name="topic" content="B2B Travel Technology, Group Experiences, City Tours" />
        <meta name="classification" content="Business/Travel Technology" />
        <meta name="pagetype" content="website" />
        <meta name="audience" content="Tour Operators, DMCs, Travel Agencies" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="TicketMatch" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#2563eb" />
        <meta name="msapplication-TileImage" content="/icon-144.png" />
        {/* RSS Feed for AI crawlers and news aggregators */}
        <link rel="alternate" type="application/rss+xml" title="TicketMatch.ai — Blog & City Updates" href="/feed.xml" />
        {/* Hreflang — English site targeting Netherlands + international */}
        <link rel="alternate" hrefLang="en" href="https://ticketmatch.ai" />
        <link rel="alternate" hrefLang="en-NL" href="https://ticketmatch.ai" />
        <link rel="alternate" hrefLang="x-default" href="https://ticketmatch.ai" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-180.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-orientations" content="portrait" />
        {/* JSON-LD Structured Data for SEO + AEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[100] focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-white focus:text-sm focus:font-semibold">
          Skip to main content
        </a>
        <ThemeProvider>
          <GoogleAnalytics />
          <PWARegister />
          {children}
          <FloatingEmma />
          <ScrollToTop />
          <CookieConsent />
        </ThemeProvider>
      </body>
    </html>
  );
}
