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
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onTriggerScan: () => void;
  isScanning: boolean;
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
  searchQuery,
  setSearchQuery,
  onTriggerScan,
  isScanning,
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

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // High-performance debounced search hook
  const {
    searchTerm,
    setSearchTerm,
    isDebouncing,
    clearSearch,
    flush,
  } = useDebouncedSearch({
    initialValue: searchQuery,
    delay: 280,
    onDebounce: (debouncedVal: string) => {
      setSearchQuery(debouncedVal);
      if (debouncedVal.trim().length >= 3) {
        saveRecentSearch(debouncedVal);
      }
    },
  });

  // Handle clicking outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelectRecentQuery = useCallback((query: string) => {
    setSearchTerm(query);
    setSearchQuery(query);
    saveRecentSearch(query);
    setIsDropdownOpen(false);
  }, [setSearchTerm, setSearchQuery]);

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
    <section className="relative overflow-hidden border-b border-white/10 bg-[#010101] px-4 py-8 sm:py-12 sm:px-6 lg:px-8">
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
        
        {/* Top Badges & Live Status */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5 mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#161823] border border-[#25F4EE]/30 px-3 py-1 text-[11px] sm:text-xs font-semibold text-[#25F4EE] shadow-sm max-w-full">
            <span className="relative flex h-2 w-2 shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE2C55] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FE2C55]"></span>
            </span>
            <span className="leading-tight">Varredura: TikTok US + Douyin China + Amazon</span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-xs text-[#A6A7B2]">
            {onOpenTour && (
              <button
                id="hero-onboarding-tour-btn"
                onClick={onOpenTour}
                className="inline-flex items-center gap-1.5 rounded-full bg-white/5 hover:bg-[#25F4EE]/15 border border-white/10 hover:border-[#25F4EE]/40 px-3 py-1 text-[11px] sm:text-xs font-bold text-[#C5C6D0] hover:text-[#25F4EE] transition cursor-pointer"
                title={language === 'en' ? 'Start Guided Tour' : 'Iniciar Tour Guiado'}
              >
                <Sparkles className="w-3 h-3 text-[#25F4EE]" />
                <span>{language === 'en' ? 'Quick Tour' : 'Guia Rápido'}</span>
              </button>
            )}
            <div className="flex items-center gap-1.5">
              <span className="text-white font-extrabold">{totalProductsCount}</span>
              <span>{t('hero_monitored_products')}</span>
            </div>
            <span className="text-white/20">|</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[#25F4EE] font-extrabold">300%+</span>
              <span>ROI / Margem</span>
            </div>
          </div>
        </div>

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
        <div className="rounded-2xl border border-white/10 bg-[#12131A]/90 backdrop-blur-xl p-3.5 sm:p-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2.5 sm:gap-3">
            
            {/* Search Input Container with Dropdown */}
            <div ref={searchContainerRef} className="relative flex-1">
              <Search
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors ${
                  isDebouncing ? 'text-[#25F4EE] animate-pulse' : 'text-[#A6A7B2]'
                }`}
              />
              <input
                id="search-products-input"
                type="text"
                placeholder={t('hero_search_placeholder')}
                value={searchTerm}
                onFocus={() => setIsDropdownOpen(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    flush();
                    if (searchTerm.trim().length >= 2) {
                      saveRecentSearch(searchTerm);
                    }
                    setIsDropdownOpen(false);
                  } else if (e.key === 'Escape') {
                    setIsDropdownOpen(false);
                  }
                }}
                className="w-full rounded-xl border border-white/10 bg-[#0B0C10] py-3 md:py-2.5 pl-10 pr-24 text-xs sm:text-sm text-white placeholder-[#757788] focus:border-[#25F4EE] focus:outline-none focus:ring-1 focus:ring-[#FE2C55]/50 transition"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                {isDebouncing && (
                  <span className="hidden sm:inline-block text-[10px] font-mono text-[#25F4EE] bg-[#25F4EE]/10 px-1.5 py-0.5 rounded border border-[#25F4EE]/30 animate-pulse">
                    filtrando...
                  </span>
                )}
                {searchTerm ? (
                  <button
                    type="button"
                    onClick={() => {
                      clearSearch();
                      setIsDropdownOpen(true);
                    }}
                    className="text-xs font-semibold text-[#A6A7B2] hover:text-white px-1.5 py-0.5 rounded bg-white/5 hover:bg-white/10 transition cursor-pointer"
                    title="Limpar busca"
                  >
                    Limpar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen((prev) => !prev)}
                    className={`p-1.5 rounded-lg transition cursor-pointer ${
                      isDropdownOpen
                        ? 'text-[#25F4EE] bg-[#25F4EE]/15 border border-[#25F4EE]/30'
                        : 'text-[#757788] hover:text-[#25F4EE] hover:bg-white/5'
                    }`}
                    title={t('recent_searches_title')}
                  >
                    <Clock className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Recent Searches Dropdown */}
              <RecentSearchesDropdown
                isOpen={isDropdownOpen}
                onClose={() => setIsDropdownOpen(false)}
                currentQuery={searchTerm}
                onSelectQuery={handleSelectRecentQuery}
              />
            </div>

            {/* Controls Row: Origin selector + Full-Width Button on Mobile, Inline on Desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:flex items-center gap-2">
              <div className="relative w-full md:w-auto">
                <select
                  id="origin-country-select"
                  value={selectedOrigin}
                  onChange={(e) => setSelectedOrigin(e.target.value)}
                  aria-label="Filtrar por país ou plataforma de origem"
                  className="w-full md:w-auto rounded-xl border border-white/10 bg-[#0B0C10] px-3.5 py-3 md:py-2.5 text-xs text-white focus:border-[#25F4EE] focus:outline-none focus:ring-1 focus:ring-[#25F4EE] cursor-pointer"
                >
                  <option value="all">{t('hero_all_origins')}</option>
                  <option value="US">{t('hero_origin_us')}</option>
                  <option value="CN">{t('hero_origin_cn')}</option>
                </select>
              </div>

              {/* Big Scan Button - Highly prominent, full width on mobile, sleek on desktop */}
              <button
                id="hero-trigger-scan-btn"
                onClick={onTriggerScan}
                disabled={isScanning}
                className={`w-full md:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#FF3B5C] px-5 py-3 md:py-2.5 text-xs sm:text-sm font-black text-white shadow-lg shadow-[#FE2C55]/30 hover:shadow-[#FE2C55]/50 hover:brightness-110 active:scale-[0.98] transition-all cursor-pointer ${
                  isScanning ? 'opacity-60 cursor-not-allowed' : ''
                }`}
              >
                <Sparkles className={`w-4 h-4 shrink-0 ${isScanning ? 'animate-spin' : ''}`} />
                <span className="whitespace-nowrap font-black tracking-wide">
                  {isScanning ? t('nav_scanning') : t('hero_scan_ai')}
                </span>
              </button>
            </div>

          </div>

          {/* Niches Carousel / Pills with Scroll Controls */}
          <div className="mt-3.5 pt-3 border-t border-white/10 relative flex items-center">
            {/* Left Scroll Button */}
            {canScrollLeft && (
              <button
                type="button"
                onClick={() => handleScroll('left')}
                className="hidden sm:flex absolute -left-2 z-10 w-7 h-7 rounded-full bg-[#12131A] border border-white/20 items-center justify-center text-white shadow-xl hover:bg-[#25F4EE] hover:text-black transition cursor-pointer"
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
                className="hidden sm:flex absolute -right-2 z-10 w-7 h-7 rounded-full bg-[#12131A] border border-white/20 items-center justify-center text-white shadow-xl hover:bg-[#25F4EE] hover:text-black transition cursor-pointer"
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
