import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  Layers,
  Sparkles,
  Gift,
  Flame,
  Check
} from 'lucide-react';
import { TrendingProduct, ProductNiche } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';

interface CategoryOption {
  id: ProductNiche;
  label: string;
  icon: string;
}

const CATEGORIES: CategoryOption[] = [
  { id: 'all', label: 'Todas as Categorias', icon: '🌐' },
  { id: 'beauty', label: 'Beleza & Cuidados', icon: '✨' },
  { id: 'home', label: 'Casa & Cozinha', icon: '🏠' },
  { id: 'tech', label: 'Tech & Celular', icon: '📱' },
  { id: 'accessories', label: 'Bolsas & Acessórios', icon: '👜' },
  { id: 'fitness', label: 'Saúde & Fitness', icon: '⚡' },
  { id: 'pets', label: 'Pets & Animais', icon: '🐾' },
  { id: 'kids', label: 'Kids & Bebês', icon: '👶' },
  { id: 'tools', label: 'Ferramentas', icon: '🔧' },
  { id: 'auto', label: 'Automotivo', icon: '🚗' },
  { id: 'gaming', label: 'Games & Setup', icon: '🎮' },
  { id: 'office', label: 'Escritório', icon: '💼' },
  { id: 'outdoor', label: 'Outdoor & Camping', icon: '🏕️' },
  { id: 'travel', label: 'Viagem', icon: '✈️' },
];

