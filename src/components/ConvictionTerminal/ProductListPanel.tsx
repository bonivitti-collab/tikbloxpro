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
import { ALL_CATEGORY, categoriesForCounts } from '../../data/taxonomy';
import { commissionBrlOf, formatCollectedAt, stockUnitsOf, videoCountOf } from '../../lib/productRules';

interface ProductListPanelProps {
  width?: number;
  products: TrendingProduct[];
  categoryProducts?: TrendingProduct[];
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
  filterKnownCommissionOnly: boolean;
  setFilterKnownCommissionOnly: (val: boolean) => void;
  onOpenAddCustomProduct?: () => void;
}

export const ProductListPanel: React.FC<ProductListPanelProps> = ({
  width,
  products,
  categoryProducts,
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
  filterKnownCommissionOnly,
  setFilterKnownCommissionOnly,
  onOpenAddCustomProduct,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
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

  const filtered = products || [];
  const counted = categoryProducts || filtered;

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: counted.length };
    counted.forEach((product) => {
      const niche = product.niche || 'other';
      counts[niche] = (counts[niche] || 0) + 1;
    });
    return counts;
  }, [counted]);

  const categories = useMemo(() => categoriesForCounts(categoryCounts), [categoryCounts]);
  const activeCategoryObj = categories.find((category) => category.id === selectedNiche) || ALL_CATEGORY;

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
      className="w-full shrink-0 bg-[#F8FAFC] flex flex-col border-r border-slate-200 h-full overflow-hidden text-slate-900"
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
          <div className="flex items-center gap-1.5">
            {/* Botão de Categoria Principal */}
            <button
              type="button"
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className={`flex-1 flex items-center justify-between px-3 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer shadow-2xs ${
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
                className="p-2 rounded-xl bg-white border border-slate-300 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition cursor-pointer shadow-2xs"
                title="Mostrar todas as categorias"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Menu Dropdown de Categorias */}
          {isCategoryDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-xl p-2 animate-in fade-in slide-in-from-top-2">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-1 pb-1 mb-1 border-b border-slate-100 flex items-center justify-between">
                <span>Escolha uma Categoria</span>
                <span className="text-[9px] text-[#007A87] font-bold">Oceano Azul BR</span>
              </div>

              <div className="grid grid-cols-2 gap-1 max-h-60 overflow-y-auto pr-0.5">
                {categories.map((cat) => {
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

        {/* Linha 3: Botão de Inserção de Produto Próprio (Oceano Azul) */}
        {onOpenAddCustomProduct && (
          <button
            type="button"
            onClick={onOpenAddCustomProduct}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer shadow-2xs active:scale-98"
            title="Insira o produto que você encontrou no TikTok Shop para gerar o diagnóstico TikBlox"
          >
            <span className="flex items-center gap-1.5">
              <span>💎</span>
              <span>Analisar Meu Produto</span>
            </span>
            <span className="text-[10px] font-mono text-[#25F4EE] font-bold">
              + Inserir
            </span>
          </button>
        )}

        <label className="block">
          <span className="sr-only">Buscar produto</span>
          <span className="relative flex items-center">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Buscar por nome, palavra-chave ou nicho"
              className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-8 pr-8 text-xs text-slate-900 outline-none focus:border-[#25F4EE]"
            />
            {searchQuery && (
              <button type="button" onClick={() => setSearchQuery('')} className="absolute right-2 text-slate-400" title="Limpar busca">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </span>
        </label>

        <div className="flex flex-wrap gap-1">
          <button
            type="button"
            onClick={() => setFilterBlueOceanOnly(!filterBlueOceanOnly)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${filterBlueOceanOnly ? 'bg-[#25F4EE]/15 border-[#25F4EE] text-[#007A87]' : 'bg-white border-slate-300 text-slate-600'}`}
          >
            Oceano azul
          </button>
          <button
            type="button"
            onClick={() => setFilterHighCommissionOnly(!filterHighCommissionOnly)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${filterHighCommissionOnly ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-300 text-slate-600'}`}
          >
            Comissão alta
          </button>
          <button
            type="button"
            onClick={() => setFilterFreeSampleOnly(!filterFreeSampleOnly)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${filterFreeSampleOnly ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : 'bg-white border-slate-300 text-slate-600'}`}
          >
            Amostra grátis
          </button>
          <button
            type="button"
            onClick={() => setFilterKnownCommissionOnly(!filterKnownCommissionOnly)}
            className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${filterKnownCommissionOnly ? 'bg-amber-50 border-amber-300 text-amber-800' : 'bg-white border-slate-300 text-slate-600'}`}
          >
            Só comissão informada
          </button>
        </div>
        <p className="text-[10px] text-slate-500 leading-snug">
          Ao vivo: estoque ≥ 500, menos de 50 vídeos e comissão ≥ R$ 10. Sem valor, o card mostra “comissão não informada”. O botão acima esconde esses cards.
        </p>
      </div>

      {/* Lista Rolável de Cards com Foto Real e Identidade TikBlox */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-2.5 space-y-2 min-h-0">
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 my-4 shadow-2xs">
            <p className="font-bold text-slate-700">Nenhum produto com essas regras.</p>
            <p className="text-[11px] text-slate-500 mt-1">Os produtos ao vivo precisam de estoque, poucos vídeos e comissão de pelo menos R$ 10. Comissão em branco continua na lista até você pedir só a informada.</p>
            <button
              onClick={() => {
                setSelectedNiche('all');
                setSearchQuery('');
                setFilterFreeSampleOnly(false);
                setFilterBlueOceanOnly(false);
                setFilterHighCommissionOnly(false);
                setFilterKnownCommissionOnly(false);
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
            const commission = commissionBrlOf(prod);
            const commPct = Number(prod.commissionPercent || prod.tiktokShop?.commissionRatePercent || 0);
            const collectedLabel = formatCollectedAt(prod.collectedAt);
            const isSample = Boolean(prod.freeSampleAvailable || prod.tiktokShop?.freeSampleAvailable);
            const tc = prod.tradeConviction;
            const breakEvenSales = tc?.breakEvenSales || (commission != null && commission > 0 ? Math.max(1, Math.ceil(priceBRL / commission)) : 0);
            const convictionScore = tc?.convictionScore || Math.min(99, Math.round(prod.viralityScore || 92));
            const videoCount = videoCountOf(prod);
            const stock = stockUnitsOf(prod);
            const estimate = prod.metricsEstimated !== false && prod.dataSource !== 'live';

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
                {/* Linha 1: Badges de Sinal e Nicho (Layout Estável sem Quebra Feia) */}
                <div className="mb-1.5">
                  <div className="flex items-center justify-between gap-1.5 mb-1">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span
                        className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 border border-slate-200 truncate max-w-[110px]"
                        title={prod.nicheLabel || 'Nicho'}
                      >
                        {prod.nicheLabel || 'Nicho'}
                      </span>

                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.2 rounded border shrink-0 ${
                        convictionScore >= 90
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : convictionScore >= 80
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}>
                        {convictionScore >= 90 ? '🟢' : convictionScore >= 80 ? '🟡' : '🔴'} {convictionScore}/100
                      </span>
                    </div>

                    <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-sky-50 text-[#007A87] border border-sky-200 shrink-0">
                      {videoCount == null ? 'vídeos n/d' : `${videoCount} vídeos`}
                      {estimate ? ' · Estimativa' : ''}
                    </span>
                  </div>

                  <h3 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1" title={prod.name}>
                    {prod.name}
                  </h3>
                  {collectedLabel ? (
                    <p className="text-[10px] text-slate-500 mt-0.5">Coletado em {collectedLabel}</p>
                  ) : null}
                  {prod.countsUnknown ? (
                    <p className="text-[10px] font-bold text-amber-700 mt-0.5">estoque/vídeos não informados</p>
                  ) : null}
                </div>

                {/* Linha 2: Métricas de Custo, Comissão e Break-Even */}
                <div className="grid grid-cols-2 gap-1 bg-slate-50 p-2 rounded-lg border border-slate-200 font-mono text-xs my-1.5">
                  <div>
                    <span className="block text-[8px] font-sans font-bold text-slate-400 uppercase">
                      Custo Amostra
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
                      {commission == null ? (
                        <span className="font-sans text-[10px] font-bold text-amber-700">comissão não informada</span>
                      ) : (
                        <>
                          R$ {commission.toFixed(2)}{commPct > 0 ? ` (${commPct}%)` : ''}
                          {estimate ? <span className="block text-[8px] font-sans text-slate-400">Estimativa</span> : null}
                        </>
                      )}
                    </span>
                  </div>
                </div>

                {/* Linha 3: Break-Even em Vendas (O Coração da Decisão) */}
                <div className="flex items-center justify-between text-[10px] pt-0.5">
                  <span className="font-bold text-slate-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#25F4EE]" />
                    <span>{stock == null ? 'Estoque n/d' : `${stock} un.`} · zera em <strong>{breakEvenSales}</strong></span>
                  </span>
                  <span className="font-bold text-[#FE2C55] shrink-0 flex items-center gap-0.5 hover:underline text-[11px]">
                    <span>Ver Setup</span>
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
