export default async function handler(req: any, res: any) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages = [], productContext } = req.body || {};
  const lastMessage = messages.slice(-1)[0]?.content || '';

  const isAboutActive = productContext ? isQuerySpecificallyAboutProduct(lastMessage, productContext) : false;

  const systemPrompt = `Você é a TIKBLOX AI, inteligência especialista em TikTok Shop Brasil do TikBlox Pro.
Sua missão é ajudar criadores e afiliados a venderem mais no TikTok Shop Brasil com produtos de pronta entrega nacional. Você é uma IA amigável, acolhedora, prática e aberta a responder NORMALMENTE qualquer pergunta (sobre cadastro no TikTok Shop, requisitos de seguidores, regras de comissão, saques via Pix, logística nacional, horários de postagem, ganchos, roteiros, lives, fornecedores de SP/PR e estratégias de e-commerce).

${isAboutActive && productContext ? `PRODUTO ESPECÍFICO EM FOCO (o usuário está perguntando sobre ele):
Nome: ${productContext.name}
Preço: R$ ${productContext.estimatedPriceBRL}
Comissão: ${productContext.commissionPercent || 25}% (R$ ${productContext.commissionEstimatedBRL || 15})
Estoque: ${productContext.stockLocationBrazil || 'São Paulo - SP'}
Amostra Grátis: ${productContext.freeSampleAvailable ? 'Sim' : 'Sob consulta'}
Foque suas orientações neste produto.` : `O usuário fez uma pergunta ABERTA, geral ou sobre outro nicho/categoria (ex: "${lastMessage}").
NUNCA force nem mencione o produto que está na tela do meio (${productContext?.name || ''}). Responda DIRETAMENTE à pergunta do usuário, apresentando recomendações e dados sobre o nicho perguntado.`}

Instruções:
- Seja ultra prática, conversacional, amigável e focada em alta conversão no público brasileiro.
- Se o usuário perguntar sobre nichos ou produtos específicos (ex: bolsas femininas, maquiagem, acessórios, produtos para casa, pets), liste produtos com alta conversão no TikTok Shop BR com estimativas de comissão e estratégias de vídeos curtos.
- Formate com títulos em Markdown, bullet points claros e ganchos magnéticos de 3 segundos quando relevante.`;

  // ==========================================
  // TIER 1: GROQ CLUSTER (Chave Principal + Reservas)
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
            ...messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          ],
          temperature: 0.7,
        }),
      });

      if (groqRes.ok) {
        const data = await groqRes.json();
        const reply = data.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply, provider: 'groq' });
        }
      } else {
        console.warn(`Groq key failed with HTTP ${groqRes.status}, cascading to backup...`);
      }
    } catch (groqErr) {
      console.warn('Groq cluster connection error, cascading to backup:', groqErr);
    }
  }

  // ==========================================
  // TIER 2: GOOGLE GEMINI CLUSTER (Chave Principal + Reservas)
  // ==========================================
  const geminiKeys = [
    process.env.GEMINI_API_KEY,
    process.env.GEMINI_API_KEY_2,
    process.env.GEMINI_API_KEY_3,
  ].filter(Boolean) as string[];

  for (const geminiKey of geminiKeys) {
    try {
      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`;
      const geminiRes = await fetch(geminiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: systemPrompt }],
          },
          contents: [
            {
              parts: [{ text: lastMessage }],
            },
          ],
        }),
      });

      if (geminiRes.ok) {
        const geminiData = await geminiRes.json();
        const reply = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (reply) {
          return res.status(200).json({ reply, provider: 'gemini' });
        }
      } else {
        console.warn(`Gemini key failed with HTTP ${geminiRes.status}, cascading to backup...`);
      }
    } catch (geminiErr) {
      console.warn('Gemini cluster connection error, cascading to backup:', geminiErr);
    }
  }

  // ==========================================
  // TIER 3: OPENROUTER CLUSTER (Reserva Adicional)
  // ==========================================
  const openRouterKeys = [
    process.env.OPENROUTER_API_KEY,
    process.env.OPENROUTER_API_KEY_2,
  ].filter(Boolean) as string[];

  for (const orKey of openRouterKeys) {
    try {
      const orRes = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${orKey}`,
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.3-70b-instruct:free',
          messages: [
            { role: 'system', content: systemPrompt },
            ...messages.map((m: any) => ({
              role: m.role === 'assistant' ? 'assistant' : 'user',
              content: m.content,
            })),
          ],
        }),
      });

      if (orRes.ok) {
        const orData = await orRes.json();
        const reply = orData.choices?.[0]?.message?.content;
        if (reply) {
          return res.status(200).json({ reply, provider: 'openrouter' });
        }
      }
    } catch (orErr) {
      console.warn('OpenRouter connection error:', orErr);
    }
  }

  // ==========================================
  // TIER 4: AUTONOMOUS HEURISTIC ENGINE (100% Offline & Ilimitado)
  // ==========================================
  // Nunca falha, zero dependência externa de saldo, tokens ou rate-limit.
  const autonomousReply = generateAutonomousTikTokShopReply(lastMessage, productContext);
  return res.status(200).json({ reply: autonomousReply, provider: 'autonomous_engine' });
}

