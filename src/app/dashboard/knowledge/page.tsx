"use client";

import { useState, useEffect } from "react";

type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  category: string;
  tier: string;
};

const TIER_CONFIG: Record<string, { label: string; color: string; bgLight: string; bgDark: string; border: string; text: string; badge: string; badgeText: string }> = {
  free: {
    label: "Free",
    color: "#3b82f6",
    bgLight: "bg-blue-50",
    bgDark: "bg-blue-600",
    border: "border-blue-200",
    text: "text-blue-700",
    badge: "bg-blue-100",
    badgeText: "text-blue-700",
  },
  pro: {
    label: "Pro",
    color: "#059669",
    bgLight: "bg-emerald-50",
    bgDark: "bg-emerald-600",
    border: "border-emerald-200",
    text: "text-emerald-700",
    badge: "bg-emerald-100",
    badgeText: "text-emerald-700",
  },
  enterprise: {
    label: "Enterprise",
    color: "#7c3aed",
    bgLight: "bg-purple-50",
    bgDark: "bg-purple-600",
    border: "border-purple-200",
    text: "text-purple-700",
    badge: "bg-purple-100",
    badgeText: "text-purple-700",
  },
};

const TIER_ORDER = ["free", "pro", "enterprise"];

const CATEGORY_ICONS: Record<string, string> = {
  platform: "📋",
  venues: "🏛️",
  planning: "🗓️",
  market: "📊",
  trends: "📈",
};

const CATEGORY_LABELS: Record<string, string> = {
  platform: "Platform",
  venues: "Venues & Experiences",
  planning: "Planning & Itineraries",
  market: "Market Insights",
  trends: "Trends & Data",
};

function tierIndex(tier: string) {
  return TIER_ORDER.indexOf(tier);
}

export default function KnowledgePage() {
  const [entries, setEntries] = useState<KnowledgeEntry[]>([]);
  const [userPlan, setUserPlan] = useState("free");
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/knowledge");
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();
        setUserPlan(data.plan || "free");
        setEntries(data.entries || []);
      } catch (err) {
        console.error("Knowledge load error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const userTierIndex = tierIndex(userPlan);
  const canAccess = (entryTier: string) => tierIndex(entryTier) <= userTierIndex;
  const categories = [...new Set(entries.map((e) => e.category))];

  const filteredEntries = entries.filter((e) => {
    if (activeCategory && e.category !== activeCategory) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return e.title.toLowerCase().includes(q) || e.content.toLowerCase().includes(q);
    }
    return true;
  });

  const accessibleCount = filteredEntries.filter((e) => canAccess(e.tier)).length;
  const lockedCount = filteredEntries.filter((e) => !canAccess(e.tier)).length;

  // Group entries by tier
  const entriesByTier = TIER_ORDER.reduce<Record<string, KnowledgeEntry[]>>((acc, tier) => {
    acc[tier] = filteredEntries.filter((e) => e.tier === tier);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Knowledge Base</h1>
        <p className="mt-1 text-sm text-muted">
          Venue tips, planning guides, and market insights to help you create better experiences.
        </p>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted/50" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search knowledge base..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-border/60 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-accent/40 focus:ring-2 focus:ring-accent/10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
              !activeCategory
                ? "bg-accent text-white"
                : "bg-white border border-border/60 text-muted hover:border-accent/30"
            }`}
          >
            All
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                activeCategory === cat
                  ? "bg-accent text-white"
                  : "bg-white border border-border/60 text-muted hover:border-accent/30"
              }`}
            >
              {CATEGORY_ICONS[cat] || "📄"} {CATEGORY_LABELS[cat] || cat}
            </button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="mb-4 flex items-center gap-4 text-xs text-muted">
        <span>{accessibleCount} article{accessibleCount !== 1 ? "s" : ""} available</span>
        {lockedCount > 0 && (
          <span className="flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            {lockedCount} more with upgrade
          </span>
        )}
      </div>

      {/* Three-column tier layout */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-white p-12 text-center">
          <p className="text-muted">No articles found. Try a different search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const config = TIER_CONFIG[tier];
            const tierEntries = entriesByTier[tier] || [];
            if (tierEntries.length === 0) return null;

            return (
              <div key={tier} className="flex flex-col">
                {/* Column header */}
                <div
                  className={`rounded-t-xl px-4 py-3 text-center ${config.bgDark}`}
                >
                  <h2 className="text-sm font-bold text-white tracking-wide">
                    {config.label}
                  </h2>
                  <p className="text-[10px] text-white/70 mt-0.5">
                    {tier === "free" && "Basiskennis voor iedereen"}
                    {tier === "pro" && "€49/mo — Voor professionals"}
                    {tier === "enterprise" && "€149/mo — Strategische inzichten"}
                  </p>
                </div>

                {/* Articles */}
                <div className={`flex-1 rounded-b-xl border-x border-b ${config.border} bg-white`}>
                  {tierEntries.map((entry, i) => {
                    const locked = !canAccess(entry.tier);
                    return (
                      <div key={entry.id}>
                        {i > 0 && <div className="mx-4 border-t border-gray-100" />}
                        <div
                          className={`p-4 transition-all ${
                            locked ? "opacity-60" : "hover:bg-gray-50/50"
                          }`}
                        >
                          {/* Category badge */}
                          <div className="mb-2 flex items-center justify-between">
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-muted">
                              {CATEGORY_ICONS[entry.category] || "📄"} {CATEGORY_LABELS[entry.category] || entry.category}
                            </span>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${config.badge} ${config.badgeText}`}>
                              {config.label}
                            </span>
                          </div>

                          {/* Title */}
                          <h3 className="text-[13px] font-semibold text-foreground leading-snug">
                            {entry.title}
                          </h3>

                          {/* Content */}
                          {locked ? (
                            <div className="mt-2">
                              <p className="text-[11px] leading-relaxed text-muted line-clamp-2 blur-[2px] select-none">
                                {entry.content}
                              </p>
                              <div className="mt-2 flex items-center gap-1.5 text-[10px]">
                                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={config.text}>
                                  <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                                </svg>
                                <a href="/dashboard/pricing" className={`font-semibold ${config.text} hover:underline`}>
                                  Upgrade to {config.label} to unlock
                                </a>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mt-1.5 text-[11px] leading-relaxed text-muted line-clamp-2">
                                {entry.content}
                              </p>
                              <button
                                onClick={() => {
                                  window.dispatchEvent(new CustomEvent("tm-ask-agent", { detail: `Tell me more about: ${entry.title}` }));
                                }}
                                className={`mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold ${config.text} ${config.bgLight} hover:brightness-95 transition-all`}
                              >
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                </svg>
                                Ask the Agent
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {/* Article count */}
                  <div className="border-t border-gray-100 px-4 py-2.5 text-center">
                    <span className="text-[10px] font-medium text-muted">
                      {tierEntries.length} article{tierEntries.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {userPlan === "free" && (
        <div className="mt-8 rounded-2xl border border-accent/20 bg-gradient-to-r from-blue-50 via-emerald-50 to-purple-50 p-6 text-center">
          <h3 className="text-lg font-bold text-foreground">Unlock the full Knowledge Base</h3>
          <p className="mt-1 text-sm text-muted">
            Get access to venue recommendations, planning strategies, and market insights.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <a
              href="/dashboard/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
            >
              Upgrade to Pro
            </a>
            <a
              href="/dashboard/pricing"
              className="inline-flex items-center gap-2 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
            >
              Go Enterprise
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
