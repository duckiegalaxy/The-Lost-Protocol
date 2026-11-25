create extension if not exists pg_stat_statements with schema extensions;
create extension if not exists pgcrypto with schema extensions;
create extension if not exists supabase_vault with schema vault;
create extension if not exists "uuid-ossp" with schema extensions;



create sequence public.admin_audit_id_seq;



create table public.admin_audit (id bigint not null default nextval('admin_audit_id_seq'::regclass), action text not null, target_user uuid, target_email text, note text, performed_at timestamp with time zone not null default now());
create table public.ai_usage (user_id uuid not null, day date not null default ((now() AT TIME ZONE 'utc'::text))::date, mode text not null, used integer not null default 0);
create table public.bonus_progress (learner_id uuid not null, data jsonb not null default '{}'::jsonb, updated_at timestamp with time zone not null default now());
create table public.bug_reports (id uuid not null default gen_random_uuid(), user_id uuid, title text not null, description text not null, page_feature text not null, steps_to_reproduce text, expected_vs_actual text, browser_info text, status text not null default 'new'::text, admin_notes text, created_at timestamp with time zone not null default now(), updated_at timestamp with time zone not null default now(), attachment_path text, attachment_type text);
create table public.coop_challenges (id text not null, instance jsonb not null, created_at timestamp with time zone not null default now());
create table public.coop_invites (id uuid not null default gen_random_uuid(), room_id uuid not null, from_learner uuid not null, to_player_id text not null, created_at timestamp with time zone not null default now());
create table public.coop_leaderboard_public (id uuid not null, p1_learner uuid, p2_learner uuid, challenge_id text, score integer, correct integer, steps integer, duration_ms integer, finished_at timestamp with time zone, p1_player_id text, p1_name text, p2_player_id text, p2_name text, is_test boolean not null default false);
create table public.coop_matches (id uuid not null default gen_random_uuid(), room_id uuid, challenge_id text not null, p1_learner uuid, p2_learner uuid, score integer not null, correct integer not null, steps integer not null, duration_ms integer not null, finished_at timestamp with time zone not null default now(), is_test boolean not null default false);
create table public.coop_rooms (id uuid not null default gen_random_uuid(), code text not null, challenge_id text not null, host_learner uuid not null, guest_learner uuid, status text not null default 'waiting'::text, host_ready boolean not null default false, guest_ready boolean not null default false, started_at timestamp with time zone, finished_at timestamp with time zone, created_at timestamp with time zone not null default now(), expires_at timestamp with time zone not null default (now() + '01:00:00'::interval));
create table public.feedback_entries (id uuid not null default gen_random_uuid(), created_at timestamp with time zone not null default now(), user_id uuid, rating integer, tags text, message text, name text, age_group text, level text, page text);
create table public.leaderboard_entries (id uuid not null default gen_random_uuid(), learner_id uuid not null, user_id uuid not null, display_name text not null, learning_path text not null, game_diff text not null, total_score integer not null default 0, total_stars integer not null default 0, chapters_cleared integer not null default 0, is_test boolean not null default false, created_at timestamp with time zone not null default now(), updated_at timestamp with time zone not null default now());
create table public.leaderboard_public (id uuid not null, learner_id uuid not null, display_name text, learning_path text, game_diff text, total_score integer, total_stars integer, chapters_cleared integer, updated_at timestamp with time zone, player_id text, badges integer not null default 0, is_test boolean not null default false);
create table public.learners (id uuid not null default gen_random_uuid(), user_id uuid not null, parent_user_id uuid, name text not null, grade_range text not null, assigned_path text not null, current_diff text not null default 'int'::text, created_at timestamp with time zone not null default now(), updated_at timestamp with time zone not null default now(), is_test boolean not null default false, player_id text not null, start_diff text, completed_diffs text[] not null default '{}'::text[], created_by_educator boolean not null default false);
create table public.profiles (id uuid not null, role text not null, display_name text not null, created_at timestamp with time zone not null default now(), updated_at timestamp with time zone not null default now(), is_admin boolean not null default false, is_test_account boolean not null default false);
create table public.progress_records (id text not null, learner_id uuid not null, user_id uuid not null, learning_path text not null, game_diff text not null, prog jsonb not null default '{}'::jsonb, ach jsonb not null default '[]'::jsonb, badges jsonb not null default '[]'::jsonb, draft jsonb, boss_state jsonb, updated_at timestamp with time zone not null default now(), is_test boolean not null default false);
create table public.site_owner (id integer not null default 1, user_id uuid not null, created_at timestamp with time zone not null default now());



