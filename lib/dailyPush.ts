import { createRequire } from 'node:module';

const webpush = createRequire(import.meta.url)('web-push') as {
  setVapidDetails: (subject: string, publicKey: string, privateKey: string) => void;
  sendNotification: (subscription: { endpoint: string; keys: { p256dh: string; auth: string } }, payload: string) => Promise<unknown>;
};
import { buildRadarSnapshot } from './radarBoard.js';
import { shopNicheById } from './shopNiches.js';

function supabaseConfig(): { base: string; key: string } | null {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return null;
  return { base, key };
}

async function sb(path: string, init: RequestInit = {}): Promise<any> {
  const config = supabaseConfig();
  if (!config) return [];
  const headers = new Headers(init.headers);
  headers.set('apikey', config.key);
  headers.set('Authorization', `Bearer ${config.key}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${config.base}/rest/v1/${path}`, { ...init, headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 180)}`);
  return text ? JSON.parse(text) : [];
}

async function geminiLine(facts: string, previous: string | null): Promise<string | null> {
  const key = process.env.GEMINI_API_KEY || '';
  if (!key) return null;
  const prompt = [
    'Escreva UM aviso curto em português do Brasil, no máximo 140 caracteres, para um criador de TikTok Shop.',
    'Use só os fatos abaixo. Não invente número, nome de produto nem resultado.',
    'Não diga que os criadores recomendam o TikBlox.',
    'Varie o tom (animado, direto ou calmo). Não repita o aviso anterior.',
    previous ? `Aviso anterior, não repetir: ${previous}` : '',
    `Fatos: ${facts}`,
  ].filter(Boolean).join('\n');
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${encodeURIComponent(key)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9, maxOutputTokens: 80 },
      }),
      signal: AbortSignal.timeout(15_000),
    },
  );
  if (!response.ok) return null;
  const payload = await response.json();
  const text = payload?.candidates?.[0]?.content?.parts?.map((part: { text?: string }) => part.text || '').join('').trim();
  if (!text) return null;
  return text.replace(/\s+/g, ' ').slice(0, 160);
}

export async function sendDailyAlerts(now: Date = new Date()): Promise<number> {
  const publicKey = process.env.VAPID_PUBLIC_KEY || '';
  const privateKey = process.env.VAPID_PRIVATE_KEY || '';
  if (!publicKey || !privateKey || !process.env.GEMINI_API_KEY || !supabaseConfig()) return 0;
  webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contato@tikblox.com.br', publicKey, privateKey);
  const [links, creators, products, subscriptions] = await Promise.all([
    sb('creator_products?select=creator_id,product_id,first_seen_at,video_url&limit=5000'),
    sb('creators?select=id,handle,nickname,avatar_url,followers&source=eq.kalodata&limit=200'),
    sb('products?select=id,title,niche,keyword,product_url,cover_url,commission_brl,commission_rate,price_min,price_max&source=eq.kalodata&limit=1000'),
    sb('push_subscriptions?select=id,endpoint,p256dh,auth,niche,last_body&limit=1000'),
  ]);
  const snapshot = buildRadarSnapshot({
    now,
    sightings: (Array.isArray(links) ? links : []).map((link) => ({
      creatorId: String(link.creator_id),
      productId: String(link.product_id),
      firstSeenAt: String(link.first_seen_at || ''),
      videoUrl: link.video_url || null,
    })),
    creators: Array.isArray(creators) ? creators : [],
    products: Array.isArray(products) ? products : [],
  });
  let sent = 0;
  for (const subscription of Array.isArray(subscriptions) ? subscriptions : []) {
    const niche = shopNicheById(String(subscription.niche || ''));
    const fresh = niche
      ? snapshot.products.filter((product) => product.niche === niche.id && (product.tag === 'Novo' || product.tag === 'Subindo'))
      : [];
    const facts = fresh.length === 0
      ? `Nada novo hoje${niche ? ` em ${niche.label}` : ''}. Mande uma dica curta para olhar o nicho amanhã, sem número.`
      : fresh.slice(0, 3).map((product) => `${product.tag || 'em movimento'}: ${product.title}, ${product.starters7d} top creators novos em 7 dias`).join('. ');
    const body = await geminiLine(facts, subscription.last_body || null);
    if (!body || body === subscription.last_body) continue;
    try {
      await webpush.sendNotification({
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      }, JSON.stringify({ title: 'TikBlox', body }));
      sent += 1;
      await sb(`push_subscriptions?id=eq.${subscription.id}`, {
        method: 'PATCH',
        headers: { Prefer: 'return=minimal' },
        body: JSON.stringify({ last_body: body }),
      });
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await sb(`push_subscriptions?id=eq.${subscription.id}`, { method: 'DELETE' }).catch(() => {});
      }
    }
  }
  return sent;
}
