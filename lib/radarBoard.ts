import { signalsForProducts, type ProductSignal, type PromotionSighting } from './creatorSignal.js';
import { SHOP_NICHES, shopNicheFromText } from './shopNiches.js';

export interface RadarCreator {
  id: string;
  handle: string;
  nickname: string;
  avatarUrl: string | null;
  followers: number | null;
  niches: string[];
}

export interface RadarProduct {
  id: string;
  title: string;
  niche: string;
  productUrl: string;
  coverUrl: string | null;
  commissionBrl: number | null;
  commissionRate: number | null;
  priceMin: number | null;
  priceMax: number | null;
  starters7d: number;
  startersPrev7d: number;
  tag: ProductSignal['tag'];
  creators: Array<{ id: string; nickname: string; handle: string; avatarUrl: string | null; videoUrl: string | null }>;
}

export interface RadarSnapshot {
  niches: Array<{ id: string; label: string; icon: string; products: number; creators: number }>;
  products: RadarProduct[];
  creators: RadarCreator[];
}

export function buildRadarSnapshot(input: {
  now: Date;
  sightings: PromotionSighting[];
  creators: Array<{ id: string; handle: string; nickname: string; avatar_url?: string | null; followers?: number | null }>;
  products: Array<{
    id: string;
    title: string;
    niche: string | null;
    keyword?: string | null;
    product_url: string | null;
    cover_url: string | null;
    commission_brl: number | null;
    commission_rate: number | null;
    price_min: number | null;
    price_max: number | null;
  }>;
}): RadarSnapshot {
  const signals = signalsForProducts(input.sightings, input.now);
  const productById = new Map(input.products.map((product) => [product.id, product]));
  const creatorById = new Map(input.creators.map((creator) => [creator.id, creator]));
  const videoByPair = new Map<string, string>();
  for (const sighting of input.sightings) {
    if (sighting.videoUrl) videoByPair.set(`${sighting.creatorId}:${sighting.productId}`, sighting.videoUrl);
  }

  const nicheOf = (product: { title: string; keyword?: string | null }) =>
    shopNicheFromText(product.keyword || '', product.title);

  const nicheByCreator = new Map<string, Set<string>>();
  for (const sighting of input.sightings) {
    const product = productById.get(sighting.productId);
    if (!product) continue;
    const niche = nicheOf(product);
    if (!niche) continue;
    const set = nicheByCreator.get(sighting.creatorId) || new Set<string>();
    set.add(niche);
    nicheByCreator.set(sighting.creatorId, set);
  }

  const products: RadarProduct[] = [];
  for (const signal of signals) {
    const product = productById.get(signal.productId);
    if (!product?.title || !product.product_url) continue;
    const niche = nicheOf(product);
    if (!niche) continue;
    const creators = signal.creatorIds.map((id) => {
      const creator = creatorById.get(id);
      return {
        id,
        nickname: creator?.nickname || creator?.handle || 'Criador',
        handle: creator?.handle || '',
        avatarUrl: creator?.avatar_url || null,
        videoUrl: videoByPair.get(`${id}:${signal.productId}`) || null,
      };
    });
    products.push({
      id: product.id,
      title: product.title,
      niche,
      productUrl: product.product_url,
      coverUrl: product.cover_url,
      commissionBrl: product.commission_brl,
      commissionRate: product.commission_rate,
      priceMin: product.price_min,
      priceMax: product.price_max,
      starters7d: signal.starters7d,
      startersPrev7d: signal.startersPrev7d,
      tag: signal.tag,
      creators,
    });
  }

  const creators: RadarCreator[] = input.creators
    .map((creator) => ({
      id: creator.id,
      handle: creator.handle,
      nickname: creator.nickname || creator.handle || 'Criador',
      avatarUrl: creator.avatar_url || null,
      followers: creator.followers ?? null,
      niches: [...(nicheByCreator.get(creator.id) || [])],
    }))
    .filter((creator) => creator.niches.length > 0);

  const niches = SHOP_NICHES.map((niche) => ({
    id: niche.id,
    label: niche.label,
    icon: niche.icon,
    products: products.filter((product) => product.niche === niche.id).length,
    creators: creators.filter((creator) => creator.niches.includes(niche.id)).length,
  })).filter((niche) => niche.products > 0 || niche.creators > 0);

  return { niches, products, creators };
}
