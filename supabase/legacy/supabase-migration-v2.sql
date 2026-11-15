-- HISTORICAL ONLY - DO NOT RUN.
-- This file no longer matches the live Supabase project and would overwrite
-- working functions, policies, or table shapes. See ../README.md and
-- ../migrations/20261115000000_baseline_public_schema.sql.
--
-- =============================================================================
-- THE LOST PROTOCOL — ADDITIVE DATABASE MIGRATION (V2)
-- =============================================================================
-- This migration script extends the database safely and idempotently without
-- dropping tables, truncating data, or altering working columns.
--
-- RUN INSTRUCTIONS:
-- 1. Open your Supabase Dashboard: https://supabase.com
-- 2. Select project 'the-lost-protocol' (e.g., https://gkycmrivyqxknvkgdffr.supabase.co)
-- 3. Click on "SQL Editor" in the left navigation
-- 4. Click "New query", paste the contents of this file, and click "Run" (Ctrl+Enter)
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. EXTEND PROFILES TABLE (Admin role, is_admin, and is_test_account)
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    -- Add is_admin column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_admin'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Add is_test_account column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'is_test_account'
    ) THEN
        ALTER TABLE public.profiles ADD COLUMN is_test_account BOOLEAN NOT NULL DEFAULT false;
    END IF;

    -- Update role check constraint to include 'admin'
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_schema = 'public' AND table_name = 'profiles' AND constraint_name = 'profiles_role_check'
    ) THEN
        ALTER TABLE public.profiles DROP CONSTRAINT profiles_role_check;
    END IF;
    ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check CHECK (role IN ('learner', 'parent', 'admin'));
END $$;

-- -----------------------------------------------------------------------------
-- 2. EXTEND LEARNERS AND PROGRESS_RECORDS WITH TEST FLAGS
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'learners' AND column_name = 'is_test'
    ) THEN
        ALTER TABLE public.learners ADD COLUMN is_test BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'progress_records' AND column_name = 'is_test'
    ) THEN
        ALTER TABLE public.progress_records ADD COLUMN is_test BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 3. LEADERBOARD ENTRIES TABLE
-- -----------------------------------------------------------------------------
-- Tracks verified saved scores per learner + path + difficulty.
-- Test accounts and test scores are flagged (is_test = true) and excluded from the public view.
CREATE TABLE IF NOT EXISTS public.leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    learning_path TEXT NOT NULL CHECK (learning_path IN ('g16', 'g710', 'g1112', 'adult')),
    game_diff TEXT NOT NULL CHECK (game_diff IN ('beg', 'int', 'pro')),
    total_score INTEGER NOT NULL DEFAULT 0,
    total_stars INTEGER NOT NULL DEFAULT 0,
    chapters_cleared INTEGER NOT NULL DEFAULT 0,
    is_test BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT unique_learner_path_diff UNIQUE (learner_id, learning_path, game_diff)
);

CREATE INDEX IF NOT EXISTS idx_leaderboard_rank 
    ON public.leaderboard_entries(learning_path, game_diff, is_test, total_score DESC, total_stars DESC, updated_at ASC);

-- Automatic updated_at trigger for leaderboard
DROP TRIGGER IF EXISTS set_leaderboard_updated_at ON public.leaderboard_entries;
CREATE TRIGGER set_leaderboard_updated_at
    BEFORE UPDATE ON public.leaderboard_entries
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 4. PUBLIC LEADERBOARD VIEW (Privacy-safe: no emails, no user UUIDs)
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_leaderboard AS
SELECT 
    id,
    display_name,
    learning_path,
    game_diff,
    total_score,
    total_stars,
    chapters_cleared,
    updated_at
FROM public.leaderboard_entries
WHERE is_test = false;

-- -----------------------------------------------------------------------------
-- 5. BUG REPORTS TABLE
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    page_feature TEXT NOT NULL,
    steps_to_reproduce TEXT,
    expected_vs_actual TEXT,
    browser_info TEXT,
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'investigating', 'fixed', 'closed')),
    admin_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_bug_reports_status ON public.bug_reports(status, created_at DESC);

-- Automatic updated_at trigger for bug reports
DROP TRIGGER IF EXISTS set_bug_reports_updated_at ON public.bug_reports;
CREATE TRIGGER set_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- -----------------------------------------------------------------------------
-- 6. ADMIN HELPER FUNCTION AND ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND (role = 'admin' OR is_admin = true)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on new tables
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

