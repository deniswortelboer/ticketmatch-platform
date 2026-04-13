"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Client {
  id: string;
  name: string;
  email: string;
  plan: string;
  status: string;
  created_at: string;
  bookingCount: number;
  totalRevenue: number;
}

function PlanBadge({ plan }: { plan: string }) {
  const config: Record<string, { label: string; bg: string; text: string }> = {
    free: { label: "Free", bg: "bg-gray-100", text: "text-gray-600" },
    pro: { label: "Pro", bg: "bg-amber-50", text: "text-amber-700" },
    enterprise: { label: "Enterprise", bg: "bg-purple-50", text: "text-purple-700" },
  };
  const c = config[plan] || config.free;
  return (
    <span className={`inline-flex items-center rounded-full ${c.bg} px-2.5 py-1 text-[11px] font-semibold ${c.text}`}>
      {c.label}
    </span>
  );
}

function StatusDot({ active }: { active: boolean }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={`h-2 w-2 rounded-full ${active ? "bg-green-500" : "bg-gray-300"}`} />
      <span className={`text-xs ${active ? "text-green-700" : "text-gray-500"}`}>{active ? "Active" : "Inactive"}</span>
    </span>
  );
}

export default function ResellerClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [resellerSlug, setResellerSlug] = useState("");
  const [commissionRate, setCommissionRate] = useState(10);
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "enterprise">("all");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, companies(id, name, message)")
        .eq("id", user.id)
        .single();

      const comp = Array.isArray(profile?.companies) ? profile.companies[0] : profile?.companies;
      if (!comp) { setLoading(false); return; }

      let msg: Record<string, unknown> = {};
      try { msg = (comp as { message?: string }).message ? JSON.parse((comp as { message: string }).message) : {}; } catch {}

      const slug = (msg.reseller_slug as string) || "";
      const rate = (msg.commission_rate as number) || 10;
      setResellerSlug(slug);
      setCommissionRate(rate);

      // Find referred companies
      const { data: allCompanies } = await supabase
        .from("companies")
        .select("id, name, status, message, created_at");

      if (!allCompanies) { setLoading(false); return; }

      const referred = allCompanies.filter((c) => {
        if (c.id === (comp as { id: string }).id) return false;
        try {
          const m = c.message ? JSON.parse(c.message) : {};
          return m.referred_by === (comp as { id: string }).id || m.reseller_slug === slug;
        } catch { return false; }
      });

      // Get profiles for email
      const companyIds = referred.map((c) => c.id);
      let profileEmails: Record<string, string> = {};
      if (companyIds.length > 0) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("company_id, email")
          .in("company_id", companyIds);
        if (profs) {
          profs.forEach((p) => { if (p.company_id) profileEmails[p.company_id] = p.email || ""; });
        }
      }

      // Get bookings
      let bookings: { company_id: string; total_price: number }[] = [];
      if (companyIds.length > 0) {
        const { data: bks } = await supabase
          .from("bookings")
          .select("company_id, total_price")
          .in("company_id", companyIds);
        bookings = bks || [];
      }

      const clientList: Client[] = referred.map((c) => {
        let cMsg: Record<string, unknown> = {};
        try { cMsg = c.message ? JSON.parse(c.message) : {}; } catch {}
        const compBookings = bookings.filter((b) => b.company_id === c.id);
        const rev = compBookings.reduce((s, b) => s + Number(b.total_price), 0);
        return {
          id: c.id,
          name: c.name,
          email: profileEmails[c.id] || "",
          plan: (cMsg.plan as string) || "free",
          status: c.status || "active",
          created_at: c.created_at,
          bookingCount: compBookings.length,
          totalRevenue: rev,
        };
      });

      setClients(clientList);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = clients.filter((c) => {
    if (planFilter !== "all" && c.plan !== planFilter) return false;
    if (search && !c.name.toLowerCase().includes(search.toLowerCase()) && !c.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const freeCount = clients.filter((c) => c.plan === "free").length;
  const proCount = clients.filter((c) => c.plan === "pro").length;
  const enterpriseCount = clients.filter((c) => c.plan === "enterprise").length;
  const paidPercent = clients.length > 0 ? Math.round(((proCount + enterpriseCount) / clients.length) * 100) : 0;

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-white shadow-xl shadow-green-900/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">My Clients</h1>
              <p className="text-sm text-green-200/70">Manage your referred agencies and their memberships</p>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-right">
            <div>
              <p className="text-3xl font-bold">{clients.length}</p>
              <p className="text-green-200 text-xs">Total clients</p>
            </div>
            <div className="h-10 w-px bg-white/20" />
            <div>
              <p className="text-3xl font-bold">{paidPercent}%</p>
              <p className="text-green-200 text-xs">Paid plans</p>
            </div>
          </div>
        </div>
      </div>

      {/* Membership stats */}
      <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <p className="text-xs text-muted font-medium">Total Clients</p>
          <p className="text-2xl font-bold mt-1">{clients.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-medium">Free Plan</p>
            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold text-gray-600">FREE</span>
          </div>
          <p className="text-2xl font-bold mt-1">{freeCount}</p>
          <p className="text-[11px] text-amber-600 mt-0.5">Upgrade potential</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-medium">Pro Plan</p>
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">PRO</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-amber-600">{proCount}</p>
          <p className="text-[11px] text-muted mt-0.5">&euro;49/mo each</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted font-medium">Enterprise</p>
            <span className="rounded-full bg-purple-50 px-2 py-0.5 text-[10px] font-bold text-purple-700">ENT</span>
          </div>
          <p className="text-2xl font-bold mt-1 text-purple-600">{enterpriseCount}</p>
          <p className="text-[11px] text-muted mt-0.5">&euro;149/mo each</p>
        </div>
      </div>

      {/* Tip banner for free clients */}
      {freeCount > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-5">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-semibold text-amber-800">
                {freeCount} {freeCount === 1 ? "client is" : "clients are"} still on the Free plan
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Encourage them to upgrade to Pro or Enterprise for more bookings and features. A paid client means more commission for you! Use the Reseller Agent for tips on how to convert them.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 w-full sm:max-w-xs">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
            <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search clients..."
            className="h-11 w-full rounded-xl border border-border/60 bg-white pl-10 pr-4 text-sm outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10"
          />
        </div>
        <div className="flex gap-1.5">
          {(["all", "free", "pro", "enterprise"] as const).map((p) => (
            <button
              key={p}
              onClick={() => setPlanFilter(p)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                planFilter === p
                  ? "bg-foreground text-white shadow-sm"
                  : "bg-white border border-border/60 text-muted hover:bg-gray-50"
              }`}
            >
              {p === "all" ? "All" : p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Client list */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
        {filtered.length > 0 ? (
          <div className="divide-y divide-border/30">
            {filtered.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-green-50 text-sm font-bold text-green-700">
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm">{c.name}</p>
                      <PlanBadge plan={c.plan} />
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <p className="text-xs text-muted">{c.email || "No email"}</p>
                      <span className="text-xs text-muted">Joined {formatDate(c.created_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="hidden sm:flex items-center gap-6 text-right">
                  <StatusDot active={c.status === "active"} />
                  <div>
                    <p className="text-sm font-semibold">{c.bookingCount}</p>
                    <p className="text-[11px] text-muted">bookings</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold">&euro;{c.totalRevenue.toFixed(0)}</p>
                    <p className="text-[11px] text-muted">revenue</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-green-600">&euro;{(c.totalRevenue * commissionRate / 100).toFixed(0)}</p>
                    <p className="text-[11px] text-muted">commission</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : clients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h3 className="font-semibold">No clients yet</h3>
            <p className="mt-1 text-sm text-muted">Share your reseller link to start referring agencies.</p>
          </div>
        ) : (
          <div className="p-8 text-center text-sm text-muted">No clients match your filter.</div>
        )}
      </div>

      {/* Important note */}
      <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Important: Client ownership</p>
            <p className="text-xs text-green-700 mt-0.5">
              Once a client signs up through your referral link, they become a TicketMatch.ai client. You continue to earn commission on their bookings, but the client relationship is managed by TicketMatch. See the Terms &amp; Conditions for full details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
