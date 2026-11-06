import { timingSafeEqual } from 'node:crypto';
import { runDailyIngest } from '../../lib/ingestRun.js';
import { sendJson } from '../../lib/http.js';

export const config = {
  maxDuration: 60,
};

function header(req: any, name: string): string {
  const headers = req?.headers || {};
  const value = headers[name] ?? headers[name.toLowerCase()];
  if (Array.isArray(value)) return String(value[0] || '');
  return typeof value === 'string' ? value : '';
}

function secretMatches(authorization: string, secret: string): boolean {
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(authorization);
  if (expected.length !== received.length) return false;
  return timingSafeEqual(expected, received);
}

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  const secret = process.env.CRON_SECRET || '';
  if (secret.length < 16) {
    console.error('[INGEST] CRON_SECRET ausente');
    return sendJson(res, 503, { error: 'Cron não configurado' });
  }
  if (!secretMatches(header(req, 'authorization'), secret)) {
    return sendJson(res, 401, { error: 'Não autorizado' });
  }

  try {
    const summary = await runDailyIngest();
    return sendJson(res, 200, { success: true, ...summary });
  } catch (error: any) {
    const message = String(error?.message || error);
    if (message === 'SUPABASE_NOT_CONFIGURED' || message === 'APIFY_TOKEN_MISSING') {
      console.error('[INGEST]', message);
      return sendJson(res, 503, { error: 'Coleta não configurada' });
    }
    console.error('[INGEST]', message.slice(0, 300));
    return sendJson(res, 502, { error: 'A coleta não concluiu' });
  }
}
