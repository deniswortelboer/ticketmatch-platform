import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

function IconCheck() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3.5 8.5L6.5 11.5L12.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}
function IconArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
  );
}

const benefits = [
  {
    title: "Reach B2B buyers directly",
    desc: "Get your venue in front of tour operators, DMCs and travel agencies who book group visits.",
    color: "#2563eb",
    gradFrom: "#3b82f6",
    gradTo: "#1d4ed8",
    icon: (
      <>
        <circle cx="9" cy="7" r="4" stroke="white" strokeWidth="1.5" />
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M21 21v-2a4 4 0 0 0-3-3.87" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Grow group bookings",
    desc: "Our platform is built specifically for group travel procurement — your ideal customer.",
    color: "#f59e0b",
    gradFrom: "#fbbf24",
    gradTo: "#d97706",
    icon: (
      <>
        <path d="M12 2L2 7l10 5 10-5-10-5z" stroke="white" strokeWidth="1.5" strokeLinejoin="round" fill="none" />
        <path d="M2 17l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 12l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
  },
  {
    title: "Simple integration",
    desc: "Connect via our API or provide your availability manually. We handle the rest.",
    color: "#10b981",
    gradFrom: "#34d399",
    gradTo: "#059669",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="white" strokeWidth="1.5" fill="none" />
        <path d="M9 9h6" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 13h4" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
        <path d="M9 17h2" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      </>
    ),
  },
  {
    title: "Real-time analytics",
    desc: "Track views, bookings and revenue from the supplier dashboard.",
    color: "#8b5cf6",
    gradFrom: "#a78bfa",
    gradTo: "#7c3aed",
    icon: (
      <>
        <path d="M3 3v18h18" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M7 17l4-6 4 3 6-8" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </>
    ),
  },
];

const supplierTypes = [
  { name: "Museums & galleries", icon: "🏛️" },
  { name: "Attractions & experiences", icon: "🎡" },
  { name: "Canal cruise operators", icon: "⛵" },
  { name: "Public transport providers", icon: "🚃" },
  { name: "Restaurants & dining", icon: "🍽️" },
  { name: "Walking tour operators", icon: "🚶" },
  { name: "Theater & events", icon: "🎭" },
  { name: "Hop-on-hop-off services", icon: "🚌" },
];

/* Animated SVG keyframes — reused from homepage */
const svgStyles = `
  @keyframes tm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes tm-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
  @keyframes tm-pulse { 0%, 100% { opacity: 0.3; r: 3; } 50% { opacity: 0.7; r: 4.5; } }
  @keyframes tm-dot-pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
  @keyframes tm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
`;

export default function PartnersPage() {
  return (
    <>
      <Header />
      <style dangerouslySetInnerHTML={{ __html: svgStyles }} />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-50/50 via-white to-blue-50/30" />
          <div className="relative mx-auto max-w-7xl px-6 pb-20 pt-20 md:pb-28 md:pt-28">
            <div className="grid items-center gap-16 lg:grid-cols-2">
              <div>
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-amber-500/15 bg-amber-500/5 px-4 py-1.5 text-sm font-medium text-amber-700">
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                  For venues & suppliers
                </div>
                <h1 className="text-4xl font-bold leading-[1.08] tracking-tight md:text-[3.5rem]">
                  Get your venue in front of
                  <br />
                  <span className="text-accent">B2B travel buyers.</span>
                </h1>
                <p className="mt-6 max-w-lg text-lg leading-relaxed text-muted">
                  TicketMatch.ai connects your museum, attraction or experience
                  with tour operators and group travel agencies across Europe. No
                  upfront cost — you only pay when bookings come in.
                </p>
                <div className="mt-8 flex items-center gap-4">
                  <a
                    href="mailto:partners@ticketmatch.ai"
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                  >
                    Contact us to join
                    <IconArrow />
                  </a>
                  <Link href="/#how-it-works" className="text-sm font-medium text-muted hover:text-foreground transition-colors">
                    How it works
                  </Link>
                </div>

                {/* Trust stats */}
                <div className="mt-12 flex gap-8">
                  {[
                    { value: "75+", label: "Venues live" },
                    { value: "2", label: "Cities" },
                    { value: "0%", label: "Upfront cost" },
                  ].map((s) => (
                    <div key={s.label}>
                      <p className="text-2xl font-bold text-accent">{s.value}</p>
                      <p className="text-xs text-muted">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Partner hero image */}
              <div className="relative overflow-hidden rounded-3xl shadow-2xl shadow-black/10">
                <img
                  src="/images/partners-hero.jpg"
                  alt="VIP group arriving at the Rijksmuseum Amsterdam with a luxury minivan"
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6 flex gap-3">
                  <div className="rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-md">
                    <p className="text-lg font-bold text-white">B2B</p>
                    <p className="text-[10px] text-white/70">Group travel</p>
                  </div>
                  <div className="rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-md">
                    <p className="text-lg font-bold text-white">VIP</p>
                    <p className="text-[10px] text-white/70">Experiences</p>
                  </div>
                  <div className="rounded-xl bg-black/20 px-3.5 py-2 backdrop-blur-md">
                    <p className="text-lg font-bold text-white">75+</p>
                    <p className="text-[10px] text-white/70">Venues</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">Why partner with us</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                Built to grow your B2B channel.
              </h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {benefits.map((b, i) => (
                <div key={b.title} className="group rounded-3xl border border-border/60 bg-background p-8 transition-all hover:border-accent/20 hover:shadow-xl hover:shadow-accent/5">
                  <div className="mb-5 h-[80px] w-[80px]">
                    <svg viewBox="0 0 80 80" fill="none">
                      <circle cx="40" cy="40" r="36" stroke={b.color} strokeWidth="0.75" strokeDasharray="4 3" opacity="0.15" style={{ transformOrigin: '40px 40px', animation: `tm-spin ${18 + i * 3}s linear infinite` }} />
                      <circle cx="40" cy="40" r="24" fill={`url(#benefitGrad${i})`} />
                      <g transform="translate(28, 28) scale(0.5)">
                        {b.icon}
                      </g>
                      <circle cx="40" cy="4" r="2" fill={b.color} style={{ animation: 'tm-pulse 2.5s ease-in-out infinite' }} />
                      <circle cx="76" cy="40" r="1.5" fill={b.color} style={{ animation: 'tm-dot-pulse 3s ease-in-out 0.5s infinite' }} />
                      <circle cx="40" cy="76" r="2" fill={b.color} style={{ animation: 'tm-pulse 2.5s ease-in-out 1s infinite' }} />
                      <circle cx="4" cy="40" r="1.5" fill={b.color} style={{ animation: 'tm-dot-pulse 3s ease-in-out 1.5s infinite' }} />
                      <defs><radialGradient id={`benefitGrad${i}`}><stop offset="0%" stopColor={b.gradFrom} /><stop offset="100%" stopColor={b.gradTo} /></radialGradient></defs>
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo gallery — experiences */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-12 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">The experiences</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                From city tours to countryside adventures.
              </h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="group relative overflow-hidden rounded-3xl">
                <img src="/images/partners-canal.jpg" alt="VIP canal cruise through Amsterdam" className="h-[320px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-lg font-bold text-white">Private Canal Cruises</p>
                  <p className="text-sm text-white/70">Exclusive group experiences on Amsterdam&apos;s canals</p>
                </div>
              </div>
              <div className="group relative overflow-hidden rounded-3xl">
                <img src="/images/partners-tulips.jpg" alt="Tour bus driving through Dutch tulip fields" className="h-[320px] w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-lg font-bold text-white">Countryside Day Trips</p>
                  <p className="text-sm text-white/70">Keukenhof, tulip fields and windmill tours</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supplier types */}
        <section className="bg-white py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">Who can join</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                We work with all types of city experiences.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {supplierTypes.map((type) => (
                <div key={type.name} className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-white px-5 py-5 transition-all hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/5 text-lg transition-transform group-hover:scale-110">
                    {type.icon}
                  </span>
                  <span className="text-sm font-medium">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-foreground px-8 py-16 text-center md:px-16">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-amber-500/15 via-transparent to-accent/10" />
              {/* Decorative animated dots */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <svg className="absolute left-8 top-8 h-20 w-20 opacity-20" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="35" stroke="white" strokeWidth="0.5" strokeDasharray="4 3" style={{ transformOrigin: '40px 40px', animation: 'tm-spin 15s linear infinite' }} />
                  <circle cx="40" cy="5" r="2" fill="white" style={{ animation: 'tm-pulse 2s ease-in-out infinite' }} />
                </svg>
                <svg className="absolute bottom-8 right-8 h-16 w-16 opacity-15" viewBox="0 0 80 80" fill="none">
                  <circle cx="40" cy="40" r="30" stroke="white" strokeWidth="0.5" strokeDasharray="3 4" style={{ transformOrigin: '40px 40px', animation: 'tm-spin-rev 12s linear infinite' }} />
                  <circle cx="40" cy="10" r="2" fill="white" style={{ animation: 'tm-pulse 2.5s ease-in-out 0.5s infinite' }} />
                </svg>
              </div>
              <div className="relative">
                <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Ready to list your venue?
                </h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
                  No integration fee, no upfront costs. Reach B2B travel buyers
                  and grow your group bookings.
                </p>
                <div className="mt-8">
                  <a
                    href="mailto:partners@ticketmatch.ai"
                    className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-foreground transition-all hover:bg-gray-100"
                  >
                    Get in touch
                    <IconArrow />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
