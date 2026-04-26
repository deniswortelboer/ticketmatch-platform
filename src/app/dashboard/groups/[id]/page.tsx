"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";

interface Group {
  id: string;
  name: string;
  travel_date: string | null;
  number_of_guests: number;
  contact_person: string | null;
  notes: string | null;
  status: string;
  created_at: string;
}

interface Booking {
  id: string;
  venue_name: string;
  venue_city: string | null;
  total_price: number;
  status: string;
  created_at: string;
  scheduled_date?: string | null;
  group_id?: string | null;
  groups?: { id?: string; name: string } | null;
}

interface Passenger {
  index: number;
  name: string;
  email: string | null;
  phone: string | null;
  language: string | null;
  role: string | null;
}

const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  confirmed: "bg-green-100 text-green-700",
  completed: "bg-blue-100 text-blue-700",
  cancelled: "bg-red-100 text-red-600",
};

type TabKey = "overview" | "passengers" | "itinerary" | "bookings" | "invoices" | "messages";

const TAB_DEFS: { key: TabKey; label: string }[] = [
  { key: "overview",   label: "Overview"   },
  { key: "passengers", label: "Passengers" },
  { key: "itinerary",  label: "Itinerary"  },
  { key: "bookings",   label: "Bookings"   },
  { key: "invoices",   label: "Invoices"   },
  { key: "messages",   label: "Messages"   },
];

/** Parse "--- Itinerary saved DD MMM YYYY (City) ---" blocks from notes,
 *  written by Discover's "Save as itinerary to a group" action. Each block
 *  is followed by numbered stops on subsequent lines until the next `---`
 *  marker, blank line, or a non-numbered line.
 */
type ItineraryStop = { time: string | null; text: string };
type ItineraryBlock = {
  header: string;
  date: string;
  city: string;
  startTime: string | null;
  endTime: string | null;
  stops: ItineraryStop[];
};
function parseItinerariesFromNotes(notes: string | null): ItineraryBlock[] {
  if (!notes) return [];
  const lines = notes.split(/\r?\n/);
  const out: ItineraryBlock[] = [];
  let current: ItineraryBlock | null = null;
  for (const raw of lines) {
    // "--- Itinerary saved 26 Apr 2026 (Amsterdam) — start 09:00, ends 14:30 ---"
    // The "(City)" and "— start … ends …" tails are both optional.
    const headerMatch = raw.match(
      /^---\s*Itinerary saved\s+(.+?)(?:\s*\((.+?)\))?(?:\s*[—-]\s*start\s+(\d{2}:\d{2})(?:,\s*ends\s+(\d{2}:\d{2}))?)?\s*---\s*$/i
    );
    if (headerMatch) {
      if (current) out.push(current);
      current = {
        header: raw.trim(),
        date: headerMatch[1].trim(),
        city: (headerMatch[2] || "").trim(),
        startTime: headerMatch[3] || null,
        endTime: headerMatch[4] || null,
        stops: [],
      };
      continue;
    }
    if (!current) continue;
    if (/^---/.test(raw)) {
      out.push(current);
      current = null;
      continue;
    }
    if (/^\s*\d+\.\s+/.test(raw)) {
      const body = raw.replace(/^\s*\d+\.\s+/, "").trim();
      // Optional "HH:MM · " or "HH:MM — " prefix
      const tm = body.match(/^(\d{2}:\d{2})\s*[·—-]\s*(.*)$/);
      current.stops.push(tm ? { time: tm[1], text: tm[2] } : { time: null, text: body });
    } else if (raw.trim() === "" && current.stops.length > 0) {
      // blank line ends the block only after we've collected stops
      out.push(current);
      current = null;
    }
  }
  if (current) out.push(current);
  return out;
}

/** Parse the freeform passenger list stored in `notes` by /upload-passengers.
 *  Format produced by handleCreateFromUpload:
 *    "Passenger list (from file.xlsx):
 *     1. Name | email | phone | nationality | DOB"
 *  We accept any "N. ..." line and split on " | ".
 */
function parsePassengersFromNotes(notes: string | null): Passenger[] {
  if (!notes) return [];
  const lines = notes.split(/\r?\n/);
  const out: Passenger[] = [];
  for (const raw of lines) {
    const m = raw.match(/^\s*(\d+)\.\s+(.*)$/);
    if (!m) continue;
    const idx = parseInt(m[1], 10);
    const parts = m[2].split("|").map((s) => s.trim()).filter(Boolean);
    const name = parts.shift() || "";
    let email: string | null = null;
    let phone: string | null = null;
    let language: string | null = null;
    let role: string | null = null;
    for (const p of parts) {
      if (!email && /@/.test(p)) email = p;
      else if (!phone && /[0-9]{4}/.test(p) && /^[+0-9 ()-]+$/.test(p)) phone = p;
      else if (!language && /^[A-Za-z]{2,}$/.test(p)) language = p;
      else if (!role) role = p;
    }
    out.push({ index: idx, name, email, phone, language, role });
  }
  return out;
}

