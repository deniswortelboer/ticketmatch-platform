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
        setError("Kon groepen niet laden — probeer opnieuw.");
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

  async function submit() {
    if (!groupId) return setError("Kies eerst een groep.");
    if (numberOfGuests < 1) return setError("Aantal gasten moet minstens 1 zijn.");
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
          // musementDateId wordt later gevuld bij confirm-order step
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Booking aanmaken mislukt");
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
        ← Terug naar Experiences
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
                Vanaf <strong className="text-foreground">{currency === "EUR" ? "€" : currency} {price.toFixed(2)}</strong> per persoon
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Booking form */}
      <div className="rounded-2xl border border-border/60 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">Boek voor een groep</h2>

        {/* Group */}
        <label className="block mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">Groep</span>
          {groups.length === 0 ? (
            <p className="mt-2 text-sm text-muted">
              Je hebt nog geen groepen — maak er eerst eentje aan op{" "}
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
                  {g.name} {g.number_of_guests ? `(${g.number_of_guests} gasten)` : ""}
                </option>
              ))}
            </select>
          )}
        </label>

        {/* Guests */}
        <label className="block mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">Aantal gasten</span>
          <input
            type="number"
            min={1}
            max={500}
            value={numberOfGuests}
            onChange={(e) => setNumberOfGuests(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
            className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-4 text-sm"
          />
        </label>

        {/* Date */}
        <label className="block mb-6">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted/70">Reisdatum (optioneel)</span>
          <input
            type="date"
            value={scheduledDate}
            onChange={(e) => setScheduledDate(e.target.value)}
            className="mt-1.5 h-11 w-full rounded-xl border border-border bg-white px-4 text-sm"
          />
          <p className="text-xs text-muted mt-1">
            Laat leeg als je de exacte datum bij invoicing oppakt. Musement beschikbaarheid wordt later gecheckt.
          </p>
        </label>

        {/* Total */}
        {price > 0 && (
          <div className="mb-6 rounded-xl bg-gray-50 p-4 text-sm">
            <div className="flex justify-between">
              <span className="text-muted">Indicatieprijs</span>
              <span>{currency === "EUR" ? "€" : currency} {(price * numberOfGuests).toFixed(2)}</span>
            </div>
            <p className="text-xs text-muted mt-1">
              Definitieve prijs wordt bij de invoice bepaald op basis van Musement beschikbaarheid.
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
            Annuleer
          </button>
          <button
            onClick={submit}
            disabled={submitting || !groupId}
            className="flex-1 rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white disabled:opacity-60"
          >
            {submitting ? "Bezig..." : "Pending booking aanmaken"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function NewBookingPage() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted">Laden…</div>}>
      <NewBookingForm />
    </Suspense>
  );
}
