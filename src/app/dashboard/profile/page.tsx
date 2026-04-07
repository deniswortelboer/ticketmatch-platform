"use client";

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

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userId, setUserId] = useState("");
  const [companyId, setCompanyId] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [companyType, setCompanyType] = useState("");
  const [phone, setPhone] = useState("");
  const [kvkNumber, setKvkNumber] = useState("");
  const [vatNumber, setVatNumber] = useState("");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    const supabase = createClient();
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select(
          "id, full_name, email, role, company_id, companies(id, name, company_type, phone, kvk_number, vat_number)"
        )
        .eq("id", user.id)
        .single();

      if (profile) {
        setUserId(profile.id);
        setFullName(profile.full_name || "");
        setEmail(profile.email || "");
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
          setCompanyName(companies.name || "");
          setCompanyType(companies.company_type || "");
          setPhone(companies.phone || "");
          setKvkNumber(companies.kvk_number || "");
          setVatNumber(companies.vat_number || "");
        }
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);

    const res = await fetch("/api/profile", {
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
        fullName,
        email,
        role,
      }),
    });

    setSaving(false);
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Company Profile</h1>
        <p className="mt-1 text-sm text-muted">
          Manage your company information and billing details.
        </p>
      </div>

      <div className="space-y-6">
        {/* Company info */}
        <div className="rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">Company Information</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Company name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Company type
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
                VAT number
              </label>
              <input
                type="text"
                value={vatNumber}
                onChange={(e) => setVatNumber(e.target.value)}
                placeholder="NL123456789B01"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-6 text-lg font-semibold">Primary Contact</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-sm font-medium">
                Full name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+31 6 1234 5678"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium">Role</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Operations Manager"
                className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3">
          {saved && (
            <span className="text-sm font-medium text-green-600">
              Changes saved!
            </span>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-foreground px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </div>
    </>
  );
}
