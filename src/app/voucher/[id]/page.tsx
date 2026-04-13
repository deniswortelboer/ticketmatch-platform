import { createServerClient } from "@supabase/ssr";
import crypto from "crypto";

// ════════════════════════════════════════════════════════════
// SECURITY: Voucher page requires a valid HMAC token
// - /voucher/[id]?token=XXXX  (from QR code or shared link)
// - Without valid token → "Voucher not found"
// - Prevents booking ID enumeration attacks
// ════════════════════════════════════════════════════════════

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function generateVoucherToken(bookingId: string): string {
  const secret = process.env.SHARE_SECRET || "tm-share-default-key-2024";
  return crypto.createHmac("sha256", secret).update(`voucher:${bookingId}`).digest("hex").slice(0, 24);
}

async function getVoucherData(bookingId: string) {
  try {
    const admin = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      { cookies: { getAll: () => [], setAll: () => {} } }
    );

    const { data: booking } = await admin
      .from("bookings")
      .select("*, groups(name, travel_date, contact_person), companies(name)")
      .eq("id", bookingId)
      .single();

    if (!booking) return null;

    const group = Array.isArray(booking.groups) ? booking.groups[0] : booking.groups;
    const company = Array.isArray(booking.companies) ? booking.companies[0] : booking.companies;
    const voucherCode = `TM-${bookingId.slice(0, 8).toUpperCase()}`;

    // QR code URL includes the signed token
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://ticketmatch.ai";
    const token = generateVoucherToken(bookingId);
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${siteUrl}/voucher/${bookingId}?token=${token}`)}`;

    return { booking, group, company, voucherCode, qrUrl };
  } catch {
    return null;
  }
}

