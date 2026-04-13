"use client";

import { useState, useEffect, useMemo } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, CartesianGrid } from "recharts";

type Company = {
  id: string;
  name: string;
  company_type: string;
  status: string;
  message: string;
  created_at: string;
};

type Booking = {
  id: string;
  venue_name: string;
  venue_category: string | null;
  venue_city: string | null;
  number_of_guests: number;
  unit_price: number;
  total_price: number;
  status: string;
  scheduled_date: string | null;
  created_at: string;
  companies: { name: string } | { name: string }[] | null;
  groups: { name: string } | { name: string }[] | null;
};

type Group = {
  id: string;
  name: string;
  number_of_guests: number;
  status: string;
  travel_date: string | null;
  created_at: string;
  companies: { name: string } | { name: string }[] | null;
};

const PIE_COLORS = ["#3b82f6", "#8b5cf6", "#f59e0b", "#10b981", "#ef4444", "#ec4899"];
const PLAN_COLORS: Record<string, string> = { free: "#6b7280", pro: "#3b82f6", enterprise: "#8b5cf6" };

function parsePlan(message: string): string {
  try { return JSON.parse(message)?.plan || "free"; } catch { return "free"; }
}

function parseRole(message: string): string {
  try { return JSON.parse(message)?.role || "client"; } catch { return "client"; }
}

