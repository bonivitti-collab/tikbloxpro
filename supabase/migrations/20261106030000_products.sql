-- TikBlox Pro: produtos coletados no TikTok Shop BR (Apify).
-- A API usa a service role e ignora RLS. anon e authenticated não leem esta tabela.
-- Upsert por id. Nada aqui apaga a coleção: cada dia acrescenta ou atualiza.

create table if not exists public.products (
  id text primary key,
  title text not null,
  price_brl numeric,
  sold_7d integer,
  sold_30d integer,
  video_count integer,
  influencer_count integer,
  stock_units integer,
  commission_brl numeric,
  cover_url text,
  product_url text,
  niche text,
  keyword text,
  source text not null default 'apify',
  scraped_at timestamptz not null default now(),
  last_refreshed_at timestamptz not null default now()
);

create index if not exists products_last_refreshed_idx
  on public.products (last_refreshed_at asc);

alter table public.products enable row level security;

revoke all on table public.products from anon, authenticated, public;

-- Sem policies de propósito: o navegador não consulta esta tabela.
-- A service role do servidor ignora RLS.

create or replace function public.products_keep_first_seen()
returns trigger
language plpgsql
as $$
begin
  new.scraped_at := old.scraped_at;
  return new;
end;
$$;

drop trigger if exists products_keep_first_seen on public.products;

create trigger products_keep_first_seen
  before update on public.products
  for each row
  execute function public.products_keep_first_seen();

revoke all on function public.products_keep_first_seen() from public, anon, authenticated;
