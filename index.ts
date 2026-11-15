// deno-lint-ignore-file
// =============================================================================
// THE LOST PROTOCOL — Edge Function "learner-admin"
// Lets a signed-in Parent / Educator create child accounts (Player ID + password)
// and reset their passwords. The Supabase service key is read from the function's
// own environment here. It never reaches the browser.
// =============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });
const clean = (v, n) => String(v ?? "").replace(/[\u0000-\u001f\u007f<>]/g, " ").replace(/\s+/g, " ").trim().slice(0, n);
const DOMAIN = "learner.lostprotocol.app";
const PATHS = ["g16", "g710", "g1112", "adult"];
const DIFFS = ["beg", "int", "pro"];
const MAX_LEARNERS = 60;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "signin" }, 401);
  const asUser = createClient(url, Deno.env.get("SUPABASE_ANON_KEY"), { global: { headers: { Authorization: authHeader } } });
  const { data: u } = await asUser.auth.getUser();
  if (!u || !u.user) return json({ error: "signin" }, 401);

  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"), { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: prof } = await admin.from("profiles").select("role").eq("id", u.user.id).single();
  if (!prof || prof.role !== "parent") return json({ error: "not_educator" }, 403);

  let body;
  try { body = await req.json(); } catch (_e) { return json({ error: "bad_request" }, 400); }

  if (body.action === "createLearner") {
    const name = clean(body.name, 32), grade = String(body.gradeRange), diff = String(body.startDiff), pw = String(body.password ?? "");
    if (name.length < 2 || !PATHS.includes(grade) || !DIFFS.includes(diff)) return json({ error: "bad_request" }, 400);
    if (pw.length < 6 || pw.length > 72) return json({ error: "weak_password" }, 400);
    const { count } = await admin.from("learners").select("id", { count: "exact", head: true }).eq("parent_user_id", u.user.id).eq("created_by_educator", true);
    if ((count ?? 0) >= MAX_LEARNERS) return json({ error: "limit_reached" }, 409);

    const { data: pid, error: pidErr } = await admin.rpc("generate_player_id");
    if (pidErr || !pid) { console.error("player id failed"); return json({ error: "server" }, 500); }
    const { data: created, error: cErr } = await admin.auth.admin.createUser({
      email: String(pid).toLowerCase() + "@" + DOMAIN, password: pw, email_confirm: true,
      app_metadata: { tlp_learner: "1" }, user_metadata: { role: "learner", display_name: name },
    });
    if (cErr || !created || !created.user) { console.error("create user failed"); return json({ error: "server" }, 500); }
    const { data: lrn, error: lErr } = await admin.from("learners").insert({
      user_id: created.user.id, parent_user_id: u.user.id, name, grade_range: grade, assigned_path: grade,
      current_diff: diff, start_diff: diff, created_by_educator: true, player_id: pid,
    }).select("id, player_id").single();
    if (lErr) { await admin.auth.admin.deleteUser(created.user.id); console.error("learner insert failed"); return json({ error: "server" }, 500); }
    return json({ playerId: lrn.player_id, learnerId: lrn.id });
  }

  if (body.action === "resetPassword") {
    const pw = String(body.password ?? "");
    if (pw.length < 6 || pw.length > 72) return json({ error: "weak_password" }, 400);
    const { data: l } = await admin.from("learners").select("user_id, parent_user_id, created_by_educator").eq("id", String(body.learnerId)).single();
    if (!l || l.parent_user_id !== u.user.id || !l.created_by_educator) return json({ error: "not_found" }, 404);
    const { error } = await admin.auth.admin.updateUserById(l.user_id, { password: pw });
    if (error) return json({ error: "server" }, 500);
    return json({ ok: true });
  }
  return json({ error: "bad_request" }, 400);
});