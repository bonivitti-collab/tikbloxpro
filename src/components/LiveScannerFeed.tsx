import React, { useEffect, useState } from 'react';
import { Radio, CheckCircle, Sparkles, X, Globe, ShieldAlert } from 'lucide-react';

interface LiveScannerFeedProps {
  isOpen: boolean;
  onClose: () => void;
  onFinish: () => void;
  scannedCount: number;
}

const SCAN_STEPS = [
  '🧠 Olá! Sou a IA do Gemini. Iniciando uma análise estratégica para você...',
  '📡 Conectando aos nós globais de telemetria e processando tendências em tempo real...',
  '🇺🇸 Minerando feeds virais do TikTok Shop US e Amazon Movers & Shakers...',
  '🇨🇳 Varrendo lançamentos na Ásia e catálogos de fábricas parceiras...',
  '🇧🇷 Cruzando o índice de saturação na Shopee e Mercado Livre Brasil...',
  '💰 Computando o spread de preço internacional x preço de venda sugerido...',
  '⚡ Validação concluída! Preparei as melhores oportunidades para você.'
];

export const LiveScannerFeed: React.FC<LiveScannerFeedProps> = ({
  isOpen,
  onClose,
  onFinish,
  scannedCount,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      setIsCompleted(false);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < SCAN_STEPS.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setIsCompleted(true);
          return prev;
        }
      });
    }, 1200); // slightly slower to read the text

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg rounded-2xl border border-cyan-500/40 bg-slate-950 p-6 shadow-2xl text-slate-100 overflow-hidden">
        
        {/* Animated Radar Sweep Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 border border-cyan-500/40">
              <Sparkles className="h-5 w-5 text-cyan-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>Inteligência Artificial Gemini</span>
              </h3>
              <p className="text-xs text-cyan-400">Processamento em Tempo Real</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Radar Terminal Log */}
        <div className="space-y-3 rounded-xl bg-slate-900/90 border border-slate-800/80 p-4 font-mono text-xs mb-5">
          {SCAN_STEPS.slice(0, currentStepIndex + 1).map((step, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-2 ${
                idx === currentStepIndex && !isCompleted
                  ? 'text-cyan-300 font-semibold animate-pulse'
                  : 'text-slate-300'
              }`}
            >
              <span className="text-cyan-500 mt-0.5">❯</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-800 rounded-full h-2 mb-5 overflow-hidden">
          <div
            className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full transition-all duration-700 ease-out"
            style={{ width: `${((currentStepIndex + 1) / SCAN_STEPS.length) * 100}%` }}
          />
        </div>

        {/* Completion Message */}
        {isCompleted ? (
          <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-4 text-center">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">
              Varredura Finalizada com Sucesso!
            </h4>
            <p className="text-xs text-slate-300 mt-1">
              O radar identificou novas oportunidades com alto spread de lucro e baixa concorrência no Brasil.
            </p>
            <button
              onClick={() => {
                onFinish();
                onClose();
              }}
              className="mt-4 w-full rounded-xl bg-gradient-to-r from-cyan-500 to-emerald-400 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:opacity-90"
            >
              Explorar Produtos Descobertos
            </button>
          </div>
        ) : (
          <div className="text-center text-xs text-slate-500 italic">
            Conectando com Google Search e feeds internacionais de produtos virais...
          </div>
        )}

      </div>
    </div>
  );
};
