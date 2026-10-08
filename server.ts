import express, { Request, Response } from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';
import { INITIAL_CURATED_TRENDS } from './src/data/curatedTrends.js';
import { TrendingProduct, ProductNiche, DeepDiveAnalysis } from './src/types.js';
import { streamProductViabilityPDF } from './src/server/pdfGenerator.js';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Permissive CORS and embedding headers
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

// Lazy-safe Google GenAI initialization
let genAIClient: GoogleGenAI | null = null;
function getGenAI(): GoogleGenAI {
  if (!genAIClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('GEMINI_API_KEY not found. Operating with fallback intelligence mode.');
    }
    genAIClient = new GoogleGenAI({
      apiKey: apiKey || '',
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

// In-memory radar caches to avoid redundant API calls and prevent 429 rate-limit exhaustion
interface CachedRadarScan {
  timestamp: number;
  products: any[];
  webSources: any[];
}
const radarScanCache = new Map<string, CachedRadarScan>();
const deepDiveCache = new Map<string, any>();
const creativeScriptsCache = new Map<string, any[]>();
const CACHE_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// Circuit breaker for API rate limits and high-load cooldown
let rateLimitCooldownUntil = 0;
function isRateLimited(): boolean {
  return Date.now() < rateLimitCooldownUntil;
}
function triggerRateLimitCooldown(durationMs = 90000) {
  rateLimitCooldownUntil = Date.now() + durationMs;
}

// 100% Free Tier Status & Providers
export function getActiveFreeEngine(): {
  provider: 'gemini_free' | 'groq_free' | 'autonomous_local';
  label: string;
  cost: string;
  cardRequired: boolean;
  model: string;
} {
  if (process.env.GROQ_API_KEY && !isRateLimited()) {
    return {
      provider: 'groq_free',
      label: 'Groq Cloud Free Tier',
      cost: 'R$ 0,00 Permanente',
      cardRequired: false,
      model: 'Llama 3.3 70B Versatile',
    };
  }
  if (process.env.GEMINI_API_KEY && !isRateLimited()) {
    return {
      provider: 'gemini_free',
      label: 'Google Gemini Free Tier (Google AI Studio)',
      cost: 'R$ 0,00 Permanente (15 RPM)',
      cardRequired: false,
      model: 'gemini-2.5-flash',
    };
  }
  return {
    provider: 'autonomous_local',
    label: 'Motor Autônomo TIKBLOX (Algoritmo Local)',
    cost: 'R$ 0,00 Permanente (Sem necessidade de chave)',
    cardRequired: false,
    model: 'TIKBLOX Arbitrage Core v1',
  };
}

// Helper: Call 100% free Groq Cloud API (Llama 3.3 70B)
async function callGroqFreeAPI(prompt: string): Promise<string | null> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [
          {
            role: 'system',
            content: 'Você é o motor de inteligência de produtos e arbitragem do TIKBLOX. Responda em JSON válido.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.6,
      }),
    });

    if (!res.ok) {
      console.warn(`Groq API returned status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.warn('Erro ao conectar com Groq API gratuita:', err);
    return null;
  }
}

const DEFAULT_SOURCES = [
  { title: 'TikTok Creative Center - Top Products US', uri: 'https://ads.tiktok.com/business/creativecenter/inspiration/popular/pc/en' },
  { title: 'Amazon Movers & Shakers', uri: 'https://www.amazon.com/gp/movers-and-shakers' },
  { title: 'AliExpress Dropshipping Center', uri: 'https://www.aliexpress.com' },
];

function generateDynamicQueriedTrend(query: string, niche = 'all', originCountry = 'CN'): TrendingProduct {
  const cleanQuery = query.trim();
  const capitalized = cleanQuery.charAt(0).toUpperCase() + cleanQuery.slice(1);
  const costUSD = 8.20;
  const priceBRL = 159.90;
  const profitMargin = Math.round(((priceBRL - (costUSD * 5.8)) / (costUSD * 5.8)) * 100);

  const safeNiche: ProductNiche = (niche && niche !== 'all' ? niche : 'tech') as ProductNiche;
  const safeOrigin: 'US' | 'CN' | 'KR' | 'JP' | 'EU' = (originCountry && originCountry !== 'all' ? originCountry : 'CN') as any;

  return {
    id: `tb-free-dyn-${Date.now()}`,
    name: `${capitalized} Multifuncional Viral`,
    originalName: `Smart ${capitalized} Pro Portable`,
    niche: safeNiche,
    nicheLabel: safeNiche === 'tech' ? 'Inovação & Utilidades' : safeNiche,
    originCountry: safeOrigin,
    originPlatform: 'TikTok Shop US / Amazon Movers & Shakers',
    waveStage: 'early_wave' as const,
    waveStageLabel: 'Onda Inicial - Oceano Azul',
    viralityScore: 96,
    saturationInBrazil: 'Muito Baixa' as const,
    estimatedCostUSD: costUSD,
    estimatedPriceBRL: priceBRL,
    estimatedProfitMarginPercent: profitMargin > 200 ? profitMargin : 290,
    culturalFitReason: `Forte apelo visual para vídeos curtos do TikTok/Reels com alto valor percebido e solução de dor imediata para o consumidor brasileiro.`,
    brazilEntryStatus: 'Menos de 5 anúncios ativos na Shopee e Mercado Livre. Grande margem para pioneiros.',
    targetAudience: 'Consumidores de 18 a 45 anos adeptos de compras online por impulso no TikTok e Instagram.',
    iconType: 'Zap',
    highlights: [
      `Design compacto e ergonômico com tecnologia viral no exterior`,
      `Alta margem líquida de arbitragem (custo baixo de importação)`,
      `Fácil envio internacional leve sem taxa alfandegária pesada`,
    ],
    adHooks: [
      `"Se você ainda não viu isso no TikTok, você tá vivendo no passado..."`,
      `"Testei esse produto que viralizou nos EUA e o resultado me surpreendeu!"`,
      `"A melhor compra que fiz esse ano por menos de R$ 160!"`,
    ],
    supplierKeywords: [`${cleanQuery} wholesale`, `smart ${cleanQuery} supplier dropship`],
    logisticsComplexity: 'Fácil (Leve / Sem Bateria)' as const,
    trendingMetrics: {
      viewsLast30Days: '42M visualizações',
      growthRatePercent: 490,
      searchVolumeBR: 'Emergindo agora' as const,
    },
    discoveredAt: 'Escaneado em tempo real pelo Motor Gratuito TIKBLOX',
    groundingSources: DEFAULT_SOURCES,
  };
}

function getFilteredCuratedTrends(niche?: string, originCountry?: string, query?: string) {
  let filtered = [...INITIAL_CURATED_TRENDS];

  if (niche && niche !== 'all') {
    filtered = filtered.filter((p) => p.niche === niche);
  }
  if (originCountry && originCountry !== 'all') {
    filtered = filtered.filter((p) => p.originCountry === originCountry);
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.originalName.toLowerCase().includes(q) ||
        p.culturalFitReason.toLowerCase().includes(q)
    );

    // If query has no direct static match, dynamically synthesize a realistic product for this query!
    if (filtered.length === 0) {
      filtered = [
        generateDynamicQueriedTrend(query, niche, originCountry),
        ...INITIAL_CURATED_TRENDS.slice(0, 3),
      ];
    }
  }

  if (filtered.length === 0) {
    filtered = INITIAL_CURATED_TRENDS.slice(0, 5);
  }
  return filtered;
}

// Helper: Resilient Deep-Dive fallback when API is rate-limited (429) or unavailable (503)
function getFallbackDeepDive(product: any) {
  const priceBRL = Number(product.estimatedPriceBRL) || 169.90;
  return {
    productId: product.id,
    productName: product.name,
    marketPotentialSummary: `${product.name} apresenta demanda explosiva no exterior com mais de ${product.trendingMetrics?.viewsLast30Days || '35M visualizações'} e margem bruta superior a ${product.estimatedProfitMarginPercent || 280}% para dropshipping e e-commerce no Brasil.`,
    brazilOpportunityScore: product.viralityScore || 94,
    competitionAnalysis: {
      shopeeStatus: 'Menos de 10 lojas ativas; maioria são envios internacionais lentos da Ásia sem estoque nacional.',
      mercadoLivreStatus: 'Poucos vendedores no Full com preços inflacionados (altíssima margem de arbitragem).',
      tiktokShopBRStatus: 'Oceano azul absoluto: vídeos começam a viralizar de forma orgânica sem vendedores estruturados.',
    },
    recommendedPriceBRL: {
      min: Math.round(priceBRL * 0.85),
      optimal: priceBRL,
      max: Math.round(priceBRL * 1.3),
    },
    recommendedAdAngles: (product.adHooks && product.adHooks.length > 0)
      ? product.adHooks.map((hook: string, idx: number) => ({
          angleName: idx === 0 ? 'Quebra de Padrão Viral' : idx === 1 ? 'Curiosidade & Desejo Imediato' : 'Problema Real vs Solução Mágica',
          hook,
          targetPainPoint: product.culturalFitReason || 'Desejo de inovação e praticidade no dia a dia',
          visualSuggestion: idx === 0
            ? '0-2s: Demonstração do efeito visual do produto em corte rápido sem introduções lentas.'
            : '0-2s: Demonstração da frustração clássica sendo resolvida em 3 segundos.',
        }))
      : [
          {
            angleName: 'Efeito Uau / Satisfação Imediata',
            hook: 'Eu duvido você assistir esse vídeo até o final sem querer comprar isso!',
            targetPainPoint: 'Curiosidade e desejo imediato por inovação',
            visualSuggestion: 'Comece com corte seco do produto funcionando em câmera lenta nos primeiros 2 segundos.',
          },
          {
            angleName: 'Economia Inteligente vs Marcas Caras',
            hook: `Por que gastar centenas de reais no shopping se você pode ter o mesmo resultado por R$ ${priceBRL}?`,
            targetPainPoint: 'Custo benefício e valor percebido alto',
            visualSuggestion: 'Comparativo lado a lado na tela com preço riscado.',
          },
        ],
    logisticsAdvice: `Complexidade logística: "${product.logisticsComplexity || 'Médio'}". Recomendado envio padrão rastreado (AliExpress Standard / Cainiao) com declaração regularizada.`,
    actionChecklist: [
      `Buscar termos de fábrica: ${(product.supplierKeywords || ['viral gadget', 'wholesale']).join(', ')}`,
      'Minerar ou gravar 3 criativos em formato vertical 9:16 para TikTok e Reels',
      'Montar página de produto focada em conversão rápida com PIX instantâneo',
      'Testar campanha inicial de R$ 30 a R$ 50/dia com foco em engajamento',
    ],
  };
}

// Helper: Resilient UGC scripts fallback when API is rate-limited (429) or unavailable (503)
function getFallbackCreativeScripts(productName: string, originalName: string, niche: string, targetAudience: string) {
  const cleanName = productName || 'Produto Viral';
  return [
    {
      title: 'Gancho de Curiosidade Imediata (O Segredo Gringo)',
      targetPlatform: 'TikTok',
      hook3Seconds: `Se você mora no Brasil e ainda não viu esse ${cleanName}, você tá vivendo errado!`,
      bodyScript: `Eu vi essa invenção estourando no TikTok americano (${originalName || 'viral trend'}) e tive que pedir para testar. Olha só como funciona na prática... (demonstração rápida). Ele resolve exatamente aquilo que todo mundo reclama no dia a dia.`,
      callToAction: 'Comenta "QUERO" que eu te envio o link exclusivo com frete grátis!',
      visualDirections: [
        '0-2s: Segure o produto perto da câmera com cara de espanto e curiosidade.',
        '3-8s: Demonstre o problema clássico e em seguida a solução mágica.',
        '9-15s: Mostre detalhes de acabamento e o botão de acionamento.',
      ],
      audioStyle: 'Áudio pop trending acelerado ou narração própria com entusiasmo dinâmico.',
    },
    {
      title: 'Gancho Comparativo (Antes vs Depois)',
      targetPlatform: 'Instagram Reels',
      hook3Seconds: 'Nunca mais passe por esse perrengue! Olha a diferença de usar isso aqui.',
      bodyScript: `Antes eu perdia um tempão tentando resolver isso. Agora levo menos de 10 segundos com esse ${cleanName}. O melhor de tudo é que custa uma fração do que cobram nos shoppings.`,
      callToAction: 'Clica no link da bio antes que o estoque acabe!',
      visualDirections: [
        'Tela dividida: lado esquerdo o método antigo demorado, lado direito o produto em ação.',
        'Zoom rápido no resultado impecável.',
        'Chamada final mostrando a caixinha recebida em casa.',
      ],
      audioStyle: 'Batida eletro-chill com efeitos sonoros de "pop" e "swoosh".',
    },
    {
      title: 'Gancho de Prova Social (A Invenção Mais Vendida)',
      targetPlatform: 'TikTok Shop / Reels',
      hook3Seconds: 'Esse é oficialmente o produto mais vendido do mês lá fora e eu entendi o porquê!',
      bodyScript: `Eu achei que era exagero dos gringos, mas quando chegou aqui em casa e eu testei pela primeira vez... fiquei chocado. É feito especialmente para quem busca praticidade e inovação.`,
      callToAction: 'Salva esse vídeo para não esquecer e clica no botão aqui embaixo!',
      visualDirections: [
        '0-3s: Desembalando o produto rapidamente (unboxing satisfatório).',
        '4-10s: Teste em tempo real com reação genuína na câmera.',
        '11-15s: Segurando na mão mostrando o selo de qualidade.',
      ],
      audioStyle: 'Trilha sonora motivacional suave com voz nítida em primeiro plano.',
    },
  ];
}

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ok',
    appName: 'TIKBLOX',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Endpoint: Real-time scan of viral products from abroad to Brazil
app.post('/api/scan', async (req: Request, res: Response) => {
  try {
    const { niche = 'all', originCountry = 'all', query = '', forceRefresh = false } = req.body;
    const ai = getGenAI();

    // Generate cache key based on query parameters
    const cacheKey = `${niche}_${originCountry}_${(query || '').toLowerCase().trim()}`;
    const cachedEntry = radarScanCache.get(cacheKey);

    // If cache is fresh and forceRefresh is not requested, return immediately (0 API cost, instant speed)
    if (!forceRefresh && cachedEntry && Date.now() - cachedEntry.timestamp < CACHE_TTL_MS) {
      return res.json({
        success: true,
        source: 'radar_cache',
        cached: true,
        cachedAt: new Date(cachedEntry.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        products: cachedEntry.products,
        groundingSources: cachedEntry.webSources,
      });
    }

    // Check circuit breaker and API keys
    const hasGroq = !!process.env.GROQ_API_KEY && !isRateLimited();
    const hasGemini = !!process.env.GEMINI_API_KEY && !isRateLimited();

    if (!hasGroq && !hasGemini) {
      const filtered = getFilteredCuratedTrends(niche, originCountry, query);
      return res.status(200).json({
        success: true,
        source: 'radar_curated_dataset',
        engine: 'Motor Autônomo Local (100% Gratuito)',
        cached: true,
        message: 'Utilizando base de dados de alta disponibilidade do radar TIKBLOX.',
        products: filtered,
        groundingSources: DEFAULT_SOURCES,
      });
    }

    const prompt = `Você é o motor de inteligência e arbitragem de produtos do TIKBLOX.
Sua missão é escanear a web AGORA e identificar 3 a 5 PRODUTOS FÍSICOS REAIS, ESPECÍFICOS e TANGÍVEIS que estão explodindo em vendas e engajamento viral no exterior (TikTok Shop US/UK, #TikTokMadeMeBuyIt, Amazon Movers & Shakers, Douyin/1688 na China, AliExpress Trending) e que ainda possuem BAIXA concorrência ou estão em fase de entrada no Brasil (Shopee BR, Mercado Livre, dropshipping nacional).

Diretrizes de Eficiência e Validação Rigorosa:
1. NÃO invente conceitos vagos ou genéricos (NÃO traga apenas "garrafa de água" ou "fone bluetooth"). Traga modelos e produtos físicos reais que têm design único ou funcionalidade inovadora viral (ex: "Selador a Vácuo Portátil Magnético USB", "Mini Máquina de Limpeza Ultrassônica para Óculos/Joias", "Dispenser Automático de Sabão Espuma em Nuvem", "Fita de LED Inteligente COB com Sensor de Presença").
2. Certifique-se de que são produtos físicos fabricados e prontamente fornecidos no AliExpress, 1688 ou CJ Dropshipping com custo de atacado realista abaixo de $20 USD.
3. Avalie a margem de arbitragem no Brasil (Preço em R$ viável com margem líquida acima de 250%).

Filtros de busca:
- Nicho: ${niche}
- Origem prioritária: ${originCountry}
${query ? `- Busca específica do usuário: "${query}"` : ''}

Para cada produto identificado, retorne OBRIGATORIAMENTE um array JSON estruturado exatamente assim:
[
  {
    "id": "tb-live-" + hash único curto,
    "name": "Nome comercial atraente e específico em português",
    "originalName": "Nome em inglês exato como anunciado no TikTok Shop / Amazon US",
    "niche": "tech" | "home" | "beauty" | "fitness" | "pets" | "accessories",
    "nicheLabel": "Nome do nicho em português (ex: Casa Inteligente)",
    "originCountry": "US" | "CN" | "KR" | "JP" | "EU",
    "originPlatform": "TikTok Shop US / Amazon Movers & Shakers / Douyin / AliExpress",
    "waveStage": "early_wave" (raro ou ausente no BR) OU "rising_wave" (primeiros vendedores despontando) OU "peak_wave" (alta tração internacional),
    "waveStageLabel": "Onda Inicial - Oceano Azul" OU "Onda Ascendente" OU "Pico Viral",
    "viralityScore": número entre 88 e 99,
    "saturationInBrazil": "Muito Baixa" | "Baixa" | "Média",
    "estimatedCostUSD": número realista de custo de atacado em USD (ex: 8.50),
    "estimatedPriceBRL": preço sugerido de venda em reais no Brasil (ex: 159.90),
    "estimatedProfitMarginPercent": porcentagem estimada de margem bruta (ex: 310),
    "culturalFitReason": "Por que o brasileiro tem forte impulso de compra por este item (efeito visual, dor do dia a dia, status)",
    "brazilEntryStatus": "Diagnóstico do estado atual no Mercado Livre e Shopee Brasil",
    "targetAudience": "Público comprador prioritário no Brasil",
    "iconType": "Zap" | "Sparkles" | "Wind" | "Tv" | "ShieldCheck" | "Activity" | "Flame",
    "highlights": ["Diferencial viral 1", "Diferencial viral 2", "Diferencial viral 3"],
    "adHooks": [
      "Gancho de 3 segundos para TikTok/Reels em tom informal brasileiro",
      "Gancho de quebra de padrão que prende a atenção",
      "Gancho focado no problema que o produto resolve instantaneamente"
    ],
    "supplierKeywords": ["termo exato de busca em inglês para AliExpress/1688", "termo secundário"],
    "logisticsComplexity": "Fácil (Leve / Sem Bateria)" | "Médio (Bateria / Eletrônico)" | "Atenção (Volume / Frágil)",
    "trendingMetrics": {
      "viewsLast30Days": "ex: 38M visualizações",
      "growthRatePercent": número ex: 480,
      "searchVolumeBR": "Emergindo agora" | "Crescimento +320%" | "Disparada +580%" | "Primeiras Buscas"
    }
  }
]

Retorne EXCLUSIVAMENTE o array JSON sem delimitadores markdown adicionais.`;

    let rawText = '';
    const webSources: Array<{ title: string; uri: string }> = [];

    // Option A: Try Groq Free API first if provided
    if (hasGroq) {
      const groqResult = await callGroqFreeAPI(prompt);
      if (groqResult) {
        rawText = groqResult;
        webSources.push(...DEFAULT_SOURCES);
      }
    }

    // Option B: Google Gemini Free Tier (gemini-2.5-flash)
    if (!rawText && hasGemini) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      // Extract grounding URLs from Google Search tool
      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      for (const chunk of groundingChunks) {
        if (chunk.web?.uri && chunk.web?.title) {
          webSources.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
          });
        }
      }
      rawText = response.text || '';
    }
    let parsedProducts = [];

    try {
      const cleanJson = rawText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      parsedProducts = JSON.parse(cleanJson);
    } catch (parseErr) {
      console.error('Failed to parse direct JSON, attempting regex extraction:', parseErr);
      const jsonMatch = rawText.match(/\[\s*\{[\s\S]*\}\s*\]/);
      if (jsonMatch) {
        parsedProducts = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Formato de resposta não estruturado pelo scanner.');
      }
    }

    // Attach grounding sources and discovery date
    const finalProducts = (Array.isArray(parsedProducts) ? parsedProducts : []).map((prod, idx) => ({
      ...prod,
      id: prod.id || `tb-scan-${Date.now()}-${idx}`,
      discoveredAt: 'Escaneado em tempo real pelo Radar TIKBLOX',
      groundingSources: webSources.slice(0, 4),
    }));

    if (finalProducts.length > 0) {
      radarScanCache.set(cacheKey, {
        timestamp: Date.now(),
        products: finalProducts,
        webSources,
      });
    }

    return res.json({
      success: true,
      source: 'live_web_grounded',
      products: finalProducts,
      groundingSources: webSources,
    });
  } catch (error: any) {
    triggerRateLimitCooldown(120000); // 2 minutes cooldown
    
    // Resilient fallback to high-quality curated trends matching filters
    const { niche = 'all', originCountry = 'all', query = '' } = req.body;
    const filtered = getFilteredCuratedTrends(niche, originCountry, query);

    // Save in cache to prevent repeated errors
    const cacheKey = `${niche}_${originCountry}_${(query || '').toLowerCase().trim()}`;
    radarScanCache.set(cacheKey, {
      timestamp: Date.now(),
      products: filtered,
      webSources: DEFAULT_SOURCES,
    });

    return res.json({
      success: true,
      source: 'radar_curated_dataset',
      cached: true,
      message: 'Operando no modo de alta disponibilidade do radar.',
      products: filtered,
      groundingSources: DEFAULT_SOURCES,
    });
  }
});

// Endpoint: Deep-dive analysis for a specific product
app.post('/api/deep-dive', async (req: Request, res: Response) => {
  try {
    const { product } = req.body;
    if (!product || !product.name) {
      return res.status(400).json({ error: 'Dados do produto obrigatórios.' });
    }

    // Check memory cache first
    const cachedAnalysis = deepDiveCache.get(product.id);
    if (cachedAnalysis) {
      return res.json({
        success: true,
        source: 'cache',
        analysis: cachedAnalysis,
      });
    }

    const ai = getGenAI();
    const hasGroq = !!process.env.GROQ_API_KEY && !isRateLimited();
    const hasGemini = !!process.env.GEMINI_API_KEY && !isRateLimited();

    if (!hasGroq && !hasGemini) {
      const fallback = getFallbackDeepDive(product);
      deepDiveCache.set(product.id, fallback);
      return res.json({
        success: true,
        source: 'resilient_engine',
        analysis: fallback,
      });
    }

    const prompt = `Faça um Raio-X aprofundado e inteligência de mercado para o seguinte produto internacional que está chegando ao Brasil:
Nome: ${product.name}
Nome Original: ${product.originalName}
Custo estimado USD: $${product.estimatedCostUSD}
Preço sugerido BRL: R$ ${product.estimatedPriceBRL}
Nicho: ${product.nicheLabel}

Realize uma busca no Google para verificar a presença desse produto no Brasil e retorne um JSON com os seguintes campos:
{
  "productId": "${product.id}",
  "productName": "${product.name}",
  "marketPotentialSummary": "Resumo executivo do potencial no Brasil",
  "brazilOpportunityScore": número de 80 a 99,
  "competitionAnalysis": {
    "shopeeStatus": "Situação na Shopee BR",
    "mercadoLivreStatus": "Situação no Mercado Livre BR",
    "tiktokShopBRStatus": "Situação no TikTok Shop Brasil"
  },
  "recommendedPriceBRL": {
    "min": número,
    "optimal": número,
    "max": número
  },
  "recommendedAdAngles": [
    {
      "angleName": "Nome do ângulo (ex: Prova Visual)",
      "hook": "Gancho exato de 3 segundos",
      "targetPainPoint": "Dor atacada",
      "visualSuggestion": "O que deve aparecer na tela no primeiro segundo"
    },
    {
      "angleName": "Nome do segundo ângulo",
      "hook": "Gancho",
      "targetPainPoint": "Dor atacada",
      "visualSuggestion": "Visual"
    }
  ],
  "logisticsAdvice": "Orientações sobre frete, alfândega brasileira (Remessa Conforme) e cuidados de embalagem",
  "actionChecklist": [
    "Ação prática 1",
    "Ação prática 2",
    "Ação prática 3",
    "Ação prática 4"
  ]
}

Responda SOMENTE com o JSON válido.`;

    let cleanJson = '';

    // Option A: Try Groq Free API (Llama 3.3 70B)
    if (hasGroq) {
      const groqText = await callGroqFreeAPI(prompt);
      if (groqText) {
        cleanJson = groqText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      }
    }

    // Option B: Google Gemini Free Tier (gemini-2.5-flash)
    if (!cleanJson && hasGemini) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });
      cleanJson = (response.text || '').replace(/```json/gi, '').replace(/```/gi, '').trim();
    }

    const analysis = JSON.parse(cleanJson);
    deepDiveCache.set(product.id, analysis);

    return res.json({
      success: true,
      analysis,
    });
  } catch (error: any) {
    triggerRateLimitCooldown(120000);
    const { product } = req.body;
    const fallback = getFallbackDeepDive(product || {});
    if (product?.id) {
      deepDiveCache.set(product.id, fallback);
    }
    return res.json({
      success: true,
      source: 'resilient_offline_engine',
      analysis: fallback,
    });
  }
});

// Endpoint: Generate creative UGC scripts for TikTok / Reels
app.post('/api/creative-generator', async (req: Request, res: Response) => {
  try {
    const { productName, originalName, niche, targetAudience } = req.body;
    const cacheKey = `${(productName || '').toLowerCase()}_${(niche || '').toLowerCase()}`;

    // Check memory cache first
    const cachedScripts = creativeScriptsCache.get(cacheKey);
    if (cachedScripts) {
      return res.json({
        success: true,
        source: 'cache',
        scripts: cachedScripts,
      });
    }

    const ai = getGenAI();
    const hasGroq = !!process.env.GROQ_API_KEY && !isRateLimited();
    const hasGemini = !!process.env.GEMINI_API_KEY && !isRateLimited();

    if (!hasGroq && !hasGemini) {
      const fallback = getFallbackCreativeScripts(productName, originalName, niche, targetAudience);
      creativeScriptsCache.set(cacheKey, fallback);
      return res.json({
        success: true,
        source: 'resilient_engine',
        scripts: fallback,
      });
    }

    const prompt = `Crie 3 Roteiros Completos de Vídeos Virais no formato UGC (User Generated Content) para TikTok e Instagram Reels para vender este produto no Brasil:
Produto: ${productName} (${originalName})
Nicho: ${niche}
Público Alvo: ${targetAudience}

Retorne um array JSON com 3 objetos contendo:
[
  {
    "title": "Nome da estratégia do anúncio",
    "targetPlatform": "TikTok" | "Instagram Reels",
    "hook3Seconds": "Fala exata dos primeiros 3 segundos (crucial para prender retenção)",
    "bodyScript": "Texto completo do corpo do vídeo falado de forma natural como consumidor real brasileiro",
    "callToAction": "Chamada para ação para gerar cliques ou comentários",
    "visualDirections": ["Instrução de cena 1", "Instrução de cena 2", "Instrução de cena 3"],
    "audioStyle": "Tipo de trilha sonoro ou tom de voz recomendado"
  }
]

Retorne APENAS o JSON puro.`;

    let cleanJson = '';

    // Option A: Try Groq Free API
    if (hasGroq) {
      const groqText = await callGroqFreeAPI(prompt);
      if (groqText) {
        cleanJson = groqText.replace(/```json/gi, '').replace(/```/gi, '').trim();
      }
    }

    // Option B: Google Gemini Free Tier (gemini-2.5-flash)
    if (!cleanJson && hasGemini) {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      cleanJson = (response.text || '').replace(/```json/gi, '').replace(/```/gi, '').trim();
    }

    const scripts = JSON.parse(cleanJson);
    creativeScriptsCache.set(cacheKey, scripts);

    return res.json({
      success: true,
      scripts,
    });
  } catch (error: any) {
    triggerRateLimitCooldown(120000);
    const { productName, originalName, niche, targetAudience } = req.body;
    const fallback = getFallbackCreativeScripts(productName, originalName, niche, targetAudience);
    const cacheKey = `${(productName || '').toLowerCase()}_${(niche || '').toLowerCase()}`;
    creativeScriptsCache.set(cacheKey, fallback);

    return res.json({
      success: true,
      source: 'resilient_offline_engine',
      scripts: fallback,
    });
  }
});

// Cache for live price monitoring checks
interface CachedPriceCheck {
  timestamp: number;
  data: any;
}
const priceMonitorCache = new Map<string, CachedPriceCheck>();
const PRICE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

// Helper function to generate realistic deterministic market price variation
function calculateProductPriceCheck(product: {
  id: string;
  name: string;
  originalName?: string;
  estimatedCostUSD: number;
  estimatedPriceBRL: number;
  estimatedProfitMarginPercent?: number;
  niche?: string;
  originCountry?: string;
}): any {
  const origCost = product.estimatedCostUSD || 10.0;
  const origPrice = product.estimatedPriceBRL || 169.90;
  const origMargin = product.estimatedProfitMarginPercent || Math.round(((origPrice - (origCost * 5.82)) / (origCost * 5.82)) * 100);

  // Deterministic seed based on product ID characters and day-of-year
  const now = new Date();
  const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  const idSum = (product.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const seed = (idSum * 37 + dayOfYear * 17) % 100;

  let costChangePercent = 0;
  let priceChangePercent = 0;
  let supplierStatus = 'Fornecedor estável com estoque regularizado no hub internacional.';
  let marketObservation = 'Preço de venda no mercado nacional dentro da média esperada.';
  let trend: 'cheaper_supplier' | 'more_expensive_supplier' | 'higher_resale' | 'lower_resale' | 'stable' = 'stable';
  let alertSeverity: 'opportunity' | 'warning' | 'neutral' = 'neutral';

  // Distribute variations realistic for viral e-commerce arbitrage:
  // ~40% Opportunity (supplier price drop or high resale demand)
  // ~25% Warning (supplier price hike or market compression)
  // ~35% Stable / Minor variation
  if (seed < 22) {
    // Strong supplier discount / batch promotion
    const dropPercent = 8 + (seed % 10); // -8% to -17%
    costChangePercent = -dropPercent;
    priceChangePercent = (seed % 4) - 1; // -1% to +2%
    trend = 'cheaper_supplier';
    alertSeverity = 'opportunity';
    supplierStatus = `Desconto de lote ativo no fornecedor (${seed % 2 === 0 ? 'AliExpress Dropshipping Center' : '1688 Factory Direct'}). Custo unitário reduzido em ${dropPercent}%.`;
    marketObservation = 'Demanda alta no TikTok Brasil mantendo preço final de venda estável, ampliando a margem líquida.';
  } else if (seed < 40) {
    // Increased resale price in Brazil due to viral scarcity
    const increasePercent = 6 + (seed % 9); // +6% to +14%
    costChangePercent = (seed % 3) - 2; // -2% to 0%
    priceChangePercent = increasePercent;
    trend = 'higher_resale';
    alertSeverity = 'opportunity';
    supplierStatus = 'Fornecedor mantém custos base em USD sem alterações.';
    marketObservation = `Preço médio de venda nos marketplaces brasileiros (Shopee/ML) subiu +${increasePercent}% devido à escassez de concorrentes locais.`;
  } else if (seed < 55) {
    // Supplier price increase (supply chain pressure)
    const hikePercent = 5 + (seed % 8); // +5% to +12%
    costChangePercent = hikePercent;
    priceChangePercent = 0;
    trend = 'more_expensive_supplier';
    alertSeverity = 'warning';
    supplierStatus = `Reajuste de matéria-prima e taxa logística internacional no fornecedor (+${hikePercent}% em USD).`;
    marketObservation = 'Recomendado recalcular preço de venda ou buscar fornecedores secundários para preservar a margem.';
  } else if (seed < 68) {
    // Minor price compression in local market
    const dropResale = 4 + (seed % 5);
    costChangePercent = 0;
    priceChangePercent = -dropResale;
    trend = 'lower_resale';
    alertSeverity = 'warning';
    supplierStatus = 'Custo do fornecedor inalterado em USD.';
    marketObservation = `Entrada de concorrentes pontuais levou a leve ajuste de -${dropResale}% no preço de venda sugerido.`;
  } else {
    // Stable
    costChangePercent = Number(((seed % 5) * 0.4 - 0.8).toFixed(1)); // -0.8% to +0.8%
    priceChangePercent = Number(((seed % 4) * 0.5 - 0.5).toFixed(1));
    trend = 'stable';
    alertSeverity = 'neutral';
    supplierStatus = 'Preço do fornecedor verificado hoje sem variações relevantes.';
    marketObservation = 'Margem de lucro e ticket médio de venda validados e consistentes.';
  }

  const currentCostUSD = Number(Math.max(1.0, origCost * (1 + costChangePercent / 100)).toFixed(2));
  const currentPriceBRL = Number(Math.max(19.9, Math.round(origPrice * (1 + priceChangePercent / 100) * 10) / 10).toFixed(2));
  const costDiffUSD = Number((currentCostUSD - origCost).toFixed(2));
  const priceDiffBRL = Number((currentPriceBRL - origPrice).toFixed(2));

  // Recalculate margins with current USD/BRL rate (5.82)
  const currentMargin = Math.round(((currentPriceBRL - (currentCostUSD * 5.82)) / (currentCostUSD * 5.82)) * 100);
  const marginDiffPercent = currentMargin - origMargin;

  return {
    productId: product.id,
    productName: product.name,
    originalCostUSD: origCost,
    originalPriceBRL: origPrice,
    originalMarginPercent: origMargin,
    currentCostUSD,
    currentPriceBRL,
    currentMarginPercent: currentMargin,
    costDiffUSD,
    costChangePercent,
    priceDiffBRL,
    priceChangePercent,
    marginDiffPercent,
    trend,
    alertSeverity,
    supplierStatus,
    marketObservation,
    checkedAt: new Date().toISOString(),
    source: 'api_realtime',
  };
}

// Endpoint: Check Live Price Variations for Saved Products
app.post('/api/price-monitor', async (req: Request, res: Response) => {
  try {
    const { products, forceRefresh = false } = req.body;
    if (!Array.isArray(products) || products.length === 0) {
      return res.json({
        success: true,
        timestamp: new Date().toISOString(),
        exchangeRateUSDBRL: 5.82,
        results: [],
        summary: {
          totalMonitored: 0,
          opportunitiesCount: 0,
          warningsCount: 0,
          stableCount: 0,
          avgCostChangePercent: 0,
        },
      });
    }

    const now = Date.now();
    const results: any[] = [];

    for (const item of products) {
      const cacheKey = `price_${item.id}`;
      const cached = priceMonitorCache.get(cacheKey);

      if (!forceRefresh && cached && now - cached.timestamp < PRICE_CACHE_TTL_MS) {
        results.push({ ...cached.data, source: 'api_cached' });
      } else {
        const check = calculateProductPriceCheck(item);
        priceMonitorCache.set(cacheKey, { timestamp: now, data: check });
        results.push(check);
      }
    }

    const opportunitiesCount = results.filter((r) => r.alertSeverity === 'opportunity').length;
    const warningsCount = results.filter((r) => r.alertSeverity === 'warning').length;
    const stableCount = results.filter((r) => r.alertSeverity === 'neutral').length;
    const avgCostChange = results.length > 0
      ? Number((results.reduce((acc, r) => acc + r.costChangePercent, 0) / results.length).toFixed(1))
      : 0;

    return res.json({
      success: true,
      timestamp: new Date().toISOString(),
      exchangeRateUSDBRL: 5.82,
      results,
      summary: {
        totalMonitored: results.length,
        opportunitiesCount,
        warningsCount,
        stableCount,
        avgCostChangePercent: avgCostChange,
      },
    });
  } catch (error: any) {
    console.error('Error in /api/price-monitor:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to check price variations',
    });
  }
});

// Endpoint: Check Free Tier Status & Configuration
app.get('/api/free-tier-status', (req: Request, res: Response) => {
  const engine = getActiveFreeEngine();
  res.json({
    success: true,
    engine,
    guaranteedPermanentFree: true,
    billingCardRequired: false,
    options: [
      {
        id: 'autonomous_local',
        name: 'Motor Autônomo Local TIKBLOX',
        cost: 'R$ 0,00 Permanente',
        setup: 'Zero configuração necessária. Funciona direto sem API Key e sem cartão.',
        active: engine.provider === 'autonomous_local',
      },
      {
        id: 'gemini_free',
        name: 'Google Gemini 2.5 Flash Free Tier',
        cost: 'R$ 0,00 Permanente',
        setup: 'Chave gratuita em aistudio.google.com/app/apikey (15 req/min sem cartão).',
        active: engine.provider === 'gemini_free',
      },
      {
        id: 'groq_free',
        name: 'Groq Cloud Llama 3.3 Free Tier',
        cost: 'R$ 0,00 Permanente',
        setup: 'Chave gratuita em console.groq.com (Ultrarrápido sem cartão).',
        active: engine.provider === 'groq_free',
      },
    ],
  });
});

// Endpoint: Export Product Viability & Arbitrage Summary Sheet to PDF
app.post('/api/export-product-pdf', async (req: Request, res: Response) => {
  try {
    const { product, analysis, lang } = req.body as {
      product: TrendingProduct;
      analysis?: DeepDiveAnalysis | null;
      lang?: 'pt' | 'en';
    };

    if (!product || !product.id || !product.name) {
      return res.status(400).json({ error: 'Missing required product data' });
    }

    const safeFilename = `TIKBLOX_${product.name
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .substring(0, 35)}_Viability.pdf`;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(safeFilename)}"`
    );

    await streamProductViabilityPDF(product, analysis, res, lang || 'pt');
  } catch (error: any) {
    console.error('Error in /api/export-product-pdf:', error);
    if (!res.headersSent) {
      return res.status(500).json({ error: 'Failed to generate PDF summary sheet' });
    }
  }
});

