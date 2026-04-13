"use client";

import { useState } from "react";

const SECTIONS = [
  {
    title: "1. Role of the Reseller",
    content: `As a TicketMatch.ai Reseller, your role is to refer new travel agencies, tour operators, and DMCs to the TicketMatch platform. You do this by sharing your unique referral link. When a new client signs up through your link, they are automatically connected to you in our system.

Your responsibility is to introduce potential clients to TicketMatch.ai and encourage them to create an account. You are not responsible for the client's bookings, payments, or customer service — TicketMatch handles all of that.`,
  },
  {
    title: "2. Client Ownership",
    content: `Once a client signs up through your referral link, they become a TicketMatch.ai client. This means:

• The client's account, data, and bookings are managed by TicketMatch.ai
• TicketMatch.ai handles all customer support, billing, and platform access
• The client has a direct relationship with TicketMatch.ai
• You cannot transfer, sell, or claim exclusive rights to a referred client
• If a client was already registered before using your link, the existing registration takes priority

You will continue to earn commission on the client's bookings as long as they remain active on the platform and your reseller agreement is in good standing.`,
  },
  {
    title: "3. Commission Structure",
    content: `As a reseller, you earn a commission on every booking made by your referred clients:

• Commission rate: as agreed per reseller
• Commission is calculated on the net B2B booking amount (excluding VAT)
• Commission is tracked automatically in your Reseller Dashboard
• Payouts are processed monthly, within 30 days after the end of each month
• Minimum payout threshold: €50
• Payment is made via bank transfer to your registered account

Commission rates may vary based on your reseller tier and can be adjusted by TicketMatch.ai with 30 days notice.`,
  },
  {
    title: "4. Membership Plans",
    content: `Your referred clients can choose from the following TicketMatch.ai plans:

• Free — Limited access, up to 5 bookings/month, basic catalog
• Pro (€49/month) — Full catalog, unlimited bookings, priority support, Knowledge Base
• Enterprise (€149/month) — Everything in Pro + API access, custom integrations, dedicated account manager

Higher-tier memberships from your clients result in more bookings and higher commission for you. You are encouraged to help clients understand the benefits of upgrading, but you may never make false promises about the platform's features.`,
  },
  {
    title: "5. Do's and Don'ts",
    content: `What you CAN do:
• Share your reseller link on your website, social media, email, and in personal conversations
• Explain TicketMatch.ai features and benefits to potential clients
• Use the Reseller Agent for marketing tips and outreach templates
• Attend events and networking sessions to promote TicketMatch.ai

What you CANNOT do:
• Make false claims about TicketMatch.ai features, pricing, or guarantees
• Offer discounts or special deals that are not authorized by TicketMatch.ai
• Use spam, unsolicited mass emails, or deceptive marketing practices
• Impersonate TicketMatch.ai staff or claim to be an official representative
• Create fake accounts or self-referrals to earn commission
• Share confidential platform data with third parties`,
  },
  {
    title: "6. Termination",
    content: `This reseller agreement can be terminated by either party with 30 days written notice. TicketMatch.ai reserves the right to terminate immediately if:

• You violate these terms and conditions
• You engage in fraudulent activity
• You damage the reputation of TicketMatch.ai
• Your account has been inactive for more than 12 months

Upon termination:
• You will receive any outstanding commission for bookings already made
• Your referral link will be deactivated
• Existing clients remain TicketMatch.ai clients and will not be reassigned`,
  },
  {
    title: "7. Liability",
    content: `TicketMatch.ai is not responsible for:
• Revenue or commission expectations that are not met
• Technical issues or downtime that may affect bookings
• Disputes between you and your referred clients

As a reseller, you agree to:
• Comply with all applicable laws and regulations
• Not hold TicketMatch.ai liable for indirect damages
• Resolve any disputes through the designated process

These terms are governed by Dutch law. Any disputes will be resolved in the courts of Amsterdam, the Netherlands.`,
  },
  {
    title: "8. Changes to Terms",
    content: `TicketMatch.ai reserves the right to update these terms and conditions at any time. You will be notified of significant changes via email at least 14 days before they take effect. Continued use of the reseller program after changes take effect constitutes acceptance of the new terms.

Last updated: April 2026
Version: 1.0`,
  },
];

export default function ResellerTermsPage() {
  const [expanded, setExpanded] = useState<string | null>(SECTIONS[0].title);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl bg-gradient-to-r from-green-700 to-emerald-600 p-8 text-white shadow-xl shadow-green-900/10">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Terms & Conditions</h1>
            <p className="text-sm text-green-200/70">Reseller Program Agreement — TicketMatch.ai</p>
          </div>
        </div>
      </div>

      {/* Summary card */}
      <div className="rounded-2xl border border-green-200 bg-green-50/50 p-5">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-green-100">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-green-800">Key points</p>
            <ul className="mt-1 space-y-1 text-xs text-green-700">
              <li>• You earn <strong>commission</strong> on all bookings from your referred clients</li>
              <li>• Clients become <strong>TicketMatch.ai clients</strong> after signup — you keep earning commission</li>
              <li>• Monthly payouts via bank transfer (minimum &euro;50)</li>
              <li>• 30 days notice for termination by either party</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Accordion sections */}
      <div className="rounded-2xl border border-border/60 bg-white shadow-sm overflow-hidden divide-y divide-border/30">
        {SECTIONS.map((section) => (
          <div key={section.title}>
            <button
              onClick={() => setExpanded(expanded === section.title ? null : section.title)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50/50 transition-colors"
            >
              <span className="text-sm font-semibold">{section.title}</span>
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`text-gray-400 transition-transform ${expanded === section.title ? "rotate-180" : ""}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {expanded === section.title && (
              <div className="px-6 pb-5">
                <div className="text-sm text-muted leading-relaxed whitespace-pre-line">{section.content}</div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm text-center">
        <p className="text-sm text-muted">Questions about these terms?</p>
        <p className="text-sm font-semibold mt-1">
          Contact us at <span className="text-green-600">partners@ticketmatch.ai</span>
        </p>
      </div>
    </div>
  );
}
