import React from 'react';
import { X, CheckCircle2, ShieldCheck, Sparkles, Zap, KeyRound, ExternalLink, Cpu } from 'lucide-react';

interface FreeTierInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function FreeTierInfoModal({ isOpen, onClose }: FreeTierInfoModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-xl rounded-2xl bg-[#0F111A] border border-white/10 shadow-2xl p-6 overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-white flex items-center gap-2">
                <span>API 100% Gratuita Permanente</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  R$ 0,00 / Sem Cartão
                </span>
              </h3>
              <p className="text-xs text-[#8E91A6]">
                O TIKBLOX foi arquitetado para nunca cobrar mensalidades ou exigir cartões.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E91A6] hover:text-white hover:bg-white/5 transition"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="py-4 space-y-4 overflow-y-auto pr-1 text-xs">
          {/* Banner de Garantia */}
          <div className="p-3.5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-white text-sm">Garantia de Custo Zero Perpétuo</div>
              <div className="text-[#8E91A6] mt-0.5 leading-relaxed">
                Todas as integrações do TIKBLOX utilizam planos gratuitos permanentes oficiais ou processamento algorítmico local autônomo. Você nunca terá cobranças surpresa.
              </div>
            </div>
          </div>

          {/* Opções Gratuitas Disponíveis */}
          <div className="space-y-2.5">
            <div className="text-xs font-black uppercase tracking-wider text-[#7E8299]">
              3 Modos 100% Gratuitos Suportados
            </div>

            {/* Opção 1: Motor Autônomo Local */}
            <div className="p-3.5 rounded-xl bg-[#161823] border border-white/5 hover:border-[#25F4EE]/30 transition">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Cpu className="w-4 h-4 text-[#25F4EE]" />
                  <span>1. Motor Autônomo Local (Sem Chave)</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  Padrão Ativo
                </span>
              </div>
              <p className="text-[#8E91A6] leading-relaxed">
                Funciona imediatamente sem precisar criar conta nem configurar chaves. O radar calcula margens, impostos no Brasil e roteiros virais usando algoritmos nativos.
              </p>
            </div>

            {/* Opção 2: Gemini 2.5 Flash Free Tier */}
            <div className="p-3.5 rounded-xl bg-[#161823] border border-white/5 hover:border-[#25F4EE]/30 transition">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Sparkles className="w-4 h-4 text-[#FE2C55]" />
                  <span>2. Google Gemini 2.5 Flash (Free Tier)</span>
                </div>
                <span className="text-[10px] font-bold text-[#FE2C55] bg-[#FE2C55]/10 px-2 py-0.5 rounded">
                  15 req/min Grátis
                </span>
              </div>
              <p className="text-[#8E91A6] leading-relaxed mb-2">
                Plano gratuito permanente do Google com busca web em tempo real. Não pede cartão de crédito.
              </p>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[#25F4EE] hover:underline font-semibold text-[11px]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Obter Chave Gratuita no Google AI Studio
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Opção 3: Groq Cloud Llama 3.3 Free Tier */}
            <div className="p-3.5 rounded-xl bg-[#161823] border border-white/5 hover:border-[#25F4EE]/30 transition">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2 font-bold text-white">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <span>3. Groq Cloud (Llama 3.3 70B Free Tier)</span>
                </div>
                <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                  Ultra Rápido
                </span>
              </div>
              <p className="text-[#8E91A6] leading-relaxed mb-2">
                Modelo open-source rodando em servidores LPUs de alta velocidade. 100% gratuito sem cartão.
              </p>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-amber-400 hover:underline font-semibold text-[11px]"
              >
                <KeyRound className="w-3.5 h-3.5" />
                Obter Chave Gratuita no Groq Console
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-white/10 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-black bg-white/10 hover:bg-white/15 text-white transition active:scale-95 cursor-pointer"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
}
