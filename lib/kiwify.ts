import crypto from 'crypto';
import { timingSafeEqualText } from './http';

const REVOKE_EVENTS = new Set([
  'order_refunded',
  'refund',
  'chargeback',
  'subscription_canceled',
  'subscription_cancelled',
]);

const REVOKE_STATUSES = new Set(['refunded', 'chargedback', 'chargeback', 'canceled', 'cancelled']);

const GRANT_EVENTS = new Set(['order_approved', 'subscription_renewed']);

const GRANT_STATUSES = new Set(['paid', 'approved']);

const BLOCKED_GRANT_STATUSES = new Set(['waiting_payment', 'pending', 'refused', 'rejected', 'expired']);

const LATE_EVENTS = new Set(['subscription_late']);

export type KiwifyDecision = 'grant' | 'revoke' | 'late' | 'ignore';

export function kiwifySignature(rawBody: string, token: string): string {
  return crypto.createHmac('sha1', token).update(rawBody).digest('hex');
}

export function webhookToken(): string {
  return (process.env.KIWIFY_WEBHOOK_TOKEN || '').trim();
}

export function signatureIsValid(rawBody: string, signature: string | null | undefined): boolean {
  const token = webhookToken();
  if (token.length < 16 || !signature) return false;
  const expected = kiwifySignature(rawBody, token);
  return timingSafeEqualText(expected, signature.trim().toLowerCase());
}

export function signatureFromRequest(req: any): string {
  const query = req.query?.signature;
  if (typeof query === 'string' && query.length > 0) return query;
  if (Array.isArray(query) && typeof query[0] === 'string') return query[0];
  try {
    const url = new URL(req.url || '/', 'https://tikblox.local');
    return url.searchParams.get('signature') || '';
  } catch {
    return '';
  }
}

export function extractCustomerEmail(payload: any): string {
  const candidates = [
    payload?.Customer?.email,
    payload?.customer?.email,
    payload?.Subscription?.customer_email,
    payload?.subscription?.customer_email,
    payload?.subscription?.customer?.email,
    payload?.Customer?.email_address,
  ];
  for (const value of candidates) {
    if (typeof value === 'string' && value.includes('@')) return value.trim().toLowerCase();
  }
  return '';
}

export function extractCustomerName(payload: any): string {
  const value =
    payload?.Customer?.full_name ||
    payload?.Customer?.name ||
    payload?.customer?.full_name ||
    payload?.customer?.name ||
    '';
  return typeof value === 'string' ? value.trim().slice(0, 80) : '';
}

export function extractOrderId(payload: any): string {
  const value = payload?.order_id || payload?.orderId || payload?.Subscription?.id || '';
  return typeof value === 'string' ? value.slice(0, 80) : '';
}

export function extractClaimMaterial(payload: any): string {
  const ref = payload?.order_ref || payload?.orderRef || '';
  if (typeof ref === 'string' && ref.trim().length >= 4) return ref.trim().slice(0, 64);
  return extractOrderId(payload);
}

export function extractProductId(payload: any): string {
  const value = payload?.Product?.product_id || payload?.product?.product_id || payload?.product_id || '';
  return typeof value === 'string' ? value : '';
}

export function extractEventTime(payload: any): string | null {
  const value = payload?.updated_at || payload?.refunded_at || payload?.approved_date || payload?.created_at || null;
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function classifyKiwifyPayload(payload: any): KiwifyDecision {
  const event = String(payload?.webhook_event_type || payload?.event || '').trim().toLowerCase();
  const status = String(
    payload?.order_status || payload?.status || payload?.Subscription?.status || payload?.subscription?.status || ''
  )
    .trim()
    .toLowerCase();

  if (REVOKE_EVENTS.has(event) || REVOKE_STATUSES.has(status)) return 'revoke';
  if (LATE_EVENTS.has(event)) return 'late';
  if (BLOCKED_GRANT_STATUSES.has(status) && !GRANT_EVENTS.has(event)) return 'ignore';
  if (GRANT_EVENTS.has(event) || GRANT_STATUSES.has(status)) {
    if (BLOCKED_GRANT_STATUSES.has(status)) return 'ignore';
    return 'grant';
  }
  return 'ignore';
}

export function productIsAllowed(payload: any): boolean {
  const allowed = (process.env.KIWIFY_PRODUCT_ID || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  if (allowed.length === 0) return true;
  const productId = extractProductId(payload);
  return productId.length > 0 && allowed.includes(productId);
}
