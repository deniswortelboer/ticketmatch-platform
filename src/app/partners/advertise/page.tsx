"use client";

import { useState } from "react";

const tiers = [
  {
    name: "Bronze",
    price: 99,
    gradient: "from-amber-700 via-amber-600 to-yellow-700",
    border: "border-amber-200",
    check: "text-amber-600",
    features: [
      "Higher ranking in Catalog",
      "1 venue photo",
      "Standard venue description",
      "TicketMatch.ai supplier badge",
    ],
  },
  {
    name: "Silver",
    price: 249,
    gradient: "from-slate-500 via-slate-400 to-slate-500",
    border: "border-slate-200",
    check: "text-slate-500",
    features: [
      "Everything in Bronze",
      "\u201cFeatured\u201d badge in Catalog",
      "Larger pin on City Map",
      "Dashboard Agent recommendations",
      "3 venue photos",
      "Custom venue description",
      "Monthly views & clicks report",
    ],
  },
  {
    name: "Gold",
    price: 499,
    popular: true,
    gradient: "from-yellow-500 via-amber-400 to-yellow-600",
    border: "border-yellow-300 ring-2 ring-yellow-400/30",
    check: "text-yellow-600",
    features: [
      "Everything in Silver",
      "Emma + Dashboard Agent recommendations",
      "Itinerary Builder suggestions",
      "Homepage photo carousel",
      "Included in 1 curated package",
      "5 venue photos + video",
      "Custom description + story",
      "Monthly email digest mention",
      "1x/month social media post",
      "Full performance report",
    ],
  },
  {
    name: "Platinum",
    price: 999,
    gradient: "from-violet-600 via-purple-500 to-indigo-600",
    border: "border-purple-200",
    check: "text-purple-600",
    features: [
      "Everything in Gold",
      "AI first recommendation (all agents)",
      "Post-booking upsell to operators",
      "Homepage package spotlight",
      "Included in 3 curated packages",
      "Unlimited photos + video",
      "Custom story + brand page",
      "Premium supplier badge",
      "Priority #1 in all listings",
      "Weekly email digest feature",
      "2x/month social media posts",
      "Full conversion & booking report",
      "Dedicated account manager",
      "Free Enterprise account",
    ],
  },
];

