import Link from "next/link";
import dynamic from "next/dynamic";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroChat from "@/components/ui/HeroChat";
import { getHeroCarouselImages, getAllCategoryImages, getAllCityImages } from "@/lib/viator-images";
import ImageSlider from "@/components/ui/ImageSlider";
import AnimatedCounters from "@/components/ui/AnimatedCounters";
import LiveActivityFeed from "@/components/ui/LiveActivityFeed";
import ScrollReveal from "@/components/ui/ScrollReveal";
import StickyNav from "@/components/ui/StickyNav";

/* Below-the-fold components — lazy loaded for faster initial paint */
const CitySearchPreview = dynamic(() => import("@/components/ui/CitySearchPreview"), { ssr: false });
const ROICalculator = dynamic(() => import("@/components/ui/ROICalculator"), { ssr: false });
const FAQ = dynamic(() => import("@/components/ui/FAQ"), { ssr: false });
const SaveVsRetail = dynamic(() => import("@/components/ui/SaveVsRetail"), { ssr: false });
const TrendingDestinations = dynamic(() => import("@/components/ui/TrendingDestinations"), { ssr: false });

/* ───── small icons ───── */
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconLock() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
}

/* ───── mini SVG feature icons ───── */
function FiBot() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="9" cy="16" r="1"/><circle cx="15" cy="16" r="1"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><line x1="12" y1="4" x2="12" y2="2"/><circle cx="12" cy="2" r="1"/></svg>; }
function FiMap() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>; }
function FiPackage() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>; }
function FiTicket() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2 9a3 3 0 0 1 0 6v5a1 1 0 0 0 1 1h18a1 1 0 0 0 1-1v-5a3 3 0 0 1 0-6V4a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v5z"/><path d="M13 5v2M13 17v2M13 11v2"/></svg>; }
function FiSun() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function FiChart() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>; }
function FiShield() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>; }
function FiFile() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>; }
function FiBell() { return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>; }


