import { applyKiwifyPayload } from '../../lib/access';
import { clientIp, maskEmail, readRawBody, sendJson } from '../../lib/http';
import { signatureFromRequest, signatureIsValid, webhookToken } from '../../lib/kiwify';
import { isRateLimited } from '../../lib/rateLimit';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    if (await isRateLimited(`kiwify:${clientIp(req)}`, 120, 15 * 60 * 1000)) {
      return sendJson(res, 429, { error: 'Too many requests' });
    }

    const token = webhookToken();
    if (token.length < 16) {
      console.error('[KIWIFY] KIWIFY_WEBHOOK_TOKEN ausente');
      return sendJson(res, 503, { error: 'Webhook não configurado' });
    }

    const rawBody = await readRawBody(req);
    const signature = signatureFromRequest(req);
    if (!signatureIsValid(rawBody, signature)) {
      return sendJson(res, 401, { error: 'Assinatura inválida' });
    }

    let payload: any;
    try {
      payload = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return sendJson(res, 400, { error: 'JSON inválido' });
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return sendJson(res, 400, { error: 'JSON inválido' });
    }

    const result = await applyKiwifyPayload(payload);
    if (result.outcome === 'granted') {
      console.log(`[KIWIFY] acesso liberado ${maskEmail(result.email)}`);
    } else if (result.outcome === 'revoked') {
      console.log(`[KIWIFY] acesso revogado ${maskEmail(result.email)}`);
    } else {
      console.log(`[KIWIFY] evento ignorado (${result.reason})`);
    }
    return sendJson(res, 200, { ok: true, outcome: result.outcome });
  } catch (error: any) {
    const code = error?.message || '';
    if (code === 'PAYLOAD_TOO_LARGE') {
      return sendJson(res, 413, { error: 'Payload grande demais' });
    }
    if (code === 'RAW_BODY_REQUIRED' || code === 'SUBSCRIBER_STORE_UNCONFIGURED') {
      console.error('[KIWIFY]', code);
      return sendJson(res, 503, { error: 'Webhook sem persistência configurada' });
    }
    console.error('[KIWIFY]', error);
    return sendJson(res, 500, { error: 'Erro ao processar webhook' });
  }
}
