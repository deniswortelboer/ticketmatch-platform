"use client";

import { useState } from "react";

const ENDPOINTS = [
  {
    method: "GET",
    path: "/products",
    title: "List all products",
    desc: "Returns all available venues, attractions, and experiences in the TicketMatch catalog.",
    params: [],
    response: `{
  "products": [
    {
      "id": "prod_abc123",
      "name": "Canal Cruise Amsterdam",
      "category": "cruises",
      "city": "Amsterdam",
      "price_retail": 18.50,
      "price_b2b": 12.00,
      "currency": "EUR",
      "duration": "75 min",
      "max_group_size": 40,
      "image_url": "https://...",
      "includes": ["Guide", "Drinks"],
      "available_days": ["mon","tue","wed","thu","fri","sat","sun"]
    }
  ]
}`,
  },
  {
    method: "GET",
    path: "/products/{id}",
    title: "Get product details",
    desc: "Returns full details for a specific product by its ID.",
    params: [{ name: "id", in: "path", required: true, desc: "Product ID" }],
    response: `{
  "id": "prod_abc123",
  "name": "Canal Cruise Amsterdam",
  "description": "A 75-minute guided cruise...",
  "category": "cruises",
  "city": "Amsterdam",
  "price_retail": 18.50,
  "price_b2b": 12.00,
  "currency": "EUR",
  "duration": "75 min",
  "max_group_size": 40,
  "image_url": "https://...",
  "includes": ["Guide", "Drinks"],
  "available_days": ["mon","tue","wed","thu","fri","sat","sun"],
  "cancellation_policy": "Free cancellation up to 24h before"
}`,
  },
  {
    method: "GET",
    path: "/availability",
    title: "Check availability",
    desc: "Check if a product is available for a specific date and group size.",
    params: [
      { name: "product_id", in: "query", required: true, desc: "Product ID" },
      { name: "date", in: "query", required: true, desc: "Date (YYYY-MM-DD)" },
      { name: "group_size", in: "query", required: true, desc: "Number of people" },
    ],
    response: `{
  "available": true,
  "slots": [
    { "time": "10:00", "spots_left": 25 },
    { "time": "14:00", "spots_left": 40 }
  ],
  "price_b2b": 12.00,
  "currency": "EUR"
}`,
  },
  {
    method: "POST",
    path: "/bookings",
    title: "Create a booking",
    desc: "Create a confirmed reservation for a product.",
    params: [
      { name: "product_id", in: "body", required: true, desc: "Product ID" },
      { name: "date", in: "body", required: true, desc: "Date (YYYY-MM-DD)" },
      { name: "time_slot", in: "body", required: false, desc: "Preferred time slot" },
      { name: "group_size", in: "body", required: true, desc: "Number of people" },
      { name: "contact_name", in: "body", required: true, desc: "Lead passenger name" },
      { name: "contact_email", in: "body", required: true, desc: "Contact email" },
      { name: "contact_phone", in: "body", required: false, desc: "Contact phone" },
      { name: "notes", in: "body", required: false, desc: "Special requirements" },
    ],
    response: `{
  "booking_id": "bk_xyz789",
  "status": "confirmed",
  "confirmation_number": "TM-2026-4821",
  "voucher_url": "https://ticketmatch.ai/voucher/bk_xyz789",
  "total_price": 480.00,
  "currency": "EUR"
}`,
  },
  {
    method: "GET",
    path: "/bookings/{id}",
    title: "Get booking status",
    desc: "Retrieve the current status and voucher for a booking.",
    params: [{ name: "id", in: "path", required: true, desc: "Booking ID" }],
    response: `{
  "booking_id": "bk_xyz789",
  "status": "confirmed",
  "confirmation_number": "TM-2026-4821",
  "voucher_url": "https://ticketmatch.ai/voucher/bk_xyz789",
  "product": { "name": "Canal Cruise Amsterdam" },
  "date": "2026-05-15",
  "group_size": 40,
  "cancellation_policy": "Free cancellation up to 24h before"
}`,
  },
  {
    method: "DELETE",
    path: "/bookings/{id}",
    title: "Cancel a booking",
    desc: "Cancel an existing booking and initiate a refund if applicable.",
    params: [{ name: "id", in: "path", required: true, desc: "Booking ID" }],
    response: `{
  "success": true,
  "refund_amount": 480.00,
  "refund_status": "processing",
  "message": "Booking cancelled. Refund will be processed within 5 business days."
}`,
  },
];

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET: { bg: "bg-green-100", text: "text-green-700" },
  POST: { bg: "bg-blue-100", text: "text-blue-700" },
  DELETE: { bg: "bg-red-100", text: "text-red-700" },
};

