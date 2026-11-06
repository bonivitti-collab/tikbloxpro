import { resolveRealProductImage } from './productImageResolver.js';
import { TrendingProduct } from '../types.js';
import { commissionRateOf, priceBandOf, roundMoney } from '../lib/priceRange.js';

export function extractSharpProductIdentifiers(product: any): {
  exactViralSearchQuery: string;
  exactAffiliateSearchTerm: string;
  shopeeSearchUrl: string;
  aliExpressSearchUrl: string;
  mercadoLivreSearchUrl: string;
} {
  const primarySupplierKw = (product.supplierKeywords && product.supplierKeywords.length > 0 && product.supplierKeywords[0]) || '';
  const orig = (product.originalName || '').trim();
  const ptName = (product.name || '').trim();

  // 1. TikTok Viral Query:
  // Prioritiza o modelo exato gringo ou palavra-chave de atacado que encontra diretamente os unboxings virais
  let exactViralSearchQuery = product.exactSearchQuery || primarySupplierKw || orig || ptName;

  // 2. Termo conciso para a barra de pesquisa de afiliados no app móvel do TikTok Shop:
  let exactAffiliateSearchTerm = '';
  if (orig) {
    const words = orig.split(' ').filter(Boolean);
    exactAffiliateSearchTerm = words.slice(0, 4).join(' ');
  } else if (primarySupplierKw) {
    exactAffiliateSearchTerm = primarySupplierKw;
  } else {
    exactAffiliateSearchTerm = ptName.split(' ').slice(0, 4).join(' ');
  }

  // 3. Links de validação de preço em outros marketplaces
  const ptQueryShort = ptName.split(' ').slice(0, 4).join(' ');
  const globalQuery = primarySupplierKw || orig || ptName;

  return {
    exactViralSearchQuery,
    exactAffiliateSearchTerm,
    shopeeSearchUrl: `https://shopee.com.br/search?keyword=${encodeURIComponent(ptQueryShort)}`,
    aliExpressSearchUrl: `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(globalQuery)}`,
    mercadoLivreSearchUrl: `https://lista.mercadolivre.com.br/${encodeURIComponent(ptQueryShort)}`,
  };
}

