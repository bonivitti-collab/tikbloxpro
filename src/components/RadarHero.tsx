import React, { useRef, useState, useEffect, useCallback, useMemo } from 'react';
import { Sparkles, Compass, Globe, Filter, ChevronLeft, ChevronRight, Clock, Search, X, Gift, RefreshCw } from 'lucide-react';
import { ProductNiche } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface RadarHeroProps {
  selectedNiche: ProductNiche;
  setSelectedNiche: (niche: ProductNiche) => void;
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
  totalProductsCount: number;
  onOpenTour?: () => void;
  onOpenCopilot?: () => void;
  searchQuery?: string;
  setSearchQuery?: (q: string) => void;
  onTriggerScan?: () => void;
  filterFreeSampleOnly?: boolean;
  setFilterFreeSampleOnly?: (val: boolean) => void;
  filterBlueOceanOnly?: boolean;
  setFilterBlueOceanOnly?: (val: boolean) => void;
  isScanning?: boolean;
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
  totalProductsCount,
  onOpenTour,
  onOpenCopilot,
  searchQuery,
  setSearchQuery,
  onTriggerScan,
  filterFreeSampleOnly = false,
  setFilterFreeSampleOnly,
  filterBlueOceanOnly = false,
  setFilterBlueOceanOnly,
  isScanning = false,
}) => {
  const { t, language } = useTranslation();

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
    { id: 'gaming' as ProductNiche, label: t('hero_niche_gaming'), icon: '🎮' },
    { id: 'office' as ProductNiche, label: t('hero_niche_office'), icon: '💻' },
    { id: 'outdoor' as ProductNiche, label: t('hero_niche_outdoor'), icon: '🏕️' },
    { id: 'travel' as ProductNiche, label: t('hero_niche_travel'), icon: '✈️' },
  ], [t]);


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
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FE2C55]/15 border border-[#FE2C55]/30 px-3 py-1 mb-3 text-xs font-black text-[#FE2C55]">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE2C55] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FE2C55]"></span>
            </span>
            <span>🇧🇷 RADAR TIKTOK SHOP BRASIL • ESTOQUE NACIONAL & AFILIAÇÃO</span>
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black tracking-tight text-white leading-tight">
            Encontre produtos com{' '}
            <span className="bg-gradient-to-r from-[#25F4EE] via-white to-[#FE2C55] bg-clip-text text-transparent">
              alta demanda e pouca saturação
            </span>{' '}
            para vender no TikTok Shop.
          </h1>
          <p className="mt-2 sm:mt-3 text-xs sm:text-base text-[#C5C6D0] font-normal leading-relaxed">
            Minerador de produtos com <strong className="text-white">estoque no Brasil</strong>, <strong className="text-[#25F4EE]">amostra grátis liberada</strong> e <strong className="text-emerald-400">altas comissões</strong>. Pegue o link de afiliação e o gancho viral pronto para gravar hoje.
          </p>
        </div>

        {/* Action & Filter Console */}
        <div className="rounded-2xl border border-white/10 bg-[#2A3042]/90 backdrop-blur-xl p-4 sm:p-5 shadow-2xl">
          {/* Top Row: Search Input + Origin + Scan Button */}
          <div className="flex flex-col md:flex-row items-stretch gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#25F4EE]" />
              <input
                type="text"
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery && setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && onTriggerScan) {
                    onTriggerScan();
                  }
                }}
                placeholder="Buscar produto ou nicho no TikTok Shop (ex: mini selador, corretor, garrafa, depilador)..."
                className="w-full h-[52px] rounded-xl border border-white/10 bg-[#262B3A] pl-11 pr-10 text-sm font-medium text-white placeholder-[#757788] focus:border-[#25F4EE] focus:outline-none focus:ring-1 focus:ring-[#25F4EE] transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery && setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg text-[#757788] hover:text-white transition cursor-pointer"
                  title="Limpar busca"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Origin Selector */}
            <div className="relative w-full md:w-[190px] shrink-0">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#A6A7B2]" />
              <select
                id="origin-country-select"
                value={selectedOrigin}
                onChange={(e) => setSelectedOrigin(e.target.value)}
                aria-label="Filtrar por país de origem do viral"
                className="w-full h-[52px] rounded-xl border border-white/10 bg-[#262B3A] pl-11 pr-4 text-xs font-medium text-white focus:border-[#FE2C55] focus:outline-none focus:ring-1 focus:ring-[#FE2C55] cursor-pointer appearance-none transition-colors hover:border-white/20"
              >
                <option value="all">🌍 Todas Origens</option>
                <option value="US">🇺🇸 Viral nos EUA</option>
                <option value="CN">🇨🇳 Viral na Ásia/China</option>
              </select>
            </div>

            {/* Scan Trigger Button */}
            {onTriggerScan && (
              <button
                onClick={onTriggerScan}
                disabled={isScanning}
                className="h-[52px] px-5 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#FF3B5C] hover:brightness-110 active:scale-98 text-white font-black text-xs sm:text-sm shadow-lg shadow-[#FE2C55]/30 flex items-center justify-center gap-2 transition cursor-pointer whitespace-nowrap shrink-0 disabled:opacity-60"
              >
                <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
                <span>{isScanning ? 'Minerando TikTok Shop...' : 'Escanear Tendências BR'}</span>
              </button>
            )}
          </div>

          {/* Quick Filter Chips: Amostra Grátis, Oceano Azul, etc. */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#A6A7B2] uppercase mr-1">Filtros Afiliados:</span>
            
            {setFilterFreeSampleOnly && (
              <button
                onClick={() => setFilterFreeSampleOnly(!filterFreeSampleOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterFreeSampleOnly
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-black'
                    : 'bg-[#161823] text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/10'
                }`}
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Amostra Grátis Liberada</span>
              </button>
            )}

            {setFilterBlueOceanOnly && (
              <button
                onClick={() => setFilterBlueOceanOnly(!filterBlueOceanOnly)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                  filterBlueOceanOnly
                    ? 'bg-[#25F4EE] text-slate-950 shadow-md shadow-[#25F4EE]/20 font-black'
                    : 'bg-[#161823] text-[#25F4EE] border border-[#25F4EE]/30 hover:bg-[#25F4EE]/10'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>🌊 Oceano Azul (&lt;15 Criadores)</span>
              </button>
            )}
          </div>

          {/* Niches List */}
          <div className="mt-4 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white/5 border border-white/5 shrink-0 sm:mt-0.5">
              <Filter className="w-3.5 h-3.5 text-[#25F4EE]" />
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start gap-2 w-full">
              {nichesList.map((niche) => (
                <button
                  key={niche.id}
                  onClick={() => setSelectedNiche(niche.id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                    selectedNiche === niche.id
                      ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white shadow-md shadow-[#FE2C55]/30 border border-[#FE2C55]'
                      : 'bg-[#161823] text-[#A6A7B2] hover:bg-[#202230] hover:text-white border border-white/5'
                  }`}
                >
                  <span className="text-sm leading-none">{niche.icon}</span>
                  <span className="leading-none mt-0.5">{niche.label}</span>
                </button>
              ))}
            </div>

          </div>

        </div>

      </div>
    </section>
  );
});

RadarHero.displayName = 'RadarHero';
