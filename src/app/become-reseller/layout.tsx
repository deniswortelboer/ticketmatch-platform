import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Become a Reseller — TicketMatch.ai",
  description: "Join the TicketMatch.ai Reseller Program. Earn commission on every booking. Get your own dashboard, referral link and real-time insights into your earnings.",
  alternates: { canonical: "/become-reseller" },
  openGraph: {
    title: "🤝 Become a Reseller — TicketMatch.ai",
    description: "Earn commission on every booking. Get your own dashboard, referral link and real-time insights. No costs, no risk.",
    url: "https://ticketmatch.ai/become-reseller",
    siteName: "TicketMatch.ai",
    images: [{ url: "https://ticketmatch.ai/api/og?type=reseller", width: 1200, height: 630, alt: "TicketMatch.ai Reseller Program" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "🤝 Become a Reseller — TicketMatch.ai",
    description: "Earn commission on every booking. No costs, no risk.",
    images: ["https://ticketmatch.ai/api/og?type=reseller"],
  },
};

export default function BecomeResellerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
