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
  // Optional pre-select + return URL — used by the Group's Itinerary "Book →"
  // button so the reseller stays on the itinerary page after submit and the
  // active group is already selected (no manual dropdown work).
  const preGroupId = params.get("groupId") || "";
  const returnTo = params.get("returnTo") || "";

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
    netPrice?: number;
    retailPrice?: number;
    marginPct?: number;
  };
  const [details, setDetails] = useState<ActivityDetails | null>(null);
  // Open by default — Viator-style rich product page. Reseller engagement
  // depends on highlights/inclusions/meeting-point being immediately visible.
  const [detailsOpen, setDetailsOpen] = useState(true);
  // Active hero image — switches when reseller clicks a thumbnail.
  const [activeImageIdx, setActiveImageIdx] = useState(0);

  // Musement timeslot state
  type Holder = {
    code: string;       // ADULT / CHILDREN / INFANT / STUDENT / SENIOR / ...
    name: string;       // human-friendly: "Adult (+16)", "Child (6-15)"
    productId: string;
    priceEur: number;
    minBuy: number;
    maxBuy: number;     // -1 = unlimited
    isPrimary: boolean;
  };
  type Slot = {
    time: string;
    groupName: string;
    // legacy single-product mirrors (= primary holder)
    productId: string;
    priceEur: number;
    holderCode?: string;
    currency: string;
    languages: string[];
    maxBuy: number;
    minBuy: number;
    // full breakdown
    holders?: Holder[];
  };
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  // Per-holder quantity map (key = holder.productId). Populated when a
  // slot is selected; primary holder seeded with the group's headcount.
  const [holderQty, setHolderQty] = useState<Record<string, number>>({});
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsMessage, setSlotsMessage] = useState<string>("");

  const selectedSlot = slots.find((s) => s.productId === selectedProductId);
  const slotHolders = selectedSlot?.holders || [];
  const hasMultiHolder = slotHolders.length > 1;

  // Sum across all holders the reseller picked for this slot.
  const breakdownTotalGuests = hasMultiHolder
    ? slotHolders.reduce((sum, h) => sum + (holderQty[h.productId] || 0), 0)
    : numberOfGuests;
  const breakdownTotalPrice = hasMultiHolder
    ? slotHolders.reduce(
        (sum, h) => sum + (holderQty[h.productId] || 0) * h.priceEur,
        0,
      )
    : numberOfGuests * (selectedSlot?.priceEur || price);

  // -1 from Musement = unlimited; clamp to a sane UI upper bound
  const effectiveMax = selectedSlot
    ? selectedSlot.maxBuy === -1
      ? 500
      : selectedSlot.maxBuy
    : 500;
  const effectiveMin = selectedSlot?.minBuy ?? 1;
  const quantityOutOfRange = hasMultiHolder
    ? breakdownTotalGuests < 1 || breakdownTotalGuests > effectiveMax
    : !!selectedSlot &&
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
          // Honor ?groupId=... if it points to a real group (used by the
          // Group's Itinerary "Book →" so the right group is preselected
          // without the reseller having to pick it again).
          const preMatch = preGroupId ? list.find((g) => g.id === preGroupId) : null;
          const chosen = preMatch || list[0];
          setGroupId(chosen.id);
          if (chosen.number_of_guests) setNumberOfGuests(chosen.number_of_guests);
          if (chosen.travel_date) setScheduledDate(chosen.travel_date);
        }
      } catch {
        setError("Could not load groups — please try again.");
      }
    }
    void load();
  }, [preGroupId]);

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

  // Seed holder quantities when the reseller picks a slot. Strategy: if
  // the slot has multiple holders, put the entire group headcount on the
  // primary (ADULT) holder by default — reseller adjusts from there to
  // split into child/infant. For single-holder slots we leave holderQty
  // empty and the legacy numberOfGuests path stays in charge.
  useEffect(() => {
    if (!selectedSlot || !selectedSlot.holders || selectedSlot.holders.length <= 1) {
      setHolderQty({});
      return;
    }
    const seed: Record<string, number> = {};
    for (const h of selectedSlot.holders) {
      seed[h.productId] = h.isPrimary ? Math.max(1, numberOfGuests) : 0;
    }
    setHolderQty(seed);
    // Intentionally don't depend on numberOfGuests — once seeded we let
    // the reseller drive holder qty independently.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProductId]);

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
          netPrice: p?.pricing?.netPrice,
          retailPrice: p?.pricing?.retailPrice,
          marginPct: p?.pricing?.margin,
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

    // Multi-holder validation — at least one holder must have qty>0
    // and the sum must respect the slot's min/max.
    if (hasMultiHolder) {
      if (breakdownTotalGuests < 1) {
        return setError("Add at least one ticket (any holder type).");
      }
      if (breakdownTotalGuests > effectiveMax) {
        return setError(`This timeslot allows at most ${effectiveMax} tickets total.`);
      }
    } else {
      if (numberOfGuests < 1) return setError("Number of guests must be at least 1.");
      if (selectedSlot && numberOfGuests < effectiveMin) {
        return setError(`This timeslot requires at least ${effectiveMin} guests.`);
      }
      if (selectedSlot && numberOfGuests > effectiveMax) {
        return setError(`This timeslot allows at most ${effectiveMax} guests.`);
      }
    }

    // Build the breakdown payload only when meaningful — any holder with
    // qty>0 ends up as a row. Resellers booking a single-holder activity
    // skip this entirely so the legacy single-product path stays in use.
    const holderBreakdown = hasMultiHolder
      ? slotHolders
          .filter((h) => (holderQty[h.productId] || 0) > 0)
          .map((h) => ({
            code: h.code,
            name: h.name,
            qty: holderQty[h.productId],
            productId: h.productId,
            unitPrice: h.priceEur,
            currency: selectedSlot?.currency || "EUR",
          }))
      : null;

    const guestsToSend = hasMultiHolder ? breakdownTotalGuests : numberOfGuests;
    const unitPriceToSend = hasMultiHolder
      ? breakdownTotalGuests > 0
        ? Math.round((breakdownTotalPrice / breakdownTotalGuests) * 100) / 100
        : 0
      : price;

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
          numberOfGuests: guestsToSend,
          unitPrice: unitPriceToSend,
          notes: `Musement booking · activity ${activityUuid}`,
          musementActivityUuid: activityUuid,
          // Single-holder bookings save the product_id in musement_date_id
          // for back-compat. Multi-holder bookings leave it null and rely
          // on holderBreakdown[].productId in confirm-order.
          ...(selectedProductId && !hasMultiHolder && { musementDateId: selectedProductId }),
          ...(holderBreakdown && holderBreakdown.length > 0 && { holderBreakdown }),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Could not create booking");
      // Honor returnTo so the Group's Itinerary "Book →" round-trip drops
      // the reseller back on the itinerary card with the just-booked stop
      // already showing the green "✓ Booked" pill.
      router.push(returnTo || "/dashboard/bookings");
    } catch (e) {
      setError((e as Error).message);
      setSubmitting(false);
    }
  }

  const heroImages = (details?.images || []).filter((i) => i?.url);
  const rawHero = heroImages[activeImageIdx]?.url || heroImages[0]?.url;
  // Musement images-CDN supports ?w=NNN; bump hero to 1080px for sharpness,
  // keep thumbnails at the default (already 540px from the API response).
  const heroSrc = rawHero
    ? rawHero.replace(/([?&])w=\d+/, "$1w=1080") + (rawHero.includes("w=") ? "" : (rawHero.includes("?") ? "&w=1080" : "?w=1080"))
    : null;

  return (
    <div className="max-w-6xl mx-auto p-6">
      <button
        onClick={() => router.back()}
        className="mb-4 text-sm text-muted hover:text-foreground"
      >
        ← Back to Experiences
      </button>

      {/* Title + meta — Viator-style header above the hero */}
      <div className="mb-4">
        <span className="text-[10px] font-semibold tracking-wider uppercase text-orange-600">
          {source === "musement" ? "Musement" : source}
        </span>
        <h1 className="mt-1 text-2xl font-bold leading-tight">{title}</h1>
        {details && (details.rating || details.languages || details.duration) && (
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted">
            {details.rating && details.rating > 0 && (
              <span className="flex items-center gap-1 font-semibold text-foreground">
                <span className="text-amber-500">★</span>
                {details.rating.toFixed(1)}
                <span className="font-normal text-muted">({details.reviewCount ?? 0} reviews)</span>
              </span>
            )}
            {details.duration && <span>⏱ {details.duration}</span>}
            {details.languages && details.languages.length > 0 && (
              <span>🗣 {details.languages.slice(0, 4).join(", ").toUpperCase()}</span>
            )}
          </div>
        )}
      </div>

      {/* Two-column layout: rich content left, sticky booking + margin right.
          Stacks on mobile (lg breakpoint flips into the grid). */}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:items-start">
        <div className="min-w-0">
      {/* Hero image gallery — replaces the small ticket-emoji block. Falls
          back to a gradient placeholder when Musement returned no images. */}
      <div className="mb-6 overflow-hidden rounded-2xl border border-border/60 bg-white shadow-sm">
        <div className="relative aspect-[5/2] max-h-72 w-full bg-gradient-to-br from-orange-100 via-amber-50 to-white">
          {heroSrc ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={heroSrc}
              alt={title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="grid h-full place-items-center text-6xl">🎫</div>
          )}
          {price > 0 && (
            <div className="absolute right-4 top-4 rounded-full bg-black/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur">
              From {currency === "EUR" ? "€" : currency} {price.toFixed(2)} pp
            </div>
          )}
          {details?.cancellationPolicy === "Free cancellation" && (
            <div className="absolute left-4 top-4 rounded-full bg-emerald-600 px-3 py-1 text-xs font-semibold text-white">
              ✓ Free cancellation
            </div>
          )}
        </div>

        {/* Thumbnail strip when multiple images are returned (production mostly) */}
        {heroImages.length > 1 && (
          <div className="flex gap-2 overflow-x-auto p-3">
            {heroImages.slice(0, 8).map((img, i) => (
              <button
                key={img.url}
                type="button"
                onClick={() => setActiveImageIdx(i)}
                className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition-all ${
                  activeImageIdx === i ? "border-orange-500" : "border-transparent opacity-70 hover:opacity-100"
                }`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
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
                    <div
                      className="text-muted text-xs mt-1 [&>p]:my-1 [&_a]:underline [&_a]:text-accent"
                      dangerouslySetInnerHTML={{ __html: sanitizeMusementHtml(details.whereText) }}
                    />
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
                  <h3 className="text-xs font-bold uppercase tracking-wider text-muted/70 mb-2">Cancellation timeline</h3>
                  <div className="rounded-xl border border-border/60 bg-gradient-to-br from-emerald-50 via-white to-amber-50 p-4">
                    <div className="flex items-stretch gap-2">
                      {details.refundPolicies
                        .slice()
                        .sort((a, b) => (b.percentage ?? 0) - (a.percentage ?? 0))
                        .map((p, i) => {
                          const pct = p.percentage ?? 0;
                          const tone =
                            pct >= 100 ? "bg-emerald-500"
                            : pct >= 50 ? "bg-amber-500"
                            : "bg-rose-500";
                          const label =
                            pct >= 100 ? "Full refund"
                            : pct > 0 ? `${pct}% refund`
                            : "No refund";
                          return (
                            <div key={i} className="flex-1 min-w-0 text-center">
                              <div className={`mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-white ${tone}`}>
                                {pct}%
                              </div>
                              <div className="text-xs font-semibold text-foreground">{label}</div>
                              {p.period && (
                                <div className="mt-0.5 text-[10px] text-muted leading-tight">
                                  {p.period}
                                </div>
                              )}
                              {p.applicableUntil && (
                                <div className="mt-0.5 text-[10px] text-muted leading-tight">
                                  until {p.applicableUntil}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                    <p className="mt-3 text-[11px] text-muted/80">
                      Help your customer pick a flexible date — the further out they book, the more refundable.
                    </p>
                  </div>
                </section>
              )}
            </div>
          )}
        </div>
      )}

        </div>{/* /left column */}

        {/* Right column: sticky booking + margin (stacks on mobile) */}
        <div className="lg:sticky lg:top-6 space-y-6">
      {/* Reseller margin preview — what the booker actually keeps. Shown
          even when Musement hasn't returned a real net_price (sandbox /
          affiliate tier) — we synthesise an 18% industry-standard margin
          and flag the row so we can swap to real numbers in production. */}
      {details && details.retailPrice && details.retailPrice > 0 && details.marginPct !== undefined && (
        (() => {
          const retail = details.retailPrice;
          const net = details.netPrice ?? retail;
          const earningsPP = retail - net;
          const isAssumed = !details.netPrice || details.netPrice >= retail;
          const guestCount = Math.max(1, numberOfGuests || 1);
          const totalEarnings = earningsPP * guestCount;
          return (
            <div className="mb-6 rounded-2xl border border-emerald-200/60 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                      💰 You earn
                    </span>
                    {isAssumed && (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-700" title="Estimated using a 18% industry-standard reseller margin. Real net prices appear once production credentials are active.">
                        estimate · 18%
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-emerald-700">
                      €{earningsPP.toFixed(2)}
                    </span>
                    <span className="text-sm text-muted">per person</span>
                  </div>
                  {guestCount > 1 && (
                    <div className="mt-1 text-sm text-foreground/80">
                      × {guestCount} guests = <strong className="text-emerald-700">€{totalEarnings.toFixed(2)}</strong> total
                    </div>
                  )}
                </div>
                <div className="text-right text-xs text-muted">
                  <div>Retail price <strong className="text-foreground">€{retail.toFixed(2)}</strong></div>
                  <div>Your cost <strong className="text-foreground">€{net.toFixed(2)}</strong></div>
                  <div className="mt-0.5 text-emerald-700 font-semibold">{details.marginPct.toFixed(0)}% margin</div>
                </div>
              </div>
            </div>
          );
        })()
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

        {/* Guests — single quantity for activities with one holder type,
            per-holder steppers when the slot exposes Adult/Child/Infant/etc. */}
        {hasMultiHolder ? (
          <div className="block mb-4">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">Tickets per type</span>
            <div className="mt-1.5 space-y-2">
              {slotHolders.map((h) => {
                const qty = holderQty[h.productId] || 0;
                const max = h.maxBuy === -1 ? 500 : h.maxBuy;
                return (
                  <div
                    key={h.productId}
                    className="flex items-center gap-3 rounded-xl border border-border bg-white p-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold">{h.name}</div>
                      <div className="text-[11px] text-muted">
                        {h.priceEur === 0
                          ? "Free"
                          : `${selectedSlot?.currency === "EUR" ? "€" : selectedSlot?.currency} ${h.priceEur.toFixed(2)} each`}
                        {h.code && h.code !== h.name && ` · ${h.code}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setHolderQty((q) => ({
                            ...q,
                            [h.productId]: Math.max(0, (q[h.productId] || 0) - 1),
                          }))
                        }
                        disabled={qty <= 0}
                        className="h-8 w-8 rounded-full border border-border text-base font-bold disabled:opacity-40"
                        aria-label={`Decrease ${h.name}`}
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setHolderQty((q) => ({
                            ...q,
                            [h.productId]: Math.min(max, (q[h.productId] || 0) + 1),
                          }))
                        }
                        disabled={qty >= max}
                        className="h-8 w-8 rounded-full border border-border text-base font-bold disabled:opacity-40"
                        aria-label={`Increase ${h.name}`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-1 text-[11px] text-muted">
              Total: <span className="font-semibold text-foreground">{breakdownTotalGuests}</span>
              {breakdownTotalGuests > 0 && selectedSlot && (
                <>
                  {" · "}
                  {selectedSlot.currency === "EUR" ? "€" : selectedSlot.currency}{" "}
                  {breakdownTotalPrice.toFixed(2)}
                </>
              )}
            </p>
          </div>
        ) : (
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
        )}

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
        {(price > 0 || hasMultiHolder) && (
          <div className="mb-6 rounded-xl bg-gray-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Indicative total</span>
              <span className="font-semibold">
                {(selectedSlot?.currency || currency) === "EUR"
                  ? "€"
                  : selectedSlot?.currency || currency}{" "}
                {(hasMultiHolder ? breakdownTotalPrice : price * numberOfGuests).toFixed(2)}
              </span>
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
        </div>{/* /right column */}
      </div>{/* /grid */}
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
