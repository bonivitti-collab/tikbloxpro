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

function pushCandidate(candidates: string[], value: string, limit: number): void {
  if (value.length > limit) throw new Error('PAYLOAD_TOO_LARGE');
  if (!candidates.includes(value)) candidates.push(value);
}

function streamStillOpen(req: any): boolean {
  if (!req || req.body != null || req.rawBody != null) return false;
  if (req.readableEnded || req.readable === false) return false;
  return typeof req[Symbol.asyncIterator] === 'function';
}

async function readStream(req: any, limit: number): Promise<string> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
    size += buf.length;
    if (size > limit) throw new Error('PAYLOAD_TOO_LARGE');
    chunks.push(buf);
  }
  return Buffer.concat(chunks).toString('utf8');
}

/**
 * Corpo para o HMAC da Kiwify.
 * No runtime Node da Vercel (não Next), `req.body` já chega parseado e o stream
 * já foi lido. `config.api.bodyParser` é do Pages API do Next / @vercel/node antigo
 * e esse runtime ignora. Por isso o candidato principal, quando não há bytes crus,
 * é JSON.stringify(req.body): o parse preserva a ordem das chaves e a Kiwify assina
 * o JSON compacto que enviou.
 */
export async function readWebhookBody(
  req: any,
  limit = 200_000
): Promise<{ payload: unknown; candidates: string[] }> {
  const candidates: string[] = [];

  if (typeof req.rawBody === 'string') pushCandidate(candidates, req.rawBody, limit);
  else if (Buffer.isBuffer(req.rawBody)) pushCandidate(candidates, req.rawBody.toString('utf8'), limit);

  let payload: unknown;
  if (typeof req.body === 'string') {
    pushCandidate(candidates, req.body, limit);
    try {
      payload = JSON.parse(req.body);
    } catch {
      payload = undefined;
    }
  } else if (Buffer.isBuffer(req.body)) {
    const text = req.body.toString('utf8');
    pushCandidate(candidates, text, limit);
    try {
      payload = JSON.parse(text);
    } catch {
      payload = undefined;
    }
  } else if (req.body && typeof req.body === 'object') {
    payload = req.body;
    pushCandidate(candidates, JSON.stringify(req.body), limit);
  } else if (streamStillOpen(req)) {
    const raw = await readStream(req, limit);
    pushCandidate(candidates, raw, limit);
    try {
      payload = raw ? JSON.parse(raw) : {};
    } catch {
      payload = undefined;
    }
  }

  return { payload, candidates };
}
