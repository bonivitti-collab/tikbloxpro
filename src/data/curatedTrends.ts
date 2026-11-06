import { TrendingProduct } from '../types';
import { ALL_NICHE_TRENDS, NICHE_TRENDS_MAP } from './niches/index';
import { enrichWithTikTokShopData } from './tiktokShopEnricher';
import { isBlueOceanOpportunity } from '../lib/blueOcean';

export { ALL_NICHE_TRENDS, NICHE_TRENDS_MAP, isBlueOceanOpportunity };

const ALL_ENRICHED: TrendingProduct[] = [...ALL_NICHE_TRENDS].map(enrichWithTikTokShopData);

export const INITIAL_CURATED_TRENDS: TrendingProduct[] = ALL_ENRICHED
  .filter(isBlueOceanOpportunity)
  .sort((a, b) => (b.tradeConviction?.convictionScore || b.viralityScore) - (a.tradeConviction?.convictionScore || a.viralityScore));

// Produtos que já saturaram (mantidos para histórico e checagem de "não comprar")
export const SATURATED_ARCHIVE_TRENDS: TrendingProduct[] = ALL_ENRICHED
  .filter((p) => {
    return (
      p.waveStage === 'peak_wave' || 
      p.creatorSaturationBR === 'Alta' || 
      p.creatorSaturationBR === 'Saturado' ||
      (p.tradeConviction && p.tradeConviction.creatorVideoCountBR > 18) ||
      (p.tradeConviction && p.tradeConviction.verdict === 'ALERTA_SATURACAO')
    );
  });

