/**
 * Fightzone Stripe + Supabase Worker
 * ---------------------------------
 * Endpoints:
 *  - GET  /api/ping            -> "ok"
 *  - GET  /api/streams-sync    -> fetches ppv streams and normalizes for Fightzone
 *  - POST /api/checkout        -> creates Stripe Checkout Session, returns { url }
 *  - POST /api/stripe-webhook  -> Stripe webhook (checkout.session.completed), updates Supabase
 *
 * Cloudflare env (Variables/Secrets):
 *  - SITE_URL (plaintext)                     e.g. https://fightzone.com or http://127.0.0.1:5500
 *  - SUPABASE_URL (plaintext)                 https://xxxx.supabase.co
 *  - SUPABASE_ANON_KEY (plaintext)
 *  - SUPABASE_SERVICE_ROLE_KEY (SECRET)       never expose in frontend
 *  - STRIPE_SECRET_KEY (SECRET)               sk_test_... or sk_live_...
 *  - STRIPE_WEBHOOK_SECRET (SECRET)           whsec_...
 *    Optional:
 *  - STRIPE_WEBHOOK_SECRET_ALT (SECRET)
 *  - ALLOW_ORIGIN (plaintext)                 optional fixed allowed origin
 *
 *  - STRIPE_PRICE_ONE_TIME (plaintext)        price_...
 *  - STRIPE_PRICE_PASS (plaintext)            price_...
 *  - STRIPE_PRICE_ELITE (plaintext)           price_...
 *
 * IMPORTANT:
 *  - one_time uses mode="payment"
 *  - pass uses mode="subscription"
 *  - elite uses mode="payment" (lifetime one-time)
 */

const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, ...extraHeaders },
  });
}

function readOrigin(request, env) {
  const origin = request.headers.get("Origin") || "";
  return env.ALLOW_ORIGIN || origin || "*";
}

function corsHeaders(request, env) {
  const allowOrigin = readOrigin(request, env);
  return {
    "access-control-allow-origin": allowOrigin,
    "access-control-allow-methods": "GET,POST,OPTIONS",
    "access-control-allow-headers": "content-type, authorization, stripe-signature",
    "access-control-max-age": "86400",
  };
}

function withCors(request, env, res) {
  return new Response(res.body, {
    status: res.status,
    headers: {
      ...Object.fromEntries(res.headers),
      ...corsHeaders(request, env),
    },
  });
}

function requireEnv(env, keys) {
  for (const k of keys) {
    if (!env[k]) throw new Error(`Missing env: ${k}`);
  }
}

async function stripeRequest(env, path, opts = {}) {
  const url = "https://api.stripe.com/v1" + path;
  const headers = {
    Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
    "Content-Type": "application/x-www-form-urlencoded",
    ...(opts.headers || {}),
  };

  const res = await fetch(url, { ...opts, headers });
  const text = await res.text();

  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { raw: text };
  }

  if (!res.ok) {
    const msg = data?.error?.message || `Stripe error (${res.status})`;
    throw new Error(msg);
  }

  return data;
}

/* -------------------- Generic fetch helpers -------------------- */

async function fetchJson(url, init = {}) {
  const res = await fetch(url, init);
  if (!res.ok) {
    throw new Error(`Fetch failed ${res.status}: ${url}`);
  }
  return await res.json();
}

function uniqueStrings(arr) {
  return [...new Set((Array.isArray(arr) ? arr : []).filter(Boolean).map((x) => String(x).trim()))];
}

/* -------------------- PPV API helpers -------------------- */

async function getPpvDomains() {
  const data = await fetchJson("https://api.ppv.to/api/ping");
  const domains = Array.isArray(data?.domains) ? data.domains : [];
  return uniqueStrings(["api.ppv.to", ...domains]);
}

async function getPpvStreams() {
  const domains = await getPpvDomains();
  let lastErr = null;

  for (const domain of domains) {
    try {
      const data = await fetchJson(`https://${domain}/api/streams`);

      if (data?.success && Array.isArray(data?.streams)) {
        return {
          source_domain: domain,
          data,
        };
      }
    } catch (e) {
      lastErr = e;
    }
  }

  throw lastErr || new Error("No working PPV domains");
}

