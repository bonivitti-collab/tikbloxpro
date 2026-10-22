import { generateAutonomousTikTokShopReply, isQuerySpecificallyAboutProduct } from '../src/data/autonomousCopilot';

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
3. FORMATAÇÃO: Use markdown claro, títulos numerados (1. Diagnóstico, 2. Leitura Operacional & Algoritmo, 3. Diretriz Tática), listas técnicas com dados em negrito e tabelas comparativas com pipes (|) quando pertinente.`;

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
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3.8-flash',
  ];

  for (const geminiKey of geminiKeys) {
    for (const model of geminiModels) {
      try {
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
        
        // Constrói histórico multi-turn para Gemini
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
  // Padrão AntiTrader: Zero falhas, zero dependência externa de saldo, profundidade institucional e anti-emoji
  const autonomousReply = generateAutonomousTikTokShopReply(lastMessage, productContext);
  return res.status(200).json({
    reply: autonomousReply,
    usedSource: 'Motor Analítico Institucional TikBlox',
    provider: 'autonomous_engine',
  });
}