/* ───── page ───── */
export default async function Home() {
  // Fetch real Viator images (cached 1 hour)
  const [heroImages, categoryImages, cityImages] = await Promise.all([
    getHeroCarouselImages(["museums", "attractions"], 16).catch(() => [] as string[]),
    getAllCategoryImages().catch(() => ({} as Record<string, string>)),
    getAllCityImages(["amsterdam", "rotterdam", "the hague", "utrecht", "barcelona", "paris", "london", "rome", "prague", "lisbon"]).catch(() => ({} as Record<string, string>)),
  ]);

  return (
    <>
      <Header />
      <main id="main-content" className="flex-1 pb-20 md:pb-0 md:snap-y md:snap-proximity">
        <StickyNav />

        {/* ════════════ HERO — AI-First, Premium B2B ════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-[var(--hero-from)] via-background to-background transition-colors snap-start">
          {/* Animated dot grid background */}
          <div className="absolute inset-0 opacity-[0.03] blur-mobile-hidden" style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
          {/* Decorative blobs — vivid */}
          <div className="absolute -left-20 top-20 h-[500px] w-[500px] rounded-full bg-accent/15 blur-[100px] blur-mobile-hidden" />
          <div className="absolute -right-20 top-40 h-[400px] w-[400px] rounded-full bg-cyan-500/12 blur-[80px] blur-mobile-hidden" />
          <div className="absolute left-1/2 bottom-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full bg-amber-500/8 blur-[80px] blur-mobile-hidden" />

          <div className="relative mx-auto max-w-7xl px-6 pb-16 pt-12 md:pb-24 md:pt-16">

            {/* Badge */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-accent">350,000+ Experiences · 3,000+ Cities · 10 Supplier APIs</span>
              </div>
            </div>

            {/* Headline */}
            <h1 className="mx-auto mt-6 max-w-4xl text-center text-[2.25rem] font-extrabold leading-[1.1] tracking-tight md:text-[3.5rem]">
              The
              <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent"> AI-powered ecosystem </span>
              that<br />unlocks the world for group travel.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-center text-[15px] leading-[1.7] text-muted">
              One platform connecting tour operators, DMCs and travel agencies to 350,000+ experiences across 134 cities in 51 countries — powered by 10 supplier APIs, AI agents and real-time data. Exclusive B2B rates, locked behind membership.
            </p>

            {/* Main grid: Chat left, floating visuals right */}
            <div className="mt-12 grid items-stretch gap-8 lg:grid-cols-[1fr_1.1fr] lg:gap-10">

              {/* Left: AI Chat — Emma is THE star */}
              <div className="flex flex-col">
                <HeroChat />
                {/* CTA below chat */}
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-[box-shadow,filter] hover:shadow-accent/40 hover:brightness-110"
                  >
                    Request Membership <IconArrow />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-[13px] font-semibold transition-colors hover:bg-surface-alt"
                  >
                    See how it works
                  </Link>
                </div>
              </div>

              {/* Right: City carousel + Dashboard previews — desktop only */}
              <div className="hidden lg:flex lg:flex-col">
                <div className="grid grid-cols-[0.8fr_1fr] gap-3 flex-1">

                  {/* Left: Tall vertical category carousel */}
                  <div className="relative h-full overflow-hidden rounded-2xl shadow-2xl shadow-black/20">
                    <ImageSlider
                      images={heroImages.length > 0 ? heroImages : ["/images/cat-museums.webp", "/images/cat-walking.webp", "/images/cat-attractions.webp", "/images/cat-cruises.webp", "/images/cat-restaurants.webp", "/images/cat-transport.webp"]}
                      alt="Experiences worldwide"
                      interval={3500}
                    />
                    <div className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 z-[2] p-5">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                        <span className="text-[11px] font-semibold text-emerald-300">12 categories · 134 cities in 51 countries</span>
                      </div>
                      <p className="text-[18px] font-extrabold text-white leading-tight">Museums. Tours.<br/>Cruises. Food.<br/>And so much more.</p>
                      <p className="mt-1.5 text-[11px] text-white/80">350,000+ experiences at exclusive B2B rates</p>
                    </div>
                  </div>

                  {/* Right: Two stacked REAL dashboard screenshots */}
                  <div className="flex flex-col gap-3 h-full">
                    <div className="relative flex-1 overflow-hidden rounded-2xl shadow-xl group bg-gray-50">
                      <img
                        src="/images/dashboard-commandcenter.webp"
                        alt="TicketMatch Command Center Dashboard"
                        className="h-full w-full object-cover object-left-top rounded-2xl"
                        width={800}
                        height={500}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute top-3 right-3 z-10 rounded-full bg-[#4338ca]/90 px-3 py-1 shadow-sm">
                        <span className="text-[10px] font-bold text-white">Command Center</span>
                      </div>
                    </div>
                    <div className="relative flex-1 overflow-hidden rounded-2xl shadow-xl group bg-gray-50">
                      <img
                        src="/images/dashboard-experiences.webp"
                        alt="TicketMatch Experiences Dashboard"
                        className="h-full w-full object-cover object-left-top rounded-2xl"
                        width={800}
                        height={500}
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute bottom-0 left-0 right-0 h-[15%] backdrop-blur-[6px] bg-white/40 rounded-b-2xl" />
                      <div className="absolute bottom-[3%] left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1 shadow-lg">
                        <IconLock />
                        <span className="text-[9px] font-semibold text-white whitespace-nowrap">Prices visible for members only</span>
                      </div>
                      <div className="absolute top-3 right-3 z-10 rounded-full bg-accent/90 px-3 py-1 shadow-sm">
                        <span className="text-[10px] font-bold text-white">Experiences</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ════════════ STATS BAR — Scroll-triggered animated counters ════════════ */}
        <AnimatedCounters />

        {/* ════════════ LIVE ACTIVITY FEED — Booking.com style FOMO ════════════ */}
        <LiveActivityFeed />

        <TrendingDestinations />

        {/* ════════════ EXPLORE BY CATEGORY — Photo Cards ════════════ */}
        <section className="py-20 md:py-28 bg-surface transition-colors snap-start">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Explore by Category</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                Every type of experience. One platform.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                From museum tours to boat cruises, food walks to outdoor adventures — browse 350,000+ experiences across 12 categories.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {[
                { key: "museums", label: "Museums", icon: "🏛️", count: "45K+" },
                { key: "tours", label: "Tours", icon: "🚶", count: "85K+" },
                { key: "food", label: "Food & Drink", icon: "🍽️", count: "35K+" },
                { key: "water", label: "Boats & Water", icon: "⛵", count: "28K+" },
                { key: "outdoor", label: "Outdoor", icon: "🌿", count: "32K+" },
                { key: "tickets", label: "Tickets", icon: "🎫", count: "55K+" },
              ].map((cat) => (
                <div key={cat.key} className="group relative overflow-hidden rounded-2xl bg-card-bg border border-card-border transition-[transform,box-shadow] hover:shadow-xl hover:scale-[1.02]">
                  <div className="relative h-36 sm:h-40 overflow-hidden">
                    {categoryImages[cat.key] ? (
                      <img
                        src={categoryImages[cat.key]}
                        alt={cat.label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/10 to-accent/5">
                        <span className="text-4xl">{cat.icon}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                    <div className="absolute top-2 right-2 rounded-full bg-white/90 dark:bg-gray-800/90 px-2 py-0.5 text-[9px] font-bold text-accent shadow-sm">
                      {cat.count}
                    </div>
                  </div>
                  <div className="px-3 py-2.5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm">{cat.icon}</span>
                      <h3 className="text-[13px] font-bold truncate">{cat.label}</h3>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ POPULAR CITIES — Photo Grid ════════════ */}
        <section className="py-20 md:py-28 bg-background transition-colors snap-start">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Popular Destinations</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                134 cities. 51 countries. One platform.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                From Amsterdam to Auckland, Bangkok to Buenos Aires. Explore the most popular destinations on TicketMatch.
              </p>
            </div>

            {/* Featured cities — large cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {[
                { key: "amsterdam", label: "Amsterdam", country: "🇳🇱", featured: true, slug: "amsterdam" },
                { key: "rotterdam", label: "Rotterdam", country: "🇳🇱", featured: true, slug: "rotterdam" },
                { key: "the hague", label: "The Hague", country: "🇳🇱", featured: false, slug: "den-haag" },
                { key: "utrecht", label: "Utrecht", country: "🇳🇱", featured: false, slug: "utrecht" },
                { key: "barcelona", label: "Barcelona", country: "🇪🇸", featured: false, slug: "" },
                { key: "paris", label: "Paris", country: "🇫🇷", featured: false, slug: "" },
                { key: "london", label: "London", country: "🇬🇧", featured: false, slug: "" },
                { key: "rome", label: "Rome", country: "🇮🇹", featured: false, slug: "" },
                { key: "prague", label: "Prague", country: "🇨🇿", featured: false, slug: "" },
                { key: "lisbon", label: "Lisbon", country: "🇵🇹", featured: false, slug: "" },
              ].map((city) => {
                const inner = (
                  <div className="relative h-44 sm:h-52 overflow-hidden">
                    {cityImages[city.key] ? (
                      <img
                        src={cityImages[city.key]}
                        alt={city.label}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        width={400}
                        height={300}
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-accent/15 to-accent/5">
                        <span className="text-5xl">{city.country}</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{city.country}</span>
                        <h3 className="text-[15px] font-bold text-white">{city.label}</h3>
                      </div>
                    </div>
                    {city.featured && (
                      <div className="absolute top-2 left-2 rounded-full bg-accent/90 px-2 py-0.5 text-[9px] font-bold text-white shadow-sm">
                        Popular
                      </div>
                    )}
                  </div>
                );
                return city.slug ? (
                  <Link key={city.key} href={`/cities/${city.slug}`} className={`group relative overflow-hidden rounded-2xl transition-[transform,box-shadow] hover:shadow-xl hover:scale-[1.02] ${city.featured ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""}`}>
                    {inner}
                  </Link>
                ) : (
                  <div key={city.key} className={`group relative overflow-hidden rounded-2xl transition-[transform,box-shadow] hover:shadow-xl hover:scale-[1.02] ${city.featured ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""}`}>
                    {inner}
                  </div>
                );
              })}
            </div>

            {/* Bottom CTA */}
            <div className="mt-8 text-center">
              <Link
                href="/cities"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-[13px] font-semibold transition-colors hover:bg-surface-alt"
              >
                Explore all Dutch cities <IconArrow />
              </Link>
            </div>
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ WHAT WE DO — Ecosystem Flow ════════════ */}
        <section id="ecosystem" className="py-20 md:py-28 bg-background transition-colors snap-start">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">The Ecosystem</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                One ecosystem. Every experience. Worldwide.
              </h2>
              <p className="mt-5 text-[16px] leading-[1.8] text-muted">
                TicketMatch aggregates 350,000+ experiences from 10 supplier APIs into one powerful B2B platform.
                Tour operators, DMCs and travel agencies get exclusive rates, AI-powered search, and real-time data —
                all behind a single membership.
              </p>
            </div>

            {/* ── Premium Vertical B2B2C Flow SVG ── */}
            <div className="mt-16 overflow-hidden rounded-3xl border border-card-border bg-gradient-to-b from-surface-alt to-surface p-6 md:p-10 transition-colors">
              {/* Desktop SVG — Clean vertical pipeline */}
              <div className="hidden md:block">
                <svg viewBox="0 0 800 820" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-3xl mx-auto">
                  <style>{`
                    @keyframes eco-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    @keyframes eco-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                    @keyframes eco-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 1; } }
                    @keyframes eco-glow { 0%, 100% { r: 4; opacity: 0.6; } 50% { r: 6; opacity: 1; } }
                    @keyframes eco-breathe { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.03); } }
                    @keyframes eco-flow-down1 { 0% { cy: 120; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { cy: 220; opacity: 0; } }
                    @keyframes eco-flow-down2 { 0% { cy: 330; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { cy: 420; opacity: 0; } }
                    @keyframes eco-flow-down3 { 0% { cy: 530; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { cy: 620; opacity: 0; } }
                    @keyframes eco-flow-down4 { 0% { cy: 710; opacity: 0; } 15% { opacity: 1; } 85% { opacity: 1; } 100% { cy: 770; opacity: 0; } }
                  `}</style>
                  <defs>
                    <radialGradient id="ecoHubGlow" cx="50%" cy="50%" r="50%"><stop offset="0%" stopColor="#3B82F6" stopOpacity="0.25" /><stop offset="100%" stopColor="#3B82F6" stopOpacity="0" /></radialGradient>
                    <linearGradient id="ecoRing1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient>
                    <linearGradient id="ecoRing2" x1="100%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#06B6D4" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient>
                    <filter id="ecoBlur"><feGaussianBlur stdDeviation="2.5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
                    <linearGradient id="flowLine1" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#10B981" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient>
                    <linearGradient id="flowLine2" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#8B5CF6" /></linearGradient>
                    <linearGradient id="flowLine3" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#8B5CF6" /><stop offset="100%" stopColor="#3B82F6" /></linearGradient>
                    <linearGradient id="flowLine4" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#3B82F6" /><stop offset="100%" stopColor="#F59E0B" /></linearGradient>
                  </defs>

                  {/* ═══════════ STEP 1: Experiences (Top — the supply) ═══════════ */}
                  <text x="400" y="24" fontSize="10" fontWeight="700" fill="#065F46" textAnchor="middle" letterSpacing="0.12em" className="dark:fill-emerald-400">STEP 1 — THE SUPPLY</text>

                  <g style={{ transformOrigin: "400px 72px", animation: "eco-breathe 5s ease-in-out infinite" }}>
                    <rect x="140" y="40" width="520" height="64" rx="20" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="2" className="dark:fill-[#1e293b] dark:stroke-emerald-500/40" />
                    <text x="400" y="68" fontSize="16" fontWeight="800" fill="#065F46" textAnchor="middle" className="dark:fill-emerald-300">350,000+ Experiences</text>
                    <text x="400" y="88" fontSize="10" fill="#64748b" textAnchor="middle">Museums, Tours, Attractions, Food, Water, Transport — 134 cities in 51 countries worldwide</text>
                  </g>

                  {/* Experience category pills */}
                  <g opacity="0.8">
                    {[
                      { x: 160, label: "Museums 45K+", color: "#059669" },
                      { x: 290, label: "Tours 85K+", color: "#059669" },
                      { x: 400, label: "Attractions 55K+", color: "#059669" },
                      { x: 530, label: "Food 35K+", color: "#059669" },
                      { x: 640, label: "Water 28K+", color: "#059669" },
                    ].map((pill) => (
                      <g key={pill.label}>
                        <rect x={pill.x - 42} y="114" width="84" height="20" rx="10" fill="#ECFDF5" stroke="#6EE7B7" strokeWidth="0.5" className="dark:fill-emerald-900/30 dark:stroke-emerald-700/30" />
                        <text x={pill.x} y="128" fontSize="7" fontWeight="600" fill={pill.color} textAnchor="middle">{pill.label}</text>
                      </g>
                    ))}
                  </g>

                  {/* ── Arrow 1: Supply → TicketMatch ── */}
                  <line x1="400" y1="140" x2="400" y2="230" stroke="url(#flowLine1)" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
                  <circle cx="400" r="4" fill="#10B981" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down1 2.5s ease-in-out infinite" }} />
                  <circle cx="380" r="3" fill="#34D399" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down1 2.5s ease-in-out 0.8s infinite" }} />
                  <circle cx="420" r="3" fill="#10B981" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down1 2.5s ease-in-out 1.6s infinite" }} />

                  {/* Step label */}
                  <rect x="430" y="168" width="140" height="22" rx="11" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="0.5" className="dark:fill-blue-900/30 dark:stroke-blue-700/30" />
                  <text x="500" y="183" fontSize="8" fontWeight="600" fill="#3B82F6" textAnchor="middle">Aggregated via 10 APIs</text>

                  {/* ═══════════ STEP 2: TicketMatch (finds best deal) ═══════════ */}
                  <text x="400" y="248" fontSize="10" fontWeight="700" fill="#3B82F6" textAnchor="middle" letterSpacing="0.12em">STEP 2 — THE PLATFORM</text>

                  {/* Hub with rotating rings */}
                  <circle cx="400" cy="330" r="80" fill="url(#ecoHubGlow)" />
                  <circle cx="400" cy="330" r="70" stroke="url(#ecoRing1)" strokeWidth="1" strokeDasharray="10 6" fill="none" opacity="0.3" style={{ transformOrigin: "400px 330px", animation: "eco-spin 25s linear infinite" }} />
                  <circle cx="400" cy="330" r="55" stroke="url(#ecoRing2)" strokeWidth="1" strokeDasharray="8 5" fill="none" opacity="0.2" style={{ transformOrigin: "400px 330px", animation: "eco-spin-rev 18s linear infinite" }} />
                  <circle cx="400" cy="330" r="42" fill="#1e3a5f" stroke="#3B82F6" strokeWidth="2" className="dark:fill-[#0f1729]" />
                  <circle cx="400" cy="330" r="42" fill="url(#ecoHubGlow)" />
                  <text x="400" y="325" fontSize="12" fontWeight="800" fill="white" textAnchor="middle" letterSpacing="0.08em">TicketMatch</text>
                  <text x="400" y="339" fontSize="7" fontWeight="600" fill="#60A5FA" textAnchor="middle" letterSpacing="0.06em">FINDS THE BEST DEAL</text>

                  {/* Orbiting dots */}
                  <g style={{ transformOrigin: "400px 330px", animation: "eco-spin 15s linear infinite" }}>
                    <circle cx="400" cy="260" r="3" fill="#3B82F6" style={{ animation: "eco-glow 2s ease-in-out infinite" }} />
                    <circle cx="470" cy="330" r="3" fill="#8B5CF6" style={{ animation: "eco-glow 2s ease-in-out 0.7s infinite" }} />
                    <circle cx="400" cy="400" r="3" fill="#10B981" style={{ animation: "eco-glow 2s ease-in-out 1.4s infinite" }} />
                    <circle cx="330" cy="330" r="3" fill="#F59E0B" style={{ animation: "eco-glow 2s ease-in-out 2.1s infinite" }} />
                  </g>

                  {/* Feature pills flanking the hub */}
                  <g opacity="0.85">
                    <rect x="120" y="300" width="74" height="22" rx="11" fill="#EFF6FF" className="dark:fill-blue-900/30" />
                    <text x="157" y="315" fontSize="8" fontWeight="600" fill="#3B82F6" textAnchor="middle">8 AI Agents</text>
                    <rect x="120" y="332" width="74" height="22" rx="11" fill="#ECFDF5" className="dark:fill-emerald-900/30" />
                    <text x="157" y="347" fontSize="8" fontWeight="600" fill="#059669" textAnchor="middle">Live Data</text>
                    <rect x="606" y="300" width="74" height="22" rx="11" fill="#FEF3C7" className="dark:fill-amber-900/30" />
                    <text x="643" y="315" fontSize="8" fontWeight="600" fill="#D97706" textAnchor="middle">10 APIs</text>
                    <rect x="606" y="332" width="74" height="22" rx="11" fill="#F3E8FF" className="dark:fill-purple-900/30" />
                    <text x="643" y="347" fontSize="8" fontWeight="600" fill="#7C3AED" textAnchor="middle">QR Tickets</text>
                  </g>

                  {/* ── Arrow 2: TicketMatch → Tour Operators ── */}
                  <line x1="400" y1="405" x2="400" y2="440" stroke="url(#flowLine2)" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
                  <circle cx="400" r="4" fill="#3B82F6" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down2 2.5s ease-in-out infinite" }} />
                  <circle cx="385" r="3" fill="#60A5FA" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down2 2.5s ease-in-out 0.9s infinite" }} />

                  {/* Step label */}
                  <rect x="430" y="410" width="160" height="22" rx="11" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="0.5" className="dark:fill-blue-900/30 dark:stroke-blue-700/30" />
                  <text x="510" y="425" fontSize="8" fontWeight="600" fill="#3B82F6" textAnchor="middle">B2B rates, exclusive deals</text>

                  {/* ═══════════ STEP 3: Tour Operators (book) ═══════════ */}
                  <text x="400" y="460" fontSize="10" fontWeight="700" fill="#1e3a5f" textAnchor="middle" letterSpacing="0.12em" className="dark:fill-blue-200">STEP 3 — YOUR TEAM BOOKS</text>

                  <g style={{ transformOrigin: "400px 500px", animation: "eco-breathe 5s ease-in-out 0.5s infinite" }}>
                    <rect x="140" y="474" width="520" height="56" rx="18" fill="#EFF6FF" stroke="#93C5FD" strokeWidth="2" className="dark:fill-[#1e293b] dark:stroke-blue-500/40" />
                    <text x="400" y="500" fontSize="13" fontWeight="800" fill="#1e3a5f" textAnchor="middle" className="dark:fill-blue-200">Tour Operators · DMCs · Agencies · Resellers</text>
                    <text x="400" y="518" fontSize="9" fill="#64748b" textAnchor="middle">Browse, compare, and book the best deals on TicketMatch</text>
                  </g>

                  {/* ── Arrow 3: Tour Operators → TicketMatch (processes) ── */}
                  <line x1="400" y1="535" x2="400" y2="620" stroke="url(#flowLine3)" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
                  <circle cx="400" r="4" fill="#8B5CF6" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down3 2.5s ease-in-out infinite" }} />
                  <circle cx="415" r="3" fill="#A78BFA" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down3 2.5s ease-in-out 1s infinite" }} />

                  {/* Step label */}
                  <rect x="430" y="565" width="200" height="22" rx="11" fill="#F3E8FF" stroke="#C4B5FD" strokeWidth="0.5" className="dark:fill-purple-900/30 dark:stroke-purple-700/30" />
                  <text x="530" y="580" fontSize="8" fontWeight="600" fill="#7C3AED" textAnchor="middle">Booking confirmed, supplier sends QR</text>

                  {/* ═══════════ STEP 4: TicketMatch (processes & delivers) ═══════════ */}
                  <text x="400" y="638" fontSize="10" fontWeight="700" fill="#3B82F6" textAnchor="middle" letterSpacing="0.12em">STEP 4 — SUPPLIER DELIVERS TO YOU</text>

                  <g style={{ transformOrigin: "400px 678px", animation: "eco-breathe 5s ease-in-out 1s infinite" }}>
                    <rect x="180" y="652" width="440" height="50" rx="16" fill="#1e3a5f" stroke="#3B82F6" strokeWidth="2" className="dark:fill-[#0f1729]" />
                    <text x="400" y="676" fontSize="11" fontWeight="700" fill="white" textAnchor="middle">QR Voucher from supplier → You forward to your client</text>
                    <text x="400" y="692" fontSize="8" fill="#60A5FA" textAnchor="middle">Invoice, confirmation &amp; voucher — all processed automatically</text>
                  </g>

                  {/* ── Arrow 4: TicketMatch → End Consumer ── */}
                  <line x1="400" y1="706" x2="400" y2="760" stroke="url(#flowLine4)" strokeWidth="2" strokeDasharray="8 4" opacity="0.5" />
                  <circle cx="400" r="4" fill="#F59E0B" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down4 2s ease-in-out infinite" }} />
                  <circle cx="388" r="3" fill="#FBBF24" filter="url(#ecoBlur)" style={{ animation: "eco-flow-down4 2s ease-in-out 0.7s infinite" }} />

                  {/* Step label */}
                  <rect x="430" y="722" width="150" height="22" rx="11" fill="#FEF3C7" stroke="#F59E0B" strokeWidth="0.5" className="dark:fill-amber-900/30 dark:stroke-amber-700/30" />
                  <text x="505" y="737" fontSize="8" fontWeight="600" fill="#D97706" textAnchor="middle">Best rate guaranteed</text>

                  {/* ═══════════ STEP 5: End Consumer (gets ticket!) ═══════════ */}
                  <text x="400" y="778" fontSize="10" fontWeight="700" fill="#92400E" textAnchor="middle" letterSpacing="0.12em" className="dark:fill-amber-300">STEP 5 — YOUR CLIENT RECEIVES THE TICKET</text>

                  <g style={{ transformOrigin: "400px 803px", animation: "eco-breathe 5s ease-in-out 1.5s infinite" }}>
                    <rect x="140" y="790" width="520" height="26" rx="13" fill="#FFFBEB" stroke="#F59E0B" strokeWidth="2" className="dark:fill-[#1e293b] dark:stroke-amber-500/40" />
                    <text x="400" y="808" fontSize="11" fontWeight="800" fill="#92400E" textAnchor="middle" className="dark:fill-amber-200">QR Ticket in hand · Best price · Scan &amp; enter · Happy guests</text>
                  </g>
                </svg>
              </div>

              {/* Mobile version — stacked vertical */}
              <div className="flex flex-col gap-4 md:hidden">
                {/* Step 1: Experiences */}
                <div>
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-emerald-600">Step 1 — The Supply</p>
                  <div className="rounded-xl bg-emerald-50 dark:bg-emerald-900/10 border-2 border-emerald-200 dark:border-emerald-500/30 p-4 text-center">
                    <p className="text-[14px] font-extrabold text-emerald-800 dark:text-emerald-300">350,000+ Experiences</p>
                    <p className="text-[11px] text-muted mt-1">Museums, Tours, Attractions — 134 cities in 51 countries</p>
                  </div>
                </div>

                <div className="flex justify-center text-emerald-500/40">
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="none"><path d="M10 0v20M4 16l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>

                {/* Step 2: TicketMatch */}
                <div>
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-accent">Step 2 — The Platform</p>
                  <div className="rounded-2xl border-2 border-accent/30 bg-surface p-5 transition-colors">
                    <div className="mb-3 flex justify-center"><div className="rounded-lg bg-accent px-4 py-1.5 text-[12px] font-bold text-white">TicketMatch — Finds the Best Deal</div></div>
                    <div className="flex flex-wrap justify-center gap-2">
                      {["8 AI Agents", "Live Data", "QR Vouchers", "10 APIs", "Package Builder", "Analytics"].map((f) => (
                        <span key={f} className="rounded-full bg-surface-alt px-3 py-1 text-[10px] font-semibold text-muted transition-colors">{f}</span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-center text-accent/40">
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="none"><path d="M10 0v20M4 16l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>

                {/* Step 3: Tour Operators */}
                <div>
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-blue-600 dark:text-blue-400">Step 3 — Your Team Books</p>
                  <div className="rounded-xl bg-blue-50 dark:bg-blue-900/10 border-2 border-blue-200 dark:border-blue-500/30 p-4 text-center">
                    <p className="text-[13px] font-extrabold text-blue-800 dark:text-blue-200">Tour Operators · DMCs · Agencies · Resellers</p>
                    <p className="text-[11px] text-muted mt-1">Browse, compare, and book the best deals</p>
                  </div>
                </div>

                <div className="flex justify-center text-purple-500/40">
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="none"><path d="M10 0v20M4 16l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>

                {/* Step 4: TicketMatch delivers */}
                <div>
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-accent">Step 4 — Supplier Delivers to You</p>
                  <div className="rounded-xl bg-[#1e3a5f] dark:bg-[#0f1729] border-2 border-accent/30 p-4 text-center">
                    <p className="text-[12px] font-bold text-white">QR Voucher from supplier → You forward to client</p>
                    <p className="text-[10px] text-blue-300 mt-1">Invoice, confirmation &amp; voucher — all automatic</p>
                  </div>
                </div>

                <div className="flex justify-center text-amber-500/40">
                  <svg width="20" height="24" viewBox="0 0 20 24" fill="none"><path d="M10 0v20M4 16l6 6 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </div>

                {/* Step 5: End Consumer */}
                <div>
                  <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-widest text-amber-600 dark:text-amber-400">Step 5 — Your Client Receives the Ticket</p>
                  <div className="rounded-xl bg-amber-50 dark:bg-amber-900/10 border-2 border-amber-300 dark:border-amber-500/30 p-4 text-center">
                    <p className="text-[13px] font-extrabold text-amber-800 dark:text-amber-200">QR Ticket · Best Price · Scan &amp; Enter</p>
                    <p className="text-[11px] text-muted mt-1">Happy guests, seamless experience</p>
                  </div>
                </div>
              </div>
            </div>

            {/* ── 3 benefit cards below ── */}
            <div className="mt-14 grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" className="text-accent" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <h3 className="mt-4 text-[15px] font-bold">Built for scale</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  Whether you manage 5 or 5,000 groups per year — our ecosystem handles the complexity so you can focus on growing your business.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                  </svg>
                </div>
                <h3 className="mt-4 text-[15px] font-bold">10 supplier APIs in one</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  350,000+ experiences from 10 major supplier APIs across 134 cities in 51 countries. Connected, aggregated and searchable in one powerful dashboard.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/5">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" />
                  </svg>
                </div>
                <h3 className="mt-4 text-[15px] font-bold">8 AI agents that sell</h3>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">
                  Every role gets their own AI agent. Emma speaks every language, knows every experience and helps you build the perfect itinerary in minutes.
                </p>
              </div>
            </div>
          </div>
          </ScrollReveal>
        </section>


        {/* ════════════ HOW IT WORKS — with animated step connectors ════════════ */}
        <section id="how-it-works" className="py-24 md:py-32 bg-background transition-colors snap-start">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">How it works</p>
              <h2 className="mx-auto mt-3 max-w-lg text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                Three steps to unlock the ecosystem.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                From membership request to confirmed bookings — designed for travel professionals who mean business.
              </p>
            </div>

            {/* Step connector (desktop) + Cards */}
            <div className="relative mt-14">
              {/* Animated connector line — desktop only */}
              <svg viewBox="0 0 960 8" fill="none" className="absolute top-[50%] left-0 w-full -translate-y-1/2 z-0 pointer-events-none hidden md:block">
                <style>{`
                  @keyframes step-flow { 0% { cx: 80; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { cx: 880; opacity: 0; } }
                `}</style>
                <line x1="80" y1="4" x2="880" y2="4" stroke="white" strokeWidth="1" strokeDasharray="6 4" opacity="0.2" />
                <circle r="4" cy="4" fill="#3B82F6" style={{ animation: "step-flow 4s ease-in-out infinite" }} />
                <circle r="4" cy="4" fill="#60A5FA" style={{ animation: "step-flow 4s ease-in-out 2s infinite" }} />
              </svg>
              <div className="relative z-10 grid gap-5 md:grid-cols-3">
                {[
                  { step: "1", title: "Request Membership", desc: "Register your company with business details. We review every application personally and activate your account within 24 hours.", tags: ["Manual review", "24h activation"], bg: "from-blue-600 to-blue-800", iconPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 11h-6M19 8v6" },
                  { step: "2", title: "Explore & Build", desc: "Browse 350,000+ experiences across 134 cities in 51 countries. Create itineraries, let AI suggest the best matches, and compare exclusive B2B rates.", tags: ["300K+ experiences", "AI suggestions"], bg: "from-amber-500 to-orange-600", iconPath: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" },
                  { step: "3", title: "Book & Manage", desc: "Confirm bookings at exclusive rates, generate QR vouchers per guest, track everything live with real-time analytics.", tags: ["Exclusive rates", "Live tracking"], bg: "from-emerald-500 to-emerald-700", iconPath: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
                ].map((s, i) => (
                  <div key={s.step} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.bg} p-6 text-white transition-[transform,box-shadow] hover:shadow-xl hover:scale-[1.02]`}>
                    <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                    <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
                    <div className="relative flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={s.iconPath} /></svg>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-white/80 uppercase tracking-wider">Step {s.step}</p>
                        <h3 className="text-lg font-bold">{s.title}</h3>
                      </div>
                    </div>
                    <p className="relative mt-3 text-[13px] leading-relaxed text-white/80">{s.desc}</p>
                    <div className="relative mt-4 flex flex-wrap gap-2">
                      {s.tags.map((t) => (
                        <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">{t}</span>
                      ))}
                    </div>
                    {i < 2 && (
                      <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                        <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ PLATFORM FEATURES — SVG icons ════════════ */}
        <section id="features" className="bg-gradient-to-b from-[var(--stats-from)] to-[var(--stats-to)] py-24 md:py-32 text-white transition-colors snap-start">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-blue-400">Platform Features</p>
              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                Everything you need to dominate<br />the group travel market.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-white/80">
                Not just a booking tool — a complete B2B ecosystem with 8 AI agents, 10 supplier APIs, live data, and smart automation.
              </p>
            </div>

            <div className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[
                { Icon: FiBot, title: "8 AI Agents — Per Role", desc: "Every user gets their own AI agent tailored to their role. Bookers, resellers, suppliers, developers and admins each get specialized intelligence.", tag: "AI-Powered", tagColor: "bg-purple-500/20 text-purple-300" },
                { Icon: FiMap, title: "Live City Map", desc: "Interactive Google Maps with live busyness data, walking routes and estimated travel times — powered by Google Places API across 134 cities in 51 countries.", tag: "Live Data", tagColor: "bg-emerald-500/20 text-emerald-300" },
                { Icon: FiPackage, title: "Package Builder", desc: "Bundle multiple experiences into custom packages with automatic pricing, group discounts and shareable proposals for your clients.", tag: "New", tagColor: "bg-amber-500/20 text-amber-300" },
                { Icon: FiTicket, title: "QR Vouchers", desc: "Generate digital vouchers with QR codes for every booking. Share via link, print or scan at the venue entrance.", tag: "Digital", tagColor: "bg-blue-500/20 text-blue-300" },
                { Icon: FiSun, title: "Weather & Route Planner", desc: "7-day weather forecasts per city with smart indoor/outdoor suggestions and a day route planner with time optimization.", tag: "Smart Planning", tagColor: "bg-cyan-500/20 text-cyan-300" },
                { Icon: FiChart, title: "Analytics Dashboard", desc: "Real-time insights into bookings, revenue, registrations and performance with beautiful charts and KPI tracking.", tag: "Insights", tagColor: "bg-indigo-500/20 text-indigo-300" },
                { Icon: FiShield, title: "Role-Based Access", desc: "5 specialized roles: Booker, Reseller, Developer, Supplier and Admin. Each role sees only their tools, their agent and their data.", tag: "Security", tagColor: "bg-pink-500/20 text-pink-300" },
                { Icon: FiFile, title: "Invoice Generation", desc: "Professional PDF invoices with VAT calculation, company details and payment terms — generated in one click per group.", tag: "Automation", tagColor: "bg-orange-500/20 text-orange-300" },
                { Icon: FiBell, title: "Real-Time Notifications", desc: "Instant alerts via email, Telegram and WhatsApp for new bookings, status changes and team activity.", tag: "Multi-Channel", tagColor: "bg-red-500/20 text-red-300" },
              ].map((f) => (
                <div key={f.title} className="group relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-[background-color,border-color] hover:bg-white/10 hover:border-white/20">
                  {/* Gradient top line on hover */}
                  <div className="absolute top-0 left-4 right-4 h-[2px] rounded-full bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-white/80">
                      <f.Icon />
                    </div>
                    <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${f.tagColor}`}>{f.tag}</span>
                  </div>
                  <h3 className="mt-3 text-[15px] font-bold">{f.title}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-white/70">{f.desc}</p>
                </div>
              ))}
            </div>

          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ CITY SEARCH PREVIEW — Booking.com style ════════════ */}
        <section id="search" className="py-20 md:py-28 bg-background transition-colors">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Explore the Ecosystem</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                Search any city. See what&apos;s available.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                350,000+ experiences across 134 cities in 51 countries worldwide. Type any city to preview what&apos;s waiting for your clients.
              </p>
            </div>
            <div className="mx-auto max-w-2xl">
              <CitySearchPreview />
            </div>
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ SAVE VS RETAIL — B2B Pricing Teaser ════════════ */}
        <section className="py-20 md:py-28 bg-surface transition-colors snap-start">
          <div className="mx-auto max-w-7xl px-6">
            <ScrollReveal>
              <div className="mx-auto max-w-3xl text-center mb-12">
                <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">B2B Advantage</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                  Retail prices are for tourists. You&apos;re a pro.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                  TicketMatch members unlock exclusive B2B rates across 350,000+ experiences. Here&apos;s what you&apos;re missing.
                </p>
              </div>
              <SaveVsRetail />
            </ScrollReveal>
          </div>
        </section>

        {/* ════════════ USE CASE SCENARIOS ════════════ */}
        <section id="use-cases" className="py-20 md:py-28 bg-surface transition-colors">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center mb-14">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Built for Every Workflow</p>
              <h2 className="mx-auto mt-3 max-w-2xl text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                However you operate, TicketMatch fits.
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  role: "Tour Operator",
                  scenario: "Managing 200 guests across 3 days in Amsterdam",
                  features: ["AI itinerary builder", "QR vouchers per guest", "Live busyness scheduling", "Package builder"],
                  gradient: "from-blue-600 to-blue-800",
                  icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z",
                },
                {
                  role: "DMC",
                  scenario: "Planning a 5-day multi-city Europe incentive trip",
                  features: ["Multi-city management", "Route planner", "Weather intelligence", "PDF proposals"],
                  gradient: "from-purple-600 to-purple-800",
                  icon: "M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                },
                {
                  role: "Travel Agency",
                  scenario: "Selling curated city packages to corporate clients",
                  features: ["Exclusive B2B rates", "Branded PDF exports", "Commission tracking", "Reseller portal"],
                  gradient: "from-emerald-600 to-emerald-800",
                  icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4",
                },
                {
                  role: "Corporate Planner",
                  scenario: "Organizing team events for 50 employees in Rotterdam",
                  features: ["Real-time analytics", "Team collaboration", "Notification alerts", "Budget tracking"],
                  gradient: "from-amber-600 to-amber-800",
                  icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01",
                },
              ].map((uc) => (
                <div key={uc.role} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${uc.gradient} p-6 text-white transition-[transform,box-shadow] hover:shadow-xl hover:scale-[1.02]`}>
                  <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={uc.icon} /></svg>
                    </div>
                    <p className="text-[11px] font-medium text-white/80 uppercase tracking-wider">{uc.role}</p>
                    <h3 className="mt-1 text-[15px] font-bold leading-snug">{uc.scenario}</h3>
                    <div className="mt-4 space-y-1.5">
                      {uc.features.map((f) => (
                        <div key={f} className="flex items-center gap-2 text-[12px] text-white/70">
                          <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full bg-white/20"><IconCheck /></span>
                          {f}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ ROI CALCULATOR — Interactive savings tool ════════════ */}
        <section id="roi" className="py-20 md:py-28 bg-background transition-colors">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-12">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Calculate Your Savings</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                See what TicketMatch saves you.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Our B2B rates save you an average of 18% compared to retail pricing. Calculate your potential savings below.
              </p>
            </div>
            <div className="mx-auto max-w-3xl">
              <ROICalculator />
            </div>
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ FAQ — Comprehensive accordion ════════════ */}
        <section id="faq" className="py-20 md:py-28 bg-surface transition-colors">
          <ScrollReveal>
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center mb-4">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">FAQ</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                Everything you need to know.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Can&apos;t find the answer you&apos;re looking for? Ask Emma — our AI assistant knows everything about TicketMatch.
              </p>
            </div>
            <FAQ />
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ PRICING — B2B, Behind Membership ════════════ */}
        <section id="pricing" className="relative overflow-hidden bg-gradient-to-b from-background via-surface-alt to-background py-24 md:py-32 transition-colors snap-start">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(59,130,246,0.04),transparent_50%)] blur-mobile-hidden" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(99,102,241,0.04),transparent_50%)] blur-mobile-hidden" />

          <ScrollReveal>
          <div className="relative mx-auto max-w-7xl px-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                <span className="text-[12px] font-semibold text-accent">B2B Membership Plans</span>
              </div>
              <h2 className="mx-auto mt-5 max-w-2xl text-3xl font-extrabold tracking-tight md:text-[2.75rem] md:leading-[1.15]">
                Join the ecosystem.<br />Start free, scale unlimited.
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-[15px] leading-relaxed text-muted">
                Every membership is manually reviewed and approved. No setup fees. No hidden costs. Cancel anytime.<br className="hidden md:block" />
                Exclusive B2B rates visible only to active members.
              </p>
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-3 md:items-start">
              {/* Explorer (Free) */}
              <div className="relative overflow-hidden rounded-2xl border border-card-border bg-card-bg p-8 transition-shadow hover:shadow-xl">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-alt">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
                  </div>
                  <h3 className="text-lg font-bold">Explorer</h3>
                </div>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">&euro;0</span>
                  <span className="text-sm text-muted">forever</span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  Explore the ecosystem. See what&apos;s possible before you commit.
                </p>
                <div className="my-6 h-px bg-border/60" />
                <ul className="space-y-3">
                  {["Browse full experience catalog", "Live city map (134 cities in 51 countries)", "1 team member", "AI assistant (Emma)", "Weather forecasts", "5 bookings per month", "Email notifications"].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600"><IconCheck /></span>
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3.5 text-[13px] font-semibold transition-colors hover:bg-surface-alt"
                >
                  Request Free Access <IconArrow />
                </Link>
              </div>

              {/* Growth (Pro) — Most Popular */}
              <div className="relative overflow-hidden rounded-2xl border-2 border-accent/30 bg-gradient-to-b from-accent/[0.03] to-card-bg p-8 shadow-xl shadow-accent/5 md:-mt-4 md:pb-10">
                <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-accent/10 blur-[40px]" />
                <div className="absolute right-4 top-4 rounded-full bg-accent px-3 py-1 text-[11px] font-semibold text-white shadow-sm">
                  Most Popular
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgb(59,130,246)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>
                  </div>
                  <h3 className="text-lg font-bold">Growth</h3>
                </div>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight text-accent">&euro;49</span>
                  <span className="text-sm text-muted">/month</span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-muted">
                  Full ecosystem access. Unlimited bookings. Built for operators who scale.
                </p>
                <div className="my-6 h-px bg-accent/10" />
                <ul className="space-y-3">
                  {[
                    "Unlimited bookings",
                    "Exclusive B2B rates",
                    "Live busyness data (Google API)",
                    "Up to 5 team members",
                    "QR vouchers & digital tickets",
                    "Package builder",
                    "PDF invoices & itineraries",
                    "Smart route planner",
                    "Weather & best-time insights",
                    "Telegram & WhatsApp alerts",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent"><IconCheck /></span>
                      <span className="font-medium">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard/pricing"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-accent px-6 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-[box-shadow,filter] hover:shadow-accent/40 hover:brightness-110"
                >
                  Start 14-Day Free Trial <IconArrow />
                </Link>
                <p className="mt-3 text-center text-[11px] text-muted">No credit card required · Cancel anytime</p>
              </div>

              {/* Enterprise */}
              <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-gray-950 p-8 text-white transition-shadow hover:shadow-xl">
                <div className="absolute -left-12 -top-12 h-32 w-32 rounded-full bg-white/5 blur-[40px]" />
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                  </div>
                  <h3 className="text-lg font-bold">Enterprise</h3>
                </div>
                <div className="mt-5 flex items-baseline gap-1">
                  <span className="text-5xl font-extrabold tracking-tight">&euro;149</span>
                  <span className="text-sm text-white/70">/month</span>
                </div>
                <p className="mt-3 text-[13px] leading-relaxed text-white/80">
                  For agencies & DMCs managing multiple groups across cities.
                </p>
                <div className="my-6 h-px bg-white/10" />
                <ul className="space-y-3">
                  {[
                    "Everything in Growth",
                    "Unlimited team members",
                    "Advanced analytics dashboard",
                    "API access & integrations",
                    "White-label options",
                    "Custom AI agent training",
                    "Dedicated account manager",
                    "Multi-city management",
                    "Priority onboarding & SLA",
                    "Custom invoicing",
                  ].map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13px]">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-white/10 text-emerald-400"><IconCheck /></span>
                      <span className="text-white/90">{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard/pricing"
                  className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-[13px] font-semibold text-gray-900 transition-colors hover:bg-gray-100"
                >
                  Start Enterprise <IconArrow />
                </Link>
              </div>
            </div>

            {/* Ecosystem trust bar */}
            <div className="mt-16 flex flex-col items-center gap-4 text-center">
              <p className="text-[13px] font-medium text-muted">Trusted by tour operators, DMCs and travel agencies across Europe</p>
              <div className="flex flex-wrap justify-center gap-6 text-[12px] text-muted">
                {["SOC 2 Compliant", "GDPR Ready", "99.9% Uptime", "256-bit SSL", "EU Data Centers"].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5">
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1.5l1.5 3 3.5.5-2.5 2.5.5 3.5L8 9.5 4.5 11l.5-3.5L2.5 5l3.5-.5L8 1.5z" fill="currentColor" opacity="0.4"/></svg>
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
          </ScrollReveal>
        </section>

        {/* ════════════ CTA — FOMO with floating particles ════════════ */}
        <section className="relative overflow-hidden bg-gradient-to-b from-gray-950 to-gray-900 py-24 md:py-32 snap-start">
          {/* Decorative glows */}
          <div className="absolute -left-40 top-0 h-[400px] w-[400px] rounded-full bg-accent/20 blur-[120px] blur-mobile-hidden" />
          <div className="absolute -right-40 bottom-0 h-[400px] w-[400px] rounded-full bg-blue-600/15 blur-[120px] blur-mobile-hidden" />
          <div className="absolute left-1/2 top-1/2 h-[300px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent/5 blur-[80px] blur-mobile-hidden" />

          {/* Floating decorative particle SVGs */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none blur-mobile-hidden" fill="none" xmlns="http://www.w3.org/2000/svg">
            <style>{`
              @keyframes cta-float-1 { 0%, 100% { transform: translateY(0px); opacity: 0.15; } 50% { transform: translateY(-20px); opacity: 0.35; } }
              @keyframes cta-float-2 { 0%, 100% { transform: translateY(0px); opacity: 0.1; } 50% { transform: translateY(-30px); opacity: 0.25; } }
            `}</style>
            <circle cx="10%" cy="30%" r="3" fill="#3B82F6" style={{ animation: "cta-float-1 6s ease-in-out infinite" }} />
            <circle cx="85%" cy="25%" r="2" fill="#8B5CF6" style={{ animation: "cta-float-2 8s ease-in-out 1s infinite" }} />
            <circle cx="20%" cy="70%" r="2.5" fill="#10B981" style={{ animation: "cta-float-1 7s ease-in-out 2s infinite" }} />
            <circle cx="75%" cy="75%" r="3" fill="#F59E0B" style={{ animation: "cta-float-2 5s ease-in-out 0.5s infinite" }} />
            <circle cx="50%" cy="15%" r="2" fill="#06B6D4" style={{ animation: "cta-float-1 9s ease-in-out 3s infinite" }} />
            <circle cx="35%" cy="85%" r="2" fill="#60A5FA" style={{ animation: "cta-float-2 7s ease-in-out 1.5s infinite" }} />
          </svg>

          <div className="relative mx-auto max-w-4xl px-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5">
              <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[12px] font-semibold text-white/70">Applications open — limited memberships</span>
            </div>
            <h2 className="mt-6 text-3xl font-extrabold tracking-tight text-white md:text-[3rem] md:leading-[1.1]">
              350,000+ experiences.<br />10 supplier APIs.<br />One membership.
            </h2>
            <p className="mx-auto mt-5 max-w-lg text-[15px] leading-relaxed text-white/70">
              Tour operators, DMCs and travel agencies worldwide are joining TicketMatch. Get exclusive B2B access to 134 cities in 51 countries, 8 AI agents, real-time data and smart automation — free to start.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-4">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-[14px] font-semibold text-gray-900 shadow-xl transition-[background-color,box-shadow] hover:bg-gray-100 hover:shadow-2xl"
              >
                Request Membership <IconArrow />
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-8 py-4 text-[14px] font-semibold text-white transition-[background-color,border-color] hover:border-white/40 hover:bg-white/5"
              >
                Become a Supplier
              </Link>
            </div>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[12px] text-white/80">
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">&#10003;</span> Free tier available</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">&#10003;</span> Manually reviewed</span>
              <span className="flex items-center gap-1.5"><span className="text-emerald-400">&#10003;</span> B2B rates unlocked</span>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
