"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const plans = [
  {
    name: "Explorer",
    price: "€0",
    period: "forever",
    description: "Explore the full ecosystem. See what's possible before you commit.",
    dark: false,
    popular: false,
    color: "border-border/60 bg-white",
    buttonStyle: "border border-border text-foreground hover:bg-gray-50",
    buttonText: "Current Plan",
    disabled: true,
    icon: "explorer",
    features: [
      { text: "5 bookings per month", included: true },
      { text: "Full venue catalog", included: true },
      { text: "Live city map", included: true },
      { text: "1 team member", included: true },
      { text: "AI assistant", included: true },
      { text: "Email notifications", included: true },
      { text: "Weather forecasts", included: true },
      { text: "Live busyness data", included: false },
      { text: "QR vouchers & digital tickets", included: false },
      { text: "PDF invoices & itineraries", included: false },
      { text: "Smart route planner", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Growth",
    price: "€49",
    period: "/month",
    description: "Unlock the full power of the ecosystem. Built for operators who scale.",
    dark: false,
    popular: true,
    color: "border-accent ring-2 ring-accent/20 bg-gradient-to-b from-accent/[0.03] to-white",
    buttonStyle: "bg-accent text-white hover:bg-blue-700",
    buttonText: "Start 14-Day Free Trial",
    disabled: false,
    icon: "zap",
    features: [
      { text: "Unlimited bookings", included: true },
      { text: "Live busyness data (Google API)", included: true },
      { text: "Up to 5 team members", included: true },
      { text: "QR vouchers & digital tickets", included: true },
      { text: "Package builder", included: true },
      { text: "PDF invoices & itineraries", included: true },
      { text: "Smart route planner", included: true },
      { text: "Weather & best-time insights", included: true },
      { text: "Telegram & WhatsApp alerts", included: true },
      { text: "Priority email support", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: "€149",
    period: "/month",
    description: "For agencies & DMCs managing multiple groups across cities.",
    dark: true,
    popular: false,
    color: "border-gray-800 bg-gradient-to-b from-gray-900 to-gray-950",
    buttonStyle: "bg-white text-gray-900 hover:bg-gray-100 font-bold",
    buttonText: "Contact Sales",
    disabled: false,
    icon: "layers",
    features: [
      { text: "Everything in Growth", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Advanced analytics dashboard", included: true },
      { text: "API access & integrations", included: true },
      { text: "White-label options", included: true },
      { text: "Custom AI agent training", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Multi-city management", included: true },
      { text: "Priority onboarding & SLA", included: true },
      { text: "Custom invoicing", included: true },
    ],
  },
];

function PlanIcon({ type, dark }: { type: string; dark?: boolean }) {
  const color = dark ? "text-white" : type === "zap" ? "text-accent" : "text-foreground";
  const props = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, className: color };
  switch (type) {
    case "explorer":
      return <svg {...props}><circle cx="12" cy="12" r="10" /><path d="m16.24 7.76-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z" /></svg>;
    case "zap":
      return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "layers":
      return <svg {...props}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></svg>;
    default:
      return null;
  }
}

export default function PricingPage() {
  return (
    <Suspense>
      <PricingContent />
    </Suspense>
  );
}

function PricingContent() {
  const [annual, setAnnual] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const success = searchParams.get("success");

  const handleUpgrade = async (planName: string) => {
    if (planName === "Enterprise") {
      window.location.href = "mailto:sales@ticketmatch.ai?subject=Enterprise%20Plan%20Inquiry";
      return;
    }
    const planId = `${planName.toLowerCase()}-${annual ? "annual" : "monthly"}`;
    setLoading(planId);

    try {
      const res = await fetch("/api/mollie/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planId }),
      });
      const data = await res.json();

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        alert(data.error || "Something went wrong");
      }
    } catch {
      alert("Payment failed. Please try again.");
    }
    setLoading(null);
  };

  return (
    <>
      {success && (
        <div className="mb-6 rounded-2xl bg-green-50 border border-green-200 p-6 text-center">
          <div className="mb-2 flex justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-green-800">Payment successful!</h2>
          <p className="mt-1 text-sm text-green-600">Your plan has been upgraded. Enjoy all the premium features!</p>
        </div>
      )}

      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold tracking-tight">Choose your plan</h1>
        <p className="mt-2 text-sm text-muted">
          Start free, upgrade when you need more. No setup fees, no hidden costs.
        </p>

        {/* Annual toggle */}
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

      <div className="grid gap-6 lg:grid-cols-3 items-start">
        {plans.map((plan) => {
          const price = plan.price === "€0"
            ? "€0"
            : annual
              ? `€${Math.round(parseInt(plan.price.replace("€", "")) * 0.8)}`
              : plan.price;

          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border p-8 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5 ${plan.color} ${
                plan.popular ? "md:-mt-2 md:mb-2" : ""
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <div className="flex items-center gap-2.5 mb-3">
                  <PlanIcon type={plan.icon} dark={plan.dark} />
                  <h2 className={`text-lg font-bold ${plan.dark ? "text-white" : ""}`}>{plan.name}</h2>
                </div>

                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-4xl font-bold tracking-tight ${plan.dark ? "text-white" : ""} ${plan.popular ? "text-accent" : ""}`}>
                    {price}
                  </span>
                  <span className={`text-sm ${plan.dark ? "text-white/50" : "text-muted"}`}>
                    {plan.period}
                    {annual && plan.price !== "€0" && (
                      <span className="ml-1 text-xs text-green-500">(billed annually)</span>
                    )}
                  </span>
                </div>

                <p className={`text-sm leading-relaxed ${plan.dark ? "text-white/60" : "text-muted"}`}>
                  {plan.description}
                </p>
              </div>

              <button
                disabled={plan.disabled || loading !== null}
                onClick={() => !plan.disabled && handleUpgrade(plan.name)}
                className={`mb-8 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonStyle}`}
              >
                {loading === `${plan.name.toLowerCase()}-${annual ? "annual" : "monthly"}` ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Redirecting to payment...
                  </>
                ) : (
                  <>
                    {plan.buttonText}
                    {!plan.disabled && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
                      </svg>
                    )}
                  </>
                )}
              </button>

              {plan.popular && (
                <p className="text-center text-xs text-muted -mt-6 mb-6">No credit card required</p>
              )}

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {feature.included ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${plan.dark ? "text-green-400" : "text-green-500"}`}>
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                      </svg>
                    )}
                    <span className={`text-sm ${
                      feature.included
                        ? plan.dark ? "text-white/90" : "text-foreground"
                        : "text-muted/40"
                    }`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Trust bar */}
      <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <p className="text-center text-sm text-muted mb-4">
          All plans include a <span className="font-semibold text-foreground">14-day free trial</span> of Growth features. No credit card required. Cancel anytime.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {["SOC 2 Compliant", "GDPR Ready", "99.9% Uptime", "256-bit SSL", "EU Data Centers"].map((badge) => (
            <div key={badge} className="flex items-center gap-1.5 rounded-full bg-gray-50 border border-border/40 px-3 py-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <span className="text-[11px] font-medium text-muted">{badge}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
