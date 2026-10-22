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
  const imgUrl = String(tk.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80');
  const affLink = String(tk.tiktokShopAffiliateLink || tk.tiktokShop?.tiktokShopAffiliateLink || 'https://seller-br.tiktok.com');

  const handleCopyHook = () => {
    navigator.clipboard.writeText(hookText);
    setCopiedHook(true);
    setTimeout(() => setCopiedHook(false), 2000);
  };

  return (
    <main className="flex-1 min-w-0 bg-[#F8FAFC] overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5 text-slate-900 select-none">
      
      {/* ========================================================= */}
      {/* 1. CABEÇALHO DO PRODUTO EM FOCO COM TOQUES TIKBLOX         */}
      {/* ========================================================= */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs relative overflow-hidden">
        
        {/* Barra Decorativa Superior com Gradiente do Logo */}
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#25F4EE] via-[#FE2C55] to-[#25F4EE]" />

        <div className="flex items-start sm:items-center gap-3.5 min-w-0">
          <img
            src={imgUrl}
            alt={tk.name}
            className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover border border-slate-200 shadow-2xs shrink-0 bg-slate-50"
            onError={(e) => {
              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&q=80';
            }}
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-[#25F4EE]/10 text-[#007A87] border border-[#25F4EE]/40">
                {tk.nicheLabel || 'Nicho'}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-300">
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
            className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-[#FE2C55] via-[#FF0050] to-[#FF3B5C] hover:brightness-105 text-white font-extrabold text-xs transition cursor-pointer shadow-[0_4px_18px_rgba(254,44,85,0.35)] active:scale-95"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ver no TikTok Shop</span>
            <ExternalLink className="w-3 h-3 opacity-80" />
          </a>

          <button
            onClick={() => onOpenCalculator(product)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-slate-900 transition cursor-pointer active:scale-95 shadow-2xs"
            title="Simular Lucro e Taxas de Envio"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#007A87]" />
            <span className="hidden sm:inline">Simular</span>
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
        </div>
      </div>

      {/* ========================================================= */}
      {/* 2. 4 MÉTRICAS ESSENCIAIS DE AFILIADO TIKTOK SHOP           */}
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
      {/* 4. SEÇÕES ESTRATÉGICAS EM ABAS LIMPAS                      */}
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
              O Copiloto IA à direita gera o script de 5 minutos e o pitch de WhatsApp em 1 clique.
            </p>
          </div>
        </div>

        <button
          onClick={() => onOpenInCopilot(product)}
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-[#0F172A] hover:bg-black text-white font-bold text-xs transition cursor-pointer shadow-xs whitespace-nowrap active:scale-95 border border-white/10"
        >
          Conversar com a IA Agora ⚡
        </button>
      </div>

    </main>
  );
};