function isQuerySpecificallyAboutProduct(query: string, product?: any): boolean {
  if (!product) return false;
  const q = (query || '').toLowerCase().trim();

  const directRefs = [
    'este produto', 'esse produto', 'dele', 'deste', 'desse', 'nele', 'nesse',
    'o produto', 'este item', 'esse item', 'essa oferta', 'esta oferta',
    'como vendo ele', 'como vendo esse', 'comissão dele', 'preço dele', 'gancho dele',
    'roteiro para ele', 'amostra dele', 'fornecedor dele'
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

function generateAutonomousTikTokShopReply(
  userQuery: string,
  productContext?: any
): string {
  const q = (userQuery || '').toLowerCase().trim();
  const isAboutActive = isQuerySpecificallyAboutProduct(q, productContext);

  const prodName = isAboutActive && productContext?.name ? productContext.name : 'Produto em Alta no TikTok Shop';
  const commissionVal = Number(productContext?.commissionEstimatedBRL || productContext?.tiktokShop?.commissionValueBRL || 22);
  const commissionPct = Number(productContext?.commissionPercent || productContext?.tiktokShop?.commissionRatePercent || 25);
  const commission = `R$ ${commissionVal.toFixed(2)} (${commissionPct}%)`;
  const price = productContext?.estimatedPriceBRL ? `R$ ${Number(productContext.estimatedPriceBRL).toFixed(2)}` : 'R$ 89,90';
  const stock = productContext?.stockLocationBrazil || productContext?.tiktokShop?.stockLocation || 'São Paulo - SP (Estoque Nacional)';
  const hookEx = productContext?.hookViral3s || 'Pare de perder tempo com isso agora mesmo!';

  // 1. SAUDAÇÃO & APRESENTAÇÃO ABERTA
  if (
    q === 'oi' || q === 'ola' || q === 'olá' || q.includes('bom dia') || q.includes('boa tarde') || 
    q.includes('boa noite') || q.includes('tudo bem') || q.includes('quem e voce') || q.includes('quem é você') ||
    q.includes('como funciona a ia') || q.includes('o que você faz') || q.includes('o que voce faz')
  ) {
    return `### 👋 Olá! Sou a **TIKBLOX AI**!

Sou a inteligência especialista em **TikTok Shop Brasil**. Estou aqui para responder **qualquer dúvida** sobre como vender, escolher produtos, criar vídeos virais e faturar alto como afiliado ou criador de conteúdo.

**Você pode me perguntar livremente coisas como:**
- *"Quais bolsas femininas estão em alta no radar?"*
- *"Como me cadastrar como afiliado no TikTok Shop?"*
- *"Quantos seguidores preciso ter para começar?"*
- *"Qual o melhor nicho para vender no Brasil hoje?"*
- *"Qual o melhor horário para postar no TikTok?"*
${productContext ? `- *"Gere um roteiro para o produto selecionado na tela"*` : ''}

Fique à vontade! O que você gostaria de saber ou planejar agora? 🚀`;
  }

  // 2. BUSCA POR BOLSAS, ACESSÓRIOS & CATEGORIAS ESPECÍFICAS
  if ((q.includes('bolsa') || q.includes('bolsas') || q.includes('mochila') || q.includes('carteira')) && !isAboutActive) {
    return `### 👜 Produtos em Alta no Radar TikBlox: **Bolsas e Acessórios Femininos**

Aqui estão as opções de **Bolsas e Acessórios** validadas com maior taxa de conversão no TikTok Shop Brasil:

1. **Bolsa Tiracolo Crossbody Sling Bag com Carregamento USB e Trava Anti-Corte**
   - 💰 **Preço no Feed:** R$ 79,90 | **Sua Comissão:** R$ 19,97 (25%)
   - 📦 **Estoque:** São Paulo - SP (Pronta Entrega via Correios/Jadlog)
   - ⚡ **Gancho de 3s:** *"A bolsa antifurto que os ladrões de SP odeiam... olha o que tem dentro!"*

2. **Carteira Feminina Compacta com Proteção Anti-RFID**
   - 💰 **Preço no Feed:** R$ 49,90 | **Sua Comissão:** R$ 13,97 (28%)
   - 📦 **Estoque:** São Paulo - SP
   - ⚡ **Gancho de 3s:** *"Você sabia que podem clonar seu cartão só encostando na sua bolsa? Essa carteira bloqueia na hora!"*

3. **Mochila Executiva Antifurto Feminina Impermeável**
   - 💰 **Preço no Feed:** R$ 139,90 | **Sua Comissão:** R$ 39,17 (28%)
   - 📦 **Estoque:** Curitiba - PR

💡 **Dica de Ouro para Vender Bolsas:** Grave vídeos no estilo *"What's in my bag"* (O que cabe na minha bolsa). Mostre maquiagem, celular, chaves e carteira cabendo perfeitamente nos compartimentos. Vídeos sensoriais desse tipo vendem por puro impulso pelo carrinho amarelo!`;
  }

  // 3. BELEZA, COSMÉTICOS & MAQUIAGEM
  if ((q.includes('beleza') || q.includes('maquiagem') || q.includes('cabelo') || q.includes('skincare') || q.includes('estetica')) && !isAboutActive) {
    return `### 💄 Produtos em Alta no Radar TikBlox: **Beleza & Cuidados Pessoais**

O nicho de beleza feminina tem o maior ticket de impulso do TikTok Shop Brasil. Os produtos mais quentes do radar:

1. **Escova Secadora Modeladora Multifuncional 5 em 1**
   - 💰 Preço: R$ 149,90 | Comissão: R$ 37,47 (25%) | Estoque: São Paulo - SP
   - 🎬 Vídeo ideal: Mostre um lado do cabelo cacheado/úmido e alise/modele em 10 segundos sem corte.
2. **Depilador a Laser IPL Definitivo Portátil com Resfriamento**
   - 💰 Preço: R$ 189,90 | Comissão: R$ 47,47 (25%) | Estoque: São Paulo - SP
3. **Sérum Anti-Idade Facial com Ácido Hialurônico e Niacinamida**
   - 💰 Preço: R$ 59,90 | Comissão: R$ 17,97 (30%) | Estoque: São Paulo - SP`;
  }

  // 4. CASA, COZINHA & ORGANIZAÇÃO
  if ((q.includes('casa') || q.includes('cozinha') || q.includes('limpeza') || q.includes('organizador') || q.includes('copo')) && !isAboutActive) {
    return `### 🏠 Produtos em Alta no Radar TikBlox: **Casa & Cozinha Inteligente**

Vídeos de "organização e achadinhos de casa" geram picos de milhões de views no TikTok:

1. **Copo Térmico Quencher 1.2L com Alça e Tampa Hermética Anti-Vazamento**
   - 💰 Preço: R$ 69,90 | Comissão: R$ 17,47 (25%) | Estoque: São Paulo - SP
2. **Difusor Ultrassônico Aromático com Efeito Visual de Chama de Fogo**
   - 💰 Preço: R$ 79,90 | Comissão: R$ 22,37 (28%) | Estoque: São Paulo - SP
3. **Mini Triturador e Processador de Alimentos USB sem Fio**
   - 💰 Preço: R$ 39,90 | Comissão: R$ 11,97 (30%) | Estoque: São Paulo - SP`;
  }

  // 5. SIMULAÇÃO FINANCEIRA DE LUCRO & MARGEM
  if (
    q.includes('simular') || q.includes('simule') || q.includes('simulacao') || q.includes('simulação') || 
    q.includes('calculadora') || q.includes('calcular') || q.includes('margem') || 
    q.includes('quanto sobra') || q.includes('quanto ganho')
  ) {
    const itemTitle = productContext?.name ? productContext.name : 'Produto em Alta no TikTok Shop';
    const itemPriceNum = Number(productContext?.estimatedPriceBRL || 89.90);
    const itemCommPct = Number(productContext?.commissionPercent || productContext?.tiktokShop?.commissionRatePercent || 25);
    const itemCommNum = Number(productContext?.commissionEstimatedBRL || (itemPriceNum * (itemCommPct / 100)) || 22.50);

    const profit10 = (itemCommNum * 10).toFixed(2);
    const profit30 = (itemCommNum * 30).toFixed(2);
    const profit50 = (itemCommNum * 50).toFixed(2);
    const profit100 = (itemCommNum * 100).toFixed(2);

    return `### 🧮 Simulação Financeira & Projeção de Lucro Líquido

**Base da Simulação:** ${itemTitle}
- 🏷️ **Preço Médio de Venda no Feed:** R$ ${itemPriceNum.toFixed(2)}
- 💰 **Sua Comissão Líquida por Venda:** **R$ ${itemCommNum.toFixed(2)} (${itemCommPct}%)**
- 📦 **Taxas de Envio & Embalagem:** **R$ 0,00** (Custeado pelo lojista de pronta entrega no Brasil)
- 💳 **Taxa de Intermediação TikTok:** Já descontada na fonte pela plataforma

---

#### 📈 Projeção Real de Ganhos por Volume de Vendas:
- **10 Vendas** *(1 vídeo com tração de ~8k views)*: **R$ ${profit10} líquidos**
- **30 Vendas** *(Resultado médio de 1 Live de 45 minutos)*: **R$ ${profit30} líquidos**
- **50 Vendas** *(Vídeo viral no For You de ~35k views)*: **R$ ${profit50} líquidos**
- **100 Vendas** *(Consistência de 2 vídeos diários na semana)*: **R$ ${profit100} líquidos**

💡 **Como e quando você recebe:**
O saldo acumulado cai na sua **Carteira TikTok Shop** e fica liberado para **saque instantâneo via Pix** assim que expirar o prazo de 7 dias de garantia de entrega do cliente. Zero burocracia bancária!`;
  }

  // 6. CADASTRO, REQUISITOS & COMO COMEÇAR
  if (
    q.includes('como me cadastro') || q.includes('cadastrar') || q.includes('como começar') || 
    q.includes('como comecar') || q.includes('requisito') || q.includes('quantos seguidores') || 
    q.includes('precisa de seguidor') || q.includes('criar conta') || q.includes('abrir conta')
  ) {
    return `### 📋 Como Começar e se Cadastrar no TikTok Shop Brasil

Para atuar como afiliado e ganhar comissões em cada venda no TikTok Brasil, o processo é direto:

1. **Requisitos Mínimos:**
   - Ter mais de **18 anos**.
   - Perfil do TikTok ativo e sem violações de diretrizes.
   - Ter no mínimo **1.000 seguidores** (ou vincular sua conta ao **TikTok Shop Creator Center**).

2. **Passo a Passo de Ativação:**
   - No app do TikTok, vá no seu **Perfil** > toque no menu (três risquinhos no topo direito) > **Ferramentas do Criador**.
   - Procure pela opção **TikTok Shop para Criadores / Marketplace de Produtos**.
   - Complete seu cadastro com seu CPF (ou CNPJ) e confirme seus dados para recebimento de comissões via Pix ou transferência.

3. **Como Vincular Produtos nos seus Vídeos:**
   - Ao gravar qualquer vídeo, na tela final antes de postar, clique em **Adicionar Link** > **Produto**.
   - Busque pelo produto no Marketplace e adicione.
   - O famoso **Carrinho Amarelo** aparecerá automaticamente no canto inferior esquerdo do seu vídeo para quem assistir comprar direto!

💡 **Dica de Ouro:** Não precisa ter estoque nem gastar com envio. O fornecedor nacional cuida de toda a embalagem e entrega!`;
  }

  // 6. COMISSÕES, PAGAMENTOS, SAQUES E GANHOS
  if (
    q.includes('quanto ganha') || q.includes('como paga') || q.includes('pagamento') || 
    q.includes('comissao') || q.includes('comissão') || q.includes('saque') || 
    q.includes('pix') || q.includes('dinheiro') || q.includes('faturar') || q.includes('quanto dá pra ganhar')
  ) {
    return `### 💰 Como Funcionam os Ganhos e Pagamentos no TikTok Shop

No TikTok Shop, você ganha uma **comissão líquida por cada venda** realizada através do seu carrinho amarelo:

- **Média de Comissão:** Varia entre **15% e 35%** dependendo do produto e do nicho.
${isAboutActive && productContext ? `- **Neste Produto (${prodName}):** Sua comissão estimada é de **${commission}** por cada venda.\n` : ''}

#### 📊 Simulação de Ganhos com Vídeos:
- **1 vídeo que bate 20.000 visualizações:**
  - Conversão média de impulso (0,8% a 1,5%): cerca de **15 a 30 vendas**.
  - Com uma comissão de R$ 25,00 por venda: **R$ 375,00 a R$ 750,00 de lucro com um único vídeo!**
- **Se você postar 2 vídeos por dia:** a probabilidade de ter 2 ou 3 vídeos viralizando por semana multiplica exponencialmente seus ganhos.

#### 🏦 Como Você Recebe:
- O saldo cai na sua **Carteira do TikTok Shop Creator**.
- Assim que o cliente recebe o produto e encerra o período de devolução (7 dias), o saldo fica disponível para **saque imediato via Pix ou conta bancária nacional**.`;
  }

  // 7. ALGORITMO, HORÁRIOS & COMO VIRALIZAR
  if (
    q.includes('horario') || q.includes('horário') || q.includes('algoritmo') || 
    q.includes('viralizar') || q.includes('como viralizar') || q.includes('for you') || 
    q.includes('foryou') || q.includes('entrega') || q.includes('quantos videos') || q.includes('quantos vídeos')
  ) {
    return `### ⚡ Como Dominar o Algoritmo do TikTok Shop no Brasil

O algoritmo do TikTok prioriza **retenção nos 3 primeiros segundos** e **interação com o carrinho de compras**:

#### ⏰ Melhores Horários para Postar no Brasil:
- **Almoço:** 11h30 às 13h30 (pico de compras no intervalo do trabalho).
- **Final de Tarde / Noite:** 18h00 às 21h30 (horário de maior audiência geral).
- **Domingo à noite:** Excelente para produtos de beleza, utilidades e tecnologia.

#### 📈 Os 3 Pilares para um Vídeo Viralizar e Vender:
1. **Quebra de Padrão em 3s:** Mostre o produto fazendo algo curioso ou fale uma verdade controversa logo no primeiro segundo.
2. **Sem Vibe de Comercial de TV:** Grave com o celular na mão, luz natural e tom de "achadinho pessoal". Vídeos caseiros e autênticos vendem 4x mais que anúncios engravatados.
3. **Chamada Clara para o Carrinho:** Nunca se esqueça de dizer: *"Deixei o link na sacolinha amarela aqui embaixo no frete grátis antes que acabe o lote de SP!"*`;
  }

  // 8. GANCHOS VIRAIS (HOOKS)
  if (q.includes('gancho') || q.includes('hook') || q.includes('3s') || q.includes('3 segundos') || q.includes('início') || q.includes('começo')) {
    const targetProduct = isAboutActive ? prodName : 'Produtos em Alta';

    return `### ⚡ 3 Ganchos Virais de 3 Segundos para **${targetProduct}**

Estes ganchos foram desenhados para reter mais de 65% do público nos primeiros 3 segundos do TikTok:

1. **Gancho Visual / Curiosidade Negativa:**
   > 🎥 *Ação:* Comece com cara de espanto segurando o produto bem perto da lente.
   > 💬 *Áudio:* *"Se você comprou isso pensando que era só mais uma modinha do TikTok... você foi enganado, porque isso aqui mudou minha rotina!"*
   > 📝 *Texto na Tela:* "Não compre isso antes de ver esse vídeo ⚠️"

2. **Gancho de Comparação Direta (Custo vs Benefício):**
   > 🎥 *Ação:* Mostre uma alternativa cara ou tradicional e jogue-a de lado, destacando o achadinho do TikTok Shop.
   > 💬 *Áudio:* *"Por que gastar R$ 300 se esse achadinho do TikTok faz exatamente a mesma coisa por uma fração do preço?"*
   > 📝 *Texto na Tela:* "O produto secreto que os lojistas escondem 🤫"

3. **Gancho de Alerta de Estoque / Amostra:**
   > 🎥 *Ação:* Dedo apontando para baixo (para o carrinho amarelo do TikTok Shop).
   > 💬 *Áudio:* *"${hookEx} E o melhor: o vendedor tá liberando cupom de frete grátis hoje!"*
   > 📝 *Texto na Tela:* "Corre antes que zere o lote de SP 📦"`;
  }

  // 9. NICHOS
  if (q.includes('nicho') || q.includes('melhor nicho') || q.includes('o que vender') || q.includes('qual produto') || q.includes('mais vendido')) {
    return `### 🏆 Melhores Nichos para Vender no TikTok Shop Brasil

No Brasil, os 4 nichos com maior taxa de conversão por impulso são:

1. **Beleza & Cuidados Pessoais:** Escovas modeladoras, depiladores IPL, produtos de skincare, séruns e maquiagem. Mulheres brasileiras têm o maior ticket de impulso do app.
2. **Moda, Bolsas & Acessórios:** Bolsas transversais antifurto, carteiras RFID compactas, mochilas executivas e porta-joias de viagem.
3. **Casa & Cozinha Inteligente:** Copos térmicos, difusores de chamas, trituradores sem fio, mini seladoras e organizadores.
4. **Tech & Gadgets Úteis:** Fones sem fio, mochilas antifurto com USB, mini projetores portáteis e suportes magnéticos veiculares.

Você pode me perguntar sobre qualquer um desses nichos digitando o nome dele (ex: *"me mostre bolsas femininas"*, *"produtos de cozinha"* ou *"itens de beleza"*)!`;
  }

  // 10. RESPOSTA GERAL CONVERSACIONAL (SEM FORÇAR PRODUTO DA TELA)
  if (isAboutActive && productContext) {
    return `### 💡 Análise Estratégica: **${prodName}**

Aqui está o diagnóstico de monetização deste produto no TikTok Shop Brasil:

- 💰 **Potencial de Ganho:** Sua comissão estimada é de **${commission}** por cada venda originada.
- 📦 **Logística:** Estoque em **${stock}**, o que gera alta taxa de conversão porque o comprador não paga taxas extras e recebe rápido.
- 🎯 **Nível de Saturação:** ${productContext?.creatorSaturationBR === 'Baixa' ? '🟢 Oceano Azul! Poucos criadores estão explorando este produto no Brasil no momento — excelente oportunidade.' : '🟡 Produto com alta tração e demanda comprovada.'}
- 💡 **Gancho Sugerido:** *"${hookEx}"*

O que você gostaria de criar para este produto? Posso gerar roteiros de 30s, scripts de live selling ou quebra de objeções!`;
  }

  return `### 💡 Análise & Orientação: **TIKBLOX AI**

Sobre sua pergunta: *"${userQuery}"*

Aqui estão as orientações estratégicas da TikBlox para o mercado brasileiro:

- **Foco em Pronta Entrega:** Compradores no TikTok desistem se o prazo passar de 7 dias. Priorize sempre produtos com fornecedores em São Paulo ou Curitiba para garantir alta avaliação na loja.
- **Conversão por Vídeo Curto:** Use vídeos de 25 a 40 segundos. Vídeos longos perdem retenção antes de apresentar o carrinho amarelo.
- **Prova Social Real:** Se tiver a amostra, mostre o produto na mão e use iluminação clara para gerar desejo visual imediato.

Você pode me perguntar sobre qualquer nicho (ex: *"bolsas femininas"*, *"maquiagem"*, *"gadgets"*), pedir roteiros ou tirar dúvidas sobre cadastro e comissões. Como deseja prosseguir? 🚀`;
}
