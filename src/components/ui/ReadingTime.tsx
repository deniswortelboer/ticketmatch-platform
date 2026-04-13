"use client";

import { useState, useEffect } from "react";

export default function ReadingTime({ totalMinutes }: { totalMinutes: number }) {
  const [remaining, setRemaining] = useState(totalMinutes);

  useEffect(() => {
    const update = () => {
      const el = document.getElementById("article-content");
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.scrollHeight;
      const visible = window.innerHeight;
      const scrolled = Math.max(0, -rect.top);
      const pct = Math.min(1, Math.max(0, scrolled / (total - visible)));
      setRemaining(Math.max(0, Math.ceil(totalMinutes * (1 - pct))));
    };
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, [totalMinutes]);

  return (
    <div className="flex items-center gap-2 text-[12px] text-muted">
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
        <path d="M8 4.5V8L10.5 9.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      </svg>
      <span>
        {totalMinutes} min read{remaining > 0 && remaining < totalMinutes && (
          <span className="text-accent"> · {remaining} min left</span>
        )}
      </span>
    </div>
  );
}
