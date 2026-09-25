import React, { useState } from 'react';
import { Flame, Activity, Zap, Search, Info, TrendingUp, Sparkles, ChevronRight, X } from 'lucide-react';
import { TrendingProduct, ProductTrendVelocity } from '../types';
import { useProductTrendVelocity, recordProductQueryInDatabase } from '../services/trendVelocityService';
import { useTranslation } from '../i18n/LanguageContext';

interface SocialProofBadgeProps {
  product: TrendingProduct;
  variant?: 'card' | 'detailed' | 'compact';
  className?: string;
  onFilterByKeyword?: (keyword: string) => void;
}

export const SocialProofBadge: React.FC<SocialProofBadgeProps> = ({
  product,
  variant = 'card',
  className = '',
  onFilterByKeyword,
}) => {
  const { language } = useTranslation();
  const { socialProof } = useProductTrendVelocity(product);
  const [showTooltip, setShowTooltip] = useState(false);
  const [justSimulated, setJustSimulated] = useState(false);

  const {
    velocity,
    recentQueryCount,
    queriesLast24Hours,
    matchedQueries,
    intensityPercent,
    lastSearchedFormatted,
    velocityReason,
  } = socialProof;

  // Visual styling mapped to each of the 3 requested velocity states
  const getVelocityStyle = () => {
    switch (velocity) {
      case 'Rising Fast':
        return {
          containerBorder: 'border-emerald-500/40 hover:border-emerald-400/60',
          containerBg: 'bg-emerald-950/20 hover:bg-emerald-950/30',
          badgeBg: 'bg-emerald-500/15 border-emerald-500/35 text-emerald-300',
          badgeGlow: 'bg-emerald-400',
          textColor: 'text-emerald-300',
          icon: <Flame className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />,
          accentBar: 'bg-emerald-500',
          labelPt: 'Disparando',
        };
      case 'Peak Volume':
        return {
          containerBorder: 'border-[#FE2C55]/40 hover:border-[#FE2C55]/60',
          containerBg: 'bg-[#FE2C55]/10 hover:bg-[#FE2C55]/15',
          badgeBg: 'bg-[#FE2C55]/15 border-[#FE2C55]/40 text-[#FE2C55]',
          badgeGlow: 'bg-[#FE2C55]',
          textColor: 'text-[#FE2C55]',
          icon: <Zap className="w-3.5 h-3.5 text-[#FE2C55]" />,
          accentBar: 'bg-[#FE2C55]',
          labelPt: 'Volume Máximo',
        };
      case 'Stable':
      default:
        return {
          containerBorder: 'border-sky-500/30 hover:border-sky-400/50',
          containerBg: 'bg-sky-950/20 hover:bg-sky-950/30',
          badgeBg: 'bg-sky-500/15 border-sky-500/30 text-sky-300',
          badgeGlow: 'bg-sky-400',
          textColor: 'text-sky-300',
          icon: <Activity className="w-3.5 h-3.5 text-sky-400" />,
          accentBar: 'bg-sky-500',
          labelPt: 'Estável',
        };
    }
  };

  const style = getVelocityStyle();

  // Quick action: Simulate search query to demonstrate dynamic recalculation
  const handleSimulateSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    const queryTerm = matchedQueries[0] || product.name.split(' ').slice(0, 3).join(' ');
    recordProductQueryInDatabase(queryTerm);
    setJustSimulated(true);
    setTimeout(() => setJustSimulated(false), 2000);
  };

  if (variant === 'compact') {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${style.badgeBg} ${className}`}
        title={`Social Proof: Trend Velocity: ${velocity} (${recentQueryCount} recent queries in DB)`}
      >
        {style.icon}
        <span className="font-extrabold">{velocity}</span>
        <span className="opacity-60">•</span>
        <span className="text-[10px] font-mono opacity-90">{recentQueryCount} queries</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {/* Main Social Proof & Trend Velocity Banner */}
      <div
        id={`social-proof-badge-${product.id}`}
        onClick={() => setShowTooltip((prev) => !prev)}
        className={`group/sp relative flex items-center justify-between gap-2 rounded-xl border ${style.containerBorder} ${style.containerBg} px-2.5 py-2 transition-all cursor-pointer select-none`}
        title={
          language === 'en'
            ? 'Click to inspect database search query frequency'
            : 'Clique para inspecionar a frequência de buscas no banco'
        }
      >
        {/* Left column: Social Proof tag + Trend Velocity state */}
        <div className="flex items-center gap-2 min-w-0">
          {/* Social Proof chip */}
          <span className="inline-flex items-center gap-1 rounded-md bg-white/10 px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white shrink-0">
            <Sparkles className="w-2.5 h-2.5 text-[#25F4EE]" />
            <span>Social Proof</span>
          </span>

          {/* Trend Velocity display */}
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[10px] font-semibold text-[#A6A7B2] shrink-0">
              Trend Velocity:
            </span>
            <span
              className={`inline-flex items-center gap-1 font-black text-xs ${style.textColor} truncate`}
            >
              {style.icon}
              <span>{velocity}</span>
            </span>
          </div>
        </div>

        {/* Right column: Dynamic query frequency evidence from database */}
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="text-right">
            <span className="block text-[11px] font-extrabold text-white font-mono">
              {recentQueryCount}{' '}
              <span className="text-[9px] font-normal text-[#A6A7B2]">
                {language === 'en' ? 'queries' : 'buscas'}
              </span>
            </span>
          </div>

          <div className="flex h-5 w-5 items-center justify-center rounded-lg bg-white/5 group-hover/sp:bg-white/10 text-[#A6A7B2] group-hover/sp:text-white transition">
            <Info className="w-3 h-3" />
          </div>
        </div>
      </div>

      {/* Popover / Telemetry Details Dropdown */}
      {showTooltip && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute z-40 left-0 right-0 top-full mt-1.5 rounded-xl border border-white/15 bg-[#12131A] p-3.5 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-white flex items-center gap-1.5">
                {style.icon}
                <span>Trend Velocity: {velocity}</span>
              </span>
              <span className="text-[10px] text-[#A6A7B2] bg-white/10 px-1.5 py-0.2 rounded font-mono">
                {intensityPercent}% momentum
              </span>
            </div>
            <button
              onClick={() => setShowTooltip(false)}
              className="p-1 rounded-md text-[#A6A7B2] hover:text-white hover:bg-white/10 transition"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[#C5C6D0] leading-relaxed mb-3">
            {velocityReason}
          </p>

          <div className="grid grid-cols-2 gap-2 text-[10px] bg-[#0B0C10] rounded-lg p-2 mb-2.5 border border-white/5">
            <div>
              <span className="text-[#A6A7B2] block">
                {language === 'en' ? 'Database Queries Total:' : 'Total de Buscas no Banco:'}
              </span>
              <strong className="text-white text-xs font-bold font-mono">
                {recentQueryCount} consultas
              </strong>
            </div>
            <div>
              <span className="text-[#A6A7B2] block">
                {language === 'en' ? 'Activity Last 24 Hours:' : 'Atividade Últimas 24h:'}
              </span>
              <strong className="text-emerald-400 text-xs font-bold font-mono">
                +{queriesLast24Hours} mineradores
              </strong>
            </div>
          </div>

          {matchedQueries.length > 0 && (
            <div className="mb-2.5">
              <span className="text-[10px] font-semibold text-[#A6A7B2] block mb-1">
                {language === 'en' ? 'Recent search terms in database:' : 'Termos buscados na base:'}
              </span>
              <div className="flex flex-wrap gap-1">
                {matchedQueries.map((term, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (onFilterByKeyword) onFilterByKeyword(term);
                      setShowTooltip(false);
                    }}
                    className="inline-flex items-center gap-1 text-[10px] rounded bg-[#161823] px-2 py-0.5 text-cyan-300 border border-white/10 hover:border-cyan-400/50 transition cursor-pointer"
                  >
                    <Search className="w-2.5 h-2.5 opacity-70" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-[#757788]">
              {language === 'en' ? 'Last query:' : 'Última consulta:'} {lastSearchedFormatted}
            </span>
            <button
              onClick={handleSimulateSearch}
              className={`flex items-center gap-1 font-bold px-2 py-1 rounded transition cursor-pointer ${
                justSimulated
                  ? 'bg-emerald-500/20 text-emerald-300'
                  : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <TrendingUp className="w-3 h-3 text-[#25F4EE]" />
              <span>
                {justSimulated
                  ? language === 'en'
                    ? '+1 Query Recorded!'
                    : '+1 Busca Registrada!'
                  : language === 'en'
                  ? 'Simulate Query (+1)'
                  : 'Simular Busca (+1)'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
