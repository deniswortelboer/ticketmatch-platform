"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: true },
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

  const handleCodeChange = (index: number, value: string) => {
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
    if (digit && index < CODE_LENGTH - 1) inputRefs.current[index + 1]?.focus();
    if (digit && index === CODE_LENGTH - 1) {
      const fullCode = newCode.join("");
      if (fullCode.length === CODE_LENGTH) setTimeout(() => verifyCode(fullCode), 200);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

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
    if (authError) setError(authError.message);
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-border bg-card-bg px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10";

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />

      <section className="relative overflow-hidden">
        {/* Background blobs */}
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-accent/12 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr]">

            {/* ═══════ LEFT: Form ═══════ */}
            <div className="mx-auto w-full max-w-md">
              {step === "email" ? (
                <div className="max-w-sm">
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">Sign In</span>
                  </div>
                  <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.5rem]">
                    Welcome{" "}
                    <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                      back
                    </span>
                  </h1>
                  <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                    Sign in to your B2B dashboard.
                  </p>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  {/* Social login */}
                  <div className="mt-8 space-y-3">
                    <button
                      onClick={() => handleSocialLogin("google")}
                      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card-bg text-sm font-medium transition-all hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5"
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
                      className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card-bg text-sm font-medium transition-all hover:border-accent/20 hover:shadow-lg hover:shadow-accent/5"
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
                    <span className="text-[12px] text-muted">or sign in with email</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  <form className="mt-5" onSubmit={handleSendCode}>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold">Email address</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@company.com"
                        autoFocus
                        className={inputClass}
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading || !email.trim()}
                      className="mt-4 h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
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

                    <p className="mt-3 text-center text-[12px] text-muted">
                      We&apos;ll email you a login code. No password needed.
                    </p>
                  </form>

                  <p className="mt-8 text-center text-[13px] text-muted">
                    Don&apos;t have an account?{" "}
                    <Link href="/auth/register" className="font-semibold text-accent hover:underline">
                      Request Access
                    </Link>
                  </p>
                </div>
              ) : (
                <>
                  <button
                    onClick={() => { setStep("email"); setError(""); setCode(Array(CODE_LENGTH).fill("")); }}
                    className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back
                  </button>

                  <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                  </div>

                  <h1 className="mt-4 text-2xl font-extrabold tracking-tight">Check your email</h1>
                  <p className="mt-2 text-[15px] text-muted">
                    We sent a login code to{" "}
                    <span className="font-semibold text-foreground">{email}</span>
                  </p>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}
                  {success && !error && (
                    <div className="mt-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">
                      {success}
                    </div>
                  )}

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
                            : "border-border bg-card-bg text-foreground"
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
                    <p className="text-[13px] text-muted">
                      Didn&apos;t receive a code?{" "}
                      <button onClick={handleResend} disabled={loading} className="font-semibold text-accent hover:underline disabled:opacity-50">
                        Resend
                      </button>
                    </p>
                    <p className="mt-2 text-[11px] text-muted/60">
                      Check your spam folder if you don&apos;t see it.
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* ═══════ RIGHT: Visual ═══════ */}
            <div className="hidden lg:block">
              {/* Animated SVG */}
              <div className="flex justify-center mb-10">
                <svg viewBox="0 0 360 300" className="w-full max-w-[360px]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="lg-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="lg-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  <circle cx="180" cy="150" r="130" fill="url(#lg-glow)" />
                  <circle cx="180" cy="150" r="120" fill="none" stroke="url(#lg-ring)" strokeWidth="1" strokeDasharray="6 5"
                    style={{ animation: "lg-spin 28s linear infinite", transformOrigin: "180px 150px" }} />
                  <circle cx="180" cy="150" r="75" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4"
                    style={{ animation: "lg-spin-rev 20s linear infinite", transformOrigin: "180px 150px" }} />

                  {/* Center: Dashboard */}
                  <circle cx="180" cy="150" r="40" fill="var(--color-accent)" fillOpacity="0.08" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.3" />
                  <text x="180" y="144" textAnchor="middle" className="fill-foreground" fontSize="16">🎫</text>
                  <text x="180" y="162" textAnchor="middle" className="fill-accent" fontSize="7" fontWeight="700" letterSpacing="1">DASHBOARD</text>

                  {/* Feature nodes */}
                  {[
                    { cx: 180, cy: 35, label: "Search", emoji: "🔍", color: "#60a5fa" },
                    { cx: 305, cy: 90, label: "Book", emoji: "📋", color: "#10b981" },
                    { cx: 305, cy: 215, label: "Vouchers", emoji: "🎟️", color: "#f59e0b" },
                    { cx: 180, cy: 265, label: "Analytics", emoji: "📊", color: "#a78bfa" },
                    { cx: 55, cy: 215, label: "AI Agent", emoji: "🤖", color: "#06b6d4" },
                    { cx: 55, cy: 90, label: "Groups", emoji: "👥", color: "#ec4899" },
                  ].map((node, i) => (
                    <g key={i} style={{ animation: `lg-breathe 4s ease-in-out ${i * 0.3}s infinite` }}>
                      <line x1={node.cx} y1={node.cy} x2="180" y2="150" stroke={node.color} strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 3" />
                      <circle cx={node.cx} cy={node.cy} r="24" fill={node.color} fillOpacity="0.07" stroke={node.color} strokeWidth="0.8" strokeOpacity="0.3" />
                      <text x={node.cx} y={node.cy - 2} textAnchor="middle" fontSize="14">{node.emoji}</text>
                      <text x={node.cx} y={node.cy + 14} textAnchor="middle" className="fill-muted" fontSize="6.5" fontWeight="600">{node.label}</text>
                    </g>
                  ))}

                  {/* Orbiting dots */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <circle key={`o-${i}`} cx="180" cy="30" r="2.5"
                      fill={["#60a5fa", "#10b981", "#f59e0b", "#a78bfa", "#06b6d4", "#ec4899"][i]}
                      fillOpacity="0.6"
                      style={{ animation: "lg-spin 28s linear infinite", transformOrigin: "180px 150px", transform: `rotate(${deg}deg)` }} />
                  ))}

                  <style>{`
                    @keyframes lg-spin { to { transform: rotate(360deg) } }
                    @keyframes lg-spin-rev { to { transform: rotate(-360deg) } }
                    @keyframes lg-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
                  `}</style>
                </svg>
              </div>

              {/* Feature highlights */}
              <div className="max-w-md mx-auto text-center">
                <h2 className="text-xl font-extrabold tracking-tight">Your B2B City Access Platform</h2>
                <p className="mt-2 text-[13px] text-muted leading-relaxed">
                  Search, book and manage city experiences for your groups — powered by AI and real-time data.
                </p>
                <div className="mt-6 grid grid-cols-3 gap-3">
                  {[
                    { value: "300K+", label: "Experiences" },
                    { value: "3,000+", label: "Cities" },
                    { value: "8", label: "AI Agents" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-3.5 text-center shadow-lg">
                      <p className="text-lg font-extrabold text-white">{s.value}</p>
                      <p className="mt-0.5 text-[10px] text-gray-400 uppercase tracking-wider">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
