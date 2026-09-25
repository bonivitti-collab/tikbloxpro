import {
  TrendingProduct,
  DeepDiveAnalysis,
  AdCreativeScript,
  ProductPriceCheck,
  PriceMonitorSummary,
} from '../types';
import { INITIAL_CURATED_TRENDS } from '../data/curatedTrends';
import {
  saveProductToIndexedDB,
  removeProductFromIndexedDB,
  cacheTrendProductsToIndexedDB,
  getAllCachedTrendsFromIndexedDB,
  saveScanSnapshotToIndexedDB,
  autoCleanupTrendCacheIfDue,
} from './indexedDbService';

const LOCAL_STORAGE_KEY_SAVED = 'tikblox_saved_products_v1';
const LOCAL_STORAGE_KEY_SCAN_CACHE = 'tikblox_scan_cache_v1';

export async function scanTrends(params: {
  niche?: string;
  originCountry?: string;
  query?: string;
}): Promise<{ products: TrendingProduct[]; groundingSources: Array<{ title: string; uri: string }> }> {
  try {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    if (data.success && Array.isArray(data.products) && data.products.length > 0) {
      // 1. Sync to local quick cache
      cacheScannedProducts(data.products);

      // 2. Persist to robust offline IndexedDB storage (Trend History + Scan Snapshot)
      cacheTrendProductsToIndexedDB(data.products, 'scan').catch(() => {});
      saveScanSnapshotToIndexedDB({
        query: params.query,
        niche: params.niche,
        originCountry: params.originCountry,
        products: data.products,
      }).catch(() => {});

      // 3. Keep cache lean by running background cleanup if due (>30 days old)
      autoCleanupTrendCacheIfDue().catch(() => {});

      return {
        products: data.products,
        groundingSources: data.groundingSources || [],
      };
    }
  } catch {
    // Graceful offline fallback: try retrieving from IndexedDB trend history
  }

  // Fallback to rich curated trends + cached trend history from IndexedDB
  let sourceProducts = [...INITIAL_CURATED_TRENDS];
  try {
    const dbCached = await getAllCachedTrendsFromIndexedDB();
    if (dbCached && dbCached.length > 0) {
      const existingIds = new Set(dbCached.map((p) => p.id));
      const complement = INITIAL_CURATED_TRENDS.filter((p) => !existingIds.has(p.id));
      sourceProducts = [...dbCached, ...complement];
    }
  } catch {
    // Continue with curated trends
  }

  let filtered = sourceProducts;
  if (params.niche && params.niche !== 'all') {
    filtered = filtered.filter((p) => p.niche === params.niche);
  }
  if (params.originCountry && params.originCountry !== 'all') {
    filtered = filtered.filter((p) => p.originCountry === params.originCountry);
  }
  if (params.query) {
    const q = params.query.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.originalName.toLowerCase().includes(q) ||
        p.culturalFitReason.toLowerCase().includes(q)
    );
  }

  return {
    products: filtered,
    groundingSources: [
      { title: 'TIKBLOX Cache Offline (IndexedDB)', uri: 'https://tikblox.app' },
      { title: 'TikTok Creative Center - Top Products US', uri: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en' },
      { title: 'Amazon Movers & Shakers', uri: 'https://www.amazon.com/gp/movers-and-shakers' },
      { title: 'AliExpress Trending Dropshipping Hub', uri: 'https://www.aliexpress.com' },
    ],
  };
}

