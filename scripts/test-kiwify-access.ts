/**
 * Simula o webhook da Kiwify (pago e reembolso) e o login que depende dele.
 * Não chama a rede nem o Supabase: usa a store em memória.
 */
process.env.TIKBLOX_SUBSCRIBER_STORE = 'memory';
process.env.TIKBLOX_AUTH_SECRET = 'test-secret-test-secret-test-secret-32';
process.env.KIWIFY_WEBHOOK_TOKEN = 'kiwify-token-de-teste';
process.env.TIKBLOX_ADMIN_EMAIL = 'owner@example.com';
process.env.TIKBLOX_ADMIN_PASSWORD = 'owner-pass-123';
process.env.TIKBLOX_ADMIN_NAME = 'Dono';
process.env.KIWIFY_LATE_GRACE_HOURS = '48';
delete process.env.SUPABASE_URL;
delete process.env.SUPABASE_SERVICE_ROLE_KEY;
delete process.env.VERCEL;

const { kiwifySignature } = await import('../lib/kiwify');
const { resetMemorySubscribers, getSubscriber, saveSubscriber } = await import('../lib/subscribers');
const { resetMemoryRateLimit } = await import('../lib/rateLimit');
const webhook = (await import('../api/webhook/kiwify')).default;
const auth = (await import('../api/auth')).default;
const catalog = (await import('../api/catalog')).default;

const OFFICIAL_BODY =
  '{"order_id":"9b1c2d3e-0000-4000-8000-000000000001","order_status":"paid","webhook_event_type":"order_approved"}';
const OFFICIAL_SIGNATURE = 'bf18f352a4f981b91dfa3f6d8742a81080ab8c86';

let failed = 0;

function assert(condition: unknown, message: string): void {
  if (!condition) {
    failed += 1;
    console.error(`FALHOU: ${message}`);
  } else {
    console.log(`ok: ${message}`);
  }
}

function mockRes() {
  return {
    statusCode: 0,
    headers: {} as Record<string, string>,
    body: null as any,
    setHeader(key: string, value: string) {
      this.headers[key.toLowerCase()] = value;
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: any) {
      this.body = payload;
      return this;
    },
    end() {
      return this;
    },
  };
}

async function postWebhook(raw: string, signature: string) {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    url: `/api/webhook/kiwify?signature=${encodeURIComponent(signature)}`,
    query: { signature },
    body: raw,
    socket: { remoteAddress: '203.0.113.10' },
  };
  const res = mockRes();
  await webhook(req, res);
  return res;
}

async function postAuth(body: Record<string, unknown>, cookie = '') {
  const req = {
    method: 'POST',
    headers: { 'content-type': 'application/json', cookie },
    body,
    socket: { remoteAddress: '203.0.113.20' },
  };
  const res = mockRes();
  await auth(req, res);
  return res;
}

function sign(raw: string): string {
  return kiwifySignature(raw, process.env.KIWIFY_WEBHOOK_TOKEN || '');
}

resetMemorySubscribers();
resetMemoryRateLimit();

assert(
  kiwifySignature(OFFICIAL_BODY, 'kiwify-token-de-teste') === OFFICIAL_SIGNATURE,
  'vetor oficial HMAC-SHA1 da Kiwify'
);

const official = await postWebhook(OFFICIAL_BODY, OFFICIAL_SIGNATURE);
assert(official.statusCode === 200 && official.body?.outcome === 'ignored', 'ping oficial sem e-mail é ignorado');

const forged = await postWebhook(OFFICIAL_BODY, '0'.repeat(40));
assert(forged.statusCode === 401, 'assinatura errada recebe 401');

const getRes = mockRes();
await webhook({ method: 'GET', headers: {}, url: '/api/webhook/kiwify', socket: {} }, getRes);
assert(getRes.statusCode === 405, 'GET no webhook responde 405');

const buyer = 'comprador@example.com';
const paidBody = JSON.stringify({
  order_id: 'order-paid-1',
  order_ref: 'PEDIDO1',
  order_status: 'paid',
  webhook_event_type: 'order_approved',
  updated_at: '2026-11-06 10:00',
  Product: { product_id: 'radar-essential', product_name: 'Radar Essential' },
  Customer: { email: buyer, full_name: 'Comprador Teste' },
});
const paid = await postWebhook(paidBody, sign(paidBody));
assert(paid.statusCode === 200 && paid.body?.outcome === 'granted', 'compra paga libera acesso');
const stored = await getSubscriber(buyer);
assert(stored?.status === 'active' && stored.plan === 'essential', 'assinante active essential gravado');

