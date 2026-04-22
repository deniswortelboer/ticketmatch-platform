-- ═══════════════════════════════════════════════════════════════════
-- Row-Level Security (RLS) — 2026-04-22
-- ═══════════════════════════════════════════════════════════════════
-- Enable RLS and policies on all public tables used by the dashboard
-- and the B2B acquisition pipeline.
--
-- Pattern: a row is visible to a user iff that user's profile shares
-- the row's company_id. Profiles themselves allow self-read + teammate
-- read within the same company. Prospects (B2B acquisition pipeline)
-- are service-role only.
--
-- Public customer pages (/t/[token], /p/[token]) use the service role
-- key which bypasses RLS — no impact on customer flows.
--
-- Also resolves the Supabase Security Advisor findings:
--   - 2 errors on knowledge_base (RLS disabled w/ policies)
--   - 4 warnings (search_path mutable; USING(true) on companies+profiles)
--   - 1 suggestion on prospects (RLS on, no policy)
-- ═══════════════════════════════════════════════════════════════════

-- ═══════════════════════════════════════════════════════════════════
-- STEP 1 — Drop ALL existing policies on target tables
-- (Prior ad-hoc policies like USING(true) must go before we recreate.)
-- ═══════════════════════════════════════════════════════════════════
DO $$
DECLARE
  t TEXT;
  r RECORD;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'bookings','groups','packages','knowledge_base',
    'companies','profiles','prospects'
  ]
  LOOP
    FOR r IN
      SELECT policyname
      FROM pg_policies
      WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
    END LOOP;
  END LOOP;
END $$;

-- ══════════════════════════════════════
-- bookings
-- ══════════════════════════════════════
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "bookings_all_own_company" ON bookings
  FOR ALL
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ══════════════════════════════════════
-- groups
-- ══════════════════════════════════════
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

CREATE POLICY "groups_all_own_company" ON groups
  FOR ALL
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ══════════════════════════════════════
-- packages
-- ══════════════════════════════════════
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_all_own_company" ON packages
  FOR ALL
  USING (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    company_id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ══════════════════════════════════════
-- knowledge_base (global — service_role only)
-- ══════════════════════════════════════
-- /api/knowledge and /api/admin/knowledge both use SUPABASE_SERVICE_ROLE_KEY,
-- which bypasses RLS. No authenticated client should access this table
-- directly, so deny-all is the correct policy.
ALTER TABLE knowledge_base ENABLE ROW LEVEL SECURITY;

CREATE POLICY "knowledge_base_deny_authenticated" ON knowledge_base
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- ══════════════════════════════════════
-- companies
-- ══════════════════════════════════════
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Read own company
CREATE POLICY "companies_read_own" ON companies
  FOR SELECT
  USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- Update own company
CREATE POLICY "companies_update_own" ON companies
  FOR UPDATE
  USING (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    id IN (SELECT company_id FROM profiles WHERE id = auth.uid())
  );

-- ══════════════════════════════════════
-- profiles
-- ══════════════════════════════════════
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Read self + teammates (same company)
CREATE POLICY "profiles_read_self_or_teammate" ON profiles
  FOR SELECT
  USING (
    id = auth.uid()
    OR company_id IN (SELECT p2.company_id FROM profiles p2 WHERE p2.id = auth.uid())
  );

-- Update only own profile
CREATE POLICY "profiles_update_self" ON profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Insert own profile on signup (auth.uid() must match the inserted id)
CREATE POLICY "profiles_insert_self" ON profiles
  FOR INSERT
  WITH CHECK (id = auth.uid());

-- ══════════════════════════════════════
-- prospects (B2B acquisition pipeline — service role only)
-- ══════════════════════════════════════
-- Populated by n8n workflows using the service_role key, which bypasses
-- RLS. No authenticated client should read/write prospects directly, so
-- we add an explicit deny-all policy to make the intent clear.
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "prospects_deny_authenticated" ON prospects
  FOR ALL
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

-- ═══════════════════════════════════════════════════════════════════
-- STEP 2 — Fix function search_path (warning: Function Search Path Mutable)
-- ═══════════════════════════════════════════════════════════════════
-- Without SET search_path, a malicious user with CREATE privilege on any
-- schema could shadow built-in functions/tables. Pin to public,pg_temp.
ALTER FUNCTION public.set_updated_at() SET search_path = public, pg_temp;

-- ═══════════════════════════════════════════════════════════════════
-- Verification queries (run after migration to confirm):
--
--   -- All target tables should show rowsecurity = true
--   SELECT tablename, rowsecurity FROM pg_tables
--   WHERE schemaname = 'public'
--     AND tablename IN ('bookings','groups','packages','knowledge_base',
--                       'companies','profiles','prospects');
--
--   -- Every table should have at least one policy
--   SELECT schemaname, tablename, policyname FROM pg_policies
--   WHERE schemaname = 'public' ORDER BY tablename, policyname;
--
--   -- set_updated_at should show proconfig containing 'search_path=...'
--   SELECT proname, proconfig FROM pg_proc
--   WHERE proname = 'set_updated_at';
-- ═══════════════════════════════════════════════════════════════════
