import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In",
  description:
    "Sign in to your TicketMatch.ai account to manage bookings, access the dashboard, and connect with venues across Europe.",
  alternates: { canonical: "/auth/login" },
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
