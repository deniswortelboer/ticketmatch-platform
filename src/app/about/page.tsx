import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "About TicketMatch.ai — The B2B Ecosystem for City Experiences",
  description:
    "Meet the team behind TicketMatch.ai — the B2B ecosystem connecting tour operators to 300,000+ experiences across 3,000+ cities. Powered by 10 supplier APIs. Based in Amsterdam.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About TicketMatch.ai — The B2B Ecosystem for City Experiences",
    description:
      "Amsterdam-based platform connecting tour operators, DMCs and travel agencies to 300,000+ experiences across 3,000+ cities via 10 supplier APIs.",
  },
};

const milestones = [
  { year: "2024", icon: "💡", label: "Concept & Research", desc: "Identified the gap between tour operators and experience access across Europe. Validated the multi-supplier aggregation model." },
  { year: "2025", icon: "⚙️", label: "Platform Development", desc: "Built the AI-powered platform with 8 AI agents, live busyness data, QR vouchers, interactive city maps and command center." },
  { year: "2026", icon: "🚀", label: "Launch & Scale", desc: "Live with 300,000+ experiences across 3,000+ cities. 10 supplier APIs connected. 18 Dutch cities, 14 European capitals. Membership applications open." },
];

const values = [
  { icon: "🌍", color: "from-emerald-500 to-teal-600", title: "Global Scale, Local Depth", desc: "3,000+ cities worldwide with deep inventory starting in 18 Dutch cities. Think global, act local." },
  { icon: "🤖", color: "from-blue-500 to-indigo-600", title: "AI-First Platform", desc: "8 specialized AI agents — one per role. Emma speaks every language and knows every experience." },
  { icon: "⚡", color: "from-amber-500 to-orange-600", title: "Real-Time Everything", desc: "Live busyness, weather, availability, pricing — always up to date from 10 supplier APIs." },
  { icon: "🔐", color: "from-purple-500 to-violet-600", title: "B2B Exclusive", desc: "Membership-only platform. Manually reviewed. Exclusive rates for verified travel professionals." },
  { icon: "🎯", color: "from-cyan-500 to-blue-600", title: "One Ecosystem", desc: "Search, compare, book, and manage — all from one intelligent dashboard. No more juggling platforms." },
  { icon: "📊", color: "from-pink-500 to-rose-600", title: "Data-Driven Decisions", desc: "Analytics, busyness predictions, and AI insights help travel professionals work smarter, not harder." },
];

const faqs = [
  { q: "What is TicketMatch.ai?", a: "TicketMatch.ai is the B2B ecosystem for city experiences. It connects tour operators, DMCs, and travel agencies to museums, attractions, cruises, restaurants, and experiences across Europe — all from one AI-powered platform." },
  { q: "Who can use TicketMatch?", a: "TicketMatch is built for B2B travel professionals: tour operators, DMCs managing group logistics, travel agencies booking group experiences, and resellers who want to offer TicketMatch access via white-label." },
  { q: "How is it different from other platforms?", a: "TicketMatch is specifically built for B2B group bookings — not individual tourists. It offers AI agents, live venue busyness data, interactive city maps, QR vouchers, package builders, and analytics. It's an ecosystem, not just a booking tool." },
  { q: "How much does it cost?", a: "Three plans: Explorer (free forever, 5 bookings/month), Growth (€49/month, unlimited bookings), and Enterprise (€149/month with API access and white-label). No setup fees, cancel anytime." },
  { q: "Which cities are covered?", a: "Currently 3,000+ cities worldwide with deep inventory in 18 Dutch cities and 14 European capitals. We started in the Netherlands and are expanding globally." },
  { q: "How do I get started?", a: "Request membership at ticketmatch.ai/auth/register. We review new applications and approve them within 24 hours. Once approved, start exploring and booking immediately." },
];

const stats = [
  { value: "300K+", label: "Experiences" },
  { value: "3,000+", label: "Cities" },
  { value: "10", label: "Supplier APIs" },
  { value: "13", label: "Categories" },
  { value: "8", label: "AI Agents" },
];

