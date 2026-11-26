# TESTING — IBC Membership

> Este documento descreve todas as estratégias e casos de teste do sistema IBC Membership, desde verificações manuais básicas até testes automatizados com Cypress e testes de API com Postman/cURL.

---

## Sumário

1. [Regras de Qualidade do Projeto](#1-regras-de-qualidade-do-projeto)
2. [Smoke Tests — Verificação Básica](#2-smoke-tests--verificação-básica)
3. [Testes de Permissão por Role](#3-testes-de-permissão-por-role)
4. [Checklist de Regressão](#4-checklist-de-regressão)

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
- [ ] Rota aberta direto sem permissão mostra "Acesso restrito"
- [ ] A página não trava em loop de carregamento

### Regras de Negócio Fundamentais

| Regra | Descrição |
| ----- | --------- |
| RN-01 | Apenas usuários autenticados acessam o sistema |
| RN-02 | USER consulta membros e edita só o próprio registro, se `membros.user_id` estiver preenchido. Não cria membro |
| RN-03 | ADMIN e TESOUREIRO editam qualquer membro. Só o SUPER_ADMIN exclui membro |
| RN-04 | SUPER_ADMIN cria ADMIN, TESOUREIRO e USER, altera role e exclui usuários |
| RN-05 | ADMIN e TESOUREIRO criam apenas USER e veem só os usuários que eles mesmos criaram |
| RN-06 | USER só consulta PGM e Ministérios: não cria, não edita, não exclui e não vincula |
| RN-07 | USER não tem menu nem rota de Reuniões e Relatórios |
| RN-08 | Tesouraria (menu e rota) só para SUPER_ADMIN e TESOUREIRO |
| RN-09 | Documentos (menu e rota) só para SUPER_ADMIN e ADMIN |
| RN-10 | Reunião finalizada não volta a rascunho pela tela |
| RN-11 | Confirmação de presença só para Pastor, Diretoria e Líder de Ministério |
| RN-12 | CEP com 8 dígitos dispara busca automática de endereço |
| RN-13 | Exportação Excel respeita os filtros ativos e gera as abas Membros e Resumo |
| RN-14 | Nome completo é obrigatório no cadastro de membro |
| RN-15 | Lançamento com **Conta** desligada continua visível e sai dos totais da tesouraria |

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

No desktop (1280px+) o menu é a sidebar. Abaixo de `lg` (1024px) a sidebar some. No mobile (375px) a navegação é a barra inferior: Início, Membros e **Mais** (`btnAbrirMenu`). **Mais** abre o drawer; o overlay (`overlayMenuMobile`) fecha.

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Clique em cada item do menu lateral | Página correta abre sem erro |
| 2 | Acesse em mobile (ou DevTools 375px) | Sidebar some; barra inferior e botão Mais aparecem |
| 3 | Clique em Mais | Drawer abre sobre o conteúdo |
| 4 | Clique no overlay escuro | Drawer fecha |
| 5 | Abra Membros | Lista mobile continua utilizável |

### ST-03 — Dashboard

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Acesse `/dashboard` | Cards de resumo aparecem |
| 2 | Verifique os 6 gráficos | Todos renderizam sem erros |
| 3 | Com 0 membros | Cada gráfico mostra o estado sem dados |

### ST-04 — Fluxo principal de membro

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Acesse `/membros/novo` | Formulário com 5 abas abre |
| 2 | Tente salvar sem nome | Erro "O nome completo é obrigatório." |
| 3 | Preencha nome e salve | Redireciona para `/membros` |
| 4 | Membro aparece na lista | Nome visível na tabela |
| 5 | Clique em "Ver" | Perfil completo abre |
| 6 | Clique em "Editar" | Formulário abre com dados preenchidos |

---

## 3. Testes de Permissão por Role

### Matriz de permissões

| Ação | SUPER_ADMIN | ADMIN | TESOUREIRO | USER |
|---|---|---|---|---|
| Ver lista de membros | ✅ | ✅ | ✅ | ✅ |
| Cadastrar membro | ✅ | ✅ | ✅ | ❌ |
| Editar qualquer membro | ✅ | ✅ | ✅ | ❌ |
| Editar próprio registro | ✅ | ✅ | ✅ | ✅ |
| Deletar membro | ✅ | ❌ | ❌ | ❌ |
| Criar ou editar PGM/Ministério | ✅ | ✅ | ✅ | ❌ |
| Consultar PGM/Ministério | ✅ | ✅ | ✅ | ✅ |
| Reuniões e relatórios de membros | ✅ | ✅ | ✅ | ❌ |
| Tesouraria (menu, rota e lançamento) | ✅ | ❌ | ✅ | ❌ |
| Documentos | ✅ | ✅ | ❌ | ❌ |
| Criar usuário USER | ✅ | ✅ | ✅ | ❌ |
| Criar ADMIN ou TESOUREIRO | ✅ | ❌ | ❌ | ❌ |
| Alterar role e deletar qualquer usuário | ✅ | ❌ | ❌ | ❌ |
| Ver usuários que não criou | ✅ | ❌ | ❌ | ❌ |

### Tesouraria

| Passo | Ação | Resultado esperado |
|---|---|---|
| 1 | Entre como SUPER_ADMIN | Menu Tesouraria aparece |
| 2 | Abra `/tesouraria` | Resumo anual carrega |
| 3 | Entre como TESOUREIRO | Menu Tesouraria aparece e `/tesouraria` abre |
| 4 | Entre como ADMIN | Menu Tesouraria não aparece |
| 5 | Acesse `/tesouraria` direto | Mensagem "Acesso restrito" (`msgAcessoRestrito`) |
| 6 | Repita os passos 4 e 5 como USER | Mesmo bloqueio |
| 7 | Como TESOUREIRO, acesse `/documentos` | "Acesso restrito" |
| 8 | Como ADMIN, acesse `/documentos` | A tela de documentos abre |

---

## 4. Checklist de Regressão

Execute este checklist **antes de cada deploy em produção**. A suíte `cypress/e2e/regressao/` cobre os itens abaixo.

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
- [ ] Salvar ATA persiste no banco
- [ ] Download PDF gera arquivo
- [ ] Finalizar reunião muda status
- [ ] Filtro por data funciona
- [ ] Filtro por tipo funciona

### Relatórios
- [ ] Tabela carrega todos os membros
- [ ] Filtros reduzem a lista corretamente
- [ ] Exportação Excel baixa arquivo com dados filtrados
- [ ] Aba "Resumo" no Excel exibe o filtro aplicado

### Permissões
- [ ] USER não vê botões de criar ou excluir membro e não abre Reuniões, Relatórios, Tesouraria nem Documentos
- [ ] ADMIN não vê Tesouraria e vê Documentos
- [ ] TESOUREIRO vê Tesouraria e não vê Documentos
- [ ] SUPER_ADMIN vê Tesouraria e Documentos
- [ ] ADMIN e TESOUREIRO veem só a gestão dos usuários que criaram e não criam outro ADMIN
- [ ] `POST /api/admin/usuarios` com role diferente de USER retorna 403 para ADMIN e TESOUREIRO
- [ ] `POST /api/admin/usuarios` retorna 403 para USER

### Tesouraria
- [ ] Lista do mês carrega
- [ ] Novo lançamento aparece no bloco
- [ ] Interruptor **Conta** desligado tira o valor do total e mantém a linha visível

### Dashboard
- [ ] Os 6 gráficos renderizam
- [ ] Cards de resumo exibem números
- [ ] Com a consulta de membros vazia, os gráficos mostram o estado sem dados

---
