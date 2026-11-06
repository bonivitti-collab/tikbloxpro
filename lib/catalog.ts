import { enrichWithTikTokShopData } from '../src/data/tiktokShopEnricher.js';
import { INITIAL_CURATED_TRENDS } from '../src/data/curatedTrends.js';
import { matchScore, passesBusinessRules } from '../src/lib/productRules.js';
import type { TrendingProduct } from '../src/types.js';

export function listCatalog(filters: {
  niche?: unknown;
  originCountry?: unknown;
  query?: unknown;
} = {}): TrendingProduct[] {
  let products = INITIAL_CURATED_TRENDS.map((product) => enrichWithTikTokShopData(product)).filter(passesBusinessRules);
  const niche = typeof filters.niche === 'string' ? filters.niche : 'all';
  const origin = typeof filters.originCountry === 'string' ? filters.originCountry : 'all';
  const query = typeof filters.query === 'string' ? filters.query.trim() : '';

  if (niche && niche !== 'all') {
    products = products.filter((product) => product.niche === niche);
  }
  if (origin && origin !== 'all') {
    products = products.filter((product) => product.originCountry === origin);
  }
  if (query) {
    products = products
      .map((product) => ({ product, score: matchScore(product, query) }))
      .filter((entry) => entry.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((entry) => entry.product);
  }
  return products;
}