export default function AdvertiseTariffPage() {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <>
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-only { display: flex !important; }
          @page { size: A4; margin: 7mm; }
          html, body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .tariff-wrap { padding: 0 !important; min-height: auto !important; }
          .tariff-content { padding: 0 !important; gap: 5px !important; display: flex !important; flex-direction: column !important; }
          .tariff-hero { padding: 14px 16px !important; border-radius: 10px !important; }
          .tariff-hero h1 { font-size: 17px !important; }
          .tariff-hero .hero-desc { font-size: 8px !important; margin-top: 2px !important; line-height: 1.3 !important; }
          .tariff-hero .hero-brand { margin-bottom: 6px !important; }
          .tariff-hero .hero-brand span { font-size: 12px !important; }
          .tariff-hero .hero-brand .badge-pill { font-size: 7px !important; }
          .tariff-cta { gap: 4px !important; margin-top: 6px !important; }
          .tariff-cta a { font-size: 8px !important; padding: 4px 10px !important; border-radius: 6px !important; }
          .tariff-stats { gap: 3px !important; }
          .tariff-stats > div { padding: 3px 6px !important; min-width: 55px !important; }
          .tariff-stats p:first-child { font-size: 11px !important; }
          .tariff-stats p:last-child { font-size: 6px !important; }
          .tariff-grid { gap: 4px !important; grid-template-columns: repeat(2, 1fr) !important; }
          .tariff-card { font-size: 9px !important; overflow: hidden !important; break-inside: avoid !important; }
          .tariff-card-inner { padding: 6px 8px !important; }
          .tariff-card-inner h3 { font-size: 10px !important; }
          .tariff-card-inner .price-big { font-size: 18px !important; }
          .tariff-card-inner .price-period { font-size: 8px !important; }
          .tariff-card-inner .price-annual { font-size: 7px !important; }
          .tariff-card ul { font-size: 8px !important; }
          .tariff-card ul li { gap: 3px !important; }
          .tariff-card ul svg { width: 9px !important; height: 9px !important; }
          .tariff-card .tier-icon { width: 20px !important; height: 20px !important; }
          .tariff-card .tier-icon svg { width: 10px !important; height: 10px !important; }
          .popular-badge {
            position: static !important;
            transform: none !important;
            display: inline-block !important;
            margin-bottom: 2px !important;
            font-size: 7px !important;
            padding: 1px 6px !important;
          }
          .tariff-info { gap: 4px !important; }
          .tariff-info > div { padding: 6px 8px !important; }
          .tariff-info h3 { font-size: 9px !important; }
          .tariff-info p { font-size: 7px !important; }
          .tariff-contact { padding: 8px 12px !important; gap: 6px !important; border-radius: 8px !important; }
          .tariff-contact h3 { font-size: 10px !important; }
          .tariff-contact p { font-size: 7px !important; }
          .tariff-contact .contact-links { gap: 4px !important; }
          .tariff-contact .contact-links a { font-size: 7px !important; padding: 3px 8px !important; }
          .tariff-footer { padding: 6px 10px !important; border-radius: 8px !important; }
          .tariff-footer span { font-size: 8px !important; }
        }
      `}</style>

      <div className="tariff-wrap min-h-screen bg-white">
        {/* Action bar — hidden in print */}
        <div className="no-print sticky top-0 z-50 border-b border-border/60 bg-white/80 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-800">
                <span className="text-xs font-bold text-white">TM</span>
              </div>
              <span className="text-sm font-semibold">TicketMatch.ai</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={handleShare} className="rounded-lg border border-border/60 px-4 py-2 text-xs font-medium hover:bg-gray-50 transition-colors">
                {copied ? "Copied!" : "Copy Link"}
              </button>
              <button onClick={() => window.print()} className="rounded-lg bg-gray-900 px-4 py-2 text-xs font-medium text-white hover:bg-gray-800 transition-colors">
                Save as PDF
              </button>
            </div>
          </div>
        </div>

        <div className="tariff-content max-w-6xl mx-auto px-6 py-5 space-y-4">

          {/* Hero header */}
          <div className="tariff-hero relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-950 via-gray-900 to-black p-6 text-white">
            <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-yellow-500/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-48 w-48 rounded-full bg-violet-500/10 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div className="max-w-lg">
                <div className="hero-brand flex items-center gap-2.5 mb-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-sm">TM</div>
                  <span className="text-lg font-bold tracking-tight">TicketMatch.ai</span>
                  <span className="badge-pill ml-2 rounded-full bg-white/10 px-3 py-0.5 text-[9px] font-semibold tracking-wider uppercase">Partner Advertising Program</span>
                </div>

                <h1 className="text-2xl md:text-3xl font-bold tracking-tight leading-tight">
                  Get your venue in front of{" "}
                  <span className="bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-500 bg-clip-text text-transparent" style={{ WebkitBoxDecorationBreak: "clone", paddingRight: "2px" }}>
                    hundreds of tour operators
                  </span>
                </h1>
                <p className="hero-desc mt-2 text-sm text-white/50 leading-relaxed">
                  Join our partner network and let AI-powered recommendations drive group bookings to your venue.
                  From catalog listings to personalized agent suggestions — we put you where operators are looking.
                </p>

                {/* CTA buttons — visible in both web AND print as clickable links */}
                <div className="tariff-cta mt-3 flex flex-wrap items-center gap-3">
                  <a href="mailto:partners@ticketmatch.ai" className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 px-5 py-2 text-sm font-bold text-black hover:shadow-lg transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    Become a Partner
                  </a>
                  <a href="mailto:partners@ticketmatch.ai" className="inline-flex items-center gap-2 rounded-lg bg-white/10 px-5 py-2 text-sm font-medium text-white border border-white/10 hover:bg-white/20 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                    Email Us
                  </a>
                  <a href="https://wa.me/31612345678?text=Hi!%20I%27m%20interested%20in%20advertising%20on%20TicketMatch.ai" target="_blank" className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-5 py-2 text-sm font-bold text-white hover:bg-green-600 transition-all">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                    WhatsApp Us
                  </a>
                </div>
              </div>

              {/* Stats */}
              <div className="tariff-stats grid grid-cols-2 gap-2 shrink-0">
                {[
                  { v: "300+", l: "Tour Operators" },
                  { v: "8+", l: "Cities" },
                  { v: "50K+", l: "Monthly Searches" },
                  { v: "24/7", l: "AI Agents" },
                ].map((s) => (
                  <div key={s.l} className="flex flex-col items-center rounded-xl bg-white/5 border border-white/10 px-4 py-2.5 min-w-[100px]">
                    <p className="text-lg font-bold text-yellow-400">{s.v}</p>
                    <p className="text-[9px] text-white/40 uppercase tracking-wide">{s.l}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Tier grid */}
          <div className="tariff-grid grid grid-cols-2 lg:grid-cols-4 gap-4">
            {tiers.map((tier) => (
              <div key={tier.name} className={`tariff-card relative rounded-xl border bg-white overflow-hidden ${tier.border}`}>
                <div className={`h-1.5 bg-gradient-to-r ${tier.gradient}`} />

                <div className="tariff-card-inner p-4">
                  {/* Name + icon */}
                  <div className="flex items-center gap-2 mb-2">
                    {tier.popular && (
                      <span className="popular-badge rounded-full bg-yellow-400 px-2.5 py-0.5 text-[9px] font-bold text-yellow-900 ml-auto order-last">
                        Most Popular
                      </span>
                    )}
                    <div className={`tier-icon flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${tier.gradient} text-white`}>
                      {tier.name === "Bronze" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>}
                      {tier.name === "Silver" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18" /><line x1="2" y1="12" x2="22" y2="12" /></svg>}
                      {tier.name === "Gold" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="6" /><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" /></svg>}
                      {tier.name === "Platinum" && <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>}
                    </div>
                    <h3 className="text-sm font-bold">{tier.name}</h3>
                  </div>

                  {/* Price */}
                  <div className="mb-3 pb-3 border-b border-gray-100">
                    <div className="flex items-baseline gap-0.5">
                      <span className="price-big text-2xl font-bold">&euro;{tier.price}</span>
                      <span className="price-period text-xs text-gray-400">/month</span>
                    </div>
                    <p className="price-annual text-[10px] text-green-600 font-medium mt-0.5">
                      &euro;{Math.round(tier.price * 0.8)}/mo with annual billing
                    </p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-1.5">
                    {tier.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`${tier.check} shrink-0 mt-0.5`}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        <span className="text-[11px] leading-snug text-gray-600">{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Info cards */}
          <div className="tariff-info grid grid-cols-2 gap-4">
            <div className="rounded-xl border border-green-200 bg-green-50 p-4">
              <h3 className="text-sm font-bold text-green-900">Annual Billing: Save 20%</h3>
              <p className="text-xs text-green-700/70 mt-1">Pay annually and save up to &euro;2,400/year on Platinum.</p>
            </div>
            <div className="rounded-xl border border-blue-200 bg-blue-50 p-4">
              <h3 className="text-sm font-bold text-blue-900">Flexible Payment</h3>
              <p className="text-xs text-blue-700/70 mt-1">Via Mollie (iDEAL, credit card, SEPA) or invoice. No setup fees. Cancel anytime.</p>
            </div>
          </div>

          {/* Contact CTA — always visible, clickable links in PDF */}
          <div className="tariff-contact rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white p-5 flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-bold">Ready to grow your venue bookings?</h3>
              <p className="text-xs text-white/60 mt-0.5">Get in touch today — our team will help you pick the right plan.</p>
            </div>
            <div className="contact-links flex flex-wrap items-center gap-2 shrink-0">
              <a href="mailto:partners@ticketmatch.ai" className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-2 text-xs font-bold text-blue-700 hover:bg-blue-50 transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
                partners@ticketmatch.ai
              </a>
              <a href="https://wa.me/31612345678?text=Hi!%20I%27m%20interested%20in%20advertising%20on%20TicketMatch.ai" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg bg-green-500 px-4 py-2 text-xs font-bold text-white hover:bg-green-600 transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                WhatsApp Us
              </a>
              <a href="https://ticketmatch.ai/partners/advertise" target="_blank" className="inline-flex items-center gap-1.5 rounded-lg bg-white/10 border border-white/20 px-4 py-2 text-xs font-medium text-white hover:bg-white/20 transition-all">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
                ticketmatch.ai
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="tariff-footer rounded-xl bg-gray-950 text-white p-4 flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 text-white font-black text-[9px]">TM</div>
              <div>
                <span className="text-xs font-bold">TicketMatch.ai</span>
                <span className="ml-2 text-[10px] text-white/40">The B2B City Access Platform</span>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/50">
              <a href="mailto:partners@ticketmatch.ai" className="hover:text-white/80 transition-colors">partners@ticketmatch.ai</a>
              <a href="https://ticketmatch.ai" target="_blank" className="hover:text-white/80 transition-colors">ticketmatch.ai</a>
              <span className="text-white/25">Confidential &copy; {new Date().getFullYear()} TicketMatch.ai</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
