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

              {/* Right — Hero visuals */}
              <div className="relative">
                {/* Mobile: booker at desk */}
                <div className="overflow-hidden rounded-3xl shadow-2xl shadow-black/10 lg:hidden">
                  <img
                    src="/images/hero-booker.jpg"
                    alt="Travel professional booking city experiences"
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  <div className="absolute bottom-5 left-5 flex gap-2.5">
                    <div className="rounded-xl bg-black/20 px-3 py-1.5 backdrop-blur-md">
                      <p className="text-lg font-bold text-white">45+</p>
                      <p className="text-[9px] text-white/70">Venues</p>
                    </div>
                    <div className="rounded-xl bg-black/20 px-3 py-1.5 backdrop-blur-md">
                      <p className="text-lg font-bold text-white">B2B</p>
                      <p className="text-[9px] text-white/70">Rates</p>
                    </div>
                    <div className="rounded-xl bg-black/20 px-3 py-1.5 backdrop-blur-md">
                      <p className="text-lg font-bold text-white">24h</p>
                      <p className="text-[9px] text-white/70">Access</p>
                    </div>
                  </div>
                </div>

                {/* Desktop: AI Chat + Assistant portrait side by side */}
                <div className="hidden items-center gap-6 lg:flex">
                  <div className="shrink-0">
                    <AIChat />
                  </div>
                  <div className="overflow-hidden rounded-2xl shadow-2xl shadow-black/10 ring-4 ring-white/80">
                    <img
                      src="/images/hero-assistant.jpg"
                      alt="Your AI travel assistant"
                      className="w-[320px] object-contain"
                    />
                  </div>
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

            {/* Animated SVG keyframes */}
            <style dangerouslySetInnerHTML={{ __html: `
              @keyframes tm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
              @keyframes tm-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
              @keyframes tm-pulse { 0%, 100% { opacity: 0.3; r: 3; } 50% { opacity: 0.7; r: 4.5; } }
              @keyframes tm-dot-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
              @keyframes tm-dash { from { stroke-dashoffset: 40; } to { stroke-dashoffset: 0; } }
              @keyframes tm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
            ` }} />

            <div className="mt-14 grid gap-5 md:grid-cols-3">
              {[
                { step: "1", title: "Request Access", desc: "Register your company with your business details. We verify and activate your B2B account within 24 hours.", tags: ["Free signup", "24h activation"], bg: "from-blue-600 to-blue-800", iconPath: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 11h-6M19 8v6" },
                { step: "2", title: "Build Your Trip", desc: "Browse our multi-supplier catalog, create day-by-day itineraries, upload guest lists and let AI suggest the best matches.", tags: ["Itinerary builder", "AI suggestions"], bg: "from-amber-500 to-orange-600", iconPath: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" },
                { step: "3", title: "Book & Manage", desc: "Confirm bookings at exclusive B2B rates, generate vouchers and QR codes per guest, track everything live.", tags: ["B2B rates", "Live tracking"], bg: "from-emerald-500 to-emerald-700", iconPath: "M9 12l2 2 4-4M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" },
              ].map((s, i) => (
                <div key={s.step} className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.bg} p-6 text-white transition-all hover:shadow-xl hover:scale-[1.02]`}>
                  {/* Decorative circles */}
                  <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-white/10" />
                  <div className="absolute -bottom-4 -left-4 h-16 w-16 rounded-full bg-white/5" />
                  {/* Step number */}
                  <div className="relative flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d={s.iconPath} />
                      </svg>
                    </div>
                    <div>
                      <p className="text-[11px] font-medium text-white/60 uppercase tracking-wider">Step {s.step}</p>
                      <h3 className="text-lg font-bold">{s.title}</h3>
                    </div>
                  </div>
                  <p className="relative mt-3 text-[13px] leading-relaxed text-white/80">{s.desc}</p>
                  <div className="relative mt-4 flex flex-wrap gap-2">
                    {s.tags.map((t) => (
                      <span key={t} className="rounded-full bg-white/15 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-sm">{t}</span>
                    ))}
                  </div>
                  {/* Arrow to next (desktop) */}
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
              {[
                { name: "Museums", img: "/images/cat-museums.jpg", desc: "World-class art, history and iconic collections. From the Rijksmuseum to Moco and everything in between.", status: "live", venues: "12 venues" },
                { name: "Attractions", img: "/images/cat-attractions.jpg", desc: "AMAZE, The Upside Down, Fabrique des Lumières — immersive must-see landmarks and experiences.", status: "live", venues: "18 venues" },
                { name: "Canal Cruises", img: "/images/cat-cruises.jpg", desc: "Scenic boat tours, dinner cruises and waterway experiences across city canals.", status: "soon" },
                { name: "Public Transport", img: "/images/cat-transport.jpg", desc: "GVB passes, metro cards, hop-on-hop-off buses and multi-day travel cards.", status: "soon" },
                { name: "Restaurants", img: "/images/cat-restaurants.jpg", desc: "Group dining, food tours, culinary experiences and restaurant reservations.", status: "soon" },
                { name: "Walking Tours", img: "/images/cat-walking.jpg", desc: "Guided tours, pub crawls, themed city walks and architectural highlights.", status: "soon" },
              ].map((cat) => (
                <div key={cat.name} className="group overflow-hidden rounded-2xl border border-border/60 bg-white transition-all hover:shadow-xl">
                  {/* Photo */}
                  <div className="relative h-[160px] overflow-hidden">
                    <img src={cat.img} alt={cat.name} className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${cat.status === "soon" ? "grayscale-[40%]" : ""}`} />
                    {/* Status badge */}
                    <span className={`absolute right-3 top-3 rounded-full px-2.5 py-0.5 text-[11px] font-semibold backdrop-blur-sm ${cat.status === "live" ? "bg-emerald-500/90 text-white" : "bg-black/30 text-white/90"}`}>
                      {cat.status === "live" ? "Live" : "Soon"}
                    </span>
                  </div>
                  {/* Text below photo */}
                  <div className="p-5">
                    <h3 className="text-[15px] font-bold">{cat.name}</h3>
                    <p className="mt-1.5 text-[13px] leading-relaxed text-muted">{cat.desc}</p>
                    {cat.venues && <p className="mt-2 text-[12px] font-semibold text-accent">{cat.venues}</p>}
                  </div>
                </div>
              ))}
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
