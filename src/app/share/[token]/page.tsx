import { createServerClient } from "@supabase/ssr";
import { notFound } from "next/navigation";
import { validateShareToken } from "@/lib/share-token";
import type { Metadata } from "next";

interface Booking {
  id: string;
  venue_name: string;
  venue_category: string | null;
  venue_city: string | null;
  scheduled_date: string | null;
  number_of_guests: number;
  status: string;
}

interface Group {
  id: string;
  name: string;
  travel_date: string | null;
  number_of_guests: number;
  contact_person: string | null;
  status: string;
}

function getAdminClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

async function getItineraryData(token: string) {
  const groupId = validateShareToken(token);
  if (!groupId) return null;

  const admin = getAdminClient();

  const { data: group } = await admin
    .from("groups")
    .select("id, name, travel_date, number_of_guests, contact_person, status, company_id")
    .eq("id", groupId)
    .single();

  if (!group) return null;

  const { data: bookings } = await admin
    .from("bookings")
    .select("id, venue_name, venue_category, venue_city, scheduled_date, number_of_guests, status")
    .eq("group_id", groupId)
    .order("scheduled_date", { ascending: true });

  let companyName = null;
  if (group.company_id) {
    const { data: company } = await admin
      .from("companies")
      .select("name")
      .eq("id", group.company_id)
      .single();
    companyName = company?.name || null;
  }

  return { group: group as Group, bookings: (bookings || []) as Booking[], companyName };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const data = await getItineraryData(token);

  if (!data) {
    return { title: "Itinerary Not Found | TicketMatch" };
  }

  return {
    title: `${data.group.name} - Trip Itinerary | TicketMatch`,
    description: `View the travel itinerary for ${data.group.name}. ${data.bookings.length} activities planned.`,
  };
}

function formatDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatShortDate(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

function CategoryIcon({ category }: { category: string | null }) {
  const iconClass = "w-5 h-5";
  switch (category) {
    case "Museum":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" /><path d="M9 21v-6h6v6" />
        </svg>
      );
    case "Restaurant":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" /><line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
        </svg>
      );
    case "Transport":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 17h14M5 17a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2M5 17l-1 4h1m14-4l1 4h-1" /><path d="M9 21h6" /><circle cx="7.5" cy="14" r="1" /><circle cx="16.5" cy="14" r="1" />
        </svg>
      );
    case "Cruise":
    case "Boat Tour":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 20a6 6 0 0 0 12 0M12 20a6 6 0 0 0 10-3" /><path d="M2 20c.6-2 2-5 6-5s5.4 3 6 5" /><path d="M12 4v8" /><path d="M7 12l5-4 5 4" />
        </svg>
      );
    case "Walking Tour":
    case "Tour":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="5" r="2" /><path d="M10 22l1-7-3-3 2-4" /><path d="M14 22l-1-7 3-3-2-4" />
        </svg>
      );
    case "Attraction":
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      );
    default:
      return (
        <svg className={iconClass} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
        </svg>
      );
  }
}

function StatusBadge({ status }: { status: string }) {
  const isConfirmed = status === "confirmed";
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isConfirmed
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
          : "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isConfirmed ? "bg-emerald-500" : "bg-amber-500"}`} />
      {isConfirmed ? "Confirmed" : "Pending"}
    </span>
  );
}

export default async function SharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const data = await getItineraryData(token);

  if (!data) {
    notFound();
  }

  const { group, bookings, companyName } = data;

  // Organize bookings by date
  const bookingsByDate: Record<string, Booking[]> = {};
  const unscheduled: Booking[] = [];

  bookings.forEach((b) => {
    if (b.scheduled_date) {
      if (!bookingsByDate[b.scheduled_date]) bookingsByDate[b.scheduled_date] = [];
      bookingsByDate[b.scheduled_date].push(b);
    } else {
      unscheduled.push(b);
    }
  });

  const sortedDates = Object.keys(bookingsByDate).sort();

  // Determine unique cities
  const cities = [...new Set(bookings.map((b) => b.venue_city).filter(Boolean))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-[#0f1729] to-[#1a2744] text-white">
        <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-sm">
              <svg className="h-6 w-6 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight">TicketMatch</span>
              <span className="text-blue-400 font-light">.ai</span>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">
            {group.name}
          </h1>

          {companyName && (
            <p className="text-blue-200/80 text-sm mb-4">
              Organized by {companyName}
            </p>
          )}

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-blue-100/90">
            {group.travel_date && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                {formatDate(group.travel_date)}
              </div>
            )}
            <div className="flex items-center gap-2">
              <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              {group.number_of_guests} guests
            </div>
            {cities.length > 0 && (
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                </svg>
                {cities.join(", ")}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Timeline */}
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        {bookings.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <p className="text-slate-500">No activities have been added to this itinerary yet.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Activities</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{bookings.length}</p>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Days</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{sortedDates.length}</p>
              </div>
              <div className="hidden sm:block rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
                <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Cities</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{cities.length}</p>
              </div>
            </div>

            {/* Day by day schedule */}
            {sortedDates.map((date, index) => (
              <div key={date} className="relative">
                {/* Day header */}
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-600/20">
                    <span className="text-lg font-bold">{index + 1}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Day {index + 1}</h2>
                    <p className="text-sm text-slate-500">{formatDate(date)}</p>
                  </div>
                  <div className="ml-auto hidden sm:block">
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                      {bookingsByDate[date].length} {bookingsByDate[date].length === 1 ? "activity" : "activities"}
                    </span>
                  </div>
                </div>

                {/* Activities */}
                <div className="ml-6 border-l-2 border-blue-100 pl-8 space-y-3 pb-2">
                  {bookingsByDate[date].map((booking) => (
                    <div
                      key={booking.id}
                      className="group rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-slate-100 transition-all hover:shadow-md hover:ring-slate-200"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-100 transition-colors">
                          <CategoryIcon category={booking.venue_category} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-900">{booking.venue_name}</h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                            {booking.venue_category && (
                              <span>{booking.venue_category}</span>
                            )}
                            {booking.venue_city && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span className="flex items-center gap-1">
                                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="12" cy="10" r="3" /><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 6.9 8 11.7z" />
                                  </svg>
                                  {booking.venue_city}
                                </span>
                              </>
                            )}
                            {booking.number_of_guests > 0 && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span>{booking.number_of_guests} guests</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Unscheduled */}
            {unscheduled.length > 0 && (
              <div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700">
                    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">To Be Scheduled</h2>
                    <p className="text-sm text-slate-500">Date not yet confirmed</p>
                  </div>
                </div>

                <div className="ml-6 border-l-2 border-amber-100 pl-8 space-y-3">
                  {unscheduled.map((booking) => (
                    <div
                      key={booking.id}
                      className="rounded-2xl bg-white p-4 sm:p-5 shadow-sm ring-1 ring-amber-100"
                    >
                      <div className="flex items-start gap-3 sm:gap-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                          <CategoryIcon category={booking.venue_category} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-slate-900">{booking.venue_name}</h3>
                            <StatusBadge status={booking.status} />
                          </div>
                          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">
                            {booking.venue_category && <span>{booking.venue_category}</span>}
                            {booking.venue_city && (
                              <>
                                <span className="text-slate-300">|</span>
                                <span>{booking.venue_city}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-slate-400">
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
              <span className="text-sm">
                Powered by{" "}
                <a
                  href="https://ticketmatch.ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-semibold text-slate-600 hover:text-blue-600 transition-colors"
                >
                  TicketMatch.ai
                </a>
              </span>
            </div>
            <p className="text-xs text-slate-400">
              B2B City Access Platform for Tour Operators
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