export async function getProductDeepDive(product: TrendingProduct): Promise<DeepDiveAnalysis> {
  try {
    const res = await fetch('/api/deep-dive', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.analysis) {
        return data.analysis;
      }
    }
  } catch {
    // Graceful fallback
  }

  // Fallback rich local analysis
  return {
    productId: product.id,
    productName: product.name,
    marketPotentialSummary: `${product.name} apresenta um descolamento de demanda no exterior em relação ao Brasil. Baixíssima concorrência ativa nos maiores marketplaces nacionais.`,
    brazilOpportunityScore: product.viralityScore,
    competitionAnalysis: {
      shopeeStatus: 'Menos de 10 lojas ativas; a maioria sem estoque no Brasil e com prazo de entrega de 25 dias.',
      mercadoLivreStatus: 'Apenas 2 a 3 anúncios com vendas consolidadas no Full; preço médio 3x acima do custo internacional.',
      tiktokShopBRStatus: 'Oceano azul. Quase nenhum criador de conteúdo produzindo vídeos com link de afiliado ou loja própria.',
    },
    recommendedPriceBRL: {
      min: Math.round(product.estimatedPriceBRL * 0.85),
      optimal: product.estimatedPriceBRL,
      max: Math.round(product.estimatedPriceBRL * 1.35),
    },
    recommendedAdAngles: product.adHooks.map((hook, i) => ({
      angleName: `Ângulo Estratégico #${i + 1}`,
      hook,
      targetPainPoint: product.culturalFitReason,
      visualSuggestion: i === 0
        ? 'Primeiros 2 segundos com corte de ação rápida demonstrando o resultado impressionante.'
        : 'Vídeo estilo depoimento casual (UGC) segurando o produto no ambiente doméstico.',
    })),
    logisticsAdvice: `Complexidade logística classificada como "${product.logisticsComplexity}". Compras abaixo de $50 USD enquadram-se na alíquota básica de importação.`,
    actionChecklist: [
      'Buscar termos no 1688 ou AliExpress: ' + product.supplierKeywords.join(', '),
      'Testar 3 criativos em formato TikTok vertical 9:16',
      'Criar página de vendas com garantia de 30 dias e depoimentos em vídeo',
      'Configurar checkout transparente com Pix instantâneo para alavancar conversão',
    ],
  };
}

export async function generateAdScripts(product: TrendingProduct): Promise<AdCreativeScript[]> {
  try {
    const res = await fetch('/api/creative-generator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: product.name,
        originalName: product.originalName,
        niche: product.nicheLabel,
        targetAudience: product.targetAudience,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.scripts) && data.scripts.length > 0) {
        return data.scripts;
      }
    }
  } catch {
    // Graceful fallback
  }

  return [
    {
      title: 'Gancho Viral de Quebra de Padrão (Onda Gringa)',
      targetPlatform: 'TikTok',
      hook3Seconds: product.adHooks[0] || 'Se você mora no Brasil e ainda não viu isso, prepare-se!',
      bodyScript: `Eu não acreditei quando vi esse produto com mais de 30 milhões de visualizações na gringa. Decidi importar uma unidade para testar por conta própria e o resultado foi absurdo. Olha isso funcionando em tempo real... Ele simplesmente resolve o problema em segundos.`,
      callToAction: 'O link com desconto de lançamento e frete grátis para todo o Brasil está no primeiro link!',
      visualDirections: [
        '0s - 2s: Rosto com expressão de choque enquanto segura a caixa recém-chegada.',
        '3s - 7s: Demonstração clara e em alta definição do produto operando.',
        '8s - 15s: Resumo dos 3 maiores benefícios na tela com legendas dinâmicas coloridas.',
      ],
      audioStyle: 'Áudio dinâmico acelerado com entonação amigável e energética.',
    },
    {
      title: 'Comparativo Direto (Solução Antiga vs Inovação TIKBLOX)',
      targetPlatform: 'Instagram Reels',
      hook3Seconds: product.adHooks[1] || 'Pare agora de gastar dinheiro com métodos ultrapassados!',
      bodyScript: `Enquanto você ainda perde tempo e paciência com soluções que não funcionam direito, quem já descobriu isso aqui resolve tudo sem esforço. Custa menos que um jantar de fim de semana e dura anos.`,
      callToAction: 'Toque em "Saiba Mais" abaixo para garantir o seu antes que o lote internacional esgote!',
      visualDirections: [
        'Tela dividida: à esquerda o estresse do método tradicional, à direita a facilidade do produto.',
        'Close-up na textura e na qualidade dos materiais.',
        'Chamada final para o botão de compra.',
      ],
      audioStyle: 'Música pop com batida ritmada e efeito sonoro de transição rápida.',
    },
  ];
}

// Local Storage helpers for Saved Products
export function getSavedProductIds(): string[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SAVED);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleSaveProduct(productId: string, productObj?: TrendingProduct): boolean {
  const current = getSavedProductIds();
  let updated: string[];
  let isSaved = false;

  if (current.includes(productId)) {
    updated = current.filter((id) => id !== productId);
    isSaved = false;
    // Remove from IndexedDB asynchronously
    removeProductFromIndexedDB(productId).catch((err) => {
      console.warn('Error removing product from IndexedDB:', err);
    });
  } else {
    updated = [...current, productId];
    isSaved = true;
    // Persist full product to IndexedDB asynchronously
    if (productObj) {
      saveProductToIndexedDB(productObj).catch((err) => {
        console.warn('Error saving product to IndexedDB:', err);
      });
    }
  }

  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_SAVED, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving to localStorage:', e);
  }

  return isSaved;
}

