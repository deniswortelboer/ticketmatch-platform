"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Link from "next/link";

const accounts = [
  {
    type: "tour_operator",
    label: "Tour Operator",
    desc: "Full dashboard with bookings, map, catalog, AI agents",
    color: "from-blue-600 to-blue-800",
    bgColor: "bg-blue-50 border-blue-200",
    textColor: "text-blue-700",
  },
  {
    type: "reseller",
    label: "Reseller",
    desc: "Reseller dashboard with clients, earnings, referral link",
    color: "from-green-600 to-emerald-600",
    bgColor: "bg-green-50 border-green-200",
    textColor: "text-green-700",
  },
  {
    type: "developer",
    label: "Developer",
    desc: "Developer docs, API reference, Developer Agent",
    color: "from-purple-600 to-indigo-600",
    bgColor: "bg-purple-50 border-purple-200",
    textColor: "text-purple-700",
  },
];

export default function TestLoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [setupDone, setSetupDone] = useState(false);
  const [error, setError] = useState("");
  const [setupLoading, setSetupLoading] = useState(false);

  const handleSetup = async () => {
    setSetupLoading(true);
    setError("");
    try {
      const res = await fetch("/api/test-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setSetupDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Setup failed");
    }
    setSetupLoading(false);
  };

  const handleLogin = async (accountType: string) => {
    setLoading(accountType);
    setError("");
    try {
      // Get credentials
      const res = await fetch("/api/test-accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "login", accountType }),
      });
      const { email, password, redirect } = await res.json();

      // Sign in
      const supabase = createClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      router.push(redirect);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
      setLoading(null);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 flex items-center justify-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-blue-800">
            <span className="text-sm font-bold text-white">TM</span>
          </div>
          <span className="text-lg font-semibold tracking-tight">
            Ticket<span className="text-blue-600">Match</span>
            <span className="text-gray-400">.ai</span>
          </span>
        </Link>

        <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-1 inline-flex items-center rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-medium text-amber-700">
            Test Mode
          </div>
          <h1 className="text-xl font-bold tracking-tight">Quick Test Login</h1>
          <p className="mt-1 text-sm text-gray-500">
            One-click login to test different user roles
          </p>

          {error && (
            <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>
          )}

          {!setupDone ? (
            <div className="mt-6">
              <p className="text-sm text-gray-500 mb-4">
                First time? Create the test accounts:
              </p>
              <button
                onClick={handleSetup}
                disabled={setupLoading}
                className="w-full h-12 rounded-xl bg-gray-900 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50"
              >
                {setupLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Creating accounts...
                  </span>
                ) : (
                  "Create Test Accounts"
                )}
              </button>
            </div>
          ) : (
            <div className="mt-6 space-y-3">
              {accounts.map((account) => (
                <button
                  key={account.type}
                  onClick={() => handleLogin(account.type)}
                  disabled={loading !== null}
                  className={`w-full rounded-xl border p-4 text-left transition-all hover:shadow-md disabled:opacity-50 ${
                    loading === account.type ? "ring-2 ring-blue-500" : ""
                  } ${account.bgColor}`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className={`text-sm font-semibold ${account.textColor}`}>
                        {account.label}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{account.desc}</p>
                    </div>
                    {loading === account.type ? (
                      <span className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-gray-400">
                        <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">
          This page is for testing only.{" "}
          <Link href="/auth/login" className="underline hover:text-gray-600">
            Normal login
          </Link>
        </p>
      </div>
    </div>
  );
}
