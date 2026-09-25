import { TrendingProduct, DeepDiveAnalysis } from '../types';

export interface ExportPdfOptions {
  product: TrendingProduct;
  analysis?: DeepDiveAnalysis | null;
  language?: 'pt' | 'en';
}

/**
 * Initiates the download of a clean, professional product viability summary sheet PDF.
 * Uses the high-resolution server-side PDFKit generator, with an automatic
 * client-side print/save fallback if offline.
 */
export async function downloadProductViabilityPDF({
  product,
  analysis,
  language = 'pt',
}: ExportPdfOptions): Promise<{ success: boolean; error?: string }> {
  try {
    const res = await fetch('/api/export-product-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product,
        analysis,
        lang: language,
      }),
    });

    if (res.ok) {
      const blob = await res.blob();
      const filename = `TIKBLOX_${product.name
        .replace(/[^a-zA-Z0-9_-]/g, '_')
        .substring(0, 40)}_Viabilidade.pdf`;

      // Safe cross-browser Blob download
      const blobUrl = window.URL.createObjectURL(blob);
      const tempLink = document.createElement('a');
      tempLink.style.display = 'none';
      tempLink.href = blobUrl;
      tempLink.setAttribute('download', filename);
      document.body.appendChild(tempLink);
      tempLink.click();

      // Clean up memory
      setTimeout(() => {
        document.body.removeChild(tempLink);
        window.URL.revokeObjectURL(blobUrl);
      }, 1500);

      return { success: true };
    } else {
      throw new Error(`Server returned HTTP ${res.status}`);
    }
  } catch (err: any) {
    console.warn('Server PDF export failed or device is offline. Triggering offline printable summary fallback:', err);
    triggerOfflinePrintSummary(product, analysis, language);
    return { success: true };
  }
}

/**
 * Offline fallback: Generates an elegant, printable standalone summary sheet
 * formatted specifically for A4 printing and direct "Save as PDF" browser dialog.
 */
