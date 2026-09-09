-- Rodar no SQL Editor do Supabase de PRODUÇÃO.

CREATE TABLE IF NOT EXISTS public.lancamentos_financeiros (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  data date NOT NULL,
  descricao text NOT NULL,
  valor numeric(14, 2) NOT NULL CHECK (valor >= 0),
  comentario text,
  tipo text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  categoria text NOT NULL CHECK (categoria IN (
    'dizimos', 'ofertas', 'missoes', 'outros',
    'gastos_fixos', 'gastos_variaveis', 'outros_gastos', 'ofertas_saida'
  )),
  tag text,
  comprovante_path text,
  criado_por uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS lancamentos_financeiros_data_idx
  ON public.lancamentos_financeiros (data);

CREATE INDEX IF NOT EXISTS lancamentos_financeiros_categoria_idx
  ON public.lancamentos_financeiros (categoria);

ALTER TABLE public.lancamentos_financeiros ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tesouraria seleciona lancamentos" ON public.lancamentos_financeiros;
CREATE POLICY "Tesouraria seleciona lancamentos"
  ON public.lancamentos_financeiros FOR SELECT
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text]));

DROP POLICY IF EXISTS "Tesouraria insere lancamentos" ON public.lancamentos_financeiros;
CREATE POLICY "Tesouraria insere lancamentos"
  ON public.lancamentos_financeiros FOR INSERT
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text]));

DROP POLICY IF EXISTS "Tesouraria edita lancamentos" ON public.lancamentos_financeiros;
CREATE POLICY "Tesouraria edita lancamentos"
  ON public.lancamentos_financeiros FOR UPDATE
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text]));

DROP POLICY IF EXISTS "Tesouraria deleta lancamentos" ON public.lancamentos_financeiros;
CREATE POLICY "Tesouraria deleta lancamentos"
  ON public.lancamentos_financeiros FOR DELETE
  USING (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'TESOUREIRO'::text]));

DROP POLICY IF EXISTS "Inserir membros" ON public.membros;
CREATE POLICY "Inserir membros"
  ON public.membros FOR INSERT
  WITH CHECK (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]));

DROP POLICY IF EXISTS "Editar membros" ON public.membros;
CREATE POLICY "Editar membros"
  ON public.membros FOR UPDATE
  USING (
    (auth.uid() = user_id)
    OR (get_my_role() = ANY (ARRAY['SUPER_ADMIN'::text, 'ADMIN'::text, 'TESOUREIRO'::text]))
  );
