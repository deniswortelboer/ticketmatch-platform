"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
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
      const regRes = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: authData.user.id,
          companyName: form.companyName,
          companyType: form.companyType,
          phone: form.phone,
          message: form.message,
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

      // 3. Send to HubSpot (non-blocking — don't fail registration if HubSpot fails)
      fetch("/api/hubspot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName: form.companyName,
          contactName: form.contactName,
          email: form.email,
          phone: form.phone,
          companyType: form.companyType,
        }),
      }).catch(() => {}); // Silent fail — HubSpot is secondary

      router.push("/dashboard");
    }

    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left — form */}
      <div className="flex flex-1 flex-col overflow-y-auto px-6 pt-10 pb-12 lg:px-20">
        <div className="mx-auto w-full max-w-md">
          <Link href="/" className="mb-8 flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-blue-800">
              <span className="text-sm font-bold text-white">TM</span>
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Ticket<span className="text-accent">Match</span>
              <span className="text-muted">.ai</span>
            </span>
          </Link>

          <h1 className="text-2xl font-bold tracking-tight">Request Access</h1>
          <p className="mt-2 text-sm text-muted">
            Tell us about your company and we&apos;ll set up your B2B account.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
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
              Sign up with Google
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
              Sign up with Microsoft
            </button>
          </div>

          {/* Divider */}
          <div className="mt-6 flex items-center gap-4">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted">or register with email</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <form className="mt-5 space-y-5" onSubmit={handleSubmit}>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Company name</label>
                <input
                  type="text"
                  value={form.companyName}
                  onChange={(e) => update("companyName", e.target.value)}
                  placeholder="Your company"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Contact name</label>
                <input
                  type="text"
                  value={form.contactName}
                  onChange={(e) => update("contactName", e.target.value)}
                  placeholder="Full name"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Work email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="you@company.com"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => update("phone", e.target.value)}
                placeholder="+31 6 1234 5678"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                placeholder="Min. 6 characters"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                required
                minLength={6}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium">Company type</label>
              <select
                value={form.companyType}
                onChange={(e) => update("companyType", e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
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
              <label className="mb-1.5 block text-sm font-medium">
                Tell us about your needs{" "}
                <span className="text-muted">(optional)</span>
              </label>
              <textarea
                value={form.message}
                onChange={(e) => update("message", e.target.value)}
                placeholder="E.g. group sizes, destinations of interest, current booking process..."
                rows={3}
                className="w-full rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-12 w-full rounded-xl bg-foreground text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Creating account..." : "Create Account"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted">
            Already have an account?{" "}
            <Link href="/auth/login" className="font-medium text-accent hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </div>

      {/* Right — visual showcase */}
      <div className="hidden flex-1 flex-col overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-amber-50/30 px-6 pt-10 pb-12 lg:flex lg:px-10">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes reg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes reg-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes reg-pulse { 0%, 100% { opacity: 0.25; } 50% { opacity: 0.75; } }
        ` }} />

        <div className="mx-auto w-full max-w-lg space-y-5">
          {/* 6 photo grid — compact */}
          <div className="grid grid-cols-3 gap-1.5">
            {[
              { src: "/images/register-museum.jpg", alt: "Museum experience", label: "Museums" },
              { src: "/images/register-dining.jpg", alt: "Group dining", label: "Dining" },
              { src: "/images/register-attraction.jpg", alt: "Immersive attraction", label: "Attractions" },
              { src: "/images/partners-canal.jpg", alt: "Canal cruise", label: "Cruises" },
              { src: "/images/partners-tulips.jpg", alt: "Tulip fields", label: "Day Trips" },
              { src: "/images/hero-amsterdam.jpg", alt: "Amsterdam cityscape", label: "City Tours" },
            ].map((photo) => (
              <div key={photo.label} className="group relative h-[85px] overflow-hidden rounded-xl">
                <img src={photo.src} alt={photo.alt} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/20 px-2 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">{photo.label}</span>
              </div>
            ))}
          </div>

          {/* 6 value prop blocks with animated SVGs */}
          <div className="grid grid-cols-2 gap-2.5">
            {[
              { label: "75+ Venues", desc: "Museums, attractions, restaurants and more across multiple cities", color: "#2563eb", from: "#3b82f6", to: "#1d4ed8", icon: "M3 21h18M3 7l9-4 9 4M6 7v14M18 7v14" },
              { label: "Exclusive B2B Rates", desc: "Up to 25% below retail pricing — only for verified travel professionals", color: "#f59e0b", from: "#fbbf24", to: "#d97706", icon: "M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" },
              { label: "AI Trip Planner", desc: "Describe your group and let our AI suggest the perfect itinerary", color: "#10b981", from: "#34d399", to: "#059669", icon: "M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" },
              { label: "Itinerary Builder", desc: "Create day-by-day plans, drag and drop venues, export to PDF", color: "#8b5cf6", from: "#a78bfa", to: "#7c3aed", icon: "M3 4h18v18H3zM16 2v4M8 2v4M3 10h18M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" },
              { label: "Group Management", desc: "Upload guest lists via CSV, generate QR codes and vouchers per person", color: "#0891b2", from: "#22d3ee", to: "#0891b2", icon: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" },
              { label: "Live Dashboard", desc: "Track all bookings, invoices and supplier data from one place", color: "#e11d48", from: "#fb7185", to: "#e11d48", icon: "M3 3v18h18M7 17l4-6 4 3 6-8" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-start gap-2.5 rounded-xl border border-border/40 bg-white p-3 shadow-sm">
                <svg viewBox="0 0 44 44" fill="none" className="mt-0.5 h-10 w-10 shrink-0">
                  <circle cx="22" cy="22" r="20" stroke={item.color} strokeWidth="0.5" strokeDasharray="4 3" opacity="0.15" style={{ transformOrigin: '22px 22px', animation: `${i % 2 === 0 ? 'reg-spin' : 'reg-spin-rev'} ${18 + i * 3}s linear infinite` }} />
                  <circle cx="22" cy="22" r="14" fill={`url(#rG${i})`} />
                  <g transform="translate(14, 14) scale(0.67)">
                    <path d={item.icon} stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                  </g>
                  <circle cx="22" cy="2" r="1.5" fill={item.color} style={{ animation: `reg-pulse 2.5s ease-in-out ${i * 0.4}s infinite` }} />
                  <circle cx="42" cy="22" r="1" fill={item.color} style={{ animation: `reg-pulse 2.5s ease-in-out ${0.8 + i * 0.3}s infinite` }} />
                  <defs><radialGradient id={`rG${i}`}><stop offset="0%" stopColor={item.from} /><stop offset="100%" stopColor={item.to} /></radialGradient></defs>
                </svg>
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold">{item.label}</p>
                  <p className="text-[10px] leading-snug text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* About text + trust */}
          <div className="rounded-2xl bg-foreground/[0.03] p-6">
            <h3 className="text-[15px] font-bold">What is TicketMatch.ai?</h3>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
              TicketMatch.ai is the B2B booking platform built exclusively for tour operators, DMCs and travel agencies. We aggregate 75+ museums, attractions, dining experiences, canal cruises and day trips from multiple suppliers into one powerful dashboard — all at exclusive group rates that are up to 25% below retail.
            </p>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
              Whether you&apos;re organizing a corporate incentive trip to Amsterdam, a school group visiting Brussels, or a luxury tour through the Dutch countryside — TicketMatch gives you the tools to build itineraries, manage guest lists, and book everything in one place. Our AI assistant helps you find the perfect venues for any group size and budget.
            </p>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
              <span className="font-semibold text-foreground">How does it work?</span> Create your free account, browse our curated venue catalog, build an itinerary with our drag-and-drop planner or let our AI suggest the perfect route for your group. Once you&apos;re ready, submit your booking request and receive confirmed availability and invoicing within 24 hours.
            </p>
            <p className="mt-2.5 text-[12px] leading-relaxed text-muted">
              <span className="font-semibold text-foreground">Who is it for?</span> Tour operators, travel agencies, DMCs, MICE agencies, corporate travel managers, and anyone who books group experiences professionally. Whether you handle 10 bookings a year or 500 — TicketMatch scales with your business and saves you hours of manual supplier communication.
            </p>
            <div className="mt-4 flex items-center gap-4 border-t border-border/30 pt-3">
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                <span className="text-[10px] font-medium">Free to join</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                <span className="text-[10px] font-medium">No commitment</span>
              </div>
              <div className="flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round"><path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" /></svg>
                <span className="text-[10px] font-medium">24h activation</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
