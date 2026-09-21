# API e performance — IBC Membership

Esqueleto de testes HTTP contra **homologação**. Collections, scripts e relatórios ainda não estão preenchidos.

Produção não é alvo. Não versionar senhas, JWT, cookies nem `service_role`.

## Superfícies

O app não expõe REST Next para membros ou visitantes. Há duas APIs reais:

1. Route Handlers em `src/app/api/` — cadastro QR, usuários, vínculo, ATA
2. PostgREST do Supabase (`/rest/v1/*`) — CRUD da UI, sujeito a RLS

Visitante é `membros.status_membresia`, não um endpoint.

## Pasta

| Caminho | Uso |
|---|---|
| `postman/collections/` | Collections (smoke, funcional, authz, CRUD, integração, regressão) |
| `postman/environments/` | Copiar `*.example.json` para `*.local.json` (gitignored) |
| `scripts/` | Newman e k6, quando existirem |
| `results/` | Saída de runner e métricas |
| `evidence/` | Screenshots e findings |
| `reports/` | Relatórios após a primeira execução |

Critérios de tempo e taxa de erro, quando definidos, são SLOs deste trabalho de QA — não requisitos oficiais do produto.
