import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import AIChat from "@/components/ui/AIChat";
import MobileBottomBar from "@/components/layout/MobileBottomBar";

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
      <Header />
      <main className="flex-1 pb-20 md:pb-0">

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
                  <img
                    src="/images/hero-amsterdam.jpg"
                    alt="Amsterdam canals at golden hour — aerial view of historic canal houses, bridges and boats"
                    className="absolute inset-0 h-full w-full object-cover"
                  />
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

                {/* AI Chat — floating overlay bottom-left */}
                <div className="absolute -bottom-6 -left-4 z-10 hidden lg:block">
                  <AIChat />
                </div>

                {/* AI Chat on mobile: use the AI Agent button in the bottom bar */}
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

            {/* Animated SVG keyframes */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes tm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes tm-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
              @keyframes tm-pulse { 0%, 100% { opacity: 0.3; r: 3; } 50% { opacity: 0.7; r: 4.5; } }
              @keyframes tm-dot-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
              @keyframes tm-dash { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
              @keyframes tm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
            ` }} />

            <div className="relative mt-16">
              {/* Connecting line (desktop) */}
              <div className="absolute left-0 right-0 top-[100px] hidden h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent md:block" />

              <div className="grid gap-8 md:grid-cols-3">
                {/* Step 1 — Request Access */}
                <div className="group relative rounded-2xl border border-border/60 bg-white p-8 text-center transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                  <div className="mx-auto mb-2 h-[140px] w-[140px]">
                    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Outer rotating ring */}
                      <circle cx="70" cy="70" r="62" stroke="#2563eb" strokeWidth="1" strokeDasharray="6 4" opacity="0.2" style={{ transformOrigin: '70px 70px', animation: 'tm-spin 20s linear infinite' }} />
                      {/* Inner rotating ring */}
                      <circle cx="70" cy="70" r="48" stroke="#2563eb" strokeWidth="0.75" strokeDasharray="3 5" opacity="0.15" style={{ transformOrigin: '70px 70px', animation: 'tm-spin-rev 15s linear infinite' }} />
                      {/* Center icon bg */}
                      <circle cx="70" cy="70" r="32" fill="url(#grad1)" />
                      {/* User icon */}
                      <path d="M60 82v-1.5a6 6 0 0 1 6-6h8a6 6 0 0 1 6 6V82" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="70" cy="65" r="5" stroke="white" strokeWidth="1.5" />
                      {/* Pulsing dots on ring */}
                      <circle cx="70" cy="8" r="3" fill="#2563eb" style={{ animation: 'tm-pulse 2s ease-in-out infinite' }} />
                      <circle cx="132" cy="70" r="3" fill="#3b82f6" style={{ animation: 'tm-pulse 2s ease-in-out 0.5s infinite' }} />
                      <circle cx="70" cy="132" r="3" fill="#2563eb" style={{ animation: 'tm-pulse 2s ease-in-out 1s infinite' }} />
                      <circle cx="8" cy="70" r="3" fill="#3b82f6" style={{ animation: 'tm-pulse 2s ease-in-out 1.5s infinite' }} />
                      {/* Small orbiting nodes */}
                      <circle cx="108" cy="32" r="2" fill="#60a5fa" style={{ animation: 'tm-dot-pulse 3s ease-in-out infinite' }} />
                      <circle cx="32" cy="108" r="2" fill="#60a5fa" style={{ animation: 'tm-dot-pulse 3s ease-in-out 1s infinite' }} />
                      <defs><radialGradient id="grad1"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1d4ed8" /></radialGradient></defs>
                    </svg>
                  </div>
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-accent/10 text-xs font-bold text-accent">1</div>
                  <h3 className="mt-3 text-base font-bold">Request Access</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">Register your company with your KVK and business details. We verify and activate your B2B account within 24 hours.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-accent/5 px-3 py-1 text-[11px] font-medium text-accent">Free signup</span>
                    <span className="rounded-full bg-accent/5 px-3 py-1 text-[11px] font-medium text-accent">24h activation</span>
                  </div>
                </div>

                {/* Step 2 — Build Your Trip */}
                <div className="group relative rounded-2xl border border-border/60 bg-white p-8 text-center transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                  <div className="mx-auto mb-2 h-[140px] w-[140px]">
                    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Hexagonal outer ring */}
                      <polygon points="70,5 125,35 125,95 70,125 15,95 15,35" stroke="#f59e0b" strokeWidth="1" strokeDasharray="8 4" fill="none" opacity="0.2" style={{ transformOrigin: '70px 65px', animation: 'tm-spin 25s linear infinite' }} />
                      {/* Inner hexagon */}
                      <polygon points="70,22 108,42 108,82 70,102 32,82 32,42" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="4 6" fill="none" opacity="0.15" style={{ transformOrigin: '70px 62px', animation: 'tm-spin-rev 18s linear infinite' }} />
                      {/* Center icon bg */}
                      <circle cx="70" cy="65" r="30" fill="url(#grad2)" />
                      {/* Calendar icon */}
                      <rect x="55" y="55" width="30" height="24" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
                      <path d="M55 63h30" stroke="white" strokeWidth="1.5" />
                      <path d="M63 51v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      <path d="M77 51v6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      {/* Day dots */}
                      <circle cx="63" cy="70" r="1.5" fill="white" />
                      <circle cx="70" cy="70" r="1.5" fill="white" />
                      <circle cx="77" cy="70" r="1.5" fill="white" />
                      {/* Floating connection dots */}
                      <circle cx="70" cy="5" r="3" fill="#f59e0b" style={{ animation: 'tm-pulse 2.5s ease-in-out infinite' }} />
                      <circle cx="125" cy="35" r="2.5" fill="#fbbf24" style={{ animation: 'tm-dot-pulse 2s ease-in-out 0.3s infinite' }} />
                      <circle cx="125" cy="95" r="2.5" fill="#f59e0b" style={{ animation: 'tm-dot-pulse 2s ease-in-out 0.6s infinite' }} />
                      <circle cx="70" cy="125" r="3" fill="#fbbf24" style={{ animation: 'tm-pulse 2.5s ease-in-out 0.9s infinite' }} />
                      <circle cx="15" cy="95" r="2.5" fill="#f59e0b" style={{ animation: 'tm-dot-pulse 2s ease-in-out 1.2s infinite' }} />
                      <circle cx="15" cy="35" r="2.5" fill="#fbbf24" style={{ animation: 'tm-dot-pulse 2s ease-in-out 1.5s infinite' }} />
                      {/* Connecting lines from dots */}
                      <line x1="70" y1="8" x2="70" y2="35" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3" style={{ animation: 'tm-dash 3s linear infinite' }} />
                      <line x1="70" y1="95" x2="70" y2="122" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="2 3" opacity="0.3" style={{ animation: 'tm-dash 3s linear 1s infinite' }} />
                      <defs><radialGradient id="grad2"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#d97706" /></radialGradient></defs>
                    </svg>
                  </div>
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/10 text-xs font-bold text-amber-600">2</div>
                  <h3 className="mt-3 text-base font-bold">Build Your Trip</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">Browse our multi-supplier catalog, create day-by-day itineraries, upload guest lists via CSV and let AI suggest the best matches.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-amber-500/5 px-3 py-1 text-[11px] font-medium text-amber-600">Itinerary builder</span>
                    <span className="rounded-full bg-amber-500/5 px-3 py-1 text-[11px] font-medium text-amber-600">AI suggestions</span>
                  </div>
                </div>

                {/* Step 3 — Book & Manage */}
                <div className="group relative rounded-2xl border border-border/60 bg-white p-8 text-center transition-all hover:border-accent/30 hover:shadow-xl hover:shadow-accent/5">
                  <div className="mx-auto mb-2 h-[140px] w-[140px]">
                    <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Outer diamond ring */}
                      <rect x="70" y="6" width="88" height="88" rx="4" stroke="#10b981" strokeWidth="1" strokeDasharray="6 4" fill="none" opacity="0.2" style={{ transformOrigin: '70px 70px', transform: 'rotate(45deg) translate(-44px, -44px)', animation: 'tm-spin 22s linear infinite' }} />
                      {/* Inner circle */}
                      <circle cx="70" cy="70" r="46" stroke="#10b981" strokeWidth="0.75" strokeDasharray="4 5" opacity="0.15" style={{ transformOrigin: '70px 70px', animation: 'tm-spin-rev 16s linear infinite' }} />
                      {/* Center icon bg */}
                      <circle cx="70" cy="70" r="30" fill="url(#grad3)" />
                      {/* Checkmark icon */}
                      <path d="M58 70l7 7 17-17" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      {/* Pulsing dots */}
                      <circle cx="70" cy="8" r="3" fill="#10b981" style={{ animation: 'tm-pulse 2s ease-in-out infinite' }} />
                      <circle cx="128" cy="50" r="2.5" fill="#34d399" style={{ animation: 'tm-dot-pulse 2.5s ease-in-out 0.4s infinite' }} />
                      <circle cx="128" cy="90" r="2.5" fill="#10b981" style={{ animation: 'tm-dot-pulse 2.5s ease-in-out 0.8s infinite' }} />
                      <circle cx="70" cy="132" r="3" fill="#34d399" style={{ animation: 'tm-pulse 2s ease-in-out 1.2s infinite' }} />
                      <circle cx="12" cy="90" r="2.5" fill="#10b981" style={{ animation: 'tm-dot-pulse 2.5s ease-in-out 1.6s infinite' }} />
                      <circle cx="12" cy="50" r="2.5" fill="#34d399" style={{ animation: 'tm-dot-pulse 2.5s ease-in-out 2s infinite' }} />
                      {/* Success sparkles */}
                      <circle cx="100" cy="28" r="1.5" fill="#6ee7b7" style={{ animation: 'tm-float 3s ease-in-out infinite' }} />
                      <circle cx="40" cy="112" r="1.5" fill="#6ee7b7" style={{ animation: 'tm-float 3s ease-in-out 1s infinite' }} />
                      <circle cx="115" cy="105" r="1" fill="#a7f3d0" style={{ animation: 'tm-float 4s ease-in-out 0.5s infinite' }} />
                      <defs><radialGradient id="grad3"><stop offset="0%" stopColor="#34d399" /><stop offset="100%" stopColor="#059669" /></radialGradient></defs>
                    </svg>
                  </div>
                  <div className="mx-auto flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/10 text-xs font-bold text-emerald-600">3</div>
                  <h3 className="mt-3 text-base font-bold">Book &amp; Manage</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">Confirm bookings at exclusive B2B rates, generate vouchers and QR codes per guest, track everything from your live dashboard.</p>
                  <div className="mt-5 flex flex-wrap justify-center gap-2">
                    <span className="rounded-full bg-emerald-500/5 px-3 py-1 text-[11px] font-medium text-emerald-600">B2B rates</span>
                    <span className="rounded-full bg-emerald-500/5 px-3 py-1 text-[11px] font-medium text-emerald-600">Live tracking</span>
                  </div>
                </div>
              </div>

              {/* Arrow connectors (desktop) */}
              <div className="absolute top-[100px] left-[33.3%] hidden -translate-x-1/2 md:block">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white border border-border/60 shadow-sm">
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent" /></svg>
                </div>
              </div>
              <div className="absolute top-[100px] left-[66.6%] hidden -translate-x-1/2 md:block">
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
              <div className="group rounded-2xl border border-border/60 bg-background p-7 transition-all hover:border-amber-300/40 hover:shadow-xl hover:shadow-amber-500/5">
                <div className="mb-5 h-[90px] w-[90px]">
                  <svg viewBox="0 0 90 90" fill="none">
                    <circle cx="45" cy="45" r="40" stroke="#b45309" strokeWidth="0.75" strokeDasharray="4 3" opacity="0.15" style={{ transformOrigin: '45px 45px', animation: 'tm-spin 18s linear infinite' }} />
                    <circle cx="45" cy="45" r="28" fill="url(#catGrad1)" />
                    <path d="M33 57h24" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M33 42l12-6 12 6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M37 42v15" stroke="white" strokeWidth="1.2" /><path d="M53 42v15" stroke="white" strokeWidth="1.2" />
                    <rect x="42" y="46" width="6" height="8" rx="1" stroke="white" strokeWidth="1" fill="none" />
                    <circle cx="45" cy="5" r="2.5" fill="#b45309" style={{ animation: 'tm-pulse 2.5s ease-in-out infinite' }} />
                    <circle cx="85" cy="45" r="2" fill="#d97706" style={{ animation: 'tm-dot-pulse 3s ease-in-out 0.5s infinite' }} />
                    <circle cx="45" cy="85" r="2.5" fill="#b45309" style={{ animation: 'tm-pulse 2.5s ease-in-out 1s infinite' }} />
                    <circle cx="5" cy="45" r="2" fill="#d97706" style={{ animation: 'tm-dot-pulse 3s ease-in-out 1.5s infinite' }} />
                    <defs><radialGradient id="catGrad1"><stop offset="0%" stopColor="#fbbf24" /><stop offset="100%" stopColor="#b45309" /></radialGradient></defs>
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
              <div className="group rounded-2xl border border-border/60 bg-background p-7 transition-all hover:border-blue-300/40 hover:shadow-xl hover:shadow-blue-500/5">
                <div className="mb-5 h-[90px] w-[90px]">
                  <svg viewBox="0 0 90 90" fill="none">
                    <circle cx="45" cy="45" r="40" stroke="#1d4ed8" strokeWidth="0.75" strokeDasharray="5 4" opacity="0.15" style={{ transformOrigin: '45px 45px', animation: 'tm-spin-rev 20s linear infinite' }} />
                    <circle cx="45" cy="45" r="28" fill="url(#catGrad2)" />
                    <circle cx="45" cy="45" r="5" stroke="white" strokeWidth="1.5" fill="none" />
                    <path d="M45 33v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M45 52v5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M33 45h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M52 45h5" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M37 37l3.5 3.5" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    <path d="M49.5 49.5L53 53" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
                    <circle cx="45" cy="5" r="2.5" fill="#1d4ed8" style={{ animation: 'tm-pulse 2s ease-in-out infinite' }} />
                    <circle cx="85" cy="45" r="2" fill="#3b82f6" style={{ animation: 'tm-dot-pulse 2.5s ease-in-out 0.6s infinite' }} />
                    <circle cx="45" cy="85" r="2.5" fill="#1d4ed8" style={{ animation: 'tm-pulse 2s ease-in-out 1.2s infinite' }} />
                    <circle cx="5" cy="45" r="2" fill="#3b82f6" style={{ animation: 'tm-dot-pulse 2.5s ease-in-out 1.8s infinite' }} />
                    <defs><radialGradient id="catGrad2"><stop offset="0%" stopColor="#60a5fa" /><stop offset="100%" stopColor="#1d4ed8" /></radialGradient></defs>
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
                <div className="mb-5 h-[90px] w-[90px] opacity-40">
                  <svg viewBox="0 0 90 90" fill="none">
                    <circle cx="45" cy="45" r="40" stroke="#0891b2" strokeWidth="0.75" strokeDasharray="4 5" opacity="0.2" style={{ transformOrigin: '45px 45px', animation: 'tm-spin 22s linear infinite' }} />
                    <circle cx="45" cy="45" r="28" fill="url(#catGrad3)" />
                    <path d="M30 55c3-1.5 6-1.5 9 0s6 1.5 9 0 6-1.5 9 0" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                    <path d="M35 50l4-8.5a1 1 0 0 1 1.8 0l3 6 3-6a1 1 0 0 1 1.8 0L53 50" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    <circle cx="45" cy="5" r="2" fill="#0891b2" opacity="0.3" />
                    <circle cx="85" cy="45" r="1.5" fill="#06b6d4" opacity="0.3" />
                    <defs><radialGradient id="catGrad3"><stop offset="0%" stopColor="#67e8f9" /><stop offset="100%" stopColor="#0891b2" /></radialGradient></defs>
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
                <div className="mb-5 h-[90px] w-[90px] opacity-40">
                  <svg viewBox="0 0 90 90" fill="none">
                    <circle cx="45" cy="45" r="40" stroke="#7c3aed" strokeWidth="0.75" strokeDasharray="3 5" opacity="0.2" style={{ transformOrigin: '45px 45px', animation: 'tm-spin-rev 24s linear infinite' }} />
                    <circle cx="45" cy="45" r="28" fill="url(#catGrad4)" />
                    <rect x="35" y="35" width="20" height="16" rx="3" stroke="white" strokeWidth="1.5" fill="none" />
                    <path d="M35 45h20" stroke="white" strokeWidth="1" />
                    <circle cx="39" cy="49" r="1.5" fill="white" /><circle cx="51" cy="49" r="1.5" fill="white" />
                    <path d="M35 51l-2 4" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    <path d="M55 51l2 4" stroke="white" strokeWidth="1" strokeLinecap="round" />
                    <circle cx="45" cy="5" r="2" fill="#7c3aed" opacity="0.3" />
                    <circle cx="85" cy="45" r="1.5" fill="#8b5cf6" opacity="0.3" />
                    <defs><radialGradient id="catGrad4"><stop offset="0%" stopColor="#a78bfa" /><stop offset="100%" stopColor="#7c3aed" /></radialGradient></defs>
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
                <div className="mb-5 h-[90px] w-[90px] opacity-40">
                  <svg viewBox="0 0 90 90" fill="none">
                    <circle cx="45" cy="45" r="40" stroke="#e11d48" strokeWidth="0.75" strokeDasharray="4 4" opacity="0.2" style={{ transformOrigin: '45px 45px', animation: 'tm-spin 26s linear infinite' }} />
                    <circle cx="45" cy="45" r="28" fill="url(#catGrad5)" />
                    <path d="M37 33v10c0 1.5 1 3 3 3h2v11" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <path d="M33 33v4c0 1.5 1.5 3 3 3h5" stroke="white" strokeWidth="1.2" strokeLinecap="round" fill="none" />
                    <path d="M55 50V33a6 6 0 0 0-6 6v7c0 1.5 1 3 3 3h3zm0 0v7" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                    <circle cx="45" cy="5" r="2" fill="#e11d48" opacity="0.3" />
                    <circle cx="85" cy="45" r="1.5" fill="#f43f5e" opacity="0.3" />
                    <defs><radialGradient id="catGrad5"><stop offset="0%" stopColor="#fb7185" /><stop offset="100%" stopColor="#e11d48" /></radialGradient></defs>
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
                <div className="mb-5 h-[90px] w-[90px] opacity-40">
                  <svg viewBox="0 0 90 90" fill="none">
                    <circle cx="45" cy="45" r="40" stroke="#65a30d" strokeWidth="0.75" strokeDasharray="5 3" opacity="0.2" style={{ transformOrigin: '45px 45px', animation: 'tm-spin-rev 20s linear infinite' }} />
                    <circle cx="45" cy="45" r="28" fill="url(#catGrad6)" />
                    <path d="M55 43c0 6-10 15-10 15s-10-9-10-15a10 10 0 0 1 20 0z" stroke="white" strokeWidth="1.5" fill="none" />
                    <circle cx="45" cy="43" r="3.5" stroke="white" strokeWidth="1.2" fill="none" />
                    <circle cx="45" cy="5" r="2" fill="#65a30d" opacity="0.3" />
                    <circle cx="85" cy="45" r="1.5" fill="#84cc16" opacity="0.3" />
                    <defs><radialGradient id="catGrad6"><stop offset="0%" stopColor="#a3e635" /><stop offset="100%" stopColor="#65a30d" /></radialGradient></defs>
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

              {/* Dashboard mockup */}
              <div className="relative">
                <div className="overflow-hidden rounded-2xl border border-border/60 bg-white shadow-2xl shadow-black/5">
                  {/* Window chrome */}
                  <div className="flex items-center gap-2 border-b border-border/40 bg-gray-50/80 px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                      <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="ml-3 flex-1 rounded-md bg-white/80 px-3 py-1 text-[10px] text-muted">ticketmatch.ai/dashboard/catalog</div>
                  </div>
                  {/* Dashboard content */}
                  <div className="flex">
                    {/* Sidebar mock */}
                    <div className="hidden w-[140px] shrink-0 border-r border-border/40 bg-white p-3 sm:block">
                      <div className="mb-4 flex items-center gap-1.5">
                        <div className="flex h-5 w-5 items-center justify-center rounded bg-accent text-[7px] font-bold text-white">TM</div>
                        <span className="text-[9px] font-semibold">TicketMatch</span>
                      </div>
                      <div className="space-y-1">
                        {["Overview", "Catalog", "Bookings", "Groups", "Itinerary"].map((item, i) => (
                          <div key={item} className={`rounded-md px-2 py-1.5 text-[8px] font-medium ${i === 1 ? "bg-accent/10 text-accent" : "text-muted"}`}>{item}</div>
                        ))}
                      </div>
                    </div>
                    {/* Main area */}
                    <div className="flex-1 p-4">
                      <div className="mb-3">
                        <div className="text-[11px] font-bold">Catalog</div>
                        <div className="mt-0.5 text-[8px] text-muted">Browse available venues</div>
                      </div>
                      {/* Filter pills */}
                      <div className="mb-3 flex gap-1">
                        {["All", "Museum", "Attraction"].map((f, i) => (
                          <div key={f} className={`rounded-full px-2 py-0.5 text-[7px] font-medium ${i === 0 ? "bg-foreground text-white" : "border border-border/60 text-muted"}`}>{f}</div>
                        ))}
                      </div>
                      {/* Card grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { image: "https://cdn.prod.website-files.com/6690fa96f0b41bbabcfbee64/68e50425db84cd19c37464bf_Business_events_AMAZE.jpg", name: "AMAZE", price: "22.70" },
                          { image: "https://app.thefeedfactory.nl/api/assets/65436991ff0fb235ff2e1b37/StudioIrma_DiamondMatrix.webp", name: "Moco Museum", price: "17.95" },
                          { image: "https://www.fabrique-lumieres.com/sites/default/files/styles/380x380/public/2025-08/immersive_experience_monet_bridge.jpg.webp", name: "Fabrique", price: "16.20" },
                        ].map((card) => (
                          <div key={card.name} className="overflow-hidden rounded-lg border border-border/40">
                            <div className="h-12 overflow-hidden bg-gray-100">
                              <img src={card.image} alt={card.name} className="h-full w-full object-cover" />
                            </div>
                            <div className="p-1.5">
                              <div className="text-[7px] font-semibold">{card.name}</div>
                              <div className="mt-0.5 text-[9px] font-bold text-accent">&euro; {card.price}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
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
      <MobileBottomBar />
    </>
  );
}