const premature = await postAuth({ action: 'login', email: 'nao-comprou@example.com', password: 'senha-forte-1' });
assert(premature.statusCode === 403, 'login sem pagamento é recusado');

const registerWithoutPay = await postAuth({
  action: 'register',
  name: 'Intruso',
  email: 'intruso@example.com',
  password: 'senha-forte-1',
  orderCode: 'PEDIDO1',
});
assert(registerWithoutPay.statusCode === 403, 'cadastro sem pagamento é recusado');

const wrongCode = await postAuth({
  action: 'register',
  name: 'Comprador Teste',
  email: buyer,
  password: 'senha-forte-1',
  orderCode: 'CODIGO-ERRADO',
});
assert(wrongCode.statusCode === 401, 'código de pedido errado não define senha');

const noPasswordYet = await postAuth({ action: 'login', email: buyer, password: 'senha-forte-1' });
assert(noPasswordYet.statusCode === 403, 'pago ainda sem senha não entra direto');

const registered = await postAuth({
  action: 'register',
  name: 'Comprador Teste',
  email: buyer,
  password: 'senha-forte-1',
  orderCode: 'PEDIDO1',
});
assert(registered.statusCode === 200 && registered.body?.session?.plan === 'essential', 'primeiro acesso define senha');
assert(
  String(registered.headers['set-cookie'] || '').includes('HttpOnly'),
  'sessão vai em cookie HttpOnly'
);
assert(!registered.body?.session?.token, 'token não volta no JSON');

const logged = await postAuth({ action: 'login', email: buyer, password: 'senha-forte-1' });
assert(logged.statusCode === 200, 'login com a senha definida funciona');
const cookie = String(logged.headers['set-cookie'] || '').split(';')[0];
const me = await postAuth({ action: 'me' }, cookie);
assert(me.statusCode === 200 && me.body?.session?.email === buyer, 'cookie de sessão é aceito em /me');

const refundBody = JSON.stringify({
  order_id: 'order-paid-1',
  order_status: 'refunded',
  webhook_event_type: 'order_refunded',
  updated_at: '2026-11-06 12:00',
  Customer: { email: buyer, full_name: 'Comprador Teste' },
});
const refund = await postWebhook(refundBody, sign(refundBody));
assert(refund.statusCode === 200 && refund.body?.outcome === 'revoked', 'reembolso revoga acesso');
const afterRefund = await getSubscriber(buyer);
assert(afterRefund?.status === 'revoked', 'status revoked persistido');

const blocked = await postAuth({ action: 'login', email: buyer, password: 'senha-forte-1' });
assert(blocked.statusCode === 403, 'login depois do reembolso é recusado');

const replay = await postWebhook(paidBody, sign(paidBody));
assert(replay.statusCode === 200 && replay.body?.outcome === 'ignored', 'replay do mesmo pedido pago não restaura');
assert((await getSubscriber(buyer))?.status === 'revoked', 'continua revogado após replay');

const repurchaseBody = JSON.stringify({
  order_id: 'order-paid-2',
  order_status: 'paid',
  webhook_event_type: 'order_approved',
  updated_at: '2026-11-06 15:00',
  Customer: { email: buyer, full_name: 'Comprador Teste' },
});
const repurchase = await postWebhook(repurchaseBody, sign(repurchaseBody));
assert(repurchase.body?.outcome === 'granted', 'nova compra depois do reembolso libera de novo');
const restored = await postAuth({ action: 'login', email: buyer, password: 'senha-forte-1' });
assert(restored.statusCode === 200, 'senha antiga continua válida na recompra');

const cancelBody = JSON.stringify({
  webhook_event_type: 'subscription_canceled',
  order_status: 'paid',
  order_id: 'order-paid-2',
  updated_at: '2026-11-06 16:00',
  Subscription: { status: 'canceled' },
  Customer: { email: buyer },
});
const canceled = await postWebhook(cancelBody, sign(cancelBody));
assert(canceled.body?.outcome === 'revoked', 'cancelamento revoga mesmo com order_status paid');

const owner = await postAuth({
  action: 'login',
  email: 'owner@example.com',
  password: 'owner-pass-123',
});
assert(owner.statusCode === 200 && owner.body?.session?.role === 'owner', 'dono entra pela senha do ambiente');

