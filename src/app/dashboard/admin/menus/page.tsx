"use client";

import Link from "next/link";

const tourAgencyMenu = [
  { href: "/dashboard", label: "Overview", icon: "grid", color: "blue" },
  { href: "/dashboard/catalog", label: "Catalog", icon: "search", color: "blue" },
  { href: "/dashboard/bookings", label: "Bookings", icon: "ticket", color: "blue" },
  { href: "/dashboard/groups", label: "Groups", icon: "users", color: "blue" },
  { href: "/dashboard/itinerary", label: "Itinerary", icon: "calendar", color: "blue" },
  { href: "/dashboard/pricing", label: "Plans", icon: "zap", color: "blue" },
  { href: "/dashboard/knowledge", label: "Knowledge Base", icon: "book", color: "blue" },
  { href: "/dashboard/affiliate", label: "Refer & Earn", icon: "gift", color: "blue" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings", color: "blue" },
];

const resellerMenu = [
  { href: "/dashboard/reseller", label: "Dashboard", icon: "grid", color: "green" },
  { href: "/dashboard/reseller/clients", label: "My Clients", icon: "users", color: "green" },
  { href: "/dashboard/reseller/terms", label: "Terms", icon: "book", color: "green" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings", color: "green" },
];

const developerMenu = [
  { href: "/dashboard/partner", label: "Overview", icon: "grid", color: "cyan" },
  { href: "/dashboard/partner/docs", label: "API Docs", icon: "code", color: "cyan" },
  { href: "/dashboard/profile", label: "Company", icon: "building", color: "cyan" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings", color: "cyan" },
];

const partnerMenu = [
  { href: "/dashboard/partners#overview", label: "Overview", icon: "grid", color: "emerald" },
  { href: "/dashboard/partners#products", label: "My Products", icon: "ticket", color: "emerald" },
  { href: "/dashboard/partners#bookings", label: "Bookings", icon: "calendar", color: "emerald" },
  { href: "/dashboard/partners#revenue", label: "Revenue", icon: "zap", color: "emerald" },
  { href: "/dashboard/partners#contract", label: "Contract", icon: "book", color: "emerald" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings", color: "emerald" },
];

function MenuIcon({ type }: { type: string }) {
  const props = { width: 16, height: 16, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  switch (type) {
    case "grid": return <svg {...props}><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>;
    case "search": return <svg {...props}><circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" /></svg>;
    case "ticket": return <svg {...props}><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" /></svg>;
    case "users": return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "calendar": return <svg {...props}><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4" /><path d="M8 2v4" /><path d="M3 10h18" /></svg>;
    case "building": return <svg {...props}><path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" /></svg>;
    case "settings": return <svg {...props}><circle cx="12" cy="12" r="3" /><path d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72 1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" /></svg>;
    case "zap": return <svg {...props}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>;
    case "gift": return <svg {...props}><polyline points="20 12 20 22 4 22 4 12" /><rect x="2" y="7" width="20" height="5" /><line x1="12" y1="22" x2="12" y2="7" /><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z" /><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z" /></svg>;
    case "book": return <svg {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg>;
    case "code": return <svg {...props}><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></svg>;
    default: return null;
  }
}

const ROLES = [
  {
    title: "Tour Agency / DMC",
    subtitle: "Regular user — books tickets for groups",
    items: tourAgencyMenu,
    gradient: "from-blue-600 to-blue-700",
    badge: "bg-blue-100 text-blue-700",
    itemActive: "bg-blue-500/15 text-blue-700",
    itemHover: "hover:bg-blue-50 text-gray-500",
    agent: "Dashboard Agent",
    agentColor: "text-blue-500",
    agentDesc: "Blue (Free), Gold (Pro), Purple (Enterprise)",
    count: tourAgencyMenu.length,
  },
  {
    title: "Reseller",
    subtitle: "Refers agencies — earns commission",
    items: resellerMenu,
    gradient: "from-green-600 to-emerald-600",
    badge: "bg-green-100 text-green-700",
    itemActive: "bg-green-500/15 text-green-700",
    itemHover: "hover:bg-green-50 text-gray-500",
    agent: "Reseller Agent",
    agentColor: "text-green-500",
    agentDesc: "Green theme — growth & outreach tips",
    count: resellerMenu.length,
  },
  {
    title: "Developer / Supplier",
    subtitle: "Integrates API — connects venues",
    items: developerMenu,
    gradient: "from-[#0f172a] to-[#1e3a5f]",
    badge: "bg-cyan-100 text-cyan-700",
    itemActive: "bg-cyan-500/15 text-cyan-700",
    itemHover: "hover:bg-cyan-50 text-gray-500",
    agent: "Developer Agent",
    agentColor: "text-cyan-500",
    agentDesc: "Dark/cyan theme — API help & code examples",
    count: developerMenu.length,
  },
  {
    title: "Partner (Venue)",
    subtitle: "Direct venue — lists products & earns revenue",
    items: partnerMenu,
    gradient: "from-emerald-600 to-teal-700",
    badge: "bg-emerald-100 text-emerald-700",
    itemActive: "bg-emerald-500/15 text-emerald-700",
    itemHover: "hover:bg-emerald-50 text-gray-500",
    agent: "Partner Agent",
    agentColor: "text-emerald-500",
    agentDesc: "Long-term — direct venue partnerships (mega opportunity)",
    count: partnerMenu.length,
    comingSoon: true,
  },
];

export default function AdminMenusPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-amber-500 to-orange-600 p-8 text-white shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold">Menu Preview</h1>
            <p className="text-amber-100 text-sm">What each user role sees when they log in</p>
          </div>
        </div>
      </div>

      {/* 4 columns */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        {ROLES.map((role) => (
          <div key={role.title} className={`relative rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden ${"comingSoon" in role && role.comingSoon ? "ring-2 ring-dashed ring-emerald-300" : ""}`}>
            {"comingSoon" in role && role.comingSoon && (
              <div className="absolute top-3 right-3 z-10 rounded-full bg-amber-500 px-2.5 py-1 text-[10px] font-bold text-white shadow-lg">
                LONG TERM
              </div>
            )}
            {/* Role header */}
            <div className={`bg-gradient-to-r ${role.gradient} p-5 text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold">{role.title}</h2>
                  <p className="text-xs text-white/60 mt-0.5">{role.subtitle}</p>
                </div>
                <span className={`rounded-full ${role.badge} px-2.5 py-1 text-[11px] font-bold`}>
                  {role.count} items
                </span>
              </div>
            </div>

            {/* Simulated sidebar */}
            <div className="bg-gradient-to-b from-[#0f1729] to-[#1a2744] p-3">
              {/* Logo */}
              <div className="flex items-center gap-2 px-3 py-2 mb-3 border-b border-white/10 pb-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-md bg-gradient-to-br from-blue-400 to-blue-600">
                  <span className="text-[9px] font-bold text-white">TM</span>
                </div>
                <span className="text-xs font-semibold text-white">
                  Ticket<span className="text-blue-400">Match</span>
                </span>
              </div>

              {/* Menu items */}
              <div className="space-y-0.5">
                {role.items.map((item, i) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      i === 0
                        ? "bg-white/15 text-white"
                        : "text-white/40 hover:bg-white/10 hover:text-white/70"
                    }`}
                  >
                    <MenuIcon type={item.icon} />
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Simulated user */}
              <div className="mt-3 border-t border-white/10 pt-3 px-3">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500/20 text-[10px] font-semibold text-blue-300 ring-1 ring-blue-400/20">
                    JD
                  </div>
                  <div>
                    <p className="text-[10px] font-medium text-white/70">John Doe</p>
                    <p className="text-[9px] text-white/30">Agency XYZ</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Agent info */}
            <div className="p-4 border-t border-border/30">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                <p className={`text-xs font-semibold ${role.agentColor}`}>{role.agent}</p>
              </div>
              <p className="text-[11px] text-muted mt-1">{role.agentDesc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-800">4 user roles, 4 menus, 4 AI agents</p>
            <p className="text-xs text-amber-700 mt-0.5">
              Each role sees only what they need. Tour agencies get the full booking platform. Resellers manage their referred clients. Developers see API integration tools. Partners (long-term) will manage their own venue listings and revenue directly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
