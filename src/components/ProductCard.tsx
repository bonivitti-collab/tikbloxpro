import React from 'react';
import { motion } from 'motion/react';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Globe2,
  Bookmark,
  BookmarkCheck,
  Zap,
  Activity,
  Tv,
  Wind,
  ShieldCheck,
  Sparkles,
  Scissors,
  Calculator,
  Video,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { TrendingProduct, ProductPriceCheck } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { SocialProofBadge } from './SocialProofBadge';

interface ProductCardProps {
  product: TrendingProduct;
  isSaved: boolean;
  priceCheck?: ProductPriceCheck;
  onToggleSave: (id: string) => void;
  onOpenDeepDive: (product: TrendingProduct) => void;
  onOpenCalculator: (product: TrendingProduct) => void;
  onOpenCreativeGenerator: (product: TrendingProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = React.memo(({
  product,
  isSaved,
  priceCheck,
  onToggleSave,
  onOpenDeepDive,
  onOpenCalculator,
  onOpenCreativeGenerator,
}) => {
  const { t, language } = useTranslation();

  // Render icon based on iconType
  const renderProductIcon = () => {
    const iconClass = 'w-6 h-6 text-[#25F4EE] group-hover:text-[#FE2C55] transition-colors';
    switch (product.iconType) {
      case 'Wind':
        return <Wind className={iconClass} />;
      case 'Tv':
        return <Tv className={iconClass} />;
      case 'ShieldCheck':
        return <ShieldCheck className={iconClass} />;
      case 'Scissors':
        return <Scissors className={iconClass} />;
      case 'Activity':
        return <Activity className={iconClass} />;
      case 'Sparkles':
        return <Sparkles className={iconClass} />;
      default:
        return <Zap className={iconClass} />;
    }
  };

  // Wave status styling
  const getWaveBadge = () => {
    switch (product.waveStage) {
      case 'early_wave':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
            </span>
            <span>{language === 'en' ? 'Early Wave (Blue Ocean)' : 'Onda Inicial (Oceano Azul)'}</span>
          </span>
        );
      case 'rising_wave':
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25F4EE]/15 border border-[#25F4EE]/40 px-2.5 py-0.5 text-[11px] font-bold text-[#25F4EE]">
            <span>{language === 'en' ? '🏄 Rising Wave (High Traction)' : '🏄 Onda Crescente (Alta Tração)'}</span>
          </span>
        );
      case 'peak_wave':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FE2C55]/15 border border-[#FE2C55]/40 px-2.5 py-0.5 text-[11px] font-bold text-[#FE2C55]">
            <span>{language === 'en' ? '⚡ Demand Peak (High Volume)' : '⚡ Ápice de Demanda (Volume Alto)'}</span>
          </span>
        );
    }
  };

  // Flag emoji based on country
  const getCountryFlag = (country: string) => {
    switch (country) {
      case 'US':
        return language === 'en' ? '🇺🇸 USA' : '🇺🇸 EUA';
      case 'CN':
        return '🇨🇳 China';
      case 'KR':
        return language === 'en' ? '🇰🇷 Korea' : '🇰🇷 Coreia';
      case 'JP':
        return language === 'en' ? '🇯🇵 Japan' : '🇯🇵 Japão';
      default:
        return '🌍 Global';
    }
  };

  const getSaturationLabel = (saturation: string) => {
    if (language !== 'en') return saturation;
    switch (saturation) {
      case 'Muito Baixa':
        return 'Very Low';
      case 'Baixa':
        return 'Low';
      case 'Média':
        return 'Medium';
      case 'Alta':
        return 'High';
      default:
        return saturation;
    }
  };

