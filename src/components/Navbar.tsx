import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Bookmark,
  Calculator,
  RefreshCw,
  Layers,
  Download,
  Bell,
  BellRing,
  ShieldCheck,
  FileText,
  MoreVertical,
  X,
  ChevronDown,
  FolderDown,
  FolderUp,
  Cloud,
  Database,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { TikBloxLogo } from './TikBloxLogo';
import { GlobalScanCountdown } from './GlobalScanCountdown';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  activeTab: 'all' | 'early_wave' | 'high_margin' | 'saved' | 'calculator';
  setActiveTab: (tab: 'all' | 'early_wave' | 'high_margin' | 'saved' | 'calculator') => void;
  savedCount: number;
  onOpenPushModal?: () => void;
  isPushActive?: boolean;
  onOpenUpdateSettings?: () => void;
  hasUpdateAvailable?: boolean;
  onOpenWorkspaceHub?: (tab?: 'drive' | 'gmail' | 'classroom') => void;
  onOpenOfflineStorage?: () => void;
  onOpenOnboardingTour?: () => void;
  onOpenWifeBot?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  savedCount,
  onOpenPushModal,
  isPushActive = false,
  onOpenUpdateSettings,
  hasUpdateAvailable = false,
  onOpenWorkspaceHub,
  onOpenOfflineStorage,
  onOpenOnboardingTour,
  onOpenWifeBot,
}) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#1A1D27]/95 backdrop-blur-2xl">
      {/* Subtle top edge chromatic glow line */}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-[#25F4EE]/60 to-[#FE2C55]/60" />

      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
          
          {/* Brand Logo & Live Radar Status */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('all')}
              className="flex items-center text-left focus:outline-none group cursor-pointer"
              title="TIKBLOX Radar"
            >
              <TikBloxLogo size="md" showText={true} showBadge={true} animate={true} />
            </button>
          </div>

          {/* Center Navigation Tabs (Desktop & Tablet) */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-[#2A3042] p-1 border border-white/10 text-xs shadow-inner shrink-0 relative">
            <button
              id="nav-tab-all"
              onClick={() => setActiveTab('all')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'all'
                  ? 'text-white'
                  : 'text-[#A6A7B2] hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'all' && (
                <motion.div
                  layoutId="desktop-navbar-active-pill"
                  className="absolute inset-0 rounded-lg bg-gradient-to-r from-[#FE2C55] to-[#FF0050] shadow-md shadow-[#FE2C55]/30"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 shrink-0" />
                <span>Radar TikTok Shop BR</span>
              </span>
            </button>

            <button
              id="nav-tab-early-wave"
              onClick={() => setActiveTab('early_wave')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'early_wave'
                  ? 'text-emerald-300'
                  : 'text-[#A6A7B2] hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'early_wave' && (
                <motion.div
                  layoutId="desktop-navbar-active-pill"
                  className="absolute inset-0 rounded-lg bg-emerald-500/20 border border-emerald-500/40 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <span className="relative flex h-2 w-2 shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>🌊 Oceano Azul (&lt;15 Criadores)</span>
              </span>
            </button>

            <button
              id="nav-tab-high-margin"
              onClick={() => setActiveTab('high_margin')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'high_margin'
                  ? 'text-amber-300'
                  : 'text-[#A6A7B2] hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'high_margin' && (
                <motion.div
                  layoutId="desktop-navbar-active-pill"
                  className="absolute inset-0 rounded-lg bg-amber-500/20 border border-amber-500/40 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                <span>Altas Comissões (+20%)</span>
              </span>
            </button>

            <button
              id="nav-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'saved'
                  ? 'text-[#25F4EE]'
                  : 'text-[#A6A7B2] hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'saved' && (
                <motion.div
                  layoutId="desktop-navbar-active-pill"
                  className="absolute inset-0 rounded-lg bg-[#25F4EE]/20 border border-[#25F4EE]/40 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 shrink-0" />
                <span>Salvos</span>
                {savedCount > 0 && (
                  <span className="rounded-full bg-[#25F4EE]/20 border border-[#25F4EE]/40 px-1.5 text-[10px] font-black text-[#25F4EE]">
                    {savedCount}
                  </span>
                )}
              </span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Global Scan Countdown */}
            <GlobalScanCountdown />
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-white/10 px-2 py-2 flex items-center justify-between gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
              activeTab === 'all'
                ? 'bg-[#FE2C55] text-white'
                : 'text-[#A6A7B2] bg-[#2A3042] border border-white/10'
            }`}
          >
            Radar Shop BR
          </button>
          <button
            onClick={() => setActiveTab('early_wave')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
              activeTab === 'early_wave'
                ? 'bg-emerald-500 text-slate-950 font-black'
                : 'text-[#A6A7B2] bg-[#2A3042] border border-white/10'
            }`}
          >
            🌊 Oceano Azul
          </button>
          <button
            onClick={() => setActiveTab('high_margin')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition ${
              activeTab === 'high_margin'
                ? 'bg-amber-400 text-slate-950 font-black'
                : 'text-[#A6A7B2] bg-[#2A3042] border border-white/10'
            }`}
          >
            💰 +20% Comissão
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap cursor-pointer transition flex items-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-[#25F4EE] text-slate-950 font-black'
                : 'text-[#A6A7B2] bg-[#2A3042] border border-white/10'
            }`}
          >
            <span>Salvos</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-slate-900/30 px-1 text-[9px] font-black">{savedCount}</span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

