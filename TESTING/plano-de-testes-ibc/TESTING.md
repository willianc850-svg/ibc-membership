# Plano de Testes — IBC Membership

> Este documento descreve todas as estratégias e casos de teste do sistema IBC Membership, desde verificações manuais básicas até testes automatizados com Cypress e testes de API com Postman/cURL.

---

## Sumário

1. [Regras de Qualidade do Projeto](#1-regras-de-qualidade-do-projeto)
2. [Smoke Tests — Verificação Básica](#2-smoke-tests--verificação-básica)
3. [Testes de CRUD por Módulo](#3-testes-de-crud-por-módulo)
4. [Testes de Permissão por Role](#4-testes-de-permissão-por-role)
5. [Testes de API com cURL e Postman](#5-testes-de-api-com-curl-e-postman)
6. [Testes Automatizados com Cypress](#6-testes-automatizados-com-cypress)
7. [Checklist de Regressão](#7-checklist-de-regressão)
8. [Como Incluir Resultados de Testes no Fluxo de Trabalho](#8-como-incluir-resultados-de-testes-no-fluxo-de-trabalho)

---

## 1. Regras de Qualidade do Projeto

Antes de qualquer deploy ou entrega de funcionalidade, os seguintes critérios devem ser atendidos:

### Definition of Done (DoD)
Uma funcionalidade só está "pronta" quando:

- [ ] Funciona nos navegadores: Chrome, Firefox e Edge (últimas versões)
- [ ] Funciona em tela desktop (1280px+) e mobile (375px)
- [ ] Não quebra nenhum fluxo existente (regressão)
- [ ] Erros de banco/API são exibidos ao usuário de forma clara
- [ ] Campos obrigatórios têm validação antes de enviar
- [ ] Operações destrutivas (delete) pedem confirmação
- [ ] Usuário sem permissão não vê botões de ação restritos
- [ ] A página não trava em loop de carregamento

### Regras de Negócio Fundamentais

| Regra | Descrição                                                            |
| ----- | -------------------------------------------------------------------- |
| RN-01 | Apenas usuários autenticados acessam o sistema                       |
| RN-02 | USER só edita o próprio registro de membro                           |
| RN-03 | ADMIN edita qualquer membro mas não gerencia usuários                |
| RN-04 | Somente SUPER_ADMIN cria, altera role e deleta usuários              |
| RN-05 | Somente SUPER_ADMIN deleta registros de membros                      |
| RN-06 | Reunião finalizada não pode ser editada sem reverter status          |
| RN-07 | Confirmação de presença só disponível para Pastor, Diretoria e Líder |
| RN-08 | CEP com 8 dígitos dispara busca automática de endereço               |
| RN-09 | Exportação Excel respeita os filtros ativos                          |
| RN-10 | Nome completo é obrigatório no cadastro de membro                    |

---

## 2. Smoke Tests — Verificação Básica

Execute estes testes **toda vez que subir uma nova versão** para garantir que o sistema está funcionando minimamente.

### ST-01 — Login

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Acesse `/login` sem estar logado | Página de login aparece |
| 2 | Tente acessar `/dashboard` sem login | Redireciona para `/login` |
| 3 | Digite e-mail inválido e qualquer senha | Mensagem "E-mail ou senha incorretos" |
| 4 | Digite credenciais corretas | Redireciona para `/dashboard` |
| 5 | Clique em "Sair" no menu | Redireciona para `/login` |
| 6 | Tente voltar ao dashboard após sair | Redireciona para `/login` |

### ST-02 — Navegação

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Clique em cada item do menu lateral | Página correta abre sem erro |
| 2 | Acesse em mobile (ou DevTools 375px) | Menu lateral some, botão hamburguer aparece |
| 3 | Clique no hamburguer | Menu lateral abre sobre o conteúdo |
| 4 | Clique fora do menu | Menu fecha |

### ST-03 — Dashboard

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Acesse `/dashboard` | Cards de resumo aparecem |
| 2 | Verifique os 6 gráficos | Todos renderizam sem erros |
| 3 | Com 0 membros | Gráficos mostram "Sem dados" |

### ST-04 — Fluxo principal de membro

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Acesse `/membros/novo` | Formulário com 5 abas abre |
| 2 | Tente salvar sem nome | Erro "Nome completo é obrigatório" |
| 3 | Preencha nome e salve | Redireciona para `/membros` |
| 4 | Membro aparece na lista | Nome visível na tabela |
| 5 | Clique em "Ver" | Perfil completo abre |
| 6 | Clique em "Editar" | Formulário abre com dados preenchidos |

---

## 4. Testes de Permissão por Role

### Matriz de permissões

| Ação | SUPER_ADMIN | ADMIN | USER |
|---|---|---|---|
| Ver lista de membros | ✅ | ✅ | ✅ |
| Cadastrar membro | ✅ | ✅ | ❌ |
| Editar qualquer membro | ✅ | ✅ | ❌ |
| Editar próprio registro | ✅ | ✅ | ✅ |
| Deletar membro | ✅ | ❌ | ❌ |
| Criar PGM/Ministério | ✅ | ✅ | ✅ |
| Criar reunião | ✅ | ✅ | ✅ |
| Criar usuário do sistema | ✅ | ❌ | ❌ |
| Alterar role de usuário | ✅ | ❌ | ❌ |
| Deletar usuário | ✅ | ❌ | ❌ |
| Ver painel de usuários | ✅ | ❌ | ❌ |

---

## 7. Checklist de Regressão

Execute este checklist **antes de cada deploy em produção**:

### Autenticação
- [ ] Login com credenciais válidas funciona
- [ ] Login com credenciais inválidas mostra erro
- [ ] Acesso sem login redireciona para `/login`
- [ ] Logout funciona e invalida sessão

### Membros
- [ ] Listar membros carrega sem erro
- [ ] Busca por nome funciona
- [ ] Filtro por status funciona
- [ ] CEP preenche endereço automaticamente
- [ ] Máscara de telefone aplica formatação
- [ ] Cadastro com nome salva corretamente
- [ ] Edição atualiza dados no perfil
- [ ] Perfil exibe todos os campos corretamente

### PGMs e Ministérios
- [ ] Criar PGM/Ministério funciona
- [ ] Adicionar membro ao grupo funciona
- [ ] Remover membro do grupo funciona (sem deletar o membro)
- [ ] Definir líder do ministério funciona
- [ ] Tag de função salva e exibe corretamente

### Reuniões
- [ ] Criar reunião com participantes funciona
- [ ] Gerar ATA com IA retorna texto
- [ ] Salvar ATA persiste no banco
- [ ] Download PDF gera arquivo
- [ ] Finalizar reunião muda status
- [ ] Filtro por data funciona
- [ ] Filtro por tipo funciona

### Relatórios
- [ ] Tabela carrega todos os membros
- [ ] Filtros reduzem a lista corretamente
- [ ] Exportação Excel baixa arquivo com dados filtrados
- [ ] Aba "Resumo" no Excel exibe estatísticas corretas

### Permissões
- [ ] USER não vê botões de ação restritos
- [ ] ADMIN não vê seção de usuários
- [ ] SUPER_ADMIN vê e usa todas as funcionalidades
- [ ] API `/api/admin/criar-usuario` retorna 403 para não-SUPER_ADMIN

### Dashboard
- [ ] Todos os 6 gráficos renderizam
- [ ] Cards de resumo exibem números corretos
- [ ] Com banco vazio, gráficos mostram "Sem dados" sem erros

---

## 8. Como Incluir Resultados de Testes no Fluxo de Trabalho

### Adicionar no README principal

No arquivo `README.md`, a seção de Testes já aponta para este arquivo:
```markdown
## Testes
Consulte o arquivo [TESTING.md](./TESTING.md) para o plano completo.
```
