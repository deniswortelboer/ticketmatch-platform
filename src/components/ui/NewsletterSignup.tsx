"use client";

import { useState } from "react";

export default function NewsletterSignup({ variant = "inline" }: { variant?: "inline" | "card" }) {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");
    // Simulate submit — replace with real endpoint later
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className={`${variant === "card" ? "rounded-2xl border border-accent/15 bg-accent/5 p-6 text-center" : ""}`}>
        <div className="flex items-center justify-center gap-2 text-accent">
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
            <path d="M6 10L9 13L14 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[14px] font-semibold">You&apos;re in! Check your inbox.</span>
        </div>
      </div>
    );
  }

  if (variant === "card") {
    return (
      <div className="rounded-2xl border border-accent/15 bg-gradient-to-br from-accent/5 to-purple-500/5 p-6">
        <div className="flex items-center gap-3 mb-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" className="text-accent" />
              <path d="M2 6L10 11L18 6" stroke="currentColor" strokeWidth="1.3" className="text-accent" />
            </svg>
          </div>
          <div>
            <p className="text-[14px] font-bold">Get Weekly Intelligence</p>
            <p className="text-[12px] text-muted">Market trends, data insights & industry analysis.</p>
          </div>
        </div>
        <form onSubmit={submit} className="flex gap-2 mt-4">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="flex-1 rounded-lg border border-card-border bg-card-bg px-3.5 py-2 text-[13px] outline-none placeholder:text-muted/50 focus:border-accent/30 transition-colors"
            required
          />
          <button
            type="submit"
            disabled={status === "loading"}
            className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
          >
            {status === "loading" ? "..." : "Subscribe"}
          </button>
        </form>
        <p className="mt-2.5 text-[10px] text-muted">No spam. Unsubscribe anytime. Sent every Tuesday.</p>
      </div>
    );
  }

  // Inline variant (for article page sidebar)
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="your@email.com"
        className="flex-1 rounded-lg border border-card-border bg-card-bg px-3 py-2 text-[13px] outline-none placeholder:text-muted/50 focus:border-accent/30 transition-colors"
        required
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="shrink-0 rounded-lg bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-all hover:brightness-110 disabled:opacity-50"
      >
        {status === "loading" ? "..." : "Subscribe"}
      </button>
    </form>
  );
}
