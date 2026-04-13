import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advertise on TicketMatch.ai — Partner Program",
  description: "Get your venue in front of hundreds of tour operators. AI-powered recommendations, catalog listings, and curated packages. Bronze, Silver, Gold & Platinum tiers.",
  alternates: { canonical: "/partners/advertise" },
  openGraph: {
    title: "Advertise on TicketMatch.ai — Partner Program",
    description: "Get your venue in front of hundreds of tour operators through AI-powered recommendations.",
    url: "https://ticketmatch.ai/partners/advertise",
    siteName: "TicketMatch.ai",
    images: [{ url: "https://ticketmatch.ai/api/og?type=default", width: 1200, height: 630 }],
  },
};

export default function AdvertiseLayout({ children }: { children: React.ReactNode }) {
  return children;
}
