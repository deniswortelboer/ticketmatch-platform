"use client";

/**
 * ViatorBookingModal — full 4-step in-platform booking flow for Viator TAP /
 * Affiliate Full + Booking Access. Mirrors the agent-portal flow we observed
 * on travelagents.viator.com so resellers (W69 + others) feel at home.
 *
 * Flow:
 *   1) Slot         — date + time + travelers count
 *   2) Travelers    — lead + companions form
 *   3) Review       — calls /api/viator/book/hold; shows price + commission
 *   4) Confirm      — calls /api/viator/book/confirm; shows voucher + ref
 *
 * Today the booking goes through mock-mode (lib/viator.ts isViatorTapLive()
 * returns false). Once Carmen approves Affiliate Full + Booking Access on
 * P00300314 and we set VIATOR_TAP_LIVE=true, the same UI calls the real
 * Viator partner API with zero changes here.
 */

import { useEffect, useState } from "react";

// ─── Types ──────────────────────────────────────────────────────────────────

export type ViatorModalProduct = {
  /** Viator productCode, e.g. "8718P4" */
  id: string;
  title: string;
  imageUrl?: string;
  currency: string;
  /** Per-person retail price for display before hold response lands. */
  pricePerPerson: number;
  location?: { city?: string; country?: string };
};

type ViatorBookingHoldResponse = {
  holdRef: string;
  expiresAt: string;
  pricing: {
    currency: string;
    retailPrice: number;
    commissionAmount: number;
    commissionRate: number;
  };
  cancellationPolicy: { freeUntil?: string; summary: string };
  voucherRequirements: string[];
  mock?: boolean;
};

type ViatorBookingConfirmResponse = {
  bookingRef: string;
  status: "CONFIRMED" | "PENDING" | "AWAITING_SUPPLIER";
  voucher: {
    url: string;
    barcode?: string;
    deliveryEmail: string;
  };
  pricing: ViatorBookingHoldResponse["pricing"];
  commissionPayout: {
    expectedAt: string;
    status: "PENDING_TRAVEL" | "PAYABLE" | "PAID";
  };
  mock?: boolean;
};

type Traveller = {
  bandId: "ADULT" | "CHILD";
  firstName: string;
  lastName: string;
  // Lead-only fields:
  email?: string;
  phone?: string;
};

type Props = {
  product: ViatorModalProduct | null;
  /** Agent identifier used by Viator for commission attribution. */
  agentUserRef: string;
  isOpen: boolean;
  onClose: () => void;
};

