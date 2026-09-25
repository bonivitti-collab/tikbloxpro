import React, { useMemo } from 'react';
import { TrendingProduct, ProductNiche } from '../types';
import { Waves, Sparkles, TrendingUp, ChevronRight, Check, Zap, Flame } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';

interface EarlyWaveDashboardProps {
  products: TrendingProduct[];
  selectedNiche: ProductNiche;
  onSelectNiche: (niche: ProductNiche) => void;
  activeTab: string;
  onSelectEarlyWaveTab?: () => void;
}

interface NicheMetric {
  niche: ProductNiche;
  label: string;
  icon: string;
  earlyWaveCount: number;
  totalNicheCount: number;
  avgViralityScore: number;
  avgProfitMargin: number;
  topProduct: TrendingProduct | null;
}

const NICHE_METADATA: Record<Exclude<ProductNiche, 'all'>, { label: string; icon: string }> = {
  tech: { label: 'Gadgets & Tech', icon: '⚡' },
  home: { label: 'Casa & Cozinha', icon: '🏠' },
  beauty: { label: 'Beleza & Estética', icon: '✨' },
  fitness: { label: 'Fitness & Treino', icon: '💪' },
  pets: { label: 'Pet Inovador', icon: '🐾' },
  accessories: { label: 'Moda & Acessórios', icon: '💎' },
  kids: { label: 'Infantil & Bebês', icon: '🧸' },
  tools: { label: 'Ferramentas & Obra', icon: '🔨' },
  auto: { label: 'Automotivo & Carros', icon: '🚗' },
  health: { label: 'Saúde & Bem-Estar', icon: '🩺' },
};

