import Link from "next/link";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import TrendingTicker from "@/components/ui/TrendingTicker";
import NewsletterSignup from "@/components/ui/NewsletterSignup";
import { posts } from "./posts";

export const metadata: Metadata = {
  title: "Insights — B2B Travel Intelligence | TicketMatch.ai",
  description:
    "Industry insights, market trends, and data-driven intelligence for tour operators, DMCs, and travel agencies. Powered by TicketMatch.ai — 300,000+ experiences across 3,000+ cities.",
  alternates: { canonical: "/insights" },
  openGraph: {
    title: "Insights — TicketMatch.ai",
    description: "Industry insights, market trends, and data-driven intelligence for B2B travel professionals.",
  },
};

const categoryColors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  Industry:   { bg: "bg-blue-500/10 dark:bg-blue-500/20",   text: "text-blue-600 dark:text-blue-400",   border: "border-l-blue-500",   gradient: "from-blue-500 to-blue-700" },
  Amsterdam:  { bg: "bg-orange-500/10 dark:bg-orange-500/20", text: "text-orange-600 dark:text-orange-400", border: "border-l-orange-500", gradient: "from-orange-500 to-red-600" },
  Technology: { bg: "bg-purple-500/10 dark:bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", border: "border-l-purple-500", gradient: "from-purple-500 to-violet-700" },
  Guide:      { bg: "bg-emerald-500/10 dark:bg-emerald-500/20", text: "text-emerald-600 dark:text-emerald-400", border: "border-l-emerald-500", gradient: "from-emerald-500 to-teal-700" },
  Data:       { bg: "bg-cyan-500/10 dark:bg-cyan-500/20",   text: "text-cyan-600 dark:text-cyan-400",   border: "border-l-cyan-500",   gradient: "from-cyan-500 to-blue-600" },
  Trends:     { bg: "bg-pink-500/10 dark:bg-pink-500/20",   text: "text-pink-600 dark:text-pink-400",   border: "border-l-pink-500",   gradient: "from-pink-500 to-rose-700" },
};

const defaultCat = { bg: "bg-surface-alt", text: "text-muted", border: "border-l-gray-400", gradient: "from-gray-500 to-gray-700" };

