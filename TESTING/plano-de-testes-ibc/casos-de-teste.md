# Plano de Testes — IBC Membership

## Objetivo

Garantir o funcionamento correto das funcionalidades principais do sistema de gestão de membros IBC Membership, assegurando que os fluxos críticos operem conforme esperado, que as regras de negócio sejam respeitadas e que o controle de acesso por níveis de permissão funcione corretamente.

---

## Escopo dos Testes

### Funcionalidades testadas

- Autenticação (login e logout)
- Gestão de membros (cadastro, visualização, edição e exclusão)
- Busca automática de CEP
- Gestão de PGMs (Pequenos Grupos Multiplicadores)
- Gestão de ministérios e funções
- Registro de reuniões e geração de ATA
- Dashboard e gráficos demográficos
- Relatórios e exportação para Excel
- Controle de acesso por níveis de permissão (SUPER_ADMIN, ADMIN, USER)
- Configurações de conta (alteração de e-mail e senha)
- Gestão de usuários do sistema

### Funcionalidades não testadas

- Infraestrutura e servidores (Supabase, Vercel)
- Integração com WhatsApp (link externo)
- Segurança avançada (pentest, análise de vulnerabilidades)
- Performance sob alta carga

---

## Tipos de Testes

- **Funcional** — validação dos fluxos e comportamentos esperados
- **Exploratório** — navegação livre para identificar comportamentos inesperados
- **Regressão** — verificação de que novas alterações não quebram funcionalidades existentes
- **Controle de acesso** — validação das permissões por nível de usuário
- **Responsividade** — comportamento em desktop e mobile
- **Validação de formulários** — campos obrigatórios, máscaras e integrações

---

## Critérios de Sucesso

- Todos os fluxos críticos funcionando (login, cadastro, edição)
- Nenhum bug crítico em aberto
- Controle de acesso respeitado para todos os níveis
- Exportação de relatório gerando arquivo válido
- Dashboard exibindo dados corretos
- Geração de ATA retornando texto coerente com os dados da reunião

---

## Ambiente