-- Leaderboard RLS
DROP POLICY IF EXISTS "Public can view non-test leaderboard" ON public.leaderboard_entries;
CREATE POLICY "Public can view non-test leaderboard"
    ON public.leaderboard_entries FOR SELECT
    USING (is_test = false OR auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can upsert own leaderboard entries" ON public.leaderboard_entries;
CREATE POLICY "Users can upsert own leaderboard entries"
    ON public.leaderboard_entries FOR INSERT
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own leaderboard entries" ON public.leaderboard_entries;
CREATE POLICY "Users can update own leaderboard entries"
    ON public.leaderboard_entries FOR UPDATE
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins and owners can delete leaderboard entries" ON public.leaderboard_entries;
CREATE POLICY "Admins and owners can delete leaderboard entries"
    ON public.leaderboard_entries FOR DELETE
    USING (auth.uid() = user_id OR public.is_admin());

-- Bug Reports RLS
DROP POLICY IF EXISTS "Anyone can submit a bug report" ON public.bug_reports;
CREATE POLICY "Anyone can submit a bug report"
    ON public.bug_reports FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users view own bugs or admins view all" ON public.bug_reports;
CREATE POLICY "Users view own bugs or admins view all"
    ON public.bug_reports FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can update bug reports" ON public.bug_reports;
CREATE POLICY "Admins can update bug reports"
    ON public.bug_reports FOR UPDATE
    USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete bug reports" ON public.bug_reports;
CREATE POLICY "Admins can delete bug reports"
    ON public.bug_reports FOR DELETE
    USING (public.is_admin());

-- Additional Admin Policies on Profiles and Learners
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can view all learners" ON public.learners;
CREATE POLICY "Admins can view all learners"
    ON public.learners FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = parent_user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can view all progress" ON public.progress_records;
CREATE POLICY "Admins can view all progress"
    ON public.progress_records FOR SELECT
    USING (auth.uid() = user_id OR public.is_admin());

-- -----------------------------------------------------------------------------
-- 7. SAFE TEST DATA MANAGEMENT FUNCTIONS (Admin-Only, Preview & Purge)
-- -----------------------------------------------------------------------------
-- Preview test data counts without deleting anything
CREATE OR REPLACE FUNCTION public.preview_test_data()
RETURNS TABLE(
    test_profiles_count BIGINT,
    test_learners_count BIGINT,
    test_progress_count BIGINT,
    test_leaderboard_count BIGINT
) AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only verified administrators can inspect test data.';
    END IF;
    RETURN QUERY
    SELECT
        (SELECT COUNT(*) FROM public.profiles WHERE is_test_account = true),
        (SELECT COUNT(*) FROM public.learners WHERE is_test = true),
        (SELECT COUNT(*) FROM public.progress_records WHERE is_test = true),
        (SELECT COUNT(*) FROM public.leaderboard_entries WHERE is_test = true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Safe purge of test data (NEVER affects real accounts where is_test_account = false)
CREATE OR REPLACE FUNCTION public.purge_test_data()
RETURNS JSONB AS $$
DECLARE
    del_lb INT;
    del_prog INT;
    del_learners INT;
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Access Denied: Only verified administrators can purge test data.';
    END IF;

    WITH del_lbe AS (
        DELETE FROM public.leaderboard_entries WHERE is_test = true RETURNING id
    ) SELECT COUNT(*) INTO del_lb FROM del_lbe;

    WITH del_prg AS (
        DELETE FROM public.progress_records WHERE is_test = true RETURNING id
    ) SELECT COUNT(*) INTO del_prog FROM del_prg;

    WITH del_lrn AS (
        DELETE FROM public.learners WHERE is_test = true RETURNING id
    ) SELECT COUNT(*) INTO del_learners FROM del_lrn;

    RETURN jsonb_build_object(
        'deleted_leaderboard', del_lb,
        'deleted_progress', del_prog,
        'deleted_learners', del_learners,
        'purged_at', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 8. IDEMPOTENT ADMIN GRANT PROCEDURE
-- -----------------------------------------------------------------------------
-- Secure one-time procedure to grant admin access to a verified account.
-- Usage: SELECT public.grant_admin_by_email('pilot@robounison.org');
CREATE OR REPLACE FUNCTION public.grant_admin_by_email(target_email TEXT)
RETURNS TEXT AS $$
DECLARE
    target_uid UUID;
BEGIN
    SELECT id INTO target_uid FROM auth.users WHERE LOWER(email) = LOWER(TRIM(target_email)) LIMIT 1;
    IF target_uid IS NULL THEN
        RETURN 'Error: No user found with email "' || target_email || '". Please register the account first.';
    END IF;

    INSERT INTO public.profiles (id, role, display_name, is_admin, is_test_account, updated_at)
    VALUES (target_uid, 'admin', split_part(target_email, '@', 1), true, false, now())
    ON CONFLICT (id) DO UPDATE
    SET role = 'admin', is_admin = true, updated_at = now();

    RETURN 'Success: Admin access successfully granted to ' || target_email || ' (User ID: ' || target_uid || ').';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
