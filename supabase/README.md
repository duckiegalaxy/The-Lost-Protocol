# Supabase

The live project is authoritative. Repository SQL mirrors the database; it does not define it.

- Project: `gkycmrivyqxknvkgdffr` (EU West, Postgres 17)
- Dashboard: https://supabase.com/dashboard/project/gkycmrivyqxknvkgdffr

## Layout

| Path | Purpose |
| --- | --- |
| `migrations/20261115000000_baseline_public_schema.sql` | Point-in-time dump of the live `public` schema generated from `pg_catalog` on 2026-11-15. Reference and recovery only. |
| `migrations/20261115000001_grant_service_role_app_tables.sql` | Minimum `service_role` table and function grants used by `coop-submit` and `learner-admin`. |
| `migrations/20261115000002_grant_browser_table_access.sql` | The `anon`/`authenticated` table privileges the browser app needs. `leaderboard_entries` INSERT stays RPC-only so scores remain server-computed. |
| `functions/coop-submit/` | Deno edge function that re-simulates and scores co-op submissions server-side. |
| `functions/learner-admin/` | Deno edge function for parent-only learner creation and password resets. |
| `legacy/` | Old schema and migration files. Historical only. |

## Making a schema change

1. Inspect the live schema first (Table Editor or SQL editor). Do not assume the baseline is current.
2. Write the exact SQL you intend to run.
3. Add it as a new file in `migrations/` named `YYYYMMDDHHMMSS_short_description.sql`, wrapped so it is re-runnable where possible.
4. Apply it in the dashboard SQL editor.
5. Verify the result (catalog query, API request, advisor).
6. Keep the file in the repo so the change is reproducible.

## Rules

- Never paste `legacy/*.sql` into the SQL editor. Those files predate the live schema and would overwrite working functions (for example the co-op RPCs and `submit_leaderboard_score`).
- Keep the browser key publishable. The service-role key belongs only in edge-function secrets.
- `public.site_owner` stays locked (RLS on, no policies). Only `is_admin()` reads it.
- Leaderboard scores are computed server-side from saved progress. `coop-submit` recomputes the match; never accept a browser-sent score.
- Security-definer functions that are bound to triggers must not be executable through the API. Game RPCs (`delete_my_account`, `switch_difficulty`, `submit_leaderboard_score`, co-op RPCs) are intentional entry points and keep `authenticated` EXECUTE.
- Auth dashboard settings (leaked-password protection, providers) are not SQL. Record any change in the PR or commit message.

## What the baseline contains

Tables, columns, defaults, constraints, indexes, sequences, functions (with their `search_path`), views (including `security_invoker = true`), triggers, RLS enablement, policies, and grants for `anon`, `authenticated`, and `service_role`.

It does not contain data, extension-owned objects, `auth`/`storage` schemas, or project-level Auth settings.

## Known state at baseline

- `public_leaderboard` and `public_coop_leaderboard` are invoker views over the `leaderboard_public` and `coop_leaderboard_public` projection tables. Both projection tables are RLS-protected and grant only public-safe columns; `learner_id`, `p1_learner`, and `p2_learner` are not exposed.
- Base tables grant no `SELECT`/`INSERT`/`UPDATE`/`DELETE` to `anon` or `authenticated`; only the projection views are readable through the Data API. Direct browser access to `learners`, `profiles`, `progress_records`, etc. is therefore not enabled. Decide explicitly before granting it.
- `service_role` has only the grants the edge functions need (`coop_rooms` select/update, `coop_matches` select/insert, `coop_challenges` select, `learners` select/insert, `profiles` select, `generate_player_id` execute). Add to that list only when a function needs it.
- Leaked-password protection is off and cannot be turned on: the setting is rejected with "Configuring leaked password protection via HaveIBeenPwned.org is available on Pro Plans and up." Minimum password length is 6. Revisit on a Pro plan, or enforce strength in `learner-admin` for educator-created accounts.
