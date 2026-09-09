-- Rodar no SQL Editor de PRODUÇÃO depois da v1 (ou junto, se a v1 ainda não rodou).

ALTER TABLE public.lancamentos_financeiros
  ADD COLUMN IF NOT EXISTS comprovante_path text;

DELETE FROM public.lancamentos_financeiros
WHERE categoria = 'gastos_ministeriais';

ALTER TABLE public.lancamentos_financeiros
  DROP CONSTRAINT IF EXISTS lancamentos_financeiros_categoria_check;

ALTER TABLE public.lancamentos_financeiros
  ADD CONSTRAINT lancamentos_financeiros_categoria_check
  CHECK (categoria IN (
    'dizimos', 'ofertas', 'missoes', 'outros',
    'gastos_fixos', 'gastos_variaveis', 'outros_gastos', 'ofertas_saida'
  ));

INSERT INTO storage.buckets (id, name, public)
VALUES ('comprovantes-tesouraria', 'comprovantes-tesouraria', false)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Tesouraria le comprovantes" ON storage.objects;
CREATE POLICY "Tesouraria le comprovantes"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'comprovantes-tesouraria'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text])
  );

DROP POLICY IF EXISTS "Tesouraria envia comprovantes" ON storage.objects;
CREATE POLICY "Tesouraria envia comprovantes"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'comprovantes-tesouraria'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text])
  );

DROP POLICY IF EXISTS "Tesouraria atualiza comprovantes" ON storage.objects;
CREATE POLICY "Tesouraria atualiza comprovantes"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'comprovantes-tesouraria'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text])
  );

DROP POLICY IF EXISTS "Tesouraria remove comprovantes" ON storage.objects;
CREATE POLICY "Tesouraria remove comprovantes"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'comprovantes-tesouraria'
    AND get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text])
  );
