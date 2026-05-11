import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";
import { allCities } from "@/app/cities/cities-data";
import cityHeroCache from "@/app/cities/city-hero-cache.json";

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

function IconBack() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M10 12L6 8l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}): Promise<Metadata> {
  const { slug, city: citySlug } = await params;
  const city = allCities.find((c) => c.slug === citySlug);
  const reseller = await getReseller(slug);

  if (!city || !reseller) return { title: "Not Found" };

  const title = `${city.name} Tours & Experiences — ${reseller.name}`;
  const description = `Discover ${city.experiences} tours, museums and experiences in ${city.name}. Book instantly with ${reseller.name}. Free cancellation, best prices.`;

  return {
    title,
    description,
    openGraph: { title, description, url: `https://ticketmatch.ai/r/${slug}/cities/${citySlug}` },
  };
}

export default async function ResellerCityPage({
  params,
}: {
  params: Promise<{ slug: string; city: string }>;
}) {
  const { slug, city: citySlug } = await params;
  const city = allCities.find((c) => c.slug === citySlug);
  if (!city) notFound();

  const reseller = await getReseller(slug);
  if (!reseller) notFound();

  const primaryColor = reseller.primary_color || "#FF6B35";

  const cacheKey = city.name.toLowerCase() === "the hague" ? "the hague" : city.slug;
  const heroImages = (cityHeroCache as Record<string, { url: string; caption: string }[]>)[cacheKey] || [];

  return (
    <div className="min-h-screen bg-background transition-colors">
      {/* ═══════ RESELLER HEADER ═══════ */}
      <header className="sticky top-0 z-50 border-b border-card-border bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href={`/r/${slug}`} className="flex items-center gap-3">
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
          </Link>

          <Link
            href={`/r/${slug}`}
            className="flex items-center gap-1 text-[13px] font-medium text-muted hover:text-foreground transition-colors"
          >
            <IconBack /> All destinations
          </Link>
        </div>
      </header>

      {/* ═══════ HERO ═══════ */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute -left-20 top-10 h-[500px] w-[500px] rounded-full blur-[120px] opacity-15"
          style={{ backgroundColor: primaryColor }}
        />

        <div className="relative mx-auto max-w-6xl px-6 pt-12 pb-8">
          {/* Breadcrumb */}
          <nav className="mb-6 flex items-center gap-2 text-[13px] text-muted">
            <Link href={`/r/${slug}`} className="hover:text-foreground transition-colors">{reseller.name}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{city.name}</span>
          </nav>

          <div className="text-center">
            <div
              className="mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5"
              style={{ borderColor: `${primaryColor}25`, backgroundColor: `${primaryColor}08` }}
            >
              <span className="text-lg">{city.flag}</span>
              <span
                className="text-[12px] font-semibold uppercase tracking-[0.15em]"
                style={{ color: primaryColor }}
              >
                {city.province}, {city.country}
              </span>
            </div>

            <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[3rem]">
              {city.name}{" "}
              <span
                className="bg-clip-text text-transparent"
                style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}bb)` }}
              >
                Tours & Experiences
              </span>
            </h1>

            <p className="mx-auto mt-3 max-w-xl text-[14px] italic" style={{ color: `${primaryColor}cc` }}>
              {city.tagline}
            </p>

            <p className="mx-auto mt-4 max-w-2xl text-[15px] leading-[1.7] text-muted">
              {city.description}
            </p>

            {/* Stats */}
            <div className="mt-8 inline-flex items-center gap-6 rounded-2xl border border-card-border bg-card-bg px-8 py-4 shadow-sm">
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: primaryColor }}>{city.experiences}</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Experiences</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: primaryColor }}>{city.categories}</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Categories</div>
              </div>
              <div className="h-8 w-px bg-border" />
              <div className="text-center">
                <div className="text-2xl font-extrabold" style={{ color: primaryColor }}>24h</div>
                <div className="text-[11px] font-medium text-muted uppercase tracking-wider">Free Cancel</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ HERO IMAGES ═══════ */}
      {heroImages.length > 0 && (
        <section className="mx-auto max-w-6xl px-6 pb-8">
          <div className="grid gap-2 grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {heroImages.slice(0, 6).map((img, i) => (
              <div key={i} className="relative h-32 overflow-hidden rounded-xl">
                <Image
                  src={img.url}
                  alt={img.caption || `${city.name} experience`}
                  fill
                  sizes="(max-width: 768px) 50vw, 16vw"
                  className="object-cover transition-transform duration-500 hover:scale-110"
                  loading={i < 3 ? "eager" : "lazy"}
                  unoptimized
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══════ CATEGORIES ═══════ */}
      <section className="py-12 bg-surface">
        <div className="mx-auto max-w-6xl px-6">
          <h2 className="mb-8 text-xl font-extrabold tracking-tight">
            Explore {city.name} by Category
          </h2>

          <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {city.topCategories.map((cat) => (
              <div
                key={cat.slug}
                className="group flex items-center gap-4 rounded-2xl border border-card-border bg-card-bg p-5 transition-all hover:shadow-lg hover:scale-[1.02] cursor-pointer"
              >
                <div
                  className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-xl"
                  style={{ backgroundColor: `${primaryColor}12` }}
                >
                  {cat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[14px] font-bold truncate">{cat.name}</div>
                  <div className="text-[12px] text-muted">{cat.count} experiences</div>
                </div>
                <span className="text-muted opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconArrow />
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ HIGHLIGHTS ═══════ */}
      {city.highlights.length > 0 && (
        <section className="py-12">
          <div className="mx-auto max-w-4xl px-6">
            <h2 className="mb-6 text-xl font-extrabold tracking-tight">
              Why visit {city.name}?
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {city.highlights.map((h, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-xl border border-card-border bg-card-bg p-4"
                >
                  <div
                    className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white text-[11px] font-bold"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {i + 1}
                  </div>
                  <p className="text-[13px] leading-relaxed text-muted">{h}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ FAQ ═══════ */}
      {city.faq.length > 0 && (
        <section className="py-12 bg-surface">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="mb-8 text-xl font-extrabold tracking-tight text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {city.faq.map((f, i) => (
                <details
                  key={i}
                  className="group rounded-xl border border-card-border bg-card-bg overflow-hidden"
                >
                  <summary className="flex cursor-pointer items-center justify-between p-5 text-[14px] font-semibold">
                    {f.q}
                    <span className="ml-4 text-muted transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <div className="px-5 pb-5 text-[13px] leading-relaxed text-muted">
                    {f.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ═══════ CTA ═══════ */}
      <section className="py-16">
        <div className="mx-auto max-w-3xl px-6">
          <div
            className="relative overflow-hidden rounded-3xl p-10 md:p-14 text-center shadow-2xl"
            style={{ background: `linear-gradient(135deg, ${primaryColor}ee, ${primaryColor}aa)` }}
          >
            <h2 className="text-2xl font-extrabold text-white">
              Ready to explore {city.name}?
            </h2>
            <p className="mt-3 text-[15px] text-white/80">
              {city.experiences} experiences available. Book with instant confirmation and free cancellation.
            </p>
            <div className="mt-8">
              <Link
                href={`/r/${slug}`}
                className="inline-flex items-center gap-2 rounded-full bg-white px-7 py-3.5 text-[13px] font-semibold shadow-lg transition-all hover:shadow-xl hover:scale-[1.02]"
                style={{ color: primaryColor }}
              >
                Browse All Destinations <IconArrow />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════ FOOTER ═══════ */}
      <footer className="border-t border-card-border bg-surface">
        <div className="mx-auto max-w-6xl px-6 py-10">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex items-center gap-2">
              <div
                className="flex h-6 w-6 items-center justify-center rounded text-white font-bold text-[8px]"
                style={{ background: primaryColor }}
              >
                {reseller.name.split(" ")[0].slice(0, 3).toUpperCase()}
              </div>
              <span className="text-sm font-semibold">{reseller.name}</span>
            </div>
            {reseller.branding_mode !== "white_label_light" && (
              <p className="text-[11px] text-muted/60">
                Powered by{" "}
                <a href="https://ticketmatch.ai" className="underline hover:text-foreground transition-colors">
                  TicketMatch.ai
                </a>
              </p>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
