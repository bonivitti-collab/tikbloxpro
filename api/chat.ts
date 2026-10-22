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

  const systemPrompt = `Você é a TIKBLOX AI, inteligência especialista em TikTok Shop Brasil do TikBlox Pro.
Sua missão é ajudar criadores e afiliados a venderem mais no TikTok Shop Brasil com produtos de pronta entrega nacional. Você é uma IA amigável, acolhedora, prática e aberta a responder NORMALMENTE qualquer pergunta (sobre cadastro no TikTok Shop, requisitos de seguidores, regras de comissão, saques via Pix, logística nacional, horários de postagem, ganchos, roteiros, lives, fornecedores de SP/PR e estratégias de e-commerce).
${productContext ? `PRODUTO SELECIONADO:\nNome: ${productContext.name}\nPreço: R$ ${productContext.estimatedPriceBRL}\nComissão: ${productContext.commissionPercent || 25}% (R$ ${productContext.commissionEstimatedBRL || 15})\nEstoque: ${productContext.stockLocationBrazil || 'São Paulo - SP'}\nAmostra Grátis: ${productContext.freeSampleAvailable ? 'Sim' : 'Sob consulta'}` : ''}
Instruções:
- Seja ultra prática, conversacional, amigável e focada em alta conversão no público brasileiro.
- Responda qualquer dúvida aberta do usuário com clareza, empatia e autoridade no ecossistema TikTok Shop.
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

function generateAutonomousTikTokShopReply(
  userQuery: string,
  productContext?: any
): string {
  const q = (userQuery || '').toLowerCase().trim();
  const prodName = productContext?.name || 'Produto em Alta no TikTok Shop';
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

${productContext ? `📌 **No momento, você está com o produto em foco:**\n> **${prodName}** (${price} | Comissão: **${commission}**)\n` : ''}

**Você pode me perguntar livremente coisas como:**
- *"Como me cadastrar como afiliado no TikTok Shop?"*
- *"Quantos seguidores preciso ter para começar?"*
- *"Qual o melhor nicho para vender no Brasil hoje?"*
- *"Gere um roteiro de 30 segundos para vender ${productContext ? prodName : 'este produto'}"*
- *"Como pedir amostra grátis ao vendedor?"*
- *"Qual o melhor horário para postar no TikTok?"*

Fique à vontade! O que você gostaria de saber ou planejar agora? 🚀`;
  }

  // 2. CADASTRO, REQUISITOS & COMO COMEÇAR
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
   - Busque pelo produto no Marketplace (como o **${prodName}**) e adicione.
   - O famoso **Carrinho Amarelo** aparecerá automaticamente no canto inferior esquerdo do seu vídeo para quem assistir comprar direto!

💡 **Dica de Ouro:** Não precisa ter estoque nem gastar com envio. O fornecedor de ${stock} cuida de toda a embalagem e entrega!`;
  }

  // 3. COMISSÕES, PAGAMENTOS, SAQUES E GANHOS
  if (
    q.includes('quanto ganha') || q.includes('como paga') || q.includes('pagamento') || 
    q.includes('comissao') || q.includes('comissão') || q.includes('saque') || 
    q.includes('pix') || q.includes('dinheiro') || q.includes('faturar') || q.includes('quanto dá pra ganhar')
  ) {
    return `### 💰 Como Funcionam os Ganhos e Pagamentos no TikTok Shop

No TikTok Shop, você ganha uma **comissão líquida por cada venda** realizada através do seu carrinho amarelo:

- **Média de Comissão:** Varia entre **15% e 35%** dependendo do produto e do nicho.
${productContext ? `- **Neste Produto (${prodName}):** Sua comissão estimada é de **${commission}** por cada venda.\n` : ''}

#### 📊 Simulação de Ganhos com Vídeos:
- **1 vídeo que bate 20.000 visualizações:**
  - Conversão média de impulso (0,8% a 1,5%): cerca de **15 a 30 vendas**.
  - Com uma comissão de R$ 25,00 por venda: **R$ 375,00 a R$ 750,00 de lucro com um único vídeo!**
- **Se você postar 2 vídeos por dia:** a probabilidade de ter 2 ou 3 vídeos viralizando por semana multiplica exponencialmente seus ganhos.

