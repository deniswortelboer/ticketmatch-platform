"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import CurrencySelector, { useCurrency } from "@/components/CurrencySelector";

interface Stats {
  totalBookings: number;
  activeGroups: number;
  totalValue: number;
  pendingBookings: number;
  totalGuests: number;
  thisWeekRevenue: number;
  lastWeekRevenue: number;
  pendingOver48hCount: number;
  groupsTravelingTomorrowCount: number;
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

interface Group {
  id: string;
  name: string;
  number_of_guests?: number;
  travel_date?: string | null;
}

function timeOfDayGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function tomorrowYmd(): string {
  const t = new Date();
  t.setDate(t.getDate() + 1);
  return t.toISOString().slice(0, 10);
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<Stats>({
    totalBookings: 0, activeGroups: 0, totalValue: 0, pendingBookings: 0,
    totalGuests: 0, thisWeekRevenue: 0, lastWeekRevenue: 0,
    pendingOver48hCount: 0, groupsTravelingTomorrowCount: 0,
  });
  const [recentBookings, setRecentBookings] = useState<Booking[]>([]);
  const [firstName, setFirstName] = useState("");
  const [loading, setLoading] = useState(true);
  const { format } = useCurrency();

  useEffect(() => {
    // Resolve a friendly first name for the greeting (falls back to email-local).
    import("@/lib/supabase").then(({ createClient }) => {
      const supabase = createClient();
      supabase.auth.getUser().then(({ data: { user } }) => {
        if (!user) return;
        const meta = (user.user_metadata || {}) as { full_name?: string; name?: string };
        const full = meta.full_name || meta.name || "";
        if (full) {
          setFirstName(full.split(" ")[0]);
        } else if (user.email) {
          setFirstName(user.email.split("@")[0]);
        }
      });
    });

    Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]).then(([g, b]) => {
      const groups: Group[] = g.groups || [];
      const bookings: Booking[] = b.bookings || [];

      const now = Date.now();
      const WEEK = 7 * 24 * 60 * 60 * 1000;
      const HOURS_48 = 48 * 60 * 60 * 1000;
      const tmrw = tomorrowYmd();

      const thisWeek = bookings
        .filter((bk) => now - new Date(bk.created_at).getTime() < WEEK)
        .reduce((sum, bk) => sum + Number(bk.total_price), 0);
      const lastWeek = bookings
        .filter((bk) => {
          const age = now - new Date(bk.created_at).getTime();
          return age >= WEEK && age < 2 * WEEK;
        })
        .reduce((sum, bk) => sum + Number(bk.total_price), 0);

      const pendingOver48h = bookings.filter(
        (bk) => bk.status === "pending" && now - new Date(bk.created_at).getTime() > HOURS_48
      ).length;

      const groupsTravelingTomorrow = groups.filter(
        (gr) => gr.travel_date && gr.travel_date.slice(0, 10) === tmrw
      ).length;

      const totalValue = bookings.reduce((sum, bk) => sum + Number(bk.total_price), 0);
      const totalGuests = groups.reduce((sum, gr) => sum + (gr.number_of_guests || 0), 0);

      setStats({
        totalBookings: bookings.length,
        activeGroups: groups.length,
        totalValue,
        pendingBookings: bookings.filter((bk) => bk.status === "pending").length,
        totalGuests,
        thisWeekRevenue: thisWeek,
        lastWeekRevenue: lastWeek,
        pendingOver48hCount: pendingOver48h,
        groupsTravelingTomorrowCount: groupsTravelingTomorrow,
      });
      setRecentBookings(bookings.slice(0, 5));
      setLoading(false);
    });
  }, []);

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  // ── Needs-your-attention items ──
  type AttentionItem = { kind: string; severity: "warn" | "alert"; text: React.ReactNode; href: string; cta: string };
  const attention: AttentionItem[] = [];
  if (stats.groupsTravelingTomorrowCount > 0) {
    attention.push({
      kind: "travel",
      severity: "alert",
      text: <><strong>{stats.groupsTravelingTomorrowCount} group{stats.groupsTravelingTomorrowCount > 1 ? "s" : ""}</strong> travel{stats.groupsTravelingTomorrowCount === 1 ? "s" : ""} tomorrow — make sure tickets are sent.</>,
      href: "/dashboard/bookings",
      cta: "Send now →",
    });
  }
  if (stats.pendingOver48hCount > 0) {
    attention.push({
      kind: "stale",
      severity: "warn",
      text: <><strong>{stats.pendingOver48hCount} booking{stats.pendingOver48hCount > 1 ? "s" : ""}</strong> pending venue confirmation &gt;48h.</>,
      href: "/dashboard/bookings",
      cta: "Chase →",
    });
  }
  if (stats.pendingBookings > 0 && stats.pendingOver48hCount === 0) {
    attention.push({
      kind: "pending",
      severity: "warn",
      text: <><strong>{stats.pendingBookings} pending booking{stats.pendingBookings > 1 ? "s" : ""}</strong> awaiting confirmation.</>,
      href: "/dashboard/bookings",
      cta: "Review →",
    });
  }

  const weekDelta = stats.thisWeekRevenue - stats.lastWeekRevenue;
  const weekDeltaSign = weekDelta >= 0 ? "+" : "−";

  // Savings (simplified — KPI tile, not hero)
  const discountRate = 0.20;
  const savingsPct = stats.totalBookings > 0
    ? Math.round(discountRate * 100)
    : 0;
  const ytdSavings = stats.totalValue * (discountRate / (1 - discountRate));

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Greeting */}
      <header>
        <h1 className="text-2xl font-bold tracking-tight">
          {timeOfDayGreeting()}{firstName ? `, ${firstName}` : ""}
        </h1>
        <p className="mt-1 text-sm text-muted">Here's what needs your attention today.</p>
      </header>

      {/* Needs your attention */}
      <section className={`rounded-2xl border p-5 shadow-sm ${
        attention.length > 0
          ? "border-amber-200 bg-amber-50/60"
          : "border-emerald-200 bg-emerald-50/40"
      }`}>
        <div className="mb-3 flex items-center gap-2">
          {attention.length > 0 ? (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-amber-700">⚠</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-amber-900">
                Needs your attention ({attention.length})
              </h2>
            </>
          ) : (
            <>
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">✓</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-900">All caught up</h2>
            </>
          )}
        </div>
        {attention.length > 0 ? (
          <ul className="divide-y divide-amber-200/40">
            {attention.map((item) => (
              <li key={item.kind} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <span className="text-sm text-foreground/90">{item.text}</span>
                <Link href={item.href} className="text-xs font-semibold text-amber-700 hover:text-amber-900 whitespace-nowrap">
                  {item.cta}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-emerald-800/80">No travel tomorrow, nothing pending too long, nothing overdue.</p>
        )}
      </section>

      {/* KPI row */}
      <section className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "This week",
            value: format(stats.thisWeekRevenue),
            sub: stats.lastWeekRevenue > 0
              ? `${weekDeltaSign}${format(Math.abs(weekDelta))} vs last week`
              : "first week with bookings",
            tone: "accent",
          },
          {
            label: "Active groups",
            value: String(stats.activeGroups),
            sub: stats.totalGuests > 0 ? `${stats.totalGuests} guests total` : "—",
            tone: "default",
          },
          {
            label: "Pending bookings",
            value: String(stats.pendingBookings),
            sub: stats.pendingOver48hCount > 0
              ? `${stats.pendingOver48hCount} stale (>48h)`
              : "all fresh",
            tone: stats.pendingOver48hCount > 0 ? "warn" : "default",
          },
          {
            label: "Savings YTD",
            value: format(ytdSavings),
            sub: `${savingsPct}% group rate vs walk-in`,
            tone: "success",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{kpi.label}</p>
              {kpi.label === "This week" && <CurrencySelector compact />}
            </div>
            <p className={`mt-2 text-2xl font-bold tracking-tight ${
              kpi.tone === "accent" ? "text-accent"
              : kpi.tone === "success" ? "text-emerald-700"
              : kpi.tone === "warn" ? "text-amber-700"
              : ""
            }`}>{kpi.value}</p>
            <p className="mt-1 text-xs text-muted">{kpi.sub}</p>
          </div>
        ))}
      </section>

      {/* Action cards — the three most-frequent daily tasks */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              icon: "👥",
              title: "+ New group",
              desc: "Start with a passenger list or empty.",
              href: "/dashboard/groups",
              cls: "from-blue-50 to-white border-blue-200/60",
            },
            {
              icon: "🎫",
              title: "+ Book venue",
              desc: "For an existing group.",
              href: "/dashboard/experiences",
              cls: "from-orange-50 to-white border-orange-200/60",
            },
            {
              icon: "📄",
              title: "Generate invoice",
              desc: "For a group ready to bill.",
              href: "/dashboard/bookings",
              cls: "from-emerald-50 to-white border-emerald-200/60",
            },
          ].map((a) => (
            <Link
              key={a.title}
              href={a.href}
              className={`group rounded-2xl border bg-gradient-to-br ${a.cls} p-5 transition-all hover:-translate-y-0.5 hover:shadow-md`}
            >
              <div className="text-2xl leading-none">{a.icon}</div>
              <h3 className="mt-3 font-semibold text-foreground">{a.title}</h3>
              <p className="mt-1 text-sm text-muted">{a.desc}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-accent opacity-0 transition-opacity group-hover:opacity-100">
                Continue →
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent activity (kept) */}
      <section>
        <h2 className="mb-3 text-sm font-bold uppercase tracking-wider text-muted">Recent activity</h2>
        {recentBookings.length > 0 ? (
          <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
            {recentBookings.map((booking) => (
              <Link
                key={booking.id}
                href="/dashboard/bookings"
                className="flex items-center justify-between px-5 py-4 transition-colors hover:bg-gray-50/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    🎫
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium truncate">{booking.venue_name}</p>
                    <p className="text-xs text-muted truncate">
                      {booking.groups?.name || "—"} · {booking.venue_city || "—"} · {formatDate(booking.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-accent">{format(Number(booking.total_price))}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                    booking.status === "confirmed" ? "bg-green-100 text-green-700"
                    : booking.status === "cancelled" ? "bg-red-100 text-red-700"
                    : "bg-amber-100 text-amber-700"
                  }`}>{booking.status}</span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
            <p className="text-sm text-muted">No recent activity yet.</p>
            <p className="mt-1 text-xs text-muted/60">Your bookings and group updates will appear here.</p>
          </div>
        )}
      </section>
    </div>
  );
}
