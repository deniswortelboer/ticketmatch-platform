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

      {/* Right — animated visual */}
      <div className="hidden flex-1 items-center justify-center bg-gradient-to-br from-blue-50 via-white to-amber-50/30 lg:flex">
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes tm-spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          @keyframes tm-spin-rev { from { transform: rotate(360deg); } to { transform: rotate(0deg); } }
          @keyframes tm-pulse { 0%, 100% { opacity: 0.3; } 50% { opacity: 0.8; } }
          @keyframes tm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        ` }} />
        <div className="max-w-md px-8">
          {/* Animated infographic */}
          <svg viewBox="0 0 400 400" fill="none" className="mx-auto mb-8 w-full max-w-[320px]">
            {/* Outer ring */}
            <circle cx="200" cy="200" r="180" stroke="#2563eb" strokeWidth="0.75" strokeDasharray="6 4" opacity="0.1" style={{ transformOrigin: '200px 200px', animation: 'tm-spin 28s linear infinite' }} />
            {/* Middle ring */}
            <circle cx="200" cy="200" r="140" stroke="#f59e0b" strokeWidth="0.75" strokeDasharray="4 5" opacity="0.1" style={{ transformOrigin: '200px 200px', animation: 'tm-spin-rev 22s linear infinite' }} />
            {/* Inner ring */}
            <circle cx="200" cy="200" r="100" stroke="#10b981" strokeWidth="0.75" strokeDasharray="3 4" opacity="0.1" style={{ transformOrigin: '200px 200px', animation: 'tm-spin 18s linear infinite' }} />

            {/* Center — TM logo */}
            <circle cx="200" cy="200" r="50" fill="url(#regGrad)" />
            <text x="200" y="194" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">Ticket</text>
            <text x="200" y="212" textAnchor="middle" fill="white" fontSize="14" fontWeight="bold" fontFamily="system-ui">Match.ai</text>

            {/* Feature nodes */}
            {/* 75+ Venues */}
            <circle cx="200" cy="30" r="32" fill="white" stroke="#2563eb" strokeWidth="1" />
            <text x="200" y="27" textAnchor="middle" fill="#2563eb" fontSize="14" fontWeight="bold">75+</text>
            <text x="200" y="42" textAnchor="middle" fill="#6b7280" fontSize="8">Venues</text>

            {/* B2B Rates */}
            <circle cx="365" cy="130" r="30" fill="white" stroke="#f59e0b" strokeWidth="1" />
            <text x="365" y="127" textAnchor="middle" fill="#d97706" fontSize="12" fontWeight="bold">B2B</text>
            <text x="365" y="141" textAnchor="middle" fill="#6b7280" fontSize="8">Rates</text>

            {/* Dashboard */}
            <circle cx="370" cy="280" r="28" fill="white" stroke="#10b981" strokeWidth="1" />
            <text x="370" y="278" textAnchor="middle" fontSize="16">📊</text>
            <text x="370" y="293" textAnchor="middle" fill="#6b7280" fontSize="7">Dashboard</text>

            {/* Itinerary */}
            <circle cx="200" cy="370" r="30" fill="white" stroke="#8b5cf6" strokeWidth="1" />
            <text x="200" y="368" textAnchor="middle" fontSize="16">📋</text>
            <text x="200" y="383" textAnchor="middle" fill="#6b7280" fontSize="7">Itinerary</text>

            {/* Support */}
            <circle cx="30" cy="280" r="28" fill="white" stroke="#ec4899" strokeWidth="1" />
            <text x="30" y="278" textAnchor="middle" fontSize="16">💬</text>
            <text x="30" y="293" textAnchor="middle" fill="#6b7280" fontSize="7">Support</text>

            {/* AI */}
            <circle cx="35" cy="130" r="30" fill="white" stroke="#0891b2" strokeWidth="1" />
            <text x="35" y="128" textAnchor="middle" fontSize="16">🤖</text>
            <text x="35" y="143" textAnchor="middle" fill="#6b7280" fontSize="8">AI Agent</text>

            {/* Connection lines */}
            <line x1="200" y1="62" x2="200" y2="150" stroke="#2563eb" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
            <line x1="335" y1="138" x2="250" y2="185" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
            <line x1="342" y1="272" x2="245" y2="220" stroke="#10b981" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
            <line x1="200" y1="340" x2="200" y2="250" stroke="#8b5cf6" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
            <line x1="58" y1="272" x2="155" y2="220" stroke="#ec4899" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />
            <line x1="65" y1="138" x2="150" y2="185" stroke="#0891b2" strokeWidth="0.5" strokeDasharray="3 3" opacity="0.2" />

            {/* Pulsing dots */}
            <circle cx="200" cy="106" r="3" fill="#2563eb" style={{ animation: 'tm-pulse 2s ease-in-out infinite' }} />
            <circle cx="292" cy="162" r="2.5" fill="#f59e0b" style={{ animation: 'tm-pulse 2s ease-in-out 0.4s infinite' }} />
            <circle cx="294" cy="246" r="2.5" fill="#10b981" style={{ animation: 'tm-pulse 2s ease-in-out 0.8s infinite' }} />
            <circle cx="200" cy="295" r="3" fill="#8b5cf6" style={{ animation: 'tm-pulse 2s ease-in-out 1.2s infinite' }} />
            <circle cx="106" cy="246" r="2.5" fill="#ec4899" style={{ animation: 'tm-pulse 2s ease-in-out 1.6s infinite' }} />
            <circle cx="108" cy="162" r="2.5" fill="#0891b2" style={{ animation: 'tm-pulse 2s ease-in-out 2s infinite' }} />

            {/* Floating sparkles */}
            <circle cx="310" cy="60" r="2" fill="#93c5fd" style={{ animation: 'tm-float 3s ease-in-out infinite' }} />
            <circle cx="90" cy="340" r="1.5" fill="#a7f3d0" style={{ animation: 'tm-float 4s ease-in-out 1s infinite' }} />
            <circle cx="340" cy="350" r="1.5" fill="#c4b5fd" style={{ animation: 'tm-float 3.5s ease-in-out 0.5s infinite' }} />

            <defs>
              <radialGradient id="regGrad"><stop offset="0%" stopColor="#3b82f6" /><stop offset="100%" stopColor="#1e40af" /></radialGradient>
            </defs>
          </svg>

          <h2 className="text-center text-xl font-bold tracking-tight">
            Everything you need for group travel
          </h2>
          <p className="mt-2 text-center text-sm text-muted">
            75+ venues, B2B rates, AI-powered itineraries and dedicated support — all in one platform.
          </p>
        </div>
      </div>
    </div>
  );
}
