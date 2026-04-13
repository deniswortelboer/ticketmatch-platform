import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Join TicketMatch.ai — You've been referred!",
  description: "Join TicketMatch.ai and book group tickets for 300+ museums, attractions and city experiences across Europe at exclusive B2B rates.",
  openGraph: {
    title: "🎫 Join TicketMatch.ai — You've been referred!",
    description: "Book group tickets for 300+ museums, attractions and city experiences across Europe at exclusive B2B rates.",
    url: "https://ticketmatch.ai",
    siteName: "TicketMatch.ai",
    type: "website",
    images: [
      {
        url: "https://ticketmatch.ai/api/og?type=agency",
        width: 1200,
        height: 630,
        alt: "TicketMatch.ai — Group Booking Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎫 Join TicketMatch.ai — You've been referred!",
    description: "Book group tickets for 300+ venues at exclusive B2B rates.",
    images: ["https://ticketmatch.ai/api/og?type=agency"],
  },
};

export default function RefLayout({ children }: { children: React.ReactNode }) {
  return children;
}
