import { INITIAL_CURATED_TRENDS, isBlueOceanOpportunity } from '../src/data/curatedTrends';
import type { TrendingProduct } from '../src/types';

export function listCatalog(filters: {
  niche?: unknown;
  originCountry?: unknown;
  query?: unknown;
} = {}): TrendingProduct[] {
  let products = INITIAL_CURATED_TRENDS.filter(isBlueOceanOpportunity);
  const niche = typeof filters.niche === 'string' ? filters.niche : 'all';
  const origin = typeof filters.originCountry === 'string' ? filters.originCountry : 'all';
  const query = typeof filters.query === 'string' ? filters.query.trim().toLowerCase() : '';

  if (niche && niche !== 'all') {
    products = products.filter((product) => product.niche === niche);
  }
  if (origin && origin !== 'all') {
    products = products.filter((product) => product.originCountry === origin);
  }
  if (query) {
    products = products.filter((product) => {
      const haystack = `${product.name} ${product.originalName} ${product.culturalFitReason || ''}`.toLowerCase();
      return haystack.includes(query);
    });
  }
  return products;
}
