# Estratégia — API e performance (IBC Membership)

Collections ainda são criadas no Postman Desktop. Roteiro passo a passo: [POSTMAN-DESKTOP.md](POSTMAN-DESKTOP.md).

Alvo oficial: **homologação**. Produção não é alvo. Visitante é `membros.status_membresia`, não um endpoint.

## Superfícies

O app não expõe REST Next para membros, PGM, ministérios, reuniões, tesouraria ou documentos. Há duas APIs reais:

| Superfície | Base | Auth | Quem implementa a regra |
|---|---|---|---|
| Route Handlers | `{{baseUrl}}/api/*` | cookie `@supabase/ssr` (`getCaller`) | código em `src/app/api/` |
| PostgREST | `{{supabaseUrl}}/rest/v1/*` | `apikey` (anon) + `Authorization: Bearer` (JWT) | RLS no Postgres |

Bearer **não** autentica `/api/admin*` nem `/api/cadastro/pendentes`. Cookie **não** autentica PostgREST. Tratar as duas superfícies como suítes distintas.

### Route Handlers

| Método e path | Auth | Papel |
|---|---|---|
| `POST /api/cadastro` | público | form-data; honeypot `website` |
| `GET /api/cadastro/pendentes` | cookie | SUPER_ADMIN, ADMIN, TESOUREIRO |
| `POST /api/cadastro/pendentes` | cookie | aprovar / recusar |
| `GET/POST/PUT/DELETE /api/admin` | cookie | mesmos papéis; ADMIN/TESOUREIRO só USER que criaram |
| `GET/POST/PUT/DELETE /api/admin/usuarios` | cookie | alias do anterior |
| `POST /api/admin/vincular` | cookie | vínculo conta–membro |
| `POST /api/admin/usuarios/reenviar` | cookie | reenvio de convite |
| `POST /api/gerar-ata` | **nenhuma hoje** | Gemini; não usar em carga |
| `POST /api/auth/callback` | código OAuth | fora desta suíte (fluxo de browser) |

Não existe `POST /api/admin/criar-usuario`. Criar usuário é `POST /api/admin` com `{ email, nome, role }`.

### PostgREST (CRUD da UI)

Tabelas usadas pelo browser, com RLS:

- `membros`, `pgm`, `membros_pgm`, `ministerios`, `membros_ministerios`
- `reunioes`, `reuniao_participantes`
- `lancamentos_financeiros` (SUPER_ADMIN e TESOUREIRO)
- `documentos` (SUPER_ADMIN e ADMIN)
- `cadastros_pendentes` — a UI de aprovação passa pelo Route Handler, não pelo REST direto

USER consulta membros, PGM e ministérios; mutação só no próprio `membros` quando `user_id` está preenchido. Reuniões: USER não lê (RLS). Tesouraria e documentos: conforme a matriz abaixo.

## Categorias

| Pasta / categoria | Objetivo | Quando rodar |
|---|---|---|
| Smoke | Login JWT + GET membros/pgm/ministerios + GET `/api/admin` com cookie | Toda subida de versão em homolog |
| Funcional | Happy path das rotas Next (cadastro QR, listar usuários, convite USER) | Após mudança em `src/app/api/` |
| Negativos | Sem token, token inválido, body vazio, nome curto no cadastro, honeypot | Junto do funcional |
| Authz | Mesmo request nas 4 roles | Sempre que mudar RLS, `getCaller` ou papéis |
| CRUD | POST/PATCH/DELETE PostgREST em registros `API-TEST-*` | Após mudança de tabela/policy |
| Integração | Cadastro público → pendente → aprovar → membro (e convite se houver e-mail) | Fluxo QR |
| Regressão | Smoke + authz mínima + 1 CRUD membros | Antes de promover homolog |
| Carga | Fora do Desktop; k6 contra PostgREST de homolog, critérios em `reports/` | Depois da suíte funcional estável |

Ordem no Desktop: `00-auth` → `01-smoke` → `02-next-api` → `03-postgrest-crud` → `04-authz` → `05-negativos`.

## Matriz de authz

Esperado por request e role. No PostgREST, GET sem permissão costuma ser **200 `[]`**, não 403; anote o body real no relatório.

| Request | SUPER_ADMIN | ADMIN | TESOUREIRO | USER |
|---|---|---|---|---|
| GET `/api/admin` | 200 lista ampla | 200 só USER que criou | 200 só USER que criou | 403 |
| POST `/api/admin` `role: USER` | 200 | 200 | 200 | 403 |
| POST `/api/admin` `role: ADMIN` | 200 | 403 | 403 | 403 |
| POST `/api/admin` `role: TESOUREIRO` | 200 | 403 | 403 | 403 |
| GET `/api/cadastro/pendentes` | 200 | 200 | 200 | 403 |
| GET `/rest/v1/membros` | 200 | 200 | 200 | 200 |
| POST `/rest/v1/membros` | 201 | 201 | 201 | erro RLS |
| PATCH próprio membro (`user_id`) | 204/200 | 204/200 | 204/200 | 204/200 se vinculado |
| PATCH outro membro | 204/200 | 204/200 | 204/200 | erro RLS |
| GET `/rest/v1/pgm` | 200 | 200 | 200 | 200 |
| POST `/rest/v1/pgm` | 201 | 201 | 201 | erro RLS |
| GET `/rest/v1/ministerios` | 200 | 200 | 200 | 200 |
| POST `/rest/v1/ministerios` | 201 | 201 | 201 | erro RLS |
| GET `/rest/v1/reunioes` | 200 | 200 | 200 | vazio/RLS |
| POST `/rest/v1/reunioes` | 201 | 201 | 201 | erro RLS |
| GET `/rest/v1/lancamentos_financeiros` | 200 | RLS | 200 | RLS |
| POST `/rest/v1/lancamentos_financeiros` | 201 | RLS | 201 | RLS |
| GET `/rest/v1/documentos` | 200 | 200 | RLS | RLS |
| POST `/rest/v1/documentos` | 201 | 201 | RLS | RLS |
| POST `/api/cadastro` | 200 público | 200 público | 200 público | 200 público |
| POST `/api/gerar-ata` sem cookie | 200 hoje | 200 hoje | 200 hoje | 200 hoje |

`getCaller` recusa USER (403) e anônimo (401) em todas as rotas admin/pendentes. ADMIN e TESOUREIRO não alteram role nem gerenciam ADMIN/TESOUREIRO/SUPER_ADMIN.

USER só edita o próprio membro se `membros.user_id` estiver preenchido. O [homolog-reset-testes.sql](../../docs/homolog-reset-testes.sql) deixa as fichas sem vínculo — o caso “editar o próprio” precisa de um `UPDATE` pontual depois do reset.

## O que fica de fora

- Produção (`ibc-membership.vercel.app` e o Supabase de produção)
- `service_role` (fura RLS; invalida authz)
- Carga ou Collection Runner em loop em `/api/gerar-ata` (custa Gemini)
- `/api/auth/callback` e o fluxo de definir senha (E2E / browser)
- Storage (upload de foto e comprovante) nesta primeira suíte HTTP
- Pentest, fuzzing e enumeração de usuários
- Newman/k6 até existir collection exportada em `postman/collections/`

Critérios de tempo e taxa de erro, quando existirem, são SLOs deste trabalho de QA — não requisitos oficiais do produto.

## Evidência

- Screenshots do Collection Runner: `evidence/screenshots/`
- Achados (status real ≠ matriz): `evidence/findings/`
- Relatório da execução: [reports/api-test-report.md](reports/api-test-report.md)
