"use client";

import Link from "next/link";
import { useState } from "react";

interface UpgradeLockProps {
  feature: string;
  plan?: "Pro" | "Enterprise";
  children: React.ReactNode;
  locked?: boolean;
}

export default function UpgradeLock({ feature, plan = "Pro", children, locked = true }: UpgradeLockProps) {
  const [showPopup, setShowPopup] = useState(false);

  if (!locked) return <>{children}</>;

  return (
    <div className="relative">
      {/* Greyed out content */}
      <div
        onClick={() => setShowPopup(true)}
        className="cursor-pointer opacity-40 grayscale pointer-events-auto select-none"
      >
        {children}
      </div>

      {/* Lock badge */}
      <div
        onClick={() => setShowPopup(true)}
        className="absolute inset-0 flex items-center justify-center cursor-pointer"
      >
        <div className="flex items-center gap-2 rounded-full bg-white/90 border border-border/60 px-4 py-2 shadow-lg backdrop-blur-sm">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
          <span className="text-xs font-semibold text-foreground">{plan}</span>
        </div>
      </div>

      {/* Upgrade popup */}
      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPopup(false)}>
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Upgrade to {plan}</h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-foreground">{feature}</span> is available on the {plan} plan. Upgrade to unlock this and many more features.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
              >
                Maybe later
              </button>
              <Link
                href="/dashboard/pricing"
                className="flex-1 rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Standalone lock button for inline use
export function UpgradeButton({ feature, plan = "Pro" }: { feature: string; plan?: "Pro" | "Enterprise" }) {
  const [showPopup, setShowPopup] = useState(false);

  return (
    <>
      <button
        onClick={() => setShowPopup(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-muted hover:bg-gray-200 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-500">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        {plan}
      </button>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setShowPopup(false)}>
          <div
            className="mx-4 w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <h2 className="text-xl font-bold tracking-tight">Upgrade to {plan}</h2>
            <p className="mt-2 text-sm text-muted">
              <span className="font-medium text-foreground">{feature}</span> is available on the {plan} plan.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 rounded-xl border border-border px-4 py-3 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
              >
                Maybe later
              </button>
              <Link
                href="/dashboard/pricing"
                className="flex-1 rounded-xl bg-accent px-4 py-3 text-center text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
              >
                View Plans
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