  return (
    <motion.div
      id={`product-card-${product.id}`}
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: 'spring', stiffness: 380, damping: 25 }}
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#12131A] p-4 sm:p-5 backdrop-blur-sm transition-colors duration-200 hover:border-transparent hover:tiktok-chromatic-card-hover"
    >
      <div>
        {/* Top Header: Wave Badge, Score & Bookmark */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            {getWaveBadge()}
            <span className="text-[11px] font-medium text-[#A6A7B2]">
              {getCountryFlag(product.originCountry)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Virality Score Gauge */}
            <div
              className="flex items-center gap-1 rounded-lg bg-[#161823] border border-white/10 px-2 py-0.5 text-[11px] font-black text-[#FE2C55]"
              title={language === 'en' ? 'TIKBLOX Virality Score (0-100)' : 'Pontuação de Viralidade TIKBLOX (0-100)'}
            >
              <TrendingUp className="w-3 h-3 text-[#FE2C55]" />
              <span>{product.viralityScore}</span>
            </div>

            {/* Bookmark button */}
            <button
              onClick={() => onToggleSave(product.id)}
              className={`p-1.5 rounded-lg border transition ${
                isSaved
                  ? 'bg-[#FE2C55]/20 border-[#FE2C55]/50 text-[#FE2C55]'
                  : 'bg-[#161823] border-white/10 text-[#A6A7B2] hover:text-white hover:border-white/20'
              }`}
              title={isSaved ? (language === 'en' ? 'Remove from Saved' : 'Remover do Radar Salvo') : (language === 'en' ? 'Save to my Radar' : 'Salvar no meu Radar')}
            >
              {isSaved ? (
                <BookmarkCheck className="w-4 h-4 text-[#FE2C55]" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Product Title & Original Reference */}
        <div className="flex items-start gap-3 mb-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#161823] border border-white/10 group-hover:border-[#25F4EE]/50 group-hover:scale-105 transition-all">
            {renderProductIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white leading-snug group-hover:text-[#25F4EE] transition-colors line-clamp-3">
              {product.name}
            </h3>
            <p className="text-xs text-[#A6A7B2] italic truncate mt-0.5">
              {t('card_source')}: {product.originalName}
            </p>
          </div>
        </div>

        {/* Dynamic Social Proof & Trend Velocity Badge */}
        <div className="mb-3">
          <SocialProofBadge product={product} />
        </div>

        {/* Financial Arbitrage Box (Cost USD vs Price BRL & Margin) */}
        <div className="rounded-xl border border-white/10 bg-[#0B0C10] p-3 mb-3.5">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <span className="block text-[10px] text-[#A6A7B2] uppercase font-semibold">
                {t('card_supplier_cost')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#E1E2EC]">
                ${product.estimatedCostUSD.toFixed(2)} USD
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-[#A6A7B2] uppercase font-semibold">
                {t('card_sell_price')}
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                R$ {product.estimatedPriceBRL.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-emerald-400 uppercase font-semibold">
                {t('card_margin')}
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">
                +{product.estimatedProfitMarginPercent}%
              </span>
            </div>
          </div>

          {/* Real-time price variation monitor badge if available */}
          {(() => {
            const activeCheck = priceCheck || product.priceCheck;
            if (!activeCheck) return null;

            const isOpportunity = activeCheck.alertSeverity === 'opportunity';
            const isWarning = activeCheck.alertSeverity === 'warning';

            return (
              <div className="mt-2.5 pt-2 border-t border-white/5 flex items-center justify-between text-[10px] sm:text-[11px]">
                <div className="flex items-center gap-1 font-bold">
                  {isOpportunity ? (
                    <span className="text-emerald-400 flex items-center gap-1">
                      <TrendingDown className="w-3 h-3 shrink-0" />
                      <span>
                        {activeCheck.costChangePercent < 0
                          ? `API Fornecedor: ${activeCheck.costChangePercent}%`
                          : `API Venda: +${activeCheck.priceChangePercent}%`}
                      </span>
                    </span>
                  ) : isWarning ? (
                    <span className="text-rose-400 flex items-center gap-1">
                      <TrendingUp className="w-3 h-3 shrink-0" />
                      <span>
                        {activeCheck.costChangePercent > 0
                          ? `API Custo: +${activeCheck.costChangePercent}%`
                          : `API Ajuste: ${activeCheck.priceChangePercent}%`}
                      </span>
                    </span>
                  ) : (
                    <span className="text-cyan-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 shrink-0" />
                      <span>{language === 'en' ? 'API Checked' : 'Validado via API'}</span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#A6A7B2] font-mono">
                  ${activeCheck.currentCostUSD.toFixed(2)} USD
                </span>
              </div>
            );
          })()}
        </div>

        {/* Market Validation: Cultural Fit in Brazil */}
        <div className="mb-3.5">
          <span className="text-[11px] font-bold text-[#A6A7B2] uppercase tracking-wider block mb-1">
            {language === 'en' ? 'Why it sells well in Brazil:' : 'Por que vende muito no Brasil:'}
          </span>
          <p className="text-xs text-[#C5C6D0] leading-relaxed bg-[#161823] rounded-lg p-3 border border-white/5">
            {product.culturalFitReason}
          </p>
        </div>

        {/* Saturation in Brazil & Platform Origin */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A6A7B2] mb-4 pb-3 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span className="text-white font-medium">{product.originPlatform}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>{language === 'en' ? 'BR Saturation:' : 'Saturação BR:'}</span>
            <span
              className={`font-bold ${
                product.saturationInBrazil === 'Muito Baixa'
                  ? 'text-emerald-400'
                  : product.saturationInBrazil === 'Baixa'
                  ? 'text-[#25F4EE]'
                  : 'text-amber-400'
              }`}
            >
              {getSaturationLabel(product.saturationInBrazil)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons Row */}
      <div className="space-y-2">
        <button
          onClick={() => onOpenDeepDive(product)}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#FF3B5C] hover:brightness-110 text-white font-extrabold py-2.5 text-xs shadow-lg shadow-[#FE2C55]/25 active:scale-98 transition-all cursor-pointer"
        >
          <span>{language === 'en' ? 'View Full Deep Dive Analysis' : 'Ver Raio-X Completo da Onda'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenCreativeGenerator(product)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#161823] hover:bg-[#1E202E] hover:border-[#25F4EE]/40 py-1.5 px-2 text-[11px] font-bold text-white transition cursor-pointer"
            title={language === 'en' ? 'Generate TikTok & Reels video scripts' : 'Gerar scripts de vídeo para TikTok e Reels'}
          >
            <Video className="w-3 h-3 text-[#25F4EE]" />
            <span>{t('card_ad_creative')}</span>
          </button>

          <button
            onClick={() => onOpenCalculator(product)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#161823] hover:bg-[#1E202E] hover:border-emerald-400/40 py-1.5 px-2 text-[11px] font-bold text-white transition cursor-pointer"
            title={language === 'en' ? 'Simulate taxes and net margin' : 'Simular impostos e margem líquida real'}
          >
            <Calculator className="w-3 h-3 text-emerald-400" />
            <span>{t('card_calc')}</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
