# Testes de API no Postman Desktop — IBC Membership

Você monta e executa as collections no app. Este arquivo é o caminho certo para **este** projeto, não um tutorial genérico de Postman.

Estratégia (categorias, matriz de authz, o que fica de fora): [STRATEGY.md](STRATEGY.md). Relatório após a primeira execução: [reports/api-test-report.md](reports/api-test-report.md).

Alvo: **homologação**. Produção fora. Nunca `service_role` no Postman.

## O que este sistema realmente expõe

Não existe um REST Next para membros/PGM/reuniões. São **duas superfícies**:

| Superfície | Base | Auth | O que cobre |
|---|---|---|---|
| Route Handlers | `{{baseUrl}}` | **cookie** do `@supabase/ssr` (não Bearer) | cadastro QR, usuários, vínculo, ATA |
| PostgREST | `{{supabaseUrl}}/rest/v1` | `apikey` + `Authorization: Bearer {{access_token}}` | CRUD da UI (membros, PGM, ministérios, reuniões, tesouraria, documentos) |

Visitante é `membros.status_membresia`, não um endpoint.

Rotas Next reais hoje:

- `POST /api/cadastro` — público (form-data)
- `GET/POST /api/cadastro/pendentes` — SUPER_ADMIN / ADMIN / TESOUREIRO
- `GET/POST/PUT/DELETE /api/admin` e `/api/admin/usuarios` — mesmos papéis
- `POST /api/admin/vincular` e `POST /api/admin/usuarios/reenviar`
- `POST /api/gerar-ata` — **hoje sem auth** (teste de authz, não de carga)

O caso antigo `POST /api/admin/criar-usuario` **não existe**. Criar usuário é `POST /api/admin` (ou `/api/admin/usuarios`). ADMIN **pode** criar USER; 403 entra para USER, ou ADMIN tentando criar ADMIN/TESOUREIRO.

## 0. Antes de abrir o Postman

