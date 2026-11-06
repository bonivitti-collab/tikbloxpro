import { momentumTag, signalsForProducts, videoUrlFromKalodata } from '../lib/creatorSignal.ts';

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

if (failed > 0) {
  console.error(`\n${failed} verificação(ões) falharam`);
  process.exit(1);
}
console.log('\nSinal de criadores confere.');
