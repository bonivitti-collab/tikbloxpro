import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bookmark, Sparkles, Layers, Database, History, CheckCircle2, Search, TrendingDown, RefreshCw, AlertTriangle, FileSpreadsheet, Check } from 'lucide-react';
import { TrendingProduct, ProductPriceCheck, PriceMonitorSummary } from '../types';
import { ProductCard } from './ProductCard';
import { PriceMonitorSection } from './PriceMonitorSection';
import { getAllCachedTrendsFromIndexedDB } from '../services/indexedDbService';
import { useTranslation } from '../i18n/LanguageContext';

interface SavedRadarViewProps {
  savedProducts: TrendingProduct[];
  priceSummary?: PriceMonitorSummary | null;
  isCheckingPrices?: boolean;
  onRefreshPrices?: () => void;
  onApplyPriceUpdate?: (productId: string, check: ProductPriceCheck) => void;
  onToggleSave: (id: string) => void;
  onOpenDeepDive: (product: TrendingProduct) => void;
  onOpenCalculator: (product: TrendingProduct) => void;
  onOpenCreativeGenerator: (product: TrendingProduct) => void;
  onBackToRadar: () => void;
  initialSubTab?: 'saved' | 'price_monitor' | 'history';
}

export const SavedRadarView: React.FC<SavedRadarViewProps> = ({
  savedProducts,
  priceSummary = null,
  isCheckingPrices = false,
  onRefreshPrices,
  onApplyPriceUpdate,
  onToggleSave,
  onOpenDeepDive,
  onOpenCalculator,
  onOpenCreativeGenerator,
  onBackToRadar,
  initialSubTab = 'saved',
}) => {
  const { t, language } = useTranslation();
  const [viewMode, setViewMode] = useState<'saved' | 'price_monitor' | 'history'>(initialSubTab);
  const [cachedHistory, setCachedHistory] = useState<TrendingProduct[]>([]);
  const [filterQuery, setFilterQuery] = useState('');
  const [hasExported, setHasExported] = useState(false);

  const handleExportCSV = () => {
    const listToExport = savedProducts.length > 0 ? savedProducts : activeList;
    if (listToExport.length === 0) return;

    const headers = [
      'ID',
      language === 'en' ? 'Product Name' : 'Nome do Produto',
      language === 'en' ? 'Original Name' : 'Nome Original',
      language === 'en' ? 'Niche' : 'Nicho',
      language === 'en' ? 'Origin Country' : 'País de Origem',
      language === 'en' ? 'Viral Platform' : 'Plataforma Viral',
      language === 'en' ? 'Wave Stage' : 'Estágio da Onda',
      language === 'en' ? 'Virality Score (0-100)' : 'Score de Viralidade (0-100)',
      language === 'en' ? 'Saturation in Brazil' : 'Saturação no Brasil',
      language === 'en' ? 'Estimated Cost USD' : 'Custo Est. (USD)',
      language === 'en' ? 'Estimated Price BRL' : 'Preço Venda Est. (BRL)',
      language === 'en' ? 'Estimated Gross Margin %' : 'Margem Bruta Est. (%)',
      language === 'en' ? 'Logistics Complexity' : 'Complexidade Logística',
      language === 'en' ? 'Target Audience' : 'Público Alvo',
      language === 'en' ? 'Cultural Fit / Sales Angle' : 'Motivo Cultural / Âncora de Venda',
      language === 'en' ? 'Supplier Keywords' : 'Palavras-chave Fornecedor',
      language === 'en' ? 'Views Last 30 Days' : 'Visualizações (30 Dias)',
      language === 'en' ? 'Brazil Search Volume' : 'Volume de Busca BR',
      language === 'en' ? 'Current Supplier Price USD' : 'Preço Fornecedor Monitorado (USD)',
      language === 'en' ? 'Price Variation %' : 'Variação Preço (%)',
      language === 'en' ? 'Discovered At' : 'Data de Descoberta'
    ];

    const escapeCSV = (value: string | number | undefined | null) => {
      if (value === undefined || value === null) return '""';
      const str = String(value).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = listToExport.map((p) => {
      const priceCheck = priceSummary?.items[p.id];
      return [
        escapeCSV(p.id),
        escapeCSV(p.name),
        escapeCSV(p.originalName),
        escapeCSV(p.nicheLabel || p.niche),
        escapeCSV(p.originCountry),
        escapeCSV(p.originPlatform),
        escapeCSV(p.waveStageLabel || p.waveStage),
        escapeCSV(p.viralityScore),
        escapeCSV(p.saturationInBrazil),
        escapeCSV(p.estimatedCostUSD),
        escapeCSV(p.estimatedPriceBRL),
        escapeCSV(`${p.estimatedProfitMarginPercent}%`),
        escapeCSV(p.logisticsComplexity),
        escapeCSV(p.targetAudience),
        escapeCSV(p.culturalFitReason),
        escapeCSV(Array.isArray(p.supplierKeywords) ? p.supplierKeywords.join(', ') : ''),
        escapeCSV(p.trendingMetrics?.viewsLast30Days || ''),
        escapeCSV(p.trendingMetrics?.searchVolumeBR || ''),
        escapeCSV(priceCheck ? priceCheck.currentCostUSD : p.estimatedCostUSD),
        escapeCSV(priceCheck ? `${priceCheck.costChangePercent > 0 ? '+' : ''}${priceCheck.costChangePercent}%` : '0%'),
        escapeCSV(p.discoveredAt)
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.map(escapeCSV).join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const dateStr = new Date().toISOString().slice(0, 10);
    link.setAttribute('href', url);
    link.setAttribute('download', `tikblox_produtos_salvos_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setHasExported(true);
    setTimeout(() => {
      setHasExported(false);
    }, 2500);
  };
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  useEffect(() => {
    if (initialSubTab) {
      setViewMode(initialSubTab);
    }
  }, [initialSubTab]);

  useEffect(() => {
    let isMounted = true;
    const loadHistory = async () => {
      setIsLoadingHistory(true);
      try {
        const list = await getAllCachedTrendsFromIndexedDB();
        if (isMounted) {
          setCachedHistory(list);
        }
      } catch (e) {
        console.warn('Could not load cached trends from IndexedDB:', e);
      } finally {
        if (isMounted) setIsLoadingHistory(false);
      }
    };
    loadHistory();
    return () => {
      isMounted = false;
    };
  }, []);

  const activeList = viewMode === 'saved' ? savedProducts : cachedHistory;
  const savedIdsSet = React.useMemo(() => new Set(savedProducts.map((p) => p.id)), [savedProducts]);

  const filteredList = React.useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return activeList;
    return activeList.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.originalName.toLowerCase().includes(q) ||
        p.nicheLabel.toLowerCase().includes(q) ||
        p.culturalFitReason.toLowerCase().includes(q)
    );
  }, [activeList, filterQuery]);

  const totalVariationsCount = (priceSummary?.opportunitiesCount ?? 0) + (priceSummary?.warningsCount ?? 0);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="text-xl font-black text-white flex items-center gap-2">
              <Bookmark className="w-5 h-5 text-[#FE2C55]" />
              <span>{language === 'en' ? 'My Personal Radar & Price Monitor' : 'Meu Radar Pessoal & Monitor de Preços'}</span>
            </h2>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              <Database className="w-3 h-3 text-cyan-400" />
              {language === 'en' ? 'IndexedDB Active' : 'IndexedDB Ativo'}
            </span>
          </div>
          <p className="text-xs text-[#A6A7B2] mt-0.5">
            {language === 'en'
              ? 'Access your bookmarked products, monitor live price fluctuations via API, and inspect offline history.'
              : 'Acesse seus produtos favoritos, monitore variações de preço via API e consulte o histórico offline.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <button
            id="export-saved-csv-btn"
            onClick={handleExportCSV}
            disabled={savedProducts.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer ${
              savedProducts.length === 0
                ? 'opacity-40 cursor-not-allowed border-white/5 bg-[#2A3042] text-[#757788]'
                : hasExported
                ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-300'
                : 'border-[#25F4EE]/30 bg-[#25F4EE]/10 hover:bg-[#25F4EE]/20 text-[#25F4EE] hover:border-[#25F4EE]/60'
            }`}
            title={
              savedProducts.length === 0
                ? (language === 'en' ? 'No saved products to export' : 'Nenhum produto salvo para exportar')
                : (language === 'en' ? 'Export saved products to CSV' : 'Exportar produtos salvos para CSV')
            }
          >
            {hasExported ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>{language === 'en' ? 'Exported!' : 'CSV Exportado!'}</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#25F4EE]" />
                <span>{language === 'en' ? 'Export CSV' : 'Exportar CSV'}</span>
                {savedProducts.length > 0 && (
                  <span className="ml-0.5 rounded-md bg-black/40 px-1.5 py-0.2 text-[10px] font-mono text-white/90">
                    {savedProducts.length}
                  </span>
                )}
              </>
            )}
          </button>

          <button
            onClick={onBackToRadar}
            className="text-xs font-semibold text-[#25F4EE] hover:text-white px-3 py-1.5 rounded-xl border border-white/10 bg-[#2A3042] transition cursor-pointer"
          >
            {language === 'en' ? '← Back to Main Radar' : '← Voltar para o Radar Principal'}
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Saved Products vs Live Price Monitor vs Trend History */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#2A3042] border border-white/10 text-xs overflow-x-auto relative">
          <button
            onClick={() => setViewMode('saved')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'saved'
                ? 'text-white'
                : 'text-[#A6A7B2] hover:text-white'
            }`}
          >
            {viewMode === 'saved' && (
              <motion.div
                layoutId="saved-view-subtab-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FE2C55] to-[#FF0050] shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Bookmark className="w-3.5 h-3.5" />
              <span>
                {language === 'en' ? 'Saved Products' : 'Produtos Salvos'} ({savedProducts.length})
              </span>
            </span>
          </button>

          <button
            onClick={() => setViewMode('price_monitor')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'price_monitor'
                ? 'text-[#242938] font-black'
                : 'text-[#A6A7B2] hover:text-[#25F4EE]'
            }`}
          >
            {viewMode === 'price_monitor' && (
              <motion.div
                layoutId="saved-view-subtab-pill"
                className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] shadow-md"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t('price_monitor_tab')}</span>
              {totalVariationsCount > 0 && (
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    viewMode === 'price_monitor'
                      ? 'bg-black text-white'
                      : 'bg-[#25F4EE]/20 text-[#25F4EE]'
                  }`}
                >
                  {totalVariationsCount}
                </span>
              )}
            </span>
          </button>

          <button
            onClick={() => setViewMode('history')}
            className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors whitespace-nowrap cursor-pointer ${
              viewMode === 'history'
                ? 'text-cyan-300'
                : 'text-[#A6A7B2] hover:text-white'
            }`}
          >
            {viewMode === 'history' && (
              <motion.div
                layoutId="saved-view-subtab-pill"
                className="absolute inset-0 rounded-lg bg-cyan-500/20 border border-cyan-500/40 shadow-sm"
                transition={{ type: 'spring', stiffness: 450, damping: 35 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              <History className="w-3.5 h-3.5" />
              <span>
                {language === 'en' ? 'Trend History' : 'Histórico de Tendências'} ({cachedHistory.length})
              </span>
            </span>
          </button>
        </div>

        {/* Local Search (only in saved or history mode) */}
        {viewMode !== 'price_monitor' && (
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#757788]" />
            <input
              type="text"
              placeholder={
                language === 'en'
                  ? `Search in ${viewMode === 'saved' ? 'saved' : 'history'}...`
                  : `Buscar em ${viewMode === 'saved' ? 'salvos' : 'histórico'}...`
              }
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-[#262B3A] py-1.5 pl-8 pr-3 text-xs text-white placeholder-[#757788] focus:border-[#25F4EE] focus:outline-none transition"
            />
          </div>
        )}
      </div>

      {/* Subtab Panels with Framer Motion Transitions */}
      <AnimatePresence mode="wait" initial={false}>
        {viewMode === 'price_monitor' ? (
          <motion.div
            key="subtab-price-monitor"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            <PriceMonitorSection
              savedProducts={savedProducts}
              priceSummary={priceSummary}
              isCheckingPrices={isCheckingPrices}
              onRefreshPrices={onRefreshPrices || (() => {})}
              onOpenCalculator={onOpenCalculator}
              onOpenDeepDive={onOpenDeepDive}
              onApplyPriceUpdate={onApplyPriceUpdate || (() => {})}
            />
          </motion.div>
        ) : (
          <motion.div
            key={`subtab-${viewMode}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-4"
          >
            {/* Quick Notice Banner when in 'saved' view if price changes detected */}
            {viewMode === 'saved' && savedProducts.length > 0 && totalVariationsCount > 0 && (
              <div className="flex items-center justify-between gap-3 p-3.5 rounded-xl border border-[#25F4EE]/30 bg-[#25F4EE]/5">
                <div className="flex items-center gap-2.5 text-xs text-white">
                  <Sparkles className="w-4 h-4 text-[#25F4EE] shrink-0" />
                  <span>
                    <strong>{language === 'en' ? 'Price Variations Detected:' : 'Variações de Preço Detectadas:'}</strong>{' '}
                    {priceSummary?.opportunitiesCount ?? 0} {language === 'en' ? 'opportunities' : 'oportunidades'} (queda de custo){' '}
                    {language === 'en' ? 'and' : 'e'} {priceSummary?.warningsCount ?? 0} {language === 'en' ? 'cost hikes' : 'altas de custo'}.
                  </span>
                </div>
                <button
                  onClick={() => setViewMode('price_monitor')}
                  className="shrink-0 px-3 py-1 rounded-lg text-xs font-bold bg-[#25F4EE] hover:bg-[#00D2C4] text-[#242938] transition cursor-pointer"
                >
                  {language === 'en' ? 'View Price Monitor →' : 'Ver Monitor de Preços →'}
                </button>
              </div>
            )}

            {/* Content Section: Saved or History */}
            {viewMode === 'saved' && savedProducts.length === 0 ? (
              <div className="py-16 text-center max-w-md mx-auto px-4">
                <div className="w-16 h-16 rounded-2xl bg-[#FE2C55]/10 border border-[#FE2C55]/20 flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-[#FE2C55]" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">
                  {language === 'en' ? 'Your Personal Radar is Empty' : 'Seu Radar Pessoal está Vazio'}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-6">
                  {language === 'en'
                    ? 'Browse trending products and bookmark items to save them in your local IndexedDB storage. They will be monitored for live price variations via API.'
                    : 'Navegue pelas tendências e clique no ícone de marcador para salvar produtos no seu banco local IndexedDB. Eles serão monitorados para variações de preço via API.'}
                </p>
                <button
                  onClick={onBackToRadar}
                  className="inline-flex items-center gap-2 rounded-xl bg-[#FE2C55] hover:bg-[#FF0050] px-5 py-2.5 text-xs font-bold text-white transition shadow-lg shadow-[#FE2C55]/20 cursor-pointer"
                >
                  <Layers className="w-4 h-4" />
                  <span>{language === 'en' ? 'View Trending Products' : 'Ver Produtos em Alta'}</span>
                </button>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="py-12 text-center text-xs text-[#757788]">
                <span>
                  {language === 'en'
                    ? `No products match the search query "${filterQuery}".`
                    : `Nenhum produto corresponde ao termo "${filterQuery}".`}
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredList.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    priceCheck={priceSummary?.items[product.id]}
                    isSaved={savedIdsSet.has(product.id)}
                    onToggleSave={onToggleSave}
                    onOpenDeepDive={onOpenDeepDive}
                    onOpenCalculator={onOpenCalculator}
                    onOpenCreativeGenerator={onOpenCreativeGenerator}
                  />
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