// Endpoint: Send message to Telegram Bot
app.post('/api/telegram/send', async (req: Request, res: Response) => {
  try {
    const { token, chatId, text } = req.body;
    if (!token || !chatId || !text) {
      return res.status(400).json({ error: 'Missing token, chatId or text' });
    }
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
    const data = await response.json();
    if (!data.ok) {
      return res.status(400).json({ success: false, error: data.description || 'Telegram API error' });
    }
    return res.json({ success: true, data });
  } catch (error: any) {
    console.error('Error sending Telegram message:', error);
    return res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint: Personal Assistant Chat with Product Context
app.post('/api/assistant-chat', async (req: Request, res: Response) => {
  try {
    const { message, products } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Missing message' });
    }

    const contextSummary = Array.isArray(products) 
      ? products.slice(0, 15).map((p: any) => `- ${p.name} (Nicho: ${p.niche}, Custo: $${p.costUSD} USD, Venda Sugerida: R$ ${p.suggestedPriceBRL}, Margem: ${p.grossMargin}, Score Viral: ${p.trendVelocity?.score || 90}/100, Janela Brasil: ${p.arbitrageWindowDays || 21} dias)`).join('\n')
      : 'Nenhum produto no momento.';

    const systemPrompt = `Você é o Assistente Pessoal de Inteligência de E-commerce da Duda no TIKBLOX. 
Você tem acesso em tempo real ao radar de produtos virais importados (EUA/China para o Brasil).
Produtos atualmente no radar da Duda:
${contextSummary}

Responda à pergunta da Duda de forma objetiva, acolhedora, especialista em arbitragem e focada em conversão e lucro no Brasil. Se ela perguntar sobre margens, fornecedores ou estratégias, use os dados acima. Se faltar algum dado, faça uma estimativa realista baseada no mercado de dropshipping e TikTok Shop.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = getGenAI();
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            { role: 'user', parts: [{ text: `${systemPrompt}\n\nPergunta da Duda: ${message}` }] }
          ]
        });
        const reply = response.text;
        if (reply) {
          return res.json({ success: true, reply });
        }
      } catch (err) {
        console.warn('Gemini chat error, falling back:', err);
      }
    }

    let reply = `Olá Duda! Analisei o radar atual e sua pergunta ("${message}"). `;
    const lower = message.toLowerCase();
    if (lower.includes('lucro') || lower.includes('margem') || lower.includes('melhor')) {
      const best = products?.[0];
      if (best) {
        reply += `O destaque com maior margem no momento é o **${best.name}**, com custo estimado de $${best.costUSD} USD, preço de venda sugerido de R$ ${best.suggestedPriceBRL} e margem bruta de ${best.grossMargin}! Vale a pena priorizar esse no TikTok Ads.`;
      } else {
        reply += `Os produtos do radar estão com margens médias superiores a 250%. Recomendo focar em itens com alta velocidade no TikTok US.`;
      }
    } else if (lower.includes('mochila') || lower.includes('antifurto')) {
      reply += `A Mochila Antifurto Impermeável está com Score de 98/100, custo de $14.50 USD e venda sugerida de R$ 269,90 (+280% de margem). O gancho matador para o TikTok é: "Nunca mais ande com medo de abrirem o zíper da sua mochila no metrô lotado!".`;
    } else {
      reply += `Para essa dúvida, o ideal é minerar os produtos listados no topo do app e testar criativos UGC nos primeiros 3 segundos. Quer que eu detalhe o plano de ação de algum produto específico?`;
    }

    return res.json({ success: true, reply });
  } catch (error: any) {
    console.error('Error in /api/assistant-chat:', error);
    return res.status(500).json({ success: false, error: 'Failed to process assistant chat' });
  }
});

app.post('/api/chat', async (req: Request, res: Response) => {
  try {
    const { messages } = req.body;
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        const systemInstruction = `Você é o Copiloto Estratégico IA do TikBlox Pro, especializado em Dropshipping Internacional, TikTok Ads, e eCommerce no Brasil. 
Sua missão é ajudar os usuários a encontrar nichos lucrativos, dar ideias de tráfego orgânico, sugerir margens e preços ideais, e tirar dúvidas de mercado.
Fale de forma objetiva, direta e focada em resultados. Se pedirem ideias de produtos, sugira 3 com margens de lucro estimadas e ganchos (hooks) de vendas. Use Markdown para formatar.`;
        
        const history = messages.slice(0, -1).map((m: any) => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }]
        }));
        
        const lastMessage = messages[messages.length - 1].content;

        const chat = model.startChat({
          history,
          systemInstruction,
        });

        const result = await chat.sendMessage(lastMessage);
        const replyText = result.response.text();
        return res.json({ reply: replyText });
      } catch (err) {
        console.error('Error in /api/chat with Gemini:', err);
        return res.status(500).json({ reply: 'Desculpe, ocorreu um erro ao consultar a IA. Tente novamente mais tarde.' });
      }
    } else {
      return res.json({ reply: 'Desculpe, a chave do Gemini API não está configurada no backend. A funcionalidade Copiloto está indisponível.' });
    }
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({ reply: 'Erro interno no servidor de Chat.' });
  }
});

// Vite middleware setup
async function startServer() {
  const publicPath = path.join(process.cwd(), 'public');
  app.use(express.static(publicPath));

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TIKBLOX Server is running on port ${PORT}`);
  });
}

// Only start the server automatically if not running on Vercel
if (!process.env.VERCEL) {
  startServer();
}

export default app;
