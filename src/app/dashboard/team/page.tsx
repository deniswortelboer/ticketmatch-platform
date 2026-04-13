"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

type Member = {
  id: string;
  full_name: string | null;
  email: string | null;
  role: string;
  created_at: string;
};

const PLAN_LIMITS: Record<string, { max: number; label: string }> = {
  free: { max: 1, label: "Free" },
  pro: { max: 3, label: "Pro" },
  enterprise: { max: 999, label: "Enterprise" },
};

const ROLE_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  owner: { bg: "bg-amber-50", text: "text-amber-600", label: "Owner" },
  admin: { bg: "bg-purple-50", text: "text-purple-600", label: "Admin" },
  member: { bg: "bg-blue-50", text: "text-blue-600", label: "Member" },
};

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [plan, setPlan] = useState("free");
  const [companyName, setCompanyName] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  // Invite form
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("member");
  const [inviting, setInviting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    loadTeam();
  }, []);

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const loadTeam = async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setCurrentUserId(user.id);

    // Get profile + company
    const { data: profile } = await supabase
      .from("profiles")
      .select("company_id, companies(name, message)")
      .eq("id", user.id)
      .single();

    if (!profile?.company_id) { setLoading(false); return; }

    const companies = profile.companies as unknown as { name: string; message: string } | { name: string; message: string }[] | null;
    const comp = Array.isArray(companies) ? companies[0] : companies;
    setCompanyName(comp?.name || "");

    try {
      const msg = comp?.message ? JSON.parse(comp.message) : {};
      setPlan(msg.plan || "free");
    } catch { setPlan("free"); }

    // Get team members
    const { data: teamMembers } = await supabase
      .from("profiles")
      .select("id, full_name, email, role, created_at")
      .eq("company_id", profile.company_id)
      .order("created_at", { ascending: true });

    setMembers(teamMembers || []);
    setLoading(false);
  };

  const inviteMember = async () => {
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch("/api/team/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: data.message });
        setInviteEmail("");
        loadTeam();
      } else {
        setToast({ type: "error", message: data.error || "Failed to invite" });
      }
    } catch {
      setToast({ type: "error", message: "Failed to send invite" });
    } finally {
      setInviting(false);
    }
  };

  const removeMember = async (memberId: string) => {
    try {
      const res = await fetch("/api/team/invite", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ memberId }),
      });
      const data = await res.json();
      if (data.success) {
        setToast({ type: "success", message: "Team member removed" });
        loadTeam();
      } else {
        setToast({ type: "error", message: data.error || "Failed to remove" });
      }
    } catch {
      setToast({ type: "error", message: "Failed to remove member" });
    }
  };

  const planInfo = PLAN_LIMITS[plan] || PLAN_LIMITS.free;
  const canInvite = members.length < planInfo.max;
  const usagePercent = Math.min(100, (members.length / planInfo.max) * 100);

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 rounded-xl px-4 py-3 shadow-lg text-sm font-medium animate-in fade-in slide-in-from-top ${
          toast.type === "success" ? "bg-green-500 text-white" : "bg-red-500 text-white"
        }`}>
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 p-6 text-white shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <div>
              <h1 className="text-xl font-bold">Team Management</h1>
              <p className="text-blue-200 text-sm">{companyName} — {planInfo.label} plan</p>
            </div>
          </div>
          <div className="hidden sm:block text-right">
            <p className="text-2xl font-bold">{members.length}<span className="text-lg text-blue-200">/{planInfo.max === 999 ? "∞" : planInfo.max}</span></p>
            <p className="text-blue-200 text-xs">Team members</p>
          </div>
        </div>

        {/* Usage bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-blue-200">Team capacity</span>
            <span className="text-white font-medium">{members.length} of {planInfo.max === 999 ? "unlimited" : planInfo.max}</span>
          </div>
          <div className="h-2 rounded-full bg-white/20 overflow-hidden">
            <div className="h-full rounded-full bg-white transition-all" style={{ width: `${planInfo.max === 999 ? 10 : usagePercent}%` }} />
          </div>
          {!canInvite && plan !== "enterprise" && (
            <p className="text-amber-200 text-xs mt-2">Team limit reached. <a href="/dashboard/pricing" className="underline font-medium">Upgrade your plan</a> to add more members.</p>
          )}
        </div>
      </div>

      {/* Invite Form */}
      <div className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
        <h3 className="text-sm font-semibold mb-3">Invite team member</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
            </svg>
            <input type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="colleague@company.com"
              className="h-11 w-full rounded-xl border border-border/60 pl-10 pr-4 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
              onKeyDown={(e) => e.key === "Enter" && inviteMember()} />
          </div>
          <select value={inviteRole} onChange={(e) => setInviteRole(e.target.value)}
            className="h-11 rounded-xl border border-border/60 px-4 text-sm outline-none focus:border-blue-500">
            <option value="member">Member</option>
            <option value="admin">Admin</option>
          </select>
          <button onClick={inviteMember} disabled={!inviteEmail || !canInvite || inviting}
            className="h-11 rounded-xl bg-blue-500 px-6 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40 transition-colors whitespace-nowrap">
            {inviting ? "Sending..." : "Send Invite"}
          </button>
        </div>
        {!canInvite && (
          <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2">
            Your {planInfo.label} plan allows {planInfo.max} team member{planInfo.max > 1 ? "s" : ""}. <a href="/dashboard/pricing" className="underline font-medium">Upgrade</a> to invite more.
          </p>
        )}
      </div>

      {/* Role explanation */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👑</span>
            <h4 className="text-sm font-semibold">Owner</h4>
          </div>
          <p className="text-xs text-muted">Full access. Manage billing, team, and all platform features. One per account.</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔑</span>
            <h4 className="text-sm font-semibold">Admin</h4>
          </div>
          <p className="text-xs text-muted">Manage bookings, groups, packages, and team members. No billing access.</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">👤</span>
            <h4 className="text-sm font-semibold">Member</h4>
          </div>
          <p className="text-xs text-muted">View and create bookings, groups, and itineraries. Read-only for settings.</p>
        </div>
      </div>

      {/* Team Members List */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-border/30 px-5 py-4 bg-gray-50/50">
          <h3 className="text-sm font-semibold">Team members ({members.length})</h3>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : members.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-muted">No team members yet. Invite your first colleague above.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/20">
            {members.map((m) => {
              const roleStyle = ROLE_STYLES[m.role] || ROLE_STYLES.member;
              const isMe = m.id === currentUserId;
              const initials = m.full_name
                ? m.full_name.split(" ").filter(Boolean).map((p) => p[0]).join("").toUpperCase().slice(0, 2)
                : (m.email || "?")[0].toUpperCase();
              return (
                <div key={m.id} className={`flex items-center gap-4 px-5 py-4 ${isMe ? "bg-blue-50/30" : ""}`}>
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 text-sm font-bold text-white">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold truncate">{m.full_name || m.email}</p>
                      {isMe && <span className="text-[9px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-medium">You</span>}
                    </div>
                    <p className="text-xs text-muted truncate">{m.email}</p>
                  </div>
                  <span className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${roleStyle.bg} ${roleStyle.text}`}>
                    {roleStyle.label}
                  </span>
                  <span className="text-[10px] text-muted hidden sm:block">
                    Joined {new Date(m.created_at).toLocaleDateString("nl-NL")}
                  </span>
                  {!isMe && (
                    <button onClick={() => removeMember(m.id)}
                      className="shrink-0 rounded-lg p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="Remove from team">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                        <line x1="17" y1="11" x2="22" y2="11" />
                      </svg>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan comparison for upgrade */}
      {plan !== "enterprise" && (
        <div className="rounded-2xl border border-border/60 bg-gradient-to-r from-indigo-50 to-purple-50 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold">Need more team members?</h3>
              <p className="text-xs text-muted mt-1">
                {plan === "free"
                  ? "Upgrade to Pro for up to 3 team members, or Enterprise for unlimited."
                  : "Upgrade to Enterprise for unlimited team members and premium features."}
              </p>
            </div>
            <a href="/dashboard/pricing"
              className="shrink-0 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-xs font-semibold text-white hover:from-indigo-600 hover:to-purple-600 transition-all shadow-md">
              View Plans
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
