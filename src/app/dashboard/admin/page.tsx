"use client";

import { useEffect, useState } from "react";

interface Company {
  id: string;
  name: string;
  company_type: string | null;
  phone: string | null;
  status: string | null;
  message: string | null;
  created_at: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string | null;
  company_id: string | null;
  companies: { name: string } | { name: string }[] | null;
  created_at: string;
}

interface Booking {
  id: string;
  venue_name: string;
  venue_category: string | null;
  venue_city: string | null;
  scheduled_date: string | null;
  number_of_guests: number;
  unit_price: number;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  groups: { name: string } | null;
  companies: { name: string } | { name: string }[] | null;
}

interface Group {
  id: string;
  name: string;
  travel_date: string | null;
  number_of_guests: number;
  contact_person: string | null;
  status: string;
  created_at: string;
  companies: { name: string } | { name: string }[] | null;
}

type Tab = "overview" | "companies" | "bookings" | "groups" | "suppliers";

function getCompanyName(companies: { name: string } | { name: string }[] | null): string {
  if (!companies) return "—";
  if (Array.isArray(companies)) return companies[0]?.name || "—";
  return companies.name || "—";
}

export default function AdminDashboard() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [tab, setTab] = useState<Tab>("overview");
  const [updating, setUpdating] = useState<string | null>(null);

  const loadData = () => {
    fetch("/api/admin")
      .then((r) => {
        if (r.status === 403) throw new Error("Geen toegang. Alleen admins mogen hier komen.");
        return r.json();
      })
      .then((data) => {
        setCompanies(data.companies || []);
        setProfiles(data.profiles || []);
        setBookings(data.bookings || []);
        setGroups(data.groups || []);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  };

  useEffect(() => { loadData(); }, []);

  const updateStatus = async (type: "booking" | "company", id: string, status: string) => {
    setUpdating(id);
    await fetch("/api/admin", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id, status }),
    });
    loadData();
    setUpdating(null);
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <p className="text-lg font-semibold text-red-700">Access Denied</p>
          <p className="mt-1 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalRevenue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);
  const confirmedBookings = bookings.filter((b) => b.status === "confirmed").length;
  const pendingBookings = bookings.filter((b) => b.status === "pending").length;

  // Companies pending account approval (based on message JSON)
  const pendingApprovalCompanies = companies.filter((c) => {
    const msg = parseMessage(c.message);
    return msg && msg.approved === false;
  });
  const approvedCompanies = companies.filter((c) => {
    const msg = parseMessage(c.message);
    return !msg || msg.approved !== false; // existing accounts without the flag are considered approved
  });

  const tabs: { key: Tab; label: string; count: number }[] = [
    { key: "overview", label: "Overview", count: 0 },
    { key: "companies", label: "Companies", count: companies.length },
    { key: "bookings", label: "Bookings", count: bookings.length },
    { key: "groups", label: "Groups", count: groups.length },
    { key: "suppliers", label: "Suppliers", count: companies.filter(c => { try { const m = c.message ? JSON.parse(c.message) : {}; return m.role === "supplier"; } catch { return false; } }).length },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-green-100 text-green-700",
      confirmed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-red-100 text-red-700",
      draft: "bg-gray-100 text-gray-600",
      completed: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  // Parse extra data from message JSON
  const parseMessage = (msg: string | null) => {
    if (!msg) return null;
    try { return JSON.parse(msg); } catch { return null; }
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#0f1729] to-[#1e3a5f] p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <path d="M12 15v2m-6 4h12a2 2 0 0 0 2-2v-6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2zm10-10V7a4 4 0 0 0-8 0v4h8z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
            <p className="text-sm text-blue-200/70">Manage all companies, bookings and groups.</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-white border border-border/60 p-1 shadow-sm">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex-1 rounded-lg px-4 py-2.5 text-sm font-medium transition-all ${
              tab === t.key
                ? "bg-foreground text-white shadow-sm"
                : "text-muted hover:bg-gray-50 hover:text-foreground"
            }`}
          >
            {t.label}
            {t.count > 0 && (
              <span className={`ml-1.5 text-xs ${tab === t.key ? "text-white/60" : "text-muted"}`}>
                ({t.count})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === "overview" && (
        <>
          {/* Pending Approvals Banner */}
          {pendingApprovalCompanies.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-amber-100">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold">Pending Approvals ({pendingApprovalCompanies.length})</h2>
              </div>
              <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 divide-y divide-amber-100 shadow-sm">
                {pendingApprovalCompanies.map((c) => {
                  const extra = parseMessage(c.message);
                  const companyProfiles = profiles.filter((p) => p.company_id === c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-sm font-semibold text-amber-700">
                          {(c.name || "?").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{c.name || "Unnamed"}</p>
                          <p className="text-xs text-muted">
                            {c.company_type || "Unknown type"}
                            {companyProfiles.length > 0 && ` \u00B7 ${companyProfiles.map(p => p.email).join(", ")}`}
                            {` \u00B7 ${formatDate(c.created_at)}`}
                          </p>
                          {extra?.group_volume && (
                            <p className="text-xs text-muted">Volume: {extra.group_volume}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => updateStatus("company", c.id, "approved")}
                          disabled={updating === c.id}
                          className="rounded-lg bg-green-600 px-4 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                        >
                          {updating === c.id ? "..." : "Approve"}
                        </button>
                        <button
                          onClick={() => updateStatus("company", c.id, "rejected")}
                          disabled={updating === c.id}
                          className="rounded-lg bg-red-600 px-4 py-2 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Companies</p>
              <p className="mt-2 text-3xl font-bold">{companies.length}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Users</p>
              <p className="mt-2 text-3xl font-bold">{profiles.length}</p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Bookings</p>
              <p className="mt-2 text-3xl font-bold">
                {bookings.length}
                {pendingBookings > 0 && (
                  <span className="ml-2 text-sm font-medium text-amber-600">({pendingBookings} pending)</span>
                )}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Total Revenue</p>
              <p className="mt-2 text-3xl font-bold text-accent">&euro; {totalRevenue.toFixed(2)}</p>
            </div>
          </div>

          {/* Recent registrations */}
          <div className="mb-6">
            <h2 className="mb-3 text-lg font-semibold">Recent Registrations</h2>
            <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
              {profiles.slice(0, 8).map((p) => (
                <div key={p.id} className="flex items-center justify-between px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                      {(p.full_name || "?").substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium">{p.full_name || "Unknown"}</p>
                      <p className="text-xs text-muted">{p.email} &middot; {getCompanyName(p.companies)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted">{formatDate(p.created_at)}</p>
                    <p className="text-xs text-muted">{formatTime(p.created_at)}</p>
                  </div>
                </div>
              ))}
              {profiles.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-muted">No users yet.</p>
              )}
            </div>
          </div>

          {/* Recent bookings */}
          <div>
            <h2 className="mb-3 text-lg font-semibold">Recent Bookings</h2>
            <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
              {bookings.slice(0, 8).map((b) => (
                <div key={b.id} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="font-medium">{b.venue_name}</p>
                    <p className="text-xs text-muted">
                      {getCompanyName(b.companies)} &middot; {b.groups?.name || "—"} &middot; {b.venue_city}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-semibold text-accent">&euro; {Number(b.total_price).toFixed(2)}</p>
                    {statusBadge(b.status)}
                  </div>
                </div>
              ))}
              {bookings.length === 0 && (
                <p className="px-6 py-8 text-center text-sm text-muted">No bookings yet.</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* Companies Tab */}
      {tab === "companies" && (
        <div className="space-y-4">
          {companies.map((c) => {
            const extra = parseMessage(c.message);
            const companyProfiles = profiles.filter((p) => p.company_id === c.id);
            return (
              <div key={c.id} className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{c.name || "Unnamed"}</h3>
                      {statusBadge(c.status || "pending")}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                      {c.company_type && <span>Type: {c.company_type}</span>}
                      {c.phone && <span>Tel: {c.phone}</span>}
                      <span>Registered: {formatDate(c.created_at)}</span>
                    </div>
                    {extra && (
                      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                        {extra.group_volume && <span>Group volume: {extra.group_volume}</span>}
                        {extra.interested_cities && (
                          <span>Cities: {Array.isArray(extra.interested_cities) ? extra.interested_cities.join(", ") : extra.interested_cities}</span>
                        )}
                      </div>
                    )}
                    {companyProfiles.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Users</p>
                        {companyProfiles.map((p) => (
                          <p key={p.id} className="text-sm">
                            {p.full_name} &middot; {p.email} &middot; <span className="text-muted">{p.role}</span>
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {c.status !== "approved" && (
                      <button
                        onClick={() => updateStatus("company", c.id, "approved")}
                        disabled={updating === c.id}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {c.status !== "rejected" && (
                      <button
                        onClick={() => updateStatus("company", c.id, "rejected")}
                        disabled={updating === c.id}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          {companies.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <p className="text-sm text-muted">No companies registered yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Bookings Tab */}
      {tab === "bookings" && (
        <div className="space-y-3">
          {bookings.map((b) => (
            <div key={b.id} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold">{b.venue_name}</p>
                    <p className="text-xs text-muted">
                      {getCompanyName(b.companies)} &middot; {b.groups?.name || "—"} &middot; {b.venue_city} &middot; {b.number_of_guests} guests
                    </p>
                    <p className="text-xs text-muted">
                      {b.scheduled_date ? formatDate(b.scheduled_date) : "No date"} &middot; Created {formatDate(b.created_at)}
                      {b.notes && ` · ${b.notes}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-accent">&euro; {Number(b.total_price).toFixed(2)}</p>
                    <p className="text-xs text-muted">&euro; {Number(b.unit_price).toFixed(2)} p.p.</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    {statusBadge(b.status)}
                    <select
                      value={b.status}
                      onChange={(e) => updateStatus("booking", b.id, e.target.value)}
                      disabled={updating === b.id}
                      className="mt-1 rounded-lg border border-border bg-white px-2 py-1 text-xs outline-none focus:border-accent disabled:opacity-50"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {bookings.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <p className="text-sm text-muted">No bookings yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Groups Tab */}
      {tab === "groups" && (
        <div className="space-y-3">
          {groups.map((g) => (
            <div key={g.id} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{g.name}</h3>
                    {statusBadge(g.status)}
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    {getCompanyName(g.companies)} &middot; {g.number_of_guests} guests
                    {g.contact_person && ` · Contact: ${g.contact_person}`}
                    {g.travel_date && ` · ${formatDate(g.travel_date)}`}
                  </p>
                </div>
                <p className="text-xs text-muted">{formatDate(g.created_at)}</p>
              </div>
            </div>
          ))}
          {groups.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <p className="text-sm text-muted">No groups yet.</p>
            </div>
          )}
        </div>
      )}

      {/* Suppliers Tab */}
      {tab === "suppliers" && (
        <div className="space-y-4">
          {companies.filter(c => {
            try { const m = c.message ? JSON.parse(c.message) : {}; return m.role === "supplier"; } catch { return false; }
          }).map((supplier) => {
            let msg: Record<string, unknown> = {};
            try { msg = supplier.message ? JSON.parse(supplier.message) : {}; } catch {}
            const integ = (msg.integration || {}) as Record<string, unknown>;

            // Calculate progress
            const checks = [
              true, // account
              true, // docs
              !!integ.tech_contact_email,
              !!integ.api_base_url,
              !!integ.auth_type,
              !!integ.api_key_provided,
              !!integ.product_count,
              !!integ.supported_cities,
              !!(integ.supports_availability || integ.supports_booking),
              !!integ.sandbox_url,
            ];
            const done = checks.filter(Boolean).length;
            const pct = Math.round((done / checks.length) * 100);

            const contactProfiles = profiles.filter(p => p.company_id === supplier.id);

            return (
              <div key={supplier.id} className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${pct === 100 ? "bg-green-100" : pct > 50 ? "bg-blue-100" : "bg-amber-100"}`}>
                      <span className={`text-sm font-bold ${pct === 100 ? "text-green-600" : pct > 50 ? "text-blue-600" : "text-amber-600"}`}>{pct}%</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{supplier.name}</h3>
                      <p className="text-xs text-muted">
                        {(msg.supplier_type as string) || "Supplier"} &middot; Registered {formatDate(supplier.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    pct === 100 ? "bg-green-100 text-green-700" : pct > 50 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {pct === 100 ? "Ready" : pct > 50 ? "In Progress" : "Getting Started"}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="mb-4 h-2 rounded-full bg-gray-100">
                  <div className={`h-2 rounded-full transition-all ${pct === 100 ? "bg-green-500" : "bg-accent"}`} style={{ width: `${pct}%` }} />
                </div>

                {/* Contact info */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-4">
                  {contactProfiles.map(p => (
                    <div key={p.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                        {(p.full_name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
                      </div>
                      <div>
                        <p className="text-xs font-medium">{p.full_name}</p>
                        <p className="text-[10px] text-muted">{p.email}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Integration details */}
                {Object.keys(integ).length > 0 && (
                  <div className="rounded-xl border border-border/40 p-4">
                    <p className="text-xs font-semibold text-muted uppercase tracking-wider mb-3">Integration Details</p>
                    <div className="grid gap-2 sm:grid-cols-2 text-xs">
                      {integ.api_base_url && (
                        <div><span className="text-muted">API URL:</span> <span className="font-mono font-medium">{integ.api_base_url as string}</span></div>
                      )}
                      {integ.sandbox_url && (
                        <div><span className="text-muted">Sandbox:</span> <span className="font-mono font-medium">{integ.sandbox_url as string}</span></div>
                      )}
                      {integ.auth_type && (
                        <div><span className="text-muted">Auth:</span> <span className="font-medium">{integ.auth_type as string}</span></div>
                      )}
                      {integ.product_count && (
                        <div><span className="text-muted">Products:</span> <span className="font-medium">{integ.product_count as string}</span></div>
                      )}
                      {integ.supported_cities && (
                        <div><span className="text-muted">Cities:</span> <span className="font-medium">{integ.supported_cities as string}</span></div>
                      )}
                      {integ.contact_name && (
                        <div><span className="text-muted">Contact:</span> <span className="font-medium">{integ.contact_name as string}</span></div>
                      )}
                      {integ.tech_contact_email && (
                        <div><span className="text-muted">Tech Email:</span> <span className="font-medium">{integ.tech_contact_email as string}</span></div>
                      )}
                      <div>
                        <span className="text-muted">Capabilities:</span>{" "}
                        {integ.supports_availability && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Availability</span>}
                        {integ.supports_booking && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Booking</span>}
                        {integ.supports_cancellation && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Cancellation</span>}
                        {integ.supports_webhooks && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Webhooks</span>}
                        {!integ.supports_availability && !integ.supports_booking && <span className="text-muted">Not defined yet</span>}
                      </div>
                    </div>
                    {integ.notes && (
                      <div className="mt-3 rounded-lg bg-amber-50 p-3">
                        <p className="text-xs text-muted font-medium mb-1">Notes:</p>
                        <p className="text-xs">{integ.notes as string}</p>
                      </div>
                    )}
                    {msg.integration_updated_at && (
                      <p className="mt-2 text-[10px] text-muted">Last updated: {formatDate(msg.integration_updated_at as string)}</p>
                    )}
                  </div>
                )}

                {Object.keys(integ).length === 0 && (
                  <div className="rounded-xl border border-dashed border-border/40 p-4 text-center">
                    <p className="text-xs text-muted">No integration details submitted yet.</p>
                  </div>
                )}
              </div>
            );
          })}

          {companies.filter(c => { try { const m = c.message ? JSON.parse(c.message) : {}; return m.role === "supplier"; } catch { return false; } }).length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <p className="text-sm text-muted">No suppliers registered yet.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
