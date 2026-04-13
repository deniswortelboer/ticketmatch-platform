"use client";

import { useState } from "react";

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

const faqData: FaqItem[] = [
  // ── General ──────────────────────────────────────────────
  {
    category: "General",
    question: "What is TicketMatch.ai?",
    answer:
      "TicketMatch.ai is a B2B ecosystem that connects tour operators, DMCs, travel agencies, and resellers to over 300,000 experiences across 3,000+ cities worldwide. We aggregate supply from 10 specialist supplier APIs into one unified platform, giving you access to the widest range of tours, activities, and attractions at exclusive B2B rates.",
  },
  {
    category: "General",
    question: "Who is TicketMatch for?",
    answer:
      "TicketMatch is built exclusively for travel professionals — tour operators, destination management companies (DMCs), travel agencies, corporate travel managers, and resellers. Our platform is not open to individual consumers; every member is verified as a legitimate business before gaining access.",
  },
  {
    category: "General",
    question: "How is TicketMatch different from other booking platforms?",
    answer:
      "We're not a consumer platform. TicketMatch is built exclusively for B2B travel professionals. We aggregate 10 supplier APIs into one dashboard, offer exclusive B2B rates invisible to the public, provide 8 role-based AI agents, live busyness data, QR vouchers, and real-time analytics. It's a complete ecosystem, not just a booking tool.",
  },
  {
    category: "General",
    question: "Can I use TicketMatch for individual (non-business) bookings?",
    answer:
      "No. TicketMatch is exclusively for verified travel businesses. Every membership application is manually reviewed. Consumer bookings are not supported.",
  },

  // ── Membership & Pricing ─────────────────────────────────
  {
    category: "Membership & Pricing",
    question: "How does membership work?",
    answer:
      "Getting started is simple: register with your business details and our team manually reviews every application within 24 hours. Once approved, you can choose from three plans — Explorer (free, perfect for getting started), Growth (€49/mo with priority support and advanced features), or Enterprise (€149/mo with API access, white-label options, and dedicated account management).",
  },
  {
    category: "Membership & Pricing",
    question: "What are the B2B rates?",
    answer:
      "As an approved TicketMatch member, you unlock exclusive B2B rates that are only visible to verified travel professionals. These rates offer significant savings compared to retail pricing, allowing you to build competitive packages for your clients while maintaining healthy margins.",
  },
  {
    category: "Membership & Pricing",
    question: "What's included in the free Explorer plan?",
    answer:
      "Browse the full catalog of 300,000+ experiences, access the live city map across 3,000+ cities, 1 team member, Emma AI assistant, weather forecasts, and up to 5 bookings per month. No credit card required, free forever.",
  },
  {
    category: "Membership & Pricing",
    question: "What's the difference between Growth and Enterprise?",
    answer:
      "Growth (€49/mo) includes unlimited bookings, live busyness data, QR vouchers, package builder, PDF exports, up to 5 team members, and multi-channel notifications. Enterprise (€149/mo) adds unlimited team members, API access, white-label options, custom AI agent training, dedicated account manager, multi-city management, and priority SLA.",
  },
  {
    category: "Membership & Pricing",
    question: "Is there a free trial?",
    answer:
      "Yes! The Growth plan comes with a 14-day free trial, no credit card required. You can also start with the Explorer plan which is free forever.",
  },
  {
    category: "Membership & Pricing",
    question: "Can I cancel anytime?",
    answer:
      "Absolutely. No long-term contracts, no setup fees, no hidden costs. Cancel your subscription anytime from your dashboard.",
  },

  // ── Platform Features ────────────────────────────────────
  {
    category: "Platform Features",
    question: "How many experiences are available?",
    answer:
      "Our platform features over 300,000 experiences across 3,000+ cities worldwide, organized into 12 categories including city tours, museums, outdoor adventures, food experiences, and more. All supply is aggregated in real time from 10 specialist supplier APIs, so availability and pricing are always up to date.",
  },
  {
    category: "Platform Features",
    question: "What is the QR voucher system?",
    answer:
      "Every booking generates a digital ticket with a unique QR code per guest. Venues scan the QR code at the entrance for instant validation — no paper tickets, no waiting. This system has reduced no-shows by 35% and streamlines the check-in process for both operators and guests.",
  },
  {
    category: "Platform Features",
    question: "How does the Package Builder work?",
    answer:
      "Combine multiple experiences into custom group packages. Set your own pricing, add group discounts, and generate shareable proposals for your clients. Perfect for multi-day itineraries and themed group trips.",
  },
  {
    category: "Platform Features",
    question: "Can I export invoices and itineraries?",
    answer:
      "Yes. Generate professional PDF invoices with VAT calculation, company details, and payment terms in one click. Itineraries can be exported as branded PDFs with venue details, timing, and route information.",
  },
  {
    category: "Platform Features",
    question: "What notification channels are supported?",
    answer:
      "Real-time alerts via email, Telegram, and WhatsApp. Get notified instantly about new bookings, status changes, team activity, and important updates.",
  },

  // ── AI & Technology ──────────────────────────────────────
  {
    category: "AI & Technology",
    question: "What are the 8 AI agents?",
    answer:
      "TicketMatch features role-based AI agents tailored to each user type. Emma is our public-facing assistant for general inquiries. Behind the login, 7 specialized agents serve bookers, resellers, admins, partners, developers, and advertisers — each trained on their specific workflows, data access, and responsibilities to maximize productivity.",
  },
  {
    category: "AI & Technology",
    question: "How does live busyness data work?",
    answer:
      "We integrate real-time crowd level data via the Google Places API for thousands of venues and attractions. This helps you and your clients plan visits during quieter times, avoid peak crowds, and optimize scheduling — leading to better guest experiences and smoother operations.",
  },
  {
    category: "AI & Technology",
    question: "Is there an API available?",
    answer:
      "Yes. Our Enterprise plan (€149/mo) includes full API access for custom integrations, white-label solutions, and developer tools. You can programmatically search, book, and manage experiences across our entire catalog. Comprehensive documentation, SDKs, and sandbox environments are provided to get you up and running quickly.",
  },
  {
    category: "AI & Technology",
    question: "Who is Emma?",
    answer:
      "Emma is your AI travel assistant — the public-facing agent on the TicketMatch homepage. She speaks every language fluently, knows every venue across 3,000+ cities, provides real-time insights, and helps plan itineraries in minutes. After signing up, you get access to 7 more specialized AI agents.",
  },

  // ── Cities & Experiences ─────────────────────────────────
  {
    category: "Cities & Experiences",
    question: "What cities does TicketMatch cover?",
    answer:
      "We have deep coverage in 18 Dutch cities — Amsterdam alone has 8,400+ experiences, Rotterdam 2,100+, and growing. Beyond the Netherlands, we cover 14+ European capitals and 3,000+ cities worldwide. Our goal is to be the most comprehensive B2B experience marketplace, starting with the Netherlands and expanding across Europe.",
  },

  // ── Security & Compliance ────────────────────────────────
  {
    category: "Security & Compliance",
    question: "Is my data safe with TicketMatch?",
    answer:
      "Absolutely. We're SOC 2 compliant, GDPR ready, with 256-bit SSL encryption and EU-based data centers. We maintain 99.9% uptime and follow strict data protection protocols. Your business data and client information are always secure.",
  },
  {
    category: "Security & Compliance",
    question: "Do you support the Reseller program?",
    answer:
      "Yes! Travel agents can earn commission by reselling TicketMatch experiences to their clients. As a reseller, you get your own branded portal, commission tracking, and dedicated support. Apply through the platform to join the reseller network.",
  },
];

