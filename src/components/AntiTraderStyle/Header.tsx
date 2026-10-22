import React from 'react';
import {
  PanelLeft,
  PanelRight,
  RefreshCw,
  Bookmark,
  Sparkles,
  ShoppingBag,
  SlidersHorizontal,
  Bot
} from 'lucide-react';

interface HeaderProps {
  onScanTrends: () => void;
  isScanning: boolean;
  savedCount: number;
  onOpenSaved: () => void;
  painelEsquerdoRecolhido: boolean;
  setPainelEsquerdoRecolhido: (val: boolean) => void;
  painelDireitoRecolhido: boolean;
  setPainelDireitoRecolhido: (val: boolean) => void;
  onOpenCalculator: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onScanTrends,
  isScanning,
  savedCount,
  onOpenSaved,
  painelEsquerdoRecolhido,
  setPainelEsquerdoRecolhido,
  painelDireitoRecolhido,
  setPainelDireitoRecolhido,
  onOpenCalculator,
}) => {
  return (
    <header className="bg-white border-b border-slate-300 px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 gap-2 min-h-[48px] select-none">
      {/* Logo TikBlox com Estilo Limpo AntiTrader */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="flex items-center gap-2 bg-[#0f172a] hover:bg-slate-900 transition-colors text-white px-2.5 py-1 rounded-lg border border-slate-800 shadow-xs cursor-default">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-[#FE2C55] via-purple-500 to-[#25F4EE] flex items-center justify-center text-white font-black text-xs">
            ⚡
          </div>
          <div className="flex items-baseline gap-1.5 leading-none">
            <span className="font-black text-sm tracking-tight text-white">TikBlox</span>
            <span className="hidden md:inline text-[9px] font-bold text-emerald-400 uppercase tracking-wider">
              TikTok Shop Brasil
            </span>
          </div>
        </div>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Estoque Nacional</span>
        </span>
      </div>

      {/* Ações Centrais / Direitas */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Botão de Varredura / Atualização */}
        <button
          onClick={onScanTrends}
          disabled={isScanning}
          className="flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 hover:text-blue-700 hover:border-blue-400 transition-colors cursor-pointer shadow-2xs active:scale-95"
          title="Buscar novas tendências validadas com pronta entrega no Brasil"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-blue-600 ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isScanning ? 'Varrendo...' : 'Escanear Tendências'}</span>
        </button>

        {/* Botão de Salvos */}
        <button
          onClick={onOpenSaved}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs active:scale-95"
          title="Ver produtos salvos"
        >
          <Bookmark className="w-3.5 h-3.5 text-amber-500" />
          <span className="hidden sm:inline">Salvos:</span>
          <span className="font-mono text-xs font-bold text-slate-900">{savedCount}</span>
        </button>

        {/* Botão Simulador de Lucro / Calculadora */}
        <button
          onClick={onOpenCalculator}
          className="hidden md:flex items-center gap-1 px-2 py-1 rounded-md border border-slate-300 bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors cursor-pointer shadow-2xs"
          title="Simulador de Margem & Taxas de Envio"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
          <span>Calculadora</span>
        </button>

        {/* Toggles de Painéis no Desktop (Estilo AntiTrader) */}
        <div className="hidden lg:flex items-center gap-1 border-l border-slate-300 pl-2 ml-1">
          <button
            type="button"
            onClick={() => setPainelEsquerdoRecolhido(!painelEsquerdoRecolhido)}
            className={`p-1 px-1.5 rounded-md border text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              painelEsquerdoRecolhido
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title={painelEsquerdoRecolhido ? 'Expandir Lista de Produtos' : 'Recolher Lista de Produtos para focar no Raio-X'}
          >
            <PanelLeft className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] hidden xl:inline">Produtos</span>
          </button>

          <button
            type="button"
            onClick={() => setPainelDireitoRecolhido(!painelDireitoRecolhido)}
            className={`p-1 px-1.5 rounded-md border text-[11px] font-bold transition-colors cursor-pointer flex items-center gap-1 ${
              painelDireitoRecolhido
                ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-200'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
            title={painelDireitoRecolhido ? 'Expandir Copiloto IA' : 'Recolher Copiloto IA para focar no Raio-X'}
          >
            <PanelRight className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-[10px] hidden xl:inline">Copiloto IA</span>
          </button>
        </div>
      </div>
    </header>
  );
};
