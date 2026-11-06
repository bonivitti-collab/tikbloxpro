import crypto from 'crypto';

const EMAIL_RE = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/i;

export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const email = value.trim().toLowerCase();
  if (email.length < 6 || email.length > 254) return null;
  if (!EMAIL_RE.test(email)) return null;
  return email;
}

export function cleanName(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const name = value.replace(/[\u0000-\u001F\u007F]/g, '').trim();
  if (name.length < 2 || name.length > 80) return null;
  return name;
}

export function cleanPassword(value: unknown, min: number): string | null {
  if (typeof value !== 'string') return null;
  const password = value.trim();
  if (password.length < min || password.length > 128) return null;
  return password;
}

export function clientIp(req: any): string {
  const forwarded = req.headers?.['x-forwarded-for'];
  if (typeof forwarded === 'string' && forwarded.length > 0) {
    return forwarded.split(',')[0].trim().slice(0, 64);
  }
  return String(req.socket?.remoteAddress || 'unknown').slice(0, 64);
}

export function maskEmail(email: string): string {
  const [user, domain] = email.split('@');
  if (!domain) return '***';
  return `${user.slice(0, 1)}***@${domain}`;
}

export function timingSafeEqualText(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length === 0 || left.length !== right.length) return false;
  return crypto.timingSafeEqual(left, right);
}

export function readCookie(req: any, name: string): string | null {
  const raw = req.headers?.cookie;
  if (typeof raw !== 'string' || raw.length === 0) return null;
  for (const part of raw.split(';')) {
    const trimmed = part.trim();
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq);
    if (key !== name) continue;
    try {
      return decodeURIComponent(trimmed.slice(eq + 1));
    } catch {
      return null;
    }
  }
  return null;
}

export function cookieSecure(req: any): boolean {
  const proto = req.headers?.['x-forwarded-proto'];
  if (typeof proto === 'string' && proto.split(',')[0].trim() === 'https') return true;
  return Boolean(process.env.VERCEL);
}

export function sendJson(
  res: any,
  status: number,
  body: unknown,
  headers: Record<string, string> = {}
): void {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  for (const [key, value] of Object.entries(headers)) {
    res.setHeader(key, value);
  }
  res.status(status).json(body);
}

export async function readRawBody(req: any, limit = 200_000): Promise<string> {
  let raw = '';
  if (typeof req.rawBody === 'string') raw = req.rawBody;
  else if (typeof req.body === 'string') raw = req.body;
  else if (Buffer.isBuffer(req.body)) raw = req.body.toString('utf8');
  else if (req.body == null && req && typeof req[Symbol.asyncIterator] === 'function') {
    const chunks: Buffer[] = [];
    let size = 0;
    for await (const chunk of req) {
      const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
      size += buf.length;
      if (size > limit) throw new Error('PAYLOAD_TOO_LARGE');
      chunks.push(buf);
    }
    raw = Buffer.concat(chunks).toString('utf8');
  } else if (req.body && typeof req.body === 'object') {
    throw new Error('RAW_BODY_REQUIRED');
  }

  if (raw.length > limit) throw new Error('PAYLOAD_TOO_LARGE');
  return raw;
}
