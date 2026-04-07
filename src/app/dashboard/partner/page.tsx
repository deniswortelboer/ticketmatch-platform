"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type IntegrationData = {
  api_base_url: string;
  api_key_provided: boolean;
  auth_type: string;
  contact_name: string;
  contact_email: string;
  tech_contact_email: string;
  product_count: string;
  supported_cities: string;
  supports_availability: boolean;
  supports_booking: boolean;
  supports_cancellation: boolean;
  supports_webhooks: boolean;
  sandbox_url: string;
  notes: string;
};

const EMPTY_INTEGRATION: IntegrationData = {
  api_base_url: "",
  api_key_provided: false,
  auth_type: "",
  contact_name: "",
  contact_email: "",
  tech_contact_email: "",
  product_count: "",
  supported_cities: "",
  supports_availability: false,
  supports_booking: false,
  supports_cancellation: false,
  supports_webhooks: false,
  sandbox_url: "",
  notes: "",
};

export default function PartnerPortal() {
  const [company, setCompany] = useState<{ id: string; name: string; supplierType: string }>({ id: "", name: "", supplierType: "" });
  const [integration, setIntegration] = useState<IntegrationData>(EMPTY_INTEGRATION);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, companies(id, name, message)")
        .eq("id", user.id)
        .single();

      const companies = profile?.companies as unknown as { id: string; name: string; message: string } | { id: string; name: string; message: string }[] | null;
      const comp = Array.isArray(companies) ? companies[0] : companies;
      let msg: Record<string, unknown> = {};
      try { msg = comp?.message ? JSON.parse(comp.message) : {}; } catch {}

      setCompany({
        id: comp?.id || "",
        name: comp?.name || "",
        supplierType: (msg.supplier_type as string) || "supplier",
      });

      // Load integration data
      const intData = (msg.integration as IntegrationData) || EMPTY_INTEGRATION;
      setIntegration({ ...EMPTY_INTEGRATION, ...intData });
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/partner/integration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId: company.id, integration }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    setSaving(false);
  };

  // Calculate progress
  const checklist = [
    { key: "account", label: "Account created", done: true },
    { key: "docs", label: "API documentation reviewed", done: true },
    { key: "contact", label: "Technical contact provided", done: !!integration.tech_contact_email },
    { key: "api_url", label: "API base URL provided", done: !!integration.api_base_url },
    { key: "auth", label: "Authentication method defined", done: !!integration.auth_type },
    { key: "api_key", label: "API key / credentials shared", done: integration.api_key_provided },
    { key: "products", label: "Product catalog scope defined", done: !!integration.product_count },
    { key: "cities", label: "Supported cities confirmed", done: !!integration.supported_cities },
    { key: "endpoints", label: "Endpoint capabilities confirmed", done: integration.supports_availability || integration.supports_booking },
    { key: "sandbox", label: "Sandbox / test environment ready", done: !!integration.sandbox_url },
  ];
  const completedCount = checklist.filter(c => c.done).length;
  const progressPercent = Math.round((completedCount / checklist.length) * 100);

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "api", label: "API Details" },
    { id: "checklist", label: "Checklist" },
  ];

  return (
    <>
      {/* Welcome */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-700 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Partner Portal</h1>
              <p className="text-emerald-100 text-sm">Welcome, {company.name || "Partner"}</p>
            </div>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-3xl font-bold">{progressPercent}%</p>
            <p className="text-emerald-200 text-xs">Integration complete</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-2 rounded-full bg-white/20">
          <div className="h-2 rounded-full bg-white transition-all duration-500" style={{ width: `${progressPercent}%` }} />
        </div>
        <p className="mt-2 text-xs text-emerald-200">{completedCount} of {checklist.length} steps completed</p>
      </div>

      {/* Saved toast */}
      {saved && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-sm font-medium text-white shadow-lg">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          Saved successfully
        </div>
      )}

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl border border-border/60 bg-white p-1 shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-foreground text-white shadow-sm"
                : "text-muted hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {tab.label}
            {tab.id === "checklist" && (
              <span className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                progressPercent === 100 ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
              }`}>
                {completedCount}/{checklist.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── OVERVIEW ─── */}
      {activeTab === "overview" && (
        <>
          {/* Status cards */}
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted">API Status</p>
                  <p className={`text-lg font-bold ${progressPercent === 100 ? "text-green-500" : progressPercent > 50 ? "text-blue-500" : "text-amber-500"}`}>
                    {progressPercent === 100 ? "Ready" : progressPercent > 50 ? "In Progress" : "Getting Started"}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted">
                {progressPercent === 100
                  ? "All integration steps completed. We are building your adapter."
                  : "Complete the checklist to speed up your integration."}
              </p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted">Products Listed</p>
                  <p className="text-lg font-bold">{integration.product_count || "0"}</p>
                </div>
              </div>
              <p className="text-xs text-muted">Products from your catalog visible on TicketMatch.</p>
            </div>

            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-muted">Bookings This Month</p>
                  <p className="text-lg font-bold">0</p>
                </div>
              </div>
              <p className="text-xs text-muted">Bookings received through TicketMatch.</p>
            </div>
          </div>

          {/* Quick links */}
          <div className="grid gap-4 md:grid-cols-2">
            <a href="/partners/tech" target="_blank" className="group rounded-2xl border border-border/60 bg-white p-6 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 group-hover:bg-blue-100 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold group-hover:text-blue-600 transition-colors">API Documentation</p>
                  <p className="text-xs text-muted">View endpoints, data models &amp; integration guide</p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-gray-300 group-hover:text-blue-500 transition-colors">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                  <polyline points="15 3 21 3 21 9" />
                  <line x1="10" y1="14" x2="21" y2="3" />
                </svg>
              </div>
            </a>

            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold">Need Help?</p>
                  <p className="text-xs text-muted">Contact us at <span className="font-medium text-emerald-600">hello@ticketmatch.ai</span></p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ─── API DETAILS ─── */}
      {activeTab === "api" && (
        <div className="space-y-6">
          {/* Contact info */}
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="mb-1.5 block text-sm font-medium">Contact Person</label>
                <input
                  type="text"
                  value={integration.contact_name}
                  onChange={(e) => setIntegration({ ...integration, contact_name: e.target.value })}
                  placeholder="Your name"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Business Email</label>
                  <input
                    type="email"
                    value={integration.contact_email}
                    onChange={(e) => setIntegration({ ...integration, contact_email: e.target.value })}
                    placeholder="info@company.com"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Technical Contact Email</label>
                  <input
                    type="email"
                    value={integration.tech_contact_email}
                    onChange={(e) => setIntegration({ ...integration, tech_contact_email: e.target.value })}
                    placeholder="dev@company.com"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* API Configuration */}
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">API Configuration</h2>
            <div className="space-y-4 max-w-lg">
              <div>
                <label className="mb-1.5 block text-sm font-medium">API Base URL</label>
                <input
                  type="url"
                  value={integration.api_base_url}
                  onChange={(e) => setIntegration({ ...integration, api_base_url: e.target.value })}
                  placeholder="https://api.yourcompany.com/v1"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm font-mono outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Sandbox / Test URL</label>
                <input
                  type="url"
                  value={integration.sandbox_url}
                  onChange={(e) => setIntegration({ ...integration, sandbox_url: e.target.value })}
                  placeholder="https://sandbox.yourcompany.com/v1"
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm font-mono outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-sm font-medium">Authentication Type</label>
                <select
                  value={integration.auth_type}
                  onChange={(e) => setIntegration({ ...integration, auth_type: e.target.value })}
                  className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10 appearance-none"
                >
                  <option value="">Select authentication method...</option>
                  <option value="api_key">API Key (Header)</option>
                  <option value="bearer">Bearer Token</option>
                  <option value="oauth2">OAuth 2.0</option>
                  <option value="basic">Basic Auth (username/password)</option>
                  <option value="hmac">HMAC Signature</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/40 px-5 py-4">
                <div>
                  <p className="text-sm font-medium">API Key / Credentials Shared</p>
                  <p className="text-xs text-muted">Have you sent your API key to hello@ticketmatch.ai?</p>
                </div>
                <button
                  onClick={() => setIntegration({ ...integration, api_key_provided: !integration.api_key_provided })}
                  className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${integration.api_key_provided ? "bg-green-500" : "bg-gray-200"}`}
                >
                  <span className={`absolute top-[2px] left-[2px] h-5 w-5 rounded-full bg-white shadow transition-transform ${integration.api_key_provided ? "translate-x-5" : ""}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Product scope */}
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Product Scope</h2>
            <div className="space-y-4 max-w-lg">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Number of Products</label>
                  <input
                    type="text"
                    value={integration.product_count}
                    onChange={(e) => setIntegration({ ...integration, product_count: e.target.value })}
                    placeholder="e.g. 45"
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium">Supported Cities</label>
                  <input
                    type="text"
                    value={integration.supported_cities}
                    onChange={(e) => setIntegration({ ...integration, supported_cities: e.target.value })}
                    placeholder="Amsterdam, Brussels, Berlin..."
                    className="h-12 w-full rounded-xl border border-border bg-white px-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium">Supported Capabilities</label>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { key: "supports_availability", label: "Availability Check", desc: "GET real-time availability" },
                    { key: "supports_booking", label: "Booking Creation", desc: "POST create bookings" },
                    { key: "supports_cancellation", label: "Cancellation", desc: "DELETE cancel bookings" },
                    { key: "supports_webhooks", label: "Webhooks", desc: "Push status updates" },
                  ].map((cap) => (
                    <div
                      key={cap.key}
                      onClick={() => setIntegration({ ...integration, [cap.key]: !integration[cap.key as keyof IntegrationData] })}
                      className={`cursor-pointer rounded-xl border px-4 py-3 transition-all ${
                        integration[cap.key as keyof IntegrationData]
                          ? "border-green-300 bg-green-50"
                          : "border-border/40 bg-white hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`flex h-5 w-5 items-center justify-center rounded-md ${
                          integration[cap.key as keyof IntegrationData] ? "bg-green-500" : "border border-gray-300"
                        }`}>
                          {integration[cap.key as keyof IntegrationData] && (
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-medium">{cap.label}</span>
                      </div>
                      <p className="mt-1 ml-7 text-xs text-muted">{cap.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Additional Notes</h2>
            <textarea
              value={integration.notes}
              onChange={(e) => setIntegration({ ...integration, notes: e.target.value })}
              placeholder="Any additional information about your API, rate limits, special requirements, etc."
              rows={4}
              className="w-full max-w-lg rounded-xl border border-border bg-white px-4 py-3 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
            />
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-xl bg-emerald-600 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Integration Details"}
          </button>
        </div>
      )}

      {/* ─── CHECKLIST ─── */}
      {activeTab === "checklist" && (
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold">Integration Checklist</h2>
              <p className="text-sm text-muted mt-1">Complete all steps to go live on TicketMatch</p>
            </div>
            <div className="text-right">
              <p className={`text-2xl font-bold ${progressPercent === 100 ? "text-green-500" : "text-foreground"}`}>{progressPercent}%</p>
              <p className="text-xs text-muted">{completedCount}/{checklist.length} done</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-8 h-3 rounded-full bg-gray-100">
            <div className={`h-3 rounded-full transition-all duration-500 ${progressPercent === 100 ? "bg-green-500" : "bg-accent"}`} style={{ width: `${progressPercent}%` }} />
          </div>

          <div className="space-y-3">
            {checklist.map((item, i) => (
              <div key={item.key} className={`flex items-center gap-4 rounded-xl border px-5 py-4 transition-all ${
                item.done ? "border-green-200 bg-green-50/50" : "border-border/40"
              }`}>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  item.done ? "bg-green-100 text-green-600" : "bg-gray-100 text-gray-400"
                }`}>
                  {item.done ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    i + 1
                  )}
                </div>
                <p className={`text-sm font-medium ${item.done ? "text-green-700" : "text-foreground"}`}>{item.label}</p>
                {item.done && <span className="ml-auto text-xs text-green-600 font-medium">Completed</span>}
                {!item.done && i > 1 && (
                  <button
                    onClick={() => setActiveTab("api")}
                    className="ml-auto text-xs text-accent font-medium hover:underline"
                  >
                    Fill in &rarr;
                  </button>
                )}
              </div>
            ))}
          </div>

          {progressPercent === 100 && (
            <div className="mt-6 rounded-xl bg-green-50 border border-green-200 p-4 text-center">
              <p className="text-sm font-semibold text-green-800">All steps completed!</p>
              <p className="text-xs text-green-600 mt-1">Our team is now building your adapter. We&apos;ll notify you when testing can begin.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
