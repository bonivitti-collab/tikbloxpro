export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { niche = 'all', originCountry = 'all', query = '' } = req.body || {};

  // High-conversion curated TikTok Shop Brasil sample trends
  const products = [
    {
      id: 'tk-br-seladora',
      name: 'Mini Seladora Térmica Portátil Recarregável USB',
      originalName: 'Portable USB Mini Bag Sealer with Cutter',
      niche: 'home',
      nicheLabel: 'Casa & Cozinha',
      originCountry: 'CN',
      estimatedCostUSD: 1.8,
      estimatedPriceBRL: 39.9,
      commissionPercent: 25,
      commissionEstimatedBRL: 9.97,
      freeSampleAvailable: true,
      stockLocationBrazil: 'São Paulo - SP (Pronta Entrega)',
      creatorSaturationBR: 'Baixa',
      tiktokShopAffiliateLink: 'https://seller-br.tiktok.com/affiliate',
      hookViral3s: 'Você ainda fecha saco de comida com pregador de roupa em 2026?!',
      estimatedProfitMarginPercent: 320,
      viralityScore: 97,
      culturalFitReason: 'Resolve a dor de guardar snacks e biscoitos crocantes no calor e umidade do Brasil.',
      imageUrl: 'https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=500&q=80',
    },
    {
      id: 'tk-br-escova-facial',
      name: 'Massageador Facial Ultrassônico com LED Anti-Idade',
      originalName: 'Ultrasonic Facial Massager with Red LED',
      niche: 'beauty',
      nicheLabel: 'Beleza & Estética',
      originCountry: 'US',
      estimatedCostUSD: 4.5,
      estimatedPriceBRL: 89.9,
      commissionPercent: 28,
      commissionEstimatedBRL: 25.17,
      freeSampleAvailable: true,
      stockLocationBrazil: 'Curitiba - PR (Envio Rápido)',
      creatorSaturationBR: 'Baixa',
      tiktokShopAffiliateLink: 'https://seller-br.tiktok.com/affiliate',
      hookViral3s: 'Por que pagar R$ 400 em clínica de estética se esse aparelho faz o mesmo em casa?',
      estimatedProfitMarginPercent: 290,
      viralityScore: 95,
      culturalFitReason: 'Febre de skincare no TikTok Brasil com apelo de estética imediata sem gastar rios de dinheiro.',
      imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500&q=80',
    },
    {
      id: 'tk-br-led-rgb',
      name: 'Fita LED RGB Inteligente com Sincronização Musical',
      originalName: 'Smart Symphony RGB LED Strip with Sound Sync',
      niche: 'tech',
      nicheLabel: 'Gadgets & Inovação',
      originCountry: 'CN',
      estimatedCostUSD: 3.2,
      estimatedPriceBRL: 69.9,
      commissionPercent: 22,
      commissionEstimatedBRL: 15.38,
      freeSampleAvailable: false,
      stockLocationBrazil: 'São Paulo - SP (Pronta Entrega)',
      creatorSaturationBR: 'Média',
      tiktokShopAffiliateLink: 'https://seller-br.tiktok.com/affiliate',
      hookViral3s: 'O segredo que os criadores de conteúdo usam pra deixar o quarto parecendo estúdio de luxo!',
      estimatedProfitMarginPercent: 310,
      viralityScore: 94,
      culturalFitReason: 'Produto altamente visual que se vende sozinho em lives ao colocar uma música tocando.',
      imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=500&q=80',
    },
  ];

  return res.status(200).json({
    success: true,
    source: 'radar_curated_dataset',
    products,
    groundingSources: [
      {
        title: 'TikTok Shop Brasil — Centro de Criadores',
        uri: 'https://seller-br.tiktok.com',
      },
    ],
  });
}