alter table public.admin_audit add constraint admin_audit_pkey PRIMARY KEY (id);
alter table public.ai_usage add constraint ai_usage_pkey PRIMARY KEY (user_id, day, mode);
alter table public.bonus_progress add constraint bonus_progress_pkey PRIMARY KEY (learner_id);
alter table public.bug_reports add constraint bug_reports_pkey PRIMARY KEY (id);
alter table public.coop_challenges add constraint coop_challenges_pkey PRIMARY KEY (id);
alter table public.coop_invites add constraint coop_invites_pkey PRIMARY KEY (id);
alter table public.coop_leaderboard_public add constraint coop_leaderboard_public_pkey PRIMARY KEY (id);
alter table public.coop_matches add constraint coop_matches_pkey PRIMARY KEY (id);
alter table public.coop_rooms add constraint coop_rooms_pkey PRIMARY KEY (id);
alter table public.feedback_entries add constraint feedback_entries_pkey PRIMARY KEY (id);
alter table public.leaderboard_entries add constraint leaderboard_entries_pkey PRIMARY KEY (id);
alter table public.leaderboard_public add constraint leaderboard_public_pkey PRIMARY KEY (id);
alter table public.learners add constraint learners_pkey PRIMARY KEY (id);
alter table public.profiles add constraint profiles_pkey PRIMARY KEY (id);
alter table public.progress_records add constraint progress_records_pkey PRIMARY KEY (id);
alter table public.site_owner add constraint site_owner_pkey PRIMARY KEY (id);
alter table public.coop_matches add constraint coop_matches_room_id_key UNIQUE (room_id);
alter table public.coop_rooms add constraint coop_rooms_code_key UNIQUE (code);
alter table public.leaderboard_entries add constraint unique_learner_path_diff UNIQUE (learner_id, learning_path, game_diff);
alter table public.site_owner add constraint site_owner_user_id_key UNIQUE (user_id);
alter table public.ai_usage add constraint ai_usage_mode_check CHECK ((mode = ANY (ARRAY['tutor'::text, 'support'::text])));
alter table public.bug_reports add constraint bug_reports_length_check CHECK (((char_length(title) <= 150) AND (char_length(description) <= 3000) AND (char_length(page_feature) <= 100) AND (char_length(COALESCE(steps_to_reproduce, ''::text)) <= 3000) AND (char_length(COALESCE(expected_vs_actual, ''::text)) <= 3000) AND (char_length(COALESCE(browser_info, ''::text)) <= 500))) NOT VALID;
alter table public.bug_reports add constraint bug_reports_status_check CHECK ((status = ANY (ARRAY['new'::text, 'investigating'::text, 'fixed'::text, 'closed'::text])));
alter table public.bug_reports add constraint tlp_bug_len CHECK (((char_length(title) <= 120) AND (char_length(description) <= 3000) AND (char_length(COALESCE(steps_to_reproduce, ''::text)) <= 3000) AND (char_length(COALESCE(expected_vs_actual, ''::text)) <= 3000) AND (char_length(COALESCE(browser_info, ''::text)) <= 500) AND (char_length(page_feature) <= 120))) NOT VALID;
alter table public.coop_rooms add constraint coop_rooms_status_check CHECK ((status = ANY (ARRAY['waiting'::text, 'playing'::text, 'finished'::text, 'abandoned'::text])));
alter table public.feedback_entries add constraint feedback_entries_rating_check CHECK (((rating >= 1) AND (rating <= 5)));
alter table public.leaderboard_entries add constraint leaderboard_entries_game_diff_check CHECK ((game_diff = ANY (ARRAY['beg'::text, 'int'::text, 'pro'::text])));
alter table public.leaderboard_entries add constraint leaderboard_entries_learning_path_check CHECK ((learning_path = ANY (ARRAY['g16'::text, 'g710'::text, 'g1112'::text, 'adult'::text])));
alter table public.learners add constraint learners_assigned_path_check CHECK ((assigned_path = ANY (ARRAY['g16'::text, 'g710'::text, 'g1112'::text, 'adult'::text])));
alter table public.learners add constraint learners_current_diff_check CHECK ((current_diff = ANY (ARRAY['beg'::text, 'int'::text, 'pro'::text])));
alter table public.learners add constraint learners_grade_range_check CHECK ((grade_range = ANY (ARRAY['g16'::text, 'g710'::text, 'g1112'::text, 'adult'::text])));
alter table public.learners add constraint learners_start_diff_check CHECK ((start_diff = ANY (ARRAY['beg'::text, 'int'::text, 'pro'::text])));
alter table public.profiles add constraint profiles_role_check CHECK ((role = ANY (ARRAY['learner'::text, 'parent'::text, 'admin'::text])));
alter table public.progress_records add constraint progress_records_game_diff_check CHECK ((game_diff = ANY (ARRAY['beg'::text, 'int'::text, 'pro'::text])));
alter table public.progress_records add constraint progress_records_learning_path_check CHECK ((learning_path = ANY (ARRAY['g16'::text, 'g710'::text, 'g1112'::text, 'adult'::text])));
alter table public.site_owner add constraint site_owner_id_check CHECK ((id = 1));
alter table public.ai_usage add constraint ai_usage_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.bonus_progress add constraint bonus_progress_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE;
alter table public.bug_reports add constraint bug_reports_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.coop_invites add constraint coop_invites_from_learner_fkey FOREIGN KEY (from_learner) REFERENCES learners(id) ON DELETE CASCADE;
alter table public.coop_invites add constraint coop_invites_room_id_fkey FOREIGN KEY (room_id) REFERENCES coop_rooms(id) ON DELETE CASCADE;
alter table public.coop_matches add constraint coop_matches_p1_learner_fkey FOREIGN KEY (p1_learner) REFERENCES learners(id) ON DELETE SET NULL;
alter table public.coop_matches add constraint coop_matches_p2_learner_fkey FOREIGN KEY (p2_learner) REFERENCES learners(id) ON DELETE SET NULL;
alter table public.coop_matches add constraint coop_matches_room_id_fkey FOREIGN KEY (room_id) REFERENCES coop_rooms(id) ON DELETE SET NULL;
alter table public.coop_rooms add constraint coop_rooms_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES coop_challenges(id);
alter table public.coop_rooms add constraint coop_rooms_guest_learner_fkey FOREIGN KEY (guest_learner) REFERENCES learners(id) ON DELETE SET NULL;
alter table public.coop_rooms add constraint coop_rooms_host_learner_fkey FOREIGN KEY (host_learner) REFERENCES learners(id) ON DELETE CASCADE;
alter table public.feedback_entries add constraint feedback_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE SET NULL;
alter table public.leaderboard_entries add constraint leaderboard_entries_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE;
alter table public.leaderboard_entries add constraint leaderboard_entries_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.learners add constraint learners_parent_user_id_fkey FOREIGN KEY (parent_user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.learners add constraint learners_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.profiles add constraint profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.progress_records add constraint progress_records_learner_id_fkey FOREIGN KEY (learner_id) REFERENCES learners(id) ON DELETE CASCADE;
alter table public.progress_records add constraint progress_records_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
alter table public.site_owner add constraint site_owner_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE RESTRICT;



CREATE INDEX idx_bug_reports_status ON public.bug_reports USING btree (status, created_at DESC);
CREATE INDEX coop_leaderboard_public_p1_idx ON public.coop_leaderboard_public USING btree (p1_learner);
CREATE INDEX coop_leaderboard_public_p2_idx ON public.coop_leaderboard_public USING btree (p2_learner);
CREATE INDEX idx_coop_rank ON public.coop_matches USING btree (challenge_id, is_test, score DESC, duration_ms);
CREATE INDEX idx_leaderboard_rank ON public.leaderboard_entries USING btree (learning_path, game_diff, is_test, total_score DESC, total_stars DESC, updated_at);
CREATE INDEX leaderboard_public_badges_idx ON public.leaderboard_public USING btree (learner_id, learning_path, game_diff);
CREATE INDEX idx_learners_user_id ON public.learners USING btree (user_id);
CREATE INDEX idx_learners_parent_user_id ON public.learners USING btree (parent_user_id);
CREATE UNIQUE INDEX learners_player_id_key ON public.learners USING btree (player_id);
CREATE UNIQUE INDEX one_admin_only ON public.profiles USING btree ((1)) WHERE ((role = 'admin'::text) OR is_admin);
CREATE UNIQUE INDEX tlp_one_admin ON public.profiles USING btree ((true)) WHERE ((role = 'admin'::text) OR is_admin);
CREATE INDEX idx_progress_learner_id ON public.progress_records USING btree (learner_id);
CREATE INDEX idx_progress_user_id ON public.progress_records USING btree (user_id);



alter sequence public.admin_audit_id_seq owned by public.admin_audit.id;



CREATE OR REPLACE FUNCTION public.ai_consume(p_mode text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    uid       UUID := auth.uid();
    today     DATE := (now() AT TIME ZONE 'utc')::date;
    user_cap  INTEGER;
    global_cap CONSTANT INTEGER := 800;
    total_today BIGINT;
    n INTEGER;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    IF p_mode = 'tutor' THEN user_cap := 30;
    ELSIF p_mode = 'support' THEN user_cap := 20;
    ELSE RAISE EXCEPTION 'Invalid mode'; END IF;

    SELECT COALESCE(SUM(used), 0) INTO total_today FROM public.ai_usage WHERE day = today;
    IF total_today >= global_cap THEN RETURN 'global_limit'; END IF;

    INSERT INTO public.ai_usage AS u (user_id, day, mode, used)
    VALUES (uid, today, p_mode, 1)
    ON CONFLICT (user_id, day, mode)
    DO UPDATE SET used = u.used + 1 WHERE u.used < user_cap
    RETURNING u.used INTO n;

    IF n IS NULL THEN RETURN 'user_limit'; END IF;
    RETURN 'ok';
END $function$;
CREATE OR REPLACE FUNCTION public.coop_create_room()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    me UUID := public.coop_me();
    ch JSONB := public.coop_get_challenge();
    c TEXT;
    rid UUID;
BEGIN
    UPDATE public.coop_rooms SET status = 'abandoned' WHERE host_learner = me AND status = 'waiting';
    LOOP
        c := upper(substr(md5(random()::TEXT || clock_timestamp()::TEXT), 1, 6));
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.coop_rooms WHERE code = c);
    END LOOP;
    INSERT INTO public.coop_rooms (code, challenge_id, host_learner) VALUES (c, ch ->> 'id', me) RETURNING id INTO rid;
    RETURN jsonb_build_object('room_id', rid, 'code', c);
END $function$;
CREATE OR REPLACE FUNCTION public.coop_get_challenge()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    wk TEXT := to_char(now() AT TIME ZONE 'utc', 'IYYY"-W"IW');
    inst JSONB;
    stations JSONB := '[]'::JSONB;
    s0 INTEGER;
    i INTEGER;
    core_t INTEGER;
BEGIN
    SELECT instance INTO inst FROM public.coop_challenges WHERE id = wk;
    IF inst IS NULL THEN
        PERFORM pg_advisory_xact_lock(727002);
        SELECT instance INTO inst FROM public.coop_challenges WHERE id = wk;
        IF inst IS NULL THEN
            PERFORM setseed(((hashtext(wk) % 1000)::DOUBLE PRECISION) / 1000.0);
            FOR i IN 0..9 LOOP
                s0 := 1 + floor(random() * 6)::INTEGER;
                stations := stations || jsonb_build_object('id', i, 'start', s0, 'target', s0 + 6 + floor(random() * 25)::INTEGER);
            END LOOP;
            core_t := (ARRAY[12, 18, 24, 16, 20, 36])[1 + floor(random() * 6)::INTEGER];
            inst := jsonb_build_object(
                'title', 'Restore the Relay Grid',
                'stations', stations,
                'core', jsonb_build_object('target', core_t),
                'maxStatements', 80);
            INSERT INTO public.coop_challenges (id, instance) VALUES (wk, inst) ON CONFLICT (id) DO NOTHING;
        END IF;
    END IF;
    RETURN jsonb_build_object('id', wk, 'instance', inst);
END $function$;
CREATE OR REPLACE FUNCTION public.coop_invite(p_room uuid, p_player_id text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    me UUID := public.coop_me();
    pid TEXT := upper(btrim(p_player_id));
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.coop_rooms WHERE id = p_room AND host_learner = me AND status = 'waiting') THEN
        RAISE EXCEPTION 'Only the host of an open room can invite';
    END IF;
    IF (SELECT COUNT(*) FROM public.coop_invites WHERE room_id = p_room) >= 5 THEN RAISE EXCEPTION 'Too many invites for this room'; END IF;
    IF pid ~ '^TLP-[0-9]{8}$' AND EXISTS (SELECT 1 FROM public.learners WHERE player_id = pid AND id <> me AND user_id <> auth.uid()) THEN
        INSERT INTO public.coop_invites (room_id, from_learner, to_player_id) VALUES (p_room, me, pid);
    END IF;
    RETURN 'If that Player ID exists, the invite was sent.';
END $function$;
CREATE OR REPLACE FUNCTION public.coop_join_room(p_code text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    me UUID := public.coop_me();
    r public.coop_rooms%ROWTYPE;
BEGIN
    SELECT * INTO r FROM public.coop_rooms WHERE code = upper(btrim(p_code));
    IF NOT FOUND OR r.status <> 'waiting' OR r.expires_at < now() THEN RAISE EXCEPTION 'That room is not open'; END IF;
    IF r.host_learner = me THEN RAISE EXCEPTION 'You are the host of this room'; END IF;
    IF r.guest_learner IS NOT NULL AND r.guest_learner <> me THEN RAISE EXCEPTION 'That room is already full'; END IF;
    UPDATE public.coop_rooms SET guest_learner = me WHERE id = r.id;
    RETURN r.id;
END $function$;
CREATE OR REPLACE FUNCTION public.coop_leave(p_room uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    me UUID := public.coop_me();
    r public.coop_rooms%ROWTYPE;
BEGIN
    SELECT * INTO r FROM public.coop_rooms WHERE id = p_room AND (host_learner = me OR guest_learner = me);
    IF NOT FOUND THEN RETURN 'not in room'; END IF;
    IF r.status = 'waiting' AND r.guest_learner = me THEN
        UPDATE public.coop_rooms SET guest_learner = NULL, guest_ready = false, host_ready = false WHERE id = p_room;
    ELSIF r.status IN ('waiting', 'playing') THEN
        UPDATE public.coop_rooms SET status = 'abandoned' WHERE id = p_room;
    END IF;
    RETURN 'left';
END $function$;
CREATE OR REPLACE FUNCTION public.coop_me()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE lid UUID;
BEGIN
    IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    SELECT id INTO lid FROM public.learners WHERE user_id = auth.uid() ORDER BY created_at LIMIT 1;
    IF lid IS NULL THEN RAISE EXCEPTION 'Only learner accounts can play co-op'; END IF;
    RETURN lid;
END $function$;
CREATE OR REPLACE FUNCTION public.coop_my_active_room()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    me UUID := public.coop_me();
    rid UUID;
BEGIN
    SELECT id INTO rid FROM public.coop_rooms
    WHERE (host_learner = me OR guest_learner = me)
      AND ((status = 'waiting' AND expires_at > now()) OR (status = 'playing' AND started_at > now() - interval '90 minutes'))
    ORDER BY created_at DESC LIMIT 1;
    RETURN rid;
END $function$;
CREATE OR REPLACE FUNCTION public.coop_my_invites()
 RETURNS TABLE(room_id uuid, code text, from_name text, from_player_id text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE me UUID := public.coop_me();
BEGIN
    RETURN QUERY
    SELECT r.id, r.code, hl.name, hl.player_id
    FROM public.coop_invites i
    JOIN public.coop_rooms r ON r.id = i.room_id
    JOIN public.learners hl ON hl.id = r.host_learner
    WHERE i.to_player_id = (SELECT player_id FROM public.learners WHERE id = me)
      AND r.status = 'waiting' AND r.guest_learner IS NULL AND r.expires_at > now()
    ORDER BY i.created_at DESC LIMIT 10;
END $function$;
CREATE OR REPLACE FUNCTION public.coop_room_state(p_room uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    me UUID := public.coop_me();
    r public.coop_rooms%ROWTYPE;
    h public.learners%ROWTYPE;
    g public.learners%ROWTYPE;
    inst JSONB;
BEGIN
    SELECT * INTO r FROM public.coop_rooms WHERE id = p_room AND (host_learner = me OR guest_learner = me);
    IF NOT FOUND THEN RAISE EXCEPTION 'You are not in that room'; END IF;
    SELECT * INTO h FROM public.learners WHERE id = r.host_learner;
    SELECT * INTO g FROM public.learners WHERE id = r.guest_learner;
    SELECT instance INTO inst FROM public.coop_challenges WHERE id = r.challenge_id;
    RETURN jsonb_build_object(
        'room_id', r.id, 'code', r.code, 'status', r.status,
        'role', CASE WHEN r.host_learner = me THEN 'host' ELSE 'guest' END,
        'host', jsonb_build_object('name', h.name, 'player_id', h.player_id, 'ready', r.host_ready),
        'guest', CASE WHEN g.id IS NULL THEN NULL ELSE jsonb_build_object('name', g.name, 'player_id', g.player_id, 'ready', r.guest_ready) END,
        'challenge_id', r.challenge_id, 'instance', inst,
        'started_at', r.started_at, 'server_now', now(), 'expires_at', r.expires_at);
END $function$;
CREATE OR REPLACE FUNCTION public.coop_set_ready(p_room uuid, p_ready boolean)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    me UUID := public.coop_me();
    r public.coop_rooms%ROWTYPE;
BEGIN
    SELECT * INTO r FROM public.coop_rooms WHERE id = p_room AND (host_learner = me OR guest_learner = me);
    IF NOT FOUND THEN RAISE EXCEPTION 'You are not in that room'; END IF;
    IF r.status <> 'waiting' OR r.expires_at < now() THEN RETURN public.coop_room_state(p_room); END IF;
    IF r.host_learner = me THEN UPDATE public.coop_rooms SET host_ready = p_ready WHERE id = p_room;
    ELSE UPDATE public.coop_rooms SET guest_ready = p_ready WHERE id = p_room; END IF;

    UPDATE public.coop_rooms SET status = 'playing', started_at = now()
    WHERE id = p_room AND status = 'waiting' AND host_ready AND guest_ready AND guest_learner IS NOT NULL;
    RETURN public.coop_room_state(p_room);
END $function$;
CREATE OR REPLACE FUNCTION public.delete_my_account(p_confirm text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE uid UUID := auth.uid();
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    IF p_confirm IS DISTINCT FROM 'DELETE MY ACCOUNT AND ALL PROGRESS' THEN
        RAISE EXCEPTION 'The confirmation sentence does not match.';
    END IF;
    IF public.is_admin() THEN RAISE EXCEPTION 'The owner administrator account cannot be deleted here.'; END IF;

    DELETE FROM auth.users WHERE id IN (
        SELECT user_id FROM public.learners WHERE parent_user_id = uid AND user_id <> uid AND created_by_educator);
    DELETE FROM auth.users WHERE id = uid;
    RETURN 'deleted';
END $function$;
CREATE OR REPLACE FUNCTION public.educator_delete_learner(p_learner uuid, p_confirm text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    uid UUID := auth.uid();
    l public.learners%ROWTYPE;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    SELECT * INTO l FROM public.learners WHERE id = p_learner AND parent_user_id = uid AND created_by_educator AND user_id <> uid;
    IF NOT FOUND THEN RAISE EXCEPTION 'Learner not found'; END IF;
    IF upper(btrim(COALESCE(p_confirm, ''))) <> l.player_id THEN
        RAISE EXCEPTION 'Type the learner''s Player ID exactly to confirm.';
    END IF;
    DELETE FROM auth.users WHERE id = l.user_id;
    RETURN 'deleted';
END $function$;
CREATE OR REPLACE FUNCTION public.ensure_my_learner(p_name text, p_grade text, p_diff text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    uid UUID := auth.uid();
    lid UUID;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    IF COALESCE((SELECT role FROM public.profiles WHERE id = uid), 'learner') <> 'learner' THEN
        RAISE EXCEPTION 'Only learner accounts have a learner profile';
    END IF;
    IF p_grade NOT IN ('g16', 'g710', 'g1112', 'adult') OR p_diff NOT IN ('beg', 'int', 'pro') THEN
        RAISE EXCEPTION 'Invalid choice';
    END IF;
    SELECT id INTO lid FROM public.learners WHERE user_id = uid ORDER BY created_at LIMIT 1;
    IF lid IS NULL THEN
        INSERT INTO public.learners (user_id, parent_user_id, name, grade_range, assigned_path, current_diff, start_diff)
        VALUES (uid, NULL, left(btrim(COALESCE(NULLIF(p_name, ''), 'Player')), 32), p_grade, p_grade, p_diff, p_diff)
        RETURNING id INTO lid;
    END IF;
    RETURN lid;
END $function$;
CREATE OR REPLACE FUNCTION public.generate_player_id()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
DECLARE
    candidate TEXT;
    tries INTEGER := 0;
BEGIN
    PERFORM pg_advisory_xact_lock(727001);
    LOOP
        candidate := 'TLP-' || lpad((floor(random() * 100000000))::BIGINT::TEXT, 8, '0');
        EXIT WHEN NOT EXISTS (SELECT 1 FROM public.learners WHERE player_id = candidate);
        tries := tries + 1;
        IF tries > 60 THEN RAISE EXCEPTION 'Could not allocate a Player ID'; END IF;
    END LOOP;
    RETURN candidate;
END $function$;
CREATE OR REPLACE FUNCTION public.guard_leaderboard_entry()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  t BOOLEAN;
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    NEW.user_id       := OLD.user_id;
    NEW.learner_id    := OLD.learner_id;
    NEW.learning_path := OLD.learning_path;
    NEW.game_diff     := OLD.game_diff;
  ELSE
    NEW.user_id := auth.uid();
  END IF;

  SELECT (COALESCE((SELECT is_test_account FROM public.profiles WHERE id = auth.uid()), false)
          OR COALESCE(l.is_test, false))
    INTO t FROM public.learners l WHERE l.id = NEW.learner_id;
  NEW.is_test := COALESCE(t, false);

  NEW.display_name := left(btrim(COALESCE(NEW.display_name, '')), 32);
  IF NEW.display_name = '' THEN NEW.display_name := 'Pilot'; END IF;

  IF NEW.total_score < 0 OR NEW.total_score > 1000000
     OR NEW.total_stars < 0 OR NEW.total_stars > 1000
     OR NEW.chapters_cleared < 0 OR NEW.chapters_cleared > 40 THEN
    RAISE EXCEPTION 'Score values are outside the allowed range.';
  END IF;
  RETURN NEW;
END $function$;
CREATE OR REPLACE FUNCTION public.guard_learner_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.user_id <> auth.uid()
       OR (NEW.parent_user_id IS NOT NULL AND NEW.parent_user_id <> auth.uid()) THEN
      RAISE EXCEPTION 'Not allowed: a learner can only be created for your own account.';
    END IF;
    NEW.is_test := COALESCE((SELECT is_test_account FROM public.profiles WHERE id = auth.uid()), false);
  ELSE
    NEW.user_id        := OLD.user_id;
    NEW.parent_user_id := OLD.parent_user_id;
    NEW.is_test        := OLD.is_test;
  END IF;
  RETURN NEW;
END $function$;
CREATE OR REPLACE FUNCTION public.guard_learner_login_domain()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF lower(COALESCE(NEW.email, '')) LIKE '%@learner.lostprotocol.app'
       AND COALESCE(NEW.raw_app_meta_data ->> 'tlp_learner', '') <> '1' THEN
        RAISE EXCEPTION 'This email domain is reserved.';
    END IF;
    RETURN NEW;
END $function$;
CREATE OR REPLACE FUNCTION public.guard_profile_columns()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF auth.uid() IS NULL OR public.is_admin() THEN
    RETURN NEW;
  END IF;
  IF TG_OP = 'INSERT' THEN
    IF NEW.role NOT IN ('learner', 'parent') OR NEW.is_admin THEN
      RAISE EXCEPTION 'Not allowed: this role cannot be self-assigned.';
    END IF;
  ELSE
    IF NEW.role IS DISTINCT FROM OLD.role
       OR NEW.is_admin IS DISTINCT FROM OLD.is_admin
       OR NEW.is_test_account IS DISTINCT FROM OLD.is_test_account THEN
      RAISE EXCEPTION 'Not allowed: role and account flags can only be changed by an administrator.';
    END IF;
  END IF;
  RETURN NEW;
END $function$;
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    r  TEXT;
    dn TEXT;
    gr TEXT;
    sd TEXT;
BEGIN
    r  := CASE WHEN NEW.raw_user_meta_data ->> 'role' = 'parent' THEN 'parent' ELSE 'learner' END;
    dn := left(btrim(coalesce(nullif(NEW.raw_user_meta_data ->> 'display_name', ''),
                              split_part(coalesce(NEW.email, ''), '@', 1), 'Player')), 60);
    IF dn = '' THEN dn := 'Player'; END IF;
    INSERT INTO public.profiles (id, role, display_name, is_admin, is_test_account)
    VALUES (NEW.id, r, dn, false, false)
    ON CONFLICT (id) DO NOTHING;

    IF r = 'learner' AND COALESCE(NEW.raw_app_meta_data ->> 'tlp_learner', '') <> '1' THEN
        gr := NEW.raw_user_meta_data ->> 'grade_range';
        sd := COALESCE(NEW.raw_user_meta_data ->> 'start_diff', 'int');
        IF gr IN ('g16', 'g710', 'g1112', 'adult') AND sd IN ('beg', 'int', 'pro') THEN
            INSERT INTO public.learners (user_id, parent_user_id, name, grade_range, assigned_path, current_diff, start_diff)
            VALUES (NEW.id, NULL, left(dn, 32), gr, gr, sd, sd);
        END IF;
    END IF;
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END $function$;
CREATE OR REPLACE FUNCTION public.handle_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'pg_catalog', 'public'
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;
CREATE OR REPLACE FUNCTION public.is_admin()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT EXISTS (SELECT 1 FROM public.site_owner WHERE user_id = auth.uid());
$function$;
CREATE OR REPLACE FUNCTION public.learners_player_id_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
    IF TG_OP = 'INSERT' THEN

        IF NOT (auth.uid() IS NULL AND NEW.player_id IS NOT NULL AND NEW.player_id ~ '^TLP-[0-9]{8}$') THEN
            NEW.player_id := public.generate_player_id();
        END IF;
    ELSIF OLD.player_id IS NOT NULL THEN
        NEW.player_id := OLD.player_id;
    ELSIF NEW.player_id IS NULL THEN
        NEW.player_id := public.generate_player_id();
    END IF;
    IF NEW.start_diff IS NULL THEN NEW.start_diff := COALESCE(NEW.current_diff, 'int'); END IF;
    RETURN NEW;
END $function$;
CREATE OR REPLACE FUNCTION public.mark_difficulty_completed(p_learner uuid, p_diff text)
 RETURNS text[]
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    uid UUID := auth.uid();
    l public.learners%ROWTYPE;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    SELECT * INTO l FROM public.learners WHERE id = p_learner AND (user_id = uid OR parent_user_id = uid);
    IF NOT FOUND THEN RAISE EXCEPTION 'Learner not found'; END IF;
    IF p_diff NOT IN ('beg', 'int', 'pro') THEN RAISE EXCEPTION 'Invalid difficulty'; END IF;
    IF NOT EXISTS (SELECT 1 FROM public.progress_records pr
                   WHERE pr.learner_id = p_learner AND pr.game_diff = p_diff AND pr.prog ? '29-0') THEN
        RETURN l.completed_diffs;
    END IF;
    IF NOT (p_diff = ANY (l.completed_diffs)) THEN
        UPDATE public.learners SET completed_diffs = array_append(completed_diffs, p_diff) WHERE id = p_learner
        RETURNING completed_diffs INTO l.completed_diffs;
    END IF;
    RETURN l.completed_diffs;
END $function$;
CREATE OR REPLACE FUNCTION public.preview_test_data()
 RETURNS TABLE(test_profiles_count bigint, test_learners_count bigint, test_progress_count bigint, test_leaderboard_count bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;
CREATE OR REPLACE FUNCTION public.purge_test_data()
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;
CREATE OR REPLACE FUNCTION public.setup_first_admin(p_email text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    target_uid  UUID;
    target_mail TEXT;
    confirmed   TIMESTAMPTZ;
    admin_count INTEGER;
    already     BOOLEAN;
BEGIN
    IF auth.uid() IS NOT NULL THEN
        RAISE EXCEPTION 'Owner setup can only be run from the Supabase SQL Editor.';
    END IF;

    SELECT id, email, email_confirmed_at INTO target_uid, target_mail, confirmed
    FROM auth.users WHERE lower(email) = lower(btrim(p_email)) LIMIT 1;

    IF target_uid IS NULL THEN
        RETURN 'No account found with that exact email. Register it on the website first, then try again. Nothing was changed.';
    END IF;
    IF confirmed IS NULL THEN
        RETURN 'That account''s email is not verified yet. Verify it first, then try again. Nothing was changed.';
    END IF;

    SELECT COUNT(*) INTO admin_count FROM public.profiles WHERE role = 'admin' OR is_admin = true;
    SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = target_uid AND (role = 'admin' OR is_admin = true)) INTO already;

    IF already THEN
        RETURN 'This account is already the administrator. Nothing was changed.';
    END IF;
    IF admin_count > 0 THEN
        RAISE EXCEPTION 'An administrator already exists, so this one-time setup is closed. Nothing was changed.';
    END IF;

    INSERT INTO public.profiles (id, role, display_name, is_admin, is_test_account)
    VALUES (target_uid, 'admin', left(split_part(target_mail, '@', 1), 60), true, false)
    ON CONFLICT (id) DO UPDATE SET role = 'admin', is_admin = true;

    INSERT INTO public.admin_audit (action, target_user, target_email, note)
    VALUES ('setup_first_admin', target_uid, target_mail, 'one-time owner setup');

    RETURN 'Success: ' || target_mail || ' is now the administrator.';
END $function$;
CREATE OR REPLACE FUNCTION public.submit_leaderboard_score(p_learner_id uuid, p_path text, p_diff text, p_display_name text DEFAULT NULL::text, p_chapters integer DEFAULT 0)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    uid UUID := auth.uid();
    lrn public.learners%ROWTYPE;
    prog_json JSONB;
    rec RECORD;
    stars INTEGER := 0;
    seen_chapters INTEGER[] := ARRAY[]::INTEGER[];
    ch INTEGER;
    chapters INTEGER;
    test_flag BOOLEAN;
    alias TEXT;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    IF p_path NOT IN ('g16', 'g710', 'g1112', 'adult') OR p_diff NOT IN ('beg', 'int', 'pro') THEN
        RAISE EXCEPTION 'Invalid path or difficulty';
    END IF;

    SELECT * INTO lrn FROM public.learners
    WHERE id = p_learner_id AND (user_id = uid OR parent_user_id = uid);
    IF NOT FOUND THEN RAISE EXCEPTION 'Learner not found'; END IF;

    SELECT prog INTO prog_json FROM public.progress_records
    WHERE learner_id = p_learner_id AND learning_path = p_path AND game_diff = p_diff;
    IF prog_json IS NULL THEN RAISE EXCEPTION 'No saved progress yet'; END IF;

    FOR rec IN SELECT key, value FROM jsonb_each(prog_json) LOOP
        IF rec.key ~ '^[0-9]{1,2}-[0-9]{1,2}$'
           AND jsonb_typeof(rec.value) = 'number'
           AND (rec.value #>> '{}') ~ '^[1-3]$' THEN
            ch := split_part(rec.key, '-', 1)::INTEGER;
            IF ch <= 29 THEN
                stars := stars + (rec.value #>> '{}')::INTEGER;
                IF NOT (ch = ANY (seen_chapters)) THEN seen_chapters := seen_chapters || ch; END IF;
            END IF;
        END IF;
    END LOOP;


    chapters := LEAST(GREATEST(COALESCE(p_chapters, 0), 0), COALESCE(array_length(seen_chapters, 1), 0));

    test_flag := COALESCE((SELECT is_test_account FROM public.profiles WHERE id = uid), false)
                 OR COALESCE(lrn.is_test, false);
    alias := left(btrim(COALESCE(NULLIF(btrim(p_display_name), ''), lrn.name, 'Pilot')), 32);
    IF alias = '' THEN alias := 'Pilot'; END IF;

    INSERT INTO public.leaderboard_entries AS e
        (learner_id, user_id, display_name, learning_path, game_diff, total_score, total_stars, chapters_cleared, is_test)
    VALUES (p_learner_id, uid, alias, p_path, p_diff, stars * 100, stars, chapters, test_flag)
    ON CONFLICT (learner_id, learning_path, game_diff) DO UPDATE
        SET display_name = EXCLUDED.display_name,
            total_score = EXCLUDED.total_score,
            total_stars = EXCLUDED.total_stars,
            chapters_cleared = EXCLUDED.chapters_cleared,
            is_test = EXCLUDED.is_test

        WHERE e.total_score IS DISTINCT FROM EXCLUDED.total_score
           OR e.total_stars IS DISTINCT FROM EXCLUDED.total_stars
           OR e.chapters_cleared IS DISTINCT FROM EXCLUDED.chapters_cleared
           OR e.display_name IS DISTINCT FROM EXCLUDED.display_name
           OR e.is_test IS DISTINCT FROM EXCLUDED.is_test;

    RETURN jsonb_build_object('score', stars * 100, 'stars', stars, 'chapters', chapters);
END $function$;
CREATE OR REPLACE FUNCTION public.switch_difficulty(p_learner uuid, p_new text, p_confirm text DEFAULT NULL::text)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    uid UUID := auth.uid();
    l public.learners%ROWTYPE;
    allowed BOOLEAN;
BEGIN
    IF uid IS NULL THEN RAISE EXCEPTION 'Sign in required'; END IF;
    SELECT * INTO l FROM public.learners WHERE id = p_learner AND (user_id = uid OR parent_user_id = uid);
    IF NOT FOUND THEN RAISE EXCEPTION 'Learner not found'; END IF;
    IF p_new NOT IN ('beg', 'int', 'pro') THEN RAISE EXCEPTION 'Invalid difficulty'; END IF;
    IF p_new = l.current_diff THEN RETURN 'unchanged'; END IF;

    allowed := p_new = l.start_diff
        OR p_new = ANY (l.completed_diffs)
        OR (p_new = 'int' AND 'beg' = ANY (l.completed_diffs))
        OR (p_new = 'pro' AND 'int' = ANY (l.completed_diffs))
        OR ('pro' = ANY (l.completed_diffs));
    IF allowed THEN
        UPDATE public.learners SET current_diff = p_new WHERE id = p_learner;
        RETURN 'switched';
    END IF;

    IF p_confirm IS DISTINCT FROM 'RESET MY PROGRESS' THEN
        RAISE EXCEPTION 'Type RESET MY PROGRESS to confirm. This starts the learner over at the new difficulty.';
    END IF;
    DELETE FROM public.leaderboard_entries WHERE learner_id = p_learner;
    DELETE FROM public.progress_records WHERE learner_id = p_learner;
    UPDATE public.learners SET current_diff = p_new, start_diff = p_new, completed_diffs = '{}' WHERE id = p_learner;
    RETURN 'reset';
END $function$;
CREATE OR REPLACE FUNCTION public.sync_coop_leaderboard_public()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$begin
  if tg_op = 'DELETE' then
    delete from public.coop_leaderboard_public where id = old.id;
    return old;
  end if;
  if tg_op = 'UPDATE' and old.id <> new.id then
    delete from public.coop_leaderboard_public where id = old.id;
  end if;
  insert into public.coop_leaderboard_public (
    id, p1_learner, p2_learner, challenge_id, score, correct, steps,
    duration_ms, finished_at, p1_player_id, p1_name, p2_player_id, p2_name, is_test
  )
  select
    m.id, m.p1_learner, m.p2_learner, m.challenge_id, m.score, m.correct, m.steps,
    m.duration_ms, m.finished_at,
    coalesce(l1.player_id, 'deleted'),
    coalesce(l1.name, 'Deleted player'),
    coalesce(l2.player_id, 'deleted'),
    coalesce(l2.name, 'Deleted player'),
    coalesce(m.is_test, false)
  from public.coop_matches m
  left join public.learners l1 on l1.id = m.p1_learner
  left join public.learners l2 on l2.id = m.p2_learner
  where m.id = new.id
  on conflict (id) do update set
    p1_learner = excluded.p1_learner,
    p2_learner = excluded.p2_learner,
    challenge_id = excluded.challenge_id,
    score = excluded.score,
    correct = excluded.correct,
    steps = excluded.steps,
    duration_ms = excluded.duration_ms,
    finished_at = excluded.finished_at,
    p1_player_id = excluded.p1_player_id,
    p1_name = excluded.p1_name,
    p2_player_id = excluded.p2_player_id,
    p2_name = excluded.p2_name,
    is_test = excluded.is_test;
  return new;
end;
$function$;
CREATE OR REPLACE FUNCTION public.sync_coop_leaderboard_public_player()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$begin
  if tg_op = 'UPDATE' then
    update public.coop_leaderboard_public set p1_player_id = coalesce(new.player_id, 'deleted'), p1_name = coalesce(new.name, 'Deleted player') where p1_learner = new.id;
    update public.coop_leaderboard_public set p2_player_id = coalesce(new.player_id, 'deleted'), p2_name = coalesce(new.name, 'Deleted player') where p2_learner = new.id;
    return new;
  end if;
  if tg_op = 'DELETE' then
    update public.coop_leaderboard_public set p1_player_id = 'deleted', p1_name = 'Deleted player' where p1_learner = old.id;
    update public.coop_leaderboard_public set p2_player_id = 'deleted', p2_name = 'Deleted player' where p2_learner = old.id;
    return old;
  end if;
  return new;
end;
$function$;
CREATE OR REPLACE FUNCTION public.sync_leaderboard_public_badges()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$begin
  if tg_op in ('UPDATE','DELETE') then
    update public.leaderboard_public lp
    set badges = coalesce((
      select case when jsonb_typeof(pr.badges) = 'array' then jsonb_array_length(pr.badges) else 0 end
      from public.progress_records pr
      where pr.learner_id = old.learner_id and pr.learning_path = old.learning_path and pr.game_diff = old.game_diff
      limit 1
    ), 0)
    where lp.learner_id = old.learner_id and lp.learning_path = old.learning_path and lp.game_diff = old.game_diff;
  end if;
  if tg_op in ('INSERT','UPDATE') then
    update public.leaderboard_public lp
    set badges = coalesce((
      select case when jsonb_typeof(pr.badges) = 'array' then jsonb_array_length(pr.badges) else 0 end
      from public.progress_records pr
      where pr.learner_id = new.learner_id and pr.learning_path = new.learning_path and pr.game_diff = new.game_diff
      limit 1
    ), 0)
    where lp.learner_id = new.learner_id and lp.learning_path = new.learning_path and lp.game_diff = new.game_diff;
  end if;
  if tg_op = 'DELETE' then return old; else return new; end if;
end;
$function$;
CREATE OR REPLACE FUNCTION public.sync_leaderboard_public_entry()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$begin
  if tg_op = 'DELETE' then
    delete from public.leaderboard_public where id = old.id;
    return old;
  end if;

  if tg_op = 'UPDATE' and old.id <> new.id then
    delete from public.leaderboard_public where id = old.id;
  end if;

  insert into public.leaderboard_public (
    id, learner_id, display_name, learning_path, game_diff,
    total_score, total_stars, chapters_cleared, updated_at,
    player_id, badges, is_test
  )
  select
    e.id, e.learner_id, e.display_name, e.learning_path, e.game_diff,
    e.total_score, e.total_stars, e.chapters_cleared, e.updated_at,
    l.player_id,
    coalesce((
      select case when jsonb_typeof(pr.badges) = 'array'
                  then jsonb_array_length(pr.badges) else 0 end
      from public.progress_records pr
      where pr.learner_id = e.learner_id
        and pr.learning_path = e.learning_path
        and pr.game_diff = e.game_diff
      limit 1
    ), 0),
    coalesce(e.is_test, false)
  from public.leaderboard_entries e
  join public.learners l on l.id = e.learner_id
  where e.id = new.id
  on conflict (id) do update set
    learner_id = excluded.learner_id,
    display_name = excluded.display_name,
    learning_path = excluded.learning_path,
    game_diff = excluded.game_diff,
    total_score = excluded.total_score,
    total_stars = excluded.total_stars,
    chapters_cleared = excluded.chapters_cleared,
    updated_at = excluded.updated_at,
    player_id = excluded.player_id,
    badges = excluded.badges,
    is_test = excluded.is_test;

  if not exists (
    select 1 from public.leaderboard_entries e
    join public.learners l on l.id = e.learner_id
    where e.id = new.id
  ) then
    delete from public.leaderboard_public where id = new.id;
  end if;

  return new;
end;
$function$;
CREATE OR REPLACE FUNCTION public.sync_leaderboard_public_player()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$begin
  if tg_op = 'UPDATE' then
    update public.leaderboard_public set player_id = new.player_id where learner_id = new.id;
    return new;
  end if;
  if tg_op = 'DELETE' then
    delete from public.leaderboard_public where learner_id = old.id;
    return old;
  end if;
  return new;
end;
$function$;
CREATE OR REPLACE FUNCTION public.tlp_learners_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE r text;
BEGIN
  IF auth.uid() IS NULL THEN RETURN NEW; END IF;
  IF TG_OP = 'INSERT' THEN
    SELECT role INTO r FROM public.profiles WHERE id = auth.uid();
    IF r IN ('parent', 'admin') OR public.is_admin() THEN
      RAISE EXCEPTION 'Parent, teacher and administrator accounts manage learners but cannot have a playable profile.';
    END IF;
    IF NEW.parent_user_id IS NOT NULL AND NEW.parent_user_id <> auth.uid() THEN
      RAISE EXCEPTION 'Not allowed.';
    END IF;
    NEW.is_test := false; NEW.created_by_educator := false;
  ELSE
    NEW.user_id := OLD.user_id; NEW.parent_user_id := OLD.parent_user_id;
    NEW.is_test := OLD.is_test; NEW.created_by_educator := OLD.created_by_educator; NEW.player_id := OLD.player_id;
  END IF;
  RETURN NEW;
END $function$;
CREATE OR REPLACE FUNCTION public.tlp_profiles_guard()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE allow boolean := coalesce(current_setting('app.allow_admin', true), '') = 'on';
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF (NEW.role = 'admin' OR coalesce(NEW.is_admin, false)) AND NOT allow THEN
      RAISE EXCEPTION 'Administrator accounts cannot be created this way.';
    END IF;
    RETURN NEW;
  END IF;
  IF NOT allow THEN
    IF coalesce(NEW.is_admin, false) IS DISTINCT FROM coalesce(OLD.is_admin, false) THEN
      RAISE EXCEPTION 'Administrator rights cannot be changed this way.';
    END IF;
    IF NEW.role IS DISTINCT FROM OLD.role AND (NEW.role = 'admin' OR OLD.role = 'admin') THEN
      RAISE EXCEPTION 'Administrator rights cannot be changed this way.';
    END IF;
    IF auth.uid() IS NOT NULL THEN NEW.is_test_account := OLD.is_test_account; END IF;
  END IF;
  RETURN NEW;
END $function$;



create or replace view public.public_coop_leaderboard with (security_invoker = true) as  SELECT id,
    challenge_id,
    score,
    correct,
    steps,
    duration_ms,
    finished_at,
    p1_player_id,
    p1_name,
    p2_player_id,
    p2_name
   FROM coop_leaderboard_public
  WHERE (is_test = false);
create or replace view public.public_leaderboard with (security_invoker = true) as  SELECT id,
    display_name,
    learning_path,
    game_diff,
    total_score,
    total_stars,
    chapters_cleared,
    updated_at,
    player_id,
    badges
   FROM leaderboard_public
  WHERE (is_test = false);



CREATE TRIGGER set_bug_reports_updated_at BEFORE UPDATE ON public.bug_reports FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_coop_leaderboard_public AFTER INSERT OR DELETE OR UPDATE ON public.coop_matches FOR EACH ROW EXECUTE FUNCTION sync_coop_leaderboard_public();
CREATE TRIGGER guard_leaderboard BEFORE INSERT OR UPDATE ON public.leaderboard_entries FOR EACH ROW EXECUTE FUNCTION guard_leaderboard_entry();
CREATE TRIGGER set_leaderboard_updated_at BEFORE UPDATE ON public.leaderboard_entries FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_leaderboard_public_entry AFTER INSERT OR DELETE OR UPDATE ON public.leaderboard_entries FOR EACH ROW EXECUTE FUNCTION sync_leaderboard_public_entry();
CREATE TRIGGER guard_learner_columns BEFORE INSERT OR UPDATE ON public.learners FOR EACH ROW EXECUTE FUNCTION guard_learner_columns();
CREATE TRIGGER learners_player_id BEFORE INSERT OR UPDATE ON public.learners FOR EACH ROW EXECUTE FUNCTION learners_player_id_guard();
CREATE TRIGGER set_learners_updated_at BEFORE UPDATE ON public.learners FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER tlp_learners_guard BEFORE INSERT OR UPDATE ON public.learners FOR EACH ROW EXECUTE FUNCTION tlp_learners_guard();
CREATE TRIGGER trg_coop_leaderboard_public_player AFTER DELETE OR UPDATE ON public.learners FOR EACH ROW EXECUTE FUNCTION sync_coop_leaderboard_public_player();
CREATE TRIGGER trg_leaderboard_public_player AFTER DELETE OR UPDATE ON public.learners FOR EACH ROW EXECUTE FUNCTION sync_leaderboard_public_player();
CREATE TRIGGER guard_profile_columns BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION guard_profile_columns();
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER tlp_profiles_guard BEFORE INSERT OR UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION tlp_profiles_guard();
CREATE TRIGGER set_progress_updated_at BEFORE UPDATE ON public.progress_records FOR EACH ROW EXECUTE FUNCTION handle_updated_at();
CREATE TRIGGER trg_leaderboard_public_badges AFTER INSERT OR DELETE OR UPDATE ON public.progress_records FOR EACH ROW EXECUTE FUNCTION sync_leaderboard_public_badges();



alter table public.admin_audit enable row level security;
alter table public.ai_usage enable row level security;
alter table public.bonus_progress enable row level security;
alter table public.bug_reports enable row level security;
alter table public.coop_challenges enable row level security;
alter table public.coop_invites enable row level security;
alter table public.coop_leaderboard_public enable row level security;
alter table public.coop_matches enable row level security;
alter table public.coop_rooms enable row level security;
alter table public.feedback_entries enable row level security;
alter table public.leaderboard_entries enable row level security;
alter table public.leaderboard_public enable row level security;
alter table public.learners enable row level security;
alter table public.profiles enable row level security;
alter table public.progress_records enable row level security;
alter table public.site_owner enable row level security;



create policy "Admins read audit log" on public.admin_audit as permissive for SELECT to public using (is_admin());
create policy "Users read own AI usage" on public.ai_usage as permissive for SELECT to public using (((auth.uid() = user_id) OR is_admin()));
create policy "Learners update own bonus progress" on public.bonus_progress as permissive for UPDATE to public using ((EXISTS ( SELECT 1
   FROM learners l
  WHERE ((l.id = bonus_progress.learner_id) AND (l.user_id = auth.uid()))))) with check ((EXISTS ( SELECT 1
   FROM learners l
  WHERE ((l.id = bonus_progress.learner_id) AND (l.user_id = auth.uid())))));
create policy "Learners write own bonus progress" on public.bonus_progress as permissive for INSERT to public with check ((EXISTS ( SELECT 1
   FROM learners l
  WHERE ((l.id = bonus_progress.learner_id) AND (l.user_id = auth.uid())))));
create policy "Owners read bonus progress" on public.bonus_progress as permissive for SELECT to public using ((is_admin() OR (EXISTS ( SELECT 1
   FROM learners l
  WHERE ((l.id = bonus_progress.learner_id) AND ((l.user_id = auth.uid()) OR (l.parent_user_id = auth.uid())))))));
create policy "Admins can delete bug reports" on public.bug_reports as permissive for DELETE to public using (is_admin());
create policy "Admins can update bug reports" on public.bug_reports as permissive for UPDATE to public using (is_admin());
create policy "Anyone can submit a bug report" on public.bug_reports as permissive for INSERT to public with check ((((user_id IS NULL) OR (user_id = auth.uid())) AND (status = 'new'::text) AND (admin_notes IS NULL)));
create policy "Users view own bugs or admins view all" on public.bug_reports as permissive for SELECT to public using (((auth.uid() = user_id) OR is_admin()));
create policy "Signed-in users read challenges" on public.coop_challenges as permissive for SELECT to authenticated using (true);
create policy "Invite parties read invites" on public.coop_invites as permissive for SELECT to public using ((is_admin() OR (EXISTS ( SELECT 1
   FROM learners l
  WHERE ((l.user_id = auth.uid()) AND ((l.id = coop_invites.from_learner) OR (l.player_id = coop_invites.to_player_id)))))));
create policy "Public reads non-test coop leaderboard projection" on public.coop_leaderboard_public as permissive for SELECT to anon, authenticated using ((is_test = false));
create policy "Admins delete matches" on public.coop_matches as permissive for DELETE to public using (is_admin());
create policy "Admins read matches" on public.coop_matches as permissive for SELECT to public using (is_admin());
create policy "Room members read their room" on public.coop_rooms as permissive for SELECT to public using ((is_admin() OR (EXISTS ( SELECT 1
   FROM learners l
  WHERE ((l.user_id = auth.uid()) AND (l.id = ANY (ARRAY[coop_rooms.host_learner, coop_rooms.guest_learner])))))));
create policy "Admins delete feedback" on public.feedback_entries as permissive for DELETE to public using (is_admin());
create policy "Admins read feedback" on public.feedback_entries as permissive for SELECT to public using (is_admin());
create policy "Anyone can send feedback" on public.feedback_entries as permissive for INSERT to public with check ((((user_id IS NULL) OR (user_id = auth.uid())) AND (char_length(COALESCE(message, ''::text)) <= 800) AND (char_length(COALESCE(name, ''::text)) <= 40) AND (char_length(COALESCE(tags, ''::text)) <= 200) AND (char_length(COALESCE(age_group, ''::text)) <= 40)));
create policy "Admins can update leaderboard entries" on public.leaderboard_entries as permissive for UPDATE to public using (is_admin()) with check (is_admin());
create policy "Only admin deletes leaderboard entries" on public.leaderboard_entries as permissive for DELETE to public using (is_admin());
create policy "Owners and admins read leaderboard" on public.leaderboard_entries as permissive for SELECT to public using (((auth.uid() = user_id) OR is_admin()));
create policy "Public reads non-test leaderboard projection" on public.leaderboard_public as permissive for SELECT to anon, authenticated using ((is_test = false));
create policy "Admins can view all learners" on public.learners as permissive for SELECT to public using (((auth.uid() = user_id) OR (auth.uid() = parent_user_id) OR is_admin()));
create policy "Learners deletable by owner or parent" on public.learners as permissive for DELETE to public using (((auth.uid() = user_id) OR (auth.uid() = parent_user_id)));
create policy "Learners insertable by owner or parent" on public.learners as permissive for INSERT to public with check (((auth.uid() = user_id) OR (auth.uid() = parent_user_id)));
create policy "Learners readable by owner or parent" on public.learners as permissive for SELECT to public using (((auth.uid() = user_id) OR (auth.uid() = parent_user_id)));
create policy "Learners updatable by owner or parent" on public.learners as permissive for UPDATE to public using (((auth.uid() = user_id) OR (auth.uid() = parent_user_id)));
create policy "Admins can view all profiles" on public.profiles as permissive for SELECT to public using (((auth.uid() = id) OR is_admin()));
create policy "Users can insert own profile" on public.profiles as permissive for INSERT to public with check ((auth.uid() = id));
create policy "Users can read own profile" on public.profiles as permissive for SELECT to public using ((auth.uid() = id));
create policy "Users can update own profile" on public.profiles as permissive for UPDATE to public using ((auth.uid() = id)) with check ((auth.uid() = id));
create policy "Admins can view all progress" on public.progress_records as permissive for SELECT to public using (((auth.uid() = user_id) OR is_admin()));
create policy "Progress deletable by owner or parent" on public.progress_records as permissive for DELETE to public using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM learners
  WHERE ((learners.id = progress_records.learner_id) AND ((learners.user_id = auth.uid()) OR (learners.parent_user_id = auth.uid())))))));
create policy "Progress insertable by owner or parent" on public.progress_records as permissive for INSERT to public with check (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM learners
  WHERE ((learners.id = progress_records.learner_id) AND ((learners.user_id = auth.uid()) OR (learners.parent_user_id = auth.uid())))))));
create policy "Progress readable by owner or parent" on public.progress_records as permissive for SELECT to public using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM learners
  WHERE ((learners.id = progress_records.learner_id) AND ((learners.user_id = auth.uid()) OR (learners.parent_user_id = auth.uid())))))));
