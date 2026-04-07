"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Stats {
  totalBookings: number;
  activeGroups: number;
  totalValue: number;
  pendingBookings: number;
  totalGuests: number;
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
  const [stats, setStats] = useState<Stats>({ totalBookings: 0, activeGroups: 0, totalValue: 0, pendingBookings: 0, totalGuests: 0 });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [allBookings, setAllBookings] = useState<Booking[]>([]);

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

      const totalGuests = groups.reduce((sum: number, gr: { number_of_guests: number }) => sum + (gr.number_of_guests || 0), 0);
      setStats({
        totalBookings: bookings.length,
        activeGroups: groups.length,
        totalValue,
        pendingBookings: bookings.filter((bk: Booking) => bk.status === "pending").length,
        totalGuests,
      });
      setAllBookings(bookings);
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

      {/* Savings Calculator */}
      {stats.totalBookings > 0 && (() => {
        // Calculate savings: group rate vs individual walk-in prices
        // TicketMatch offers ~15-25% discount vs walk-in individual prices
        const discountRate = 0.20; // average 20% group discount
        const adminSavingsPerBooking = 12.50; // saved time per booking (manual emails, calls, etc.)
        const walkInTotal = stats.totalValue / (1 - discountRate); // what they'd pay at walk-in rates
        const ticketSavings = walkInTotal - stats.totalValue;
        const adminSavings = stats.totalBookings * adminSavingsPerBooking;
        const totalSavings = ticketSavings + adminSavings;
        const savingsPercentage = ((totalSavings / (walkInTotal + adminSavings)) * 100).toFixed(0);

        return (
          <div className="mb-8 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-green-50 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-bold text-emerald-900">Your Savings with TicketMatch</h2>
                  <p className="text-xs text-emerald-600">Compared to individual walk-in pricing & manual booking</p>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <p className="text-3xl font-bold text-emerald-700">{savingsPercentage}%</p>
                <p className="text-xs text-emerald-500 font-medium">total saved</p>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl bg-white/70 p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500">
                    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                  </svg>
                  <p className="text-xs font-medium text-emerald-600">Group Rate Discount</p>
                </div>
                <p className="text-2xl font-bold text-emerald-800">&euro; {ticketSavings.toFixed(0)}</p>
                <p className="text-[11px] text-emerald-500 mt-0.5">vs. individual walk-in prices</p>
              </div>
              <div className="rounded-xl bg-white/70 p-4 border border-emerald-100">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-emerald-500">
                    <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                  </svg>
                  <p className="text-xs font-medium text-emerald-600">Time Saved</p>
                </div>
                <p className="text-2xl font-bold text-emerald-800">&euro; {adminSavings.toFixed(0)}</p>
                <p className="text-[11px] text-emerald-500 mt-0.5">{stats.totalBookings} bookings × no manual work</p>
              </div>
              <div className="rounded-xl bg-emerald-600 p-4 text-white">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-emerald-200">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
                  </svg>
                  <p className="text-xs font-medium text-emerald-200">Total Savings</p>
                </div>
                <p className="text-2xl font-bold">&euro; {totalSavings.toFixed(0)}</p>
                <p className="text-[11px] text-emerald-200 mt-0.5">across {stats.totalBookings} bookings</p>
              </div>
            </div>

            {/* Savings bar */}
            <div className="mt-4 rounded-lg bg-white/50 p-3 border border-emerald-100">
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-emerald-600 font-medium">You paid</span>
                <span className="text-emerald-400">Walk-in price would be</span>
              </div>
              <div className="h-3 rounded-full bg-emerald-100 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                  style={{ width: `${100 - parseFloat(savingsPercentage)}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs mt-1.5">
                <span className="font-bold text-emerald-800">&euro; {stats.totalValue.toFixed(0)}</span>
                <span className="text-emerald-400">&euro; {(walkInTotal + adminSavings).toFixed(0)}</span>
              </div>
            </div>
          </div>
        );
      })()}

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
