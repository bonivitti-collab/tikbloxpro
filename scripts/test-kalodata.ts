import { passesBusinessRules } from '../src/lib/productRules.ts';
import { liveRowToProduct } from '../lib/liveCatalog.ts';
import { rowsVisibleTo } from '../lib/catalog.ts';
import { canSeeKalodata } from '../lib/kalodataAccess.ts';
import {
  collectKalodata,
  commissionBrlFromRate,
  mapKalodataProduct,
  readKalodataBalance,
  tiktokProductUrl,
} from '../lib/kalodata.ts';
import { canSpend, planKalodataSpend, rankCreditCost } from '../lib/kalodataPlan.ts';

let failed = 0;
function assert(condition: unknown, message: string): void {
  if (!condition) {
    failed += 1;
    console.error('FALHOU:', message);
  } else {
    console.log('ok:', message);
  }
}

const full = planKalodataSpend(1);
assert(full.productPages === 5 && full.creatorPages === 1 && full.creatorProductLookups === 4, '1 crédito cobre 500 produtos, 100 criadores e 4 listas');
assert(full.estimatedCredits === 1, 'o plano de 1 crédito não passa de 1');
const thin = planKalodataSpend(0.3);
assert(thin.productPages === 2 && thin.creatorPages === 1 && thin.creatorProductLookups === 0, '0,30 crédito prioriza ranking e não estoura');
assert(planKalodataSpend(0.05).estimatedCredits === 0, 'saldo menor que uma página não gasta');
assert(rankCreditCost(0) === 0 && rankCreditCost(100) === 0.1 && rankCreditCost(101) === 0.2, 'rank cobra 0,1 a cada 100 linhas, arredondando para cima');
assert(canSpend(0.9, 1, 1, 0.1) && !canSpend(1, 5, 1, 0.1) && !canSpend(0, 0.05, 1, 0.1), 'para antes de passar do teto ou do saldo');

assert(commissionBrlFromRate(80, 15) === 12, 'comissão Kalodata é percentual sobre o preço');
assert(commissionBrlFromRate(50, null) == null, 'sem taxa a comissão fica ausente');
const mapped = mapKalodataProduct({
  product_id: '1729508370969629931',
  product_name: 'Fone bluetooth',
  unit_price: 80,
  commission_rate: 15,
  sales_volumn: '1.73',
  master_image_url: 'https://cdn.example/p.jpg',
}, 'ranking BR', '2026-11-06T12:00:00.000Z');
assert(mapped?.source === 'kalodata', 'origem kalodata');
assert(mapped?.product_url === tiktokProductUrl('1729508370969629931'), 'o clique abre o produto exato no TikTok Shop');
assert(mapped?.sold_7d === 2 && mapped?.commission_brl === 12 && mapped?.price_brl === 80, 'venda inteira e comissão em reais');
assert(!passesBusinessRules(mapped), 'sem estoque e sem vídeos o ranking não entra no radar');
const qualified = liveRowToProduct({ ...mapped!, scraped_at: mapped!.last_refreshed_at, stock_units: 500, video_count: 12 });
assert(qualified != null && passesBusinessRules(qualified), 'com estoque, vídeos e comissão de R$ 12 passa');
const cheap = liveRowToProduct({ ...mapped!, scraped_at: mapped!.last_refreshed_at, stock_units: 500, video_count: 12, commission_brl: 9 });
assert(cheap != null && !passesBusinessRules(cheap), 'comissão abaixo de R$ 10 não passa');

const previousFlag = process.env.KALODATA_PUBLIC_DISPLAY;
delete process.env.KALODATA_PUBLIC_DISPLAY;
const rows = [
  { id: 'k', source: 'kalodata' },
  { id: 'a', source: 'apify' },
] as any[];
assert(!canSeeKalodata({ email: 'cliente@exemplo.com', role: 'subscriber' }), 'assinante comum não vê Kalodata');
assert(canSeeKalodata({ email: 'contato.dudavitti@gmail.com', role: 'subscriber' }), 'a conta da Duda vê Kalodata');
assert(canSeeKalodata({ email: 'dudavitti@gmail.com', role: 'subscriber' }), 'o outro e-mail da Duda vê Kalodata');
assert(canSeeKalodata({ email: 'dono@exemplo.com', role: 'owner' }), 'o dono vê Kalodata');
assert(rowsVisibleTo(rows, { email: 'cliente@exemplo.com', role: 'subscriber' }).every((row) => row.source !== 'kalodata'), 'o catálogo do assinante tira a Kalodata');
assert(rowsVisibleTo(rows, { email: 'contato.dudavitti@gmail.com', role: 'subscriber' }).length === 2, 'a Duda recebe Kalodata e Apify');
process.env.KALODATA_PUBLIC_DISPLAY = 'true';
assert(canSeeKalodata({ email: 'cliente@exemplo.com', role: 'subscriber' }), 'flag pública libera para todo assinante');
if (previousFlag === undefined) delete process.env.KALODATA_PUBLIC_DISPLAY;
else process.env.KALODATA_PUBLIC_DISPLAY = previousFlag;

