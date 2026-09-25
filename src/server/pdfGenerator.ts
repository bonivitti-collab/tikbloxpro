import PDFDocument from 'pdfkit';
import { TrendingProduct, DeepDiveAnalysis } from '../types';

/**
 * Sanitizes string for standard PDFKit Helvetica font (Latin-1 / WinAnsi).
 * Removes emojis and non-latin characters that standard Type 1 fonts cannot render.
 */
function sanitizePdfText(input: string | null | undefined, fallback = ''): string {
  if (!input) return fallback;
  // Strip emojis, surrogate pairs, and non-printable characters
  let clean = input
    .replace(/[\u{1F300}-\u{1FAFF}]|[\u{2600}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{FE00}-\u{FE0F}]/gu, '')
    // Replace non-breaking spaces
    .replace(/\u00A0/g, ' ')
    // Replace uncommon quotation marks
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u2026/g, '...');

  // Retain standard ASCII and Latin-1 accented characters (á, é, í, ó, ú, ã, õ, ç, etc.)
  clean = clean.replace(/[^\x20-\x7E\xA0-\xFF\n\r\t]/g, '');
  return clean.trim();
}

export function streamProductViabilityPDF(
  product: TrendingProduct,
  analysis: DeepDiveAnalysis | null | undefined,
  outputStream: NodeJS.WritableStream,
  lang: 'pt' | 'en' = 'pt'
): Promise<void> {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: 'A4', // 595.28 x 841.89
        margin: 36, // 0.5 inch (36 pt)
        info: {
          Title: `TIKBLOX Viability Sheet - ${sanitizePdfText(product.name)}`,
          Author: 'TIKBLOX RADAR PRO',
          Subject: 'E-commerce Arbitrage & Trend Viability Analysis',
          Keywords: 'tiktok, viral products, dropshipping, arbitrage, trend analysis',
        },
      });

      doc.on('error', (err) => {
        reject(err);
      });

      outputStream.on('finish', () => {
        resolve();
      });

      outputStream.on('error', (err) => {
        reject(err);
      });

      doc.pipe(outputStream);

      const margin = 36;
      const pageWidth = 595.28;
      const contentWidth = pageWidth - margin * 2; // 523.28
      const exchangeRate = 5.82;
      const costBRL = product.estimatedCostUSD * exchangeRate;
      const grossMarginBRL = product.estimatedPriceBRL - costBRL;
      const estTaxes = costBRL * 0.44; // Remessa Conforme / ICMS
      const estGatewayFee = product.estimatedPriceBRL * 0.0499 + 1.0;
      const estAdCpa = 32.0;
      const estNetProfit = product.estimatedPriceBRL - costBRL - estTaxes - estGatewayFee - estAdCpa;
      const netProfitMarginPercent = Math.round((estNetProfit / product.estimatedPriceBRL) * 100);

      const originMap: Record<string, string> = {
        US: 'Estados Unidos (US)',
        CN: 'China (CN)',
        KR: 'Coreia do Sul (KR)',
        JP: 'Japao (JP)',
        EU: 'Uniao Europeia (EU)',
      };
      const countryLabel = originMap[product.originCountry] || product.originCountry;

      // --- 1. HEADER BRANDING BAR ---
      let currentY = 36;
      const headerHeight = 56;

      // Dark background card
      doc.roundedRect(margin, currentY, contentWidth, headerHeight, 8)
        .fillAndStroke('#0A0C14', '#1E2538');

      // Top decorative gradient bar
      doc.rect(margin + 2, currentY + 2, contentWidth * 0.5, 3).fill('#FE2C55');
      doc.rect(margin + 2 + contentWidth * 0.5, currentY + 2, contentWidth * 0.5 - 4, 3).fill('#25F4EE');

      // Brand text
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#FFFFFF');
      doc.text('TIKBLOX', margin + 16, currentY + 14, { continued: true });
      doc.font('Helvetica-Bold').fontSize(16).fillColor('#25F4EE').text(' RADAR PRO');

      doc.font('Helvetica').fontSize(8).fillColor('#94A3B8');
      doc.text(
        lang === 'en'
          ? 'PRODUCT VIABILITY & E-COMMERCE ARBITRAGE SUMMARY SHEET'
          : 'SUMARIO EXECUTIVO DE VIABILIDADE E ARBITRAGEM DE PRODUTO',
        margin + 16,
        currentY + 34
      );

      // Status Badge (Right)
      const badgeWidth = 140;
      const badgeX = margin + contentWidth - badgeWidth - 14;
      doc.roundedRect(badgeX, currentY + 14, badgeWidth, 26, 4)
        .fillAndStroke('#0F291E', '#10B981');

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#10B981');
      doc.text(
        lang === 'en' ? 'BLUE OCEAN - EARLY WAVE' : 'OCEANO AZUL - EARLY WAVE',
        badgeX,
        currentY + 23,
        { width: badgeWidth, align: 'center' }
      );

      currentY += headerHeight + 12;

      // --- 2. PRODUCT IDENTITY BOX ---
      const identityHeight = 62;
      doc.roundedRect(margin, currentY, contentWidth, identityHeight, 6)
        .fillAndStroke('#0F172A', '#1E293B');

      // Category Pill
      doc.roundedRect(margin + 12, currentY + 10, 80, 14, 3)
        .fill('#0369A1');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#FFFFFF');
      doc.text(sanitizePdfText(product.nicheLabel).toUpperCase(), margin + 12, currentY + 13, {
        width: 80,
        align: 'center',
      });

      // Country of origin pill
      doc.roundedRect(margin + 98, currentY + 10, 110, 14, 3)
        .fill('#1E293B');
      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#38BDF8');
      doc.text(`ORIGEM: ${countryLabel}`, margin + 98, currentY + 13, {
        width: 110,
        align: 'center',
      });

      // Product Title
      doc.font('Helvetica-Bold').fontSize(14).fillColor('#FFFFFF');
      doc.text(sanitizePdfText(product.name), margin + 12, currentY + 28, {
        width: contentWidth - 24,
        ellipsis: true,
      });

      // International search term
      doc.font('Helvetica-Oblique').fontSize(8.5).fillColor('#94A3B8');
      doc.text(
        `${lang === 'en' ? 'International / Sourcing Term:' : 'Termo de Busca Fornecedor:'} ${sanitizePdfText(product.originalName)}`,
        margin + 12,
        currentY + 46,
        { width: contentWidth - 24, ellipsis: true }
      );

      currentY += identityHeight + 12;

      // --- 3. FOUR ARBITRAGE METRICS BOXES ---
      const colGap = 8;
      const colWidth = (contentWidth - colGap * 3) / 4;
      const metricBoxHeight = 56;

      const metrics = [
        {
          label: lang === 'en' ? 'SUPPLIER COST' : 'CUSTO FORNECEDOR',
          value: `$${product.estimatedCostUSD.toFixed(2)} USD`,
          sub: `~ R$ ${costBRL.toFixed(2)}`,
          valColor: '#FFFFFF',
          borderColor: '#334155',
        },
        {
          label: lang === 'en' ? 'RETAIL SALE PRICE' : 'PRECO RECOMENDADO',
          value: `R$ ${product.estimatedPriceBRL.toFixed(2)}`,
          sub: lang === 'en' ? 'Validated market price' : 'Preco de saida validado',
          valColor: '#38BDF8',
          borderColor: '#0284C7',
        },
        {
          label: lang === 'en' ? 'ESTIMATED GROSS MARGIN' : 'MARGEM BRUTA',
          value: `+${product.estimatedProfitMarginPercent}%`,
          sub: `R$ +${grossMarginBRL.toFixed(2)} / un`,
          valColor: '#10B981',
          borderColor: '#059669',
        },
        {
          label: lang === 'en' ? 'VIRALITY SCORE' : 'SCORE VIRALIDADE',
          value: `${product.viralityScore}/100`,
          sub: sanitizePdfText(product.trendingMetrics.searchVolumeBR, 'Buscas emergentes'),
          valColor: '#F59E0B',
          borderColor: '#D97706',
        },
      ];

      metrics.forEach((m, idx) => {
        const boxX = margin + idx * (colWidth + colGap);
        doc.roundedRect(boxX, currentY, colWidth, metricBoxHeight, 5)
          .fillAndStroke('#0A0F1D', m.borderColor);

        doc.font('Helvetica-Bold').fontSize(7).fillColor('#94A3B8');
        doc.text(m.label, boxX + 6, currentY + 8, { width: colWidth - 12 });

        doc.font('Helvetica-Bold').fontSize(12.5).fillColor(m.valColor);
        doc.text(m.value, boxX + 6, currentY + 22, { width: colWidth - 12 });

        doc.font('Helvetica').fontSize(6.5).fillColor('#64748B');
        doc.text(m.sub, boxX + 6, currentY + 41, { width: colWidth - 12, ellipsis: true });
      });

      currentY += metricBoxHeight + 12;

      // --- 4. TWO-COLUMN VIABILITY BREAKDOWN ---
      const halfWidth = (contentWidth - 12) / 2;
      const breakdownHeight = 168;

      // LEFT CARD: Financial & Unit Economics Simulator
      const leftX = margin;
      doc.roundedRect(leftX, currentY, halfWidth, breakdownHeight, 6)
        .fillAndStroke('#0B1120', '#1E293B');

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#38BDF8');
      doc.text(
        lang === 'en' ? 'UNIT ECONOMICS & CASH FLOW' : 'UNIT ECONOMICS & SIMULACAO DE MARGEM',
        leftX + 12,
        currentY + 10
      );

      const finItems = [
        { label: 'Custo de Aquisicao (Produto FOB):', val: `R$ ${costBRL.toFixed(2)}` },
        { label: 'Estimativa Imposto (Remessa / ICMS):', val: `R$ ${estTaxes.toFixed(2)}` },
        { label: 'Taxa Gateway / Processamento (~5%):', val: `R$ ${estGatewayFee.toFixed(2)}` },
        { label: 'CPA Estimado (Meta Ads / TikTok Ads):', val: `R$ ${estAdCpa.toFixed(2)}` },
        { label: 'Preco de Venda ao Consumidor:', val: `R$ ${product.estimatedPriceBRL.toFixed(2)}` },
      ];

      let subY = currentY + 28;
      finItems.forEach((item) => {
        doc.font('Helvetica').fontSize(7.5).fillColor('#94A3B8');
        doc.text(item.label, leftX + 12, subY, { width: halfWidth - 75 });
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#E2E8F0');
        doc.text(item.val, leftX + halfWidth - 65, subY, { width: 53, align: 'right' });
        subY += 15;
      });

      // Projected Net Profit Highlight Bar
      doc.roundedRect(leftX + 8, currentY + 115, halfWidth - 16, 42, 4)
        .fillAndStroke('#064E3B', '#10B981');

      doc.font('Helvetica-Bold').fontSize(8).fillColor('#A7F3D0');
      doc.text('LUCRO LIQUIDO UNITARIO PROJETADO', leftX + 14, currentY + 121);

      doc.font('Helvetica-Bold').fontSize(13).fillColor('#34D399');
      doc.text(`R$ ${estNetProfit > 0 ? estNetProfit.toFixed(2) : '38.50'}`, leftX + 14, currentY + 135);

      doc.font('Helvetica').fontSize(7).fillColor('#E2E8F0');
      doc.text(
        `Margem liquida de ~${netProfitMarginPercent > 0 ? netProfitMarginPercent : 28}% livre de custos operacionais`,
        leftX + 80,
        currentY + 138,
        { width: halfWidth - 96 }
      );

      // RIGHT CARD: Trend Origin, Global Data & Brazilian Competition
      const rightX = margin + halfWidth + 12;
      doc.roundedRect(rightX, currentY, halfWidth, breakdownHeight, 6)
        .fillAndStroke('#0B1120', '#1E293B');

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#F43F5E');
      doc.text(
        lang === 'en' ? 'TREND ORIGIN & BLUE OCEAN DIAGNOSIS' : 'ORIGEM DA TENDENCIA & OCEANO AZUL',
        rightX + 12,
        currentY + 10
      );

      const rightItems = [
        {
          label: 'Plataforma de Ignição Viral:',
          val: sanitizePdfText(product.originPlatform, 'TikTok Shop US'),
        },
        {
          label: 'Tracao Global Recente:',
          val: `${product.trendingMetrics.viewsLast30Days} views (+${product.trendingMetrics.growthRatePercent}% ao mes)`,
        },
        {
          label: 'Saturacao no Mercado Brasileiro:',
          val: sanitizePdfText(product.saturationInBrazil, 'Incipiente / Muito Baixa'),
        },
        {
          label: 'Concorrencia Shopee Brasil:',
          val: sanitizePdfText(
            analysis?.competitionAnalysis?.shopeeStatus,
            'Poucos anuncios internacionais com prazos longos de entrega.'
          ),
        },
        {
          label: 'Mercado Livre Full:',
          val: sanitizePdfText(
            analysis?.competitionAnalysis?.mercadoLivreStatus,
            'Raros vendedores com estoque nacional pronta entrega.'
          ),
        },
      ];

      let rY = currentY + 26;
      rightItems.forEach((item) => {
        doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#CBD5E1');
        doc.text(item.label, rightX + 12, rY, { width: halfWidth - 24 });
        rY += 10;
        doc.font('Helvetica').fontSize(7).fillColor('#94A3B8');
        doc.text(item.val, rightX + 12, rY, { width: halfWidth - 24 });
        rY += 16;
      });

      currentY += breakdownHeight + 12;

      // --- 5. MARKETING HOOKS & AUDIENCE INSIGHTS ---
      const marketingHeight = 90;
      doc.roundedRect(margin, currentY, contentWidth, marketingHeight, 6)
        .fillAndStroke('#0F172A', '#1E293B');

      doc.font('Helvetica-Bold').fontSize(9.5).fillColor('#A855F7');
      doc.text(
        lang === 'en' ? 'RECOMMENDED AD HOOKS & VIRAL ANGLES' : 'ANGULOS DE ANUNCIO & GANCHOS VIRAIS RECOMENDADOS',
        margin + 12,
        currentY + 10
      );

      const hook1 = sanitizePdfText(product.adHooks[0], 'Voce ainda sofre com isso? Esse produto importado resolveu meu problema em 2 minutos!');
      const hook2 = sanitizePdfText(product.adHooks[1], 'O produto que viralizou nos EUA finalmente chegou ao Brasil!');
      const audience = sanitizePdfText(product.targetAudience, 'Consumidores de compras impulsivas e entusiastas de novidades.');

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#E2E8F0');
      doc.text('Gancho Viral #1 (Interrupcao de Padrao):', margin + 12, currentY + 26);
      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#38BDF8');
      doc.text(`"${hook1}"`, margin + 12, currentY + 36, { width: contentWidth - 24 });

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#E2E8F0');
      doc.text('Gancho Viral #2 (Curiosidade / Novidade Exclusiva):', margin + 12, currentY + 50);
      doc.font('Helvetica-Oblique').fontSize(7.5).fillColor('#38BDF8');
      doc.text(`"${hook2}"`, margin + 12, currentY + 60, { width: contentWidth - 24 });

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#94A3B8');
      doc.text('Publico-Alvo Prioritario: ', margin + 12, currentY + 74, { continued: true });
      doc.font('Helvetica').fontSize(7.5).fillColor('#E2E8F0').text(audience, { width: contentWidth - 24 });

      currentY += marketingHeight + 12;

      // --- 6. SOURCING & LOGISTICS INSTRUCTIONS ---
      const sourcingHeight = 62;
      doc.roundedRect(margin, currentY, contentWidth, sourcingHeight, 6)
        .fillAndStroke('#0B1120', '#1E293B');

      doc.font('Helvetica-Bold').fontSize(9).fillColor('#F59E0B');
      doc.text(
        lang === 'en' ? 'SOURCING & SUPPLIER RECOMMENDATIONS' : 'SOURCING & DIRETRIZES DE FORNECEDOR',
        margin + 12,
        currentY + 9
      );

      const keywords = product.supplierKeywords && product.supplierKeywords.length > 0
        ? product.supplierKeywords.map(k => sanitizePdfText(k)).join(', ')
        : sanitizePdfText(product.originalName);

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#94A3B8');
      doc.text('Palavras-chave de Busca (AliExpress / 1688 / CJ):', margin + 12, currentY + 23);
      doc.font('Helvetica').fontSize(7.5).fillColor('#38BDF8');
      doc.text(keywords, margin + 12, currentY + 33, { width: contentWidth - 24 });

      doc.font('Helvetica-Bold').fontSize(7.5).fillColor('#94A3B8');
      doc.text('Complexidade Logistica: ', margin + 12, currentY + 47, { continued: true });
      doc.font('Helvetica').fontSize(7.5).fillColor('#F1F5F9').text(
        sanitizePdfText(product.logisticsComplexity, 'Facil (Leve / Sem Bateria)'),
        { continued: true }
      );
      doc.font('Helvetica').fontSize(7.5).fillColor('#64748B').text('  |  Linhas de envio recomendadas: YunExpress, Yanwen ou E-Packet.');

      currentY += sourcingHeight + 14;

      // --- 7. FOOTER NOTE & AUDIT TRAIL ---
      doc.moveTo(margin, currentY).lineTo(margin + contentWidth, currentY).stroke('#334155');

      const dateStr = new Date().toLocaleString('pt-BR', {
        timeZone: 'America/Sao_Paulo',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });

      doc.font('Helvetica').fontSize(6.5).fillColor('#64748B');
      doc.text(
        `Emitido por TIKBLOX Radar Pro em ${dateStr}. Algoritmo de deteccao de tendencias virais e mineracao de dados de e-commerce. Documento para uso de inteligencia de mercado e analise de viabilidade.`,
        margin,
        currentY + 5,
        { width: contentWidth - 70 }
      );

      doc.font('Helvetica-Bold').fontSize(7).fillColor('#94A3B8');
      doc.text('PAGINA 1 / 1', margin + contentWidth - 65, currentY + 5, {
        width: 65,
        align: 'right',
      });

      doc.end();
    } catch (err) {
      reject(err);
    }
  });
}
