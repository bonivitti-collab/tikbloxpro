export interface Subscriber {
  email: string;
  name: string;
  plan: 'essential';
  status: 'active' | 'revoked';
  password_hash: string | null;
  kiwify_order_id: string | null;
  kiwify_product_id: string | null;
  kiwify_event: string | null;
  kiwify_event_at: string | null;
  created_at: string;
  updated_at: string;
}

const memory = new Map<string, Subscriber>();

export function resetMemorySubscribers(): void {
  memory.clear();
}

export function subscriberBackend(): 'supabase' | 'memory' | 'unconfigured' {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) return 'supabase';
  if (process.env.TIKBLOX_SUBSCRIBER_STORE === 'memory') return 'memory';
  return 'unconfigured';
}

function supabaseConfig(): { base: string; key: string } {
  const base = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
  if (!base || !key) throw new Error('SUPABASE_NOT_CONFIGURED');
  return { base, key };
}

async function sb(path: string, init: RequestInit = {}): Promise<any> {
  const { base, key } = supabaseConfig();
  const headers = new Headers(init.headers);
  headers.set('apikey', key);
  headers.set('Authorization', `Bearer ${key}`);
  if (!headers.has('Content-Type') && init.body) headers.set('Content-Type', 'application/json');
  const res = await fetch(`${base}/rest/v1/${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Supabase ${res.status}: ${text.slice(0, 240)}`);
  }
  if (res.status === 204) return null;
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

export async function getSubscriber(email: string): Promise<Subscriber | null> {
  const backend = subscriberBackend();
  if (backend === 'unconfigured') throw new Error('SUBSCRIBER_STORE_UNCONFIGURED');
  if (backend === 'memory') return memory.get(email) || null;
  const rows = await sb(
    `subscribers?email=eq.${encodeURIComponent(email)}&select=email,name,plan,status,password_hash,kiwify_order_id,kiwify_product_id,kiwify_event,kiwify_event_at,created_at,updated_at`
  );
  return Array.isArray(rows) && rows[0] ? (rows[0] as Subscriber) : null;
}

export async function saveSubscriber(row: Subscriber): Promise<void> {
  const backend = subscriberBackend();
  if (backend === 'unconfigured') throw new Error('SUBSCRIBER_STORE_UNCONFIGURED');
  if (backend === 'memory') {
    memory.set(row.email, row);
    return;
  }
  await sb('subscribers?on_conflict=email', {
    method: 'POST',
    headers: { Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify(row),
  });
}
