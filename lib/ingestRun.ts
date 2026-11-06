import { fetchApifySearch, parseApifyProduct, type ScrapedProduct } from './apifyShop.js';
import { planIngestCalls, resolveChargeUsd, resolveResultBudget, type StoredProductRef } from './ingestPlan.js';
import {
  claimDailyRun,
  finishDailyRun,
  ingestRunKey,
  listStoredProducts,
  productsBackend,
  upsertScrapedProducts,
  type StoredProductRow,
} from './productsStore.js';

export interface IngestSummary {
  budget: number;
  calls: number;
  fetched: number;
  inserted: number;
  updated: number;
  skipped: number;
  alreadyRan?: boolean;
}

export interface IngestDeps {
  token?: string;
  now?: Date;
  fetchImpl?: typeof fetch;
  claimRun?: (runKey: string) => Promise<'claimed' | 'already'>;
  finishRun?: (runKey: string, status: 'ok' | 'failed', detail?: string) => Promise<void>;
  listProducts?: () => Promise<StoredProductRow[]>;
  saveProducts?: (rows: ScrapedProduct[]) => Promise<{ inserted: number; updated: number }>;
}

export function statusForIngestError(error: unknown): number {
  const message = String((error as { message?: string })?.message || error);
  if (message === 'SUPABASE_NOT_CONFIGURED' || message === 'APIFY_TOKEN_MISSING') return 503;
  if (message.startsWith('BEFORE_APIFY:')) return 502;
  return 200;
}

export async function runDailyIngest(options: IngestDeps = {}): Promise<IngestSummary> {
  const usingMemory = Boolean(options.listProducts && options.claimRun && options.saveProducts);
  if (!usingMemory && productsBackend() !== 'supabase') throw new Error('SUPABASE_NOT_CONFIGURED');
  const token = options.token || process.env.APIFY_TOKEN || '';
  if (!token) throw new Error('APIFY_TOKEN_MISSING');

  const listProducts = options.listProducts || listStoredProducts;
  const saveProducts = options.saveProducts || upsertScrapedProducts;
  const claimRun = options.claimRun || claimDailyRun;
  const finishRun = options.finishRun || finishDailyRun;

  let stored: StoredProductRow[];
  try {
    stored = await listProducts();
  } catch (error) {
    const message = String((error as { message?: string })?.message || error);
    throw new Error(`BEFORE_APIFY: ${message}`);
  }

  const now = options.now || new Date();
  const runKey = ingestRunKey(now);
  let claim: 'claimed' | 'already';
  try {
    claim = await claimRun(runKey);
  } catch (error) {
    const message = String((error as { message?: string })?.message || error);
    throw new Error(`BEFORE_APIFY: ${message}`);
  }
  if (claim === 'already') {
    return { budget: resolveResultBudget(), calls: 0, fetched: 0, inserted: 0, updated: 0, skipped: 0, alreadyRan: true };
  }

  const budget = resolveResultBudget();
  const charge = resolveChargeUsd();
  const refs: StoredProductRef[] = stored.map((row) => ({
    id: row.id,
    keyword: row.keyword || '',
    lastRefreshedAt: row.last_refreshed_at || null,
  }));
  const dayIndex = Math.floor(now.getTime() / 86_400_000);
  const calls = planIngestCalls({ budget, products: refs, dayIndex });
  const refreshedAt = now.toISOString();
  const seen = new Set<string>();
  const accepted: ScrapedProduct[] = [];
  let fetched = 0;
  let skipped = 0;
  let callsDone = 0;

  try {
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

    const saved = await saveProducts(accepted);
    await finishRun(runKey, 'ok').catch(() => {});
    return {
      budget,
      calls: callsDone,
      fetched,
      inserted: saved.inserted,
      updated: saved.updated,
      skipped,
      alreadyRan: false,
    };
  } catch (error) {
    const message = String((error as { message?: string })?.message || error);
    await finishRun(runKey, 'failed', message).catch(() => {});
    throw error;
  }
}
