/**
 * Enquanto KALODATA_PUBLIC_DISPLAY não está ligado, o ranking da Kalodata
 * só sai para o dono e para as contas internas combinadas no contrato.
 * Assinante comum continua no catálogo curado e na Apify.
 */
const DEFAULT_INTERNAL_EMAILS = ['contato.dudavitti@gmail.com', 'dudavitti@gmail.com'];

export function kalodataPublicDisplay(raw: unknown = process.env.KALODATA_PUBLIC_DISPLAY): boolean {
  const value = String(raw ?? '').trim().toLowerCase();
  return value === '1' || value === 'true' || value === 'yes' || value === 'on';
}

export function kalodataInternalEmails(raw: unknown = process.env.KALODATA_INTERNAL_EMAILS): Set<string> {
  const extra = String(raw ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.includes('@'));
  return new Set([...DEFAULT_INTERNAL_EMAILS, ...extra]);
}

export function canSeeKalodata(viewer: { email?: string | null; role?: string | null } | null | undefined): boolean {
  if (kalodataPublicDisplay()) return true;
  if (!viewer) return false;
  if (viewer.role === 'owner') return true;
  const email = String(viewer.email || '').trim().toLowerCase();
  return kalodataInternalEmails().has(email);
}
