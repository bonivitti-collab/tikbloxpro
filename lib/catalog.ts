import { keepLiveProduct, matchScore } from '../src/lib/productRules.js';
import type { TrendingProduct } from '../src/types.js';
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

  // O catálogo de exemplo (src/data/niches) não entra no radar pago.
  // Os números dele são texto de demonstração, não medição.
  return applyFilters(live, filters);
}
