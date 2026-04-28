"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ═══════════════════════════════════════════════════════════════
// /auth/reset-password
//
// Landing page for the reset link emailed by /auth/forgot-password.
// Supabase puts the user into a `PASSWORD_RECOVERY` session on the
// client when the link is clicked — we then call updateUser to set
// the new password. After success we sign the user out so they have
// to re-authenticate with the new credentials (more conservative
// than auto-redirect to dashboard).
// ═══════════════════════════════════════════════════════════════

export default function ResetPasswordPage() {
  const router = useRouter();
  const supabase = createClient();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  // Wait for Supabase to fire PASSWORD_RECOVERY before we trust the
  // session. If the link is invalid/expired we show a clear error
  // instead of a half-broken form.
  const [recoveryReady, setRecoveryReady] = useState(false);
  const [linkValid, setLinkValid] = useState(true);

  const inputClass =
    "h-12 w-full rounded-xl border border-border bg-card-bg px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10";

  useEffect(() => {
    // Two ways the recovery session shows up:
    //   1. PASSWORD_RECOVERY event on auth state change (modern flow)
    //   2. An already-existing session if the user navigated mid-flow
    const { data: sub } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") setRecoveryReady(true);
    });

    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setRecoveryReady(true);
    });

    // If after 4s we still haven't seen a recovery session, the link
    // is most likely expired or already used.
    const timeout = setTimeout(() => {
      if (!recoveryReady) setLinkValid(false);
    }, 4000);

    return () => {
      sub.subscription.unsubscribe();
      clearTimeout(timeout);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 8) {
      return setError("Password must be at least 8 characters.");
    }
    if (password !== confirmPassword) {
      return setError("Passwords don't match.");
    }
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });

    if (updateError) {
      setError(updateError.message);
      setLoading(false);
      return;
    }

    // Sign out so they re-login with the new password — keeps the
    // mental model simple ("you just set a new password, now use it").
    await supabase.auth.signOut();
    setLoading(false);
    setDone(true);
    setTimeout(() => router.push("/auth/login"), 2000);
  }

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />

      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/12 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="mx-auto w-full max-w-md">
            {done ? (
              <>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-emerald-600"
                  >
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                  Password updated
                </h1>
                <p className="mt-2 text-[15px] text-muted">
                  Your password has been reset. Redirecting you to sign in…
                </p>
              </>
            ) : !linkValid ? (
              <>
                <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10">
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-red-600"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                  </svg>
                </div>
                <h1 className="mt-4 text-2xl font-extrabold tracking-tight">
                  Reset link expired
                </h1>
                <p className="mt-2 text-[15px] text-muted">
                  This reset link is no longer valid. Reset links expire 1
                  hour after they are sent.
                </p>
                <Link
                  href="/auth/forgot-password"
                  className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-accent px-6 text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110"
                >
                  Request a new link
                </Link>
              </>
            ) : (
              <>
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">
                    New Password
                  </span>
                </div>
                <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.5rem]">
                  Set a{" "}
                  <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                    new password
                  </span>
                </h1>
                <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                  Pick something at least 8 characters long. A passphrase is
                  stronger than a single word.
                </p>

                {error && (
                  <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:bg-red-500/10 dark:border-red-500/20 dark:text-red-400">
                    {error}
                  </div>
                )}

                <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold">
                      New password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="At least 8 characters"
                      autoFocus
                      autoComplete="new-password"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold">
                      Confirm password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat the new password"
                      autoComplete="new-password"
                      className={inputClass}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !recoveryReady || password.length < 8}
                    className="h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Updating password...
                      </span>
                    ) : !recoveryReady ? (
                      "Verifying link..."
                    ) : (
                      "Update password"
                    )}
                  </button>
                </form>

                <p className="mt-8 text-center text-[13px] text-muted">
                  Need a new link?{" "}
                  <Link
                    href="/auth/forgot-password"
                    className="font-semibold text-accent hover:underline"
                  >
                    Send another
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
