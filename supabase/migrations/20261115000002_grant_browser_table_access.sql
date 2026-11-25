begin;

grant select, insert, update          on table public.profiles          to authenticated;
grant select, insert, update          on table public.learners          to authenticated;
grant select, insert, update          on table public.progress_records  to authenticated;
grant select, insert, update          on table public.bonus_progress    to authenticated;
grant select, delete                  on table public.leaderboard_entries to authenticated;
grant select, insert, update          on table public.bug_reports       to authenticated;
grant select, insert                  on table public.feedback_entries  to authenticated;

grant insert                          on table public.bug_reports       to anon;
grant insert                          on table public.feedback_entries  to anon;

revoke maintain, references, trigger, truncate
  on all tables in schema public
  from anon, authenticated;

commit;
