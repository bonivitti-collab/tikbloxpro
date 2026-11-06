import type { TrendingProduct } from '../types';

export const MIN_STOCK_UNITS = 500;
export const MAX_CREATOR_VIDEOS = 50;
export const MIN_COMMISSION_BRL = 10;

export function normalizePt(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
}

function finiteNumber(value: unknown): number | null {
  const parsed = typeof value === 'number' ? value : typeof value === 'string' && value.trim() !== '' ? Number(value) : NaN;
  return Number.isFinite(parsed) ? parsed : null;
}

export function stockUnitsOf(product: Partial<TrendingProduct> | any): number | null {
  return finiteNumber(product?.stockUnits ?? product?.tiktokShop?.stockUnits);
}

export function videoCountOf(product: Partial<TrendingProduct> | any): number | null {
  return finiteNumber(
    product?.videoCountBR ??
      product?.tiktokShop?.videoCountBR ??
      product?.tradeConviction?.creatorVideoCountBR
  );
}

export function commissionBrlOf(product: Partial<TrendingProduct> | any): number | null {
  const explicit = finiteNumber(
    product?.tiktokShop?.commissionValueBRL ?? product?.commissionEstimatedBRL ?? product?.tradeConviction?.commissionBRL
  );
  if (explicit != null) return explicit;
  const price = finiteNumber(product?.estimatedPriceBRL);
  const rate = finiteNumber(product?.tiktokShop?.commissionRatePercent ?? product?.commissionPercent);
  if (price == null || rate == null) return null;
  return Number(((price * rate) / 100).toFixed(2));
}

/** Regras de negócio sempre ligadas. Campo ausente não passa. */
export function passesBusinessRules(product: Partial<TrendingProduct> | any): boolean {
  const stock = stockUnitsOf(product);
  const videos = videoCountOf(product);
  const commission = commissionBrlOf(product);
  if (stock == null || stock < MIN_STOCK_UNITS) return false;
  if (videos == null || videos >= MAX_CREATOR_VIDEOS) return false;
  if (commission == null || commission < MIN_COMMISSION_BRL) return false;
  return true;
}

export function isIsoDiscoveredAt(value: unknown): boolean {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}/.test(value);
}

/**
 * Todos os tokens precisam aparecer. Título pesa mais que palavra-chave, que pesa mais que nicho.
 * Retorna 0 quando algum token não casa.
 */
export function matchScore(product: Partial<TrendingProduct> | any, query: string): number {
  const tokens = normalizePt(query).split(/\s+/).filter(Boolean);
  if (tokens.length === 0) return 1;
  const title = normalizePt(`${product?.name || ''} ${product?.originalName || ''}`);
  const keywords = normalizePt(
    `${(product?.supplierKeywords || []).join(' ')} ${product?.highlights?.join(' ') || ''} ${product?.culturalFitReason || ''}`
  );
  const niche = normalizePt(`${product?.niche || ''} ${product?.nicheLabel || ''}`);
  let score = 0;
  for (const token of tokens) {
    if (title.includes(token)) score += 3;
    else if (keywords.includes(token)) score += 2;
    else if (niche.includes(token)) score += 1;
    else return 0;
  }
  return score;
}

export function shopSearchQuery(product: Partial<TrendingProduct> | any): string {
  const title = String(product?.originalName || product?.name || '').trim();
  const attribute = String(product?.highlights?.[0] || '')
    .split(/\s+/)
    .slice(0, 6)
    .join(' ')
    .trim();
  const price = finiteNumber(product?.estimatedPriceBRL);
  const parts = [`"${title}"`];
  if (attribute) parts.push(attribute);
  if (price != null) parts.push(`R$ ${price.toFixed(2)}`);
  return parts.join(' ');
}

export function exactProductUrl(product: Partial<TrendingProduct> | any): string | null {
  const candidates = [
    product?.productUrl,
    product?.tiktokShop?.productUrl,
    product?.customProductUrl,
    product?.tiktokShop?.customProductUrl,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && /^https?:\/\//i.test(value.trim())) return value.trim();
  }
  return null;
}

export function tiktokShopHref(product: Partial<TrendingProduct> | any): { href: string; exact: boolean } {
  const exact = exactProductUrl(product);
  if (exact) return { href: exact, exact: true };
  const query = shopSearchQuery(product);
  return {
    href: `https://www.tiktok.com/shop/search?q=${encodeURIComponent(query)}`,
    exact: false,
  };
}

export function tiktokVideoSearchHref(product: Partial<TrendingProduct> | any): string {
  const title = String(product?.name || product?.originalName || '').trim();
  return `https://www.tiktok.com/search?q=${encodeURIComponent(`"${title}"`)}`;
}
