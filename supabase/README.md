# Supabase

The live project is authoritative. Repository SQL is historical reference; it does not define the current database.

- Project: `gkycmrivyqxknvkgdffr` (EU West, Postgres 17)
- Dashboard: https://supabase.com/dashboard/project/gkycmrivyqxknvkgdffr

## Layout

| Path | Purpose |
| --- | --- |
| `migrations/20261115000000_baseline_public_schema.sql` | Historical snapshot of the public schema generated on 2026-11-15. Reference only. |
| `migrations/20261115000001_grant_service_role_app_tables.sql` | Service role grants used by the edge functions. |
| `migrations/20261115000002_grant_browser_table_access.sql` | Browser role privileges; score inserts remain RPC-only. |
| `migrations/20261115000003_learner_login_allowlist.sql` | Service-role-only allowlist for educator-created learners. |
| `migrations/20261117000000_learner_signin_tokens.sql` | Single-use, short-lived parent-issued sign-in codes. |
| `migrations/20261122000000_lifeline_avatar.sql` | Avatar columns, public leaderboard avatar projection and lifeline RPCs. Inspect the live schema before reuse. |
| `migrations/20261124000003_remove_coop.sql` | Historical removal of the retired co-op schema. Do not apply it to the current live project; co-op was rebuilt later. |
| `migrations/20261125000000_persist_avatar_customization.sql` | Validated avatar persistence for learner and parent-owned profiles. |
| `migrations/20261126000000_friend_requests.sql` | Pending requests, reciprocal friendships, notifications, ownership checks and realtime policies. |
| `functions/learner-admin/` | Parent-only learner creation and password resets. |
| `functions/learner-qr/` | Parent-issued one-time sign-in codes. |

## Making a schema change

1. Inspect the live schema first. Do not assume the baseline is current.
2. Write the exact SQL you intend to run.
3. Add it as a new timestamped migration, wrapped so it is re-runnable where possible.
4. Apply it in the dashboard SQL editor.
5. Verify the result with catalog queries and an API request.
6. Keep the migration in the repo so the change is reproducible.

## Rules

- Never re-run old `legacy/*.sql` files. They predate the live schema and can overwrite current functions.
- Keep the browser key publishable. The service-role key belongs only in edge-function secrets.
- `public.site_owner` stays locked (RLS on, no policies). Only `is_admin()` reads it.
- Leaderboard totals are recomputed server-side from saved progress; the client remains responsible for single-player progress integrity.
- Trigger-bound security-definer functions must not be executable through the API. Keep only intentional RPC entry points granted to `authenticated`.
- Auth dashboard settings are not SQL; record any changes separately.

The checked-in baseline and removal migration are historical. They do not capture the rebuilt co-op schema. Inspect and export the live schema before setting up a new database, and do not apply these migrations blindly. The live database remains authoritative.
