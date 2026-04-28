-- ═══════════════════════════════════════════════════════════════════
-- Refund status column — 2026-04-28
-- ═══════════════════════════════════════════════════════════════════
-- Tracks the customer-money side of a cancelled booking. Distinct from
-- bookings.status (which says whether the booking is active/cancelled)
-- because a Musement-cancelled booking can still leave the customer
-- charged if the refund-policy window had expired or if the Stripe
-- refund leg failed.
--
-- Values:
--   NULL            → not applicable (booking active or never paid)
--   "none"          → Musement cancelled but no refund issued (policy
--                     window closed, customer charge stands)
--   "supplier_only" → Musement refunded supplier side but Stripe
--                     refund failed → admin must fix manually
--   "refunded"      → Musement + Stripe both refunded → customer is whole
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS refund_status TEXT
    CHECK (refund_status IS NULL OR refund_status IN ('none', 'supplier_only', 'refunded'));

CREATE INDEX IF NOT EXISTS idx_bookings_refund_status
  ON bookings (refund_status)
  WHERE refund_status IS NOT NULL;

-- ═══════════════════════════════════════════════════════════════════
-- Verification:
--   SELECT refund_status, COUNT(*) FROM bookings
--   WHERE status = 'cancelled' GROUP BY refund_status;
-- ═══════════════════════════════════════════════════════════════════
