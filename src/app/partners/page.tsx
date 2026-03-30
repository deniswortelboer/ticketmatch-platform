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
  },
  {
    title: "Grow group bookings",
    desc: "Our platform is built specifically for group travel procurement — your ideal customer.",
  },
  {
    title: "Simple integration",
    desc: "Connect via our API or provide your availability manually. We handle the rest.",
  },
  {
    title: "Real-time analytics",
    desc: "Track views, bookings and revenue from the supplier dashboard.",
  },
];

const supplierTypes = [
  "Museums & galleries",
  "Attractions & experiences",
  "Canal cruise operators",
  "Public transport providers",
  "Restaurants & dining",
  "Walking tour operators",
  "Theater & events",
  "Hop-on-hop-off services",
];

export default function PartnersPage() {
  return (
    <>
      <Header />

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
                <div className="mt-8">
                  <a
                    href="mailto:partners@ticketmatch.ai"
                    className="inline-flex items-center gap-2 rounded-full bg-foreground px-7 py-3.5 text-sm font-semibold text-white transition-all hover:bg-gray-800"
                  >
                    Contact us to join
                    <IconArrow />
                  </a>
                </div>
              </div>

              {/* Image placeholder */}
              <div className="aspect-[4/3] overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-amber-50 to-gray-100">
                <div className="flex h-full items-center justify-center p-8 text-center">
                  <div>
                    <p className="text-sm font-medium text-muted">Partner visual</p>
                    <p className="mt-1 text-xs text-muted/60">Replace with partner/venue imagery</p>
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
              {benefits.map((b) => (
                <div key={b.title} className="rounded-3xl border border-border/60 bg-background p-8 transition-all hover:shadow-lg hover:shadow-black/[0.03]">
                  <h3 className="text-lg font-semibold">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Supplier types */}
        <section className="py-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="mb-16 max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">Who can join</p>
              <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
                We work with all types of city experiences.
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {supplierTypes.map((type) => (
                <div key={type} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-white px-5 py-4">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
                    <IconCheck />
                  </span>
                  <span className="text-sm font-medium">{type}</span>
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
