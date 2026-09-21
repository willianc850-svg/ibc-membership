# IBC Membership

Sistema de gestão de membros para igrejas, com Next.js, Supabase e Tailwind CSS.

## O que o sistema faz

- **Membros** — ficha completa (pessoal, contato, família, igreja, saúde), foto, CEP (ViaCEP), filtros; cadastro público por QR com aprovação da diretoria
- **Dashboard** — totais e gráficos demográficos
- **PGMs** — grupos com líder, horário e participantes
- **Ministérios** — vínculos com função e destaque do líder
- **Reuniões** — pauta, participantes, ATA com IA (Gemini), PDF e confirmação de presença
- **Tesouraria** — lançamentos e relatórios (SUPER_ADMIN e TESOUREIRO)
- **Documentos** — arquivos da igreja (SUPER_ADMIN e ADMIN)
- **Relatórios** — tabela filtrada e exportação Excel
- **Usuários** — convite, papéis e vínculo com a ficha de membro

## Stack

| Camada | Tecnologia |
|---|---|
| App | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Dados e auth | Supabase (PostgreSQL, Auth, RLS, Storage) |
| UI | Recharts, Lucide |
| Exportação | SheetJS (xlsx), jsPDF |
| IA (ATA) | Gemini (`GEMINI_API_KEY`) |
| E2E | Cypress 16 |
| Deploy | Vercel |

O CRUD principal (membros, PGM, ministérios, tesouraria, etc.) vai do browser ao PostgREST do Supabase. As rotas em `src/app/api/` cobrem cadastro QR, gestão de usuários, vínculo conta–membro e geração de ATA.

## Papéis

| Role | Recorte |
|---|---|
| `SUPER_ADMIN` | Acesso total, inclusive tesouraria, documentos e gestão de usuários |
| `ADMIN` | Membros, PGM, ministérios, reuniões, relatórios e documentos; convite só de USER que ele criou; sem tesouraria |
| `TESOUREIRO` | Como ADMIN operacional + tesouraria; sem documentos; convite só de USER que ele criou |
| `USER` | Consulta membros, PGM e ministérios; edita só o próprio membro (`membros.user_id`); sem reuniões, relatórios, tesouraria nem documentos |

O primeiro usuário vira SUPER_ADMIN no SQL Editor:

```sql
UPDATE perfis SET role = 'SUPER_ADMIN'
WHERE id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
```

## Como rodar

Node.js 18+, conta no [Supabase](https://supabase.com) e chave Gemini se for gerar ATA.

```bash
npm install
```

Crie `.env.local` (não versionar):

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key
GEMINI_API_KEY=sua-gemini-api-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

SQLs em `docs/` no SQL Editor do Supabase (acesso, documentos, tesouraria, cadastro QR). Homologação de testes: `docs/homolog-reset-testes.sql`.

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000)

## Testes

Alvo oficial das suítes automatizadas: **homologação**, não produção.

| Tipo | Onde |
|---|---|
| Plano e casos manuais | [TESTING/plano-de-testes-ibc/TESTING.md](TESTING/plano-de-testes-ibc/TESTING.md) |
| E2E (Cypress) | [cypress/README.md](cypress/README.md) — `npm run test:e2e` / `npm run test:e2e:open` |
| API e performance | [TESTING/api-performance/](TESTING/api-performance/) (esqueleto; collections ainda vazias) |

Antes do Cypress em homolog, rode `docs/homolog-reset-testes.sql` e use as contas de `cypress.env.example.json` (copie para `cypress.env.json`, gitignored).

## Deploy

Vercel, com as mesmas variáveis do `.env.local`. Em seguida, em Supabase: **Authentication → URL Configuration → Redirect URLs** — `https://seu-projeto.vercel.app/**`.
