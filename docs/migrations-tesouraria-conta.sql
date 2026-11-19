-- Rodar no SQL Editor do Supabase de PRODUÇÃO.
-- Lançamentos já existentes continuam entrando nos totais.

ALTER TABLE public.lancamentos_financeiros
  ADD COLUMN IF NOT EXISTS conta_no_total boolean NOT NULL DEFAULT true;