create policy "Progress updatable by owner or parent" on public.progress_records as permissive for UPDATE to public using (((auth.uid() = user_id) OR (EXISTS ( SELECT 1
   FROM learners
  WHERE ((learners.id = progress_records.learner_id) AND ((learners.user_id = auth.uid()) OR (learners.parent_user_id = auth.uid())))))));



grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.admin_audit to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.admin_audit to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.admin_audit to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.ai_usage to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.ai_usage to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.ai_usage to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.bonus_progress to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.bonus_progress to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.bonus_progress to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.bug_reports to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.bug_reports to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.bug_reports to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_challenges to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_challenges to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_challenges to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_invites to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_invites to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_invites to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_leaderboard_public to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_matches to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_matches to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_matches to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_rooms to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_rooms to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.coop_rooms to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.feedback_entries to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.feedback_entries to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.feedback_entries to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.leaderboard_entries to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.leaderboard_entries to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.leaderboard_entries to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.leaderboard_public to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.learners to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.learners to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.learners to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.profiles to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.profiles to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.profiles to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.progress_records to anon;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.progress_records to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.progress_records to service_role;
grant MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.public_coop_leaderboard to anon;
grant MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.public_coop_leaderboard to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.public_coop_leaderboard to service_role;
grant MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.public_leaderboard to anon;
grant MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE on table public.public_leaderboard to authenticated;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.public_leaderboard to service_role;
grant MAINTAIN, REFERENCES, TRIGGER, TRUNCATE on table public.site_owner to service_role;
grant SELECT (challenge_id) on table public.coop_leaderboard_public to anon;
grant SELECT (challenge_id) on table public.coop_leaderboard_public to authenticated;
grant SELECT (correct) on table public.coop_leaderboard_public to anon;
grant SELECT (correct) on table public.coop_leaderboard_public to authenticated;
grant SELECT (duration_ms) on table public.coop_leaderboard_public to anon;
grant SELECT (duration_ms) on table public.coop_leaderboard_public to authenticated;
grant SELECT (finished_at) on table public.coop_leaderboard_public to anon;
grant SELECT (finished_at) on table public.coop_leaderboard_public to authenticated;
grant SELECT (id) on table public.coop_leaderboard_public to anon;
grant SELECT (id) on table public.coop_leaderboard_public to authenticated;
grant SELECT (is_test) on table public.coop_leaderboard_public to anon;
grant SELECT (is_test) on table public.coop_leaderboard_public to authenticated;
grant SELECT (p1_name) on table public.coop_leaderboard_public to anon;
grant SELECT (p1_name) on table public.coop_leaderboard_public to authenticated;
grant SELECT (p1_player_id) on table public.coop_leaderboard_public to anon;
grant SELECT (p1_player_id) on table public.coop_leaderboard_public to authenticated;
grant SELECT (p2_name) on table public.coop_leaderboard_public to anon;
grant SELECT (p2_name) on table public.coop_leaderboard_public to authenticated;
grant SELECT (p2_player_id) on table public.coop_leaderboard_public to anon;
grant SELECT (p2_player_id) on table public.coop_leaderboard_public to authenticated;
grant SELECT (score) on table public.coop_leaderboard_public to anon;
grant SELECT (score) on table public.coop_leaderboard_public to authenticated;
grant SELECT (steps) on table public.coop_leaderboard_public to anon;
grant SELECT (steps) on table public.coop_leaderboard_public to authenticated;
grant SELECT (badges) on table public.leaderboard_public to anon;
grant SELECT (badges) on table public.leaderboard_public to authenticated;
grant SELECT (chapters_cleared) on table public.leaderboard_public to anon;
grant SELECT (chapters_cleared) on table public.leaderboard_public to authenticated;
grant SELECT (display_name) on table public.leaderboard_public to anon;
grant SELECT (display_name) on table public.leaderboard_public to authenticated;
grant SELECT (game_diff) on table public.leaderboard_public to anon;
grant SELECT (game_diff) on table public.leaderboard_public to authenticated;
grant SELECT (id) on table public.leaderboard_public to anon;
grant SELECT (id) on table public.leaderboard_public to authenticated;
grant SELECT (is_test) on table public.leaderboard_public to anon;
grant SELECT (is_test) on table public.leaderboard_public to authenticated;
grant SELECT (learning_path) on table public.leaderboard_public to anon;
grant SELECT (learning_path) on table public.leaderboard_public to authenticated;
grant SELECT (player_id) on table public.leaderboard_public to anon;
grant SELECT (player_id) on table public.leaderboard_public to authenticated;
grant SELECT (total_score) on table public.leaderboard_public to anon;
grant SELECT (total_score) on table public.leaderboard_public to authenticated;
grant SELECT (total_stars) on table public.leaderboard_public to anon;
grant SELECT (total_stars) on table public.leaderboard_public to authenticated;
grant SELECT (updated_at) on table public.leaderboard_public to anon;
grant SELECT (updated_at) on table public.leaderboard_public to authenticated;
grant EXECUTE on function public.ai_consume(p_mode text) to authenticated;
grant EXECUTE on function public.coop_create_room() to authenticated;
grant EXECUTE on function public.coop_get_challenge() to authenticated;
grant EXECUTE on function public.coop_invite(p_room uuid, p_player_id text) to authenticated;
grant EXECUTE on function public.coop_join_room(p_code text) to authenticated;
grant EXECUTE on function public.coop_leave(p_room uuid) to authenticated;
grant EXECUTE on function public.coop_me() to authenticated;
grant EXECUTE on function public.coop_my_active_room() to authenticated;
grant EXECUTE on function public.coop_my_invites() to authenticated;
grant EXECUTE on function public.coop_room_state(p_room uuid) to authenticated;
grant EXECUTE on function public.coop_set_ready(p_room uuid, p_ready boolean) to authenticated;
grant EXECUTE on function public.delete_my_account(p_confirm text) to authenticated;
grant EXECUTE on function public.educator_delete_learner(p_learner uuid, p_confirm text) to authenticated;
grant EXECUTE on function public.ensure_my_learner(p_name text, p_grade text, p_diff text) to authenticated;
grant EXECUTE on function public.is_admin() to anon;
grant EXECUTE on function public.is_admin() to authenticated;
grant EXECUTE on function public.mark_difficulty_completed(p_learner uuid, p_diff text) to authenticated;
grant EXECUTE on function public.preview_test_data() to authenticated;
grant EXECUTE on function public.purge_test_data() to authenticated;
grant EXECUTE on function public.submit_leaderboard_score(p_learner_id uuid, p_path text, p_diff text, p_display_name text, p_chapters integer) to authenticated;
grant EXECUTE on function public.switch_difficulty(p_learner uuid, p_new text, p_confirm text) to authenticated;
