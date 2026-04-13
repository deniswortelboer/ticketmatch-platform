import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import Breadcrumbs from "@/components/Breadcrumbs";
import { allCities } from "../../cities-data";
import { getCategoryImages } from "@/lib/viator-images";

/* ── Viator category tag mapping (slug → Viator tag key) ── */
const CATEGORY_TO_VIATOR: Record<string, string> = {
  museums: "museums",
  tours: "tours",
  attractions: "attractions",
  "canal-cruises": "water",
  "food-drink": "food",
  "art-culture": "museums",
  outdoor: "outdoor",
  transport: "transport",
  classes: "classes",
  heritage: "tours",
  "day-trips": "tours",
  water: "water",
  shows: "tickets",
};

/* ── Static Params for SSG: all city × category combinations ── */
export function generateStaticParams() {
  const params: { city: string; category: string }[] = [];
  for (const city of allCities) {
    for (const cat of city.topCategories) {
      params.push({ city: city.slug, category: cat.slug });
    }
  }
  return params;
}

/* ── Dynamic Metadata ── */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}): Promise<Metadata> {
  const { city: citySlug, category: catSlug } = await params;
  const city = allCities.find((c) => c.slug === citySlug);
  if (!city) return {};
  const cat = city.topCategories.find((c) => c.slug === catSlug);
  if (!cat) return {};

  const title = `${cat.name} in ${city.name} — ${cat.count} B2B Group Experiences | TicketMatch.ai`;
  const description = `Book ${cat.count} ${cat.name.toLowerCase()} experiences in ${city.name} at exclusive B2B rates. ${cat.description.slice(0, 120)}`;

  return {
    title,
    description,
    alternates: { canonical: `/cities/${city.slug}/${cat.slug}` },
    openGraph: {
      title,
      description,
      url: `https://ticketmatch.ai/cities/${city.slug}/${cat.slug}`,
      siteName: "TicketMatch.ai",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${cat.name} in ${city.name} — ${cat.count} Experiences`,
      description,
    },
    keywords: [
      /* Primary keywords */
      `${cat.name.toLowerCase()} ${city.name}`,
      `${city.name} ${cat.name.toLowerCase()} group tickets`,
      `${cat.name.toLowerCase()} tours ${city.name}`,
      `B2B ${cat.name.toLowerCase()} ${city.name}`,
      `group ${cat.name.toLowerCase()} ${city.name}`,
      `${city.name} tour operator ${cat.name.toLowerCase()}`,
      `DMC ${city.name} ${cat.name.toLowerCase()}`,
      /* LSI / Semantic keywords */
      `${cat.name.toLowerCase()} ${city.name} wholesale`,
      `bulk ${cat.name.toLowerCase()} tickets ${city.name}`,
      `skip the line ${cat.name.toLowerCase()} ${city.name}`,
      `${city.name} ${cat.name.toLowerCase()} group discount`,
      `best ${cat.name.toLowerCase()} ${city.name} groups`,
      `${city.name} ${cat.name.toLowerCase()} itinerary`,
    ],
    other: {
      "geo.region": ({ Germany: "DE", France: "FR", Spain: "ES", Italy: "IT", "United Kingdom": "GB", Netherlands: "NL", Belgium: "BE", Austria: "AT", Switzerland: "CH", Portugal: "PT", "Czech Republic": "CZ", Hungary: "HU", Greece: "GR", Croatia: "HR", Ireland: "IE", Denmark: "DK", Poland: "PL", Sweden: "SE", Norway: "NO", Finland: "FI", Iceland: "IS", Estonia: "EE", Latvia: "LV", Lithuania: "LT", Turkey: "TR", Romania: "RO", Bulgaria: "BG", Serbia: "RS", Montenegro: "ME", Slovenia: "SI", Slovakia: "SK", Luxembourg: "LU", Malta: "MT", Cyprus: "CY", Thailand: "TH", Japan: "JP", Indonesia: "ID", UAE: "AE", Vietnam: "VN", "South Korea": "KR", India: "IN", Israel: "IL", China: "CN", Malaysia: "MY", "United States": "US", Mexico: "MX", Brazil: "BR", Argentina: "AR", Peru: "PE", Colombia: "CO", "Costa Rica": "CR", Australia: "AU", "New Zealand": "NZ", Fiji: "FJ", "South Africa": "ZA" } as Record<string, string>)[city.country] || "EU",
      "geo.placename": city.name,
      "geo.position": `${city.geoLat};${city.geoLon}`,
      "ICBM": `${city.geoLat}, ${city.geoLon}`,
    },
  };
}

/* ── Icons ── */
function IconArrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* ── Page ── */
export default async function CategoryPage({
  params,
}: {
  params: Promise<{ city: string; category: string }>;
}) {
  const { city: citySlug, category: catSlug } = await params;
  const city = allCities.find((c) => c.slug === citySlug);
  if (!city) notFound();
  const cat = city.topCategories.find((c) => c.slug === catSlug);
  if (!cat) notFound();

  /* Fetch Viator images for this category + city */
  const viatorTag = CATEGORY_TO_VIATOR[cat.slug] || "tours";
  const cityKey = city.name.toLowerCase() === "the hague" ? "the hague" : city.slug;
  const images = await getCategoryImages(viatorTag, cityKey, 8);

  /* Related categories in this city (excluding current) */
  const relatedCategories = city.topCategories.filter((c) => c.slug !== cat.slug);

  /* Find same category in other cities */
  const sameCategoryOtherCities = allCities
    .filter((c) => c.slug !== city.slug && c.topCategories.some((tc) => tc.slug === cat.slug))
    .slice(0, 8);

  /* JSON-LD */
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: `${cat.name} in ${city.name} — B2B Group Experiences`,
        description: cat.description,
        url: `https://ticketmatch.ai/cities/${city.slug}/${cat.slug}`,
        isPartOf: {
          "@type": "WebPage",
          url: `https://ticketmatch.ai/cities/${city.slug}`,
        },
        about: {
          "@type": "TouristDestination",
          name: city.name,
        },
        provider: { "@id": "https://ticketmatch.ai/#organization" },
        numberOfItems: cat.count,
        specialty: `${cat.name} group experiences in ${city.name}`,
      },
      {
        "@type": "WebPage",
        name: `${cat.name} in ${city.name}`,
        url: `https://ticketmatch.ai/cities/${city.slug}/${cat.slug}`,
        breadcrumb: {
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://ticketmatch.ai" },
            { "@type": "ListItem", position: 2, name: "Cities", item: "https://ticketmatch.ai/cities" },
            { "@type": "ListItem", position: 3, name: city.name, item: `https://ticketmatch.ai/cities/${city.slug}` },
            { "@type": "ListItem", position: 4, name: cat.name },
          ],
        },
      },
    ],
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

        <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-8">
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Cities", href: "/cities" },
              { label: city.name, href: `/cities/${city.slug}` },
              { label: cat.name },
            ]}
          />

          <div className="mt-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">
                {cat.count} Experiences
              </span>
            </div>

            <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[3rem]">
              {cat.name} in{" "}
              <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                {city.name}
              </span>
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-muted">
              {cat.description}
            </p>

            {/* Stats */}
            <div className="mt-8 inline-flex items-center gap-6 rounded-2xl border border-card-border bg-card-bg px-8 py-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">{cat.count}</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">{cat.name}</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">B2B</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Group Rates</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold text-accent">AI</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Search</div>
              </div>
            </div>

            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-7 py-3.5 text-[13px] font-semibold text-white shadow-lg shadow-accent/25 transition-[box-shadow,filter] hover:shadow-accent/40 hover:brightness-110"
              >
                Access {cat.name} in {city.name} <IconArrow />
              </Link>
              <Link
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-[13px] font-semibold transition-colors hover:bg-surface-alt"
              >
                All {city.name} experiences
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ VIATOR PHOTO GRID ═══════ */}
      {images.length > 0 && (
        <section className="py-8 bg-background">
          <div className="mx-auto max-w-6xl px-6">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {images.slice(0, 8).map((img, i) => (
                <div
                  key={i}
                  className="group relative aspect-[4/3] overflow-hidden rounded-2xl border border-card-border shadow-sm"
                >
                  <Image
                    src={img.url}
                    alt={img.caption || `${cat.name} in ${city.name} ${i + 1}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                    decoding="async"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  {img.caption && (
                    <div className="absolute inset-x-0 bottom-0 p-2.5 opacity-0 transition-opacity group-hover:opacity-100">
                      <p className="text-[11px] font-medium text-white leading-tight line-clamp-2">{img.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ WHY BOOK THIS CATEGORY ═══════ */}
      <section className="py-16 bg-surface transition-colors">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center">
            <h2 className="text-2xl font-extrabold tracking-tight md:text-3xl">
              Why Book {cat.name} in {city.name} with TicketMatch?
            </h2>
          </div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: "💰",
                title: "Exclusive B2B Rates",
                desc: `Access ${cat.count} ${cat.name.toLowerCase()} experiences in ${city.name} at wholesale rates — typically 15-30% below retail.`,
              },
              {
                icon: "🤖",
                title: "AI-Powered Discovery",
                desc: `Ask Emma AI to find the perfect ${cat.name.toLowerCase()} for your group size, budget, and interests — in any language.`,
              },
              {
                icon: "📊",
                title: "Live Busyness Data",
                desc: `See real-time busyness levels for ${city.name} ${cat.name.toLowerCase()} venues. Plan visits during quieter times.`,
              },
              {
                icon: "🎟️",
                title: "QR Vouchers",
                desc: "Digital tickets with QR codes for instant group entry. No paper tickets, no waiting.",
              },
              {
                icon: "📦",
                title: "Package Builder",
                desc: `Combine ${cat.name.toLowerCase()} with other ${city.name} experiences into one group package with optimized pricing.`,
              },
              {
                icon: "🗺️",
                title: "Route Planner",
                desc: `Optimize walking routes between ${cat.name.toLowerCase()} venues in ${city.name} for efficient group itineraries.`,
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-card-border bg-card-bg p-6">
                <div className="text-2xl mb-3">{item.icon}</div>
                <h3 className="text-[14px] font-bold">{item.title}</h3>
                <p className="mt-2 text-[12px] text-muted leading-[1.6]">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ MORE CATEGORIES IN THIS CITY ═══════ */}
      {relatedCategories.length > 0 && (
        <section className="py-16 bg-background transition-colors">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-xl font-extrabold tracking-tight">
              More categories in {city.name}
            </h2>
            <p className="mt-2 text-[14px] text-muted">
              Explore other experience categories available in {city.name} at B2B rates.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {relatedCategories.map((rc) => (
                <Link
                  key={rc.slug}
                  href={`/cities/${city.slug}/${rc.slug}`}
                  className="group flex items-center gap-3 rounded-2xl border border-card-border bg-card-bg px-5 py-4 transition-[box-shadow,transform,border-color] hover:shadow-lg hover:scale-[1.02] hover:border-accent/20"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-xl">
                    {rc.icon}
                  </div>
                  <div>
                    <h3 className="text-[14px] font-bold group-hover:text-accent transition-colors">{rc.name}</h3>
                    <p className="text-[11px] font-semibold text-accent">{rc.count} experiences</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ SAME CATEGORY IN OTHER CITIES ═══════ */}
      {sameCategoryOtherCities.length > 0 && (
        <section className="py-16 bg-surface transition-colors">
          <div className="mx-auto max-w-5xl px-6">
            <h2 className="text-xl font-extrabold tracking-tight">
              {cat.name} in other Dutch cities
            </h2>
            <p className="mt-2 text-[14px] text-muted">
              Explore {cat.name.toLowerCase()} across the Netherlands — all at B2B group rates.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {sameCategoryOtherCities.map((otherCity) => {
                const otherCat = otherCity.topCategories.find((tc) => tc.slug === cat.slug);
                return (
                  <Link
                    key={otherCity.slug}
                    href={`/cities/${otherCity.slug}/${cat.slug}`}
                    className="rounded-full border border-border bg-card-bg px-4 py-2 text-[13px] font-medium transition-colors hover:border-accent/30 hover:text-accent"
                  >
                    {otherCity.flag} {otherCity.name}
                    {otherCat && <span className="ml-1.5 text-muted text-[11px]">{otherCat.count}</span>}
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CTA ═══════ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-[#1a2744] to-gray-900 p-10 md:p-14 text-center shadow-2xl">
            <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/5" />
            <div className="pointer-events-none absolute -left-8 -bottom-8 h-32 w-32 rounded-full bg-accent/10 blur-[60px]" />
            <h2 className="relative text-2xl font-extrabold text-white">
              Book {cat.name} in {city.name} for your groups
            </h2>
            <p className="relative mt-3 text-[15px] text-gray-400">
              Access {cat.count} {cat.name.toLowerCase()} experiences at exclusive B2B rates. AI-powered search, live busyness data, QR vouchers.
            </p>
            <div className="relative mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold text-gray-900 shadow-lg transition-[transform,box-shadow] hover:shadow-white/20 hover:scale-[1.02]"
              >
                Request Membership <IconArrow />
              </Link>
              <Link
                href={`/cities/${city.slug}`}
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-7 py-3.5 text-[13px] font-semibold text-white transition-colors hover:bg-white/10"
              >
                Back to {city.name}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
