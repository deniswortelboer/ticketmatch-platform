"use client";

import DashboardAgent from "@/components/ui/DashboardAgent";
import { useState } from "react";

const tiers = ["free", "pro", "enterprise"] as const;

export default function AgentPreviewPage() {
  const [activeTier, setActiveTier] = useState<typeof tiers[number] | null>(null);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Agent Preview — All Tiers</h1>
        <p className="mt-1 text-sm text-muted">
          Preview how the Dashboard Agent looks for each plan. Click a tier to open it.
        </p>
      </div>

      {/* Side by side static previews */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tiers.map((tier) => {
          const config = {
            free: {
              name: "TicketMatch Assistant",
              subtitle: "Online",
              badge: null,
              headerGradient: "from-[#1d4ed8] to-[#1e40af]",
              iconGradient: "from-blue-400 to-blue-600",
              greeting: "Hi Denis! I'm your TicketMatch Assistant. I can help you with bookings, groups, and itineraries. Ask me anything!",
              topics: [
                { label: "How do I book?", icon: "🎫" },
                { label: "How do groups work?", icon: "👥" },
                { label: "How do I share an itinerary?", icon: "📤" },
                { label: "What's included in Pro?", icon: "⚡" },
              ],
              buttonBg: "bg-[#1d4ed8]",
              userBubble: "bg-[#1d4ed8]",
              topicBorder: "border-gray-200 hover:border-blue-200",
              placeholder: "Ask me anything...",
              upgradeBanner: true,
              badgeColor: "",
              badgeBg: "",
              glowFrom: "from-blue-500/20",
              planLabel: "FREE",
              planColor: "text-blue-600 bg-blue-100",
            },
            pro: {
              name: "TicketMatch Pro Advisor",
              subtitle: "Pro · Online",
              badge: "PRO",
              headerGradient: "from-amber-600 to-amber-800",
              iconGradient: "from-amber-400 to-amber-600",
              greeting: "Welcome back Denis! As your Pro Advisor, I have full access to venue recommendations, planning strategies, and market insights. How can I help you today?",
              topics: [
                { label: "Best venues for my group", icon: "🏛️" },
                { label: "Plan a full-day itinerary", icon: "🗓️" },
                { label: "Market insights & trends", icon: "📊" },
                { label: "Optimize my bookings", icon: "💡" },
              ],
              buttonBg: "bg-amber-600",
              userBubble: "bg-amber-600",
              topicBorder: "border-amber-200 hover:border-amber-300",
              placeholder: "Ask your advisor...",
              upgradeBanner: false,
              badgeColor: "text-amber-200",
              badgeBg: "bg-amber-400/20",
              glowFrom: "from-amber-500/20",
              planLabel: "PRO",
              planColor: "text-amber-700 bg-amber-100",
            },
            enterprise: {
              name: "TicketMatch Strategic Partner",
              subtitle: "Enterprise · Priority",
              badge: "ENTERPRISE",
              headerGradient: "from-purple-700 to-indigo-900",
              iconGradient: "from-purple-400 to-purple-600",
              greeting: "Hello Denis. I'm your dedicated Strategic Partner — with full access to market intelligence, trend analysis, and premium venue insights. Let's make your next program exceptional.",
              topics: [
                { label: "Market trends & analysis", icon: "📈" },
                { label: "Strategic venue selection", icon: "🎯" },
                { label: "Competitor benchmarking", icon: "🔍" },
                { label: "Seasonal planning advice", icon: "📅" },
              ],
              buttonBg: "bg-purple-700",
              userBubble: "bg-purple-700",
              topicBorder: "border-purple-200 hover:border-purple-300",
              placeholder: "Ask your strategic partner...",
              upgradeBanner: false,
              badgeColor: "text-purple-200",
              badgeBg: "bg-purple-400/20",
              glowFrom: "from-purple-500/20",
              planLabel: "ENTERPRISE",
              planColor: "text-purple-700 bg-purple-100",
            },
          }[tier];

          return (
            <div key={tier} className="flex flex-col items-center gap-3">
              {/* Plan label */}
              <span className={`rounded-full px-4 py-1 text-xs font-bold ${config.planColor}`}>
                {config.planLabel}
              </span>

              {/* Static agent preview */}
              <div className="w-full max-w-[360px]">
                {/* Glow effect */}
                <div className={`relative`}>
                  <div className={`absolute -inset-1.5 rounded-3xl bg-gradient-to-r ${config.glowFrom} via-transparent to-transparent blur-xl opacity-60`} />
                  <div className="relative flex h-[520px] flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-xl">
                    {/* Header */}
                    <div className={`flex items-center gap-3 bg-gradient-to-r ${config.headerGradient} px-4 py-3`}>
                      <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${config.iconGradient} shadow-lg`}>
                        <span className="text-xs font-bold text-white">TM</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-semibold text-white">{config.name}</p>
                          {config.badge && (
                            <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold tracking-wide ${config.badgeBg} ${config.badgeColor}`}>
                              {config.badge}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <div className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />
                          <p className="text-[11px] text-white/60">{config.subtitle}</p>
                        </div>
                      </div>
                    </div>

                    {/* Messages area */}
                    <div className="flex-1 overflow-y-auto px-4 py-3">
                      <div className="space-y-4">
                        {/* Welcome message */}
                        <div className="rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground">
                          {config.greeting}
                        </div>

                        {/* Quick topics */}
                        <div className="grid grid-cols-2 gap-2">
                          {config.topics.map((t) => (
                            <div
                              key={t.label}
                              className={`flex items-center gap-2 rounded-xl border bg-white px-3 py-2.5 ${config.topicBorder}`}
                            >
                              <span className="text-lg">{t.icon}</span>
                              <span className="text-[12px] font-medium text-foreground">{t.label}</span>
                            </div>
                          ))}
                        </div>

                        {/* Free upgrade banner */}
                        {config.upgradeBanner && (
                          <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
                            <p className="text-[11px] font-semibold text-amber-800">Upgrade to Pro</p>
                            <p className="mt-0.5 text-[11px] text-amber-700">Get unlimited AI assistance, venue tips and planning advice.</p>
                          </div>
                        )}

                        {/* Example conversation */}
                        <div className="pt-2 border-t border-dashed border-gray-200">
                          <p className="text-[10px] text-center text-muted mb-3">Example conversation</p>
                          <div className="flex justify-end">
                            <div className={`rounded-2xl rounded-br-md ${config.userBubble} px-3.5 py-2.5 text-[13px] text-white max-w-[85%]`}>
                              {tier === "free" ? "Best museums in Amsterdam?" : tier === "pro" ? "Best museums for 30 pax in Amsterdam?" : "Market trends for Amsterdam Q2?"}
                            </div>
                          </div>
                          <div className="mt-2 flex justify-start">
                            <div className="rounded-2xl rounded-bl-md bg-gray-100 px-3.5 py-2.5 text-[13px] leading-relaxed text-foreground max-w-[85%]">
                              {tier === "free" ? (
                                <>Amsterdam has great museums for groups! Rijksmuseum and Van Gogh are popular choices. <a href="/dashboard/pricing" className="text-blue-600 underline">Upgrade to Pro</a> for detailed venue recommendations.</>
                              ) : tier === "pro" ? (
                                <>Rijksmuseum handles groups of 30+ excellently with dedicated group entrances. Van Gogh Museum is best visited early morning. I recommend starting with Rijksmuseum (2.5hrs) then walking to AMAZE Amsterdam...</>
                              ) : (
                                <>Immersive experiences are outperforming traditional museums by 40% in Q2. For your portfolio, consider adding AMAZE Amsterdam — it&apos;s trending with 20-30 pax groups and has 15% higher rebooking rates than traditional venues...</>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Input */}
                    <div className="border-t border-gray-200 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <span className="flex-1 py-1.5 text-[13px] text-muted/40">{config.placeholder}</span>
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${config.buttonBg} text-white`}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 2L11 13" />
                            <path d="M22 2L15 22L11 13L2 9L22 2Z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Live test button */}
      <div className="mt-8 rounded-2xl border border-border/40 bg-white p-6 text-center">
        <h3 className="text-sm font-semibold text-foreground mb-3">Live test — open the real agent</h3>
        <div className="flex justify-center gap-3">
          {tiers.map((t) => (
            <button
              key={t}
              onClick={() => setActiveTier(t)}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110 ${
                t === "free" ? "bg-blue-600" : t === "pro" ? "bg-amber-600" : "bg-purple-700"
              }`}
            >
              Test {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Render the actual live agent for the selected tier */}
      {activeTier && (
        <DashboardAgent userPlan={activeTier} userName="Denis" />
      )}
    </div>
  );
}
