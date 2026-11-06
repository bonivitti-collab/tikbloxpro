import React, { useState, useMemo } from 'react';
import {
  Bookmark,
  Copy,
  Check,
  ShoppingBag,
  Flame,
  ShieldCheck,
  TrendingUp,
  Clock,
  Activity,
  AlertTriangle,
  Compass,
  Target,
  Zap,
  DollarSign,
  HelpCircle,
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { TrendingProduct } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';
import { formatCollectedAt } from '../../lib/productRules';
import { tiktokShopHref } from '../../lib/productRules';
import {
  commissionBandOf,
  formatBrl,
  formatCommissionBand,
  formatPriceBand,
  formatPriceNote,
  parseTypedPrice,
  priceBandOf,
  roundMoney,
} from '../../lib/priceRange';

interface ProductDetailTerminalProps {
  product: TrendingProduct | null;
  onToggleSave: (id: string) => void;
  isSaved: boolean;
  onOpenCalculator: (p: TrendingProduct) => void;
}

export const ProductDetailTerminal: React.FC<ProductDetailTerminalProps> = ({
  product,
  onToggleSave,
  isSaved,
  onOpenCalculator,
}) => {
  const [copiedHook, setCopiedHook] = useState(false);
  const [simulationSales, setSimulationSales] = useState<number>(25);
  const [priceDraft, setPriceDraft] = useState('');
  const [priceDraftFor, setPriceDraftFor] = useState('');

  // O terminal monta com produto nulo (catálogo ainda não chegou) e só
  // depois recebe o item ativo. Este hook precisa existir nos dois renders.
  const lifecycle = useMemo(() => {
    if (!product?.id) return null;

    const tk = enrichWithTikTokShopData(product);
    const rawVideos = tk.tradeConviction?.creatorVideoCountBR;
    const videoCount = tk.dataSource === 'live' && typeof rawVideos === 'number' && Number.isFinite(rawVideos) ? rawVideos : null;
    const collected = tk.collectedAt || (typeof tk.discoveredAt === 'string' && /^\d{4}-\d{2}-\d{2}/.test(tk.discoveredAt) ? tk.discoveredAt : '');
    let daysOnRadar: number | null = null;
    let formattedEntryDate = 'data não informada';
    if (collected) {
      const then = new Date(collected);
      if (!Number.isNaN(then.getTime())) {
        daysOnRadar = Math.max(0, Math.floor((Date.now() - then.getTime()) / 86_400_000));
        formattedEntryDate = then.toLocaleDateString('pt-BR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          timeZone: 'America/Sao_Paulo',
        });
      }
    }

    let stageIndex = 0;
    let stageName = 'Contagem de vídeos ausente';
    let recommendation = 'Sem a contagem de vídeos o radar não diz se o feed está vazio.';
    if (videoCount != null && videoCount < 10) {
      stageIndex = 0;
      stageName = 'Menos de 10 vídeos medidos';
      recommendation = `${videoCount} vídeos medidos. Ainda há pouco conteúdo com esse produto no recorte coletado.`;
    } else if (videoCount != null && videoCount <= 25) {
      stageIndex = 1;
      stageName = '10 a 25 vídeos medidos';
      recommendation = `${videoCount} vídeos medidos. Já existe conteúdo, sem sinal de feed cheio.`;
    } else if (videoCount != null && videoCount <= 50) {
      stageIndex = 2;
      stageName = '26 a 50 vídeos medidos';
      recommendation = `${videoCount} vídeos medidos. A concorrência no feed já é visível.`;
    } else if (videoCount != null) {
      stageIndex = 3;
      stageName = 'Mais de 50 vídeos medidos';
      recommendation = `${videoCount} vídeos medidos. O feed desse produto está cheio no recorte coletado.`;
    }

    const saturationPercent = videoCount == null ? 0 : Math.max(0, Math.min(100, Math.round((videoCount / 50) * 100)));

    return {
      daysOnRadar,
      stageIndex,
      saturationPercent,
      stageName,
      recommendation,
      formattedEntryDate,
      videoCount,
    };
  }, [product]);

  if (!product || !lifecycle) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-[#F8FAFC]">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl mb-3 shadow-xs">
          🎯
        </div>
        <h3 className="text-base font-bold text-slate-800">Nenhum produto selecionado</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Selecione qualquer produto na lista à esquerda para abrir o Terminal de Convicção TikBlox com cálculo de risco e break-even.
        </p>
      </div>
    );
  }

  const tk = enrichWithTikTokShopData(product);
  const tc = tk.tradeConviction || {
    verdict: 'COMPRA_RECOMENDADA',
    verdictLabel: 'DADOS INCOMPLETOS',
    convictionScore: null,
    sampleCostBRL: Number(tk.estimatedPriceBRL || 69.90),
    commissionBRL: Number(tk.commissionEstimatedBRL || 15.50),
    commissionPercent: Number(tk.commissionPercent || 22),
    breakEvenSales: 5,
    netProfitAt20Sales: 240,
    netProfitAt50Sales: 705,
    creatorVideoCountBR: 6,
    creatorCompetitionLevel: 'Oceano Azul (< 10 vídeos)',
    stockLocation: 'TikTok Shop',
    shippingDays: '',
    riskLevel: 'MUITO_BAIXO',
    riskLabel: 'Contagem de vídeos ausente',
    reasons: [
      'O comprador escolhe o vendedor dentro do TikTok Shop.',
      'Apenas 6 vídeos de criadores no TikTok Brasil. Vácuo de conteúdo no algoritmo com carrinho amarelo ativo.',
      'Amortização Imediata: Com apenas 5 vendas no feed você recupera 100% do que pagou na compra.'
    ]
  };

  const band = priceBandOf(tk);
  const commissionBand = commissionBandOf(tk);
  const draftValue = priceDraftFor === tk.id ? priceDraft : (band.min > 0 ? band.min.toFixed(2) : '');
  const typedPrice = parseTypedPrice(draftValue);
  const workingPrice = typedPrice ?? (band.min > 0 ? band.min : 0);
  const commissionEach = commissionBand ? roundMoney((workingPrice * commissionBand.rate) / 100) : 0;
  const breakEvenSales = commissionEach > 0 ? Math.max(1, Math.ceil(workingPrice / commissionEach)) : 0;
  const collectedLabel = formatCollectedAt(tk.collectedAt);
  const hookText = String(tk.hookViral3s || tk.tiktokShop?.topViralHook || tk.adHooks?.[0] || 'Oportunidade em alta no TikTok Shop!');
  const shopLink = tiktokShopHref(tk);

  // =========================================================================
  // SIMULAÇÃO DINÂMICA DE RETORNO DO CRIADOR
  // =========================================================================
  const simGrossCommission = simulationSales * commissionEach;
  const simNetProfit = Math.max(0, simGrossCommission - workingPrice);
  const simRoi = workingPrice > 0 ? Math.round((simNetProfit / workingPrice) * 100) : 0;

  const STAGES = [
    {
      step: 1,
      title: 'Entrada no Radar',
      subtitle: 'até 10 vídeos',
      desc: 'Descoberta / Oceano Azul',
      badge: `🟢 < 10 Vídeos BR`,
    },
    {
      step: 2,
      title: 'Tração & Escala',
      subtitle: '10 a 25 vídeos',
      desc: 'Entrega Acelerada FYP',
      badge: '🔵 Sweet Spot (10-25 Vídeos)',
    },
    {
      step: 3,
      title: 'Pico de Vendas',
      subtitle: '26 a 50 vídeos',
      desc: 'Volume Máximo',
      badge: '🟡 Demanda Alta (25-50 Vídeos)',
    },
    {
      step: 4,
      title: 'Alerta de Saturação',
      subtitle: 'acima de 50 vídeos',
      desc: 'Fadiga Criativa',
      badge: '🔴 Saturado (> 50 Vídeos)',
    },
  ];

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookText);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  return (
    <main className="flex-1 min-w-0 bg-[#F8FAFC] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 text-slate-900">
      
      {/* ========================================================= */}
      {/* 1. CABEÇALHO EXECUTIVO INSTITUCIONAL (GRID SIMÉTRICO PRO) */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 shadow-xs relative overflow-hidden space-y-4">
        
        {/* Barra de Acento Superior Refinada */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#25F4EE]" />

        {/* Linha 1: Metadados Limpos + Botão Salvar no Canto Direito */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900 text-white shadow-2xs">
              {tk.nicheLabel || 'Nicho'}
            </span>
            <span className="inline-flex items-center gap-1 font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200/80 text-[10.5px]">
              <Clock className="w-3 h-3 text-[#007A87] shrink-0" />
              <span>{collectedLabel ? `Coletado em ${collectedLabel}` : 'Data de coleta não informada'}</span>
            </span>
            {tk.countsUnknown ? (
              <span className="inline-flex items-center font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 text-[10.5px]">
                estoque/vídeos não informados
              </span>
            ) : null}
            <span className="inline-flex items-center gap-1 text-[10.5px] font-extrabold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
              <Flame className="w-3 h-3 fill-current text-[#FE2C55] shrink-0" />
              <span>Viralidade {tk.viralityScore}/100</span>
            </span>
          </div>

          {/* Botão Salvar fixado no topo direito */}
          <button
            onClick={() => onToggleSave(tk.id)}
            className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 shadow-2xs shrink-0 ${
              isSaved
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remover dos salvos' : 'Salvar produto'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Linha 2: Título Principal de Alto Impacto */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {tk.name}
          </h1>
          {(tk.customProductUrl || tk.tiktokShop?.customProductUrl) && (
            <a
              href={tk.customProductUrl || tk.tiktokShop?.customProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 hover:underline bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200"
            >
              <ExternalLink className="w-3 h-3 text-emerald-600" />
              <span className="truncate max-w-[260px]">Link Original Cadastrado</span>
            </a>
          )}
        </div>

        {/* Ações: o link abre o produto exato no TikTok Shop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
          <div className="sm:col-span-2 rounded-xl border border-slate-200 bg-slate-50 p-3 flex gap-3 items-center">
            {tk.imageUrl && (
              <img src={tk.imageUrl} alt="" className="w-16 h-16 rounded-lg object-cover border border-slate-200 shrink-0" />
            )}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-slate-900 leading-snug">{tk.name}</p>
              <p className="text-xs font-bold text-slate-800">{formatPriceBand(band)}</p>
              <p className="text-[11px] leading-snug text-slate-500">{formatPriceNote(tk.collectedAt)}</p>
            </div>
          </div>
          <a
            href={shopLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full min-w-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#0F121C] hover:bg-black text-white font-black text-xs transition cursor-pointer shadow-sm active:scale-98 border border-slate-800 group overflow-hidden"
            title="Abrir página oficial do produto ou busca no TikTok Shop Brasil"
          >
            <ShoppingBag className="w-4 h-4 text-[#25F4EE] shrink-0" />
            <span className="truncate">{shopLink.exact ? 'Abrir produto exato' : 'Busca precisa no TikTok Shop'}</span>
          </a>

          {/* Copiar Gancho Viral 3s */}
          <button
            type="button"
            onClick={handleCopyHook}
            className="w-full min-w-0 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-amber-50/90 hover:bg-amber-100/90 border border-amber-300 text-amber-950 font-black text-xs transition cursor-pointer shadow-2xs active:scale-98 overflow-hidden"
            title="Copiar o gancho viral de 3 segundos para gravar seu vídeo"
          >
            {copiedHook ? (
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />
            )}
            <span className="truncate">{copiedHook ? 'Gancho Copiado!' : 'Copiar Gancho 3s'}</span>
          </button>

        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. O TERMINAL DE CONVICÇÃO DE ENTRADA (SETUP TIKBLOX)     */}
      {/* ========================================================= */}
      <div className="bg-white border-2 border-[#25F4EE]/60 rounded-2xl p-5 shadow-sm space-y-4 relative overflow-hidden">
        
        {/* Topo do Terminal: Veredito e Score de Entrada */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wide border shadow-2xs ${
                tc.verdict === 'COMPRA_RECOMENDADA'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : tc.verdict === 'ENTRADA_MODERADA'
                  ? 'bg-amber-50 text-amber-800 border-amber-300'
                  : 'bg-rose-50 text-rose-800 border-rose-300'
              }`}>
                <Target className="w-3.5 h-3.5 text-current" />
                <span>{tc.verdictLabel}</span>
              </span>

              <span className="text-xs font-mono font-bold text-slate-500">
                {tc.riskLabel}
              </span>
            </div>
            <p className="text-xs text-slate-600 pt-0.5">
              Diagnóstico de assimetria de risco para quem vende este produto no TikTok Shop.
            </p>
          </div>

        </div>

        {/* Os 4 pilares financeiros */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Pilar 1: Custo de Compra (Seu Bolso) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              Faixa de preço
            </span>
            <div className="text-sm sm:text-base font-black text-slate-900 font-mono mt-1 leading-tight">
              {formatBrl(band.min)} – {formatBrl(band.max)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              {formatPriceNote(tk.collectedAt)}
            </span>
          </div>

          {/* Pilar 2: Sua Comissão por Venda */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 min-w-0">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block truncate">
              Comissão por Venda
            </span>
            <div className="mt-1 min-w-0">
              {commissionBand == null ? (
                <span className="text-sm font-black text-amber-700">comissão não informada</span>
              ) : (
                <span className="text-sm sm:text-base font-black text-emerald-700 font-mono leading-tight">
                  {formatCommissionBand(commissionBand)}
                </span>
              )}
            </div>
            <span className="text-[10px] text-emerald-700 mt-0.5 block truncate">
              {commissionBand == null ? 'A loja não publicou a comissão' : 'Varia com o preço do anúncio'}
            </span>
          </div>

          {/* Pilar 3: Ponto de Equilíbrio (Break-Even) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-sky-50 to-white border-2 border-[#25F4EE] shadow-2xs min-w-0">
            <span className="text-[10px] font-bold text-[#007A87] uppercase tracking-wider block truncate">
              Break-Even (Ponto Zero)
            </span>
            <div className="text-lg sm:text-xl font-black text-[#0F172A] font-mono mt-1 flex items-baseline gap-1 whitespace-nowrap overflow-hidden">
              <span>{breakEvenSales}</span>
              <span className="text-xs font-extrabold text-slate-600 font-sans">vendas</span>
            </div>
            <span className="text-[10px] text-[#007A87] font-semibold mt-0.5 block truncate">
              Risco 100% zerado
            </span>
          </div>

          {/* Pilar 4: Concorrência no Feed BR */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              Vídeos no TikTok BR
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-1 flex items-baseline gap-1 whitespace-nowrap overflow-hidden">
              <span>{typeof tc.creatorVideoCountBR === 'number' ? tc.creatorVideoCountBR : 'n/d'}</span>
              <span className="text-xs font-bold text-slate-500 font-sans">vídeos</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block truncate">
              {tc.creatorCompetitionLevel}
            </span>
          </div>

        </div>

        {/* As 3 Teses Objetivas de Entrada */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tese de Entrada e Assimetria TikBlox (Por que este produto agora?):</span>
          </h4>

          <div className="space-y-2 pt-1 text-xs text-slate-700">
            {tc.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-800 font-mono font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                  {i + 1}
                </span>
                <span className="leading-relaxed">{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SIMULADOR INTERATIVO DE RETORNO DO CRIADOR                */}
        {/* ========================================================= */}
        <div className="bg-gradient-to-r from-sky-50/50 via-white to-emerald-50/50 border border-slate-200 rounded-xl p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                <span>Simulador de Retorno do Investimento Próprio</span>
              </h4>
              <p className="text-[11px] text-slate-500">
                O cálculo começa no menor preço. Digite o valor que aparece agora no TikTok.
              </p>
              <label className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase text-slate-500 shrink-0">Preço visto</span>
                <input
                  inputMode="decimal"
                  value={draftValue}
                  onChange={(event) => {
                    setPriceDraftFor(tk.id);
                    setPriceDraft(event.target.value);
                  }}
                  aria-label="Preço que você vê no TikTok agora"
                  className="h-9 w-full min-w-0 rounded-lg border border-slate-300 bg-white px-2 font-mono text-sm text-slate-900"
                />
              </label>
            </div>

            {/* Botoes rápidos de metas */}
            <div className="flex items-center gap-1.5">
              {[10, 25, 50, 100].map((v) => (
                <button
                  key={v}
                  onClick={() => setSimulationSales(v)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition cursor-pointer border ${
                    simulationSales === v
                      ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {v} vendas
                </button>
              ))}
            </div>
          </div>

          {/* Slider */}
          <div className="pt-1">
            <input
              type="range"
              min="5"
              max="150"
              step="5"
              value={simulationSales}
              onChange={(e) => setSimulationSales(Number(e.target.value))}
              className="w-full accent-[#FE2C55] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-slate-400 mt-1">
              <span>5 vendas (amortização)</span>
              <span className="font-bold text-slate-700">Meta Simulada: {simulationSales} vendas no feed</span>
              <span>150 vendas (vídeo viral)</span>
            </div>
          </div>

          {/* Resultado da Simulação */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-200/70 text-xs">
            <div className="p-2 rounded-lg bg-white border border-slate-200 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Comissão Bruta</span>
              <span className="font-mono font-extrabold text-slate-900 text-sm block whitespace-nowrap">
                {formatBrl(simGrossCommission)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-slate-200 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Preço usado</span>
              <span className="font-mono font-bold text-rose-600 text-sm block whitespace-nowrap">
                -{formatBrl(workingPrice)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 min-w-0">
              <span className="text-[10px] text-emerald-800 uppercase font-black block truncate">Lucro no Bolso</span>
              <span className="font-mono font-black text-emerald-700 text-sm block whitespace-nowrap">
                {formatBrl(simNetProfit)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-slate-200 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Retorno (ROI)</span>
              <span className="font-mono font-black text-[#007A87] text-sm block whitespace-nowrap">
                +{simRoi}%
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. CICLO DE VIDA NO RADAR: DO INÍCIO ATÉ A SATURAÇÃO      */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-4 relative overflow-hidden">
        
        {/* Header da Seção de Saturação */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-[#25F4EE]/15 text-[#007A87] font-bold">
              <Activity className="w-4 h-4 text-[#007A87]" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-bold text-slate-900 flex items-center gap-2">
                <span>Vídeos medidos e data da coleta</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {lifecycle.stageName}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                A barra usa os vídeos medidos sobre 50. Não é uma previsão de quantos dias a oportunidade dura.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <span className="text-[11px] font-bold text-slate-500">Vídeos / 50:</span>
            <span className="text-xs font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
              {lifecycle.saturationPercent}%
            </span>
          </div>
        </div>

        {/* Stepper Visual de 4 Fases do Ciclo de Vida */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-1">
          {STAGES.map((stg, idx) => {
            const isCurrent = lifecycle.stageIndex === idx;
            const isPast = lifecycle.stageIndex > idx;

            return (
              <div
                key={stg.step}
                className={`p-3 rounded-xl border transition-all relative ${
                  isCurrent
                    ? 'bg-gradient-to-b from-sky-50/60 to-white border-2 border-[#25F4EE] shadow-sm ring-2 ring-[#25F4EE]/20'
                    : isPast
                    ? 'bg-slate-50/80 border-slate-200 opacity-90'
                    : 'bg-white border-slate-200/80 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between gap-1 mb-1.5">
                  <span className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded ${
                    isCurrent
                      ? 'bg-[#25F4EE] text-[#0F121C] font-black'
                      : isPast
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-slate-200 text-slate-600'
                  }`}>
                    {isCurrent ? '👉 AGORA' : isPast ? '✓ CONCLUÍDO' : `FASE ${stg.step}`}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    {stg.subtitle}
                  </span>
                </div>

                <div className="font-bold text-xs text-slate-900">
                  {stg.title}
                </div>
                <div className="text-[10px] text-slate-500 mt-0.5">
                  {stg.desc}
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-100 text-[9px] font-bold text-slate-600">
                  {stg.badge}
                </div>
              </div>
            );
          })}
        </div>

        {/* Barra de Progresso e Métricas Detalhadas do Ciclo */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#007A87] shrink-0" />
              <span>Coletado em <strong>{lifecycle.formattedEntryDate}</strong>{lifecycle.daysOnRadar == null ? '' : ` (há ${lifecycle.daysOnRadar} dias)`}</span>
            </span>
            <span className="text-slate-600 font-mono text-[11px] sm:text-xs">
              {lifecycle.videoCount == null ? 'vídeos não medidos' : `${lifecycle.videoCount} vídeos medidos`}
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#25F4EE] via-[#00B4D8] to-[#FE2C55] transition-all duration-500"
              style={{ width: `${lifecycle.saturationPercent}%` }}
            />
          </div>

          <div className="text-xs text-slate-700 pt-1 flex items-start gap-1.5">
            <span className="text-sm shrink-0">🎯</span>
            <div>
              <strong className="text-slate-900">Diretriz Tática:</strong>{' '}
              <span>{lifecycle.recommendation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 4. GANCHO VIRAL DE 3 SEGUNDOS (O CORAÇÃO DO VÍDEO)         */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-amber-50/90 via-white to-rose-50/30 border border-amber-300/80 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-amber-800 font-black text-xs uppercase tracking-wider flex items-center gap-1">
            <span>⚡ Gancho Viral de 3 Segundos (Grave com o Produto)</span>
          </span>

          <button
            onClick={handleCopyHook}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 transition cursor-pointer shadow-2xs active:scale-95"
            title="Copiar texto do gancho"
          >
            {copiedHook ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-amber-800" />}
            <span>{copiedHook ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <blockquote className="text-sm sm:text-base font-bold text-slate-900 italic border-l-4 border-[#FE2C55] pl-3.5 py-1 my-2">
          &ldquo;{hookText}&rdquo;
        </blockquote>

        <p className="text-xs text-amber-950/80 mt-2">
          🎬 <strong>Direção de Cena:</strong> Segure o produto a 15 cm da câmera no primeiro segundo e faça um movimento abrupto para interromper a rolagem do feed antes de falar o gancho.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 5. RAIO-X DE MERCADO & LOGÍSTICA BRASIL                   */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Bloco 1: Por Que Vende Rápido no Brasil */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🇧🇷 Por Que Vende Rápido no Brasil</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {tk.culturalFitReason || 'Produto altamente visual que resolve dor diária com forte apelo em vídeos curtos.'}
          </p>
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Tráfego Viral Detectado:</span>
            <span className="font-bold text-emerald-700">
              {tk.dataSource === 'live'
                ? (tk.trendingMetrics?.viewsLast30Days || 'vendas não informadas')
                : 'exemplo de catálogo, não medido'}
            </span>
          </div>
        </div>

        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>Onde comprar</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            O comprador escolhe o vendedor dentro do TikTok Shop. O link abre este produto.
          </p>
          <a
            href={shopLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs font-bold text-[#007A87] hover:underline"
          >
            {shopLink.exact ? 'Abrir produto exato' : 'Buscar no TikTok Shop'}
          </a>
        </div>
      </div>

    </main>
  );
};