function normalizeFightzoneStreams(apiData) {
  const out = [];
  const groups = Array.isArray(apiData?.streams) ? apiData.streams : [];
  const nowMs = Date.now();

  for (const group of groups) {
    const category = String(group?.category || "").trim();
    const categoryId = group?.id ?? null;
    const groupAlwaysLive = Number(group?.always_live || 0);

    const streams = Array.isArray(group?.streams) ? group.streams : [];
    for (const s of streams) {
      const uri = String(s?.uri_name || "").trim();
      if (!uri) continue;

      const startsAt = Number(s?.starts_at || 0);
      const endsAt = Number(s?.ends_at || 0);
      const startsMs = startsAt > 0 ? startsAt * 1000 : 0;
      const endsMs = endsAt > 0 ? endsAt * 1000 : 0;
      const alwaysLive = Number(s?.always_live || groupAlwaysLive || 0) === 1;

      out.push({
        category,
        category_id: categoryId,
        id: s?.id ?? null,
        name: String(s?.name || "").trim(),
        title: String(s?.name || "").trim(),
        tag: String(s?.tag || "").trim(),
        poster: String(s?.poster || "").trim(),
        uri_name: uri,
        starts_at: startsAt,
        ends_at: endsAt,
        always_live: alwaysLive ? 1 : 0,
        category_name: String(s?.category_name || category || "").trim(),
        allowpaststreams: Number(s?.allowpaststreams || 0),
        iframe_url: `https://pooembed.eu/embed/${uri}`,
        is_live: alwaysLive || (startsMs > 0 && endsMs > 0 && nowMs >= startsMs && nowMs <= endsMs),
        is_ended: !alwaysLive && endsMs > 0 && nowMs > endsMs,
      });
    }
  }

  return out;
}

function filterFightzoneStreams(events, url) {
  const categoryParam = url.searchParams.get("category");
  const q = (url.searchParams.get("q") || "").trim().toLowerCase();
  const includeEnded = url.searchParams.get("includeEnded") === "1";

  let filtered = events;

  if (categoryParam) {
    const wanted = uniqueStrings(categoryParam.split(",").map((x) => x.toLowerCase()));
    filtered = filtered.filter((e) => wanted.includes(String(e.category || "").toLowerCase()));
  }

  if (q) {
    filtered = filtered.filter((e) => {
      const hay = [
        e.title,
        e.tag,
        e.category,
        e.category_name,
        e.uri_name,
      ]
        .join(" ")
        .toLowerCase();

      return hay.includes(q);
    });
  }

  if (!includeEnded) {
    filtered = filtered.filter((e) => !e.is_ended);
  }

  filtered.sort((a, b) => {
    const aStart = Number(a.starts_at || 0);
    const bStart = Number(b.starts_at || 0);
    return aStart - bStart;
  });

  return filtered;
}

/* -------------------- Stripe signature verify -------------------- */

async function verifyStripeSignature(rawBody, sigHeader, webhookSecret) {
  if (!sigHeader || !webhookSecret) return false;

  const parts = sigHeader.split(",").map((s) => s.trim());
  const tPart = parts.find((p) => p.startsWith("t="));
  const v1Parts = parts.filter((p) => p.startsWith("v1="));
  if (!tPart || v1Parts.length === 0) return false;

  const timestamp = tPart.slice(2);
  const signedPayload = `${timestamp}.${rawBody}`;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(webhookSecret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sigBuf = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(signedPayload));
  const hex = [...new Uint8Array(sigBuf)].map((b) => b.toString(16).padStart(2, "0")).join("");

  for (const v1Part of v1Parts) {
    const v1 = v1Part.slice(3);
    if (timingSafeEqual(hex, v1)) return true;
  }

  return false;
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length !== b.length) return false;

  let out = 0;
  for (let i = 0; i < a.length; i++) {
    out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return out === 0;
}

/* -------------------- Supabase helpers -------------------- */

async function getSupabaseUser(env, accessToken) {
  const res = await fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: env.SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) return null;
  return await res.json();
}

async function supabaseInsertEventAccess(env, user_id, event_id) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/event_access`, {
    method: "POST",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({ user_id, event_id }),
  });

  if (!res.ok) {
    throw new Error("Supabase insert event_access failed: " + (await res.text()));
  }
}

async function supabaseExtendPass(env, user_id) {
  const iso = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}`, {
    method: "PATCH",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ pass_until: iso }),
  });

  if (!res.ok) {
    throw new Error("Supabase update pass_until failed: " + (await res.text()));
  }
}

