import { TrendingProduct, ProductNiche } from '../../types.js';
import { techTrends } from './tech.js';
import { homeTrends } from './home.js';
import { beautyTrends } from './beauty.js';
import { fitnessTrends } from './fitness.js';
import { petTrends } from './pets.js';
import { accessoriesTrends } from './accessories.js';
import { kidsTrends } from './kids.js';
import { toolsTrends } from './tools.js';
import { autoTrends } from './auto.js';
import { healthTrends } from './health.js';
import { gamingTrends } from './gaming.js';
import { officeTrends } from './office.js';
import { outdoorTrends } from './outdoor.js';
import { travelTrends } from './travel.js';

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
