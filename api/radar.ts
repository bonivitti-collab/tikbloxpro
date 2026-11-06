import { buildRadarSnapshot } from '../lib/radarBoard.js';
import { requirePaidSession } from '../lib/guard.js';
import { canSeeKalodata } from '../lib/kalodataAccess.js';
import { sendJson } from '../lib/http.js';

function supabaseConfig(): { base: string; key: string } | null {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return null;
  return { base, key };
}

async function sb(path: string): Promise<any[]> {
  const config = supabaseConfig();
  if (!config) return [];
  const response = await fetch(`${config.base}/rest/v1/${path}`, {
    headers: { apikey: config.key, Authorization: `Bearer ${config.key}` },
  });
  if (!response.ok) throw new Error(`Supabase ${response.status}`);
  const data = await response.json();
  return Array.isArray(data) ? data : [];
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });
  try {
    const auth = await requirePaidSession(req);
    if (auth.ok === false) return sendJson(res, auth.status, { error: auth.error });
    const viewer = { email: auth.claims.email, role: auth.claims.role };
    if (!canSeeKalodata(viewer)) return sendJson(res, 200, { success: true, gated: true, niches: [], products: [], creators: [] });
    const [links, creators, products] = await Promise.all([
      sb('creator_products?select=creator_id,product_id,first_seen_at,video_url&limit=5000'),
      sb('creators?select=id,handle,nickname,avatar_url,followers&source=eq.kalodata&limit=200'),
      sb('products?select=id,title,niche,keyword,product_url,cover_url,commission_brl,commission_rate,price_min,price_max&source=eq.kalodata&limit=1000'),
    ]);
    const snapshot = buildRadarSnapshot({
      now: new Date(),
      sightings: links.map((link) => ({
        creatorId: String(link.creator_id),
        productId: String(link.product_id),
        firstSeenAt: String(link.first_seen_at || ''),
        videoUrl: link.video_url || null,
      })),
      creators,
      products,
    });
    return sendJson(res, 200, { success: true, gated: false, ...snapshot });
  } catch (error) {
    console.error('[RADAR]', error);
    return sendJson(res, 500, { error: 'Não foi possível montar o radar de criadores.' });
  }
}
