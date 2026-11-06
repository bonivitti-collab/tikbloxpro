import { assignNiche } from './ingestPlan.js';
import type { ProductNiche } from '../src/types.js';

export const APIFY_ACTOR = 'pratikdani~tiktok-shop-search-scraper';

export interface ScrapedProduct {
  id: string;
  title: string;
  price_brl: number | null;
  sold_7d: number | null;
  sold_30d: number | null;
  video_count: number | null;
  influencer_count: number | null;
  stock_units: number | null;
  commission_brl: number | null;
  cover_url: string | null;
  product_url: string;
  niche: Exclude<ProductNiche, 'all'>;
  keyword: string;
  source: 'apify';
  last_refreshed_at: string;
}

export function parseLooseNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const numeric = trimmed.replace(/[^\d,.-]/g, '');
  if (!numeric) return null;
  const lastComma = numeric.lastIndexOf(',');
  const lastDot = numeric.lastIndexOf('.');
  let normalized = numeric;
  if (lastComma >= 0 && lastDot >= 0) {
    if (lastComma > lastDot) normalized = numeric.replace(/\./g, '').replace(',', '.');
    else normalized = numeric.replace(/,/g, '');
  } else if (lastComma >= 0) {
    normalized = numeric.replace(/\./g, '').replace(',', '.');
  }
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Inteiro para colunas integer. 1.73 vira 2. "1.7K" e "1,7 mil" viram 1700. */
export function parseIntegerCount(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const rounded = Math.round(value);
    return rounded >= 0 ? rounded : null;
  }
  if (typeof value !== 'string') return null;
  const trimmed = value.trim().replace(/\s+/g, ' ');
  if (!trimmed) return null;
  const suffix = trimmed.match(/^(.*?)\s*(k|m|b|mil|mi)$/i);
  let body = trimmed;
  let multiplier = 1;
  if (suffix) {
    body = suffix[1];
    const mark = suffix[2].toLowerCase();
    if (mark === 'k' || mark === 'mil') multiplier = 1_000;
    else if (mark === 'm' || mark === 'mi') multiplier = 1_000_000;
    else multiplier = 1_000_000_000;
  }
  const parsed = parseLooseNumber(body);
  if (parsed == null) return null;
  const rounded = Math.round(parsed * multiplier);
  return rounded >= 0 ? rounded : null;
}

function skuList(skus: unknown): any[] {
  if (Array.isArray(skus)) return skus;
  if (skus && typeof skus === 'object') return Object.values(skus as Record<string, unknown>);
  return [];
}

export function stockFromItem(item: any): number | null {
  const stocks = skuList(item?.skus)
    .map((sku) => parseLooseNumber(sku?.stock))
    .filter((value): value is number => value != null && value >= 0);
  if (stocks.length > 0) return Math.round(stocks.reduce((sum, value) => sum + value, 0));
  return parseIntegerCount(item?.stock);
}

export function priceFromItem(item: any): number | null {
  for (const sku of skuList(item?.skus)) {
    const currency = String(sku?.real_price?.currency || sku?.currency || '').toUpperCase();
    if (currency && currency !== 'BRL') continue;
    const priced = parseLooseNumber(sku?.real_price?.price_val ?? sku?.real_price?.price_str ?? sku?.price);
    if (priced != null) return priced;
  }
  return parseLooseNumber(item?.real_price ?? item?.price ?? item?.min_price);
}

export function productUrlFromItem(item: any, id: string): string {
  const direct = [item?.product_url, item?.url, item?.canonical_url].find(
    (value) => typeof value === 'string' && /^https?:\/\//i.test(value.trim())
  );
  if (direct) return String(direct).trim();
  const slug = typeof item?.product_name_slug === 'string' ? item.product_name_slug.trim() : '';
  if (slug) return `https://www.tiktok.com/shop/br/pdp/${encodeURIComponent(slug)}/${encodeURIComponent(id)}`;
  return `https://www.tiktok.com/view/product/${encodeURIComponent(id)}`;
}

export function parseApifyProduct(item: any, keyword: string, refreshedAt: string): ScrapedProduct | null {
  const id = String(item?.product_id || item?.id || '').trim();
  const title = String(item?.product_title || item?.title || item?.product_name || '').trim();
  if (!id || !title) return null;
  const relatedVideos = Array.isArray(item?.related_videos) ? item.related_videos.length : null;
  return {
    id,
    title,
    price_brl: priceFromItem(item),
    sold_7d: parseIntegerCount(item?.total_sale_7d_cnt ?? item?.week_sold_count),
    sold_30d: parseIntegerCount(item?.total_sale_30d_cnt),
    video_count: parseIntegerCount(item?.videos_count ?? item?.total_video_count ?? relatedVideos),
    influencer_count: parseIntegerCount(item?.influencers_count ?? item?.total_ifl_cnt),
    stock_units: stockFromItem(item),
    commission_brl: parseLooseNumber(item?.commission_brl ?? item?.commission),
    cover_url: typeof item?.cover_url === 'string' ? item.cover_url : null,
    product_url: productUrlFromItem(item, id),
    niche: assignNiche(keyword, title),
    keyword,
    source: 'apify',
    last_refreshed_at: refreshedAt,
  };
}

export async function fetchApifySearch(input: {
  token: string;
  keyword: string;
  limit: number;
  maxChargeUsd: number;
  fetchImpl?: typeof fetch;
  signal?: AbortSignal;
}): Promise<any[]> {
  const fetchImpl = input.fetchImpl || fetch;
  const url = new URL(`https://api.apify.com/v2/actors/${APIFY_ACTOR}/run-sync-get-dataset-items`);
  url.searchParams.set('timeout', '20');
  url.searchParams.set('format', 'json');
  url.searchParams.set('clean', 'true');
  url.searchParams.set('maxTotalChargeUsd', String(input.maxChargeUsd));
  const response = await fetchImpl(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${input.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      country_code: 'BR',
      keyword: input.keyword,
      limit: input.limit,
      page: 1,
    }),
    signal: input.signal,
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Apify ${response.status}: ${detail.slice(0, 180)}`);
  }
  const payload = await response.json();
  return Array.isArray(payload) ? payload : [];
}