const TIME_SLOTS = ["09:30", "10:30", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

// ─── Component ──────────────────────────────────────────────────────────────

export function ViatorBookingModal({ product, agentUserRef, isOpen, onClose }: Props) {
  // 4-step machine: 1 = slot, 2 = travelers, 3 = review, 4 = confirm
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  // Step 1 state
  const [travelDate, setTravelDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().slice(0, 10);
  });
  const [startTime, setStartTime] = useState("09:30");
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  // Step 2 state — auto-resized to match adults+children
  const [travellers, setTravellers] = useState<Traveller[]>([
    { bandId: "ADULT", firstName: "", lastName: "", email: "", phone: "" },
    { bandId: "ADULT", firstName: "", lastName: "" },
  ]);
  const [notes, setNotes] = useState("");
  // Hold + confirm responses
  const [hold, setHold] = useState<ViatorBookingHoldResponse | null>(null);
  const [confirm, setConfirm] = useState<ViatorBookingConfirmResponse | null>(null);
  // Async UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  // Re-shape travellers array when counts change so Step 2 has the right slots.
  useEffect(() => {
    const want: Traveller[] = [];
    for (let i = 0; i < adults; i++) {
      want.push(travellers[i]?.bandId === "ADULT"
        ? travellers[i]
        : { bandId: "ADULT", firstName: "", lastName: "", ...(i === 0 ? { email: "", phone: "" } : {}) });
    }
    for (let i = 0; i < children; i++) {
      const idx = adults + i;
      want.push(travellers[idx]?.bandId === "CHILD"
        ? travellers[idx]
        : { bandId: "CHILD", firstName: "", lastName: "" });
    }
    // Only update if the lengths or types changed (avoid a render loop on
    // every keystroke — useEffect deps below cover the count changes).
    if (want.length !== travellers.length) setTravellers(want);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [adults, children]);

  // Reset everything when the modal closes so the next open is fresh.
  useEffect(() => {
    if (!isOpen) {
      setStep(1);
      setHold(null);
      setConfirm(null);
      setError("");
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen || !product) return null;

  const totalTravellers = adults + children;

  // ─── Step transitions ────────────────────────────────────────────────────

  async function goToReview() {
    setError("");
    // Quick traveller validation — first traveller must be complete (lead).
    if (!travellers[0]?.firstName || !travellers[0]?.lastName || !travellers[0]?.email) {
      setError("Please complete the lead traveller's name and email.");
      return;
    }
    setStep(3);
    setLoading(true);
    try {
      const idempotencyKey = `tm-${product.id}-${travelDate}-${startTime}-${Date.now()}`;
      const res = await fetch("/api/viator/book/hold", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productCode: product.id,
          travelDate,
          startTime,
          travellers: travellers.map((t) => ({
            bandId: t.bandId,
            firstName: t.firstName,
            lastName: t.lastName,
          })),
          agentUserRef,
          idempotencyKey,
          bookingQuestionAnswers: notes ? [{ question: "Notes", answer: notes }] : undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as Record<string, unknown>));
        throw new Error((body.error as string) || `Hold failed (${res.status})`);
      }
      const data = (await res.json()) as ViatorBookingHoldResponse;
      setHold(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Hold failed.");
    } finally {
      setLoading(false);
    }
  }

  async function confirmBooking() {
    if (!hold) return;
    setError("");
    setLoading(true);
    setStep(4);
    try {
      const res = await fetch("/api/viator/book/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          holdRef: hold.holdRef,
          // Mock token until live — real flow uses the token from Viator's
          // embedded payment widget callback.
          paymentToken: "mock_payment_token",
          agentNotes: notes,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({} as Record<string, unknown>));
        throw new Error((body.error as string) || `Confirm failed (${res.status})`);
      }
      const data = (await res.json()) as ViatorBookingConfirmResponse;
      setConfirm(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Confirm failed.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="relative max-h-[92vh] w-full max-w-4xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col">

        {/* Header */}
        <div className="flex items-center justify-between bg-[#0F4A4C] px-6 py-4 text-white">
          <div className="min-w-0 flex-1">
            <div className="text-sm font-semibold truncate">{product.title}</div>
            <div className="text-xs opacity-75">via Viator TAP · Booked through TicketMatch.ai</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded bg-yellow-400 px-2 py-1 text-[10px] font-bold text-yellow-900">
              {hold?.mock || confirm?.mock ? "MOCK MODE" : "TAP · 10% BOOST"}
            </span>
            <button onClick={onClose} className="text-white/80 hover:text-white text-xl leading-none">×</button>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex border-b border-gray-200 bg-gray-50 px-6 py-3 text-xs">
          {([
            [1, "Slot"],
            [2, "Travelers"],
            [3, "Review"],
            [4, "Confirm"],
          ] as const).map(([n, label], idx, arr) => {
            const isActive = step === n;
            const isDone = step > n;
            return (
              <div key={n} className="flex flex-1 items-center gap-2">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                    isDone ? "bg-green-500 text-white" : isActive ? "bg-[#0F4A4C] text-white" : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {isDone ? "✓" : n}
                </div>
                <span className={isActive ? "font-semibold text-[#0F4A4C]" : isDone ? "text-green-600" : "text-gray-500"}>
                  {label}
                </span>
                {idx < arr.length - 1 && <div className="ml-auto text-gray-300">→</div>}
              </div>
            );
          })}
        </div>

        {/* Body */}
        <div className="grid flex-1 grid-cols-1 gap-0 overflow-y-auto md:grid-cols-[2fr_1fr]">
          {/* Main column */}
          <div className="border-b border-gray-200 p-6 md:border-b-0 md:border-r">
            {step === 1 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Pick a slot</h3>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Travel date</label>
                  <input
                    type="date"
                    value={travelDate}
                    onChange={(e) => setTravelDate(e.target.value)}
                    min={new Date().toISOString().slice(0, 10)}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Time slot</label>
                  <div className="grid grid-cols-4 gap-2">
                    {TIME_SLOTS.map((t) => (
                      <button
                        key={t}
                        onClick={() => setStartTime(t)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium ${
                          startTime === t ? "border-[#0F4A4C] bg-[#0F4A4C] text-white" : "border-gray-300 bg-white text-gray-700 hover:border-[#0F4A4C]"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Adults</label>
                    <select
                      value={adults}
                      onChange={(e) => setAdults(parseInt(e.target.value, 10))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Children</label>
                    <select
                      value={children}
                      onChange={(e) => setChildren(parseInt(e.target.value, 10))}
                      className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                    >
                      {[0, 1, 2, 3, 4].map((n) => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
                  💡 ~30 min hold will reserve the slot once you continue. You won&apos;t be charged until you confirm.
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Traveler details</h3>
                {travellers.map((t, i) => (
                  <div key={i} className="rounded-lg bg-gray-50 p-3">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-semibold text-gray-700">
                        {i === 0 ? "Lead traveler" : `Traveler ${i + 1}`} · {t.bandId === "CHILD" ? "Child" : "Adult"}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        placeholder="First name"
                        value={t.firstName}
                        onChange={(e) => {
                          const next = [...travellers];
                          next[i] = { ...next[i], firstName: e.target.value };
                          setTravellers(next);
                        }}
                        className="rounded border border-gray-300 px-3 py-2 text-sm"
                      />
                      <input
                        placeholder="Last name"
                        value={t.lastName}
                        onChange={(e) => {
                          const next = [...travellers];
                          next[i] = { ...next[i], lastName: e.target.value };
                          setTravellers(next);
                        }}
                        className="rounded border border-gray-300 px-3 py-2 text-sm"
                      />
                      {i === 0 && (
                        <>
                          <input
                            placeholder="Email"
                            type="email"
                            value={t.email || ""}
                            onChange={(e) => {
                              const next = [...travellers];
                              next[i] = { ...next[i], email: e.target.value };
                              setTravellers(next);
                            }}
                            className="rounded border border-gray-300 px-3 py-2 text-sm col-span-2"
                          />
                          <input
                            placeholder="Phone (optional)"
                            value={t.phone || ""}
                            onChange={(e) => {
                              const next = [...travellers];
                              next[i] = { ...next[i], phone: e.target.value };
                              setTravellers(next);
                            }}
                            className="rounded border border-gray-300 px-3 py-2 text-sm col-span-2"
                          />
                        </>
                      )}
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Notes for the guide (optional)</label>
                  <textarea
                    placeholder="E.g. Dutch-speaking guide preferred"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Review &amp; confirm</h3>
                {loading && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                    Reserving your slot with Viator...
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>
                )}
                {hold && !loading && !error && (
                  <>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-900">
                      ✅ Slot reserved. Hold expires{" "}
                      <strong>{new Date(hold.expiresAt).toLocaleString("nl-NL", { dateStyle: "short", timeStyle: "short" })}</strong>
                      {hold.mock && <span className="ml-2 rounded bg-yellow-200 px-2 py-0.5 text-xs">MOCK</span>}
                    </div>
                    <div className="rounded-lg bg-gray-50 p-3 text-sm">
                      <div className="font-semibold mb-2">Travelers</div>
                      {travellers.map((t, i) => (
                        <div key={i} className="text-gray-700">
                          {i + 1}. {t.firstName} {t.lastName} ({t.bandId === "CHILD" ? "Child" : "Adult"})
                          {t.email && <span className="ml-2 text-gray-500">— {t.email}</span>}
                        </div>
                      ))}
                    </div>
                    <div className="rounded-lg bg-yellow-50 p-3 text-xs text-yellow-900">
                      ⚠️ In live mode the customer pays via Viator&apos;s embedded payment widget. In mock mode we skip
                      payment and confirm directly so you can see the flow end-to-end.
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1">Cancellation policy</div>
                      <div className="text-sm text-gray-800">{hold.cancellationPolicy.summary}</div>
                    </div>
                  </>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900">Booking confirmation</h3>
                {loading && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
                    Confirming booking with Viator...
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-900">{error}</div>
                )}
                {confirm && !loading && !error && (
                  <>
                    <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                      <div className="text-2xl font-bold text-green-700 mb-1">🎉 Booked!</div>
                      <div className="text-sm text-green-900">Booking reference: <strong>{confirm.bookingRef}</strong></div>
                      <div className="text-xs text-green-700 mt-1">Status: {confirm.status}</div>
                      {confirm.mock && (
                        <div className="mt-2 inline-block rounded bg-yellow-200 px-2 py-0.5 text-[10px] font-bold text-yellow-900">
                          MOCK MODE — no real booking created
                        </div>
                      )}
                    </div>
                    <div className="rounded-lg border border-gray-200 p-4 text-sm">
                      <div className="font-semibold mb-2">Voucher</div>
                      <div className="text-gray-700 mb-1">📧 Sent to: <strong>{confirm.voucher.deliveryEmail}</strong></div>
                      <div className="text-gray-700 mb-2">🎫 Booking ref: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{confirm.voucher.barcode}</code></div>
                      <a
                        href={confirm.voucher.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block rounded-lg bg-[#0F4A4C] px-4 py-2 text-xs font-semibold text-white hover:bg-[#186B6D]"
                      >
                        Download voucher PDF →
                      </a>
                    </div>
                    <div className="rounded-lg bg-blue-50 p-3 text-xs text-blue-900">
                      💰 Commission of <strong>{confirm.pricing.currency} {confirm.pricing.commissionAmount.toFixed(2)}</strong>
                      {" "}will be paid out around{" "}
                      <strong>
                        {new Date(confirm.commissionPayout.expectedAt).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" })}
                      </strong>
                      {" "}(after travel completion).
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Summary sidebar */}
          <div className="bg-gray-50 p-6">
            <h4 className="text-xs font-semibold uppercase text-gray-500 mb-3">Booking summary</h4>
            <div className="rounded-lg bg-white p-3 mb-3">
              <div className="text-sm font-semibold text-gray-900 mb-1 line-clamp-2">{product.title}</div>
              <div className="text-xs text-gray-500">
                {product.location?.city || ""}{product.location?.country ? `, ${product.location.country}` : ""}
              </div>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-700">
                <span>Date</span>
                <span className="font-medium">{travelDate}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Time</span>
                <span className="font-medium">{startTime}</span>
              </div>
              <div className="flex justify-between text-gray-700">
                <span>Travelers</span>
                <span className="font-medium">{adults} adult{adults !== 1 ? "s" : ""}{children > 0 ? `, ${children} child${children !== 1 ? "ren" : ""}` : ""}</span>
              </div>
              <hr className="border-gray-200 my-2" />
              {hold ? (
                <>
                  <div className="flex justify-between text-gray-700">
                    <span>Retail</span>
                    <span className="font-semibold">{hold.pricing.currency} {hold.pricing.retailPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-green-700 font-semibold">
                    <span>Your commission ({(hold.pricing.commissionRate * 100).toFixed(0)}%)</span>
                    <span>+ {hold.pricing.currency} {hold.pricing.commissionAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-900 font-bold pt-2 border-t border-gray-200">
                    <span>Customer pays</span>
                    <span>{hold.pricing.currency} {hold.pricing.retailPrice.toFixed(2)}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between text-gray-700">
                    <span>Estimated total</span>
                    <span className="font-semibold">
                      {product.currency} {(product.pricePerPerson * totalTravellers).toFixed(2)}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500 italic">Final price + commission shown after slot reservation.</div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer / actions */}
        <div className="flex items-center justify-between border-t border-gray-200 bg-gray-50 px-6 py-4">
          <button
            onClick={() => {
              if (step === 1 || step === 4) {
                onClose();
              } else if (step === 2) {
                setStep(1);
              } else if (step === 3) {
                setStep(2);
                setHold(null);
              }
            }}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
          >
            {step === 1 ? "Cancel" : step === 4 ? "Close" : "← Back"}
          </button>
          {step === 1 && (
            <button
              onClick={() => setStep(2)}
              className="rounded-lg bg-[#0F4A4C] px-6 py-2 text-sm font-semibold text-white hover:bg-[#186B6D]"
            >
              Next: Traveler details →
            </button>
          )}
          {step === 2 && (
            <button
              onClick={goToReview}
              className="rounded-lg bg-[#0F4A4C] px-6 py-2 text-sm font-semibold text-white hover:bg-[#186B6D]"
            >
              Reserve slot →
            </button>
          )}
          {step === 3 && hold && !loading && !error && (
            <button
              onClick={confirmBooking}
              className="rounded-lg bg-green-600 px-6 py-2 text-sm font-semibold text-white hover:bg-green-700"
            >
              Confirm &amp; book →
            </button>
          )}
          {step === 4 && confirm && (
            <button
              onClick={onClose}
              className="rounded-lg bg-[#0F4A4C] px-6 py-2 text-sm font-semibold text-white hover:bg-[#186B6D]"
            >
              Done
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
