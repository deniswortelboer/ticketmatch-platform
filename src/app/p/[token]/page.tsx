import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createServerClient } from "@supabase/ssr";
import QRCode from "qrcode";
import { verifyPassengerToken, parsePassengersFromNotes } from "@/lib/passengers";
import PrintButton from "../../t/[token]/PrintButton";

// ═══════════════════════════════════════════════════════════════
// Per-passenger ticket page — /p/[token]
// Token encodes { groupId, passengerIndex }.
// Shows ALL bookings in the group but ONLY the passenger's ticket
// (ticket at index `passengerIndex`) for each booking.
// ═══════════════════════════════════════════════════════════════

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Je persoonlijke tickets — TicketMatch.ai",
  description: "Jouw tickets voor je trip, op één plek.",
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

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
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

export default async function PassengerTicketPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const decoded = verifyPassengerToken(token);
  if (!decoded) notFound();

  const { groupId, passengerIndex } = decoded;
  const admin = getAdminClient();

  // Fetch group + bookings + company branding
  const { data: groupRaw } = await admin
    .from("groups")
    .select(
      `id, name, notes, contact_person,
       company_id,
       companies(name, branding_mode, logo_url, primary_color, support_email, support_phone)`
    )
    .eq("id", groupId)
    .maybeSingle();

  if (!groupRaw) notFound();

  type GroupRow = {
    id: string;
    name: string | null;
    notes: string | null;
    contact_person: string | null;
    companies?: {
      name?: string | null;
      branding_mode?: string | null;
      logo_url?: string | null;
      primary_color?: string | null;
      support_email?: string | null;
      support_phone?: string | null;
    } | null;
  };
  const group = groupRaw as unknown as GroupRow;

  const passengers = parsePassengersFromNotes(group.notes);
  const me = passengers.find((p) => p.index === passengerIndex) ?? null;

  // Fetch all bookings in the group (with tickets)
  const { data: bookings } = await admin
    .from("bookings")
    .select("id, venue_name, venue_city, scheduled_date, tickets, status")
    .eq("group_id", groupId)
    .order("scheduled_date", { ascending: true, nullsFirst: false });

  const bookingsList = (bookings || []) as Array<{
    id: string;
    venue_name: string;
    venue_city: string | null;
    scheduled_date: string | null;
    tickets: Ticket[] | null;
    status: string;
  }>;

  // For each booking, pick the ticket at passengerIndex (or null if not yet issued)
  const myTickets = bookingsList
    .map((b) => {
      const arr: Ticket[] = Array.isArray(b.tickets) ? b.tickets : [];
      const t = arr[passengerIndex];
      return t ? { booking: b, ticket: t } : null;
    })
    .filter((x): x is { booking: (typeof bookingsList)[number]; ticket: Ticket } => !!x);

  const brandingMode = group.companies?.branding_mode || "co_branded";
  const primaryColor = group.companies?.primary_color || "#0369a1";
  const companyName = group.companies?.name || "TicketMatch";
  const companyLogo = group.companies?.logo_url || null;
  const supportEmail = group.companies?.support_email || null;
  const supportPhone = group.companies?.support_phone || null;
  const headerTitle =
    brandingMode === "full_managed" ? "TicketMatch.ai" : companyName;

  const qrCodes: string[] = await Promise.all(
    myTickets.map(async ({ ticket }) => {
      try {
        return await QRCode.toDataURL(ticket.qr_data, {
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

  const passengerName = me?.name || `Guest #${passengerIndex + 1}`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
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
            <p className="text-sm opacity-90">Je persoonlijke tickets</p>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        {/* ═══ Welcome card ═══ */}
        <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 mb-2">
            Hi {passengerName.split(" ")[0]}! 👋
          </h2>
          <p className="text-slate-600">
            Hieronder vind je {myTickets.length} ticket{myTickets.length !== 1 ? "s" : ""}{" "}
            voor je trip{group.name ? `: ${group.name}` : ""}.
          </p>
          {me?.notes && (
            <p className="mt-3 text-sm italic text-slate-500">📝 {me.notes}</p>
          )}
        </section>

        {/* ═══ Delivery options ═══ */}
        {myTickets.length > 0 && (
          <section className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-8">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Opslaan op je telefoon of printen
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={`/p/${token}/apple.pkpass`}
                className="flex items-center justify-center gap-2 rounded-xl bg-black hover:bg-slate-900 text-white px-5 py-3 text-sm font-semibold transition"
              >
                🍎 Voeg toe aan Apple Wallet
              </a>
              <a
                href={`/p/${token}/google`}
                className="flex items-center justify-center gap-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 px-5 py-3 text-sm font-semibold transition"
              >
                <span className="text-lg">🅖</span> Voeg toe aan Google Wallet
              </a>
              <a
                href={`/p/${token}/pdf`}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 px-5 py-3 text-sm font-semibold text-slate-900 transition"
              >
                📄 Download al mijn tickets (PDF)
              </a>
              <PrintButton />
            </div>
            <p className="mt-3 text-xs text-slate-500">
              💡 Tip: scan de QR-code direct van je scherm bij de ingang.
            </p>
          </section>
        )}

        {/* ═══ Tickets list ═══ */}
        {myTickets.length === 0 ? (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
            <p className="text-amber-900 font-semibold">
              Je tickets worden momenteel voorbereid.
            </p>
            <p className="text-amber-800 text-sm mt-2">
              Je ontvangt bericht zodra ze klaar zijn. Bookmark deze pagina.
            </p>
          </div>
        ) : (
          <section className="space-y-6">
            {myTickets.map(({ booking, ticket }, i) => (
              <article
                key={booking.id}
                className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 print:break-inside-avoid"
              >
                <div className="mb-4">
                  <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Activiteit {i + 1} van {myTickets.length}
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">
                    🎟️ {booking.venue_name}
                  </h3>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm text-slate-600">
                    {formatDate(booking.scheduled_date) && (
                      <span>📅 {formatDate(booking.scheduled_date)}</span>
                    )}
                    {booking.venue_city && <span>📍 {booking.venue_city}</span>}
                    {ticket.seat && <span>🎫 Zitplaats: {ticket.seat}</span>}
                  </div>
                </div>
                <div className="flex justify-center bg-slate-50 rounded-xl p-4">
                  {qrCodes[i] ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={qrCodes[i]}
                      alt={`Ticket QR ${booking.venue_name}`}
                      className="w-full max-w-[280px] h-auto"
                    />
                  ) : (
                    <div className="text-slate-500 py-16">QR niet beschikbaar</div>
                  )}
                </div>
                {ticket.notes && (
                  <p className="mt-3 text-sm text-slate-600 text-center italic">
                    {ticket.notes}
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
                Veel plezier op je trip!
                <br />
                <strong>TicketMatch Support</strong>
              </p>
              {supportEmail && (
                <p className="mt-2">
                  📧 <a href={`mailto:${supportEmail}`}>{supportEmail}</a>
                </p>
              )}
              {supportPhone && <p className="mt-1">📞 {supportPhone}</p>}
            </>
          ) : (
            <>
              <p>
                Veel plezier op je trip!
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
