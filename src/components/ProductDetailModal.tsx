import React, { useEffect, useState } from 'react';
import {
  X,
  TrendingUp,
  ExternalLink,
  Copy,
  Check,
  ShieldCheck,
  Package,
  Calculator,
  Video,
  Layers,
  Sparkles,
  ShoppingBag,
  Cloud,
  Share2,
  Globe,
  FileDown,
  Loader2,
  FileText,
  MapPin,
  Activity,
  Flame,
  Radio,
} from 'lucide-react';
import { TrendingProduct, DeepDiveAnalysis } from '../types';
import { getProductDeepDive } from '../services/api';
import { useTranslation } from '../i18n/LanguageContext';
import { downloadProductViabilityPDF } from '../services/pdfExportService';
import { SocialProofBadge } from './SocialProofBadge';

interface ProductDetailModalProps {
  product: TrendingProduct | null;
  onClose: () => void;
  onOpenCalculator: (product: TrendingProduct) => void;
  onOpenCreativeGenerator: (product: TrendingProduct) => void;
  onOpenWorkspaceHub?: (tab?: 'drive' | 'gmail' | 'classroom') => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCalculator,
  onOpenCreativeGenerator,
  onOpenWorkspaceHub,
}) => {
  const { t, language } = useTranslation();
  const [analysis, setAnalysis] = useState<DeepDiveAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [pdfExported, setPdfExported] = useState(false);

  const handleExportPDF = async () => {
    if (!product || isExportingPdf) return;
    setIsExportingPdf(true);
    try {
      const res = await downloadProductViabilityPDF({
        product,
        analysis,
        language: language === 'en' ? 'en' : 'pt',
      });
      if (res.success) {
        setPdfExported(true);
        setTimeout(() => setPdfExported(false), 3500);
      }
    } catch (err) {
      console.error('Failed to export PDF:', err);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleShareProduct = async () => {
    if (!product) return;
    const url = `https://tikblox.com.br/?product=${encodeURIComponent(product.id)}`;
    const shareData = {
      title: `${product.name} | TIKBLOX`,
      text: language === 'en'
        ? `Check out this viral trend: ${product.name} with ${product.estimatedProfitMarginPercent}% profit margin!`
        : `Confira essa tendência viral: ${product.name} com ${product.estimatedProfitMarginPercent}% de margem!`,
      url,
    };

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User closed native dialog
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      // Fallback
    }
  };

  useEffect(() => {
    if (!product) return;
    let isMounted = true;
    setIsLoading(true);

    getProductDeepDive(product).then((data) => {
      if (isMounted) {
        setAnalysis(data);
        setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [product]);

  if (!product) return null;

  const handleCopyHook = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // Verification & supplier search URLs
  const aliexpressSearchUrl = `https://www.aliexpress.com/wholesale?SearchText=${encodeURIComponent(
    product.supplierKeywords[0] || product.originalName
  )}`;
  const googleTrendsUrl = `https://trends.google.com/trends/explore?geo=BR&q=${encodeURIComponent(
    product.name.split(' ').slice(0, 3).join(' ')
  )}`;
  const cjDropshippingUrl = `https://cjdropshipping.com/search/${encodeURIComponent(
    product.supplierKeywords[0] || product.originalName
  )}.html`;
  const mercadoLivreUrl = `https://lista.mercadolivre.com.br/${encodeURIComponent(
    product.name.split(' ').slice(0, 3).join(' ')
  )}`;
  const shopeeBrUrl = `https://shopee.com.br/search?keyword=${encodeURIComponent(
    product.name.split(' ').slice(0, 3).join(' ')
  )}`;
  const tiktokViralUrl = `https://www.tiktok.com/search?q=${encodeURIComponent(
    product.originalName
  )}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 p-4 sm:p-5 sticky top-0 z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="rounded-full bg-cyan-500/20 border border-cyan-500/30 px-2.5 py-0.5 text-[10px] font-bold text-cyan-300 uppercase tracking-wider">
                Raio-X de Inteligência TIKBLOX
              </span>
              <span className="text-xs text-slate-400 font-medium">
                {product.nicheLabel}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white leading-tight">
              {product.name}
            </h2>
            <p className="text-xs text-slate-400 italic">
              {language === 'en' ? 'International search term:' : 'Nome de busca internacional:'} {product.originalName}
            </p>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                pdfExported
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
              } disabled:opacity-50`}
              title={language === 'en' ? 'Export Product Viability Summary Sheet to PDF' : 'Exportar Ficha de Viabilidade e Margem em PDF'}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>{language === 'en' ? 'Exporting...' : 'Gerando...'}</span>
                </>
              ) : pdfExported ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'en' ? 'PDF Exported!' : 'PDF Baixado!'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{language === 'en' ? 'Export to PDF' : 'Exportar PDF'}</span>
                </>
              )}
            </button>

            <button
              onClick={handleShareProduct}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                copiedLink
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-white border-white/10'
              }`}
              title={language === 'en' ? 'Share dynamic link with social preview' : 'Compartilhar link dinâmico com preview para redes sociais'}
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{language === 'en' ? 'Link Copied!' : 'Link Copiado!'}</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-[#25F4EE]" />
                  <span className="hidden sm:inline">{language === 'en' ? 'Share' : 'Compartilhar'}</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title={language === 'en' ? 'Close' : 'Fechar'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Social Proof & Trend Velocity Banner */}
          <SocialProofBadge product={product} />

          {/* Arbitrage Snapshot Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-[11px] text-slate-400 block mb-0.5">{t('card_supplier_cost')}</span>
              <span className="text-base font-bold text-white">${product.estimatedCostUSD.toFixed(2)} USD</span>
              <span className="text-[10px] text-slate-500 block">≈ R$ {(product.estimatedCostUSD * 5.6).toFixed(2)}</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-[11px] text-slate-400 block mb-0.5">{t('card_sell_price')}</span>
              <span className="text-base font-bold text-cyan-300">R$ {product.estimatedPriceBRL.toFixed(2)}</span>
              <span className="text-[10px] text-slate-500 block">{language === 'en' ? 'Validated retail price' : 'Preço de saída validado'}</span>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-3">
              <span className="text-[11px] text-emerald-300 block mb-0.5">{language === 'en' ? 'Gross Margin' : 'Margem Bruta'}</span>
              <span className="text-base font-black text-emerald-400">+{product.estimatedProfitMarginPercent}%</span>
              <span className="text-[10px] text-emerald-400/80 block">{language === 'en' ? 'High profit margin' : 'Lucro bruto expressivo'}</span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950/70 p-3">
              <span className="text-[11px] text-slate-400 block mb-0.5">{language === 'en' ? 'Virality Score' : 'Score de Viralidade'}</span>
              <div className="flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                <span className="text-base font-bold text-white">{product.viralityScore}/100</span>
              </div>
              <span className="text-[10px] text-cyan-400 block">{product.trendingMetrics.searchVolumeBR}</span>
            </div>
          </div>

          {/* Engagement Pulse & Virality Analytics */}
          <div className="rounded-xl border border-cyan-500/40 bg-slate-950/80 p-4 relative overflow-hidden shadow-lg shadow-cyan-950/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-[#25F4EE]">
                  <Activity className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white flex items-center gap-1.5">
                    <span>{language === 'en' ? 'Engagement Pulse & Virality Radar' : 'Pulso de Engajamento & Radar de Viralidade'}</span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                      <Radio className="w-3 h-3 text-[#25F4EE] animate-ping" />
                      Live Feed
                    </span>
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {language === 'en'
                      ? 'Simulated real-time social engagement metrics across global feeds'
                      : 'Métricas de engajamento social em tempo real simuladas nas redes globais'}
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[10px] text-slate-400 block">{language === 'en' ? 'Viral Index' : 'Índice Viral'}</span>
                <span className="text-lg font-black text-[#25F4EE]">{product.viralityScore} / 100</span>
              </div>
            </div>

            {/* Viral Score Progress Bar */}
            <div className="mb-4 space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-300 flex items-center gap-1">
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  {language === 'en' ? 'Viral Momentum Force' : 'Força de Momento Viral'}
                </span>
                <span className="text-cyan-300">{product.viralityScore}%</span>
              </div>
              <div className="w-full bg-slate-900 rounded-full h-2.5 p-0.5 border border-slate-800">
                <div
                  className="bg-gradient-to-r from-cyan-500 via-[#25F4EE] to-emerald-400 h-full rounded-full transition-all duration-500 shadow-sm shadow-cyan-500/50"
                  style={{ width: `${Math.min(100, Math.max(15, product.viralityScore))}%` }}
                />
              </div>
            </div>

            {/* 3 Key Engagement Pulse Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
                  {language === 'en' ? 'Trend Velocity' : 'Velocidade da Tendência'}
                </span>
                <div>
                  <span className="text-sm font-black text-cyan-300 block">
                    +{product.trendingMetrics.growthRatePercent}% / sem
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    {product.trendingMetrics.searchVolumeBR}
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                  {language === 'en' ? 'Social Feed Mentions' : 'Menções em Feeds Sociais'}
                </span>
                <div>
                  <span className="text-sm font-black text-emerald-400 block">
                    {(product.viralityScore * 412).toLocaleString('pt-BR')} menções
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    TikTok US, Douyin & Reels
                  </span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col justify-between">
                <span className="text-[11px] text-slate-400 flex items-center gap-1 mb-1">
                  <Layers className="w-3.5 h-3.5 text-amber-400" />
                  {language === 'en' ? 'Market Maturity Stage' : 'Estágio de Maturidade'}
                </span>
                <div>
                  <span className="text-sm font-black text-amber-300 block">
                    {product.waveStageLabel}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Saturação BR: {product.saturationInBrazil}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Viability Summary Sheet & Export to PDF Action Banner */}
          <div className="rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900/70 to-slate-950/90 p-4 sm:p-5 shadow-lg shadow-cyan-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-300">
                    <FileText className="w-4 h-4 text-cyan-400" />
                    {language === 'en' ? 'Viability Summary & Arbitrage Sheet' : 'Ficha de Viabilidade & Arbitragem'}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-800/90 px-2.5 py-0.5 text-[10px] font-semibold text-slate-300 border border-slate-700">
                    <MapPin className="w-2.5 h-2.5 text-cyan-400" />
                    {product.originCountry === 'US'
                      ? 'Origem: EUA (US)'
                      : product.originCountry === 'CN'
                      ? 'Origem: China (CN)'
                      : `Origem: ${product.originCountry}`}{' '}
                    • {product.originPlatform}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                  {language === 'en' ? (
                    <>
                      Supplier cost of <strong className="text-white">${product.estimatedCostUSD.toFixed(2)} USD</strong> (≈ R$ {(product.estimatedCostUSD * 5.82).toFixed(2)}) with{' '}
                      <strong className="text-emerald-400">+{product.estimatedProfitMarginPercent}% gross margin</strong> and recommended retail price of{' '}
                      <strong className="text-cyan-300">R$ {product.estimatedPriceBRL.toFixed(2)}</strong>. Trend validated on {product.originPlatform} with {product.trendingMetrics.viewsLast30Days} recent views and low Brazilian saturation.
                    </>
                  ) : (
                    <>
                      Custo de fornecedor de <strong className="text-white">${product.estimatedCostUSD.toFixed(2)} USD</strong> (≈ R$ {(product.estimatedCostUSD * 5.82).toFixed(2)}) com{' '}
                      <strong className="text-emerald-400">+{product.estimatedProfitMarginPercent}% de margem bruta</strong> e preço sugerido de venda de{' '}
                      <strong className="text-cyan-300">R$ {product.estimatedPriceBRL.toFixed(2)}</strong>. Tendência validada no {product.originPlatform} com {product.trendingMetrics.viewsLast30Days} visualizações e saturação incipiente no Brasil.
                    </>
                  )}
                </p>

                <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                  <span>
                    {language === 'en' ? 'Estimated Unit Net Profit:' : 'Lucro Líquido Unitário Projetado:'}{' '}
                    <strong className="text-emerald-400 font-bold">
                      ≈ R$ {(product.estimatedPriceBRL - product.estimatedCostUSD * 5.82 * 1.44 - (product.estimatedPriceBRL * 0.05 + 1) - 32).toFixed(2)}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    {language === 'en' ? 'Complexity:' : 'Logística:'}{' '}
                    <strong className="text-slate-200">{product.logisticsComplexity}</strong>
                  </span>
                </div>
              </div>

              <div className="shrink-0 flex flex-col items-stretch sm:items-end gap-1.5">
                <button
                  onClick={handleExportPDF}
                  disabled={isExportingPdf}
                  className={`flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition cursor-pointer shadow-md disabled:opacity-50 ${
                    pdfExported
                      ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20'
                      : 'bg-gradient-to-r from-cyan-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-cyan-500/25'
                  }`}
                  title={language === 'en' ? 'Export executive 1-page PDF summary sheet' : 'Exportar ficha resumo executiva em PDF de 1 página'}
                >
                  {isExportingPdf ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                      <span>{language === 'en' ? 'Exporting PDF...' : 'Gerando PDF...'}</span>
                    </>
                  ) : pdfExported ? (
                    <>
                      <Check className="w-4 h-4 text-slate-950" />
                      <span>{language === 'en' ? 'PDF Exported!' : 'PDF Baixado com Sucesso!'}</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-slate-950" />
                      <span>{language === 'en' ? 'Export Viability Sheet (PDF)' : 'Exportar Ficha em PDF'}</span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-slate-400 text-center sm:text-right">
                  {language === 'en' ? 'Clean 1-page executive sheet' : 'Ficha executiva pronta para impressão e análise'}
                </span>
              </div>
            </div>
          </div>

          {/* Diagnosis on Brazilian Competition */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <ShoppingBag className="w-4 h-4 text-cyan-400" />
              <span>{language === 'en' ? 'Market Diagnosis in Brazil (Blue Ocean)' : 'Diagnóstico de Mercado no Brasil (Oceano Azul)'}</span>
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-amber-400">Shopee Brasil</span>
                    <a
                      href={shopeeBrUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-amber-400 hover:text-amber-300 underline flex items-center gap-1"
                      title={language === 'en' ? 'Check Shopee Brazil competition now' : 'Checar concorrentes na Shopee Brasil agora'}
                    >
                      <span>{language === 'en' ? 'Check' : 'Checar'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {analysis?.competitionAnalysis.shopeeStatus || (language === 'en' ? 'Few international listings with slow delivery times.' : 'Poucos anúncios internacionais com prazos longos de entrega.')}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-yellow-400">Mercado Livre Full</span>
                    <a
                      href={mercadoLivreUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-yellow-400 hover:text-yellow-300 underline flex items-center gap-1"
                      title={language === 'en' ? 'Check Mercado Livre competition now' : 'Checar concorrentes no Mercado Livre agora'}
                    >
                      <span>{language === 'en' ? 'Check' : 'Checar'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {analysis?.competitionAnalysis.mercadoLivreStatus || (language === 'en' ? 'Rare sellers with local Brazilian warehouse stock.' : 'Raros vendedores com estoque nacional.')}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-bold text-pink-400">TikTok Viral</span>
                    <a
                      href={tiktokViralUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[10px] text-pink-400 hover:text-pink-300 underline flex items-center gap-1"
                      title={language === 'en' ? 'Check viral videos on TikTok' : 'Checar vídeos virais no TikTok'}
                    >
                      <span>{language === 'en' ? 'Check' : 'Checar'}</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>
                  <p className="text-slate-300 text-[11px]">
                    {analysis?.competitionAnalysis.tiktokShopBRStatus || (language === 'en' ? 'Total blindspot: viral videos without direct purchase links in Brazil.' : 'Ponto cego total: vídeos viralizam sem links diretos de compra.')}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-3 p-3 rounded-lg bg-cyan-950/30 border border-cyan-500/20 text-xs text-cyan-200">
              <strong className="text-cyan-300">{language === 'en' ? 'Cultural insights: ' : 'Entendimento cultural: '}</strong>
              {product.culturalFitReason}
            </div>
          </div>

          {/* Ad Hooks for TikTok/Reels */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>{language === 'en' ? 'Tested Ad Hooks (First 3 Seconds)' : 'Ganchos de Anúncio Testados (Primeiros 3 Segundos)'}</span>
              </h3>
              <button
                onClick={() => onOpenCreativeGenerator(product)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>{language === 'en' ? 'View Full Scripts' : 'Ver Roteiros Completos'}</span>
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-2">
              {product.adHooks.map((hook, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs hover:border-slate-700 transition"
                >
                  <p className="text-slate-200 italic font-medium">
                    "{hook}"
                  </p>
                  <button
                    onClick={() => handleCopyHook(hook, idx)}
                    className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white shrink-0 transition"
                    title={language === 'en' ? 'Copy hook' : 'Copiar gancho'}
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Direct Supplier Search Links */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-cyan-400" />
              <span>{language === 'en' ? 'Where to Find Fast Suppliers' : 'Onde Encontrar Fornecedores Rápidos'}</span>
            </h3>

            <div className="flex flex-wrap gap-2 text-xs">
              <a
                href={aliexpressSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 font-medium text-orange-300 hover:bg-orange-500/20 transition"
              >
                <span>AliExpress ({language === 'en' ? 'Direct Search' : 'Busca Direta'})</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={cjDropshippingUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 px-3 py-2 font-medium text-blue-300 hover:bg-blue-500/20 transition"
              >
                <span>CJ Dropshipping</span>
                <ExternalLink className="w-3 h-3" />
              </a>

              <a
                href={googleTrendsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 font-medium text-emerald-300 hover:bg-emerald-500/20 transition"
              >
                <span>Google Trends Brasil</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="mt-3 text-[11px] text-slate-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                <strong>{language === 'en' ? 'Logistics & Dispatch:' : 'Logística & Despacho:'}</strong> {product.logisticsComplexity}. {language === 'en' ? 'Suggested AliExpress Standard / Cainiao shipping with tracking in Brazil.' : 'Sugerido fornecedor com frete AliExpress Standard / Cainiao com rastreamento no Brasil.'}
              </span>
            </div>
          </div>

          {/* Action Checklist */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>{language === 'en' ? 'Action Plan to Ride This Wave' : 'Plano de Ação para Surfar Essa Onda'}</span>
            </h3>
            <ul className="space-y-1.5 text-xs text-slate-300">
              {analysis?.actionChecklist?.map((action, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-cyan-400 font-bold">✓</span>
                  <span>{action}</span>
                </li>
              )) || (
                <>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{language === 'en' ? 'Validate supplier with fast shipping on AliExpress or CJ Dropshipping.' : 'Validar fornecedor com envio rápido no AliExpress ou CJ Dropshipping.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{language === 'en' ? 'Build single-product landing page with international social proof.' : 'Criar landing page de produto único com prova social internacional.'}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-cyan-400 font-bold">✓</span>
                    <span>{language === 'en' ? 'Test the first 3 hooks in TikTok Ads or Reels ad campaigns.' : 'Testar os 3 primeiros ganchos em campanhas no TikTok Ads ou Reels.'}</span>
                  </li>
                </>
              )}
            </ul>
          </div>

          {/* Dynamic SEO & Social Sharing Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-[#25F4EE]" />
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  {language === 'en' ? 'Dynamic SEO & Social Metadata (tikblox.com.br)' : 'Metadados SEO & Compartilhamento (tikblox.com.br)'}
                </h4>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                <Check className="w-3 h-3 text-emerald-400" />
                {language === 'en' ? 'OpenGraph & Schema.org Active' : 'OpenGraph & Schema.org Ativo'}
              </span>
            </div>

            {/* Social Preview Snippet Card */}
            <div className="rounded-lg border border-slate-800 bg-[#0B0C10] p-3 mb-3 text-xs">
              <div className="flex items-center justify-between text-[10px] text-[#757788] mb-1 font-mono">
                <span>tikblox.com.br/?product={product.id}</span>
                <span className="text-[#25F4EE]">OpenGraph Product Card</span>
              </div>
              <p className="font-bold text-white text-xs line-clamp-1 mb-1">
                {product.name} | {language === 'en' ? 'TIKBLOX Viral Trends Radar' : 'Radar Viral TIKBLOX'}
              </p>
              <p className="text-[11px] text-[#A6A7B2] line-clamp-2 leading-relaxed">
                {language === 'en'
                  ? `${product.name}: Viral TikTok trend. Estimated profit +${product.estimatedProfitMarginPercent}% and virality ${product.viralityScore}/100. Arbitrage validation on tikblox.com.br.`
                  : `${product.name}: Tendência viral de produtos do exterior. Lucro estimado de R$ ${(product.estimatedPriceBRL - product.estimatedCostUSD * 5.6).toFixed(0)} (+${product.estimatedProfitMarginPercent}%) e viralidade ${product.viralityScore}/100.`}
              </p>
            </div>

            {/* Quick Share Buttons */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleShareProduct}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-1.5 text-xs font-semibold text-white transition cursor-pointer"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#25F4EE]" />}
                <span>{copiedLink ? (language === 'en' ? 'Link Copied!' : 'Link Copiado!') : (language === 'en' ? 'Copy Share Link' : 'Copiar Link')}</span>
              </button>

              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(
                  language === 'en'
                    ? `🔥 Viral Product on TIKBLOX: ${product.name} (Estimated Margin: +${product.estimatedProfitMarginPercent}%). Check out the deep-dive: https://tikblox.com.br/?product=${product.id}`
                    : `🔥 Produto viral no radar TIKBLOX: ${product.name} (Margem Estimada: +${product.estimatedProfitMarginPercent}%). Confira a análise completa: https://tikblox.com.br/?product=${product.id}`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition"
              >
                <span>WhatsApp</span>
                <ExternalLink className="w-3 h-3 text-emerald-400" />
              </a>

              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  language === 'en'
                    ? `🔥 Viral trend alert: ${product.name} with +${product.estimatedProfitMarginPercent}% estimated profit margin on @TIKBLOX:`
                    : `🔥 Alerta de produto viral: ${product.name} com +${product.estimatedProfitMarginPercent}% de margem estimada no @TIKBLOX:`
                )}&url=${encodeURIComponent(`https://tikblox.com.br/?product=${product.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-sky-500/30 bg-sky-500/10 hover:bg-sky-500/20 px-3 py-1.5 text-xs font-semibold text-sky-400 transition"
              >
                <span>X / Twitter</span>
                <ExternalLink className="w-3 h-3 text-sky-400" />
              </a>

              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://tikblox.com.br/?product=${product.id}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 rounded-lg border border-blue-500/30 bg-blue-500/10 hover:bg-blue-500/20 px-3 py-1.5 text-xs font-semibold text-blue-400 transition"
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-blue-400" />
              </a>
            </div>
          </div>

          {/* Grounding web sources if any */}
          {product.groundingSources && product.groundingSources.length > 0 && (
            <div className="pt-2 border-t border-slate-800 text-xs">
              <span className="text-[11px] font-semibold text-slate-400 block mb-2">
                {language === 'en' ? 'Tracked Web Sources & References:' : 'Fontes Web e Referências Rastreadas:'}
              </span>
              <div className="flex flex-wrap gap-2">
                {product.groundingSources.map((source, idx) => (
                  <a
                    key={idx}
                    href={source.uri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded bg-slate-800 px-2 py-1 text-[10px] text-cyan-300 hover:text-white"
                  >
                    <span>{source.title}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Controls */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-slate-400 text-center sm:text-left">
            <span>{language === 'en' ? 'Estimated average net margin: ' : 'Margem líquida média estimada: '}</span>
            <strong className="text-emerald-400 font-bold">+{product.estimatedProfitMarginPercent}%</strong>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <button
              onClick={handleExportPDF}
              disabled={isExportingPdf}
              className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-2 text-xs font-semibold transition cursor-pointer disabled:opacity-50 min-w-[120px] ${
                pdfExported
                  ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
                  : 'border-cyan-500/40 bg-cyan-950/30 hover:bg-cyan-900/40 text-cyan-300'
              }`}
              title={language === 'en' ? 'Export 1-page PDF Viability Sheet' : 'Exportar Ficha de Viabilidade em PDF'}
            >
              {isExportingPdf ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
                  <span>{language === 'en' ? 'Exporting...' : 'Gerando...'}</span>
                </>
              ) : pdfExported ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>{language === 'en' ? 'PDF Exported!' : 'PDF Baixado!'}</span>
                </>
              ) : (
                <>
                  <FileDown className="w-4 h-4 text-cyan-400" />
                  <span>{language === 'en' ? 'Export to PDF' : 'Exportar PDF'}</span>
                </>
              )}
            </button>

            {onOpenWorkspaceHub && (
              <button
                onClick={() => {
                  onClose();
                  onOpenWorkspaceHub('drive');
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/30 hover:bg-emerald-900/40 px-3.5 py-2 text-xs font-semibold text-emerald-300 transition min-w-[120px]"
                title="Salvar no Google Drive ou Enviar por Gmail"
              >
                <Cloud className="w-4 h-4 text-emerald-400" />
                <span>Google Workspace</span>
              </button>
            )}

            <button
              onClick={() => {
                onClose();
                onOpenCreativeGenerator(product);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 px-4 py-2 text-xs font-semibold text-white transition min-w-[130px]"
            >
              <Video className="w-4 h-4 text-cyan-400" />
              <span>{language === 'en' ? 'Generate UGC Scripts' : 'Gerar Roteiros UGC'}</span>
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCalculator(product);
              }}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 px-5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-cyan-500/20 transition min-w-[130px]"
            >
              <Calculator className="w-4 h-4 text-slate-950" />
              <span>{language === 'en' ? 'Simulate Net Profit' : 'Simular Lucro Líquido'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
