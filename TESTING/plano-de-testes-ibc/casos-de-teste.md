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
