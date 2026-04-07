"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

const plans = [
  {
    name: "Free",
    price: "€0",
    period: "",
    description: "Perfect to explore the platform",
    color: "border-border/60",
    buttonStyle: "border border-border text-foreground hover:bg-gray-50",
    buttonText: "Current Plan",
    disabled: true,
    features: [
      { text: "1 group", included: true },
      { text: "Up to 15 passengers", included: true },
      { text: "3 bookings", included: true },
      { text: "Browse full catalog", included: true },
      { text: "Basic dashboard", included: true },
      { text: "1 team member", included: true },
      { text: "File upload (Excel/Word)", included: false },
      { text: "Itinerary PDF export", included: false },
      { text: "Shareable itinerary link", included: false },
      { text: "Rebook trips", included: false },
      { text: "Priority support", included: false },
    ],
  },
  {
    name: "Pro",
    price: "€49",
    period: "/month",
    description: "For active tour operators",
    popular: true,
    color: "border-accent ring-2 ring-accent/20",
    buttonStyle: "bg-accent text-white hover:bg-blue-700",
    buttonText: "Upgrade to Pro",
    disabled: false,
    features: [
      { text: "Unlimited groups", included: true },
      { text: "Unlimited passengers", included: true },
      { text: "Unlimited bookings", included: true },
      { text: "Browse full catalog", included: true },
      { text: "Full dashboard + analytics", included: true },
      { text: "3 team members", included: true },
      { text: "File upload (Excel/Word)", included: true },
      { text: "Itinerary PDF export", included: true },
      { text: "Shareable itinerary link", included: true },
      { text: "Rebook trips (1-click)", included: true },
      { text: "Priority email support", included: true },
    ],
  },
  {
    name: "Enterprise",
    price: "€149",
    period: "/month",
    description: "For large operators & resellers",
    color: "border-border/60",
    buttonStyle: "bg-foreground text-white hover:bg-gray-800",
    buttonText: "Upgrade to Enterprise",
    disabled: false,
    features: [
      { text: "Everything in Pro", included: true },
      { text: "Unlimited team members", included: true },
      { text: "Branded PDF (your logo)", included: true },
      { text: "White-label options", included: true },
      { text: "API access", included: true },
      { text: "Route optimization", included: true },
      { text: "Savings calculator", included: true },
      { text: "Multi-currency support", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "WhatsApp support", included: true },
      { text: "Custom integrations", included: true },
    ],
  },
];

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
          Start free, upgrade when you need more.
        </p>

        {/* Annual toggle */}
        <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-border/60 bg-white p-1 shadow-sm">
          <button
            onClick={() => setAnnual(false)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              !annual ? "bg-foreground text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setAnnual(true)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
              annual ? "bg-foreground text-white shadow-sm" : "text-muted hover:text-foreground"
            }`}
          >
            Annual
            <span className="ml-1.5 text-xs text-green-500 font-semibold">-20%</span>
          </button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => {
          const price = plan.price === "€0"
            ? "€0"
            : annual
              ? `€${Math.round(parseInt(plan.price.replace("€", "")) * 0.8)}`
              : plan.price;

          return (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-white p-6 shadow-sm transition-all hover:shadow-md ${plan.color}`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-accent px-4 py-1 text-xs font-semibold text-white shadow-sm">
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h2 className="text-lg font-bold">{plan.name}</h2>
                <p className="mt-1 text-sm text-muted">{plan.description}</p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{price}</span>
                  {plan.period && (
                    <span className="text-sm text-muted">
                      {plan.period}
                      {annual && plan.price !== "€0" && (
                        <span className="ml-1 text-xs text-green-600">(billed annually)</span>
                      )}
                    </span>
                  )}
                </div>
              </div>

              <button
                disabled={plan.disabled || loading !== null}
                onClick={() => !plan.disabled && handleUpgrade(plan.name)}
                className={`mb-6 h-12 w-full rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${plan.buttonStyle}`}
              >
                {loading === `${plan.name.toLowerCase()}-${annual ? "annual" : "monthly"}` ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Redirecting to payment...
                  </span>
                ) : (
                  plan.buttonText
                )}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    {feature.included ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500 shrink-0">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 shrink-0">
                        <circle cx="12" cy="12" r="10" />
                        <path d="m15 9-6 6" />
                        <path d="m9 9 6 6" />
                      </svg>
                    )}
                    <span className={`text-sm ${feature.included ? "text-foreground" : "text-muted/50"}`}>
                      {feature.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6 text-center shadow-sm">
        <p className="text-sm text-muted">
          All plans include a <span className="font-semibold text-foreground">14-day free trial</span> of Pro features.
          No credit card required. Cancel anytime.
        </p>
      </div>
    </>
  );
}
