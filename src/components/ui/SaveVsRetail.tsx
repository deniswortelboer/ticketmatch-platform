"use client";

const examples = [
  { name: "Rijksmuseum — Amsterdam", category: "Museum", retail: "€22.50", savings: "Save up to 19%", fakeB2B: "€18.25" },
  { name: "Park Güell — Barcelona", category: "Attraction", retail: "€13.00", savings: "Save up to 22%", fakeB2B: "€10.14" },
  { name: "Canal Cruise — Amsterdam", category: "Cruise", retail: "€18.00", savings: "Save up to 17%", fakeB2B: "€14.94" },
  { name: "Colosseum — Rome", category: "Attraction", retail: "€18.00", savings: "Save up to 21%", fakeB2B: "€14.22" },
];

const categoryStyles: Record<string, string> = {
  Museum: "bg-blue-500/10 text-blue-600",
  Attraction: "bg-purple-500/10 text-purple-600",
  Cruise: "bg-emerald-500/10 text-emerald-600",
};

export default function SaveVsRetail() {
  return (
    <section className="w-full py-12">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="mb-2 text-center text-2xl font-bold tracking-tight">
          See What B2B Members Save
        </h2>
        <p className="mb-8 text-center text-sm text-muted">
          Real experiences. Real savings. Unlock your rate.
        </p>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {examples.map((item) => (
            <div
              key={item.name}
              className="rounded-xl border border-card-border bg-card-bg p-4 hover:shadow-md transition-all"
            >
              {/* Category badge */}
              <span
                className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${categoryStyles[item.category]}`}
              >
                {item.category}
              </span>

              {/* Experience name */}
              <h3 className="mt-2 text-[14px] font-bold leading-tight">
                {item.name}
              </h3>

              {/* Retail price — crossed out */}
              <p className="mt-2 text-sm text-muted line-through">
                Retail: {item.retail}
              </p>

              {/* B2B price — blurred + locked */}
              <div className="relative mt-2">
                <div className="blur-[6px] select-none text-lg font-bold text-accent">
                  {item.fakeB2B}
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-1.5 rounded-full bg-foreground/90 px-3 py-1 text-[10px] font-semibold text-white">
                    <svg
                      width="10"
                      height="10"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Sign up to unlock
                  </span>
                </div>
              </div>

              {/* Savings badge */}
              <div className="mt-3">
                <span className="bg-emerald-500/10 text-emerald-600 font-semibold rounded-full px-2.5 py-0.5 text-[11px]">
                  {item.savings}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* CTA text */}
        <p className="mt-8 text-center text-sm text-muted">
          These are real retail prices. B2B members save 15-25% on average across
          300,000+ experiences.
        </p>
        <p className="mt-2 text-center">
          <a
            href="/auth/register"
            className="text-sm font-medium text-accent hover:underline"
          >
            Request free access to unlock B2B pricing &rarr;
          </a>
        </p>
      </div>
    </section>
  );
}
