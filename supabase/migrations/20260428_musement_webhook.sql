-- ═══════════════════════════════════════════════════════════════════
-- Musement webhook event log — 2026-04-28
-- ═══════════════════════════════════════════════════════════════════
-- Stores every webhook event Musement pushes us. Primary key on
-- (order_uuid, order_item_uuid, order_item_version) gives us atomic
-- idempotency: ON CONFLICT DO NOTHING means a replayed webhook is a
-- no-op without any application-level race window.
--
-- We keep the raw payload for debugging + a processed_at timestamp so
-- ops can spot stuck events.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS musement_webhook_events (
  -- Identity
  order_uuid TEXT NOT NULL,
  order_item_uuid TEXT NOT NULL,
  order_item_version INT NOT NULL,
  -- Event payload
  order_id TEXT,
  order_version INT,
  order_item_status TEXT NOT NULL,
  raw JSONB NOT NULL,
  -- Lifecycle
  received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  process_error TEXT,
  -- Idempotency key
  PRIMARY KEY (order_uuid, order_item_uuid, order_item_version)
);

-- Index for ops queries: "show me everything that hasn't been processed"
CREATE INDEX IF NOT EXISTS idx_musement_webhook_unprocessed
  ON musement_webhook_events (received_at)
  WHERE processed_at IS NULL;

-- RLS: only service-role reads/writes. End-users have no business here.
ALTER TABLE musement_webhook_events ENABLE ROW LEVEL SECURITY;

-- ═══════════════════════════════════════════════════════════════════
-- Verification:
--   SELECT order_item_status, COUNT(*) FROM musement_webhook_events
--   GROUP BY order_item_status;
-- ═══════════════════════════════════════════════════════════════════
