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
const categories = [
  { title: "Museums", desc: "Art, history and iconic collections.", active: true, count: "12 venues" },
  { title: "Attractions", desc: "Landmarks and immersive experiences.", active: true, count: "18 venues" },
  { title: "Canal Cruises", desc: "Scenic boat tours and waterways.", active: false, count: "Coming soon" },
  { title: "Public Transport", desc: "City passes and hop-on-hop-off.", active: false, count: "Coming soon" },
  { title: "Restaurants", desc: "Group dining and food tours.", active: false, count: "Coming soon" },
  { title: "Walking Tours", desc: "Guided tours and themed walks.", active: false, count: "Coming soon" },
];

const cities = [
  { name: "Amsterdam", country: "NL", count: "45+ venues", active: true },
  { name: "Brussels", country: "BE", count: "30+ venues", active: true },
  { name: "Berlin", country: "DE", count: "Coming soon", active: false },
  { name: "Paris", country: "FR", count: "Coming soon", active: false },
];

/* ───── page ───── */
export default function Home() {
  return (
    <>
      <Header />
      <main className="flex-1">

        {/* ════════════ HERO ════════════ */}
        <section className="relative overflow-hidden bg-white">
          {/* Decorative blobs */}
          <div className="pointer-events-none absolute -left-40 -top-40 h-[600px] w-[600px] rounded-full bg-blue-100/40 blur-3xl" />
          <div className="pointer-events-none absolute -right-40 top-20 h-[400px] w-[400px] rounded-full bg-amber-100/30 blur-3xl" />

          <div className="relative mx-auto max-w-7xl px-6 pb-24 pt-16 md:pb-32 md:pt-24">
            <div className="grid items-start gap-12 lg:grid-cols-[1fr,480px] lg:gap-16">

              {/* Left — copy */}
              <div className="max-w-xl pt-4">
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

              {/* Right — AI Chat */}
              <div className="relative">
                <AIChat />
                {/* Floating badge */}
                <div className="absolute -bottom-3 -right-3 rounded-xl border border-border/60 bg-white px-4 py-2.5 shadow-lg">
                  <p className="text-xs text-muted">Powered by</p>
                  <p className="text-sm font-bold">TicketMatch AI</p>
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

        {/* ════════════ HOW IT WORKS ════════════ */}
        <section id="how-it-works" className="py-24 md:py-32">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-[13px] font-medium uppercase tracking-[0.15em] text-accent">How it works</p>
            <h2 className="mt-3 max-w-lg text-3xl font-extrabold tracking-tight md:text-[2.5rem]">
              Three steps to smarter group bookings.
            </h2>

            <div className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-border/60 bg-border/60 md:grid-cols-3">
              {[
                { n: "01", t: "Request access", d: "Register your company. We review and activate your B2B account." },
                { n: "02", t: "Build your trip", d: "Browse the catalog, create itineraries, upload guest lists." },
                { n: "03", t: "Book & manage", d: "Confirm at B2B rates, download vouchers, track everything live." },
              ].map((s) => (
                <div key={s.n} className="bg-white p-8 md:p-10">
                  <span className="text-[40px] font-black leading-none text-border">{s.n}</span>
                  <h3 className="mt-4 text-base font-bold">{s.t}</h3>
                  <p className="mt-2 text-[13px] leading-relaxed text-muted">{s.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ CATEGORIES ════════════ */}
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

            <div className="mt-14 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {categories.map((c) => (
                <div
                  key={c.title}
                  className={`rounded-2xl border p-6 transition-all ${
                    c.active
                      ? "border-border/60 bg-background hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5"
                      : "border-dashed border-border/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <h3 className="text-[15px] font-bold">{c.title}</h3>
                    {c.active ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-600">Live</span>
                    ) : (
                      <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-muted">Soon</span>
                    )}
                  </div>
                  <p className="mt-2 text-[13px] text-muted">{c.desc}</p>
                  <p className="mt-3 text-[12px] font-semibold text-accent">{c.count}</p>
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
                  <div className="aspect-[3/2] bg-gradient-to-br from-gray-100 to-gray-50">
                    <div className="flex h-full items-center justify-center">
                      <span className="text-3xl font-black text-gray-200">{city.country}</span>
                    </div>
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
    </>
  );
}
