-- =============================================================================
-- THE LOST PROTOCOL — SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- =============================================================================
-- This script configures the PostgreSQL database for The Lost Protocol on Supabase.
-- Run this script in the Supabase SQL Editor (Dashboard -> SQL Editor -> New query -> Run).
--
-- Features:
-- - Per-user account profiles (Learner or Parent role)
-- - Learner profiles with automatic learning-path assignment and independent difficulty
-- - Completely isolated progress records per learner + path + difficulty
-- - Strict server-side Row Level Security (RLS): parents only see their own learners,
--   learners only see their own progress, cross-family data leakage is prevented.
-- =============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. PROFILES TABLE (Associated with auth.users)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('learner', 'parent')),
    display_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 2. LEARNERS TABLE (Learner entities managed by accounts)
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.learners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    parent_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    grade_range TEXT NOT NULL CHECK (grade_range IN ('g16', 'g710', 'g1112', 'adult')),
    assigned_path TEXT NOT NULL CHECK (assigned_path IN ('g16', 'g710', 'g1112', 'adult')),
    current_diff TEXT NOT NULL DEFAULT 'int' CHECK (current_diff IN ('beg', 'int', 'pro')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookup by account and parent
CREATE INDEX IF NOT EXISTS idx_learners_user_id ON public.learners(user_id);
CREATE INDEX IF NOT EXISTS idx_learners_parent_user_id ON public.learners(parent_user_id);

-- -----------------------------------------------------------------------------
-- 3. PROGRESS RECORDS TABLE (Fully isolated per Learner + Path + Difficulty)
-- -----------------------------------------------------------------------------
-- ID format: "{learner_id}:{learning_path}:{game_diff}"
CREATE TABLE IF NOT EXISTS public.progress_records (
    id TEXT PRIMARY KEY,
    learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    learning_path TEXT NOT NULL CHECK (learning_path IN ('g16', 'g710', 'g1112', 'adult')),
    game_diff TEXT NOT NULL CHECK (game_diff IN ('beg', 'int', 'pro')),
    prog JSONB NOT NULL DEFAULT '{}'::jsonb,
    ach JSONB NOT NULL DEFAULT '[]'::jsonb,
    badges JSONB NOT NULL DEFAULT '[]'::jsonb,
    draft JSONB DEFAULT NULL,
    boss_state JSONB DEFAULT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_progress_learner_id ON public.progress_records(learner_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_id ON public.progress_records(user_id);

-- -----------------------------------------------------------------------------
-- 4. ROW LEVEL SECURITY (RLS) POLICIES
-- -----------------------------------------------------------------------------
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_records ENABLE ROW LEVEL SECURITY;

-- Clean existing policies if re-running
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

DROP POLICY IF EXISTS "Learners readable by owner or parent" ON public.learners;
DROP POLICY IF EXISTS "Learners insertable by owner or parent" ON public.learners;
DROP POLICY IF EXISTS "Learners updatable by owner or parent" ON public.learners;
DROP POLICY IF EXISTS "Learners deletable by owner or parent" ON public.learners;

DROP POLICY IF EXISTS "Progress readable by owner or parent" ON public.progress_records;
DROP POLICY IF EXISTS "Progress insertable by owner or parent" ON public.progress_records;
DROP POLICY IF EXISTS "Progress updatable by owner or parent" ON public.progress_records;
DROP POLICY IF EXISTS "Progress deletable by owner or parent" ON public.progress_records;

-- Profiles policies
CREATE POLICY "Users can read own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

-- Learners policies
CREATE POLICY "Learners readable by owner or parent"
    ON public.learners FOR SELECT
    USING (auth.uid() = user_id OR auth.uid() = parent_user_id);

CREATE POLICY "Learners insertable by owner or parent"
    ON public.learners FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() = parent_user_id);

CREATE POLICY "Learners updatable by owner or parent"
    ON public.learners FOR UPDATE
    USING (auth.uid() = user_id OR auth.uid() = parent_user_id);

CREATE POLICY "Learners deletable by owner or parent"
    ON public.learners FOR DELETE
    USING (auth.uid() = user_id OR auth.uid() = parent_user_id);

-- Progress Records policies
CREATE POLICY "Progress readable by owner or parent"
    ON public.progress_records FOR SELECT
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.learners
            WHERE public.learners.id = public.progress_records.learner_id
              AND (public.learners.user_id = auth.uid() OR public.learners.parent_user_id = auth.uid())
        )
    );

CREATE POLICY "Progress insertable by owner or parent"
    ON public.progress_records FOR INSERT
    WITH CHECK (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.learners
            WHERE public.learners.id = public.progress_records.learner_id
              AND (public.learners.user_id = auth.uid() OR public.learners.parent_user_id = auth.uid())
        )
    );

CREATE POLICY "Progress updatable by owner or parent"
    ON public.progress_records FOR UPDATE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.learners
            WHERE public.learners.id = public.progress_records.learner_id
              AND (public.learners.user_id = auth.uid() OR public.learners.parent_user_id = auth.uid())
        )
    );

CREATE POLICY "Progress deletable by owner or parent"
    ON public.progress_records FOR DELETE
    USING (
        auth.uid() = user_id OR
        EXISTS (
            SELECT 1 FROM public.learners
            WHERE public.learners.id = public.progress_records.learner_id
              AND (public.learners.user_id = auth.uid() OR public.learners.parent_user_id = auth.uid())
        )
    );

-- -----------------------------------------------------------------------------
-- 5. AUTOMATIC TIMESTAMP TRIGGER
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_profiles_updated_at ON public.profiles;
CREATE TRIGGER set_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_learners_updated_at ON public.learners;
CREATE TRIGGER set_learners_updated_at
    BEFORE UPDATE ON public.learners
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_progress_updated_at ON public.progress_records;
CREATE TRIGGER set_progress_updated_at
    BEFORE UPDATE ON public.progress_records
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
