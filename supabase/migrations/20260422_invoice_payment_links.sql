-- ═══════════════════════════════════════════════════════════════════
-- Invoice Payment Links — 2026-04-22
-- ═══════════════════════════════════════════════════════════════════
-- Persists the Stripe Checkout Session URL alongside the invoice
-- number so the branded /pay/[invoice] redirect can look it up from
-- the DB instead of calling Stripe's Search API (which is not
-- available for Checkout Sessions in any SDK version).
--
-- One row per generated invoice. Bookings referenced by ID list.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS invoices (
  invoice_number       TEXT PRIMARY KEY,
  company_id           UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  group_id             UUID REFERENCES groups(id) ON DELETE SET NULL,
  booking_ids          UUID[] NOT NULL DEFAULT '{}',
  stripe_session_id    TEXT NOT NULL,
  stripe_session_url   TEXT NOT NULL,
  grand_total          NUMERIC(12,2),
  status               TEXT NOT NULL DEFAULT 'open'
                        CHECK (status IN ('open','paid','expired','cancelled')),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  paid_at              TIMESTAMPTZ,
  -- Stripe Checkout Sessions expire after 24h by default
  expires_at           TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '24 hours')
);

CREATE INDEX IF NOT EXISTS invoices_company_id_idx ON invoices (company_id);
CREATE INDEX IF NOT EXISTS invoices_stripe_session_id_idx ON invoices (stripe_session_id);

-- ═══════════════════════════════════════════════════════════════════
-- Row-Level Security
-- ═══════════════════════════════════════════════════════════════════
-- Same pattern as bookings/groups: visible to users within the same
-- company. Service role bypasses RLS for the public /pay/[invoice]
-- redirect (which has no authenticated user).
-- ═══════════════════════════════════════════════════════════════════
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "invoices_all_own_company" ON invoices;
CREATE POLICY "invoices_all_own_company" ON invoices
  FOR ALL
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ═══════════════════════════════════════════════════════════════════
-- Verification:
--   SELECT invoice_number, stripe_session_id, status, expires_at
--   FROM invoices ORDER BY created_at DESC LIMIT 5;
-- ═══════════════════════════════════════════════════════════════════
