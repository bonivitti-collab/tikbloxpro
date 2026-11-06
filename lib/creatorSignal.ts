export type MomentumTag = 'Novo' | 'Subindo' | 'Esfriando';

export interface PromotionSighting {
  creatorId: string;
  productId: string;
  firstSeenAt: string;
  videoUrl?: string | null;
}

const DAY = 86_400_000;

export function momentumTag(starters7d: number, startersPrev7d: number): MomentumTag | null {
  if (starters7d > 0 && startersPrev7d === 0) return 'Novo';
  if (starters7d > startersPrev7d && startersPrev7d > 0) return 'Subindo';
  if (starters7d < startersPrev7d && startersPrev7d > 0) return 'Esfriando';
  return null;
}

export function productHasSignal(starters7d: number, startersPrev7d: number): boolean {
  return starters7d > 0 || startersPrev7d > 0;
}

export function countDistinctStarters(
  sightings: PromotionSighting[],
  productId: string,
  fromMs: number,
  toMs: number,
): number {
  const ids = new Set<string>();
  for (const sighting of sightings) {
    if (sighting.productId !== productId) continue;
    const seen = Date.parse(sighting.firstSeenAt);
    if (!Number.isFinite(seen) || seen < fromMs || seen >= toMs) continue;
    ids.add(sighting.creatorId);
  }
  return ids.size;
}

export interface ProductSignal {
  productId: string;
  starters7d: number;
  startersPrev7d: number;
  tag: MomentumTag | null;
  videoUrls: string[];
  creatorIds: string[];
}

export function signalsForProducts(sightings: PromotionSighting[], now: Date): ProductSignal[] {
  const nowMs = now.getTime();
  const weekAgo = nowMs - 7 * DAY;
  const twoWeeksAgo = nowMs - 14 * DAY;
  const productIds = [...new Set(sightings.map((sighting) => sighting.productId))];
  const signals: ProductSignal[] = [];
  for (const productId of productIds) {
    const starters7d = countDistinctStarters(sightings, productId, weekAgo, nowMs + 1);
    const startersPrev7d = countDistinctStarters(sightings, productId, twoWeeksAgo, weekAgo);
    if (!productHasSignal(starters7d, startersPrev7d)) continue;
    const recent = sightings.filter((sighting) => {
      if (sighting.productId !== productId) return false;
      const seen = Date.parse(sighting.firstSeenAt);
      return Number.isFinite(seen) && seen >= weekAgo && seen < nowMs + 1;
    });
    const videoUrls = [...new Set(recent.map((sighting) => sighting.videoUrl).filter((url): url is string => typeof url === 'string' && url.startsWith('http')))];
    signals.push({
      productId,
      starters7d,
      startersPrev7d,
      tag: momentumTag(starters7d, startersPrev7d),
      videoUrls,
      creatorIds: [...new Set(recent.map((sighting) => sighting.creatorId))],
    });
  }
  return signals.sort((a, b) => b.starters7d - a.starters7d || a.productId.localeCompare(b.productId));
}

export function videoUrlFromKalodata(item: any, handle?: string | null): string | null {
  const direct = [item?.video_url, item?.share_url, item?.video_share_url].find(
    (value) => typeof value === 'string' && /^https?:\/\//i.test(value),
  );
  if (direct) return String(direct);
  const videoId = String(item?.video_id || item?.top_video_id || '').trim();
  const who = String(handle || item?.creator_handle || '').replace(/^@/, '').trim();
  if (videoId && who) return `https://www.tiktok.com/@${who}/video/${videoId}`;
  if (videoId) return `https://www.tiktok.com/video/${videoId}`;
  return null;
}
