// api/chat.ts - Vercel Serverless Function (Self-contained)
export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type,x-gemini-key');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages = [], productContext, customApiKey } = req.body || {};
  const clientKeyHeader = (req.headers['x-gemini-key'] as string) || customApiKey;
  const lastMessage = messages.slice(-1)[0]?.content || '';

  const isAboutActive = productContext ? isQuerySpecificallyAboutProduct(lastMessage, productContext) : false;

  const systemPrompt = `Você é a TIKBLOX AI, inteligência analítica especializada em Mercado, Algoritmo do TikTok Shop Brasil, E-commerce de Pronta Entrega Nacional e Unit Economics.
Você tem a capacidade analítica completa, aberta, flexível e conversacional. Responda a qualquer pergunta, dúvida teórica, conceitual, técnica, logística, regras de comissão, saques via Pix, comportamento do algoritmo do TikTok ou estratégias de escala com total profundidade e sem respostas pré-fabricadas.

DIRETRIZES FUNDAMENTAIS:
1. RESPONDA DIRETAMENTE AO QUE O USUÁRIO PERGUNTOU:
   - Se a pergunta for conceitual, teórica ou aberta (ex: "como funciona o algoritmo", "o que é retenção de 3s", "como me cadastro como afiliado", "regras de saque", "quais os requisitos de seguidores"): explique de forma técnica, brilhante, didática e aprofundada, com dados numéricos e regras reais da plataforma. Não force a análise no produto selecionado se a pergunta for ampla.
   - Se o usuário perguntar sobre nichos específicos ou categorias (ex: "bolsas femininas", "maquiagem", "gadgets", "casa e cozinha"): liste e analise os produtos e padrões desse nicho no TikTok Shop Brasil, apresentando ticket médio, margem de comissão e formatos de vídeo ideais.
   - Se o usuário pedir simulações ("simular margem", "calcular lucro"): apresente uma tabela estruturada de unit economics (preço de venda, comissão líquida, taxas da plataforma e projeção de ganho por volume).
   - Se a pergunta for especificamente sobre o produto em foco (${productContext?.name || ''}): aprofunde o diagnóstico de viabilidade, concorrência, fornecedores nacionais e gatilhos de conversão desse produto.
2. NUNCA UTILIZE EMOJIS: Mantenha um padrão analítico institucional, técnico e limpo, sem nenhum emoji.
3. DESIGN E FORMATAÇÃO VISUAL (LEGIBILIDADE EXECUTIVA):
   - NUNCA escreva blocos maciços ou paredes de texto corrido. O usuário odeia ler textos densos sem respiro visual.
   - Divida o texto em blocos e parágrafos curtos (máximo 2 a 3 frases por parágrafo).
   - Use títulos claros (### 1. Diagnóstico, ### 2. Leitura Operacional & Algoritmo, ### 3. Diretriz Tática).
   - Use listas com marcadores (-) destacando métricas e dados em negrito (ex: **R$ 62,83 de margem líquida (33%)**).
   - Ao apresentar números, cálculos ou comparativos, utilize SEMPRE uma tabela Markdown bem estruturada com uma linha em branco antes e depois da tabela:
     | Métrica | Cenário A | Cenário B |
     | :--- | :---: | :---: |
     | **Preço de Venda** | R$ 189,90 | R$ 189,90 |
   - Para avisos de regras, prazos de saque Pix ou logística, utilize o formato de destaque:
     > **Nota Operacional:** [explicação concisa e direta]`;

  // ==========================================
  // TIER 1: GOOGLE GEMINI CLUSTER (Chave Customizada + AI Studio + Reservas)
  // ==========================================
  const geminiKeys = [
    clientKeyHeader,
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
    process.env.GEMINI_API_KEY_BACKUP,
  ].filter((k) => typeof k === 'string' && k.trim().length > 10) as string[];

  const geminiModels = [
    'gemini-3.8-flash',
    'gemini-2.5-flash',
    'gemini-1.5-flash',
    'gemini-2.0-flash',
    'gemini-3.1-flash-lite',
  ];

  for (const geminiKey of geminiKeys) {
    for (const model of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        
        const formattedContents = messages.slice(-8).map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const geminiRes = await fetch(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            system_instruction: {
              parts: [{ text: systemPrompt }],
            },
            contents: formattedContents.length > 0 ? formattedContents : [{ parts: [{ text: lastMessage }] }],
          }),
        });

        if (geminiRes.ok) {
          const geminiData = await geminiRes.json();
          const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply) {
            return res.status(200).json({ reply, usedSource: `Gemini (${model})`, provider: 'gemini' });
          }
        }
      } catch (geminiErr) {
        console.warn(`Gemini (${model}) falhou, testando failover...`, geminiErr);
      }
    }
  }

  // ==========================================
  // TIER 2: GROQ CLUSTER (LLaMA 3.3 70B Versatile)
  // ==========================================
  const groqKeys = [
    process.env.GROQ_API_KEY,
    process.env.GROQ_API_KEY_2,
    process.env.GROQ_API_KEY_3,
  ].filter(Boolean) as string[];

  for (const groqKey of groqKeys) {
    try {
      const groqRes = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${groqKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.slice(-8).map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          ],
          temperature: 0.6,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply, usedSource: 'Groq (LLaMA 3.3 70B)', provider: 'groq' });
        }
      }
    } catch (groqErr) {
      console.warn('Groq cluster connection error, cascading to backup:', groqErr);
    }
  }

  // ==========================================
  // TIER 3: AUTONOMOUS INSTITUTIONAL HEURISTIC ENGINE (100% Offline & Ilimitado)
  // ==========================================
  const autonomousReply = generateAutonomousTikTokShopReplyInternal(lastMessage, productContext);
  return res.status(200).json({
    reply: autonomousReply,
    usedSource: 'Motor Analítico Institucional TikBlox',
    provider: 'autonomous_engine',
  });
}

