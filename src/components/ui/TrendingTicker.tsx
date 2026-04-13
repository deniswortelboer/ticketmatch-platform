"use client";

import Link from "next/link";

type TrendingItem = {
  label: string;
  href: string;
  category: string;
  hot?: boolean;
};

const TRENDING: TrendingItem[] = [
  { label: "Group pricing strategies", href: "/insights/group-pricing-strategies-2026", category: "Data", hot: true },
  { label: "Rotterdam rising", href: "/insights/rotterdam-rising-europes-next-group-travel-hotspot", category: "Guide" },
  { label: "MICE trends 2026", href: "/insights/mice-market-trends-europe-2026", category: "Trends", hot: true },
  { label: "QR voucher revolution", href: "/insights/digital-vouchers-qr-revolution-group-travel", category: "Technology" },
  { label: "AI agents in travel", href: "/insights/how-ai-is-changing-tour-operator-workflows", category: "Technology" },
  { label: "Live busyness data", href: "/insights/busyness-data-competitive-advantage", category: "Data", hot: true },
  { label: "Multi-day itineraries", href: "/insights/building-multi-day-itineraries-that-sell", category: "Guide" },
  { label: "B2B platforms", href: "/insights/why-b2b-platforms-are-transforming-group-travel", category: "Industry" },
  { label: "Amsterdam museums", href: "/insights/top-10-museums-amsterdam-group-visits", category: "Amsterdam" },
];

const catColors: Record<string, string> = {
  Industry: "text-blue-500",
  Amsterdam: "text-orange-500",
  Technology: "text-purple-500",
  Data: "text-cyan-500",
  Guide: "text-emerald-500",
  Trends: "text-pink-500",
};

export default function TrendingTicker() {
  return (
    <div className="relative overflow-hidden border-y border-card-border bg-surface py-2.5">
      <div className="flex items-center gap-3 px-6">
        {/* Label */}
        <div className="flex shrink-0 items-center gap-2 pr-3 border-r border-card-border">
          <div className="h-2 w-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-accent">Trending</span>
        </div>

        {/* Scrolling ticker */}
        <div className="flex-1 overflow-hidden relative">
          <div className="flex animate-ticker gap-6 whitespace-nowrap">
            {[...TRENDING, ...TRENDING].map((item, i) => (
              <Link
                key={`${item.label}-${i}`}
                href={item.href}
                className="inline-flex shrink-0 items-center gap-2 text-[12px] font-medium text-muted hover:text-foreground transition-colors"
              >
                {item.hot && (
                  <span className="inline-flex h-4 items-center rounded bg-red-500/10 px-1.5 text-[9px] font-bold uppercase text-red-500">
                    Hot
                  </span>
                )}
                <span className={`${catColors[item.category] || "text-muted"}`}>
                  {item.category}
                </span>
                <span className="opacity-30">|</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes ticker {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-ticker {
          animation: ticker 40s linear infinite;
        }
        .animate-ticker:hover {
          animation-play-state: paused;
        }
      `}</style>
    </div>
  );
}
