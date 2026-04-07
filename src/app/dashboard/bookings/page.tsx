"use client";

import { useEffect, useState } from "react";

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
  groups: { name: string } | null;
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        setBookings(d.bookings || []);
        setLoading(false);
      });
  }, []);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Bookings</h1>
        <p className="mt-1 text-sm text-muted">Track all your venue bookings and vouchers.</p>
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
          <p className="mt-1 text-2xl font-bold text-accent">&euro; {totalValue.toFixed(2)}</p>
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
                    <p className="text-lg font-bold text-accent">&euro; {Number(booking.total_price).toFixed(2)}</p>
                    <p className="text-xs text-muted">&euro; {Number(booking.unit_price).toFixed(2)} p.p.</p>
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
    </>
  );
}