export default function DeveloperDocsPage() {
  const [expandedEndpoint, setExpandedEndpoint] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"endpoints" | "auth" | "quickstart">("endpoints");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-[#0f172a] to-[#1e3a5f] p-8 text-white shadow-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/10 ring-1 ring-cyan-500/20">
              <span className="text-lg font-mono font-bold text-cyan-400">&lt;/&gt;</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">API Documentation</h1>
              <p className="text-sm text-cyan-200/60 font-mono">v1.0 &middot; REST &middot; JSON</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-xs text-white/40 font-mono">Base URL</p>
            <p className="text-sm font-mono text-cyan-300">https://api.ticketmatch.ai/v1</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border/60 bg-white p-1 shadow-sm">
        {([
          { id: "endpoints" as const, label: "Endpoints", count: ENDPOINTS.length },
          { id: "auth" as const, label: "Authentication" },
          { id: "quickstart" as const, label: "Quick Start" },
        ]).map((tab) => (
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
            {"count" in tab && (
              <span className="ml-1.5 rounded-full bg-cyan-100 px-1.5 py-0.5 text-[10px] font-bold text-cyan-700">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ENDPOINTS TAB */}
      {activeTab === "endpoints" && (
        <div className="space-y-3">
          {ENDPOINTS.map((ep) => {
            const isOpen = expandedEndpoint === ep.path + ep.method;
            const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
            return (
              <div key={ep.path + ep.method} className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
                <button
                  onClick={() => setExpandedEndpoint(isOpen ? null : ep.path + ep.method)}
                  className="w-full flex items-center gap-3 px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className={`shrink-0 rounded-lg ${mc.bg} px-2.5 py-1 text-xs font-bold font-mono ${mc.text}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-sm text-gray-700">{ep.path}</span>
                  <span className="hidden sm:inline text-xs text-muted ml-2">{ep.title}</span>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`ml-auto text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {isOpen && (
                  <div className="border-t border-border/30 px-6 py-5 space-y-4">
                    <p className="text-sm text-muted">{ep.desc}</p>

                    {ep.params.length > 0 && (
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Parameters</h4>
                        <div className="rounded-xl border border-border/40 overflow-hidden">
                          <table className="w-full">
                            <thead>
                              <tr className="bg-gray-50/50 text-xs text-muted">
                                <th className="px-4 py-2 text-left font-medium">Name</th>
                                <th className="px-4 py-2 text-left font-medium">In</th>
                                <th className="px-4 py-2 text-left font-medium">Required</th>
                                <th className="px-4 py-2 text-left font-medium">Description</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-border/30">
                              {ep.params.map((p) => (
                                <tr key={p.name}>
                                  <td className="px-4 py-2 text-sm font-mono text-cyan-700">{p.name}</td>
                                  <td className="px-4 py-2 text-xs text-muted">{p.in}</td>
                                  <td className="px-4 py-2">
                                    {p.required ? (
                                      <span className="text-[10px] font-bold text-red-600 bg-red-50 rounded px-1.5 py-0.5">required</span>
                                    ) : (
                                      <span className="text-[10px] font-medium text-gray-400">optional</span>
                                    )}
                                  </td>
                                  <td className="px-4 py-2 text-sm text-muted">{p.desc}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted mb-2">Response</h4>
                      <div className="rounded-xl bg-[#0f172a] p-4 overflow-x-auto">
                        <pre className="text-xs leading-relaxed text-cyan-100 font-mono whitespace-pre">{ep.response}</pre>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* AUTH TAB */}
      {activeTab === "auth" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Authentication</h2>
            <p className="text-sm text-muted mb-4">All API requests require authentication. We support two methods:</p>

            <div className="space-y-4">
              <div className="rounded-xl border border-border/40 p-5">
                <h3 className="text-sm font-semibold mb-2">Option 1: API Key Header</h3>
                <div className="rounded-lg bg-[#0f172a] p-3">
                  <pre className="text-xs font-mono text-cyan-100">X-API-Key: your_api_key_here</pre>
                </div>
              </div>

              <div className="rounded-xl border border-border/40 p-5">
                <h3 className="text-sm font-semibold mb-2">Option 2: Bearer Token</h3>
                <div className="rounded-lg bg-[#0f172a] p-3">
                  <pre className="text-xs font-mono text-cyan-100">Authorization: Bearer your_token_here</pre>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-800">
                <strong>API keys</strong> are provided after your integration is approved. Enterprise plan customers (&euro;149/month) get full API access.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Rate Limits</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-border/40 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">1,000</p>
                <p className="text-xs text-muted mt-1">requests / hour</p>
              </div>
              <div className="rounded-xl border border-border/40 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">100</p>
                <p className="text-xs text-muted mt-1">bookings / hour</p>
              </div>
              <div className="rounded-xl border border-border/40 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">10 MB</p>
                <p className="text-xs text-muted mt-1">max request body</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-3">Data Format</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                { label: "Format", value: "JSON (application/json)" },
                { label: "Encoding", value: "UTF-8" },
                { label: "Dates", value: "ISO 8601 (YYYY-MM-DD)" },
                { label: "Prices", value: "Decimal (float) in EUR" },
                { label: "IDs", value: "String prefixed (prod_, bk_)" },
                { label: "Errors", value: "{ error: string, code: number }" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 rounded-xl border border-border/40 px-4 py-3">
                  <span className="text-xs font-semibold text-muted w-20">{item.label}</span>
                  <span className="text-sm font-mono text-foreground">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUICKSTART TAB */}
      {activeTab === "quickstart" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Quick Start Guide</h2>

            <div className="space-y-6">
              {[
                {
                  step: "1",
                  title: "Get your API key",
                  desc: "Sign up for an Enterprise plan or complete your integration onboarding. Your API key will be sent to your registered email.",
                  code: null,
                },
                {
                  step: "2",
                  title: "Test the connection",
                  desc: "Make a simple request to list products:",
                  code: `curl -X GET "https://api.ticketmatch.ai/v1/products" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json"`,
                },
                {
                  step: "3",
                  title: "Check availability",
                  desc: "Query a product for a specific date:",
                  code: `curl -X GET "https://api.ticketmatch.ai/v1/availability?product_id=prod_abc123&date=2026-05-15&group_size=20" \\
  -H "X-API-Key: your_api_key_here"`,
                },
                {
                  step: "4",
                  title: "Create a booking",
                  desc: "Book a product for your group:",
                  code: `curl -X POST "https://api.ticketmatch.ai/v1/bookings" \\
  -H "X-API-Key: your_api_key_here" \\
  -H "Content-Type: application/json" \\
  -d '{
    "product_id": "prod_abc123",
    "date": "2026-05-15",
    "group_size": 20,
    "contact_name": "John Doe",
    "contact_email": "john@agency.com"
  }'`,
                },
                {
                  step: "5",
                  title: "Go live!",
                  desc: "Once testing is complete, switch to the production base URL and you're ready to go.",
                  code: null,
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-sm font-bold text-cyan-700">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold">{item.title}</h3>
                    <p className="text-sm text-muted mt-0.5">{item.desc}</p>
                    {item.code && (
                      <div className="mt-2 rounded-xl bg-[#0f172a] p-4 overflow-x-auto">
                        <pre className="text-xs leading-relaxed text-cyan-100 font-mono whitespace-pre">{item.code}</pre>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-cyan-200 bg-cyan-50/50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-100">
                <span className="text-xs font-mono font-bold text-cyan-700">&lt;/&gt;</span>
              </div>
              <div>
                <p className="text-sm font-semibold text-cyan-800">Need help integrating?</p>
                <p className="text-xs text-cyan-700 mt-0.5">
                  Use the Developer Agent (bottom right) for code examples in any language, or contact us at <strong>partners@ticketmatch.ai</strong>
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
