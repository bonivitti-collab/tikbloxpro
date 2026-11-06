import { assignNiche } from './ingestPlan.js';
import { kalodataCategoryName } from './shopNiches.js';
import type { ScrapedProduct } from './apifyShop.js';
import { parseIntegerCount, parseLooseNumber } from './apifyShop.js';
import { canSpend, planKalodataSpend, rankCreditCost, resolveKalodataMaxCredits, KALODATA_PAGE_SIZE } from './kalodataPlan.js';
import { mergePriceHistory, snapshotFromObserved, type PriceFields } from '../src/lib/priceRange.js';
import { videoUrlFromKalodata } from './creatorSignal.js';

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

const PRICE_POINT_KEYS = [
  'unit_price',
  'min_price',
  'max_price',
  'avg_price',
  'average_price',
  'price_avg',
  'price_min',
  'price_max',
  'minimum_price',
  'maximum_price',
  'min_unit_price',
  'max_unit_price',
  'unit_price_min',
  'unit_price_max',
];
const PRICE_AVG_KEYS = ['avg_price', 'average_price', 'price_avg', 'avg_unit_price'];
const PRICE_HISTORY_KEYS = ['price_history', 'unit_price_history', 'unit_price_trend', 'price_trend'];

function pushPrice(points: number[], value: unknown): void {
  const priced = parseLooseNumber(value);
  if (priced != null && priced > 0) points.push(priced);
}

/**
 * Campos de preço que o ranking e a ficha já devolvem. Sem chamada extra.
 * Ficha: minimum/maximum/average price e commission_rate.
 * Ranking (need_extra): unit_price e, quando vem, min_price/max_price.
 */
export function kalodataPriceFields(item: any): PriceFields | null {
  if (!item || typeof item !== 'object') return null;
  const points: number[] = [];
  for (const key of PRICE_POINT_KEYS) pushPrice(points, item[key]);
  if (item.price && typeof item.price === 'object') {
    for (const key of PRICE_POINT_KEYS) pushPrice(points, item.price[key]);
    pushPrice(points, item.price.price ?? item.price.value);
  } else {
    pushPrice(points, item.price);
  }
  for (const key of PRICE_HISTORY_KEYS) {
    const history = item[key];
    if (!Array.isArray(history)) continue;
    for (const entry of history) {
      if (entry && typeof entry === 'object') {
        for (const pointKey of PRICE_POINT_KEYS) pushPrice(points, entry[pointKey]);
        pushPrice(points, entry.price ?? entry.value);
      } else {
        pushPrice(points, entry);
      }
    }
  }
  const average = PRICE_AVG_KEYS.map((key) => parseLooseNumber(item[key])).find((value) => value != null && value > 0) ?? null;
  const representative = parseLooseNumber(item.unit_price) ?? average ?? points[0] ?? null;
  const rate = parseLooseNumber(item.commission_rate);
  if (representative == null && points.length === 0) return null;
  return snapshotFromObserved({
    points: points.length > 0 ? points : representative != null ? [representative] : [],
    average,
    representative,
    rate,
  });
}

