-- HISTORICAL ONLY - DO NOT RUN.
-- This file no longer matches the live Supabase project and would overwrite
-- working functions, policies, or table shapes. See ../README.md and
-- ../migrations/20261115000000_baseline_public_schema.sql.
--
-- =============================================================================
-- THE LOST PROTOCOL — DATABASE MIGRATION V3 (COMPREHENSIVE PLATFORM EXTENSION)
-- =============================================================================
-- Idempotent, additive schema extension for:
--  1. Player ID Generation and Educator Learner Management
--  2. Ladder Difficulty Progression & Verification
--  3. Real-Time Co-Op Rooms, Realtime Invites, and Server-Verified Matches
--  4. Public Privacy-Safe Leaderboard Views (Individual & Co-Op)
--  5. Account and Learner Lifecycle Procedures (Safe Delete & Reset)
--
-- RUN INSTRUCTIONS:
-- 1. Open Supabase Dashboard: https://supabase.com
-- 2. Select project 'the-lost-protocol' (https://gkycmrivyqxknvkgdffr.supabase.co)
-- 3. Click "SQL Editor" in the left navigation
-- 4. Click "New query", paste the contents of this file, and click "Run" (Ctrl+Enter)
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- -----------------------------------------------------------------------------
-- 1. EXTEND LEARNERS TABLE
-- -----------------------------------------------------------------------------
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'learners' AND column_name = 'player_id') THEN
        ALTER TABLE public.learners ADD COLUMN player_id TEXT UNIQUE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'learners' AND column_name = 'start_diff') THEN
        ALTER TABLE public.learners ADD COLUMN start_diff TEXT NOT NULL DEFAULT 'int' CHECK (start_diff IN ('beg', 'int', 'pro'));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'learners' AND column_name = 'completed_diffs') THEN
        ALTER TABLE public.learners ADD COLUMN completed_diffs TEXT[] NOT NULL DEFAULT '{}';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'learners' AND column_name = 'created_by_educator') THEN
        ALTER TABLE public.learners ADD COLUMN created_by_educator BOOLEAN NOT NULL DEFAULT false;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'learners' AND column_name = 'is_test') THEN
        ALTER TABLE public.learners ADD COLUMN is_test BOOLEAN NOT NULL DEFAULT false;
    END IF;
END $$;

-- -----------------------------------------------------------------------------
-- 2. PLAYER ID GENERATOR FUNCTION
-- -----------------------------------------------------------------------------
-- Generates unique, non-sequential Player IDs like "TLP-7K9M2P"
CREATE OR REPLACE FUNCTION public.generate_player_id()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    result TEXT;
    done BOOLEAN := false;
    i INT;
BEGIN
    WHILE NOT done LOOP
        result := 'TLP-';
        FOR i IN 1..6 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
        END LOOP;
        IF NOT EXISTS (SELECT 1 FROM public.learners WHERE player_id = result) THEN
            done := true;
        END IF;
    END LOOP;
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Populate player_id for existing learners if missing
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN SELECT id FROM public.learners WHERE player_id IS NULL LOOP
        UPDATE public.learners SET player_id = public.generate_player_id() WHERE id = r.id;
    END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- 3. DIFFICULTY LADDER PROCEDURES
-- -----------------------------------------------------------------------------
-- Mark difficulty as fully completed (all 6 guardians defeated)
CREATE OR REPLACE FUNCTION public.mark_difficulty_completed(p_learner UUID, p_diff TEXT)
RETURNS JSONB AS $$
DECLARE
    l_uid UUID;
    cur_comp TEXT[];
BEGIN
    SELECT user_id, completed_diffs INTO l_uid, cur_comp FROM public.learners WHERE id = p_learner;
    IF l_uid IS NULL THEN RAISE EXCEPTION 'Learner not found'; END IF;
    IF auth.uid() != l_uid THEN
        -- Allow linked parent as well
        IF NOT EXISTS (SELECT 1 FROM public.learners WHERE id = p_learner AND parent_user_id = auth.uid()) THEN
            RAISE EXCEPTION 'Not authorized';
        END IF;
    END IF;

    IF NOT (p_diff = ANY(cur_comp)) THEN
        cur_comp := array_append(cur_comp, p_diff);
        UPDATE public.learners SET completed_diffs = cur_comp, updated_at = now() WHERE id = p_learner;
    END IF;

    RETURN jsonb_build_object('ok', true, 'completed_diffs', cur_comp);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Switch difficulty with validation
CREATE OR REPLACE FUNCTION public.switch_difficulty(p_learner UUID, p_new TEXT, p_confirm TEXT DEFAULT NULL)
RETURNS JSONB AS $$
DECLARE
    l_uid UUID;
    l_par UUID;
    cur_d TEXT;
    cur_p TEXT;
    cur_comp TEXT[];
