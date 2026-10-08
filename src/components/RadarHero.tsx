import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Search, Sparkles, Compass, Globe, Filter, ChevronLeft, ChevronRight, Clock } from 'lucide-react';
import { ProductNiche } from '../types';
import { useDebouncedSearch } from '../hooks/useDebouncedSearch';
import { useTranslation } from '../i18n/LanguageContext';
import { RecentSearchesDropdown } from './RecentSearchesDropdown';
import { saveRecentSearch } from '../services/recentSearchesService';

interface RadarHeroProps {
  selectedNiche: ProductNiche;
  setSelectedNiche: (niche: ProductNiche) => void;
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
  onOpenCopilot: () => void;
  totalProductsCount: number;
  onOpenTour?: () => void;
}

const NICHES: Array<{ id: ProductNiche; label: string; icon: string }> = [
  { id: 'all', label: 'Todos os Nichos', icon: '🌐' },
  { id: 'tech', label: 'Gadgets & Tech', icon: '⚡' },
  { id: 'home', label: 'Casa & Cozinha', icon: '🏠' },
  { id: 'beauty', label: 'Beleza & Estética', icon: '✨' },
  { id: 'fitness', label: 'Fitness & Treino', icon: '💪' },
  { id: 'pets', label: 'Pet Inovador', icon: '🐾' },
  { id: 'accessories', label: 'Moda & Acessórios', icon: '💎' },
  { id: 'kids', label: 'Infantil & Bebês', icon: '🧸' },
  { id: 'tools', label: 'Ferramentas & Obra', icon: '🔨' },
  { id: 'auto', label: 'Automotivo & Carros', icon: '🚗' },
  { id: 'health', label: 'Saúde & Bem-Estar', icon: '🩺' },
];

