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
  ExternalLink,
  Gift,
  ShoppingBag,
  MapPin,
  Users,
} from 'lucide-react';
import { TrendingProduct, ProductPriceCheck } from '../types';
import { useTranslation } from '../i18n/LanguageContext';
import { SocialProofBadge } from './SocialProofBadge';
import { enrichWithTikTokShopData } from '../data/tiktokShopEnricher';

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
  const tk = product.tiktokShop || enrichWithTikTokShopData(product).tiktokShop!;

  const getNicheEmoji = (niche?: string) => {
    if (!niche) return '🛍️';
    const normalized = niche.toLowerCase().trim();
    switch (normalized) {
      case 'tech': return '⚡';
      case 'home': return '🏠';
      case 'beauty': return '✨';
      case 'fitness': return '💪';
      case 'pets': return '🐾';
      case 'accessories': return '💎';
      case 'kids': return '🧸';
      case 'tools': return '🔨';
      case 'auto': return '🚗';
      case 'health': return '🩺';
      case 'gaming': return '🎮';
      case 'office': return '💻';
      case 'outdoor': return '🏕️';
      case 'travel': return '✈️';
      default: return '🛍️';
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
      className="group relative flex flex-col justify-between rounded-2xl border border-white/10 bg-[#2A3042] p-4 sm:p-5 backdrop-blur-sm transition-colors duration-200 hover:border-transparent hover:tiktok-chromatic-card-hover"
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
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#161823] border border-white/10 group-hover:border-[#25F4EE]/50 group-hover:scale-105 transition-all text-2xl">
            {getNicheEmoji(product.niche)}
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

        {/* TikTok Shop Brasil Affiliate Box */}
        <div className="rounded-xl border border-white/10 bg-[#212636] p-3 mb-3.5">
          {/* Main 3 Financial Metrics */}
          <div className="grid grid-cols-3 gap-2 text-center pb-2.5 border-b border-white/5">
            <div>
              <span className="block text-[10px] text-[#A6A7B2] uppercase font-semibold">
                Preço no Shop
              </span>
              <span className="text-xs sm:text-sm font-extrabold text-white">
                R$ {product.estimatedPriceBRL.toFixed(2)}
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-emerald-400 uppercase font-black flex items-center justify-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-emerald-400" />
                Sua Comissão
              </span>
              <span className="text-xs sm:text-sm font-black text-emerald-400">
                +{tk.commissionRatePercent}% <span className="text-[10px] font-bold text-emerald-300 block">R$ {tk.commissionValueBRL.toFixed(2)}</span>
              </span>
            </div>
            <div>
              <span className="block text-[10px] text-[#25F4EE] uppercase font-bold">
                Amostra Grátis
              </span>
              <span className="text-[11px] sm:text-xs font-black text-white flex items-center justify-center gap-1 mt-0.5">
                {tk.freeSampleAvailable ? (
                  <span className="text-emerald-300 bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
                    Liberada (+1k)
                  </span>
                ) : (
                  <span className="text-[#A6A7B2] bg-white/5 px-1.5 py-0.5 rounded">
                    Sob Consulta
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Logistics & Saturation Status */}
          <div className="mt-2.5 space-y-1 text-[11px]">
            <div className="flex items-center justify-between text-[#C5C6D0]">
              <span className="flex items-center gap-1 text-[#25F4EE] font-medium">
                <MapPin className="w-3 h-3 text-[#25F4EE]" />
                <span>Estoque:</span>
              </span>
              <span className="font-semibold text-white">{tk.stockLocation}</span>
            </div>
            <div className="flex items-center justify-between text-[#C5C6D0]">
              <span className="flex items-center gap-1 text-[#FE2C55] font-medium">
                <Users className="w-3 h-3 text-[#FE2C55]" />
                <span>Concorrência Criadores:</span>
              </span>
              <span className="font-extrabold text-emerald-300">
                {tk.saturationLevel} ({tk.activeCreatorsCount} criadores • {tk.recentSalesCount.toLocaleString('pt-BR')} vendas/7d)
              </span>
            </div>
          </div>
        </div>

        {/* Viral Hook 3-Second Preview */}
        <div className="mb-3.5 bg-[#161823] rounded-lg p-2.5 border border-white/5">
          <span className="text-[10px] font-bold text-[#25F4EE] uppercase tracking-wider block mb-1 flex items-center gap-1">
            <Video className="w-3 h-3 text-[#25F4EE]" />
            Gancho Viral de 3 Segundos (Grave Hoje):
          </span>
          <p className="text-xs text-white italic font-medium leading-relaxed">
            "{tk.topViralHook}"
          </p>
        </div>

        {/* Why it sells in Brazil */}
        <div className="mb-3.5">
          <span className="text-[10px] font-bold text-[#A6A7B2] uppercase tracking-wider block mb-1">
            Por que converte muito no TikTok:
          </span>
          <p className="text-xs text-[#C5C6D0] leading-relaxed bg-[#161823]/60 rounded-lg p-2.5 border border-white/5">
            {product.culturalFitReason}
          </p>
        </div>

        {/* Saturation in Brazil & Platform Origin */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#A6A7B2] mb-3 pb-2 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <Globe2 className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span className="text-white font-medium">{product.originPlatform}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span>Saturação BR:</span>
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
      <div className="space-y-2 mt-2">
        <a
          href={tk.tiktokShopAffiliateLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#25F4EE] hover:brightness-110 text-white font-black py-2.5 text-xs shadow-lg shadow-[#FE2C55]/25 active:scale-98 transition-all cursor-pointer"
        >
          <ShoppingBag className="w-4 h-4 text-white" />
          <span>Afiliar-se no TikTok Shop BR</span>
          <ExternalLink className="w-3.5 h-3.5 text-white/90" />
        </a>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onOpenCreativeGenerator(product)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#161823] hover:bg-[#1E202E] hover:border-[#25F4EE]/40 py-2 px-2 text-[11px] font-bold text-white transition cursor-pointer"
            title="Gerar 3 roteiros e ganchos de vídeo para TikTok e Lives"
          >
            <Video className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span>Roteiro & Ganchos</span>
          </button>

          <button
            onClick={() => onOpenDeepDive(product)}
            className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 bg-[#161823] hover:bg-[#1E202E] hover:border-emerald-400/40 py-2 px-2 text-[11px] font-bold text-white transition cursor-pointer"
            title="Ver Raio-X completo da onda e análise de demanda"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Raio-X da Onda</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
});

ProductCard.displayName = 'ProductCard';
