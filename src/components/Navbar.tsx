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
import { BrandAssetsModal } from './BrandAssetsModal';
import { FreeTierInfoModal } from './FreeTierInfoModal';
import { PWAInstallButton } from './PWAInstallButton';
import { useTranslation } from '../i18n/LanguageContext';

interface NavbarProps {
  activeTab: 'all' | 'early_wave' | 'high_margin' | 'saved' | 'calculator';
  setActiveTab: (tab: 'all' | 'early_wave' | 'high_margin' | 'saved' | 'calculator') => void;
  savedCount: number;
  onTriggerScan: () => void;
  isScanning: boolean;
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
  onTriggerScan,
  isScanning,
  onOpenPushModal,
  isPushActive = false,
  onOpenUpdateSettings,
  hasUpdateAvailable = false,
  onOpenWorkspaceHub,
  onOpenOfflineStorage,
  onOpenOnboardingTour,
  onOpenWifeBot,
}) => {
  const { t, language, setLanguage } = useTranslation();
  const [showBrandAssetsModal, setShowBrandAssetsModal] = useState(false);
  const [showFreeTierModal, setShowFreeTierModal] = useState(false);
  const [showMobileToolsMenu, setShowMobileToolsMenu] = useState(false);
  const [showDesktopTools, setShowDesktopTools] = useState(false);

  const desktopToolsRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        desktopToolsRef.current &&
        !desktopToolsRef.current.contains(event.target as Node)
      ) {
        setShowDesktopTools(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

          {/* Center Navigation Tabs (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-[#2A3042] p-1 border border-white/10 text-xs shadow-inner shrink-0 relative">
            <button
              id="nav-tab-all"
              onClick={() => setActiveTab('all')}
              className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
                <span>{t('nav_all')}</span>
              </span>
            </button>

            <button
              id="nav-tab-early-wave"
              onClick={() => setActiveTab('early_wave')}
              className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
                <span>{t('nav_early_wave')}</span>
              </span>
            </button>

            <button
              id="nav-tab-high-margin"
              onClick={() => setActiveTab('high_margin')}
              className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
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
                <span>{t('nav_high_margin')}</span>
              </span>
            </button>

            <button
              id="nav-tab-calculator"
              onClick={() => setActiveTab('calculator')}
              className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'calculator'
                  ? 'text-[#25F4EE]'
                  : 'text-[#A6A7B2] hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'calculator' && (
                <motion.div
                  layoutId="desktop-navbar-active-pill"
                  className="absolute inset-0 rounded-lg bg-[#25F4EE]/20 border border-[#25F4EE]/40 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Calculator className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav_calculator')}</span>
              </span>
            </button>

            <button
              id="nav-tab-saved"
              onClick={() => setActiveTab('saved')}
              className={`relative flex items-center gap-1.5 px-2.5 lg:px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'saved'
                  ? 'text-[#FE2C55]'
                  : 'text-[#A6A7B2] hover:text-white hover:bg-white/5'
              }`}
            >
              {activeTab === 'saved' && (
                <motion.div
                  layoutId="desktop-navbar-active-pill"
                  className="absolute inset-0 rounded-lg bg-[#FE2C55]/20 border border-[#FE2C55]/40 shadow-sm"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Bookmark className="w-3.5 h-3.5 shrink-0" />
                <span>{t('nav_saved')}</span>
                {savedCount > 0 && (
                  <span className="ml-1 rounded-full bg-[#FE2C55] px-1.5 py-0.2 text-[10px] font-extrabold text-white">
                    {savedCount}
                  </span>
                )}
              </span>
            </button>
          </nav>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            
            {/* Quick Scan Button */}
            <button
              id="quick-scan-btn"
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`flex items-center gap-1.5 sm:gap-2 rounded-xl border border-[#25F4EE]/40 bg-[#161823] hover:border-[#25F4EE] hover:shadow-[0_0_15px_rgba(37,244,238,0.3)] px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-[#25F4EE] hover:text-white shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                isScanning ? 'opacity-50 cursor-not-allowed' : ''
              }`}
              title="Real-time internet viral radar scan"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-[#25F4EE] shrink-0 ${isScanning ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">
                {isScanning ? t('nav_scanning') : t('nav_scan')}
              </span>
            </button>

            {/* Desktop Only: Push Notifications */}
            {onOpenPushModal && (
              <button
                id="push-notifications-btn"
                onClick={onOpenPushModal}
                className={`hidden md:flex relative items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                  isPushActive
                    ? 'border-emerald-500/40 bg-emerald-950/25 text-emerald-300 hover:border-emerald-400 hover:bg-emerald-900/30'
                    : 'border-white/10 bg-[#2A3042] text-[#8E91A6] hover:border-[#FE2C55]/40 hover:text-white'
                }`}
                title="Configurar Notificações Push do Radar PWA"
              >
                <div className="relative flex items-center justify-center shrink-0">
                  {isPushActive ? (
                    <>
                      <BellRing className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="absolute -top-1 -right-1 flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                      </span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-3.5 h-3.5 text-[#FE2C55] shrink-0" />
                      <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-[#FE2C55]" />
                    </>
                  )}
                </div>
                <span>{isPushActive ? 'Radar Push' : 'Push'}</span>
              </button>
            )}

            {/* Desktop Only: Guided Onboarding Tour Button */}
            {onOpenOnboardingTour && (
              <button
                id="nav-onboarding-tour-btn"
                onClick={onOpenOnboardingTour}
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-white/10 bg-[#2A3042] hover:border-[#25F4EE]/50 hover:bg-[#161826] px-3 py-1.5 text-xs font-bold text-[#C5C6D0] hover:text-[#25F4EE] shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                title={language === 'en' ? 'Start Guided Tour (Radar, Bookmarks & Margin)' : 'Iniciar Tour Guiado (Radar, Salvos & Margem)'}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#25F4EE] shrink-0" />
                <span className="hidden xl:inline">{t('onboarding_menu_item')}</span>
                <span className="xl:hidden inline">Tour</span>
              </button>
            )}

            {/* Desktop Only: Bot Telegram / Wife Radar Button */}
            {onOpenWifeBot && (
              <button
                id="nav-wife-bot-btn"
                onClick={onOpenWifeBot}
                className="hidden md:flex items-center gap-1.5 rounded-xl border border-pink-500/40 bg-pink-950/20 hover:border-pink-400 hover:bg-pink-900/35 px-3 py-1.5 text-xs font-bold text-pink-300 hover:text-white shadow-sm transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                title="Configurar Bot Telegram & Radar do TikTok Pessoal"
              >
                <span className="text-sm">🤖</span>
                <span>Bot Telegram</span>
              </button>
            )}



            {/* Desktop Only: Elegant Resources & Downloads Dropdown */}
            <div className="relative hidden md:block" ref={desktopToolsRef}>
              <button
                id="desktop-resources-menu-btn"
                onClick={() => setShowDesktopTools(!showDesktopTools)}
                className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0 ${
                  showDesktopTools
                    ? 'border-[#25F4EE] bg-[#1a1d2e] text-white shadow-[0_0_12px_rgba(37,244,238,0.25)]'
                    : 'border-white/10 bg-[#2A3042] text-[#8E91A6] hover:border-white/20 hover:text-white'
                }`}
                title="Recursos, Código Fonte e Logos"
              >
                <FolderDown className="w-3.5 h-3.5 text-[#25F4EE] shrink-0" />
                <span>Recursos</span>
                <ChevronDown
                  className={`w-3 h-3 text-[#A6A7B2] transition-transform duration-200 ${
                    showDesktopTools ? 'rotate-180 text-white' : ''
                  }`}
                />
              </button>

              {/* Floating Menu Card */}
              {showDesktopTools && (
                <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-white/15 bg-[#0C0E17]/98 backdrop-blur-xl p-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-xs">
                  <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#757788] border-b border-white/10 mb-1">
                    Arquivos & Ferramentas
                  </div>

                  {/* Tour Guiado Onboarding Item */}
                  {onOpenOnboardingTour && (
                    <button
                      onClick={() => {
                        onOpenOnboardingTour();
                        setShowDesktopTools(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white hover:bg-[#25F4EE]/15 hover:border-[#25F4EE]/30 border border-transparent transition group text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#25F4EE]/20 flex items-center justify-center shrink-0">
                        <Sparkles className="w-4 h-4 text-[#25F4EE]" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white group-hover:text-[#25F4EE] transition flex items-center gap-1.5">
                          <span>{t('onboarding_menu_item')}</span>
                          <span className="px-1.5 py-0.2 rounded bg-[#25F4EE]/30 text-[#25F4EE] text-[9px] font-black">GUIA</span>
                        </span>
                        <span className="text-[10px] text-[#A6A7B2]">Radar, Salvos & Cálculo de Margem</span>
                      </div>
                    </button>
                  )}

                  {/* PDF Código Fonte */}
                  <a
                    href="/TIKBLOX_Codigo_Fonte.pdf"
                    target="_blank"
                    rel="noopener noreferrer"
                    download="TIKBLOX_Codigo_Fonte.pdf"
                    onClick={() => setShowDesktopTools(false)}
                    className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white hover:bg-[#FE2C55]/15 hover:border-[#FE2C55]/30 border border-transparent transition group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#FE2C55]/20 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4 text-[#FE2C55]" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-white group-hover:text-[#FE2C55] transition">Dossiê Código Fonte PDF</span>
                      <span className="text-[10px] text-[#A6A7B2]">96 páginas completas com arquitetura</span>
                    </div>
                  </a>

                  {/* Baixar Logos SVG */}
                  <button
                    onClick={() => {
                      setShowBrandAssetsModal(true);
                      setShowDesktopTools(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white hover:bg-[#25F4EE]/15 hover:border-[#25F4EE]/30 border border-transparent transition group text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#25F4EE]/20 flex items-center justify-center shrink-0">
                      <Download className="w-4 h-4 text-[#25F4EE]" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-white group-hover:text-[#25F4EE] transition">Baixar Logos & Tipografia</span>
                      <span className="text-[10px] text-[#A6A7B2]">Arquivos SVG originais e símbolos 3D</span>
                    </div>
                  </button>

                  {/* API Grátis R$ 0 */}
                  <button
                    onClick={() => {
                      setShowFreeTierModal(true);
                      setShowDesktopTools(false);
                    }}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white hover:bg-emerald-500/15 hover:border-emerald-500/30 border border-transparent transition group text-left cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="font-bold text-emerald-300">API R$ 0 Grátis Permanente</span>
                      <span className="text-[10px] text-[#A6A7B2]">Google Gemini 3.8 Flash sem custos</span>
                    </div>
                  </button>

                  {/* Atualizações Google Drive */}
                  {onOpenUpdateSettings && (
                    <button
                      onClick={() => {
                        onOpenUpdateSettings();
                        setShowDesktopTools(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white hover:bg-[#25F4EE]/15 hover:border-[#25F4EE]/30 border border-transparent transition group text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-[#25F4EE]/20 flex items-center justify-center shrink-0 relative">
                        <FolderUp className="w-4 h-4 text-[#25F4EE]" />
                        {hasUpdateAvailable && (
                          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#FE2C55] animate-ping" />
                        )}
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white group-hover:text-[#25F4EE] transition flex items-center gap-1.5">
                          <span>Atualizações Google Drive</span>
                          {hasUpdateAvailable && (
                            <span className="px-1.5 py-0.2 rounded bg-[#FE2C55] text-white text-[9px] font-black">NOVO</span>
                          )}
                        </span>
                        <span className="text-[10px] text-[#A6A7B2]">Distribuir novas versões .exe via nuvem</span>
                      </div>
                    </button>
                  )}
                  {/* Google Workspace Hub */}
                  {onOpenWorkspaceHub && (
                    <button
                      onClick={() => {
                        onOpenWorkspaceHub('drive');
                        setShowDesktopTools(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white hover:bg-emerald-500/15 hover:border-emerald-500/30 border border-transparent transition group text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center shrink-0">
                        <Cloud className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white group-hover:text-emerald-400 transition flex items-center gap-1.5">
                          <span>Google Workspace Hub</span>
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/30 text-emerald-300 text-[9px] font-black">ATIVO</span>
                        </span>
                        <span className="text-[10px] text-[#A6A7B2]">Drive, Gmail e Google Classroom</span>
                      </div>
                    </button>
                  )}

                  {/* Banco Offline IndexedDB */}
                  {onOpenOfflineStorage && (
                    <button
                      onClick={() => {
                        onOpenOfflineStorage();
                        setShowDesktopTools(false);
                      }}
                      className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-white hover:bg-cyan-500/15 hover:border-cyan-500/30 border border-transparent transition group text-left cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center shrink-0">
                        <Database className="w-4 h-4 text-cyan-400" />
                      </div>
                      <div className="flex flex-col text-left">
                        <span className="font-bold text-white group-hover:text-cyan-400 transition flex items-center gap-1.5">
                          <span>Banco Offline (IndexedDB)</span>
                          <span className="px-1.5 py-0.2 rounded bg-cyan-500/30 text-cyan-300 text-[9px] font-black">LOCAL</span>
                        </span>
                        <span className="text-[10px] text-[#A6A7B2]">Gerenciar cache e histórico offline</span>
                      </div>
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Language Selector Toggle (Desktop) */}
            <div className="hidden sm:flex items-center rounded-xl border border-white/10 bg-[#0C0E17] p-0.5 text-xs shrink-0">
              <button
                id="lang-toggle-pt"
                onClick={() => setLanguage('pt')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
                  language === 'pt'
                    ? 'bg-[#FE2C55] text-white shadow-sm'
                    : 'text-[#8E91A6] hover:text-white'
                }`}
                title="Português (Brasil)"
              >
                <span>🇧🇷</span>
                <span>PT</span>
              </button>
              <button
                id="lang-toggle-en"
                onClick={() => setLanguage('en')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[11px] transition-all cursor-pointer ${
                  language === 'en'
                    ? 'bg-[#25F4EE] text-black shadow-sm'
                    : 'text-[#8E91A6] hover:text-white'
                }`}
                title="English (US)"
              >
                <span>🇺🇸</span>
                <span>EN</span>
              </button>
            </div>

            {/* Desktop Native App Mode Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl border border-white/10 bg-[#0C0E17] text-[11px] text-[#A6A7B2]">
              <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-pulse" />
              <span>Windows Desktop v1.0</span>
            </div>

            {/* Mobile PWA Install / iOS Shortcut Quick Button */}
            <div className="flex md:hidden">
              <PWAInstallButton />
            </div>

            {/* Mobile Language Toggle */}
            <div className="flex sm:hidden items-center rounded-xl border border-white/10 bg-[#0C0E17] p-0.5 text-xs shrink-0">
              <button
                onClick={() => setLanguage(language === 'pt' ? 'en' : 'pt')}
                className="flex items-center gap-1 px-2 py-1 rounded-lg font-black text-[11px] text-white bg-white/10"
                title="Alterar Idioma / Switch Language"
              >
                <span>{language === 'pt' ? '🇧🇷 PT' : '🇺🇸 EN'}</span>
              </button>
            </div>

            {/* Mobile More Options Button */}
            <button
              id="mobile-menu-toggle-btn"
              onClick={() => setShowMobileToolsMenu(!showMobileToolsMenu)}
              className="flex md:hidden items-center justify-center p-1.5 rounded-xl border border-white/10 bg-[#2A3042] text-[#8E91A6] hover:text-white hover:border-white/25 active:scale-95 cursor-pointer shrink-0"
              title="Mais opções e downloads"
              aria-label="Mais opções"
            >
              {showMobileToolsMenu ? <X className="w-4 h-4 text-white" /> : <MoreVertical className="w-4 h-4" />}
            </button>

          </div>
        </div>

        {/* Mobile menus: equal 3-column grid */}
        <div className="md:hidden border-t border-white/10 px-3 py-2 grid grid-cols-3 gap-2">
          <button
            onClick={() => setActiveTab(activeTab === 'early_wave' || activeTab === 'high_margin' ? activeTab : 'all')}
            className={`h-10 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'all' || activeTab === 'early_wave' || activeTab === 'high_margin'
                ? 'bg-[#FE2C55] text-white'
                : 'text-[#E7E4DC] bg-[#2A3042] border border-white/10'
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setActiveTab('saved')}
            className={`h-10 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center justify-center gap-1 ${
              activeTab === 'saved'
                ? 'bg-[#FE2C55] text-white'
                : 'text-[#E7E4DC] bg-[#2A3042] border border-white/10'
            }`}
          >
            <span>{t('nav_saved')}</span>
            {savedCount > 0 && (
              <span className="rounded-full bg-white/20 px-1.5 text-[9px] font-extrabold">{savedCount}</span>
            )}
          </button>
          <button
            onClick={() => {
              setShowMobileToolsMenu(false);
              setActiveTab('calculator');
            }}
            className={`h-10 rounded-xl text-xs font-bold cursor-pointer ${
              activeTab === 'calculator'
                ? 'bg-[#25F4EE] text-[#141722]'
                : 'text-[#E7E4DC] bg-[#2A3042] border border-white/10'
            }`}
          >
            {t('nav_calculator')}
          </button>
          {(activeTab === 'all' || activeTab === 'early_wave' || activeTab === 'high_margin') && (
            <>
              <button
                onClick={() => setActiveTab('all')}
                className={`h-10 rounded-xl text-[11px] font-bold cursor-pointer ${activeTab === 'all' ? 'bg-white text-[#141722]' : 'text-[#E7E4DC] bg-[#2A3042] border border-white/10'}`}
              >
                {t('nav_all')}
              </button>
              <button
                onClick={() => setActiveTab('early_wave')}
                className={`h-10 rounded-xl text-[11px] font-bold cursor-pointer ${activeTab === 'early_wave' ? 'bg-[#25F4EE] text-[#141722]' : 'text-[#E7E4DC] bg-[#2A3042] border border-white/10'}`}
              >
                {t('nav_early_wave')}
              </button>
              <button
                onClick={() => setActiveTab('high_margin')}
                className={`h-10 rounded-xl text-[11px] font-bold cursor-pointer ${activeTab === 'high_margin' ? 'bg-[#25F4EE] text-[#141722]' : 'text-[#E7E4DC] bg-[#2A3042] border border-white/10'}`}
              >
                {t('nav_high_margin')}
              </button>
            </>
          )}
        </div>

        {/* Mobile Tools Dropdown Panel */}
        {showMobileToolsMenu && (
          <div className="md:hidden border-t border-white/10 bg-[#242938] p-3 animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="grid grid-cols-2 gap-2 text-xs">

              {onOpenOnboardingTour && (
                <button
                  onClick={() => {
                    onOpenOnboardingTour();
                    setShowMobileToolsMenu(false);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#25F4EE]/40 bg-[#25F4EE]/15 text-white font-bold"
                >
                  <Sparkles className="w-4 h-4 text-[#25F4EE] shrink-0" />
                  <span>{t('onboarding_menu_item')} (Passo a Passo)</span>
                </button>
              )}

              <a
                href="/TIKBLOX_Codigo_Fonte.pdf"
                target="_blank"
                rel="noopener noreferrer"
                download="TIKBLOX_Codigo_Fonte.pdf"
                onClick={() => setShowMobileToolsMenu(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-[#FE2C55]/30 bg-[#FE2C55]/10 text-white font-bold"
              >
                <FileText className="w-4 h-4 text-[#FE2C55] shrink-0" />
                <span>PDF Código (96p)</span>
              </a>

              <button
                onClick={() => {
                  setShowBrandAssetsModal(true);
                  setShowMobileToolsMenu(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-[#141724] text-white font-bold"
              >
                <Download className="w-4 h-4 text-[#25F4EE] shrink-0" />
                <span>Baixar Logo SVG</span>
              </button>

              {onOpenPushModal && (
                <button
                  onClick={() => {
                    onOpenPushModal();
                    setShowMobileToolsMenu(false);
                  }}
                  className="flex items-center gap-2 p-2.5 rounded-xl border border-white/10 bg-[#141724] text-white font-bold"
                >
                  <Bell className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>Notificações Push</span>
                </button>
              )}

              <button
                onClick={() => {
                  setShowFreeTierModal(true);
                  setShowMobileToolsMenu(false);
                }}
                className="flex items-center gap-2 p-2.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 text-emerald-300 font-bold"
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>API R$ 0 Grátis</span>
              </button>

              {onOpenWorkspaceHub && (
                <button
                  onClick={() => {
                    onOpenWorkspaceHub('drive');
                    setShowMobileToolsMenu(false);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 text-emerald-300 font-bold"
                >
                  <Cloud className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Google Workspace (Drive, Gmail, Classroom)</span>
                </button>
              )}

              {onOpenUpdateSettings && (
                <button
                  onClick={() => {
                    onOpenUpdateSettings();
                    setShowMobileToolsMenu(false);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-[#25F4EE]/40 bg-[#25F4EE]/10 text-white font-bold"
                >
                  <FolderUp className="w-4 h-4 text-[#25F4EE] shrink-0" />
                  <span>Configurar Atualizações Google Drive (.exe)</span>
                </button>
              )}

              {onOpenOfflineStorage && (
                <button
                  onClick={() => {
                    onOpenOfflineStorage();
                    setShowMobileToolsMenu(false);
                  }}
                  className="col-span-2 flex items-center justify-center gap-2 p-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/30 text-cyan-300 font-bold cursor-pointer"
                >
                  <Database className="w-4 h-4 text-cyan-400 shrink-0" />
                  <span>Banco Offline (IndexedDB)</span>
                </button>
              )}
            </div>
          </div>
        )}

      </div>

      {/* Brand Assets Export Modal */}
      <BrandAssetsModal
        isOpen={showBrandAssetsModal}
        onClose={() => setShowBrandAssetsModal(false)}
      />

      {/* Free Tier Info Modal */}
      <FreeTierInfoModal
        isOpen={showFreeTierModal}
        onClose={() => setShowFreeTierModal(false)}
      />
    </header>
  );
};

