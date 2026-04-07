"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

const ADMIN_EMAILS = ["wortelboerdenis@gmail.com", "patekrolexvc@gmail.com"];

const navItems = [
  { href: "/dashboard", label: "Overview", icon: "grid" },
  { href: "/dashboard/catalog", label: "Catalog", icon: "search" },
  { href: "/dashboard/bookings", label: "Bookings", icon: "ticket" },
  { href: "/dashboard/groups", label: "Groups", icon: "users" },
  { href: "/dashboard/itinerary", label: "Itinerary", icon: "calendar" },
  { href: "/dashboard/pricing", label: "Plans", icon: "zap" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
];

const supplierNavItems = [
  { href: "/dashboard/partner", label: "Overview", icon: "grid" },
  { href: "/dashboard/profile", label: "Company", icon: "building" },
  { href: "/dashboard/settings", label: "Settings", icon: "settings" },
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
    case "shield": return <svg {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>;
    default: return null;
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<{ name: string; company: string; initials: string; email: string; isSupplier: boolean }>({
    name: "",
    company: "",
    initials: "",
    email: "",
    isSupplier: false,
  });

  useEffect(() => {
    const supabase = createClient();
    const loadUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, company_id, companies(name, message)")
          .eq("id", authUser.id)
          .single();

        const name = profile?.full_name || authUser.user_metadata?.full_name || authUser.email || "";
        const companies = profile?.companies as unknown as { name: string; message: string } | { name: string; message: string }[] | null;
        const comp = Array.isArray(companies) ? companies[0] : companies;
        const company = comp?.name || authUser.user_metadata?.company_name || "";

        // Check if this is a supplier account
        let isSupplier = false;
        try {
          const msg = comp?.message ? JSON.parse(comp.message) : {};
          isSupplier = msg.role === "supplier";
        } catch {}

        const parts = name.split(" ").filter(Boolean);
        const initials = parts.length >= 2
          ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
          : name.substring(0, 2).toUpperCase();
        setUser({ name, company, initials, email: authUser.email || "", isSupplier });
      }
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  const mobileNavItems = user.isSupplier
    ? [
        { href: "/dashboard/partner", label: "Home", icon: "grid" },
        { href: "/dashboard/profile", label: "Company", icon: "building" },
        { href: "/dashboard/settings", label: "Settings", icon: "settings" },
      ]
    : [
        { href: "/dashboard", label: "Home", icon: "grid" },
        { href: "/dashboard/catalog", label: "Catalog", icon: "search" },
        { href: "/dashboard/bookings", label: "Bookings", icon: "ticket" },
        { href: "/dashboard/groups", label: "Groups", icon: "users" },
        { href: "/dashboard/settings", label: "Settings", icon: "settings" },
      ];

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar — hidden on mobile */}
      <aside className="hidden md:flex w-64 flex-col bg-gradient-to-b from-[#0f1729] to-[#1a2744]">
        {/* Logo */}
        <div className="flex h-[72px] items-center px-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-lg shadow-blue-500/25">
              <span className="text-sm font-bold text-white">TM</span>
            </div>
            <span className="text-base font-semibold tracking-tight text-white">
              Ticket<span className="text-blue-400">Match</span>
            </span>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 space-y-1 px-3 py-4">
          {(user.isSupplier ? supplierNavItems : navItems).map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-white/15 text-white shadow-sm"
                    : "text-white/50 hover:bg-white/10 hover:text-white/80"
                }`}
              >
                <NavIcon type={item.icon} />
                {item.label}
              </Link>
            );
          })}
          {ADMIN_EMAILS.includes(user.email) && (
            <>
              <div className="my-3 border-t border-white/10" />
              <Link
                href="/dashboard/admin"
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
                  pathname === "/dashboard/admin"
                    ? "bg-amber-500/20 text-amber-300 shadow-sm"
                    : "text-amber-400/50 hover:bg-amber-500/10 hover:text-amber-300"
                }`}
              >
                <NavIcon type="shield" />
                Admin
              </Link>
            </>
          )}
        </nav>

        {/* User */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-500/20 text-sm font-semibold text-blue-300 ring-2 ring-blue-400/20">
              {user.initials || "?"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{user.name || "Loading..."}</p>
              <p className="truncate text-xs text-white/40">{user.company}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 py-2 text-xs font-medium text-white/40 hover:bg-white/5 hover:text-white/70 transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="fixed top-0 left-0 right-0 z-40 flex h-14 items-center justify-between bg-gradient-to-r from-[#0f1729] to-[#1a2744] px-4 md:hidden">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 shadow-md shadow-blue-500/25">
            <span className="text-xs font-bold text-white">TM</span>
          </div>
          <span className="text-sm font-semibold tracking-tight text-white">
            Ticket<span className="text-blue-400">Match</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500/20 text-xs font-semibold text-blue-300 ring-2 ring-blue-400/20">
            {user.initials || "?"}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white/70 transition-colors"
            title="Sign out"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto pt-14 pb-16 md:pt-0 md:pb-0 bg-[#f5f6fa]">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around bg-gradient-to-r from-[#0f1729] to-[#1a2744] md:hidden"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {mobileNavItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-2.5 transition-colors ${
                isActive ? "text-blue-400" : "text-white/40 hover:text-white/70"
              }`}
            >
              <NavIcon type={item.icon} />
              <span className="text-[10px] font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
