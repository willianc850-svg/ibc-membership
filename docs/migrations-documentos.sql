-- Rodar no SQL Editor do Supabase de PRODUÇÃO.

-- Documentos: só SUPER_ADMIN e ADMIN.
CREATE TABLE IF NOT EXISTS public.documentos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  tipo text NOT NULL CHECK (tipo IN ('ata', 'estatuto', 'oficio', 'outro')),
  storage_path text NOT NULL,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS documentos_created_at_idx
  ON public.documentos (created_at DESC);

ALTER TABLE public.documentos ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Documentos seleciona" ON public.documentos;
CREATE POLICY "Documentos seleciona"
  ON public.documentos FOR SELECT
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text]));

DROP POLICY IF EXISTS "Documentos insere" ON public.documentos;
CREATE POLICY "Documentos insere"
  ON public.documentos FOR INSERT
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text]));

DROP POLICY IF EXISTS "Documentos edita" ON public.documentos;
CREATE POLICY "Documentos edita"
  ON public.documentos FOR UPDATE
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text]));

DROP POLICY IF EXISTS "Documentos deleta" ON public.documentos;
CREATE POLICY "Documentos deleta"
  ON public.documentos FOR DELETE
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text]));

GRANT SELECT, INSERT, UPDATE, DELETE ON public.documentos TO authenticated;

INSERT INTO storage.buckets (id, name, public)
VALUES ('documentos-ibc', 'documentos-ibc', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Documentos le arquivos" ON storage.objects;
CREATE POLICY "Documentos le arquivos"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documentos-ibc'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text])
  );

DROP POLICY IF EXISTS "Documentos envia arquivos" ON storage.objects;
CREATE POLICY "Documentos envia arquivos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documentos-ibc'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text])
  );

DROP POLICY IF EXISTS "Documentos atualiza arquivos" ON storage.objects;
CREATE POLICY "Documentos atualiza arquivos"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'documentos-ibc'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text])
  );

DROP POLICY IF EXISTS "Documentos remove arquivos" ON storage.objects;
CREATE POLICY "Documentos remove arquivos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documentos-ibc'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text])
  );

-- USER consulta PGM/ministérios; mutações só Super Admin, Admin e Tesoureiro.
-- USER não lê reuniões.

DO $$
DECLARE
  t text;
  r record;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'pgm',
    'membros_pgm',
    'ministerios',
    'membros_ministerios',
    'reunioes',
    'reuniao_participantes'
  ]
  LOOP
    IF to_regclass('public.' || t) IS NULL THEN
      CONTINUE;
    END IF;
    EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t);
    FOR r IN
      SELECT policyname FROM pg_policies WHERE schemaname = 'public' AND tablename = t
    LOOP
      EXECUTE format('DROP POLICY IF EXISTS %I ON public.%I', r.policyname, t);
    END LOOP;
  END LOOP;
END $$;

CREATE POLICY "Pgm consulta autenticado"
  ON public.pgm FOR SELECT TO authenticated USING (true);
CREATE POLICY "Pgm mutacao admin"
  ON public.pgm FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Pgm atualiza admin"
  ON public.pgm FOR UPDATE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Pgm deleta admin"
  ON public.pgm FOR DELETE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));

CREATE POLICY "Membros pgm consulta autenticado"
  ON public.membros_pgm FOR SELECT TO authenticated USING (true);
CREATE POLICY "Membros pgm insere admin"
  ON public.membros_pgm FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Membros pgm atualiza admin"
  ON public.membros_pgm FOR UPDATE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Membros pgm deleta admin"
  ON public.membros_pgm FOR DELETE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));

CREATE POLICY "Ministerios consulta autenticado"
  ON public.ministerios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Ministerios insere admin"
  ON public.ministerios FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Ministerios atualiza admin"
  ON public.ministerios FOR UPDATE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Ministerios deleta admin"
  ON public.ministerios FOR DELETE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));

CREATE POLICY "Membros ministerios consulta autenticado"
  ON public.membros_ministerios FOR SELECT TO authenticated USING (true);
CREATE POLICY "Membros ministerios insere admin"
  ON public.membros_ministerios FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Membros ministerios atualiza admin"
  ON public.membros_ministerios FOR UPDATE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Membros ministerios deleta admin"
  ON public.membros_ministerios FOR DELETE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));

CREATE POLICY "Reunioes admin seleciona"
  ON public.reunioes FOR SELECT TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Reunioes admin insere"
  ON public.reunioes FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Reunioes admin atualiza"
  ON public.reunioes FOR UPDATE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Reunioes admin deleta"
  ON public.reunioes FOR DELETE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));

CREATE POLICY "Participantes admin seleciona"
  ON public.reuniao_participantes FOR SELECT TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Participantes admin insere"
  ON public.reuniao_participantes FOR INSERT TO authenticated
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Participantes admin atualiza"
  ON public.reuniao_participantes FOR UPDATE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
CREATE POLICY "Participantes admin deleta"
  ON public.reuniao_participantes FOR DELETE TO authenticated
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));