function formatDate(d: string | null): string {
  if (!d) return "No date set";
  return new Date(d).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export default function GroupDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const [group, setGroup] = useState<Group | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<TabKey>("itinerary");
  const [allGroups, setAllGroups] = useState<Group[]>([]);

  // Drop-zone for the Passengers tab — adds parsed passengers to this group.
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/bookings").then((r) => r.json()),
    ]).then(([g, b]) => {
      const groups: Group[] = g.groups || [];
      const found = groups.find((gr) => gr.id === id) || null;
      const allBookings: Booking[] = b.bookings || [];
      setAllGroups(groups);
      setGroup(found);
      setBookings(allBookings.filter((bk) => bk.group_id === id || bk.groups?.id === id));
      setLoading(false);
    });
  }, [id]);

  const passengers = useMemo(() => parsePassengersFromNotes(group?.notes ?? null), [group?.notes]);
  const itineraries = useMemo(() => parseItinerariesFromNotes(group?.notes ?? null), [group?.notes]);

  const totalSpent = useMemo(
    () => bookings.reduce((s, bk) => s + Number(bk.total_price || 0), 0),
    [bookings]
  );
  const confirmedCount = useMemo(
    () => bookings.filter((bk) => bk.status === "confirmed").length,
    [bookings]
  );
  const pendingCount = useMemo(
    () => bookings.filter((bk) => bk.status === "pending").length,
    [bookings]
  );

  // ── Drop-zone handlers (Passengers tab) ──
  const handleFile = async (file: File) => {
    const validExt = [".xlsx", ".xls", ".csv", ".docx"];
    const ext = "." + (file.name.split(".").pop()?.toLowerCase() || "");
    if (!validExt.includes(ext)) {
      setUploadError("Upload a .xlsx, .xls, .csv or .docx file.");
      return;
    }
    setUploadError("");
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload-passengers", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
      } else {
        // Append parsed passengers to the existing notes block; re-save the group.
        const lines = (data.passengers as Array<{ name: string; email?: string|null; phone?: string|null; nationality?: string|null; dateOfBirth?: string|null; notes?: string|null }>)
          .map((p, i) => {
            const start = passengers.length + i + 1;
            const bits = [`${start}. ${p.name}`];
            if (p.email) bits.push(p.email);
            if (p.phone) bits.push(p.phone);
            if (p.nationality) bits.push(p.nationality);
            if (p.dateOfBirth) bits.push(`DOB: ${p.dateOfBirth}`);
            return bits.join(" | ");
          })
          .join("\n");
        const nextNotes = (group?.notes?.trim() || `Passenger list (from ${data.fileName}):`) + "\n" + lines;
        const nextCount = (group?.number_of_guests || 0) + (data.totalPassengers || 0);
        // Update the group on the server
        const upd = await fetch("/api/groups", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id,
            name: group?.name,
            travelDate: group?.travel_date,
            numberOfGuests: nextCount,
            contactPerson: group?.contact_person,
            notes: nextNotes,
          }),
        });
        if (upd.ok) {
          // Re-fetch
          const fresh = await fetch("/api/groups").then((r) => r.json());
          const found = (fresh.groups || []).find((gr: Group) => gr.id === id) || null;
          setGroup(found);
        }
      }
    } catch {
      setUploadError("Upload failed. Try again.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
      </div>
    );
  }
  if (!group) {
    return (
      <div className="p-6">
        <button onClick={() => router.push("/dashboard/groups")} className="mb-4 text-sm text-muted hover:text-foreground">
          ← Back to Groups
        </button>
        <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <p className="text-sm text-muted">Group not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back + group switcher */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.push("/dashboard/groups")}
          className="text-sm text-muted hover:text-foreground"
        >
          ← All groups
        </button>
        {allGroups.length > 1 && (
          <select
            value={id}
            onChange={(e) => router.push(`/dashboard/groups/${e.target.value}`)}
            className="h-9 rounded-lg border border-border bg-white px-3 text-sm"
          >
            {allGroups.map((g) => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        )}
      </div>

      {/* Entity header */}
      <header className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-xl font-bold tracking-tight">{group.name}</h1>
              <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColors[group.status] || statusColors.draft}`}>
                {group.status}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
              <span>📅 {formatDate(group.travel_date)}</span>
              <span>👥 {group.number_of_guests} guests</span>
              {group.contact_person && <span>👤 {group.contact_person}</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/dashboard/bookings?group=${id}`)}
              className="rounded-xl border border-border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50"
            >
              Share with client
            </button>
            <button
              onClick={() => router.push(`/dashboard/bookings?group=${id}&action=invoice`)}
              className="rounded-xl bg-foreground px-4 py-2 text-sm font-semibold text-background hover:opacity-90"
            >
              Generate invoice
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <nav className="flex flex-wrap gap-1 border-b border-border/60">
        {TAB_DEFS.map((t) => {
          const count =
            t.key === "passengers" ? passengers.length || group.number_of_guests
            : t.key === "itinerary" ? itineraries.length
            : t.key === "bookings" ? bookings.length
            : t.key === "invoices" ? bookings.filter((bk) => bk.status === "confirmed").length
            : null;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`relative px-4 py-2.5 text-sm font-medium transition-colors ${
                tab === t.key
                  ? "text-foreground after:absolute after:bottom-[-1px] after:left-0 after:right-0 after:h-[2px] after:bg-accent"
                  : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
              {count !== null && count > 0 && (
                <span className="ml-1.5 rounded-full bg-gray-100 px-1.5 py-0.5 text-[10px] font-semibold text-muted">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Tab panels */}
      {tab === "overview" && (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Total bookings", value: String(bookings.length), sub: `${confirmedCount} confirmed · ${pendingCount} pending` },
              { label: "Total spent", value: `€${totalSpent.toFixed(2)}`, sub: bookings.length > 0 ? `Across ${bookings.length} venue${bookings.length > 1 ? "s" : ""}` : "—" },
              { label: "Passengers parsed", value: String(passengers.length || group.number_of_guests), sub: passengers.length ? `${passengers.filter((p) => p.email).length} with email` : "from notes" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted">{kpi.label}</p>
                <p className="mt-2 text-2xl font-bold tracking-tight">{kpi.value}</p>
                <p className="mt-1 text-xs text-muted">{kpi.sub}</p>
              </div>
            ))}
          </div>
          <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
            <h2 className="text-sm font-bold uppercase tracking-wider text-muted mb-3">Group details</h2>
            <dl className="grid gap-4 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-xs text-muted">Travel date</dt>
                <dd className="mt-0.5 font-medium">{formatDate(group.travel_date)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Created</dt>
                <dd className="mt-0.5 font-medium">{formatDate(group.created_at)}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Contact person</dt>
                <dd className="mt-0.5 font-medium">{group.contact_person || "—"}</dd>
              </div>
              <div>
                <dt className="text-xs text-muted">Status</dt>
                <dd className="mt-0.5 font-medium capitalize">{group.status}</dd>
              </div>
            </dl>
          </div>
        </section>
      )}

      {tab === "passengers" && (
        <section className="space-y-4">
          {/* Drop-zone — locked-in killer feature, now scoped to this group */}
          <div
            onDrop={(e) => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-2xl border-2 border-dashed p-6 text-center transition-all ${
              dragging
                ? "border-accent bg-accent/5 scale-[1.005]"
                : "border-border/60 bg-white hover:border-accent/40 hover:bg-accent/[0.02]"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv,.docx"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }}
            />
            <div className="flex flex-col items-center gap-2">
              <div className={`flex h-11 w-11 items-center justify-center rounded-2xl transition-colors ${
                dragging ? "bg-accent/20 text-accent" : "bg-gray-100 text-muted"
              }`}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              {uploading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                  <p className="text-sm font-medium text-accent">Reading file…</p>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold">
                    {dragging ? "Drop your file here!" : passengers.length === 0 ? "Drop your passenger list here" : "Add more passengers"}
                  </p>
                  <p className="text-xs text-muted">Excel, CSV or Word — names, emails, phones auto-detected</p>
                </>
              )}
            </div>
            {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}
          </div>

          {/* Passenger table */}
          {passengers.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-white overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/70 text-left text-[11px] font-semibold uppercase tracking-wider text-muted">
                  <tr>
                    <th className="px-4 py-3 w-10">#</th>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3 hidden sm:table-cell">Email</th>
                    <th className="px-4 py-3 hidden md:table-cell">Phone</th>
                    <th className="px-4 py-3 hidden md:table-cell">Lang</th>
                    <th className="px-4 py-3 hidden lg:table-cell">Role</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {passengers.map((p) => (
                    <tr key={p.index} className="hover:bg-gray-50/50">
                      <td className="px-4 py-2.5 text-muted">{p.index}</td>
                      <td className="px-4 py-2.5 font-medium">{p.name}</td>
                      <td className="px-4 py-2.5 text-muted hidden sm:table-cell">{p.email || "—"}</td>
                      <td className="px-4 py-2.5 text-muted hidden md:table-cell">{p.phone || "—"}</td>
                      <td className="px-4 py-2.5 text-muted hidden md:table-cell">{p.language || "—"}</td>
                      <td className="px-4 py-2.5 text-muted hidden lg:table-cell">{p.role || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-8 text-center">
              <p className="text-sm text-muted">No passengers parsed from notes yet.</p>
              <p className="mt-1 text-xs text-muted/70">Drop a file above to populate the list.</p>
            </div>
          )}
        </section>
      )}

      {tab === "itinerary" && (
        <section className="space-y-4">
          {itineraries.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <div className="text-3xl mb-3">🗺</div>
              <h2 className="text-lg font-semibold">No itinerary saved yet</h2>
              <p className="mt-2 text-sm text-muted max-w-md mx-auto">
                Build a day-route in Discover (map venues + Musement activities), then click
                <strong> 💾 Save as itinerary to a group </strong> at the bottom of the Route tab.
              </p>
              <Link
                href="/dashboard/command"
                className="mt-4 inline-flex rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
              >
                Plan in Discover →
              </Link>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold uppercase tracking-wider text-muted">Saved day-routes ({itineraries.length})</h2>
                <Link href="/dashboard/command" className="text-xs font-semibold text-accent hover:underline">
                  + Plan another →
                </Link>
              </div>
              {itineraries.map((it, idx) => (
                <div key={`it-${idx}`} className="rounded-2xl border border-border/60 bg-white p-5 shadow-sm">
                  <div className="mb-3 flex items-center justify-between gap-3 flex-wrap">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">Saved {it.date}</p>
                      {it.city && <p className="text-base font-bold mt-0.5">📍 {it.city}</p>}
                      {(it.startTime || it.endTime) && (
                        <p className="mt-1 text-xs text-muted tabular-nums">
                          {it.startTime && <>🕘 Starts <strong className="text-foreground">{it.startTime}</strong></>}
                          {it.endTime && <> · ends <strong className="text-foreground">{it.endTime}</strong></>}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted">{it.stops.length} stops</span>
                  </div>
                  <ol className="space-y-2 border-l-2 border-amber-200 pl-4">
                    {it.stops.map((s, i) => (
                      <li key={i} className="relative text-sm text-foreground/90">
                        <span className="absolute -left-[22px] top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
                          {i + 1}
                        </span>
                        {s.time && (
                          <span className="mr-2 inline-block rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold tabular-nums text-amber-800">
                            {s.time}
                          </span>
                        )}
                        {s.text}
                      </li>
                    ))}
                  </ol>
                </div>
              ))}
            </>
          )}
        </section>
      )}

      {tab === "bookings" && (
        <section>
          {bookings.length > 0 ? (
            <div className="rounded-2xl border border-border/60 bg-white divide-y divide-border/40 shadow-sm">
              {bookings.map((bk) => (
                <Link
                  key={bk.id}
                  href={`/dashboard/bookings`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-gray-50/50 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">🎫</div>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{bk.venue_name}</p>
                      <p className="text-xs text-muted truncate">
                        {bk.venue_city || "—"} · booked {formatDate(bk.created_at)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-accent">€{Number(bk.total_price).toFixed(2)}</p>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${
                      bk.status === "confirmed" ? "bg-green-100 text-green-700"
                      : bk.status === "cancelled" ? "bg-red-100 text-red-700"
                      : "bg-amber-100 text-amber-700"
                    }`}>{bk.status}</span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
              <p className="text-sm text-muted">No bookings for this group yet.</p>
              <Link
                href="/dashboard/experiences"
                className="mt-3 inline-flex text-sm font-semibold text-accent hover:underline"
              >
                Browse experiences →
              </Link>
            </div>
          )}
        </section>
      )}

      {tab === "invoices" && (
        <section className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <div className="text-3xl mb-3">📄</div>
          <h2 className="text-lg font-semibold">Invoices</h2>
          <p className="mt-2 text-sm text-muted">
            One consolidated invoice per group, sent to the client with a Stripe payment link.
            {bookings.filter((bk) => bk.status === "confirmed").length > 0 && (
              <> {bookings.filter((bk) => bk.status === "confirmed").length} confirmed booking{bookings.filter((bk) => bk.status === "confirmed").length > 1 ? "s" : ""} ready to bill.</>
            )}
          </p>
          <button
            onClick={() => router.push(`/dashboard/bookings?group=${id}&action=invoice`)}
            className="mt-4 inline-flex rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background hover:opacity-90"
          >
            Generate invoice →
          </button>
        </section>
      )}

      {tab === "messages" && (
        <section className="rounded-2xl border border-dashed border-border/60 bg-white p-12 text-center">
          <div className="text-3xl mb-3">💬</div>
          <h2 className="text-lg font-semibold">Messages</h2>
          <p className="mt-2 text-sm text-muted max-w-md mx-auto">
            Client thread for this group — emails, WhatsApp replies and internal notes in one place.
            Coming next iteration.
          </p>
        </section>
      )}
    </div>
  );
}
