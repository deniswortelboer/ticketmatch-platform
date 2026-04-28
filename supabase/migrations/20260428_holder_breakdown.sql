-- ═══════════════════════════════════════════════════════════════════
-- Holder breakdown — 2026-04-28
-- ═══════════════════════════════════════════════════════════════════
-- Adds per-holder pricing to bookings so a single booking can carry
-- e.g. "2 ADULT @ €40 + 1 CHILD @ €20" instead of one flat price.
--
-- Shape:
--   [
--     { "code": "ADULT", "qty": 2, "product_id": "4445382656",
--       "unit_price": 40.0, "currency": "EUR", "name": "Adult" },
--     { "code": "CHILD", "qty": 1, "product_id": "4445382657",
--       "unit_price": 20.0, "currency": "EUR", "name": "Child" }
--   ]
--
-- The legacy single-product fields stay populated for backwards-compat:
--   number_of_guests = SUM(qty)
--   total_price      = SUM(qty * unit_price)
--   unit_price       = total_price / number_of_guests  (display average)
--   musement_date_id = NULL when breakdown is set; confirm-order reads
--                      product_ids straight from breakdown[].product_id
--
-- Bookings created before this migration keep holder_breakdown = NULL
-- and continue to flow through the old single-product code path.
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS holder_breakdown JSONB;

-- ═══════════════════════════════════════════════════════════════════
-- Verification:
--   SELECT id, venue_name, number_of_guests, total_price, holder_breakdown
--   FROM bookings WHERE holder_breakdown IS NOT NULL LIMIT 5;
-- ═══════════════════════════════════════════════════════════════════
