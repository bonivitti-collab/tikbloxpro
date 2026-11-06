import { assignNiche } from './ingestPlan.js';
import type { ScrapedProduct } from './apifyShop.js';
import { parseIntegerCount, parseLooseNumber } from './apifyShop.js';
import { canSpend, planKalodataSpend, rankCreditCost, resolveKalodataMaxCredits, KALODATA_PAGE_SIZE } from './kalodataPlan.js';

/** api.kalodata.com não completa o TLS. O host que responde é www. */
export const KALODATA_BASE = 'https://www.kalodata.com/openapi/v1';

const COMMON = {
  region: 'BR',
  language: 'pt-BR',
  currency: 'BRL',
  date_range: 'last7Day',
};

export function tiktokProductUrl(productId: string): string {
  return `https://www.tiktok.com/view/product/${encodeURIComponent(productId)}`;
}

/** A documentação diz que 1.0 = 1 ponto percentual. */
export function commissionBrlFromRate(price: number | null, rate: number | null): number | null {
  if (price == null || rate == null || price < 0 || rate < 0) return null;
  return Number(((price * rate) / 100).toFixed(2));
}

export function mapKalodataProduct(item: any, keyword: string, refreshedAt: string): ScrapedProduct | null {
  const id = String(item?.product_id || item?.id || '').trim();
  const title = String(item?.product_name || item?.product_title || item?.title || '').trim();
  if (!id || !title) return null;
  const price = parseLooseNumber(item?.unit_price ?? item?.min_price ?? item?.max_price);
  const rate = parseLooseNumber(item?.commission_rate);
  const category = String(item?.ter_category?.category_name || item?.pri_category?.category_name || item?.category_name || '');
  return {
    id,
    title,
    price_brl: price,
    sold_7d: parseIntegerCount(item?.sales_volumn),
    sold_30d: null,
    video_count: parseIntegerCount(item?.video_number ?? item?.videos_count),
    influencer_count: parseIntegerCount(item?.creator_number ?? item?.influencers_count),
    stock_units: parseIntegerCount(item?.stock ?? item?.stock_count ?? item?.inventory ?? item?.sku_stock),
    commission_brl: commissionBrlFromRate(price, rate),
    cover_url: typeof item?.master_image_url === 'string' && item.master_image_url ? item.master_image_url : null,
    product_url: tiktokProductUrl(id),
    niche: assignNiche(keyword || category, `${title} ${category}`),
    keyword: keyword || category || 'ranking BR',
    source: 'kalodata',
    last_refreshed_at: refreshedAt,
  };
}

export interface KalodataCreator {
  id: string;
  handle: string;
  nickname: string;
  followers: number | null;
  revenue_brl: number | null;
  sales_volume: number | null;
  category: string | null;
  productIds: string[];
}

export function mapKalodataCreator(item: any): KalodataCreator | null {
  const id = String(item?.creator_id || '').trim();
  if (!id) return null;
  const categories = Array.isArray(item?.category_list) ? item.category_list.filter((value: unknown) => typeof value === 'string') : [];
  return {
    id,
    handle: String(item?.creator_handle || '').replace(/^@/, ''),
    nickname: String(item?.creator_nickname || item?.creator_handle || id),
    followers: parseIntegerCount(item?.creator_followers),
    revenue_brl: parseLooseNumber(item?.revenue),
    sales_volume: parseIntegerCount(item?.sales_volumn),
    category: categories[0] || null,
    productIds: [],
  };
}

