import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";
import { notFound } from "next/navigation";

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

async function getReseller(slug: string) {
  const supabaseAdmin = getSupabaseAdmin();
  const { data: companies } = await supabaseAdmin
    .from("companies")
    .select("id, name, message, primary_color, logo_url, branding_mode, support_email, support_phone")
    .order("created_at", { ascending: false });

  const reseller = companies?.find((c) => {
    try {
      const msg = c.message ? JSON.parse(c.message) : {};
      return msg.role === "reseller" && msg.reseller_slug === slug.toLowerCase();
    } catch {
      return false;
    }
  });

  return reseller || null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const reseller = await getReseller(slug);

  if (!reseller) {
    return { title: "Not Found — TicketMatch.ai" };
  }

  const title = `${reseller.name} — Book Experiences & Tours`;
  const description = `Discover and book the best tours, museums, cruises and city experiences worldwide. Powered by ${reseller.name}.`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `https://ticketmatch.ai/r/${slug}`,
      siteName: reseller.name,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

export default async function ResellerLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const reseller = await getReseller(slug);

  if (!reseller) notFound();

  const primaryColor = reseller.primary_color || "#FF6B35";
  const brandingMode = reseller.branding_mode || "co_branded";

  return (
    <div
      style={{
        // @ts-expect-error CSS custom properties
        "--reseller-accent": primaryColor,
        "--reseller-accent-light": `${primaryColor}15`,
        "--reseller-accent-medium": `${primaryColor}30`,
      }}
    >
      {/* Reseller context passed via data attributes for client components */}
      <div
        data-reseller-id={reseller.id}
        data-reseller-name={reseller.name}
        data-reseller-slug={slug}
        data-reseller-color={primaryColor}
        data-reseller-logo={reseller.logo_url || ""}
        data-reseller-branding={brandingMode}
        data-reseller-email={reseller.support_email || ""}
        data-reseller-phone={reseller.support_phone || ""}
      >
        {children}
      </div>
    </div>
  );
}
