import { enrichWithTikTokShopData } from '../src/data/tiktokShopEnricher.js';
import { nicheById } from '../src/data/taxonomy.js';
import type { TrendingProduct } from '../src/types.js';
import type { StoredProductRow } from './productsStore.js';

function saturation(videos: number | null): 'Oceano Azul' | 'Baixa' | 'Média' | 'Saturado' {
  if (videos == null || videos < 10) return 'Oceano Azul';
  if (videos < 25) return 'Baixa';
  if (videos < 50) return 'Média';
  return 'Saturado';
}

export function liveRowToProduct(row: StoredProductRow): TrendingProduct | null {
  if (row.price_brl == null || row.stock_units == null || row.video_count == null || !row.product_url) return null;
  const niche = nicheById(row.niche || '') ;
  const nicheId = niche?.id || 'home';
  const collectedAt = row.last_refreshed_at || row.scraped_at;
  const videos = Number(row.video_count);
  const sales = row.sold_30d ?? row.sold_7d ?? 0;
  const commissionUnknown = row.commission_brl == null;
  return enrichWithTikTokShopData({
    id: row.id,
    name: row.title,
    originalName: row.title,
    niche: nicheId,
    nicheLabel: niche?.label || 'Casa & Cozinha',
    originCountry: 'CN',
    originPlatform: 'TikTok Shop BR',
    waveStage: videos < 25 ? 'early_wave' : 'rising_wave',
    waveStageLabel: videos < 25 ? 'Início de onda' : 'Em tração',
    viralityScore: Math.max(60, Math.min(99, 96 - Math.round(videos / 2))),
    saturationInBrazil: videos < 25 ? 'Baixa' : 'Média',
    estimatedCostUSD: 0,
    estimatedPriceBRL: Number(row.price_brl),
    estimatedProfitMarginPercent: 0,
    culturalFitReason: `Coletado no TikTok Shop Brasil pela busca “${row.keyword || row.niche}”.`,
    brazilEntryStatus: 'Estoque informado pelo anúncio',
    targetAudience: 'Criadores do TikTok Shop Brasil',
    imageUrl: row.cover_url || undefined,
    productUrl: row.product_url,
    stockUnits: Number(row.stock_units),
    videoCountBR: videos,
    commissionUnknown,
    commissionEstimatedBRL: commissionUnknown ? undefined : Number(row.commission_brl),
    dataSource: 'live',
    collectedAt,
    discoveredAt: collectedAt,
    iconType: 'Package',
    highlights: [row.keyword || niche?.label || 'TikTok Shop'],
    adHooks: [],
    supplierKeywords: row.keyword ? [row.keyword] : [],
    logisticsComplexity: 'Médio (Bateria / Eletrônico)',
    trendingMetrics: {
      viewsLast30Days: `${Number(row.sold_30d || 0)} vendas em 30 dias`,
      growthRatePercent: 0,
      searchVolumeBR: 'Emergindo agora',
    },
    tiktokShop: {
      hasBrazilStock: Number(row.stock_units) > 0,
      stockLocation: 'TikTok Shop BR',
      commissionValueBRL: commissionUnknown ? undefined : Number(row.commission_brl),
      stockUnits: Number(row.stock_units),
      videoCountBR: videos,
      productUrl: row.product_url,
      activeCreatorsCount: Number(row.influencer_count || 0),
      recentSalesCount: Number(sales),
      saturationLevel: saturation(videos),
      freeSampleAvailable: false,
    },
  }) as TrendingProduct;
}