// Derive ordered categories from faqData while preserving insertion order
function groupByCategory(items: FaqItem[]) {
  const groups: { category: string; items: FaqItem[] }[] = [];
  const seen = new Map<string, number>();

  for (const item of items) {
    const idx = seen.get(item.category);
    if (idx !== undefined) {
      groups[idx].items.push(item);
    } else {
      seen.set(item.category, groups.length);
      groups.push({ category: item.category, items: [item] });
    }
  }
  return groups;
}

export default function FAQ() {
  const [openItems, setOpenItems] = useState<Set<number>>(new Set());

  const toggle = (index: number) => {
    setOpenItems((prev) => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  const groups = groupByCategory(faqData);

  // Build a flat index counter so each FAQ item has a unique global index
  let globalIndex = 0;

  return (
    <section className="w-full max-w-3xl mx-auto py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-10">
        Frequently Asked Questions
      </h2>
      <div className="space-y-3">
        {groups.map((group, groupIdx) => {
          const rendered = (
            <div key={group.category}>
              {/* Category header */}
              <div
                className={`text-[11px] font-bold uppercase tracking-[0.15em] text-accent mb-3 ${
                  groupIdx === 0 ? "mt-0" : "mt-8"
                } border-l-2 border-accent pl-3`}
              >
                {group.category}
              </div>

              {/* Questions in this category */}
              <div className="space-y-3">
                {group.items.map((item) => {
                  const idx = globalIndex++;
                  const isOpen = openItems.has(idx);
                  return (
                    <div
                      key={idx}
                      className="rounded-xl bg-card-bg border border-card-border border-l-4 border-l-accent hover:shadow-md hover:-translate-y-0.5 transition-[box-shadow,transform] duration-200"
                    >
                      <button
                        onClick={() => toggle(idx)}
                        aria-expanded={isOpen}
                        aria-controls={`faq-answer-${idx}`}
                        className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left cursor-pointer"
                      >
                        <span className="font-bold text-[15px]">
                          {item.question}
                        </span>
                        <svg
                          className={`w-5 h-5 shrink-0 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : "rotate-0"
                          }`}
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </button>
                      <div
                        id={`faq-answer-${idx}`}
                        role="region"
                        aria-labelledby={`faq-question-${idx}`}
                        className={`grid transition-[grid-template-rows] duration-300 ${
                          isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
                        }`}
                      >
                        <div className="overflow-hidden">
                          <p className="pt-3 pb-5 px-5 text-muted text-[14px] leading-relaxed">
                            {item.answer}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
          return rendered;
        })}
      </div>
    </section>
  );
}