function getMonthKey(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function getMonthLabel(key: string): string {
  const [y, m] = key.split("-");
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  return `${months[parseInt(m) - 1]} ${y.slice(2)}`;
}

function KpiCard({ label, value, sub, icon, color }: { label: string; value: string | number; sub?: string; icon: string; color: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-[11px] text-muted mt-1">{sub}</p>}
        </div>
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${color} text-xl`}>{icon}</div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/admin")
      .then((r) => {
        if (!r.ok) throw new Error("Unauthorized");
        return r.json();
      })
      .then((d) => {
        setCompanies(d.companies || []);
        setBookings(d.bookings || []);
        setGroups(d.groups || []);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // KPIs
  const totalRevenue = useMemo(() => bookings.reduce((s, b) => s + (b.total_price || 0), 0), [bookings]);
  const totalGuests = useMemo(() => bookings.reduce((s, b) => s + (b.number_of_guests || 0), 0), [bookings]);
  const confirmedBookings = useMemo(() => bookings.filter((b) => b.status === "confirmed").length, [bookings]);
  const approvedCompanies = useMemo(() => companies.filter((c) => c.status === "approved").length, [companies]);
  const pendingCompanies = useMemo(() => companies.filter((c) => c.status === "pending").length, [companies]);

  // Plan distribution
  const planData = useMemo(() => {
    const counts: Record<string, number> = { free: 0, pro: 0, enterprise: 0 };
    companies.forEach((c) => { const p = parsePlan(c.message); counts[p] = (counts[p] || 0) + 1; });
    return Object.entries(counts).filter(([, v]) => v > 0).map(([name, value]) => ({ name, value }));
  }, [companies]);

  // Company types
  const typeData = useMemo(() => {
    const counts: Record<string, number> = {};
    companies.forEach((c) => {
      const t = c.company_type || "unknown";
      counts[t] = (counts[t] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [companies]);

  // Roles (client vs reseller vs supplier)
  const roleData = useMemo(() => {
    const counts: Record<string, number> = {};
    companies.forEach((c) => {
      const r = parseRole(c.message);
      counts[r] = (counts[r] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).map(([name, value]) => ({ name, value }));
  }, [companies]);

  // Registrations over time (monthly)
  const regTimeline = useMemo(() => {
    const months: Record<string, number> = {};
    companies.forEach((c) => {
      if (!c.created_at) return;
      const key = getMonthKey(c.created_at);
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).sort().map(([key, count]) => ({ month: getMonthLabel(key), count }));
  }, [companies]);

  // Revenue over time (monthly)
  const revenueTimeline = useMemo(() => {
    const months: Record<string, number> = {};
    bookings.forEach((b) => {
      if (!b.created_at) return;
      const key = getMonthKey(b.created_at);
      months[key] = (months[key] || 0) + (b.total_price || 0);
    });
    return Object.entries(months).sort().map(([key, revenue]) => ({ month: getMonthLabel(key), revenue: Math.round(revenue) }));
  }, [bookings]);

  // Bookings over time (monthly)
  const bookingTimeline = useMemo(() => {
    const months: Record<string, number> = {};
    bookings.forEach((b) => {
      if (!b.created_at) return;
      const key = getMonthKey(b.created_at);
      months[key] = (months[key] || 0) + 1;
    });
    return Object.entries(months).sort().map(([key, count]) => ({ month: getMonthLabel(key), count }));
  }, [bookings]);

  // Top venues
  const topVenues = useMemo(() => {
    const counts: Record<string, { bookings: number; guests: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const name = b.venue_name || "Unknown";
      if (!counts[name]) counts[name] = { bookings: 0, guests: 0, revenue: 0 };
      counts[name].bookings += 1;
      counts[name].guests += b.number_of_guests || 0;
      counts[name].revenue += b.total_price || 0;
    });
    return Object.entries(counts).sort((a, b) => b[1].bookings - a[1].bookings).slice(0, 8)
      .map(([name, data]) => ({ name: name.length > 20 ? name.slice(0, 20) + "..." : name, ...data }));
  }, [bookings]);

  // Top cities
  const cityData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => {
      const city = b.venue_city || "Unknown";
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 8)
      .map(([name, value]) => ({ name, value }));
  }, [bookings]);

  // Booking status
  const statusData = useMemo(() => {
    const counts: Record<string, number> = {};
    bookings.forEach((b) => { counts[b.status] = (counts[b.status] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [bookings]);

  // Top companies by booking count
  const topCompanies = useMemo(() => {
    const counts: Record<string, { bookings: number; revenue: number }> = {};
    bookings.forEach((b) => {
      const comp = b.companies;
      const name = Array.isArray(comp) ? comp[0]?.name : (comp as { name: string } | null)?.name || "Unknown";
      if (!counts[name]) counts[name] = { bookings: 0, revenue: 0 };
      counts[name].bookings += 1;
      counts[name].revenue += b.total_price || 0;
    });
    return Object.entries(counts).sort((a, b) => b[1].bookings - a[1].bookings).slice(0, 5)
      .map(([name, data]) => ({ name, ...data }));
  }, [bookings]);

  // Recent activity
  const recentCompanies = companies.slice(0, 5);
  const recentBookings = bookings.slice(0, 5);

  // Average booking value
  const avgBookingValue = bookings.length > 0 ? totalRevenue / bookings.length : 0;
  const avgGroupSize = bookings.length > 0 ? totalGuests / bookings.length : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <div className="h-10 w-10 mx-auto animate-spin rounded-full border-3 border-blue-500 border-t-transparent" />
          <p className="text-sm text-muted mt-4">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <p className="text-lg font-semibold text-red-500">Access denied</p>
          <p className="text-sm text-muted mt-2">Admin access required for analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-purple-600 via-purple-700 to-indigo-700 p-6 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">Analytics Dashboard</h1>
            <p className="text-purple-200 text-sm">Real-time platform metrics — all data live from Supabase</p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Companies" value={companies.length} sub={`${approvedCompanies} approved · ${pendingCompanies} pending`} icon="🏢" color="bg-blue-50" />
        <KpiCard label="Total Bookings" value={bookings.length} sub={`${confirmedBookings} confirmed`} icon="🎫" color="bg-purple-50" />
        <KpiCard label="Total Revenue" value={`€${totalRevenue.toLocaleString("nl-NL", { minimumFractionDigits: 0 })}`} sub={`Avg €${Math.round(avgBookingValue)} per booking`} icon="💰" color="bg-green-50" />
        <KpiCard label="Total Guests" value={totalGuests.toLocaleString()} sub={`Avg ${Math.round(avgGroupSize)} per booking`} icon="👥" color="bg-amber-50" />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Active Groups" value={groups.filter((g) => g.status === "confirmed" || g.status === "draft").length} sub={`${groups.length} total`} icon="📋" color="bg-cyan-50" />
        <KpiCard label="Plan: Pro" value={planData.find((p) => p.name === "pro")?.value || 0} sub={`of ${companies.length} total`} icon="⭐" color="bg-indigo-50" />
        <KpiCard label="Plan: Enterprise" value={planData.find((p) => p.name === "enterprise")?.value || 0} sub="Premium clients" icon="🏆" color="bg-violet-50" />
        <KpiCard label="Conversion Rate" value={companies.length > 0 ? `${Math.round(((planData.find((p) => p.name === "pro")?.value || 0) + (planData.find((p) => p.name === "enterprise")?.value || 0)) / companies.length * 100)}%` : "0%"} sub="Free → Paid" icon="📈" color="bg-rose-50" />
      </div>

      {/* Row 1: Registrations + Revenue Timeline */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Registrations over time</h3>
          {regTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={regTimeline}>
                <defs>
                  <linearGradient id="gradReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={2} fill="url(#gradReg)" name="Registrations" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted">No data yet</div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Revenue over time</h3>
          {revenueTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={revenueTimeline}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: unknown) => { const val = Number(v); return [`€${val.toLocaleString()}`, "Revenue"]; }} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#gradRev)" name="Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted">No bookings yet</div>
          )}
        </div>
      </div>

      {/* Row 2: Bookings timeline + Plan distribution */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Bookings over time</h3>
          {bookingTimeline.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={bookingTimeline}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted">No bookings yet</div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Plan distribution</h3>
          <div className="flex items-center gap-6">
            <div className="w-[160px] h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={planData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {planData.map((entry, i) => (
                      <Cell key={entry.name} fill={PLAN_COLORS[entry.name] || PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {planData.map((p) => (
                <div key={p.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PLAN_COLORS[p.name] || "#6b7280" }} />
                  <span className="text-sm capitalize">{p.name}</span>
                  <span className="text-sm font-bold ml-auto">{p.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 3: Company types + Roles */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Company types</h3>
          {typeData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={typeData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={120} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#f59e0b" radius={[0, 4, 4, 0]} name="Companies" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted">No data yet</div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">User roles</h3>
          <div className="flex items-center gap-6">
            <div className="w-[160px] h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={roleData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {roleData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {roleData.map((r, i) => (
                <div key={r.name} className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-sm capitalize">{r.name}</span>
                  <span className="text-sm font-bold ml-auto">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Row 4: Top venues + Top cities */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Top venues by bookings</h3>
          {topVenues.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={topVenues} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis type="number" allowDecimals={false} tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="bookings" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted">No bookings yet</div>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Bookings by city</h3>
          {cityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Bar dataKey="value" fill="#ec4899" radius={[4, 4, 0, 0]} name="Bookings" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[260px] text-sm text-muted">No bookings yet</div>
          )}
        </div>
      </div>

      {/* Row 5: Booking status + Top companies */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Booking status breakdown</h3>
          <div className="flex items-center gap-6">
            <div className="w-[160px] h-[160px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {statusData.map((entry, i) => {
                      const color = entry.name === "confirmed" ? "#10b981" : entry.name === "pending" ? "#f59e0b" : entry.name === "cancelled" ? "#ef4444" : PIE_COLORS[i];
                      return <Cell key={entry.name} fill={color} />;
                    })}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-3">
              {statusData.map((s) => {
                const color = s.name === "confirmed" ? "#10b981" : s.name === "pending" ? "#f59e0b" : s.name === "cancelled" ? "#ef4444" : "#6b7280";
                return (
                  <div key={s.name} className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-sm capitalize">{s.name}</span>
                    <span className="text-sm font-bold ml-auto">{s.value}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Top companies</h3>
          {topCompanies.length > 0 ? (
            <div className="space-y-3">
              {topCompanies.map((c, i) => (
                <div key={c.name} className="flex items-center gap-3 rounded-xl bg-gray-50 px-4 py-3">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold text-white ${
                    i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : i === 2 ? "bg-orange-400" : "bg-gray-300"
                  }`}>
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{c.name}</p>
                    <p className="text-[10px] text-muted">{c.bookings} bookings</p>
                  </div>
                  <p className="text-sm font-bold text-green-600">€{Math.round(c.revenue).toLocaleString()}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm text-muted">No bookings yet</div>
          )}
        </div>
      </div>

      {/* Row 6: Recent activity */}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Recent registrations</h3>
          {recentCompanies.length > 0 ? (
            <div className="space-y-2">
              {recentCompanies.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5">
                  <div>
                    <p className="text-sm font-medium">{c.name}</p>
                    <p className="text-[10px] text-muted">{c.company_type} · {new Date(c.created_at).toLocaleDateString("nl-NL")}</p>
                  </div>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    c.status === "approved" ? "bg-green-50 text-green-600" : "bg-amber-50 text-amber-600"
                  }`}>
                    {c.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">No registrations yet</p>
          )}
        </div>

        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4">Recent bookings</h3>
          {recentBookings.length > 0 ? (
            <div className="space-y-2">
              {recentBookings.map((b) => {
                const comp = b.companies;
                const compName = Array.isArray(comp) ? comp[0]?.name : (comp as { name: string } | null)?.name || "—";
                return (
                  <div key={b.id} className="flex items-center justify-between rounded-lg border border-border/30 px-3 py-2.5">
                    <div>
                      <p className="text-sm font-medium">{b.venue_name}</p>
                      <p className="text-[10px] text-muted">{compName} · {b.number_of_guests} guests · {new Date(b.created_at).toLocaleDateString("nl-NL")}</p>
                    </div>
                    <span className="text-sm font-bold text-green-600">€{Math.round(b.total_price || 0)}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted text-center py-8">No bookings yet</p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-xs text-muted">
          <span>TicketMatch Analytics — Live data from Supabase</span>
          <span>Last updated: {new Date().toLocaleString("nl-NL")}</span>
        </div>
      </div>
    </div>
  );
}
