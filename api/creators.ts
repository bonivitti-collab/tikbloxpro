import { listCreatorBoard } from '../lib/creatorsStore.js';
import { requirePaidSession } from '../lib/guard.js';
import { sendJson } from '../lib/http.js';
import { canSeeKalodata } from '../lib/kalodataAccess.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  try {
    const auth = await requirePaidSession(req);
    if (auth.ok === false) return sendJson(res, auth.status, { error: auth.error });
    const viewer = { email: auth.claims.email, role: auth.claims.role };
    if (!canSeeKalodata(viewer)) {
      return sendJson(res, 200, { success: true, showCreators: false, creators: [] });
    }
    const creators = await listCreatorBoard();
    return sendJson(res, 200, { success: true, showCreators: true, creators });
  } catch (error) {
    console.error('[CREATORS]', error);
    return sendJson(res, 500, { error: 'Não foi possível carregar os criadores.' });
  }
}