BEGIN
    SELECT user_id, parent_user_id, current_diff, assigned_path, completed_diffs 
    INTO l_uid, l_par, cur_d, cur_p, cur_comp 
    FROM public.learners WHERE id = p_learner;

    IF l_uid IS NULL THEN RAISE EXCEPTION 'Learner not found'; END IF;
    IF auth.uid() != l_uid AND auth.uid() != l_par THEN
        RAISE EXCEPTION 'Not authorized';
    END IF;

    IF p_new NOT IN ('beg', 'int', 'pro') THEN
        RAISE EXCEPTION 'Invalid difficulty: %', p_new;
    END IF;

    UPDATE public.learners SET current_diff = p_new, updated_at = now() WHERE id = p_learner;
    RETURN jsonb_build_object('ok', true, 'new_diff', p_new);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 4. EDUCATOR AND ACCOUNT MANAGEMENT PROCEDURES
-- -----------------------------------------------------------------------------
-- Educator deletes learner account
CREATE OR REPLACE FUNCTION public.educator_delete_learner(p_learner UUID, p_confirm TEXT)
RETURNS JSONB AS $$
DECLARE
    l_pid TEXT;
    l_user UUID;
    p_user UUID;
BEGIN
    SELECT player_id, user_id, parent_user_id INTO l_pid, l_user, p_user FROM public.learners WHERE id = p_learner;
    IF l_pid IS NULL THEN RAISE EXCEPTION 'Learner not found'; END IF;
    IF auth.uid() != p_user AND NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only the educator who manages this learner can delete it';
    END IF;
    IF UPPER(TRIM(p_confirm)) != UPPER(TRIM(l_pid)) THEN
        RAISE EXCEPTION 'Confirmation Player ID does not match';
    END IF;

    DELETE FROM public.leaderboard_entries WHERE learner_id = p_learner;
    DELETE FROM public.progress_records WHERE learner_id = p_learner;
    DELETE FROM public.learners WHERE id = p_learner;

    -- Also delete the auth user if this was an educator-created child account
    IF l_user IS NOT NULL AND l_user != p_user THEN
        DELETE FROM auth.users WHERE id = l_user;
    END IF;

    RETURN jsonb_build_object('ok', true, 'deleted_learner', p_learner);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Self-service delete my account
CREATE OR REPLACE FUNCTION public.delete_my_account(p_confirm TEXT)
RETURNS JSONB AS $$
DECLARE
    cur_u UUID := auth.uid();
BEGIN
    IF cur_u IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
    IF TRIM(p_confirm) != 'DELETE MY ACCOUNT AND ALL PROGRESS' THEN
        RAISE EXCEPTION 'Confirmation text must be exact: DELETE MY ACCOUNT AND ALL PROGRESS';
    END IF;

    DELETE FROM public.bug_reports WHERE user_id = cur_u;
    DELETE FROM public.leaderboard_entries WHERE user_id = cur_u;
    DELETE FROM public.progress_records WHERE user_id = cur_u;
    DELETE FROM public.learners WHERE user_id = cur_u OR parent_user_id = cur_u;
    DELETE FROM public.profiles WHERE id = cur_u;
    DELETE FROM auth.users WHERE id = cur_u;

    RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 5. CO-OP MULTIPLAYER SCHEMA
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.coop_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    host_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    host_learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    guest_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    guest_learner_id UUID REFERENCES public.learners(id) ON DELETE SET NULL,
    challenge_id TEXT NOT NULL DEFAULT 'relay-grid',
    status TEXT NOT NULL DEFAULT 'lobby' CHECK (status IN ('lobby', 'waiting', 'active', 'finished', 'closed')),
    host_ready BOOLEAN NOT NULL DEFAULT false,
    guest_ready BOOLEAN NOT NULL DEFAULT false,
    started_at TIMESTAMPTZ,
    finished_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coop_invites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES public.coop_rooms(id) ON DELETE CASCADE,
    from_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    from_learner_id UUID NOT NULL REFERENCES public.learners(id) ON DELETE CASCADE,
    to_player_id TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.coop_matches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL UNIQUE REFERENCES public.coop_rooms(id) ON DELETE CASCADE,
    challenge_id TEXT NOT NULL DEFAULT 'relay-grid',
    host_player_id TEXT NOT NULL,
    host_name TEXT NOT NULL,
    guest_player_id TEXT NOT NULL,
    guest_name TEXT NOT NULL,
    score INTEGER NOT NULL DEFAULT 0,
    correct_stations INTEGER NOT NULL DEFAULT 0,
    total_steps INTEGER NOT NULL DEFAULT 0,
    duration_ms INTEGER NOT NULL DEFAULT 0,
    is_test BOOLEAN NOT NULL DEFAULT false,
    finished_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.coop_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coop_invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coop_matches ENABLE ROW LEVEL SECURITY;