/**
 * Synchronizes multiple saved products to IndexedDB store.
 */
export async function syncSavedProductsToIndexedDB(products: TrendingProduct[]): Promise<void> {
  const savedIds = new Set(getSavedProductIds());
  const toSave = products.filter((p) => savedIds.has(p.id));
  for (const product of toSave) {
    await saveProductToIndexedDB(product).catch(() => {});
  }
}

export function cacheScannedProducts(products: TrendingProduct[]) {
  try {
    const existing = getCachedScannedProducts();
    const map = new Map<string, TrendingProduct>();
    products.forEach((p) => map.set(p.id, p));
    existing.forEach((p) => {
      if (!map.has(p.id)) map.set(p.id, p);
    });
    const combined = Array.from(map.values()).slice(0, 50);
    localStorage.setItem(LOCAL_STORAGE_KEY_SCAN_CACHE, JSON.stringify(combined));
  } catch (e) {
    console.error('Failed to cache scanned products:', e);
  }
}

export function getCachedScannedProducts(): TrendingProduct[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_SCAN_CACHE);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// ==========================================
// PRICE MONITORING FOR SAVED PRODUCTS
// ==========================================

export const LOCAL_STORAGE_KEY_PRICE_MONITOR = 'tikblox_price_monitor_summary_v1';

/**
 * Checks price variations for a list of saved products via the /api/price-monitor endpoint.
 * Automatically compares original detected costs with fresh supplier & marketplace pricing.
 */
export async function checkSavedProductsPrices(
  products: TrendingProduct[],
  forceRefresh = false
): Promise<PriceMonitorSummary> {
  const defaultSummary: PriceMonitorSummary = {
    lastCheckedAt: new Date().toISOString(),
    totalMonitored: products.length,
    opportunitiesCount: 0,
    warningsCount: 0,
    stableCount: products.length,
    avgCostChangePercent: 0,
    exchangeRateUSDBRL: 5.82,
    items: {},
  };

  if (!products || products.length === 0) {
    return defaultSummary;
  }

  try {
    const res = await fetch('/api/price-monitor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        products: products.map((p) => ({
          id: p.id,
          name: p.name,
          originalName: p.originalName,
          estimatedCostUSD: p.estimatedCostUSD,
          estimatedPriceBRL: p.estimatedPriceBRL,
          estimatedProfitMarginPercent: p.estimatedProfitMarginPercent,
          niche: p.niche,
          originCountry: p.originCountry,
        })),
        forceRefresh,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && Array.isArray(data.results)) {
        const itemsMap: Record<string, ProductPriceCheck> = {};
        for (const r of data.results) {
          itemsMap[r.productId] = r;
        }

        const summary: PriceMonitorSummary = {
          lastCheckedAt: data.timestamp || new Date().toISOString(),
          totalMonitored: data.summary?.totalMonitored ?? data.results.length,
          opportunitiesCount: data.summary?.opportunitiesCount ?? 0,
          warningsCount: data.summary?.warningsCount ?? 0,
          stableCount: data.summary?.stableCount ?? 0,
          avgCostChangePercent: data.summary?.avgCostChangePercent ?? 0,
          exchangeRateUSDBRL: data.exchangeRateUSDBRL || 5.82,
          items: itemsMap,
        };

        // Cache summary in localStorage for offline access
        saveStoredPriceChecks(summary);
        return summary;
      }
    }
  } catch (err) {
    console.warn('Network price check failed, falling back to local cached price monitor:', err);
  }

  // Graceful offline fallback: return stored price check summary if available
  const stored = getStoredPriceChecks();
  if (stored && Object.keys(stored.items).length > 0) {
    return stored;
  }

  return defaultSummary;
}

/**
 * Retrieves the stored price check summary from localStorage
 */
export function getStoredPriceChecks(): PriceMonitorSummary | null {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_PRICE_MONITOR);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Persists the price check summary to localStorage
 */
export function saveStoredPriceChecks(summary: PriceMonitorSummary): void {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_PRICE_MONITOR, JSON.stringify(summary));
  } catch (e) {
    console.warn('Failed to save price check summary to localStorage:', e);
  }
}
