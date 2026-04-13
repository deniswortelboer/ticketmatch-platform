"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

type Partner = {
  id: string;
  name: string;
  city: string;
  status: "active" | "pending" | "integration";
  products: number;
  bookingsThisMonth: number;
  revenue: number;
  commission: number;
  lastActivity: string;
};

// Demo data — will be replaced with real Supabase data
const DEMO_PARTNERS: Partner[] = [
  { id: "1", name: "Amsterdam Canal Tours", city: "Amsterdam", status: "active", products: 12, bookingsThisMonth: 47, revenue: 8340, commission: 834, lastActivity: "2 hours ago" },
  { id: "2", name: "Brussels Walking Co.", city: "Brussels", status: "active", products: 6, bookingsThisMonth: 23, revenue: 3220, commission: 322, lastActivity: "5 hours ago" },
  { id: "3", name: "Rotterdam Harbor Cruises", city: "Rotterdam", status: "integration", products: 8, bookingsThisMonth: 0, revenue: 0, commission: 0, lastActivity: "Yesterday" },
  { id: "4", name: "Antwerp City Experiences", city: "Antwerp", status: "pending", products: 0, bookingsThisMonth: 0, revenue: 0, commission: 0, lastActivity: "3 days ago" },
  { id: "5", name: "Ghent Heritage Tours", city: "Ghent", status: "active", products: 4, bookingsThisMonth: 11, revenue: 1870, commission: 187, lastActivity: "1 day ago" },
];

function StatusBadge({ status }: { status: Partner["status"] }) {
  const config = {
    active: { label: "Live", bg: "bg-green-50", text: "text-green-700", dot: "bg-green-500" },
    integration: { label: "Integrating", bg: "bg-blue-50", text: "text-blue-700", dot: "bg-blue-500" },
    pending: { label: "Pending", bg: "bg-amber-50", text: "text-amber-700", dot: "bg-amber-500" },
  };
  const c = config[status];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full ${c.bg} px-2.5 py-1 text-xs font-medium ${c.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
}

export default function PartnersPage() {
  const [partners] = useState<Partner[]>(DEMO_PARTNERS);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | Partner["status"]>("all");
  const [companyName, setCompanyName] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from("profiles")
        .select("companies(name)")
        .eq("id", user.id)
        .single();
      const companies = profile?.companies as unknown as { name: string } | { name: string }[] | null;
      const comp = Array.isArray(companies) ? companies[0] : companies;
      setCompanyName(comp?.name || "");
    };
    load();
  }, []);

  const filtered = partners.filter((p) => {
    if (statusFilter !== "all" && p.status !== statusFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const totalRevenue = partners.reduce((s, p) => s + p.revenue, 0);
  const totalBookings = partners.reduce((s, p) => s + p.bookingsThisMonth, 0);
  const totalProducts = partners.reduce((s, p) => s + p.products, 0);
  const totalCommission = partners.reduce((s, p) => s + p.commission, 0);
  const activeCount = partners.filter((p) => p.status === "active").length;

  return (
    <>
      {/* Header */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700 p-8 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 21h18" />
                <path d="M5 21V7l7-4 7 4v14" />
                <path d="M9 21v-6h6v6" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold">Partners</h1>
              <p className="text-emerald-100 text-sm mt-0.5">Venues & suppliers connected to TicketMatch</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-right">
            <div>
              <p className="text-3xl font-bold">{activeCount}</p>
              <p className="text-emerald-200 text-xs">Live partners</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold">{partners.length}</p>
              <p className="text-emerald-200 text-xs">Total</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4 mb-6">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted">Bookings (month)</p>
              <p className="text-xl font-bold">{totalBookings}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted">Revenue (month)</p>
              <p className="text-xl font-bold">&euro;{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted">Products listed</p>
              <p className="text-xl font-bold">{totalProducts}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <p className="text-xs text-muted">Commission (month)</p>
              <p className="text-xl font-bold">&euro;{totalCommission.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" />
            <path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search partners or cities..."
            className="h-11 w-full rounded-xl border border-border/60 bg-white pl-10 pr-4 text-sm outline-none focus:border-accent focus:ring-2 focus:ring-accent/10"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "active", "integration", "pending"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                statusFilter === s
                  ? "bg-foreground text-white shadow-sm"
                  : "bg-white border border-border/60 text-muted hover:bg-gray-50"
              }`}
            >
              {s === "all" ? "All" : s === "active" ? "Live" : s === "integration" ? "Integrating" : "Pending"}
            </button>
          ))}
        </div>
      </div>

      {/* Partners table */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
        {/* Desktop table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40 bg-gray-50/50">
                <th className="px-6 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Partner</th>
                <th className="px-4 py-3.5 text-left text-xs font-semibold text-muted uppercase tracking-wide">Status</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Products</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Bookings</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Revenue</th>
                <th className="px-4 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Commission</th>
                <th className="px-6 py-3.5 text-right text-xs font-semibold text-muted uppercase tracking-wide">Last Active</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600">
                        {p.name.charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted">{p.city}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4"><StatusBadge status={p.status} /></td>
                  <td className="px-4 py-4 text-right text-sm font-medium">{p.products}</td>
                  <td className="px-4 py-4 text-right text-sm font-medium">{p.bookingsThisMonth}</td>
                  <td className="px-4 py-4 text-right text-sm font-medium">&euro;{p.revenue.toLocaleString()}</td>
                  <td className="px-4 py-4 text-right text-sm font-medium text-emerald-600">&euro;{p.commission.toLocaleString()}</td>
                  <td className="px-6 py-4 text-right text-xs text-muted">{p.lastActivity}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-sm text-muted">No partners match your filters.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border/30">
          {filtered.map((p) => (
            <div key={p.id} className="px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-sm font-bold text-emerald-600">
                    {p.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{p.name}</p>
                    <p className="text-xs text-muted">{p.city}</p>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                  <p className="text-xs text-muted">Products</p>
                  <p className="text-sm font-bold">{p.products}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                  <p className="text-xs text-muted">Bookings</p>
                  <p className="text-sm font-bold">{p.bookingsThisMonth}</p>
                </div>
                <div className="rounded-lg bg-gray-50 px-3 py-2 text-center">
                  <p className="text-xs text-muted">Revenue</p>
                  <p className="text-sm font-bold">&euro;{p.revenue.toLocaleString()}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Info banner */}
      <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4" />
              <path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-emerald-800">Partner data is demo content</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              These are example partners to show how this page will look once venues are connected via Tiqets, GetYourGuide, Viator, or direct integration. Real data will appear here once integrations go live.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
