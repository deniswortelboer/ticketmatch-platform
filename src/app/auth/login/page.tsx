"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Step = "email" | "code";
const CODE_LENGTH = 8;

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send OTP code to email
  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        shouldCreateUser: true,
      },
    });

    if (otpError) {
      setError(otpError.message);
      setLoading(false);
      return;
    }

    setSuccess(`Code sent to ${email}`);
    setStep("code");
    setLoading(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  // Handle code input
  const handleCodeChange = (index: number, value: string) => {
    // Handle paste of full code
    if (value.length > 1) {
      const pasted = value.replace(/\D/g, "").slice(0, CODE_LENGTH);
      if (pasted.length >= CODE_LENGTH) {
        const newCode = pasted.split("").slice(0, CODE_LENGTH);
        setCode(newCode);
        inputRefs.current[CODE_LENGTH - 1]?.focus();
        setTimeout(() => verifyCode(newCode.join("")), 200);
        return;
      }
    }

    const digit = value.replace(/\D/g, "").slice(-1);
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);

    // Move to next input
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join("");
      if (fullCode.length === CODE_LENGTH) {
        setTimeout(() => verifyCode(fullCode), 200);
      }
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  // Verify OTP code
  const verifyCode = async (otpCode: string) => {
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: email.trim(),
      token: otpCode,
      type: "email",
    });

    if (verifyError) {
      setError("Invalid code. Please try again.");
      setCode(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
      setLoading(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  // Resend code
  const handleResend = async () => {
    setLoading(true);
    setError("");
    setCode(Array(CODE_LENGTH).fill(""));

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
    });

    if (otpError) {
      setError(otpError.message);
    } else {
      setSuccess("New code sent!");
    }
    setLoading(false);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  };

  const handleSocialLogin = async (provider: "google" | "azure") => {
    setError("");
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (authError) {
      setError(authError.message);
    }
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-12 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-800">
              <span className="text-sm font-bold text-white">TM</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Ticket<span className="text-accent">Match</span>
              <span className="text-muted">.ai</span>
            </span>
          </Link>

          {step === "email" ? (
            <div className="max-w-sm">
              <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
              <p className="mt-2 text-sm text-muted">
                Sign in to your B2B dashboard.
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Social login buttons */}
              <div className="mt-8 space-y-3">
                <button
                  onClick={() => handleSocialLogin("google")}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-white text-sm font-medium transition-all hover:bg-gray-50 hover:shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 18 18">
                    <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4" />
                    <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853" />
                    <path d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05" />
                    <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335" />
                  </svg>
                  Continue with Google
                </button>
                <button
                  onClick={() => handleSocialLogin("azure")}
                  className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-white text-sm font-medium transition-all hover:bg-gray-50 hover:shadow-sm"
                >
                  <svg width="18" height="18" viewBox="0 0 21 21">
                    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
                    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
                    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
                    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
                  </svg>
                  Continue with Microsoft
                </button>
              </div>

              {/* Divider */}
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-xs text-muted">or sign in with email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form className="mt-5" onSubmit={handleSendCode}>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Email address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    autoFocus
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="mt-4 h-12 w-full rounded-xl bg-foreground text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Sending code...
                    </span>
                  ) : (
                    "Send Login Code"
                  )}
                </button>

                <p className="mt-3 text-center text-xs text-muted">
                  We&apos;ll email you a login code. No password needed.
                </p>
              </form>

              <p className="mt-8 text-center text-sm text-muted">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="font-medium text-accent hover:underline">
                  Request Access
                </Link>
              </p>
            </div>
          ) : (
            <>
              {/* Code entry step */}
              <button
                onClick={() => { setStep("email"); setError(""); setCode(Array(CODE_LENGTH).fill("")); }}
                className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
                </svg>
                Back
              </button>

              <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </div>

              <h1 className="mt-4 text-2xl font-bold tracking-tight">Check your email</h1>
              <p className="mt-2 text-sm text-muted">
                We sent a login code to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>

              {error && (
                <div className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {success && !error && (
                <div className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-600">
                  {success}
                </div>
              )}

              {/* 8-digit code input */}
              <div className="mt-8 flex justify-center gap-2">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={CODE_LENGTH}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LENGTH);
                      if (pasted.length >= CODE_LENGTH) {
                        e.preventDefault();
                        const newCode = pasted.split("").slice(0, CODE_LENGTH);
                        setCode(newCode);
                        inputRefs.current[CODE_LENGTH - 1]?.focus();
                        setTimeout(() => verifyCode(pasted.slice(0, CODE_LENGTH)), 200);
                      }
                    }}
                    disabled={loading}
                    className={`h-13 w-11 rounded-xl border-2 text-center text-lg font-bold outline-none transition-all ${
                      digit
                        ? "border-accent bg-accent/5 text-foreground"
                        : "border-border bg-white text-foreground"
                    } focus:border-accent focus:ring-2 focus:ring-accent/10 disabled:opacity-50`}
                  />
                ))}
              </div>

              {loading && (
                <div className="mt-6 flex items-center justify-center gap-2 text-sm text-accent">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-accent/30 border-t-accent" />
                  Verifying...
                </div>
              )}

              <div className="mt-8 text-center">
                <p className="text-sm text-muted">
                  Didn&apos;t receive a code?{" "}
                  <button
                    onClick={handleResend}
                    disabled={loading}
                    className="font-medium text-accent hover:underline disabled:opacity-50"
                  >
                    Resend
                  </button>
                </p>
                <p className="mt-2 text-xs text-muted/60">
                  Check your spam folder if you don&apos;t see it.
                </p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Right — visual */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50/30 lg:flex">
        <div className="max-w-md px-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-accent/10 text-accent">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold tracking-tight">
            Your B2B city access platform
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted">
            Book museums, attractions and experiences for your groups at exclusive B2B rates.
          </p>
        </div>
      </div>
    </div>
  );
}
