"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  totalBookings: number;
  activeGroups: number;
  totalValue: number;
  pendingBookings: number;
}

interface Booking {
  id: string;
  venue_name: string;
  venue_city: string | null;
  total_price: number;
  status: string;
  created_at: string;
  groups: { name: string } | null;
}

const quickActions = [
  { label: "Browse Catalog", href: "/dashboard/catalog", desc: "Explore museums, attractions and more." },
  { label: "Create Itinerary", href: "/dashboard/itinerary", desc: "Build a day-by-day plan for your group." },
  { label: "Manage Groups", href: "/dashboard/groups", desc: "Create and manage your tour groups." },
  { label: "View Bookings", href: "/dashboard/bookings", desc: "Track all your bookings and vouchers." },
];

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, activeGroups: 0, totalValue: 0, pendingBookings: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load company name
    import("@/lib/supabase").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (user) {
          supabase.from("profiles").select("companies(name)").eq("id", user.id).single().then(({ data }) => {
            const companies = data?.companies as unknown as { name: string } | { name: string }[] | null;
            const name = Array.isArray(companies) ? companies[0]?.name || "" : companies?.name || "";
            setCompanyName(name);
          });
        }
      });
    });

    Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]).then(([g, b]) => {
      const groups = g.groups || [];
      const bookings = b.bookings || [];
      const totalValue = bookings.reduce((sum: number, bk: Booking) => sum + Number(bk.total_price), 0);

      setStats({
        totalBookings: bookings.length,
        activeGroups: groups.length,
        totalValue,
        pendingBookings: bookings.filter((bk: Booking) => bk.status === "pending").length,
      });
      setRecentBookings(bookings.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
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
      {/* Welcome banner */}
      <div className="mb-8 rounded-2xl bg-gradient-to-r from-[#0f1729] to-[#1e3a5f] p-8 text-white shadow-xl shadow-blue-900/10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome back{companyName ? `, ${companyName}` : ""}</h1>
            <p className="mt-1 text-sm text-blue-200/70">Here&apos;s what&apos;s happening with your bookings today.</p>
          </div>
          <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/20 ring-1 ring-blue-400/20">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold">{stats.totalBookings}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Active Groups</p>
          <p className="mt-2 text-3xl font-bold">{stats.activeGroups}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Pending</p>
          <p className="mt-2 text-3xl font-bold text-amber-600">{stats.pendingBookings}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Total Value</p>
          <p className="mt-2 text-3xl font-bold text-accent">&euro; {stats.totalValue.toFixed(2)}</p>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-2xl border border-border/60 bg-white p-6 shadow-sm transition-all hover:border-accent/30 hover:shadow-lg hover:shadow-accent/5"
            >
              <h3 className="font-semibold group-hover:text-accent transition-colors">{action.label}</h3>
              <p className="mt-1 text-sm text-muted">{action.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Go &rarr;
              </span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
        {recentBookings.length > 0 ? (
          <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
            {recentBookings.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between px-6 py-4 transition-colors hover:bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /></svg>
                  </div>
                  <div>
                    <p className="font-medium">{booking.venue_name}</p>
                    <p className="text-xs text-muted">
                      {booking.groups?.name || "—"} &middot; {booking.venue_city} &middot; {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-accent">&euro; {Number(booking.total_price).toFixed(2)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                    booking.status === "cancelled" ? "bg-red-100 text-red-700" :
                    "bg-amber-100 text-amber-700"
                  }`}>{booking.status}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
            <p className="text-sm text-muted">No recent activity yet.</p>
            <p className="mt-1 text-xs text-muted/60">Your bookings and group updates will appear here.</p>
          </div>
        )}
      </div>
    </>
  );
}
