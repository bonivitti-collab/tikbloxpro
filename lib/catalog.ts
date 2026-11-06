import { enrichWithTikTokShopData } from '../src/data/tiktokShopEnricher.js';
import { INITIAL_CURATED_TRENDS } from '../src/data/curatedTrends.js';
import { matchScore, passesBusinessRules } from '../src/lib/productRules.js';
import type { TrendingProduct } from '../src/types.js';
import { mergeLiveAndCurated } from './ingestPlan.js';
import { liveRowToProduct } from './liveCatalog.js';
import { listStoredProducts } from './productsStore.js';

function applyFilters(products: TrendingProduct[], filters: {
  niche?: unknown;
  originCountry?: unknown;
  query?: unknown;
}): TrendingProduct[] {
  let next = products;
  const niche = typeof filters.niche === 'string' ? filters.niche : 'all';
  const origin = typeof filters.originCountry === 'string' ? filters.originCountry : 'all';
  const query = typeof filters.query === 'string' ? filters.query.trim() : '';
  if (niche && niche !== 'all') next = next.filter((product) => product.niche === niche);
  if (origin && origin !== 'all') next = next.filter((product) => product.originCountry === origin);
  if (query) {
    next = next
      .map((product) => ({ product, score: matchScore(product, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);
  }
  return next;
}

export async function listCatalog(filters: {
  niche?: unknown;
  originCountry?: unknown;
  query?: unknown;
} = {}): Promise<TrendingProduct[]> {
  let live: TrendingProduct[] = [];
  try {
    const rows = await listStoredProducts();
    live = rows
      .map((row) => liveRowToProduct(row))
      .filter((product): product is TrendingProduct => product != null)
      .filter((product) => passesBusinessRules(product));
  } catch (error) {
    console.error('[CATALOG] live', error);
    live = [];
  }

  const curated = INITIAL_CURATED_TRENDS.map((product) => enrichWithTikTokShopData({
    ...product,
    dataSource: 'curated',
  }));
  return applyFilters(mergeLiveAndCurated(live, curated), filters);
}
