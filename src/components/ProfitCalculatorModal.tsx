import React, { useState, useMemo } from 'react';
import { X, Calculator, DollarSign, ArrowRight, ShieldCheck, HelpCircle } from 'lucide-react';
import { TrendingProduct } from '../types';
import { useTranslation } from '../i18n/LanguageContext';

interface ProfitCalculatorModalProps {
  product: TrendingProduct | null;
  onClose: () => void;
}

export const ProfitCalculatorModal: React.FC<ProfitCalculatorModalProps> = ({
  product,
  onClose,
}) => {
  const { t, language } = useTranslation();
  // Configurable parameters
  const [costUSD, setCostUSD] = useState<number>(product ? product.estimatedCostUSD : 10.0);
  const [usdRate, setUsdRate] = useState<number>(5.65);
  const [shippingBRL, setShippingBRL] = useState<number>(18.0);
  const [sellingPriceBRL, setSellingPriceBRL] = useState<number>(
    product ? product.estimatedPriceBRL : 179.9
  );
  const [applyRemessaConforme, setApplyRemessaConforme] = useState<boolean>(true);
  const [gatewayPercent, setGatewayPercent] = useState<number>(4.99);
  const [gatewayFixedBRL, setGatewayFixedBRL] = useState<number>(1.0);
  const [adSpendCpaBRL, setAdSpendCpaBRL] = useState<number>(35.0);

  // Financial calculations
  const calculation = useMemo(() => {
    const rawCostBRL = costUSD * usdRate;
    
    // Remessa Conforme tax estimation (approx 20% federal import tax for <=$50 + 17% ICMS, or standard)
    let importTaxBRL = 0;
    if (applyRemessaConforme) {
      if (costUSD <= 50) {
        // approx 20% federal + 17% ICMS = ~44% effective on CIF
        importTaxBRL = (rawCostBRL + shippingBRL) * 0.35;
      } else {
        // 60% above $50 + ICMS
        importTaxBRL = (rawCostBRL + shippingBRL) * 0.6;
      }
    }

    const totalProductCostBRL = rawCostBRL + shippingBRL + importTaxBRL;
    const gatewayFeeBRL = (sellingPriceBRL * (gatewayPercent / 100)) + gatewayFixedBRL;
    const totalExpensesBRL = totalProductCostBRL + gatewayFeeBRL + adSpendCpaBRL;
    const netProfitBRL = sellingPriceBRL - totalExpensesBRL;
    const netMarginPercent = sellingPriceBRL > 0 ? (netProfitBRL / sellingPriceBRL) * 100 : 0;
    const breakEvenRoas = (sellingPriceBRL - totalProductCostBRL - gatewayFeeBRL) > 0
      ? sellingPriceBRL / (sellingPriceBRL - totalProductCostBRL - gatewayFeeBRL)
      : 0;

    return {
      rawCostBRL,
      importTaxBRL,
      totalProductCostBRL,
      gatewayFeeBRL,
      totalExpensesBRL,
      netProfitBRL,
      netMarginPercent,
      breakEvenRoas,
    };
  }, [costUSD, usdRate, shippingBRL, sellingPriceBRL, applyRemessaConforme, gatewayPercent, gatewayFixedBRL, adSpendCpaBRL]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl text-slate-100 my-8 overflow-hidden max-h-[90vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 p-4 sm:p-5 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Calculator className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {language === 'en' ? 'Arbitrage & Net Profit Simulator' : 'Simulador de Viabilidade & Lucro Líquido'}
              </h2>
              <p className="text-xs text-slate-400">
                {product ? product.name : (language === 'en' ? 'Simulate import costs, taxes and net margin in BRL' : 'Simule importação, taxas e margem real em BRL')}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            title={language === 'en' ? 'Close' : 'Fechar'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          
          {/* Inputs Section */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Cost in USD */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'en' ? 'Supplier Cost (USD)' : 'Custo no Fornecedor (USD)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
                <input
                  type="number"
                  step="0.1"
                  min="0.5"
                  value={costUSD}
                  onChange={(e) => setCostUSD(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2 pl-7 pr-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Dólar Rate */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'en' ? 'USD to BRL Exchange Rate' : 'Cotação Dólar (BRL)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.05"
                  value={usdRate}
                  onChange={(e) => setUsdRate(parseFloat(e.target.value) || 1)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2 pl-8 pr-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* International Shipping */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'en' ? 'Estimated International Shipping (BRL)' : 'Frete Internacional Estimado (BRL)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">R$</span>
                <input
                  type="number"
                  step="1"
                  value={shippingBRL}
                  onChange={(e) => setShippingBRL(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2 pl-8 pr-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Selling Price in Brazil */}
            <div>
              <label className="block text-xs font-semibold text-emerald-400 mb-1">
                {language === 'en' ? 'Target Selling Price in Brazil (BRL)' : 'Preço de Venda Pretendido no BR (BRL)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-emerald-400 font-bold">R$</span>
                <input
                  type="number"
                  step="1"
                  value={sellingPriceBRL}
                  onChange={(e) => setSellingPriceBRL(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-emerald-500/50 bg-slate-950/90 py-2 pl-8 pr-3 text-xs font-bold text-white focus:border-emerald-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Estimated CPA (Ad Spend per purchase) */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">
                {language === 'en' ? 'Target Ad CPA / Acquisition Cost (BRL)' : 'CPA Tráfego Pago / Anúncios (BRL)'}
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">R$</span>
                <input
                  type="number"
                  step="1"
                  value={adSpendCpaBRL}
                  onChange={(e) => setAdSpendCpaBRL(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-950/80 py-2 pl-8 pr-3 text-xs text-white focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] text-slate-500">
                {language === 'en' ? 'Average R$ 25 to R$ 45 on TikTok Ads' : 'Média de R$ 25 a R$ 45 no TikTok Ads'}
              </span>
            </div>

            {/* Remessa Conforme Switch */}
            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer pt-2">
                <input
                  type="checkbox"
                  checked={applyRemessaConforme}
                  onChange={(e) => setApplyRemessaConforme(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500"
                />
                <span className="text-xs font-medium text-slate-200">
                  {language === 'en' ? 'Include Import Tax (Remessa Conforme)' : 'Incluir Imposto de Importação / Remessa Conforme'}
                </span>
              </label>
              <span className="text-[10px] text-slate-500 pl-6 mt-1">
                {language === 'en' ? 'Calculates effective customs tax bracket.' : 'Calcula alíquota com despacho aduaneiro seguro.'}
              </span>
            </div>

          </div>

          {/* Results Summary Cards */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/80 p-4 sm:p-5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              {language === 'en' ? 'Unit Economics Result' : 'Resultado da Operação Unitária'}
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {language === 'en' ? 'Product + Shipping + Tax' : 'Custo Mercadoria + Frete + Taxas'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-200">
                  R$ {calculation.totalProductCostBRL.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {language === 'en' ? 'Gateway Fee (4.99%)' : 'Taxa de Gateway (4.99%)'}
                </span>
                <span className="text-sm sm:text-base font-bold text-slate-300">
                  R$ {calculation.gatewayFeeBRL.toFixed(2)}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[11px] text-slate-400 block mb-0.5">
                  {language === 'en' ? 'Break-Even ROAS' : 'ROAS de Equilíbrio (Mínimo)'}
                </span>
                <span className="text-sm sm:text-base font-bold text-cyan-400">
                  {calculation.breakEvenRoas.toFixed(2)}x
                </span>
              </div>
            </div>

            {/* Net Profit Big Banner */}
            <div className={`p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-3 ${
              calculation.netProfitBRL > 0
                ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-300'
                : 'bg-rose-950/30 border-rose-500/40 text-rose-300'
            }`}>
              <div>
                <span className="text-xs font-semibold block uppercase">
                  {language === 'en' ? 'Actual Net Profit Per Unit' : 'Lucro Líquido Real por Venda'}
                </span>
                <span className="text-2xl sm:text-3xl font-black">
                  R$ {calculation.netProfitBRL.toFixed(2)}
                </span>
              </div>

              <div className="text-right">
                <span className="text-xs font-semibold block uppercase">
                  {language === 'en' ? 'Net Margin' : 'Margem Líquida'}
                </span>
                <span className="text-xl sm:text-2xl font-extrabold">
                  {calculation.netMarginPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Scaling projections */}
            <div className="mt-4 pt-3 border-t border-slate-800 text-xs">
              <span className="text-slate-400 font-semibold block mb-2">
                {language === 'en' ? 'Monthly Profit Projection:' : 'Projeção Mensal de Lucro:'}
              </span>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">
                    {language === 'en' ? '30 sales/mo' : '30 vendas/mês'}
                  </span>
                  <span className="font-bold text-white">R$ {(calculation.netProfitBRL * 30).toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">
                    {language === 'en' ? '100 sales/mo' : '100 vendas/mês'}
                  </span>
                  <span className="font-bold text-emerald-400">R$ {(calculation.netProfitBRL * 100).toFixed(2)}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-900/60 border border-slate-800/80">
                  <span className="text-[10px] text-slate-500 block">
                    {language === 'en' ? '300 sales/mo' : '300 vendas/mês'}
                  </span>
                  <span className="font-bold text-cyan-400">R$ {(calculation.netProfitBRL * 300).toFixed(2)}</span>
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Footer */}
        <div className="border-t border-slate-800 bg-slate-950/80 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2 text-xs font-bold text-slate-950 transition cursor-pointer"
          >
            {language === 'en' ? 'Close Simulator' : 'Concluir Simulação'}
          </button>
        </div>

      </div>
    </div>
  );
};