interface ProductListPanelProps {
  width?: number;
  products: TrendingProduct[];
  activeProduct: TrendingProduct | null;
  onSelectProduct: (p: TrendingProduct) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  selectedNiche: ProductNiche;
  setSelectedNiche: (niche: ProductNiche) => void;
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
  width,
  products,
  activeProduct,
  onSelectProduct,
  isCollapsed,
  onToggleCollapse,
  selectedNiche,
  setSelectedNiche,
  searchQuery,
  setSearchQuery,
  filterFreeSampleOnly,
  setFilterFreeSampleOnly,
  filterBlueOceanOnly,
  setFilterBlueOceanOnly,
  filterHighCommissionOnly,
  setFilterHighCommissionOnly,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showSearchInput, setShowSearchInput] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fechar dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsCategoryDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Enriquecer e filtrar produtos
  const enrichedProducts = useMemo(() => {
    return (products || []).map(enrichWithTikTokShopData);
  }, [products]);

  // Contagem de produtos por categoria
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: enrichedProducts.length };
    enrichedProducts.forEach((p) => {
      const niche = p.niche || 'other';
      counts[niche] = (counts[niche] || 0) + 1;
    });
    return counts;
  }, [enrichedProducts]);

  const filtered = useMemo(() => {
    let list = enrichedProducts;

    // 1. Filtro por Categoria / Nicho
    if (selectedNiche && selectedNiche !== 'all') {
      list = list.filter((p) => p.niche === selectedNiche);
    }

    // 2. Busca textual opcional
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (p) =>
          (p.name || '').toLowerCase().includes(q) ||
          (p.nicheLabel || '').toLowerCase().includes(q) ||
          (p.culturalFitReason || '').toLowerCase().includes(q)
      );
    }

    // 3. Filtros rápidos de afiliado
    if (filterFreeSampleOnly) {
      list = list.filter((p) => p.freeSampleAvailable || p.tiktokShop?.freeSampleAvailable);
    }

    if (filterBlueOceanOnly) {
      list = list.filter((p) => p.creatorSaturationBR === 'Baixa' || p.tiktokShop?.saturationLevel === 'Oceano Azul');
    }

    if (filterHighCommissionOnly) {
      list = list.filter((p) => (p.commissionPercent || p.tiktokShop?.commissionRatePercent || 0) >= 20);
    }

    return list;
  }, [enrichedProducts, selectedNiche, searchQuery, filterFreeSampleOnly, filterBlueOceanOnly, filterHighCommissionOnly]);

  const activeCategoryObj = CATEGORIES.find((c) => c.id === selectedNiche) || CATEGORIES[0];

  // Se o painel estiver recolhido no Desktop
  if (isCollapsed) {
    return (
      <aside className="hidden lg:flex w-9 bg-slate-100 border-r border-slate-200 flex-col items-center py-3 justify-between shrink-0 select-none">
        <button
          onClick={onToggleCollapse}
          className="p-1.5 hover:bg-white rounded-lg text-slate-600 hover:text-[#007A87] transition-colors cursor-pointer border border-transparent hover:border-slate-300"
          title="Expandir Lista de Tendências"
        >
          <PanelLeft className="w-4 h-4" />
        </button>
        <span className="[writing-mode:vertical-rl] rotate-180 text-[11px] font-bold text-slate-600 tracking-wider uppercase flex items-center gap-1.5">
          <span>Produtos TikTok Shop</span>
          <span className="text-[9px] bg-gradient-to-r from-[#25F4EE] to-[#00B4D8] text-[#0F121C] px-1.5 py-0.5 rounded-full font-mono font-black">
            {filtered.length}
          </span>
        </span>
        <div className="w-2 h-2 rounded-full bg-[#FE2C55] animate-pulse" />
      </aside>
    );
  }

  return (
    <section
      style={{ width: width ? `${width}px` : undefined }}
      className="w-full shrink-0 bg-[#F8FAFC] flex flex-col border-r border-slate-200 h-full overflow-hidden select-none text-slate-900"
    >
      
      {/* Topo: Cabeçalho com Seletor de Categoria e Acentos TikBlox */}
      <div className="bg-white border-b border-slate-200 p-2.5 sm:p-3 space-y-2 shrink-0 shadow-2xs">
        
        {/* Linha 1: Título com Gradiente do Logo e Botão de Recolher */}
        <div className="flex items-center justify-between gap-1.5">
          <div className="flex items-center gap-1.5 min-w-0">
            <div className="w-6 h-6 rounded-md bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] flex items-center justify-center text-white shrink-0 font-bold text-xs shadow-2xs">
              🛍️
            </div>
            <div className="min-w-0">
              <h2 className="text-xs font-bold text-slate-900 leading-none truncate">
                Tendências Validadas
              </h2>
              <span className="text-[10px] text-slate-500 font-mono">
                {filtered.length} no Brasil ({activeCategoryObj.label.split(' ')[0]})
              </span>
            </div>
          </div>

          <button
            onClick={onToggleCollapse}
            className="hidden lg:flex p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            title="Recolher painel para focar no Raio-X"
          >
            <PanelLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Linha 2: SELETOR DE CATEGORIAS CUSTOMIZADO (SEM SCROLL LATERAL) */}
        <div className="relative" ref={dropdownRef}>
          <div className="flex items-center gap-1">
            {/* Botão de Categoria Principal */}
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className={`flex-1 flex items-center justify-between px-2.5 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
                selectedNiche !== 'all'
                  ? 'bg-[#25F4EE]/10 border-[#25F4EE] text-[#007A87]'
                  : 'bg-white border-slate-300 text-slate-800 hover:border-[#25F4EE]/60'
              }`}
            >
              <div className="flex items-center gap-2 truncate">
                <span className="text-sm shrink-0">{activeCategoryObj.icon}</span>
                <span className="truncate">{activeCategoryObj.label}</span>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 ml-1">
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold border border-slate-200">
                  {filtered.length}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {/* Se tiver categoria filtrada, botão de limpar */}
            {selectedNiche !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedNiche('all')}
                className="p-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer"
                title="Limpar filtro de categoria"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Ícone de busca por palavra-chave opcional */}
            <button
              type="button"
              onClick={() => setShowSearchInput(!showSearchInput)}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                showSearchInput || searchQuery
                  ? 'bg-[#25F4EE]/15 border-[#25F4EE] text-[#007A87]'
                  : 'bg-white border-slate-300 text-slate-500 hover:text-slate-800 hover:border-[#25F4EE]/60'
              }`}
              title="Buscar por palavra-chave (ex: bolsa, fone)"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Campo de Busca Opcional quando ativado pela lupa */}
          {showSearchInput && (
            <div className="mt-1.5 relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Filtrar por nome (ex: bolsa, relógio)..."
                autoFocus
                className="w-full py-1 pl-2.5 pr-7 text-xs bg-slate-50 border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#25F4EE] focus:bg-white focus:ring-1 focus:ring-[#25F4EE]/40"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          )}

          {/* Menu Dropdown de Categorias */}
          {isCategoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Escolha uma Categoria</span>
                <span className="text-[9px] text-[#007A87] font-bold">Sem rolagem lateral</span>
              </div>

              <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto pr-0.5">
                {CATEGORIES.map((cat) => {
                  const isSelected = selectedNiche === cat.id;
                  const count = categoryCounts[cat.id] || 0;
                  if (cat.id !== 'all' && count === 0) return null;

                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        setSelectedNiche(cat.id);
                        setIsCategoryDropdownOpen(false);
                      }}
                      className={`flex items-center justify-between p-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer text-left border ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] text-[#0F121C] font-bold border-transparent shadow-2xs'
                          : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-slate-200'
                      }`}
                    >
                      <span className="truncate flex items-center gap-1.5">
                        <span className="text-xs">{cat.icon}</span>
                        <span className="truncate text-[11px]">{cat.label.split(' ')[0]}</span>
                      </span>

                      <span className={`text-[9px] font-mono px-1 rounded shrink-0 ${
                        isSelected ? 'bg-black/15 text-[#0F121C]' : 'bg-slate-200 text-slate-600'
                      }`}>
                        {count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Linha 3: Filtros de Afiliado em 1 Linha com Cores Vivas do Logo */}
        <div className="flex items-center gap-1 text-[11px] select-none">
          <button
            type="button"
            onClick={() => {
              setFilterFreeSampleOnly(false);
              setFilterBlueOceanOnly(false);
              setFilterHighCommissionOnly(false);
            }}
            className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors whitespace-nowrap ${
              !filterFreeSampleOnly && !filterBlueOceanOnly && !filterHighCommissionOnly
                ? 'bg-[#0F172A] text-white shadow-2xs'
                : 'text-slate-600 bg-slate-100 hover:bg-slate-200'
            }`}
          >
            TODOS
          </button>

          <button
            type="button"
            onClick={() => setFilterFreeSampleOnly(!filterFreeSampleOnly)}
            className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterFreeSampleOnly
                ? 'bg-emerald-600 text-white font-black shadow-2xs'
                : 'text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/60'
            }`}
          >
            <span>🎁 Amostra</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterBlueOceanOnly(!filterBlueOceanOnly)}
            className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterBlueOceanOnly
                ? 'bg-gradient-to-r from-[#25F4EE] to-[#00B4D8] text-[#0F121C] font-black shadow-2xs'
                : 'text-[#007A87] bg-[#25F4EE]/10 hover:bg-[#25F4EE]/20 border border-[#25F4EE]/30'
            }`}
          >
            <span>🌊 Oceano</span>
          </button>

          <button
            type="button"
            onClick={() => setFilterHighCommissionOnly(!filterHighCommissionOnly)}
            className={`px-2 py-0.5 rounded-md font-bold cursor-pointer transition-colors whitespace-nowrap flex items-center gap-1 ${
              filterHighCommissionOnly
                ? 'bg-gradient-to-r from-[#FE2C55] to-[#FF3B5C] text-white font-black shadow-2xs'
                : 'text-[#C1123A] bg-[#FE2C55]/10 hover:bg-[#FE2C55]/20 border border-[#FE2C55]/30'
            }`}
          >
            <span>💰 +20%</span>
          </button>
        </div>
      </div>

      {/* Lista Rolável de Cards com Foto Real e Identidade TikBlox */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-2 min-h-0">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 my-4 shadow-2xs">
            <p className="font-bold text-slate-700">Nenhum produto nesta categoria.</p>
            <p className="text-[11px] text-slate-500 mt-1">Experimente selecionar "Todas as Categorias" ou limpar os filtros.</p>
            <button
              onClick={() => {
                setSelectedNiche('all');
                setSearchQuery('');
                setFilterFreeSampleOnly(false);
                setFilterBlueOceanOnly(false);
                setFilterHighCommissionOnly(false);
              }}
              className="mt-3 px-3 py-1 bg-[#0F172A] text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          filtered.map((prod) => {
            const isSelected = activeProduct?.id === prod.id;
            const priceBRL = Number(prod.estimatedPriceBRL || 0);
            const commVal = Number(prod.commissionEstimatedBRL || prod.tiktokShop?.commissionValueBRL || (priceBRL * 0.22) || 0);
            const commPct = Number(prod.commissionPercent || prod.tiktokShop?.commissionRatePercent || 20);
            const isSample = Boolean(prod.freeSampleAvailable || prod.tiktokShop?.freeSampleAvailable);
            const stockLoc = String(prod.stockLocationBrazil || prod.tiktokShop?.stockLocation || 'São Paulo - SP');

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className={`p-3 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? 'bg-white border-2 border-[#25F4EE] shadow-[0_4px_20px_rgba(37,244,238,0.22)] ring-1 ring-[#FE2C55]/30'
                    : 'bg-white border-slate-200/90 hover:border-[#25F4EE]/60 hover:shadow-xs'
                }`}
              >
                {/* Linha 1: Título e Badges */}
                <div className="mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap mb-1">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                      {prod.nicheLabel || 'Nicho'}
                    </span>
                    {isSelected && (
                      <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-gradient-to-r from-[#25F4EE] to-[#00B4D8] text-[#0F121C] shadow-2xs">
                        EM FOCO
                      </span>
                    )}
                    {isSample ? (
                      <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase bg-emerald-50 text-emerald-800 border border-emerald-300 ml-auto">
                        🎁 Amostra
                      </span>
                    ) : (
                      <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded uppercase bg-[#25F4EE]/10 text-[#007A87] border border-[#25F4EE]/30 ml-auto">
                        {prod.creatorSaturationBR === 'Baixa' ? '🌊 Oceano' : 'Em Alta'}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                    {prod.name}
                  </h3>
                </div>

                {/* Linha 2: Métricas de Preço e Comissão */}
                <div className="grid grid-cols-2 gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200 font-mono text-xs my-1">
                  <div>
                    <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase">
                      Preço Shop
                    </span>
                    <span className="font-extrabold text-slate-900">
                      R$ {priceBRL.toFixed(2)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase">
                      Sua Comissão
                    </span>
                    <span className="font-extrabold text-emerald-600">
                      R$ {commVal.toFixed(2)} ({commPct}%)
                    </span>
                  </div>
                </div>

                {/* Linha 3: Estoque e Gancho */}
                <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5">
                  <span className="truncate">📦 {stockLoc.split('(')[0].trim()}</span>
                  <span className="font-bold text-[#FE2C55] shrink-0 flex items-center gap-0.5 hover:underline">
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