const catalogDenied = mockRes();
await catalog({ method: 'GET', headers: {}, url: '/api/catalog', socket: { remoteAddress: '203.0.113.30' } }, catalogDenied);
assert(catalogDenied.statusCode === 401, 'catálogo sem sessão responde 401');

const ownerCookie = String(owner.headers['set-cookie'] || '').split(';')[0];
const catalogOk = mockRes();
await catalog(
  { method: 'GET', headers: { cookie: ownerCookie }, url: '/api/catalog', socket: { remoteAddress: '203.0.113.30' } },
  catalogOk
);
assert(
  catalogOk.statusCode === 200 &&
    Array.isArray(catalogOk.body?.products) &&
    catalogOk.body.products.some((product: { id?: string }) => product.id === 'tb-home-001'),
  'sessão paga recebe o catálogo, inclusive tb-home-001'
);

const waitingBody = JSON.stringify({
  order_id: 'order-pix',
  order_status: 'waiting_payment',
  webhook_event_type: 'pix_created',
  Customer: { email: 'pix@example.com' },
});
const waiting = await postWebhook(waitingBody, sign(waitingBody));
assert(waiting.body?.outcome === 'ignored', 'Pix pendente não libera acesso');
assert((await getSubscriber('pix@example.com')) == null, 'e-mail do Pix não vira assinante');

const lateEmail = 'atraso@example.com';
const latePaid = JSON.stringify({
  order_id: 'order-late-1',
  order_ref: 'ATRASO1',
  order_status: 'paid',
  webhook_event_type: 'order_approved',
  updated_at: '2026-11-01 10:00',
  Customer: { email: lateEmail, full_name: 'Atraso' },
});
assert((await postWebhook(latePaid, sign(latePaid))).body?.outcome === 'granted', 'compra do teste de atraso libera');
assert(
  (await postAuth({
    action: 'register',
    name: 'Atraso',
    email: lateEmail,
    password: 'senha-forte-1',
    orderCode: 'ATRASO1',
  })).statusCode === 200,
  'código do pedido da Kiwify define a senha'
);
const lateEvent = JSON.stringify({
  order_id: 'order-late-1',
  order_status: 'paid',
  webhook_event_type: 'subscription_late',
  updated_at: new Date().toISOString(),
  Customer: { email: lateEmail },
});
assert((await postWebhook(lateEvent, sign(lateEvent))).body?.outcome === 'late', 'subscription_late entra em carência');
assert(
  (await postAuth({ action: 'login', email: lateEmail, password: 'senha-forte-1' })).statusCode === 200,
  'dentro da carência o acesso continua'
);
const lateRow = await getSubscriber(lateEmail);
assert(lateRow != null, 'assinante em atraso existe');
if (lateRow) {
  lateRow.late_since = new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString();
  await saveSubscriber(lateRow);
}
assert(
  (await postAuth({ action: 'login', email: lateEmail, password: 'senha-forte-1' })).statusCode === 403,
  'depois da carência o atraso suspende o acesso'
);

process.env.KIWIFY_LATE_GRACE_HOURS = '0';
const zeroEmail = 'zerocarencia@example.com';
const zeroPaid = JSON.stringify({
  order_id: 'order-zero-1',
  order_ref: 'ZERO123',
  order_status: 'paid',
  webhook_event_type: 'order_approved',
  updated_at: '2026-11-02 10:00',
  Customer: { email: zeroEmail, full_name: 'Zero' },
});
await postWebhook(zeroPaid, sign(zeroPaid));
await postAuth({
  action: 'register',
  name: 'Zero',
  email: zeroEmail,
  password: 'senha-forte-1',
  orderCode: 'ZERO123',
});
const zeroLate = JSON.stringify({
  order_id: 'order-zero-1',
  order_status: 'paid',
  webhook_event_type: 'subscription_late',
  updated_at: new Date().toISOString(),
  Customer: { email: zeroEmail },
});
assert((await postWebhook(zeroLate, sign(zeroLate))).body?.outcome === 'revoked', 'carência zero revoga na hora');
assert(
  (await postAuth({ action: 'login', email: zeroEmail, password: 'senha-forte-1' })).statusCode === 403,
  'carência zero impede o login'
);

if (failed > 0) {
  console.error(`\n${failed} verificação(ões) falharam`);
  process.exit(1);
}
console.log('\nWebhook paid/refund e login sem pagamento conferem.');
