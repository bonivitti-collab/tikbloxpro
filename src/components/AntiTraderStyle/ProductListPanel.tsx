import React, { useMemo } from 'react';
import {
  Search,
  X,
  PanelLeft,
  Sparkles,
  Check,
  ShoppingBag,
  Gift,
  Flame,
  ChevronRight
} from 'lucide-react';
import { TrendingProduct } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';

interface ProductListPanelProps {
  products: TrendingProduct[];
  activeProduct: TrendingProduct | null;
  onSelectProduct: (p: TrendingProduct) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  filterFreeSampleOnly: boolean;
  setFilterFreeSampleOnly: (val: boolean) => void;
  filterBlueOceanOnly: boolean;
  setFilterBlueOceanOnly: (val: boolean) => void;
  filterHighCommissionOnly: boolean;
  setFilterHighCommissionOnly: (val: boolean) => void;
}

export const ProductListPanel: React.FC<ProductListPanelProps> = ({
  products,
  activeProduct,
  onSelectProduct,
  isCollapsed,
  onToggleCollapse,
  searchQuery,
  setSearchQuery,
  filterFreeSampleOnly,
  setFilterFreeSampleOnly,
  filterBlueOceanOnly,
  setFilterBlueOceanOnly,
  filterHighCommissionOnly,
  setFilterHighCommissionOnly,
}) => {
  // Enriquecer e filtrar produtos de forma reativa e leve
  const enrichedProducts = useMemo(() => {
    return products.map(enrichWithTikTokShopData);
  }, [products]);

  const filtered = useMemo(() => {
    let list = enrichedProducts;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.nicheLabel.toLowerCase().includes(q) ||
          p.culturalFitReason.toLowerCase().includes(q)
      );
    }

    if (filterFreeSampleOnly) {
      list = list.filter((p) => p.freeSampleAvailable);
    }

    if (filterBlueOceanOnly) {
      list = list.filter((p) => p.creatorSaturationBR === 'Baixa');
    }

    if (filterHighCommissionOnly) {
      list = list.filter((p) => p.commissionPercent >= 20);
    }

    return list;
  }, [enrichedProducts, searchQuery, filterFreeSampleOnly, filterBlueOceanOnly, filterHighCommissionOnly]);

  // Se o painel estiver recolhido no Desktop, exibe faixa vertical esbelta idêntica ao AntiTrader
  if (isCollapsed) {
    return (
      <aside className="hidden lg:flex w-9 bg-slate-100 border-r border-slate-300 flex-col items-center py-3 justify-between shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-white rounded border border-transparent hover:border-slate-300 text-slate-600 hover:text-blue-600 transition-colors cursor-pointer"
          title="Expandir Lista de Tendências"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold text-slate-500 tracking-wider uppercase flex items-center gap-1.5">
          <span>Produtos TikTok Shop</span>
          <span className="text-[9px] bg-emerald-600 text-white px-1 py-0.5 rounded-full font-mono">
            {filtered.length}
          </span>
        </span>
        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      </aside>
    );
  }

  return (
    <section className="w-full lg:w-80 xl:w-[340px] shrink-0 bg-[#f8fafc] flex flex-col border-r border-slate-300 h-full overflow-hidden select-none">
      
      {/* Topo Fixo com Busca e Filtros Rápidos */}
      <div className="bg-white border-b border-slate-300 p-2.5 sm:p-3 shadow-2xs space-y-2 shrink-0">
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600 shrink-0 font-bold text-xs">
              🛍️
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 leading-none truncate">
                Tendências Validadas
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                {filtered.length} produtos prontos no Brasil
              </span>
            </div>
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            title="Recolher painel para focar no Raio-X"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Input de Busca Limpo */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar produto, nicho ou dor..."
            className="w-full pl-8 pr-7 py-1 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all text-slate-800 font-medium placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer p-0.5"
              title="Limpar busca"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Chips de Filtro Rápido em 1 Linha (AntiTrader Style) */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5 text-[10px]">
          <button
            onClick={() => {
              setFilterFreeSampleOnly(false);
              setFilterBlueOceanOnly(false);
              setFilterHighCommissionOnly(false);
            }}
            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors whitespace-nowrap ${
              !filterFreeSampleOnly && !filterBlueOceanOnly && !filterHighCommissionOnly
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            TODOS
          </button>

          <button
            onClick={() => setFilterFreeSampleOnly(!filterFreeSampleOnly)}
            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterFreeSampleOnly
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <span>🎁 Amostra</span>
          </button>

          <button
            onClick={() => setFilterBlueOceanOnly(!filterBlueOceanOnly)}
            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterBlueOceanOnly
                ? 'bg-cyan-600 text-white shadow-2xs'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <span>🌊 Oceano Azul</span>
          </button>

          <button
            onClick={() => setFilterHighCommissionOnly(!filterHighCommissionOnly)}
            className={`px-2 py-0.5 rounded font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterHighCommissionOnly
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            <span>💰 +20% Com.</span>
          </button>
        </div>
      </div>

      {/* Lista Rolável de Cards Compactos */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-2 min-h-0">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs">
            Nenhum produto encontrado com estes filtros.
          </div>
        ) : (
          filtered.map((prod) => {
            const isSelected = activeProduct?.id === prod.id;

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className={`p-2.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-blue-50/90 border-blue-600 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs hover:bg-slate-50'
                }`}
              >
                {/* Linha 1: Título e Badges */}
                <div className="flex items-start justify-between gap-1.5 mb-1">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 mr-1.5">
                      {prod.nicheLabel}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-blue-600 text-white shadow-2xs">
                        EM FOCO
                      </span>
                    )}
                    <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1 mt-0.5">
                      {prod.name}
                    </h3>
                  </div>

                  {prod.freeSampleAvailable ? (
                    <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 shrink-0">
                      🎁 Amostra
                    </span>
                  ) : (
                    <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase bg-slate-100 text-slate-500 border border-slate-200 shrink-0">
                      {prod.creatorSaturationBR === 'Baixa' ? '🌊 Oceano Azul' : 'Em Alta'}
                    </span>
                  )}
                </div>

                {/* Linha 2: Métricas de Preço e Comissão (Destaque Limpo) */}
                <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 font-mono text-xs my-1">
                  <div>
                    <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase">
                      Preço Shop
                    </span>
                    <span className="font-extrabold text-slate-900">
                      R$ {prod.estimatedPriceBRL.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase">
                      Sua Comissão
                    </span>
                    <span className="font-extrabold text-emerald-700">
                      R$ {prod.commissionEstimatedBRL.toFixed(2)} ({prod.commissionPercent}%)
                    </span>
                  </div>
                </div>

                {/* Linha 3: Estoque e Gancho */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span className="truncate">📦 {prod.stockLocationBrazil}</span>
                  <span className="font-bold text-blue-600 shrink-0 flex items-center gap-0.5">
                    <span>Ver Raio-X</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
};
