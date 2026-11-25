// Pocket Peasants – TURN-Zugangsdaten über Cloudflare Realtime TURN
// Gibt kurzlebige Zugangsdaten aus, damit der geheime TURN-Schlüssel nie im Browser landet.
// Benötigte Variablen (Worker → Settings → Variables and Secrets):
//   TURN_KEY_ID          (Text)   – die "Turn Token ID" aus dem Cloudflare-Dashboard
//   TURN_KEY_API_TOKEN   (Secret) – der "API Token" dieses TURN-Schlüssels
//   ALLOWED_ORIGINS      (Text, optional) – kommagetrennt, Standard: https://harryer46.github.io
const TTL = 172800; // 48 h – Maximum bei Cloudflare

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
