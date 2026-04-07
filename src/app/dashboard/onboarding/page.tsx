"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const companyTypes = [
  { value: "tour-operator", label: "Tour Operator" },
  { value: "travel-agency", label: "Travel Agency / OTA" },
  { value: "dmc", label: "DMC (Destination Management)" },
  { value: "mice", label: "MICE / Event Agency" },
  { value: "corporate", label: "Corporate Travel" },
  { value: "cruise", label: "Cruise Line" },
  { value: "other", label: "Other" },
];

const groupVolumes = [
  "1–10 groups per year",
  "10–50 groups per year",
  "50–200 groups per year",
  "200+ groups per year",
];

const cities = [
  "Amsterdam",
  "Rotterdam",
  "The Hague",
  "Utrecht",
  "Brussels",
  "Antwerp",
  "Paris",
  "London",
  "Berlin",
  "Barcelona",
];

export default function OnboardingPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const [userId, setUserId] = useState("");
  const [companyId, setCompanyId] = useState("");

  // Step 1: Company
  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [phone, setPhone] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");
  const [groupVolume, setGroupVolume] = useState("");

  // Step 2: Contact (pre-filled from Google)
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  // Step 3: Interests
  const [selectedCities, setSelectedCities] = useState<string[]>([]);

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/auth/login");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, role, company_id, companies(id, name, company_type, phone, kvk_number, vat_number)"
        )
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserId(profile.id);
        setFullName(profile.full_name || user.user_metadata?.full_name || "");
        setEmail(profile.email || user.email || "");
        setRole(profile.role || "");

        const companies = profile.companies as unknown as {
          id: string;
          name: string;
          company_type: string;
          phone: string;
          kvk_number: string;
          vat_number: string;
        } | null;

        if (companies) {
          setCompanyId(companies.id);
          // Don't pre-fill the auto-generated company name
          if (companies.name && !companies.name.endsWith("'s Company")) {
            setCompanyName(companies.name);
          }
          if (companies.company_type && companies.company_type !== "unknown") {
            setCompanyType(companies.company_type);
          }
          setPhone(companies.phone || "");
          setKvkNumber(companies.kvk_number || "");
          setVatNumber(companies.vat_number || "");
        }
      }

      setLoading(false);
    };
    load();
  }, [router]);

  const toggleCity = (city: string) => {
    setSelectedCities((prev) =>
      prev.includes(city) ? prev.filter((c) => c !== city) : [...prev, city]
    );
  };

  const handleSave = async () => {
    setSaving(true);

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        companyId,
        userId,
        companyName,
        companyType,
        phone,
        kvkNumber,
        vatNumber,
        groupVolume,
        interestedCities: selectedCities,
        fullName,
        email,
        role,
      }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error || data.details || `Save failed (${res.status})`);
      setSaving(false);
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl py-4">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-accent/10">
          <svg
            width="28"
            height="28"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-accent"
          >
            <path d="M3 21h18" />
            <path d="M5 21V7l7-4 7 4v14" />
            <path d="M9 21v-6h6v6" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome to TicketMatch
        </h1>
        <p className="mt-2 text-sm text-muted">
          Tell us about your company so we can tailor your experience.
        </p>
      </div>

      {/* Steps indicator */}
      <div className="mb-8 flex items-center justify-center gap-2">
        {[
          { n: 1, label: "Company" },
          { n: 2, label: "Contact" },
          { n: 3, label: "Interests" },
        ].map(({ n, label }) => (
          <div key={n} className="flex items-center gap-2">
            <button
              onClick={() => setStep(n)}
              className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                n === step
                  ? "bg-accent text-white"
                  : n < step
                    ? "bg-accent/20 text-accent"
                    : "bg-gray-100 text-muted"
              }`}
            >
              {n < step ? (
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : (
                n
              )}
            </button>
            <span
              className={`hidden text-xs font-medium sm:inline ${n === step ? "text-accent" : "text-muted"}`}
            >
              {label}
            </span>
            {n < 3 && <div className="mx-2 h-px w-8 bg-border" />}
          </div>
        ))}
      </div>

      {/* Step 1: Company */}
      {step === 1 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold">Company Information</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Company name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="e.g. Singapore Tours Pte Ltd"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Company type <span className="text-red-400">*</span>
                </label>
                <select
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                >
                  <option value="">Select type...</option>
                  {companyTypes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Phone number
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+65 1234 5678"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  KVK / Chamber of Commerce
                </label>
                <input
                  type="text"
                  value={kvkNumber}
                  onChange={(e) => setKvkNumber(e.target.value)}
                  placeholder="12345678"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  VAT / Tax number
                </label>
                <input
                  type="text"
                  value={vatNumber}
                  onChange={(e) => setVatNumber(e.target.value)}
                  placeholder="e.g. NL123456789B01"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-3 block text-sm font-medium">
                  Estimated group volume per year
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {groupVolumes.map((v) => (
                    <button
                      key={v}
                      type="button"
                      onClick={() => setGroupVolume(v)}
                      className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                        groupVolume === v
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-white text-muted hover:border-gray-300"
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!companyName || !companyType}
              className="rounded-xl bg-foreground px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Contact */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6">
            <h2 className="mb-6 text-lg font-semibold">Contact Person</h2>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Full name <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">
                  Email <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1.5 block text-sm font-medium">
                  Your role
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  placeholder="e.g. Operations Manager, Product Manager, CEO"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted transition-all hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={() => setStep(3)}
              disabled={!fullName || !email}
              className="rounded-xl bg-foreground px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Interests */}
      {step === 3 && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-border/60 bg-white p-6">
            <h2 className="mb-2 text-lg font-semibold">
              Which cities interest you?
            </h2>
            <p className="mb-6 text-sm text-muted">
              Select the destinations you want to book for your groups.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {cities.map((city) => (
                <button
                  key={city}
                  type="button"
                  onClick={() => toggleCity(city)}
                  className={`rounded-xl border px-4 py-3 text-sm font-medium transition-all ${
                    selectedCities.includes(city)
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-white text-muted hover:border-gray-300"
                  }`}
                >
                  {selectedCities.includes(city) && (
                    <span className="mr-1.5">&#10003;</span>
                  )}
                  {city}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl border border-accent/20 bg-accent/5 p-6">
            <h3 className="mb-3 text-sm font-semibold">Summary</h3>
            <div className="space-y-1.5 text-sm text-muted">
              <p>
                <span className="font-medium text-foreground">Company:</span>{" "}
                {companyName} (
                {companyTypes.find((t) => t.value === companyType)?.label ||
                  companyType}
                )
              </p>
              <p>
                <span className="font-medium text-foreground">Contact:</span>{" "}
                {fullName} — {email}
              </p>
              {role && (
                <p>
                  <span className="font-medium text-foreground">Role:</span>{" "}
                  {role}
                </p>
              )}
              {selectedCities.length > 0 && (
                <p>
                  <span className="font-medium text-foreground">Cities:</span>{" "}
                  {selectedCities.join(", ")}
                </p>
              )}
              {groupVolume && (
                <p>
                  <span className="font-medium text-foreground">Volume:</span>{" "}
                  {groupVolume}
                </p>
              )}
            </div>
          </div>

          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 p-4 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-between">
            <button
              onClick={() => setStep(2)}
              className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-muted transition-all hover:bg-gray-50"
            >
              Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-xl bg-accent px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? "Saving..." : "Complete Setup"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
