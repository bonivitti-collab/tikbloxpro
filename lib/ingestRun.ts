import { fetchApifySearch, parseApifyProduct, type ScrapedProduct } from './apifyShop.js';
import { planIngestCalls, resolveChargeUsd, resolveResultBudget, type StoredProductRef } from './ingestPlan.js';
import { listStoredProducts, productsBackend, upsertScrapedProducts } from './productsStore.js';

export interface IngestSummary {
  budget: number;
  calls: number;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
}

export async function runDailyIngest(options: {
  token?: string;
  now?: Date;
  fetchImpl?: typeof fetch;
} = {}): Promise<IngestSummary> {
  if (productsBackend() !== 'supabase') throw new Error('SUPABASE_NOT_CONFIGURED');
  const token = options.token || process.env.APIFY_TOKEN || '';
  if (!token) throw new Error('APIFY_TOKEN_MISSING');

  const budget = resolveResultBudget();
  const charge = resolveChargeUsd();
  const stored = await listStoredProducts();
  const refs: StoredProductRef[] = stored.map((row) => ({
    id: row.id,
    keyword: row.keyword || '',
    lastRefreshedAt: row.last_refreshed_at || null,
  }));
  const now = options.now || new Date();
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  const calls = planIngestCalls({ budget, products: refs, dayIndex });
  const refreshedAt = now.toISOString();
  const seen = new Set<string>();
  const accepted: ScrapedProduct[] = [];
  let fetched = 0;
  let skipped = 0;
  let callsDone = 0;

  for (const call of calls) {
    const room = budget - accepted.length;
    if (room <= 0) break;
    const limit = Math.min(call.limit, room);
    const items = await fetchApifySearch({
      token,
      keyword: call.keyword,
      limit,
      maxChargeUsd: charge,
      fetchImpl: options.fetchImpl,
      signal: AbortSignal.timeout(25_000),
    });
    callsDone += 1;
    for (const item of items.slice(0, limit)) {
      fetched += 1;
      if (accepted.length >= budget) break;
      const parsed = parseApifyProduct(item, call.keyword, refreshedAt);
      if (!parsed || seen.has(parsed.id)) {
        skipped += 1;
        continue;
      }
      seen.add(parsed.id);
      accepted.push(parsed);
    }
  }

  const existing = new Set(stored.map((row) => row.id));
  const { inserted, updated } = await upsertScrapedProducts(accepted);
  return {
    budget,
    calls: callsDone,
    fetched,
    inserted: inserted || accepted.filter((row) => !existing.has(row.id)).length,
    updated: updated || accepted.filter((row) => existing.has(row.id)).length,
    skipped,
  };
}
