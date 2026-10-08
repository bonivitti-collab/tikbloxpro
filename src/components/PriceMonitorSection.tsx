import React, { useState } from 'react';
import {
  TrendingDown,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  Sparkles,
  DollarSign,
  ArrowRight,
  Calculator,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Search,
  Check,
} from 'lucide-react';
import { TrendingProduct, ProductPriceCheck, PriceMonitorSummary } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface PriceMonitorSectionProps {
  savedProducts: TrendingProduct[];
  priceSummary: PriceMonitorSummary | null;
  isCheckingPrices: boolean;
  onRefreshPrices: () => void;
  onOpenCalculator: (product: TrendingProduct) => void;
  onOpenDeepDive: (product: TrendingProduct) => void;
  onApplyPriceUpdate: (productId: string, updatedPriceCheck: ProductPriceCheck) => void;
}

export const PriceMonitorSection: React.FC<PriceMonitorSectionProps> = ({
  savedProducts,
  priceSummary,
  isCheckingPrices,
  onRefreshPrices,
  onOpenCalculator,
  onOpenDeepDive,
  onApplyPriceUpdate,
}) => {
  const { t, language } = useTranslation();
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'opportunity' | 'warning' | 'neutral'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [appliedId, setAppliedId] = useState<string | null>(null);

  const priceItems = priceSummary?.items || {};
  const productsWithPrices = savedProducts.map((p) => ({
    product: p,
    check: priceItems[p.id] || null,
  }));

  const filteredItems = productsWithPrices.filter(({ product, check }) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        product.name.toLowerCase().includes(q) ||
        product.originalName.toLowerCase().includes(q) ||
        product.nicheLabel.toLowerCase().includes(q);
      if (!match) return false;
    }
    if (filterSeverity === 'all') return true;
    if (!check) return filterSeverity === 'neutral';
    return check.alertSeverity === filterSeverity;
  });

  const formatLastChecked = (isoString?: string | null) => {
    if (!isoString) return language === 'en' ? 'Never checked' : 'Nunca verificado';
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' (' + d.toLocaleDateString() + ')';
    } catch {
      return isoString;
    }
  };

  const handleApply = (productId: string, check: ProductPriceCheck) => {
    onApplyPriceUpdate(productId, check);
    setAppliedId(productId);
    setTimeout(() => {
      setAppliedId(null);
    }, 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Top Banner Overview */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-[#2A3042] via-[#242938] to-[#161826] p-5 sm:p-6 shadow-xl">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-[#25F4EE]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase bg-[#25F4EE]/15 text-[#25F4EE] border border-[#25F4EE]/30">
                <Sparkles className="w-3 h-3 text-[#25F4EE]" />
                {t('price_monitor_badge')}
              </span>
              <span className="text-[11px] text-[#A6A7B2]">
                {t('price_monitor_last_check')}: <strong className="text-white">{formatLastChecked(priceSummary?.lastCheckedAt)}</strong>
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-black text-white">
              {t('price_monitor_title')}
            </h3>
            <p className="text-xs text-[#A6A7B2] mt-1 max-w-2xl leading-relaxed">
              {t('price_monitor_desc')}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={onRefreshPrices}
              disabled={isCheckingPrices}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition shadow-lg cursor-pointer ${
                isCheckingPrices
                  ? 'bg-[#1e2030] text-[#A6A7B2] border border-white/10 cursor-not-allowed'
                  : 'bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] text-[#242938] hover:brightness-110 shadow-[#25F4EE]/20 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isCheckingPrices ? 'animate-spin' : ''}`} />
              <span>{isCheckingPrices ? t('price_monitor_refreshing') : t('price_monitor_refresh_btn')}</span>
            </button>
          </div>
        </div>

        {/* 4 Summary Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="rounded-xl border border-white/5 bg-[#262B3A]/60 p-3 text-center">
            <span className="block text-[10px] uppercase font-bold text-[#A6A7B2]">
              {language === 'en' ? 'Monitored Products' : 'Produtos Monitorados'}
            </span>
            <span className="text-xl font-black text-white">
              {savedProducts.length}
            </span>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-center">
            <span className="block text-[10px] uppercase font-bold text-emerald-400">
              {t('price_monitor_opportunities')}
            </span>
            <div className="flex items-center justify-center gap-1">
              <TrendingDown className="w-4 h-4 text-emerald-400" />
              <span className="text-xl font-black text-emerald-400">
                {priceSummary?.opportunitiesCount ?? 0}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-rose-500/20 bg-rose-500/5 p-3 text-center">
            <span className="block text-[10px] uppercase font-bold text-rose-400">
              {t('price_monitor_warnings')}
            </span>
            <div className="flex items-center justify-center gap-1">
              <TrendingUp className="w-4 h-4 text-rose-400" />
              <span className="text-xl font-black text-rose-400">
                {priceSummary?.warningsCount ?? 0}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-white/5 bg-[#262B3A]/60 p-3 text-center">
            <span className="block text-[10px] uppercase font-bold text-[#A6A7B2]">
              {language === 'en' ? 'Reference USD/BRL' : 'Câmbio USD/BRL'}
            </span>
            <span className="text-xl font-black text-cyan-300">
              R$ {(priceSummary?.exchangeRateUSDBRL || 5.82).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#2A3042] border border-white/10 text-xs overflow-x-auto">
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterSeverity === 'all'
                ? 'bg-white/15 text-white'
                : 'text-[#A6A7B2] hover:text-white'
            }`}
          >
            {t('price_monitor_filter_all')} ({productsWithPrices.length})
          </button>

          <button
            onClick={() => setFilterSeverity('opportunity')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterSeverity === 'opportunity'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                : 'text-[#A6A7B2] hover:text-emerald-300'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('price_monitor_filter_opp')} ({priceSummary?.opportunitiesCount ?? 0})</span>
          </button>

          <button
            onClick={() => setFilterSeverity('warning')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterSeverity === 'warning'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                : 'text-[#A6A7B2] hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('price_monitor_filter_warn')} ({priceSummary?.warningsCount ?? 0})</span>
          </button>

          <button
            onClick={() => setFilterSeverity('neutral')}
            className={`px-3 py-1.5 rounded-lg font-bold transition whitespace-nowrap cursor-pointer ${
              filterSeverity === 'neutral'
                ? 'bg-white/15 text-white'
                : 'text-[#A6A7B2] hover:text-white'
            }`}
          >
            {t('price_monitor_filter_stable')} ({priceSummary?.stableCount ?? 0})
          </button>
        </div>

        {/* Local Search inside price monitor */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#757788]" />
          <input
            type="text"
            placeholder={language === 'en' ? 'Search in monitored products...' : 'Buscar produto monitorado...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-[#262B3A] py-1.5 pl-8 pr-3 text-xs text-white placeholder-[#757788] focus:border-[#25F4EE] focus:outline-none transition"
          />
        </div>
      </div>

      {/* Product Price Comparison Cards */}
      {filteredItems.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-[#2A3042]/50 p-12 text-center">
          <p className="text-xs text-[#A6A7B2]">
            {language === 'en'
              ? 'No products match the selected price variation filter.'
              : 'Nenhum produto salvo corresponde ao filtro de variação selecionado.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map(({ product, check }) => {
            const hasCheck = !!check;
            const isOpportunity = check?.alertSeverity === 'opportunity';
            const isWarning = check?.alertSeverity === 'warning';
            const isApplied = appliedId === product.id;

            return (
              <div
                key={product.id}
                className={`rounded-2xl border bg-[#2A3042] p-4 sm:p-5 transition-all hover:border-white/20 ${
                  isOpportunity
                    ? 'border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                    : isWarning
                    ? 'border-rose-500/30 shadow-lg shadow-rose-500/5'
                    : 'border-white/10'
                }`}
              >
                {/* Header: Title, Origin, and Severity Badge */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#161826] border border-white/10 flex items-center justify-center font-black text-white shrink-0">
                      {product.originCountry}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                        <span>{product.name}</span>
                        <span className="text-xs font-normal text-[#A6A7B2]">({product.originalName})</span>
                      </h4>
                      <div className="flex items-center gap-2 text-[11px] text-[#A6A7B2] mt-0.5">
                        <span className="px-2 py-0.5 rounded-md bg-[#161823] border border-white/5 font-medium">
                          {product.nicheLabel}
                        </span>
                        <span>•</span>
                        <span>{product.originPlatform}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variation Status Tag */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isOpportunity && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>
                          {check.costChangePercent < 0
                            ? `${language === 'en' ? 'Supplier Cost Drop' : 'Queda no Fornecedor'}: ${check.costChangePercent}%`
                            : `${language === 'en' ? 'Resale Price Markup' : 'Alta de Revenda'}: +${check.priceChangePercent}%`}
                        </span>
                      </span>
                    )}

                    {isWarning && (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                        <span>
                          {check.costChangePercent > 0
                            ? `${language === 'en' ? 'Cost Increase' : 'Aumento de Custo'}: +${check.costChangePercent}%`
                            : `${language === 'en' ? 'Resale Adjustment' : 'Ajuste de Preço'}: ${check.priceChangePercent}%`}
                        </span>
                      </span>
                    )}

                    {!isOpportunity && !isWarning && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-slate-300 border border-white/10">
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                        <span>{t('price_monitor_stable')}</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Comparative Price Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-4">
                  {/* Left Column: Original Price Detected */}
                  <div className="rounded-xl border border-white/5 bg-[#262B3A] p-3.5">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#A6A7B2]">
                        {language === 'en' ? '1. Original Radar Price' : '1. Preço Original Detectado'}
                      </span>
                      <span className="text-[10px] text-[#757788]">
                        {language === 'en' ? 'At Discovery' : 'No Radar Inicial'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div>
                        <span className="block text-[10px] text-[#A6A7B2]">{t('price_monitor_orig_cost')}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-300">
                          ${product.estimatedCostUSD.toFixed(2)} USD
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#A6A7B2]">{t('price_monitor_orig_price')}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-200">
                          R$ {product.estimatedPriceBRL.toFixed(2)}
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] text-[#A6A7B2]">{t('price_monitor_orig_margin')}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-300">
                          +{product.estimatedProfitMarginPercent}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Fresh API Live Price */}
                  <div
                    className={`rounded-xl border p-3.5 transition ${
                      isOpportunity
                        ? 'border-emerald-500/30 bg-emerald-950/20'
                        : isWarning
                        ? 'border-rose-500/30 bg-rose-950/20'
                        : 'border-white/10 bg-[#242938]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#25F4EE] flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3 text-[#25F4EE]" />
                        <span>{language === 'en' ? '2. Live API Consultation' : '2. Nova Consulta via API'}</span>
                      </span>
                      <span className="text-[10px] text-[#A6A7B2] font-mono">
                        {check?.source === 'api_realtime' ? 'API Live' : 'API Cached'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center pt-1">
                      <div>
                        <span className="block text-[10px] text-[#A6A7B2]">{t('price_monitor_current_cost')}</span>
                        <div className="flex items-center justify-center gap-1">
                          <span
                            className={`text-xs sm:text-sm font-extrabold ${
                              isOpportunity
                                ? 'text-emerald-400'
                                : isWarning
                                ? 'text-rose-400'
                                : 'text-white'
                            }`}
                          >
                            ${(check?.currentCostUSD ?? product.estimatedCostUSD).toFixed(2)}
                          </span>
                        </div>
                        {hasCheck && check.costChangePercent !== 0 && (
                          <span
                            className={`block text-[10px] font-bold ${
                              check.costChangePercent < 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {check.costChangePercent > 0 ? `+${check.costChangePercent}%` : `${check.costChangePercent}%`}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="block text-[10px] text-[#A6A7B2]">{t('price_monitor_current_price')}</span>
                        <span className="text-xs sm:text-sm font-extrabold text-white">
                          R$ {(check?.currentPriceBRL ?? product.estimatedPriceBRL).toFixed(2)}
                        </span>
                        {hasCheck && check.priceChangePercent !== 0 && (
                          <span
                            className={`block text-[10px] font-bold ${
                              check.priceChangePercent > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {check.priceChangePercent > 0 ? `+${check.priceChangePercent}%` : `${check.priceChangePercent}%`}
                          </span>
                        )}
                      </div>

                      <div>
                        <span className="block text-[10px] text-emerald-400">{t('price_monitor_current_margin')}</span>
                        <span className="text-xs sm:text-sm font-black text-emerald-400">
                          +{(check?.currentMarginPercent ?? product.estimatedProfitMarginPercent)}%
                        </span>
                        {hasCheck && check.marginDiffPercent !== 0 && (
                          <span
                            className={`block text-[10px] font-bold ${
                              check.marginDiffPercent > 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {check.marginDiffPercent > 0 ? `+${check.marginDiffPercent}%` : `${check.marginDiffPercent}%`}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Market & Supplier Insight box */}
                {hasCheck && (
                  <div className="rounded-xl border border-white/5 bg-[#161826]/70 p-3 mb-4 text-xs space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#A6A7B2] shrink-0">
                        {language === 'en' ? 'Supplier Observation:' : 'Status do Fornecedor:'}
                      </span>
                      <span className="text-[#C5C6D0]">{check.supplierStatus}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="font-bold text-[#A6A7B2] shrink-0">
                        {language === 'en' ? 'Market Dynamic:' : 'Dinâmica de Mercado:'}
                      </span>
                      <span className="text-[#C5C6D0]">{check.marketObservation}</span>
                    </div>
                  </div>
                )}

                {/* Card Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenDeepDive(product)}
                      className="px-3 py-1.5 rounded-lg border border-white/10 hover:border-white/20 bg-[#161826] text-xs font-semibold text-[#A6A7B2] hover:text-white transition cursor-pointer"
                    >
                      {language === 'en' ? 'Deep Dive Analysis' : 'Análise Aprofundada'}
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Adopt New Price Button */}
                    {hasCheck && (
                      <button
                        onClick={() => handleApply(product.id, check)}
                        disabled={isApplied}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                          isApplied
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'border border-white/10 hover:border-[#25F4EE]/40 bg-[#161826] hover:bg-[#1f2235] text-white hover:text-[#25F4EE]'
                        }`}
                        title={language === 'en' ? 'Update saved product with new checked prices' : 'Atualizar produto salvo com os novos valores'}
                      >
                        {isApplied ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>{language === 'en' ? 'Price Applied!' : 'Preço Adotado!'}</span>
                          </>
                        ) : (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#25F4EE]" />
                            <span>{t('price_monitor_apply_update')}</span>
                          </>
                        )}
                      </button>
                    )}

                    {/* Simulate in Profit Calculator Button */}
                    <button
                      onClick={() => {
                        const updatedProduct: TrendingProduct = check
                          ? {
                              ...product,
                              estimatedCostUSD: check.currentCostUSD,
                              estimatedPriceBRL: check.currentPriceBRL,
                              estimatedProfitMarginPercent: check.currentMarginPercent,
                            }
                          : product;
                        onOpenCalculator(updatedProduct);
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-[#25F4EE]/15 hover:bg-[#25F4EE]/25 border border-[#25F4EE]/40 text-[#25F4EE] hover:text-white transition cursor-pointer"
                    >
                      <Calculator className="w-3.5 h-3.5" />
                      <span>{t('price_monitor_simulate_new')}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
