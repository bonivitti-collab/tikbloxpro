-- Complemento caso a primeira migration já tenha sido executada.
-- Pode rodar de novo: os comandos são idempotentes.

alter table public.subscribers add column if not exists late_since timestamptz;
alter table public.subscribers add column if not exists claim_code_hash text;

alter table public.subscribers drop constraint if exists subscribers_status_check;
alter table public.subscribers
  add constraint subscribers_status_check
  check (status in ('active', 'revoked', 'late'));
