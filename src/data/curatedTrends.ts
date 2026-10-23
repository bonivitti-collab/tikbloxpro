import { TrendingProduct } from '../types';
import { ALL_NICHE_TRENDS, NICHE_TRENDS_MAP } from './niches/index';
import { enrichWithTikTokShopData } from './tiktokShopEnricher';

export { ALL_NICHE_TRENDS, NICHE_TRENDS_MAP };

// Base completa enriquecida
const ALL_ENRICHED: TrendingProduct[] = [...ALL_NICHE_TRENDS].map(enrichWithTikTokShopData);

// FILTRO RÍGIDO OCEANO AZUL & INÍCIO DE ONDA:
// Expulsa imediatamente produtos saturados, fadiga criativa ou com mais de 18 vídeos ativos no feed BR
export function isBlueOceanOpportunity(p: TrendingProduct | any): boolean {
  if (!p) return false;
  if (p.waveStage === 'peak_wave') return false;
  if (p.creatorSaturationBR === 'Alta' || p.creatorSaturationBR === 'Saturado') return false;
  if (p.tradeConviction) {
    if (p.tradeConviction.creatorVideoCountBR > 18) return false;
    if (p.tradeConviction.verdict === 'ALERTA_SATURACAO') return false;
    if (p.tradeConviction.convictionScore < 80) return false;
  }
  return true;
}

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

