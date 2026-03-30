import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChat from "@/components/ui/AIChat";

/* ───── small icons ───── */
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

/* ───── data ───── */
const cities = [
  { name: "Amsterdam", country: "NL", count: "45+ venues", active: true, image: "/images/city-amsterdam.jpg" },
  { name: "Brussels", country: "BE", count: "30+ venues", active: true, image: "/images/city-brussels.jpg" },
  { name: "Berlin", country: "DE", count: "Coming soon", active: false, image: "/images/city-berlin.jpg" },
  { name: "Paris", country: "FR", count: "Coming soon", active: false, image: "/images/city-paris.jpg" },
];

/* ───── page ───── */
export default function Home() {
  return (
    <>
      {/* Mobile: fullscreen chat app */}
      <div className="fixed inset-0 z-50 flex flex-col md:hidden">
        <AIChat fullscreen />
      </div>

      {/* Desktop: normal landing page */}
      <div className="hidden md:flex md:flex-col md:min-h-full">
      <Header />
      <main className="flex-1">

        {/* ════════════ HERO ════════════ */}
        <section className="relative overflow-hidden bg-white">
          <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">

              {/* Left — copy */}
              <div className="max-w-xl">
                <p className="mb-5 text-[13px] font-medium uppercase tracking-[0.15em] text-accent">
                  B2B City Access Platform
                </p>

                <h1 className="text-[2.75rem] font-extrabold leading-[1.05] tracking-tight md:text-[3.75rem]">
                  Book city experiences
                  <span className="block text-accent">for your groups.</span>
                </h1>

                <p className="mt-6 text-[17px] leading-[1.65] text-muted">
                  Museums, attractions, cruises, transport — sourced from
                  multiple suppliers, managed in one dashboard. Built for tour
                  operators, DMCs and travel agencies who need B2B rates and
                  group tools.
                </p>

                <div className="mt-8 flex items-center gap-3">
                  <Link
                    href="/auth/register"
                    className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
                  >
                    Request Access <IconArrow />
                  </Link>
                  <Link
                    href="#how-it-works"
                    className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-[13px] font-semibold transition-colors hover:bg-gray-50"
                  >
                    How it works
                  </Link>
                </div>

                {/* Trust points */}
                <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3">
                  {["Multi-supplier catalog", "Group management tools", "B2B pricing", "AI-assisted booking"].map((t) => (
                    <span key={t} className="flex items-center gap-2 text-[13px] text-muted">
                      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"><IconCheck /></span>
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              {/* Right — Hero image with AI Chat overlay */}
              <div className="relative">
                {/* Main hero image container */}
                <div className="relative aspect-[16/9] overflow-hidden rounded-3xl shadow-2xl shadow-black/10">
                  {/* Hero photo */}
                  <img
                    src="/images/hero-amsterdam.jpg"
                    alt="Amsterdam canals at golden hour — aerial view of historic canal houses, bridges and boats"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  {/* Dark overlay for readability of badges */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                  {/* Text overlay */}
                  <div className="absolute left-6 top-6">
                    <div className="rounded-xl bg-black/20 px-4 py-2 backdrop-blur-md">
                      <p className="text-[11px] font-medium text-white/80">Most popular destination</p>
                      <p className="text-lg font-bold text-white">Amsterdam</p>
                    </div>
                  </div>

                  {/* Stats overlay */}
                  <div className="absolute bottom-6 left-6 flex gap-3">
                    <div className="rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-md">
                      <p className="text-xl font-bold text-white">45+</p>
                      <p className="text-[10px] text-white/70">Venues</p>
                    </div>
                    <div className="rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-md">
                      <p className="text-xl font-bold text-white">B2B</p>
                      <p className="text-[10px] text-white/70">Rates</p>
                    </div>
                    <div className="rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-md">
                      <p className="text-xl font-bold text-white">24h</p>
                      <p className="text-[10px] text-white/70">Access</p>
                    </div>
                  </div>
                </div>

                {/* AI Chat — floating overlay bottom-right */}
                <div className="absolute -bottom-6 -right-4 z-10 hidden lg:block">
                  <AIChat />
                </div>

                {/* AI Chat — mobile: below image */}
                <div className="mt-6 lg:hidden">
                  <AIChat />
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ════════════ LOGOS ════════════ */}
        <section className="border-y border-border/40">
          <div className="mx-auto flex max-w-7xl items-center justify-center gap-10 px-6 py-6 opacity-40">
            <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted">Suppliers</span>
            <span className="h-3 w-px bg-border" />
            {["Combitiq", "Tiqets", "GetYourGuide", "Viator"].map((n) => (
              <span key={n} className="text-[13px] font-bold tracking-tight">{n}</span>
            ))}
          </div>
        </section>

        {/* ════════════ HOW IT WORKS — Interactive Infographic ════════════ */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">How it works</p>
              <h2 className="mx-auto mt-3 max-w-lg text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                Three steps to smarter group bookings.
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
                From sign-up to confirmed bookings — streamlined for travel professionals.
              </p>
            </div>

            <div className="relative mt-16">
              {/* Connecting line (desktop) */}
              <div className="absolute left-0 right-0 top-[72px] hidden h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent md:block" />

              <div className="grid gap-8 md:grid-cols-3">
                {/* Step 1 */}
                <div className="group relative rounded-2xl border border-border/60 bg-white p-8 text-center transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-accent to-blue-700 shadow-lg shadow-accent/20 transition-transform group-hover:scale-110">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                  </div>
                  <div className="mx-auto mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">1</div>
                  <h3 className="mt-4 text-base font-bold">Request Access</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">Register your company with your KVK and business details. We verify and activate your B2B account within 24 hours.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-accent/5 px-3 py-1 text-[11px] font-medium text-accent">Free signup</span>
                    <span className="rounded-full bg-accent/5 px-3 py-1 text-[11px] font-medium text-accent">24h activation</span>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="group relative rounded-2xl border border-border/60 bg-white p-8 text-center transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-lg shadow-amber-500/20 transition-transform group-hover:scale-110">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /><path d="M8 14h.01" /><path d="M12 14h.01" /><path d="M16 14h.01" /><path d="M8 18h.01" /><path d="M12 18h.01" />
                    </svg>
                  </div>
                  <div className="mx-auto mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600">2</div>
                  <h3 className="mt-4 text-base font-bold">Build Your Trip</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">Browse our multi-supplier catalog, create day-by-day itineraries, upload guest lists via CSV and let AI suggest the best matches.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-amber-500/5 px-3 py-1 text-[11px] font-medium text-amber-600">Itinerary builder</span>
                    <span className="rounded-full bg-amber-500/5 px-3 py-1 text-[11px] font-medium text-amber-600">AI suggestions</span>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="group relative rounded-2xl border border-border/60 bg-white p-8 text-center transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 shadow-lg shadow-emerald-500/20 transition-transform group-hover:scale-110">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
                    </svg>
                  </div>
                  <div className="mx-auto mt-4 flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">3</div>
                  <h3 className="mt-4 text-base font-bold">Book &amp; Manage</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">Confirm bookings at exclusive B2B rates, generate vouchers and QR codes per guest, track everything from your live dashboard.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-emerald-500/5 px-3 py-1 text-[11px] font-medium text-emerald-600">B2B rates</span>
                    <span className="rounded-full bg-emerald-500/5 px-3 py-1 text-[11px] font-medium text-emerald-600">Live tracking</span>
                  </div>
                </div>
              </div>

              {/* Arrow connectors (desktop) */}
              <div className="absolute top-[72px] left-[33.3%] hidden -translate-x-1/2 md:block">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-border/60 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" /></svg>
                </div>
              </div>
              <div className="absolute top-[72px] left-[66.6%] hidden -translate-x-1/2 md:block">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-border/60 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" /></svg>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ CATEGORIES — with SVG icons ════════════ */}
        <section id="categories" className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Categories</p>
            <h2 className="mt-3 max-w-lg text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
              Everything for a city trip, one platform.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              We start with museums and attractions, then expand category by
              category. Each one plugs into the same dashboard.
            </p>

            <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Museums — Live */}
              <div className="group rounded-2xl border border-border/60 bg-background p-7 transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-50 transition-transform group-hover:scale-105">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 21h18" /><path d="M3 7l9-4 9 4" /><path d="M6 7v14" /><path d="M18 7v14" /><rect x="9" y="10" width="6" height="7" rx="1" /><path d="M12 10v7" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold">Museums</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">Live</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">World-class art, history and iconic collections. From the Rijksmuseum to Moco and everything in between.</p>
                <p className="mt-3 text-[12px] font-semibold text-accent">12 venues</p>
              </div>

              {/* Attractions — Live */}
              <div className="group rounded-2xl border border-border/60 bg-background p-7 transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 transition-transform group-hover:scale-105">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#1d4ed8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="3" /><path d="M12 2v4" /><path d="M12 18v4" /><path d="M4.93 4.93l2.83 2.83" /><path d="M16.24 16.24l2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="M4.93 19.07l2.83-2.83" /><path d="M16.24 7.76l2.83-2.83" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold">Attractions</h3>
                  <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">Live</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted">AMAZE, The Upside Down, Fabrique des Lumières — immersive must-see landmarks and experiences.</p>
                <p className="mt-3 text-[12px] font-semibold text-accent">18 venues</p>
              </div>

              {/* Canal Cruises — Soon */}
              <div className="group rounded-2xl border border-dashed border-border/40 p-7 transition-all hover:border-border/60">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-100 to-cyan-50 opacity-60">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0891b2" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 20c2-1 4-1 6 0s4 1 6 0 4-1 6 0" /><path d="M4 16l4.6-9.4a1 1 0 0 1 1.8 0l2.6 5.2 2.6-5.2a1 1 0 0 1 1.8 0L22 16" /><path d="M12 12v4" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-muted">Canal Cruises</h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-muted">Soon</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted/70">Scenic boat tours, dinner cruises and waterway experiences across city canals.</p>
              </div>

              {/* Public Transport — Soon */}
              <div className="group rounded-2xl border border-dashed border-border/40 p-7 transition-all hover:border-border/60">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-violet-50 opacity-60">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M8 6v6" /><path d="M16 6v6" /><path d="M2 12h20" /><rect x="4" y="3" width="16" height="16" rx="3" /><circle cx="8" cy="16" r="1" /><circle cx="16" cy="16" r="1" /><path d="M4 19l-2 3" /><path d="M20 19l2 3" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-muted">Public Transport</h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-muted">Soon</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted/70">GVB passes, metro cards, hop-on-hop-off buses and multi-day travel cards.</p>
              </div>

              {/* Restaurants — Soon */}
              <div className="group rounded-2xl border border-dashed border-border/40 p-7 transition-all hover:border-border/60">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 opacity-60">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3zm0 0v7" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-muted">Restaurants</h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-muted">Soon</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted/70">Group dining, food tours, culinary experiences and restaurant reservations.</p>
              </div>

              {/* Walking Tours — Soon */}
              <div className="group rounded-2xl border border-dashed border-border/40 p-7 transition-all hover:border-border/60">
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-lime-100 to-lime-50 opacity-60">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#65a30d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-[15px] font-bold text-muted">Walking Tours</h3>
                  <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-muted">Soon</span>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-muted/70">Guided tours, pub crawls, themed city walks and architectural highlights.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ CITIES ════════════ */}
        <section id="cities" className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Cities</p>
            <h2 className="mt-3 max-w-lg text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
              Launching city by city.
            </h2>
            <p className="mt-4 max-w-xl text-[15px] leading-relaxed text-muted">
              Deep local inventory per city. Amsterdam and Brussels are live, more
              coming soon.
            </p>

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cities.map((city) => (
                <div
                  key={city.name}
                  className={`group relative overflow-hidden rounded-2xl border transition-all ${
                    city.active
                      ? "border-border/60 bg-white hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5"
                      : "border-dashed border-border/40"
                  }`}
                >
                  {/* Image area */}
                  <div className="relative aspect-[3/2] overflow-hidden">
                    <img
                      src={city.image}
                      alt={`${city.name} city view`}
                      className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    {!city.active && (
                      <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px]" />
                    )}
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-[15px] font-bold">{city.name}</h3>
                      {city.active && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent transition-transform group-hover:translate-x-0.5">
                          <IconArrow />
                        </span>
                      )}
                    </div>
                    <p className="mt-1 text-[12px] font-semibold text-accent">{city.count}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ DASHBOARD PREVIEW ════════════ */}
        <section className="bg-white py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid items-center gap-16 lg:grid-cols-2">

              {/* Image placeholder — for dashboard screenshot */}
              <div className="relative">
                <div className="aspect-[4/3] overflow-hidden rounded-2xl border border-border/60 bg-gradient-to-br from-gray-50 to-gray-100 shadow-2xl shadow-black/5">
                  <div className="flex h-full flex-col items-center justify-center gap-2">
                    <div className="h-12 w-12 rounded-xl bg-accent/10" />
                    <p className="text-[13px] font-medium text-muted">Dashboard screenshot</p>
                    <p className="text-[11px] text-muted/50">Replace with actual product image</p>
                  </div>
                </div>
              </div>

              {/* Copy */}
              <div>
                <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">Your dashboard</p>
                <h2 className="mt-3 text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
                  Built for how you actually work.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                  Not another generic booking tool. TicketMatch is designed
                  specifically for group travel procurement.
                </p>
                <ul className="mt-8 space-y-3">
                  {[
                    "Upload guest lists via CSV or Excel",
                    "Build day-by-day itineraries for any group size",
                    "Book across multiple suppliers in one checkout",
                    "Generate vouchers and QR codes per guest",
                    "Full booking history, invoicing and reporting",
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-3 text-[13px]">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><IconCheck /></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/auth/register"
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
                >
                  Request Access <IconArrow />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ CTA ════════════ */}
        <section className="py-24 md:py-32">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="text-3xl font-extrabold tracking-tight md:text-[2.75rem]">
              Ready to simplify<br />group bookings?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Join tour operators and travel agencies across Europe who use
              TicketMatch to book city experiences at B2B rates.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
              >
                Request Access <IconArrow />
              </Link>
              <Link
                href="/partners"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-[13px] font-semibold transition-colors hover:bg-gray-50"
              >
                Become a Supplier
              </Link>
            </div>
          </div>
        </section>

      </main>
      <Footer />
      </div>
    </>
  );
}
