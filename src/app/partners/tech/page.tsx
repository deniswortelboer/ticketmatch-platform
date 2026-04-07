import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Technical Integration Guide | TicketMatch.ai",
  description:
    "Everything your tech team needs to integrate with TicketMatch.ai. API specs, architecture overview, and integration checklist.",
  alternates: {
    canonical: "/partners/tech",
  },
};

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ───── data ───── */
const integrationSteps = [
  {
    phase: "Discovery",
    duration: "Day 1",
    color: "from-blue-600 to-blue-800",
    items: [
      "You share your API documentation",
      "We review endpoints, auth method and data format",
      "We agree on scope: products, availability, bookings",
    ],
  },
  {
    phase: "Development",
    duration: "Day 2–3",
    color: "from-amber-500 to-orange-600",
    items: [
      "We build a dedicated adapter for your API",
      "We map your data model to our universal format",
      "We implement error handling and rate limiting",
    ],
  },
  {
    phase: "Testing",
    duration: "Day 4",
    color: "from-emerald-500 to-emerald-700",
    items: [
      "End-to-end testing on sandbox/staging",
      "We validate product sync, pricing, availability",
      "You verify bookings appear correctly on your side",
    ],
  },
  {
    phase: "Go Live",
    duration: "Day 5",
    color: "from-violet-500 to-purple-700",
    items: [
      "Switch to production credentials",
      "Your products appear in every operator's catalog",
      "Monitoring and alerts activated",
    ],
  },
];

const apiEndpoints = [
  {
    method: "GET",
    path: "/products",
    desc: "List all available products/venues",
    required: true,
  },
  {
    method: "GET",
    path: "/products/{id}",
    desc: "Get details for a single product",
    required: true,
  },
  {
    method: "GET",
    path: "/availability",
    desc: "Check availability for a date + group size",
    required: true,
  },
  {
    method: "POST",
    path: "/bookings",
    desc: "Create a confirmed reservation",
    required: true,
  },
  {
    method: "GET",
    path: "/bookings/{id}",
    desc: "Retrieve booking status and voucher",
    required: true,
  },
  {
    method: "DELETE",
    path: "/bookings/{id}",
    desc: "Cancel a booking",
    required: false,
  },
  {
    method: "GET",
    path: "/categories",
    desc: "List product categories",
    required: false,
  },
  {
    method: "POST",
    path: "/webhooks",
    desc: "Receive real-time booking updates",
    required: false,
  },
];

const dataFields = [
  { field: "id", type: "string", desc: "Unique product identifier", required: true },
  { field: "name", type: "string", desc: "Product/venue name", required: true },
  { field: "description", type: "string", desc: "Short description", required: true },
  { field: "category", type: "string", desc: 'e.g. "museum", "attraction", "cruise"', required: true },
  { field: "city", type: "string", desc: "City name", required: true },
  { field: "price_retail", type: "number", desc: "Public retail price (EUR)", required: true },
  { field: "price_b2b", type: "number", desc: "B2B/wholesale price (EUR)", required: true },
  { field: "currency", type: "string", desc: 'ISO 4217 (default: "EUR")', required: false },
  { field: "duration", type: "string", desc: 'e.g. "2 hours", "full day"', required: false },
  { field: "max_group_size", type: "number", desc: "Maximum guests per booking", required: false },
  { field: "image_url", type: "string", desc: "Product image URL", required: false },
  { field: "includes", type: "string[]", desc: "What's included in the ticket", required: false },
  { field: "available_days", type: "string[]", desc: "Days of the week available", required: false },
];

