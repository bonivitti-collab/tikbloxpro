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
    <header className="relative bg-white border-b border-slate-200/90 px-3 sm:px-4 py-2 flex items-center justify-between shrink-0 z-20 gap-2 min-h-[54px] select-none text-slate-900 shadow-2xs">
      
      {/* Faixa de Identidade Visual TikBlox: Friso Cromático Ciano e Rosa do Logo */}
      <div className="absolute bottom-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#25F4EE] opacity-90" />

      {/* 1. Logo Oficial TikBlox em Versão Light com Emblema 3D Vibrante */}
      <div className="flex items-center gap-3 shrink-0">
        <TikBloxLogo size="sm" showBadge={true} animate={false} theme="light" />

        <span className="hidden xl:inline-flex items-center gap-1.5 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-300">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>Pronta Entrega no Brasil</span>
        </span>
      </div>

      {/* 2. Ações Centrais / Direitas com Toques das Cores do Logo */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Botão de Varredura com Realce Ciano TikBlox */}
        <button
          onClick={onScanTrends}
          disabled={isScanning}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-800 hover:border-[#25F4EE] hover:text-[#007A87] transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
          title="Buscar novas tendências validadas no TikTok Shop Brasil"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-[#00B4D8] ${isScanning ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">{isScanning ? 'Varrendo...' : 'Escanear Tendências'}</span>
        </button>

        {/* Botão de Salvos com Realce Rosa Neon TikBlox */}
        <button
          onClick={onOpenSaved}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-800 hover:border-[#FE2C55]/60 transition-all cursor-pointer shadow-2xs active:scale-95"
          title="Ver produtos salvos"
        >
          <Bookmark className="w-3.5 h-3.5 text-[#FE2C55] fill-[#FE2C55]/20" />
          <span className="hidden sm:inline">Salvos:</span>
          <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-1.5 py-0.2 rounded border border-slate-200">
            {savedCount}
          </span>
        </button>

        {/* Botão Simulador de Lucro / Calculadora */}
        <button
          onClick={onOpenCalculator}
          className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 transition-all cursor-pointer shadow-2xs"
          title="Simulador de Margem & Taxas de Envio"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[#007A87]" />
          <span>Calculadora</span>
        </button>

        {/* Toggles de Painéis no Desktop */}
        <div className="hidden lg:flex items-center gap-1.5 border-l border-slate-200 pl-2.5 ml-1">
          <button
            type="button"
            onClick={() => setPainelEsquerdoRecolhido(!painelEsquerdoRecolhido)}
            className={`p-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              painelEsquerdoRecolhido
                ? 'bg-[#25F4EE]/15 text-[#007A87] border-[#25F4EE] shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#25F4EE] hover:text-[#007A87]'
            }`}
            title={painelEsquerdoRecolhido ? 'Expandir Lista de Produtos' : 'Recolher Lista de Produtos para focar no Raio-X'}
          >
            <PanelLeft className="w-3.5 h-3.5 text-[#007A87]" />
            <span className="text-[10px] hidden xl:inline">Lista</span>
          </button>

          <button
            type="button"
            onClick={() => setPainelDireitoRecolhido(!painelDireitoRecolhido)}
            className={`p-1.5 px-2 rounded-lg border text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              painelDireitoRecolhido
                ? 'bg-[#FE2C55]/10 text-[#FE2C55] border-[#FE2C55]/40 shadow-2xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-[#FE2C55]/60 hover:text-[#FE2C55]'
            }`}
            title={painelDireitoRecolhido ? 'Expandir TIKBLOX AI' : 'Recolher TIKBLOX AI para focar no Raio-X'}
          >
            <PanelRight className="w-3.5 h-3.5 text-[#FE2C55]" />
            <span className="text-[10px] hidden xl:inline">TIKBLOX AI</span>
          </button>
        </div>
      </div>
    </header>
  );
};
