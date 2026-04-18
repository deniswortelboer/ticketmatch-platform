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

interface KnowledgeEntry {
  id: string;
  title: string;
  content: string;
  category: string;
  tier: string;
  active: boolean;
  created_at: string;
  updated_at: string | null;
}

type Tab = "overview" | "companies" | "bookings" | "groups" | "suppliers" | "resellers" | "knowledge" | "blocked" | "activity";

interface AuthUser {
  email: string;
  name: string;
  company: string;
  lastSignIn: string | null;
  createdAt: string;
  provider: string;
  banned: boolean;
  blocked: boolean;
}

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

  // Knowledge Base state
  const [kbEntries, setKbEntries] = useState<KnowledgeEntry[]>([]);
  const [kbLoading, setKbLoading] = useState(false);
  const [kbShowForm, setKbShowForm] = useState(false);
  const [kbEditing, setKbEditing] = useState<string | null>(null);
  const [kbForm, setKbForm] = useState({ title: "", content: "", category: "platform", tier: "free" });
  const [kbSaving, setKbSaving] = useState(false);

  // Login Activity state
  const [authUsers, setAuthUsers] = useState<AuthUser[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);

  const loadActivity = () => {
    setActivityLoading(true);
    fetch("/api/admin/activity")
      .then((r) => r.json())
      .then((data) => {
        setAuthUsers(data.users || []);
        setActivityLoading(false);
      })
      .catch(() => setActivityLoading(false));
  };

  const CATEGORIES = ["platform", "venues", "planning", "market", "trends"] as const;
  const TIERS = ["free", "pro", "enterprise"] as const;

  const loadKnowledge = () => {
    setKbLoading(true);
    fetch("/api/admin/knowledge")
      .then((r) => r.json())
      .then((data) => {
        setKbEntries(data.entries || []);
        setKbLoading(false);
      })
      .catch(() => setKbLoading(false));
  };

  const saveKbEntry = async () => {
    setKbSaving(true);
    const method = kbEditing ? "PATCH" : "POST";
    const body = kbEditing ? { id: kbEditing, ...kbForm } : kbForm;
    await fetch("/api/admin/knowledge", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    setKbForm({ title: "", content: "", category: "platform", tier: "free" });
    setKbEditing(null);
    setKbShowForm(false);
    setKbSaving(false);
    loadKnowledge();
  };

  const toggleKbActive = async (entry: KnowledgeEntry) => {
    await fetch("/api/admin/knowledge", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: entry.id, active: !entry.active }),
    });
    loadKnowledge();
  };

  const deleteKbEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    await fetch("/api/admin/knowledge", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadKnowledge();
  };

  const startEditKb = (entry: KnowledgeEntry) => {
    setKbForm({ title: entry.title, content: entry.content, category: entry.category, tier: entry.tier });
    setKbEditing(entry.id);
    setKbShowForm(true);
  };

  const cancelKbForm = () => {
    setKbForm({ title: "", content: "", category: "platform", tier: "free" });
    setKbEditing(null);
    setKbShowForm(false);
  };

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

  useEffect(() => { loadData(); loadKnowledge(); loadActivity(); }, []);

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

  // Parse extra data from message JSON
  const parseMsg = (msg: string | null) => {
    if (!msg) return null;
    try { return JSON.parse(msg); } catch { return null; }
  };

  // Companies pending account approval (based on message JSON)
  const pendingApprovalCompanies = companies.filter((c) => {
    const msg = parseMsg(c.message);
    return msg && msg.approved === false && msg.blocked !== true;
  });
  const approvedCompanies = companies.filter((c) => {
    const msg = parseMsg(c.message);
    return !msg || msg.approved !== false; // existing accounts without the flag are considered approved
  });

  // Blocked companies (must be before tabs array)
  const blockedCompanies = companies.filter((c) => {
    const msg = parseMsg(c.message);
    return msg && msg.blocked === true;
  });

  const tabs: { key: Tab; label: string; count: number; highlight?: boolean }[] = [
    { key: "overview", label: "Overview", count: 0 },
    { key: "companies", label: "Companies", count: companies.length },
    { key: "blocked", label: "Blocked", count: blockedCompanies.length, highlight: blockedCompanies.length > 0 },
    { key: "activity", label: "Login Activity", count: authUsers.filter(u => { const d = u.lastSignIn ? new Date(u.lastSignIn) : null; return d && d > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); }).length },
    { key: "bookings", label: "Bookings", count: bookings.length },
    { key: "groups", label: "Groups", count: groups.length },
    { key: "suppliers", label: "Suppliers", count: companies.filter(c => { try { const m = c.message ? JSON.parse(c.message) : {}; return m.role === "supplier"; } catch { return false; } }).length },
    { key: "resellers", label: "Resellers", count: companies.filter(c => { try { const m = c.message ? JSON.parse(c.message) : {}; return m.role === "reseller"; } catch { return false; } }).length },
    { key: "knowledge", label: "Knowledge Base", count: kbEntries.length },
  ];

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-amber-100 text-amber-700",
      approved: "bg-green-100 text-green-700",
      confirmed: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      cancelled: "bg-red-100 text-red-700",
      blocked: "bg-red-200 text-red-800",
      draft: "bg-gray-100 text-gray-600",
      completed: "bg-blue-100 text-blue-700",
    };
    return (
      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-600"}`}>
        {status}
      </span>
    );
  };

  const parseMessage = parseMsg;

  // Derive effective status: if message.blocked === true, status is "blocked" regardless of DB status column
  const effectiveStatus = (c: Company): string => {
    const msg = parseMsg(c.message);
    if (msg && msg.blocked === true) return "blocked";
    return c.status || "pending";
  };

  return (
    <>
      {/* Header */}
      <div className="mb-6 rounded-2xl bg-gradient-to-r from-[#0f1729] to-[#1e3a5f] p-5 md:p-8 text-white shadow-xl shadow-blue-900/10 overflow-hidden">
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
      <div className="mb-6 -mx-4 px-4 md:mx-0 md:px-0">
        <div className="flex gap-1 overflow-x-auto rounded-xl bg-white border border-border/60 p-1 shadow-sm scrollbar-hide" style={{ WebkitOverflowScrolling: "touch" }}>
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-3 py-2 text-xs md:px-4 md:py-2.5 md:text-sm font-medium transition-all ${
                tab === t.key
                  ? t.highlight ? "bg-red-700 text-white shadow-sm" : "bg-foreground text-white shadow-sm"
                  : t.highlight ? "text-red-600 bg-red-50 hover:bg-red-100" : "text-muted hover:bg-gray-50 hover:text-foreground"
              }`}
            >
              {t.label}
              {t.count > 0 && (
                <span className={`ml-1 text-[10px] md:ml-1.5 md:text-xs ${tab === t.key ? "text-white/60" : t.highlight ? "text-red-500" : "text-muted"}`}>
                  ({t.count})
                </span>
              )}
            </button>
          ))}
        </div>
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
                        <button
                          onClick={() => {
                            if (confirm(`BLOKKEREN: ${c.name || "dit bedrijf"}?\n\nAlle gebruikers worden permanent geblokkeerd en kunnen niet meer inloggen.`)) {
                              updateStatus("company", c.id, "blocked");
                            }
                          }}
                          disabled={updating === c.id}
                          className="rounded-lg bg-red-800 px-4 py-2 text-xs font-medium text-white hover:bg-red-900 disabled:opacity-50 transition-colors"
                        >
                          Block
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Blocked Companies Banner */}
          {blockedCompanies.length > 0 && (
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-red-100">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <h2 className="text-lg font-semibold text-red-700">Blocked Accounts ({blockedCompanies.length})</h2>
              </div>
              <div className="rounded-2xl border-2 border-red-200 bg-red-50/50 divide-y divide-red-100 shadow-sm">
                {blockedCompanies.map((c) => {
                  const extra = parseMessage(c.message);
                  const companyProfiles = profiles.filter((p) => p.company_id === c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 text-sm font-semibold text-red-700">
                          {(c.name || "?").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{c.name || "Unnamed"}</p>
                          <p className="text-xs text-muted">
                            {companyProfiles.map(p => p.email).join(", ")}
                            {extra?.blocked_at && ` · Blocked ${formatDate(extra.blocked_at)}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {statusBadge("blocked")}
                        <button
                          onClick={() => {
                            if (confirm(`DEBLOKKEREN: ${c.name}?`)) {
                              updateStatus("company", c.id, "pending");
                            }
                          }}
                          disabled={updating === c.id}
                          className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                        >
                          Unblock
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="mb-6 grid gap-3 grid-cols-2 lg:grid-cols-4">
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
            const eStatus = effectiveStatus(c);
            return (
              <div key={c.id} className={`rounded-2xl border bg-white p-6 shadow-sm ${eStatus === "blocked" ? "border-red-300 bg-red-50/30" : "border-border/60"}`}>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="text-lg font-semibold">{c.name || "Unnamed"}</h3>
                      {statusBadge(eStatus)}
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
                        {extra.blocked_at && <span className="text-red-600 font-medium">Blocked: {formatDate(extra.blocked_at)}</span>}
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
                    {eStatus !== "approved" && eStatus !== "blocked" && (
                      <button
                        onClick={() => updateStatus("company", c.id, "approved")}
                        disabled={updating === c.id}
                        className="rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50 transition-colors"
                      >
                        Approve
                      </button>
                    )}
                    {eStatus !== "rejected" && eStatus !== "blocked" && (
                      <button
                        onClick={() => updateStatus("company", c.id, "rejected")}
                        disabled={updating === c.id}
                        className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        Reject
                      </button>
                    )}
                    {eStatus !== "blocked" && (
                      <button
                        onClick={() => {
                          if (confirm(`BLOKKEREN: ${c.name || "dit bedrijf"}?\n\nAlle gebruikers worden permanent geblokkeerd en kunnen niet meer inloggen.`)) {
                            updateStatus("company", c.id, "blocked");
                          }
                        }}
                        disabled={updating === c.id}
                        className="rounded-lg bg-red-800 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-900 disabled:opacity-50 transition-colors"
                      >
                        Block
                      </button>
                    )}
                    {eStatus === "blocked" && (
                      <button
                        onClick={() => {
                          if (confirm(`DEBLOKKEREN: ${c.name || "dit bedrijf"}?\n\nGebruikers moeten opnieuw worden goedgekeurd.`)) {
                            updateStatus("company", c.id, "pending");
                          }
                        }}
                        disabled={updating === c.id}
                        className="rounded-lg bg-gray-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        Unblock
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
                      {!!integ.api_base_url && (
                        <div><span className="text-muted">API URL:</span> <span className="font-mono font-medium">{String(integ.api_base_url)}</span></div>
                      )}
                      {!!integ.sandbox_url && (
                        <div><span className="text-muted">Sandbox:</span> <span className="font-mono font-medium">{String(integ.sandbox_url)}</span></div>
                      )}
                      {!!integ.auth_type && (
                        <div><span className="text-muted">Auth:</span> <span className="font-medium">{String(integ.auth_type)}</span></div>
                      )}
                      {!!integ.product_count && (
                        <div><span className="text-muted">Products:</span> <span className="font-medium">{String(integ.product_count)}</span></div>
                      )}
                      {!!integ.supported_cities && (
                        <div><span className="text-muted">Cities:</span> <span className="font-medium">{String(integ.supported_cities)}</span></div>
                      )}
                      {!!integ.contact_name && (
                        <div><span className="text-muted">Contact:</span> <span className="font-medium">{String(integ.contact_name)}</span></div>
                      )}
                      {!!integ.tech_contact_email && (
                        <div><span className="text-muted">Tech Email:</span> <span className="font-medium">{String(integ.tech_contact_email)}</span></div>
                      )}
                      <div>
                        <span className="text-muted">Capabilities:</span>{" "}
                        {!!integ.supports_availability && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Availability</span>}
                        {!!integ.supports_booking && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Booking</span>}
                        {!!integ.supports_cancellation && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Cancellation</span>}
                        {!!integ.supports_webhooks && <span className="inline-block mr-1 rounded bg-green-100 px-1.5 py-0.5 text-green-700">Webhooks</span>}
                        {!integ.supports_availability && !integ.supports_booking && <span className="text-muted">Not defined yet</span>}
                      </div>
                    </div>
                    {!!integ.notes && (
                      <div className="mt-3 rounded-lg bg-amber-50 p-3">
                        <p className="text-xs text-muted font-medium mb-1">Notes:</p>
                        <p className="text-xs">{String(integ.notes)}</p>
                      </div>
                    )}
                    {!!msg.integration_updated_at && (
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

      {/* Resellers Tab */}
      {tab === "resellers" && (
        <div className="space-y-4">
          {companies.filter(c => {
            try { const m = c.message ? JSON.parse(c.message) : {}; return m.role === "reseller"; } catch { return false; }
          }).map((reseller) => {
            let msg: Record<string, unknown> = {};
            try { msg = reseller.message ? JSON.parse(reseller.message) : {}; } catch {}

            const slug = (msg.reseller_slug as string) || "—";
            const rate = (msg.commission_rate as number) || 10;
            const website = (msg.website as string) || "";
            const motivation = (msg.motivation as string) || "";

            // Count referred agencies
            const referredAgencies = companies.filter((c) => {
              try {
                const m = c.message ? JSON.parse(c.message) : {};
                return m.referred_by === reseller.id || (m.reseller_slug === slug && c.id !== reseller.id);
              } catch { return false; }
            });

            // Count bookings from referred agencies
            const agencyIds = referredAgencies.map(a => a.id);
            const agencyBookings = bookings.filter(b => {
              const compName = getCompanyName(b.companies);
              return referredAgencies.some(a => a.name === compName);
            });
            const resellerRevenue = agencyBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

            const contactProfiles = profiles.filter(p => p.company_id === reseller.id);

            return (
              <div key={reseller.id} className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-100">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg">{reseller.name}</h3>
                      <p className="text-xs text-muted">
                        Slug: <span className="font-mono">{slug}</span> &middot; {rate}% commission &middot; Registered {formatDate(reseller.created_at)}
                      </p>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                    referredAgencies.length > 0 ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {referredAgencies.length} agencies
                  </span>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-4">
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-lg font-bold">{referredAgencies.length}</p>
                    <p className="text-xs text-muted">Agencies</p>
                  </div>
                  <div className="rounded-xl bg-gray-50 p-3 text-center">
                    <p className="text-lg font-bold">&euro; {resellerRevenue.toFixed(0)}</p>
                    <p className="text-xs text-muted">Revenue</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-3 text-center">
                    <p className="text-lg font-bold text-green-600">&euro; {(resellerRevenue * rate / 100).toFixed(0)}</p>
                    <p className="text-xs text-muted">Commission</p>
                  </div>
                </div>

                {/* Contact info */}
                {contactProfiles.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-3">
                    {contactProfiles.map(p => (
                      <div key={p.id} className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-green-100 text-xs font-semibold text-green-600">
                          {(p.full_name || "?").split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)}
                        </div>
                        <div>
                          <p className="text-xs font-medium">{p.full_name}</p>
                          <p className="text-[10px] text-muted">{p.email}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Extra details */}
                <div className="text-xs text-muted space-y-1">
                  {website && <p>Website: <a href={website} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">{website}</a></p>}
                  {motivation && <p>Motivation: {motivation}</p>}
                  <p>Referral link: <span className="font-mono text-foreground">ticketmatch.ai/join/{slug}</span></p>
                </div>

                {/* Referred agencies list */}
                {referredAgencies.length > 0 && (
                  <div className="mt-4 rounded-xl border border-border/40 divide-y divide-border/40">
                    <p className="px-4 py-2 text-xs font-semibold text-muted uppercase tracking-wider">Referred Agencies</p>
                    {referredAgencies.map(a => (
                      <div key={a.id} className="flex items-center justify-between px-4 py-2">
                        <p className="text-sm font-medium">{a.name}</p>
                        <p className="text-xs text-muted">{a.company_type} &middot; {formatDate(a.created_at)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {companies.filter(c => { try { const m = c.message ? JSON.parse(c.message) : {}; return m.role === "reseller"; } catch { return false; } }).length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <p className="text-sm text-muted">No resellers registered yet.</p>
              <p className="mt-1 text-xs text-muted">Share <span className="font-mono">ticketmatch.ai/become-reseller</span> to invite partners.</p>
            </div>
          )}
        </div>
      )}

      {/* Knowledge Base Tab */}
      {tab === "knowledge" && (
        <div className="space-y-4">
          {/* Header with add button */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <h2 className="text-lg font-semibold">Knowledge Base</h2>
              <span className="text-sm text-muted">({kbEntries.length} entries)</span>
            </div>
            <button
              onClick={() => { cancelKbForm(); setKbShowForm(true); }}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 transition-colors"
            >
              + Add Entry
            </button>
          </div>

          {/* Add/Edit Form */}
          {kbShowForm && (
            <div className="rounded-2xl border-2 border-accent/30 bg-white p-6 shadow-sm">
              <h3 className="mb-4 text-sm font-semibold">{kbEditing ? "Edit Entry" : "New Entry"}</h3>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Title</label>
                  <input
                    type="text"
                    value={kbForm.title}
                    onChange={(e) => setKbForm({ ...kbForm, title: e.target.value })}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                    placeholder="Entry title..."
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted">Content</label>
                  <textarea
                    value={kbForm.content}
                    onChange={(e) => setKbForm({ ...kbForm, content: e.target.value })}
                    rows={5}
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent resize-y"
                    placeholder="Knowledge content..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Category</label>
                    <select
                      value={kbForm.category}
                      onChange={(e) => setKbForm({ ...kbForm, category: e.target.value })}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                    >
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-medium text-muted">Tier</label>
                    <select
                      value={kbForm.tier}
                      onChange={(e) => setKbForm({ ...kbForm, tier: e.target.value })}
                      className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm outline-none focus:border-accent"
                    >
                      {TIERS.map((t) => (
                        <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={saveKbEntry}
                    disabled={kbSaving || !kbForm.title || !kbForm.content}
                    className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-white hover:bg-accent/90 disabled:opacity-50 transition-colors"
                  >
                    {kbSaving ? "Saving..." : kbEditing ? "Update" : "Create"}
                  </button>
                  <button
                    onClick={cancelKbForm}
                    className="rounded-lg border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Loading */}
          {kbLoading && (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          )}

          {/* Entries list */}
          {!kbLoading && kbEntries.map((entry) => (
            <div key={entry.id} className={`rounded-2xl border bg-white p-5 shadow-sm transition-all ${entry.active ? "border-border/60" : "border-border/40 opacity-60"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-semibold">{entry.title}</h3>
                    <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
                      {entry.category}
                    </span>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                      entry.tier === "free" ? "bg-gray-100 text-gray-600" :
                      entry.tier === "pro" ? "bg-blue-100 text-blue-700" :
                      "bg-purple-100 text-purple-700"
                    }`}>
                      {entry.tier}
                    </span>
                    {!entry.active && (
                      <span className="rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-600">
                        inactive
                      </span>
                    )}
                  </div>
                  <p className="mt-2 text-sm text-muted line-clamp-3 whitespace-pre-wrap">{entry.content}</p>
                  <p className="mt-2 text-xs text-muted">
                    Created {formatDate(entry.created_at)}
                    {entry.updated_at && ` · Updated ${formatDate(entry.updated_at)}`}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleKbActive(entry)}
                    title={entry.active ? "Deactivate" : "Activate"}
                    className={`rounded-lg p-2 text-xs transition-colors ${
                      entry.active ? "hover:bg-amber-50 text-amber-600" : "hover:bg-green-50 text-green-600"
                    }`}
                  >
                    {entry.active ? (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                      </svg>
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => startEditKb(entry)}
                    title="Edit"
                    className="rounded-lg p-2 text-muted hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteKbEntry(entry.id)}
                    title="Delete"
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* Empty state */}
          {!kbLoading && kbEntries.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-muted mb-3">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              <p className="text-sm text-muted">No knowledge base entries yet.</p>
              <p className="mt-1 text-xs text-muted">Click &quot;+ Add Entry&quot; to create your first article.</p>
            </div>
          )}
        </div>
      )}

      {/* Blocked Tab */}
      {tab === "blocked" && (
        <div className="space-y-4">
          {blockedCompanies.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-green-400 mb-3">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <p className="text-sm font-medium text-green-700">Geen geblokkeerde accounts</p>
              <p className="mt-1 text-xs text-muted">Alle accounts zijn in orde.</p>
            </div>
          ) : (
            <>
              <div className="rounded-2xl bg-red-50 border border-red-200 p-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100 shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-red-800">{blockedCompanies.length} geblokkeerde account{blockedCompanies.length !== 1 ? "s" : ""}</p>
                  <p className="text-xs text-red-600">Deze bedrijven en hun gebruikers zijn permanent geblokkeerd en kunnen niet meer inloggen.</p>
                </div>
              </div>

              {blockedCompanies.map((c) => {
                const extra = parseMessage(c.message);
                const companyProfiles = profiles.filter((p) => p.company_id === c.id);
                return (
                  <div key={c.id} className="rounded-2xl border border-red-200 bg-red-50/30 p-6 shadow-sm">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-sm font-bold text-red-700 shrink-0">
                          {(c.name || "?").substring(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="text-lg font-semibold">{c.name || "Unnamed"}</h3>
                            {statusBadge("blocked")}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted">
                            {c.company_type && <span>Type: {c.company_type}</span>}
                            {c.phone && <span>Tel: {c.phone}</span>}
                            <span>Registered: {formatDate(c.created_at)}</span>
                          </div>
                          {extra?.blocked_at && (
                            <p className="mt-1 text-sm font-medium text-red-600">Blocked: {formatDate(extra.blocked_at)}</p>
                          )}
                          {companyProfiles.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Geblokkeerde gebruikers</p>
                              {companyProfiles.map((p) => (
                                <div key={p.id} className="flex items-center gap-2 mt-1">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-400">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                  </svg>
                                  <span className="text-sm">{p.full_name} &middot; {p.email} &middot; <span className="text-muted">{p.role}</span></span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (confirm(`DEBLOKKEREN: ${c.name || "dit bedrijf"}?\n\nGebruikers moeten opnieuw worden goedgekeurd.`)) {
                            updateStatus("company", c.id, "pending");
                          }
                        }}
                        disabled={updating === c.id}
                        className="rounded-lg bg-gray-600 px-4 py-2 text-xs font-medium text-white hover:bg-gray-700 disabled:opacity-50 transition-colors shrink-0"
                      >
                        Unblock
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>
      )}

      {/* Login Activity Tab */}
      {tab === "activity" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-accent">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
              <h2 className="text-lg font-semibold">Login Activity</h2>
              <span className="text-sm text-muted">({authUsers.length} users)</span>
            </div>
            <button
              onClick={loadActivity}
              className="rounded-lg border border-border px-3 py-1.5 text-xs font-medium text-muted hover:bg-gray-50 transition-colors"
            >
              Refresh
            </button>
          </div>

          {activityLoading ? (
            <div className="flex justify-center py-12">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            </div>
          ) : (
            <>
              {/* Recent logins (past 7 days) */}
              {(() => {
                const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
                const recentUsers = authUsers.filter(u => u.lastSignIn && new Date(u.lastSignIn) > oneWeekAgo);
                const olderUsers = authUsers.filter(u => !u.lastSignIn || new Date(u.lastSignIn) <= oneWeekAgo);

                return (
                  <>
                    {recentUsers.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-green-700 flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                          Afgelopen 7 dagen ({recentUsers.length})
                        </h3>
                        <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
                          {recentUsers.map((u) => {
                            const loginDate = u.lastSignIn ? new Date(u.lastSignIn) : null;
                            const hoursAgo = loginDate ? Math.floor((Date.now() - loginDate.getTime()) / 3600000) : null;
                            const timeLabel = hoursAgo !== null
                              ? hoursAgo < 1 ? "Zojuist" : hoursAgo < 24 ? `${hoursAgo}u geleden` : `${Math.floor(hoursAgo / 24)}d geleden`
                              : "Nooit";

                            return (
                              <div key={u.email} className={`flex items-center justify-between px-6 py-4 ${u.banned || u.blocked ? "bg-red-50/50" : ""}`}>
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                                    u.banned || u.blocked
                                      ? "bg-red-100 text-red-700"
                                      : "bg-accent/10 text-accent"
                                  }`}>
                                    {(u.name || u.email.substring(0, 2)).substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium">{u.name || u.email.split("@")[0]}</p>
                                      {(u.banned || u.blocked) && (
                                        <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-800">BLOCKED</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted">
                                      {u.email} &middot; {u.company || "—"} &middot;{" "}
                                      <span className="inline-flex items-center gap-1">
                                        {u.provider === "google" ? "Google" : u.provider === "azure" ? "Microsoft" : "Email"}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs font-medium">{timeLabel}</p>
                                  <p className="text-[11px] text-muted">
                                    {loginDate ? loginDate.toLocaleDateString("nl-NL", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }) : "—"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {olderUsers.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-sm font-semibold text-muted flex items-center gap-2">
                          Ouder dan 7 dagen ({olderUsers.length})
                        </h3>
                        <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
                          {olderUsers.map((u) => {
                            const loginDate = u.lastSignIn ? new Date(u.lastSignIn) : null;
                            return (
                              <div key={u.email} className={`flex items-center justify-between px-6 py-4 ${u.banned || u.blocked ? "bg-red-50/50" : ""}`}>
                                <div className="flex items-center gap-3">
                                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold ${
                                    u.banned || u.blocked ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-500"
                                  }`}>
                                    {(u.name || u.email.substring(0, 2)).substring(0, 2).toUpperCase()}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <p className="font-medium text-muted">{u.name || u.email.split("@")[0]}</p>
                                      {(u.banned || u.blocked) && (
                                        <span className="rounded-full bg-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-800">BLOCKED</span>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted">{u.email} &middot; {u.company || "—"} &middot; {u.provider === "google" ? "Google" : u.provider === "azure" ? "Microsoft" : "Email"}</p>
                                  </div>
                                </div>
                                <div className="text-right shrink-0">
                                  <p className="text-xs text-muted">
                                    {loginDate ? loginDate.toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" }) : "Nooit ingelogd"}
                                  </p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {authUsers.length === 0 && (
                      <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
                        <p className="text-sm text-muted">Geen gebruikers gevonden.</p>
                      </div>
                    )}
                  </>
                );
              })()}
            </>
          )}
        </div>
      )}
    </>
  );
}