async function supabaseSetElite(env, user_id) {
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user_id}`, {
    method: "PATCH",
    headers: {
      apikey: env.SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ is_elite: true }),
  });

  if (!res.ok) {
    throw new Error("Supabase set elite failed: " + (await res.text()));
  }
}

/* -------------------- Handlers -------------------- */

async function handleCheckout(request, env) {
  requireEnv(env, [
    "STRIPE_SECRET_KEY",
    "SUPABASE_URL",
    "SUPABASE_ANON_KEY",
  ]);

  const auth = request.headers.get("Authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return json({ error: "Missing Authorization Bearer token" }, 401);

  const body = await request.json().catch(() => ({}));
  const plan = String(body.plan || "").trim();
  const event_id = String(body.event_id || "").trim();
  const return_to = String(body.return_to || env.SITE_URL || "").trim();

  if (!["one_time", "pass", "elite"].includes(plan)) {
    return json({ error: "Invalid plan" }, 400);
  }

  if (plan === "one_time" && !event_id) {
    return json({ error: "Missing event_id for one_time" }, 400);
  }

  if (!return_to) {
    return json({ error: "Missing SITE_URL/return_to" }, 400);
  }

  const user = await getSupabaseUser(env, token);
  if (!user?.id) {
    return json({ error: "Invalid user session" }, 401);
  }

  const price =
    plan === "one_time"
      ? env.STRIPE_PRICE_ONE_TIME
      : plan === "pass"
        ? env.STRIPE_PRICE_PASS
        : env.STRIPE_PRICE_ELITE;

  if (!price) {
    return json({ error: "Missing STRIPE_PRICE_* in env" }, 500);
  }

  // pass = monthly subscription
  // elite = lifetime one-time
  const mode = plan === "pass" ? "subscription" : "payment";

  const successUrl = new URL(return_to);
  successUrl.searchParams.set("paid", "1");
  successUrl.searchParams.set("plan", plan);
  if (event_id) successUrl.searchParams.set("event_id", event_id);

  const cancelUrl = new URL(return_to);
  cancelUrl.searchParams.set("paid", "0");
  cancelUrl.searchParams.set("plan", plan);
  if (event_id) cancelUrl.searchParams.set("event_id", event_id);

  const form = new URLSearchParams();
  form.set("mode", mode);
  form.set("success_url", successUrl.toString());
  form.set("cancel_url", cancelUrl.toString());
  form.set("client_reference_id", user.id);
  form.set("line_items[0][price]", price);
  form.set("line_items[0][quantity]", "1");

  form.set("metadata[user_id]", user.id);
  form.set("metadata[plan]", plan);
  form.set("metadata[event_id]", event_id || "");

  if (user?.email) {
    form.set("customer_email", user.email);
  }

  const session = await stripeRequest(env, "/checkout/sessions", {
    method: "POST",
    body: form.toString(),
  });

  if (!session?.url) {
    throw new Error("Stripe session has no url");
  }

  return json({ url: session.url }, 200);
}

async function handleStripeWebhook(request, env) {
  requireEnv(env, ["STRIPE_WEBHOOK_SECRET", "SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]);

  const sig =
    request.headers.get("Stripe-Signature") ||
    request.headers.get("stripe-signature");

  const rawBody = await request.text();

  let ok = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET);
  if (!ok && env.STRIPE_WEBHOOK_SECRET_ALT) {
    ok = await verifyStripeSignature(rawBody, sig, env.STRIPE_WEBHOOK_SECRET_ALT);
  }

  if (!ok) {
    return new Response("Invalid signature", { status: 400 });
  }

  let event;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response("ok", { status: 200 });
  }

  const s = event.data?.object || {};
  const md = s.metadata || {};
  const user_id = String(md.user_id || "").trim();
  const plan = String(md.plan || "").trim();
  const event_id = String(md.event_id || "").trim();

  if (!user_id || !plan) {
    return new Response("ok", { status: 200 });
  }

  if (plan === "one_time") {
    if (event_id) await supabaseInsertEventAccess(env, user_id, event_id);
  } else if (plan === "pass") {
    await supabaseExtendPass(env, user_id);
  } else if (plan === "elite") {
    await supabaseSetElite(env, user_id);
  }

  return new Response("ok", { status: 200 });
}

async function handleStreamsSync(request, env) {
  const url = new URL(request.url);
  const { source_domain, data } = await getPpvStreams();
  const normalized = normalizeFightzoneStreams(data);
  const events = filterFightzoneStreams(normalized, url);

  return json(
    {
      success: true,
      source_domain,
      timestamp: Math.floor(Date.now() / 1000),
      count: events.length,
      events,
    },
    200,
    {
      "cache-control": "public, max-age=60, s-maxage=60",
    }
  );
}

/* -------------------- Worker entry -------------------- */

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(request, env) });
    }

    if (url.pathname === "/" || url.pathname === "/api/ping") {
      return new Response("ok", { status: 200 });
    }

    try {
      if (url.pathname === "/api/streams-sync" && request.method === "GET") {
        return withCors(request, env, await handleStreamsSync(request, env));
      }

      if (url.pathname === "/api/checkout" && request.method === "POST") {
        return withCors(request, env, await handleCheckout(request, env));
      }

      if (url.pathname === "/api/stripe-webhook" && request.method === "POST") {
        const res = await handleStripeWebhook(request, env);
        return withCors(request, env, res);
      }

      return new Response("Not found", { status: 404 });
    } catch (e) {
      console.log("WORKER ERROR:", String(e?.message || e));
      return withCors(request, env, json({ error: String(e?.message || e) }, 500));
    }
  },
};