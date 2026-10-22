import React from 'react';
import {
  PanelLeft,
  PanelRight,
  RefreshCw,
  Bookmark,
  SlidersHorizontal,
} from 'lucide-react';
import { TikBloxLogo } from '../TikBloxLogo';

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
    <header className="bg-[#1e2433] border-b border-slate-700/60 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 z-20 gap-2 min-h-[52px] select-none text-white shadow-xs">
      {/* 1. Logo Oficial TikBlox */}
      <div className="flex items-center gap-3 shrink-0">
        <TikBloxLogo size="sm" showBadge={true} animate={false} />

        <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span>Pronta Entrega no Brasil</span>
        </span>
      </div>

      {/* 2. Ações Centrais / Direitas */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Botão de Varredura / Atualização */}
        <button
          onClick={onScanTrends}
          disabled={isScanning}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-xs font-bold text-white hover:text-[#25F4EE] hover:border-[#25F4EE]/40 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-50"
          title="Buscar novas tendências validadas no TikTok Shop Brasil"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#25F4EE] ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isScanning ? 'Varrendo...' : 'Escanear Tendências'}</span>
        </button>

        {/* Botão de Salvos */}
        <button
          onClick={onOpenSaved}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-200 hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
          title="Ver produtos salvos"
        >
          <Bookmark className="w-3.5 h-3.5 text-[#FE2C55]" />
          <span className="hidden sm:inline">Salvos:</span>
          <span className="font-mono text-xs font-bold text-white bg-white/10 px-1.5 py-0.2 rounded">
            {savedCount}
          </span>
        </button>

        {/* Botão Simulador de Lucro / Calculadora */}
        <button
          onClick={onOpenCalculator}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-xs font-semibold text-slate-300 hover:text-white transition-all cursor-pointer shadow-xs"
          title="Simulador de Margem & Taxas de Envio"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#25F4EE]" />
          <span>Calculadora</span>
        </button>

        {/* Toggles de Painéis no Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 border-l border-slate-700 pl-2.5 ml-1">
          <button
            type="button"
            onClick={() => setPainelEsquerdoRecolhido(!painelEsquerdoRecolhido)}
            className={`p-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              painelEsquerdoRecolhido
                ? 'bg-[#25F4EE]/15 text-[#25F4EE] border-[#25F4EE]/40 shadow-[0_0_12px_rgba(37,244,238,0.2)]'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={painelEsquerdoRecolhido ? 'Expandir Lista de Produtos' : 'Recolher Lista de Produtos para focar no Raio-X'}
          >
            <PanelLeft className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span className="text-[10px] hidden xl:inline">Lista</span>
          </button>

          <button
            type="button"
            onClick={() => setPainelDireitoRecolhido(!painelDireitoRecolhido)}
            className={`p-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              painelDireitoRecolhido
                ? 'bg-[#FE2C55]/15 text-[#FE2C55] border-[#FE2C55]/40 shadow-[0_0_12px_rgba(254,44,85,0.2)]'
                : 'bg-slate-800/90 text-slate-300 border-slate-700 hover:bg-slate-700 hover:text-white'
            }`}
            title={painelDireitoRecolhido ? 'Expandir Copiloto IA' : 'Recolher Copiloto IA para focar no Raio-X'}
          >
            <PanelRight className="w-3.5 h-3.5 text-[#FE2C55]" />
            <span className="text-[10px] hidden xl:inline">IA Copilot</span>
          </button>
        </div>
      </div>
    </header>
  );
};
