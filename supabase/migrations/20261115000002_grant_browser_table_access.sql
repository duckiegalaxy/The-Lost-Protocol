-- 20261115000002_grant_browser_table_access.sql
--
-- Purpose
--   The browser client (tlp-auth.js, bonus.html) talks to PostgREST directly for
--   profile, learner, progress and feedback data. Row Level Security already
--   defines exactly which rows each user may touch, but the roles held no table
--   privileges at all, so every request failed before RLS was even consulted.
--   These grants let requests reach the policies; they do not widen what a user
--   can see or change.
--
-- Scope notes
--   - leaderboard_entries stays INSERT-less: scores are computed only by
--     submit_leaderboard_score(). The browser may read its own rows and delete
--     its own row.
--   - anon gets INSERT on the two tables whose policies explicitly accept
--     anonymous submissions ("Anyone can ..."), and nothing else.
--   - The second half revokes leftover MAINTAIN/REFERENCES/TRIGGER/TRUNCATE
--     grants that were applied to every table but are unusable through the
--     Data API and unnecessary for these roles.
--
-- Re-runnable: every statement is idempotent.

begin;

grant select, insert, update          on table public.profiles          to authenticated;
grant select, insert, update          on table public.learners          to authenticated;
grant select, insert, update          on table public.progress_records  to authenticated;
grant select, insert, update          on table public.bonus_progress    to authenticated;
grant select, delete                  on table public.leaderboard_entries to authenticated;
grant select, insert, update          on table public.bug_reports       to authenticated;
grant select, insert                  on table public.feedback_entries  to authenticated;
grant select                          on table public.coop_matches      to authenticated;

grant insert                          on table public.bug_reports       to anon;
grant insert                          on table public.feedback_entries  to anon;

revoke maintain, references, trigger, truncate
  on all tables in schema public
  from anon, authenticated;

commit;