function triggerOfflinePrintSummary(
  product: TrendingProduct,
  analysis: DeepDiveAnalysis | null | undefined,
  language: 'pt' | 'en'
) {
  const costBRL = (product.estimatedCostUSD * 5.82).toFixed(2);
  const grossMargin = (product.estimatedPriceBRL - product.estimatedCostUSD * 5.82).toFixed(2);
  const netProfit = (product.estimatedPriceBRL - product.estimatedCostUSD * 5.82 * 1.44 - (product.estimatedPriceBRL * 0.05 + 1) - 32).toFixed(2);

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    // If popup blocked in iframe, print current page
    window.print();
    return;
  }

  const html = `
    <!DOCTYPE html>
    <html lang="${language}">
    <head>
      <meta charset="utf-8">
      <title>TIKBLOX - ${product.name} (Relatório de Viabilidade)</title>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #0f172a; margin: 0; padding: 0; background: #fff; font-size: 11pt; line-height: 1.4; }
        .header { border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
        .logo { font-size: 18pt; font-weight: 900; color: #0f172a; letter-spacing: -0.5px; }
        .logo span { color: #0284c7; }
        .badge { background: #0284c7; color: #fff; font-size: 8pt; font-weight: bold; padding: 3px 8px; border-radius: 4px; text-transform: uppercase; }
        .product-title { font-size: 16pt; font-weight: 800; margin: 0 0 4px 0; color: #0f172a; }
        .product-sub { font-size: 9pt; color: #64748b; margin-bottom: 16px; }
        .metrics-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
        .metric-card { border: 1px solid #cbd5e1; border-radius: 6px; padding: 10px; background: #f8fafc; }
        .metric-label { font-size: 7.5pt; font-weight: 700; color: #64748b; text-transform: uppercase; margin-bottom: 2px; }
        .metric-val { font-size: 13pt; font-weight: 800; color: #0f172a; }
        .metric-val.green { color: #059669; }
        .metric-sub { font-size: 7.5pt; color: #64748b; margin-top: 2px; }
        .section { margin-bottom: 16px; border: 1px solid #cbd5e1; border-radius: 6px; padding: 12px; }
        .section-title { font-size: 10pt; font-weight: 800; text-transform: uppercase; margin-top: 0; margin-bottom: 8px; color: #0369a1; border-bottom: 1px solid #e2e8f0; padding-bottom: 4px; }
        .row { display: flex; justify-content: space-between; margin-bottom: 4px; font-size: 9pt; }
        .hook-box { background: #f1f5f9; border-left: 3px solid #0284c7; padding: 6px 10px; margin-bottom: 6px; font-size: 9pt; font-style: italic; }
        .footer { margin-top: 20px; border-top: 1px solid #cbd5e1; padding-top: 8px; font-size: 8pt; color: #94a3b8; display: flex; justify-content: space-between; }
      </style>
    </head>
    <body>
      <div class="header">
        <div>
          <div class="logo">TIKBLOX <span>RADAR PRO</span></div>
          <div style="font-size: 8pt; color: #64748b;">Relatório Executivo de Viabilidade & Arbitragem</div>
        </div>
        <div class="badge">Oceano Azul • Early Wave</div>
      </div>

      <div class="product-title">${product.name}</div>
      <div class="product-sub">
        <strong>Busca Internacional:</strong> ${product.originalName} | 
        <strong>Nicho:</strong> ${product.nicheLabel} | 
        <strong>Origem:</strong> ${product.originCountry} (${product.originPlatform})
      </div>

      <div class="metrics-grid">
        <div class="metric-card">
          <div class="metric-label">Custo Fornecedor</div>
          <div class="metric-val">$${product.estimatedCostUSD.toFixed(2)} USD</div>
          <div class="metric-sub">~ R$ ${costBRL}</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Preço Venda Sugerido</div>
          <div class="metric-val">R$ ${product.estimatedPriceBRL.toFixed(2)}</div>
          <div class="metric-sub">Mercado Brasil</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Margem Bruta</div>
          <div class="metric-val green">+${product.estimatedProfitMarginPercent}%</div>
          <div class="metric-sub">+R$ ${grossMargin} / un</div>
        </div>
        <div class="metric-card">
          <div class="metric-label">Score Viralidade</div>
          <div class="metric-val">${product.viralityScore}/100</div>
          <div class="metric-sub">${product.trendingMetrics?.searchVolumeBR || 'Alta tração'}</div>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Análise Financeira & Unit Economics</div>
        <div class="row"><span>Custo de Aquisição (FOB):</span> <strong>R$ ${costBRL}</strong></div>
        <div class="row"><span>Estimativa de Imposto (Remessa Conforme/ICMS ~44%):</span> <strong>R$ ${(parseFloat(costBRL) * 0.44).toFixed(2)}</strong></div>
        <div class="row"><span>Taxa Gateway / Processamento (~5%):</span> <strong>R$ ${(product.estimatedPriceBRL * 0.05).toFixed(2)}</strong></div>
        <div class="row"><span>CPA Médio Estimado em Tráfego Pago:</span> <strong>R$ 32,00</strong></div>
        <div class="row" style="margin-top: 8px; border-top: 1px dashed #cbd5e1; padding-top: 6px; font-size: 10pt; color: #059669;">
          <span><strong>Lucro Líquido Unitário Projetado:</strong></span>
          <strong>R$ ${netProfit}</strong>
        </div>
      </div>

      <div class="section">
        <div class="section-title">Diagnóstico de Mercado & Concorrência no Brasil</div>
        <div class="row"><span>Shopee Brasil:</span> <span>${analysis?.competitionAnalysis?.shopeeStatus || 'Poucos anúncios internacionais com prazos longos.'}</span></div>
        <div class="row"><span>Mercado Livre Full:</span> <span>${analysis?.competitionAnalysis?.mercadoLivreStatus || 'Raros vendedores com estoque nacional pronta entrega.'}</span></div>
        <div class="row"><span>Saturação TikTok Brasil:</span> <span>${product.saturationInBrazil || 'Muito Baixa / Incipiente'}</span></div>
      </div>

      <div class="section">
        <div class="section-title">Ganchos Virais Recomendados (UGC Hooks)</div>
        <div class="hook-box">"${product.adHooks?.[0] || 'Você ainda sofre com isso? Esse produto importado resolveu meu problema!'}"</div>
        <div class="hook-box">"${product.adHooks?.[1] || 'O produto viral dos EUA finalmente disponível no Brasil!'}"</div>
        <div style="font-size: 8.5pt; color: #475569; margin-top: 6px;"><strong>Público-Alvo:</strong> ${product.targetAudience}</div>
      </div>

      <div class="section">
        <div class="section-title">Diretrizes de Fornecedor & Sourcing</div>
        <div style="font-size: 9pt;"><strong>Palavras-chave de busca:</strong> ${product.supplierKeywords?.join(', ') || product.originalName}</div>
        <div style="font-size: 9pt; margin-top: 4px;"><strong>Complexidade Logística:</strong> ${product.logisticsComplexity || 'Fácil (Leve / Sem Bateria)'}</div>
      </div>

      <div class="footer">
        <div>TIKBLOX Radar Pro • Inteligência de Tendências e Arbitragem • ${new Date().toLocaleDateString('pt-BR')}</div>
        <div>Página 1 / 1</div>
      </div>

      <script>
        window.onload = function() {
          window.print();
        };
      </script>
    </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
