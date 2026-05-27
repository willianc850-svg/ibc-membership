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
- [Login com e-mail inválido](#ct-002---login-com-e-mail-inválido)
- [Login com senha incorreta](#ct-003---login-com-senha-incorreta)
- [Login com campos vazios](#ct-004---login-com-campos-vazios)
- [Redirecionamento para login ao acessar rota protegida sem sessão](#ct-005---redirecionamento-para-login-ao-acessar-rota-protegida-sem-sessão)
- [Logout e invalidação da sessão](#ct-006---logout-e-invalidação-da-sessão)

### Gestão de Membros
**Cadastro**
- [Cadastro com apenas nome (campo mínimo obrigatório)](#ct-007---cadastro-com-apenas-nome-campo-mínimo-obrigatório)
- [Tentativa de salvar sem preencher o nome](#ct-008---tentativa-de-salvar-sem-preencher-o-nome)
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

### Autenticação

#### CT-001 — Login com credenciais válidas
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

#### CT-002 - Login com e-mail inválido
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

#### CT-003 - Login com senha incorreta
**Objetivo**
Verificar que o sistema rejeita tentativas de login com senha não cadastrada e exibe mensagem de erro adequada.

**Pré-condição**
- Sistema acessível
- Usuário não está logado

**Passos**
1. Acessar a tela de login /login
2. Preencher o campo e-mail com um endereço cadastrado 
3. Preencher o campo senha com qualquer valor (ex.: 123)
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

#### CT-004 - Login com campos vazios
**Objetivo**
Verificar que o sistema rejeita tentativas de login com campos de e-mail e senha em branco e exibe mensagem de erro adequada.

**Pré-condição**
- Sistema acessível
- Usuário não está logado

**Passos**
1. Acessar a tela de login /login
2. Deixar o campo de e-mail em branco
3. Deixar o campo de senha em branco
4. Clicar no botão "Entrar"

**Resultado esperado**
- O sistema não autentica o usuário
- A mensagem "Preencha este campo" é exibida na tela no campo de e-mail e no campo de senha
- O usuário permanece na tela de login
- Nenhum redirecionamento ocorre

**Resultado obtido**
Todos os resultados esperados aconteceram.

**Status**
Passou

#### CT-005 - Redirecionamento para login ao acessar rota protegida sem sessão
**Objetivo**
Garantir que um usuário sem sessão não possa acessar as funionalidades do sistema somente através da URL

**Pré-condição**
- Estar deslogado do sistema

**Passos**
1. Na tela de login, para garantir que o usuário está sem sessão, colocar a URL de alguma funcionalidade do sistema.
2. Utilizar a URL base "https://ibc-membership.vercel.app" e adicionar algum dos seguintes paths: /dashboard, /membros, /reunioes, /pgm, /ministerios, /relatorios e /configuracoes
3. Garantir que a URL volta para /login

**Resultado esperado**
É esperado que o usuário seja redirecionado para a tela de login após tentar acessar os paths internos do sistema.

**Resultado obtido**
Resultado obtido foi o resultado esperado.

**Status**
Passou

#### CT-006 - Logout e invalidação da sessão
**Objetivo**
Garantir que o usuário consiga encerrar sua sessão no sistema com sucesso e que, após o logout, as credenciais e os tokens de acesso sejam completamente invalidados, impedindo o acesso a páginas autenticadas através do botão de voltar do navegador ou de requisições diretas.

**Pré-condição**
- O usuário deve estar devidamente autenticado no sistema ibc-membership.
- O usuário deve estar em uma página que contenha a opção de "Sair" ou "Logout" (ex: Dashboard ou menu de perfil).

**Passos**
1. Clicar no botão/link de "Sair".
2. Tentar acessar diretamente a URL de uma página restrita do sistema ([ex: a URL do Dashboard](https://ibc-membership.vercel.app/dashboard)) inserindo-a na barra de endereço do navegador.
3. Clicar no botão "Voltar" (Back) do navegador.

**Resultado esperado**
O usuário deve ser redirecionado para a tela de login ou página inicial pública, cookies de sessão e tokens de autenticação devem ser destruídos ou invalidados no cliente e no servidor.
O sistema não deve permitir o acesso e deve redirecionar o usuário automaticamente para a tela de login ou retornar um erro de não autorizado (401/403).

**Resultado obtido**
Resultado obtido foi o resultado esperado.

**Status**
Passou

### Gestão de Membros

#### CT-007 - Cadastro com apenas nome (campo mínimo obrigatório)
**Objetivo**
Validar a criação do registro de um membro com sucesso preenchendo apenas o campo obrigatório (Nome).

**Pré-condição**
- O usuário deve estar na página de cadastro (https://ibc-membership.vercel.app/membros/novo).

**Passos**
1. Preencher apenas o primeiro campo, que é obrigatório (Nome Completo).
2. Deixar todos os demais campos opcionais em branco.
3. Clicar em "Salvar Membro".

**Resultado esperado**
- O sistema deve processar o cadastro com sucesso, direcionar o usuário para a tela de registros, e exibir uma mensagem de sucesso (ex: "Cadastro realizado com sucesso!").

**Resultado obtido**
Foi apresentado um erro na UI e status code 400 (Bad Request) no console, não foi possível criar o usuário apenas com o campo obrigatório preenchido. (Jira-KAN-7)

**Status**
Falhou

#### CT-008 - Tentativa de salvar sem preencher o nome
**Objetivo**
Validar que o sistema não registre um membro com os dados em branco.

**Pré-condição**
- O usuário deve estar na página de cadastro (https://ibc-membership.vercel.app/membros/novo).

**Passos**
1. Na tela de cadastros não preencher nenhum dado
2. Clicar no botão "Salvar Membro" 

**Resultado esperado**
É esperado que o sistema informe ao usuário que é necessário preencher pelo menos os itens obrigatórios para criação de um registro de membro e não crie o usuário.

**Resultado obtido**
O sistema retornou com a seguinte mensagem ao usuário "O nome completo é obrigatório." e não criou o usuário. 

**Status**
Passou

#### CT-009 - Cadastro com todos os campos preenchidos (5 abas)
**Objetivo**
Validar a criação de um membro com sucesso preenchendo a totalidade dos dados disponíveis (campos obrigatórios e opcionais) ao longo de todas as 5 abas do formulário de cadastro.

**Pré-condição**
O usuário deve estar autenticado no sistema, possuir permissão para cadastrar membros e estar na primeira aba do formulário de cadastro (https://ibc-membership.vercel.app/membros/novo).

**Passos**
1. Preencher todos os campos (obrigatórios e opcionais) da primeira aba e clicar em "Próximo".
2. Repetir o preenchimento de todos os campos disponíveis nas abas 2, 3 e 4, clicando em "Próximo" após a conclusão de cada uma.
3. Na quinta e última aba, preencher todos os campos restantes e clicar no botão "Salvar Membro".

**Resultado esperado**
O sistema deve processar a requisição sem erros, persistir todos os dados informados no banco de dados, fechar o formulário de cadastro e exibir uma mensagem de sucesso (ex: "Membro cadastrado com sucesso!").

**Resultado obtido**
O registro do membro foi criado, mas não apareceu a mensagem "Membro cadastrado com sucesso!". (Jira-KAN-8)

**Status**
Falhou

### PGMs — Pequenos Grupos Multiplicadores

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

### Ministérios

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

### Reuniões

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

### Dashboard

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

### Relatórios

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

### Controle de Acessos

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

### Configurações

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

### Responsividade

#### CT-XXX - SCRIPT
**Objetivo**

**Pré-condição**

**Passos**
1. 
2. 
3. 

**Resultado esperado**

**Resultado obtido**

**Status**

---

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