function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default function InsightsPage() {
  const featured = posts[0];
  const rest = posts.slice(1);
  const featuredCat = categoryColors[featured.category] || defaultCat;

  return (
    <>
      <Header />
      <main className="min-h-screen bg-background transition-colors">

        {/* ════════════ TRENDING TICKER ════════════ */}
        <TrendingTicker />

        {/* ════════════ HERO — Knowledge Intelligence ════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[var(--hero-from)] via-background to-background transition-colors">
          {/* Decorative blobs */}
          <div className="absolute -left-20 top-20 h-[400px] w-[400px] rounded-full bg-accent/8 blur-[100px]" />
          <div className="absolute -right-20 top-40 h-[350px] w-[350px] rounded-full bg-purple-500/6 blur-[80px]" />

          <div className="relative mx-auto max-w-7xl px-6 pt-12 pb-16 md:pt-16 md:pb-24">
            <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_1fr] lg:gap-16">

              {/* Left: Text */}
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                  <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[12px] font-semibold text-accent">Knowledge Intelligence</span>
                </div>

                <h1 className="mt-5 text-[2.25rem] font-extrabold leading-[1.1] tracking-tight md:text-[3rem]">
                  Insights that power
                  <span className="bg-gradient-to-r from-accent via-blue-600 to-purple-500 bg-clip-text text-transparent"> smarter decisions.</span>
                </h1>
                <p className="mt-4 max-w-lg text-[15px] leading-[1.7] text-muted">
                  Market trends, data-driven intelligence, and strategic insights for B2B travel professionals. Powered by 300,000+ experiences across 3,000+ cities and 10 supplier APIs.
                </p>

                {/* Stats row */}
                <div className="mt-8 flex items-center gap-6">
                  {[
                    { value: "300K+", label: "Data Points" },
                    { value: "3,000+", label: "Cities Analyzed" },
                    { value: "10", label: "Supplier APIs" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-xl font-extrabold tracking-tight md:text-2xl">{s.value}</p>
                      <p className="text-[11px] text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Emma teaser */}
                <div className="mt-8 flex items-center gap-3 rounded-xl border border-accent/15 bg-accent/5 p-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent to-blue-700 shadow-lg shadow-accent/20">
                    <span className="text-[11px] font-bold text-white">TM</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold">Ask Emma about any topic</p>
                    <p className="text-[11px] text-muted">Our AI agent can answer questions about any insight, trend or destination.</p>
                  </div>
                  <Link href="/" className="shrink-0 rounded-lg bg-accent px-3 py-1.5 text-[11px] font-semibold text-white transition-all hover:brightness-110">
                    Ask Emma
                  </Link>
                </div>
              </div>

              {/* Right: Animated SVG — Knowledge Network */}
              <div className="hidden lg:flex items-center justify-center">
                <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[420px]">
                  <style>{`
                    @keyframes ki-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes ki-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                    @keyframes ki-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
                    @keyframes ki-glow { 0%, 100% { r: 4; opacity: 0.6; } 50% { r: 6; opacity: 1; } }
                    @keyframes ki-flow1 { 0% { cx: 100; cy: 250; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { cx: 220; cy: 230; opacity: 0; } }
                    @keyframes ki-flow2 { 0% { cx: 250; cy: 100; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { cx: 260; cy: 220; opacity: 0; } }
                    @keyframes ki-flow3 { 0% { cx: 400; cy: 250; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { cx: 280; cy: 260; opacity: 0; } }
                    @keyframes ki-flow4 { 0% { cx: 250; cy: 400; opacity: 0; } 20% { opacity: 1; } 80% { opacity: 1; } 100% { cx: 250; cy: 280; opacity: 0; } }
                    @keyframes ki-node-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.08); } }
                  `}</style>
                  <defs>
                    <radialGradient id="kiGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" /></radialGradient>
                    <linearGradient id="kiRing1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient>
                    <linearGradient id="kiRing2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient>
                    <filter id="kiBlur"><feGaussianBlur stdDeviation="3" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                  </defs>

                  {/* Background glow */}
                  <circle cx="250" cy="250" r="200" fill="url(#kiGlow)" />

                  {/* Outer rotating ring */}
                  <circle cx="250" cy="250" r="180" stroke="url(#kiRing1)" strokeWidth="1" strokeDasharray="8 6" fill="none" opacity="0.4" style={{ transformOrigin: "250px 250px", animation: "ki-spin 30s linear infinite" }} />

                  {/* Middle counter-rotating ring */}
                  <circle cx="250" cy="250" r="140" stroke="url(#kiRing2)" strokeWidth="1.5" strokeDasharray="12 8" fill="none" opacity="0.3" style={{ transformOrigin: "250px 250px", animation: "ki-spin-rev 22s linear infinite" }} />

                  {/* Inner ring */}
                  <circle cx="250" cy="250" r="90" stroke="#3B82F6" strokeWidth="2" fill="none" opacity="0.15" />

                  {/* Central hub */}
                  <circle cx="250" cy="250" r="55" fill="#1e3a5f" stroke="#3B82F6" strokeWidth="2" />
                  <circle cx="250" cy="250" r="55" fill="url(#kiGlow)" />
                  <text x="250" y="243" textAnchor="middle" fontSize="10" fontWeight="800" fill="white" letterSpacing="0.12em">KNOWLEDGE</text>
                  <text x="250" y="258" textAnchor="middle" fontSize="9" fontWeight="600" fill="#60A5FA" letterSpacing="0.1em">INTELLIGENCE</text>
                  <text x="250" y="272" textAnchor="middle" fontSize="7" fill="#94A3B8">Powered by Emma AI</text>

                  {/* 4 satellite nodes */}
                  <g style={{ transformOrigin: "250px 100px", animation: "ki-node-breathe 4s ease-in-out infinite" }}>
                    <circle cx="250" cy="100" r="32" fill="#1e293b" stroke="#8B5CF6" strokeWidth="1.5" />
                    <path d="M240 105 L245 95 L250 100 L255 90 L260 95" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <text x="250" y="118" textAnchor="middle" fontSize="7" fontWeight="700" fill="#C4B5FD">TRENDS</text>
                    <circle cx="270" cy="80" r="3" fill="#8B5CF6" style={{ animation: "ki-pulse 2.5s ease-in-out 0s infinite" }} />
                  </g>

                  <g style={{ transformOrigin: "100px 250px", animation: "ki-node-breathe 4s ease-in-out 0.5s infinite" }}>
                    <circle cx="100" cy="250" r="32" fill="#1e293b" stroke="#06B6D4" strokeWidth="1.5" />
                    <ellipse cx="100" cy="245" rx="12" ry="5" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
                    <ellipse cx="100" cy="250" rx="12" ry="5" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
                    <ellipse cx="100" cy="255" rx="12" ry="5" stroke="#06B6D4" strokeWidth="1.2" fill="none" />
                    <text x="100" y="273" textAnchor="middle" fontSize="7" fontWeight="700" fill="#67E8F9">DATA</text>
                    <circle cx="120" cy="228" r="3" fill="#06B6D4" style={{ animation: "ki-pulse 2.5s ease-in-out 0.4s infinite" }} />
                  </g>

                  <g style={{ transformOrigin: "400px 250px", animation: "ki-node-breathe 4s ease-in-out 1s infinite" }}>
                    <circle cx="400" cy="250" r="32" fill="#1e293b" stroke="#10B981" strokeWidth="1.5" />
                    <path d="M390 245 L395 245 L395 255 L405 255 L405 240 L410 240 L410 260 L390 260 Z" stroke="#10B981" strokeWidth="1.2" fill="none" />
                    <text x="400" y="273" textAnchor="middle" fontSize="7" fontWeight="700" fill="#6EE7B7">INSIGHTS</text>
                    <circle cx="420" cy="228" r="3" fill="#10B981" style={{ animation: "ki-pulse 2.5s ease-in-out 0.8s infinite" }} />
                  </g>

                  <g style={{ transformOrigin: "250px 400px", animation: "ki-node-breathe 4s ease-in-out 1.5s infinite" }}>
                    <circle cx="250" cy="400" r="32" fill="#1e293b" stroke="#F59E0B" strokeWidth="1.5" />
                    <circle cx="250" cy="395" r="6" stroke="#F59E0B" strokeWidth="1.2" fill="none" />
                    <path d="M242 405 L258 405" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M244 410 L256 410" stroke="#F59E0B" strokeWidth="1.2" strokeLinecap="round" />
                    <text x="250" y="425" textAnchor="middle" fontSize="7" fontWeight="700" fill="#FCD34D">AI AGENTS</text>
                    <circle cx="270" cy="378" r="3" fill="#F59E0B" style={{ animation: "ki-pulse 2.5s ease-in-out 1.2s infinite" }} />
                  </g>

                  {/* Connection lines */}
                  <line x1="132" y1="250" x2="195" y2="250" stroke="#06B6D4" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                  <line x1="305" y1="250" x2="368" y2="250" stroke="#10B981" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                  <line x1="250" y1="132" x2="250" y2="195" stroke="#8B5CF6" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />
                  <line x1="250" y1="305" x2="250" y2="368" stroke="#F59E0B" strokeWidth="1" strokeDasharray="4 3" opacity="0.4" />

                  <line x1="125" y1="225" x2="215" y2="135" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.2" />
                  <line x1="285" y1="135" x2="375" y2="225" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.2" />
                  <line x1="125" y1="275" x2="215" y2="365" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.2" />
                  <line x1="285" y1="365" x2="375" y2="275" stroke="#3B82F6" strokeWidth="0.5" strokeDasharray="3 4" opacity="0.2" />

                  {/* Data flow particles */}
                  <circle r="3" fill="#06B6D4" filter="url(#kiBlur)" style={{ animation: "ki-flow1 3s ease-in-out infinite" }} />
                  <circle r="3" fill="#8B5CF6" filter="url(#kiBlur)" style={{ animation: "ki-flow2 3.5s ease-in-out 0.5s infinite" }} />
                  <circle r="3" fill="#10B981" filter="url(#kiBlur)" style={{ animation: "ki-flow3 4s ease-in-out 1s infinite" }} />
                  <circle r="3" fill="#F59E0B" filter="url(#kiBlur)" style={{ animation: "ki-flow4 3.2s ease-in-out 1.5s infinite" }} />

                  {/* Orbiting dots on outer ring */}
                  <g style={{ transformOrigin: "250px 250px", animation: "ki-spin 20s linear infinite" }}>
                    <circle cx="250" cy="70" r="4" fill="#3B82F6" style={{ animation: "ki-glow 2s ease-in-out infinite" }} />
                    <circle cx="430" cy="250" r="3" fill="#8B5CF6" style={{ animation: "ki-glow 2s ease-in-out 0.5s infinite" }} />
                    <circle cx="250" cy="430" r="3" fill="#10B981" style={{ animation: "ki-glow 2s ease-in-out 1s infinite" }} />
                    <circle cx="70" cy="250" r="4" fill="#F59E0B" style={{ animation: "ki-glow 2s ease-in-out 1.5s infinite" }} />
                  </g>

                  {/* Bottom metrics bar */}
                  <rect x="120" y="460" width="260" height="28" rx="14" fill="#1e293b" stroke="#334155" strokeWidth="1" />
                  <text x="160" y="478" textAnchor="middle" fontSize="8" fontWeight="700" fill="#60A5FA">12</text>
                  <text x="160" y="486" textAnchor="middle" fontSize="5" fill="#94A3B8">Categories</text>
                  <text x="220" y="478" textAnchor="middle" fontSize="8" fontWeight="700" fill="#A78BFA">8</text>
                  <text x="220" y="486" textAnchor="middle" fontSize="5" fill="#94A3B8">AI Agents</text>
                  <text x="280" y="478" textAnchor="middle" fontSize="8" fontWeight="700" fill="#34D399">10</text>
                  <text x="280" y="486" textAnchor="middle" fontSize="5" fill="#94A3B8">APIs</text>
                  <text x="340" y="478" textAnchor="middle" fontSize="8" fontWeight="700" fill="#FBBF24">300K+</text>
                  <text x="340" y="486" textAnchor="middle" fontSize="5" fill="#94A3B8">Experiences</text>
                </svg>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ FEATURED ARTICLE ════════════ */}
        <section className="bg-surface py-16 transition-colors">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center gap-3 mb-8">
              <div className="h-1 w-8 rounded-full bg-accent" />
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Featured Insight</p>
            </div>

            <Link href={`/insights/${featured.slug}`} className="group block">
              <div className={`relative overflow-hidden rounded-2xl border-l-4 ${featuredCat.border} border border-card-border bg-card-bg p-8 md:p-10 transition-all hover:shadow-xl hover:shadow-accent/5`}>
                <div className={`absolute top-0 right-0 h-full w-1/3 bg-gradient-to-l ${featuredCat.gradient} opacity-[0.03]`} />

                <div className="relative grid gap-6 md:grid-cols-[1fr_auto]">
                  <div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${featuredCat.bg} ${featuredCat.text}`}>
                        {featured.category}
                      </span>
                      {featured.series && (
                        <span className="rounded-full border border-accent/20 bg-accent/5 px-2.5 py-0.5 text-[10px] font-medium text-accent">
                          {featured.series}
                        </span>
                      )}
                      <time className="text-muted" dateTime={featured.date}>
                        {new Date(featured.date).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                      </time>
                      <span className="text-muted">{featured.readTime}</span>
                    </div>
                    <h2 className="mt-4 text-2xl font-extrabold tracking-tight group-hover:text-accent transition-colors md:text-3xl">
                      {featured.title}
                    </h2>
                    <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted">
                      {featured.description}
                    </p>
                    <div className="mt-5 inline-flex items-center gap-2 text-[13px] font-semibold text-accent">
                      Read full insight <IconArrow />
                    </div>
                  </div>

                  <div className="hidden md:flex items-center">
                    <svg viewBox="0 0 120 120" className="h-28 w-28 opacity-20">
                      <circle cx="60" cy="60" r="50" stroke="currentColor" strokeWidth="1" strokeDasharray="6 4" fill="none" className="text-accent" style={{ transformOrigin: "60px 60px", animation: "ki-spin 15s linear infinite" }} />
                      <circle cx="60" cy="60" r="30" stroke="currentColor" strokeWidth="1.5" fill="none" className="text-accent" opacity="0.5" />
                      <circle cx="60" cy="60" r="8" fill="currentColor" className="text-accent" opacity="0.3" />
                      <circle cx="60" cy="10" r="4" fill="currentColor" className="text-accent" style={{ animation: "ki-glow 2s ease-in-out infinite" }} />
                      <circle cx="110" cy="60" r="3" fill="currentColor" className="text-accent" style={{ animation: "ki-glow 2s ease-in-out 0.7s infinite" }} />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </section>

        {/* ════════════ ALL INSIGHTS GRID ════════════ */}
        <section className="py-16 bg-background transition-colors">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-center justify-between mb-10">
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">All Insights</p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight md:text-3xl">Latest Intelligence</h2>
              </div>
              <div className="hidden md:flex items-center gap-2">
                {Object.keys(categoryColors).map((cat) => {
                  const c = categoryColors[cat];
                  return (
                    <span key={cat} className={`rounded-full px-3 py-1 text-[11px] font-semibold ${c.bg} ${c.text} cursor-default`}>
                      {cat}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post) => {
                const cat = categoryColors[post.category] || defaultCat;
                return (
                  <Link key={post.slug} href={`/insights/${post.slug}`} className="group block">
                    <article className={`relative h-full overflow-hidden rounded-2xl border-l-4 ${cat.border} border border-card-border bg-card-bg p-6 transition-all hover:shadow-xl hover:shadow-accent/5 hover:border-accent/20`}>
                      <div className={`absolute top-0 right-0 h-24 w-24 bg-gradient-to-bl ${cat.gradient} opacity-[0.04] rounded-bl-full`} />

                      <div className="relative">
                        <div className="flex items-center gap-2.5 text-xs">
                          <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${cat.bg} ${cat.text}`}>
                            {post.category}
                          </span>
                          {post.series && (
                            <span className="rounded-full border border-accent/15 px-2 py-0.5 text-[9px] font-medium text-accent">
                              {post.series}
                            </span>
                          )}
                          <span className="text-muted">{post.readTime}</span>
                        </div>

                        <h3 className="mt-3 text-[17px] font-bold tracking-tight leading-snug group-hover:text-accent transition-colors">
                          {post.title}
                        </h3>

                        <p className="mt-2.5 text-[13px] leading-relaxed text-muted line-clamp-3">
                          {post.description}
                        </p>

                        <div className="mt-5 flex items-center justify-between">
                          <time className="text-[11px] text-muted" dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </time>
                          <span className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                            Read <IconArrow />
                          </span>
                        </div>
                      </div>
                    </article>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* ════════════ NEWSLETTER SIGNUP ════════════ */}
        <section className="bg-surface py-12 transition-colors">
          <div className="mx-auto max-w-2xl px-6">
            <NewsletterSignup variant="card" />
          </div>
        </section>

        {/* ════════════ EMMA KNOWLEDGE CTA ════════════ */}
        <section className="bg-background py-16 transition-colors">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f1729] to-[#1a2744] p-8 md:p-12">
              <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-accent/10 blur-[60px]" />
              <div className="absolute -left-10 -bottom-10 h-32 w-32 rounded-full bg-purple-500/10 blur-[50px]" />

              <div className="relative grid items-center gap-8 md:grid-cols-[1fr_auto]">
                <div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-blue-700 shadow-lg shadow-accent/25">
                      <span className="text-sm font-bold text-white">TM</span>
                    </div>
                    <div>
                      <p className="text-lg font-bold text-white">Ask Emma anything</p>
                      <p className="text-[12px] text-white/40">Your AI travel intelligence agent</p>
                    </div>
                  </div>
                  <p className="max-w-lg text-[14px] leading-relaxed text-white/60">
                    Emma has access to all insights, market data, and intelligence from 300,000+ experiences across 3,000+ cities. Ask her about trends, destinations, pricing strategies, or anything else — she speaks every language.
                  </p>

                  <div className="mt-6 flex flex-wrap gap-2">
                    {["What are the top museums for groups?", "Market trends 2026", "How to optimize group pricing?", "Best cities for MICE events"].map((q) => (
                      <span key={q} className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[11px] font-medium text-white/70">
                        {q}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <svg viewBox="0 0 100 100" className="h-20 w-20">
                    <circle cx="50" cy="50" r="40" stroke="#3B82F6" strokeWidth="1" strokeDasharray="6 4" fill="none" opacity="0.3" style={{ transformOrigin: "50px 50px", animation: "ki-spin 12s linear infinite" }} />
                    <circle cx="50" cy="50" r="25" stroke="#8B5CF6" strokeWidth="1.5" strokeDasharray="4 3" fill="none" opacity="0.4" style={{ transformOrigin: "50px 50px", animation: "ki-spin-rev 8s linear infinite" }} />
                    <circle cx="50" cy="50" r="12" fill="#3B82F6" opacity="0.6" />
                    <circle cx="50" cy="50" r="6" fill="white" opacity="0.9" />
                    <circle cx="50" cy="10" r="3" fill="#60A5FA" style={{ animation: "ki-glow 2s ease-in-out infinite" }} />
                    <circle cx="90" cy="50" r="2.5" fill="#A78BFA" style={{ animation: "ki-glow 2s ease-in-out 0.5s infinite" }} />
                    <circle cx="50" cy="90" r="2.5" fill="#34D399" style={{ animation: "ki-glow 2s ease-in-out 1s infinite" }} />
                  </svg>

                  <Link
                    href="/"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-[#0f1729] shadow-lg transition-all hover:shadow-white/20 hover:scale-[1.02]"
                  >
                    Talk to Emma <IconArrow />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ MEMBERSHIP CTA ════════════ */}
        <section className="py-16 bg-surface transition-colors">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Join the Ecosystem</p>
            <h2 className="mt-3 text-2xl font-extrabold tracking-tight md:text-3xl">
              Ready to access the full intelligence?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              300,000+ experiences. 10 supplier APIs. 8 AI agents. One membership.
              Join the ecosystem and unlock the complete knowledge base.
            </p>
            <Link
              href="/auth/register"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
            >
              Request Membership <IconArrow />
            </Link>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
