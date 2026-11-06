import crypto from 'crypto';
import { cookieSecure, timingSafeEqualText } from './http.js';

const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;
const COOKIE_NAME = 'tikblox_session';
const LEAKED_SECRET_SHA256 = '7936048cf09db6fe008d64cee253f3f8eb19ed78562c285e1ebe8c9a1369c5c0';

export interface SessionClaims {
  email: string;
  role: 'owner' | 'subscriber';
  plan: 'essential';
  iat: number;
  exp: number;
}

export function authSecret(): string {
  const secret = process.env.TIKBLOX_AUTH_SECRET || '';
  if (secret.length < 32) {
    throw new Error('AUTH_SECRET_MISSING');
  }
  const digest = crypto.createHash('sha256').update(secret).digest('hex');
  if (digest === LEAKED_SECRET_SHA256) {
    throw new Error('AUTH_SECRET_LEAKED');
  }
  return secret;
}

export function signSession(input: { email: string; role: 'owner' | 'subscriber' }): string {
  const now = Math.floor(Date.now() / 1000);
  const claims: SessionClaims = {
    email: input.email,
    role: input.role,
    plan: 'essential',
    iat: now,
    exp: now + SESSION_TTL_SECONDS,
  };
  const data = Buffer.from(JSON.stringify(claims)).toString('base64url');
  const sig = crypto.createHmac('sha256', authSecret()).update(data).digest('base64url');
  return `${data}.${sig}`;
}

export function verifySession(token: string | null | undefined): SessionClaims | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;
  const [data, sig] = parts;
  if (!data || !sig) return null;
  let expected = '';
  try {
    expected = crypto.createHmac('sha256', authSecret()).update(data).digest('base64url');
  } catch {
    return null;
  }
  if (!timingSafeEqualText(sig, expected)) return null;
  try {
    const json = JSON.parse(Buffer.from(data, 'base64url').toString('utf8'));
    if (!json || json.plan !== 'essential') return null;
    if (json.role !== 'owner' && json.role !== 'subscriber') return null;
    if (typeof json.email !== 'string' || typeof json.exp !== 'number') return null;
    if (json.exp < Math.floor(Date.now() / 1000)) return null;
    return json as SessionClaims;
  } catch {
    return null;
  }
}

export function sessionCookie(token: string, req: any): string {
  const secure = cookieSecure(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=${token}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${SESSION_TTL_SECONDS}${secure}`;
}

export function clearSessionCookie(req: any): string {
  const secure = cookieSecure(req) ? '; Secure' : '';
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0${secure}`;
}

export const SESSION_COOKIE_NAME = COOKIE_NAME;