- **Sistema:** Windows 11 64-bit
- **Browser:** Opera GX — Chromium 146
- **URL de produção:** [ibc-membership.vercel.app](https://ibc-membership.vercel.app)
- **URL local:** http://localhost:3000
- **Banco de dados:** Supabase (PostgreSQL)
- **Framework:** Next.js 16

---

## Sumário de Casos de Teste

### Autenticação
- [CT-001 - Login com credenciais válidas](#ct-001---login-com-credenciais-válidas)
- Login com e-mail inválido
- Login com senha incorreta
- Login com campos vazios
- Redirecionamento para login ao acessar rota protegida sem sessão
- Logout e invalidação da sessão
- Tentativa de acesso ao dashboard após logout

### Gestão de Membros
**Cadastro**
- Cadastro com apenas nome (campo mínimo obrigatório)
- Tentativa de salvar sem preencher o nome
- Cadastro com todos os campos preenchidos (5 abas)
- Navegação entre abas sem perder dados preenchidos
- Busca automática de endereço ao digitar CEP válido
- Comportamento com CEP inválido ou inexistente
- Aplicação de máscara no campo de telefone
- Opção "não lembro o dia e mês" na data de admissão
- Upload de foto de perfil
- Cadastro com foto — verificar se aparece na lista e no perfil

**Listagem**
- Exibição de todos os membros cadastrados
- Busca por nome
- Busca por telefone
- Filtro por status de membresia
- Exibição do bairro na coluna da tabela

**Visualização**
- Perfil completo com todas as seções visíveis
- Link de WhatsApp abre com número correto
- Link de e-mail abre cliente de e-mail
- Foto de perfil exibida corretamente

**Edição**
- Campos carregam com dados atuais do membro
- Atualização de dados reflete imediatamente no perfil
- Campos vazios salvos como "—" no perfil
- Troca de foto de perfil

**Exclusão**
- Modal de confirmação antes de excluir
- Membro removido da lista após confirmação
- Cancelamento não exclui o membro

### PGMs — Pequenos Grupos Multiplicadores
- Criar PGM com nome, líder, bairro, dia e horário
- Editar informações de um PGM existente
- Excluir PGM com confirmação
- Adicionar membro a um PGM via busca por nome
- Remover membro do PGM sem excluir o membro do sistema
- Contador de membros atualiza após adição e remoção
- Líder aparece corretamente no card do PGM

### Ministérios
- Criar ministério com nome e descrição
- Editar ministério existente
- Excluir ministério com confirmação
- Adicionar membro ao ministério com função (ex: cantor, baterista)
- Tag colorida de função exibida corretamente
- Editar função de membro diretamente na lista (inline)
- Definir líder do ministério clicando em ★
- Trocar líder — anterior perde destaque, novo recebe coroa
- Líder exibido com destaque no card da listagem
- Remover membro do ministério sem excluir do sistema

### Reuniões
- Criar reunião com título e data (campos obrigatórios)
- Criar reunião de ministério vinculando um ministério
- Adicionar participantes via busca por nome
- Remover participante da lista antes de salvar
- Filtro por tipo de reunião (Ministério, Diretoria, Assembleia, Outra)
- Filtro por intervalo de datas
- Gerar ATA com IA a partir da pauta preenchida
- Editar texto da ATA gerada
- Salvar ATA — texto persiste ao recarregar a página
- Download do PDF da ATA
- Finalizar reunião — status muda para "Finalizada"
- Confirmação de presença disponível para Pastor, Diretoria e Líder
- Confirmação registra data e hora
- Usuário sem status permitido não vê botão de confirmação
- Excluir reunião com confirmação

### Dashboard
- Cards de resumo exibem números corretos (total, ativos, visitantes, afastados)
- Gráfico de status de membresia renderiza
- Gráfico de gênero renderiza
- Gráfico de faixa etária renderiza
- Gráfico de escolaridade renderiza
- Gráfico de principais bairros renderiza
- Gráfico de crescimento mensal renderiza
- Com banco vazio, gráficos exibem "Sem dados" sem erro

### Relatórios
- Tabela carrega todos os membros
- Filtro por status
- Filtro por gênero
- Filtro por escolaridade
- Filtro por cidade
- Filtro por "tem filhos"
- Filtro por integração concluída
- Filtro por autorização de imagem
- Filtro por batismo nas águas
- Múltiplos filtros combinados
- Limpar filtros restaura lista completa
- Exportar Excel sem filtros — todos os membros incluídos
- Exportar Excel com filtros — apenas membros filtrados incluídos
- Arquivo gerado contém duas abas: "Membros" e "Resumo"

### Controle de Acesso
**SUPER_ADMIN**
- Acesso a todas as funcionalidades
- Vê seção "Usuários do sistema" em Configurações
- Pode criar, alterar role e excluir usuários
- Pode excluir membros
- Pode cadastrar novos membros

**ADMIN**
- Pode editar qualquer membro
- Pode cadastrar novos membros
- Não vê seção de usuários em Configurações
- Não consegue excluir membros

**USER**
- Visualiza todas as telas
- Botão "Novo membro" não aparece
- Botão "Excluir" não aparece no perfil
- Botão "Editar" não aparece em membros de outros usuários
- Botão "Editar" aparece apenas no próprio registro
- Não vê seção de usuários em Configurações

### Configurações
- Alterar e-mail da conta
- Alterar senha com confirmação correta
- Erro ao confirmar senhas diferentes
- Erro ao digitar senha com menos de 6 caracteres
- Badge exibe corretamente o nível de acesso do usuário logado
- SUPER_ADMIN cria usuário com role USER
- SUPER_ADMIN cria usuário com role ADMIN
- SUPER_ADMIN altera role de um usuário existente
- SUPER_ADMIN exclui usuário — confirmação exigida
- Impedir exclusão da própria conta

### Responsividade
- Menu lateral oculto em telas menores que 1024px
- Botão hamburguer abre o menu lateral em mobile
- Clique fora do menu lateral fecha o menu
- Formulários de cadastro adaptados para telas menores
- Tabelas com scroll horizontal em mobile
- Dashboard com cards empilhados em mobile

## 3. Casos de Teste

### CT-001 — Login com credenciais válidas
**Objetivo**
Verificar que um usuário com e-mail e senha corretos consegue autenticar-se e ser redirecionado para o dashboard do sistema.

Pré-requisitos
- Usuário cadastrado e ativo no Supabase Auth
- Sistema acessível em http://localhost:3000 ou https://ibc-membership.vercel.app
- Usuário não está logado (sessão encerrada)

**Passos**
1. Acessar a tela de login ```/login```
2. Preencher o campo e-mail com um e-mail válido cadastrado
3. Preencher o campo senha com a senha correta
4. Clicar no botão "Entrar"

**Resultado esperado**
- O sistema autentica o usuário com sucesso
- O usuário é redirecionado para /dashboard
- O menu lateral é exibido com o nome do sistema
- Nenhuma mensagem de erro é exibida

**Resultado Obtido**
- Todos os itens esperados deste caso de teste foram atendidos. Melhorias levantadas no Jira.

**Status**
Passou

### CT-002 - Login com e-mail inválido
**Objetivo**
Verificar que o sistema rejeita tentativas de login com e-mail não cadastrado e exibe mensagem de erro adequada.

**Pré-condição**
- Sistema acessível
- Usuário não está logado

**Passos**
1. Acessar a tela de login /login
2. Preencher o campo e-mail com um endereço não cadastrado (ex: naoexiste@teste.com)
3. Preencher o campo senha com qualquer valor
4. Clicar no botão "Entrar"

**Resultado esperado**
- O sistema não autentica o usuário
- A mensagem "E-mail ou senha incorretos" é exibida na tela
- O usuário permanece na tela de login
- Nenhum redirecionamento ocorre

**Resultado obtido**
Todos os resultados esperados aconteceram.

**Status**
Passou

### CT-003 - Login com senha incorreta
Objetivo

Pré-condição

Passos
1. 
2. 
3. 

Resultado esperado

Resultado obtido

Status

### CT-004 - Login com campos vazios
Objetivo

Pré-condição

Passos
1. 
2. 
3. 

Resultado esperado

Resultado obtido

Status

### CT-005 - Redirecionamento para login ao acessar rota protegida sem sessão
Objetivo

Pré-condição

Passos
1. 
2. 
3. 

Resultado esperado

Resultado obtido

Status

### CT-006 - Logout e invalidação da sessão
Objetivo

Pré-condição

Passos
1. 
2. 
3. 

Resultado esperado

Resultado obtido

Status

### Tentativa de acesso ao dashboard após logout
Objetivo

Pré-condição

Passos
1. 
2. 
3. 

Resultado esperado

Resultado obtido

Status

## 3. Testes de CRUD por Módulo

### 3.1 Membros

#### CREATE — Cadastro de membro

**TC-MEM-001** — Cadastro mínimo (apenas nome)
```
Pré-condição: usuário logado como ADMIN ou SUPER_ADMIN
Ação: Preencher apenas "Nome completo" e salvar
Resultado: Membro criado com status "Membro Ativo" por padrão
```

**TC-MEM-002** — Cadastro completo
```
Pré-condição: usuário logado como ADMIN
Ação: Preencher todas as 5 abas e salvar
Resultado: Todos os campos salvos corretamente, visíveis no perfil
```

**TC-MEM-003** — Busca automática de CEP
```
Pré-condição: Aba "Contato" aberta
Ação: Digitar CEP válido (ex: 30130-010)
Resultado: Campos Rua, Bairro e Cidade preenchidos automaticamente
Verificar: ✓ aparece no campo CEP
```

**TC-MEM-004** — CEP inválido
```
Ação: Digitar CEP inexistente (ex: 99999-999)
Resultado: Campos de endereço permanecem em branco (sem erro visual)
```

**TC-MEM-005** — Máscara de telefone
```
Ação: Digitar "31999998888" no campo telefone
Resultado: Campo exibe "(31) 99999-8888"
```

**TC-MEM-006** — Admissão por ano (sem dia/mês)
```
Ação: Marcar "Não lembro o dia e mês" na data de admissão
Resultado: Campo de data some, select de ano aparece
Salvar: Ano salvo corretamente no banco
```

#### READ — Listagem e perfil

**TC-MEM-010** — Busca por nome
```
Ação: Digitar parte do nome no campo de busca
Resultado: Lista filtra em tempo real
```

**TC-MEM-011** — Busca por telefone
```
Ação: Digitar DDD e número no campo de busca
Resultado: Membro correspondente aparece
```

**TC-MEM-012** — Filtro por status
```
Ação: Selecionar "Pastor" no filtro de status
Resultado: Apenas membros com status "Pastor" aparecem
```

**TC-MEM-013** — Perfil completo
```
Ação: Clicar em "Ver" em qualquer membro
Resultado: Todas as seções (Pessoal, Contato, Família, Igreja, Saúde) visíveis
Verificar: Botão WhatsApp abre wa.me com número correto
Verificar: Botão e-mail abre cliente de e-mail
```

#### UPDATE — Edição

**TC-MEM-020** — Edição de campo simples
```
Ação: Editar telefone e salvar
Resultado: Novo telefone visível no perfil imediatamente
```

**TC-MEM-021** — Troca de status
```
Ação: Mudar status de "Membro Ativo" para "Afastado"
Resultado: Badge de status atualiza na lista e no perfil
```

**TC-MEM-022** — Campos vazios viram null
```
Ação: Apagar o conteúdo de um campo opcional e salvar
Resultado: Campo mostra "—" no perfil (não string vazia)
```

#### DELETE

**TC-MEM-030** — Exclusão com confirmação
```
Pré-condição: logado como SUPER_ADMIN
Ação: Clicar em "Excluir" no perfil
Resultado: Modal de confirmação aparece
Confirmar: Membro removido, redirecionado para /membros
```

**TC-MEM-031** — Botão excluir invisível para não-SUPER_ADMIN
```
Pré-condição: logado como ADMIN ou USER
Verificar: Botão "Excluir" não aparece no perfil de nenhum membro
```

---

### 3.2 PGMs (Células)

**TC-PGM-001** — Criar PGM com líder
```
Ação: Criar PGM selecionando um líder existente
Resultado: Card do PGM mostra nome do líder
```

**TC-PGM-002** — Adicionar membro ao PGM
```
Ação: Dentro de um PGM, buscar e adicionar membro
Resultado: Membro aparece na lista do PGM
Verificar: Contador "X membros" incrementa
```

**TC-PGM-003** — Remover membro do PGM
```
Ação: Clicar no ícone de lixeira ao lado de um membro
Resultado: Membro removido da lista do PGM
Verificar: Membro continua existindo em /membros (não foi deletado)
```

**TC-PGM-004** — Editar informações do PGM
```
Ação: Clicar no ícone de lápis no card do PGM
Resultado: Formulário abre com dados atuais
Salvar: Dados atualizados no card
```

---

### 3.3 Ministérios

**TC-MIN-001** — Adicionar membro com função
```
Ação: Buscar membro e preencher campo "Função" (ex: "Guitarrista")
Resultado: Tag colorida "Guitarrista" aparece ao lado do nome
```

**TC-MIN-002** — Editar função inline
```
Ação: Clicar na tag de função de um membro
Resultado: Campo de texto inline aparece
Editar e pressionar Enter: Função atualizada com nova cor
```

**TC-MIN-003** — Definir líder
```
Ação: Clicar em ★ ao lado de um membro
Resultado: Estrela fica amarela, card do líder aparece no topo com coroa
```

**TC-MIN-004** — Trocar líder
```
Ação: Clicar em ★ de outro membro quando já existe um líder
Resultado: Líder anterior perde a coroa, novo líder é destacado
```

**TC-MIN-005** — Líder visível na listagem
```
Verificar: Na página /ministerios, card mostra ★ + nome do líder
```

---

### 3.4 Reuniões

**TC-REU-001** — Criar reunião de ministério
```
Ação: Selecionar tipo "Ministério" e escolher um ministério
Resultado: Campo de ministério aparece ao selecionar tipo "Ministério"
```

**TC-REU-002** — Criar reunião sem participantes
```
Ação: Criar reunião sem adicionar ninguém
Resultado: Reunião criada com 0 participantes
```

**TC-REU-003** — Gerar ATA com IA
```
Pré-condição: GROQ_API_KEY configurada, pauta preenchida
Ação: Clicar em "Gerar ATA com IA"
Resultado: Texto formal em português aparece no editor em ~3 segundos
Verificar: Texto contém título, data, participantes e tópicos da pauta
```

**TC-REU-004** — Salvar ATA editada
```
Ação: Editar o texto da ATA e clicar em "Salvar ATA"
Resultado: Texto salvo, modo edição fecha, texto editado aparece
```

**TC-REU-005** — Download de PDF
```
Pré-condição: ATA salva
Ação: Clicar em "Baixar PDF"
Resultado: Arquivo .pdf é baixado com nome baseado no título da reunião
Verificar: PDF contém o texto completo da ATA
```

**TC-REU-006** — Finalizar reunião
```
Ação: Clicar em "Finalizar reunião"
Resultado: Status muda de "Rascunho" para "Finalizada"
Verificar: Badge verde "Finalizada" aparece
```

**TC-REU-007** — Confirmação de presença
```
Pré-condição: Membro com status "Pastor" vinculado ao user_id logado
Reunião finalizada
Ação: Acessar a reunião
Resultado: Botão "Confirmar minha presença" aparece
Clicar: Badge "Confirmado" aparece na lista de participantes
```

**TC-REU-008** — Filtro de data
```
Ação: Selecionar "De:" e "Até:" para um intervalo
Resultado: Apenas reuniões dentro do intervalo aparecem
Limpar: Todas as reuniões voltam a aparecer
```

---

### 3.5 Relatórios

**TC-REL-001** — Exportação sem filtros
```
Ação: Clicar em "Exportar Excel" sem filtros ativos
Resultado: Arquivo .xlsx baixado com todos os membros
Verificar: Duas abas — "Membros" e "Resumo"
```

**TC-REL-002** — Exportação com filtros
```
Ação: Filtrar por status "Pastor" e exportar
Resultado: Excel contém apenas membros com status "Pastor"
Verificar: Aba "Resumo" mostra "Status: Pastor" nos filtros aplicados
```

**TC-REL-003** — Múltiplos filtros combinados
```
Ação: Filtrar por gênero "Feminino" + integração "Concluiu"
Resultado: Lista mostra apenas mulheres que concluíram integração
```

### Casos de teste de permissão

**TC-PERM-001** — USER não vê botão "Cadastrar membro"
```
Pré-condição: Logado como USER
Verificar em /membros: Botão "Novo membro" não aparece
```

**TC-PERM-002** — USER não vê botão "Excluir" no perfil
```
Pré-condição: Logado como USER
Acessar perfil de qualquer membro
Verificar: Botão "Excluir" não aparece
```

**TC-PERM-003** — USER não vê botão "Editar" em membros de outros
```
Pré-condição: Logado como USER cujo user_id não está vinculado ao membro
Verificar: Botão "Editar" não aparece no perfil
```

**TC-PERM-004** — USER vê botão "Editar" no próprio registro
```
Pré-condição: USER com user_id vinculado a um membro
Acessar perfil do próprio membro
Verificar: Botão "Editar" aparece
```

**TC-PERM-005** — USER não vê seção de usuários em Configurações
```
Pré-condição: Logado como USER
Verificar em /configuracoes: Seção "Usuários do sistema" não aparece
```

**TC-PERM-006** — ADMIN não consegue criar usuário via API
```
Pré-condição: Logado como ADMIN
Tentar chamar POST /api/admin/criar-usuario
Resultado esperado: HTTP 403 Forbidden
```
