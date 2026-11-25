// deno-lint-ignore-file
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": Deno.env.get("ALLOWED_ORIGIN") ?? "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const json = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

const TTL_MS = 10 * 60 * 1000;
const MAX_PER_HOUR = 20;
const KEEP_MS = 24 * 60 * 60 * 1000;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CODE = /^[A-Za-z0-9_-]{40,64}$/;

const enc = new TextEncoder();
const b64url = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const newCode = () => {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return b64url(bytes);
};
const hashCode = async (code: string) => {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(code));
  return Array.from(new Uint8Array(digest)).map((b) => b.toString(16).padStart(2, "0")).join("");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "method" }, 405);

  const url = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  if (!url || !serviceKey || !anonKey) return json({ error: "server" }, 500);

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body;
  try { body = await req.json(); } catch (_e) { return json({ error: "bad_request" }, 400); }
  const action = String(body.action ?? "");

  try {



    if (action === "redeem") {
      const raw = String(body.token ?? "");
      if (!CODE.test(raw)) return json({ error: "expired" }, 410);
      const hash = await hashCode(raw);

      const { data: row, error: findErr } = await admin
        .from("learner_signin_tokens")
        .select("token_hash, learner_id, learner_user_id, expires_at, used_at")
        .eq("token_hash", hash)
        .maybeSingle();
      if (findErr) return json({ error: "server" }, 500);


      if (!row || row.used_at || new Date(row.expires_at).getTime() <= Date.now()) {
        return json({ error: "expired" }, 410);
      }

      const { data: learner } = await admin
        .from("learners")
        .select("name, player_id")
        .eq("id", row.learner_id)
        .maybeSingle();
      if (!learner) return json({ error: "expired" }, 410);

      const { data: acc, error: accErr } = await admin.auth.admin.getUserById(row.learner_user_id);
      const email = acc && acc.user && acc.user.email;
      if (accErr || !email) return json({ error: "server" }, 500);



      const { data: link, error: linkErr } = await admin.auth.admin.generateLink({ type: "magiclink", email });
      const magic = link && link.properties && link.properties.hashed_token;
      if (linkErr || !magic) {
        console.error("learner-qr magic link failed: " + (linkErr && linkErr.message));
        return json({ error: "server" }, 500);
      }



      const { data: claimed, error: claimErr } = await admin
        .from("learner_signin_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("token_hash", hash)
        .is("used_at", null)
        .gt("expires_at", new Date().toISOString())
        .select("token_hash");
      if (claimErr) return json({ error: "server" }, 500);
      if (!claimed || claimed.length !== 1) return json({ error: "expired" }, 410);

      return json({
        magicToken: magic,
        learner: { name: learner.name, playerId: learner.player_id },
      });
    }


    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "signin" }, 401);
    const asUser = createClient(url, anonKey, { global: { headers: { Authorization: authHeader } } });
    const { data: u } = await asUser.auth.getUser();
    if (!u || !u.user) return json({ error: "signin" }, 401);
    const { data: prof } = await admin.from("profiles").select("role").eq("id", u.user.id).single();
    if (!prof || prof.role !== "parent") return json({ error: "not_educator" }, 403);


    if (action === "status") {
      const raw = String(body.token ?? "");
      if (!CODE.test(raw)) return json({ error: "bad_request" }, 400);
      const { data: row } = await admin
        .from("learner_signin_tokens")
        .select("parent_user_id, expires_at, used_at")
        .eq("token_hash", await hashCode(raw))
        .maybeSingle();
      if (!row || row.parent_user_id !== u.user.id) return json({ error: "not_found" }, 404);
      return json({
        used: Boolean(row.used_at),
        expired: new Date(row.expires_at).getTime() <= Date.now(),
        expiresAt: row.expires_at,
      });
    }


    if (action === "create") {
      const learnerId = String(body.learnerId ?? "");
      if (!UUID.test(learnerId)) return json({ error: "not_found" }, 404);

      const { data: l } = await admin
        .from("learners")
        .select("id, user_id, parent_user_id, created_by_educator, name, player_id")
        .eq("id", learnerId)
        .maybeSingle();


      if (!l || l.parent_user_id !== u.user.id || !l.created_by_educator || !l.user_id) {
        return json({ error: "not_found" }, 404);
      }

      const hourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const { count } = await admin
        .from("learner_signin_tokens")
        .select("token_hash", { count: "exact", head: true })
        .eq("parent_user_id", u.user.id)
        .gt("created_at", hourAgo);
      if ((count ?? 0) >= MAX_PER_HOUR) return json({ error: "rate_limited" }, 429);


      const cutoff = new Date(Date.now() - KEEP_MS).toISOString();
      await admin.from("learner_signin_tokens").delete().lt("created_at", cutoff);


      await admin.from("learner_signin_tokens")
        .delete()
        .eq("learner_id", l.id)
        .is("used_at", null);

      const code = newCode();
      const expiresAt = new Date(Date.now() + TTL_MS).toISOString();
      const { error: insErr } = await admin.from("learner_signin_tokens").insert({
        token_hash: await hashCode(code),
        learner_id: l.id,
        learner_user_id: l.user_id,
        parent_user_id: u.user.id,
        expires_at: expiresAt,
      });
      if (insErr) {
        console.error("learner-qr insert failed: " + insErr.message);
        return json({ error: "server" }, 500);
      }

      return json({
        token: code,
        expiresAt,
        learner: { name: l.name, playerId: l.player_id },
      });
    }

    return json({ error: "bad_request" }, 400);
  } catch (e) {
    console.error("learner-qr failed: " + (e instanceof Error ? e.message : String(e)));
    return json({ error: "server" }, 500);
  }
});