function isQuerySpecificallyAboutProduct(query: string, product?: any): boolean {
  if (!product) return false;
  const q = (query || '').toLowerCase().trim();

  const directRefs = [
    'este produto', 'esse produto', 'dele', 'deste', 'desse', 'nele', 'nesse',
    'o produto', 'este item', 'esse item', 'essa oferta', 'esta oferta',
    'como vendo ele', 'como vendo esse', 'comissão dele', 'preço dele', 'gancho dele',
    'roteiro para ele', 'amostra dele', 'fornecedor dele', 'análise dele'
  ];
  if (directRefs.some((ref) => q.includes(ref))) return true;

  const nameWords = (product.name || '')
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúãõâêîôûç ]/gi, '')
    .split(' ')
    .filter((w: string) => w.length >= 4 && !['para', 'com', 'sem', 'mais', 'mini', 'novo', 'super'].includes(w));

  if (nameWords.length > 0 && nameWords.some((w: string) => q.includes(w))) {
    return true;
  }

  return false;
}

function generateAutonomousTikTokShopReplyInternal(
  userQuery: string,
  productContext?: any
): string {
  const q = (userQuery || '').toLowerCase().trim();
  const isAboutActive = isQuerySpecificallyAboutProduct(q, productContext);

  const prodName = isAboutActive && productContext?.name ? productContext.name : 'Produto em Análise';
  const priceNum = isAboutActive && productContext?.estimatedPriceBRL ? Number(productContext.estimatedPriceBRL) : 89.90;
  const commPct = isAboutActive && productContext?.commissionPercent ? Number(productContext.commissionPercent) : 25;
  const commVal = isAboutActive && productContext?.commissionEstimatedBRL ? Number(productContext.commissionEstimatedBRL) : (priceNum * (commPct / 100));
  const stock = isAboutActive && productContext?.stockLocationBrazil ? productContext.stockLocationBrazil : 'São Paulo / Curitiba (Estoque Nacional)';
  const hookEx = isAboutActive && productContext?.hookViral3s ? productContext.hookViral3s : 'Demonstração prática de utilidade imediata';

  // 1. SAUDAÇÃO & APRESENTAÇÃO INSTITUCIONAL
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

  // 2. BUSCA POR BOLSAS, ACESSÓRIOS & CATEGORIAS ESPECÍFICAS
  if ((q.includes('bolsa') || q.includes('bolsas') || q.includes('mochila') || q.includes('carteira')) && !isAboutActive) {
    return `### Diagnóstico de Categoria & Radar de Produtos: Bolsas & Acessórios Femininos

1. **Mapeamento de Oportunidades no Radar TikBlox:**
   A análise de demanda no TikTok Shop Brasil mapeou as seguintes oportunidades validadas com fornecedores nacionais e pronta entrega:

| Produto | Ticket Médio | Comissão Líquida | Polo Logístico | Nível de Saturação |
| :--- | :---: | :---: | :---: | :--- |
| **Mochila Antifurto Impermeável com Entrada USB** | R$ 89,90 | R$ 22,50 (25%) | São Paulo - SP | [OCEANO AZUL] |
| **Bolsa Transversal Crossbody Compacta Anti-Corte** | R$ 74,90 | R$ 18,70 (25%) | São Paulo - SP | [ALTA TRAÇÃO] |
| **Carteira Feminina com Bloqueio Anti-RFID** | R$ 49,90 | R$ 13,97 (28%) | São Paulo - SP | [CRESCIMENTO] |
| **Bolsa Tiracolo de Nylon Térmica e Impermeável** | R$ 69,90 | R$ 17,47 (25%) | Curitiba - PR | [ESTÁVEL] |

2. **Leitura Operacional da Categoria:**
   - **Decisão por Impulso:** Bolsas e mochilas femininas possuem a maior taxa de conversão direta em vídeos do tipo "What's In My Bag" (O que cabe na bolsa), com CTR médio no carrinho amarelo de 2.8%.
   - **Logística Nacional de SP/PR:** Produtos com pronta entrega chegam em 3 a 5 dias úteis, garantindo taxa de cancelamento inferior a 2%.

3. **Diretriz Tática de Conteúdo:**
   - **Retenção de 3 Segundos:** Inicie o vídeo abrindo o compartimento antifurto ou demonstrando o teste de água na superfície impermeável antes de falar qualquer frase de saudação.`;
  }

  // 3. BELEZA, COSMÉTICOS & MAQUIAGEM
  if ((q.includes('beleza') || q.includes('maquiagem') || q.includes('cabelo') || q.includes('skincare') || q.includes('estetica')) && !isAboutActive) {
    return `### Diagnóstico de Categoria & Radar de Produtos: Beleza & Cuidados Pessoais

1. **Mapeamento de Oportunidades no Radar TikBlox:**

| Produto | Ticket Médio | Comissão Líquida | Polo Logístico | Nível de Saturação |
| :--- | :---: | :---: | :---: | :--- |
| **Escova Secadora Modeladora Multifuncional 5 em 1** | R$ 149,90 | R$ 37,47 (25%) | São Paulo - SP | [ALTA DEMANDA] |
| **Depilador a Laser IPL Definitivo Portátil** | R$ 189,90 | R$ 47,47 (25%) | São Paulo - SP | [OCEANO AZUL] |
| **Sérum Anti-Idade Facial com Ácido Hialurônico** | R$ 59,90 | R$ 17,97 (30%) | São Paulo - SP | [CRESCIMENTO] |
| **Kit Pincéis Profissionais com Estojo Magnético** | R$ 79,90 | R$ 22,37 (28%) | Curitiba - PR | [ESTÁVEL] |

2. **Leitura Operacional:**
   - O nicho de beleza possui o maior ticket médio de compra e maior probabilidade de viralização orgânica por comparação visual (Antes vs Depois sem cortes).`;
  }

  // 4. SIMULAÇÃO FINANCEIRA DE LUCRO & UNIT ECONOMICS
  if (
    q.includes('simular') || q.includes('simule') || q.includes('simulacao') || q.includes('simulação') || 
    q.includes('calculadora') || q.includes('calcular') || q.includes('margem') || 
    q.includes('quanto sobra') || q.includes('quanto ganho') || q.includes('breakeven') || q.includes('lucro')
  ) {
    const profit10 = (commVal * 10).toFixed(2);
    const profit30 = (commVal * 30).toFixed(2);
    const profit50 = (commVal * 50).toFixed(2);
    const profit100 = (commVal * 100).toFixed(2);
    const profit300 = (commVal * 300).toFixed(2);

    return `### Simulação Financeira & Estrutura Unitária de Margem (Unit Economics)

1. **Parâmetros Base da Operação:**
   - **Ativo Analisado:** ${prodName}
   - **Preço Médio de Venda no Feed:** R$ ${priceNum.toFixed(2)}
   - **Comissão Líquida do Criador/Afiliado:** **R$ ${commVal.toFixed(2)} (${commPct}%)**
   - **Custo de Envio & Embalagem:** R$ 0,00 (Assumido integralmente pelo lojista de pronta entrega)
   - **Taxa de Intermediação da Plataforma:** Já descontada na fonte pelo TikTok Shop

2. **Projeção de Retorno Financeiro Líquido por Volume:**

| Volume de Vendas | Tráfego Necessário Estimado | Lucro Líquido Estimado | Formato de Aquisição Típico |
| :---: | :---: | :---: | :--- |
| **10 pedidos** | ~4.000 a 7.000 visualizações | **R$ ${profit10}** | 1 vídeo com tração orgânica inicial |
| **30 pedidos** | ~12.000 a 20.000 visualizações | **R$ ${profit30}** | Transmissão de Live Commerce de 40 min |
| **50 pedidos** | ~25.000 a 40.000 visualizações | **R$ ${profit50}** | Vídeo que atinge primeira escala no For You |
| **100 pedidos** | ~50.000 a 80.000 visualizações | **R$ ${profit100}** | Escala com 2 publicações diárias consistentes |
| **300 pedidos** | ~150.000+ visualizações | **R$ ${profit300}** | Viralização ampla com carrinho de alta retenção |

3. **Ciclo Financeiro de Liquidação:**
   - **Prazo de Liberação (D+7):** O saldo de comissões é liberado na carteira do TikTok Shop Creator Center 7 dias corridos após a confirmação de entrega ao cliente.
   - **Método de Resgate:** Transferência instantânea via Pix, sem cobrança de taxas de saque.`;
  }

  // 5. CADASTRO, REQUISITOS & COMO COMEÇAR
  if (
    q.includes('como me cadastro') || q.includes('cadastrar') || q.includes('como começar') || 
    q.includes('como comecar') || q.includes('requisito') || q.includes('quantos seguidores') || 
    q.includes('precisa de seguidor') || q.includes('criar conta') || q.includes('abrir conta') ||
    q.includes('1000 seguidores') || q.includes('1.000 seguidores')
  ) {
    return `### Protocolo Institucional de Ingresso no TikTok Shop Brasil

1. **Requisitos Mandatórios para Contas de Afiliado:**
   - Idade mínima de 18 anos completos com CPF ou CNPJ regular perante a Receita Federal.
   - Conta no TikTok sem histórico de violação grave de diretrizes comunitárias.
   - Padrão geral de qualificação: 1.000 seguidores ativos OU vínculo direto via registro no TikTok Shop Creator Center oficial.

2. **Passo a Passo de Habilitação do Painel de Criador:**
   - **Etapa 1:** Acesse o perfil no aplicativo TikTok > Menu superior direito > **Ferramentas do Criador**.
   - **Etapa 2:** Selecione a opção **TikTok Shop para Criadores** (Marketplace de Afiliados) e complete a identificação cadastral.
   - **Etapa 3:** Cadastre a chave Pix vinculada ao mesmo CPF ou CNPJ registrado para recebimento automatizado de comissões.

3. **Operacionalização do Carrinho Amarelo nos Vídeos:**
   - Na tela de publicação do vídeo, clique em **Adicionar Link** > **Produto**.
   - Localize o produto validado de estoque nacional e confirme. O carrinho amarelo passará a ser exibido no canto inferior do vídeo.`;
  }

  // 6. ALGORITMO, HORÁRIOS & COMO VIRALIZAR
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
   - **Janela Especial de Fim de Semana (Domingo das 19h00 às 22h30):** Maior volume médio de compras por impulso da semana.`;
  }

  // 7. GANCHOS VIRAIS (HOOKS)
  if (q.includes('gancho') || q.includes('hook') || q.includes('3s') || q.includes('3 segundos') || q.includes('início') || q.includes('começo')) {
    return `### Estrutura de Ganchos de 3 Segundos para Retenção: ${prodName}

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

  // 8. ROTEIROS TÉCNICOS & LIVE COMMERCE
  if (q.includes('live') || q.includes('roteiro') || q.includes('transmiss') || q.includes('script') || q.includes('vender na live') || q.includes('video de 30')) {
    return `### Matriz Estrutural de Conteúdo & Roteiro Técnico: ${prodName}

1. **Roteiro em 3 Atos para Vídeo Curto (25 a 35 Segundos):**
   - **Ato I: Gancho de Interrupção (0s a 3s):** Mostre o resultado direto do produto em uso. Exclua saudações genéricas como "Olá pessoal".
   - **Ato II: Demonstração Funcional & Quebra de Risco (4s a 22s):** Enfatize que o lote já se encontra no Brasil (${stock}), garantindo entrega entre 3 a 5 dias úteis sem risco de taxação internacional.
   - **Ato III: Chamada para Ação Estruturada (23s a 30s):** "O link direto com cupom de envio liberado pelo lojista está habilitado na sacola amarela abaixo enquanto durar o estoque de SP."

2. **Protocolo Operacional para Live Commerce (Sessão de 45 Minutos):**
   - **Ciclo Contínuo de Apresentação (Blocos de 5 Minutos):** O tempo médio de permanência em lives é de 2 a 4 minutos por espectador; repita a demonstração principal em ciclos curtos e objetivos.
   - **Fixação Dinâmica de Produto:** Utilize o recurso de pino no produto em demonstração para que o card de checkout permaneça na tela sem encobrir a área de comentários.`;
  }

  // 9. NICHOS GERAIS
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
   - O nicho de **Bolsas & Acessórios** e o de **Beleza** lideram o volume de recompras no TikTok Shop Brasil pela facilidade de conexão emocional nos vídeos de demonstração rápida.`;
  }

  // 10. DIAGNÓSTICO DO PRODUTO ATUAL EM FOCO
  if (isAboutActive && productContext) {
    return `### Diagnóstico Institucional de Viabilidade: ${prodName}

1. **Métricas Comerciais do Ativo:**
   - **Preço de Negociação de Referência:** R$ ${priceNum.toFixed(2)}
   - **Comissão Líquida do Afiliado:** R$ ${commVal.toFixed(2)} (${commPct}%)
   - **Polo de Distribuição Logística:** ${stock}
   - **Classificação no Radar de Saturação:** [${(productContext?.creatorSaturationBR || 'Oceano Azul').toUpperCase()}]

2. **Avaliação de Viabilidade Operacional:**
   - **Resiliência Logística:** A pronta entrega nacional protege o criador contra solicitações de cancelamento motivadas por prazos prolongados de remessa internacional.
   - **Potencial de Retenção de Vídeo:** O gancho sugerido ("${hookEx}") apresenta aderência aos padrões de consumo rápido do público brasileiro.

3. **Plano de Ação Tático:**
   - Produzir 2 variações de vídeo de demonstração com foco em utilidade diária.
   - Solicitar amostra formal ao lojista pelo TikTok Shop Creator Center.
   - Inserir o vínculo de produto no carrinho amarelo com ênfase no frete rápido.`;
  }

  // 11. RESPOSTA INSTITUCIONAL ABERTA
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
