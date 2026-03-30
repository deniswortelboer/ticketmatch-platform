import Link from "next/link";

const stats = [
  { label: "Total Bookings", value: "0", change: null },
  { label: "Active Groups", value: "0", change: null },
  { label: "Venues Available", value: "45+", change: null },
  { label: "Cities", value: "2", change: null },
];

const quickActions = [
  { label: "Browse Catalog", href: "/dashboard/catalog", desc: "Explore museums, attractions and more." },
  { label: "Create Itinerary", href: "/dashboard/itinerary", desc: "Build a day-by-day plan for your group." },
  { label: "Upload Guest List", href: "/dashboard/groups", desc: "Import your group via CSV or Excel." },
  { label: "View Bookings", href: "/dashboard/bookings", desc: "Track all your bookings and vouchers." },
];

export default function DashboardOverview() {
  return (
    <>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="mt-1 text-sm text-muted">Welcome back. Here&apos;s your overview.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/60 bg-white p-6">
            <p className="text-sm text-muted">{stat.label}</p>
            <p className="mt-2 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="mb-8">
        <h2 className="mb-4 text-lg font-semibold">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {quickActions.map((action) => (
            <Link
              key={action.label}
              href={action.href}
              className="group rounded-2xl border border-border/60 bg-white p-6 transition-all hover:border-border hover:shadow-lg hover:shadow-black/[0.03]"
            >
              <h3 className="font-semibold group-hover:text-accent">{action.label}</h3>
              <p className="mt-1 text-sm text-muted">{action.desc}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div>
        <h2 className="mb-4 text-lg font-semibold">Recent activity</h2>
        <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <p className="text-sm text-muted">No recent activity yet.</p>
          <p className="mt-1 text-xs text-muted/60">Your bookings and group updates will appear here.</p>
        </div>
      </div>
    </>
  );
}
