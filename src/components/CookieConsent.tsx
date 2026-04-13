"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem("cookie-consent");
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem("cookie-consent", "accepted");
    setVisible(false);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "granted",
      });
    }
  }

  function decline() {
    localStorage.setItem("cookie-consent", "declined");
    setVisible(false);
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied",
      });
    }
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[9999] p-4 md:p-6">
      <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 dark:border-white/10 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg p-5 shadow-2xl">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <circle cx="8" cy="8" r="7" stroke="#2563eb" strokeWidth="1.5" />
              <circle cx="5.5" cy="6" r="1" fill="#2563eb" />
              <circle cx="10" cy="6.5" r="0.75" fill="#2563eb" />
              <circle cx="7" cy="10" r="1.25" fill="#2563eb" />
              <circle cx="10.5" cy="9.5" r="0.5" fill="#2563eb" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Cookies &amp; Privacy</p>
            <p className="mt-1 text-xs leading-relaxed text-gray-500 dark:text-gray-400">
              We use cookies for analytics to improve our platform. Essential cookies are always active.
              Read our{" "}
              <Link href="/privacy" className="underline hover:text-blue-600 dark:hover:text-blue-400">
                Privacy Policy
              </Link>.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={accept}
                className="rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-700"
              >
                Accept all
              </button>
              <button
                onClick={decline}
                className="rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-4 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 transition-colors hover:bg-gray-50 dark:hover:bg-white/10"
              >
                Essential only
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
