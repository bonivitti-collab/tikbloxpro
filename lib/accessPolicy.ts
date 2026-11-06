import type { Subscriber } from './subscribers.js';

export function lateGraceHours(): number {
  const raw = process.env.KIWIFY_LATE_GRACE_HOURS;
  if (raw == null || String(raw).trim() === '') return 48;
  const parsed = Number(raw);
  if (!Number.isFinite(parsed) || parsed < 0) return 48;
  return parsed;
}

export function subscriberCanAccess(subscriber: Subscriber | null | undefined, now = Date.now()): boolean {
  if (!subscriber) return false;
  if (subscriber.status === 'active') return true;
  if (subscriber.status !== 'late') return false;
  const grace = lateGraceHours();
  if (grace <= 0) return false;
  const since = subscriber.late_since ? Date.parse(subscriber.late_since) : NaN;
  if (!Number.isFinite(since)) return false;
  return now < since + grace * 60 * 60 * 1000;
}

export function accessDeniedMessage(subscriber: Subscriber | null | undefined): string {
  if (subscriber?.status === 'late') {
    return 'A assinatura está em atraso e a carência acabou. Regularize o pagamento na Kiwify para voltar.';
  }
  if (subscriber?.status === 'revoked') {
    return 'Acesso bloqueado: assinatura reembolsada, cancelada ou suspensa.';
  }
  return 'Não há assinatura ativa para este e-mail. O acesso libera depois do pagamento aprovado na Kiwify.';
}
