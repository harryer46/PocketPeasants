// Pocket Peasants – TURN-Zugangsdaten über Cloudflare Realtime TURN
// Gibt kurzlebige Zugangsdaten aus, damit der geheime TURN-Schlüssel nie im Browser landet.
// Benötigte Variablen (Worker → Settings → Variables and Secrets):
//   TURN_KEY_ID          (Text)   – die "Turn Token ID" aus dem Cloudflare-Dashboard
//   TURN_KEY_API_TOKEN   (Secret) – der "API Token" dieses TURN-Schlüssels
//   ALLOWED_ORIGINS      (Text, optional) – kommagetrennt, Standard: https://harryer46.github.io
// Kostenbremse (empfohlen):
//   CF_ACCOUNT_ID        (Text)   – Account-ID (Dashboard → rechts unten bzw. in der URL)
//   CF_ANALYTICS_TOKEN   (Secret) – API-Token mit Recht "Account Analytics: Read"
//   LIMIT_GB             (Text, optional) – Standard 900. Ab diesem Monatsverbrauch gibt es keine neuen Zugangsdaten mehr.
const TTL = 43200; // 12 h – kurz genug, dass nach Erreichen des Limits schnell Schluss ist
let USAGE = { t: 0, gb: 0 };

async function monthUsageGB(env) {
  if (Date.now() - USAGE.t < 10 * 60 * 1000) return USAGE.gb; // höchstens alle 10 min nachfragen
  const now = new Date(), d = x => x.toISOString().slice(0, 10);
  const from = d(new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)));
  const query = `query($a:String!,$f:Date!,$t:Date!){viewer{accounts(filter:{accountTag:$a}){callsTurnUsageAdaptiveGroups(filter:{date_geq:$f,date_leq:$t},limit:1){sum{egressBytes}}}}}`;
  const r = await fetch('https://api.cloudflare.com/client/v4/graphql', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${env.CF_ANALYTICS_TOKEN}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, variables: { a: env.CF_ACCOUNT_ID, f: from, t: d(now) } })
  });
  const j = await r.json();
  if (!r.ok || j.errors) throw new Error('analytics ' + r.status + ' ' + JSON.stringify(j.errors || ''));
  const g = j.data.viewer.accounts[0].callsTurnUsageAdaptiveGroups;
  USAGE = { t: Date.now(), gb: (g.length ? g[0].sum.egressBytes : 0) / 1e9 };
  return USAGE.gb;
}

export default {
  async fetch(req, env) {
    const origin = req.headers.get('Origin') || '';
    const allowed = (env.ALLOWED_ORIGINS || 'https://harryer46.github.io').split(',').map(s => s.trim()).filter(Boolean);
    const ok = allowed.includes(origin);
    const cors = {
      'Access-Control-Allow-Origin': ok ? origin : allowed[0],
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Vary': 'Origin',
      'Cache-Control': 'no-store',
      'Content-Type': 'application/json'
    };
    if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (!ok) return new Response(JSON.stringify({ error: 'origin not allowed' }), { status: 403, headers: cors });
    if (!env.TURN_KEY_ID || !env.TURN_KEY_API_TOKEN) return new Response(JSON.stringify({ error: 'TURN_KEY_ID / TURN_KEY_API_TOKEN fehlen' }), { status: 500, headers: cors });

    // Kostenbremse: über dem Limit (oder wenn die Abfrage scheitert) keine Zugangsdaten → Spiel nutzt dann Metered/Direktverbindung
    if (env.CF_ACCOUNT_ID && env.CF_ANALYTICS_TOKEN) {
      const limit = +(env.LIMIT_GB || 900);
      let gb;
      try { gb = await monthUsageGB(env); } catch (e) { return new Response(JSON.stringify({ error: 'usage check failed', iceServers: [] }), { status: 503, headers: cors }); }
      if (gb >= limit) return new Response(JSON.stringify({ error: `monthly limit reached (${gb.toFixed(1)} GB)`, iceServers: [] }), { status: 429, headers: cors });
    }
    if (new URL(req.url).searchParams.has('usage') && env.CF_ACCOUNT_ID) {
      return new Response(JSON.stringify({ usageGB: +USAGE.gb.toFixed(3), limitGB: +(env.LIMIT_GB || 900) }), { headers: cors });
    }
    const r = await fetch(`https://rtc.live.cloudflare.com/v1/turn/keys/${env.TURN_KEY_ID}/credentials/generate-ice-servers`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${env.TURN_KEY_API_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ttl: TTL })
    });
    if (!r.ok) return new Response(JSON.stringify({ error: 'cloudflare ' + r.status }), { status: 502, headers: cors });
    const j = await r.json();
    // Port 53 wird von Browsern oft blockiert und bremst nur den Verbindungsaufbau → entfernen
    const iceServers = (j.iceServers || []).map(s => {
      const urls = (Array.isArray(s.urls) ? s.urls : [s.urls]).filter(u => !/:53(\?|$)/.test(u));
      return { ...s, urls };
    }).filter(s => s.urls.length);
    return new Response(JSON.stringify({ iceServers }), { headers: cors });
  }
};
