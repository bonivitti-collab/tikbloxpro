const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');

// List of all files to include in the source code PDF
const filesToInclude = [
  { path: 'package.json', title: 'Configurações de Dependências & Scripts (package.json)' },
  { path: 'server.ts', title: 'Servidor Backend Express & Integração Gemini AI (server.ts)' },
  { path: 'index.html', title: 'Ponto de Entrada HTML & Metadados PWA (index.html)' },
  { path: 'src/main.tsx', title: 'Inicialização React & ErrorBoundary (src/main.tsx)' },
  { path: 'src/types.ts', title: 'Modelos de Tipagem TypeScript do Radar (src/types.ts)' },
  { path: 'src/App.tsx', title: 'Componente Principal & Orquestração de Estados (src/App.tsx)' },
  { path: 'src/services/api.ts', title: 'Serviço de Varredura e Comunicação com API (src/services/api.ts)' },
  { path: 'src/services/pushNotifications.ts', title: 'Serviço de Notificações Push & PWA (src/services/pushNotifications.ts)' },
  { path: 'src/hooks/usePushNotifications.ts', title: 'Hook React para Notificações (src/hooks/usePushNotifications.ts)' },
  { path: 'src/hooks/usePWAInstall.ts', title: 'Hook de Instalação PWA (src/hooks/usePWAInstall.ts)' },
  { path: 'src/hooks/useOnlineStatus.ts', title: 'Hook de Detecção Online/Offline (src/hooks/useOnlineStatus.ts)' },
  { path: 'src/components/Navbar.tsx', title: 'Barra de Navegação e Controles (src/components/Navbar.tsx)' },
  { path: 'src/components/RadarHero.tsx', title: 'Painel Superior de Filtros e Busca (src/components/RadarHero.tsx)' },
  { path: 'src/components/ProductCard.tsx', title: 'Card de Produto Viral e Métricas (src/components/ProductCard.tsx)' },
  { path: 'src/components/ProductDetailModal.tsx', title: 'Modal de Raio-X e Roteiros de Vídeo (src/components/ProductDetailModal.tsx)' },
  { path: 'src/components/ProfitCalculatorModal.tsx', title: 'Calculadora e Simulador de Lucro (src/components/ProfitCalculatorModal.tsx)' },
  { path: 'src/components/LiveScannerFeed.tsx', title: 'Feed em Tempo Real de Produtos (src/components/LiveScannerFeed.tsx)' },
  { path: 'src/components/SavedRadarView.tsx', title: 'Área de Produtos Salvos (src/components/SavedRadarView.tsx)' },
  { path: 'src/components/PushNotificationModal.tsx', title: 'Modal de Configurações de Notificações (src/components/PushNotificationModal.tsx)' },
  { path: 'src/components/FreeTierInfoModal.tsx', title: 'Modal de Arquitetura 100% Gratuita (src/components/FreeTierInfoModal.tsx)' },
  { path: 'src/components/BrandAssetsModal.tsx', title: 'Modal de Identidade Visual TikBlox (src/components/BrandAssetsModal.tsx)' },
  { path: 'src/components/PWAInstallButton.tsx', title: 'Botão de Instalar App (src/components/PWAInstallButton.tsx)' },
  { path: 'src/components/OfflineIndicator.tsx', title: 'Banner de Status de Conexão (src/components/OfflineIndicator.tsx)' },
  { path: 'src/components/TikBloxLogo.tsx', title: 'Logomarca e Símbolo TikBlox (src/components/TikBloxLogo.tsx)' },
  { path: 'src/data/curatedTrends.ts', title: 'Base Curada de Produtos Internacionais (src/data/curatedTrends.ts)' },
  { path: 'src/data/niches/index.ts', title: 'Índice de Nichos e Categorias (src/data/niches/index.ts)' },
];

