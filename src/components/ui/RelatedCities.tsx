import Link from "next/link";
import { allCities, type CityData } from "@/app/cities/cities-data";

/** Scan text for city names and return matching cities */
function findMentionedCities(text: string): CityData[] {
  const lower = text.toLowerCase();
  return allCities.filter((city) => {
    // Match whole word to avoid false positives (e.g. "Nice" in "nice experience")
    const regex = new RegExp(`\\b${city.name.toLowerCase()}\\b`);
    return regex.test(lower);
  });
}

export default function RelatedCities({ content, title }: { content: string; title: string }) {
  const cities = findMentionedCities(`${title} ${content}`);
  if (cities.length === 0) return null;

  return (
    <div className="mt-8 rounded-2xl border border-card-border bg-card-bg p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </div>
        <div>
          <p className="text-[13px] font-bold">Explore these destinations</p>
          <p className="text-[11px] text-muted">Book group experiences on TicketMatch</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {cities.map((city) => (
          <Link
            key={city.slug}
            href={`/cities/${city.slug}`}
            className="inline-flex items-center gap-2 rounded-xl border border-card-border bg-surface px-4 py-2.5 text-[13px] font-medium transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-accent group"
          >
            <span className="text-base">{city.flag}</span>
            <span>{city.name}</span>
            <span className="text-[11px] text-muted group-hover:text-accent/60">{city.experiences}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="ml-1 text-muted opacity-0 group-hover:opacity-100 transition-opacity">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
