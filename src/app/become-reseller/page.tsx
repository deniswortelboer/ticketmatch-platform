"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const CODE_LENGTH = 8;

const benefits = [
  { title: "Earn Revenue", desc: "Generate revenue from every booking made by agencies you bring in", icon: "euro" },
  { title: "Your Own Link", desc: "Unique signup link to share with travel agencies", icon: "link" },
  { title: "Real-time Dashboard", desc: "Track your agencies, bookings and earnings live", icon: "chart" },
  { title: "Zero Investment", desc: "No costs, no risk. We handle everything", icon: "shield" },
];

export default function BecomeResellerPage() {
  const router = useRouter();
  const [step, setStep] = useState<"form" | "code">("form");
  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneCode, setPhoneCode] = useState("+31");
  const [website, setWebsite] = useState("");
  const [motivation, setMotivation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [code, setCode] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !fullName.trim() || !companyName.trim()) return;
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

    setSuccess(`Verification code sent to ${email}`);
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
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
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

    if (data.user) {
      const resellerSlug = companyName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
        .substring(0, 30);

      try {
        await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: data.user.id,
            companyName,
            companyType: "reseller",
            phone: phone ? `${phoneCode} ${phone}` : "",
            contactName: fullName,
            email: email.trim(),
            message: JSON.stringify({
              role: "reseller",
              reseller_slug: resellerSlug,
              website,
              motivation,
              commission_rate: 10,
            }),
          }),
        });
      } catch {
        // Continue anyway
      }
    }

    router.push("/dashboard/reseller");
    router.refresh();
  };

  const inputClass =
    "h-12 w-full rounded-xl border border-border bg-card-bg px-4 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10";

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Header />

      {/* Hero section */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-20 top-10 h-[400px] w-[400px] rounded-full bg-emerald-500/12 blur-[100px]" />
        <div className="pointer-events-none absolute -right-20 top-20 h-[300px] w-[300px] rounded-full bg-cyan-500/10 blur-[80px]" />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)", backgroundSize: "32px 32px" }}
        />

        <div className="relative mx-auto max-w-7xl px-6 py-16 md:py-24">
          <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr]">

            {/* ═══════ LEFT: Form ═══════ */}
            <div className="mx-auto w-full max-w-md">
              {step === "form" ? (
                <>
                  <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-4 py-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[12px] font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-[0.15em]">Reseller Program</span>
                  </div>
                  <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.5rem]">
                    Become a{" "}
                    <span className="bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 bg-clip-text text-transparent">
                      Reseller
                    </span>
                  </h1>
                  <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                    Get your own platform link, bring in travel agencies, and earn commission on every booking.
                  </p>

                  {error && (
                    <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                      {error}
                    </div>
                  )}

                  <form className="mt-6 space-y-4" onSubmit={handleRegister}>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold">Your name</label>
                      <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="John Doe" required className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold">Company / Organization</label>
                      <input type="text" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Your Company" required className={inputClass} />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold">Email address</label>
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required className={inputClass} />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold">Website <span className="text-muted font-normal">(optional)</span></label>
                        <input type="url" value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://..." className={inputClass} />
                      </div>
                      <div>
                        <label className="mb-1.5 block text-[13px] font-semibold">Phone <span className="text-muted font-normal">(optional)</span></label>
                        <div className="flex gap-0">
                          <select
                            value={phoneCode}
                            onChange={(e) => setPhoneCode(e.target.value)}
                            className="h-12 w-[85px] shrink-0 rounded-l-xl border border-r-0 border-border bg-card-bg px-2 text-[13px] outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 appearance-none cursor-pointer"
                          >
                            <option value="+31">🇳🇱 +31</option>
                            <option value="+44">🇬🇧 +44</option>
                            <option value="+1">🇺🇸 +1</option>
                            <option value="+49">🇩🇪 +49</option>
                            <option value="+33">🇫🇷 +33</option>
                            <option value="+34">🇪🇸 +34</option>
                            <option value="+39">🇮🇹 +39</option>
                            <option value="+32">🇧🇪 +32</option>
                            <option value="+43">🇦🇹 +43</option>
                            <option value="+41">🇨🇭 +41</option>
                            <option value="+46">🇸🇪 +46</option>
                            <option value="+45">🇩🇰 +45</option>
                            <option value="+47">🇳🇴 +47</option>
                            <option value="+48">🇵🇱 +48</option>
                            <option value="+351">🇵🇹 +351</option>
                            <option value="+353">🇮🇪 +353</option>
                            <option value="+90">🇹🇷 +90</option>
                            <option value="+61">🇦🇺 +61</option>
                            <option value="+81">🇯🇵 +81</option>
                            <option value="+86">🇨🇳 +86</option>
                            <option value="+91">🇮🇳 +91</option>
                            <option value="+55">🇧🇷 +55</option>
                            <option value="+971">🇦🇪 +971</option>
                            <option value="+966">🇸🇦 +966</option>
                          </select>
                          <input
                            type="tel"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="612 345 678"
                            className="h-12 w-full rounded-r-xl border border-border bg-card-bg px-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="mb-1.5 block text-[13px] font-semibold">Why reseller? <span className="text-muted font-normal">(optional)</span></label>
                      <textarea value={motivation} onChange={(e) => setMotivation(e.target.value)} placeholder="Tell us about your network..." rows={3} className="w-full rounded-xl border border-border bg-card-bg px-4 py-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10 resize-none" />
                    </div>
                    <button
                      type="submit"
                      disabled={loading || !email.trim() || !fullName.trim() || !companyName.trim()}
                      className="h-12 w-full rounded-xl bg-gradient-to-r from-emerald-600 to-green-600 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-emerald-500/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                          Sending code...
                        </span>
                      ) : (
                        "Apply as Reseller"
                      )}
                    </button>
                  </form>

                  <p className="mt-6 text-center text-[13px] text-muted">
                    Already have an account?{" "}
                    <Link href="/auth/login" className="font-semibold text-accent hover:underline">Sign in</Link>
                  </p>
                </>
              ) : (
                <>
                  <button onClick={() => { setStep("form"); setError(""); setCode(Array(CODE_LENGTH).fill("")); }} className="mb-6 flex items-center gap-1.5 text-sm text-muted hover:text-foreground transition-colors">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><polyline points="12 19 5 12 12 5" /></svg>
                    Back
                  </button>

                  <h1 className="text-2xl font-extrabold tracking-tight">Check your email</h1>
                  <p className="mt-2 text-[15px] text-muted">
                    We sent a verification code to <span className="font-semibold text-foreground">{email}</span>
                  </p>

                  {error && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">{error}</div>}
                  {success && !error && <div className="mt-4 rounded-xl border border-green-200 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20 p-3 text-sm text-green-600 dark:text-green-400">{success}</div>}

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
                </>
              )}
            </div>

            {/* ═══════ RIGHT: Benefits + SVG ═══════ */}
            <div className="hidden lg:block">
              {/* Animated SVG */}
              <div className="flex justify-center mb-10">
                <svg viewBox="0 0 360 280" className="w-full max-w-[360px]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="rs-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="rs-line" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" stopOpacity="0.4" />
                      <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
                    </linearGradient>
                  </defs>

                  {/* Background glow */}
                  <circle cx="180" cy="140" r="130" fill="url(#rs-glow)" />

                  {/* Outer ring */}
                  <circle cx="180" cy="140" r="120" fill="none" stroke="url(#rs-line)" strokeWidth="1" strokeDasharray="6 5"
                    style={{ animation: "rs-spin 25s linear infinite", transformOrigin: "180px 140px" }} />

                  {/* Inner ring */}
                  <circle cx="180" cy="140" r="70" fill="none" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4"
                    style={{ animation: "rs-spin-rev 18s linear infinite", transformOrigin: "180px 140px" }} />

                  {/* Center: YOU */}
                  <circle cx="180" cy="140" r="32" fill="#10b981" fillOpacity="0.1" stroke="#10b981" strokeWidth="1.5" strokeOpacity="0.4" />
                  <text x="180" y="135" textAnchor="middle" className="fill-foreground" fontSize="10" fontWeight="800">YOU</text>
                  <text x="180" y="150" textAnchor="middle" fontSize="7" fontWeight="600" fill="#10b981" letterSpacing="0.5">RESELLER</text>

                  {/* Satellite: Agencies */}
                  {[
                    { cx: 180, cy: 30, label: "Agency 1", emoji: "🏢" },
                    { cx: 300, cy: 90, label: "Agency 2", emoji: "🏬" },
                    { cx: 300, cy: 200, label: "Agency 3", emoji: "🏪" },
                    { cx: 180, cy: 250, label: "Agency 4", emoji: "🏛️" },
                    { cx: 60, cy: 200, label: "Agency 5", emoji: "🏗️" },
                    { cx: 60, cy: 90, label: "Agency 6", emoji: "🏠" },
                  ].map((node, i) => (
                    <g key={i} style={{ animation: `rs-breathe 4s ease-in-out ${i * 0.3}s infinite` }}>
                      <line x1={node.cx} y1={node.cy} x2="180" y2="140" stroke="#10b981" strokeWidth="0.5" strokeOpacity="0.15" strokeDasharray="3 3" />
                      <circle cx={node.cx} cy={node.cy} r="22" fill="#10b981" fillOpacity="0.06" stroke="#10b981" strokeWidth="0.8" strokeOpacity="0.3" />
                      <text x={node.cx} y={node.cy - 2} textAnchor="middle" fontSize="12">{node.emoji}</text>
                      <text x={node.cx} y={node.cy + 12} textAnchor="middle" className="fill-muted" fontSize="6" fontWeight="600">{node.label}</text>
                    </g>
                  ))}

                  {/* Flowing commission particles */}
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <circle key={`p-${i}`} r="2.5" fill="#10b981"
                      style={{ animation: `rs-flow${i} 3s ease-in-out ${i * 0.5}s infinite` }} />
                  ))}

                  {/* Orbiting dots */}
                  {[0, 60, 120, 180, 240, 300].map((deg, i) => (
                    <circle key={`o-${i}`} cx="180" cy="20" r="2.5" fill="#10b981" fillOpacity="0.5"
                      style={{ animation: "rs-spin 25s linear infinite", transformOrigin: "180px 140px", transform: `rotate(${deg}deg)` }} />
                  ))}

                  <style>{`
                    @keyframes rs-spin { to { transform: rotate(360deg) } }
                    @keyframes rs-spin-rev { to { transform: rotate(-360deg) } }
                    @keyframes rs-breathe { 0%,100% { transform: scale(1) } 50% { transform: scale(1.05) } }
                    @keyframes rs-flow0 { 0%,100% { cx: 180; cy: 30; opacity: 0 } 50% { cx: 180; cy: 140; opacity: 1 } }
                    @keyframes rs-flow1 { 0%,100% { cx: 300; cy: 90; opacity: 0 } 50% { cx: 180; cy: 140; opacity: 1 } }
                    @keyframes rs-flow2 { 0%,100% { cx: 300; cy: 200; opacity: 0 } 50% { cx: 180; cy: 140; opacity: 1 } }
                    @keyframes rs-flow3 { 0%,100% { cx: 180; cy: 250; opacity: 0 } 50% { cx: 180; cy: 140; opacity: 1 } }
                    @keyframes rs-flow4 { 0%,100% { cx: 60; cy: 200; opacity: 0 } 50% { cx: 180; cy: 140; opacity: 1 } }
                    @keyframes rs-flow5 { 0%,100% { cx: 60; cy: 90; opacity: 0 } 50% { cx: 180; cy: 140; opacity: 1 } }
                  `}</style>
                </svg>
              </div>

              {/* Benefit cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg mx-auto">
                {benefits.map((b) => (
                  <div key={b.title} className="group rounded-2xl border border-card-border bg-card-bg p-5 transition-all hover:shadow-lg hover:shadow-emerald-500/5 hover:border-emerald-500/20 overflow-hidden relative">
                    <div className="absolute top-0 right-0 h-16 w-16 rounded-bl-full bg-gradient-to-bl from-emerald-500 to-green-600 opacity-[0.06] transition-opacity group-hover:opacity-[0.12]" />
                    <div className="relative">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mb-3">
                        {b.icon === "euro" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" /><path d="M12 18V6" /></svg>}
                        {b.icon === "link" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>}
                        {b.icon === "chart" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>}
                        {b.icon === "shield" && <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>}
                      </div>
                      <h3 className="text-sm font-bold">{b.title}</h3>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted">{b.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-2 gap-3 max-w-lg mx-auto sm:grid-cols-2">
                {[
                  { value: "€0", label: "Investment" },
                  { value: "24h", label: "Approval" },
                ].map((s, i) => (
                  <div key={i} className="rounded-xl bg-gradient-to-br from-gray-900 to-gray-800 p-4 text-center shadow-lg">
                    <p className="text-xl font-extrabold text-white">{s.value}</p>
                    <p className="mt-0.5 text-[11px] text-gray-400 uppercase tracking-wider">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
