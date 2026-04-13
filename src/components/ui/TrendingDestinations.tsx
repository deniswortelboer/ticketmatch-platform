"use client";

const trending = [
  { city: "Rotterdam", flag: "🇳🇱", growth: "+48%", sparkline: [20, 25, 22, 30, 35, 42, 48] },
  { city: "Prague", flag: "🇨🇿", growth: "+32%", sparkline: [15, 18, 20, 22, 25, 28, 32] },
  { city: "Barcelona", flag: "🇪🇸", growth: "+27%", sparkline: [30, 28, 32, 35, 33, 38, 42] },
  { city: "Amsterdam", flag: "🇳🇱", growth: "+18%", sparkline: [60, 62, 58, 65, 68, 70, 72] },
  { city: "Lisbon", flag: "🇵🇹", growth: "+24%", sparkline: [10, 14, 12, 18, 20, 22, 25] },
  { city: "Budapest", flag: "🇭🇺", growth: "+21%", sparkline: [8, 10, 12, 14, 16, 18, 20] },
];

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const h = 20;
  const w = 40;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / (max - min)) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  const fillPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="shrink-0">
      <defs>
        <linearGradient id="sparkGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#10B981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={fillPoints} fill="url(#sparkGrad)" />
      <polyline
        points={points}
        fill="none"
        stroke="#10B981"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function TrendingDestinations() {
  return (
    <section className="py-4 bg-surface border-y border-border/30 transition-colors">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center gap-6 overflow-x-auto scrollbar-hide">
          {/* Label */}
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-base">🔥</span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted">
              Trending this week
            </span>
          </div>

          {/* Divider after label */}
          <div className="w-px h-6 bg-border/40 shrink-0" />

          {/* Destination items */}
          {trending.map((item, index) => (
            <div key={item.city} className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm">{item.flag}</span>
                  <span className="font-bold text-[13px] text-foreground">
                    {item.city}
                  </span>
                </div>
                <span className="text-emerald-600 font-bold text-[13px]">
                  {item.growth}
                </span>
                <Sparkline data={item.sparkline} />
              </div>

              {/* Divider between items (not after the last) */}
              {index < trending.length - 1 && (
                <div className="w-px h-6 bg-border/40 shrink-0 ml-3" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Hide scrollbar across browsers */}
      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
