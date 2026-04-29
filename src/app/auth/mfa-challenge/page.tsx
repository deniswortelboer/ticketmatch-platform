"use client";

// Auth pages depend on URL hash params from Supabase. Skip prerender.
export const dynamic = "force-dynamic";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ═══════════════════════════════════════════════════════════════
// /auth/mfa-challenge
//
// Sits between login and the dashboard for users who enrolled a TOTP
// authenticator. After the first-factor sign-in (Google / Microsoft /
// email OTP / password) they land here at AAL1 — they enter the 6-digit
// code from their authenticator app to bump the session to AAL2.
//
// Flow:
//   1. supabase.auth.mfa.listFactors() to find the verified TOTP factor.
//   2. supabase.auth.mfa.challenge({ factorId }) to start a challenge.
//   3. supabase.auth.mfa.verify({ factorId, challengeId, code }) on submit.
//   4. Redirect to /dashboard on success.
// ═══════════════════════════════════════════════════════════════

export default function MfaChallengePage() {
  const router = useRouter();
  const [factorId, setFactorId] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [factorName, setFactorName] = useState<string>("");

  // On mount: figure out which TOTP factor we're challenging. If the user
  // has no enrolled factor (came here by mistake or unenrolled elsewhere)
  // skip straight to the dashboard.
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      try {
        // If somehow already at AAL2, no need for a challenge — go on.
        const { data: aal } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
        if (aal?.currentLevel === "aal2") {
          router.replace("/dashboard");
          return;
        }
        const { data: factors, error } = await supabase.auth.mfa.listFactors();
        if (error) {
          setError(error.message);
          setLoading(false);
          return;
        }
        const totp = (factors?.totp || []).find((f) => f.status === "verified");
        if (!totp) {
          // No enrolled factor → nothing to challenge against. Send them on.
          router.replace("/dashboard");
          return;
        }
        setFactorId(totp.id);
        setFactorName(totp.friendly_name || "Authenticator app");
        setLoading(false);
      } catch (err) {
        console.error("MFA challenge load failed:", err);
        setError("Could not load 2FA factors. Please try signing in again.");
        setLoading(false);
      }
    })();
  }, [router]);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId) return;
    const cleanCode = code.replace(/\D/g, "");
    if (cleanCode.length !== 6) {
      setError("Enter the 6-digit code from your authenticator app.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const supabase = createClient();
      const { data: ch, error: chErr } = await supabase.auth.mfa.challenge({ factorId });
      if (chErr || !ch) {
        setError(chErr?.message || "Could not start verification.");
        setSubmitting(false);
        return;
      }
      const { error: vErr } = await supabase.auth.mfa.verify({
        factorId,
        challengeId: ch.id,
        code: cleanCode,
      });
      if (vErr) {
        setError(vErr.message || "Invalid code. Please try again.");
        setSubmitting(false);
        return;
      }
      router.replace("/dashboard");
    } catch (err) {
      console.error("MFA verify failed:", err);
      setError("Verification failed. Try again.");
      setSubmitting(false);
    }
  };

  const handleSignOut = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/auth/login");
  };

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <Header />
      <main className="flex flex-1 items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border border-border/60 bg-white p-8 shadow-sm">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold">Two-factor authentication</h1>
            <p className="mt-1 text-sm text-muted">
              Enter the 6-digit code from <strong>{factorName || "your authenticator app"}</strong> to continue.
            </p>
          </div>

          {loading ? (
            <p className="text-center text-sm text-muted">Loading…</p>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium" htmlFor="code">
                  Verification code
                </label>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="123456"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-center text-lg font-mono tracking-[0.4em] outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>

              {error && (
                <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
              )}

              <button
                type="submit"
                disabled={submitting || code.length !== 6}
                className="w-full rounded-xl bg-accent px-5 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50"
              >
                {submitting ? "Verifying…" : "Verify & continue"}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <Link
                  href="/auth/login"
                  onClick={(e) => { e.preventDefault(); handleSignOut(); }}
                  className="text-muted hover:text-foreground hover:underline"
                >
                  Sign in with a different account
                </Link>
                <a
                  href="mailto:hello@ticketmatch.ai?subject=Lost%20access%20to%202FA"
                  className="text-muted hover:text-foreground hover:underline"
                >
                  Lost your device?
                </a>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
