// =============================================================================
// THE LOST PROTOCOL — BACKEND CONFIGURATION
// =============================================================================
// This file configures the cloud authentication and progress sync backend.
// The Lost Protocol uses Supabase (PostgreSQL + Auth), which provides a generous,
// permanent free tier (50,000 monthly active users, 500 MB database, Row Level Security)
// with NO credit card or billing activation required.
//
// INSTRUCTIONS:
// 1. Create a free account at https://supabase.com
// 2. Create a new project (e.g., "the-lost-protocol").
// 3. In your Supabase Dashboard, go to "Project Settings" -> "API".
// 4. Copy your "Project URL" and paste it into SUPABASE_URL below.
// 5. Copy your "anon public" API key and paste it into SUPABASE_ANON_KEY below.
// 6. The live database is the source of truth. Do not paste any file from
//    supabase/legacy/ into the SQL editor. See supabase/README.md.
//
// IMPORTANT SECURITY RULE:
// Only paste the "anon" (public) key here.
// NEVER put your "service_role" (secret) key in browser code!
//
// When these keys are empty, The Lost Protocol runs in offline/local mode,
// storing isolated progress in the browser with full account & learner simulation.
// =============================================================================

window.TLP_CONFIG = {
  // Your Supabase Project URL (e.g. 'https://abcdefghijklmnopqrst.supabase.co')
  SUPABASE_URL: 'https://gkycmrivyqxknvkgdffr.supabase.co',

  // Your Supabase Public Anon Key (safe for browser distribution)
  SUPABASE_ANON_KEY: 'sb_publishable_VyRFIAPrfv2_Pip2DzUjog_GkPfz1Vr',

  // Optional: Backend Environment Label ('production', 'development', 'local')
  ENVIRONMENT: 'production',

  // Version identifier for sync schema compatibility
  SCHEMA_VERSION: '2.1.0'
};
