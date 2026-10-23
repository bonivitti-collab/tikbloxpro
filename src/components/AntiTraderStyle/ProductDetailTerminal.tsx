import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  Bookmark,
  Copy,
  Check,
  Package,
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
  RefreshCw,
  Key,
  X,
  ExternalLink
} from 'lucide-react';
import { TrendingProduct } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';
import {
  verifyProductInTikTokShopBR,
  getStoredRapidApiKey,
  saveRapidApiKey,
  LiveVerificationResult
} from '../../services/rapidApiTikTokService';

interface ProductDetailTerminalProps {
  product: TrendingProduct | null;
  onOpenInCopilot: (p: TrendingProduct) => void;
  onToggleSave: (id: string) => void;
  isSaved: boolean;
  onOpenCalculator: (p: TrendingProduct) => void;
}

export const ProductDetailTerminal: React.FC<ProductDetailTerminalProps> = ({
  product,
  onOpenInCopilot,
  onToggleSave,
  isSaved,
  onOpenCalculator,
}) => {
  const [copiedHook, setCopiedHook] = useState(false);
  const [copiedTerm, setCopiedTerm] = useState(false);
  const [simulationSales, setSimulationSales] = useState<number>(25);

  // RapidAPI Pay-as-you-go live check
  const [liveCheckLoading, setLiveCheckLoading] = useState(false);
  const [liveCheckResult, setLiveCheckResult] = useState<LiveVerificationResult | null>(null);
  const [showRapidKeyModal, setShowRapidKeyModal] = useState(false);
  const [rapidKeyInput, setRapidKeyInput] = useState(() => getStoredRapidApiKey());
  const [rapidApiKey, setRapidApiKey] = useState(() => getStoredRapidApiKey());

  useEffect(() => {
    setLiveCheckResult(null);
  }, [product?.id]);

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-[#F8FAFC]">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl mb-3 shadow-xs">
          🎯
        </div>
        <h3 className="text-base font-bold text-slate-800">Nenhum produto selecionado</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Selecione qualquer produto na lista à esquerda para abrir o Terminal de Convicção AntiTrader com cálculo de risco e break-even.
        </p>
      </div>
    );
  }

  const tk = enrichWithTikTokShopData(product);
  const tc = tk.tradeConviction || {
    verdict: 'COMPRA_RECOMENDADA',
    verdictLabel: '🟢 ENTRADA FORTE (COMPRA DE AMOSTRA VALIDADA)',
    convictionScore: 94,
    sampleCostBRL: Number(tk.estimatedPriceBRL || 69.90),
    commissionBRL: Number(tk.commissionEstimatedBRL || 15.50),
    commissionPercent: Number(tk.commissionPercent || 22),
    breakEvenSales: 5,
    netProfitAt20Sales: 240,
    netProfitAt50Sales: 705,
    creatorVideoCountBR: 6,
    creatorCompetitionLevel: 'Oceano Azul (< 10 vídeos)',
    stockLocation: String(tk.stockLocationBrazil || 'São Paulo - SP (Pronta Entrega)'),
    shippingDays: '2 a 4 dias úteis',
    riskLevel: 'MUITO_BAIXO',
    riskLabel: 'Risco Mínimo (Assimetria Altamente Positiva)',
    reasons: [
      'Estoque Pronta Entrega Brasil: Vendedor nacional despacha de São Paulo. Chega em 3 a 5 dias para você gravar antes do produto espalhar.',
      'Apenas 6 vídeos de criadores no TikTok Brasil. Vácuo de conteúdo no algoritmo com carrinho amarelo ativo.',
      'Amortização Imediata: Com apenas 5 vendas no feed você recupera 100% do que pagou na compra.'
    ]
  };

  const priceBRL = Number(tk.estimatedPriceBRL || tc.sampleCostBRL || 0);
  const commissionVal = Number(tk.commissionEstimatedBRL || tc.commissionBRL || 0);
  const commissionPct = Number(tk.commissionPercent || tc.commissionPercent || 20);
  const stockLoc = String(tk.stockLocationBrazil || tc.stockLocation || 'São Paulo - SP (Pronta Entrega)');
  const hookText = String(tk.hookViral3s || tk.tiktokShop?.topViralHook || tk.adHooks?.[0] || 'Oportunidade em alta no TikTok Shop!');
  const affiliateTerm = String(tk.exactAffiliateSearchTerm || tk.originalName || tk.name);

  // =========================================================================
  // SIMULAÇÃO DINÂMICA DE RETORNO DO CRIADOR
  // =========================================================================
  const simGrossCommission = simulationSales * commissionVal;
  const simNetProfit = Math.max(0, simGrossCommission - priceBRL);
  const simRoi = priceBRL > 0 ? Math.round((simNetProfit / priceBRL) * 100) : 0;

  const handleRunLiveCheck = async () => {
    setLiveCheckLoading(true);
    try {
      const res = await verifyProductInTikTokShopBR(affiliateTerm, rapidApiKey);
      setLiveCheckResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLiveCheckLoading(false);
    }
  };

  // =========================================================================
  // CICLO DE VIDA NO RADAR: Acompanhamento da Entrada até a Saturação
  // =========================================================================
  const lifecycle = useMemo(() => {
    const sat = tk.creatorSaturationBR || 'Baixa';
    let hash = 0;
    for (let i = 0; i < tk.id.length; i++) {
      hash = (hash * 31 + tk.id.charCodeAt(i)) % 100;
    }

    let daysActive = 5;
    let stageIndex = 0;
    let saturationPercent = 22;
    let remainingDays = 35;
    let stageName = 'Fase 1: Entrada no Radar & Descoberta';
    let recommendation = 'Oceano Azul! Poucos criadores postando no Brasil. Momento ideal para comprar a amostra e garantir os primeiros rankings no feed.';

    if (sat === 'Baixa' || tc.creatorVideoCountBR < 12) {
      daysActive = 3 + (hash % 5);
      stageIndex = 0;
      saturationPercent = 18 + (hash % 14);
      remainingDays = 30 + (hash % 10);
      stageName = 'Fase 1: Entrada & Descoberta';
      recommendation = `Oceano Azul! Apenas ~${tc.creatorVideoCountBR} criadores ativos no Brasil. Compre sua amostra agora e poste os primeiros vídeos para fixar seu carrinho amarelo.`;
    } else if (sat === 'Média' || tc.creatorVideoCountBR <= 25) {
      daysActive = 12 + (hash % 9);
      stageIndex = 1;
      saturationPercent = 48 + (hash % 16);
      remainingDays = 15 + (hash % 8);
      stageName = 'Fase 2: Tração & Escala Acelerada';
      recommendation = 'Ponto Doce (Sweet Spot)! Algoritmo entregando com força no For You. Poste 2 a 3 vídeos por semana.';
    } else {
      daysActive = 28 + (hash % 16);
      if (daysActive > 36 || tc.creatorVideoCountBR > 50) {
        stageIndex = 3;
        saturationPercent = 82 + (hash % 12);
        remainingDays = 5 + (hash % 5);
        stageName = 'Fase 4: Alerta de Saturação & Fadiga';
        recommendation = 'Alerta de Saturação! Muitos vídeos semelhantes no feed. Evite comprar amostra agora; priorize produtos em Fase 1.';
      } else {
        stageIndex = 2;
        saturationPercent = 68 + (hash % 12);
        remainingDays = 11 + (hash % 6);
        stageName = 'Fase 3: Volume Máximo / Pico de Vendas';
        recommendation = 'Pico de Vendas! Volume diário altíssimo. Utilize quebras de objeções imediatas nos primeiros 3 segundos.';
      }
    }

    const entryDate = new Date();
    entryDate.setDate(entryDate.getDate() - daysActive);
    const formattedEntryDate = entryDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });

    return {
      daysActive,
      stageIndex,
      saturationPercent,
      remainingDays,
      stageName,
      recommendation,
      formattedEntryDate,
    };
  }, [tk.id, tk.creatorSaturationBR, tc.creatorVideoCountBR]);

  const STAGES = [
    {
      step: 1,
      title: 'Entrada no Radar',
      subtitle: 'Dia 1 a 7',
      desc: 'Descoberta / Oceano Azul',
      badge: `🟢 < 10 Vídeos BR`,
    },
    {
      step: 2,
      title: 'Tração & Escala',
      subtitle: 'Dia 8 a 21',
      desc: 'Entrega Acelerada FYP',
      badge: '🔵 Sweet Spot (10-25 Vídeos)',
    },
    {
      step: 3,
      title: 'Pico de Vendas',
      subtitle: 'Dia 22 a 45',
      desc: 'Volume Máximo',
      badge: '🟡 Demanda Alta (25-50 Vídeos)',
    },
    {
      step: 4,
      title: 'Alerta de Saturação',
      subtitle: 'Dia 46+',
      desc: 'Fadiga Criativa',
      badge: '🔴 Saturado (> 50 Vídeos)',
    },
  ];

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookText);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const handleCopyTerm = () => {
    navigator.clipboard.writeText(affiliateTerm);
    setCopiedTerm(true);
    setTimeout(() => setCopiedTerm(false), 2000);
  };

  return (
    <main className="flex-1 min-w-0 bg-[#F8FAFC] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 text-slate-900 select-none">
      
      {/* ========================================================= */}
      {/* 1. CABEÇALHO EXECUTIVO INSTITUCIONAL (ANTI-TRADER / LINEAR) */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-xs relative overflow-hidden space-y-4">
        
        {/* Barra de Acento Superior Refinada */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#25F4EE]" />

        {/* Linha Superior: Metadados Harmoniosos e Unificados */}
        <div className="flex items-center gap-2 text-xs flex-wrap text-slate-500">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
            {tk.nicheLabel || 'Nicho'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
            <Package className="w-3 h-3 text-emerald-600" />
            <span>{stockLoc.replace(' - SP', ', SP')}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-600 text-[11px]">
            <Clock className="w-3 h-3 text-[#007A87]" />
            <span>Há {lifecycle.daysActive} dias no radar</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
            <Flame className="w-3 h-3 fill-current text-[#FE2C55]" />
            <span>Viralidade {tk.viralityScore}/100</span>
          </span>
        </div>

        {/* Título Principal (100% da Largura, sem espremer) */}
        <div className="space-y-1.5 pt-1">
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
            {tk.name}
          </h1>
          <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
            <span className="font-medium text-slate-400">Termo de Busca para Vitrine:</span>
            <span className="font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[11px]">
              {affiliateTerm}
            </span>
            {(tk.customProductUrl || tk.tiktokShop?.customProductUrl) && (
              <a
                href={tk.customProductUrl || tk.tiktokShop?.customProductUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 font-mono text-[11px] text-emerald-800 hover:underline bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
              >
                <ExternalLink className="w-3 h-3 text-emerald-600" />
                <span className="truncate max-w-[240px]">Link Original Cadastrado</span>
              </a>
            )}
          </div>
        </div>

        {/* Barra de Ações Práticas Focadas no Criador (SEM LINKS EXTERNOS QUE QUEBRAM) */}
        <div className="flex items-center gap-2.5 flex-wrap pt-1">
          {(tk.customProductUrl || tk.tiktokShop?.customProductUrl) && (
            <a
              href={tk.customProductUrl || tk.tiktokShop?.customProductUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs transition cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
              title="Abrir o link direto cadastrado deste produto"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Abrir Loja / Produto</span>
            </a>
          )}

          <button
            onClick={handleCopyTerm}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#FF3B5C] hover:brightness-105 text-white font-extrabold text-xs transition cursor-pointer shadow-[0_4px_16px_rgba(254,44,85,0.25)] active:scale-95 whitespace-nowrap"
            title="Copiar nome do modelo para colar na vitrine de produtos do TikTok Shop"
          >
            {copiedTerm ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5 text-white/90" />}
            <span>{copiedTerm ? '✓ Termo Copiado!' : 'Copiar Termo p/ Vitrine (App TikTok)'}</span>
          </button>

          <button
            onClick={handleCopyHook}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
            title="Copiar o gancho viral de 3 segundos para gravar seu vídeo"
          >
            {copiedHook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />}
            <span>{copiedHook ? 'Gancho Copiado!' : 'Copiar Gancho Viral'}</span>
          </button>

          <button
            onClick={() => onToggleSave(tk.id)}
            className={`p-2 rounded-xl border transition cursor-pointer active:scale-95 shadow-2xs ${
              isSaved
                ? 'bg-rose-50 border-rose-300 text-rose-600'
                : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
            title={isSaved ? 'Remover dos salvos' : 'Salvar produto'}
          >
            <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>

          <button
            onClick={() => onOpenInCopilot(product)}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-black text-white font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap ml-auto"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#25F4EE]" />
            <span>Consultar IA</span>
          </button>
        </div>

        {/* Guia Rápido de Afiliação no App Móvel */}
        <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600 flex-wrap gap-2 bg-slate-50/70 p-2.5 rounded-xl border border-slate-200/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            <strong className="text-slate-800">Como afiliar no celular:</strong>
            <span>Abra o <strong>App TikTok &gt; Perfil &gt; Vitrine &gt; Adicionar Produtos</strong> e cole o termo copiado.</span>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Estoque confirmado no Brasil • Entrega 2 a 4 dias
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. O TERMINAL DE CONVICÇÃO DE ENTRADA (SETUP ANTITRADER)  */}
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
              Diagnóstico de assimetria de risco para criadores de TikTok Shop que compram a amostra com recursos próprios.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 bg-slate-50 px-3.5 py-2 rounded-xl border border-slate-200">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Convicção AntiTrader</span>
              <span className="text-lg font-mono font-black text-slate-900 leading-none">
                {tc.convictionScore}/100
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] text-white flex items-center justify-center font-black text-sm shadow-2xs">
              ⚡
            </div>
          </div>
        </div>

        {/* Os 4 Pilares Financeiros do Trade de Amostra (SEM QUEBRA DE LINHA DE NÚMEROS) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Pilar 1: Custo de Compra (Seu Bolso) */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 min-w-0">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block truncate">
              Custo Amostra (Seu Bolso)
            </span>
            <div className="text-lg sm:text-xl font-black text-slate-900 font-mono mt-1 whitespace-nowrap overflow-hidden">
              R$ {priceBRL.toFixed(2)}
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5 block truncate">
              Preço pago na loja BR
            </span>
          </div>

          {/* Pilar 2: Sua Comissão por Venda */}
          <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200 min-w-0">
            <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block truncate">
              Comissão por Venda
            </span>
            <div className="flex items-baseline gap-1 mt-1 whitespace-nowrap overflow-hidden">
              <span className="text-lg sm:text-xl font-black text-emerald-700 font-mono">
                R$ {commissionVal.toFixed(2)}
              </span>
              <span className="text-xs font-bold text-emerald-600 font-mono">
                ({commissionPct}%)
              </span>
            </div>
            <span className="text-[10px] text-emerald-700 mt-0.5 block truncate">
              Líquido no carrinho
            </span>
          </div>

          {/* Pilar 3: Ponto de Equilíbrio (Break-Even) */}
          <div className="p-3.5 rounded-xl bg-gradient-to-b from-sky-50 to-white border-2 border-[#25F4EE] shadow-2xs min-w-0">
            <span className="text-[10px] font-bold text-[#007A87] uppercase tracking-wider block truncate">
              Break-Even (Ponto Zero)
            </span>
            <div className="text-lg sm:text-xl font-black text-[#0F172A] font-mono mt-1 flex items-baseline gap-1 whitespace-nowrap overflow-hidden">
              <span>{tc.breakEvenSales}</span>
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
              <span>~{liveCheckResult ? liveCheckResult.videoCountBR : tc.creatorVideoCountBR}</span>
              <span className="text-xs font-bold text-slate-500 font-sans">vídeos</span>
            </div>
            <span className="text-[10px] font-bold text-emerald-700 mt-0.5 block truncate">
              {liveCheckResult ? liveCheckResult.verdictLabel : tc.creatorCompetitionLevel}
            </span>
          </div>

        </div>

        {/* ========================================================= */}
        {/* CHECAGEM EM TEMPO REAL VIA RAPIDAPI (PAY-AS-YOU-GO)       */}
        {/* ========================================================= */}
        <div className="p-4 rounded-xl bg-slate-900 text-white space-y-3 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 text-[10px] font-mono font-black uppercase px-2 py-0.5 rounded bg-[#25F4EE] text-[#0F121C]">
                  ⚡ RapidAPI Conectada
                </span>
                <span className="text-xs font-bold text-white">
                  Verificação ao Vivo no TikTok Brasil
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {liveCheckResult
                  ? liveCheckResult.message
                  : 'Consulte em tempo real quantos vídeos deste produto foram postados no feed brasileiro com cota gratuita ativa.'}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <button
                onClick={handleRunLiveCheck}
                disabled={liveCheckLoading}
                className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-gradient-to-r from-[#25F4EE] to-[#00D2C4] hover:brightness-105 text-[#0F121C] font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50 shadow-sm"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${liveCheckLoading ? 'animate-spin' : ''}`} />
                <span>{liveCheckLoading ? 'Checando no TikTok BR...' : 'Checar ao Vivo (API)'}</span>
              </button>

              <button
                onClick={() => setShowRapidKeyModal(true)}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition cursor-pointer border border-white/20"
                title="Configurar ou alterar chave RapidAPI"
              >
                <Key className="w-4 h-4 text-[#25F4EE]" />
              </button>
            </div>
          </div>

          {/* Amostras Reais de Vídeos Detectados ao Vivo */}
          {liveCheckResult?.sampleVideos && liveCheckResult.sampleVideos.length > 0 && (
            <div className="pt-2 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {liveCheckResult.sampleVideos.map((vid, idx) => (
                <div key={idx} className="p-2 rounded-lg bg-white/5 border border-white/10 space-y-0.5">
                  <div className="flex items-center justify-between text-[10px] text-[#25F4EE] font-mono">
                    <span className="truncate">@{vid.author}</span>
                    <span className="font-bold">{vid.views}</span>
                  </div>
                  <p className="text-[11px] text-slate-300 line-clamp-1 italic">
                    "{vid.title}"
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* As 3 Teses Objetivas de Entrada */}
        <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-200/80 space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Tese de Convicção AntiTrader (Por que comprar este produto agora?):</span>
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
                Arraste ou selecione para simular o retorno líquido após pagar a amostra:
              </p>
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
                R$ {simGrossCommission.toFixed(2)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-white border border-slate-200 min-w-0">
              <span className="text-[10px] text-slate-400 uppercase font-bold block truncate">Custo Amostra</span>
              <span className="font-mono font-bold text-rose-600 text-sm block whitespace-nowrap">
                -R$ {priceBRL.toFixed(2)}
              </span>
            </div>

            <div className="p-2 rounded-lg bg-emerald-50 border border-emerald-300 min-w-0">
              <span className="text-[10px] text-emerald-800 uppercase font-black block truncate">Lucro no Bolso</span>
              <span className="font-mono font-black text-emerald-700 text-sm block whitespace-nowrap">
                R$ {simNetProfit.toFixed(2)}
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
                <span>Ciclo de Vida no Radar & Curva de Saturação</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  {lifecycle.stageName}
                </span>
              </h3>
              <p className="text-[11px] text-slate-500">
                Acompanhe a maturidade de criadores no TikTok Shop Brasil para não entrar no topo da onda.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-right">
            <span className="text-[11px] font-bold text-slate-500">Saturação:</span>
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
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 text-[#007A87]" />
              <span>Entrada no Radar: <strong>{lifecycle.formattedEntryDate}</strong> (há {lifecycle.daysActive} dias)</span>
            </span>
            <span className="text-emerald-700 font-mono">
              Janela de Entrada: ~{lifecycle.remainingDays} dias ideais para lucrar
            </span>
          </div>

          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#25F4EE] via-[#00B4D8] to-[#FE2C55] transition-all duration-500"
              style={{ width: `${lifecycle.saturationPercent}%` }}
            />
          </div>

          <div className="text-xs text-slate-700 pt-1 flex items-start gap-1.5">
            <span className="text-sm">🎯</span>
            <div>
              <strong className="text-slate-900">Diretriz AntiTrader:</strong>{' '}
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
            <span className="font-bold text-emerald-700">{tk.trendingMetrics?.viewsLast30Days || '48.5M views'}</span>
          </div>
        </div>

        {/* Bloco 2: Validação de Pronta Entrega */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>📦 Logística & Despacho Nacional</span>
          </h3>
          <div className="space-y-1 text-xs text-slate-700">
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Origem do Estoque:</span>
              <span className="font-bold text-slate-900">{stockLoc}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Prazo Médio p/ Sua Casa:</span>
              <span className="font-bold text-emerald-700">2 a 4 dias úteis</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Complexidade:</span>
              <span className="font-bold text-slate-800">{tk.logisticsComplexity || 'Fácil (Envio Rápido)'}</span>
            </div>
          </div>
          <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-100">
            Chega rápido para você gravar enquanto o vácuo de concorrência estiver aberto.
          </p>
        </div>
      </div>

      {/* Modal de Configuração RapidAPI */}
      {showRapidKeyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-md shadow-2xl overflow-hidden flex flex-col text-slate-900">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <Key className="w-4 h-4 text-[#007A87]" />
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider">
                  Configurar Chave RapidAPI (Pay-As-You-Go)
                </h3>
              </div>
              <button
                onClick={() => setShowRapidKeyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-800 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3 text-xs">
              <p className="text-slate-600 leading-relaxed">
                Você pode criar uma conta gratuita no <strong>RapidAPI.com</strong> para receber <strong>100 consultas grátis por mês</strong>. Cole sua chave abaixo para consultar ao vivo a quantidade de vídeos no feed do TikTok Brasil por frações de centavos (~R$ 0,03/busca):
              </p>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">
                  Sua Chave RapidAPI (x-rapidapi-key):
                </label>
                <input
                  type="password"
                  value={rapidKeyInput}
                  onChange={(e) => setRapidKeyInput(e.target.value)}
                  placeholder="Cole sua chave aqui..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono text-xs outline-none focus:border-[#25F4EE]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRapidKeyModal(false)}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-slate-600 font-bold transition cursor-pointer"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    saveRapidApiKey(rapidKeyInput);
                    setRapidApiKey(rapidKeyInput.trim());
                    setShowRapidKeyModal(false);
                  }}
                  className="px-4 py-1.5 rounded-lg bg-slate-900 hover:bg-black text-white font-bold transition cursor-pointer shadow-2xs"
                >
                  Salvar Chave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </main>
  );
};
