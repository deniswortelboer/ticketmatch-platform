"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ═══════════════════════════════════════════════════════════════
// /auth/forgot-password
//
// User enters their email, Supabase sends a password-reset link.
// The link lands on /auth/reset-password where they pick a new
// password. We always show a success state — never reveal whether
// the email is registered, to prevent account enumeration.
// ═══════════════════════════════════════════════════════════════

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const inputClass =
    "h-12 w-full rounded-xl border border-border bg-card-bg px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const redirectTo =
      typeof window !== "undefined"
        ? `${window.location.origin}/auth/reset-password`
        : undefined;

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email.trim(),
      redirectTo ? { redirectTo } : undefined,
    );

    setLoading(false);
    if (resetError) {
      // Show generic copy regardless — don't leak which emails exist.
      console.warn("resetPasswordForEmail failed:", resetError.message);
    }
    // Either way: pretend it worked.
    setSent(true);
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/12 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto w-full max-w-md">
            {sent ? (
              <>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-accent"
                  >
                    <rect x="2" y="4" width="20" height="16" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                  Check your email
                </h1>
                <p className="mt-2 text-[15px] text-muted">
                  If an account exists for{" "}
                  <span className="font-semibold text-foreground">{email}</span>,
                  we&apos;ve sent a link to reset your password. The link
                  expires in 1 hour.
                </p>
                <div className="mt-8 rounded-xl border border-border bg-card-bg p-4 text-[13px] text-muted">
                  Didn&apos;t get it? Check spam, or wait a minute and try
                  again with the same address.
                </div>
                <p className="mt-8 text-center text-[13px] text-muted">
                  Remember it after all?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-accent hover:underline"
                  >
                    Back to sign in
                  </Link>
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">
                    Reset Password
                  </span>
                </div>
                <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.5rem]">
                  Forgot your{" "}
                  <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    password
                  </span>
                  ?
                </h1>
                <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                  Enter the email tied to your TicketMatch account and
                  we&apos;ll send a reset link.
                </p>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form className="mt-8" onSubmit={handleSubmit}>
                  <label className="mb-1.5 block text-[13px] font-semibold">
                    Email address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoFocus
                    className={inputClass}
                  />
                  <button
                    type="submit"
                    disabled={loading || !email.trim()}
                    className="mt-4 h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Sending link...
                      </span>
                    ) : (
                      "Send reset link"
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-[13px] text-muted">
                  Remember it after all?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-accent hover:underline"
                  >
                    Back to sign in
                  </Link>
                </p>
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