#### 🏦 Como Você Recebe:
- O saldo cai na sua **Carteira do TikTok Shop Creator**.
- Assim que o cliente recebe o produto e encerra o período de devolução (7 dias), o saldo fica disponível para **saque imediato via Pix ou conta bancária nacional**.`;
  }

  // 4. ALGORITMO, HORÁRIOS & COMO VIRALIZAR
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

  // 5. GANCHOS VIRAIS (HOOKS)
  if (q.includes('gancho') || q.includes('hook') || q.includes('3s') || q.includes('3 segundos') || q.includes('início') || q.includes('começo')) {
    return `### ⚡ 3 Ganchos Virais de 3 Segundos para **${prodName}**

Estes ganchos foram desenhados para reter mais de 65% do público nos primeiros 3 segundos do TikTok:

1. **Gancho Visual / Curiosidade Negativa:**
   > 🎥 *Ação:* Comece com cara de espanto segurando o produto bem perto da lente.
   > 💬 *Áudio:* *"Se você comprou isso pensando que era só mais uma modinha do TikTok... você foi enganado, porque isso aqui mudou minha rotina!"*
   > 📝 *Texto na Tela:* "Não compre isso antes de ver esse vídeo ⚠️"

2. **Gancho de Comparação Direta (Custo vs Benefício):**
   > 🎥 *Ação:* Mostre uma alternativa cara ou tradicional e jogue-a de lado, destacando o **${prodName}**.
   > 💬 *Áudio:* *"Por que gastar R$ 300 se esse achadinho do TikTok faz exatamente a mesma coisa por uma fração do preço?"*
   > 📝 *Texto na Tela:* "O produto secreto que os lojistas escondem 🤫"

3. **Gancho de Alerta de Estoque / Amostra:**
   > 🎥 *Ação:* Dedo apontando para baixo (para o carrinho amarelo do TikTok Shop).
   > 💬 *Áudio:* *"${hookEx} E o melhor: o vendedor tá liberando cupom de frete grátis hoje!"*
   > 📝 *Texto na Tela:* "Corre antes que zere o lote de SP 📦"

💡 **Dica de Afiliado:** Com sua comissão de **${commission}**, postando 2 vídeos por dia com esses ganchos e atingindo 10k views, a média de conversão é de 15 a 30 vendas diárias!`;
  }

  // 6. LIVE COMMERCE & ROTEIRO
  if (q.includes('live') || q.includes('roteiro') || q.includes('transmiss') || q.includes('script') || q.includes('vender na live') || q.includes('video de 30')) {
    return `### 🎬 Roteiro de Live Selling (5 Minutos) para **${prodName}**

Este script é otimizado para o algoritmo de Lives do TikTok Shop Brasil bater picos de retenção:

- **Minuto 0:00 - 1:00 | Quebra de Padrão & Retenção Inicial**
  - "Gente, calma! Não sai da live! O vendedor de São Paulo acabou de me autorizar a liberar 20 cupons exclusivos só pra quem tá aqui agora!"
  - Mostre o produto em mãos funcionando ao vivo (demonstração sensorial).

- **Minuto 1:00 - 2:30 | Demonstração Prática & Resolução de Dor**
  - Mostre o "Antes vs Depois".
  - Destaque o benefício imediato: rapidez, economia ou facilidade.
  - "Olha isso aqui funcionando na prática. Sem corte, ao vivo pra vocês verem!"

- **Minuto 2:30 - 3:45 | Quebra da Objeção do Frete & Estoque BR**
  - "Muitos me perguntam: 'vem da China? demora um mês?'. NÃO! O estoque fica em **${stock}**, chega em 2 a 5 dias úteis com rastreio Correios!"

- **Minuto 3:45 - 5:00 | Chamada Agressiva para o Carrinho Amarelo**
  - "Clica na sacolinha amarela aqui no canto inferior esquerdo. Pega o cupom de primeira compra e garante o seu antes que o lote termine. Restam apenas poucas unidades no preço promocional!"

💰 **Sua Margem:** Cada venda direta na live gera **${commission}** limpos na sua conta de afiliado.`;
  }

  // 7. AMOSTRA GRÁTIS
  if (q.includes('amostra') || q.includes('sample') || q.includes('fornecedor') || q.includes('pedir') || q.includes('lojista') || q.includes('gratis') || q.includes('grátis')) {
    return `### 🎁 Como Conseguir Amostra Grátis com Fornecedores do TikTok Shop

Vendedores com estoque no Brasil (SP/PR) enviam centenas de amostras diárias para criadores dispostos a postar vídeos.

