"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

interface Group {
  id: string;
  name: string;
  travel_date: string | null;
  number_of_guests: number;
}

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
  group_id: string;
}

export default function ItineraryPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [selectedGroup, setSelectedGroup] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]).then(([g, b]) => {
      setGroups(g.groups || []);
      setBookings(b.bookings || []);
      if (g.groups?.length > 0) {
        setSelectedGroup(g.groups[0].id);
      }
      setLoading(false);
    });
  }, []);

  const group = groups.find((g) => g.id === selectedGroup);
  const groupBookings = bookings.filter((b) => b.group_id === selectedGroup);

  // Organize bookings by date
  const bookingsByDate: Record<string, Booking[]> = {};
  const unscheduled: Booking[] = [];

  groupBookings.forEach((b) => {
    if (b.scheduled_date) {
      if (!bookingsByDate[b.scheduled_date]) bookingsByDate[b.scheduled_date] = [];
      bookingsByDate[b.scheduled_date].push(b);
    } else {
      unscheduled.push(b);
    }
  });

  const sortedDates = Object.keys(bookingsByDate).sort();

  const totalPerPerson = groupBookings.reduce((sum, b) => sum + Number(b.unit_price), 0);
  const totalAll = groupBookings.reduce((sum, b) => sum + Number(b.total_price), 0);

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00");
    return d.toLocaleDateString("en-GB", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const categoryIcon = (cat: string | null) => {
    switch (cat) {
      case "Museum":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" />
          </svg>
        );
      case "Restaurant":
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
          </svg>
        );
      default:
        return (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10" /><polygon points="10 8 16 12 10 16 10 8" />
          </svg>
        );
    }
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
          <h1 className="text-2xl font-bold tracking-tight">Itinerary Builder</h1>
          <p className="mt-1 text-sm text-muted">
            Day-by-day plans for your group trips.
          </p>
        </div>
        <div className="flex gap-2">
          {group && groupBookings.length > 0 && (
            <button
              onClick={() => window.print()}
              className="rounded-xl border border-border bg-white px-5 py-2.5 text-sm font-medium transition-all hover:bg-gray-50 print:hidden"
            >
              Export PDF
            </button>
          )}
          <Link
            href="/dashboard/catalog"
            className="rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-gray-800 print:hidden"
          >
            + Add from Catalog
          </Link>
        </div>
      </div>

      {/* Group selector */}
      {groups.length > 0 ? (
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium">Select group</label>
          <select
            value={selectedGroup}
            onChange={(e) => setSelectedGroup(e.target.value)}
            className="h-12 w-full max-w-md rounded-xl border border-border bg-white px-4 text-sm outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/10"
          >
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name} ({g.number_of_guests} guests)
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="mb-6 rounded-2xl border border-dashed border-border/60 bg-white p-8 text-center">
          <p className="text-sm text-muted">No groups yet.</p>
          <Link href="/dashboard/groups" className="mt-2 inline-block text-sm font-medium text-accent hover:underline">
            Create a group first
          </Link>
        </div>
      )}

      {/* Itinerary days */}
      {group && groupBookings.length > 0 ? (
        <div className="space-y-4">
          {sortedDates.map((date, index) => (
            <div key={date} className="rounded-2xl border border-border/60 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-sm font-bold text-accent">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-semibold">Day {index + 1}</h3>
                  <p className="text-xs text-muted">{formatDate(date)}</p>
                </div>
              </div>

              <div className="space-y-3">
                {bookingsByDate[date].map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl border border-border/40 bg-gray-50/50 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10 text-accent">
                        {categoryIcon(booking.venue_category)}
                      </div>
                      <div>
                        <p className="font-medium">{booking.venue_name}</p>
                        <p className="text-xs text-muted">
                          {booking.venue_category} &middot; {booking.venue_city} &middot; {booking.number_of_guests} guests
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">
                        &euro; {Number(booking.total_price).toFixed(2)}
                      </p>
                      <p className="text-xs text-muted">
                        &euro; {Number(booking.unit_price).toFixed(2)} p.p.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Unscheduled bookings */}
          {unscheduled.length > 0 && (
            <div className="rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 p-6">
              <h3 className="mb-4 font-semibold text-amber-700">Unscheduled Activities</h3>
              <div className="space-y-3">
                {unscheduled.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between rounded-xl border border-amber-200 bg-white p-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                        {categoryIcon(booking.venue_category)}
                      </div>
                      <div>
                        <p className="font-medium">{booking.venue_name}</p>
                        <p className="text-xs text-muted">{booking.venue_category} &middot; {booking.venue_city}</p>
                      </div>
                    </div>
                    <p className="font-semibold text-accent">&euro; {Number(booking.total_price).toFixed(2)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : group ? (
        <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <p className="text-sm text-muted">No activities booked for this group yet.</p>
          <Link href="/dashboard/catalog" className="mt-2 inline-block text-sm font-medium text-accent hover:underline">
            Browse the catalog to add activities
          </Link>
        </div>
      ) : null}

      {/* Summary */}
      {group && groupBookings.length > 0 && (
        <div className="mt-8 rounded-2xl border border-border/60 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold">Itinerary Summary</h2>
          <div className="grid gap-4 sm:grid-cols-4">
            <div>
              <p className="text-sm text-muted">Group</p>
              <p className="mt-1 text-base font-bold">{group.name}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Activities</p>
              <p className="mt-1 text-2xl font-bold">{groupBookings.length}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Per person</p>
              <p className="mt-1 text-2xl font-bold">&euro; {totalPerPerson.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-sm text-muted">Total ({group.number_of_guests} guests)</p>
              <p className="mt-1 text-2xl font-bold text-accent">&euro; {totalAll.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
