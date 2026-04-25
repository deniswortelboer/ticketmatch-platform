"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// ═══════════════════════════════════════════════════════════════════
// /dashboard/bookings/new
//
// Landing page when a reseller clicks "Book Direct" on an Experiences
// card for a Musement-merchant product. Collects the missing pieces
// (which group, how many guests, travel date) and creates a PENDING
// booking in Supabase that carries the Musement activity UUID.
//
// The real Musement cart/order API call happens later in
// /api/bookings/[id]/confirm-order, triggered once the invoice for
// this group is paid via Stripe.
// ═══════════════════════════════════════════════════════════════════

type Group = {
  id: string;
  name: string;
  contact_person: string | null;
  travel_date: string | null;
  number_of_guests: number | null;
};

// Musement returns rich-text fields (info / "what to remember", description on
// some activities) as HTML. We render that HTML so bullet lists, paragraphs and
// emphasis show as the partner intends — but only after stripping anything that
// could execute (script/style/iframe blocks, on* event handlers, javascript:
// URIs). Musement is a trusted source, this is defense-in-depth.
function sanitizeMusementHtml(html: string): string {
  return html
    .replace(/<(script|style|iframe|object|embed)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed)\b[^>]*\/?>/gi, "")
    .replace(/\son\w+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]*)/gi, "")
    .replace(/(href|src)\s*=\s*(['"])\s*javascript:[^'"]*\2/gi, "$1=$2#$2");
}

function NewBookingForm() {
  const router = useRouter();
  const params = useSearchParams();

  const source = params.get("source") || "musement";
  const activityUuid = params.get("activityUuid") || "";
  const title = params.get("title") || "Musement activity";
  const priceRaw = params.get("price") || "0";
  const currency = params.get("currency") || "EUR";

  const price = Math.max(0, Number(priceRaw) || 0);

  const [groups, setGroups] = useState<Group[]>([]);
  const [groupId, setGroupId] = useState<string>("");
  const [numberOfGuests, setNumberOfGuests] = useState(1);
  const [scheduledDate, setScheduledDate] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Full activity details (required fields per Musement Quality Check #3)
  type ActivityDetails = {
    description?: string;
    descriptionFull?: string;
    duration?: string;
    highlights?: string[];
    inclusions?: string[];
    exclusions?: string[];
    meetingPoint?: string;
    whereText?: string;
    info?: string;
    maxConfirmationTime?: string;
    voucherType?: string;
    cancellationPolicy?: string;
    refundPolicies?: { period?: string; percentage?: number; applicableUntil?: string }[];
    images?: { url: string; caption?: string }[];
    rating?: number;
    reviewCount?: number;
    languages?: string[];
  };
  const [details, setDetails] = useState<ActivityDetails | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Musement timeslot state
  type Slot = {
    time: string;
    groupName: string;
    productId: string;
    priceEur: number;
    currency: string;
    languages: string[];
    maxBuy: number;
    minBuy: number;
  };
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string>("");

  const selectedSlot = slots.find((s) => s.productId === selectedProductId);
  // -1 from Musement = unlimited; clamp to a sane UI upper bound
  const effectiveMax = selectedSlot
    ? selectedSlot.maxBuy === -1
      ? 500
      : selectedSlot.maxBuy
    : 500;
  const effectiveMin = selectedSlot?.minBuy ?? 1;
  const quantityOutOfRange =
    !!selectedSlot &&
    (numberOfGuests < effectiveMin || numberOfGuests > effectiveMax);

  // Fetch reseller's own groups
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/groups");
        if (!res.ok) return;
        const json = await res.json();
        const list: Group[] = json.groups || json || [];
        setGroups(list);
        if (list.length > 0) {
          setGroupId(list[0].id);
          if (list[0].number_of_guests) setNumberOfGuests(list[0].number_of_guests);
          if (list[0].travel_date) setScheduledDate(list[0].travel_date);
        }
      } catch {
        setError("Could not load groups — please try again.");
      }
    }
    void load();
  }, []);

  // Auto-sync quantity + date when reseller switches group
  useEffect(() => {
    const g = groups.find((x) => x.id === groupId);
    if (g?.number_of_guests) setNumberOfGuests(g.number_of_guests);
    if (g?.travel_date) setScheduledDate(g.travel_date);
  }, [groupId, groups]);

  // Clamp number-of-guests to the selected slot's min_buy/max_buy so we
  // never submit a quantity Musement would reject at addToCart.
  useEffect(() => {
    if (!selectedSlot) return;
    if (numberOfGuests < effectiveMin) setNumberOfGuests(effectiveMin);
    else if (numberOfGuests > effectiveMax) setNumberOfGuests(effectiveMax);
  }, [selectedProductId, effectiveMin, effectiveMax, numberOfGuests, selectedSlot]);

  // Fetch full activity details once we have a UUID — required fields per
  // Musement Quality Check #3 (Display Activity Information).
  useEffect(() => {
    if (source !== "musement" || !activityUuid) {
      setDetails(null);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/musement/product?uuid=${encodeURIComponent(activityUuid)}`);
        if (!res.ok) return;
        const p = await res.json();
        if (cancelled) return;
        setDetails({
          description: p.description,
          descriptionFull: p.descriptionFull,
          duration: p.duration,
          highlights: p.highlights,
          inclusions: p.inclusions,
          exclusions: p.exclusions,
          meetingPoint: p.meetingPoint,
          whereText: p.whereText,
          info: p.info,
          maxConfirmationTime: p.maxConfirmationTime,
          voucherType: p.voucherType,
          cancellationPolicy: p.cancellationPolicy,
          refundPolicies: p.refundPolicies,
          images: p.images,
          rating: p.rating,
          reviewCount: p.reviewCount,
          languages: p.languages,
        });
      } catch {
        // non-fatal — booking can proceed without the detail panel
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [source, activityUuid]);

  // Fetch Musement timeslots when activityUuid + scheduledDate are both set.
  // Sandbox quirk: Musement requires dates ≥1 month out. We gate the fetch
  // so the UI doesn't slam the user with a "no availability" warning for
  // a date that was never going to be bookable anyway.
  useEffect(() => {
    if (source !== "musement" || !activityUuid) {
      setSlots([]);
      setSelectedProductId("");
      setSlotsMessage("");
      return;
    }
    if (!scheduledDate) {
      setSlots([]);
      setSelectedProductId("");
      setSlotsMessage("Pick a travel date to see available times.");
      return;
    }

    const minDate = new Date(Date.now() + 30 * 86400_000); // 30d future
    const chosen = new Date(scheduledDate);
    if (chosen < minDate) {
      setSlots([]);
      setSelectedProductId("");
      setSlotsMessage(
        "This date is too close — Musement sandbox requires at least 1 month ahead. Pick a later date or leave empty (system will auto-pick).",
      );
      return;
    }

    let cancelled = false;
    async function loadSlots() {
      setSlotsLoading(true);
      setSlotsMessage("");
      try {
        const res = await fetch("/api/musement/timeslots", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activityUuid, date: scheduledDate }),
        });
        const json = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setSlots([]);
          setSelectedProductId("");
          setSlotsMessage(
            json.error
              ? `No Musement availability for ${scheduledDate}. Try another date.`
              : "Could not load timeslots.",
          );
          return;
        }
        const list: Slot[] = json.slots || [];
        setSlots(list);
        const bookable = list.filter((s) => s.maxBuy !== 0);
        if (bookable.length === 1) setSelectedProductId(bookable[0].productId);
        else if (bookable.length === 0 && list.length > 0) {
          setSelectedProductId("");
          setSlotsMessage(`All timeslots on ${scheduledDate} are sold out — pick another date.`);
        } else if (list.length === 0) {
          setSelectedProductId("");
          setSlotsMessage(`No timeslots available on ${scheduledDate} — pick another date.`);
        } else {
          setSlotsMessage("");
        }
      } catch (err) {
        if (!cancelled) setSlotsMessage((err as Error).message);
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }
    void loadSlots();
    return () => {
      cancelled = true;
    };
  }, [source, activityUuid, scheduledDate]);

  async function submit() {
    if (!groupId) return setError("Pick a group first.");
    if (numberOfGuests < 1) return setError("Number of guests must be at least 1.");
    if (selectedSlot && numberOfGuests < effectiveMin) {
      return setError(`This timeslot requires at least ${effectiveMin} guests.`);
    }
    if (selectedSlot && numberOfGuests > effectiveMax) {
      return setError(`This timeslot allows at most ${effectiveMax} guests.`);
    }
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          groupId,
          venueName: title,
          venueCategory: "Musement activity",
          venueCity: "",
          scheduledDate: scheduledDate || null,
          numberOfGuests,
          unitPrice: price,
          notes: `Musement booking · activity ${activityUuid}`,
          musementActivityUuid: activityUuid,
          // If reseller picked a specific timeslot, save the product_id.
          // If not, confirm-order will auto-resolve it later from scheduled_date.
          ...(selectedProductId && { musementDateId: selectedProductId }),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create booking");
      // Navigate to Bookings list so reseller sees the new pending row
      router.push("/dashboard/bookings");
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-muted hover:text-foreground"
      >
        ← Back to Experiences
      </button>

      {/* Activity header */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 mb-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="h-14 w-14 rounded-xl bg-orange-100 text-orange-600 grid place-items-center text-2xl">
            🎫
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-[10px] font-semibold tracking-wider uppercase text-orange-600">
              {source === "musement" ? "Musement" : source}
            </span>
            <h1 className="text-xl font-bold mt-1">{title}</h1>
            {price > 0 && (
              <p className="text-sm text-muted mt-1">
                From <strong className="text-foreground">{currency === "EUR" ? "€" : currency} {price.toFixed(2)}</strong> per person
              </p>
            )}
            {details && (
              <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-muted">
                {details.duration && <span>⏱️ {details.duration}</span>}
                {details.rating && details.rating > 0 && (
                  <span>⭐ {details.rating.toFixed(1)} ({details.reviewCount ?? 0})</span>
                )}
                {details.languages && details.languages.length > 0 && (
                  <span>🗣️ {details.languages.slice(0, 4).join(", ").toUpperCase()}</span>
                )}
                {details.cancellationPolicy && (
                  <span className={details.cancellationPolicy === "Free cancellation" ? "text-emerald-700 font-semibold" : ""}>
                    {details.cancellationPolicy === "Free cancellation" ? "✅" : "⚠️"} {details.cancellationPolicy}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity details panel (Musement Quality Check #3 required fields) */}
      {details && (
        <div className="rounded-2xl border border-border/60 bg-white p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted">Activity details</h2>
            <button
              type="button"
              onClick={() => setDetailsOpen(!detailsOpen)}
              className="text-xs font-semibold text-orange-600 hover:text-orange-700"
            >
              {detailsOpen ? "Hide details ▲" : "Show all details ▼"}
            </button>
          </div>

          {details.descriptionFull && (
            <p className="mt-3 text-sm text-foreground/80 whitespace-pre-line">
              {detailsOpen
                ? details.descriptionFull
                : (details.descriptionFull.length > 300
                    ? details.descriptionFull.slice(0, 300) + "…"
                    : details.descriptionFull)}
            </p>
          )}

          {detailsOpen && (
            <div className="mt-5 space-y-5 text-sm">
              {details.highlights && details.highlights.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted/70 mb-2">Highlights</h3>
                  <ul className="list-disc pl-5 space-y-1">
                    {details.highlights.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </section>
              )}
              {details.inclusions && details.inclusions.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted/70 mb-2">What's included</h3>
                  <ul className="list-disc pl-5 space-y-1 text-emerald-800">
                    {details.inclusions.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </section>
              )}
              {details.exclusions && details.exclusions.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted/70 mb-2">What's not included</h3>
                  <ul className="list-disc pl-5 space-y-1 text-red-800">
                    {details.exclusions.map((h, i) => <li key={i}>{h}</li>)}
                  </ul>
                </section>
              )}
              {(details.meetingPoint || details.whereText) && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted/70 mb-2">Meeting point</h3>
                  {details.meetingPoint && <p>{details.meetingPoint}</p>}
                  {details.whereText && (
                    <p className="text-muted text-xs mt-1">{details.whereText}</p>
                  )}
                </section>
              )}
              {details.info && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted/70 mb-2">What to remember</h3>
                  <div
                    className="text-sm whitespace-pre-line [&>ul]:list-disc [&>ul]:ml-5 [&>ol]:list-decimal [&>ol]:ml-5 [&>ul]:my-1 [&>ol]:my-1 [&>ul>li]:my-0.5 [&>ol>li]:my-0.5 [&>p]:my-1 [&_a]:underline [&_a]:text-accent"
                    dangerouslySetInnerHTML={{ __html: sanitizeMusementHtml(details.info) }}
                  />
                </section>
              )}
              {details.voucherType && (
                <section className="text-xs text-muted">
                  <strong>Voucher type:</strong> {details.voucherType}
                </section>
              )}
              {details.maxConfirmationTime && (
                <section className="text-xs text-muted">
                  <strong>Max confirmation time:</strong> {details.maxConfirmationTime}
                </section>
              )}
              {details.refundPolicies && details.refundPolicies.length > 0 && (
                <section>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted/70 mb-2">Refund policies</h3>
                  <ul className="list-disc pl-5 space-y-1 text-xs">
                    {details.refundPolicies.map((p, i) => (
                      <li key={i}>
                        {p.percentage !== undefined ? `${p.percentage}% refund` : "Refund"}
                        {p.period ? ` · ${p.period}` : ""}
                        {p.applicableUntil ? ` · until ${p.applicableUntil}` : ""}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </div>
      )}

      {/* Booking form */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Book for a group</h2>

        {/* Group */}
        <label className="block mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">Group</span>
          {groups.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              You don&apos;t have any groups yet — create one first at{" "}
              <a href="/dashboard/groups" className="text-accent underline">Groups</a>.
            </p>
          ) : (
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value)}
              className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-4 text-sm"
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} {g.number_of_guests ? `(${g.number_of_guests} guests)` : ""}
                </option>
              ))}
            </select>
          )}
        </label>

        {/* Guests */}
        <label className="block mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">Number of guests</span>
          <input
            type="number"
            min={effectiveMin}
            max={effectiveMax}
            value={numberOfGuests}
            onChange={(e) =>
              setNumberOfGuests(
                Math.max(effectiveMin, Math.min(effectiveMax, Number(e.target.value) || effectiveMin)),
              )
            }
            className={`mt-1.5 h-11 w-full rounded-xl border bg-white px-4 text-sm ${
              quantityOutOfRange ? "border-red-400" : "border-border"
            }`}
          />
          {selectedSlot && (
            <p className="mt-1 text-[11px] text-muted">
              {selectedSlot.maxBuy === -1
                ? `Minimum ${effectiveMin} guests for this timeslot.`
                : `This timeslot accepts ${effectiveMin}–${effectiveMax} guests.`}
            </p>
          )}
        </label>

        {/* Date */}
        <label className="block mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">Travel date (optional)</span>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-4 text-sm"
          />
          <p className="text-xs text-muted mt-1">
            Leave empty if you&apos;ll finalize the date at invoice time. Musement availability is checked later.
          </p>
        </label>

        {/* Timeslot picker (Musement activities only, when date is set) */}
        {source === "musement" && scheduledDate && (
          <div className="mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">
              Available times on {scheduledDate}
            </span>
            {slotsLoading && (
              <p className="mt-2 text-sm text-muted">🔄 Checking Musement availability…</p>
            )}
            {!slotsLoading && slots.length > 0 && (
              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto">
                {slots.map((s) => {
                  const soldOut = s.maxBuy === 0;
                  const active = selectedProductId === s.productId;
                  return (
                    <label
                      key={s.productId}
                      className={`flex items-center gap-3 rounded-xl border p-3 transition ${
                        soldOut
                          ? "cursor-not-allowed border-border/50 bg-gray-50 opacity-60"
                          : active
                          ? "cursor-pointer border-orange-500 bg-orange-50"
                          : "cursor-pointer border-border hover:border-orange-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="timeslot"
                        value={s.productId}
                        checked={active}
                        disabled={soldOut}
                        onChange={() => !soldOut && setSelectedProductId(s.productId)}
                        className="accent-orange-500"
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 flex-wrap">
                          <span className="font-semibold">{s.time || "Whole day"}</span>
                          <span className="text-xs text-muted">· {s.groupName}</span>
                          {soldOut && (
                            <span className="text-[10px] font-bold uppercase tracking-wider rounded-full bg-red-100 text-red-700 px-2 py-0.5">
                              Sold out
                            </span>
                          )}
                          {!soldOut && s.maxBuy > 0 && s.maxBuy <= 5 && (
                            <span className="text-[10px] font-semibold uppercase tracking-wider rounded-full bg-amber-100 text-amber-700 px-2 py-0.5">
                              Only {s.maxBuy} left
                            </span>
                          )}
                        </div>
                        {s.languages.length > 0 && (
                          <div className="text-[11px] text-muted mt-0.5">
                            Languages: {s.languages.join(", ").toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div className="text-sm font-bold text-orange-600">
                        {s.currency === "EUR" ? "€" : s.currency} {s.priceEur.toFixed(2)}
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            {!slotsLoading && slotsMessage && (
              <p className="mt-2 rounded-xl bg-yellow-50 text-yellow-800 p-3 text-xs">
                {slotsMessage} System will auto-pick the first available slot at invoice creation.
              </p>
            )}
          </div>
        )}

        {/* Total */}
        {price > 0 && (
          <div className="mb-6 rounded-xl bg-gray-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Indicative total</span>
              <span>{currency === "EUR" ? "€" : currency} {(price * numberOfGuests).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Final price is set at invoice time based on live Musement availability.
            </p>
          </div>
        )}

        {error && (
          <p className="mb-4 rounded-xl bg-red-50 text-red-700 p-3 text-sm">{error}</p>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className="rounded-xl border border-border px-5 py-3 text-sm font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={submitting || !groupId || quantityOutOfRange}
            className="flex-1 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Working…" : "Create pending booking"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Loading…</div>}>
      <NewBookingForm />
    </Suspense>
  );
}
