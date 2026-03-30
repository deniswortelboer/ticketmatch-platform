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

      {/* Right — visual story */}
      <div className="hidden flex-1 flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50/30 px-12 lg:flex">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes tm-pulse-subtle { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
          @keyframes tm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-4px); } }
        ` }} />

        {/* Hero image */}
        <div className="relative mb-8 w-full max-w-md overflow-hidden rounded-2xl shadow-xl">
          <img src="/images/partners-hero.jpg" alt="VIP group travel" className="h-48 w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-4 left-4">
            <p className="text-xs font-medium text-white/70">Your groups, our platform</p>
            <p className="text-lg font-bold text-white">Book smarter. Save more.</p>
          </div>
        </div>

        {/* Value props — clear and visual */}
        <div className="w-full max-w-md space-y-3">
          {[
            { icon: "🏛️", title: "75+ venues", desc: "Museums, attractions & experiences in Amsterdam and Brussels", color: "bg-blue-50 text-blue-600" },
            { icon: "💰", title: "Exclusive B2B rates", desc: "Up to 25% lower than retail — only for travel professionals", color: "bg-amber-50 text-amber-600" },
            { icon: "📋", title: "Itinerary builder", desc: "Create day-by-day plans, upload guest lists via CSV", color: "bg-violet-50 text-violet-600" },
            { icon: "🤖", title: "AI-powered suggestions", desc: "Tell our AI about your group, get instant recommendations", color: "bg-cyan-50 text-cyan-600" },
            { icon: "⚡", title: "One dashboard", desc: "All suppliers, bookings, vouchers and QR codes in one place", color: "bg-emerald-50 text-emerald-600" },
          ].map((item, i) => (
            <div key={item.title} className="flex items-start gap-3 rounded-xl border border-border/40 bg-white p-3.5 shadow-sm transition-all hover:shadow-md" style={{ animation: `tm-float ${3 + i * 0.5}s ease-in-out ${i * 0.3}s infinite` }}>
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-base ${item.color}`}>
                {item.icon}
              </span>
              <div>
                <p className="text-sm font-semibold">{item.title}</p>
                <p className="text-xs text-muted">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-muted">
          Free to join — no upfront costs, no commitment.
        </p>
      </div>
    </div>
  );
}