1. Instale o [Postman Desktop](https://www.postman.com/downloads/) (Windows).
2. Tenha a URL de homolog (não [ibc-membership.vercel.app](https://ibc-membership.vercel.app) — isso é produção).
3. Tenha `NEXT_PUBLIC_SUPABASE_URL` e **anon key** do projeto de homolog (Settings → API). Só a `anon`.
4. Use as 4 contas de [../../cypress.env.example.json](../../cypress.env.example.json): `superadmin@teste.com`, `diretoria@teste.com`, `tesoureiro@teste.com`, `usuario@teste.com`.
5. Se o banco de homolog estiver sujo, rode [../../docs/homolog-reset-testes.sql](../../docs/homolog-reset-testes.sql) no SQL Editor **desse** projeto.

## 1. Ambiente (não cole senha no Git)

Os exemplos já existem:

- [postman/environments/homolog.example.json](postman/environments/homolog.example.json)
- [postman/environments/local.example.json](postman/environments/local.example.json)

No Desktop:

1. **Environments → Import** o `homolog.example.json`.
2. Renomeie para `IBC Homolog` e preencha `baseUrl`, `supabaseUrl`, `anonKey`, `email`, `password`.
3. Deixe `access_token` vazio — o login vai gravar.
4. Se quiser backup local: **Export** para `postman/environments/homolog.local.json` (já está no `.gitignore`).
5. Seletor no canto superior direito: ative **IBC Homolog**. Sem environment ativo, `{{baseUrl}}` não resolve.

Crie 4 environments (um por role) — por exemplo `IBC Homolog SUPER_ADMIN`, `IBC Homolog ADMIN`, `IBC Homolog TESOUREIRO`, `IBC Homolog USER` — copiando o mesmo `baseUrl` / `supabaseUrl` / `anonKey` e trocando só `email` e `password`. Authz é o núcleo deste sistema.

| Environment | email |
|---|---|
| SUPER_ADMIN | `superadmin@teste.com` |
| ADMIN | `diretoria@teste.com` |
| TESOUREIRO | `tesoureiro@teste.com` |
| USER | `usuario@teste.com` |

## 2. Collection: pastas certas

**New → Collection** → `IBC API`. Pastas:

1. `00-auth` — login Supabase
2. `01-smoke` — GET rápidos (JWT e cookie)
3. `02-next-api` — `/api/*`
4. `03-postgrest-crud` — `/rest/v1/*`
5. `04-authz` — mesmo request com USER / ADMIN / TESOUREIRO / SUPER_ADMIN
6. `05-negativos` — 400, sem token, token expirado

Na collection, **Authorization** tipo Bearer Token = `{{access_token}}`. Isso cobre PostgREST. Rotas Next **não** usam esse Bearer — veja a seção 5.

Salve depois em [postman/collections/](postman/collections/) (**Export** Collection v2.1). Sem tokens, cookies nem senha no JSON.

## 3. Login JWT (obrigatório para PostgREST)

Request `00-auth / Login password grant`:

- `POST {{supabaseUrl}}/auth/v1/token?grant_type=password`
- Headers: `apikey: {{anonKey}}`, `Content-Type: application/json`
- Body raw JSON:

```json
{ "email": "{{email}}", "password": "{{password}}" }
```

Aba **Tests**:

```javascript
pm.test('login 200', () => pm.response.to.have.status(200));
const json = pm.response.json();
pm.test('tem access_token', () => pm.expect(json.access_token).to.be.a('string'));
pm.environment.set('access_token', json.access_token);
```

Send. Em Environment, `access_token` deve preencher. Sem isso, o CRUD PostgREST devolve 401.

Se o login devolver 400: conta inexistente, senha errada ou reset não rodou — não é falha do Postman.

## 4. Primeiro smoke PostgREST (o CRUD da UI)

Nos requests PostgREST, headers:

- `apikey: {{anonKey}}`
- `Authorization: Bearer {{access_token}}` (ou herdar da collection)
- `Prefer: return=representation` em POST/PATCH

Ordem segura (leitura antes de escrita):

1. `GET {{supabaseUrl}}/rest/v1/membros?select=id,nome_completo,status_membresia&limit=5`
2. `GET {{supabaseUrl}}/rest/v1/pgm?select=id,nome&limit=5`
3. `GET {{supabaseUrl}}/rest/v1/ministerios?select=id,nome&limit=5`

Tests mínimos:

```javascript
pm.test('status 200', () => pm.response.to.have.status(200));
pm.test('é array', () => pm.expect(pm.response.json()).to.be.an('array'));
```

Escrita: prefixo `API-TEST-` no nome para limpar depois. USER autenticado **consulta** membros/PGM/ministérios e **não** insere (RLS). Tesouraria: só SUPER_ADMIN e TESOUREIRO. Documentos: só SUPER_ADMIN e ADMIN. USER edita só o próprio membro se `membros.user_id` estiver preenchido — após o reset SQL isso vem vazio.

Exemplo de insert (SUPER_ADMIN / ADMIN / TESOUREIRO):

- `POST {{supabaseUrl}}/rest/v1/membros`
- Body: `{ "nome_completo": "API-TEST-Membro" }`
- Esperado: 201 e o registro no body (por causa de `Prefer: return=representation`)

DELETE só nesse registro `API-TEST-*`.

## 5. Rotas Next: cookie, não Bearer

`getCaller()` em `src/lib/admin/usuarios.ts` lê sessão via `cookies()` do `@supabase/ssr`. Bearer no `/api/admin` **não autentica**.

Jeito mais confiável no Desktop:

1. Abra homolog no Chrome e faça login (ex.: superadmin).
2. F12 → Application → Cookies → host da homolog.
3. Copie os cookies `sb-<ref>-auth-token` (pode vir fatiado `.0`, `.1`).
4. No Postman: **Cookies** (abaixo de Send) → domínio de `{{baseUrl}}` → cole os mesmos nomes/valores.
5. Só então: `GET {{baseUrl}}/api/admin` → 200 e `{ "usuarios": [...] }`.
6. Sem cookie: 401 `{ "error": "Não autenticado" }`.
7. Cookie de USER: 403 `{ "error": "Não autorizado" }` (`getCaller` só libera SUPER_ADMIN, ADMIN, TESOUREIRO).

Para trocar de role nas rotas Next: faça logout no browser, login com a outra conta, recopie os cookies. Cookie de SUPER_ADMIN + environment de USER mistura as duas superfícies e invalida o caso.

### Cadastro público (sem cookie)

`POST {{baseUrl}}/api/cadastro` — Body **form-data**:

| Key | Valor |
|---|---|
| `nome_completo` | `API-TEST-Pendente` |

Esperado: 200 `{ "ok": true }`.

Honeypot: envie também `website` preenchido → 200 `{ "ok": true }` **sem** gravar (o handler ignora o pedido). Nome com menos de 3 caracteres → 400 `{ "error": "Informe o nome completo." }`.

### Pendentes, vínculo, convite

Com cookie de SUPER_ADMIN / ADMIN / TESOUREIRO:

- `GET {{baseUrl}}/api/cadastro/pendentes` → `{ "cadastros": [...] }`
- `POST {{baseUrl}}/api/cadastro/pendentes` body `{ "id": "<uuid>", "acao": "aprovar" }` ou `"recusar"`
- `POST {{baseUrl}}/api/admin` body `{ "email": "...", "nome": "...", "role": "USER" }`
- `POST {{baseUrl}}/api/admin/vincular` body `{ "usuario_id": "...", "membro_id": "..." }`
- `POST {{baseUrl}}/api/admin/usuarios/reenviar` body `{ "usuario_id": "..." }`

Convite e reenvio disparam e-mail do Supabase Auth. Use endereços descartáveis de teste, não e-mail real de membro.

### ATA (sem carga)

`POST {{baseUrl}}/api/gerar-ata` body `{ "prompt": "Resuma uma reunião de teste em uma frase." }`.

Hoje aceita **sem login**. Vale um caso de authz (esperado vs atual). Não rode Collection Runner em loop nisso — chama Gemini.

## 6. Authz: o que repetir por role

Troque o environment e rode de novo o login (PostgREST). Para Next, recopie o cookie da conta correspondente. Matriz mínima:

| Request | SUPER_ADMIN | ADMIN | TESOUREIRO | USER |
|---|---|---|---|---|
| GET `/api/admin` | 200 | 200 (só USER que criou) | 200 (só USER que criou) | 403 |
| POST `/api/admin` role USER | 200 | 200 | 200 | 403 |
| POST `/api/admin` role ADMIN | 200 | 403 | 403 | 403 |
| GET `/rest/v1/membros` | 200 | 200 | 200 | 200 |
| POST `/rest/v1/membros` | 201 | 201 | 201 | erro RLS |
| GET `/rest/v1/reunioes` | 200 | 200 | 200 | vazio/RLS |
| GET `/rest/v1/lancamentos_financeiros` | 200 | RLS | 200 | RLS |
| GET `/rest/v1/documentos` | 200 | 200 | RLS | RLS |

RLS no PostgREST costuma aparecer como **200 com `[]`** no GET (não 403) e **401/403** no POST/PATCH/DELETE, com `code` tipo `42501` ou mensagem de policy. Anote o status e o body reais no relatório — não force 403 se a API devolver array vazio.

## 7. Collection Runner (quando os Tests existirem)

1. Collection → **Run**.
2. Environment: o da role (comece por SUPER_ADMIN).
3. Marque `00-auth` primeiro (grava o token).
4. Não marque requests Next no mesmo run se o cookie não for dessa role.
5. Delay 200–500 ms. Iterations = 1.
6. Screenshot do resumo em `evidence/screenshots/`.
7. Preencha [reports/api-test-report.md](reports/api-test-report.md): data, environment, pass/fail, findings.

Newman (`scripts/newman-smoke.sh`) fica para depois, quando a collection estiver exportada.

## 8. Regras para não estragar o teste

- Não usar `service_role` (fura RLS e invalida authz).
- Não apontar `baseUrl` para produção.
- Não commitar `*.local.json`, senha, JWT, cookie.
- Não fazer carga em `/api/gerar-ata`.
- Preferir GET; DELETE só em registro `API-TEST-*`.
- Se o login 400: conta inexistente ou reset não rodou — não é falha do Postman.