/* JSON-LD */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      {/* ═══════════ HERO ═══════════ */}
      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[100px]" />
        <div className="pointer-events-none absolute -right-32 top-40 h-[400px] w-[400px] rounded-full bg-cyan-500/12 blur-[80px]" />
        <div className="pointer-events-none absolute left-1/3 top-10 h-[300px] w-[300px] rounded-full bg-amber-500/8 blur-[80px]" />
        {/* Dot grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:pt-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
            {/* Left: Text */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">About Us</span>
              </div>
              <h1 className="text-[2.25rem] font-extrabold leading-[1.1] tracking-tight md:text-[3rem]">
                The B2B Ecosystem for{" "}
                <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  City Experiences
                </span>
              </h1>
              <p className="mt-5 max-w-xl text-[15px] leading-[1.7] text-muted">
                TicketMatch.ai aggregates 300,000+ experiences from 10 supplier APIs into one
                powerful B2B platform — connecting tour operators, DMCs and travel agencies to
                every city experience worldwide.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
                >
                  Request Membership
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-[13px] font-semibold transition-colors hover:bg-surface-alt"
                >
                  View Full FAQ
                </Link>
              </div>
            </div>

            {/* Right: Animated SVG */}
            <div className="hidden lg:flex items-center justify-center">
              <svg viewBox="0 0 400 400" className="w-full max-w-[380px]" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <radialGradient id="ab-glow" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                  </radialGradient>
                  <linearGradient id="ab-ring1" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.6" />
                    <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
                  </linearGradient>
                  <linearGradient id="ab-ring2" x1="0%" y1="100%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#a78bfa" stopOpacity="0.5" />
                    <stop offset="50%" stopColor="#60a5fa" stopOpacity="0.2" />
                    <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.5" />
                  </linearGradient>
                </defs>
                {/* Background glow */}
                <circle cx="200" cy="200" r="180" fill="url(#ab-glow)" />
                {/* Outer ring */}
                <circle cx="200" cy="200" r="160" fill="none" stroke="url(#ab-ring1)" strokeWidth="1" strokeDasharray="8 6" style={{ animation: "ab-spin 30s linear infinite", transformOrigin: "200px 200px" }} />
                {/* Middle ring */}
                <circle cx="200" cy="200" r="120" fill="none" stroke="url(#ab-ring2)" strokeWidth="1" strokeDasharray="5 8" style={{ animation: "ab-spin-rev 22s linear infinite", transformOrigin: "200px 200px" }} />
                {/* Inner ring */}
                <circle cx="200" cy="200" r="75" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeOpacity="0.3" strokeDasharray="3 5" style={{ animation: "ab-spin 15s linear infinite", transformOrigin: "200px 200px" }} />

                {/* Center hub */}
                <circle cx="200" cy="200" r="38" fill="var(--color-accent)" fillOpacity="0.1" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.4" />
                <text x="200" y="195" textAnchor="middle" className="fill-foreground" fontSize="11" fontWeight="800">TM</text>
                <text x="200" y="210" textAnchor="middle" className="fill-accent" fontSize="7" fontWeight="600" letterSpacing="1">ECOSYSTEM</text>

                {/* Satellite nodes */}
                {[
                  { cx: 200, cy: 60, label: "APIs", color: "#60a5fa", icon: "🔌" },
                  { cx: 340, cy: 160, label: "AI", color: "#a78bfa", icon: "🤖" },
                  { cx: 320, cy: 310, label: "Data", color: "#06b6d4", icon: "📊" },
                  { cx: 80, cy: 310, label: "Tours", color: "#10b981", icon: "🎫" },
                  { cx: 60, cy: 160, label: "B2B", color: "#f59e0b", icon: "🏢" },
                ].map((node, i) => (
                  <g key={i} style={{ animation: `ab-breathe 4s ease-in-out ${i * 0.4}s infinite` }}>
                    <circle cx={node.cx} cy={node.cy} r="28" fill={node.color} fillOpacity="0.08" stroke={node.color} strokeWidth="1" strokeOpacity="0.4" />
                    <text x={node.cx} y={node.cy - 3} textAnchor="middle" fontSize="14">{node.icon}</text>
                    <text x={node.cx} y={node.cy + 13} textAnchor="middle" className="fill-muted" fontSize="7" fontWeight="600" letterSpacing="0.5">{node.label}</text>
                    {/* Connection line to center */}
                    <line x1={node.cx} y1={node.cy} x2="200" y2="200" stroke={node.color} strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="3 3" />
                  </g>
                ))}

                {/* Orbiting dots on outer ring */}
                {[0, 72, 144, 216, 288].map((deg, i) => (
                  <circle
                    key={`orb-${i}`}
                    cx="200" cy="40" r="3"
                    fill={["#60a5fa", "#a78bfa", "#06b6d4", "#10b981", "#f59e0b"][i]}
                    fillOpacity="0.7"
                    style={{
                      animation: "ab-spin 30s linear infinite",
                      transformOrigin: "200px 200px",
                      transform: `rotate(${deg}deg)`,
                    }}
                  />
                ))}

                {/* Pulsing particles */}
                {[
                  { cx: 150, cy: 110, color: "#60a5fa" },
                  { cx: 270, cy: 130, color: "#a78bfa" },
                  { cx: 260, cy: 260, color: "#06b6d4" },
                  { cx: 130, cy: 250, color: "#10b981" },
                ].map((p, i) => (
                  <circle
                    key={`p-${i}`}
                    cx={p.cx} cy={p.cy} r="2"
                    fill={p.color}
                    style={{ animation: `ab-pulse 2.5s ease-in-out ${i * 0.6}s infinite` }}
                  />
                ))}

                <style>{`
                  @keyframes ab-spin { to { transform: rotate(360deg) } }
                  @keyframes ab-spin-rev { to { transform: rotate(-360deg) } }
                  @keyframes ab-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.06) } }
                  @keyframes ab-pulse { 0%,100% { opacity: 0.3; r: 2 } 50% { opacity: 1; r: 4 } }
                `}</style>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ MISSION ═══════════ */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <div className="rounded-3xl bg-gradient-to-br from-accent/5 to-cyan-500/5 border border-accent/10 p-8 md:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[auto_1fr]">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10 text-3xl">
                🎯
              </div>
              <div>
                <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">Our Mission</h2>
                <p className="mt-3 text-[16px] font-medium leading-[1.7]">
                  To create a single, intelligent ecosystem where every travel professional can discover,
                  book, and manage city experiences across 3,000+ cities — powered by AI, real-time data,
                  and 10 integrated supplier APIs.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════ STATS ═══════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded-2xl bg-gradient-to-br from-gray-900 to-gray-800 p-6 text-center shadow-xl shadow-black/20 transition-transform hover:scale-[1.03]"
            >
              <p className="text-3xl font-extrabold text-white">{s.value}</p>
              <p className="mt-1 text-[12px] font-medium text-gray-400 uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ OUR STORY ═══════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1fr]">
          <div>
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">Our Story</h2>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">
              From Observation to Ecosystem
            </h3>
          </div>
          <div className="space-y-4 text-[15px] leading-[1.7] text-muted">
            <p>
              TicketMatch.ai was born from a simple observation: tour operators across Europe waste
              hours every week juggling phone calls, emails, and spreadsheets to book group experiences.
              Meanwhile, hundreds of thousands of experiences remain undiscovered because they&apos;re
              scattered across dozens of supplier platforms. There had to be a better way.
            </p>
            <p>
              Built by W69 AI Consultancy in Amsterdam, we set out to create the definitive B2B
              ecosystem for city experiences. Not just another booking tool — but a complete platform
              with 8 AI agents, live busyness data, interactive city maps, QR vouchers, a command
              center and analytics that help travel professionals work smarter.
            </p>
            <p>
              Today, TicketMatch.ai aggregates 300,000+ experiences from 10 supplier APIs across
              3,000+ cities worldwide. We started with deep inventory in 18 Dutch cities, expanded
              to 14 European capitals, and now cover destinations globally.
            </p>
          </div>
        </div>
      </section>

      {/* ═══════════ JOURNEY TIMELINE ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute right-0 top-0 h-[300px] w-[300px] rounded-full bg-purple-500/8 blur-[80px]" />
        <div className="mx-auto max-w-7xl px-6 pb-20">
          <div className="mb-10 text-center">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">Journey</h2>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">Building the Future of B2B Travel</h3>
          </div>
          <div className="mx-auto max-w-3xl">
            {milestones.map((m, i) => (
              <div key={i} className="group relative flex gap-6 pb-10 last:pb-0">
                {/* Vertical line */}
                {i < milestones.length - 1 && (
                  <div className="absolute left-[23px] top-14 bottom-0 w-px bg-gradient-to-b from-accent/30 to-accent/5" />
                )}
                {/* Year bubble */}
                <div className="relative shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-700 text-lg shadow-lg shadow-accent/20">
                    {m.icon}
                  </div>
                </div>
                {/* Content card */}
                <div className="rounded-2xl border border-card-border bg-card-bg p-5 transition-all hover:shadow-lg hover:shadow-accent/5 hover:border-accent/20 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="rounded-full bg-accent/10 px-3 py-0.5 text-[11px] font-bold text-accent">{m.year}</span>
                    <span className="text-sm font-bold">{m.label}</span>
                  </div>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{m.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ VALUES ═══════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-10 text-center">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">What Drives Us</h2>
          <h3 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">Built on Six Core Principles</h3>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <div
              key={i}
              className="group relative rounded-2xl border border-card-border bg-card-bg p-6 transition-all hover:shadow-xl hover:shadow-accent/5 hover:border-accent/20 overflow-hidden"
            >
              {/* Subtle gradient overlay */}
              <div className={`absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-gradient-to-bl ${v.color} opacity-[0.06] transition-opacity group-hover:opacity-[0.12]`} />
              <div className="relative">
                <div className="text-3xl mb-3">{v.icon}</div>
                <p className="text-sm font-bold">{v.title}</p>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 bottom-0 h-[400px] w-[400px] rounded-full bg-cyan-500/8 blur-[80px]" />
        <div className="mx-auto max-w-3xl px-6 pb-20">
          <div className="mb-10 text-center">
            <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent">FAQ</h2>
            <h3 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">Frequently Asked Questions</h3>
            <p className="mt-3 text-[15px] text-muted">Everything you need to know about TicketMatch.ai</p>
          </div>
          <div className="space-y-0 divide-y divide-border rounded-2xl border border-card-border bg-card-bg overflow-hidden">
            {faqs.map((faq, i) => (
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
          <div className="mt-5 text-center">
            <Link href="/faq" className="text-[13px] font-medium text-accent hover:underline">
              View all FAQ &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════ COMPANY INFO ═══════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="rounded-3xl border border-card-border bg-card-bg p-8 md:p-10 transition-colors">
          <h2 className="text-[12px] font-semibold uppercase tracking-[0.15em] text-accent mb-6">Company</h2>
          <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4">
            {[
              { label: "Built by", value: "W69 AI Consultancy", icon: "🏗️" },
              { label: "Location", value: "Amsterdam, Netherlands", icon: "📍" },
              { label: "Contact", value: "hello@ticketmatch.ai", icon: "📧", href: "mailto:hello@ticketmatch.ai" },
              { label: "Industry", value: "B2B Travel Technology", icon: "✈️" },
            ].map((item, i) => (
              <div key={i}>
                <div className="text-2xl mb-2">{item.icon}</div>
                <p className="text-[11px] font-semibold uppercase tracking-widest text-muted">{item.label}</p>
                {item.href ? (
                  <a href={item.href} className="mt-1 block text-sm font-semibold text-accent hover:underline">{item.value}</a>
                ) : (
                  <p className="mt-1 text-sm font-semibold">{item.value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ CTA ═══════════ */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#1a2744] to-gray-900 p-10 md:p-16 text-center shadow-2xl">
          {/* Decorative rings */}
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full border border-white/5" />
          <div className="pointer-events-none absolute -left-10 -bottom-10 h-48 w-48 rounded-full border border-white/5" />

          <h2 className="relative text-2xl font-extrabold text-white md:text-3xl">
            Ready to Join the Ecosystem?
          </h2>
          <p className="relative mt-3 text-[15px] text-gray-400 max-w-lg mx-auto">
            Access 300,000+ experiences across 3,000+ cities — membership applications are open.
          </p>
          <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Link
              href="/auth/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-gray-900 shadow-lg transition-all hover:shadow-white/20 hover:scale-[1.02]"
            >
              Request Membership
            </Link>
            <Link
              href="/become-reseller"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-semibold text-white transition-all hover:bg-white/10"
            >
              Become a Reseller
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
