import {
  classifyKiwifyPayload,
  extractCustomerEmail,
  extractCustomerName,
  extractEventTime,
  extractOrderId,
  extractProductId,
  productIsAllowed,
} from './kiwify';
import { normalizeEmail } from './http';
import { getSubscriber, saveSubscriber, type Subscriber } from './subscribers';

export type AccessOutcome =
  | { outcome: 'granted'; email: string }
  | { outcome: 'revoked'; email: string }
  | { outcome: 'ignored'; reason: string };

function eventMillis(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value.includes('T') ? value : value.replace(' ', 'T'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export async function applyKiwifyPayload(payload: any): Promise<AccessOutcome> {
  if (!productIsAllowed(payload)) {
    return { outcome: 'ignored', reason: 'product' };
  }

  const decision = classifyKiwifyPayload(payload);
  if (decision === 'ignore') {
    return { outcome: 'ignored', reason: 'event' };
  }

  const email = normalizeEmail(extractCustomerEmail(payload));
  if (!email) return { outcome: 'ignored', reason: 'email' };

  const existing = await getSubscriber(email);
  const now = new Date().toISOString();
  const orderId = extractOrderId(payload) || null;
  const eventAt = extractEventTime(payload);
  const eventName = String(payload?.webhook_event_type || payload?.order_status || decision);

  if (decision === 'grant') {
    if (
      existing?.status === 'revoked' &&
      existing.kiwify_order_id &&
      orderId &&
      existing.kiwify_order_id === orderId &&
      eventMillis(eventAt) <= eventMillis(existing.kiwify_event_at)
    ) {
      return { outcome: 'ignored', reason: 'replay' };
    }

    const row: Subscriber = {
      email,
      name: extractCustomerName(payload) || existing?.name || 'Assinante TikBlox',
      plan: 'essential',
      status: 'active',
      password_hash: existing?.password_hash || null,
      kiwify_order_id: orderId || existing?.kiwify_order_id || null,
      kiwify_product_id: extractProductId(payload) || existing?.kiwify_product_id || null,
      kiwify_event: eventName,
      kiwify_event_at: eventAt || now,
      created_at: existing?.created_at || now,
      updated_at: now,
    };
    await saveSubscriber(row);
    return { outcome: 'granted', email };
  }

  const row: Subscriber = {
    email,
    name: extractCustomerName(payload) || existing?.name || 'Assinante TikBlox',
    plan: 'essential',
    status: 'revoked',
    password_hash: existing?.password_hash || null,
    kiwify_order_id: orderId || existing?.kiwify_order_id || null,
    kiwify_product_id: extractProductId(payload) || existing?.kiwify_product_id || null,
    kiwify_event: eventName,
    kiwify_event_at: eventAt || now,
    created_at: existing?.created_at || now,
    updated_at: now,
  };
  await saveSubscriber(row);
  return { outcome: 'revoked', email };
}