-- Co-op Room Policies
DROP POLICY IF EXISTS "Members can view own room" ON public.coop_rooms;
CREATE POLICY "Members can view own room" ON public.coop_rooms FOR SELECT
    USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id OR public.is_admin());

DROP POLICY IF EXISTS "Users can create room" ON public.coop_rooms;
CREATE POLICY "Users can create room" ON public.coop_rooms FOR INSERT
    WITH CHECK (auth.uid() = host_user_id);

DROP POLICY IF EXISTS "Members can update room" ON public.coop_rooms;
CREATE POLICY "Members can update room" ON public.coop_rooms FOR UPDATE
    USING (auth.uid() = host_user_id OR auth.uid() = guest_user_id OR public.is_admin());

-- Co-op Matches Policies
DROP POLICY IF EXISTS "Public can view coop matches" ON public.coop_matches;
CREATE POLICY "Public can view coop matches" ON public.coop_matches FOR SELECT
    USING (is_test = false OR public.is_admin());

-- Co-op Public Leaderboard View
CREATE OR REPLACE VIEW public.public_coop_leaderboard AS
SELECT 
    id,
    challenge_id,
    host_player_id,
    host_name,
    guest_player_id,
    guest_name,
    score,
    correct_stations,
    total_steps,
    duration_ms,
    finished_at
FROM public.coop_matches
WHERE is_test = false;

-- Co-op Stored Procedures (RPCs)
CREATE OR REPLACE FUNCTION public.coop_create_room()
RETURNS JSONB AS $$
DECLARE
    cur_u UUID := auth.uid();
    l_rec RECORD;
    r_code TEXT;
    r_id UUID;
    chars TEXT := '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
    i INT;
BEGIN
    IF cur_u IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
    SELECT id, player_id, name INTO l_rec FROM public.learners WHERE user_id = cur_u ORDER BY created_at ASC LIMIT 1;
    IF l_rec.id IS NULL THEN RAISE EXCEPTION 'No learner profile found for this account'; END IF;

    -- Generate 6-char room code
    r_code := '';
    FOR i IN 1..6 LOOP
        r_code := r_code || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;

    INSERT INTO public.coop_rooms (code, host_user_id, host_learner_id, status)
    VALUES (r_code, cur_u, l_rec.id, 'lobby')
    RETURNING id INTO r_id;

    RETURN jsonb_build_object('room_id', r_id, 'code', r_code);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.coop_join_room(p_code TEXT)
RETURNS UUID AS $$
DECLARE
    cur_u UUID := auth.uid();
    l_rec RECORD;
    r_rec RECORD;
BEGIN
    IF cur_u IS NULL THEN RAISE EXCEPTION 'Not signed in'; END IF;
    SELECT id, player_id, name INTO l_rec FROM public.learners WHERE user_id = cur_u ORDER BY created_at ASC LIMIT 1;
    IF l_rec.id IS NULL THEN RAISE EXCEPTION 'No learner profile found for this account'; END IF;

    SELECT * INTO r_rec FROM public.coop_rooms WHERE UPPER(code) = UPPER(TRIM(p_code)) AND status IN ('lobby', 'waiting');
    IF r_rec.id IS NULL THEN RAISE EXCEPTION 'Room not found or game already in progress'; END IF;

    IF r_rec.host_user_id = cur_u THEN
        RETURN r_rec.id; -- Host rejoining own room
    END IF;

    UPDATE public.coop_rooms
    SET guest_user_id = cur_u, guest_learner_id = l_rec.id, status = 'waiting', updated_at = now()
    WHERE id = r_rec.id;

    RETURN r_rec.id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.coop_room_state(p_room UUID)
RETURNS JSONB AS $$
DECLARE
    r RECORD;
    h_l RECORD;
    g_l RECORD;
