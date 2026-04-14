"use client";

import { useEffect, useState } from "react";

interface Agency {
  id: string;
  name: string;
  company_type: string | null;
  status: string | null;
  created_at: string;
  bookingCount: number;
  totalRevenue: number;
}

export default function ResellerDashboard() {
  const [loading, setLoading] = useState(true);
  const [resellerSlug, setResellerSlug] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [commissionRate, setCommissionRate] = useState(10);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [totalBookings, setTotalBookings] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalCommission, setTotalCommission] = useState(0);
  const [copied, setCopied] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [newSlug, setNewSlug] = useState("");
  const [slugError, setSlugError] = useState("");
  const [slugSaving, setSlugSaving] = useState(false);
  const [companyId, setCompanyId] = useState("");
  const [companyMessage, setCompanyMessage] = useState<Record<string, unknown>>({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [activeInviteTab, setActiveInviteTab] = useState<"reseller" | "developer">("reseller");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("/api/reseller/data");
        if (!res.ok) { setLoading(false); return; }
        const data = await res.json();

        const ADMIN_EMAILS = ["wortelboerdenis@gmail.com", "patekrolexvc@gmail.com"];
        if (data.userEmail && ADMIN_EMAILS.includes(data.userEmail)) {
          setIsAdmin(true);
        }

        setResellerSlug(data.resellerSlug || "");
        setCompanyName(data.companyName || "");
        setCommissionRate(data.commissionRate || 10);
        setCompanyId(data.companyId || "");
        setCompanyMessage(data.companyMessage || {});
        setAgencies(data.agencies || []);
        setTotalBookings(data.totalBookings || 0);
        setTotalRevenue(data.totalRevenue || 0);
        setTotalCommission(data.totalCommission || 0);
      } catch (err) {
        console.error("Reseller load error:", err);
      }
      setLoading(false);
    };
    load();
  }, []);

  const referralLink = `https://ticketmatch.ai/join/${resellerSlug}`;

  const handleSlugSave = async () => {
    const cleaned = newSlug.toLowerCase().replace(/[^a-z0-9-]/g, "").replace(/^-|-$/g, "").substring(0, 30);
    if (!cleaned || cleaned.length < 3) {
      setSlugError("Minimum 3 characters (letters, numbers, hyphens)");
      return;
    }
    setSlugSaving(true);
    setSlugError("");

    // Check if slug is already taken
    const res = await fetch(`/api/reseller/lookup?slug=${encodeURIComponent(cleaned)}`);
    if (res.ok) {
      const existing = await res.json();
      if (existing.id !== companyId) {
        setSlugError("This slug is already taken. Choose another one.");
        setSlugSaving(false);
        return;
      }
    }

    // Save new slug via API
    const updatedMsg = { ...companyMessage, reseller_slug: cleaned };
    const saveRes = await fetch("/api/reseller/data", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ companyId, message: updatedMsg }),
    });

    if (!saveRes.ok) {
      setSlugError("Could not save. Try again.");
    } else {
      setResellerSlug(cleaned);
      setCompanyMessage(updatedMsg);
      setEditingSlug(false);
    }
    setSlugSaving(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(referralLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      const input = document.createElement("input");
      input.value = referralLink;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`Join TicketMatch.ai — book group tickets at B2B rates for your tour groups! Sign up here: ${referralLink}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareEmail = () => {
    const subject = encodeURIComponent("Join TicketMatch.ai — Group Booking Platform for Tour Operators");
    const body = encodeURIComponent(`Hi,\n\nI'd like to invite you to TicketMatch.ai — a B2B platform where you can book museums, attractions and city experiences for your tour groups at exclusive rates.\n\nSign up here: ${referralLink}\n\nLooking forward to working together!\n\nBest regards,\n${companyName}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  /* ── Invite configurations ── */
  const inviteConfigs = {
    reseller: {
      link: "https://ticketmatch.ai/become-reseller",
      label: "Resellers",
      tagline: "Earn commission on every booking",
      color: "amber",
      icon: "handshake",
      whatsapp: `Hi! 👋\n\nI'd like to invite you to the *Reseller Program* at TicketMatch.ai — the B2B ecosystem for group tickets across Europe.\n\n🎯 *What's in it for you?*\n💰 Commission on every booking\n📊 Your own reseller dashboard with real-time insights\n🔗 Unique referral link for your network\n💳 Monthly payouts\n\n🚀 *What is TicketMatch.ai?*\nA premium platform where tour operators book group tickets for 300+ museums, attractions and city experiences — powered by AI agents, live busyness data and route planning.\n\n✅ No costs, no risk\n✅ Fully automated\n✅ Start immediately\n\n👉 Sign up here: https://ticketmatch.ai/become-reseller\n\nQuestions? Feel free to reach out!`,
      emailSubject: "Invitation: Become a Reseller at TicketMatch.ai — Earn Commission on Every Booking",
      emailBody: `Hi,\n\nI'd like to invite you to the Reseller Program at TicketMatch.ai.\n\nTicketMatch.ai is the B2B ecosystem where tour operators book group tickets for 300+ museums, attractions and city experiences across Europe. The platform features AI agents, real-time busyness data, route planning and QR vouchers — all in one premium dashboard.\n\nAs a reseller you get:\n\n• 💰 Commission on every booking from agencies you refer\n• 🔗 Your own unique referral link\n• 📊 Real-time dashboard with insights into your agencies and earnings\n• 💳 Monthly payouts — no costs, no risk\n\nAll you need to do: share your link with tour operators in your network. We handle the rest.\n\nSign up here:\nhttps://ticketmatch.ai/become-reseller\n\nQuestions? Don't hesitate to reach out!\n\nBest regards,\nTicketMatch.ai`,
    },
    developer: {
      link: "https://ticketmatch.ai/developers",
      label: "Developers",
      tagline: "Build on top of our ecosystem",
      color: "purple",
      icon: "code",
      whatsapp: `Hi! 👋\n\nI'd like to invite you to the *Developer Program* at TicketMatch.ai.\n\n💻 *What is TicketMatch.ai?*\nThe B2B ecosystem for group tickets in Europe. 300+ venues, 8+ cities, AI-powered — built on Next.js, Supabase and Vercel.\n\n🔧 *What we offer developers:*\n📖 Full API documentation\n🤖 Developer AI Agent for support\n🧪 Sandbox environment for testing\n🔌 REST API for integrations\n\n🎯 *Why join?*\nIntegrate your platform with our ecosystem. Give your clients direct access to group bookings at museums, attractions and city experiences.\n\n👉 Apply here: https://ticketmatch.ai/developers\n\nQuestions about the technical possibilities? Feel free to reach out!`,
      emailSubject: "Invitation: Become a Developer Partner at TicketMatch.ai",
      emailBody: `Hi,\n\nI'd like to invite you to the Developer Program at TicketMatch.ai.\n\nTicketMatch.ai is the B2B ecosystem for group tickets in Europe — 300+ venues, 8+ cities, fully AI-powered. Built on Next.js, Supabase and Vercel.\n\nAs a developer partner you get:\n\n• 📖 Full API documentation & reference\n• 🤖 Dedicated Developer AI Agent for technical support\n• 🧪 Sandbox environment for testing integrations\n• 🔌 REST API for bookings, catalog and venue data\n• 🛠️ Webhooks for real-time updates\n\nIntegrate your platform, app or service with our ecosystem and give your clients direct access to group bookings at museums, attractions and city experiences across Europe.\n\nApply as a developer:\nhttps://ticketmatch.ai/developers\n\nTechnical questions? Don't hesitate to reach out!\n\nBest regards,\nTicketMatch.ai`,
    },
    agency: {
      link: referralLink,
      label: "Tour Agencies",
      tagline: "Book group tickets at exclusive B2B rates",
      color: "blue",
      icon: "ticket",
      whatsapp: `Hi! 👋\n\nI'd like to introduce you to *TicketMatch.ai* — the B2B platform for group tickets in Europe.\n\n🎫 *What can you do?*\n✅ Book tickets for 300+ museums, attractions and city experiences\n✅ Exclusive B2B rates — up to 30% cheaper\n✅ AI agent to help you plan\n✅ Live busyness data per venue\n✅ Route planning for your groups\n✅ QR vouchers — no more paper tickets\n\n🌍 *8+ European cities*\nAmsterdam, Rotterdam, The Hague, Brussels, Berlin, Paris, Barcelona, London\n\n🚀 Free to join, start booking today:\n${referralLink}\n\nQuestions? Feel free to reach out!`,
      emailSubject: "Invitation: TicketMatch.ai — Group Tickets at Exclusive B2B Rates",
      emailBody: `Hi,\n\nI'd like to introduce you to TicketMatch.ai — the B2B platform where tour operators book group tickets for museums, attractions and city experiences across Europe.\n\nWhat does TicketMatch.ai offer?\n\n• 🎫 300+ venues in 8+ European cities\n• 💰 Exclusive B2B rates — up to 30% cheaper than retail\n• 🤖 AI agent to help with planning and bookings\n• 📊 Live busyness data per venue and timeslot\n• 🗺️ Route planning for your groups\n• 📱 QR vouchers — no more paper tickets\n• 📋 Group management with passenger lists\n\nCities: Amsterdam, Rotterdam, The Hague, Brussels, Berlin, Paris, Barcelona, London — and expanding fast.\n\nFree to join and start booking:\n${referralLink}\n\nQuestions? Don't hesitate to reach out!\n\nBest regards,\nTicketMatch.ai`,
    },
  };

  const handleInviteWhatsApp = (type: keyof typeof inviteConfigs) => {
    const config = inviteConfigs[type];
    window.open(`https://wa.me/?text=${encodeURIComponent(config.whatsapp)}`, "_blank");
  };

  const handleInviteEmail = (type: keyof typeof inviteConfigs) => {
    const config = inviteConfigs[type];
    window.open(`mailto:?subject=${encodeURIComponent(config.emailSubject)}&body=${encodeURIComponent(config.emailBody)}`);
  };

  const handleCopyInviteLink = async (type: keyof typeof inviteConfigs) => {
    const config = inviteConfigs[type];
    try {
      await navigator.clipboard.writeText(config.link);
    } catch {}
    setCopiedLink(type);
    setTimeout(() => setCopiedLink(null), 2500);
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-green-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Admin: Invite Hub — 3 types */}
      {isAdmin && (
        <div className="rounded-2xl border border-gray-200 bg-white shadow-sm overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-5">
            <h2 className="text-lg font-bold text-white">Invite to TicketMatch.ai</h2>
            <p className="text-sm text-gray-400 mt-0.5">Premium invitations for your network</p>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-200">
            {([
              { key: "reseller" as const, label: "Resellers", emoji: "🤝", color: "amber" },
              { key: "developer" as const, label: "Developers", emoji: "💻", color: "purple" },
            ]).map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveInviteTab(tab.key)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all border-b-2 ${
                  activeInviteTab === tab.key
                    ? tab.color === "amber" ? "border-amber-500 text-amber-700 bg-amber-50/50"
                    : tab.color === "purple" ? "border-purple-500 text-purple-700 bg-purple-50/50"
                    : "border-blue-500 text-blue-700 bg-blue-50/50"
                    : "border-transparent text-gray-400 hover:text-gray-600 hover:bg-gray-50"
                }`}
              >
                <span className="mr-1.5">{tab.emoji}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Active invite content */}
          <div className="p-6">
            {/* Tagline */}
            <div className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold mb-4 ${
              activeInviteTab === "reseller" ? "bg-amber-100 text-amber-700"
              : activeInviteTab === "developer" ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
            }`}>
              {inviteConfigs[activeInviteTab].tagline}
            </div>

            {/* Link */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              <div className="flex-1 flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
                <span className="text-sm font-mono text-gray-700 truncate select-all">{inviteConfigs[activeInviteTab].link}</span>
              </div>
              <button
                onClick={() => handleCopyInviteLink(activeInviteTab)}
                className={`shrink-0 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all shadow-sm ${
                  copiedLink === activeInviteTab
                    ? "bg-green-500 text-white"
                    : activeInviteTab === "reseller" ? "bg-amber-600 text-white hover:bg-amber-700"
                    : activeInviteTab === "developer" ? "bg-purple-600 text-white hover:bg-purple-700"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {copiedLink === activeInviteTab ? "Copied!" : "Copy Link"}
              </button>
            </div>

            {/* Share buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => handleInviteWhatsApp(activeInviteTab)}
                className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-5 py-2.5 text-sm font-semibold text-green-700 hover:bg-green-100 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
                WhatsApp Invite
              </button>
              <button
                onClick={() => handleInviteEmail(activeInviteTab)}
                className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-all"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                Email Invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-white shadow-xl shadow-green-900/10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-200">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Reseller Dashboard</h1>
            <p className="text-sm text-green-200/70">Track your agencies, bookings and earnings.</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Agencies</p>
          <p className="mt-2 text-3xl font-bold">{agencies.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Total Bookings</p>
          <p className="mt-2 text-3xl font-bold">{totalBookings}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Booking Revenue</p>
          <p className="mt-2 text-3xl font-bold text-accent">&euro; {totalRevenue.toFixed(2)}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wider text-muted">Your Commission ({commissionRate}%)</p>
          <p className="mt-2 text-3xl font-bold text-green-600">&euro; {totalCommission.toFixed(2)}</p>
        </div>
      </div>

      {/* Referral Link */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-1">Your Reseller Link</h2>
        <p className="text-sm text-muted mb-4">Share this link with travel agencies. When they sign up, they&apos;re automatically linked to you.</p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-sm font-mono text-gray-700 truncate select-all">{referralLink}</span>
          </div>
          <button onClick={handleCopy} className={`shrink-0 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all shadow-sm ${copied ? "bg-green-500 text-white" : "bg-gradient-to-r from-green-600 to-emerald-600 text-white hover:shadow-lg hover:shadow-green-500/25"}`}>
            {copied ? "Copied!" : "Copy Link"}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mt-4">
          <button onClick={shareEmail} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
            Email
          </button>
          <button onClick={shareWhatsApp} className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
            WhatsApp
          </button>
          <button
            onClick={() => { setEditingSlug(true); setNewSlug(resellerSlug); setSlugError(""); }}
            className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 transition-all ml-auto"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /><path d="m15 5 4 4" /></svg>
            Customize Link
          </button>
        </div>

        {/* Slug Editor */}
        {editingSlug && (
          <div className="mt-4 rounded-xl border border-green-200 bg-green-50/50 p-4">
            <p className="text-sm font-medium mb-2">Customize your link</p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 flex items-center rounded-xl border border-gray-200 bg-white overflow-hidden">
                <span className="px-3 text-sm text-gray-400 whitespace-nowrap border-r border-gray-200 bg-gray-50 py-2.5">ticketmatch.ai/join/</span>
                <input
                  type="text"
                  value={newSlug}
                  onChange={(e) => {
                    setNewSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "").substring(0, 30));
                    setSlugError("");
                  }}
                  placeholder="your-custom-slug"
                  className="flex-1 px-3 py-2.5 text-sm outline-none"
                  autoFocus
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleSlugSave}
                  disabled={slugSaving || !newSlug.trim()}
                  className="rounded-xl bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition-all"
                >
                  {slugSaving ? "Saving..." : "Save"}
                </button>
                <button
                  onClick={() => setEditingSlug(false)}
                  className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
            {slugError && <p className="mt-2 text-sm text-red-600">{slugError}</p>}
            <p className="mt-2 text-xs text-gray-500">Only lowercase letters, numbers and hyphens. Min 3 characters.</p>
          </div>
        )}
      </div>

      {/* Agencies */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Your Agencies</h2>
        {agencies.length > 0 ? (
          <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
            {agencies.map((a) => (
              <div key={a.id} className="flex items-center justify-between px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
                    {(a.name || "?").substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{a.name}</p>
                    <p className="text-xs text-muted">
                      {a.company_type || "Agency"} &middot; Joined {formatDate(a.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold">{a.bookingCount} bookings</p>
                  <p className="text-xs text-muted">
                    &euro; {a.totalRevenue.toFixed(2)} revenue
                    {a.totalRevenue > 0 && (
                      <span className="text-green-600"> &middot; &euro; {(a.totalRevenue * commissionRate / 100).toFixed(2)} commission</span>
                    )}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border-2 border-dashed border-green-200 bg-green-50/30 p-12 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-600">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
                <line x1="19" y1="8" x2="19" y2="14" /><line x1="22" y1="11" x2="16" y2="11" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900">No agencies yet</h3>
            <p className="mt-1 text-sm text-muted">Share your reseller link to start bringing in agencies!</p>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">How it works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "1", title: "Share your link", desc: "Send your unique reseller link to travel agencies in your network." },
            { step: "2", title: "They sign up & book", desc: "Agencies register through your link and start booking tickets for their groups." },
            { step: "3", title: "You earn commission", desc: `You earn ${commissionRate}% commission on every booking made by your agencies.` },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                {item.step}
              </div>
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-1 text-sm text-muted">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
