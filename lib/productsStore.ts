import type { ScrapedProduct } from './apifyShop.js';

export interface StoredProductRow extends ScrapedProduct {
  scraped_at: string;
}

function supabaseConfig(): { base: string; key: string } | null {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) return null;
  return { base, key };
}

async function sb(path: string, init: RequestInit = {}): Promise<{ data: any; response: Response }> {
  const config = supabaseConfig();
  if (!config) throw new Error('SUPABASE_NOT_CONFIGURED');
  const headers = new Headers(init.headers);
  headers.set('apikey', config.key);
  headers.set('Authorization', `Bearer ${config.key}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const response = await fetch(`${config.base}/rest/v1/${path}`, { ...init, headers });
  const text = await response.text();
  if (!response.ok) throw new Error(`Supabase ${response.status}: ${text.slice(0, 240)}`);
  return { data: text ? JSON.parse(text) : null, response };
}

const PRODUCT_COLUMNS = [
  'id',
  'title',
  'price_brl',
  'sold_7d',
  'sold_30d',
  'video_count',
  'influencer_count',
  'stock_units',
  'commission_brl',
  'cover_url',
  'product_url',
  'niche',
  'keyword',
  'source',
  'scraped_at',
  'last_refreshed_at',
].join(',');

export function productsBackend(): 'supabase' | 'unconfigured' {
  return supabaseConfig() ? 'supabase' : 'unconfigured';
}

export async function listStoredProducts(): Promise<StoredProductRow[]> {
  if (!supabaseConfig()) return [];
  const { data } = await sb(
    `products?select=${PRODUCT_COLUMNS}&order=last_refreshed_at.asc.nullsfirst&limit=1000`
  );
  return Array.isArray(data) ? (data as StoredProductRow[]) : [];
}

export async function upsertScrapedProducts(rows: ScrapedProduct[]): Promise<{ inserted: number; updated: number }> {
  if (rows.length === 0) return { inserted: 0, updated: 0 };
  const existing = new Set((await listStoredProducts()).map((row) => row.id));
  const payload = rows.map((row) => ({
    id: row.id,
    title: row.title,
    price_brl: row.price_brl,
    sold_7d: row.sold_7d,
    sold_30d: row.sold_30d,
    video_count: row.video_count,
    influencer_count: row.influencer_count,
    stock_units: row.stock_units,
    commission_brl: row.commission_brl,
    cover_url: row.cover_url,
    product_url: row.product_url,
    niche: row.niche,
    keyword: row.keyword,
    source: 'apify',
    last_refreshed_at: row.last_refreshed_at,
  }));
  await sb('products?on_conflict=id', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(payload),
  });
  let inserted = 0;
  let updated = 0;
  for (const row of rows) {
    if (existing.has(row.id)) updated += 1;
    else inserted += 1;
  }
  return { inserted, updated };
}
