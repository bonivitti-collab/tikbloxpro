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
    'roteiro para ele', 'amostra dele', 'fornecedor dele'
  ];
  if (directRefs.some((ref) => q.includes(ref))) return true;

  // Palavras-chave do nome do produto (com pelo menos 4 letras)
  const nameWords = product.name
    .toLowerCase()
    .replace(/[^a-z0-9áéíóúãõâêîôûç ]/gi, '')
    .split(' ')
    .filter((w) => w.length >= 4 && !['para', 'com', 'sem', 'mais', 'mini', 'novo', 'super'].includes(w));

  // Se o usuário digitou palavras exclusivas do produto atual
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
          'mais', 'tem', 'voce', 'você', 'sobre', 'sobre', 'estou', 'procurando', 'sabe'
        ].includes(w)
    );

  if (searchTerms.length === 0) return [];

  const matched = ALL_NICHE_TRENDS.filter((prod) => {
    const textToSearch = [
      prod.name,
      prod.originalName,
      prod.nicheLabel,
      prod.category,
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
 * Motor Conversacional Inteligente TIKBLOX AI
 * Especialista Aberto em TikTok Shop Brasil, Vendas, Roteiros, Logística e Estratégias de Afiliados.
 */
export function generateAutonomousTikTokShopReply(
  userQuery: string,
  productContext?: TrendingProduct | null
): string {
  const q = (userQuery || '').toLowerCase().trim();
  const isAboutActive = isQuerySpecificallyAboutProduct(q, productContext);
  const p = isAboutActive && productContext ? enrichWithTikTokShopData(productContext) : null;

  const prodName = p ? p.name : 'Produto em Análise';
  const price = p ? `R$ ${Number(p.estimatedPriceBRL || 89.90).toFixed(2)}` : 'R$ 89,90';
  const commission = p ? `R$ ${Number(p.commissionEstimatedBRL || 22).toFixed(2)} (${p.commissionPercent || 25}%)` : '20% a 35%';
  const stock = p ? (p.stockLocationBrazil || 'São Paulo - SP (Pronta Entrega)') : 'São Paulo / Curitiba (Estoque Nacional)';
  const hookEx = p ? (p.hookViral3s || p.adHooks?.[0] || 'Você não vai acreditar no que isso faz!') : 'Pare de perder tempo com isso agora mesmo!';

  // =========================================================================
  // 1. SAUDAÇÃO & APRESENTAÇÃO ABERTA
  // =========================================================================
  if (
    q === 'oi' || q === 'ola' || q === 'olá' || q.includes('bom dia') || q.includes('boa tarde') || 
    q.includes('boa noite') || q.includes('tudo bem') || q.includes('quem e voce') || q.includes('quem é você') ||
    q.includes('como funciona a ia') || q.includes('o que você faz') || q.includes('o que voce faz')
  ) {
    return `### 👋 Olá! Sou a **TIKBLOX AI**!

Sou sua especialista aberta em **TikTok Shop Brasil**. Estou aqui para responder **qualquer pergunta** sobre vendas, afiliação, como gravar vídeos, encontrar produtos virais e faturar alto no app.

**Você pode me perguntar livremente coisas como:**
- *"Quais bolsas femininas ou mochilas estão vendendo mais?"*
- *"Como me cadastrar como afiliado no TikTok Shop?"*
- *"Quantos seguidores preciso ter para começar?"*
- *"Qual o melhor nicho para vender no Brasil hoje?"*
- *"Qual o melhor horário para postar no TikTok?"*
${productContext ? `- *"Gere um roteiro para o produto selecionado (${productContext.name.split(' ')[0]})"*` : ''}

Como posso te ajudar a lucrar no TikTok Shop hoje? 🚀`;
  }

  // =========================================================================
  // 2. BUSCA NO CATÁLOGO DO RADAR (Ex: "bolsas femininas", "maquiagem", "gadgets")
  // =========================================================================
  const catalogMatches = searchCatalogProducts(q);
  if (catalogMatches.length > 0 && !isAboutActive) {
    const formattedMatches = catalogMatches.map((item, idx) => {
      const en = enrichWithTikTokShopData(item);
      const itemPrice = Number(en.estimatedPriceBRL || 79.90).toFixed(2);
      const itemComm = Number(en.commissionEstimatedBRL || 20).toFixed(2);
      const itemLoc = en.stockLocationBrazil || 'São Paulo - SP';
      const itemHook = en.hookViral3s || en.adHooks?.[0] || 'Você precisa ver como isso funciona!';

      return `#### ${idx + 1}. **${item.name}**
- 💰 **Preço no Feed:** R$ ${itemPrice} | **Sua Comissão Líquida:** R$ ${itemComm} (${en.commissionPercent || 25}%)
- 📦 **Estoque Nacional:** ${itemLoc} (Pronta entrega sem taxa de importação)
- 🎯 **Nicho:** ${item.nicheLabel || 'Acessórios'} | **Saturação:** ${item.creatorSaturationBR || 'Oceano Azul'}
- ⚡ **Gancho de 3s Recomendado:** *"${itemHook}"*`;
    }).join('\n\n');

    return `### 🛍️ Produtos em Alta no Radar TikBlox: **"${userQuery}"**

Encontrei excelentes oportunidades validadas no TikTok Shop Brasil para essa categoria com **fornecedores nacionais e alta margem de comissão**:

${formattedMatches}

---

💡 **Dica de Estratégia de Conteúdo para esse nicho:**
- **Vídeos de Demonstração Rápida (20s a 35s):** Grave com celular na vertical em ambiente iluminado mostrando a utilidade prática no primeiro segundo.
- **Formato "O Que Tem Dentro / Teste Real":** Mostre detalhes de zíperes, tecidos, durabilidade e acabamento. Vídeos sensoriais desse tipo geram cliques imediatos no carrinho amarelo!
- **Amostra Grátis:** Selecione um desses itens no painel para ver a mensagem pronta de WhatsApp para solicitar amostra gratuita aos lojistas de SP/PR!`;
  }

  // =========================================================================
  // 3. CADASTRO, REQUISITOS & COMO COMEÇAR
  // =========================================================================
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

💡 **Dica de Ouro:** Não precisa ter estoque nem gastar com envio. Os lojistas nacionais cuidam de toda a embalagem e entrega!`;
  }

  // =========================================================================
  // 4. COMISSÕES, PAGAMENTOS, SAQUES E GANHOS
  // =========================================================================
  if (
    q.includes('quanto ganha') || q.includes('como paga') || q.includes('pagamento') || 
    q.includes('comissao') || q.includes('comissão') || q.includes('saque') || 
    q.includes('pix') || q.includes('dinheiro') || q.includes('faturar') || q.includes('quanto dá pra ganhar')
  ) {
    return `### 💰 Como Funcionam os Ganhos e Pagamentos no TikTok Shop

No TikTok Shop, você ganha uma **comissão líquida por cada venda** realizada através do seu carrinho amarelo:

- **Média de Comissão:** Varia entre **15% e 35%** dependendo do produto e do nicho.
${isAboutActive && p ? `- **Neste Produto (${prodName}):** Sua comissão estimada é de **${commission}** por cada venda.\n` : ''}

#### 📊 Simulação de Ganhos com Vídeos:
- **1 vídeo que bate 20.000 visualizações:**
  - Conversão média de impulso (0,8% a 1,5%): cerca de **15 a 30 vendas**.
  - Com uma comissão média de R$ 25,00 por venda: **R$ 375,00 a R$ 750,00 de lucro com um único vídeo!**
- **Se você postar 2 vídeos por dia:** a probabilidade de ter 2 ou 3 vídeos viralizando por semana multiplica exponencialmente seus ganhos.

#### 🏦 Como Você Recebe:
- O saldo cai na sua **Carteira do TikTok Shop Creator**.
- Assim que o cliente recebe o produto e encerra o período de devolução (7 dias), o saldo fica disponível para **saque imediato via Pix ou conta bancária nacional**.`;
  }

  // =========================================================================
  // 5. ALGORITMO, HORÁRIOS & COMO VIRALIZAR
  // =========================================================================
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

  // =========================================================================
  // 6. GANCHOS VIRAIS (HOOKS)
  // =========================================================================
  if (q.includes('gancho') || q.includes('hook') || q.includes('3s') || q.includes('3 segundos') || q.includes('início') || q.includes('começo')) {
    const targetProduct = isAboutActive && p ? prodName : 'Produtos em Alta no TikTok';

    return `### ⚡ 3 Ganchos Virais de 3 Segundos para **${targetProduct}**

Estes ganchos foram desenhados para reter mais de 65% do público nos primeiros 3 segundos do feed:

1. **Gancho Visual / Curiosidade Negativa:**
   > 🎬 *Ação:* Comece com cara de espanto segurando o item bem perto da lente da câmera.
   > 🗣️ *Áudio:* *"Se você comprou isso pensando que era só mais uma modinha do TikTok... você foi enganado, porque isso aqui mudou minha rotina!"*
   > 📱 *Texto na Tela:* "Não compre isso antes de ver esse vídeo 🚨"

2. **Gancho de Comparação Direta (Custo vs Benefício):**
   > 🎬 *Ação:* Mostre uma alternativa cara ou tradicional e jogue-a de lado, destacando o item do TikTok Shop.
   > 🗣️ *Áudio:* *"Por que pagar uma fortuna se esse achadinho do TikTok faz exatamente a mesma coisa por uma fração do preço?"*
   > 📱 *Texto na Tela:* "O produto secreto que as grandes marcas escondem 🤫"

3. **Gancho de Alerta de Estoque Nacional:**
   > 🎬 *Ação:* Dedo apontando para o canto inferior esquerdo (onde fica o carrinho amarelo).
   > 🗣️ *Áudio:* *"${hookEx} E o melhor: o vendedor tá com estoque em ${stock} liberando cupom de frete grátis hoje!"*
   > 📱 *Texto na Tela:* "Corre antes que zere o lote de SP 📦"`;
  }

  // =========================================================================
  // 7. ROTEIRO DE VÍDEO & LIVE COMMERCE
  // =========================================================================
  if (q.includes('live') || q.includes('roteiro') || q.includes('transmiss') || q.includes('script') || q.includes('vender na live') || q.includes('video de 30')) {
    const targetProduct = isAboutActive && p ? prodName : 'Produtos Virais';

    return `### 🎬 Roteiro de Alta Conversão para **${targetProduct}**

#### Roteiro de Vídeo Curto (30 a 45 Segundos)
- **0s - 3s (Gancho):** *"O motivo pelo qual todo mundo no TikTok tá comprando isso..."*
- **3s - 15s (Demonstração Sensorial):** Mostre o produto resolvendo o problema sem cortes. Deixe o áudio ambiente estalar ou mostre o resultado imediato.
- **15s - 25s (Quebra de Objeção):** *"E não vem da China não, viu? Chegou em 3 dias aqui em casa porque o estoque é direto de ${stock}."*
- **25s - 35s (CTA):** *"Clique na sacolinha amarela aqui embaixo pra ver se ainda tem cupom de frete grátis liberado!"*

---

#### Estrutura de Live Selling (Para bater picos de venda ao vivo):
1. **Demonstração em Loop:** Não pare de demonstrar o produto. Quem entra na live precisa entender o que você está vendendo em 5 segundos.
2. **Gatilho de Lote Limitado:** *"Pessoal de São Paulo e região, o vendedor me avisou que restam poucas unidades com esse desconto."*
3. **Fixação de Carrinho:** Mantenha o card do produto fixado na tela da live para compras com 1 clique!`;
  }

  // =========================================================================
  // 8. AMOSTRA GRÁTIS & FORNECEDORES
  // =========================================================================
  if (q.includes('amostra') || q.includes('sample') || q.includes('fornecedor') || q.includes('pedir') || q.includes('lojista') || q.includes('gratis') || q.includes('grátis')) {
    const targetProduct = isAboutActive && p ? prodName : '[Nome do Produto]';

    return `### 🎁 Como Conseguir Amostra Grátis com Fornecedores do TikTok Shop

Vendedores com estoque no Brasil (SP/PR) enviam centenas de amostras diárias para criadores dispostos a postar vídeos.

#### Modelo de Mensagem Pronta para Enviar ao Vendedor:
> *"Olá, equipe comercial da loja! Tudo bem?*
> 
> *Me chamo [Seu Nome], sou criador de conteúdo ativo no TikTok Shop Brasil focado no nicho de [Seu Nicho].*
> 
> *Estou planejando uma série de 3 vídeos de demonstração e 2 transmissões ao vivo esta semana e selecionei o seu produto **${targetProduct}** pela excelente qualidade e envio rápido direto de **${stock}**.*
> 
> *Gostaria de solicitar a aprovação de 1 amostra gratuita pelo painel de criadores para iniciarmos as gravações. Meu perfil é @[seu_usuario].*
> 
> *Contem comigo para batermos recordes de pedidos juntos! Obrigado!"*

💡 **Estratégia:** Se você tiver mais de 1.000 seguidores, solicite a amostra diretamente no app pela aba de amostras grátis do TikTok Shop!`;
  }

  // =========================================================================
  // 9. NICHOS GERAIS
  // =========================================================================
  if (q.includes('nicho') || q.includes('melhor nicho') || q.includes('o que vender') || q.includes('qual produto') || q.includes('mais vendido')) {
    return `### 🏆 Melhores Nichos para Vender no TikTok Shop Brasil

No Brasil, os 4 nichos com maior taxa de conversão por impulso são:

1. **Beleza & Cuidados Pessoais:** Escovas modeladoras, depiladores IPL, produtos de skincare, séruns e maquiagem. Mulheres brasileiras têm o maior ticket de impulso do app.
2. **Moda, Bolsas & Acessórios:** Bolsas transversais antifurto, carteiras RFID compactas, mochilas executivas e porta-joias de viagem.
3. **Casa & Cozinha Inteligente:** Copos térmicos, difusores de chamas, trituradores sem fio, mini seladoras e organizadores.
4. **Tech & Gadgets Úteis:** Fones sem fio, suportes magnéticos veiculares, mini projetores e carregadores por indução.

Você pode me perguntar sobre qualquer um desses nichos digitando o nome dele (ex: *"me mostre bolsas femininas"*, *"produtos de cozinha"* ou *"itens de beleza"*)!`;
  }

  // =========================================================================
  // 10. RESPOSTA GERAL CONVERSACIONAL (SEM FORÇAR PRODUTO DA TELA)
  // =========================================================================
  if (isAboutActive && p) {
    return `### 💡 Análise Estratégica: **${prodName}**

Aqui está o diagnóstico desse produto no TikTok Shop Brasil:

- 💰 **Potencial de Ganho:** Sua comissão estimada é de **${commission}** por cada venda.
- 📦 **Logística:** Estoque em **${stock}**, o que gera alta taxa de conversão porque o comprador não paga taxas extras e recebe em até 5 dias.
- 🎯 **Nível de Saturação:** ${p?.creatorSaturationBR === 'Baixa' ? '🟢 Oceano Azul! Poucos criadores estão explorando este produto no Brasil no momento — excelente oportunidade.' : '🟡 Produto com alta tração e demanda comprovada.'}
- 💡 **Gancho Sugerido:** *"${hookEx}"*

O que você gostaria de criar para este produto? Posso gerar roteiros de 30s, scripts de live selling ou quebra de objeções!`;
  }

  return `### 💡 Análise & Orientação: **TIKBLOX AI**

Sobre sua dúvida: *"${userQuery}"*

Aqui estão as orientações estratégicas da TikBlox para o TikTok Shop Brasil:

- **Foco em Fornecedores Nacionais (SP / PR):** Compradores desistem da compra se o prazo passar de 7 dias úteis. Priorize produtos com pronta entrega no Brasil para evitar cancelamentos.
- **Duração Ideal dos Vídeos:** O algoritmo favorece vídeos de **25 a 40 segundos**. Os primeiros 3 segundos decidem se o vídeo será entregue para milhares de pessoas.
- **Chamada de Ação Clara:** Sempre indique claramente onde clicar: *"Clica no carrinho amarelo aqui embaixo para garantir com cupom de primeira compra!"*

Você pode me perguntar sobre qualquer nicho (ex: *"bolsas femininas"*, *"maquiagem"*, *"gadgets"*), pedir roteiros ou tirar dúvidas sobre cadastro e comissões. Como deseja prosseguir? 🚀`;
}