export function enrichWithTikTokShopData(product: any): any {
  if (!product) return product;

  // Comissão ausente no dado ao vivo fica ausente. Não inventar 20% em cima do preço.
  const commissionUnknown = product.commissionUnknown === true;
  let commissionRatePercent: number | null = null;
  let commissionValueBRL: number | null = null;
  if (!commissionUnknown) {
    commissionRatePercent = product.tiktokShop?.commissionRatePercent || product.commissionPercent || 20;
    if (!product.tiktokShop && !product.commissionPercent) {
      if (product.niche === 'beauty' || product.niche === 'health') commissionRatePercent = 25;
      else if (product.niche === 'accessories' || product.niche === 'home') commissionRatePercent = 22;
      else if (product.niche === 'tech' || product.niche === 'gaming') commissionRatePercent = 18;
      else if (product.niche === 'fitness') commissionRatePercent = 20;
      else commissionRatePercent = 20;
    }
  }

  const band = priceBandOf(product);
  const priceBRL = band.avg || Number(product.estimatedPriceBRL) || (product.dataSource === 'live' ? 0 : 89.90);
  if (!commissionUnknown) {
    const explicitRate = commissionRateOf({
      commissionRate: product.commissionRate,
      commission_rate: product.commission_rate,
      commissionPercent: product.commissionPercent,
      tiktokShop: product.tiktokShop,
      commissionEstimatedBRL: product.commissionEstimatedBRL ?? product.tiktokShop?.commissionValueBRL,
      priceAvg: product.priceAvg ?? product.estimatedPriceBRL,
      estimatedPriceBRL: product.estimatedPriceBRL,
    });
    if (explicitRate != null) commissionRatePercent = explicitRate;
    const explicitCommission = product.tiktokShop?.commissionValueBRL ?? product.commissionEstimatedBRL;
    commissionValueBRL = explicitCommission != null && explicitCommission !== ''
      ? Number(explicitCommission)
      : Number((((priceBRL * (commissionRatePercent || 0)) / 100)).toFixed(2));
  }

  const explicitVideos = Number(product.videoCountBR ?? product.tiktokShop?.videoCountBR);
  const activeCreatorsCount = Number.isFinite(explicitVideos) ? explicitVideos : undefined;
  const explicitSales = Number(product.tiktokShop?.recentSalesCount);
  const recentSalesCount = Number.isFinite(explicitSales) ? explicitSales : undefined;
  const explicitStock = Number(product.stockUnits ?? product.tiktokShop?.stockUnits);
  const stockUnits = Number.isFinite(explicitStock) ? explicitStock : undefined;
  const saturationLevel = product.tiktokShop?.saturationLevel || product.creatorSaturationBR || 'Oceano Azul';

  const stockLocation = 'TikTok Shop';

  // Identificadores de precisão cirúrgica (substitui busca genérica de 3 palavras)
  const sharp = extractSharpProductIdentifiers(product);

  const tiktokShopAffiliateLink = product.tiktokShop?.tiktokShopAffiliateLink || 
    product.tiktokShopAffiliateLink ||
    `https://www.tiktok.com/search?q=${encodeURIComponent(sharp.exactViralSearchQuery)}`;

  const topViralHook = product.tiktokShop?.topViralHook || 
    product.hookViral3s ||
    (product.adHooks && product.adHooks[0]) || 
    `Se você mora no Brasil e ainda não viu esse ${(product.name || 'produto').split(' ')[0]}, você tá vivendo errado!`;

  const isFreeSample = product.tiktokShop?.freeSampleAvailable ?? 
    product.freeSampleAvailable ??
    (product.waveStage === 'early_wave' || (product.viralityScore || 0) >= 92);

  // =========================================================================
  // MOTOR DE CONVICÇÃO TIKBLOX: UNIT ECONOMICS & SINAL DE ENTRADA DO AFILIADO
  // =========================================================================
  const sampleCostBRL = band.min || priceBRL;
  const commissionForMath = !commissionUnknown && commissionRatePercent != null
    ? roundMoney((sampleCostBRL * commissionRatePercent) / 100)
    : (commissionValueBRL ?? 0);
  const breakEvenSales = commissionForMath > 0 ? Math.max(1, Math.ceil(sampleCostBRL / commissionForMath)) : 0;
  const netProfitAt20Sales = Math.max(0, Number(((20 * commissionForMath) - sampleCostBRL).toFixed(2)));
  const netProfitAt50Sales = Math.max(0, Number(((50 * commissionForMath) - sampleCostBRL).toFixed(2)));

  // Concorrência só existe quando a contagem de vídeos veio da coleta.
  const creatorVideoCountBR = activeCreatorsCount;
  const measured = product.dataSource === 'live' && typeof creatorVideoCountBR === 'number';
  let creatorCompetitionLevel: 'Oceano Azul (< 10 vídeos)' | 'Baixa Concorrência (10-25 vídeos)' | 'Concorrência Média (25-50 vídeos)' | 'Saturado (> 50 vídeos)' | 'Contagem não informada' = 'Contagem não informada';
  if (measured && creatorVideoCountBR > 50) creatorCompetitionLevel = 'Saturado (> 50 vídeos)';
  else if (measured && creatorVideoCountBR > 25) creatorCompetitionLevel = 'Concorrência Média (25-50 vídeos)';
  else if (measured && creatorVideoCountBR >= 10) creatorCompetitionLevel = 'Baixa Concorrência (10-25 vídeos)';
  else if (measured) creatorCompetitionLevel = 'Oceano Azul (< 10 vídeos)';

  // Score = 95 − vídeos medidos, entre 5 e 95. Sem piso de 91 e sem viralityScore do catálogo de exemplo.
  const convictionScore = measured ? Math.max(5, Math.min(95, 95 - Math.round(creatorVideoCountBR))) : null;

  let verdict: 'COMPRA_RECOMENDADA' | 'ENTRADA_MODERADA' | 'ALERTA_SATURACAO' = 'ENTRADA_MODERADA';
  let verdictLabel = 'DADOS INCOMPLETOS';
  let riskLevel: 'MUITO_BAIXO' | 'BAIXO' | 'MODERADO' = 'MODERADO';
  let riskLabel = 'Contagem de vídeos ausente';

  if (measured && creatorVideoCountBR < 10) {
    verdict = 'COMPRA_RECOMENDADA';
    verdictLabel = 'POUCOS VÍDEOS NO FEED';
    riskLevel = 'BAIXO';
    riskLabel = 'Menos de 10 vídeos medidos';
  } else if (measured && creatorVideoCountBR <= 25) {
    verdict = 'ENTRADA_MODERADA';
    verdictLabel = 'CONCORRÊNCIA BAIXA';
    riskLevel = 'BAIXO';
    riskLabel = '10 a 25 vídeos medidos';
  } else if (measured && creatorVideoCountBR <= 50) {
    verdict = 'ENTRADA_MODERADA';
    verdictLabel = 'CONCORRÊNCIA MÉDIA';
    riskLevel = 'MODERADO';
    riskLabel = '26 a 50 vídeos medidos';
  } else if (measured) {
    verdict = 'ALERTA_SATURACAO';
    verdictLabel = 'FEED CHEIO';
    riskLevel = 'MODERADO';
    riskLabel = 'Mais de 50 vídeos medidos';
  }

  const reasons = [
    'O comprador escolhe o vendedor dentro do TikTok Shop.',
    measured
      ? `${creatorVideoCountBR} vídeos medidos no TikTok Brasil (${creatorCompetitionLevel}).`
      : 'A contagem de vídeos não veio nesta coleta. O radar não completa esse número.',
    breakEvenSales > 0
      ? `No menor preço da faixa, cerca de ${breakEvenSales} vendas cobrem esse valor. O preço no TikTok muda com cupom, promoção e vendedor.`
      : 'Sem comissão informada não dá para calcular em quantas vendas o menor preço se paga.'
  ];

  const tradeConviction = {
    verdict,
    verdictLabel,
    convictionScore,
    sampleCostBRL,
    commissionBRL: commissionUnknown ? null : commissionValueBRL,
    commissionPercent: commissionUnknown ? null : commissionRatePercent,
    breakEvenSales,
    netProfitAt20Sales,
    netProfitAt50Sales,
    creatorVideoCountBR,
    creatorCompetitionLevel,
    stockLocation,
    shippingDays: '',
    riskLevel,
    riskLabel,
    reasons
  };

  const dataSource = product.dataSource === 'live' ? 'live' : 'curated';

  return {
    ...product,
    dataSource,
    priceMin: band.min || undefined,
    priceMax: band.max || undefined,
    priceAvg: band.avg || undefined,
    priceEstimated: band.estimated,
    commissionRate: commissionUnknown ? undefined : commissionRatePercent ?? undefined,
    metricsEstimated: dataSource !== 'live',
    commissionUnknown,
    stockUnits,
    videoCountBR: activeCreatorsCount,
    tradeConviction,
    commissionPercent: commissionUnknown ? undefined : commissionRatePercent,
    commissionEstimatedBRL: commissionUnknown ? undefined : commissionValueBRL,
    stockLocationBrazil: stockLocation,
    freeSampleAvailable: isFreeSample,
    creatorSaturationBR: saturationLevel,
    tiktokShopAffiliateLink,
    exactViralSearchQuery: sharp.exactViralSearchQuery,
    exactAffiliateSearchTerm: sharp.exactAffiliateSearchTerm,
    shopeeSearchUrl: sharp.shopeeSearchUrl,
    aliExpressSearchUrl: sharp.aliExpressSearchUrl,
    mercadoLivreSearchUrl: sharp.mercadoLivreSearchUrl,
    hookViral3s: topViralHook,
    imageUrl: resolveRealProductImage(product),
    tiktokShop: {
      hasBrazilStock: true,
      stockLocation,
      commissionRatePercent: commissionUnknown ? undefined : commissionRatePercent,
      commissionValueBRL: commissionUnknown ? undefined : commissionValueBRL,
      productUrl: product.productUrl || product.tiktokShop?.productUrl,
      freeSampleAvailable: isFreeSample,
      minFollowersForSample: 1000,
      activeCreatorsCount,
      videoCountBR: activeCreatorsCount,
      stockUnits,
      recentSalesCount,
      saturationLevel,
      tiktokShopAffiliateLink,
      exactViralSearchQuery: sharp.exactViralSearchQuery,
      exactAffiliateSearchTerm: sharp.exactAffiliateSearchTerm,
      shopeeSearchUrl: sharp.shopeeSearchUrl,
      aliExpressSearchUrl: sharp.aliExpressSearchUrl,
      mercadoLivreSearchUrl: sharp.mercadoLivreSearchUrl,
      topViralHook,
      tradeConviction,
      sampleRequestTip: 'Solicite amostra grátis no Centro de Criadores do TikTok Shop mencionando que você vai gravar 3 vídeos verticais e fazer 1 live na semana da entrega.',
    },
  };
}
