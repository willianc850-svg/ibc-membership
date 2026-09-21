-- =============================================================================
-- HOMOLOGAÇÃO APENAS — não rode este script em produção.
-- Cole no SQL Editor do projeto Supabase de homolog (develop / staging).
--
-- Efeito:
--   1. Apaga dados de negócio (membros, reuniões, PGM, ministérios, tesouraria,
--      documentos, cadastros pendentes). Arquivos de Storage não são apagados
--      por SQL (protect_delete no Staging). Esvazie os buckets no Storage UI.
--   2. Remove usuários de auth.users que NÃO estão nas 4 contas de teste.
--   3. Garante public.perfis (cria se o Staging ainda não tiver) e o role
--      correto nas 4 contas.
--
-- Contas que permanecem (crie no dashboard se ainda não existirem):
--   superadmin@teste.com  → SUPER_ADMIN
--   diretoria@teste.com   → ADMIN
--   tesoureiro@teste.com  → TESOUREIRO
--   usuario@teste.com     → USER
--
-- Sem fichas de membro vinculadas (membros.user_id fica vazio).
-- =============================================================================

BEGIN;

CREATE OR REPLACE FUNCTION pg_temp.apagar_se_existe(tabela text)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  IF to_regclass(tabela) IS NOT NULL THEN
    EXECUTE format('DELETE FROM %s', tabela);
  END IF;
END;
$$;

-- Staging pode não ter clonado o schema de produção (migrations-acesso.sql
-- recusa criar perfis). O reset cria o mínimo que usePermissao e o convite usam.
CREATE TABLE IF NOT EXISTS public.perfis (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'USER',
  nome text,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  convite_pendente boolean NOT NULL DEFAULT false
);

ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS nome text;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL;
ALTER TABLE public.perfis ADD COLUMN IF NOT EXISTS convite_pendente boolean NOT NULL DEFAULT false;

ALTER TABLE public.perfis ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Perfis le o proprio" ON public.perfis;
CREATE POLICY "Perfis le o proprio"
  ON public.perfis FOR SELECT TO authenticated
  USING (id = auth.uid());

GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.perfis TO service_role;

-- 1. Dados de negócio (filhos primeiro). PERFORM evita o grid vazio
--    no SQL Editor (SELECT de função void).
DO $$
DECLARE
  t text;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'public.reuniao_participantes',
    'public.reunioes',
    'public.membros_celulas',
    'public.membros_pgm',
    'public.membros_ministerios',
    'public.lancamentos_financeiros',
    'public.documentos',
    'public.cadastros_pendentes',
    'public.membros',
    'public.pgm',
    'public.celulas',
    'public.ministerios'
  ]
  LOOP
    PERFORM pg_temp.apagar_se_existe(t);
  END LOOP;
END $$;

-- Storage: não usar DELETE FROM storage.objects (erro 42501 / protect_delete).
-- Cypress usa nomes únicos; arquivos antigos não quebram os testes.
-- Para esvaziar: Storage UI, buckets documentos-ibc, comprovantes-tesouraria, fotos-membros.

-- 2–3. Auth e roles. Sem as 4 contas o DELETE esvaziaria auth.users.
DO $$
DECLARE
  n int;
BEGIN
  SELECT count(*) INTO n
  FROM auth.users
  WHERE lower(email) IN (
    'superadmin@teste.com',
    'diretoria@teste.com',
    'tesoureiro@teste.com',
    'usuario@teste.com'
  );

  IF n = 0 THEN
    RAISE NOTICE 'Crie as 4 contas @teste.com em Authentication → Users e rode de novo. Auth não foi alterado.';
    RETURN;
  END IF;

  DELETE FROM public.perfis
  WHERE id NOT IN (
    SELECT id
    FROM auth.users
    WHERE lower(email) IN (
      'superadmin@teste.com',
      'diretoria@teste.com',
      'tesoureiro@teste.com',
      'usuario@teste.com'
    )
  );

  DELETE FROM auth.users
  WHERE email IS NULL
     OR lower(email) NOT IN (
       'superadmin@teste.com',
       'diretoria@teste.com',
       'tesoureiro@teste.com',
       'usuario@teste.com'
     );

  INSERT INTO public.perfis (id, role, nome, convite_pendente)
  SELECT u.id, v.role, v.nome, false
  FROM auth.users u
  JOIN (
    VALUES
      ('superadmin@teste.com',  'SUPER_ADMIN', 'Super Admin Teste'),
      ('diretoria@teste.com',   'ADMIN',       'Diretoria Teste'),
      ('tesoureiro@teste.com',  'TESOUREIRO',  'Tesoureiro Teste'),
      ('usuario@teste.com',     'USER',        'Usuario Teste')
  ) AS v(email, role, nome) ON lower(u.email) = v.email
  ON CONFLICT (id) DO UPDATE
  SET
    role = EXCLUDED.role,
    nome = EXCLUDED.nome,
    convite_pendente = false;
END $$;

COMMIT;

SELECT u.email, p.role, p.nome
FROM auth.users u
LEFT JOIN public.perfis p ON p.id = u.id
UNION ALL
SELECT
  'Crie as 4 contas @teste.com em Authentication → Users e rode de novo',
  NULL,
  NULL
WHERE NOT EXISTS (
  SELECT 1
  FROM auth.users
  WHERE lower(email) IN (
    'superadmin@teste.com',
    'diretoria@teste.com',
    'tesoureiro@teste.com',
    'usuario@teste.com'
  )
)
ORDER BY 1;
