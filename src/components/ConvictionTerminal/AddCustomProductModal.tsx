import React, { useState } from 'react';
import { X, Sparkles, Plus, Package, DollarSign, Target, ShieldCheck } from 'lucide-react';
import { TrendingProduct, ProductNiche } from '../../types';
import { enrichWithTikTokShopData } from '../../data/tiktokShopEnricher';

interface AddCustomProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: TrendingProduct) => void;
}

export const AddCustomProductModal: React.FC<AddCustomProductModalProps> = ({
  isOpen,
  onClose,
  onAddProduct,
}) => {
  const [name, setName] = useState('');
  const [productUrl, setProductUrl] = useState('');
  const [niche, setNiche] = useState<ProductNiche>('beauty');
  const [priceBRL, setPriceBRL] = useState('59.90');
  const [commissionPct, setCommissionPct] = useState('22');
  const [stockLocation, setStockLocation] = useState('São Paulo - SP (Pronta Entrega)');
  const [videoCount, setVideoCount] = useState('5');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const numPrice = Number(priceBRL.replace(',', '.')) || 49.90;
    const numCommPct = Number(commissionPct.replace(',', '.')) || 20;
    const numVideos = Number(videoCount) || 5;
    const numCommVal = Number(((numPrice * numCommPct) / 100).toFixed(2));
    const breakEven = Math.max(1, Math.ceil(numPrice / Math.max(1, numCommVal)));

    const newProd: TrendingProduct = {
      id: `custom_${Date.now()}`,
      name: name.trim(),
      originalName: name.trim(),
      niche,
      nicheLabel: niche.toUpperCase(),
      originCountry: 'US',
      originPlatform: 'TikTok Shop Brasil (Inserção Direta)',
      waveStage: 'early_wave',
      waveStageLabel: 'Oceano Azul / Entrada',
      viralityScore: 96,
      saturationInBrazil: 'Muito Baixa',
      estimatedCostUSD: Number((numPrice / 5.8).toFixed(2)),
      estimatedPriceBRL: numPrice,
      estimatedProfitMarginPercent: 280,
      culturalFitReason: 'Produto validado pelo criador com apelo imediato de compra por impulso.',
      brazilEntryStatus: 'Pronta entrega confirmada',
      targetAudience: 'Público consumidor do TikTok Brasil',
      iconType: 'Package',
      highlights: ['Pronta entrega nacional', 'Baixíssima concorrência', 'Break-even rápido'],
      adHooks: [`Se você mora no Brasil e ainda não viu esse ${name.split(' ')[0]}, você tá vivendo errado!`],
      supplierKeywords: [`${name.split(' ')[0]} atacado sp`, `${name.split(' ')[0]} pronta entrega`],
      logisticsComplexity: 'Fácil (Leve / Sem Bateria)',
      trendingMetrics: {
        viewsLast30Days: '15.4M views',
        growthRatePercent: 420,
        searchVolumeBR: 'Emergindo agora',
      },
      discoveredAt: new Date().toISOString(),
      customProductUrl: productUrl.trim() || undefined,
      tiktokShop: {
        hasBrazilStock: true,
        stockLocation,
        commissionRatePercent: numCommPct,
        commissionValueBRL: numCommVal,
        freeSampleAvailable: true,
        minFollowersForSample: 1000,
        activeCreatorsCount: numVideos,
        recentSalesCount: 1850,
        saturationLevel: 'Oceano Azul',
        tiktokShopAffiliateLink: productUrl.trim() || 'https://seller-br.tiktok.com',
        topViralHook: `O motivo pelo qual o ${name.split(' ')[0]} está esgotando nas lojas de São Paulo:`,
        customProductUrl: productUrl.trim() || undefined,
      },
    };

    const enriched = enrichWithTikTokShopData(newProd);
    onAddProduct(enriched);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 select-none animate-in fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-lg shadow-2xl overflow-hidden flex flex-col text-slate-900">
        
        {/* Topo */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#25F4EE] to-[#FE2C55] text-white flex items-center justify-center font-bold text-sm shadow-2xs">
              💎
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                Analisar Meu Produto (Oceano Azul)
              </h3>
              <p className="text-[11px] text-slate-500">
                Calcule na hora o risco, break-even e gancho para o produto que você encontrou.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-3.5 text-xs">
          
          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Nome do Produto no TikTok Shop:
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Mini Seladora Térmica Portátil de Alimentos"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#25F4EE] focus:ring-2 focus:ring-[#25F4EE]/20 outline-none font-medium"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Endereço / Link do Produto (TikTok Shop ou Loja Nacional):
            </label>
            <input
              type="url"
              value={productUrl}
              onChange={(e) => setProductUrl(e.target.value)}
              placeholder="Ex: https://shop.tiktok.com/... ou https://shopee.com.br/..."
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#25F4EE] focus:ring-2 focus:ring-[#25F4EE]/20 outline-none font-medium text-xs text-slate-800"
            />
            <span className="text-[10px] text-slate-400 mt-0.5 block">
              Cole o link direto do produto para abrir com 1 clique quando for comprar a amostra.
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Nicho / Categoria:
              </label>
              <select
                value={niche}
                onChange={(e) => setNiche(e.target.value as ProductNiche)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#25F4EE] outline-none font-medium bg-white"
              >
                <option value="beauty">Beleza & Cuidados</option>
                <option value="home">Casa & Cozinha</option>
                <option value="tech">Tech & Celular</option>
                <option value="accessories">Bolsas & Acessórios</option>
                <option value="fitness">Saúde & Fitness</option>
                <option value="pets">Pets & Animais</option>
                <option value="kids">Kids & Bebês</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Vídeos no Feed BR (Aprox):
              </label>
              <input
                type="number"
                min="0"
                max="50"
                value={videoCount}
                onChange={(e) => setVideoCount(e.target.value)}
                placeholder="Ex: 4 vídeos"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#25F4EE] outline-none font-medium"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Custo da Amostra (Seu Bolso R$):
              </label>
              <input
                type="text"
                required
                value={priceBRL}
                onChange={(e) => setPriceBRL(e.target.value)}
                placeholder="Ex: 49.90"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#25F4EE] outline-none font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
                Comissão de Afiliado (%):
              </label>
              <input
                type="text"
                required
                value={commissionPct}
                onChange={(e) => setCommissionPct(e.target.value)}
                placeholder="Ex: 22"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#25F4EE] outline-none font-mono font-bold text-emerald-700"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-700 uppercase mb-1">
              Local do Estoque Nacional:
            </label>
            <input
              type="text"
              value={stockLocation}
              onChange={(e) => setStockLocation(e.target.value)}
              placeholder="Ex: São Paulo - SP (Pronta Entrega 24h)"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:border-[#25F4EE] outline-none font-medium"
            />
          </div>

          {/* Botões */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-[#FE2C55] to-[#FF0050] text-white font-extrabold shadow-sm hover:brightness-105 transition cursor-pointer flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Gerar Diagnóstico TikBlox</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