async function postKalodata(path: string, body: unknown, apiKey: string, fetchImpl: typeof fetch): Promise<any> {
  const response = await fetchImpl(`${KALODATA_BASE}${path}`, {
    method: 'POST',
    headers: {
      'secret-key': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Kalodata ${response.status}: ${detail.slice(0, 180)}`);
  }
  const payload = await response.json();
  if (payload?.success === false) {
    throw new Error(String(payload?.message || 'Kalodata recusou a consulta'));
  }
  return payload;
}

export async function readKalodataBalance(apiKey: string, fetchImpl: typeof fetch = fetch): Promise<number> {
  const url = `${KALODATA_BASE}/credit/balance`;
  const headers = { 'secret-key': apiKey, Accept: 'application/json' };
  let response = await fetchImpl(url, { method: 'GET', headers, signal: AbortSignal.timeout(15_000) });
  if (response.status === 404 || response.status === 405) {
    response = await fetchImpl(url, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(15_000),
    });
  }
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Kalodata ${response.status}: ${detail.slice(0, 180)}`);
  }
  const payload = await response.json();
  if (payload?.success === false) throw new Error(String(payload?.message || 'Saldo indisponível'));
  const remain = parseLooseNumber(payload?.data?.totalRemain ?? payload?.data?.mainRemain);
  return remain == null ? 0 : remain;
}

export interface KalodataIngestResult {
  calls: number;
  spent: number;
  products: ScrapedProduct[];
  creators: KalodataCreator[];
}

export async function collectKalodata(input: {
  apiKey: string;
  maxCredits?: number;
  balance?: number;
  fetchImpl?: typeof fetch;
  now?: Date;
}): Promise<KalodataIngestResult> {
  const fetchImpl = input.fetchImpl || fetch;
  const cap = resolveKalodataMaxCredits(input.maxCredits ?? process.env.KALODATA_MAX_CREDITS_PER_RUN);
  const balance = input.balance ?? (await readKalodataBalance(input.apiKey, fetchImpl));
  const affordable = Math.min(cap, Math.max(0, balance));
  const plan = planKalodataSpend(affordable);
  const refreshedAt = (input.now || new Date()).toISOString();
  const products: ScrapedProduct[] = [];
  const creators: KalodataCreator[] = [];
  const seenProducts = new Set<string>();
  let spent = 0;
  let calls = 0;

  const rememberProduct = (item: any, keyword: string) => {
    const mapped = mapKalodataProduct(item, keyword, refreshedAt);
    if (!mapped || seenProducts.has(mapped.id)) return mapped;
    seenProducts.add(mapped.id);
    products.push(mapped);
    return mapped;
  };

  const pullRank = async (path: string, body: Record<string, unknown>) => {
    if (!canSpend(spent, balance, cap, 0.1)) return [] as any[];
    try {
      const payload = await postKalodata(path, body, input.apiKey, fetchImpl);
      calls += 1;
      const rows = Array.isArray(payload?.data) ? payload.data : [];
      spent = Math.round((spent + rankCreditCost(rows.length)) * 10) / 10;
      return rows;
    } catch (error) {
      if (calls === 0) throw error;
      console.error('[KALODATA]', String((error as { message?: string })?.message || error).slice(0, 180));
      return [] as any[];
    }
  };

  for (let page = 1; page <= plan.productPages; page += 1) {
    const rows = await pullRank('/tiktok/product/rank', {
      ...COMMON,
      sort_field: { field: 'revenue', type: 'DESC' },
      page_size: KALODATA_PAGE_SIZE,
      page_number: page,
      need_image: 1,
      is_affiliate: 1,
    });
    if (rows.length === 0) break;
    for (const row of rows) rememberProduct(row, 'ranking BR');
    if (rows.length < KALODATA_PAGE_SIZE) break;
  }

  let creatorRows: any[] = [];
  if (plan.creatorPages > 0) {
    creatorRows = await pullRank('/tiktok/creator/rank', {
      ...COMMON,
      sort_field: { field: 'revenue', type: 'DESC' },
      page_size: KALODATA_PAGE_SIZE,
      page_number: 1,
    });
    for (const row of creatorRows) {
      const creator = mapKalodataCreator(row);
      if (creator) creators.push(creator);
    }
  }

  const lookups = creators.slice(0, plan.creatorProductLookups);
  for (const creator of lookups) {
    const rows = await pullRank('/tiktok/product/rank', {
      ...COMMON,
      sort_field: { field: 'revenue', type: 'DESC' },
      page_size: 10,
      page_number: 1,
      creator_id: creator.id,
      need_image: 1,
    });
    for (const row of rows) {
      const mapped = rememberProduct(row, creator.handle || creator.nickname);
      if (mapped) creator.productIds.push(mapped.id);
    }
  }

  return { calls, spent, products, creators };
}
