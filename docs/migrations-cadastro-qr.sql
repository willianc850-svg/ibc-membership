-- Rodar no SQL Editor do Supabase. Cadastros públicos (QR) ficam aqui até a diretoria aprovar.

CREATE TABLE IF NOT EXISTS public.cadastros_pendentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo text NOT NULL,
  telefone text,
  email text,
  foto_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS cadastros_pendentes_created_at_idx
  ON public.cadastros_pendentes (created_at DESC);

ALTER TABLE public.cadastros_pendentes ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.cadastros_pendentes IS
  'Fichas enviadas pelo formulário público /cadastro; só entram em membros após aprovação.';

-- Ficha completa do QR (abas Pessoal, Contato, Família, Igreja, Saúde).
-- Rodar também se a tabela já existir.
ALTER TABLE public.cadastros_pendentes
  ADD COLUMN IF NOT EXISTS dados jsonb NOT NULL DEFAULT '{}'::jsonb;
