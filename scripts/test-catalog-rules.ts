import { ALL_NICHE_TRENDS } from '../src/data/niches/index.ts';
import { NICHE_TAXONOMY, MIN_PRODUCTS_PER_NICHE, nicheById } from '../src/data/taxonomy.ts';
import {
  matchScore,
  normalizePt,
  passesBusinessRules,
} from '../src/lib/productRules.ts';

let failed = 0;
function assert(condition: unknown, message: string): void {
  if (!condition) {
    failed += 1;
    console.error('FALHOU:', message);
  } else {
    console.log('ok:', message);
  }
}

assert(normalizePt('Ação São') === 'acao sao', 'normalizePt tira acento e caixa');
assert(normalizePt('  Café  ') === 'cafe', 'normalizePt normaliza café');

const qualified = {
  name: 'Tigela giratória',
  originalName: 'Gyro Bowl',
  niche: 'kids',
  nicheLabel: 'Kids & Bebês',
  supplierKeywords: ['bowl'],
  stockUnits: 500,
  videoCountBR: 12,
  estimatedPriceBRL: 49.9,
  commissionPercent: 25,
};
assert(passesBusinessRules(qualified), 'estoque 500, 12 vídeos e comissão >= 10 passa');
assert(!passesBusinessRules({ ...qualified, stockUnits: 499 }), 'estoque 499 não passa');
assert(!passesBusinessRules({ ...qualified, videoCountBR: 50 }), '50 vídeos não passa');
assert(!passesBusinessRules({ ...qualified, stockUnits: undefined, videoCountBR: undefined }), 'sem estoque e sem vídeos não passa');
assert(!passesBusinessRules({ ...qualified, estimatedPriceBRL: 20, commissionPercent: 10, tiktokShop: undefined, commissionEstimatedBRL: undefined }), 'comissão abaixo de R$ 10 não passa');

const titleHit = matchScore({ name: 'Mini ferro de viagem', originalName: 'travel steamer', niche: 'travel', nicheLabel: 'Viagem', supplierKeywords: ['ferro'] }, 'ferro viagem');
const nicheOnly = matchScore({ name: 'Outro item', originalName: 'other', niche: 'travel', nicheLabel: 'Viagem e ferro', supplierKeywords: [] }, 'ferro viagem');
assert(titleHit > nicheOnly && titleHit > 0, 'título pontua mais que nicho');
assert(matchScore({ name: 'Copo', originalName: 'cup', niche: 'home', nicheLabel: 'Casa', supplierKeywords: [] }, 'ferro') === 0, 'token ausente não casa');

const steamer = ALL_NICHE_TRENDS.find((product) => product.id === 'tb-acc-023');
assert(steamer?.niche === 'travel', 'tb-acc-023 está em viagem, não em acessórios');
assert(Boolean(nicheById('health')), 'taxonomia inclui saúde');

const counts: Record<string, number> = {};
for (const product of ALL_NICHE_TRENDS) {
  counts[product.niche] = (counts[product.niche] || 0) + 1;
  assert(Boolean(nicheById(product.niche)), `nicho conhecido: ${product.id} ${product.niche}`);
}
for (const niche of NICHE_TAXONOMY) {
  assert((counts[niche.id] || 0) >= MIN_PRODUCTS_PER_NICHE, `${niche.id} tem pelo menos ${MIN_PRODUCTS_PER_NICHE} itens`);
}

if (failed > 0) {
  console.error(`\n${failed} verificação(ões) falharam`);
  process.exit(1);
}
console.log('\nRegras de catálogo e nichos conferem.');
