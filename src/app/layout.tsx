import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "TicketMatch AI",
  },
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
      <head>
        <meta name="theme-color" content="#2563eb" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
