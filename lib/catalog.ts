import { enrichWithTikTokShopData } from '../src/data/tiktokShopEnricher.js';
import { INITIAL_CURATED_TRENDS } from '../src/data/curatedTrends.js';
import { keepLiveProduct, matchScore } from '../src/lib/productRules.js';
import type { TrendingProduct } from '../src/types.js';
import { mergeLiveAndCurated } from './ingestPlan.js';
import { liveRowToProduct } from './liveCatalog.js';
import { canSeeKalodata } from './kalodataAccess.js';
import { listStoredProducts, type StoredProductRow } from './productsStore.js';

export function rowsVisibleTo(rows: StoredProductRow[], viewer?: { email?: string | null; role?: string | null } | null): StoredProductRow[] {
  if (viewer && canSeeKalodata(viewer)) return rows;
  return rows.filter((row) => row.source !== 'kalodata');
}

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
} = {}, viewer?: { email?: string | null; role?: string | null } | null): Promise<TrendingProduct[]> {
  let live: TrendingProduct[] = [];
  try {
    const rows = rowsVisibleTo(await listStoredProducts(), viewer);
    live = rows
      .map((row) => liveRowToProduct(row))
      .filter((product): product is TrendingProduct => product != null)
      .filter((product) => keepLiveProduct(product));
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
