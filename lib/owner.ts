import { timingSafeEqualText } from './http.js';

export function ownerEmail(): string {
  return (process.env.TIKBLOX_ADMIN_EMAIL || '').trim().toLowerCase();
}

export function ownerName(): string {
  const configured = (process.env.TIKBLOX_ADMIN_NAME || '').replace(/[\u0000-\u001F]/g, '').trim();
  if (configured.length >= 2) return configured.slice(0, 80);
  const email = ownerEmail();
  const local = email.split('@')[0] || 'Conta';
  return local.slice(0, 80);
}

export function isOwnerEmail(email: string): boolean {
  const owner = ownerEmail();
  return owner.length > 3 && email === owner;
}

export function ownerPasswordMatches(password: string): boolean {
  const expected = process.env.TIKBLOX_ADMIN_PASSWORD || '';
  if (expected.length < 4 || password.length < 4) return false;
  return timingSafeEqualText(password, expected);
}
