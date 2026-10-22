import React from 'react';
import {
  Search,
  X,
  RefreshCw,
  Gift,
  Sparkles,
  Globe,
  Filter,
  Bookmark,
  TrendingUp,
  Flame,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { ProductNiche } from '../../types';

interface LeftSidebarProps {
  selectedNiche: ProductNiche;
  setSelectedNiche: (niche: ProductNiche) => void;
  selectedOrigin: string;
  setSelectedOrigin: (origin: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onTriggerScan: () => void;
  isScanning: boolean;
  filterFreeSampleOnly: boolean;
  setFilterFreeSampleOnly: (val: boolean) => void;
  filterBlueOceanOnly: boolean;
  setFilterBlueOceanOnly: (val: boolean) => void;
  activeTab: string;
  setActiveTab: (tab: any) => void;
  savedCount: number;
  totalProductsCount: number;
}

const NICHES: Array<{ id: ProductNiche; label: string; icon: string }> = [
  { id: 'all', label: 'Todos os Nichos', icon: '🌐' },
  { id: 'home', label: 'Casa & Cozinha', icon: '🏠' },
  { id: 'beauty', label: 'Beleza & Estética', icon: '✨' },
  { id: 'tech', label: 'Gadgets & Inovação', icon: '⚡' },
  { id: 'fitness', label: 'Fitness & Treino', icon: '💪' },
  { id: 'pets', label: 'Pet & Animais', icon: '🐾' },
  { id: 'accessories', label: 'Moda & Acessórios', icon: '💎' },
  { id: 'kids', label: 'Infantil & Bebês', icon: '🧸' },
  { id: 'tools', label: 'Ferramentas', icon: '🔨' },
  { id: 'auto', label: 'Automotivo', icon: '🚗' },
  { id: 'health', label: 'Saúde & Bem-Estar', icon: '🩺' },
  { id: 'gaming', label: 'Games & Setup', icon: '🎮' },
  { id: 'office', label: 'Home Office', icon: '💻' },
  { id: 'outdoor', label: 'Camping & Lazer', icon: '🏕️' },
  { id: 'travel', label: 'Viagem & Bagagem', icon: '✈️' },
];

export const LeftSidebar: React.FC<LeftSidebarProps> = ({
  selectedNiche,
  setSelectedNiche,
  selectedOrigin,
  setSelectedOrigin,
  searchQuery,
  setSearchQuery,
  onTriggerScan,
  isScanning,
  filterFreeSampleOnly,
  setFilterFreeSampleOnly,
  filterBlueOceanOnly,
  setFilterBlueOceanOnly,
  activeTab,
  setActiveTab,
  savedCount,
  totalProductsCount,
}) => {
  return (
    <aside className="w-full lg:w-72 xl:w-80 shrink-0 flex flex-col gap-4 bg-[#1E2230] border border-white/10 rounded-2xl p-4 text-white shadow-xl max-h-none lg:max-h-[calc(100vh-84px)] lg:sticky lg:top-20 overflow-y-auto custom-scrollbar">
      
      {/* Search Input Box */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#25F4EE]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Buscar produto ou nicho..."
          className="w-full h-11 pl-10 pr-9 rounded-xl bg-[#141722] border border-white/10 text-xs text-white placeholder-[#757788] focus:outline-none focus:border-[#25F4EE] transition-colors"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#757788] hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Primary Action Button: Escanear Tendências BR */}
      <button
        onClick={onTriggerScan}
        disabled={isScanning}
        className="w-full h-11 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#FF3B5C] hover:brightness-110 active:scale-98 text-white font-black text-xs shadow-lg shadow-[#FE2C55]/25 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-60"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
        <span>{isScanning ? 'Minerando TikTok Shop...' : 'Escanear Tendências BR'}</span>
      </button>

      {/* Pro Affiliate Toggles */}
      <div className="space-y-1.5 pt-1 border-t border-white/5">
        <span className="text-[10px] uppercase font-bold text-[#A6A7B2] tracking-wider block mb-1">
          Filtros de Afiliado
        </span>

        <button
          onClick={() => setFilterFreeSampleOnly(!filterFreeSampleOnly)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
            filterFreeSampleOnly
              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
              : 'bg-[#141722] text-[#A6A7B2] border-white/5 hover:text-white hover:bg-[#1A1E2B]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Gift className={`w-4 h-4 ${filterFreeSampleOnly ? 'text-emerald-400' : 'text-[#757788]'}`} />
            <span>Amostra Grátis</span>
          </div>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/30">
            {filterFreeSampleOnly ? 'ATIVO' : 'TODOS'}
          </span>
        </button>

        <button
          onClick={() => setFilterBlueOceanOnly(!filterBlueOceanOnly)}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
            filterBlueOceanOnly
              ? 'bg-[#25F4EE]/20 text-[#25F4EE] border-[#25F4EE]/50 shadow-sm'
              : 'bg-[#141722] text-[#A6A7B2] border-white/5 hover:text-white hover:bg-[#1A1E2B]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${filterBlueOceanOnly ? 'text-[#25F4EE]' : 'text-[#757788]'}`} />
            <span>🌊 Oceano Azul</span>
          </div>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/30">
            &lt;15 Criadores
          </span>
        </button>

        <button
          onClick={() => setActiveTab(activeTab === 'high_margin' ? 'all' : 'high_margin')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'high_margin'
              ? 'bg-amber-400/20 text-amber-300 border-amber-400/50 shadow-sm'
              : 'bg-[#141722] text-[#A6A7B2] border-white/5 hover:text-white hover:bg-[#1A1E2B]'
          }`}
        >
          <div className="flex items-center gap-2">
            <TrendingUp className={`w-4 h-4 ${activeTab === 'high_margin' ? 'text-amber-400' : 'text-[#757788]'}`} />
            <span>Comissão Alta (+20%)</span>
          </div>
          <span className="text-[10px] font-black px-1.5 py-0.5 rounded bg-black/30">
            Top Lucro
          </span>
        </button>

        <button
          onClick={() => setActiveTab('saved')}
          className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
            activeTab === 'saved'
              ? 'bg-[#FE2C55]/20 text-[#FE2C55] border-[#FE2C55]/50 shadow-sm'
              : 'bg-[#141722] text-[#A6A7B2] border-white/5 hover:text-white hover:bg-[#1A1E2B]'
          }`}
        >
          <div className="flex items-center gap-2">
            <Bookmark className={`w-4 h-4 ${activeTab === 'saved' ? 'text-[#FE2C55]' : 'text-[#757788]'}`} />
            <span>Produtos Salvos</span>
          </div>
          {savedCount > 0 && (
            <span className="text-[10px] font-black px-1.5 py-0.5 rounded-full bg-[#FE2C55] text-white">
              {savedCount}
            </span>
          )}
        </button>
      </div>

      {/* Origin Selection */}
      <div className="pt-2 border-t border-white/5">
        <span className="text-[10px] uppercase font-bold text-[#A6A7B2] tracking-wider block mb-1.5">
          Origem da Tendência
        </span>
        <div className="grid grid-cols-3 gap-1 bg-[#141722] p-1 rounded-xl border border-white/5">
          <button
            onClick={() => setSelectedOrigin('all')}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
              selectedOrigin === 'all'
                ? 'bg-white/15 text-white font-extrabold'
                : 'text-[#757788] hover:text-white'
            }`}
          >
            🌍 Todas
          </button>
          <button
            onClick={() => setSelectedOrigin('US')}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
              selectedOrigin === 'US'
                ? 'bg-[#25F4EE]/20 text-[#25F4EE] font-extrabold'
                : 'text-[#757788] hover:text-white'
            }`}
          >
            🇺🇸 EUA
          </button>
          <button
            onClick={() => setSelectedOrigin('CN')}
            className={`py-1.5 text-[11px] font-bold rounded-lg transition cursor-pointer ${
              selectedOrigin === 'CN'
                ? 'bg-[#FE2C55]/20 text-[#FE2C55] font-extrabold'
                : 'text-[#757788] hover:text-white'
            }`}
          >
            🇨🇳 Ásia
          </button>
        </div>
      </div>

      {/* Niches List */}
      <div className="pt-2 border-t border-white/5 flex-1 flex flex-col">
        <span className="text-[10px] uppercase font-bold text-[#A6A7B2] tracking-wider block mb-2">
          Nichos Lucrativos
        </span>
        <div className="space-y-1 overflow-y-auto max-h-64 pr-1">
          {NICHES.map((niche) => (
            <button
              key={niche.id}
              onClick={() => setSelectedNiche(niche.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition cursor-pointer ${
                selectedNiche === niche.id
                  ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white font-bold shadow-md shadow-[#FE2C55]/20'
                  : 'text-[#A6A7B2] hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="text-sm">{niche.icon}</span>
                <span>{niche.label}</span>
              </div>
              <ChevronRight className="w-3.5 h-3.5 opacity-50" />
            </button>
          ))}
        </div>
      </div>

      {/* Pro Badge Footer */}
      <div className="pt-3 border-t border-white/5 text-[11px] text-[#A6A7B2] flex items-center gap-2 bg-[#141722]/50 p-2.5 rounded-xl">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>
          <strong className="text-white">Estoque no Brasil:</strong> Todos os produtos validados com envio rápido nacional.
        </span>
      </div>

    </aside>
  );
};
