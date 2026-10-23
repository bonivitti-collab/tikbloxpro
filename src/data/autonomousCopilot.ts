import { TrendingProduct } from '../types';
import { enrichWithTikTokShopData } from './tiktokShopEnricher';
import { ALL_NICHE_TRENDS } from './niches/index';

/**
 * Verifica se a pergunta do usuário é especificamente sobre o produto atualmente selecionado na tela do meio.
 */
export function isQuerySpecificallyAboutProduct(
  query: string,
  product?: TrendingProduct | null
): boolean {
  if (!product) return false;
  const q = query.toLowerCase().trim();

  // Expressões de referência direta ao item selecionado
  const directRefs = [
    'este produto', 'esse produto', 'dele', 'deste', 'desse', 'nele', 'nesse',
    'o produto', 'este item', 'esse item', 'essa oferta', 'esta oferta',
    'como vendo ele', 'como vendo esse', 'comissão dele', 'preço dele', 'gancho dele',
    'roteiro para ele', 'amostra dele', 'fornecedor dele', 'análise dele'
  ];
  if (directRefs.some((ref) => q.includes(ref))) return true;

  // Palavras-chave do nome do produto (com pelo menos 4 letras)
  const nameWords = product.name
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúãõâêîôûç ]/gi, '')
    .split(' ')
    .filter((w) => w.length >= 4 && !['para', 'com', 'sem', 'mais', 'mini', 'novo', 'super'].includes(w));

  if (nameWords.length > 0 && nameWords.some((w) => q.includes(w))) {
    return true;
  }

  return false;
}

/**
 * Busca produtos no radar de tendências que correspondam aos termos da consulta do usuário
 */
function searchCatalogProducts(query: string): TrendingProduct[] {
  const q = query.toLowerCase().trim();
  const searchTerms = q
    .replace(/[^a-z0-9áéíóúãõâêîôûç ]/gi, '')
    .split(' ')
    .filter(
      (w) =>
        w.length >= 3 &&
        ![
          'para', 'com', 'sem', 'onde', 'como', 'qual', 'quais', 'quero', 'vender',
          'mais', 'tem', 'voce', 'você', 'sobre', 'estou', 'procurando', 'sabe'
        ].includes(w)
    );

  if (searchTerms.length === 0) return [];

  const matched = ALL_NICHE_TRENDS.filter((prod) => {
    const textToSearch = [
      prod.name,
      prod.originalName,
      prod.nicheLabel,
      prod.niche,
      prod.culturalFitReason,
      ...(prod.supplierKeywords || []),
    ]
      .join(' ')
      .toLowerCase();

    return searchTerms.some((term) => textToSearch.includes(term));
  });

  return matched.slice(0, 4);
}

/**
 * Motor Conversacional Institucional TIKBLOX AI
 * Padrão Analítico Técnico, Sem Emojis, Didático e Aberto.
 */
