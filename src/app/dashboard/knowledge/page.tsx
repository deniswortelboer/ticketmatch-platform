"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type KnowledgeEntry = {
  id: string;
  title: string;
  content: string;
  category: string;
  tier: string;
};

const TIER_LABELS: Record<string, string> = {
  free: "Free",
  pro: "Pro",
  enterprise: "Enterprise",
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
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get user plan from profile/company
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, companies(message)")
        .eq("id", user.id)
        .single();

      let plan = "free";
      try {
        const companies = profile?.companies as unknown as { message: string } | { message: string }[] | null;
        const comp = Array.isArray(companies) ? companies[0] : companies;
        const msg = comp?.message ? JSON.parse(comp.message) : {};
        if (msg.plan) plan = msg.plan;
      } catch {}
      setUserPlan(plan);

      // Fetch all active entries (we'll filter access client-side for the lock UI)
      const { data } = await supabase
        .from("knowledge_base")
        .select("id, title, content, category, tier")
        .eq("active", true)
        .order("category")
        .order("tier");

      setEntries(data || []);
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

      {/* Entries grid */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-border/40 bg-white p-12 text-center">
          <p className="text-muted">No articles found. Try a different search or filter.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredEntries.map((entry) => {
            const locked = !canAccess(entry.tier);
            return (
              <div
                key={entry.id}
                className={`group relative rounded-2xl border bg-white p-5 transition-all ${
                  locked
                    ? "border-border/30 opacity-75"
                    : "border-border/40 hover:border-accent/20 hover:shadow-md hover:shadow-accent/5"
                }`}
              >
                {/* Category + tier badges */}
                <div className="mb-3 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 rounded-full bg-gray-100 px-2.5 py-0.5 text-[11px] font-medium text-muted">
                    {CATEGORY_ICONS[entry.category] || "📄"} {CATEGORY_LABELS[entry.category] || entry.category}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                    entry.tier === "free"
                      ? "bg-green-100 text-green-700"
                      : entry.tier === "pro"
                      ? "bg-blue-100 text-blue-700"
                      : "bg-purple-100 text-purple-700"
                  }`}>
                    {TIER_LABELS[entry.tier] || entry.tier}
                  </span>
                </div>

                {/* Title */}
                <h3 className="mb-2 text-sm font-semibold text-foreground">{entry.title}</h3>

                {/* Content */}
                {locked ? (
                  <div className="relative">
                    <p className="text-xs leading-relaxed text-muted line-clamp-2 blur-[2px] select-none">
                      {entry.content}
                    </p>
                    <div className="mt-3 flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent/5 to-blue-50 px-3 py-2">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                        <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      <a href="/dashboard/pricing" className="text-[11px] font-semibold text-accent hover:underline">
                        Upgrade to {entry.tier === "pro" ? "Pro" : "Enterprise"} to unlock
                      </a>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="text-xs leading-relaxed text-muted line-clamp-3">{entry.content}</p>
                    <button
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent("tm-ask-agent", { detail: `Tell me more about: ${entry.title}` }));
                      }}
                      className="mt-3 flex items-center gap-1.5 rounded-lg bg-accent/5 px-3 py-1.5 text-[11px] font-semibold text-accent hover:bg-accent/10 transition-all"
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      Ask the Agent
                    </button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade CTA for free users */}
      {userPlan === "free" && (
        <div className="mt-8 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 via-blue-50 to-cyan-50 p-6 text-center">
          <h3 className="text-lg font-bold text-foreground">Unlock the full Knowledge Base</h3>
          <p className="mt-1 text-sm text-muted">
            Get access to venue recommendations, planning strategies, and market insights.
          </p>
          <a
            href="/dashboard/pricing"
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-semibold text-white hover:brightness-110 transition-all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Upgrade to Pro
          </a>
        </div>
      )}
    </div>
  );
}
