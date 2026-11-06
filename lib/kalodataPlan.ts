/** Rank: 0.1 × teto(linhas/100). Detail: 0.1 por chamada. */
export const KALODATA_PAGE_SIZE = 100;
export const KALODATA_PRODUCT_PAGES = 5;
export const KALODATA_DEFAULT_MAX_CREDITS = 1;

export function rankCreditCost(rows: number): number {
  if (!Number.isFinite(rows) || rows <= 0) return 0;
  return Math.round(0.1 * Math.ceil(rows / 100) * 10) / 10;
}

export function resolveKalodataMaxCredits(raw: unknown = process.env.KALODATA_MAX_CREDITS_PER_RUN): number {
  if (raw == null || String(raw).trim() === '') return KALODATA_DEFAULT_MAX_CREDITS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return KALODATA_DEFAULT_MAX_CREDITS;
  return Math.min(5, Number(parsed.toFixed(2)));
}

export interface KalodataPlan {
  productPages: number;
  creatorPages: number;
  detailCalls: number;
  creatorProductLookups: number;
  estimatedCredits: number;
}

/**
 * Com 1 crédito: ranking de criadores, uma página de produtos (preço e comissão)
 * e o resto em quais produtos cada criador promove. Fichas de detalhe só se sobrar.
 */
export function planKalodataSpend(budget: number): KalodataPlan {
  const safe = Math.max(0, Number(budget) || 0);
  const page = 0.1;
  let slots = Math.floor((safe + 1e-9) / page);
  const creatorPages = slots >= 1 ? 1 : 0;
  slots -= creatorPages;
  const productPages = Math.min(KALODATA_PRODUCT_PAGES, slots >= 1 ? 1 : 0);
  slots -= productPages;
  const creatorProductLookups = Math.min(20, slots);
  slots -= creatorProductLookups;
  const detailCalls = Math.min(4, slots);
  const estimatedCredits = Math.round((creatorPages + productPages + creatorProductLookups + detailCalls) * page * 10) / 10;
  return { productPages, creatorPages, detailCalls, creatorProductLookups, estimatedCredits };
}

export function canSpend(spent: number, balance: number, cap: number, cost: number): boolean {
  if (cost <= 0) return true;
  return spent + cost <= cap + 1e-9 && spent + cost <= balance + 1e-9;
}
