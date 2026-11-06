import type { ProductNiche } from '../types';

export interface NicheDefinition {
  id: Exclude<ProductNiche, 'all'>;
  label: string;
  icon: string;
}

/** Uma única lista de nichos do radar. A UI e o lint leem daqui. */
export const NICHE_TAXONOMY: NicheDefinition[] = [
  { id: 'beauty', label: 'Beleza & Cuidados', icon: '✨' },
  { id: 'home', label: 'Casa & Cozinha', icon: '🏠' },
  { id: 'tech', label: 'Tech & Celular', icon: '📱' },
  { id: 'accessories', label: 'Bolsas & Acessórios', icon: '👜' },
  { id: 'fitness', label: 'Fitness', icon: '⚡' },
  { id: 'health', label: 'Saúde', icon: '🩺' },
  { id: 'pets', label: 'Pets & Animais', icon: '🐾' },
  { id: 'kids', label: 'Kids & Bebês', icon: '👶' },
  { id: 'tools', label: 'Ferramentas', icon: '🔧' },
  { id: 'auto', label: 'Automotivo', icon: '🚗' },
  { id: 'gaming', label: 'Games & Setup', icon: '🎮' },
  { id: 'office', label: 'Escritório', icon: '💼' },
  { id: 'outdoor', label: 'Outdoor & Camping', icon: '🏕️' },
  { id: 'travel', label: 'Viagem', icon: '✈️' },
];

export const MIN_PRODUCTS_PER_NICHE = 3;

export const ALL_CATEGORY = { id: 'all' as const, label: 'Todas as Categorias', icon: '🌐' };

export function nicheById(id: string): NicheDefinition | undefined {
  return NICHE_TAXONOMY.find((niche) => niche.id === id);
}

export function categoriesForCounts(counts: Record<string, number>): Array<{ id: ProductNiche; label: string; icon: string }> {
  const visible = NICHE_TAXONOMY.filter((niche) => (counts[niche.id] || 0) >= MIN_PRODUCTS_PER_NICHE);
  return [ALL_CATEGORY, ...visible];
}
