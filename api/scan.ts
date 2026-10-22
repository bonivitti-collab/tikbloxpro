import { INITIAL_CURATED_TRENDS } from '../src/data/curatedTrends';
import { enrichWithTikTokShopData } from '../src/data/tiktokShopEnricher';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { niche = 'all', originCountry = 'all', query = '' } = req.body || {};
  let filtered = [...INITIAL_CURATED_TRENDS];

  if (niche && niche !== 'all') {
    filtered = filtered.filter((p) => p.niche === niche);
  }
  if (originCountry && originCountry !== 'all') {
    filtered = filtered.filter((p) => p.originCountry === originCountry);
  }
  if (query && query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter((p) =>
      p.name.toLowerCase().includes(q) ||
      p.culturalFitReason.toLowerCase().includes(q) ||
      p.nicheLabel.toLowerCase().includes(q)
    );
  }
  if (filtered.length === 0) {
    filtered = INITIAL_CURATED_TRENDS.slice(0, 10);
  }

  const enriched = filtered.map(enrichWithTikTokShopData);

  return res.status(200).json({
    success: true,
    source: 'radar_curated_dataset',
    products: enriched,
    groundingSources: [
      {
        title: 'TikTok Shop Brasil — Centro de Criadores',
        uri: 'https://seller-br.tiktok.com',
      },
      {
        title: 'TikTok Creative Center — Top Ads Brasil',
        uri: 'https://ads.tiktok.com/business/creativecenter/inspiration/topads/pc/pt',
      },
    ],
  });
}
