import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

// Lazy-init: Vercel's page-data collection evaluates this module before env
// vars are reliably populated.
function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  // Look up reseller name
  let resellerName = "";
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const { data: companies } = await supabaseAdmin
      .from("companies")
      .select("name, message")
      .order("created_at", { ascending: false });

    const reseller = companies?.find((c) => {
      try {
        const msg = c.message ? JSON.parse(c.message) : {};
        return msg.role === "reseller" && msg.reseller_slug === slug.toLowerCase();
      } catch {
        return false;
      }
    });
    if (reseller) resellerName = reseller.name;
  } catch {}

  const title = resellerName
    ? `🎫 Join TicketMatch.ai — Invited by ${resellerName}`
    : "🎫 Join TicketMatch.ai — B2B Group Booking Platform";

  const description = resellerName
    ? `${resellerName} invites you to join TicketMatch.ai. Book group tickets for 300+ museums, attractions and city experiences across Europe at exclusive B2B rates.`
    : "Join TicketMatch.ai and book group tickets for 300+ museums, attractions and city experiences across Europe at exclusive B2B rates.";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://ticketmatch.ai/join/${slug}`,
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
      title,
      description,
      images: ["https://ticketmatch.ai/api/og?type=agency"],
    },
  };
}

export default function JoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
