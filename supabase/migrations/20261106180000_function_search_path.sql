-- O linter do Supabase aponta search_path mutável nesta função.
alter function public.products_keep_first_seen() set search_path = public;
