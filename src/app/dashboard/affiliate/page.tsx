"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";

interface Referral {
  id: string;
  name: string;
  created_at: string;
  approved: boolean;
  bookingCount: number;
  totalRevenue: number;
}

const tierConfig = [
  {
    name: "Starter",
    rate: 5,
    rateLabel: "5%",
    desc: "Commission on referred bookings",
    note: "Available from your first referral",
    threshold: 0,
    color: "from-slate-400 to-slate-500",
    ring: "ring-slate-300",
    bg: "bg-slate-50",
    badge: "bg-slate-100 text-slate-600",
  },
  {
    name: "Silver",
    rate: 7.5,
    rateLabel: "7.5%",
    desc: "Commission on referred bookings",
    note: "Unlocks after 5 successful referrals",
    threshold: 5,
    color: "from-blue-400 to-blue-600",
    ring: "ring-blue-300",
    bg: "bg-blue-50",
    badge: "bg-blue-100 text-blue-600",
  },
  {
    name: "Gold",
    rate: 10,
    rateLabel: "10%",
    desc: "Commission on referred bookings",
    note: "Unlocks after 15 successful referrals",
    threshold: 15,
    color: "from-amber-400 to-amber-600",
    ring: "ring-amber-300",
    bg: "bg-amber-50",
    badge: "bg-amber-100 text-amber-700",
  },
];

function StatIcon({ type }: { type: string }) {
  const props = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  switch (type) {
    case "users":
      return (
        <svg {...props}>
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      );
    case "check":
      return (
        <svg {...props}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      );
    case "euro":
      return (
        <svg {...props}>
          <path d="M4 10h12M4 14h9M6 6a6 6 0 0 1 0 12" />
        </svg>
      );
    case "clock":
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
      );
    default:
      return null;
  }
}