function json(body: unknown): Response {
  return new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });
}

const requested: string[] = [];
const fetchImpl: typeof fetch = async (input, init) => {
  const url = String(input);
  requested.push(`${init?.method || 'GET'} ${url}`);
  assert(url.startsWith('https://www.kalodata.com/openapi/v1'), 'host é www.kalodata.com');
  assert(!url.includes('api.kalodata.com'), 'não usa api.kalodata.com');
  const headerBag = new Headers(init?.headers);
  assert(headerBag.get('secret-key') === 'test-key', 'manda secret-key');
  if (url.endsWith('/credit/balance')) {
    assert(init?.method === 'GET', 'saldo começa em GET');
    return json({ success: true, data: { totalRemain: 1 } });
  }
  const body = JSON.parse(String(init?.body || '{}'));
  assert(body.region === 'BR' && body.currency === 'BRL' && body.language === 'pt-BR', 'região BR e moeda BRL');
  if (url.endsWith('/tiktok/creator/rank')) {
    return json({
      success: true,
      data: Array.from({ length: 4 }, (_, index) => ({
        creator_id: `creator-${index}`,
        creator_handle: `@loja${index}`,
        creator_nickname: `Loja BR ${index}`,
        creator_followers: '1.7K',
        revenue: 2000 - index,
        sales_volumn: 4.2,
        category_list: ['Beleza'],
      })),
    });
  }
  if (body.creator_id) {
    return json({
      success: true,
      data: [{
      product_id: `sold-by-${body.creator_id}`,
      product_name: 'Sérum facial',
        unit_price: 40,
        commission_rate: 25,
        sales_volumn: '1.73',
      }],
    });
  }
  const page = Number(body.page_number || 1);
  return json({
    success: true,
    data: Array.from({ length: body.page_size }, (_, index) => ({
      product_id: String(page * 1000 + index),
      product_name: 'Fone bluetooth',
      unit_price: 80,
      commission_rate: 15,
      sales_volumn: 12,
    })),
  });
};

const balance = await readKalodataBalance('test-key', fetchImpl);
assert(balance === 1, 'saldo totalRemain');
const collected = await collectKalodata({ apiKey: 'test-key', balance: 1, fetchImpl, maxCredits: 1 });
const paid = requested.filter((line) => line.includes('/tiktok/'));
assert(paid.length === 10, `gasta 10 chamadas pagas, veio ${paid.length}`);
assert(collected.spent === 1 && collected.products.length === 504, '500 do ranking mais 4 produtos de criadores');
assert(collected.creators[0]?.followers === 1700 && collected.creators[0]?.productIds.length === 1, 'criador com seguidores inteiros e o produto que vende');
assert(collected.products.some((product) => product.id === 'sold-by-creator-0' && product.sold_7d === 2 && product.product_url.includes('/view/product/sold-by-creator-0')), 'produto do criador abre no link exato');

let blocked = 0;
const blockingFetch: typeof fetch = async (input, init) => {
  const url = String(input);
  if (url.includes('/tiktok/')) blocked += 1;
  return json({ success: true, data: { totalRemain: 0.05 } });
};
const stopped = await collectKalodata({ apiKey: 'test-key', balance: 0.05, fetchImpl: blockingFetch, maxCredits: 1 });
assert(stopped.calls === 0 && stopped.products.length === 0 && blocked === 0, 'saldo de 0,05 não dispara ranking');

if (failed > 0) {
  console.error(`\n${failed} verificação(ões) falharam`);
  process.exit(1);
}
console.log('\nKalodata confere.');
