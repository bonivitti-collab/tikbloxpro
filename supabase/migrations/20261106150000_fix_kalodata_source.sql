-- A coleta gravava source = 'apify' mesmo nos itens da Kalodata.
-- O ranking diário usa a palavra "ranking BR". Isso devolve a trava
-- KALODATA_PUBLIC_DISPLAY sem esperar o próximo cron.

update public.products
set source = 'kalodata'
where keyword = 'ranking BR'
  and source is distinct from 'kalodata';