export default async function VoucherPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { id } = await params;
  const { token } = await searchParams;

  // ── SECURITY: Validate booking ID format ──
  if (!UUID_REGEX.test(id)) {
    return renderNotFound();
  }

  // ── SECURITY: Validate HMAC token ──
  const expectedToken = generateVoucherToken(id);
  if (!token || token !== expectedToken) {
    return renderNotFound();
  }

  const data = await getVoucherData(id);

  if (!data) {
    return renderNotFound();
  }

  const { booking, group, company, voucherCode, qrUrl } = data;
  const isConfirmed = booking.status === "confirmed";
  const formatDate = (d: string | null) => d ? new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : "—";

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Voucher {voucherCode} — TicketMatch</title>
        <meta name="robots" content="noindex, nofollow" />
        <style dangerouslySetInnerHTML={{ __html: `
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: linear-gradient(135deg, #eff6ff, #eef2ff); min-height: 100vh; padding: 32px 16px; }
          .card { max-width: 420px; margin: 0 auto; background: white; border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #0f1729, #1a2744); padding: 20px; text-align: center; color: white; }
          .logo { display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 4px; }
          .logo-box { width: 28px; height: 28px; border-radius: 8px; background: linear-gradient(135deg, #60a5fa, #2563eb); display: flex; align-items: center; justify-content: center; font-size: 11px; font-weight: 800; color: white; }
          .logo-text { font-size: 16px; font-weight: 600; }
          .logo-text span { color: #60a5fa; }
          .subtitle { color: #93c5fd; font-size: 12px; }
          .status { padding: 10px 24px; text-align: center; font-size: 13px; font-weight: 600; }
          .status-ok { background: #f0fdf4; color: #15803d; }
          .status-pending { background: #fffbeb; color: #b45309; }
          .status-cancel { background: #fef2f2; color: #dc2626; }
          .venue { padding: 20px 24px 16px; text-align: center; }
          .venue h1 { font-size: 20px; font-weight: 700; }
          .venue-meta { display: flex; align-items: center; justify-content: center; gap: 12px; margin-top: 8px; font-size: 13px; color: #6b7280; }
          .sep { position: relative; padding: 0 24px; }
          .sep-line { border-top: 2px dashed #e5e7eb; }
          .sep-dot { position: absolute; top: 50%; transform: translateY(-50%); width: 24px; height: 24px; border-radius: 50%; background: linear-gradient(135deg, #eff6ff, #eef2ff); }
          .sep-dot-l { left: -12px; }
          .sep-dot-r { right: -12px; }
          .details { padding: 16px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
          .detail-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #9ca3af; }
          .detail-value { font-size: 13px; font-weight: 600; margin-top: 2px; }
          .detail-value.green { color: #16a34a; font-weight: 700; }
          .notes { padding: 0 24px 12px; }
          .notes-label { font-size: 9px; font-weight: 600; text-transform: uppercase; letter-spacing: 1.2px; color: #9ca3af; }
          .notes-text { font-size: 12px; color: #4b5563; margin-top: 2px; }
          .qr { padding: 20px 24px; text-align: center; }
          .qr img { margin: 0 auto 12px; border-radius: 8px; }
          .qr-code { font-size: 18px; font-family: monospace; font-weight: 700; letter-spacing: 3px; color: #1a2744; }
          .qr-hint { font-size: 10px; color: #9ca3af; margin-top: 4px; }
          .footer { background: #f9fafb; padding: 12px 24px; text-align: center; font-size: 10px; color: #9ca3af; }
          .print-btn { display: block; margin: 16px auto 0; background: none; border: none; color: #2563eb; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; }
          .print-btn:hover { color: #1d4ed8; }
          @media print { body { background: white; padding: 0; } .print-btn { display: none; } .card { box-shadow: none; } }
        `}} />
      </head>
      <body>
        <div className="card">
          <div className="header">
            <div className="logo">
              <div className="logo-box">TM</div>
              <div className="logo-text">Ticket<span>Match</span></div>
            </div>
            <p className="subtitle">Digital Voucher</p>
          </div>

          <div className={`status ${isConfirmed ? "status-ok" : booking.status === "cancelled" ? "status-cancel" : "status-pending"}`}>
            {isConfirmed ? "✓ Confirmed — Present this voucher at the venue" : booking.status === "cancelled" ? "✗ This voucher has been cancelled" : "⏳ Pending confirmation"}
          </div>

          <div className="venue">
            <h1>{booking.venue_name}</h1>
            <div className="venue-meta">
              {booking.venue_city && <span>📍 {booking.venue_city}</span>}
              {booking.venue_category && <span style={{ textTransform: "capitalize" }}>• {booking.venue_category}</span>}
            </div>
          </div>

          <div className="sep">
            <div className="sep-line" />
            <div className="sep-dot sep-dot-l" />
            <div className="sep-dot sep-dot-r" />
          </div>

          <div className="details">
            <div>
              <p className="detail-label">Date</p>
              <p className="detail-value">{formatDate(booking.scheduled_date || group?.travel_date)}</p>
            </div>
            <div>
              <p className="detail-label">Guests</p>
              <p className="detail-value">{booking.number_of_guests} persons</p>
            </div>
            <div>
              <p className="detail-label">Group</p>
              <p className="detail-value">{group?.name || "—"}</p>
            </div>
            <div>
              <p className="detail-label">Contact</p>
              <p className="detail-value">{group?.contact_person || "—"}</p>
            </div>
            <div>
              <p className="detail-label">Company</p>
              <p className="detail-value">{company?.name || "—"}</p>
            </div>
            <div>
              <p className="detail-label">Total</p>
              <p className="detail-value green">€{Number(booking.total_price).toFixed(2)}</p>
            </div>
          </div>

          {booking.notes && (
            <div className="notes">
              <p className="notes-label">Notes</p>
              <p className="notes-text">{booking.notes}</p>
            </div>
          )}

          <div className="sep">
            <div className="sep-line" />
            <div className="sep-dot sep-dot-l" />
            <div className="sep-dot sep-dot-r" />
          </div>

          <div className="qr">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt="QR Code" width={160} height={160} />
            <p className="qr-code">{voucherCode}</p>
            <p className="qr-hint">Scan QR code or present voucher code at venue</p>
          </div>

          <div className="footer">
            Powered by TicketMatch.ai — B2B City Access Platform
          </div>
        </div>

        <button className="print-btn" onClick={() => window.print()}>🖨️ Print voucher</button>
      </body>
    </html>
  );
}

function renderNotFound() {
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#f3f4f6", fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontSize: 48, marginBottom: 12 }}>🎫</p>
        <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Voucher not found</h1>
        <p style={{ fontSize: 14, color: "#6b7280" }}>This voucher code is invalid or has expired.</p>
      </div>
    </div>
  );
}
