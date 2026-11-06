-- Faixa de preço por produto. A Kalodata manda mínimo, máximo e média na ficha;
-- um preço só vira ±15% e price_estimated. O upsert amplia o mínimo e o máximo
-- já vistos, então a faixa histórica não encolhe na coleta do dia seguinte.

alter table public.products
  add column if not exists price_min numeric,
  add column if not exists price_max numeric,
  add column if not exists price_avg numeric,
  add column if not exists price_estimated boolean not null default false,
  add column if not exists commission_rate numeric;

comment on column public.products.price_min is 'Menor preço observado. Estimado: preço unitário menos 15%.';
comment on column public.products.price_max is 'Maior preço observado. Estimado: preço unitário mais 15%.';
comment on column public.products.price_avg is 'Preço médio da Kalodata ou o preço unitário da última coleta.';
comment on column public.products.price_estimated is 'Verdadeiro quando a faixa foi derivada de um único preço.';
comment on column public.products.commission_rate is 'Comissão em pontos percentuais. 15 significa 15%.';

update public.products
set
  price_min = round(price_brl * 0.85, 2),
  price_max = round(price_brl * 1.15, 2),
  price_avg = price_brl,
  price_estimated = true,
  commission_rate = case
    when price_brl > 0 and commission_brl is not null then round((commission_brl / price_brl) * 100, 4)
    else commission_rate
  end
where price_brl is not null
  and price_min is null;
