import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Activity,
  Zap,
  Flame,
  TrendingUp,
  Bell,
  BellRing,
  ArrowRight,
  RefreshCw,
  Sliders,
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertOctagon,
  CheckCircle2,
  Filter,
} from 'lucide-react';
import {
  TrendingProduct,
  ProductNiche,
  TrendPulseReport,
  TrendPulseNicheAnalysis,
  PushNotificationSettings,
} from '../types';
import {
  analyzeTrendPulse,
  dispatchHighPriorityPulseNotification,
} from '../services/trendPulseService';
import { useTranslation } from '../i18n/LanguageContext';

interface TrendPulseSectionProps {
  products: TrendingProduct[];
  selectedNiche: ProductNiche;
  onSelectNiche: (niche: ProductNiche) => void;
  onSelectEarlyWaveTab?: () => void;
  pushSettings: PushNotificationSettings;
  onUpdatePushSettings: (partial: Partial<PushNotificationSettings>) => void;
  onOpenPushModal: () => void;
}

export const TrendPulseSection: React.FC<TrendPulseSectionProps> = ({
  products,
  selectedNiche,
  onSelectNiche,
  onSelectEarlyWaveTab,
  pushSettings,
  onUpdatePushSettings,
  onOpenPushModal,
}) => {
  const { language } = useTranslation();
  const [isScanning, setIsScanning] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [testSentSuccess, setTestSentSuccess] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  const sensitivity = pushSettings.pulseSensitivityThreshold ?? 40;

  // Run Trend Pulse analysis
  const report: TrendPulseReport = useMemo(() => {
    return analyzeTrendPulse(products, sensitivity);
  }, [products, sensitivity]);

  const handleScanNow = async () => {
    setIsScanning(true);
    setScanMessage(null);
    try {
      await new Promise((resolve) => setTimeout(resolve, 800)); // Visual radar sweep delay
      const updated = analyzeTrendPulse(products, sensitivity);
      const topSpike = updated.highestVelocityNiche;

      if (topSpike && topSpike.isSpike) {
        setScanMessage(
          language === 'en'
            ? `Spike detected in ${topSpike.nicheLabel} (+${topSpike.rateOfChangePercent}% volume)!`
            : `Pico detectado em ${topSpike.nicheLabel} (+${topSpike.rateOfChangePercent}% volume)!`
        );
        // Dispatch alert
        if (pushSettings.enabled) {
          await dispatchHighPriorityPulseNotification(topSpike, { force: true });
        }
      } else {
        setScanMessage(
          language === 'en'
            ? 'Pulse scan complete. Niches operating at steady volume.'
            : 'Varredura concluída. Nichos operando em velocidade constante.'
        );
      }
    } finally {
      setIsScanning(false);
      setTimeout(() => setScanMessage(null), 5000);
    }
  };

  const handleTestNotification = async (spike: TrendPulseNicheAnalysis) => {
    setTestSentSuccess(false);
    if (!pushSettings.enabled) {
      onOpenPushModal();
      return;
    }
    const sent = await dispatchHighPriorityPulseNotification(spike, { force: true });
    if (sent) {
      setTestSentSuccess(true);
      setTimeout(() => setTestSentSuccess(false), 4000);
    }
  };

  const handleFilterToSurgingNiche = (niche: ProductNiche) => {
    onSelectNiche(niche);
    if (onSelectEarlyWaveTab) {
      onSelectEarlyWaveTab();
    }
  };

  return (
    <div
      id="trend-pulse-container"
      className="mb-6 rounded-2xl border border-white/10 bg-[#0A0C14] overflow-hidden shadow-2xl transition-all"
    >
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 border-b border-white/10 bg-[#10121D]">
        <div className="flex items-center gap-3">
          {/* Animated ECG / Pulse Heartbeat Icon */}
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-[#25F4EE]/20 via-[#FE2C55]/20 to-[#25F4EE]/10 border border-white/10 flex items-center justify-center text-[#25F4EE] shadow-inner shrink-0">
            <Activity className="w-5 h-5 text-[#25F4EE] animate-pulse" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FE2C55] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#FE2C55]" />
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-white flex items-center gap-1.5">
                <span>{language === 'en' ? 'Trend Pulse™' : 'Trend Pulse™'}</span>
                <span className="text-[10px] font-bold text-[#A6A7B2] font-mono tracking-wider">
                  [EARLY WAVE SPIKE RADAR]
                </span>
              </h3>

              {report.activeSpikesCount > 0 ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/40 animate-pulse">
                  <Flame className="w-3 h-3" />
                  <span>
                    {report.activeSpikesCount}{' '}
                    {report.activeSpikesCount === 1
                      ? (language === 'en' ? 'SPIKE DETECTED' : 'PICO ATIVO')
                      : (language === 'en' ? 'SPIKES DETECTED' : 'PICOS ATIVOS')}
                  </span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{language === 'en' ? 'MONITORING' : 'MONITORANDO'}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-[#A6A7B2] mt-0.5">
              {language === 'en'
                ? 'Analyzes rate of change in early-stage products and dispatches high-priority push alerts on volume surges.'
                : 'Analisa a taxa de aceleração de produtos Early Wave e dispara push de alta prioridade em disparadas virais.'}
            </p>
          </div>
        </div>

        {/* Controls: Scan Button, Push Toggle & Sensitivity */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Scan Pulse Now Button */}
          <button
            id="trend-pulse-scan-btn"
            onClick={handleScanNow}
            disabled={isScanning}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm cursor-pointer ${
              isScanning
                ? 'border-white/10 bg-white/5 text-[#A6A7B2]'
                : 'border-[#25F4EE]/40 bg-[#25F4EE]/10 hover:bg-[#25F4EE]/20 text-[#25F4EE]'
            }`}
            title={language === 'en' ? 'Scan rate of change now' : 'Escanear taxa de variação agora'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin text-[#25F4EE]' : ''}`} />
            <span>{isScanning ? (language === 'en' ? 'Scanning...' : 'Escaneando...') : (language === 'en' ? 'Scan Pulse Now' : 'Varredura de Pulso')}</span>
          </button>

          {/* Push Alert Status Button */}
          <button
            onClick={onOpenPushModal}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
              pushSettings.enabled
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20'
                : 'border-white/10 bg-[#161826] text-[#A6A7B2] hover:text-white'
            }`}
            title={language === 'en' ? 'Configure Push Notification Settings' : 'Configurar Notificações Push'}
          >
            {pushSettings.enabled ? (
              <>
                <BellRing className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">{language === 'en' ? 'Push Active' : 'Push Ativo'}</span>
              </>
            ) : (
              <>
                <Bell className="w-3.5 h-3.5 text-gray-400" />
                <span className="hidden sm:inline">{language === 'en' ? 'Push Off' : 'Push Inativo'}</span>
              </>
            )}
          </button>

          {/* Toggle Expand / Collapse */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg border border-white/10 bg-[#161826] text-[#A6A7B2] hover:text-white transition cursor-pointer"
            title={isExpanded ? 'Recolher Trend Pulse' : 'Expandir Trend Pulse'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Feedback Banner if Scan or Test Triggered */}
      <AnimatePresence>
        {(scanMessage || testSentSuccess) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 py-2 text-xs font-semibold bg-gradient-to-r from-[#25F4EE]/15 to-[#FE2C55]/15 border-b border-white/10 text-white flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-[#25F4EE]" />
              <span>{scanMessage || (language === 'en' ? 'High-priority push alert triggered on device!' : 'Alerta push de alta prioridade disparado com sucesso no dispositivo!')}</span>
            </div>
            <button
              onClick={() => {
                setScanMessage(null);
                setTestSentSuccess(false);
              }}
              className="text-white/60 hover:text-white text-xs font-mono"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Collapsible Body */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Real-time Rate of Change Seismic Monitor Visualizer */}
            <div className="p-4 sm:p-5 bg-radial from-[#131626] via-[#0D0F18] to-[#07080E] border-b border-white/10">
              
              {/* Velocity Indicators Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider text-white">
                  <Zap className="w-4 h-4 text-[#25F4EE]" />
                  <span>
                    {language === 'en'
                      ? 'Niche Velocity & Acceleration Tracker'
                      : 'Aceleração e Velocidade por Nicho'}
                  </span>
                  <span className="rounded bg-black/50 px-2 py-0.5 text-[10px] font-mono text-[#A6A7B2]">
                    Sensibilidade: +{sensitivity}%
                  </span>
                </div>

                {/* Sensitivity Selector */}
                <div className="flex items-center gap-1 text-[10px]">
                  <span className="text-[#A6A7B2] mr-1 hidden sm:inline">
                    {language === 'en' ? 'Trigger Threshold:' : 'Gatilho de Disparo:'}
                  </span>
                  {[
                    { label: '+30% (Alto)', val: 30 },
                    { label: '+45% (Padrão)', val: 45 },
                    { label: '+60% (Crítico)', val: 60 },
                  ].map((thresh) => (
                    <button
                      key={thresh.val}
                      onClick={() => onUpdatePushSettings({ pulseSensitivityThreshold: thresh.val })}
                      className={`px-2 py-0.8 rounded-lg font-bold transition cursor-pointer ${
                        sensitivity === thresh.val
                          ? 'bg-[#FE2C55] text-white'
                          : 'bg-[#161826] text-[#A6A7B2] hover:text-white border border-white/5'
                      }`}
                    >
                      {thresh.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Niche Pulse Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {report.allNiches.slice(0, 4).map((nicheItem) => {
                  const isSurging = nicheItem.isSpike;
                  const isSelected = selectedNiche === nicheItem.niche;

                  return (
                    <div
                      key={nicheItem.niche}
                      className={`relative rounded-xl border p-3.5 transition flex flex-col justify-between ${
                        isSurging
                          ? 'border-[#FE2C55]/60 bg-gradient-to-b from-[#FE2C55]/15 to-[#121422] shadow-lg shadow-[#FE2C55]/10 ring-1 ring-[#FE2C55]/30'
                          : 'border-white/10 bg-[#121422] hover:border-white/20'
                      }`}
                    >
                      {/* Top Row: Niche Icon, Title & Pulse Badge */}
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{nicheItem.nicheIcon}</span>
                            <div>
                              <strong className="text-white text-xs font-bold block leading-tight">
                                {nicheItem.nicheLabel}
                              </strong>
                              <span className="text-[10px] text-[#A6A7B2]">
                                {nicheItem.earlyWaveCount} {language === 'en' ? 'early wave items' : 'produtos Early Wave'}
                              </span>
                            </div>
                          </div>

                          {isSurging ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#FE2C55] text-white px-2 py-0.5 text-[10px] font-black animate-pulse">
                              <Flame className="w-2.5 h-2.5" />
                              <span>+{nicheItem.rateOfChangePercent}%</span>
                            </span>
                          ) : (
                            <span className="rounded-full bg-white/10 text-white/80 px-2 py-0.5 text-[10px] font-mono">
                              +{nicheItem.rateOfChangePercent}%
                            </span>
                          )}
                        </div>

                        {/* Momentum Velocity Meter */}
                        <div className="my-2.5">
                          <div className="flex items-center justify-between text-[10px] text-[#A6A7B2] mb-1">
                            <span>{language === 'en' ? 'Pulse Velocity' : 'Velocidade de Pulso'}</span>
                            <span
                              className={`font-mono font-bold ${
                                isSurging ? 'text-[#FE2C55]' : 'text-[#25F4EE]'
                              }`}
                            >
                              {nicheItem.velocityScore}/100
                            </span>
                          </div>
                          <div className="h-1.5 w-full rounded-full bg-black/50 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                isSurging
                                  ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF0050]'
                                  : 'bg-gradient-to-r from-[#25F4EE] to-[#10B981]'
                              }`}
                              style={{ width: `${nicheItem.velocityScore}%` }}
                            />
                          </div>
                        </div>

                        {/* Surging Product Sneak Peek */}
                        {nicheItem.topProduct && (
                          <div className="bg-black/40 rounded-lg p-2 border border-white/5 text-[11px] mb-2.5">
                            <span className="text-[#A6A7B2] text-[9px] block uppercase font-bold tracking-wider">
                              {language === 'en' ? 'Fastest Rising:' : 'Maior Aceleração:'}
                            </span>
                            <span className="text-white font-medium line-clamp-1">
                              {nicheItem.topProduct.name}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Action Row */}
                      <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                        <button
                          onClick={() => handleFilterToSurgingNiche(nicheItem.niche)}
                          className={`flex-1 py-1 px-2 rounded-lg text-[11px] font-bold transition flex items-center justify-center gap-1 cursor-pointer ${
                            isSelected
                              ? 'bg-white text-black font-black'
                              : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                          }`}
                        >
                          <span>{isSelected ? (language === 'en' ? 'Selected' : 'Selecionado') : (language === 'en' ? 'Filter Radar' : 'Filtrar Radar')}</span>
                          <ArrowRight className="w-3 h-3 text-[#25F4EE]" />
                        </button>

                        {/* Test Notification for this Niche */}
                        <button
                          onClick={() => handleTestNotification(nicheItem)}
                          className="p-1 rounded-lg border border-white/10 bg-white/5 hover:bg-[#FE2C55]/20 text-[#A6A7B2] hover:text-[#FE2C55] transition cursor-pointer"
                          title={language === 'en' ? 'Send test high-priority push alert for this niche' : 'Disparar push de teste de alta prioridade deste nicho'}
                        >
                          <BellRing className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Bottom Quick Alert Info Footer */}
            <div className="p-3 bg-[#08090F] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[#A6A7B2]">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#25F4EE] animate-ping" />
                <span>
                  {language === 'en'
                    ? 'Automated background worker monitors catalog every time new products enter the early wave.'
                    : 'Monitoramento automático em segundo plano analisa o catálogo sempre que novos itens entram na fase Early Wave.'}
                </span>
              </div>

              <div className="flex items-center gap-3 font-semibold">
                <button
                  onClick={onOpenPushModal}
                  className="text-[#25F4EE] hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sliders className="w-3 h-3" />
                  <span>{language === 'en' ? 'Configure Push Triggers' : 'Configurar Gatilhos de Push'}</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
