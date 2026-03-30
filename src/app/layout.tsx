import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketMatch.ai | B2B City Access Platform",
  description:
    "The smart procurement platform for tour operators, DMCs and group travel. Book museums, attractions, cruises and transport — all in one place.",
  keywords: [
    "B2B ticketing",
    "tour operator platform",
    "group bookings",
    "museum tickets",
    "city attractions",
    "DMC platform",
  ],
  openGraph: {
    title: "TicketMatch.ai | B2B City Access Platform",
    description:
      "The smart procurement platform for tour operators and group travel professionals.",
    url: "https://ticketmatch.ai",
    siteName: "TicketMatch.ai",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
