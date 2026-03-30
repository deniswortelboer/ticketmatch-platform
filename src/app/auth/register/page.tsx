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
      // 2. Create company record
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .insert({
          name: form.companyName,
          company_type: form.companyType,
          phone: form.phone,
          message: form.message,
        })
        .select()
        .single();

      if (companyError) {
        setError(companyError.message);
        setLoading(false);
        return;
      }

      // 3. Create profile linked to user and company
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: authData.user.id,
          company_id: company.id,
          full_name: form.contactName,
          email: form.email,
          role: "owner",
        });

      if (profileError) {
        setError(profileError.message);
        setLoading(false);
        return;
      }

      // 4. Send to HubSpot (non-blocking — don't fail registration if HubSpot fails)
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

          <h1 className="text-2xl font-bold tracking-tight">Request Access</h1>
          <p className="mt-2 text-sm text-muted">
            Tell us about your company and we&apos;ll set up your B2B account.
          </p>

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
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
      <div className="hidden flex-1 flex-col overflow-y-auto bg-gradient-to-br from-blue-50 via-white to-amber-50/30 lg:flex">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes reg-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes reg-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
        ` }} />

        {/* Photo strip — 4 venue photos */}
        <div className="grid grid-cols-4 gap-1 p-3 pb-0">
          <div className="group relative h-24 overflow-hidden rounded-xl">
            <img src="/images/register-museum.jpg" alt="Museum experience" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">Museums</span>
          </div>
          <div className="group relative h-24 overflow-hidden rounded-xl">
            <img src="/images/register-dining.jpg" alt="Group dining" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">Dining</span>
          </div>
          <div className="group relative h-24 overflow-hidden rounded-xl">
            <img src="/images/register-attraction.jpg" alt="Immersive attraction" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">Attractions</span>
          </div>
          <div className="group relative h-24 overflow-hidden rounded-xl">
            <img src="/images/partners-canal.jpg" alt="Canal cruise" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span className="absolute bottom-1.5 left-1.5 rounded-full bg-white/20 px-1.5 py-0.5 text-[8px] font-medium text-white backdrop-blur-sm">Cruises</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col justify-center px-10 py-6">
          <h2 className="text-xl font-bold tracking-tight">
            One platform for all your<br /><span className="text-accent">group travel needs.</span>
          </h2>
          <p className="mt-2 text-[13px] leading-relaxed text-muted">
            TicketMatch.ai gives tour operators and travel agencies access to 75+ venues at exclusive B2B rates — with AI-powered tools to build itineraries, manage groups and book instantly.
          </p>

          {/* Value props with mini animated SVGs */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: "75+ Venues", desc: "Museums, attractions & more", color: "#2563eb", from: "#3b82f6", to: "#1d4ed8" },
              { label: "B2B Rates", desc: "Up to 25% below retail", color: "#f59e0b", from: "#fbbf24", to: "#d97706" },
              { label: "AI Itineraries", desc: "Smart trip suggestions", color: "#10b981", from: "#34d399", to: "#059669" },
              { label: "One Dashboard", desc: "Book, track & manage", color: "#8b5cf6", from: "#a78bfa", to: "#7c3aed" },
            ].map((item, i) => (
              <div key={item.label} className="flex items-center gap-2.5 rounded-xl border border-border/40 bg-white p-2.5 shadow-sm">
                <svg viewBox="0 0 40 40" fill="none" className="h-9 w-9 shrink-0">
                  <circle cx="20" cy="20" r="18" stroke={item.color} strokeWidth="0.5" strokeDasharray="3 2" opacity="0.2" style={{ transformOrigin: '20px 20px', animation: `reg-spin ${16 + i * 4}s linear infinite` }} />
                  <circle cx="20" cy="20" r="12" fill={`url(#regG${i})`} />
                  <circle cx="20" cy="2" r="1.5" fill={item.color} style={{ animation: 'reg-pulse 2s ease-in-out infinite' }} />
                  <circle cx="38" cy="20" r="1" fill={item.color} style={{ animation: `reg-pulse 2s ease-in-out ${0.5 + i * 0.3}s infinite` }} />
                  <defs><radialGradient id={`regG${i}`}><stop offset="0%" stopColor={item.from} /><stop offset="100%" stopColor={item.to} /></radialGradient></defs>
                </svg>
                <div>
                  <p className="text-[11px] font-semibold">{item.label}</p>
                  <p className="text-[10px] text-muted">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust line */}
          <div className="mt-6 flex items-center gap-3 rounded-xl bg-accent/5 px-4 py-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
              <path d="M9 12l2 2 4-4" /><path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
            </svg>
            <p className="text-[11px] text-muted"><span className="font-semibold text-foreground">Free to join</span> — no upfront costs, no commitment.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
