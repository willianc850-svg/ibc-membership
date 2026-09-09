-- Só roda em um projeto que JÁ tenha a tabela public.perfis (ex.: produção).
-- Staging vazio: este arquivo NÃO cria o banco. Clone o schema de produção primeiro.

DO $$
BEGIN
  IF to_regclass('public.perfis') IS NULL THEN
    RAISE EXCEPTION 'Tabela public.perfis não existe neste projeto. Clone o schema de produção antes de rodar esta migration.';
  END IF;
END $$;

ALTER TABLE public.perfis
  ADD COLUMN IF NOT EXISTS nome text;

ALTER TABLE public.perfis
  ADD COLUMN IF NOT EXISTS criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.perfis
  ADD COLUMN IF NOT EXISTS convite_pendente boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN public.perfis.nome IS 'Nome de exibição do usuário do sistema';
COMMENT ON COLUMN public.perfis.criado_por IS 'auth.users.id de quem convidou este perfil';
COMMENT ON COLUMN public.perfis.convite_pendente IS 'True até o convidado definir a senha';
