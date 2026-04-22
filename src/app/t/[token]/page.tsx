import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import QRCode from "qrcode";
import PrintButton from "./PrintButton";

// ═══════════════════════════════════════════════════════════════
// Public ticket viewing page — /t/[token]
// Served to end customers (booker or guests) without login.
// Access gated by opaque access_token only.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Je tickets — TicketMatch.ai",
  description: "Bekijk, download of print je tickets. Opslaan in Apple Wallet of Google Wallet.",
  robots: { index: false, follow: false },
  alternates: { canonical: undefined },
  openGraph: {
    title: "🎟️ Je tickets zijn klaar",
    description: "Bekijk, download of print je tickets. Opslaan in Apple Wallet of Google Wallet.",
    url: "https://ticketmatch.ai",
    siteName: "TicketMatch.ai",
    type: "website",
    images: [
      {
        url: "https://ticketmatch.ai/og-image.png",
        width: 1200,
        height: 630,
        alt: "TicketMatch.ai",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "🎟️ Je tickets zijn klaar",
    description: "Bekijk, download of print je tickets.",
    images: ["https://ticketmatch.ai/og-image.png"],
  },
};

type Ticket = {
  guest_name?: string | null;
  qr_data: string;
  seat?: string | null;
  notes?: string | null;
};

type Booking = {
  id: string;
  access_token: string;
  venue_name: string;
  venue_category: string | null;
  venue_city: string | null;
  scheduled_date: string | null;
  number_of_guests: number;
  tickets: Ticket[] | null;
  notes: string | null;
  status: string;
  delivered_at: string | null;
  groups: { name: string; contact_person: string | null } | null;
  companies: {
    name: string;
    branding_mode: string | null;
    logo_url: string | null;
    primary_color: string | null;
    support_email: string | null;
    support_phone: string | null;
  } | null;
};

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function fetchBookingByToken(token: string): Promise<Booking | null> {
  const admin = getAdminClient();
  const { data } = await admin
    .from("bookings")
    .select(
      `id, access_token, venue_name, venue_category, venue_city,
       scheduled_date, number_of_guests, tickets, notes, status, delivered_at,
       groups(name, contact_person),
       companies(name, branding_mode, logo_url, primary_color, support_email, support_phone)`
    )
    .eq("access_token", token)
    .maybeSingle();

  return data as unknown as Booking | null;
}

function formatDate(isoDate: string | null) {
  if (!isoDate) return null;
  const d = new Date(isoDate);
  return d.toLocaleDateString("nl-NL", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default async function TicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  if (!token || token.length < 16) notFound();

  const booking = await fetchBookingByToken(token);
  if (!booking) notFound();

  const tickets: Ticket[] = Array.isArray(booking.tickets) ? booking.tickets : [];
  const brandingMode = booking.companies?.branding_mode || "co_branded";
  const primaryColor = booking.companies?.primary_color || "#0369a1";
  const companyName = booking.companies?.name || "TicketMatch";
  const companyLogo = booking.companies?.logo_url;
  const supportEmail = booking.companies?.support_email;
  const supportPhone = booking.companies?.support_phone;

  const headerTitle =
    brandingMode === "full_managed" ? "TicketMatch.ai" : companyName;

  // Generate QR data URLs on the server for each ticket
  const qrCodes: string[] = await Promise.all(
    tickets.map(async (t) => {
      try {
        return await QRCode.toDataURL(t.qr_data, {
          errorCorrectionLevel: "H",
          margin: 2,
          width: 400,
          color: { dark: "#000000", light: "#ffffff" },
        });
      } catch {
        return "";
      }
    })
  );

  return (
    <div
      className="min-h-screen bg-gradient-to-b from-slate-50 to-white"
      style={{ "--brand": primaryColor } as React.CSSProperties}
    >
      {/* ═══ Header ═══ */}
      <header
        className="w-full py-6 px-6 text-white"
        style={{ background: primaryColor }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-4">
          {brandingMode !== "full_managed" && companyLogo && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={companyLogo}
              alt={companyName}
              className="h-10 w-auto rounded bg-white/10 p-1"
            />
          )}
          <div>
            <h1 className="text-xl font-bold tracking-tight">{headerTitle}</h1>
            <p className="text-sm opacity-90">Je tickets zijn klaar</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* ═══ Booking summary card ═══ */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">
            🎟️ {booking.venue_name}
          </h2>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            {formatDate(booking.scheduled_date) && (
              <div>
                <dt className="text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  Datum
                </dt>
                <dd className="text-slate-900 font-medium">
                  📅 {formatDate(booking.scheduled_date)}
                </dd>
              </div>
            )}
            {booking.venue_city && (
              <div>
                <dt className="text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  Locatie
                </dt>
                <dd className="text-slate-900 font-medium">📍 {booking.venue_city}</dd>
              </div>
            )}
            <div>
              <dt className="text-slate-500 uppercase tracking-wider text-xs font-semibold">
                Gasten
              </dt>
              <dd className="text-slate-900 font-medium">
                👥 {booking.number_of_guests}
              </dd>
            </div>
            {booking.groups?.name && (
              <div>
                <dt className="text-slate-500 uppercase tracking-wider text-xs font-semibold">
                  Groep
                </dt>
                <dd className="text-slate-900 font-medium">
                  {booking.groups.name}
                </dd>
              </div>
            )}
          </dl>
        </section>

        {/* ═══ Delivery options (once at top) ═══ */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
            Opslaan op je telefoon of printen
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={`/t/${booking.access_token}/pdf`}
              className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition"
            >
              📄 Download alle tickets (PDF)
            </a>
            <PrintButton />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            💡 Tip: scan de QR-code direct van je scherm bij de ingang.
          </p>
        </section>

        {/* ═══ Tickets ═══ */}
        {tickets.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-900 font-semibold">
              Je tickets worden momenteel voorbereid.
            </p>
            <p className="text-amber-800 text-sm mt-2">
              Je ontvangt bericht zodra ze klaar zijn. Je kunt deze pagina bookmarken.
            </p>
          </div>
        ) : (
          <section className="space-y-6">
            {tickets.map((t, i) => (
              <article
                key={i}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:break-inside-avoid"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Ticket {i + 1} van {tickets.length}
                    </div>
                    {t.guest_name && (
                      <div className="text-lg font-bold text-slate-900 mt-1">
                        👤 {t.guest_name}
                      </div>
                    )}
                    {t.seat && (
                      <div className="text-sm text-slate-600 mt-1">
                        Zitplaats: {t.seat}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex justify-center bg-slate-50 rounded-xl p-4">
                  {qrCodes[i] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrCodes[i]}
                      alt={`Ticket QR ${i + 1}`}
                      className="w-full max-w-[280px] h-auto"
                    />
                  ) : (
                    <div className="text-slate-500 py-16">QR niet beschikbaar</div>
                  )}
                </div>
                {t.notes && (
                  <p className="mt-3 text-sm text-slate-600 text-center italic">
                    {t.notes}
                  </p>
                )}
              </article>
            ))}
          </section>
        )}

        {/* ═══ Footer ═══ */}
        <footer className="mt-12 pt-8 border-t border-slate-200 text-center text-sm text-slate-600">
          {brandingMode === "full_managed" ? (
            <>
              <p>
                Met vriendelijke groet,
                <br />
                <strong>TicketMatch Support</strong>
              </p>
              {supportEmail && (
                <p className="mt-2">
                  📧 <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                </p>
              )}
              {supportPhone && (
                <p className="mt-1">📞 {supportPhone}</p>
              )}
            </>
          ) : (
            <>
              <p>
                Met vriendelijke groet,
                <br />
                <strong>{companyName}</strong>
              </p>
              <p className="mt-4 text-xs text-slate-400">
                Verzonden via{" "}
                <a
                  href="https://ticketmatch.ai"
                  className="font-semibold hover:underline"
                  style={{ color: primaryColor }}
                >
                  TicketMatch
                </a>
              </p>
            </>
          )}
        </footer>
      </main>
    </div>
  );
}
