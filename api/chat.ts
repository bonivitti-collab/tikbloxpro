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

  try {
    const { messages = [], productContext } = req.body || {};
    const lastMessage = messages.slice(-1)[0]?.content || '';

    // 1. Optional Groq AI
    const groqKey = process.env.GROQ_API_KEY;
    if (groqKey) {
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
              {
                role: 'system',
                content: `Você é o Copiloto Especialista em TikTok Shop Brasil do TikBlox Pro. Ajude criadores e afiliados a maximizarem vendas no Brasil com ganchos virais de 3s, roteiros de live e pedidos de amostra grátis. Produto: ${productContext?.name || 'Geral'}.`,
              },
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
            return res.status(200).json({ reply });
          }
        }
      } catch (groqErr) {
        console.warn('Groq error:', groqErr);
      }
    }

    // 2. High-performance Autonomous TikTok Shop Intelligence
    const reply = generateAutonomousTikTokShopReply(lastMessage, productContext);
    return res.status(200).json({ reply });
  } catch (error: any) {
    console.error('Chat error:', error);
    const fallback = generateAutonomousTikTokShopReply(
      req.body?.messages?.slice(-1)[0]?.content || '',
      req.body?.productContext
    );
    return res.status(200).json({ reply: fallback });
  }
}

function generateAutonomousTikTokShopReply(
  userQuery: string,
  productContext?: any
): string {
  const q = (userQuery || '').toLowerCase();
  const prodName = productContext?.name || 'Produto em Alta no TikTok Shop';
  const commissionVal = Number(productContext?.commissionEstimatedBRL || productContext?.tiktokShop?.commissionValueBRL || 25);
  const commissionPct = Number(productContext?.commissionPercent || productContext?.tiktokShop?.commissionRatePercent || 22);
  const commission = `R$ ${commissionVal.toFixed(2)} (${commissionPct}%)`;
  const stock = productContext?.stockLocationBrazil || productContext?.tiktokShop?.stockLocation || 'São Paulo - SP (Estoque Nacional)';
  const hookEx = productContext?.hookViral3s || 'Pare de perder tempo com isso agora mesmo!';

  if (q.includes('gancho') || q.includes('hook') || q.includes('3s') || q.includes('3 segundos') || q.includes('início')) {
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

  if (q.includes('live') || q.includes('roteiro') || q.includes('transmiss') || q.includes('vender na live')) {
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

  if (q.includes('amostra') || q.includes('sample') || q.includes('lojista') || q.includes('pedir') || q.includes('pitch')) {
    return `### 📩 Mensagem de DM / WhatsApp para Pedir Amostra Grátis

Copie e envie esta mensagem para o vendedor oficial de **${prodName}** no TikTok Shop:

---
*"Olá, equipe comercial da loja! Tudo bem?*

*Me chamo [Seu Nome], sou criador de conteúdo focado no TikTok Shop Brasil com público altamente engajado no nicho.*

*Estou planejando uma série de 3 vídeos focados em demonstração e 2 transmissões ao vivo esta semana e selecionei o seu produto **${prodName}** pelo excelente potencial de conversão e estoque em **${stock}**.*

*Gostaria de solicitar o envio de 1 unidade para amostra gratuita. Em troca, comprometo-me a produzir os criativos destacando o link oficial da sua loja com a tag do carrinho amarelo.*

*Podem aprovar o pedido de amostra pelo painel de criadores do TikTok Shop? Meu perfil é @[seu_usuario].*

*Obrigado e vamos bater recordes de vendas juntos!"*
---

💡 **Dica de Ouro:** Vendedores com estoque no Brasil adoram criadores que prometem Lives. Mencione sempre que você fará Lives demonstrando o produto!`;
  }

  if (q.includes('objeção') || q.includes('duvida') || q.includes('medo') || q.includes('comprador')) {
    return `### 🎯 Como Quebrar as 3 Maiores Objeções do Comprador Brasileiro

Quando os seguidores comentam no seu vídeo de **${prodName}**, responda com esses argumentos:

1. **"Demora muito para chegar? É importado?"**
   - *Resposta:* "Não! O estoque é nacional, enviado direto de **${stock}**. O envio é feito no mesmo dia ou dia seguinte pelos Correios/transportadora!"

2. **"É confiável comprar pelo TikTok?"**
   - *Resposta:* "100% seguro! O pagamento é processado pela própria plataforma do TikTok com garantia de devolução em até 7 dias caso você não ame o produto."

3. **"Funciona de verdade ou é propaganda enganosa?"**
   - *Resposta:* "Grave um vídeo resposta em tela dividida usando o produto em tempo real. A prova social ao vivo no TikTok elimina qualquer desconfiança na hora!"`;
  }

  // Resposta padrão contextualizada
  return `### 🚀 Análise Estratégica: **${prodName}**

Aqui está o diagnóstico de monetização deste produto no TikTok Shop Brasil:

- 💰 **Potencial de Ganho:** Sua comissão estimada é de **${commission}** por cada venda originada.
- 📦 **Logística:** Estoque em **${stock}**, o que gera alta taxa de conversão porque o comprador não paga taxas extras e recebe rápido.
- 🎯 **Nível de Saturação:** ${productContext?.creatorSaturationBR === 'Baixa' ? '🟢 Oceano Azul! Poucos criadores estão explorando este produto no Brasil no momento — excelente oportunidade para sair na frente.' : '🟡 Produto com alta tração e demanda comprovada.'}
- 💡 **Gancho Sugerido:** *"${hookEx}"*

Você pode me pedir:
1. *"3 ganchos virais para este produto"*
2. *"Roteiro de 5 minutos para Live Selling"*
3. *"Mensagem pronta para pedir amostra grátis"*
4. *"Como quebrar objeções nos comentários"*

Como posso te ajudar a faturar com esse produto agora?`;
}
