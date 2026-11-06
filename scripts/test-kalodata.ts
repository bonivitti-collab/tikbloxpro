import { keepLiveProduct, passesBusinessRules } from '../src/lib/productRules.ts';
import { scrapedProductRecord } from '../lib/productsStore.ts';
import { liveRowToProduct } from '../lib/liveCatalog.ts';
import { rowsVisibleTo } from '../lib/catalog.ts';
import { canSeeKalodata } from '../lib/kalodataAccess.ts';
import {
  collectKalodata,
  commissionBrlFromRate,
  kalodataPriceFields,
  mapKalodataProduct,
  readKalodataBalance,
  tiktokProductUrl,
} from '../lib/kalodata.ts';
import { productUpsertPayload } from '../lib/productsStore.ts';
import { formatCommissionBand, formatPriceBand, mergePriceHistory, roundMoney } from '../src/lib/priceRange.ts';
import { canSpend, planKalodataSpend, rankCreditCost } from '../lib/kalodataPlan.ts';
import { isBlueOceanOpportunity } from '../src/lib/blueOcean.ts';

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
assert(full.productPages === 5 && full.creatorPages === 1 && full.detailCalls === 4 && full.creatorProductLookups === 0, '1 crédito cobre 500 produtos, 100 criadores e 4 fichas');
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
assert(mapped?.price_estimated === true && mapped?.price_min === 68 && mapped?.price_max === 92, 'um preço só vira faixa de ±15%');
const ranged = mapKalodataProduct({
  product_id: 'lark',
  product_name: 'Hollyland Lark A1',
  unit_price: 304.49,
  min_price: 299.13,
  max_price: 349.9,
  avg_price: 310,
  commission_rate: 15,
}, 'ranking BR', '2026-11-06T12:00:00.000Z');
assert(ranged?.price_estimated === false && ranged?.price_min === 299.13 && ranged?.price_max === 349.9 && ranged?.price_avg === 310, 'mínimo, máximo e média da Kalodata');
assert(ranged?.price_brl === 304.49 && ranged?.commission_brl === roundMoney(304.49 * 0.15), 'a comissão de referência continua no preço unitário');
const aliased = kalodataPriceFields({
  minimum_price: 20,
  maximum_price: 28,
  average_price: 24,
  commission_rate: 10,
});
assert(aliased?.price_estimated === false && aliased?.price_min === 20 && aliased?.price_max === 28 && aliased?.price_avg === 24, 'ficha também aceita minimum, maximum e average price');
const history = kalodataPriceFields({ unit_price: 100, price_history: [90, 110] });
assert(history?.price_estimated === false && history?.price_min === 90 && history?.price_max === 110, 'histórico de preço entra na faixa');
const dayOne = mapKalodataProduct({ product_id: 'lark', product_name: 'Hollyland Lark A1', unit_price: 100, commission_rate: 15 }, 'ranking BR', '2026-11-06T12:00:00.000Z')!;
const dayTwo = mapKalodataProduct({ product_id: 'lark', product_name: 'Hollyland Lark A1', unit_price: 90, commission_rate: 15 }, 'ranking BR', '2026-11-07T12:00:00.000Z')!;
const widened = productUpsertPayload([dayTwo], [{ ...dayOne, scraped_at: dayOne.last_refreshed_at }])[0];
assert(widened.price_estimated === true && widened.price_min === 76.5 && widened.price_max === 115, 'o mínimo e o máximo históricos não encolhem');
const realLater = mergePriceHistory(dayOne, kalodataPriceFields({ min_price: 70, max_price: 90, avg_price: 80, commission_rate: 15 })!);
assert(realLater.price_estimated === false && realLater.price_min === 70 && realLater.price_max === 100, 'faixa real substitui o ±15% e guarda o preço já visto');
const shown = { priceMin: ranged?.price_min, priceMax: ranged?.price_max, priceAvg: ranged?.price_avg, priceEstimated: false, commissionRate: 15, estimatedPriceBRL: 304.49 };
assert(formatPriceBand({ min: 299.13, max: 349.9, avg: 310, estimated: false }).startsWith('Faixa de preço:'), 'a faixa não é um preço único');
assert(formatCommissionBand({ min: roundMoney(299.13 * 0.15), max: roundMoney(349.9 * 0.15), rate: 15 }).includes('(15%)'), 'comissão em faixa com a taxa');
assert(shown.priceMin === 299.13, 'o card usa o mínimo observado');
assert(!passesBusinessRules(mapped), 'regra estrita da Apify continua exigindo estoque e vídeos');
const visible = liveRowToProduct({ ...mapped!, scraped_at: mapped!.last_refreshed_at });
assert(visible?.countsUnknown === true && keepLiveProduct(visible), 'Kalodata sem estoque/vídeos entra no radar se a comissão passa de R$ 10');
assert(visible?.tradeConviction?.convictionScore == null, 'sem vídeos medidos não há score');
assert(isBlueOceanOpportunity(visible), 'score nulo permanece no radar');
assert(!isBlueOceanOpportunity({
  waveStage: 'early_wave',
  tradeConviction: { convictionScore: 40, creatorVideoCountBR: 12, verdict: 'ENTRADA_MODERADA' },
}), 'score medido abaixo de 80 continua fora');
const qualified = liveRowToProduct({ ...mapped!, scraped_at: mapped!.last_refreshed_at, stock_units: 500, video_count: 12 });
assert(qualified != null && keepLiveProduct(qualified) && qualified.countsUnknown === false, 'com estoque, vídeos e comissão de R$ 12 passa sem aviso');
assert(qualified?.tradeConviction?.convictionScore === 83, 'score é 95 menos os vídeos medidos');
const cheap = liveRowToProduct({ ...mapped!, scraped_at: mapped!.last_refreshed_at, commission_brl: 9 });
assert(cheap != null && !keepLiveProduct(cheap), 'comissão abaixo de R$ 10 não passa');
const saturated = liveRowToProduct({ ...mapped!, scraped_at: mapped!.last_refreshed_at, video_count: 50, stock_units: 800 });
assert(saturated != null && !keepLiveProduct(saturated), '50 vídeos continuam fora');
assert(scrapedProductRecord(mapped!).source === 'kalodata', 'upsert grava a origem kalodata');
assert(scrapedProductRecord({ ...mapped!, source: undefined as unknown as 'apify' }).source === 'apify', 'sem origem o upsert continua apify');

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
  if (url.endsWith('/tiktok/product/detail')) {
    return json({
      success: true,
      data: { product_id: body.product_id, video_number: 8, unit_price: 80, min_price: 70, max_price: 90, avg_price: 82, commission_rate: 15 },
    });
  }
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
assert(collected.spent === 1 && collected.products.length === 500, '500 produtos do ranking, sem estourar o crédito');
assert(collected.creators[0]?.followers === 1700, 'criador com seguidores inteiros');
const enriched = ['1000', '1001', '1002', '1003'].map((id) => collected.products.find((product) => product.id === id));
assert(enriched.every((product) => product?.video_count === 8 && product?.stock_units == null), 'as 4 fichas preenchem vídeos e deixam estoque ausente');
assert(enriched.every((product) => product?.price_estimated === false && product?.price_min === 70 && product?.price_max === 90), 'a ficha troca o ±15% pela faixa real');
assert(collected.products.find((product) => product.id === '1004')?.video_count == null, 'o quinto produto não gasta ficha');

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
