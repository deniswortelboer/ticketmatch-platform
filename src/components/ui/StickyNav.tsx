"use client";

import { useEffect, useState, useCallback } from "react";

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

  // Show/hide based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      setVisible(window.scrollY > 600);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Track active section with IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    const callback = (id: string) => (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(id);
        }
      });
    };

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(callback(id), {
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      });

      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
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
