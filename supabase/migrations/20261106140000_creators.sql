-- Criadores do ranking Kalodata e os produtos que eles vendem.
-- RLS ligado, sem policy. anon e authenticated não leem. Só a service role.

create table if not exists public.creators (
  id text primary key,
  handle text not null default '',
  nickname text not null default '',
  followers integer,
  revenue_brl numeric,
  sales_volume integer,
  category text,
  source text not null default 'kalodata',
  scraped_at timestamptz not null default now(),
  last_refreshed_at timestamptz not null default now()
);

create index if not exists creators_revenue_idx on public.creators (revenue_brl desc nulls last);

create table if not exists public.creator_products (
  creator_id text not null,
  product_id text not null,
  source text not null default 'kalodata',
  primary key (creator_id, product_id)
);

create index if not exists creator_products_creator_idx on public.creator_products (creator_id);

alter table public.creators enable row level security;
alter table public.creator_products enable row level security;

revoke all on table public.creators from anon, authenticated, public;
revoke all on table public.creator_products from anon, authenticated, public;
