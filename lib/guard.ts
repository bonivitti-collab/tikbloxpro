import { accessDeniedMessage, subscriberCanAccess } from './accessPolicy.js';
import { readCookie } from './http.js';
import { isOwnerEmail } from './owner.js';
import { SESSION_COOKIE_NAME, verifySession, type SessionClaims } from './session.js';
import { getSubscriber, subscriberBackend } from './subscribers.js';

export type PaidSession =
  | { ok: true; claims: SessionClaims }
  | { ok: false; status: number; error: string };

export async function requirePaidSession(req: any): Promise<PaidSession> {
  let claims: SessionClaims | null = null;
  try {
    claims = verifySession(readCookie(req, SESSION_COOKIE_NAME));
  } catch (error: any) {
    const code = error?.message || '';
    if (code === 'AUTH_SECRET_MISSING' || code === 'AUTH_SECRET_LEAKED') {
      return { ok: false, status: 503, error: 'Autenticação ainda não configurada no servidor.' };
    }
    return { ok: false, status: 401, error: 'Sessão inválida.' };
  }
  if (!claims) return { ok: false, status: 401, error: 'Sessão expirada. Entre novamente.' };

  if (claims.role === 'owner' && isOwnerEmail(claims.email)) {
    return { ok: true, claims };
  }

  if (subscriberBackend() === 'unconfigured') {
    return { ok: false, status: 503, error: 'Base de assinantes ainda não configurada.' };
  }
  const subscriber = await getSubscriber(claims.email);
  if (!subscriberCanAccess(subscriber)) {
    return { ok: false, status: 403, error: accessDeniedMessage(subscriber) };
  }
  return { ok: true, claims };
}
