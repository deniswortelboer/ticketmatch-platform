-- ═══════════════════════════════════════════════════════════════════
-- Musement link — 2026-04-22
-- ═══════════════════════════════════════════════════════════════════
-- Links TicketMatch bookings to Musement orders.
-- Required to place real Musement orders after internal booking creation.
--
--   musement_activity_uuid: the Musement product UUID (from their catalog)
--   musement_date_id:       the specific date/time slot identifier
--   musement_order_id:      returned by Musement after confirmOrder()
--   musement_status:        'not_ordered' | 'placing' | 'confirmed' | 'failed'
-- ═══════════════════════════════════════════════════════════════════

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS musement_activity_uuid TEXT,
  ADD COLUMN IF NOT EXISTS musement_date_id       TEXT,
  ADD COLUMN IF NOT EXISTS musement_order_id      TEXT,
  ADD COLUMN IF NOT EXISTS musement_status        TEXT DEFAULT 'not_ordered'
    CHECK (musement_status IN ('not_ordered','placing','confirmed','failed'));

CREATE INDEX IF NOT EXISTS bookings_musement_status_idx ON bookings (musement_status);

-- ═══════════════════════════════════════════════════════════════════
-- Verification:
--   SELECT id, venue_name, status, musement_status, musement_order_id
--   FROM bookings LIMIT 5;
-- ═══════════════════════════════════════════════════════════════════
