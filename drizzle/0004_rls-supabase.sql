-- No Supabase a API pública (PostgREST) expõe o schema public a quem tem a chave anon.
-- RLS ligado e sem políticas bloqueia esse acesso; o app conecta como dono das tabelas e não é afetado.
DO $$
DECLARE t text;
BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;
