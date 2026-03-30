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

      {/* Right — photo collage */}
      <div className="hidden flex-1 flex-col bg-gradient-to-br from-blue-50 via-white to-amber-50/30 lg:flex">
        {/* Full-height photo grid */}
        <div className="grid h-full grid-cols-2 grid-rows-3 gap-1.5 p-3">
          {/* Row 1 — tall left, square right */}
          <div className="group relative row-span-2 overflow-hidden rounded-2xl">
            <img src="/images/partners-hero.jpg" alt="VIP group at Rijksmuseum" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">Museums</span>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl">
            <img src="https://cdn.prod.website-files.com/6690fa96f0b41bbabcfbee64/68e50425db84cd19c37464bf_Business_events_AMAZE.jpg" alt="AMAZE Amsterdam" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">Attractions</span>
            </div>
          </div>

          {/* Row 2 right — canal cruise */}
          <div className="group relative overflow-hidden rounded-2xl">
            <img src="/images/partners-canal.jpg" alt="Canal cruise Amsterdam" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">Canal Cruises</span>
            </div>
          </div>

          {/* Row 3 — Hard Rock + Tulips */}
          <div className="group relative overflow-hidden rounded-2xl">
            <img src="https://app.thefeedfactory.nl/api/assets/5ff88131de7e8633a4aa65eb/e1f07ea8-bee1-447b-8bdf-6e72c9cc93f5.jpg" alt="Hard Rock Cafe" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">Restaurants</span>
            </div>
          </div>
          <div className="group relative overflow-hidden rounded-2xl">
            <img src="/images/partners-tulips.jpg" alt="Tulip fields tour" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            <div className="absolute bottom-3 left-3">
              <span className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium text-white backdrop-blur-sm">Day Trips</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-center gap-6 border-t border-border/30 bg-white/50 px-6 py-3 backdrop-blur-sm">
          <div className="text-center">
            <p className="text-lg font-bold text-accent">75+</p>
            <p className="text-[10px] text-muted">Venues</p>
          </div>
          <div className="h-6 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-lg font-bold text-accent">2</p>
            <p className="text-[10px] text-muted">Cities</p>
          </div>
          <div className="h-6 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-lg font-bold text-accent">B2B</p>
            <p className="text-[10px] text-muted">Rates</p>
          </div>
          <div className="h-6 w-px bg-border/40" />
          <div className="text-center">
            <p className="text-lg font-bold text-accent">AI</p>
            <p className="text-[10px] text-muted">Powered</p>
          </div>
        </div>
      </div>
    </div>
  );
}
