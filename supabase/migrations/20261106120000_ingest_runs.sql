-- Uma linha por dia UTC. O cron grava a reserva antes de chamar a Apify.
-- Se a execução falha depois disso, uma nova tentativa acha a linha e não gasta cota de novo.
-- RLS ligado, sem policy: só a service role escreve.

create table if not exists public.ingest_runs (
  run_key text primary key,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  apify_started boolean not null default false,
  status text not null check (status in ('started', 'ok', 'failed')),
  detail text
);

alter table public.ingest_runs enable row level security;

revoke all on table public.ingest_runs from anon, authenticated, public;
