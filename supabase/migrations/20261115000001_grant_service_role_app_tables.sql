-- =============================================================================
-- THE LOST PROTOCOL — server-side grants for the edge functions
-- The Edge Functions (coop-submit, learner-admin) talk to PostgREST with the
-- service role key. That role bypasses RLS but still needs table privileges;
-- without them every query answers "permission denied for table ...".
-- Only the minimum needed by those two functions is granted here.
-- Browser access (anon / authenticated) is deliberately left unchanged.
-- =============================================================================

grant select on table public.coop_rooms       to service_role;
grant update on table public.coop_rooms       to service_role;
grant select on table public.coop_matches     to service_role;
grant insert on table public.coop_matches     to service_role;
grant select on table public.coop_challenges  to service_role;
grant select on table public.learners         to service_role;
grant insert on table public.learners         to service_role;
grant select on table public.profiles         to service_role;

grant execute on function public.generate_player_id() to service_role;
