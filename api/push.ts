import { requirePaidSession } from '../lib/guard.js';
import { sendJson } from '../lib/http.js';

function supabaseConfig(): { base: string; key: string } | null {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return null;
  return { base, key };
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  const auth = await requirePaidSession(req);
  if (auth.ok === false) return sendJson(res, auth.status, { error: auth.error });
  if (req.method === 'GET') {
    return sendJson(res, 200, { publicKey: process.env.VAPID_PUBLIC_KEY || '' });
  }
  const config = supabaseConfig();
  if (!config) return sendJson(res, 503, { error: 'Base ainda não configurada.' });
  const headers = {
    apikey: config.key,
    Authorization: `Bearer ${config.key}`,
    'Content-Type': 'application/json',
    Prefer: 'resolution=merge-duplicates,return=minimal',
  };
  if (req.method === 'DELETE') {
    const endpoint = typeof req.body?.endpoint === 'string' ? req.body.endpoint : '';
    if (!endpoint) return sendJson(res, 400, { error: 'Inscrição ausente.' });
    await fetch(`${config.base}/rest/v1/push_subscriptions?endpoint=eq.${encodeURIComponent(endpoint)}&email=eq.${encodeURIComponent(auth.claims.email)}`, {
      method: 'DELETE',
      headers,
    });
    return sendJson(res, 200, { ok: true });
  }
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  const subscription = req.body?.subscription;
  const endpoint = typeof subscription?.endpoint === 'string' ? subscription.endpoint : '';
  const p256dh = subscription?.keys?.p256dh;
  const authKey = subscription?.keys?.auth;
  const niche = typeof req.body?.niche === 'string' ? req.body.niche.slice(0, 40) : null;
  if (!endpoint || typeof p256dh !== 'string' || typeof authKey !== 'string') {
    return sendJson(res, 400, { error: 'Inscrição inválida.' });
  }
  const response = await fetch(`${config.base}/rest/v1/push_subscriptions?on_conflict=endpoint`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ email: auth.claims.email, endpoint, p256dh, auth: authKey, niche }),
  });
  if (!response.ok) {
    const detail = await response.text();
    console.error('[PUSH]', detail.slice(0, 180));
    return sendJson(res, 502, { error: 'Não foi possível guardar o alerta.' });
  }
  return sendJson(res, 200, { ok: true });
}
