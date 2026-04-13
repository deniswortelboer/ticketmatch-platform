"use client";

import { useRef, useEffect, useState, useCallback } from "react";

interface StatItem {
  target: number;
  suffix: string;
  label: string;
  format: (n: number) => string;
}

const stats: StatItem[] = [
  {
    target: 300,
    suffix: "K+",
    label: "Experiences Available",
    format: (n) => `${Math.round(n)}K+`,
  },
  {
    target: 3000,
    suffix: "+",
    label: "Cities Worldwide",
    format: (n) => `${Math.round(n).toLocaleString("en-US")}+`,
  },
  {
    target: 10,
    suffix: "",
    label: "Supplier APIs",
    format: (n) => `${Math.round(n)}`,
  },
  {
    target: 12,
    suffix: "",
    label: "Experience Categories",
    format: (n) => `${Math.round(n)}`,
  },
  {
    target: 8,
    suffix: "",
    label: "AI Agents Online",
    format: (n) => `${Math.round(n)}`,
  },
];

function easeOutQuart(t: number): number {
  return 1 - Math.pow(1 - t, 4);
}

function PulseDivider() {
  return (
    <div className="hidden md:flex items-center justify-center">
      <svg
        width="2"
        height="48"
        viewBox="0 0 2 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <line
          x1="1"
          y1="0"
          x2="1"
          y2="48"
          stroke="white"
          strokeOpacity="0.15"
          strokeWidth="1"
        />
        <circle cx="1" cy="24" r="3" fill="white" fillOpacity="0.4">
          <animate
            attributeName="r"
            values="2;4;2"
            dur="2.5s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="fill-opacity"
            values="0.4;0.8;0.4"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </div>
  );
}

export default function AnimatedCounters() {
  const containerRef = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);
  const [values, setValues] = useState<number[]>(stats.map(() => 0));

  const animate = useCallback(() => {
    const duration = 2000;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutQuart(progress);

      setValues(stats.map((s) => eased * s.target));

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    }

    requestAnimationFrame(tick);
  }, []);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          animate();
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [animate]);

  const items = stats.map((stat, i) => (
    <div key={i} className="flex flex-col items-center text-center">
      <span className="text-2xl font-extrabold text-white md:text-3xl">
        {stat.format(values[i])}
      </span>
      <span className="text-[12px] font-medium text-white/70">
        {stat.label}
      </span>
    </div>
  ));

  // Interleave dividers between items for desktop
  const withDividers: React.ReactNode[] = [];
  items.forEach((item, i) => {
    withDividers.push(item);
    if (i < items.length - 1) {
      withDividers.push(<PulseDivider key={`divider-${i}`} />);
    }
  });

  return (
    <section
      ref={containerRef}
      className="w-full bg-gradient-to-r from-[var(--stats-from)] to-[var(--stats-to)] py-10"
    >
      <div className="mx-auto max-w-7xl px-4">
        {/* Mobile: 2-column grid without dividers */}
        <div className="grid grid-cols-2 gap-6 md:hidden">
          {items}
        </div>
        {/* Desktop: 5 stats with dividers between them */}
        <div className="hidden md:grid md:grid-cols-9 md:items-center md:gap-0">
          {withDividers}
        </div>
      </div>
    </section>
  );
}
