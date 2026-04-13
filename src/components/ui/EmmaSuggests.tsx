"use client";

import Link from "next/link";

export default function EmmaSuggests({ questions }: { questions: string[] }) {
  return (
    <div className="rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/5 to-blue-500/5 p-5">
      <div className="flex items-center gap-2.5 mb-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-700 shadow-md shadow-accent/15">
          <span className="text-[10px] font-bold text-white">TM</span>
        </div>
        <div>
          <p className="text-[13px] font-bold">Emma suggests</p>
          <p className="text-[11px] text-muted">Ask me about this topic</p>
        </div>
      </div>

      <div className="space-y-2">
        {questions.map((q) => (
          <Link
            key={q}
            href={`/?q=${encodeURIComponent(q)}`}
            className="flex items-center gap-2.5 rounded-xl border border-card-border bg-card-bg px-3.5 py-2.5 text-[12px] font-medium text-muted transition-all hover:border-accent/30 hover:bg-accent/5 hover:text-foreground group"
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" className="shrink-0 text-accent/60 group-hover:text-accent transition-colors">
              <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M6 6.5C6 5.67 6.9 5 8 5C9.1 5 10 5.67 10 6.5C10 7.17 9.4 7.73 8.5 7.93C8.22 7.99 8 8.22 8 8.5V9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
              <circle cx="8" cy="10.5" r="0.6" fill="currentColor" />
            </svg>
            <span className="flex-1">{q}</span>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none" className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-accent">
              <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>
        ))}
      </div>
    </div>
  );
}
