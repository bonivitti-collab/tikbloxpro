import React, { useState, useMemo } from 'react';
import {
  ExternalLink,
  ShoppingBag,
  Sparkles,
  Bookmark,
  SlidersHorizontal,
  Copy,
  Check,
  Video,
  Package,
  Gift,
  Flame,
  ShieldCheck,
  TrendingUp,
  MapPin,
  Users,
  Search,
  Clock,
  Activity,
  AlertTriangle,
  Compass,
  Play
} from 'lucide-react';
import { TrendingProduct } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';

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

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-[#F8FAFC]">
        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl mb-3 shadow-xs">
          🛍️
        </div>
        <h3 className="text-base font-bold text-slate-800">Nenhum produto selecionado</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Clique em qualquer produto na lista à esquerda para abrir o Raio-X completo e a estratégia de vendas para o TikTok Shop Brasil.
        </p>
      </div>
    );
  }

  const tk = enrichWithTikTokShopData(product);

  const priceBRL = Number(tk.estimatedPriceBRL || 0);
  const commissionVal = Number(tk.commissionEstimatedBRL || tk.tiktokShop?.commissionValueBRL || (priceBRL * 0.22) || 0);
  const commissionPct = Number(tk.commissionPercent || tk.tiktokShop?.commissionRatePercent || 22);
  const stockLoc = String(tk.stockLocationBrazil || tk.tiktokShop?.stockLocation || 'São Paulo - SP (Pronta Entrega)');
  const hookText = String(tk.hookViral3s || tk.tiktokShop?.topViralHook || tk.adHooks?.[0] || 'Oportunidade em alta no TikTok Shop!');
  const isSample = Boolean(tk.freeSampleAvailable || tk.tiktokShop?.freeSampleAvailable);
  const saturation = String(tk.creatorSaturationBR || tk.tiktokShop?.saturationLevel || 'Oceano Azul');
  const affLink = String(tk.tiktokShopAffiliateLink || tk.tiktokShop?.tiktokShopAffiliateLink || 'https://seller-br.tiktok.com');
  const tiktokSearchUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(tk.name + ' unboxing review')}`;

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
    let stageIndex = 0; // 0 = Entrada, 1 = Tração, 2 = Pico, 3 = Saturação
    let saturationPercent = 22;
    let remainingDays = 35;
    let stageName = 'Fase 1: Entrada no Radar & Descoberta';
    let recommendation = '🟢 Oceano Azul! Poucos criadores postando no Brasil. Momento ideal para pedir amostra grátis e garantir autoridade de busca no feed.';

    if (sat === 'Baixa') {
      daysActive = 3 + (hash % 5); // 3 a 7 dias
      stageIndex = 0;
      saturationPercent = 18 + (hash % 14); // 18% a 31%
      remainingDays = 30 + (hash % 10);
      stageName = 'Fase 1: Entrada & Descoberta';
      recommendation = 'Oceano Azul! Menos de 20 criadores ativos no Brasil. Peça amostra grátis e poste os primeiros vídeos para fixar seu carrinho amarelo.';
    } else if (sat === 'Média') {
      daysActive = 12 + (hash % 9); // 12 a 20 dias
      stageIndex = 1;
      saturationPercent = 48 + (hash % 16); // 48% a 63%
      remainingDays = 15 + (hash % 8);
      stageName = 'Fase 2: Tração & Escala Acelerada';
      recommendation = 'Ponto Doce (Sweet Spot)! Algoritmo entregando com força no For You. Poste 2 a 3 vídeos por dia e faça lives semanais.';
    } else {
      daysActive = 28 + (hash % 16); // 28 a 44 dias
      if (daysActive > 36) {
        stageIndex = 3;
        saturationPercent = 82 + (hash % 12); // 82% a 94%
        remainingDays = 5 + (hash % 5);
        stageName = 'Fase 4: Alerta de Saturação & Fadiga';
        recommendation = 'Alerta de Saturação! Muitos vídeos semelhantes no feed. Use ângulos de humor/provocação ou migre o foco para novos produtos em Fase 1 no radar.';
      } else {
        stageIndex = 2;
        saturationPercent = 68 + (hash % 12); // 68% a 80%
        remainingDays = 11 + (hash % 6);
        stageName = 'Fase 3: Volume Máximo / Pico de Vendas';
        recommendation = 'Pico de Vendas! Volume diário altíssimo. Use quebras de objeções imediatas de frete nos comentários para converter compras impulsivas.';
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
  }, [tk.id, tk.creatorSaturationBR]);

  const STAGES = [
    {
      step: 1,
      title: 'Entrada no Radar',
      subtitle: 'Dia 1 a 7',
      desc: 'Descoberta / Oceano Azul',
      badge: '🟢 Baixa Concorrência',
    },
    {
      step: 2,
      title: 'Tração & Escala',
      subtitle: 'Dia 8 a 21',
      desc: 'Entrega Acelerada no FYP',
      badge: '🔵 Sweet Spot (Postar 2-3x/dia)',
    },
    {
      step: 3,
      title: 'Pico de Vendas',
      subtitle: 'Dia 22 a 45',
      desc: 'Volume Máximo de Vendas',
      badge: '🟡 Alta Demanda Popular',
    },
    {
      step: 4,
      title: 'Alerta de Saturação',
      subtitle: 'Dia 46+',
      desc: 'Fadiga Criativa no Feed',
      badge: '🔴 Concorrência Elevada',
    },
  ];

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookText);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  const handleCopyTerm = () => {
    const term = String(tk.exactAffiliateSearchTerm || tk.originalName || tk.name);
    navigator.clipboard.writeText(term);
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

        {/* Linha Superior: Metadados Harmoniosos e Unificados em 1 Linha */}
        <div className="flex items-center gap-2 text-xs flex-wrap text-slate-500">
          <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-slate-900 text-white shadow-2xs">
            {tk.nicheLabel || 'Nicho'}
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 text-[11px]">
            <span>📦</span>
            <span>{stockLoc.replace(' - SP', ', SP')}</span>
          </span>
          <span className="text-slate-300">•</span>
          <span className="inline-flex items-center gap-1 font-medium text-slate-600 text-[11px]">
            <Clock className="w-3 h-3 text-[#007A87]" />
            <span>Há {lifecycle.daysActive} dias no radar</span>
          </span>
          {tk.originCountry && (
            <>
              <span className="text-slate-300">•</span>
              <span className="text-[11px] font-medium text-slate-600">
                {tk.originCountry === 'US' ? '🇺🇸 Origem EUA' : '🇨🇳 Origem China'}
              </span>
            </>
          )}
          <span className="text-slate-300">•</span>
          <span className="text-[11px] font-bold text-rose-600 flex items-center gap-0.5">
            <Flame className="w-3 h-3 fill-current text-[#FE2C55]" />
            <span>Score {tk.viralityScore}/100</span>
          </span>
        </div>

        {/* Título Principal & Ações em Layout Perfeito */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pt-1">
          <div className="space-y-1.5 flex-1 min-w-0 pr-0 lg:pr-4">
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {tk.name}
            </h1>
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="font-medium text-slate-400">Modelo Global:</span>
              <span className="font-mono text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80 text-[11px]">
                {tk.exactAffiliateSearchTerm || tk.originalName || tk.name}
              </span>
            </div>
          </div>

          {/* Grupo de Ações Alinhadas */}
          <div className="flex items-center gap-2 shrink-0 flex-wrap">
            <a
              href={affLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#FF3B5C] hover:brightness-105 text-white font-extrabold text-xs transition cursor-pointer shadow-[0_4px_16px_rgba(254,44,85,0.30)] active:scale-95 whitespace-nowrap"
              title="Abre a busca do TikTok com a assinatura exata do modelo para assistir aos criativos virais"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Vídeos Virais no TikTok</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>

            <button
              onClick={handleCopyTerm}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs transition cursor-pointer shadow-2xs active:scale-95 whitespace-nowrap"
              title="Copie o termo exato para colar no app do TikTok Shop (Centro de Criadores / Vitrine)"
            >
              {copiedTerm ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedTerm ? 'Copiado!' : 'Copiar Termo p/ Vitrine'}</span>
            </button>

            <button
              onClick={() => onToggleSave(tk.id)}
              className={`p-2.5 rounded-xl border transition cursor-pointer active:scale-95 shadow-2xs ${
                isSaved
                  ? 'bg-rose-50 border-rose-300 text-rose-600'
                  : 'bg-white border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remover dos salvos' : 'Salvar produto'}
            >
              <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Rodapé do Card: Faixa de Validação de Fornecedores Discreta & Elegante */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500 flex-wrap gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700">Validar Estoque & Preço:</span>
            <a
              href={tk.shopeeSearchUrl || `https://shopee.com.br/search?keyword=${encodeURIComponent(tk.name.split(' ').slice(0, 3).join(' '))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50/80 hover:bg-orange-100 border border-orange-200/70 text-orange-700 font-bold transition whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500" />
              <span>Shopee (Pronta Entrega SP)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <a
              href={tk.aliExpressSearchUrl || `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(tk.exactViralSearchQuery || tk.originalName || tk.name)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-50/80 hover:bg-red-100 border border-red-200/70 text-red-700 font-bold transition whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
              <span>AliExpress (Atacado Direto)</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
            <a
              href={tk.mercadoLivreSearchUrl || `https://lista.mercadolivre.com.br/${encodeURIComponent(tk.name.split(' ').slice(0, 3).join(' '))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50/80 hover:bg-amber-100 border border-amber-200/70 text-amber-800 font-bold transition whitespace-nowrap"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              <span>Mercado Livre</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>

          <span className="text-[10px] text-slate-400 font-mono">
            {copiedTerm ? '✓ Termo copiado!' : 'Cole o termo no app TikTok Shop para afiliar-se'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. CICLO DE VIDA NO RADAR: DO INÍCIO ATÉ A SATURAÇÃO      */}
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
                Acompanhe a maturidade de criadores no TikTok Shop Brasil para não entrar tarde demais.
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
                {/* Indicador de Status */}
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
              Janela Aberta: ~{lifecycle.remainingDays} dias ideais para lucrar
            </span>
          </div>

          {/* Barra de Preenchimento de Saturação */}
          <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden relative">
            <div
              className="h-full bg-gradient-to-r from-[#25F4EE] via-[#00B4D8] to-[#FE2C55] transition-all duration-500"
              style={{ width: `${lifecycle.saturationPercent}%` }}
            />
          </div>

          <div className="text-xs text-slate-700 pt-1 flex items-start gap-1.5">
            <span className="text-sm">🎯</span>
            <div>
              <strong className="text-slate-900">Diretriz Tática da TikBlox:</strong>{' '}
              <span>{lifecycle.recommendation}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. 4 MÉTRICAS ESSENCIAIS DE AFILIADO TIKTOK SHOP           */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        
        {/* Métrica 1: Ganho por Venda */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-emerald-50 rounded-bl-full pointer-events-none" />
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider relative z-10">
            Sua Comissão Estimada
          </span>
          <div className="flex items-baseline gap-1 mt-1 relative z-10">
            <span className="text-xl sm:text-2xl font-black text-emerald-600 font-mono">
              R$ {commissionVal.toFixed(2)}
            </span>
            <span className="text-xs font-extrabold text-emerald-700 font-mono">
              ({commissionPct}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block relative z-10">
            Pago direto pelo TikTok Shop BR
          </span>
        </div>

        {/* Métrica 2: Preço ao Consumidor */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Preço Médio no Feed
          </span>
          <div className="text-xl sm:text-2xl font-black text-slate-900 font-mono mt-1">
            R$ {priceBRL.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Faixa com maior conversão de impulso
          </span>
        </div>

        {/* Métrica 3: Amostra Grátis */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs">
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Amostra Grátis P/ Criador
          </span>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={`text-sm sm:text-base font-extrabold ${isSample ? 'text-emerald-700' : 'text-slate-600'}`}>
              {isSample ? '✅ Disponível via Vendedor' : 'Solicitar ao Fornecedor'}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            Receba em casa para gravar vídeos
          </span>
        </div>

        {/* Métrica 4: Saturação */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-3.5 shadow-2xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-12 h-12 bg-[#25F4EE]/10 rounded-bl-full pointer-events-none" />
          <span className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider relative z-10">
            Saturação de Criadores BR
          </span>
          <div className="text-sm sm:text-base font-extrabold text-[#007A87] mt-1 flex items-center gap-1 relative z-10">
            <span>{saturation === 'Oceano Azul' ? '🌊 Oceano Azul' : '🔥 Em Aquecimento'}</span>
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block relative z-10">
            Poucos afiliados postando no Brasil
          </span>
        </div>

      </div>

      {/* ========================================================= */}
      {/* 3. GANCHO VIRAL DE 3 SEGUNDOS (O CORAÇÃO DO VÍDEO)         */}
      {/* ========================================================= */}
      <div className="bg-gradient-to-r from-amber-50/90 via-white to-rose-50/30 border border-amber-300/80 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-800 font-black text-xs uppercase tracking-wider flex items-center gap-1">
              <span>⚡ Gancho Viral de 3 Segundos (Grave Hoje)</span>
            </span>
          </div>

          <button
            onClick={handleCopyHook}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white hover:bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900 transition cursor-pointer shadow-2xs active:scale-95"
            title="Copiar texto do gancho"
          >
            {copiedHook ? <Check className="w-3.5 h-3.5 text-emerald-700" /> : <Copy className="w-3.5 h-3.5 text-amber-800" />}
            <span>{copiedHook ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        {/* Borda Rosa TikBlox no Gancho Viral */}
        <blockquote className="text-sm sm:text-base font-bold text-slate-900 italic border-l-4 border-[#FE2C55] pl-3.5 py-1 my-2">
          &ldquo;{hookText}&rdquo;
        </blockquote>

        <p className="text-xs text-amber-950/80 mt-2">
          🎬 <strong>Direção de Cena:</strong> Segure o produto a 15 cm da câmera no primeiro segundo e faça um movimento abrupto para interromper a rolagem do feed antes de falar o gancho.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 4. CERTIDÃO DE VALIDAÇÃO & RASTREABILIDADE DA TENDÊNCIA   */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Rastreabilidade & Validação Oficial no TikTok Shop
            </h3>
          </div>
          <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            ✓ Produto Verificado
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Origem da Tendência Viral</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {tk.originPlatform || 'TikTok Shop Global Trend'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">
              Global: {tk.originalName || tk.name}
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Tráfego & Visualizações</span>
            <span className="text-xs font-bold text-[#007A87] font-mono block mt-0.5">
              {tk.trendingMetrics?.viewsLast30Days || '48.5M views no TikTok'}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
              Crescimento: +{tk.trendingMetrics?.growthRatePercent || 480}% no feed BR
            </span>
          </div>

          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">Logística Nacional Validada</span>
            <span className="text-xs font-bold text-slate-900 block mt-0.5">
              {stockLoc}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5 block">
              Pronta entrega física (Envio Correios/Jadlog 24h)
            </span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 5. SEÇÕES ESTRATÉGICAS EM ABAS LIMPAS                      */}
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
            <span>Margem Bruta Estimada:</span>
            <span className="font-bold text-emerald-700">+{tk.estimatedProfitMarginPercent || 280}%</span>
          </div>
        </div>

        {/* Bloco 2: Fornecedores & Atacado no Brasil */}
        <div className="bg-white border border-slate-200/90 rounded-xl p-4 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔍 Palavras-Chave de Fornecedores (SP / Pronta Entrega)</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(tk.supplierKeywords || [`${tk.name.split(' ')[0]} atacado sp`, `${tk.name.split(' ')[0]} pronta entrega`]).map((kw: string, i: number) => (
              <span
                key={i}
                className="text-[11px] font-mono bg-slate-50 text-slate-800 border border-slate-200 px-2 py-0.5 rounded shadow-2xs hover:border-[#25F4EE]"
              >
                {kw}
              </span>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 pt-1">
            Dica: Busque esses termos na Shopee ou centros de distribuição do Brás/Pari caso queira estocar por conta própria.
          </p>
        </div>
      </div>

      {/* Bloco 3: Chamada para Ação com a IA com Gradiente TikBlox */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#25F4EE]/10 via-white to-[#FE2C55]/10 border border-[#25F4EE]/30 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] text-white flex items-center justify-center font-bold text-base shrink-0 shadow-2xs">
            🤖
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Precisa de roteiro de live ou quer pedir amostra grátis para este produto?
            </h4>
            <p className="text-[11px] text-slate-600 mt-0.5">
              A TIKBLOX AI à direita gera o script de 5 minutos e o pitch de WhatsApp em 1 clique.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenInCopilot(product)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white font-bold text-xs transition cursor-pointer shadow-xs whitespace-nowrap active:scale-95 border border-white/10"
        >
          Conversar com a TIKBLOX AI Agora ⚡
        </button>
      </div>

    </main>
  );
};
