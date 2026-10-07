# API e performance — IBC Membership

Testes HTTP contra **homologação**. Você monta as collections no Postman Desktop; o roteiro está em [POSTMAN-DESKTOP.md](POSTMAN-DESKTOP.md). Categorias, matriz de authz e o que fica de fora: [STRATEGY.md](STRATEGY.md).

Produção não é alvo. Não versionar senhas, JWT, cookies nem `service_role`.

## Superfícies

O app não expõe REST Next para membros ou visitantes. Há duas APIs reais:

1. Route Handlers em `src/app/api/` — cadastro QR, usuários, vínculo, ATA
2. PostgREST do Supabase (`/rest/v1/*`) — CRUD da UI, sujeito a RLS

Visitante é `membros.status_membresia`, não um endpoint.

## Pasta

| Caminho | Uso |
|---|---|
| [POSTMAN-DESKTOP.md](POSTMAN-DESKTOP.md) | Roteiro no Postman Desktop App |
| [STRATEGY.md](STRATEGY.md) | Categorias, superfícies, authz, fora de escopo |
| `postman/collections/` | Collections exportadas (ainda vazias; criar no app) |
| `postman/environments/` | Copiar `*.example.json` para `*.local.json` (gitignored) |
| `scripts/` | Newman e k6, quando existirem |
| `results/` | Saída de runner e métricas |
| `evidence/` | Screenshots e findings |
| `reports/` | Relatórios após a primeira execução |

Critérios de tempo e taxa de erro, quando definidos, são SLOs deste trabalho de QA — não requisitos oficiais do produto.
