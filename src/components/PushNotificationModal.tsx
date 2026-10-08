import React, { useState } from 'react';
import {
  Bell,
  BellOff,
  BellRing,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Sliders,
  Volume2,
  VolumeX,
  Radio,
  ExternalLink,
  X,
  Flame,
  ShieldCheck,
} from 'lucide-react';
import { PushNotificationSettings, PushAlertLog, TrendingProduct } from '../types';

interface PushNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  permission: NotificationPermission | 'unsupported';
  settings: PushNotificationSettings;
  onUpdateSettings: (partial: Partial<PushNotificationSettings>) => void;
  onEnable: () => Promise<boolean>;
  onDisable: () => void;
  onSendTest: () => Promise<boolean>;
  alertHistory: PushAlertLog[];
  onSelectProductById?: (productId: string) => void;
  sampleProduct?: TrendingProduct;
}

export const PushNotificationModal: React.FC<PushNotificationModalProps> = ({
  isOpen,
  onClose,
  permission,
  settings,
  onUpdateSettings,
  onEnable,
  onDisable,
  onSendTest,
  alertHistory,
  onSelectProductById,
  sampleProduct,
}) => {
  const [testSent, setTestSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const isGranted = permission === 'granted' && settings.enabled;
  const isDenied = permission === 'denied';
  const isDefault = permission === 'default' || (permission === 'granted' && !settings.enabled);

  const handleToggleActive = async () => {
    setIsLoading(true);
    try {
      if (isGranted) {
        onDisable();
      } else {
        await onEnable();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestClick = async () => {
    setTestSent(false);
    setIsLoading(true);
    try {
      const ok = await onSendTest();
      if (ok) {
        setTestSent(true);
        setTimeout(() => setTestSent(false), 4000);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-3xl border border-white/15 bg-[#0C0E17] p-5 sm:p-7 shadow-2xl text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white transition cursor-pointer"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="relative flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#25F4EE]/20 to-[#FE2C55]/20 border border-white/15 shadow-inner">
            <BellRing className="w-6 h-6 text-[#25F4EE] animate-pulse" />
            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-[#FE2C55] border-2 border-[#0C0E17]" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2">
              <span>Radar Push PWA</span>
              <span className="px-2 py-0.5 rounded-full bg-[#25F4EE]/10 border border-[#25F4EE]/30 text-[#25F4EE] text-[10px] font-extrabold uppercase tracking-wider">
                Tempo Real
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-[#8E91A6]">
              Alertas instantâneos no seu dispositivo quando novos produtos virais explodirem nos EUA e China.
            </p>
          </div>
        </div>

        {/* Status Card Banner */}
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isGranted
              ? 'bg-emerald-950/25 border-emerald-500/40 text-emerald-300'
              : isDenied
              ? 'bg-rose-950/25 border-rose-500/40 text-rose-300'
              : 'bg-amber-950/25 border-amber-500/40 text-amber-300'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              {isGranted ? (
                <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0 mt-0.5" />
              ) : isDenied ? (
                <AlertTriangle className="w-6 h-6 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <Radio className="w-6 h-6 text-amber-400 shrink-0 mt-0.5 animate-pulse" />
              )}
              <div>
                <h4 className="font-black text-sm sm:text-base text-white">
                  {isGranted
                    ? 'Radar Push Ativado com Sucesso'
                    : isDenied
                    ? 'Permissão Bloqueada no Navegador'
                    : 'Alertas em Espera (Permissão Pendente)'}
                </h4>
                <p className="text-xs text-white/75 mt-0.5 leading-relaxed">
                  {isGranted
                    ? 'Seu PWA está pronto para emitir notificações no sistema operacional (mesmo com o app minimizado).'
                    : isDenied
                    ? 'Você bloqueou as notificações deste site. Clique no cadeado 🔒 na barra de endereço do navegador e mude para "Permitir".'
                    : 'Ative para ser alertado sobre as ondas virais de produtos antes da saturação no Brasil.'}
                </p>
              </div>
            </div>

            {/* Main Toggle Button */}
            {!isDenied && (
              <button
                onClick={handleToggleActive}
                disabled={isLoading}
                className={`px-4 py-2 rounded-xl text-xs font-black shadow-lg transition active:scale-95 shrink-0 flex items-center justify-center gap-1.5 cursor-pointer ${
                  isGranted
                    ? 'bg-white/10 hover:bg-white/15 text-white/90 border border-white/15'
                    : 'bg-gradient-to-r from-[#25F4EE] to-[#00CED1] hover:from-[#4BF6F1] hover:to-[#25F4EE] text-[#141722] shadow-[#25F4EE]/20'
                }`}
              >
                {isGranted ? (
                  <>
                    <BellOff className="w-4 h-4 text-[#FE2C55]" />
                    <span>Desativar</span>
                  </>
                ) : (
                  <>
                    <Bell className="w-4 h-4 text-[#141722]" />
                    <span>Ativar Alertas Push</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Quick Action: Test Button */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#141724] border border-white/10">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#25F4EE]" />
            <span className="text-xs font-bold text-white">Testar no seu sistema:</span>
            <span className="text-xs text-[#8E91A6]">
              Dispara uma notificação nativa de teste com som e vibração.
            </span>
          </div>
          <button
            onClick={handleTestClick}
            disabled={isLoading || isDenied}
            className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 active:scale-95 text-white text-xs font-bold transition flex items-center gap-1.5 border border-white/15 cursor-pointer disabled:opacity-50"
          >
            <BellRing className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span>Disparar Notificação Teste</span>
          </button>
        </div>

        {testSent && (
          <div className="mt-2.5 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Notificação de teste disparada! Verifique a central de notificações do seu aparelho/PC.</span>
          </div>
        )}

        {/* Advanced settings removed to keep UI simple and focused */}

        {/* History of triggered alerts */}
        {alertHistory.length > 0 && (
          <div className="mt-5">
            <div className="text-xs font-black uppercase tracking-wider text-[#8E91A6] mb-2 flex items-center justify-between">
              <span>Histórico de Alertas Recentes ({alertHistory.length})</span>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {alertHistory.slice(0, 5).map((log) => (
                <div
                  key={log.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#121422] border border-white/5 text-xs hover:border-[#25F4EE]/30 transition"
                >
                  <div className="flex items-center gap-2 truncate">
                    {log.alertType === 'trend_pulse_spike' ? (
                      <span className="px-1.5 py-0.2 rounded bg-[#FE2C55]/20 text-[#FE2C55] border border-[#FE2C55]/30 text-[9px] font-black shrink-0">
                        ⚡ TREND PULSE
                      </span>
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" />
                    )}
                    <span className="font-bold text-white truncate">{log.productName}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {log.rateOfChangePercent ? (
                      <span className="text-[11px] font-extrabold text-[#FE2C55]">
                        +{log.rateOfChangePercent}% vel
                      </span>
                    ) : (
                      <span className="text-[11px] font-extrabold text-[#25F4EE]">
                        +{log.profitMarginPercent}%
                      </span>
                    )}
                    {onSelectProductById && log.productId && !log.productId.startsWith('pulse-') && (
                      <button
                        onClick={() => {
                          onSelectProductById(log.productId);
                          onClose();
                        }}
                        className="text-[11px] text-white/70 hover:text-white underline flex items-center gap-1 cursor-pointer"
                      >
                        <span>Abrir</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-6 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-[#707286]">
          <span>TIKBLOX PWA Web Push • 100% Nativo</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold transition cursor-pointer"
          >
            Concluir
          </button>
        </div>

      </div>
    </div>
  );
};
