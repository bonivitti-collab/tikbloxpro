import { TrendingProduct, ProductNiche } from '../../types';
import { techTrends } from './tech';
import { homeTrends } from './home';
import { beautyTrends } from './beauty';
import { fitnessTrends } from './fitness';
import { petTrends } from './pets';
import { accessoriesTrends } from './accessories';
import { kidsTrends } from './kids';
import { toolsTrends } from './tools';
import { autoTrends } from './auto';
import { healthTrends } from './health';
import { gamingTrends } from './gaming';
import { officeTrends } from './office';
import { outdoorTrends } from './outdoor';
import { travelTrends } from './travel';

export {
  techTrends,
  homeTrends,
  beautyTrends,
  fitnessTrends,
  petTrends,
  accessoriesTrends,
  kidsTrends,
  toolsTrends,
  autoTrends,
  healthTrends,
  gamingTrends,
  officeTrends,
  outdoorTrends,
  travelTrends
};

export const NICHE_TRENDS_MAP: Record<Exclude<ProductNiche, 'all'>, TrendingProduct[]> = {
  tech: techTrends,
  home: homeTrends,
  beauty: beautyTrends,
  fitness: fitnessTrends,
  pets: petTrends,
  accessories: accessoriesTrends,
  kids: kidsTrends,
  tools: toolsTrends,
  auto: autoTrends,
  health: healthTrends,
  gaming: gamingTrends,
  office: officeTrends,
  outdoor: outdoorTrends,
  travel: travelTrends,
};

// All curated trends across all niches
export const ALL_NICHE_TRENDS: TrendingProduct[] = [
  ...techTrends,
  ...homeTrends,
  ...beautyTrends,
  ...fitnessTrends,
  ...petTrends,
  ...accessoriesTrends,
  ...kidsTrends,
  ...toolsTrends,
  ...autoTrends,
  ...healthTrends,
  ...gamingTrends,
  ...officeTrends,
  ...outdoorTrends,
  ...travelTrends,
];

export function getNicheProducts(niche?: string): TrendingProduct[] {
  if (!niche || niche === 'all') {
    return ALL_NICHE_TRENDS;
  }
  const key = niche as Exclude<ProductNiche, 'all'>;
  return NICHE_TRENDS_MAP[key] || ALL_NICHE_TRENDS;
}
