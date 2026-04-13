import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Join TicketMatch.ai — the B2B ecosystem for city experiences. Create your free account and start booking group tickets across Europe.",
  alternates: { canonical: "/auth/register" },
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
