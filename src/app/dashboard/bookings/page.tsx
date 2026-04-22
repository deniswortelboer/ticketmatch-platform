"use client";

import { useEffect, useState } from "react";
import { useCurrency } from "@/components/CurrencySelector";

interface Booking {
  id: string;
  venue_name: string;
  venue_category: string | null;
  venue_city: string | null;
  scheduled_date: string | null;
  number_of_guests: number;
  unit_price: number;
  total_price: number;
  status: string;
  notes: string | null;
  created_at: string;
  group_id: string;
  groups: { name: string; contact_person?: string | null } | null;
  access_token?: string | null;
  delivered_at?: string | null;
  delivery_channels?: string[] | null;
  musement_status?: string | null;
  musement_order_id?: string | null;
}

interface Group {
  id: string;
  name: string;
  number_of_guests: number;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [invoiceLoading, setInvoiceLoading] = useState(false);
  const [invoiceError, setInvoiceError] = useState("");
  const { currency, format } = useCurrency();
  const isConverted = currency.code !== "EUR";

  // ── Send Tickets modal state ──
  const [sendBooking, setSendBooking] = useState<Booking | null>(null);
  const [sendEmail, setSendEmail] = useState("");
  const [sendPhone, setSendPhone] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendResult, setSendResult] = useState<{
    ticket_url: string;
    delivered_channels: string[];
    tickets_count: number;
  } | null>(null);

  const openSendModal = (b: Booking) => {
    setSendBooking(b);
    setSendEmail(b.groups?.contact_person || "");
    setSendPhone("");
    setSendError("");
    setSendResult(null);
  };

  const closeSendModal = () => {
    setSendBooking(null);
    setSendResult(null);
  };

  const handleSendTickets = async () => {
    if (!sendBooking) return;
    setSendLoading(true);
    setSendError("");
    try {
      const res = await fetch(`/api/bookings/${sendBooking.id}/send-tickets`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientEmail: sendEmail.trim() || undefined,
          recipientPhone: sendPhone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setSendError(data.error || "Failed to send tickets");
        return;
      }
      setSendResult({
        ticket_url: data.ticket_url,
        delivered_channels: data.delivered_channels || [],
        tickets_count: data.tickets_count || 0,
      });
      // Refresh bookings to show delivered_at
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((b) => setBookings(b.bookings || []));
    } catch {
      setSendError("Network error");
    } finally {
      setSendLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {}
  };

  // ── Confirm Order (Musement) ──
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const handleConfirmOrder = async (bookingId: string) => {
    setConfirmingId(bookingId);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/confirm-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(`Order failed: ${data.error || "unknown"}`);
        return;
      }
      // Refresh bookings
      fetch("/api/bookings")
        .then((r) => r.json())
        .then((b) => setBookings(b.bookings || []));
      alert(
        data.alreadyConfirmed
          ? "Order was already confirmed."
          : `✅ Order confirmed (${data.mode} mode) — ${data.tickets_count} tickets ready`
      );
    } catch {
      alert("Network error");
    } finally {
      setConfirmingId(null);
    }
  };

  useEffect(() => {
    Promise.all([
      fetch("/api/bookings").then((r) => r.json()),
      fetch("/api/groups").then((r) => r.json()),
    ]).then(([b, g]) => {
      setBookings(b.bookings || []);
      setGroups(g.groups || []);
      setLoading(false);
    });
  }, []);

  const handleGenerateInvoice = async (groupId: string) => {
    setInvoiceLoading(true);
    setInvoiceError("");
    try {
      const res = await fetch("/api/invoices/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ groupId }),
      });
      if (!res.ok) {
        const err = await res.json();
        setInvoiceError(err.error || "Failed to generate invoice");
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const disposition = res.headers.get("Content-Disposition");
      const match = disposition?.match(/filename="(.+)"/);
      a.download = match?.[1] || "invoice.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setShowInvoiceModal(false);
    } catch {
      setInvoiceError("Something went wrong. Please try again.");
    } finally {
      setInvoiceLoading(false);
    }
  };

  // Groups that have at least one booking
  const groupsWithBookings = groups.filter((g) =>
    bookings.some((b) => b.group_id === g.id)
  );

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
    if (res.ok) {
      setBookings((prev) => prev.filter((b) => b.id !== id));
    }
  };

  const filtered = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);
  const totalValue = bookings.reduce((sum, b) => sum + Number(b.total_price), 0);

  const formatDate = (date: string | null) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
          <p className="mt-1 text-sm text-muted">Track all your venue bookings and vouchers.</p>
        </div>
        {groupsWithBookings.length > 0 && (
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 flex items-center gap-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            Generate Invoice
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border/60 bg-white p-5">
          <p className="text-sm text-muted">Total Bookings</p>
          <p className="mt-1 text-2xl font-bold">{bookings.length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5">
          <p className="text-sm text-muted">Pending</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{bookings.filter((b) => b.status === "pending").length}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-white p-5">
          <p className="text-sm text-muted">Total Value</p>
          <p className="mt-1 text-2xl font-bold text-accent">{format(totalValue)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-6 flex gap-2">
        {["all", "pending", "confirmed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-2 text-xs font-medium capitalize transition-colors ${
              filter === f ? "bg-foreground text-white" : "bg-white border border-border text-muted hover:text-foreground"
            }`}
          >
            {f === "all" ? `All (${bookings.length})` : `${f} (${bookings.filter((b) => b.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {filtered.length > 0 ? (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <div key={booking.id} className="rounded-2xl border border-border/60 bg-white p-5 transition-all hover:shadow-lg hover:shadow-black/[0.03]">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{booking.venue_name}</h3>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[booking.status] || statusColors.pending}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-muted">
                    {booking.groups && (
                      <span className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /></svg>
                        {booking.groups.name}
                      </span>
                    )}
                    <span>{formatDate(booking.scheduled_date)}</span>
                    {booking.venue_city && <span>{booking.venue_city}</span>}
                    <span>{booking.number_of_guests} guests</span>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-lg font-bold text-accent">{format(Number(booking.total_price))}</p>
                    <p className="text-xs text-muted">{format(Number(booking.unit_price))} p.p.</p>
                    {isConverted && (
                      <p className="text-[10px] text-muted/60 mt-0.5">&euro; {Number(booking.total_price).toFixed(2)} EUR</p>
                    )}
                  </div>
                  <a
                    href={`/voucher/${booking.id}`}
                    target="_blank"
                    className="rounded-lg p-2 text-muted hover:bg-blue-50 hover:text-blue-600 transition-colors"
                    title="View voucher"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
                    </svg>
                  </a>
                  {booking.access_token && (
                    <a
                      href={`/t/${booking.access_token}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg p-2 text-muted hover:bg-emerald-50 hover:text-emerald-600 transition-colors"
                      title="Preview customer ticket page"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </a>
                  )}
                  <button
                    onClick={() => handleConfirmOrder(booking.id)}
                    disabled={confirmingId === booking.id || booking.musement_status === "confirmed"}
                    className={`rounded-lg p-2 transition-colors disabled:opacity-50 ${
                      booking.musement_status === "confirmed"
                        ? "text-emerald-600 hover:bg-emerald-50"
                        : "text-muted hover:bg-purple-50 hover:text-purple-600"
                    }`}
                    title={
                      booking.musement_status === "confirmed"
                        ? `Order confirmed (${booking.musement_order_id?.slice(0, 12) || "ok"})`
                        : "Place Musement order (generates QR codes)"
                    }
                  >
                    {confirmingId === booking.id ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 11l3 3L22 4" />
                        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                      </svg>
                    )}
                  </button>
                  <button
                    onClick={() => booking.status !== "pending" && openSendModal(booking)}
                    disabled={booking.status === "pending"}
                    className={`rounded-lg p-2 transition-colors ${
                      booking.status === "pending"
                        ? "cursor-not-allowed text-muted/40"
                        : booking.delivered_at
                          ? "text-emerald-600 hover:bg-emerald-50"
                          : "text-muted hover:bg-accent/10 hover:text-accent"
                    }`}
                    title={
                      booking.status === "pending"
                        ? "Generate & pay invoice first to unlock ticket delivery"
                        : booking.delivered_at
                          ? `Tickets verzonden ${new Date(booking.delivered_at).toLocaleDateString("nl-NL")}`
                          : "Send tickets to customer"
                    }
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(booking.id)}
                    className="rounded-lg p-2 text-muted hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Cancel booking"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <p className="text-sm text-muted">No bookings yet.</p>
          <p className="mt-1 text-xs text-muted/60">Go to the Catalog to add venues to your booking.</p>
        </div>
      )}

      {/* Invoice Generation Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setShowInvoiceModal(false)}>
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Generate Invoice</h3>
              <button
                onClick={() => setShowInvoiceModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="mb-4 text-sm text-muted">
              Select a group to generate a professional PDF invoice with all its bookings, VAT calculation, and payment details.
            </p>
            {invoiceError && (
              <div className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{invoiceError}</div>
            )}
            <div className="space-y-2">
              {groupsWithBookings.map((g) => {
                const groupBookingCount = bookings.filter((b) => b.group_id === g.id).length;
                const groupTotal = bookings
                  .filter((b) => b.group_id === g.id)
                  .reduce((sum, b) => sum + Number(b.total_price), 0);
                return (
                  <button
                    key={g.id}
                    onClick={() => handleGenerateInvoice(g.id)}
                    disabled={invoiceLoading}
                    className="flex w-full items-center justify-between rounded-xl border border-border p-4 text-left transition-all hover:border-accent hover:bg-accent/5 disabled:opacity-50"
                  >
                    <div>
                      <p className="font-semibold">{g.name}</p>
                      <p className="text-xs text-muted">{groupBookingCount} booking{groupBookingCount !== 1 ? "s" : ""} &middot; {g.number_of_guests} guests</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-accent">{format(groupTotal)}</span>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-muted">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                    </div>
                  </button>
                );
              })}
            </div>
            {invoiceLoading && (
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-muted">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                Generating invoice...
              </div>
            )}
          </div>
        </div>
      )}

      {/* Send Tickets Modal */}
      {sendBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={closeSendModal}
        >
          <div
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">📤 Send Tickets</h3>
              <button
                onClick={closeSendModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-gray-100 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <p className="mb-5 text-sm text-muted">
              <strong>{sendBooking.venue_name}</strong>
              {sendBooking.scheduled_date &&
                ` — ${new Date(sendBooking.scheduled_date).toLocaleDateString("nl-NL")}`}
              {sendBooking.number_of_guests ? ` · ${sendBooking.number_of_guests} gasten` : ""}
            </p>

            {sendResult ? (
              /* ── SUCCESS STATE ── */
              <div className="space-y-4">
                <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4">
                  <p className="font-semibold text-emerald-900">
                    ✅ Tickets verzonden
                  </p>
                  <p className="mt-1 text-sm text-emerald-800">
                    {sendResult.tickets_count} ticket{sendResult.tickets_count !== 1 ? "s" : ""} gegenereerd. Kanalen:{" "}
                    {sendResult.delivered_channels.length
                      ? sendResult.delivered_channels.join(", ")
                      : "geen directe aflevering (admin notificatie verzonden)"}
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Ticket URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      readOnly
                      value={sendResult.ticket_url}
                      className="flex-1 rounded-lg border border-border bg-gray-50 px-3 py-2 text-sm font-mono"
                    />
                    <button
                      onClick={() => copyToClipboard(sendResult.ticket_url)}
                      className="rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                      title="Copy URL"
                    >
                      📋
                    </button>
                    <a
                      href={sendResult.ticket_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-lg border border-border bg-white px-3 py-2 text-sm hover:bg-gray-50"
                      title="Open in new tab"
                    >
                      ↗
                    </a>
                  </div>
                </div>
                <button
                  onClick={closeSendModal}
                  className="w-full rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 transition"
                >
                  Klaar
                </button>
              </div>
            ) : (
              /* ── INPUT STATE ── */
              <div className="space-y-4">
                {sendError && (
                  <div className="rounded-xl bg-red-50 p-3 text-sm text-red-700">
                    {sendError}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    Recipient email
                  </label>
                  <input
                    type="email"
                    value={sendEmail}
                    onChange={(e) => setSendEmail(e.target.value)}
                    placeholder="booker@example.com"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent outline-none"
                  />
                  <p className="mt-1 text-xs text-muted/70">
                    De boeker/groepsleider krijgt hier de ticket-link op.
                  </p>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-muted uppercase tracking-wider mb-1">
                    WhatsApp phone <span className="text-muted/70">(optioneel)</span>
                  </label>
                  <input
                    type="tel"
                    value={sendPhone}
                    onChange={(e) => setSendPhone(e.target.value)}
                    placeholder="31612345678"
                    className="w-full rounded-lg border border-border bg-white px-3 py-2 text-sm focus:border-accent outline-none"
                  />
                  <p className="mt-1 text-xs text-muted/70">
                    International format zonder + (bv. <code>31612345678</code>). Alleen
                    binnen 24u na klant-initiatief.
                  </p>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={closeSendModal}
                    className="flex-1 rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-semibold hover:bg-gray-50"
                  >
                    Annuleer
                  </button>
                  <button
                    onClick={handleSendTickets}
                    disabled={sendLoading}
                    className="flex-1 rounded-xl bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-accent/90 disabled:opacity-50 transition flex items-center justify-center gap-2"
                  >
                    {sendLoading && (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    )}
                    Verstuur tickets
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
