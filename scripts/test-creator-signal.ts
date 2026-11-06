import { momentumTag, signalsForProducts, videoUrlFromKalodata } from '../lib/creatorSignal.ts';
import { buildRadarSnapshot } from '../lib/radarBoard.ts';
import { SHOP_NICHES, shopNicheFromText } from '../lib/shopNiches.ts';

let failed = 0;
function assert(condition: unknown, message: string): void {
  if (!condition) {
    failed += 1;
    console.error('FALHOU:', message);
  } else {
    console.log('ok:', message);
  }
}

const now = new Date('2026-11-06T12:00:00.000Z');
const day = 86_400_000;
const iso = (offsetDays: number) => new Date(now.getTime() - offsetDays * day).toISOString();

assert(momentumTag(2, 0) === 'Novo', 'primeira semana com creators é Novo');
assert(momentumTag(3, 1) === 'Subindo', 'mais creators que a semana anterior é Subindo');
assert(momentumTag(1, 4) === 'Esfriando', 'menos creators que a semana anterior é Esfriando');
assert(momentumTag(0, 0) === null, 'sem movimento não ganha etiqueta');

const signals = signalsForProducts([
  { creatorId: 'a', productId: 'p1', firstSeenAt: iso(1), videoUrl: 'https://www.tiktok.com/@a/video/1' },
  { creatorId: 'b', productId: 'p1', firstSeenAt: iso(2) },
  { creatorId: 'c', productId: 'p2', firstSeenAt: iso(10) },
  { creatorId: 'c', productId: 'p2', firstSeenAt: iso(10) },
  { creatorId: 'd', productId: 'quiet', firstSeenAt: iso(40) },
], now);
const hot = signals.find((signal) => signal.productId === 'p1');
const cooling = signals.find((signal) => signal.productId === 'p2');
assert(hot?.starters7d === 2 && hot.tag === 'Novo' && hot.videoUrls.length === 1, 'dois creators distintos nos últimos 7 dias');
assert(cooling?.starters7d === 0 && cooling.startersPrev7d === 1 && cooling.tag === 'Esfriando', 'semana anterior conta como esfriando');
assert(!signals.some((signal) => signal.productId === 'quiet'), 'promoção antiga demais fica de fora');
assert(videoUrlFromKalodata({ video_id: '99', creator_handle: '@loja' }) === 'https://www.tiktok.com/@loja/video/99', 'vídeo só quando o id veio da Kalodata');
assert(videoUrlFromKalodata({}) === null, 'sem campo de vídeo não inventa link');
assert(SHOP_NICHES.length >= 10 && SHOP_NICHES.length <= 14, 'há entre 10 e 14 nichos de entrada');
assert(shopNicheFromText('Utensílios de Cozinha', 'Jogo de panelas') === 'cozinha', 'categoria de cozinha da Kalodata');
assert(shopNicheFromText('Beleza e Cuidados Pessoais', 'Sérum') === 'beleza', 'categoria de beleza da Kalodata');
assert(shopNicheFromText('Womenswear & Underwear', 'Vestido') === 'moda-feminina', 'moda feminina em inglês');
assert(shopNicheFromText('Menswear', 'Camiseta') === 'moda-masculina', 'moda masculina');
assert(shopNicheFromText('Phones & Electronics', 'Fone bluetooth') === 'eletronicos', 'eletrônicos');
assert(shopNicheFromText('Jewelry Accessories & Derivatives', 'Colar') === 'acessorios', 'joias e acessórios');
assert(shopNicheFromText('Mother & Baby', 'Carrinho') === 'infantil', 'infantil e bebê');
assert(shopNicheFromText('Pet Supplies', 'Comedouro') === 'pets', 'pets');
assert(shopNicheFromText('Automotive & Motorcycle', 'Capacete') === 'automotivo', 'automotivo');
assert(shopNicheFromText('Sports & Outdoor', 'Legging') === 'fitness', 'fitness e esportes');
assert(shopNicheFromText('Health', 'Magnésio') === 'saude', 'saúde');
assert(shopNicheFromText('Home Supplies', 'Lençol') === 'casa', 'casa');
assert(shopNicheFromText('Stationery, Hobbies & DIY', 'Caderno') === 'papelaria', 'papelaria e hobbies');
assert(shopNicheFromText('ranking BR', 'Produto sem pista') === null, 'sem categoria conhecida não cai num nicho');
assert(shopNicheFromText('home', 'Escova com aquecimento PTC') === null, 'nicho antigo e a palavra men dentro de aquecimento não viram moda');
assert(shopNicheFromText('', 'Jogo de panelas antiaderente') === 'cozinha', 'título de panela cai em cozinha');
assert(shopNicheFromText('', 'Kit capilar liso profissional') === 'beleza', 'capilar não cai em pets');
assert(shopNicheFromText('', 'Relógio inteligente com chamada') === 'eletronicos', 'relógio inteligente não cai em acessórios');
assert(shopNicheFromText('', 'Capacete Moto ASX masculino') === 'automotivo', 'capacete masculino continua automotivo');
assert(shopNicheFromText('', 'Supercoffee Língua de Gato') === null, 'sabor língua de gato não vira pet');
assert(shopNicheFromText('', 'Torneira Cozinha Gourmet') === 'cozinha', 'torneira de cozinha cai em cozinha');

const board = buildRadarSnapshot({
  now,
  sightings: [
    { creatorId: 'g', productId: 'panela', firstSeenAt: iso(1) },
    { creatorId: 'r', productId: 'bike', firstSeenAt: iso(1) },
    { creatorId: 'z', productId: 'furadeira', firstSeenAt: iso(1) },
  ],
  creators: [
    { id: 'g', handle: 'garcia', nickname: 'Garcia', followers: 10 },
    { id: 'r', handle: 'rony', nickname: 'Rony', followers: 10 },
    { id: 'z', handle: 'ze', nickname: 'Zé', followers: 10 },
  ],
  products: [
    { id: 'panela', title: 'Jogo de panelas', niche: 'home', keyword: 'ranking BR', product_url: 'https://www.tiktok.com/view/product/1', cover_url: null, commission_brl: 10, commission_rate: 5, price_min: 80, price_max: 120 },
    { id: 'bike', title: 'Bicicleta spinning', niche: 'home', keyword: 'ranking BR', product_url: 'https://www.tiktok.com/view/product/2', cover_url: null, commission_brl: 20, commission_rate: 8, price_min: 300, price_max: 400 },
    { id: 'furadeira', title: 'Furadeira 48V', niche: 'tools', keyword: 'ranking BR', product_url: 'https://www.tiktok.com/view/product/3', cover_url: null, commission_brl: 5, commission_rate: 5, price_min: 60, price_max: 90 },
  ],
});
assert(board.niches.map((niche) => niche.id).sort().join(',') === 'cozinha,fitness', 'nichos sem produto ficam escondidos');
assert(board.products.every((product) => product.niche !== 'home'), 'o balde antigo home não aparece no radar');

if (failed > 0) {
  console.error(`\n${failed} verificação(ões) falharam`);
  process.exit(1);
}
console.log('\nSinal de criadores confere.');