export default function TechPage() {
  return (
    <>
      <Header />
      <main className="flex-1">
        {/* ════════════ HERO ════════════ */}
        <section className="relative overflow-hidden border-b border-border/40">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-blue-50/30" />
          <div className="relative mx-auto max-w-5xl px-6 pb-16 pt-20 md:pb-20 md:pt-28">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-accent/15 bg-accent/5 px-4 py-1.5 text-sm font-medium text-accent">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              Technical Integration Guide
            </div>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-[3.25rem]">
              Connect your platform
              <br />
              <span className="text-accent">to TicketMatch.ai</span>
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted">
              This page is for your tech team. It explains who we are, how our
              platform works, what we need from your API, and how we'll
              integrate — step by step.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <a
                href="#checklist"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
              >
                Jump to checklist <IconArrow />
              </a>
              <a
                href="#api-spec"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
              >
                View API spec
              </a>
              <a
                href="mailto:info@ticketmatch.ai?subject=API%20Integration"
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-semibold transition-colors hover:bg-gray-50"
              >
                Contact us
              </a>
            </div>
          </div>
        </section>

        {/* ════════════ WHO WE ARE ════════════ */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <div className="max-w-2xl">
              <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
                About TicketMatch.ai
              </p>
              <h2 className="text-3xl font-bold tracking-tight">
                B2B city access platform for group travel.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                TicketMatch.ai is a procurement platform where tour operators,
                DMCs and travel agencies book city experiences for their groups.
                We aggregate multiple suppliers into one dashboard — museums,
                attractions, cruises, transport and more.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-muted">
                Our operators build itineraries, manage guest lists, and book at
                exclusive B2B rates. By integrating with us, your products
                become instantly available to professional travel buyers across
                Europe.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-4">
                {[
                  { value: "75+", label: "Venues live" },
                  { value: "2", label: "Cities active" },
                  { value: "5 days", label: "Integration time" },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl border border-border/60 bg-white px-5 py-4 text-center">
                    <p className="text-2xl font-bold text-accent">{s.value}</p>
                    <p className="mt-1 text-xs text-muted">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ ARCHITECTURE ════════════ */}
        <section className="border-y border-border/40 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Architecture
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              How integration works
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              We use an adapter pattern. Each supplier gets a dedicated adapter
              that translates their API into our universal product format. Your
              API stays exactly as it is — we adapt to you, not the other way
              around.
            </p>

            {/* Diagram */}
            <div className="mt-12 flex flex-col items-center gap-5">
              {/* Operators */}
              <div className="w-full max-w-lg rounded-2xl border border-accent/20 bg-accent/5 px-8 py-5 text-center">
                <p className="text-xs font-bold uppercase tracking-wider text-accent">
                  Tour Operators &amp; DMCs
                </p>
                <p className="mt-1.5 text-base font-bold">
                  TicketMatch Dashboard
                </p>
                <p className="mt-1 text-xs text-muted">
                  One unified catalog — search, compare, book
                </p>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-px bg-gradient-to-b from-accent/40 to-amber-500/40" />
                <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-amber-500/40" />
              </div>

              {/* Catalog Service */}
              <div className="w-full max-w-2xl rounded-2xl border-2 border-amber-500/30 bg-amber-50/80 px-8 py-6">
                <div className="text-center">
                  <p className="text-xs font-bold uppercase tracking-wider text-amber-600">
                    Catalog Service — Universal API Layer
                  </p>
                  <p className="mt-2 text-sm text-amber-800/70">
                    Normalizes data from every supplier into one standard format.
                    Handles caching, rate limiting, error recovery and fallbacks.
                  </p>
                </div>
                <div className="mt-5 grid grid-cols-3 gap-3">
                  {["Product sync", "Availability check", "Booking relay"].map(
                    (f) => (
                      <div
                        key={f}
                        className="rounded-lg bg-white/80 px-3 py-2 text-center text-xs font-medium text-amber-700 shadow-sm"
                      >
                        {f}
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-px bg-gradient-to-b from-amber-500/40 to-emerald-500/40" />
                <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-emerald-500/40" />
              </div>

              {/* Adapters */}
              <div className="w-full max-w-3xl">
                <p className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-muted">
                  Supplier Adapters
                </p>
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  {[
                    { name: "Combitiq", status: "Ready", border: "border-emerald-400", bg: "bg-emerald-50", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700" },
                    { name: "GetYourGuide", status: "Open", border: "border-blue-300", bg: "bg-blue-50/60", text: "text-blue-700", badge: "bg-blue-100 text-blue-600" },
                    { name: "Tiqets", status: "Open", border: "border-orange-300", bg: "bg-orange-50/60", text: "text-orange-700", badge: "bg-orange-100 text-orange-600" },
                    { name: "Viator", status: "Open", border: "border-purple-300", bg: "bg-purple-50/60", text: "text-purple-700", badge: "bg-purple-100 text-purple-600" },
                  ].map((a) => (
                    <div key={a.name} className={`rounded-xl border-2 ${a.border} ${a.bg} px-4 py-3 text-center`}>
                      <p className={`text-sm font-bold ${a.text}`}>{a.name}</p>
                      <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${a.badge}`}>
                        {a.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className="h-8 w-px bg-border" />
                <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[8px] border-l-transparent border-r-transparent border-t-border" />
              </div>

              {/* Your API */}
              <div className="w-full max-w-lg rounded-2xl border-2 border-dashed border-accent/30 bg-accent/5 px-8 py-5 text-center">
                <p className="text-base font-bold text-accent">Your API</p>
                <p className="mt-1 text-sm text-muted">
                  REST, GraphQL, SOAP or custom — we adapt to your format
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ INTEGRATION TIMELINE ════════════ */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Integration timeline
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              From API docs to live in 5 days.
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              Once you share your API documentation and credentials, we handle
              the entire integration. Here's what the process looks like.
            </p>

            <div className="mt-12 grid gap-4 md:grid-cols-4">
              {integrationSteps.map((step, i) => (
                <div
                  key={step.phase}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${step.color} p-6 text-white`}
                >
                  <div className="absolute -right-6 -top-6 h-20 w-20 rounded-full bg-white/10" />
                  <div className="relative">
                    <p className="text-[11px] font-medium uppercase tracking-wider text-white/60">
                      {step.duration}
                    </p>
                    <h3 className="mt-1 text-lg font-bold">{step.phase}</h3>
                    <ul className="mt-3 space-y-2">
                      {step.items.map((item) => (
                        <li
                          key={item}
                          className="flex items-start gap-2 text-[12px] leading-relaxed text-white/80"
                        >
                          <span className="mt-1 block h-1 w-1 shrink-0 rounded-full bg-white/60" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {i < 3 && (
                    <div className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 md:block">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md">
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="#2563eb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ CHECKLIST ════════════ */}
        <section id="checklist" className="border-y border-border/40 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Integration checklist
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              What we need from you
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              Send us the following and we can start building the integration
              immediately. Don't have everything? No problem — we can work
              iteratively.
            </p>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {/* Required */}
              <div className="rounded-2xl border-2 border-emerald-500/20 bg-emerald-50/50 p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-emerald-800">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-xs text-white">
                    ✓
                  </span>
                  Required
                </h3>
                <ul className="mt-5 space-y-4">
                  {[
                    {
                      item: "API documentation",
                      desc: "Swagger/OpenAPI spec, Postman collection, or written docs",
                    },
                    {
                      item: "API credentials",
                      desc: "API key, OAuth tokens, or other auth mechanism",
                    },
                    {
                      item: "Sandbox / test environment",
                      desc: "So we can develop without affecting live data",
                    },
                    {
                      item: "Product endpoint",
                      desc: "An endpoint that returns your product catalog",
                    },
                    {
                      item: "Availability endpoint",
                      desc: "Check if a product is available for a date + group size",
                    },
                  ].map((req) => (
                    <li key={req.item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-emerald-200/80 text-emerald-700 text-xs">
                        ✓
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-emerald-900">
                          {req.item}
                        </p>
                        <p className="text-xs text-emerald-700/70">{req.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Nice to have */}
              <div className="rounded-2xl border border-border/60 bg-gray-50/50 p-8">
                <h3 className="flex items-center gap-2 text-lg font-bold">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs text-gray-600">
                    +
                  </span>
                  Nice to have
                </h3>
                <ul className="mt-5 space-y-4">
                  {[
                    {
                      item: "Booking endpoint",
                      desc: "Create, confirm and cancel reservations via API",
                    },
                    {
                      item: "Webhook support",
                      desc: "Push notifications for booking updates and changes",
                    },
                    {
                      item: "Rate limits documentation",
                      desc: "Max requests per minute/hour so we can optimize",
                    },
                    {
                      item: "Image CDN / media assets",
                      desc: "Product images we can display in the catalog",
                    },
                    {
                      item: "Pricing tiers / group discounts",
                      desc: "Volume-based pricing rules for group bookings",
                    },
                  ].map((req) => (
                    <li key={req.item} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-gray-200/80 text-gray-500 text-xs">
                        +
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{req.item}</p>
                        <p className="text-xs text-muted">{req.desc}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ API SPEC ════════════ */}
        <section id="api-spec" className="py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              API Specification
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Endpoints we integrate with
            </h2>
            <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-muted">
              These are the endpoints we typically consume. Your API doesn't
              need to match this exactly — our adapter translates your format
              to ours.
            </p>

            {/* Endpoints table */}
            <div className="mt-10 overflow-hidden rounded-2xl border border-border/60">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-border/40 bg-gray-50">
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Method
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Endpoint
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Description
                    </th>
                    <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {apiEndpoints.map((ep) => (
                    <tr
                      key={ep.path}
                      className="border-b border-border/20 last:border-0"
                    >
                      <td className="px-5 py-3">
                        <span
                          className={`inline-block rounded px-2 py-0.5 text-xs font-bold ${
                            ep.method === "GET"
                              ? "bg-emerald-100 text-emerald-700"
                              : ep.method === "POST"
                              ? "bg-blue-100 text-blue-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {ep.method}
                        </span>
                      </td>
                      <td className="px-5 py-3">
                        <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono">
                          {ep.path}
                        </code>
                      </td>
                      <td className="px-5 py-3 text-muted">{ep.desc}</td>
                      <td className="px-5 py-3">
                        <span
                          className={`text-xs font-semibold ${
                            ep.required
                              ? "text-emerald-600"
                              : "text-gray-400"
                          }`}
                        >
                          {ep.required ? "Required" : "Optional"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Data model */}
            <div className="mt-12">
              <h3 className="text-xl font-bold">Product data model</h3>
              <p className="mt-2 text-sm text-muted">
                This is the universal format we normalize all supplier data
                into. Your API can use different field names — the adapter
                handles the mapping.
              </p>
              <div className="mt-6 overflow-hidden rounded-2xl border border-border/60">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-border/40 bg-gray-50">
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                        Field
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                        Type
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                        Description
                      </th>
                      <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wider text-muted">
                        Required
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {dataFields.map((f) => (
                      <tr
                        key={f.field}
                        className="border-b border-border/20 last:border-0"
                      >
                        <td className="px-5 py-3">
                          <code className="rounded bg-gray-100 px-2 py-1 text-xs font-mono">
                            {f.field}
                          </code>
                        </td>
                        <td className="px-5 py-3 text-xs text-muted">
                          {f.type}
                        </td>
                        <td className="px-5 py-3 text-muted">{f.desc}</td>
                        <td className="px-5 py-3">
                          <span
                            className={`text-xs font-semibold ${
                              f.required
                                ? "text-emerald-600"
                                : "text-gray-400"
                            }`}
                          >
                            {f.required ? "Yes" : "No"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Example request/response */}
            <div className="mt-12">
              <h3 className="text-xl font-bold">Example: Product response</h3>
              <p className="mt-2 text-sm text-muted">
                This is what a normalized product looks like in our system
                after the adapter processes your API response.
              </p>
              <div className="mt-4 overflow-hidden rounded-2xl border border-border/60 bg-[#1e293b]">
                <div className="flex items-center gap-2 border-b border-white/10 px-5 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-red-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                    <div className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
                  </div>
                  <span className="ml-2 text-xs text-white/40">
                    GET /api/catalog/products
                  </span>
                </div>
                <pre className="overflow-x-auto p-5 text-sm leading-relaxed">
                  <code className="text-emerald-400">{`{
  "products": [
    {
      "id": "cbtq_001",
      "supplier": "combitiq",
      "name": "Rijksmuseum — Group Visit",
      "category": "museum",
      "city": "Amsterdam",
      "description": "Skip-the-line group entry to the Rijksmuseum",
      "price_retail": 22.50,
      "price_b2b": 17.95,
      "currency": "EUR",
      "duration": "2-3 hours",
      "max_group_size": 25,
      "image_url": "https://cdn.combitiq.com/rijksmuseum.jpg",
      "includes": ["Skip-the-line entry", "Group welcome"],
      "available_days": ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    }
  ],
  "total": 45,
  "supplier": "combitiq",
  "synced_at": "2026-04-06T12:00:00Z"
}`}</code>
                </pre>
              </div>
            </div>
          </div>
        </section>

        {/* ════════════ SECURITY ════════════ */}
        <section className="border-y border-border/40 bg-white py-20 md:py-24">
          <div className="mx-auto max-w-5xl px-6">
            <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-accent">
              Security &amp; Compliance
            </p>
            <h2 className="text-3xl font-bold tracking-tight">
              Your data is safe with us
            </h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                {
                  title: "Encrypted at rest & in transit",
                  desc: "All API communications use TLS 1.3. Database encrypted with AES-256.",
                  icon: "🔒",
                },
                {
                  title: "Credentials in vault",
                  desc: "API keys stored as encrypted environment variables, never in code.",
                  icon: "🔐",
                },
                {
                  title: "GDPR compliant",
                  desc: "EU-hosted infrastructure. No personal data shared without consent.",
                  icon: "🇪🇺",
                },
                {
                  title: "Rate limiting",
                  desc: "We respect your API limits. Configurable request throttling per adapter.",
                  icon: "⚡",
                },
                {
                  title: "Error isolation",
                  desc: "If your API goes down, other suppliers keep working. Graceful fallbacks.",
                  icon: "🛡️",
                },
                {
                  title: "Audit logging",
                  desc: "Every API call logged with timestamps. Full traceability for debugging.",
                  icon: "📋",
                },
              ].map((s) => (
                <div
                  key={s.title}
                  className="rounded-2xl border border-border/60 bg-background p-6"
                >
                  <span className="text-2xl">{s.icon}</span>
                  <h3 className="mt-3 text-sm font-bold">{s.title}</h3>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted">
                    {s.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ════════════ CTA ════════════ */}
        <section className="py-20 md:py-24">
          <div className="mx-auto max-w-3xl px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Ready to integrate?
            </h2>
            <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-muted">
              Send us your API documentation and credentials. We'll have your
              products live in our catalog within 5 business days.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="mailto:info@ticketmatch.ai?subject=API%20Integration%20—%20[Your%20Company]&body=Hi%20TicketMatch%20team%2C%0A%0AWe'd%20like%20to%20integrate%20our%20API.%20Here%20are%20our%20details%3A%0A%0ACompany%3A%20%0AAPI%20docs%20URL%3A%20%0AContact%20person%3A%20%0A%0ALooking%20forward%20to%20connecting!"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
              >
                Send API docs <IconArrow />
              </a>
              <Link
                href="/partners"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-3.5 text-sm font-semibold transition-colors hover:bg-gray-50"
              >
                Back to Partners
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
