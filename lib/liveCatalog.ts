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
  const kalodata = row.source === 'kalodata';
  if (row.price_brl == null || !row.product_url) return null;
  if (!kalodata && (row.stock_units == null || row.video_count == null)) return null;
  const niche = nicheById(row.niche || '') ;
  const nicheId = niche?.id || 'home';
  const collectedAt = row.last_refreshed_at || row.scraped_at;
  const videos = row.video_count == null ? null : Number(row.video_count);
  const stock = row.stock_units == null ? null : Number(row.stock_units);
  const countsUnknown = kalodata && (videos == null || stock == null);
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
    waveStage: videos != null && videos >= 25 ? 'rising_wave' : 'early_wave',
    waveStageLabel: videos != null && videos >= 25 ? 'Em tração' : 'Início de onda',
    viralityScore: Math.max(60, Math.min(99, 96 - Math.round((videos ?? 0) / 2))),
    saturationInBrazil: videos != null && videos >= 25 ? 'Média' : 'Baixa',
    estimatedCostUSD: 0,
    estimatedPriceBRL: Number(row.price_brl),
    estimatedProfitMarginPercent: 0,
    culturalFitReason: `Coletado no TikTok Shop Brasil pela busca “${row.keyword || row.niche}”.`,
    brazilEntryStatus: 'Estoque informado pelo anúncio',
    targetAudience: 'Criadores do TikTok Shop Brasil',
    imageUrl: row.cover_url || undefined,
    productUrl: row.product_url,
    stockUnits: stock ?? undefined,
    videoCountBR: videos ?? undefined,
    feedSource: kalodata ? 'kalodata' : 'apify',
    countsUnknown,
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
      hasBrazilStock: (stock ?? 0) > 0,
      stockLocation: 'TikTok Shop BR',
      commissionValueBRL: commissionUnknown ? undefined : Number(row.commission_brl),
      stockUnits: stock ?? undefined,
      videoCountBR: videos ?? undefined,
      productUrl: row.product_url,
      activeCreatorsCount: Number(row.influencer_count || 0),
      recentSalesCount: Number(sales),
      saturationLevel: saturation(videos ?? 0),
      freeSampleAvailable: false,
    },
  }) as TrendingProduct;
}
