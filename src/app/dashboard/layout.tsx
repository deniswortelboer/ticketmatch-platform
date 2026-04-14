"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import DashboardAgent from "@/components/ui/DashboardAgent";
import ResellerAgent from "@/components/ui/ResellerAgent";
import DeveloperAgent from "@/components/ui/DeveloperAgent";
import PartnerAgent from "@/components/ui/PartnerAgent";
import AdminAgent from "@/components/ui/AdminAgent";
import AdminAgentDock from "@/components/ui/AdminAgentDock";

const ADMIN_EMAILS = ["wortelboerdenis@gmail.com", "patekrolexvc@gmail.com", "denis.wortelboer@w69.nl"];

/* ── Grouped navigation ── */
type NavItem = { href: string; label: string; icon: string };
type NavGroup = { label: string; items: NavItem[] };

const mainNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard", label: "Overview", icon: "grid" },
      { href: "/dashboard/command", label: "Command Center", icon: "map" },
      { href: "/dashboard/experiences", label: "Experiences", icon: "search" },
      { href: "/dashboard/bookings", label: "Bookings", icon: "ticket" },
      { href: "/dashboard/groups", label: "Groups", icon: "users" },
    ],
  },
  {
    label: "Planning",
    items: [
      { href: "/dashboard/itinerary", label: "Itinerary", icon: "calendar" },
      { href: "/dashboard/packages", label: "Packages", icon: "package" },
      { href: "/dashboard/map", label: "City Map", icon: "map" },
      { href: "/dashboard/weather", label: "Weather", icon: "cloud" },
    ],
  },
  {
    label: "Account",
    items: [
      { href: "/dashboard/team", label: "Team", icon: "users" },
      { href: "/dashboard/pricing", label: "Plans", icon: "zap" },
      { href: "/dashboard/knowledge", label: "Knowledge Base", icon: "book" },
      { href: "/dashboard/affiliate", label: "Refer & Earn", icon: "gift" },
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const adminNavGroup: NavGroup = {
  label: "Admin",
  items: [
    { href: "/dashboard/admin", label: "Admin", icon: "shield" },
    { href: "/dashboard/analytics", label: "Analytics", icon: "bar-chart" },
    { href: "/dashboard/reseller", label: "Resellers", icon: "handshake" },
    { href: "/dashboard/partner/docs", label: "Developers", icon: "code" },
    { href: "/dashboard/partners", label: "Partners", icon: "building" },
    { href: "/dashboard/admin/advertising", label: "Advertising", icon: "megaphone" },
  ],
};

const supplierNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard/partner", label: "Overview", icon: "grid" },
      { href: "/dashboard/partner/docs", label: "API Docs", icon: "code" },
      { href: "/dashboard/profile", label: "Company", icon: "building" },
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const resellerNavGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      { href: "/dashboard/reseller", label: "Dashboard", icon: "grid" },
      { href: "/dashboard/reseller/clients", label: "My Clients", icon: "users" },
      { href: "/dashboard/reseller/terms", label: "Terms", icon: "book" },
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
];

const developerNavGroups: NavGroup[] = [
  {
    label: "Developer",
    items: [
      { href: "/dashboard/partner", label: "Overview", icon: "grid" },
      { href: "/dashboard/partner/docs", label: "API Docs", icon: "code" },
      { href: "/dashboard/profile", label: "Company", icon: "building" },
      { href: "/dashboard/settings", label: "Settings", icon: "settings" },
    ],
  },
];

function NavIcon({ type }: { type: string }) {
  const props = { width: 18, height: 18, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
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
    case "handshake": return <svg {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
    case "map": return <svg {...props}><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>;
    case "cloud": return <svg {...props}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>;
    case "shield": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    case "package": return <svg {...props}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg>;
    case "bar-chart": return <svg {...props}><path d="M18 20V10" /><path d="M12 20V4" /><path d="M6 20v-6" /></svg>;
    case "bell": return <svg {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>;
    case "megaphone": return <svg {...props}><path d="m3 11 18-5v12L3 13v-2z" /><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6" /></svg>;
    default: return null;
  }
}

function NavGroupSection({ group, pathname, isAdmin: isAdminGroup }: { group: NavGroup; pathname: string; isAdmin?: boolean }) {
  return (
    <div className="mb-4">
      <p className={`text-[9px] font-semibold uppercase tracking-[1.5px] px-3 mb-1.5 ${
        isAdminGroup ? "text-amber-400/30" : "text-white/20"
      }`}>
        {group.label}
      </p>
      {group.items.map((item) => {
        const isActive = item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname === item.href || pathname?.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-[13px] font-medium transition-all ${
              isAdminGroup
                ? isActive
                  ? "bg-amber-500/20 text-amber-300 shadow-sm"
                  : "text-amber-400/40 hover:bg-amber-500/10 hover:text-amber-300"
                : isActive
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/45 hover:bg-white/8 hover:text-white/80"
            }`}
          >
            <NavIcon type={item.icon} />
            {item.label}
          </Link>
        );
      })}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [notifications, setNotifications] = useState<{ id: string; type: string; title: string; subtitle: string; time: string; read: boolean }[]>([]);
  const [user, setUser] = useState<{ name: string; company: string; initials: string; email: string; isSupplier: boolean; isReseller: boolean; isDeveloper: boolean; plan: string; resellerSlug: string }>({
    name: "",
    company: "",
    initials: "",
    email: "",
    isSupplier: false,
    isReseller: false,
    isDeveloper: false,
    plan: "free",
    resellerSlug: "",
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Use server-side API route to bypass RLS restrictions
        const res = await fetch("/api/me");
        if (!res.ok) return;
        const data = await res.json();

        const isAdminUser = ADMIN_EMAILS.includes((data.email || "").toLowerCase());

        // Admins always bypass approval check
        if (!data.isApproved && !isAdminUser && pathname !== "/dashboard/pending") {
          router.push("/dashboard/pending");
          return;
        }

        if (data.isReseller && !isAdminUser && pathname === "/dashboard") {
          router.push("/dashboard/reseller");
          return;
        }

        if (data.isDeveloper && !isAdminUser && pathname === "/dashboard") {
          router.push("/dashboard/partner/docs");
          return;
        }

        setUser({
          name: data.name,
          company: data.company,
          initials: data.initials,
          email: data.email,
          isSupplier: data.isSupplier,
          isReseller: data.isReseller,
          isDeveloper: data.isDeveloper,
          plan: data.plan,
          resellerSlug: data.resellerSlug,
        });
      } catch (err) {
        console.error("Dashboard loadUser error:", err);
      }
    };
    loadUser();
  }, [pathname, router]);

  // Load notifications from real data
  useEffect(() => {
    if (!user.email) return;
    const loadNotifications = async () => {
      try {
        if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
          // Admin: fetch recent companies + bookings
          const res = await fetch("/api/admin");
          if (!res.ok) return;
          const data = await res.json();
          const notifs: typeof notifications = [];

          // Recent registrations (last 7 days)
          (data.companies || []).slice(0, 5).forEach((c: { id: string; name: string; company_type: string; status: string; created_at: string }) => {
            const daysAgo = Math.floor((Date.now() - new Date(c.created_at).getTime()) / 86400000);
            if (daysAgo <= 7) {
              notifs.push({
                id: `comp-${c.id}`,
                type: c.status === "pending" ? "warning" : "success",
                title: `New registration: ${c.name}`,
                subtitle: `${c.company_type} · ${c.status}`,
                time: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`,
                read: c.status === "approved",
              });
            }
          });

          // Recent bookings (last 7 days)
          (data.bookings || []).slice(0, 5).forEach((b: { id: string; venue_name: string; status: string; number_of_guests: number; created_at: string; companies: { name: string } | { name: string }[] | null }) => {
            const daysAgo = Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000);
            if (daysAgo <= 7) {
              const comp = Array.isArray(b.companies) ? b.companies[0]?.name : (b.companies as { name: string } | null)?.name || "Unknown";
              notifs.push({
                id: `book-${b.id}`,
                type: b.status === "confirmed" ? "success" : b.status === "cancelled" ? "error" : "info",
                title: `Booking: ${b.venue_name}`,
                subtitle: `${comp} · ${b.number_of_guests} guests · ${b.status}`,
                time: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`,
                read: b.status === "confirmed",
              });
            }
          });

          setNotifications(notifs);
        } else {
          // Regular user: fetch their bookings
          const res = await fetch("/api/bookings");
          if (!res.ok) return;
          const data = await res.json();
          const notifs: typeof notifications = [];

          (data.bookings || []).slice(0, 8).forEach((b: { id: string; venue_name: string; status: string; number_of_guests: number; created_at: string }) => {
            const daysAgo = Math.floor((Date.now() - new Date(b.created_at).getTime()) / 86400000);
            if (daysAgo <= 14) {
              notifs.push({
                id: `book-${b.id}`,
                type: b.status === "confirmed" ? "success" : b.status === "cancelled" ? "error" : "info",
                title: `${b.venue_name}`,
                subtitle: `${b.number_of_guests} guests · ${b.status}`,
                time: daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo}d ago`,
                read: b.status !== "pending",
              });
            }
          });

          setNotifications(notifs);
        }
      } catch {}
    };
    loadNotifications();
  }, [user.email]);

  // Close mobile menu on navigation
  useEffect(() => {
    setShowMobileMenu(false);
  }, [pathname]);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const markAllRead = () => setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const isAdmin = ADMIN_EMAILS.includes(user.email.toLowerCase());

  // Plan-based avatar colors
  const planStyles = {
    free: { avatar: "from-blue-500 to-indigo-600", ring: "ring-border/60", badge: "bg-gray-100 text-gray-500" },
    pro: { avatar: "from-amber-400 to-orange-500", ring: "ring-amber-300/50", badge: "bg-amber-50 text-amber-600" },
    enterprise: { avatar: "from-purple-500 to-indigo-600", ring: "ring-purple-300/50", badge: "bg-purple-50 text-purple-600" },
  };
  const ps = planStyles[user.plan as keyof typeof planStyles] || planStyles.free;

  // Select nav groups based on role (admin always gets full nav)
  const navGroups = isAdmin
    ? mainNavGroups
    : user.isDeveloper
      ? developerNavGroups
      : user.isReseller
        ? resellerNavGroups
        : user.isSupplier
          ? supplierNavGroups
          : mainNavGroups;

  // Get page title from current path
  const allItems = [...navGroups.flatMap((g) => g.items), ...adminNavGroup.items];
  const currentPage = allItems.find((i) => pathname === i.href || (i.href !== "/dashboard" && pathname?.startsWith(i.href + "/")));
  const pageTitle = currentPage?.label || "Dashboard";

  // Pending page renders standalone
  if (pathname === "/dashboard/pending") {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-[240px] shrink-0 flex-col bg-gradient-to-b from-[#0f1729] to-[#1a2744]">
        {/* Logo */}
        <div className="flex h-14 items-center px-5 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25">
              <span className="text-sm font-bold text-white">TM</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              Ticket<span className="text-blue-400">Match</span>
            </span>
          </Link>
        </div>

        {/* Nav groups */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 scrollbar-thin">
          {navGroups.map((group) => (
            <NavGroupSection key={group.label} group={group} pathname={pathname} />
          ))}

          {isAdmin && (
            <>
              <div className="my-2 border-t border-white/10" />
              <NavGroupSection group={adminNavGroup} pathname={pathname} isAdmin />
            </>
          )}
        </nav>

        {/* Refer badge at bottom — only for regular agencies */}
        {!user.isReseller && !user.isDeveloper && (
          <a href="/dashboard/affiliate" className="block mx-3 mb-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 p-3 text-center hover:from-indigo-500/25 hover:to-purple-500/25 transition-all">
            <p className="text-[11px] font-semibold text-white/70">Refer & Earn</p>
            <p className="text-[9px] text-white/30 mt-0.5">Invite agencies, earn commission</p>
          </a>
        )}
      </aside>

      {/* Main area */}
      <div className="flex flex-1 flex-col min-w-0">
        {/* Top bar — desktop (hidden on Command Center) */}
        <header className={`${pathname === "/dashboard/command" ? "hidden" : "hidden md:flex"} h-14 items-center justify-between border-b border-border/60 bg-white px-6 shrink-0`}>
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted">Dashboard</span>
            <span className="text-muted">/</span>
            <span className="font-semibold text-foreground">{pageTitle}</span>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); }}
                className="relative flex h-9 w-9 items-center justify-center rounded-xl border border-border/60 text-muted hover:bg-gray-50 transition-colors"
              >
                <NavIcon type="bell" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white ring-2 ring-white" style={{ minWidth: 18, height: 18 }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-80 rounded-xl border border-border/60 bg-white shadow-lg overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gray-50/50">
                      <p className="text-sm font-semibold">Notifications</p>
                      {unreadCount > 0 && (
                        <button onClick={markAllRead} className="text-[10px] text-blue-500 font-medium hover:text-blue-700">
                          Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center">
                          <p className="text-2xl mb-1">🔔</p>
                          <p className="text-xs text-muted">No notifications yet</p>
                        </div>
                      ) : (
                        notifications.map((n) => {
                          const typeIcon = n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : n.type === "error" ? "❌" : "📋";
                          return (
                            <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-border/10 hover:bg-gray-50 transition-colors ${!n.read ? "bg-blue-50/30" : ""}`}>
                              <span className="text-sm mt-0.5">{typeIcon}</span>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs truncate ${!n.read ? "font-semibold" : "font-medium text-gray-600"}`}>{n.title}</p>
                                <p className="text-[10px] text-muted truncate">{n.subtitle}</p>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] text-muted">{n.time}</span>
                                {!n.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <div className="px-4 py-2.5 border-t border-border/30 bg-gray-50/50 text-center">
                        <Link href="/dashboard/admin" onClick={() => setShowNotifications(false)} className="text-[11px] text-blue-500 font-medium hover:text-blue-700">
                          View all activity
                        </Link>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); }}
                className={`flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-3 hover:bg-gray-50 transition-colors ${ps.ring} ${user.plan !== "free" ? "ring-2" : "border-border/60"}`}
              >
                <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${ps.avatar} text-xs font-bold text-white`}>
                  {user.initials || "?"}
                </div>
                <div className="text-left leading-tight">
                  <p className="text-xs font-semibold text-foreground">{user.name || "Loading..."}</p>
                  <p className="text-[10px] text-muted">{user.company}</p>
                </div>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted ml-1">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </button>

              {/* Dropdown menu */}
              {showUserMenu && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                  <div className="absolute right-0 top-full mt-2 z-50 w-56 rounded-xl border border-border/60 bg-white shadow-lg py-1">
                    <div className="px-4 py-2.5 border-b border-border/30">
                      <p className="text-xs font-semibold">{user.name}</p>
                      <p className="text-[10px] text-muted">{user.email}</p>
                      <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${ps.badge}`}>{user.plan === "enterprise" ? "Enterprise" : user.plan === "pro" ? "Pro" : "Free"} plan</span>
                    </div>
                    <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted hover:bg-gray-50 transition-colors">
                      <NavIcon type="settings" />
                      Settings
                    </Link>
                    <Link href="/dashboard/team" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted hover:bg-gray-50 transition-colors">
                      <NavIcon type="users" />
                      Team
                    </Link>
                    <Link href="/dashboard/pricing" onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-xs text-muted hover:bg-gray-50 transition-colors">
                      <NavIcon type="zap" />
                      Upgrade Plan
                    </Link>
                    <div className="border-t border-border/30 mt-1 pt-1">
                      <button onClick={() => { setShowUserMenu(false); handleLogout(); }}
                        className="flex w-full items-center gap-2.5 px-4 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                          <polyline points="16 17 21 12 16 7" />
                          <line x1="21" y1="12" x2="9" y2="12" />
                        </svg>
                        Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Mobile header */}
        <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-gradient-to-r from-[#0f1729] to-[#1a2744] px-4 md:hidden" style={{ paddingTop: "env(safe-area-inset-top, 0px)", height: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              {showMobileMenu ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-md shadow-blue-500/25">
                <span className="text-xs font-bold text-white">TM</span>
              </div>
              <span className="text-sm font-semibold tracking-tight text-white">
                Ticket<span className="text-blue-400">Match</span>
              </span>
            </Link>
          </div>
          <div className="flex items-center gap-2">
            {/* Mobile notification bell */}
            <button
              onClick={() => { setShowNotifications(!showNotifications); setShowMobileMenu(false); }}
              className="relative flex h-9 w-9 items-center justify-center rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition-colors"
            >
              <NavIcon type="bell" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center rounded-full bg-red-500 text-[8px] font-bold text-white" style={{ minWidth: 16, height: 16 }}>
                  {unreadCount}
                </span>
              )}
            </button>
            <button
              onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowMobileMenu(false); }}
              className={`flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br ${ps.avatar} text-xs font-bold text-white ${user.plan !== "free" ? "ring-2 " + ps.ring : ""}`}
            >
              {user.initials || "?"}
            </button>
          </div>
        </div>

        {/* Mobile user menu */}
        {showUserMenu && (
          <div className="fixed inset-x-0 top-14 z-50 md:hidden">
            <div className="fixed inset-0 top-14" onClick={() => setShowUserMenu(false)} />
            <div className="relative mx-3 mt-2 rounded-xl border border-border/60 bg-white shadow-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-border/30">
                <p className="text-sm font-semibold">{user.name}</p>
                <p className="text-[11px] text-muted">{user.email}</p>
                <span className={`mt-1 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${ps.badge}`}>
                  {user.plan === "enterprise" ? "Enterprise" : user.plan === "pro" ? "Pro" : "Free"} plan
                </span>
              </div>
              <Link href="/dashboard/settings" onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-gray-50 transition-colors border-b border-border/10">
                <NavIcon type="settings" /> Settings
              </Link>
              <Link href="/dashboard/team" onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-gray-50 transition-colors border-b border-border/10">
                <NavIcon type="users" /> Team
              </Link>
              <Link href="/dashboard/pricing" onClick={() => setShowUserMenu(false)}
                className="flex items-center gap-3 px-4 py-3 text-sm text-muted hover:bg-gray-50 transition-colors border-b border-border/10">
                <NavIcon type="zap" /> Upgrade Plan
              </Link>
              <button onClick={() => { setShowUserMenu(false); handleLogout(); }}
                className="flex w-full items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 transition-colors">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* Mobile notification panel */}
        {showNotifications && (
          <div className="fixed inset-x-0 top-14 z-50 md:hidden">
            <div className="fixed inset-0 top-14" onClick={() => setShowNotifications(false)} />
            <div className="relative mx-3 mt-2 rounded-xl border border-border/60 bg-white shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border/30 bg-gray-50/50">
                <p className="text-sm font-semibold">Notifications</p>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} className="text-[11px] text-blue-500 font-medium hover:text-blue-700">
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <p className="text-2xl mb-1">🔔</p>
                    <p className="text-xs text-muted">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n) => {
                    const typeIcon = n.type === "success" ? "✅" : n.type === "warning" ? "⚠️" : n.type === "error" ? "❌" : "📋";
                    return (
                      <div key={n.id} className={`flex items-start gap-3 px-4 py-3 border-b border-border/10 ${!n.read ? "bg-blue-50/30" : ""}`}>
                        <span className="text-sm mt-0.5">{typeIcon}</span>
                        <div className="flex-1 min-w-0">
                          <p className={`text-xs truncate ${!n.read ? "font-semibold" : "font-medium text-gray-600"}`}>{n.title}</p>
                          <p className="text-[10px] text-muted truncate">{n.subtitle}</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="text-[9px] text-muted">{n.time}</span>
                          {!n.read && <div className="h-2 w-2 rounded-full bg-blue-500" />}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mobile slide-out menu */}
        {showMobileMenu && (
          <>
            <div className="fixed inset-0 z-45 bg-black/50 md:hidden" onClick={() => setShowMobileMenu(false)} />
            <div className="fixed left-0 bottom-0 z-50 w-72 bg-gradient-to-b from-[#0f1729] to-[#1a2744] overflow-y-auto md:hidden"
              style={{ top: "calc(3.5rem + env(safe-area-inset-top, 0px))", paddingBottom: "env(safe-area-inset-bottom, 20px)" }}
            >
              {/* User info */}
              <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${ps.avatar} text-sm font-bold text-white ${user.plan !== "free" ? "ring-2 " + ps.ring : ""}`}>
                  {user.initials || "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">{user.name || "Loading..."}</p>
                  <p className="text-[11px] text-white/40 truncate">{user.company}</p>
                  <span className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[9px] font-semibold capitalize ${ps.badge}`}>
                    {user.plan === "enterprise" ? "Enterprise" : user.plan === "pro" ? "Pro" : "Free"}
                  </span>
                </div>
              </div>

              {/* Nav groups */}
              <nav className="px-3 py-4">
                {navGroups.map((group) => (
                  <NavGroupSection key={group.label} group={group} pathname={pathname} />
                ))}

                {isAdmin && (
                  <>
                    <div className="my-2 border-t border-white/10" />
                    <NavGroupSection group={adminNavGroup} pathname={pathname} isAdmin />
                  </>
                )}
              </nav>

              {/* Refer badge — only for regular agencies */}
              {!user.isReseller && !user.isDeveloper && (
                <a href="/dashboard/affiliate" className="block mx-3 mb-3 rounded-xl bg-gradient-to-r from-indigo-500/15 to-purple-500/15 p-3 text-center hover:from-indigo-500/25 hover:to-purple-500/25 transition-all">
                  <p className="text-[11px] font-semibold text-white/70">Refer & Earn</p>
                  <p className="text-[9px] text-white/30 mt-0.5">Invite agencies, earn commission</p>
                </a>
              )}

              {/* Sign out */}
              <div className="px-3 pb-4">
                <button
                  onClick={() => { setShowMobileMenu(false); handleLogout(); }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-medium text-red-400/60 hover:bg-red-500/10 hover:text-red-400 transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          </>
        )}

        {/* Main content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden pb-16 md:pt-0 md:pb-0 bg-[#f5f6fa]" style={{ paddingTop: "calc(3.5rem + env(safe-area-inset-top, 0px))" }}>
          {pathname === "/dashboard/command" ? (
            <div className="px-3 py-2 md:px-4 md:py-3">
              {children}
            </div>
          ) : (
            <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
              {children}
            </div>
          )}
        </main>
      </div>

      {/* AI Agent — different per user role */}
      {isAdmin ? (
        <AdminAgentDock userName={user.name} />
      ) : user.isDeveloper || user.isSupplier || pathname?.startsWith("/dashboard/partner") ? (
        <DeveloperAgent />
      ) : user.isReseller || pathname?.startsWith("/dashboard/reseller") ? (
        <ResellerAgent resellerName={user.name} resellerSlug={user.resellerSlug} />
      ) : pathname === "/dashboard/partners" ? (
        <PartnerAgent partnerName={user.name} />
      ) : (
        <DashboardAgent userPlan={user.plan} userName={user.name} />
      )}

      {/* Mobile bottom navigation — quick access */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around border-t border-white/10 bg-gradient-to-r from-[#0f1729] to-[#1a2744] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {(isAdmin
          ? [
              { href: "/dashboard", label: "Home", icon: "grid" },
              { href: "/dashboard/bookings", label: "Bookings", icon: "ticket" },
              { href: "/dashboard/admin", label: "Admin", icon: "shield" },
              { href: "/dashboard/settings", label: "Settings", icon: "settings" },
            ]
          : user.isDeveloper
            ? [
                { href: "/dashboard/partner", label: "Home", icon: "grid" },
                { href: "/dashboard/partner/docs", label: "API Docs", icon: "code" },
                { href: "/dashboard/settings", label: "Settings", icon: "settings" },
              ]
            : user.isReseller
              ? [
                  { href: "/dashboard/reseller", label: "Home", icon: "grid" },
                  { href: "/dashboard/affiliate", label: "Referrals", icon: "gift" },
                  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
                ]
              : user.isSupplier
                ? [
                    { href: "/dashboard/partner", label: "Home", icon: "grid" },
                    { href: "/dashboard/profile", label: "Company", icon: "building" },
                    { href: "/dashboard/settings", label: "Settings", icon: "settings" },
                  ]
              : [
                { href: "/dashboard", label: "Home", icon: "grid" },
                { href: "/dashboard/experiences", label: "Experiences", icon: "search" },
                { href: "/dashboard/bookings", label: "Bookings", icon: "ticket" },
                { href: "/dashboard/map", label: "Map", icon: "map" },
              ]
        ).map((item) => {
          const isActive = item.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-3 py-2.5 transition-colors ${
                isActive ? "text-blue-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              <NavIcon type={item.icon} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setShowMobileMenu(true)}
          className="flex flex-col items-center gap-0.5 px-3 py-2.5 text-white/40 hover:text-white/70 transition-colors"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /><circle cx="5" cy="12" r="1" />
          </svg>
          <span className="text-[10px] font-medium">More</span>
        </button>
      </nav>
    </div>
  );
}
