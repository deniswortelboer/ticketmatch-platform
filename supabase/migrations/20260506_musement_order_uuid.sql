-- 2026-05-06 — store the Musement order UUID alongside the human MUS… identifier.
--
-- The Musement Partner API has TWO order references:
--   - identifier  ("MUS1334720")    — human-readable, surfaced in Telegram/email
--   - uuid        (random hex UUID) — required by /orders/{id}, /payments/no/payment,
--                                     /orders/{id}/items/{itemId}/refund-policies, …
--
-- Looking up by identifier returns HTTP 404 in sandbox, so we must capture the
-- UUID at order-placement time and use it for every subsequent API call.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS musement_order_uuid TEXT;

COMMENT ON COLUMN bookings.musement_order_uuid IS
  'Internal Musement order UUID. Required by /orders/{id}* endpoints; cannot be looked up retroactively from the human MUS… identifier.';
