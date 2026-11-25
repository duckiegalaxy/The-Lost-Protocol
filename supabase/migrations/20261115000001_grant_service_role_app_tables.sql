grant select on table public.learners         to service_role;
grant insert on table public.learners         to service_role;
grant select on table public.profiles         to service_role;

grant execute on function public.generate_player_id() to service_role;
