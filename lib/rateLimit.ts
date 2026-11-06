type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

function memoryLimited(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  if (buckets.size > 5000) {
    for (const [name, bucket] of buckets) {
      if (bucket.resetAt < now) buckets.delete(name);
    }
  }
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  current.count += 1;
  return current.count > limit;
}

async function supabaseLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const apiKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !apiKey) return false;

  const headers: Record<string, string> = {
    apikey: apiKey,
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  };

  const since = new Date(Date.now() - windowMs).toISOString();
  await fetch(`${base}/rest/v1/auth_attempts`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=minimal' },
    body: JSON.stringify({ bucket: key }),
  });

  const countRes = await fetch(
    `${base}/rest/v1/auth_attempts?bucket=eq.${encodeURIComponent(key)}&created_at=gte.${encodeURIComponent(since)}&select=id`,
    {
      headers: { ...headers, Prefer: 'count=exact', Range: '0-0' },
    }
  );
  if (!countRes.ok) return false;
  const range = countRes.headers.get('content-range') || '';
  const total = Number(range.split('/')[1]);
  if (!Number.isFinite(total)) return false;

  if (Math.random() < 0.02) {
    const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    fetch(`${base}/rest/v1/auth_attempts?created_at=lt.${encodeURIComponent(cutoff)}`, {
      method: 'DELETE',
      headers,
    }).catch(() => {});
  }

  return total > limit;
}

export async function isRateLimited(key: string, limit: number, windowMs: number): Promise<boolean> {
  const local = memoryLimited(key, limit, windowMs);
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) return local;
  try {
    const remote = await supabaseLimited(key, limit, windowMs);
    return local || remote;
  } catch (error) {
    console.warn('[rate-limit] store indisponivel, usando limite local', error);
    return local;
  }
}

export function resetMemoryRateLimit(): void {
  buckets.clear();
}