#### Modelo de Mensagem Pronta para Enviar ao Vendedor:
> *"Olá, equipe comercial da loja! Tudo bem?*
> 
> *Me chamo [Seu Nome], sou criador de conteúdo ativo no TikTok Shop Brasil focado no nicho de [Seu Nicho].*
> 
> *Estou planejando uma série de 3 vídeos de demonstração e 2 transmissões ao vivo esta semana e selecionei o seu produto **${prodName}** pela excelente qualidade e envio rápido direto de **${stock}**.*
> 
> *Gostaria de solicitar a aprovação de 1 amostra gratuita pelo painel de criadores para iniciarmos as gravações. Meu perfil é @[seu_usuario].*
> 
> *Contem comigo para batermos recordes de pedidos juntos! Obrigado!"*

💡 **Estratégia:** Se você tiver mais de 1.000 seguidores, você pode solicitar a amostra diretamente no app pela aba de amostras grátis do TikTok Shop!`;
  }

  // 8. QUEBRA DE OBJEÇÕES
  if (q.includes('objeção') || q.includes('objecao') || q.includes('comentario') || q.includes('comentário') || q.includes('duvida') || q.includes('medo') || q.includes('reclama')) {
    return `### 🛡️ Como Responder às Maiores Dúvidas nos Comentários

Comentário com dúvida é cliente pronto para comprar se você responder rápido:

1. **"Demora muito para chegar? É importado da China?"**
   - 💬 *Resposta:* *"Não! O estoque é nacional aqui no Brasil (${stock}), chega em 2 a 5 dias úteis com rastreamento dos Correios na sua porta!"*

2. **"É seguro comprar pela sacolinha do TikTok?"**
   - 💬 *Resposta:* *"Super seguro! O pagamento é protegido pelo próprio TikTok e você tem 7 dias de garantia total com direito a devolução sem custo se não amar."*

3. **"Funciona mesmo ou é golpe?"**
   - 💬 *Resposta:* Responda com um vídeo em tela dividida usando o produto na hora. Ver o produto funcionando de verdade destrói qualquer desconfiança!`;
  }

  // 9. NICHOS
  if (q.includes('nicho') || q.includes('melhor nicho') || q.includes('o que vender') || q.includes('qual produto') || q.includes('mais vendido')) {
    return `### 🏆 Melhores Nichos para Vender no TikTok Shop Brasil

No Brasil, os 4 nichos com maior taxa de conversão por impulso são:

1. **Beleza & Cuidados Pessoais:** Escovas modeladoras, depiladores IPL, produtos de skincare, séruns e maquiagem. Mulheres brasileiras têm o maior ticket de impulso do app.
2. **Casa & Cozinha Inteligente:** Copos térmicos, difusores de chamas, trituradores sem fio, mini seladoras e organizadores. Vídeos de "limpeza e organização" atingem milhões de visualizações facilmente.
3. **Tech & Acessórios:** Fones sem fio, mochilas antifurto com USB, mini projetores portáteis e suportes magnéticos veiculares.
4. **Saúde & Fitness:** Garrafas motivacionais, massageadores elétricos e cintas modeladoras.

${productContext ? `\nO produto que você está visualizando agora (**${prodName}**) pertence à categoria em alta, com margem estimada de 250%!` : ''}`;
  }

  // 10. RESPOSTA GERAL CONVERSACIONAL ESTRUTURADA
  return `### 💡 Análise & Orientação: **TIKBLOX AI**

Sobre sua pergunta: *"${userQuery}"*

${productContext ? `Analisando no contexto do produto **${prodName}** (Preço: ${price} | Comissão: **${commission}** | Envio de **${stock}**):\n` : ''}
Aqui estão as orientações estratégicas para o mercado brasileiro:

- **Foco em Pronta Entrega:** Compradores no TikTok desistem se o prazo passar de 7 dias. Priorize sempre produtos com fornecedores em São Paulo ou Curitiba para garantir alta avaliação na loja.
- **Conversão por Vídeo Curto:** Use vídeos de 25 a 40 segundos. Vídeos longos perdem retenção antes de apresentar o carrinho amarelo.
- **Prova Social Real:** Se tiver a amostra, mostre o produto na mão e use iluminação clara para gerar desejo visual imediato.

Você pode me perguntar livremente sobre roteiros específicos, ideias de gravação, cálculo de margem ou dicas de abordagem de fornecedores. Como deseja prosseguir? 🚀`;
}
