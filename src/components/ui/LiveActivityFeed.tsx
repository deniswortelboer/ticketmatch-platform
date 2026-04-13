"use client";

import { useState, useEffect, useCallback } from "react";

type Activity = {
  icon: string;
  text: string;
  time: string;
  type: "booking" | "member" | "trending";
};

const activities: Activity[] = [
  { icon: "🎫", text: "New booking: 30 guests at Rijksmuseum, Amsterdam", time: "2 min ago", type: "booking" },
  { icon: "🏢", text: "TravelVista BV joined TicketMatch", time: "5 min ago", type: "member" },
  { icon: "📈", text: "Rotterdam trending: +48% bookings this week", time: "12 min ago", type: "trending" },
  { icon: "🎫", text: "Group booking confirmed: Canal Cruise for 45 guests", time: "8 min ago", type: "booking" },
  { icon: "🏢", text: "EuroTours GmbH activated Growth membership", time: "15 min ago", type: "member" },
  { icon: "📈", text: "Prague trending: +32% searches this month", time: "1 hour ago", type: "trending" },
  { icon: "🎫", text: "New booking: AMAZE Amsterdam × 22 guests", time: "3 min ago", type: "booking" },
  { icon: "🏢", text: "Nordic Adventures AB requested membership", time: "20 min ago", type: "member" },
  { icon: "📈", text: "Barcelona trending: +27% group bookings", time: "30 min ago", type: "trending" },
  { icon: "🎫", text: "QR Vouchers generated: Moco Museum × 18 guests", time: "6 min ago", type: "booking" },
  { icon: "🏢", text: "CityExplore SARL upgraded to Enterprise", time: "45 min ago", type: "member" },
  { icon: "📈", text: "Amsterdam museums: 94% occupancy today", time: "just now", type: "trending" },
];

function shuffleArray<T>(arr: T[]): T[] {
  const shuffled = [...arr];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function formatActivityText(activity: Activity) {
  const { text, type } = activity;

  if (type === "member") {
    // Highlight company name (everything before " joined" / " activated" / " requested" / " upgraded")
    const match = text.match(/^(.+?)(\s(?:joined|activated|requested|upgraded)\s.+)$/);
    if (match) {
      return (
        <>
          <span className="text-accent font-semibold">{match[1]}</span>
          {match[2]}
        </>
      );
    }
  }

  if (type === "trending") {
    // Highlight the percentage or high number
    const match = text.match(/(\+\d+%|\d+%)/);
    if (match) {
      const idx = text.indexOf(match[1]);
      return (
        <>
          {text.slice(0, idx)}
          <span className="text-emerald-600 font-semibold">{match[1]}</span>
          {text.slice(idx + match[1].length)}
        </>
      );
    }
  }

  return text;
}

export default function LiveActivityFeed() {
  const [order, setOrder] = useState<Activity[]>([]);
  const [index, setIndex] = useState(0);
  const [phase, setPhase] = useState<"in" | "out">("in");

  // Shuffle on mount
  useEffect(() => {
    setOrder(shuffleArray(activities));
  }, []);

  const advance = useCallback(() => {
    setIndex((prev) => {
      const next = (prev + 1) % activities.length;
      // Re-shuffle when wrapping around
      if (next === 0) {
        setOrder(shuffleArray(activities));
      }
      return next;
    });
    setPhase("in");
  }, []);

  useEffect(() => {
    if (order.length === 0) return;

    if (phase === "in") {
      // Show for 3.5s, then trigger exit
      const timer = setTimeout(() => setPhase("out"), 3500);
      return () => clearTimeout(timer);
    }

    // Exit animation lasts 0.5s, then advance
    const timer = setTimeout(advance, 500);
    return () => clearTimeout(timer);
  }, [phase, advance, order.length]);

  if (order.length === 0) return null;

  const current = order[index];

  return (
    <div className="py-2.5 border-b border-border/40 bg-surface transition-colors">
      <div className="mx-auto max-w-7xl px-6 flex items-center justify-between gap-4">
        {/* Left: Live indicator */}
        <div className="flex shrink-0 items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.12em] text-emerald-600">
            Live
          </span>
        </div>

        {/* Center: Rotating activity message */}
        <div className="flex-1 flex justify-center overflow-hidden">
          <div
            key={`${index}-${phase}`}
            className={`flex items-center gap-2 text-[13px] text-muted ${
              phase === "in" ? "animate-activity-in" : "animate-activity-out"
            }`}
          >
            <span>{current.icon}</span>
            <span>{formatActivityText(current)}</span>
            <span className="text-[11px] opacity-70">· {current.time}</span>
          </div>
        </div>

        {/* Right: Static counter */}
        <div className="shrink-0 text-[11px] text-muted opacity-70">
          847 bookings today
        </div>
      </div>

      <style jsx>{`
        @keyframes activity-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes activity-out {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(-8px);
          }
        }
        .animate-activity-in {
          animation: activity-in 0.4s ease-out forwards;
        }
        .animate-activity-out {
          animation: activity-out 0.5s ease-in forwards;
        }
      `}</style>
    </div>
  );
}
