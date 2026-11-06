-- TikBlox Pro: assinantes da Kiwify.
-- Rode no SQL Editor do projeto Supabase exclusivo do TikBlox.
-- A API usa a service role e ignora RLS. anon e authenticated não leem estas tabelas.

create table if not exists public.subscribers (
  email text primary key,
  name text not null default '',
  plan text not null default 'essential' check (plan = 'essential'),
  status text not null check (status in ('active', 'revoked')),
  password_hash text,
  kiwify_order_id text,
  kiwify_product_id text,
  kiwify_event text,
  kiwify_event_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists subscribers_status_idx on public.subscribers (status);

create table if not exists public.auth_attempts (
  id bigint generated always as identity primary key,
  bucket text not null,
  created_at timestamptz not null default now()
);

create index if not exists auth_attempts_bucket_created_idx
  on public.auth_attempts (bucket, created_at desc);

alter table public.subscribers enable row level security;
alter table public.auth_attempts enable row level security;

revoke all on table public.subscribers from anon, authenticated;
revoke all on table public.auth_attempts from anon, authenticated;

-- Sem policies de propósito: o navegador não consulta estas tabelas.
-- A service role do servidor ignora RLS.
