import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { allCities, citiesByCountry } from "./cities-data";
import { getAllCityImages } from "@/lib/viator-images";

export const metadata: Metadata = {
  title: "Cities — B2B Group Experiences Worldwide | TicketMatch.ai",
  description:
    `Explore ${allCities.length} cities on TicketMatch.ai. B2B group tickets for museums, tours, cruises & more across 33 countries. Exclusive rates for tour operators & DMCs.`,
  alternates: { canonical: "/cities" },
  openGraph: {
    title: "Cities — B2B Group Experiences Worldwide | TicketMatch.ai",
    description:
      `${allCities.length} cities across 33 countries with 250,000+ group experiences at exclusive B2B rates. Museums, tours, cruises & more.`,
    url: "https://ticketmatch.ai/cities",
  },
  keywords: [
    "Europe group travel",
    "European cities group tours",
    "B2B museum tickets Europe",
    "tour operator Europe",
    "DMC Europe",
    "Netherlands group travel",
    "Germany group travel",
    "group experiences Amsterdam Berlin",
    "European travel platform B2B",
  ],
};

function IconArrow() {
  return <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

export default async function CitiesPage() {
  /* Fetch one Viator image per city — only top cities to avoid API rate limits */
  const topCitySlugs = citiesByCountry.flatMap((group) =>
    group.cities.slice(0, 2).map((c) =>
      c.name.toLowerCase() === "the hague" ? "the hague" : c.slug
    )
  );
  const cityImages = await getAllCityImages(topCitySlugs);

  /* Total experiences across all cities */
  const totalExperiences = "350,000+";

  /* JSON-LD for cities overview */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "European Cities — B2B Group Experiences",
    description: `Overview of all ${allCities.length} European cities available on TicketMatch.ai for B2B group travel bookings.`,
    url: "https://ticketmatch.ai/cities",
    isPartOf: { "@id": "https://ticketmatch.ai/#website" },
    about: {
      "@type": "Place",
      name: "Europe",
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: allCities.map((city, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: `${city.name}, ${city.country} — ${city.experiences} group experiences`,
        url: `https://ticketmatch.ai/cities/${city.slug}`,
      })),
    },
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />

        <div className="relative mx-auto max-w-5xl px-6 pt-12 pb-12">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cities" },
            ]}
          />

          <div className="mt-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <span className="text-lg">🌍</span>
              <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">
                {allCities.length} European Cities · {citiesByCountry.length} Countries
              </span>
            </div>

            <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[3rem]">
              Group Experiences across{" "}
              <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                Europe
              </span>
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-muted">
              Explore {totalExperiences} B2B group experiences across {allCities.length} cities in {citiesByCountry.length} European countries. Exclusive rates for tour operators, DMCs, and travel agencies.
            </p>

            {/* Country quick-nav pills */}
            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {citiesByCountry.map((group) => (
                <a
                  key={group.country}
                  href={`#${group.country.toLowerCase()}`}
                  className="inline-flex items-center gap-1.5 rounded-full border border-card-border bg-card-bg px-4 py-2 text-[13px] font-semibold transition-all hover:border-accent/30 hover:bg-accent/5 hover:scale-[1.03]"
                >
                  <span>{group.flag}</span>
                  <span>{group.country}</span>
                  <span className="text-muted text-[11px]">({group.cities.length})</span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ CITY GRID PER COUNTRY ═══════ */}
      {citiesByCountry.map((group) => (
        <section
          key={group.country}
          id={group.country.toLowerCase()}
          className="py-16 bg-surface transition-colors odd:bg-background"
        >
          <div className="mx-auto max-w-6xl px-6">
            {/* Country header */}
            <div className="mb-8 flex items-center gap-3">
              <span className="text-3xl">{group.flag}</span>
              <div>
                <h2 className="text-xl font-extrabold tracking-tight">
                  {group.country}
                </h2>
                <p className="text-[13px] text-muted">
                  {group.cities.length} cities · {group.cities.reduce((sum, c) => {
                    const num = parseInt(c.experiences.replace(/[^0-9]/g, ""));
                    return sum + num;
                  }, 0).toLocaleString()}+ group experiences
                </p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {group.cities.map((city) => {
                const imgKey = city.name.toLowerCase() === "the hague" ? "the hague" : city.slug;
                const imageUrl = cityImages[imgKey];
                return (
                  <Link
                    key={city.slug}
                    href={`/cities/${city.slug}`}
                    className="group flex flex-col rounded-2xl border border-card-border bg-card-bg overflow-hidden transition-[box-shadow,transform,border-color] hover:shadow-xl hover:scale-[1.02] hover:border-accent/20"
                  >
                    {/* City Image */}
                    {imageUrl ? (
                      <div className="relative h-40 w-full overflow-hidden">
                        <Image
                          src={imageUrl}
                          alt={`${city.name} group experiences`}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-500 group-hover:scale-110"
                          loading="lazy"
                          decoding="async"
                          unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                        <div className="absolute bottom-3 left-4 flex items-center gap-2">
                          <span className="text-xl">{city.flag}</span>
                          <h3 className="text-[16px] font-bold text-white drop-shadow-sm">
                            {city.name}
                          </h3>
                        </div>
                      </div>
                    ) : (
                      <div className="flex h-28 items-center justify-center bg-accent/5">
                        <span className="text-4xl">{city.flag}</span>
                      </div>
                    )}

                    <div className="flex flex-col flex-1 p-5">
                      {!imageUrl && (
                        <h3 className="text-[16px] font-bold group-hover:text-accent transition-colors mb-2">
                          {city.name}
                        </h3>
                      )}
                      <p className="text-[11px] text-muted font-medium">{city.province} — {city.tagline}</p>

                      <div className="mt-3 flex items-center gap-4">
                        <div>
                          <div className="text-lg font-extrabold text-accent">{city.experiences}</div>
                          <div className="text-[10px] text-muted uppercase tracking-wider">Experiences</div>
                        </div>
                        <div className="h-6 w-px bg-border" />
                        <div>
                          <div className="text-lg font-extrabold">{city.categories}</div>
                          <div className="text-[10px] text-muted uppercase tracking-wider">Categories</div>
                        </div>
                      </div>

                      {/* Category pills */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        {city.topCategories.slice(0, 4).map((cat) => (
                          <span key={cat.slug} className="rounded-full bg-accent/5 px-2 py-0.5 text-[10px] font-medium text-accent">
                            {cat.icon} {cat.name}
                          </span>
                        ))}
                      </div>

                      <div className="mt-auto pt-3 flex items-center gap-1 text-[12px] font-semibold text-accent">
                        Explore {city.name} <IconArrow />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      ))}

      {/* ═══════ CTA ═══════ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#1a2744] to-gray-900 p-10 md:p-14 text-center shadow-2xl">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/5" />
            <h2 className="relative text-2xl font-extrabold text-white">
              Ready to explore Europe for your groups?
            </h2>
            <p className="relative mt-3 text-[15px] text-gray-400">
              Join TicketMatch.ai — {totalExperiences} experiences across {allCities.length} cities in {citiesByCountry.length} countries at exclusive B2B rates.
            </p>
            <div className="relative mt-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-gray-900 shadow-lg transition-[transform,box-shadow] hover:shadow-white/20 hover:scale-[1.02]"
              >
                Request Membership <IconArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
