import { normalizePt } from '../src/lib/productRules.js';
import type { ProductNiche } from '../src/types.js';

export const DEFAULT_APIFY_MAX_RESULTS = 10;
export const HARD_APIFY_MAX_RESULTS = 120;
export const DEFAULT_APIFY_MAX_CHARGE_USD = 0.2;
export const HARD_APIFY_MAX_CHARGE_USD = 0.5;
export const LIVE_CATALOG_TARGET = 100;

export interface NicheKeyword {
  keyword: string;
  niche: Exclude<ProductNiche, 'all'>;
}

/** Dez buscas curtas, uma por nicho com volume no TikTok Shop BR. */
export const NICHE_KEYWORDS: NicheKeyword[] = [
  { keyword: 'serum facial', niche: 'beauty' },
  { keyword: 'organizador de cozinha', niche: 'home' },
  { keyword: 'fone bluetooth', niche: 'tech' },
  { keyword: 'bolsa feminina', niche: 'accessories' },
  { keyword: 'faixa elastica', niche: 'fitness' },
  { keyword: 'massageador', niche: 'health' },
  { keyword: 'comedouro para gato', niche: 'pets' },
  { keyword: 'brinquedo sensorial', niche: 'kids' },
  { keyword: 'furadeira', niche: 'tools' },
  { keyword: 'suporte veicular', niche: 'auto' },
];

const TITLE_HINTS: Array<{ niche: Exclude<ProductNiche, 'all'>; words: string[] }> = [
  { niche: 'pets', words: ['gato', 'cachorro', 'pet', 'coleira', 'comedouro'] },
  { niche: 'kids', words: ['infantil', 'bebe', 'sensorial'] },
  { niche: 'beauty', words: ['serum', 'skincare', 'maquiagem'] },
  { niche: 'fitness', words: ['elastica', 'treino', 'halter'] },
  { niche: 'health', words: ['massageador', 'vitamina'] },
  { niche: 'gaming', words: ['gamer', 'controle'] },
  { niche: 'office', words: ['escritorio', 'teclado'] },
  { niche: 'outdoor', words: ['camping', 'barraca'] },
  { niche: 'travel', words: ['viagem', 'mala'] },
  { niche: 'auto', words: ['veicular', 'carro'] },
  { niche: 'tools', words: ['furadeira', 'parafusadeira'] },
  { niche: 'accessories', words: ['bolsa', 'carteira'] },
  { niche: 'tech', words: ['bluetooth', 'celular', 'fone'] },
  { niche: 'home', words: ['cozinha', 'organizador'] },
];

export function resolveResultBudget(raw: unknown = process.env.APIFY_MAX_RESULTS): number {
  if (raw == null || String(raw).trim() === '') return DEFAULT_APIFY_MAX_RESULTS;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_APIFY_MAX_RESULTS;
  return Math.min(HARD_APIFY_MAX_RESULTS, Math.floor(parsed));
}

export function resolveChargeUsd(raw: unknown = process.env.APIFY_MAX_CHARGE_USD): number {
  if (raw == null || String(raw).trim() === '') return DEFAULT_APIFY_MAX_CHARGE_USD;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_APIFY_MAX_CHARGE_USD;
  return Math.min(HARD_APIFY_MAX_CHARGE_USD, Number(parsed.toFixed(2)));
}

export function assignNiche(keyword: string, title: string): Exclude<ProductNiche, 'all'> {
  const titleNorm = normalizePt(title);
  for (const hint of TITLE_HINTS) {
    if (hint.words.some((word) => titleNorm.includes(normalizePt(word)))) return hint.niche;
  }
  const fromKeyword = NICHE_KEYWORDS.find((entry) => normalizePt(entry.keyword) === normalizePt(keyword));
  return fromKeyword?.niche || 'home';
}

export function splitIngestBudget(budget: number, storedCount: number): { refresh: number; fresh: number } {
  if (budget <= 0) return { refresh: 0, fresh: 0 };
  if (storedCount <= 0) return { refresh: 0, fresh: budget };
  if (storedCount < LIVE_CATALOG_TARGET) {
    const fresh = Math.min(3, budget, Math.max(1, Math.round(budget * 0.3)));
    return { refresh: budget - fresh, fresh };
  }
  const fresh = budget >= 8 ? 1 : 0;
  return { refresh: budget - fresh, fresh };
}

export interface StoredProductRef {
  id: string;
  keyword: string;
  lastRefreshedAt: string | null;
}

export interface IngestCall {
  keyword: string;
  niche: Exclude<ProductNiche, 'all'>;
  limit: number;
  purpose: 'refresh' | 'discover';
}

export function planIngestCalls(input: {
  budget: number;
  products: StoredProductRef[];
  dayIndex: number;
  keywords?: NicheKeyword[];
}): IngestCall[] {
  const keywords = input.keywords?.length ? input.keywords : NICHE_KEYWORDS;
  const { refresh, fresh } = splitIngestBudget(input.budget, input.products.length);
  const calls: IngestCall[] = [];

  if (refresh > 0 && input.products.length > 0) {
    const stalest = [...input.products].sort((a, b) => {
      const left = a.lastRefreshedAt || '';
      const right = b.lastRefreshedAt || '';
      if (left === right) return a.id.localeCompare(b.id);
      return left < right ? -1 : 1;
    })[0];
    const keyword = stalest.keyword || keywords[0].keyword;
    const known = keywords.find((entry) => normalizePt(entry.keyword) === normalizePt(keyword));
    calls.push({
      keyword,
      niche: known?.niche || assignNiche(keyword, ''),
      limit: refresh,
      purpose: 'refresh',
    });
  }

  if (fresh > 0) {
    const used = new Set(calls.map((call) => normalizePt(call.keyword)));
    const start = ((input.dayIndex % keywords.length) + keywords.length) % keywords.length;
    let chosen = keywords[start];
    for (let offset = 0; offset < keywords.length; offset += 1) {
      const candidate = keywords[(start + offset) % keywords.length];
      if (!used.has(normalizePt(candidate.keyword))) {
        chosen = candidate;
        break;
      }
    }
    calls.push({
      keyword: chosen.keyword,
      niche: chosen.niche,
      limit: fresh,
      purpose: 'discover',
    });
  }

  return calls;
}

export function mergeLiveAndCurated<T extends { id: string }>(liveQualified: T[], curated: T[]): T[] {
  if (liveQualified.length >= LIVE_CATALOG_TARGET) return liveQualified;
  const seen = new Set(liveQualified.map((product) => product.id));
  const filler = curated.filter((product) => !seen.has(product.id));
  return [...liveQualified, ...filler];
}
