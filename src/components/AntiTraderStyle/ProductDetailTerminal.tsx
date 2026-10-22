import React, { useState } from 'react';
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
  Users
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

  if (!product) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-slate-500 bg-white">
        <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
          🛍️
        </div>
        <h3 className="text-base font-bold text-slate-800">Nenhum produto selecionado</h3>
        <p className="text-xs text-slate-500 max-w-sm mt-1">
          Clique em qualquer produto na lista à esquerda para abrir o Raio-X completo e a estratégia de vendas.
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
  const imgUrl = String(tk.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80');
  const affLink = String(tk.tiktokShopAffiliateLink || tk.tiktokShop?.tiktokShopAffiliateLink || 'https://seller-br.tiktok.com');

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookText);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  return (
    <main className="flex-1 min-w-0 bg-white overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      
      {/* ========================================================= */}
      {/* 1. CABEÇALHO DO PRODUTO EM FOCO                           */}
      {/* ========================================================= */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-2xs">
        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <img
            src={imgUrl}
            alt={tk.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                {tk.nicheLabel || 'Nicho'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                📦 {stockLoc}
              </span>
              {tk.originCountry && (
                <span className="text-[10px] font-semibold text-slate-500">
                  Origem: {tk.originCountry === 'US' ? '🇺🇸 EUA' : '🇨🇳 China / Global'}
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-xl font-black text-slate-900 leading-tight">
              {tk.name}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5 font-medium line-clamp-1">
              {tk.originalName || tk.name}
            </p>
          </div>
        </div>

        {/* Botões de Ação Imediata */}
        <div className="flex items-center gap-2 w-full md:w-auto shrink-0 flex-wrap">
          <a
            href={affLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#FE2C55] to-[#FF0050] hover:brightness-110 text-white font-extrabold text-xs shadow-md shadow-[#FE2C55]/20 active:scale-95 transition-all cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Afiliar-se no TikTok Shop BR</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>

          <button
            onClick={() => onOpenInCopilot(product)}
            className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-800 font-bold text-xs transition cursor-pointer active:scale-95 shadow-2xs"
            title="Abrir no Copiloto IA à direita"
          >
            <Sparkles className="w-4 h-4 text-blue-600" />
            <span>Abrir no Copiloto IA</span>
          </button>

          <button
            onClick={() => onToggleSave(product.id)}
            className={`p-2.5 rounded-xl border transition cursor-pointer active:scale-95 shadow-2xs ${
              isSaved
                ? 'bg-amber-50 border-amber-300 text-amber-600'
                : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
            }`}
            title="Salvar produto"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          <button
            onClick={() => onOpenCalculator(product)}
            className="p-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Simular Lucro Líquido e Custos"
          >
            <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. GRID DE 4 MÉTRICAS ESSENCIAIS (CLEAN ANTI-TRADER CARDS)*/}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Sua Comissão por Venda
          </span>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-emerald-700 font-mono">
              R$ {commissionVal.toFixed(2)}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              ({commissionPct}%)
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            Preço sugerido: R$ {priceBRL.toFixed(2)}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Estoque no Brasil
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-base sm:text-lg font-black text-slate-900 truncate">
              {stockLoc.split('(')[0].trim()}
            </span>
          </div>
          <span className="text-[10px] text-emerald-700 font-bold mt-0.5 block">
            Envio rápido sem taxa alfandegária
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Amostra Grátis
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`text-base sm:text-lg font-black ${isSample ? 'text-emerald-700' : 'text-slate-700'}`}>
              {isSample ? 'Liberada (+1k criadores)' : 'Sob Consulta'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {isSample ? 'Envio sem custo pelo vendedor' : 'Negocie via DM no centro de criadores'}
          </span>
        </div>

        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-2xs">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
            Saturação de Criadores
          </span>
          <div className="mt-1 flex items-center gap-1.5">
            <span className={`text-base sm:text-lg font-black ${saturation === 'Oceano Azul' || saturation === 'Baixa' ? 'text-cyan-700' : 'text-slate-800'}`}>
              {saturation === 'Oceano Azul' || saturation === 'Baixa' ? '🌊 Oceano Azul' : 'Demanda Validada'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 mt-0.5 block">
            {saturation === 'Oceano Azul' || saturation === 'Baixa' ? 'Poucos criadores divulgando no BR' : 'Volume alto de compras diárias'}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* 3. CARTÃO DE DESTAQUE: GANCHO VIRAL DE 3 SEGUNDOS         */}
      {/* ========================================================= */}
      <div className="bg-amber-50/70 border border-amber-300 rounded-xl p-4 sm:p-5 shadow-2xs">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-700 font-black text-xs uppercase tracking-wider flex items-center gap-1">
              <span>⚡ Gancho Viral de 3 Segundos (Grave Hoje)</span>
            </span>
          </div>

          <button
            onClick={handleCopyHook}
            className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-white hover:bg-amber-100 border border-amber-300 text-xs font-bold text-amber-900 transition cursor-pointer shadow-2xs active:scale-95"
            title="Copiar texto do gancho"
          >
            {copiedHook ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-amber-800" />}
            <span>{copiedHook ? 'Copiado!' : 'Copiar'}</span>
          </button>
        </div>

        <blockquote className="text-sm sm:text-base font-bold text-slate-900 italic border-l-4 border-amber-400 pl-3 py-0.5 my-2">
          &ldquo;{hookText}&rdquo;
        </blockquote>

        <p className="text-xs text-slate-600 mt-2">
          💡 <strong>Direção de Cena:</strong> Segure o produto a 15 cm da câmera no primeiro segundo e faça um movimento abrupto para interromper a rolagem do feed antes de falar o gancho.
        </p>
      </div>

      {/* ========================================================= */}
      {/* 4. SEÇÕES ESTRATÉGICAS EM ABAS LIMPAS                     */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Bloco 1: Por Que Vende Rápido no Brasil */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🎯 Por Que Vende Rápido no Brasil</span>
          </h3>
          <p className="text-xs text-slate-700 leading-relaxed">
            {tk.culturalFitReason || 'Produto altamente visual que resolve dor diária com forte apelo em vídeos curtos.'}
          </p>
          <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-mono">
            <span>Margem Bruta Estimada:</span>
            <span className="font-bold text-emerald-700">+{tk.estimatedProfitMarginPercent || 280}%</span>
          </div>
        </div>

        {/* Bloco 2: Fornecedores & Atacado no Brasil */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 shadow-2xs space-y-2">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
            <span>🔍 Palavras-Chave de Fornecedores (SP / Pronta Entrega)</span>
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {(tk.supplierKeywords || [`${tk.name.split(' ')[0]} atacado sp`, `${tk.name.split(' ')[0]} pronta entrega`]).map((kw: string, i: number) => (
              <span
                key={i}
                className="text-[11px] font-mono bg-white text-slate-700 border border-slate-300 px-2 py-0.5 rounded shadow-2xs"
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

      {/* Bloco 3: Chamada para Ação com a IA */}
      <div className="p-4 rounded-xl bg-blue-50/70 border border-blue-200 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
            🤖
          </div>
          <div>
            <h4 className="text-xs font-bold text-blue-900">
              Precisa de roteiro de live ou quer pedir amostra grátis para este produto?
            </h4>
            <p className="text-[11px] text-blue-700 mt-0.5">
              O Copiloto IA à direita gera o script de 5 minutos e o pitch de WhatsApp em 1 clique.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenInCopilot(product)}
          className="w-full sm:w-auto px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition cursor-pointer shadow-xs whitespace-nowrap active:scale-95"
        >
          Conversar com a IA Agora ➔
        </button>
      </div>

    </main>
  );
};