export const RadarHero: React.FC<RadarHeroProps> = React.memo(({
  selectedNiche,
  setSelectedNiche,
  selectedOrigin,
  setSelectedOrigin,
  onOpenCopilot,
  totalProductsCount,
  onOpenTour,
}) => {
  const { t, language } = useTranslation();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const nichesList = useMemo(() => [
    { id: 'all' as ProductNiche, label: t('hero_niches_all'), icon: '🌐' },
    { id: 'tech' as ProductNiche, label: t('hero_niche_tech'), icon: '⚡' },
    { id: 'home' as ProductNiche, label: t('hero_niche_home'), icon: '🏠' },
    { id: 'beauty' as ProductNiche, label: t('hero_niche_beauty'), icon: '✨' },
    { id: 'fitness' as ProductNiche, label: t('hero_niche_fitness'), icon: '💪' },
    { id: 'pets' as ProductNiche, label: t('hero_niche_pets'), icon: '🐾' },
    { id: 'accessories' as ProductNiche, label: t('hero_niche_accessories'), icon: '💎' },
    { id: 'kids' as ProductNiche, label: t('hero_niche_kids'), icon: '🧸' },
    { id: 'tools' as ProductNiche, label: t('hero_niche_tools'), icon: '🔨' },
    { id: 'auto' as ProductNiche, label: t('hero_niche_auto'), icon: '🚗' },
    { id: 'health' as ProductNiche, label: t('hero_niche_health'), icon: '🩺' },
  ], [t]);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 6);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);

    // Enable mouse wheel horizontal scrolling on desktop
    const el = scrollContainerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && Math.abs(e.deltaX) < Math.abs(e.deltaY)) {
        e.preventDefault();
        el.scrollBy({
          left: e.deltaY * 1.2,
          behavior: 'auto',
        });
      }
    };

    el.addEventListener('wheel', onWheel, { passive: false });

    return () => {
      window.removeEventListener('resize', checkScroll);
      el.removeEventListener('wheel', onWheel);
    };
  }, []);

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 260;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };
  return (
    <section className="relative overflow-hidden border-b border-white/10 bg-[#1A1D27] px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
      {/* TikTok Dual Ambient Glow: Cyan on top-left, Pink on top-right */}
      <div className="absolute top-0 left-1/4 -translate-y-1/2 -translate-x-1/2 w-[550px] h-[350px] bg-[#25F4EE]/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute top-0 right-1/4 -translate-y-1/2 translate-x-1/2 w-[550px] h-[350px] bg-[#FE2C55]/12 rounded-full blur-[110px] pointer-events-none" />

      {/* Background radar concentric rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-25">
        <div className="h-[480px] w-[480px] rounded-full border border-[#25F4EE]/30 animate-[ping_8s_linear_infinite]" />
        <div className="absolute inset-0 m-auto h-[320px] w-[320px] rounded-full border border-[#FE2C55]/30" />
        <div className="absolute inset-0 m-auto h-[170px] w-[170px] rounded-full border border-white/20" />
      </div>

      <div className="relative mx-auto max-w-7xl">
        


        {/* Title and Value Proposition */}
        <div className="max-w-3xl mb-5 sm:mb-8">
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            {language === 'en' ? (
              <>
                Discover viral trends abroad{' '}
                <span className="bg-gradient-to-r from-white via-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent">
                  before they explode in Brazil.
                </span>
              </>
            ) : (
              <>
                Descubra produtos virais no exterior{' '}
                <span className="bg-gradient-to-r from-white via-[#25F4EE] to-[#FE2C55] bg-clip-text text-transparent">
                  antes de estourarem no Brasil.
                </span>
              </>
            )}
          </h1>
          <p className="mt-2 sm:mt-3 text-xs sm:text-base text-[#C5C6D0] font-normal leading-relaxed">
            {t('hero_subtitle')}
          </p>
        </div>

        {/* Action & Filter Console */}
        <div className="rounded-2xl border border-white/10 bg-[#2A3042]/90 backdrop-blur-xl p-3.5 sm:p-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
            
            {/* Copilot AI Button (Replaces old Search Bar) */}
            <button
              onClick={onOpenCopilot}
              className="flex-1 flex items-center justify-between gap-3 rounded-xl bg-[#262B3A] border border-[#25F4EE]/30 px-4 py-3 md:py-2.5 text-left text-sm text-white hover:border-[#25F4EE] hover:bg-[#2A3042] transition cursor-pointer group shadow-[0_0_15px_rgba(37,244,238,0.1)] hover:shadow-[0_0_20px_rgba(37,244,238,0.2)]"
            >
              <div className="flex items-center gap-3">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-[#25F4EE]/20 to-[#FE2C55]/20 text-[#25F4EE] group-hover:scale-110 transition-transform">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="font-semibold block text-white group-hover:text-[#25F4EE] transition-colors">
                    Consultar IA Especialista
                  </span>
                  <span className="text-[11px] text-[#A6A7B2]">
                    Peça ideias de produtos, análise de margens e estratégias
                  </span>
                </div>
              </div>
              <div className="hidden sm:flex items-center justify-center px-2 py-1 rounded bg-white/5 text-[10px] font-mono text-[#A6A7B2] border border-white/10">
                Novo ✨
              </div>
            </button>

            {/* Origin Selector */}
            <div className="relative w-full md:w-[220px]">
              <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6A7B2]" />
              <select
                id="origin-country-select"
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                aria-label="Filtrar por país ou plataforma de origem"
                className="w-full rounded-xl border border-white/10 bg-[#262B3A] pl-9 pr-3.5 py-3 md:py-2.5 text-sm font-medium text-white focus:border-[#FE2C55] focus:outline-none focus:ring-1 focus:ring-[#FE2C55] cursor-pointer appearance-none"
              >
                <option value="all">{t('hero_all_origins')}</option>
                <option value="US">{t('hero_origin_us')}</option>
                <option value="CN">{t('hero_origin_cn')}</option>
              </select>
            </div>
          </div>

          {/* Niches Carousel / Pills with Scroll Controls */}
          <div className="mt-3.5 pt-3 border-t border-white/10 relative flex items-center">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="hidden sm:flex absolute -left-2 z-10 w-7 h-7 rounded-full bg-[#2A3042] border border-white/20 items-center justify-center text-white shadow-xl hover:bg-[#25F4EE] hover:text-black transition cursor-pointer"
                title="Rolar para esquerda"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}

            {/* Scrollable Container with subtle scroll indicator */}
            <div
              ref={scrollContainerRef}
              onScroll={checkScroll}
              className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto scroll-smooth subtle-horizontal-scroll touch-pan-x w-full py-1.5 px-1"
            >
              <span className="text-[11px] font-bold text-[#A6A7B2] shrink-0 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3 text-[#25F4EE]" />
                <span className="hidden xs:inline">{language === 'en' ? 'Niche:' : 'Nicho:'}</span>
              </span>
              {nichesList.map((niche) => (
                <button
                  key={niche.id}
                  onClick={() => setSelectedNiche(niche.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1 text-xs font-bold shrink-0 transition-all cursor-pointer whitespace-nowrap ${
                    selectedNiche === niche.id
                      ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white shadow-md shadow-[#FE2C55]/30 border border-[#FE2C55]'
                      : 'bg-[#161823] text-[#A6A7B2] hover:bg-[#202230] hover:text-white border border-white/5'
                  }`}
                >
                  <span className="text-sm">{niche.icon}</span>
                  <span>{niche.label}</span>
                </button>
              ))}
            </div>

            {/* Right Scroll Button */}
            {canScrollRight && (
              <button
                type="button"
                onClick={() => handleScroll('right')}
                className="hidden sm:flex absolute -right-2 z-10 w-7 h-7 rounded-full bg-[#2A3042] border border-white/20 items-center justify-center text-white shadow-xl hover:bg-[#25F4EE] hover:text-black transition cursor-pointer"
                title="Rolar para direita"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

      </div>
    </section>
  );
});

RadarHero.displayName = 'RadarHero';
