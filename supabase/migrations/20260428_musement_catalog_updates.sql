-- ═══════════════════════════════════════════════════════════════════
-- Musement catalog-update tracking — 2026-04-28
-- ═══════════════════════════════════════════════════════════════════
-- Musement has no push channel for catalog changes — we must poll
-- /catalog/updates/{date} ourselves (per their docs). This table stores
-- the daily diff so cache-invalidation, sitemap regen, and any future
-- re-sync logic have a queryable source.
--
-- One row per (activity_uuid, batch_date). Re-running the daily sync
-- is idempotent — same upsert key.
-- ═══════════════════════════════════════════════════════════════════

CREATE TABLE IF NOT EXISTS musement_catalog_updates (
  activity_uuid TEXT NOT NULL,
  batch_date DATE NOT NULL,
  musement_updated_at TIMESTAMPTZ,
  musement_status TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (activity_uuid, batch_date)
);

CREATE INDEX IF NOT EXISTS idx_musement_catalog_updates_date
  ON musement_catalog_updates (batch_date);

ALTER TABLE musement_catalog_updates ENABLE ROW LEVEL SECURITY;
