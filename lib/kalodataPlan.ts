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
  creatorProductLookups: number;
  estimatedCredits: number;
}

/**
 * Com 1 crédito: 5 páginas de produtos (500), 1 de criadores (100)
 * e até 4 listas curtas do que os primeiros criadores vendem.
 * A página de criadores fica reservada quando o orçamento cabe os dois.
 */
export function planKalodataSpend(budget: number): KalodataPlan {
  const safe = Math.max(0, Number(budget) || 0);
  const page = 0.1;
  const reserveCreators = safe >= 0.2 ? page : 0;
  const productPages = Math.min(KALODATA_PRODUCT_PAGES, Math.floor((safe - reserveCreators + 1e-9) / page));
  let spent = productPages * page;
  const creatorPages = reserveCreators > 0 && safe - spent + 1e-9 >= page ? 1 : 0;
  spent += creatorPages * page;
  const creatorProductLookups = Math.floor((safe - spent + 1e-9) / page);
  const estimatedCredits = Math.round((productPages + creatorPages + creatorProductLookups) * page * 10) / 10;
  return { productPages, creatorPages, creatorProductLookups, estimatedCredits };
}

export function canSpend(spent: number, balance: number, cap: number, cost: number): boolean {
  if (cost <= 0) return true;
  return spent + cost <= cap + 1e-9 && spent + cost <= balance + 1e-9;
}
