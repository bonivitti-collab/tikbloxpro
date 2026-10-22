import { generateAutonomousTikTokShopReply } from '../src/data/autonomousCopilot';

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
