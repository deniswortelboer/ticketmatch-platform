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
  groups: { name: string } | null;
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
    </>
  );
}