async function generateSourceCodePDF() {
  const outputPath = path.join(__dirname, '../public/TIKBLOX_Codigo_Fonte.pdf');
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: 40, bottom: 40, left: 40, right: 40 },
    bufferPages: true,
    info: {
      Title: 'TIKBLOX - Código Fonte Completo',
      Author: 'TIKBLOX AI Studio',
      Subject: 'Dossiê Completo de Código Fonte do Radar de Tendências',
      Keywords: 'TIKBLOX, React, TypeScript, Express, Gemini, PWA, Dropshipping',
    }
  });

  const writeStream = fs.createWriteStream(outputPath);
  doc.pipe(writeStream);

  // ---------------- COVER PAGE ----------------
  doc.rect(0, 0, doc.page.width, doc.page.height).fill('#090D16');

  // Decorative header line
  doc.rect(40, 50, doc.page.width - 80, 4).fill('#FE2C55');
  doc.rect(40, 54, (doc.page.width - 80) * 0.4, 4).fill('#25F4EE');

  doc.fontSize(36).font('Helvetica-Bold').fillColor('#FFFFFF').text('TIKBLOX', 40, 90);
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#25F4EE').text('RADAR DE TENDÊNCIAS VIRAIS & PRODUTOS DO EXTERIOR', 40, 135);
  doc.fontSize(12).font('Helvetica').fillColor('#94A3B8').text('Dossiê Técnico e Código Fonte Integral da Aplicação', 40, 160);

  // Box: Executive Summary
  doc.roundedRect(40, 200, doc.page.width - 80, 150, 8).fill('#131B2E');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF').text('Visão Geral do Sistema', 55, 215);
  doc.fontSize(10).font('Helvetica').fillColor('#CBD5E1').text(
    'O TIKBLOX é uma plataforma de inteligência de mercado desenvolvida para monitorar e identificar ' +
    'produtos de alto potencial viral nos Estados Unidos e na China antes que se tornem saturados no Brasil. ' +
    'A arquitetura conta com um frontend responsivo (PWA instalável com suporte offline), inteligência artificial ' +
    'via Google Gemini para estimativas de custos, margens e geração de roteiros de marketing em tempo real, ' +
    'e um backend Node.js/Express otimizado.',
    55, 240, { width: doc.page.width - 110, lineGap: 4 }
  );

  // Box: Stack specifications
  doc.roundedRect(40, 365, doc.page.width - 80, 160, 8).fill('#131B2E');
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#FFFFFF').text('Especificações Técnicas da Stack', 55, 380);
  
  const specs = [
    ['Frontend:', 'React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion'],
    ['PWA & Offline:', 'Service Worker, Cache Local, Web Manifest, Push Notifications API'],
    ['Backend & API:', 'Node.js, Express, Middleware de proxy e segurança de CORS'],
    ['Inteligência Artificial:', 'Google Gemini 2.5 Flash (Google GenAI SDK)'],
    ['Persistência:', 'LocalStorage com cache sincronizado e persistência local'],
    ['Data do Documento:', new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR')],
  ];

  let specY = 405;
  specs.forEach(([label, value]) => {
    doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#25F4EE').text(label, 55, specY);
    doc.fontSize(9.5).font('Helvetica').fillColor('#F1F5F9').text(value, 185, specY, { width: doc.page.width - 240 });
    specY += 21;
  });

  // Table of contents on cover
  doc.fontSize(12).font('Helvetica-Bold').fillColor('#FE2C55').text('Índice de Módulos Inclusos neste Dossiê:', 40, 545);
  let tocY = 568;
  filesToInclude.forEach((f, idx) => {
    if (idx < 12) {
      doc.fontSize(8.5).font('Helvetica').fillColor('#E2E8F0').text(`${idx + 1}. ${f.path}`, 45, tocY);
      tocY += 15;
    }
  });
  doc.fontSize(8.5).font('Helvetica-Oblique').fillColor('#64748B').text(`... e mais ${filesToInclude.length - 12} arquivos detalhados nas páginas seguintes.`, 45, tocY);

  // Footer on cover
  doc.fontSize(8.5).font('Helvetica').fillColor('#64748B').text('TIKBLOX Cloud Suite • Documento gerado automaticamente pelo ambiente oficial do AI Studio', 40, doc.page.height - 50);

  // ---------------- CODE PAGES ----------------
  for (let fileIndex = 0; fileIndex < filesToInclude.length; fileIndex++) {
    const fileInfo = filesToInclude[fileIndex];
    const fullPath = path.join(__dirname, '..', fileInfo.path);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    doc.addPage({ margins: { top: 40, bottom: 40, left: 40, right: 40 } });

    // Header banner for the file
    doc.rect(40, 35, doc.page.width - 80, 48).fill('#0F172A');
    doc.rect(40, 35, 4, 48).fill('#FE2C55');
    
    doc.fontSize(12).font('Helvetica-Bold').fillColor('#FFFFFF').text(fileInfo.path, 52, 43);
    doc.fontSize(9).font('Helvetica').fillColor('#94A3B8').text(fileInfo.title + `  (${lines.length} linhas)`, 52, 62);

    let currentY = 95;
    const lineHeight = 10.5;
    const maxY = doc.page.height - 50;

    doc.font('Courier').fontSize(7.5);

    for (let i = 0; i < lines.length; i++) {
      if (currentY > maxY) {
        doc.addPage({ margins: { top: 40, bottom: 40, left: 40, right: 40 } });

        // Continuation header
        doc.rect(40, 35, doc.page.width - 80, 25).fill('#0F172A');
        doc.rect(40, 35, 4, 25).fill('#25F4EE');
        doc.fontSize(9.5).font('Helvetica-Bold').fillColor('#FFFFFF').text(`${fileInfo.path} (continuação)`, 52, 42);

        currentY = 70;
        doc.font('Courier').fontSize(7.5);
      }

      const lineNumStr = String(i + 1).padStart(4, ' ') + ' | ';
      const lineText = lines[i];

      // Print line number in gray
      doc.fillColor('#94A3B8').text(lineNumStr, 40, currentY, { continued: true, lineBreak: false });

      // Clean line content (replace tabs with 2 spaces, truncate very long lines safely)
      let cleanLine = lineText.replace(/\t/g, '  ');
      if (cleanLine.length > 105) {
        cleanLine = cleanLine.substring(0, 105) + '...';
      }

      // Syntax-like coloring hint
      if (cleanLine.trim().startsWith('//') || cleanLine.trim().startsWith('/*') || cleanLine.trim().startsWith('*')) {
        doc.fillColor('#64748B');
      } else if (cleanLine.includes('import ') || cleanLine.includes('export ') || cleanLine.includes('const ') || cleanLine.includes('function ') || cleanLine.includes('return ')) {
        doc.fillColor('#0F172A');
      } else {
        doc.fillColor('#1E293B');
      }

      doc.text(cleanLine, { lineBreak: true });
      currentY += lineHeight;
    }
  }

  // Final page count numbering
  const totalPages = doc.bufferedPageRange().count;
  for (let p = 0; p < totalPages; p++) {
    doc.switchToPage(p);
    if (p > 0) {
      doc.fontSize(8).font('Helvetica').fillColor('#64748B').text(
        `TIKBLOX • Dossiê de Código Fonte • Página ${p + 1} de ${totalPages}`,
        40,
        doc.page.height - 30,
        { align: 'center', width: doc.page.width - 80 }
      );
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    writeStream.on('finish', () => {
      console.log(`PDF gerado com sucesso em: ${outputPath} (${totalPages} páginas)`);
      resolve(outputPath);
    });
    writeStream.on('error', reject);
  });
}

generateSourceCodePDF().catch(err => {
  console.error('Erro gerando PDF:', err);
  process.exit(1);
});
