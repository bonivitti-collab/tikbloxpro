import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  Search,
  X,
  PanelLeft,
  ChevronDown,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';
import { TrendingProduct, ProductNiche } from '../../types';
import { ALL_CATEGORY, categoriesForCounts } from '../../data/taxonomy';
import { formatCollectedAt, stockUnitsOf, videoCountOf } from '../../lib/productRules';
import { commissionBandOf, formatCommissionBand, formatPriceBand, formatPriceNote, priceBandOf } from '../../lib/priceRange';

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
  onOpenAddCustomProduct,
}) => {
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [compactHeader, setCompactHeader] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

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
      
      <div className="sticky top-0 z-20 relative bg-white border-b border-slate-200 px-2 py-1.5 space-y-1.5 shrink-0">
        <div className="flex items-center gap-1.5" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
            className={`min-h-9 flex-1 min-w-0 flex items-center justify-between gap-1 px-2 rounded-lg border text-xs font-bold cursor-pointer ${
              selectedNiche !== 'all'
                ? 'bg-[#25F4EE]/15 border-[#007A87] text-[#0F172A]'
                : 'bg-white border-slate-300 text-slate-900'
            }`}
            aria-expanded={isCategoryDropdownOpen}
            aria-label="Escolher categoria"
          >
            <span className="flex items-center gap-1.5 min-w-0">
              <span className="shrink-0" aria-hidden>{activeCategoryObj.icon}</span>
              <span className="truncate">{activeCategoryObj.label}</span>
            </span>
            <span className="flex items-center gap-1 shrink-0">
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-white">{filtered.length}</span>
              <ChevronDown className={`w-3.5 h-3.5 ${isCategoryDropdownOpen ? 'rotate-180' : ''}`} />
            </span>
          </button>
          {selectedNiche !== 'all' && (
            <button
              type="button"
              onClick={() => setSelectedNiche('all')}
              className="min-w-9 min-h-9 inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-700"
              aria-label="Mostrar todas as categorias"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {onOpenAddCustomProduct && (
            <button
              type="button"
              onClick={onOpenAddCustomProduct}
              className="min-w-9 min-h-9 inline-flex items-center justify-center rounded-lg bg-slate-900 text-white text-base"
              aria-label="Analisar meu produto"
              title="Analisar meu produto"
            >
              💎
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowRules((open) => !open)}
            className="min-w-9 min-h-9 inline-flex items-center justify-center rounded-lg border border-slate-300 text-slate-700"
            aria-label="Regras do radar"
            aria-expanded={showRules}
          >
            <HelpCircle className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => {
              setSearchOpen(true);
              setCompactHeader(false);
              listRef.current?.scrollTo({ top: 0 });
            }}
            className={`min-w-9 min-h-9 inline-flex items-center justify-center rounded-lg border ${searchOpen || !compactHeader ? 'border-[#007A87] text-[#007A87] bg-[#25F4EE]/15' : 'border-slate-300 text-slate-700'}`}
            aria-label="Buscar produto"
          >
            <Search className="w-4 h-4" />
          </button>
          <button
            onClick={onToggleCollapse}
            className="hidden lg:inline-flex min-w-9 min-h-9 items-center justify-center text-slate-500"
            title="Recolher painel"
          >
            <PanelLeft className="w-4 h-4" />
          </button>
          {showRules && (
            <div role="tooltip" className="absolute left-2 right-2 top-12 z-40 rounded-lg bg-slate-900 text-white text-[11px] leading-snug p-2.5 shadow-lg">
              Ao vivo: estoque ≥ 500, menos de 50 vídeos e comissão ≥ R$ 10. Sem valor, o card mostra “comissão não informada”.
            </div>
          )}

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

        {(!compactHeader || searchOpen || searchQuery) && (
          <label className="block">
            <span className="sr-only">Buscar produto</span>
            <span className="relative flex items-center">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5" />
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Buscar por nome, palavra-chave ou nicho"
                className="w-full h-9 rounded-lg border border-slate-300 bg-white pl-8 pr-8 text-xs text-slate-900 outline-none focus:border-[#007A87]"
              />
              {searchQuery && (
                <button type="button" onClick={() => setSearchQuery('')} className="absolute right-1 min-w-8 min-h-8 inline-flex items-center justify-center text-slate-600" aria-label="Limpar busca">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </span>
          </label>
        )}

      </div>

      <div
        ref={listRef}
        onScroll={(event) => {
          const next = event.currentTarget.scrollTop > 24;
          if (next !== compactHeader) setCompactHeader(next);
          if (next) setSearchOpen(false);
        }}
        className="flex-1 overflow-y-auto p-1.5 space-y-1.5 min-h-0"
      >
        {filtered.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-xs bg-white rounded-xl border border-slate-200 my-4 shadow-2xs">
            <p className="font-bold text-slate-700">Nenhum produto com essas regras.</p>
            <p className="text-[11px] text-slate-500 mt-1">Os produtos ao vivo precisam de estoque, poucos vídeos e comissão de pelo menos R$ 10. Comissão em branco continua na lista.</p>
            <button
              onClick={() => {
                setSelectedNiche('all');
                setSearchQuery('');
              }}
              className="mt-3 px-3 py-1 bg-[#0F172A] text-white rounded-lg text-xs font-bold transition cursor-pointer"
            >
              Resetar Filtros
            </button>
          </div>
        ) : (
          filtered.map((prod) => {
            const isSelected = activeProduct?.id === prod.id;
            const band = priceBandOf(prod);
            const commissionBand = commissionBandOf(prod);
            const collectedLabel = formatCollectedAt(prod.collectedAt);
            const tc = prod.tradeConviction;
            const breakEvenSales = tc?.breakEvenSales || (commissionBand && commissionBand.min > 0 ? Math.max(1, Math.ceil(band.min / commissionBand.min)) : 0);
            const videoCount = videoCountOf(prod);
            const stock = stockUnitsOf(prod);
            const estimate = prod.metricsEstimated !== false && prod.dataSource !== 'live';

            return (
              <div
                key={prod.id}
                onClick={() => onSelectProduct(prod)}
                className={`px-2 py-1.5 rounded-lg border cursor-pointer ${
                  isSelected
                    ? 'bg-white border-2 border-[#007A87]'
                    : 'bg-white border-slate-200'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <div className="flex items-center gap-1 min-w-0">
                    <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-800 border border-slate-200 truncate max-w-[92px]" title={prod.nicheLabel || 'Nicho'}>
                      {prod.nicheLabel || 'Nicho'}
                    </span>
                  </div>
                  <span className="text-[9px] font-mono font-bold text-slate-600 shrink-0">
                    {videoCount == null ? (collectedLabel || '') : `${videoCount} vídeos`}
                    {estimate ? ' · Estimativa' : ''}
                  </span>
                </div>
                <h3 className="text-[13px] font-bold text-slate-950 leading-tight line-clamp-1" title={prod.name}>
                  {prod.name}
                </h3>
                <p className="mt-1 text-[11px] font-bold leading-tight text-slate-950">{formatPriceBand(band)}</p>
                <p className="text-[10px] leading-tight text-slate-500">{formatPriceNote(prod.collectedAt)}</p>
                <p className="text-[11px] font-bold leading-tight text-emerald-800">
                  {commissionBand == null ? (
                    <span className="text-amber-800">comissão não informada</span>
                  ) : (
                    <>Comissão {formatCommissionBand(commissionBand)}</>
                  )}
                </p>
                <div className="mt-0.5 flex items-center justify-between gap-2 text-[10px]">
                  <span className={`font-bold truncate ${prod.countsUnknown ? 'text-amber-800' : 'text-slate-800'}`}>
                    {prod.countsUnknown
                      ? 'estoque/vídeos não informados'
                      : `${stock == null ? 'Estoque n/d' : `${stock} un.`} · zera em ${breakEvenSales}`}
                  </span>
                  <span className="font-bold text-[#9F1239] shrink-0 inline-flex items-center min-h-6">
                    Ver Setup
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
