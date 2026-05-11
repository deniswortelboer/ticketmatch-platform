import Link from "next/link";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { allCities, citiesByCountry } from "@/app/cities/cities-data";
import cityImagesCache from "@/app/cities/city-images-cache.json";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getReseller(slug: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: companies } = await supabaseAdmin
    .from("companies")
    .select("id, name, message, primary_color, logo_url, branding_mode")
    .order("created_at", { ascending: false });

  const reseller = companies?.find((c) => {
    try {
      const msg = c.message ? JSON.parse(c.message) : {};
      return msg.role === "reseller" && msg.reseller_slug === slug.toLowerCase();
    } catch {
      return false;
    }
  });

  return reseller || null;
}

function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><path d="M2 12h20" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

function IconShield() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function IconTicket() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" /><polyline points="12,6 12,12 16,14" />
    </svg>
  );
}

export default async function ResellerPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reseller = await getReseller(slug);
  if (!reseller) notFound();

  const primaryColor = reseller.primary_color || "#FF6B35";
  const cityImages = cityImagesCache as Record<string, string>;

  const topCities = allCities.slice(0, 12);
  const totalExperiences = "350,000+";

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* ═══════ RESELLER HEADER ═══════ */}
      <header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            {reseller.logo_url ? (
              <Image
                src={reseller.logo_url}
                alt={reseller.name}
                width={36}
                height={36}
                className="rounded-lg"
                unoptimized
              />
            ) : (
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg text-white font-bold text-[10px]"
                style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
              >
                {reseller.name.split(" ")[0].slice(0, 3).toUpperCase()}
              </div>
            )}
            <span className="text-base font-bold tracking-tight">
              {reseller.name}
            </span>
          </div>

          <nav className="hidden md:flex items-center gap-6 text-[13px] font-medium text-muted">
            <a href="#destinations" className="hover:text-foreground transition-colors">Destinations</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How it Works</a>
            <a href="#explore" className="hover:text-foreground transition-colors">Explore</a>
          </nav>

          <a
            href="#explore"
            className="rounded-full px-5 py-2 text-[13px] font-semibold text-white transition-all hover:scale-[1.03] hover:shadow-lg"
            style={{ backgroundColor: primaryColor }}
          >
            Book Now
          </a>
        </div>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-20 top-10 h-[500px] w-[500px] rounded-full blur-[120px] opacity-20"
          style={{ backgroundColor: primaryColor }}
        />
        <div
          className="pointer-events-none absolute -right-20 top-20 h-[400px] w-[400px] rounded-full blur-[100px] opacity-10"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-16">
          <div className="text-center">
            <div
              className="mb-6 inline-flex items-center gap-2 rounded-full border px-5 py-2"
              style={{
                borderColor: `${primaryColor}30`,
                backgroundColor: `${primaryColor}08`,
              }}
            >
              <span className="text-lg">✈️</span>
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: primaryColor }}
              >
                {allCities.length}+ Destinations · {totalExperiences} Experiences
              </span>
            </div>

            <h1 className="text-[2.5rem] font-extrabold leading-[1.08] tracking-tight md:text-[3.5rem]">
              Discover the world&apos;s best{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb, ${primaryColor}88)`,
                }}
              >
                tours & experiences
              </span>
            </h1>

            <p className="mx-auto mt-5 max-w-2xl text-[16px] leading-[1.7] text-muted">
              Book museums, city tours, river cruises, day trips and more across {citiesByCountry.length} countries.
              Instant confirmation, free cancellation, and the best prices — guaranteed.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <a
                href="#explore"
                className="inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[14px] font-semibold text-white shadow-lg transition-all hover:scale-[1.03]"
                style={{ backgroundColor: primaryColor }}
              >
                Explore Destinations <IconArrow />
              </a>
              <a
                href="#how-it-works"
                className="inline-flex items-center gap-2 rounded-full border border-card-border bg-card-bg px-8 py-3.5 text-[14px] font-semibold transition-all hover:border-gray-300"
              >
                How it Works
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ TRUST BAR ═══════ */}
      <section className="border-y border-card-border bg-surface">
        <div className="mx-auto max-w-5xl px-6 py-6">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { icon: <IconGlobe />, label: `${citiesByCountry.length} Countries`, sub: "Worldwide coverage" },
              { icon: <IconTicket />, label: "Instant Confirmation", sub: "E-tickets delivered" },
              { icon: <IconClock />, label: "Free Cancellation", sub: "Up to 24h before" },
              { icon: <IconShield />, label: "Best Price Guarantee", sub: "Or we match it" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ backgroundColor: `${primaryColor}12`, color: primaryColor }}
                >
                  {item.icon}
                </div>
                <div>
                  <div className="text-[13px] font-bold">{item.label}</div>
                  <div className="text-[11px] text-muted">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TOP DESTINATIONS ═══════ */}
      <section id="destinations" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Popular Destinations
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Handpicked cities with the best tours and experiences
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {topCities.map((city) => {
              const imgKey = city.name.toLowerCase() === "the hague" ? "the hague" : city.slug;
              const imageUrl = cityImages[imgKey];
              return (
                <Link
                  key={city.slug}
                  href={`/r/${slug}/cities/${city.slug}`}
                  className="group flex flex-col rounded-2xl border border-card-border bg-card-bg overflow-hidden transition-[box-shadow,transform,border-color] hover:shadow-xl hover:scale-[1.02]"
                  style={{ ["--hover-border" as string]: `${primaryColor}30` }}
                >
                  {imageUrl ? (
                    <div className="relative h-44 w-full overflow-hidden">
                      <Image
                        src={imageUrl}
                        alt={`${city.name} experiences`}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                        loading="lazy"
                        decoding="async"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-4 flex items-center gap-2">
                        <span className="text-xl">{city.flag}</span>
                        <h3 className="text-[17px] font-bold text-white drop-shadow-sm">
                          {city.name}
                        </h3>
                      </div>
                      <div
                        className="absolute top-3 right-3 rounded-full px-3 py-1 text-[11px] font-bold text-white"
                        style={{ backgroundColor: `${primaryColor}dd` }}
                      >
                        {city.experiences} experiences
                      </div>
                    </div>
                  ) : (
                    <div className="flex h-32 items-center justify-center bg-accent/5">
                      <span className="text-5xl">{city.flag}</span>
                    </div>
                  )}

                  <div className="flex flex-col flex-1 p-5">
                    {!imageUrl && (
                      <h3 className="text-[16px] font-bold mb-1">{city.name}</h3>
                    )}
                    <p className="text-[12px] text-muted">{city.province} · {city.tagline}</p>

                    <div className="mt-3 flex flex-wrap gap-1">
                      {city.topCategories.slice(0, 4).map((cat) => (
                        <span
                          key={cat.slug}
                          className="rounded-full px-2.5 py-0.5 text-[10px] font-medium"
                          style={{ backgroundColor: `${primaryColor}10`, color: primaryColor }}
                        >
                          {cat.icon} {cat.name}
                        </span>
                      ))}
                    </div>

                    <div
                      className="mt-auto pt-3 flex items-center gap-1 text-[12px] font-semibold"
                      style={{ color: primaryColor }}
                    >
                      View experiences <IconArrow />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section id="how-it-works" className="py-16 bg-surface">
        <div className="mx-auto max-w-4xl px-6">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              How it Works
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Book your next experience in 3 simple steps
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {[
              { step: "1", title: "Choose a destination", desc: "Browse 400+ cities worldwide and find the perfect experience for your trip.", emoji: "🌍" },
              { step: "2", title: "Pick your experience", desc: "Compare tours, museums, cruises and more. Check availability for your dates.", emoji: "🎯" },
              { step: "3", title: "Book instantly", desc: "Secure your spot with instant confirmation. E-tickets delivered to your inbox.", emoji: "🎫" },
            ].map((item) => (
              <div key={item.step} className="relative rounded-2xl border border-card-border bg-card-bg p-8 text-center">
                <div
                  className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl text-2xl"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  {item.emoji}
                </div>
                <div
                  className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-0.5 text-[11px] font-bold text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  Step {item.step}
                </div>
                <h3 className="text-[15px] font-bold">{item.title}</h3>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ CURATED PACKAGES ═══════ */}
      <section id="packages" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08` }}
            >
              <span className="text-lg">📦</span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.15em]" style={{ color: primaryColor }}>
                Save up to 25%
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Curated Packages
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Handpicked combos — book together and save
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[
              {
                name: "Amsterdam Highlights",
                city: "Amsterdam",
                flag: "🇳🇱",
                items: [
                  { icon: "🚢", name: "Canal Cruise", price: "€18" },
                  { icon: "🏛️", name: "Rijksmuseum", price: "€22.50" },
                  { icon: "🎨", name: "Moco Museum", price: "€22.95" },
                ],
                originalPrice: "€63.45",
                packagePrice: "€49.95",
                discount: "21%",
                tag: "Most Popular",
              },
              {
                name: "Paris Essentials",
                city: "Paris",
                flag: "🇫🇷",
                items: [
                  { icon: "🗼", name: "Eiffel Tower", price: "€29.40" },
                  { icon: "🚢", name: "Seine River Cruise", price: "€16" },
                  { icon: "🏛️", name: "Louvre Skip-the-Line", price: "€22" },
                ],
                originalPrice: "€67.40",
                packagePrice: "€52.50",
                discount: "22%",
                tag: "Best Value",
              },
              {
                name: "Barcelona Discovery",
                city: "Barcelona",
                flag: "🇪🇸",
                items: [
                  { icon: "⛪", name: "Sagrada Familia", price: "€26" },
                  { icon: "🏞️", name: "Park Güell", price: "€13" },
                  { icon: "🍷", name: "Tapas & Wine Tour", price: "€65" },
                ],
                originalPrice: "€104",
                packagePrice: "€79.95",
                discount: "23%",
                tag: "Top Rated",
              },
            ].map((pkg) => (
              <div
                key={pkg.name}
                className="group relative flex flex-col rounded-2xl border border-card-border bg-card-bg overflow-hidden transition-all hover:shadow-xl hover:scale-[1.02]"
              >
                {/* Tag */}
                <div
                  className="absolute top-4 right-4 rounded-full px-3 py-1 text-[11px] font-bold text-white z-10"
                  style={{ backgroundColor: primaryColor }}
                >
                  {pkg.tag}
                </div>

                {/* Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{pkg.flag}</span>
                    <span className="text-[12px] font-medium text-muted">{pkg.city}</span>
                  </div>
                  <h3 className="text-[18px] font-bold">{pkg.name}</h3>
                </div>

                {/* Items */}
                <div className="p-6 flex-1">
                  <div className="space-y-3">
                    {pkg.items.map((item) => (
                      <div key={item.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-lg">{item.icon}</span>
                          <span className="text-[13px] font-medium">{item.name}</span>
                        </div>
                        <span className="text-[12px] text-muted line-through">{item.price}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Price footer */}
                <div className="border-t border-card-border p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <span className="text-[12px] text-muted line-through">{pkg.originalPrice}</span>
                      <div className="text-2xl font-extrabold" style={{ color: primaryColor }}>
                        {pkg.packagePrice}
                        <span className="text-[12px] font-normal text-muted ml-1">per person</span>
                      </div>
                    </div>
                    <div
                      className="rounded-full px-3 py-1 text-[13px] font-bold text-white"
                      style={{ backgroundColor: `${primaryColor}dd` }}
                    >
                      -{pkg.discount}
                    </div>
                  </div>
                  <button
                    className="mt-4 w-full rounded-full py-3 text-[13px] font-semibold text-white transition-all hover:scale-[1.02]"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Book this Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ GROUP BOOKINGS ═══════ */}
      <section id="groups" className="py-16 bg-surface">
        <div className="mx-auto max-w-5xl px-6">
          <div className="grid gap-12 md:grid-cols-2 items-center">
            <div>
              <div
                className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                style={{ borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08` }}
              >
                <span className="text-lg">👥</span>
                <span className="text-[12px] font-semibold uppercase tracking-[0.15em]" style={{ color: primaryColor }}>
                  Groups & Events
                </span>
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                Group Bookings Made Easy
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-muted">
                Planning a corporate outing, school trip, bachelor party, or family reunion?
                We handle groups of any size — from 10 to 500+ guests.
              </p>

              <div className="mt-6 space-y-4">
                {[
                  { icon: "📋", title: "Upload your guest list", desc: "Excel, CSV or just names — we handle the rest" },
                  { icon: "🎯", title: "Pick experiences together", desc: "Build a custom itinerary for your group" },
                  { icon: "🎫", title: "Everyone gets their ticket", desc: "Individual e-tickets via email or WhatsApp" },
                  { icon: "💰", title: "Group discounts", desc: "Special rates for 10+ guests on selected experiences" },
                ].map((item) => (
                  <div key={item.title} className="flex items-start gap-3">
                    <div
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                      style={{ backgroundColor: `${primaryColor}10` }}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[14px] font-bold">{item.title}</div>
                      <div className="text-[13px] text-muted">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>

              <a
                href={`mailto:${reseller.name.toLowerCase().replace(/\s+/g, "")}@ticketmatch.ai?subject=Group Booking Inquiry`}
                className="mt-8 inline-flex items-center gap-2 rounded-full px-8 py-3.5 text-[14px] font-semibold text-white transition-all hover:scale-[1.03]"
                style={{ backgroundColor: primaryColor }}
              >
                Request Group Quote <IconArrow />
              </a>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { number: "500+", label: "Max group size", icon: "👥" },
                { number: "24h", label: "Free cancellation", icon: "🔄" },
                { number: "133+", label: "Cities available", icon: "🌍" },
                { number: "50+", label: "Experience types", icon: "🎭" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="flex flex-col items-center rounded-2xl border border-card-border bg-card-bg p-6 text-center"
                >
                  <span className="text-2xl mb-2">{stat.icon}</span>
                  <div className="text-xl font-extrabold" style={{ color: primaryColor }}>{stat.number}</div>
                  <div className="text-[11px] text-muted mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ AI TRAVEL ASSISTANT ═══════ */}
      <section id="ai-assistant" className="py-16">
        <div className="mx-auto max-w-5xl px-6">
          <div className="relative overflow-hidden rounded-3xl border border-card-border bg-card-bg p-10 md:p-14">
            <div
              className="pointer-events-none absolute -right-20 -top-20 h-[300px] w-[300px] rounded-full blur-[100px] opacity-10"
              style={{ backgroundColor: primaryColor }}
            />

            <div className="relative grid gap-10 md:grid-cols-2 items-center">
              <div>
                <div
                  className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
                  style={{ borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08` }}
                >
                  <span className="text-lg">🤖</span>
                  <span className="text-[12px] font-semibold uppercase tracking-[0.15em]" style={{ color: primaryColor }}>
                    AI-Powered
                  </span>
                </div>
                <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
                  Meet Emma — Your Personal Travel AI
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-muted">
                  Not sure what to book? Ask Emma! Our AI travel assistant knows every city,
                  every experience, and every hidden gem. Available 24/7 to help you plan the perfect trip.
                </p>

                <div className="mt-6 space-y-3">
                  {[
                    "\"What can I do in Amsterdam with kids?\"",
                    "\"Best museums in Paris for a rainy day\"",
                    "\"Plan a 3-day Barcelona itinerary\"",
                    "\"Romantic experiences in Rome for 2\"",
                  ].map((q) => (
                    <div
                      key={q}
                      className="flex items-center gap-3 rounded-xl border border-card-border bg-background p-3 text-[13px] text-muted"
                    >
                      <span style={{ color: primaryColor }}>💬</span>
                      {q}
                    </div>
                  ))}
                </div>
              </div>

              {/* Emma Chat Preview */}
              <div className="rounded-2xl border border-card-border bg-background p-4 shadow-lg">
                <div className="flex items-center gap-3 border-b border-card-border pb-3 mb-4">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-white text-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    🤖
                  </div>
                  <div>
                    <div className="text-[14px] font-bold">Emma</div>
                    <div className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-[11px] text-muted">Online — ready to help</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div
                      className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      🤖
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-surface p-3 text-[13px] leading-relaxed max-w-[85%]">
                      Hi! I&apos;m Emma, your travel assistant at {reseller.name}. Where are you thinking of going? 🌍
                    </div>
                  </div>

                  <div className="flex gap-3 justify-end">
                    <div className="rounded-2xl rounded-tr-sm p-3 text-[13px] text-white max-w-[85%]" style={{ backgroundColor: primaryColor }}>
                      What&apos;s the best combo for a weekend in Amsterdam?
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div
                      className="h-7 w-7 shrink-0 rounded-full flex items-center justify-center text-white text-[10px]"
                      style={{ backgroundColor: primaryColor }}
                    >
                      🤖
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-surface p-3 text-[13px] leading-relaxed max-w-[85%]">
                      Great choice! For a weekend in Amsterdam I&apos;d recommend our <strong>Amsterdam Highlights</strong> package:
                      Canal Cruise + Rijksmuseum + Moco Museum for just <strong style={{ color: primaryColor }}>€49.95</strong> (saves you 21%). Shall I check availability for your dates?
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <div className="flex-1 rounded-full border border-card-border bg-background px-4 py-2.5 text-[13px] text-muted">
                    Ask Emma anything...
                  </div>
                  <button
                    className="rounded-full px-4 py-2.5 text-white text-[13px] font-semibold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ BRANDED TICKETS SHOWCASE ═══════ */}
      <section className="py-16 bg-surface">
        <div className="mx-auto max-w-5xl px-6">
          <div className="mb-10 text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08` }}
            >
              <span className="text-lg">🎫</span>
              <span className="text-[12px] font-semibold uppercase tracking-[0.15em]" style={{ color: primaryColor }}>
                Professional Delivery
              </span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Tickets Your Customers Will Love
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              Branded e-tickets delivered instantly — by email, WhatsApp, or digital wallet
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
            {[
              { icon: "📧", title: "Email", desc: "Beautiful branded PDF sent instantly after booking" },
              { icon: "💬", title: "WhatsApp", desc: "Direct message with ticket and QR code" },
              { icon: "🍎", title: "Apple Wallet", desc: "Add to Wallet for easy access at the venue" },
              { icon: "🤖", title: "Google Wallet", desc: "Save to Google Wallet with one tap" },
            ].map((channel) => (
              <div
                key={channel.title}
                className="flex flex-col items-center rounded-2xl border border-card-border bg-card-bg p-6 text-center transition-all hover:shadow-md"
              >
                <div
                  className="flex h-14 w-14 items-center justify-center rounded-2xl text-2xl mb-4"
                  style={{ backgroundColor: `${primaryColor}10` }}
                >
                  {channel.icon}
                </div>
                <h3 className="text-[14px] font-bold">{channel.title}</h3>
                <p className="mt-2 text-[12px] text-muted leading-relaxed">{channel.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ ALL CITIES BY COUNTRY ═══════ */}
      <section id="explore" className="py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-10 text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Explore All Destinations
            </h2>
            <p className="mt-2 text-[15px] text-muted">
              {allCities.length} cities across {citiesByCountry.length} countries
            </p>
          </div>

          {/* Country quick-nav pills */}
          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {citiesByCountry.map((group) => (
              <a
                key={group.country}
                href={`#country-${group.country.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card-bg px-4 py-2 text-[13px] font-semibold transition-all hover:scale-[1.03]"
                style={{ ["--hover-bg" as string]: `${primaryColor}08` }}
              >
                <span>{group.flag}</span>
                <span>{group.country}</span>
                <span className="text-muted text-[11px]">({group.cities.length})</span>
              </a>
            ))}
          </div>

          {citiesByCountry.map((group) => (
            <div key={group.country} id={`country-${group.country.toLowerCase()}`} className="mb-12">
              <div className="mb-6 flex items-center gap-3">
                <span className="text-3xl">{group.flag}</span>
                <div>
                  <h3 className="text-xl font-extrabold">{group.country}</h3>
                  <p className="text-[13px] text-muted">
                    {group.cities.length} cities
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                {group.cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/r/${slug}/cities/${city.slug}`}
                    className="group flex items-center gap-3 rounded-xl border border-card-border bg-card-bg p-4 transition-all hover:shadow-md hover:scale-[1.02]"
                  >
                    <span className="text-xl">{city.flag}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-[14px] font-semibold truncate">{city.name}</div>
                      <div className="text-[11px] text-muted">{city.experiences} experiences</div>
                    </div>
                    <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                      <IconArrow />
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-card-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-12">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="flex items-center gap-3">
              {reseller.logo_url ? (
                <Image
                  src={reseller.logo_url}
                  alt={reseller.name}
                  width={28}
                  height={28}
                  className="rounded-md"
                  unoptimized
                />
              ) : (
                <div
                  className="flex h-7 w-7 items-center justify-center rounded-md text-white font-bold text-[9px]"
                  style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}cc)` }}
                >
                  {reseller.name.split(" ")[0].slice(0, 3).toUpperCase()}
                </div>
              )}
              <span className="text-sm font-semibold">{reseller.name}</span>
            </div>

            <p className="text-[13px] text-muted max-w-md">
              Discover and book the best tours, museums and experiences worldwide.
              Instant confirmation, free cancellation.
            </p>

            {reseller.branding_mode !== "white_label_light" && (
              <p className="text-[11px] text-muted/60 mt-2">
                Powered by{" "}
                <a href="https://ticketmatch.ai" className="underline hover:text-foreground transition-colors">
                  TicketMatch.ai
                </a>
              </p>
            )}

            <p className="text-[11px] text-muted/40 mt-2">
              &copy; {new Date().getFullYear()} {reseller.name}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
