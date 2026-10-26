// src/components/LandingPage/ProfitSimulator.tsx
// Simulador Interativo de Lucro Líquido e Break-Even para Afiliados do TikTok Shop

import React, { useState } from 'react';
import { Calculator, Sparkles, TrendingUp, DollarSign, Target, ArrowRight, ShieldCheck } from 'lucide-react';

interface ProfitSimulatorProps {
  onSelectPlan: () => void;
}

export const ProfitSimulator: React.FC<ProfitSimulatorProps> = ({ onSelectPlan }) => {
  const [videosPerWeek, setVideosPerWeek] = useState<number>(7);
  const [salesPerVideo, setSalesPerVideo] = useState<number>(8);
  const [avgCommission, setAvgCommission] = useState<number>(18);

  // Cálculos dinâmicos em tempo real
  const monthlyVideos = videosPerWeek * 4;
  const totalSalesMonthly = monthlyVideos * salesPerVideo;
  const grossCommissions = totalSalesMonthly * avgCommission;
  const subscriptionCost = 37;
  const netProfitMonthly = Math.max(0, grossCommissions - subscriptionCost);
  const salesToBreakEven = Math.max(1, Math.ceil(subscriptionCost / avgCommission));
  const roiMultiplier = grossCommissions > 0 ? (grossCommissions / subscriptionCost).toFixed(0) : '0';

  return (
    <section id="simulador" className="py-16 sm:py-24 px-4 sm:px-6 relative bg-gradient-to-b from-[#090D16] via-[#0D1220] to-[#090D16] border-t border-white/5">
      {/* Luz ambiente de fundo */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-[#25F4EE]/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-10 relative z-10">
        
        {/* Título da Seção */}
        <div className="text-center space-y-3 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25F4EE]/10 border border-[#25F4EE]/30 text-xs font-bold text-[#25F4EE]">
            <Calculator className="w-3.5 h-3.5" />
            <span>Simulador Interativo de Faturamento</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Quanto Você Pode Faturar com o <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-[#25F4EE] via-[#00D2C4] to-[#25F4EE] bg-clip-text text-transparent">
              Método TikBlox Oceano Azul?
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-300">
            Ajuste os controles abaixo e veja na prática por que você só precisa de <strong>pouquíssimas vendas</strong> para ter lucro líquido no bolso:
          </p>
        </div>

        {/* Card do Simulador */}
        <div className="rounded-3xl bg-[#0F1424]/90 border border-white/10 p-6 sm:p-10 shadow-2xl backdrop-blur-md grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Controles (Sliders) - 7 colunas */}
          <div className="lg:col-span-7 space-y-7">
            
            {/* Controle 1: Vídeos por Semana */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span>Vídeos postados por semana:</span>
                </label>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-white font-mono font-black text-xs sm:text-sm border border-white/10">
                  {videosPerWeek} vídeos / semana
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="21"
                step="1"
                value={videosPerWeek}
                onChange={(e) => setVideosPerWeek(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#25F4EE]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 vídeo (iniciante)</span>
                <span>7 vídeos (1/dia)</span>
                <span>21 vídeos (foco total)</span>
              </div>
            </div>

            {/* Controle 2: Vendas por Vídeo */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span>Média conservadora de vendas por vídeo:</span>
                </label>
                <span className="px-2.5 py-1 rounded-lg bg-white/10 text-[#25F4EE] font-mono font-black text-xs sm:text-sm border border-[#25F4EE]/30">
                  {salesPerVideo} vendas / vídeo
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="30"
                step="1"
                value={salesPerVideo}
                onChange={(e) => setSalesPerVideo(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#25F4EE]"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>1 venda (mínimo)</span>
                <span>8 vendas (média radar)</span>
                <span>30 vendas (viral)</span>
              </div>
            </div>

            {/* Controle 3: Comissão em R$ */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span>Comissão líquida por produto vendido:</span>
                </label>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 font-mono font-black text-xs sm:text-sm border border-emerald-500/30">
                  R$ {avgCommission.toFixed(2)} / venda
                </span>
              </div>
              <input
                type="range"
                min="8"
                max="40"
                step="1"
                value={avgCommission}
                onChange={(e) => setAvgCommission(Number(e.target.value))}
                className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>R$ 8 (itens leves)</span>
                <span>R$ 18 (média catálogo)</span>
                <span>R$ 40 (eletrônicos/gadgets)</span>
              </div>
            </div>

            {/* Dica Estratégica */}
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 flex items-start gap-3 text-xs text-slate-300">
              <Target className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Matemática da Arbitragem:</strong> No TikTok Shop, um único vídeo que atinge 15.000 visualizações orgânicas costuma gerar entre <strong>25 e 60 vendas</strong> no carrinho amarelo.
              </p>
            </div>

          </div>

          {/* Resultado Projetado - 5 colunas */}
          <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-[#151D33] to-[#0A0E1A] p-6 sm:p-8 border-2 border-[#25F4EE]/50 shadow-[0_0_35px_rgba(37,244,238,0.15)] flex flex-col justify-between space-y-6 text-center relative overflow-hidden">
            
            <div className="space-y-3">
              <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#25F4EE] block">
                Comissões Mensais Projetadas
              </span>

              <div className="flex items-center justify-center gap-1 font-mono">
                <span className="text-xl font-bold text-slate-400">R$</span>
                <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                  {grossCommissions.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>{totalSalesMonthly} vendas estimadas no mês</span>
              </div>
            </div>

            {/* Quadro de Break-Even / Ponto Zero */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-2 text-left">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Ponto de Equilíbrio:</span>
                <span className="font-mono font-black text-emerald-400">
                  {salesToBreakEven} {salesToBreakEven === 1 ? 'venda' : 'vendas'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Assinatura TikBlox:</span>
                <span className="font-mono font-bold text-slate-300">R$ 37,00/mês</span>
              </div>
              <div className="flex items-center justify-between text-xs border-t border-white/10 pt-2">
                <span className="text-slate-200 font-bold">Retorno s/ Assinatura:</span>
                <span className="font-mono font-black text-[#25F4EE]">
                  {roiMultiplier}x o valor investido
                </span>
              </div>
            </div>

            {/* CTA do Simulador */}
            <button
              onClick={onSelectPlan}
              className="w-full py-4 px-4 rounded-xl bg-gradient-to-r from-[#25F4EE] via-[#00D2C4] to-[#25F4EE] hover:brightness-110 text-[#090D16] font-black text-xs uppercase tracking-wider transition cursor-pointer shadow-[0_6px_25px_rgba(37,244,238,0.4)] active:scale-95 flex items-center justify-center gap-2 group"
            >
              <span>Quero Começar com Esse Retorno</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <span className="text-[10px] text-slate-400">
              ⚡ Garantia de 7 dias incondicional pela Kiwify
            </span>

          </div>

        </div>

      </div>
    </section>
  );
};
