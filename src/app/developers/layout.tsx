import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Developer Program — TicketMatch.ai",
  description: "Join the TicketMatch.ai Developer Program. Full API access, sandbox environment, Developer AI Agent. Build on top of our B2B ecosystem.",
  alternates: { canonical: "/developers" },
  openGraph: {
    title: "💻 Developer Program — TicketMatch.ai",
    description: "Full API access, sandbox environment, Developer AI Agent. Build on top of our B2B ecosystem for group tickets.",
    url: "https://ticketmatch.ai/developers",
    siteName: "TicketMatch.ai",
    images: [{ url: "https://ticketmatch.ai/api/og?type=developer", width: 1200, height: 630, alt: "TicketMatch.ai Developer Program" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "💻 Developer Program — TicketMatch.ai",
    description: "Full API access, sandbox environment, Developer AI Agent.",
    images: ["https://ticketmatch.ai/api/og?type=developer"],
  },
};

export default function DevelopersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
