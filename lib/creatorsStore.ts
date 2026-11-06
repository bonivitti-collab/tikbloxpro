import { tiktokProductUrl, type KalodataCreator } from './kalodata.js';

export interface CreatorProductCard {
  id: string;
  title: string;
  price_brl: number | null;
  price_min: number | null;
  price_max: number | null;
  price_avg: number | null;
  price_estimated: boolean;
  commission_brl: number | null;
  commission_rate: number | null;
  last_refreshed_at: string | null;
  product_url: string;
  cover_url: string | null;
}

export interface CreatorCard {
  id: string;
  handle: string;
  nickname: string;
  followers: number | null;
  revenue_brl: number | null;
  sales_volume: number | null;
  category: string | null;
  products: CreatorProductCard[];
}

function supabaseConfig(): { base: string; key: string } | null {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return null;
  return { base, key };
}

async function sb(path: string, init: RequestInit = {}): Promise<any> {
  const config = supabaseConfig();
  if (!config) throw new Error('SUPABASE_NOT_CONFIGURED');
  const headers = new Headers(init.headers);
  headers.set('apikey', config.key);
  headers.set('Authorization', `Bearer ${config.key}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${config.base}/rest/v1/${path}`, { ...init, headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 240)}`);
  return text ? JSON.parse(text) : null;
}

export async function upsertCreators(creators: KalodataCreator[], refreshedAt: string): Promise<void> {
  if (!supabaseConfig() || creators.length === 0) return;
  await sb('creators?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(creators.map((creator) => ({
      id: creator.id,
      handle: creator.handle,
      nickname: creator.nickname,
      followers: creator.followers,
      revenue_brl: creator.revenue_brl,
      sales_volume: creator.sales_volume,
      category: creator.category,
      source: 'kalodata',
      last_refreshed_at: refreshedAt,
    }))),
  });
  const links = creators.flatMap((creator) => creator.productIds.map((productId) => ({
    creator_id: creator.id,
    product_id: productId,
    source: 'kalodata',
  })));
  if (links.length === 0) return;
  await sb('creator_products?on_conflict=creator_id,product_id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(links),
  });
}

export async function listCreatorBoard(): Promise<CreatorCard[]> {
  if (!supabaseConfig()) return [];
  const creators = await sb('creators?select=id,handle,nickname,followers,revenue_brl,sales_volume,category&source=eq.kalodata&order=revenue_brl.desc.nullslast&limit=100');
  const rows = Array.isArray(creators) ? creators : [];
  if (rows.length === 0) return [];
  const ids = rows.map((row) => row.id).join(',');
  const links = await sb(`creator_products?select=creator_id,product_id&creator_id=in.(${ids})&limit=1000`);
  const linkRows = Array.isArray(links) ? links : [];
  const productIds = [...new Set(linkRows.map((link) => link.product_id).filter(Boolean))];
  let products: any[] = [];
  if (productIds.length > 0) {
    const quoted = productIds.map((id) => encodeURIComponent(id)).join(',');
    const loaded = await sb(`products?select=id,title,price_brl,price_min,price_max,price_avg,price_estimated,commission_brl,commission_rate,product_url,cover_url,last_refreshed_at&id=in.(${quoted})&limit=1000`);
    products = Array.isArray(loaded) ? loaded : [];
  }
  const byId = new Map(products.map((product) => [product.id, product]));
  return rows.map((row) => ({
    id: row.id,
    handle: row.handle || '',
    nickname: row.nickname || row.handle || row.id,
    followers: row.followers ?? null,
    revenue_brl: row.revenue_brl ?? null,
    sales_volume: row.sales_volume ?? null,
    category: row.category ?? null,
    products: linkRows
      .filter((link) => link.creator_id === row.id)
      .map((link) => {
        const product = byId.get(link.product_id);
        return {
          id: link.product_id,
          title: product?.title || 'Produto no TikTok Shop',
          price_brl: product?.price_brl ?? null,
          price_min: product?.price_min ?? null,
          price_max: product?.price_max ?? null,
          price_avg: product?.price_avg ?? null,
          price_estimated: product?.price_estimated === true,
          commission_brl: product?.commission_brl ?? null,
          commission_rate: product?.commission_rate ?? null,
          last_refreshed_at: product?.last_refreshed_at ?? null,
          product_url: product?.product_url || tiktokProductUrl(link.product_id),
          cover_url: product?.cover_url ?? null,
        };
      }),
  }));
}