export const EarlyWaveDashboard: React.FC<EarlyWaveDashboardProps> = ({
  products,
  selectedNiche,
  onSelectNiche,
  activeTab,
  onSelectEarlyWaveTab,
}) => {
  const { t, language } = useTranslation();

  // Aggregate early wave statistics across all niches
  const { topNiches, totalEarlyWaveCount } = useMemo(() => {
    const countsMap = new Map<
      Exclude<ProductNiche, 'all'>,
      {
        earlyWaveProducts: TrendingProduct[];
        allProducts: TrendingProduct[];
      }
    >();

    // Initialize all niches
    (Object.keys(NICHE_METADATA) as Array<Exclude<ProductNiche, 'all'>>).forEach((n) => {
      countsMap.set(n, { earlyWaveProducts: [], allProducts: [] });
    });

    let totalEarly = 0;

    for (const product of products) {
      if (product.niche === 'all') continue;
      const entry = countsMap.get(product.niche as Exclude<ProductNiche, 'all'>);
      if (entry) {
        entry.allProducts.push(product);
        if (product.waveStage === 'early_wave') {
          entry.earlyWaveProducts.push(product);
          totalEarly++;
        }
      }
    }

    const nicheMetrics: NicheMetric[] = [];

    countsMap.forEach((data, nicheKey) => {
      const meta = NICHE_METADATA[nicheKey];
      const earlyCount = data.earlyWaveProducts.length;

      // Calculate averages
      const avgVirality = earlyCount > 0
        ? Math.round(
            data.earlyWaveProducts.reduce((acc, p) => acc + p.viralityScore, 0) / earlyCount
          )
        : 0;

      const avgMargin = earlyCount > 0
        ? Math.round(
            data.earlyWaveProducts.reduce((acc, p) => acc + p.estimatedProfitMarginPercent, 0) /
              earlyCount
          )
        : 0;

      // Find top virality product in early wave
      let topProduct: TrendingProduct | null = null;
      if (data.earlyWaveProducts.length > 0) {
        topProduct = [...data.earlyWaveProducts].sort(
          (a, b) => b.viralityScore - a.viralityScore
        )[0];
      }

      nicheMetrics.push({
        niche: nicheKey,
        label: meta.label,
        icon: meta.icon,
        earlyWaveCount: earlyCount,
        totalNicheCount: data.allProducts.length,
        avgViralityScore: avgVirality,
        avgProfitMargin: avgMargin,
        topProduct,
      });
    });

    // Sort descending by earlyWaveCount, then by average virality
    nicheMetrics.sort((a, b) => {
      if (b.earlyWaveCount !== a.earlyWaveCount) {
        return b.earlyWaveCount - a.earlyWaveCount;
      }
      return b.avgViralityScore - a.avgViralityScore;
    });

    return {
      topNiches: nicheMetrics.slice(0, 3),
      totalEarlyWaveCount: totalEarly,
    };
  }, [products]);

  if (topNiches.length === 0 || totalEarlyWaveCount === 0) {
    return null;
  }

  const handleCardClick = (niche: ProductNiche) => {
    if (selectedNiche === niche) {
      // Toggle off if already selected
      onSelectNiche('all');
    } else {
      onSelectNiche(niche);
    }
  };

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return {
          badgeText: t('early_wave_rank_1'),
          badgeClass: 'bg-amber-400/20 text-amber-300 border-amber-400/40',
          borderHover: 'hover:border-amber-400/60',
          activeBorder: 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(251,191,36,0.15)]',
        };
      case 1:
        return {
          badgeText: t('early_wave_rank_2'),
          badgeClass: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/40',
          borderHover: 'hover:border-emerald-400/60',
          activeBorder: 'border-emerald-400 bg-emerald-950/20 shadow-[0_0_20px_rgba(52,211,153,0.15)]',
        };
      case 2:
      default:
        return {
          badgeText: t('early_wave_rank_3'),
          badgeClass: 'bg-[#25F4EE]/20 text-[#25F4EE] border-[#25F4EE]/40',
          borderHover: 'hover:border-[#25F4EE]/60',
          activeBorder: 'border-[#25F4EE] bg-cyan-950/20 shadow-[0_0_20px_rgba(37,244,238,0.15)]',
        };
    }
  };

  return (
    <div
      id="early-wave-dashboard"
      className="mb-6 rounded-2xl border border-white/10 bg-[#0C0E17]/95 backdrop-blur-xl p-4 sm:p-5 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative subtle ambient gradient */}
      <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-gradient-to-br from-emerald-500/10 to-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header & Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-white/10 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
            <Waves className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white tracking-tight">
                {t('early_wave_dashboard_title')}
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                <Sparkles className="w-2.5 h-2.5" />
                {t('early_wave_ocean_blue')}
              </span>
            </div>
            <p className="text-xs text-[#8E91A6]">
              {t('early_wave_desc')} ({totalEarlyWaveCount} {t('early_wave_count_label')}).
            </p>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {selectedNiche !== 'all' && (
            <button
              onClick={() => onSelectNiche('all')}
              className="text-[11px] font-bold text-[#A6A7B2] hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
            >
              {t('early_wave_clear_filter')}
            </button>
          )}

          {onSelectEarlyWaveTab && activeTab !== 'early_wave' && (
            <button
              onClick={onSelectEarlyWaveTab}
              className="text-[11px] font-bold text-emerald-300 hover:text-white px-3 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 transition cursor-pointer flex items-center gap-1"
            >
              <span>{t('early_wave_view_only')}</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Top 3 Nichos Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5 relative z-10">
        {topNiches.map((item, idx) => {
          const isSelected = selectedNiche === item.niche;
          const rankConfig = getRankBadge(idx);

          return (
            <div
              key={item.niche}
              onClick={() => handleCardClick(item.niche)}
              className={`group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? rankConfig.activeBorder
                  : `border-white/10 bg-[#121422] ${rankConfig.borderHover} hover:bg-[#16182a]`
              }`}
            >
              {/* Card Top: Rank Badge & Checkmark */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-extrabold border uppercase tracking-wider ${rankConfig.badgeClass}`}
                >
                  {rankConfig.badgeText}
                </span>

                {isSelected ? (
                  <span className="flex items-center gap-1 text-[11px] font-black text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded-md border border-emerald-500/40">
                    <Check className="w-3 h-3" />
                    {t('early_wave_active')}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#757788] group-hover:text-white transition flex items-center gap-0.5">
                    {t('early_wave_filter_btn')}
                    <ChevronRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
                  </span>
                )}
              </div>

              {/* Niche Identity & Count */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl" role="img" aria-label={item.label}>
                    {item.icon}
                  </span>
                  <h4 className="text-sm font-black text-white group-hover:text-[#25F4EE] transition">
                    {item.label}
                  </h4>
                </div>

                <div className="flex items-baseline gap-1.5 text-xs text-[#A6A7B2] mb-2.5">
                  <span className="text-base font-black text-white">{item.earlyWaveCount}</span>
                  <span className="text-[11px]">{t('early_wave_count_label')}</span>
                </div>
              </div>

              {/* Stats Strip */}
              <div className="pt-2 border-t border-white/5 grid grid-cols-2 gap-2 text-[11px]">
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-mono text-[#757788]">{t('early_wave_avg_virality')}</span>
                  <span className="font-extrabold text-white flex items-center gap-1">
                    <TrendingUp className="w-3 h-3 text-[#25F4EE]" />
                    {item.avgViralityScore}/100
                  </span>
                </div>

                <div className="flex flex-col">
                  <span className="text-[9px] uppercase font-mono text-[#757788]">{t('early_wave_avg_margin')}</span>
                  <span className="font-extrabold text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-emerald-400" />
                    +{item.avgProfitMargin}%
                  </span>
                </div>
              </div>

              {/* Highlight Product Teaser */}
              {item.topProduct && (
                <div className="mt-2.5 pt-2 border-t border-white/5 text-[10px] text-[#8E91A6] truncate">
                  <span className="text-[#757788] font-semibold mr-1">{t('early_wave_highlight')}</span>
                  <span className="text-white group-hover:text-cyan-300 transition font-medium">
                    {item.topProduct.name}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
