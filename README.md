# IBC Membership

Sistema de gerenciamento de membresia para igrejas, desenvolvido para centralizar informações de membros, visitantes, ministérios e dados estratégicos que auxiliam na organização pastoral, administrativa e ministerial.

## Objetivo

O IBC Membership foi criado para facilitar o acompanhamento da membresia da igreja de forma integrada, permitindo acesso rápido a informações importantes para:

- organização de eventos;
- acompanhamento pastoral;
- gestão ministerial;
- análise demográfica;
- integração entre departamentos;
- controle de membros e visitantes;
- apoio em emergências durante eventos;
- planejamento baseado em faixa etária e perfil dos membros.

---

## Funcionalidades

### Gestão de membros
- Cadastro de membros e visitantes
- Edição de informações pessoais
- Controle de status da pessoa
- Histórico de participação

### Ministérios
- Associação de membros aos ministérios
- Controle de equipes e departamentos
- Visualização de atuação ministerial

### Informações estratégicas
- Região demográfica
- Faixa etária
- Tipo sanguíneo
- Situação de membresia
- Participação ministerial
- Controle financeiro básico

### Relatórios
- Relatórios administrativos
- Informações para eventos
- Dados demográficos
- Apoio à liderança da igreja

---

## Tecnologias utilizadas

- Next.js
- React
- TypeScript
- App Router
- CSS Global
- Node.js

---

## Estrutura do projeto

```text
src/
 ├── app/
 │   ├── (auth)/
 │   ├── (dashboard)/
 │   │   ├── configuracoes/
 │   │   ├── dashboard/
 │   │   ├── membros/
 │   │   ├── ministerios/
 │   │   ├── pgm/
 │   │   └── relatorios/
 │   ├── globals.css
 │   ├── layout.tsx
 │   └── page.tsx
 ├── lib/
 └── proxy.ts
```

---

## Como executar o projeto

### Clone o repositório

```bash
git clone https://github.com/willianc850-svg/ibc-membership.git
```

### Acesse a pasta

```bash
cd ibc-membership
```

### Instale as dependências

```bash
npm install
```

### Execute o projeto

```bash
npm run dev
```

O sistema ficará disponível em:

```text
http://localhost:3000
```

---

## Roadmap

- [ ] Controle completo de visitantes
- [ ] Dashboard analítico
- [ ] Integração financeira
- [ ] Gestão de eventos
- [ ] Controle de PGM
- [ ] Sistema de permissões
- [ ] Integração com WhatsApp
- [ ] Aplicativo mobile

---

## Público-alvo

- Igrejas locais
- Secretarias eclesiásticas
- Pastores
- Líderes ministeriais
- Administração de eventos
- Coordenação de pequenos grupos

---

## Contribuição

Contribuições são bem-vindas para melhorias no sistema, novas funcionalidades e correções.

---

## Licença

Este projeto está sob a licença MIT.