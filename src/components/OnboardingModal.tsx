import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Radio,
  Bookmark,
  Calculator,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Zap,
  TrendingUp,
  Database,
  DollarSign,
  ShieldCheck,
  Compass,
  Layers,
  ChevronRight,
} from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext';
import { TrendingProduct } from '../types';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tab: 'all' | 'early_wave' | 'high_margin' | 'saved' | 'calculator') => void;
  onOpenCalculator: (sampleProduct?: TrendingProduct | null) => void;
  sampleProduct?: TrendingProduct | null;
}

export const ONBOARDING_STORAGE_KEY = 'tikblox_onboarding_completed_v1';

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onOpenCalculator,
  sampleProduct = null,
}) => {
  const { t, language } = useTranslation();
  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 3;

  // Keyboard navigation (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleDismiss();
      } else if (e.key === 'ArrowRight') {
        if (currentStep < totalSteps) {
          setCurrentStep((prev) => prev + 1);
        }
      } else if (e.key === 'ArrowLeft') {
        if (currentStep > 1) {
          setCurrentStep((prev) => prev - 1);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep, totalSteps]);

  // Mark onboarding as completed in localStorage
  const handleDismiss = useCallback(() => {
    try {
      localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    } catch {
      // ignore
    }
    onClose();
  }, [onClose]);

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleDismiss();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleActionClick = (step: number) => {
    if (step === 1) {
      onNavigateToTab('all');
      handleNext();
    } else if (step === 2) {
      onNavigateToTab('saved');
      handleNext();
    } else if (step === 3) {
      handleDismiss();
      onOpenCalculator(sampleProduct);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      id="onboarding-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleDismiss();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="relative w-full max-w-2xl rounded-2xl border border-white/15 bg-[#0C0E17] text-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Chromatic TikTok Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#25F4EE] via-white to-[#FE2C55]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4 bg-[#090A10]/90">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] p-0.5 shadow-md">
              <div className="flex h-full w-full items-center justify-center rounded-[10px] bg-[#0C0E17]">
                <Sparkles className="h-4 w-4 text-[#25F4EE]" />
              </div>
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#25F4EE]">
                {t('onboarding_badge')}
              </span>
              <h3 id="onboarding-title" className="text-sm font-bold text-white leading-none mt-0.5">
                {t('onboarding_menu_item')}
              </h3>
            </div>
          </div>

          {/* Step Pill Indicators (Clickable) */}
          <div className="flex items-center gap-1.5 bg-[#121420] border border-white/10 rounded-full p-1 text-xs">
            <button
              onClick={() => setCurrentStep(1)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                currentStep === 1
                  ? 'bg-[#25F4EE] text-slate-950 shadow-sm'
                  : 'text-[#A6A7B2] hover:text-white'
              }`}
              title="Passo 1: Radar"
            >
              <Radio className="w-3 h-3" />
              <span className="hidden sm:inline">1. Radar</span>
              <span className="sm:hidden">1</span>
            </button>
            <button
              onClick={() => setCurrentStep(2)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                currentStep === 2
                  ? 'bg-[#FE2C55] text-white shadow-sm'
                  : 'text-[#A6A7B2] hover:text-white'
              }`}
              title="Passo 2: Salvos"
            >
              <Bookmark className="w-3 h-3" />
              <span className="hidden sm:inline">2. Salvos</span>
              <span className="sm:hidden">2</span>
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold transition cursor-pointer ${
                currentStep === 3
                  ? 'bg-emerald-400 text-slate-950 shadow-sm'
                  : 'text-[#A6A7B2] hover:text-white'
              }`}
              title="Passo 3: Margem"
            >
              <Calculator className="w-3 h-3" />
              <span className="hidden sm:inline">3. Margem</span>
              <span className="sm:hidden">3</span>
            </button>
          </div>

          {/* Close button */}
          <button
            onClick={handleDismiss}
            className="rounded-xl p-1.5 text-[#8E91A6] hover:text-white hover:bg-white/10 transition cursor-pointer"
            aria-label="Fechar tour"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Carousel Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* STEP 1: Radar de Tendências Virais */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#25F4EE]/10 border border-[#25F4EE]/30 px-3 py-1 text-xs font-bold text-[#25F4EE]">
                  <Radio className="w-3.5 h-3.5 animate-pulse" />
                  <span>{t('onboarding_step1_badge')}</span>
                </span>
                <span className="text-xs text-[#757788]">
                  {language === 'en' ? 'Step 1 of 3' : 'Passo 1 de 3'}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {t('onboarding_step1_title')}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#C5C6D0] leading-relaxed">
                  {t('onboarding_step1_desc')}
                </p>
              </div>

              {/* Visual Demonstration Card: Radar Snapshot */}
              <div className="rounded-xl border border-white/10 bg-[#07080D] p-3 sm:p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-32 bg-[#25F4EE]/10 blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs mb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
                    <span className="text-[#25F4EE] font-bold">RADAR AO VIVO</span>
                  </div>
                  <span className="text-[#757788]">TikTok US • Douyin China • Amazon</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <span className="text-[10px] text-[#A6A7B2] block uppercase font-bold">1. Onda Inicial</span>
                    <span className="text-xs font-bold text-emerald-400 mt-0.5 block">0 a 3 meses no Brasil</span>
                    <span className="text-[10px] text-[#757788] block">Concorrência quase nula</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <span className="text-[10px] text-[#A6A7B2] block uppercase font-bold">2. Viralidade</span>
                    <span className="text-xs font-bold text-[#25F4EE] mt-0.5 block">Score 90 a 98/100</span>
                    <span className="text-[10px] text-[#757788] block">Milhões de views lá fora</span>
                  </div>
                  <div className="rounded-lg border border-white/10 bg-white/5 p-2.5">
                    <span className="text-[10px] text-[#A6A7B2] block uppercase font-bold">3. Arbitragem</span>
                    <span className="text-xs font-bold text-[#FE2C55] mt-0.5 block">Margem 200% a 350%</span>
                    <span className="text-[10px] text-[#757788] block">Spread USD para BRL</span>
                  </div>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step1_point1_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step1_point1_desc')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#25F4EE]/20 text-[#25F4EE] shrink-0 mt-0.5">
                    <Compass className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step1_point2_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step1_point2_desc')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FE2C55]/20 text-[#FE2C55] shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step1_point3_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step1_point3_desc')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleActionClick(1)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#00b5ad] px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-[#25F4EE]/20 transition cursor-pointer"
                >
                  <span>{t('onboarding_step1_action')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Salvamento de Produtos & Offline */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[#FE2C55]/10 border border-[#FE2C55]/30 px-3 py-1 text-xs font-bold text-[#FE2C55]">
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{t('onboarding_step2_badge')}</span>
                </span>
                <span className="text-xs text-[#757788]">
                  {language === 'en' ? 'Step 2 of 3' : 'Passo 2 de 3'}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {t('onboarding_step2_title')}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#C5C6D0] leading-relaxed">
                  {t('onboarding_step2_desc')}
                </p>
              </div>

              {/* Visual Demonstration Card: Bookmark & Offline Cache */}
              <div className="rounded-xl border border-white/10 bg-[#07080D] p-3 sm:p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-32 bg-[#FE2C55]/10 blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs mb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <Database className="w-3.5 h-3.5 text-[#FE2C55]" />
                    <span className="text-white font-bold">BANCO LOCAL INDEXEDDB</span>
                  </div>
                  <span className="rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold">
                    OFFLINE FIRST
                  </span>
                </div>

                <div className="rounded-lg border border-slate-800 bg-[#121422] p-3 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 border border-white/10">
                      <Zap className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        Mini Projetor Portátil 4K Ultra
                      </p>
                      <p className="text-[11px] text-[#A6A7B2]">
                        Margem estimada: +240% • Lucro R$ 185
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#FE2C55]/20 border border-[#FE2C55]/40 px-2.5 py-1 text-xs font-bold text-[#FE2C55]">
                      <Bookmark className="w-3.5 h-3.5 fill-[#FE2C55]" />
                      <span>Salvo</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#FE2C55]/20 text-[#FE2C55] shrink-0 mt-0.5">
                    <Bookmark className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step2_point1_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step2_point1_desc')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-500/20 text-cyan-400 shrink-0 mt-0.5">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step2_point2_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step2_point2_desc')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <Layers className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step2_point3_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step2_point3_desc')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleActionClick(2)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#FE2C55] to-[#FF0050] px-4 py-2.5 text-xs font-bold text-white hover:brightness-110 shadow-lg shadow-[#FE2C55]/20 transition cursor-pointer"
                >
                  <span>{t('onboarding_step2_action')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Cálculo de Margem & Simulador */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 text-xs font-bold text-emerald-400">
                  <Calculator className="w-3.5 h-3.5" />
                  <span>{t('onboarding_step3_badge')}</span>
                </span>
                <span className="text-xs text-[#757788]">
                  {language === 'en' ? 'Step 3 of 3' : 'Passo 3 de 3'}
                </span>
              </div>

              <div>
                <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                  {t('onboarding_step3_title')}
                </h2>
                <p className="mt-1.5 text-xs sm:text-sm text-[#C5C6D0] leading-relaxed">
                  {t('onboarding_step3_desc')}
                </p>
              </div>

              {/* Visual Demonstration Card: Unit Economics Breakdown */}
              <div className="rounded-xl border border-white/10 bg-[#07080D] p-3 sm:p-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-48 h-32 bg-emerald-500/10 blur-3xl pointer-events-none" />
                <div className="flex items-center justify-between text-xs mb-3 font-mono">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400 font-bold">SIMULAÇÃO DE ECONOMIA UNITÁRIA</span>
                  </div>
                  <span className="text-[#757788]">Remessa Conforme + Dólar</span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#A6A7B2] block">Custo Fornecedor</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">$ 14.50 (USD)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#A6A7B2] block">Venda no Brasil</span>
                    <span className="text-xs font-bold text-[#25F4EE] mt-0.5 block">R$ 197.90 (BRL)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/10">
                    <span className="text-[10px] text-[#A6A7B2] block">ROAS Equilíbrio</span>
                    <span className="text-xs font-bold text-amber-400 mt-0.5 block">1.55x (TikTok)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40">
                    <span className="text-[10px] text-emerald-400 block font-bold">Lucro Líquido</span>
                    <span className="text-xs font-black text-emerald-300 mt-0.5 block">R$ 82.30 /un</span>
                  </div>
                </div>
              </div>

              {/* 3 Value Pillars */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-500/20 text-emerald-400 shrink-0 mt-0.5">
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step3_point1_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step3_point1_desc')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step3_point2_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step3_point2_desc')}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-[#12131C] p-3">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#25F4EE]/20 text-[#25F4EE] shrink-0 mt-0.5">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div className="text-xs">
                    <span className="font-bold text-white block text-[13px]">
                      {t('onboarding_step3_point3_title')}
                    </span>
                    <span className="text-[#A6A7B2] mt-0.5 block leading-relaxed">
                      {t('onboarding_step3_point3_desc')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Step Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => handleActionClick(3)}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:brightness-110 shadow-lg shadow-emerald-500/20 transition cursor-pointer"
                >
                  <Calculator className="w-4 h-4" />
                  <span>{t('onboarding_step3_action')}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-white/10 bg-[#090A10]/95 px-5 py-3.5 flex items-center justify-between gap-3">
          {/* Left: Skip Tour */}
          <button
            onClick={handleDismiss}
            className="text-xs text-[#8E91A6] hover:text-white transition cursor-pointer font-medium"
          >
            {t('onboarding_skip')}
          </button>

          {/* Center: Dot Indicators */}
          <div className="flex items-center gap-2">
            {[1, 2, 3].map((step) => (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === step
                    ? 'w-6 bg-gradient-to-r from-[#25F4EE] to-[#FE2C55]'
                    : 'w-2 bg-white/20 hover:bg-white/40'
                }`}
                aria-label={`Ir para passo ${step}`}
              />
            ))}
          </div>

          {/* Right: Previous & Next/Finish Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{t('onboarding_prev')}</span>
              </button>
            )}

            <button
              onClick={handleNext}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-1.5 text-xs font-bold transition shadow-md cursor-pointer ${
                currentStep === totalSteps
                  ? 'bg-gradient-to-r from-emerald-500 to-[#25F4EE] text-slate-950 hover:brightness-110'
                  : 'bg-white text-slate-950 hover:bg-slate-200'
              }`}
            >
              <span>{currentStep === totalSteps ? t('onboarding_finish') : t('onboarding_next')}</span>
              {currentStep === totalSteps ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
