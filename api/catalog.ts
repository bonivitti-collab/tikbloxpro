import { listCatalog } from '../lib/catalog.js';
import { requirePaidSession } from '../lib/guard.js';
import { sendJson } from '../lib/http.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  if (req.method !== 'GET' && req.method !== 'POST') {
    return sendJson(res, 405, { error: 'Method not allowed' });
  }

  try {
    const auth = await requirePaidSession(req);
    if (auth.ok === false) return sendJson(res, auth.status, { error: auth.error });

    const body = req.method === 'POST' && req.body && typeof req.body === 'object' ? req.body : {};
    let queryFromUrl = '';
    try {
      queryFromUrl = new URL(req.url || '/', 'https://tikblox.local').searchParams.get('query') || '';
    } catch {
      queryFromUrl = '';
    }
    const products = listCatalog({
      niche: body.niche || req.query?.niche,
      originCountry: body.originCountry || body.origin || req.query?.originCountry,
      query: body.query || req.query?.query || queryFromUrl,
    });
    return sendJson(res, 200, { success: true, products });
  } catch (error) {
    console.error('[CATALOG]', error);
    return sendJson(res, 500, { error: 'Não foi possível carregar o radar.' });
  }
}
