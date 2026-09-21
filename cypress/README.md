# Cypress — IBC Membership

Suíte oficial contra **homologação** (Supabase de teste + site develop). Produção não é alvo.

## Contas

Copie `cypress.env.example.json` para `cypress.env.json` (gitignored) e preencha a senha compartilhada das quatro contas `@teste.com`.

Antes da primeira suíte, rode `docs/homolog-reset-testes.sql` no SQL Editor do Supabase de **homolog**. Crie as contas no Auth se ainda não existirem.

## Como rodar

```bash
# Local (app em npm run dev)
npx cypress open
npm run test:e2e:open

# Headless local
npm run test:e2e

# Homolog
npx cypress run --config baseUrl=https://HOMOLOG
```

Cypress 16: senhas vêm de `cypress.env.json` via `cy.env()`, não `Cypress.env()`.

Seletores: `TESTING/testes-automatizados-ibc/mapa-data-cy.md`.
