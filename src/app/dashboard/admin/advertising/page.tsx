"use client";

import { useState } from "react";

const tiers = [
  {
    name: "Bronze",
    price: "€99",
    annualPrice: "€79",
    period: "/month",
    description: "Get discovered by tour operators",
    color: "from-amber-700 via-amber-600 to-yellow-700",
    borderColor: "border-amber-300",
    ringColor: "ring-amber-300/30",
    badgeColor: "bg-amber-100 text-amber-800",
    buttonColor: "bg-gradient-to-r from-amber-700 to-yellow-700 hover:from-amber-800 hover:to-yellow-800",
    iconBg: "from-amber-600 to-yellow-600",
    checkColor: "text-amber-600",
    glowColor: "shadow-amber-500/20",
    features: [
      { text: "Higher ranking in Catalog", included: true },
      { text: "1 venue photo", included: true },
      { text: "Standard venue description", included: true },
      { text: "TicketMatch.ai supplier badge", included: true },
      { text: '"Featured" badge in Catalog', included: false },
      { text: "Larger pin on City Map", included: false },
      { text: "AI Agent recommendations", included: false },
      { text: "Homepage placement", included: false },
      { text: "Package inclusion", included: false },
      { text: "Performance reports", included: false },
      { text: "Email digest mention", included: false },
      { text: "Social media promotion", included: false },
    ],
  },
  {
    name: "Silver",
    price: "€249",
    annualPrice: "€199",
    period: "/month",
    description: "Stand out from the competition",
    color: "from-slate-400 via-slate-300 to-slate-500",
    borderColor: "border-slate-300",
    ringColor: "ring-slate-300/30",
    badgeColor: "bg-slate-100 text-slate-700",
    buttonColor: "bg-gradient-to-r from-slate-500 to-slate-700 hover:from-slate-600 hover:to-slate-800",
    iconBg: "from-slate-400 to-slate-600",
    checkColor: "text-slate-600",
    glowColor: "shadow-slate-400/20",
    features: [
      { text: "Higher ranking in Catalog", included: true },
      { text: "3 venue photos", included: true },
      { text: "Custom venue description", included: true },
      { text: "TicketMatch.ai supplier badge", included: true },
      { text: '"Featured" badge in Catalog', included: true },
      { text: "Larger pin on City Map", included: true },
      { text: "Dashboard Agent recommendations", included: true },
      { text: "Monthly views & clicks report", included: true },
      { text: "Homepage placement", included: false },
      { text: "Package inclusion", included: false },
      { text: "Email digest mention", included: false },
      { text: "Social media promotion", included: false },
    ],
  },
  {
    name: "Gold",
    price: "€499",
    annualPrice: "€399",
    period: "/month",
    description: "Maximum visibility & AI power",
    popular: true,
    color: "from-yellow-500 via-amber-400 to-yellow-600",
    borderColor: "border-yellow-400",
    ringColor: "ring-yellow-400/40",
    badgeColor: "bg-yellow-100 text-yellow-800",
    buttonColor: "bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-black",
    iconBg: "from-yellow-400 to-amber-500",
    checkColor: "text-yellow-600",
    glowColor: "shadow-yellow-500/30",
    features: [
      { text: "Higher ranking in Catalog", included: true },
      { text: "5 venue photos + video", included: true },
      { text: "Custom description + story", included: true },
      { text: "TicketMatch.ai supplier badge", included: true },
      { text: '"Featured" badge in Catalog', included: true },
      { text: "Logo pin + glow on City Map", included: true },
      { text: "Emma + Dashboard Agent recommendations", included: true },
      { text: "Itinerary Builder suggestions", included: true },
      { text: "Homepage photo carousel", included: true },
      { text: "Included in 1 curated package", included: true },
      { text: "Monthly email digest mention", included: true },
      { text: "1x/month social media post", included: true },
      { text: "Full performance report", included: true },
    ],
  },
  {
    name: "Platinum",
    price: "€999",
    annualPrice: "€799",
    period: "/month",
    description: "The ultimate partnership",
    color: "from-violet-600 via-purple-500 to-indigo-600",
    borderColor: "border-purple-300",
    ringColor: "ring-purple-400/40",
    badgeColor: "bg-purple-100 text-purple-800",
    buttonColor: "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
    iconBg: "from-violet-500 to-indigo-600",
    checkColor: "text-purple-600",
    glowColor: "shadow-purple-500/30",
    features: [
      { text: "Everything in Gold", included: true },
      { text: "Unlimited photos + video", included: true },
      { text: "Custom story + brand page", included: true },
      { text: "Premium supplier badge", included: true },
      { text: "Priority #1 in all listings", included: true },
      { text: "Animated logo pin on City Map", included: true },
      { text: "AI first recommendation (all agents)", included: true },
      { text: "Post-booking upsell to operators", included: true },
      { text: "Homepage package spotlight", included: true },
      { text: "Included in 3 curated packages", included: true },
      { text: "Weekly email digest feature", included: true },
      { text: "2x/month social media posts", included: true },
      { text: "Full conversion & booking report", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Free Enterprise account", included: true },
    ],
  },
];

const stats = [
  { value: "300+", label: "Tour Operators", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
  { value: "8+", label: "Cities", icon: "M3 21h18M3 7l9-4 9 4M6 7v14M18 7v14M9 10v1M15 10v1M9 14v1M15 14v1M9 18v1M15 18v1" },
  { value: "50K+", label: "Monthly Searches", icon: "M21 21l-6-6m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0z" },
  { value: "24/7", label: "AI Agents Active", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
];

export default function AdvertisingPage() {
  const [annual, setAnnual] = useState(false);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 via-gray-800 to-black p-10 md:p-14 text-white shadow-2xl">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 h-80 w-80 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute top-1/3 right-1/3 h-40 w-40 rounded-full bg-amber-400/5 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <div className="flex h-8 items-center gap-1.5 rounded-full bg-white/10 px-4 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Partner Program
            </div>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight leading-tight">
            Advertise on<br />
            <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent">
              TicketMatch.ai
            </span>
          </h1>
          <p className="mt-4 text-lg text-white/60 max-w-2xl leading-relaxed">
            Reach hundreds of tour operators, DMCs and travel agencies across Europe.
            Get your venue discovered through our AI-powered platform — from catalog listings
            to personalized agent recommendations.
          </p>
        </div>

        {/* Stats bar */}
        <div className="relative mt-10 grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-3 rounded-2xl bg-white/5 backdrop-blur-sm p-4 border border-white/10">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-yellow-400">
                  <path d={stat.icon} />
                </svg>
              </div>
              <div>
                <p className="text-xl font-bold">{stat.value}</p>
                <p className="text-[11px] text-white/40">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Annual toggle */}
      <div className="text-center">
        <h2 className="text-2xl font-bold tracking-tight">Choose your visibility tier</h2>
        <p className="mt-2 text-sm text-muted">All tiers include a free Enterprise account for your venue.</p>

        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border/60 bg-white p-1 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              !annual ? "bg-foreground text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-5 py-2.5 text-sm font-medium transition-all ${
              annual ? "bg-foreground text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Annual
            <span className="ml-1.5 text-xs text-green-500 font-semibold">-20%</span>
          </button>
        </div>
      </div>

      {/* Tier cards */}
      <div className="grid gap-6 lg:grid-cols-4">
        {tiers.map((tier) => {
          const price = annual ? tier.annualPrice : tier.price;

          return (
            <div
              key={tier.name}
              className={`relative rounded-2xl border bg-white shadow-sm transition-all hover:shadow-xl hover:-translate-y-1 ${
                tier.popular
                  ? `${tier.borderColor} ring-2 ${tier.ringColor} ${tier.glowColor} shadow-lg`
                  : `${tier.borderColor}`
              }`}
            >
              {/* Colored top bar */}
              <div className={`h-2 rounded-t-2xl bg-gradient-to-r ${tier.color}`} />

              {tier.popular && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 rounded-full ${tier.badgeColor} px-4 py-1 text-xs font-bold shadow-sm`}>
                  Most Popular
                </div>
              )}

              <div className="p-6">
                {/* Tier icon + name */}
                <div className="flex items-center gap-3 mb-4">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${tier.iconBg} text-white shadow-md`}>
                    {tier.name === "Bronze" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    {tier.name === "Silver" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                        <path d="M18 15h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M6 15H4.5a2.5 2.5 0 0 0 0 5H6" />
                      </svg>
                    )}
                    {tier.name === "Gold" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="8" r="6" />
                        <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
                      </svg>
                    )}
                    {tier.name === "Platinum" && (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold">{tier.name}</h3>
                    <p className="text-xs text-muted">{tier.description}</p>
                  </div>
                </div>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold tracking-tight">{price}</span>
                    <span className="text-sm text-muted">{tier.period}</span>
                  </div>
                  {annual && (
                    <p className="mt-1 text-xs text-green-600 font-medium">
                      Save {tier.name === "Bronze" ? "€240" : tier.name === "Silver" ? "€600" : tier.name === "Gold" ? "€1,200" : "€2,400"}/year
                    </p>
                  )}
                </div>

                {/* CTA */}
                <button className={`mb-6 h-12 w-full rounded-xl text-sm font-bold text-white transition-all shadow-sm hover:shadow-lg hover:-translate-y-0.5 ${tier.buttonColor}`}>
                  Get {tier.name}
                </button>

                {/* Features */}
                <div className="space-y-2.5">
                  {tier.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      {feature.included ? (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${tier.checkColor} shrink-0 mt-0.5`}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-200 shrink-0 mt-0.5">
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                      )}
                      <span className={`text-[13px] leading-snug ${feature.included ? "text-foreground" : "text-muted/40"}`}>
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* How it works */}
      <div className="rounded-3xl bg-gradient-to-br from-gray-50 to-white border border-border/60 p-8 md:p-12 shadow-sm">
        <h2 className="text-2xl font-bold text-center mb-2">How Advertising Works</h2>
        <p className="text-center text-sm text-muted mb-10">From signup to your first booking — in 3 steps</p>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              step: "1",
              title: "Choose Your Tier",
              desc: "Select the visibility level that fits your venue. Pay monthly or save 20% with annual billing. All tiers include a free Enterprise account.",
              gradient: "from-amber-400 to-yellow-500",
              icon: "M9 12l2 2 4-4m6 2a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
            },
            {
              step: "2",
              title: "We Activate Your Venue",
              desc: "Our team sets up your listing with photos, descriptions, and AI context. Your venue appears across the platform within 24 hours.",
              gradient: "from-blue-400 to-indigo-500",
              icon: "M13 10V3L4 14h7v7l9-11h-7z",
            },
            {
              step: "3",
              title: "Tour Operators Find & Book You",
              desc: "Operators discover your venue through search, AI recommendations, and curated packages. You receive bookings directly in your dashboard.",
              gradient: "from-green-400 to-emerald-500",
              icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z",
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br ${item.gradient} text-white shadow-lg`}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d={item.icon} />
                </svg>
              </div>
              <div className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-gray-900 text-xs font-bold text-white mb-3">
                {item.step}
              </div>
              <h3 className="text-base font-bold mb-2">{item.title}</h3>
              <p className="text-sm text-muted leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* AI Advantage section */}
      <div className="rounded-3xl bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 p-8 md:p-12 text-white shadow-xl shadow-purple-500/20">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-semibold tracking-wider uppercase backdrop-blur-sm mb-6">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z" />
              <path d="M2 17l10 5 10-5" />
              <path d="M2 12l10 5 10-5" />
            </svg>
            The AI Advantage
          </div>
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            Your venue, recommended by AI
          </h2>
          <p className="text-white/70 leading-relaxed mb-8">
            Our AI agents handle thousands of conversations with tour operators every month.
            When an operator asks &quot;What should my group visit in Amsterdam?&quot; — your venue
            is naturally woven into the recommendation. No banners. No pop-ups. Just genuine,
            personalized suggestions that convert.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              { agent: "Emma", role: "Homepage Assistant", desc: "Talks to new visitors" },
              { agent: "Dashboard AI", role: "Booking Assistant", desc: "Helps active operators" },
              { agent: "Itinerary AI", role: "Route Planner", desc: "Builds day programs" },
            ].map((a) => (
              <div key={a.agent} className="rounded-2xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
                <p className="font-bold">{a.agent}</p>
                <p className="text-xs text-white/50 mt-0.5">{a.role}</p>
                <p className="text-xs text-white/70 mt-2">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tariff Card Download */}
      <div className="rounded-3xl border border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50 p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-bold flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
              Tariff Card
            </h2>
            <p className="mt-1 text-sm text-muted">Download or share the tariff card with venue partners. Includes all tiers, pricing, and contact info.</p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <a
              href="/partners/advertise"
              target="_blank"
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-6 py-3.5 text-sm font-bold text-black hover:shadow-lg transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              Open Tariff Card
            </a>
            <button
              onClick={() => navigator.clipboard.writeText("https://ticketmatch.ai/partners/advertise").then(() => alert("Link copied!"))}
              className="flex items-center gap-2 rounded-xl border border-amber-300 bg-white px-5 py-3.5 text-sm font-medium text-amber-700 hover:bg-amber-50 transition-all"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
                <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
              </svg>
              Copy Link
            </button>
          </div>
        </div>
      </div>

      {/* FAQ / Bottom CTA */}
      <div className="rounded-3xl border border-border/60 bg-white p-8 md:p-12 shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-2">Ready to grow your bookings?</h2>
        <p className="text-sm text-muted mb-6 max-w-lg mx-auto">
          Join the TicketMatch.ai partner network. All tiers include a free Enterprise account,
          direct payment via Mollie or invoice, and cancellation at any time.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="mailto:partners@ticketmatch.ai" className="flex items-center gap-2 rounded-xl bg-foreground px-6 py-3.5 text-sm font-semibold text-white hover:bg-gray-800 transition-all shadow-sm">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Contact Partners Team
          </a>
          <a href="https://wa.me/31612345678?text=Hi!%20I%27m%20interested%20in%20advertising%20on%20TicketMatch.ai" target="_blank" className="flex items-center gap-2 rounded-xl border border-green-300 bg-green-50 px-6 py-3.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-green-600">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            WhatsApp Us
          </a>
        </div>
        <p className="mt-6 text-xs text-muted">
          Payment via Mollie (iDEAL, credit card, SEPA) or invoice. Cancel anytime. No setup fees.
        </p>
      </div>

    </div>
  );
}
