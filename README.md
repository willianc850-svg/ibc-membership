# IBC Membership

Sistema web de gestão de membros para igrejas, desenvolvido com Next.js, Supabase e Tailwind CSS.

---

## Sumário

- [Visão Geral](#visão-geral)
- [Funcionalidades](#funcionalidades)
- [Stack Tecnológica](#stack-tecnológica)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Pré-requisitos](#pré-requisitos)
- [Instalação e Configuração](#instalação-e-configuração)
- [Variáveis de Ambiente](#variáveis-de-ambiente)
- [Banco de Dados](#banco-de-dados)
- [Níveis de Acesso](#níveis-de-acesso)
- [Testes](#testes)
- [Deploy](#deploy)

---

## Visão Geral

O **IBC Membership** é uma aplicação full-stack para gestão completa de membros de uma igreja. Permite cadastrar membros, organizar células e ministérios, registrar reuniões com geração de ATA por IA, visualizar relatórios demográficos e controlar o acesso por níveis de permissão.

---

## Funcionalidades

### 👥 Gestão de Membros
- Cadastro completo com foto, dados pessoais, eclesiásticos, de saúde e contato
- Formulário em 5 abas: Pessoal, Contato, Família, Igreja, Saúde & Extra
- Busca automática de endereço por CEP (ViaCEP)
- Máscara automática de telefone
- Filtros por status, gênero, cidade e mais
- Edição e exclusão de registros

### 📊 Dashboard
- Cards de resumo: total de membros, ativos, visitantes, afastados
- Gráficos de: status de membresia, gênero, faixa etária, escolaridade, bairros e crescimento mensal

### 🏘️ PGMs — Pequenos Grupos Multiplicadores
- Cadastro de grupos com líder, bairro, dia e horário
- Vínculo de membros aos grupos
- Visualização dos participantes de cada grupo

### ✋ Ministérios
- Cadastro e gestão de ministérios
- Vínculo de membros com definição de função (cantor, baterista, professor etc.)
- Tags coloridas por função
- Destaque visual do líder do ministério

### 📅 Reuniões
- Registro de reuniões por tipo: Ministério, Diretoria, Assembleia, Outra
- Pauta, local, horário e lista de participantes
- **Geração de ATA com IA** (Groq/Llama): secretária informa os tópicos e a IA gera o texto formal
- Editor de texto para revisão da ATA
- Download da ATA em PDF
- Confirmação de presença digital por Pastores, Diretoria e Líderes
- Filtro por tipo e intervalo de datas

### 📋 Relatórios
- Tabela completa de membros com 8 filtros combinados
- Exportação para Excel (.xlsx) com aba de resumo estatístico

### 🔐 Configurações e Acesso
- Gestão de usuários do sistema (criar, editar role, excluir)
- Três níveis de permissão: SUPER_ADMIN, ADMIN, USER
- Alteração de e-mail e senha da conta

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| Linguagem | TypeScript |
| Estilização | Tailwind CSS v4 |
| Banco de Dados | Supabase (PostgreSQL) |
| Autenticação | Supabase Auth (JWT) |
| Gráficos | Recharts |
| Ícones | Lucide React |
| Excel | SheetJS (xlsx) |
| PDF | jsPDF |
| IA (ATA) | Groq API — Llama 3.3 70B |
| CEP | ViaCEP (API pública) |
| Deploy | Vercel |

---

## Estrutura do Projeto

```
ibc-membership/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   └── login/
│   │   │       └── page.tsx              # Tela de login
│   │   ├── (dashboard)/
│   │   │   ├── layout.tsx                # Layout com sidebar responsiva
│   │   │   ├── dashboard/
│   │   │   │   └── page.tsx              # Dashboard com gráficos
│   │   │   ├── membros/
│   │   │   │   ├── page.tsx              # Lista e busca de membros
│   │   │   │   ├── novo/
│   │   │   │   │   └── page.tsx          # Cadastro novo membro (5 abas)
│   │   │   │   └── [id]/
│   │   │   │       ├── page.tsx          # Perfil completo do membro
│   │   │   │       └── editar/
│   │   │   │           └── page.tsx      # Edição do membro
│   │   │   ├── pgm/
│   │   │   │   ├── page.tsx              # Lista de PGMs
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Detalhes e membros do PGM
│   │   │   ├── ministerios/
│   │   │   │   ├── page.tsx              # Lista de ministérios
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Detalhes, funções e líder
│   │   │   ├── reunioes/
│   │   │   │   ├── page.tsx              # Lista de reuniões com filtros
│   │   │   │   ├── nova/
│   │   │   │   │   └── page.tsx          # Criar nova reunião
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx          # Detalhes, ATA e confirmações
│   │   │   ├── relatorios/
│   │   │   │   └── page.tsx              # Relatórios com filtros e exportação
│   │   │   └── configuracoes/
│   │   │       └── page.tsx              # Usuários e configurações da conta
│   │   ├── api/
│   │   │   ├── admin/
│   │   │   │   ├── criar-usuario/
│   │   │   │   │   └── route.ts          # POST — cria usuário (SUPER_ADMIN)
│   │   │   │   ├── listar-usuarios/
│   │   │   │   │   └── route.ts          # GET — lista usuários (SUPER_ADMIN)
│   │   │   │   └── deletar-usuario/
│   │   │   │       └── route.ts          # DELETE — remove usuário (SUPER_ADMIN)
│   │   │   └── gerar-ata/
│   │   │       └── route.ts              # POST — gera ATA via IA (Groq)
│   │   ├── layout.tsx                    # Layout raiz (html, body, metadata)
│   │   └── page.tsx                      # Redireciona para /dashboard
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Cliente Supabase para o browser
│   │   │   └── server.ts                 # Cliente Supabase para o servidor
│   │   └── hooks/
│   │       └── usePermissao.ts           # Hook de roles e permissões
│   └── proxy.ts                          # Middleware de autenticação (proteção de rotas)
├── .env.local                            # Variáveis de ambiente (não versionar)
├── .gitignore
├── next.config.ts
├── package.json
├── postcss.config.mjs
└── tsconfig.json
```

---

## Pré-requisitos

- Node.js 18+
- Conta no [Supabase](https://supabase.com)
- Conta no [Groq](https://console.groq.com) (para geração de ATA com IA)
- Git

---

## Instalação e Configuração

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/ibc-membership.git
cd ibc-membership

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env.local
# Edite o .env.local com suas credenciais

# 4. Execute as migrations no Supabase SQL Editor
# (veja a seção Banco de Dados abaixo)

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000)

---

## Variáveis de Ambiente

Crie o arquivo `.env.local` na raiz do projeto:

```env
# Supabase — encontre em: Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua-anon-key

# Supabase Service Role — nunca expor no frontend
SUPABASE_SERVICE_ROLE_KEY=sua-service-role-key

# Groq — console.groq.com → API Keys
GROQ_API_KEY=sua-groq-api-key
```

> ⚠️ Nunca suba o `.env.local` para o GitHub. Ele já está no `.gitignore` por padrão.

---

## Banco de Dados

Execute os SQLs abaixo no **SQL Editor** do Supabase em ordem:

### 1. Tabelas principais

```sql
CREATE TABLE membros ( ... );
CREATE TABLE celulas ( ... );
CREATE TABLE ministerios ( ... );
CREATE TABLE membros_celulas ( ... );
CREATE TABLE membros_ministerios ( ... );
CREATE TABLE eventos_membros ( ... );
CREATE TABLE perfis ( ... );
CREATE TABLE reunioes ( ... );
CREATE TABLE reuniao_participantes ( ... );
```

> Os SQLs completos estão em `docs/migrations.sql`

### 2. Row Level Security

```sql
-- Habilitar RLS em todas as tabelas
ALTER TABLE membros ENABLE ROW LEVEL SECURITY;
-- ... (ver docs/rls-policies.sql)
```

---

## Níveis de Acesso

| Role | Permissões |
|---|---|
| `SUPER_ADMIN` | Acesso total. Cria, edita e deleta qualquer registro. Gerencia usuários do sistema. |
| `ADMIN` | Edita qualquer registro de membro. Não gerencia usuários. |
| `USER` | Visualiza tudo. Edita apenas o próprio registro de membro. |

O primeiro usuário deve ser promovido a SUPER_ADMIN manualmente via SQL:

```sql
UPDATE perfis SET role = 'SUPER_ADMIN'
WHERE id = (SELECT id FROM auth.users WHERE email = 'seu@email.com');
```

---

## Testes

Consulte o arquivo [TESTING.md](TESTING\plano-de-testes\TESTING.md) para o plano completo de testes, incluindo:

- Regras de qualidade do projeto
- Smoke tests (verificação básica)
- Testes de CRUD por módulo
- Testes automatizados com Cypress
- Testes de API com Postman/cURL
- Checklist de regressão

---

## Deploy

O projeto é otimizado para deploy na **Vercel**:

```bash
# 1. Suba o código para o GitHub
git push origin main

# 2. Importe o repositório na Vercel (vercel.com)
# 3. Configure as variáveis de ambiente na Vercel
# 4. Clique em Deploy
```

Após o deploy, adicione a URL gerada nas configurações do Supabase:
**Authentication → URL Configuration → Redirect URLs**

```
https://seu-projeto.vercel.app/**
```
