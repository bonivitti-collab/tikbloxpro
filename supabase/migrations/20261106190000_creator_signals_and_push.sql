alter table public.creators
  add column if not exists products_checked_at timestamptz,
  add column if not exists avatar_url text;

alter table public.creator_products
  add column if not exists first_seen_at timestamptz not null default now(),
  add column if not exists last_seen_at timestamptz not null default now(),
  add column if not exists video_url text;

create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  niche text,
  last_body text,
  created_at timestamptz not null default now()
);

alter table public.push_subscriptions enable row level security;
revoke all on table public.push_subscriptions from anon, authenticated, public;

create index if not exists creator_products_product_idx on public.creator_products (product_id);
create index if not exists creators_products_checked_idx on public.creators (products_checked_at asc nulls first);