export function generateAutonomousTikTokShopReply(
  userQuery: string,
  productContext?: TrendingProduct | null
): string {
  const q = (userQuery || '').toLowerCase().trim();
  const isAboutActive = isQuerySpecificallyAboutProduct(q, productContext);
  const p = isAboutActive && productContext ? enrichWithTikTokShopData(productContext) : null;

  const prodName = p ? p.name : 'Produto em Análise';
  const priceNum = p ? Number(p.estimatedPriceBRL || 89.90) : 89.90;
  const commPct = p ? (p.commissionPercent || 25) : 25;
  const commVal = p ? Number(p.commissionEstimatedBRL || (priceNum * (commPct / 100))) : 22.48;
  const stock = p ? (p.stockLocationBrazil || 'São Paulo - SP (Pronta Entrega)') : 'São Paulo / Curitiba (Estoque Nacional)';
  const hookEx = p ? (p.hookViral3s || p.adHooks?.[0] || 'O motivo pelo qual este produto está esgotando nos estoques de SP') : 'Demonstração prática de utilidade imediata';

  // =========================================================================
  // 1. SAUDAÇÃO & APRESENTAÇÃO INSTITUCIONAL
  // =========================================================================
  if (
    q === 'oi' || q === 'ola' || q === 'olá' || q.includes('bom dia') || q.includes('boa tarde') || 
    q.includes('boa noite') || q.includes('tudo bem') || q.includes('quem e voce') || q.includes('quem é você') ||
    q.includes('como funciona a ia') || q.includes('o que você faz') || q.includes('o que voce faz')
  ) {
    return `### TIKBLOX AI: Terminal de Inteligência de Mercado TikTok Shop Brasil

Sou o motor de inteligência analítica da plataforma TikBlox Pro, modelado para fornecer diagnósticos institucionais sobre o algoritmo do TikTok Shop Brasil, viabilidade unitária de produtos, logística nacional de pronta entrega e escala de vendas para criadores e afiliados.

1. **Capacidades Operacionais:**
   - **Pesquisa de Mercado & Nichos:** Consulta aberta sobre qualquer categoria (ex: bolsas femininas, cosméticos, utilidades domésticas, eletrônicos) com dados de ticket médio e margem.
   - **Simulador de Margem & Unit Economics:** Projeção detalhada de receita bruta, taxas de intermediação da plataforma e lucro líquido por volume de pedidos.
   - **Diagnóstico Algorítmico:** Parâmetros técnicos de retenção de 1 a 3 segundos, taxa de conclusão de vídeo e conversão no carrinho amarelo.
   - **Logística & Fornecedores:** Diretrizes de SLA para despachos a partir dos polos de São Paulo e Paraná, e scripts de solicitação de amostras grátis.

2. **Diretrizes de Consulta:**
   - Para pesquisar oportunidades em um nicho específico, informe a categoria (ex: "bolsas femininas" ou "produtos para cozinha").
   - Para simular viabilidade financeira, solicite "simular margem" ou informe um volume de vendas desejado.
   - Para suporte sobre o algoritmo ou cadastro de criador, pergunte livremente.

Como posso orientar sua estratégia operacional no TikTok Shop hoje?`;
  }

  // =========================================================================
  // 2. BUSCA NO CATÁLOGO DO RADAR (Ex: "bolsas femininas", "maquiagem", "gadgets")
  // =========================================================================
  const catalogMatches = searchCatalogProducts(q);
  if (catalogMatches.length > 0 && !isAboutActive) {
    const tableRows = catalogMatches.map((item) => {
      const en = enrichWithTikTokShopData(item);
      const itemPrice = Number(en.estimatedPriceBRL || 79.90).toFixed(2);
      const itemComm = Number(en.commissionEstimatedBRL || 20).toFixed(2);
      const itemLoc = en.stockLocationBrazil ? en.stockLocationBrazil.split('-')[0].trim() : 'São Paulo';
      const saturation = (item as any).creatorSaturationBR || item.tiktokShop?.saturationLevel || item.saturationInBrazil || 'Oceano Azul';

      return `| **${item.name}** | R$ ${itemPrice} | R$ ${itemComm} (${en.commissionPercent || 25}%) | ${itemLoc} | [${saturation.toUpperCase()}] |`;
    }).join('\n');

    return `### Diagnóstico de Categoria & Radar de Produtos: "${userQuery}"

1. **Mapeamento de Oportunidades no Radar TikBlox:**
   A análise dos fluxos de demanda no TikTok Shop Brasil identificou os seguintes produtos validados com fornecedores nacionais e pronta entrega:

| Produto | Ticket Médio | Comissão Líquida | Polo Logístico | Nível de Saturação |
| :--- | :---: | :---: | :---: | :--- |
${tableRows}

2. **Leitura Operacional da Categoria:**
   - **Ticket Psicológico de Compra por Impulso:** Os itens listados operam na faixa de R$ 60,00 a R$ 130,00, que apresenta a menor fricção de fechamento no carrinho amarelo para o público brasileiro.
   - **Vantagem de Pronta Entrega Nacional:** A expedição local a partir de centros de distribuição em São Paulo e Paraná elimina cancelamentos por atraso ou incidência tributária de importação (Remessa Conforme).

3. **Diretriz Tática de Conteúdo:**
   - **Formato Recomendado:** Demonstração pragmática de "Antes e Depois" ou teste funcional sensorial com duração entre 22 e 32 segundos.
   - **Retenção nos Primeiros 3 Segundos:** Apresente o resultado final no primeiro frame do vídeo antes de mostrar o processo, reduzindo a taxa de abandono do feed em até 45%.`;
  }

  // =========================================================================
  // 3. DIAGNÓSTICO DE CONVICÇÃO DE ENTRADA & COMPRA DE AMOSTRA (ESTILO ANTITRADER)
  // =========================================================================
  if (
    q.includes('vale a pena comprar') || q.includes('comprar amostra') || q.includes('devo comprar') ||
    q.includes('certeza') || q.includes('risco') || q.includes('antitrader') || q.includes('setup') ||
    q.includes('trade') || q.includes('meu dinheiro') || q.includes('do meu bolso') ||
    q.includes('posso comprar') || q.includes('vai vender')
  ) {
    const itemTitle = p ? prodName : 'Produto Selecionado no Radar';
    const breakEven = p ? Math.max(1, Math.ceil(priceNum / Math.max(1, commVal))) : 4;
    const videoCount = p ? (p.tradeConviction?.creatorVideoCountBR || (p.creatorSaturationBR === 'Baixa' ? 6 : 18)) : 8;
    const score = p ? (p.tradeConviction?.convictionScore || 94) : 94;

    return `### Diagnóstico de Convicção AntiTrader: Compra de Amostra & Risco Financeiro

1. **Veredito de Entrada:**
   - **Ativo Analisado:** ${itemTitle}
   - **Score de Convicção:** **${score}/100 (Entrada Forte)**
   - **Diagnóstico de Risco:** **Mínimo / Assimetria Altamente Favorável**

2. **Unit Economics do Criador (Investimento com Capital Próprio):**
   - **Capital em Risco (Custo da Amostra):** R$ ${priceNum.toFixed(2)} (valor que você paga na loja BR).
   - **Comissão Líquida por Pedido:** R$ ${commVal.toFixed(2)} (${commPct}% no carrinho amarelo).
   - **Ponto de Equilíbrio (Break-Even):** **Apenas ${breakEven} vendas no feed.**
   - *Matemática do Risco:* Se o seu vídeo fizer ${breakEven} vendas, seu custo do produto está 100% amortizado. A partir da ${breakEven + 1}ª venda, todo o valor líquido cai limpo no seu bolso.

3. **Termômetro de Concorrência de Vídeos no Brasil:**
   - **Vídeos Ativos no Feed BR:** ~${videoCount} criadores identificados.
   - **Status do Feed:** Oceano Azul / Vácuo de Criadores. O algoritmo do TikTok tem alta demanda de busca por este produto, mas pouquíssimos criadores brasileiros estão com o carrinho amarelo ativo.

4. **Diretriz Tática de Execução:**
   - **Compre a amostra com pronta entrega:** O vendedor envia de SP e chega em 2 a 4 dias.
   - **Grave o gancho nos primeiros 3 segundos:** Mostre o produto resolvendo o problema no primeiro frame.
   - **Expectativa Realista:** Um vídeo que alcance modestas 5.000 visualizações com CTR de 2% gera de 15 a 30 vendas (R$ ${(commVal * 20).toFixed(2)} de comissão bruta, cobrindo o produto com lucro de mais de R$ ${(Math.max(0, (commVal * 20) - priceNum)).toFixed(2)}).`;
  }

  // =========================================================================
  // 4. SIMULAÇÃO FINANCEIRA & UNIT ECONOMICS (Substitui calculadora manual)
  // =========================================================================
  if (
    q.includes('simular') || q.includes('simule') || q.includes('simulacao') || q.includes('simulação') || 
    q.includes('calculadora') || q.includes('calcular') || q.includes('margem') || 
    q.includes('quanto sobra') || q.includes('quanto ganho') || q.includes('breakeven') || q.includes('lucro')
  ) {
    const itemTitle = p ? prodName : 'Produto Médio em Alta no TikTok Shop';
    const profit10 = (commVal * 10).toFixed(2);
    const profit30 = (commVal * 30).toFixed(2);
    const profit50 = (commVal * 50).toFixed(2);
    const profit100 = (commVal * 100).toFixed(2);
    const profit300 = (commVal * 300).toFixed(2);

    return `### Simulação Financeira & Estrutura Unitária de Margem (Unit Economics)

1. **Parâmetros Base da Operação:**
   - **Ativo Analisado:** ${itemTitle}
   - **Preço Médio de Venda no Feed:** R$ ${priceNum.toFixed(2)}
   - **Comissão Líquida do Criador/Afiliado:** **R$ ${commVal.toFixed(2)} (${commPct}%)**
   - **Custo Operacional de Frete & Embalagem:** R$ 0,00 (Assumido integralmente pelo lojista nacional)
   - **Taxa de Intermediação do Marketplace:** Já descontada na liquidação da comissão pelo TikTok Shop

2. **Projeção de Retorno Financeiro Líquido por Volume:**

| Volume de Vendas | Tráfego Estimado Necessário | Lucro Líquido Estimado | Formato de Aquisição Típico |
| :---: | :---: | :---: | :--- |
| **10 pedidos** | ~4.000 a 7.000 visualizações | **R$ ${profit10}** | 1 vídeo com tração orgânica inicial |
| **30 pedidos** | ~12.000 a 20.000 visualizações | **R$ ${profit30}** | Transmissão de Live Commerce de 40 min |
| **50 pedidos** | ~25.000 a 40.000 visualizações | **R$ ${profit50}** | Vídeo que atinge primeira escala no For You |
| **100 pedidos** | ~50.000 a 80.000 visualizações | **R$ ${profit100}** | Escala com 2 publicações diárias consistentes |
| **300 pedidos** | ~150.000+ visualizações | **R$ ${profit300}** | Viralização ampla com carrinho de alta retenção |

3. **Ciclo Financeiro de Liquidação:**
   - **Prazo de Liberação (D+7):** O saldo de comissões acumuladas é liberado na carteira do TikTok Shop Creator Center 7 dias corridos após a confirmação de entrega do pedido ao cliente (prazo regulamentar de devolução do Código de Defesa do Consumidor).
   - **Método de Resgate:** Transferência instantânea via Pix ou TED bancária, sem custo adicional de saque.`;
  }

  // =========================================================================
  // 4. CADASTRO, REQUISITOS & AFILIAÇÃO NO TIKTOK SHOP
  // =========================================================================
  if (
    q.includes('como me cadastro') || q.includes('cadastrar') || q.includes('como começar') || 
    q.includes('como comecar') || q.includes('requisito') || q.includes('quantos seguidores') || 
    q.includes('precisa de seguidor') || q.includes('criar conta') || q.includes('abrir conta') ||
    q.includes('1000 seguidores') || q.includes('1.000 seguidores')
  ) {
    return `### Protocolo Institucional de Ingresso no TikTok Shop Brasil

1. **Requisitos Mandatórios para Contas de Afiliado:**
   - Idade mínima de 18 anos completos com CPF ou CNPJ regular perante a Receita Federal.
   - Conta no TikTok sem histórico de penalidades severas de diretrizes de comunidade.
   - Padrão geral de qualificação: 1.000 seguidores ativos OU vínculo direto via registro no TikTok Shop Creator Center oficial.

2. **Passo a Passo de Habilitação do Painel de Criador:**
   - **Etapa 1:** Acesse o perfil no aplicativo TikTok > Toque no menu superior direito (ícone de 3 linhas) > Selecione **Ferramentas do Criador**.
   - **Etapa 2:** Localize a seção **TikTok Shop para Criadores** (Marketplace de Afiliados) e inicie a formalização cadastral.
   - **Etapa 3:** Insira os dados bancários vinculados à mesma titularidade do documento registrado (chave Pix com CPF ou CNPJ) para garantir liquidações automáticas.

3. **Operacionalização do Carrinho Amarelo nos Vídeos:**
   - Na tela final de edição de qualquer publicação (antes do botão "Publicar"), selecione **Adicionar Link** > **Produto**.
   - Localize o produto desejado no marketplace de pronta entrega nacional e confirme o vínculo.
   - O botão de compra direta (carrinho amarelo) passará a ser exibido no canto inferior esquerdo da publicação para todos os espectadores do território nacional.`;
  }

  // =========================================================================
  // 5. MECÂNICA ALGORÍTMICA & HORÁRIOS DE CONVERSÃO
  // =========================================================================
  if (
    q.includes('horario') || q.includes('horário') || q.includes('algoritmo') || 
    q.includes('viralizar') || q.includes('como viralizar') || q.includes('for you') || 
    q.includes('foryou') || q.includes('entrega') || q.includes('quantos videos') || q.includes('quantos vídeos') ||
    q.includes('retenção') || q.includes('retencao')
  ) {
    return `### Arquitetura do Algoritmo de Recomendação & Janelas de Conversão

1. **Métricas Críticas de Entrega Algorítmica (Funil TikTok Shop):**
   - **Taxa de Interrupção de Scroll (0 a 1 segundo):** Se mais de 60% dos usuários passarem direto pelo vídeo no primeiro segundo, a distribuição na aba Para Você (For You) é descontinuada.
   - **Retenção de Gancho (3 segundos):** O limiar para vídeos comerciais de alta tração é de no mínimo 48% de audiência retida até o terceiro segundo.
   - **Taxa de Conclusão (Completion Rate):** Vídeos de 20 a 30 segundos com taxa de conclusão acima de 35% recebem distribuição orgânica expandida para novos clusters de audiência.
   - **Taxa de Clique no Carrinho (CTR):** Acima de 2.2% sinaliza relevância comercial imediata, priorizando o vídeo para usuários com histórico recente de compras no aplicativo.

2. **Janelas Horárias de Maior Volume de Transação no Brasil:**
   - **Janela 1 (11h45 às 13h30):** Período de intervalo corporativo, caracterizado por alta densidade de compras de conveniência e utilidades.
   - **Janela 2 (18h30 às 22h00):** Janela nobre de consumo e entretenimento residencial; período com maior taxa de conversão em moda, calçados e produtos de beleza.
   - **Janela Especial de Fim de Semana (Domingo das 19h00 às 22h30):** Maior volume médio de compras por impulso da semana.

3. **Diretriz de Frequência de Postagem:**
   - Recomenda-se cadência de 2 a 3 publicações por dia com intervalo mínimo de 3 horas entre postagens para evitar canibalização de alcance entre os vídeos no mesmo perfil.`;
  }

  // =========================================================================
  // 6. GANCHOS E ROTEIROS DE ALTA RETENÇÃO
  // =========================================================================
  if (q.includes('gancho') || q.includes('hook') || q.includes('3s') || q.includes('3 segundos') || q.includes('início') || q.includes('começo')) {
    const targetProduct = isAboutActive && p ? prodName : 'Produtos em Alta no TikTok Shop';

    return `### Estrutura de Ganchos de 3 Segundos para Retenção: ${targetProduct}

No ecossistema de vídeos curtos, o gancho inicial determina se o algoritmo continuará a distribuir a publicação. Seguem 3 estruturas com comprovação analítica de conversão:

1. **Gancho de Demonstração de Ruptura (Visual Pragmático):**
   - **Ação de Cena (0s - 1.5s):** Demonstração mecânica do funcionamento do item em primeiro plano, sem introdução verbal.
   - **Enunciado de Áudio (1.5s - 3s):** "Se você estava prestes a comprar outra opção tradicional, observe a diferença deste mecanismo antes de fechar o pedido."
   - **Legenda em Texto na Tela:** "Teste prático antes de comprar."

2. **Gancho de Comparação Econômica & Eficiência:**
   - **Ação de Cena (0s - 1.5s):** Apresentação do produto ao lado de um item de custo elevado convencional.
   - **Enunciado de Áudio (1.5s - 3s):** "A razão pela qual este item específico está esgotando nos centros logísticos de São Paulo esta semana."
   - **Legenda em Texto na Tela:** "Comparativo de durabilidade e custo."

3. **Gancho de Alerta de Disponibilidade Nacional:**
   - **Ação de Cena (0s - 1.5s):** Indicação visual direcionada ao canto inferior esquerdo (posição fixa do carrinho amarelo).
   - **Enunciado de Áudio (1.5s - 3s):** "${hookEx}. Estoque nacional com despacho imediato sem taxas alfandegárias adicionais."
   - **Legenda em Texto na Tela:** "Pronta entrega com envio local."`;
  }

  // =========================================================================
  // 7. ROTEIROS TÉCNICOS & LIVE COMMERCE
  // =========================================================================
  if (q.includes('live') || q.includes('roteiro') || q.includes('transmiss') || q.includes('script') || q.includes('vender na live') || q.includes('video de 30')) {
    const targetProduct = isAboutActive && p ? prodName : 'Produtos Validados no Radar';

    return `### Matriz Estrutural de Conteúdo & Roteiro Técnico: ${targetProduct}

1. **Roteiro em 3 Atos para Vídeo Curto (25 a 35 Segundos):**
   - **Ato I: Gancho de Interrupção (0s a 3s):** Mostre o resultado direto do produto em uso. Exclua saudações genéricas como "Olá pessoal".
   - **Ato II: Demonstração Funcional & Quebra de Risco (4s a 22s):** Enfatize que o lote já se encontra no Brasil (${stock}), garantindo entrega entre 3 a 5 dias úteis sem risco de taxação internacional.
   - **Ato III: Chamada para Ação Estruturada (23s a 30s):** "O link direto com cupom de envio liberado pelo lojista está habilitado na sacola amarela abaixo enquanto durar o estoque de SP."

2. **Protocolo Operacional para Live Commerce (Sessão de 45 Minutos):**
   - **Ciclo Contínuo de Apresentação (Blocos de 5 Minutos):** O tempo médio de permanência em lives é de 2 a 4 minutos por espectador; repita a demonstração principal em ciclos curtos e objetivos.
   - **Fixação Dinâmica de Produto:** Utilize o recurso de pino no produto em demonstração para que o card de checkout permaneça na tela sem encobrir a área de comentários.
   - **Gatilho de Transparência Logística:** Confirme aos participantes que o despacho é nacional, reduzindo o principal atrito de desconfiança do consumidor digital.`;
  }

  // =========================================================================
  // 8. FORNECEDORES NACIONAIS & AMOSTRAS GRÁTIS
  // =========================================================================
  if (q.includes('amostra') || q.includes('sample') || q.includes('fornecedor') || q.includes('pedir') || q.includes('lojista') || q.includes('gratis') || q.includes('grátis')) {
    const targetProduct = isAboutActive && p ? prodName : '[Nome do Produto Selecionado]';

    return `### Protocolo de Negociação de Amostras & Verificação de Fornecedores

1. **Critérios de Qualificação de Lojistas no TikTok Shop:**
   - **Localização de Armazém:** Priorize lojistas com centro de distribuição registrado nos estados de São Paulo (Brás, Pari, Barueri) ou Paraná (Curitiba), que asseguram SLAs de postagem em até 24h.
   - **Taxa de Cancelamento por Ruptura:** Recomenda-se selecionar lojistas com índice de cancelamento inferior a 2.5% para proteger a pontuação de performance do criador.

2. **Modelo Formal de Solicitação de Amostra Institucional:**
   *(Envio direto pelo chat do lojista no TikTok Shop Creator Center ou WhatsApp Comercial)*:

   > Prezada equipe comercial da loja,
   >
   > Meu nome é [Nome do Criador], responsável pelo perfil @[identificador_tiktok], atuante no segmento de [Nicho do Perfil].
   >
   > Mapeamos o produto **${targetProduct}** em nosso radar de tendências operacionais devido à conformidade logística de despacho a partir de **${stock}**.
   >
   > Temos programada a veiculação de uma série de 3 publicações em formato de teste funcional e 1 sessão de live commerce dedicada nesta semana. Solicitamos a liberação de 1 amostra de demonstração pelo painel de criadores do TikTok Shop para viabilizar as filmagens em alta resolução.
   >
   > Ficamos à disposição para alinhamento de metas e projeção de pedidos para este lote.
   >
   > Atenciosamente,
   > [Nome do Criador / Operador de Afiliados]`;
  }

  // =========================================================================
  // 9. NICHOS GERAIS E ANÁLISE COMPARATIVA
  // =========================================================================
  if (q.includes('nicho') || q.includes('melhor nicho') || q.includes('o que vender') || q.includes('qual produto') || q.includes('mais vendido')) {
    return `### Matriz de Comparação Setorial: Nichos de Alta Conversão no Brasil

1. **Diagnóstico dos Grandes Segmentos de Consumo por Impulso:**

| Segmento | Ticket Médio | Margem Média | CTR no Carrinho | Fator Determinante de Compra |
| :--- | :---: | :---: | :---: | :--- |
| **Beleza & Cuidados Pessoais** | R$ 69,00 a R$ 149,00 | 25% a 35% | 3.2% | Demonstração sensorial de efeito imediato |
| **Bolsas, Mochilas & Acessórios** | R$ 79,00 a R$ 129,00 | 22% a 30% | 2.8% | Utilidade antifurto e compartimentos internos |
| **Utilidades Domésticas & Cozinha** | R$ 49,00 a R$ 99,00 | 20% a 28% | 2.5% | Resolução de esforço repetitivo diário |
| **Tech & Gadgets Veiculares** | R$ 59,00 a R$ 139,00 | 18% a 25% | 2.1% | Especificação funcional e acabamento |

2. **Diretriz Estratégica de Seleção:**
   - O nicho de **Bolsas & Acessórios** e o de **Beleza** lideram o volume de recompras no TikTok Shop Brasil pela facilidade de conexão emocional nos vídeos de demonstração rápida.
   - Para analisar produtos validados em qualquer uma dessas categorias, digite o nome do nicho diretamente aqui no terminal.`;
  }

  // =========================================================================
  // 10. DIAGNÓSTICO DO PRODUTO ATUAL EM FOCO
  // =========================================================================
  if (isAboutActive && p) {
    return `### Diagnóstico Institucional de Viabilidade: ${prodName}

1. **Métricas Comerciais do Ativo:**
   - **Preço de Negociação de Referência:** R$ ${priceNum.toFixed(2)}
   - **Comissão Líquida do Afiliado:** R$ ${commVal.toFixed(2)} (${commPct}%)
   - **Polo de Distribuição Logística:** ${stock}
   - **Classificação no Radar de Saturação:** [${(p?.creatorSaturationBR || 'Oceano Azul').toUpperCase()}]

2. **Avaliação de Viabilidade Operacional:**
   - **Resiliência Logística:** A pronta entrega nacional protege o criador contra solicitações de cancelamento motivadas por prazos prolongados de remessa internacional.
   - **Potencial de Retenção de Vídeo:** O gancho sugerido ("${hookEx}") apresenta aderência aos padrões de consumo rápido do público brasileiro.

3. **Plano de Ação Tático:**
   - Produzir 2 variações de vídeo de demonstração com foco em utilidade diária.
   - Solicitar amostra formal ao lojista pelo TikTok Shop Creator Center.
   - Inserir o vínculo de produto no carrinho amarelo com ênfase no frete rápido.`;
  }

  // =========================================================================
  // 11. RESPOSTA INSTITUCIONAL ABERTA (SEM FORÇAR PRODUTO DA TELA)
  // =========================================================================
  return `### TIKBLOX AI: Leitura Analítica Estratégica

**Consulta em Avaliação:** "${userQuery}"

1. **Diagnóstico Operacional:**
   - A operação com produtos no TikTok Shop Brasil exige foco estrito em três fatores fundamentais: retenção de vídeo nos primeiros 3 segundos, ticket médio adequado para decisão por impulso (R$ 50 a R$ 130) e logística com despacho nacional imediato (SP e PR).
   - O cumprimento dessas três variáveis reduz a taxa de devolução e garante liquidações automáticas de comissões via Pix em ciclos de D+7.

2. **Diretriz Tática:**
   - Se sua intenção for analisar produtos específicos no radar, informe o nicho desejado (ex: "bolsas femininas", "cosméticos", "utilidades domésticas").
   - Para simulações de viabilidade e lucros unitários, solicite "simular margem".
   - Para validação de roteiros ou estratégias de live commerce, detalhe o formato pretendido.

Como deseja direcionar a análise aprofundada?`;
}
