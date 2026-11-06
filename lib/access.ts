import { lateGraceHours } from './accessPolicy.js';
import { hashClaimCode } from './claim.js';
import {
  classifyKiwifyPayload,
  extractClaimMaterial,
  extractCustomerEmail,
  extractCustomerName,
  extractEventTime,
  extractOrderId,
  extractProductId,
  productIsAllowed,
} from './kiwify.js';
import { normalizeEmail } from './http.js';
import { getSubscriber, saveSubscriber, type Subscriber } from './subscribers.js';

export type AccessOutcome =
  | { outcome: 'granted'; email: string }
  | { outcome: 'revoked'; email: string }
  | { outcome: 'late'; email: string }
  | { outcome: 'ignored'; reason: string };

function eventMillis(value: string | null): number {
  if (!value) return 0;
  const parsed = Date.parse(value.includes('T') ? value : value.replace(' ', 'T'));
  return Number.isFinite(parsed) ? parsed : 0;
}

function toIso(value: string | null, fallback: string): string {
  const millis = eventMillis(value);
  return millis > 0 ? new Date(millis).toISOString() : fallback;
}

function baseRow(existing: Subscriber | null, email: string, payload: any, now: string): Subscriber {
  return {
    email,
    name: extractCustomerName(payload) || existing?.name || 'Assinante TikBlox',
    plan: 'essential',
    status: existing?.status || 'active',
    password_hash: existing?.password_hash || null,
    kiwify_order_id: extractOrderId(payload) || existing?.kiwify_order_id || null,
    kiwify_product_id: extractProductId(payload) || existing?.kiwify_product_id || null,
    kiwify_event: String(payload?.webhook_event_type || payload?.order_status || ''),
    kiwify_event_at: toIso(extractEventTime(payload), now),
    late_since: existing?.late_since || null,
    claim_code_hash: existing?.claim_code_hash || null,
    created_at: existing?.created_at || now,
    updated_at: now,
  };
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

  if (decision === 'grant') {
    if (
      existing &&
      (existing.status === 'revoked' || existing.status === 'late') &&
      existing.kiwify_order_id &&
      orderId &&
      existing.kiwify_order_id === orderId &&
      eventMillis(eventAt) <= eventMillis(existing.kiwify_event_at)
    ) {
      return { outcome: 'ignored', reason: 'replay' };
    }

    const material = extractClaimMaterial(payload);
    const row = baseRow(existing, email, payload, now);
    row.status = 'active';
    row.late_since = null;
    if (!existing?.password_hash && material) {
      row.claim_code_hash = hashClaimCode(material);
    }
    await saveSubscriber(row);
    return { outcome: 'granted', email };
  }

  if (decision === 'late') {
    if (existing?.status === 'revoked') {
      return { outcome: 'ignored', reason: 'already_revoked' };
    }
    const row = baseRow(existing, email, payload, now);
    if (lateGraceHours() <= 0) {
      row.status = 'revoked';
      row.late_since = null;
      await saveSubscriber(row);
      return { outcome: 'revoked', email };
    }
    row.status = 'late';
    row.late_since = toIso(eventAt, now);
    await saveSubscriber(row);
    return { outcome: 'late', email };
  }

  const row = baseRow(existing, email, payload, now);
  row.status = 'revoked';
  row.late_since = null;
  await saveSubscriber(row);
  return { outcome: 'revoked', email };
}
