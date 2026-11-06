import React from 'react';
import { Calculator } from 'lucide-react';
import { REFUND_7_DAYS } from '../../copy/guarantee';

interface ProfitSimulatorProps {
  onSelectPlan: () => void;
}

export const ProfitSimulator: React.FC<ProfitSimulatorProps> = ({ onSelectPlan }) => {
  return (
    <section id="simulador" className="py-16 sm:py-24 px-4 sm:px-6 relative bg-gradient-to-b from-[#090D16] via-[#0D1220] to-[#090D16] border-t border-white/5">
      <div className="max-w-3xl mx-auto space-y-6 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#25F4EE]/10 border border-[#25F4EE]/30 text-xs font-bold text-[#25F4EE]">
          <Calculator className="w-3.5 h-3.5" />
          <span>Conta dentro do produto</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
          O equilíbrio usa o preço que você vê
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          No Raio-X, a calculadora começa no menor preço da faixa coletada. Você pode trocar pelo valor que está na tela do TikTok naquele momento. Comissão e vendas para cobrir o preço acompanham esse valor. O TikBlox não estima quantas views um vídeo vai ter.
        </p>
        <button
          type="button"
          onClick={onSelectPlan}
          className="px-6 py-3 rounded-xl bg-[#25F4EE] text-[#090D16] font-black text-xs uppercase tracking-wider cursor-pointer"
        >
          Ver o plano
        </button>
        <p className="text-[11px] text-slate-400">{REFUND_7_DAYS}</p>
      </div>
    </section>
  );
};