export default function AffiliatePage() {
  const [referralCode, setReferralCode] = useState("");
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [totalEarned, setTotalEarned] = useState(0);
  const [companyId, setCompanyId] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Generate referral code from user ID
      const code = user.id.replace(/-/g, "").substring(0, 8).toUpperCase();
      setReferralCode(code);

      // Get own company ID
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (!profile?.company_id) { setLoading(false); return; }
      setCompanyId(profile.company_id);

      // Find all companies referred by this company (via affiliate_referred_by in message JSON)
      const { data: allCompanies } = await supabase
        .from("companies")
        .select("id, name, message, created_at")
        .order("created_at", { ascending: false });

      if (!allCompanies) { setLoading(false); return; }

      const referred: Referral[] = [];
      for (const comp of allCompanies) {
        try {
          const msg = comp.message ? JSON.parse(comp.message) : {};
          if (msg.affiliate_referred_by === profile.company_id) {
            // Count bookings for this referred company
            const { count: bookingCount } = await supabase
              .from("bookings")
              .select("id", { count: "exact", head: true })
              .eq("company_id", comp.id);

            const { data: bookings } = await supabase
              .from("bookings")
              .select("total_price")
              .eq("company_id", comp.id);

            const revenue = bookings?.reduce((sum, b) => sum + (b.total_price || 0), 0) || 0;

            referred.push({
              id: comp.id,
              name: comp.name,
              created_at: comp.created_at,
              approved: msg.approved === true,
              bookingCount: bookingCount || 0,
              totalRevenue: revenue,
            });
          }
        } catch {
          // Skip malformed message
        }
      }

      setReferrals(referred);

      // Calculate commission based on tier
      const referralCount = referred.length;
      const currentTier = referralCount >= 15 ? tierConfig[2] : referralCount >= 5 ? tierConfig[1] : tierConfig[0];
      const totalRevenue = referred.reduce((sum, r) => sum + r.totalRevenue, 0);
      setTotalEarned(totalRevenue * (currentTier.rate / 100));

      setLoading(false);
    };

    load();
  }, []);

  const referralLink = `https://ticketmatch.ai/ref/${referralCode}`;
  const referralCount = referrals.length;
  const activeReferrals = referrals.filter((r) => r.approved || r.bookingCount > 0).length;
  const currentTierIndex = referralCount >= 15 ? 2 : referralCount >= 5 ? 1 : 0;

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

  const shareEmail = () => {
    const subject = encodeURIComponent("Join TicketMatch.ai - Group Booking Made Easy");
    const body = encodeURIComponent(
      `Hey!\n\nI've been using TicketMatch.ai to manage group bookings for tours, and it's been great. Thought you might find it useful too.\n\nSign up here: ${referralLink}\n\nCheers!`
    );
    window.open(`mailto:?subject=${subject}&body=${body}`);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `Hey! 👋\n\nI've been using *TicketMatch.ai* for group tour bookings — it's a B2B platform with 300+ venues across Europe at exclusive rates.\n\nCheck it out: ${referralLink}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareLinkedIn = () => {
    const url = encodeURIComponent(referralLink);
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${url}`, "_blank");
  };

  const stats = [
    { label: "Total Referrals", value: String(referralCount), icon: "users" },
    { label: "Active Referrals", value: String(activeReferrals), icon: "check" },
    { label: "Total Earned", value: `\u20AC ${totalEarned.toFixed(2)}`, icon: "euro" },
    { label: "Pending Payout", value: `\u20AC ${totalEarned.toFixed(2)}`, icon: "clock" },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 p-8 md:p-10 text-white shadow-xl shadow-purple-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 left-0 -mb-12 -ml-12 h-48 w-48 rounded-full bg-blue-400/20 blur-2xl" />
        <div className="absolute top-1/2 right-1/4 h-32 w-32 rounded-full bg-pink-400/10 blur-2xl" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-lg">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 12v6a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-6" />
                <polyline points="12 3 12 15" />
                <path d="M8 7l4-4 4 4" />
                <rect x="2" y="10" width="20" height="4" rx="1" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Refer & Earn</h1>
              <p className="text-white/70 text-sm md:text-base mt-0.5">
                Invite fellow tour operators and earn commission on their bookings
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Link Section */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Your Referral Link</h2>
        <p className="text-sm text-gray-500 mb-5">
          Share this link with other tour operators. When they sign up and book, you earn commission.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 shrink-0">
              <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
            </svg>
            <span className="text-sm font-mono text-gray-700 truncate select-all">{referralLink}</span>
          </div>
          <button
            onClick={handleCopy}
            className={`shrink-0 flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold transition-all duration-200 shadow-sm ${
              copied
                ? "bg-green-500 text-white shadow-green-500/25"
                : "bg-gradient-to-r from-violet-600 to-blue-600 text-white hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
            }`}
          >
            {copied ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Copied!
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" />
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Copy Link
              </>
            )}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex flex-wrap gap-3 mt-5">
          <button onClick={shareEmail} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
            </svg>
            Email
          </button>
          <button onClick={shareWhatsApp} className="flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-2.5 text-sm font-medium text-green-700 hover:bg-green-100 hover:border-green-300 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
            </svg>
            WhatsApp
          </button>
          <button onClick={shareLinkedIn} className="flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100 hover:border-blue-300 transition-all">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
            </svg>
            LinkedIn
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-500">
                <StatIcon type={stat.icon} />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Referred Agencies Table */}
      {referrals.length > 0 && (
        <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/60">
            <h2 className="text-lg font-semibold text-gray-900">Your Referrals</h2>
            <p className="text-sm text-gray-500 mt-0.5">Agencies that signed up via your link</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 bg-gray-50/50">
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Company</th>
                  <th className="text-left px-6 py-3 font-medium text-gray-500">Signed Up</th>
                  <th className="text-center px-6 py-3 font-medium text-gray-500">Status</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Bookings</th>
                  <th className="text-right px-6 py-3 font-medium text-gray-500">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((r) => (
                  <tr key={r.id} className="border-b border-border/30 hover:bg-gray-50/50">
                    <td className="px-6 py-3 font-medium text-gray-900">{r.name}</td>
                    <td className="px-6 py-3 text-gray-500">{new Date(r.created_at).toLocaleDateString()}</td>
                    <td className="px-6 py-3 text-center">
                      {r.approved ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-medium text-green-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs font-medium text-amber-700">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-right text-gray-700">{r.bookingCount}</td>
                    <td className="px-6 py-3 text-right font-medium text-gray-900">&euro; {r.totalRevenue.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commission Tiers */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-1">Commission Tiers</h2>
        <p className="text-sm text-gray-500 mb-5">Refer more operators to unlock higher commission rates</p>
        <div className="grid md:grid-cols-3 gap-4">
          {tierConfig.map((tier, i) => (
            <div
              key={tier.name}
              className={`relative rounded-2xl border bg-white shadow-sm overflow-hidden transition-all hover:shadow-md hover:-translate-y-0.5 ${
                i === currentTierIndex
                  ? "border-purple-200 ring-2 ring-purple-400/30"
                  : "border-border/60"
              }`}
            >
              {i === currentTierIndex && (
                <div className="absolute top-3 right-3">
                  <span className="inline-flex items-center rounded-full bg-purple-100 px-2.5 py-0.5 text-xs font-semibold text-purple-700">Current</span>
                </div>
              )}
              <div className={`h-1.5 bg-gradient-to-r ${tier.color}`} />
              <div className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${tier.color} text-white shadow-sm`}>
                    {i === 0 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    ) : i === 1 ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5C7 4 9 7 12 7s5-3 7.5-3a2.5 2.5 0 0 1 0 5H18" />
                        <path d="M18 15h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M6 15H4.5a2.5 2.5 0 0 0 0 5H6" />
                        <line x1="2" y1="12" x2="22" y2="12" />
                      </svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 2L2 7l10 5 10-5-10-5z" />
                        <path d="M2 17l10 5 10-5" />
                        <path d="M2 12l10 5 10-5" />
                      </svg>
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{tier.name}</h3>
                    {tier.threshold > 0 && <p className="text-xs text-gray-400">{tier.threshold}+ referrals</p>}
                  </div>
                </div>
                <div className="mb-4">
                  <span className="text-3xl font-bold text-gray-900">{tier.rateLabel}</span>
                  <span className="text-sm text-gray-500 ml-1">commission</span>
                </div>
                <p className="text-sm text-gray-500">{tier.desc}</p>
                <p className="text-xs text-gray-400 mt-1">{tier.note}</p>

                {/* Progress indicator */}
                {i > 0 && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
                      <span>Progress</span>
                      <span>{Math.min(referralCount, tier.threshold)} / {tier.threshold}</span>
                    </div>
                    <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${tier.color} transition-all`}
                        style={{ width: `${Math.min(100, (referralCount / tier.threshold) * 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* How It Works */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 md:p-8 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              step: "1",
              title: "Share Your Link",
              desc: "Send your unique referral link to fellow tour operators via email, WhatsApp, or LinkedIn.",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="18" cy="5" r="3" />
                  <circle cx="6" cy="12" r="3" />
                  <circle cx="18" cy="19" r="3" />
                  <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                  <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                </svg>
              ),
            },
            {
              step: "2",
              title: "They Sign Up & Book",
              desc: "When they create an account using your link and make their first booking, you get credited.",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <polyline points="16 11 18 13 22 9" />
                </svg>
              ),
            },
            {
              step: "3",
              title: "You Earn Commission",
              desc: "Earn a percentage of every booking they make. The more you refer, the higher your tier.",
              icon: (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
                  <path d="M12 18V6" />
                </svg>
              ),
            },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-100 to-blue-100 text-purple-600">
                {item.icon}
              </div>
              <div className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-xs font-bold text-purple-700 mb-2">
                {item.step}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Terms */}
      <div className="rounded-2xl border border-border/60 bg-gray-50/50 p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Commission Terms</h3>
        <div className="text-xs text-gray-500 space-y-1 leading-relaxed">
          <p>
            Commissions are calculated on the net booking value (excluding taxes and platform fees).
            Payouts are processed monthly, with a minimum threshold of &euro;50. Referrals must
            result in an active, paying account to qualify. Commission rates are subject to the
            current tier at the time of the referred booking. TicketMatch.ai reserves the right
            to modify the referral program terms with 30 days notice.
          </p>
          <p className="text-gray-400">
            For questions about the referral program, contact{" "}
            <a href="mailto:support@ticketmatch.ai" className="text-purple-500 hover:underline">
              support@ticketmatch.ai
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
