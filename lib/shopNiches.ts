import { normalizePt } from '../src/lib/productRules.js';

/**
 * Nichos de entrada. Os nomes batem com as categorias do TikTok Shop BR
 * que a Kalodata devolve em pri_category / ter_category / category_name
 * (português e inglês).
 */
export const SHOP_NICHES = [
  { id: 'casa', label: 'Casa', icon: '🏠' },
  { id: 'cozinha', label: 'Cozinha', icon: '🍳' },
  { id: 'beleza', label: 'Beleza', icon: '✨' },
  { id: 'moda-feminina', label: 'Moda Feminina', icon: '👗' },
  { id: 'moda-masculina', label: 'Moda Masculina', icon: '👕' },
  { id: 'acessorios', label: 'Acessórios e Joias', icon: '💍' },
  { id: 'eletronicos', label: 'Eletrônicos e Celular', icon: '📱' },
  { id: 'saude', label: 'Saúde e Bem-estar', icon: '🩺' },
  { id: 'fitness', label: 'Fitness e Esportes', icon: '🏃' },
  { id: 'infantil', label: 'Infantil e Bebê', icon: '👶' },
  { id: 'pets', label: 'Pets', icon: '🐾' },
  { id: 'automotivo', label: 'Automotivo', icon: '🚗' },
  { id: 'papelaria', label: 'Papelaria e Hobbies', icon: '🎨' },
] as const;

export type ShopNicheId = (typeof SHOP_NICHES)[number]['id'];

const RULES: Array<{ id: ShopNicheId; category: string[]; title: string[] }> = [
  { id: 'cozinha', category: ['cozinha', 'kitchen', 'cookware', 'utensilio'], title: ['panela', 'frigideira', 'air fryer', 'airfryer', 'liquidificador', 'micro-ondas', 'microondas', 'cooktop', 'forno eletrico', 'marmita', 'cozinha'] },
  { id: 'beleza', category: ['beleza', 'beauty', 'skincare', 'maquiagem', 'personal care'], title: ['serum', 'protetor solar', 'depil', 'perfume', 'capilar', 'cabelo', 'batom', 'blush', 'skincare', 'locao', 'creme'] },
  { id: 'moda-feminina', category: ['moda feminina', 'roupa feminina', 'womenswear', 'women'], title: ['feminina', 'feminino', 'vestido', 'legging', 'biquini', 'sutia', 'calcinha', 'pantalona'] },
  { id: 'moda-masculina', category: ['moda masculina', 'roupa masculina', 'menswear'], title: ['masculina', 'masculino', 'cueca'] },
  { id: 'acessorios', category: ['joia', 'jewelry', 'acessorio', 'accessories'], title: ['bolsa', 'colar', 'brinco', 'anel', 'relogio', 'oculos'] },
  { id: 'eletronicos', category: ['eletronico', 'electronics', 'phones', 'celular'], title: ['celular', 'smartphone', 'fone', 'fones', 'bluetooth', 'smart tv', 'smartwatch', 'tablet', 'projetor', 'relogio inteligente'] },
  { id: 'saude', category: ['saude', 'health', 'bem-estar', 'wellness'], title: ['suplemento', 'vitamina', 'magnesio', 'whey', 'creatina', 'colageno'] },
  { id: 'fitness', category: ['fitness', 'esporte', 'esportes', 'sport', 'sports', 'outdoor'], title: ['fitness', 'spinning', 'halter', 'academia', 'ergometrica', 'bicicleta'] },
  { id: 'infantil', category: ['infantil', 'bebe', 'baby', 'maternidade', 'maternity', 'kids', 'toy'], title: ['bebe', 'infantil', 'berco', 'brinquedo', 'carrinho'] },
  { id: 'pets', category: ['pet', 'pets', 'animal'], title: ['pet', 'comedouro', 'areia para gato', 'racao'] },
  { id: 'automotivo', category: ['automotivo', 'automotive', 'motorcycle', 'veicular'], title: ['capacete', 'moto', 'automotivo', 'parabrisa', 'multimidia'] },
  { id: 'papelaria', category: ['papelaria', 'stationery', 'hobby', 'hobbies', 'diy'], title: ['caderno', 'papelaria', 'filamento', 'caneta'] },
  { id: 'casa', category: ['casa', 'home', 'jardim', 'garden', 'furniture', 'moveis'], title: ['lencol', 'travesseiro', 'ventilador', 'aspirador', 'sofa', 'tapete', 'cortina', 'cadeira'] },
];

function containsTerm(text: string, term: string): boolean {
  const needle = normalizePt(term);
  if (!needle) return false;
  if (needle.includes(' ')) return text.includes(needle);
  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(?:^|[^a-z0-9])${escaped}s?(?:[^a-z0-9]|$)`).test(text);
}

export function shopNicheById(id: string) {
  return SHOP_NICHES.find((niche) => niche.id === id);
}

/** Categoria da Kalodata tem prioridade. Título desempata. Sem pista, não inventa nicho. */
export function shopNicheFromText(category: string, title: string): ShopNicheId | null {
  const categoryNorm = normalizePt(category);
  const titleNorm = normalizePt(title);
  const ignore = new Set(['', 'ranking br', 'home', 'beauty', 'tech', 'fitness', 'pets', 'kids', 'auto', 'accessories', 'health', 'office', 'gaming', 'travel', 'tools', 'outdoor']);
  for (const rule of RULES) {
    if (!ignore.has(categoryNorm) && rule.category.some((word) => containsTerm(categoryNorm, word))) return rule.id;
  }
  const gender = new Set(['feminina', 'feminino', 'masculina', 'masculino']);
  const titleTerms = RULES.flatMap((rule) => rule.title.map((term) => ({ id: rule.id, term })));
  const ordered = [
    ...titleTerms.filter((entry) => !gender.has(normalizePt(entry.term))),
    ...titleTerms.filter((entry) => gender.has(normalizePt(entry.term))),
  ].sort((a, b) => {
    const genderDelta = Number(gender.has(normalizePt(a.term))) - Number(gender.has(normalizePt(b.term)));
    if (genderDelta !== 0) return genderDelta;
    return normalizePt(b.term).length - normalizePt(a.term).length;
  });
  for (const entry of ordered) {
    if (containsTerm(titleNorm, entry.term)) return entry.id;
  }
  return null;
}

export function kalodataCategoryName(item: any): string {
  return String(
    item?.ter_category?.category_name ||
      item?.sec_category?.category_name ||
      item?.pri_category?.category_name ||
      item?.category_name ||
      '',
  ).trim();
}
