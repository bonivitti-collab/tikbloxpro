import crypto from 'crypto';
import { timingSafeEqualText } from './http.js';
import { authSecret } from './session.js';

export function normalizeClaimCode(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, '');
}

export function hashClaimCode(code: string): string {
  const normalized = normalizeClaimCode(code);
  return crypto.createHash('sha256').update(`${authSecret()}:${normalized}`).digest('hex');
}

export function claimCodesMatch(code: string, storedHash: string | null | undefined): boolean {
  if (!storedHash || normalizeClaimCode(code).length < 4) return false;
  const actual = hashClaimCode(code);
  return timingSafeEqualText(actual, storedHash);
}