export function mapKalodataProduct(item: any, keyword: string, refreshedAt: string): ScrapedProduct | null {
  const id = String(item?.product_id || item?.id || '').trim();
  const title = String(item?.product_name || item?.product_title || item?.title || '').trim();
  if (!id || !title) return null;
  const prices = kalodataPriceFields(item);
  const price = prices?.price_brl ?? null;
  const rate = prices?.commission_rate ?? parseLooseNumber(item?.commission_rate);
  const category = kalodataCategoryName(item);
  return {
    id,
    title,
    price_brl: price,
    price_min: prices?.price_min ?? null,
    price_max: prices?.price_max ?? null,
    price_avg: prices?.price_avg ?? null,
    price_estimated: prices?.price_estimated ?? false,
    commission_rate: rate,
    sold_7d: parseIntegerCount(item?.sales_volumn),
    sold_30d: null,
    video_count: parseIntegerCount(item?.video_number ?? item?.videos_count),
    influencer_count: parseIntegerCount(item?.creator_number ?? item?.influencers_count),
    stock_units: parseIntegerCount(item?.stock ?? item?.stock_count ?? item?.inventory ?? item?.sku_stock),
    commission_brl: commissionBrlFromRate(price, rate),
    cover_url: typeof item?.master_image_url === 'string' && item.master_image_url ? item.master_image_url : null,
    product_url: tiktokProductUrl(id),
    niche: assignNiche(category || keyword, `${title} ${category}`),
    keyword: category || keyword || 'ranking BR',
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
  avatarUrl: string | null;
  productIds: string[];
  videoByProduct: Record<string, string>;
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
    avatarUrl: typeof item?.creator_avatar === 'string' ? item.creator_avatar : (typeof item?.avatar_url === 'string' ? item.avatar_url : null),
    productIds: [],
    videoByProduct: {},
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
  lookedUpCreatorIds: string[];
}

export async function collectKalodata(input: {
  apiKey: string;
  maxCredits?: number;
  balance?: number;
  fetchImpl?: typeof fetch;
  now?: Date;
  /** Criadores que devem ser consultados primeiro (os menos atualizados). */
  lookupCreatorIds?: string[];
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
      need_extra: true,
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

  const detailTargets = [...products]
    .filter((product) => (product.commission_brl ?? 0) >= 10)
    .sort((a, b) => (b.commission_brl ?? 0) - (a.commission_brl ?? 0) || a.id.localeCompare(b.id))
    .slice(0, plan.detailCalls);
  for (const product of detailTargets) {
    if (!canSpend(spent, balance, cap, 0.1)) break;
    try {
      const payload = await postKalodata('/tiktok/product/detail', {
        ...COMMON,
        product_id: product.id,
        need_image: 1,
        need_extra: true,
      }, input.apiKey, fetchImpl);
      calls += 1;
      spent = Math.round((spent + 0.1) * 10) / 10;
      const data = payload?.data;
      if (!data || typeof data !== 'object') continue;
      const videos = parseIntegerCount(data.video_number ?? data.videos_count);
      const stock = parseIntegerCount(data.stock ?? data.stock_count ?? data.inventory ?? data.sku_stock);
      if (videos != null) product.video_count = videos;
      if (stock != null) product.stock_units = stock;
      const detailPrices = kalodataPriceFields(data);
      if (detailPrices) {
        const merged = mergePriceHistory(product, detailPrices);
        product.price_brl = merged.price_brl;
        product.price_min = merged.price_min;
        product.price_max = merged.price_max;
        product.price_avg = merged.price_avg;
        product.price_estimated = merged.price_estimated;
        product.commission_rate = merged.commission_rate;
        const commission = commissionBrlFromRate(merged.price_brl, merged.commission_rate);
        if (commission != null) product.commission_brl = commission;
      }
      if (typeof data.master_image_url === 'string' && data.master_image_url) product.cover_url = data.master_image_url;
    } catch (error) {
      console.error('[KALODATA]', String((error as { message?: string })?.message || error).slice(0, 180));
      break;
    }
  }

  const preferred = input.lookupCreatorIds || [];
  const preferredSet = new Set(preferred);
  const lookupOrder = [
    ...preferred.map((id) => creators.find((creator) => creator.id === id)).filter((creator): creator is KalodataCreator => Boolean(creator)),
    ...creators.filter((creator) => !preferredSet.has(creator.id)),
  ];
  const lookups = lookupOrder.slice(0, plan.creatorProductLookups);
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
      if (!mapped) continue;
      if (!creator.productIds.includes(mapped.id)) creator.productIds.push(mapped.id);
      const video = videoUrlFromKalodata(row, creator.handle);
      if (video) creator.videoByProduct[mapped.id] = video;
    }
  }

  return { calls, spent, products, creators, lookedUpCreatorIds: lookups.map((creator) => creator.id) };
}
