import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "FAQ — Frequently Asked Questions",
  description:
    "Answers to common questions about TicketMatch.ai: pricing, features, supported cities, AI agents, group bookings, and how to get started.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ — TicketMatch.ai",
    description:
      "Find answers to all your questions about the B2B ecosystem for city experiences.",
  },
};

const faqs = [
  {
    category: "General",
    icon: "🌍",
    color: "text-blue-500",
    questions: [
      {
        q: "What is TicketMatch.ai?",
        a: "TicketMatch.ai is the B2B ecosystem for city experiences. It connects tour operators, DMCs (Destination Management Companies), and travel agencies to museums, attractions, cruises, restaurants, and experiences across Europe — all from one AI-powered platform.",
      },
      {
        q: "Who is TicketMatch.ai for?",
        a: "TicketMatch.ai is built for B2B travel professionals: tour operators organizing group travel, DMCs managing group logistics, travel agencies booking group experiences, and resellers who want to offer TicketMatch access to their own clients via white-label.",
      },
      {
        q: "How is TicketMatch different from other booking platforms?",
        a: "TicketMatch is specifically built for B2B group bookings — not individual tourists. It offers AI agents that speak every language, live venue busyness data, interactive city maps with route planning, QR vouchers, package builders, and analytics. It's an ecosystem, not just a booking tool.",
      },
    ],
  },
  {
    category: "Pricing & Plans",
    icon: "💰",
    color: "text-emerald-500",
    questions: [
      {
        q: "How much does TicketMatch.ai cost?",
        a: "TicketMatch offers three plans: Explorer (free forever, 5 bookings/month), Growth (€49/month with unlimited bookings and full features), and Enterprise (€149/month with API access, white-label, and a dedicated account manager). No setup fees, no commitments, cancel anytime.",
      },
      {
        q: "Can I try TicketMatch for free?",
        a: "Yes! The Explorer plan is completely free forever. You get 5 bookings per month, access to the AI assistant, city map, and weather data. No credit card required.",
      },
      {
        q: "What payment methods do you accept?",
        a: "We accept all major cards, iDEAL, Bancontact, Apple Pay, Google Pay, Link, SEPA Direct Debit, and more through our payment provider Stripe. All prices are in EUR and exclusive of VAT.",
      },
    ],
  },
  {
    category: "Cities & Venues",
    icon: "🏙️",
    color: "text-purple-500",
    questions: [
      {
        q: "Which cities does TicketMatch cover?",
        a: "TicketMatch currently covers 3,000+ cities worldwide with deep inventory in 18 Dutch cities and 14 European capitals. We started in the Netherlands and are expanding globally.",
      },
      {
        q: "What types of venues are available?",
        a: "TicketMatch provides access to 300,000+ experiences across 13 categories: Museums, Attractions, Cruises & Tours, Restaurants, Walking Tours, Self-guided Tours, Private Tours, Day Trips, Outdoor Activities, Cultural Experiences, Food & Drink, Nightlife, and Transport.",
      },
      {
        q: "Can I see real-time venue busyness?",
        a: "Yes! Growth and Enterprise plans include live busyness data powered by Google Places API and BestTime API. You can see current and predicted busyness levels to help plan group visits during quieter times.",
      },
    ],
  },
  {
    category: "Features & Technology",
    icon: "🤖",
    color: "text-cyan-500",
    questions: [
      {
        q: "What does the AI assistant do?",
        a: "The AI assistant speaks every language, knows every venue on the platform, provides real-time busyness insights, and helps you build complete itineraries in minutes. It can answer questions about venues, suggest optimal visit times, and help with group planning.",
      },
      {
        q: "How does the QR voucher system work?",
        a: "When you make a booking through TicketMatch, digital QR vouchers are automatically generated. Your group can present these QR codes at the venue for entry — no paper tickets needed. Available on Growth and Enterprise plans.",
      },
      {
        q: "Do you have an API?",
        a: "Yes! Enterprise plan members get full API access to integrate TicketMatch directly into their own systems. We also offer white-label solutions. Visit our Technical Integration page for more details.",
      },
    ],
  },
  {
    category: "Getting Started",
    icon: "🚀",
    color: "text-amber-500",
    questions: [
      {
        q: "How do I sign up?",
        a: "Visit ticketmatch.ai/auth/register and fill in your company details. We review new applications and approve them within 24 hours. Once approved, you can immediately start exploring venues and making bookings.",
      },
      {
        q: "Why do I need to be approved?",
        a: "TicketMatch is an exclusive B2B ecosystem. We verify that all members are legitimate travel professionals to maintain quality and trust for our venue partners. This ensures everyone in the ecosystem benefits.",
      },
      {
        q: "How can I become a reseller?",
        a: "Visit ticketmatch.ai/become-reseller to apply. As a reseller, you can offer TicketMatch access to your own clients with white-label options, dedicated support, and competitive commissions.",
      },
    ],
  },
];

/* JSON-LD for FAQ page — targets Featured Snippets */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.flatMap((cat) =>
    cat.questions.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a,
      },
    }))
  ),
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">FAQ</span>
          </div>
          <h1 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight md:text-[3rem]">
            Frequently Asked{" "}
            <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
              Questions
            </span>
          </h1>
          <p className="mt-4 text-[15px] leading-[1.7] text-muted max-w-lg mx-auto">
            Everything you need to know about TicketMatch.ai — the B2B ecosystem for city experiences.
          </p>
        </div>
      </section>

      {/* ═══════════ FAQ SECTIONS ═══════════ */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="space-y-8">
          {faqs.map((category) => (
            <div key={category.category}>
              {/* Category header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{category.icon}</span>
                <h2 className={`text-lg font-bold ${category.color}`}>{category.category}</h2>
              </div>
              {/* Questions */}
              <div className="space-y-0 divide-y divide-border rounded-2xl border border-card-border bg-card-bg overflow-hidden">
                {category.questions.map((faq, i) => (
                  <details key={i} className="group">
                    <summary className="flex cursor-pointer items-center justify-between px-6 py-5 text-[14px] font-semibold transition-colors hover:text-accent">
                      {faq.q}
                      <svg
                        width="18" height="18" viewBox="0 0 16 16" fill="none"
                        className="shrink-0 text-muted transition-transform group-open:rotate-180"
                      >
                        <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </summary>
                    <div className="px-6 pb-5 -mt-1">
                      <p className="text-[13px] leading-[1.7] text-muted">{faq.a}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#1a2744] to-gray-900 p-10 md:p-14 text-center shadow-2xl">
          <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -left-8 -bottom-8 h-36 w-36 rounded-full border border-white/5" />

          <h2 className="relative text-2xl font-extrabold text-white">Still have questions?</h2>
          <p className="relative mt-3 text-[15px] text-gray-400">
            Our team is here to help. Get in touch or start exploring for free.
          </p>
          <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-gray-900 shadow-lg transition-all hover:shadow-white/20 hover:scale-[1.02]"
            >
              Get Started Free
            </Link>
            <a
              href="mailto:hello@ticketmatch.ai"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-semibold text-white transition-all hover:bg-white/10"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