BEGIN
    SELECT * INTO r FROM public.coop_rooms WHERE id = p_room;
    IF r.id IS NULL THEN RAISE EXCEPTION 'Room not found'; END IF;

    SELECT player_id, name INTO h_l FROM public.learners WHERE id = r.host_learner_id;
    SELECT player_id, name INTO g_l FROM public.learners WHERE id = r.guest_learner_id;

    RETURN jsonb_build_object(
        'room_id', r.id,
        'code', r.code,
        'status', r.status,
        'challenge_id', r.challenge_id,
        'host_player_id', h_l.player_id,
        'host_name', h_l.name,
        'host_ready', r.host_ready,
        'guest_player_id', g_l.player_id,
        'guest_name', g_l.name,
        'guest_ready', r.guest_ready,
        'started_at', r.started_at,
        'server_time', now()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.coop_set_ready(p_room UUID, p_ready BOOLEAN)
RETURNS JSONB AS $$
DECLARE
    cur_u UUID := auth.uid();
    r RECORD;
    new_status TEXT;
    st_time TIMESTAMPTZ;
BEGIN
    SELECT * INTO r FROM public.coop_rooms WHERE id = p_room;
    IF r.id IS NULL THEN RAISE EXCEPTION 'Room not found'; END IF;

    IF cur_u = r.host_user_id THEN
        r.host_ready := p_ready;
    ELSIF cur_u = r.guest_user_id THEN
        r.guest_ready := p_ready;
    ELSE
        RAISE EXCEPTION 'Not a member of this room';
    END IF;

    new_status := r.status;
    st_time := r.started_at;
    IF r.host_ready AND r.guest_ready AND r.status = 'waiting' THEN
        new_status := 'active';
        st_time := now();
    END IF;

    UPDATE public.coop_rooms 
    SET host_ready = r.host_ready, guest_ready = r.guest_ready, status = new_status, started_at = st_time, updated_at = now()
    WHERE id = p_room;

    RETURN public.coop_room_state(p_room);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.coop_invite(p_room UUID, p_player_id TEXT)
RETURNS TEXT AS $$
DECLARE
    cur_u UUID := auth.uid();
    l_rec RECORD;
    t_rec RECORD;
BEGIN
    SELECT * INTO l_rec FROM public.learners WHERE user_id = cur_u ORDER BY created_at ASC LIMIT 1;
    IF l_rec.id IS NULL THEN RAISE EXCEPTION 'No learner profile found'; END IF;

    SELECT id, player_id, name INTO t_rec FROM public.learners WHERE UPPER(TRIM(player_id)) = UPPER(TRIM(p_player_id));
    IF t_rec.id IS NULL THEN RAISE EXCEPTION 'Player ID not found: %', p_player_id; END IF;

    INSERT INTO public.coop_invites (room_id, from_user_id, from_learner_id, to_player_id)
    VALUES (p_room, cur_u, l_rec.id, t_rec.player_id);

    RETURN 'Invitation sent to ' || t_rec.name || ' (' || t_rec.player_id || ')';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.coop_my_invites()
RETURNS TABLE(room_id UUID, code TEXT, from_name TEXT, from_player_id TEXT, created_at TIMESTAMPTZ) AS $$
DECLARE
    cur_u UUID := auth.uid();
    my_pid TEXT;
BEGIN
    SELECT player_id INTO my_pid FROM public.learners WHERE user_id = cur_u ORDER BY created_at ASC LIMIT 1;
    IF my_pid IS NULL THEN RETURN; END IF;

    RETURN QUERY
    SELECT i.room_id, r.code, l.name, l.player_id, i.created_at
    FROM public.coop_invites i
    JOIN public.coop_rooms r ON r.id = i.room_id
    JOIN public.learners l ON l.id = i.from_learner_id
    WHERE i.to_player_id = my_pid AND r.status IN ('lobby', 'waiting')
    ORDER BY i.created_at DESC
    LIMIT 10;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.coop_my_active_room()
RETURNS UUID AS $$
DECLARE
    cur_u UUID := auth.uid();
    r_id UUID;
BEGIN
    IF cur_u IS NULL THEN RETURN NULL; END IF;
    SELECT id INTO r_id FROM public.coop_rooms 
    WHERE (host_user_id = cur_u OR guest_user_id = cur_u) AND status IN ('lobby', 'waiting', 'active')
    ORDER BY updated_at DESC LIMIT 1;
    RETURN r_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.coop_leave(p_room UUID)
RETURNS JSONB AS $$
DECLARE
    cur_u UUID := auth.uid();
BEGIN
    UPDATE public.coop_rooms
    SET status = 'closed', updated_at = now()
    WHERE id = p_room AND (host_user_id = cur_u OR guest_user_id = cur_u);
    RETURN jsonb_build_object('ok', true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------------------------------
-- 6. PUBLIC INDIVIDUAL LEADERBOARD VIEW
-- -----------------------------------------------------------------------------
CREATE OR REPLACE VIEW public.public_leaderboard AS
SELECT 
    e.id,
    l.player_id,
    COALESCE(e.display_name, l.name) AS display_name,
    e.learning_path,
    e.game_diff,
    e.total_score,
    e.total_stars,
    e.chapters_cleared,
    e.badges,
    e.updated_at
FROM public.leaderboard_entries e
JOIN public.learners l ON l.id = e.learner_id
WHERE e.is_test = false AND l.is_test = false;
