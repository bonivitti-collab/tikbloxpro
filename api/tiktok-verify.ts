import { requirePaidSession } from '../lib/guard.js';
import { sendJson } from '../lib/http.js';

export default async function handler(req: any, res: any) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const auth = await requirePaidSession(req);
  if (auth.ok === false) return sendJson(res, auth.status, { error: auth.error });

  const term = typeof req.body?.searchTerm === 'string' ? req.body.searchTerm.trim() : '';
  if (term.length < 2) return sendJson(res, 400, { available: false, message: 'verificação indisponível' });

  const apiKey = (process.env.RAPIDAPI_KEY || '').trim();
  if (!apiKey) {
    return sendJson(res, 200, { available: false, message: 'verificação indisponível' });
  }

  try {
    const response = await fetch(
      `https://tiktok-scraper7.p.rapidapi.com/feed/search?keywords=${encodeURIComponent(term)}&region=BR&count=15`,
      {
        headers: {
          'x-rapidapi-key': apiKey,
          'x-rapidapi-host': 'tiktok-scraper7.p.rapidapi.com',
        },
      }
    );
    if (!response.ok) {
      return sendJson(res, 200, { available: false, message: 'verificação indisponível' });
    }
    const data = await response.json();
    const items = Array.isArray(data?.data?.videos) ? data.data.videos : [];
    return sendJson(res, 200, {
      available: true,
      message: `Encontrados ${items.length} vídeos no TikTok Brasil.`,
      searchTerm: term,
      videoCountBR: items.length,
      sampleVideos: items.slice(0, 3).map((video: any) => ({
        title: typeof video?.title === 'string' ? video.title.slice(0, 80) : '',
        author: video?.author?.unique_id || video?.author?.nickname || '',
        views: Number(video?.play_count || 0),
      })),
    });
  } catch (error) {
    console.error('[TIKTOK VERIFY]', error);
    return sendJson(res, 200, { available: false, message: 'verificação indisponível' });
  }
}
