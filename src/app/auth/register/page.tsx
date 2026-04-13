"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import ImageSlider from "@/components/ui/ImageSlider";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : "";
}

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterPageInner />
    </Suspense>
  );
}

function RegisterPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [affiliateRef, setAffiliateRef] = useState<{ code: string; companyId: string; companyName: string } | null>(null);
  const [phoneCode, setPhoneCode] = useState("+31");

  // Check for affiliate referral code (URL param or cookie)
  useEffect(() => {
    const refCode = searchParams.get("ref") || getCookie("affiliate_ref");
    if (!refCode) return;

    fetch(`/api/affiliate/lookup?code=${encodeURIComponent(refCode)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setAffiliateRef({ code: refCode, companyId: data.id, companyName: data.name });
        }
      })
      .catch(() => {});
  }, [searchParams]);

  // Fetch dynamic Viator images for photo grid
  const [viatorImages, setViatorImages] = useState<Record<string, string[]>>({});
  useEffect(() => {
    fetch("/api/viator-images?categories=museums,food,water,outdoor,tickets,tours&count=6")
      .then((res) => (res.ok ? res.json() : {}))
      .then((data: Record<string, string[]>) => {
        // Deduplicate: ensure no image URL appears in multiple categories
        const used = new Set<string>();
        const deduped: Record<string, string[]> = {};
        for (const cat of Object.keys(data)) {
          deduped[cat] = [];
          for (const url of data[cat] || []) {
            if (!used.has(url)) {
              used.add(url);
              deduped[cat].push(url);
            }
          }
        }
        setViatorImages(deduped);
      })
      .catch(() => {});
  }, []);

  const [form, setForm] = useState({
    companyName: "",
    contactName: "",
    email: "",
    phone: "",
    password: "",
    companyType: "",
    message: "",
  });

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSocialLogin = async (provider: "google" | "azure") => {
    setError("");
    // Ensure affiliate cookie is set before OAuth redirect
    if (affiliateRef) {
      document.cookie = `affiliate_ref=${affiliateRef.code};path=/;max-age=${30 * 24 * 60 * 60};SameSite=Lax`;
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: {
        data: {
          full_name: form.contactName,
          company_name: form.companyName,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      // 2. Create company + profile via server-side API (bypasses RLS)
      // Build message object, include affiliate referral if present
      let messagePayload: string | Record<string, unknown> = form.message;
      if (affiliateRef) {
        const msgObj: Record<string, unknown> = {};
        if (form.message) msgObj.text = form.message;
        msgObj.affiliate_referred_by = affiliateRef.companyId;
        msgObj.affiliate_code = affiliateRef.code;
        messagePayload = msgObj;
      }

      const fullPhone = form.phone ? `${phoneCode} ${form.phone}` : "";

      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          companyName: form.companyName,
          companyType: form.companyType,
          phone: fullPhone,
          message: messagePayload,
          contactName: form.contactName,
          email: form.email,
        }),
      });

      if (!regRes.ok) {
        const regData = await regRes.json();
        setError(regData.error || "Registration failed");
        setLoading(false);
        return;
      }

      // 3. Send to HubSpot (non-blocking)
      fetch("/api/hubspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          contactName: form.contactName,
          email: form.email,
          phone: fullPhone,
          companyType: form.companyType,
        }),
      }).catch(() => {}); // Silent fail

      router.push("/dashboard");
    }

    setLoading(false);
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

        <div className="relative mx-auto max-w-7xl px-6 py-12 md:py-20">
          <div className="grid items-start gap-16 lg:grid-cols-[1fr_1.1fr]">

            {/* ═══════ LEFT: Form ═══════ */}
            <div className="mx-auto w-full max-w-md">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/5 px-4 py-1.5">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[12px] font-semibold text-accent uppercase tracking-[0.15em]">Request Access</span>
              </div>
              <h1 className="text-[2rem] font-extrabold leading-[1.1] tracking-tight md:text-[2.5rem]">
                Join the{" "}
                <span className="bg-gradient-to-r from-accent via-blue-600 to-cyan-500 bg-clip-text text-transparent">
                  ecosystem
                </span>
              </h1>
              <p className="mt-3 text-[15px] leading-[1.7] text-muted">
                Tell us about your company and we&apos;ll set up your B2B account.
              </p>

              {affiliateRef && (
                <div className="mt-4 flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20 p-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-500/10">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-500">
                      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <polyline points="16 11 18 13 22 9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-purple-600 dark:text-purple-400">Referred by {affiliateRef.companyName}</p>
                    <p className="text-[10px] text-purple-500/70">You&apos;ll both benefit from this referral</p>
                  </div>
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-3 text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              {/* Social login buttons */}
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
                  Sign up with Google
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
                  Sign up with Microsoft
                </button>
              </div>

              {/* Divider */}
              <div className="mt-6 flex items-center gap-4">
                <div className="h-px flex-1 bg-border" />
                <span className="text-[12px] text-muted">or register with email</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              <form className="mt-5 space-y-4" onSubmit={handleSubmit}>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold">Company name</label>
                    <input
                      type="text"
                      value={form.companyName}
                      onChange={(e) => update("companyName", e.target.value)}
                      placeholder="Your company"
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-[13px] font-semibold">Contact name</label>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(e) => update("contactName", e.target.value)}
                      placeholder="John Doe"
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Work email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@company.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Phone number</label>
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
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="612 345 678"
                      className="h-12 w-full rounded-r-xl border border-border bg-card-bg px-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    placeholder="Min. 6 characters"
                    className={inputClass}
                    required
                    minLength={6}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">Company type</label>
                  <select
                    value={form.companyType}
                    onChange={(e) => update("companyType", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select type...</option>
                    <option value="tour-operator">Tour Operator</option>
                    <option value="travel-agency">Travel Agency</option>
                    <option value="dmc">DMC (Destination Management Company)</option>
                    <option value="mice">MICE / Event Agency</option>
                    <option value="corporate">Corporate Travel</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-[13px] font-semibold">
                    Tell us about your needs{" "}
                    <span className="text-muted font-normal">(optional)</span>
                  </label>
                  <textarea
                    value={form.message}
                    onChange={(e) => update("message", e.target.value)}
                    placeholder="E.g. group sizes, destinations of interest, current booking process..."
                    rows={3}
                    className="w-full rounded-xl border border-border bg-card-bg px-4 py-3 text-sm outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-accent text-sm font-semibold text-white shadow-lg shadow-accent/25 transition-all hover:shadow-accent/40 hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating account...
                    </span>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </form>

              <p className="mt-6 text-center text-[13px] text-muted">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-semibold text-accent hover:underline">
                  Sign In
                </Link>
              </p>
            </div>

            {/* ═══════ RIGHT: Visual Showcase ═══════ */}
            <div className="hidden lg:block">
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes reg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                @keyframes reg-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
                @keyframes reg-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.75; } }
              ` }} />

              {/* Animated SVG — ecosystem diagram */}
              <div className="flex justify-center mb-10">
                <svg viewBox="0 0 360 300" className="w-full max-w-[420px]" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <radialGradient id="rg-glow" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="var(--color-accent)" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="var(--color-accent)" stopOpacity="0" />
                    </radialGradient>
                    <linearGradient id="rg-ring" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
                      <stop offset="50%" stopColor="#06b6d4" stopOpacity="0.2" />
                      <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.5" />
                    </linearGradient>
                  </defs>

                  <circle cx="180" cy="150" r="130" fill="url(#rg-glow)" />
                  <circle cx="180" cy="150" r="120" fill="none" stroke="url(#rg-ring)" strokeWidth="1" strokeDasharray="6 5"
                    style={{ animation: "reg-spin 28s linear infinite", transformOrigin: "180px 150px" }} />
                  <circle cx="180" cy="150" r="75" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" strokeOpacity="0.2" strokeDasharray="4 4"
                    style={{ animation: "reg-spin-rev 20s linear infinite", transformOrigin: "180px 150px" }} />

                  {/* Center: Ecosystem */}
                  <circle cx="180" cy="150" r="40" fill="var(--color-accent)" fillOpacity="0.08" stroke="var(--color-accent)" strokeWidth="1.5" strokeOpacity="0.3" />
                  <text x="180" y="144" textAnchor="middle" className="fill-foreground" fontSize="16">🌐</text>
                  <text x="180" y="162" textAnchor="middle" className="fill-accent" fontSize="7" fontWeight="700" letterSpacing="1">ECOSYSTEM</text>

                  {/* Feature nodes */}
                  {[
                    { cx: 180, cy: 35, label: "Museums", emoji: "🏛️", color: "#60a5fa" },
                    { cx: 305, cy: 90, label: "Cruises", emoji: "🚢", color: "#10b981" },
                    { cx: 305, cy: 215, label: "Food", emoji: "🍽️", color: "#f59e0b" },
                    { cx: 180, cy: 265, label: "Tours", emoji: "🚶", color: "#a78bfa" },
                    { cx: 55, cy: 215, label: "Activities", emoji: "🎯", color: "#06b6d4" },
                    { cx: 55, cy: 90, label: "Attractions", emoji: "🎡", color: "#ec4899" },
                  ].map((node, i) => (
                    <g key={i} style={{ animation: `reg-pulse 4s ease-in-out ${i * 0.3}s infinite` }}>
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
                      style={{ animation: "reg-spin 28s linear infinite", transformOrigin: "180px 150px", transform: `rotate(${deg}deg)` }} />
                  ))}
                </svg>
              </div>

              {/* 6 photo grid — dynamic Viator images with sliding */}
              <div className="max-w-lg mx-auto grid grid-cols-3 gap-1.5 mb-6">
                {[
                  { key: "museums", fallback: "/images/register-museum.webp", alt: "Museum experience", label: "Museums" },
                  { key: "food", fallback: "/images/register-dining.webp", alt: "Group dining", label: "Dining" },
                  { key: "tickets", fallback: "/images/register-attraction.webp", alt: "Tickets & shows", label: "Tickets" },
                  { key: "water", fallback: "/images/partners-canal.webp", alt: "Canal cruise", label: "Cruises" },
                  { key: "outdoor", fallback: "/images/partners-tulips.webp", alt: "Day trips", label: "Day Trips" },
                  { key: "tours", fallback: "/images/hero-amsterdam.webp", alt: "City tours", label: "City Tours" },
                ].map((photo) => (
                  <div key={photo.label} className="group relative h-[85px] overflow-hidden rounded-xl">
                    <ImageSlider
                      images={viatorImages[photo.key]?.length ? viatorImages[photo.key] : [photo.fallback]}
                      alt={photo.alt}
                      interval={4000}
                    />
                    <div className="absolute inset-0 z-[1] bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                    <span className="absolute bottom-1.5 left-1.5 z-[2] rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">{photo.label}</span>
                  </div>
                ))}
              </div>

              {/* Stats row */}
              <div className="max-w-lg mx-auto grid grid-cols-3 gap-3 mb-6">
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

              {/* Trust indicators — minimal */}
              <div className="max-w-lg mx-auto flex items-center justify-center gap-6">
                {[
                  "Free to join",
                  "No commitment",
                  "24h activation",
                ].map((txt) => (
                  <div key={txt} className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                    <span className="text-[12px] font-semibold">{txt}</span>
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
