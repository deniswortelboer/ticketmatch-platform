"use client";

import { useEffect, useState, useCallback, useRef } from "react";

const sections = [
  { id: "ecosystem", label: "Ecosystem" },
  { id: "how-it-works", label: "How It Works" },
  { id: "features", label: "Features" },
  { id: "search", label: "Search" },
  { id: "use-cases", label: "Use Cases" },
  { id: "roi", label: "ROI" },
  { id: "faq", label: "FAQ" },
  { id: "pricing", label: "Pricing" },
];

export default function StickyNav() {
  const [visible, setVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Show/hide using a sentinel element instead of scroll listener
  useEffect(() => {
    // Create a sentinel div at 600px from top
    const sentinel = document.createElement("div");
    sentinel.style.cssText = "position:absolute;top:600px;height:1px;width:1px;pointer-events:none;";
    document.body.appendChild(sentinel);
    sentinelRef.current = sentinel;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When sentinel scrolls out of view (above viewport), show nav
        setVisible(!entry.isIntersecting);
      },
      { threshold: 0 }
    );

    observer.observe(sentinel);
    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  // Track active section with ONE IntersectionObserver for all sections
  useEffect(() => {
    const elements: Element[] = [];
    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) elements.push(el);
    });

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: 0 }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const scrollTo = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        visible
          ? "translate-y-0 opacity-100"
          : "-translate-y-full opacity-0"
      } bg-background/80 backdrop-blur-lg border-b border-border/40`}
      aria-label="Section navigation"
    >
      <div className="mx-auto max-w-7xl px-4 py-2 flex items-center justify-between">
        {/* Section links - scrollable on mobile */}
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-hide flex-1 mr-3">
          {sections.map(({ id, label }) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`whitespace-nowrap text-[12px] font-medium px-3 py-1 rounded-full transition-colors shrink-0 ${
                activeSection === id
                  ? "text-accent bg-accent/10 font-semibold"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* CTA button */}
        <button
          onClick={() => scrollTo("pricing")}
          className="shrink-0 text-[11px] font-semibold px-4 py-1.5 rounded-full bg-accent text-white hover:bg-accent/90 transition-colors"
        >
          Request Access
        </button>
      </div>
    </nav>
  );
}
