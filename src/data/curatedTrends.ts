import { TrendingProduct } from '../types';
import { ALL_NICHE_TRENDS, NICHE_TRENDS_MAP } from './niches/index';
import { enrichWithTikTokShopData } from './tiktokShopEnricher';

export { ALL_NICHE_TRENDS, NICHE_TRENDS_MAP };

// Comprehensive 300+ trends enriched with TikTok Shop Brasil affiliate metrics
export const INITIAL_CURATED_TRENDS: TrendingProduct[] = [...ALL_NICHE_TRENDS]
  .map(enrichWithTikTokShopData)
  .sort((a, b) => b.viralityScore - a.viralityScore);

