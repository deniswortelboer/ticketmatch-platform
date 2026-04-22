-- ═══════════════════════════════════════════════════════════════════
-- Ticket Delivery — 2026-04-22
-- ═══════════════════════════════════════════════════════════════════
-- Adds per-booking ticket delivery capability:
--   - access_token: unique opaque token used in /t/[token] URLs
--   - tickets:      JSONB array of QR codes + per-guest metadata
--   - delivered_at: timestamp of first successful delivery
--   - delivery_channels: text array of channels used (email/whatsapp/telegram)
-- Also adds branding fields on companies for co-branded tickets.
-- ═══════════════════════════════════════════════════════════════════

-- ── bookings: ticket delivery columns ───────────────────────────
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS access_token      TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS tickets           JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS delivered_at      TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS delivery_channels TEXT[] DEFAULT '{}';

CREATE INDEX IF NOT EXISTS bookings_access_token_idx ON bookings (access_token);

-- ── companies: branding for co-branded tickets ──────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS branding_mode   TEXT DEFAULT 'co_branded'
    CHECK (branding_mode IN ('white_label_light','co_branded','full_managed')),
  ADD COLUMN IF NOT EXISTS logo_url        TEXT,
  ADD COLUMN IF NOT EXISTS primary_color   TEXT DEFAULT '#0369a1',
  ADD COLUMN IF NOT EXISTS support_email   TEXT,
  ADD COLUMN IF NOT EXISTS support_phone   TEXT;

-- ── Backfill access_token for existing bookings ─────────────────
-- Use substring of a UUID for uniqueness (24 chars, URL-safe alphanum).
UPDATE bookings
SET access_token = REPLACE(gen_random_uuid()::text, '-', '') || REPLACE(gen_random_uuid()::text, '-', '')
WHERE access_token IS NULL;

-- Now enforce NOT NULL
ALTER TABLE bookings
  ALTER COLUMN access_token SET NOT NULL;

-- ═══════════════════════════════════════════════════════════════════
-- Verification queries (run these to confirm):
--   SELECT id, access_token, tickets, delivered_at, delivery_channels
--   FROM bookings LIMIT 5;
--
--   SELECT id, name, branding_mode, logo_url
--   FROM companies LIMIT 5;
-- ═══════════════════════════════════════════════════════════════════
