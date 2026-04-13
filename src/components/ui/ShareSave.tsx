"use client";

import { useState } from "react";

export default function ShareSave({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="flex items-center gap-2">
      {/* Copy link */}
      <button
        onClick={copyLink}
        className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-accent/30 hover:text-accent"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <rect x="5" y="5" width="8" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M3 11V3.5C3 2.67 3.67 2 4.5 2H11" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
        {copied ? "Copied!" : "Copy link"}
      </button>

      {/* Share */}
      <button
        onClick={shareNative}
        className="flex items-center gap-1.5 rounded-lg border border-card-border bg-card-bg px-3 py-1.5 text-[12px] font-medium text-muted transition-all hover:border-accent/30 hover:text-accent"
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
          <circle cx="12" cy="4" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="4" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <circle cx="12" cy="12" r="2.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M6.3 6.9L9.7 5.1M6.3 9.1L9.7 10.9" stroke="currentColor" strokeWidth="1.2" />
        </svg>
        Share
      </button>

      {/* Bookmark */}
      <button
        onClick={() => setSaved(!saved)}
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-[12px] font-medium transition-all ${
          saved
            ? "border-accent/30 bg-accent/10 text-accent"
            : "border-card-border bg-card-bg text-muted hover:border-accent/30 hover:text-accent"
        }`}
      >
        <svg width="13" height="13" viewBox="0 0 16 16" fill={saved ? "currentColor" : "none"}>
          <path d="M3.5 2.5H12.5V14L8 11L3.5 14V2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
        {saved ? "Saved" : "Save"}
      </button>
    </div>
  );
}
