import { enrichWithTikTokShopData } from '../src/data/tiktokShopEnricher.ts';
import { commissionBrlOf, formatCollectedAt, passesBusinessRules } from '../src/lib/productRules.ts';
import { parseApifyProduct, priceFromItem, stockFromItem } from '../lib/apifyShop.ts';
import {
  assignNiche,
  mergeLiveAndCurated,
  planIngestCalls,
  resolveChargeUsd,
  resolveResultBudget,
  splitIngestBudget,
} from '../lib/ingestPlan.ts';
import { liveRowToProduct } from '../lib/liveCatalog.ts';

let failed = 0;
function assert(condition: unknown, message: string): void {
  if (!condition) {
    failed += 1;
    console.error('FALHOU:', message);
  } else {
    console.log('ok:', message);
  }
}

assert(resolveResultBudget(undefined) === 10, 'sem APIFY_MAX_RESULTS o teto diário é 10');
assert(resolveResultBudget('10') === 10, '10 resultados por execução');
assert(resolveResultBudget('500') === 120, 'teto duro de 120 resultados');
assert(resolveResultBudget('0') === 10, 'zero inválido volta para 10');
assert(resolveChargeUsd(undefined) === 0.2, 'cobrança padrão cabe no plano grátis');
assert(resolveChargeUsd('9') === 0.5, 'cobrança por execução não passa de US$ 0,50');

assert(splitIngestBudget(10, 0).fresh === 10, 'tabela vazia gasta o dia em produtos novos');
const growing = splitIngestBudget(10, 40);
assert(growing.refresh === 7 && growing.fresh === 3, 'abaixo de 100: 7 atualizações e 3 novos');
const full = splitIngestBudget(10, 100);
assert(full.refresh === 9 && full.fresh === 1, 'com 100 produtos a execução quase só atualiza');

const calls = planIngestCalls({
  budget: 10,
  dayIndex: 2,
  products: [
    { id: 'novo', keyword: 'fone bluetooth', lastRefreshedAt: '2026-11-06T12:00:00.000Z' },
    { id: 'velho', keyword: 'serum facial', lastRefreshedAt: '2026-11-01T12:00:00.000Z' },
  ],
});
assert(calls[0]?.purpose === 'refresh' && calls[0].keyword === 'serum facial' && calls[0].limit === 7, 'atualiza a busca do produto mais antigo');
assert(calls[1]?.purpose === 'discover' && calls[1].limit === 3 && calls[1].keyword !== 'serum facial', 'sobra uma busca nova diferente da atualização');

assert(assignNiche('fone bluetooth', 'Comedouro automático para gato') === 'pets', 'o título manda no nicho quando a palavra é clara');
assert(assignNiche('serum facial', 'Sérum hidratante') === 'beauty', 'sem pista melhor, vale a palavra da busca');

const item = {
  product_id: '1730123',
  product_title: 'Comedouro lento para gato',
  real_price: 'R$ 39,90',
  total_sale_7d_cnt: '12',
  total_sale_30d_cnt: '80',
  videos_count: '9',
  influencers_count: '4',
  skus: {
    a: { stock: 300, real_price: { currency: 'BRL', price_val: '20' } },
    b: { stock: 250, real_price: { currency: 'BRL', price_val: '19.5' } },
  },
};
assert(stockFromItem(item) === 550, 'estoque soma os SKUs');
assert(priceFromItem(item) === 20, 'preço em BRL sai do SKU');
const parsed = parseApifyProduct(item, 'fone bluetooth', '2026-11-06T15:00:00.000Z');
assert(parsed?.niche === 'pets', 'nicho do item vem do título');
assert(parsed?.product_url.includes('1730123'), 'link do produto usa o id');
assert(parsed?.commission_brl == null, 'comissão ausente continua nula');
assert(parsed?.sold_7d === 12 && parsed?.video_count === 9, 'vendas e vídeos numéricos');

const row = {
  ...parsed!,
  scraped_at: '2026-11-01T15:00:00.000Z',
  price_brl: 39.9,
  stock_units: 550,
  video_count: 9,
  commission_brl: null,
};
const live = liveRowToProduct(row);
assert(live?.dataSource === 'live', 'linha completa vira produto ao vivo');
assert(live?.productUrl?.includes('1730123'), 'productUrl preenchido');
assert(formatCollectedAt(live?.collectedAt) === '06/11/2026', 'data da coleta em São Paulo');
assert(commissionBrlOf(live) == null, 'enriquecer não inventa comissão');
assert(passesBusinessRules(live), 'estoque, vídeos e comissão desconhecida passam');
assert(liveRowToProduct({ ...row, stock_units: null }) == null, 'sem estoque não entra como ao vivo');

const curated = [
  enrichWithTikTokShopData({ id: 'tb-home-001', name: 'Curado', dataSource: 'curated', niche: 'home' }),
  enrichWithTikTokShopData({ id: '1730123', name: 'Duplicado', dataSource: 'curated', niche: 'pets' }),
];
const mixed = mergeLiveAndCurated([live!], curated);
assert(mixed[0].id === '1730123' && mixed[0].dataSource === 'live', 'ao vivo vem primeiro');
assert(mixed.some((product) => product.id === 'tb-home-001'), 'o curado completa a lista');
assert(mixed.filter((product) => product.id === '1730123').length === 1, 'id ao vivo não repete o curado');
const many = Array.from({ length: 100 }, (_, index) => ({ id: `live-${index}` }));
assert(mergeLiveAndCurated(many, curated).length === 100, 'com 100 ao vivo o curado sai');

if (failed > 0) {
  console.error(`\n${failed} verificação(ões) falharam`);
  process.exit(1);
}
console.log('\nColeta e catálogo conferem.');
