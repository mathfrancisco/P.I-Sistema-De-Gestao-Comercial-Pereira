# 🏢 Sistema de Gestão Comercial Pereira

## 📋 Sobre o Projeto

**Projeto Integrado de Engenharia de Software e Arquitetura de Sistemas**  
**Desenvolvido por:** Matheus Francisco - RA 24001882  
**Empresa:** Comercial Pereira José Leandro Cassiano Pereira  
**CNPJ:** 00.009.295/0001-67

### Contexto Empresarial

A Comercial Pereira é uma empresa consolidada no mercado atacadista e varejista, atuando em diversas categorias conforme seus CNAEs registrados:

- **Principal:** Comércio atacadista de equipamentos e artigos de uso pessoal e doméstico
- **Secundárias:** Embalagens, cosméticos, artigos de cama/mesa/banho, papelaria, ferragens, material elétrico e armarinho

### Problema Identificado

A empresa necessita substituir processos manuais e planilhas por um sistema digital integrado que gerencie produtos, vendas, estoque, clientes e forneça relatórios analíticos para tomada de decisão estratégica.

### Questão de Negócio Central

**"Como otimizar o controle de estoque, vendas e relacionamento com clientes da Comercial Pereira através de um sistema digital integrado?"**

## 🎯 Objetivos

### Objetivo Geral
Desenvolver um sistema web full-stack moderno que integre a gestão completa das operações comerciais da Comercial Pereira.

### Objetivos Específicos
- Digitalizar o controle de produtos e estoque
- Automatizar o processo de vendas e faturamento
- Centralizar a gestão de clientes e fornecedores
- Fornecer dashboards analíticos para decisões estratégicas
- Garantir performance e escalabilidade para crescimento futuro
- Implementar controles de acesso e segurança adequados

## 🏗️ Arquitetura do Sistema

### Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS 14 FULL-STACK                   │
│                      (App Router)                          │
├─────────────────────┬─────────────────────┬─────────────────┤
│    PRESENTATION     │      BUSINESS       │      DATA       │
│     (Frontend)      │    (API Routes)     │   (Database)    │
│                     │                     │                 │
│ • React Components  │ • RESTful APIs      │ • PostgreSQL    │
│ • Server Components │ • Authentication    │ • Prisma ORM    │
│ • Client Components │ • Validation        │ • Relationships │
│ • Forms & UI        │ • Business Logic    │ • Transactions  │
│ • State Management  │ • Error Handling    │ • Data Integrity│
└─────────────────────┴─────────────────────┴─────────────────┘
```

### Arquitetura em Camadas

#### 1. **Camada de Apresentação (Frontend)**
- **Tecnologia:** React 18 + TypeScript
- **Responsabilidades:**
  - Interface do usuário responsiva
  - Validação client-side
  - Gerenciamento de estado local
  - Experiência do usuário otimizada

#### 2. **Camada de Negócio (API Routes)**
- **Tecnologia:** Next.js API Routes + TypeScript
- **Responsabilidades:**
  - Lógica de negócio
  - Validação server-side
  - Autenticação e autorização
  - Processamento de transações

#### 3. **Camada de Dados (Database)**
- **Tecnologia:** PostgreSQL + Prisma ORM
- **Responsabilidades:**
  - Persistência de dados
  - Integridade referencial
  - Otimização de queries
  - Backup e recuperação

## 🔧 Stack Tecnológica

### Framework Principal
- **Next.js 14:** Framework React full-stack com App Router
- **TypeScript:** Tipagem estática para robustez e manutenibilidade

### Frontend
- **React 18:** Biblioteca para construção de interfaces
- **TailwindCSS:** Framework CSS utilitário para estilização
- **React Hook Form:** Gerenciamento de formulários
- **Zod:** Validação de schemas
- **Recharts:** Visualização de dados e gráficos
- **Lucide React:** Biblioteca de ícones

### Backend
- **Next.js API Routes:** Endpoints serverless integrados
- **NextAuth.js:** Sistema de autenticação robusto
- **Prisma:** ORM moderno com type-safety
- **bcrypt:** Hash seguro de senhas

### Banco de Dados
- **PostgreSQL:** Sistema de gerenciamento de banco relacional
- **Prisma Client:** Interface type-safe para o banco

### Infraestrutura
- **Vercel:** Plataforma de deploy e hosting
- **Vercel Postgres:** Banco de dados gerenciado

## 📊 Modelagem de Dados

### Diagrama Entidade-Relacionamento (Conceitual)

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    USER     │    │   CATEGORY   │    │  SUPPLIER   │
│             │    │              │    │             │
│ • id        │    │ • id         │    │ • id        │
│ • email     │    │ • name       │    │ • name      │
│ • password  │    │ • description│    │ • contact   │
│ • name      │    │              │    │ • address   │
│ • role      │    └──────────────┘    └─────────────┘
└─────────────┘             │                   │
       │                    │                   │
       │ 1:N                │ 1:N               │ 1:N
       ▼                    ▼                   ▼
┌─────────────┐    ┌──────────────┐         ┌─────────────┐
│    SALE     │    │   PRODUCT    │         │  CUSTOMER   │
│             │    │              │         │             │
│ • id        │◄──┐│ • id         │         │ • id        │
│ • total     │   ││ • name       │         │ • name      │
│ • status    │   ││ • description│         │ • email     │
│ • createdAt │   ││ • price      │         │ • phone     │
└─────────────┘   ││ • code       │         │ • document  │
       │          │└──────────────┘         └─────────────┘
       │ 1:N      │         │ 1:1                   │
       ▼          │         ▼                       │ 1:N
┌─────────────┐   │  ┌──────────────┐               │
│  SALE_ITEM  │───┘  │  INVENTORY   │               ▼
│             │      │              │         ┌─────────────┐
│ • quantity  │      │ • quantity   │         │    SALE     │
│ • price     │      │ • minStock   │         │  (referência)│
│ • total     │      │ • updatedAt  │         └─────────────┘
└─────────────┘      └──────────────┘
```

### Principais Relacionamentos
- **User → Sale (1:N):** Um usuário pode realizar várias vendas
- **Category → Product (1:N):** Uma categoria possui vários produtos
- **Product → Inventory (1:1):** Cada produto possui um registro de estoque
- **Customer → Sale (1:N):** Um cliente pode ter várias compras
- **Sale → SaleItem (1:N):** Uma venda possui vários itens
- **Product → SaleItem (1:N):** Um produto pode estar em várias vendas

## 🔄 Diagrama de Casos de Uso

```
                    Sistema de Gestão Comercial Pereira
                              
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  👤 Administrador              👤 Vendedor        👤 Gerente    │
│                                                                 │
│     ┌─────────────────────────────────────────────────────────┐ │
│     │                 CASOS DE USO                           │ │
│     │                                                       │ │
│     │ 🔐 Gestão de Usuários ←─── Administrador              │ │
│     │ 📦 Gestão de Produtos ←─── Administrador, Gerente     │ │
│     │ 🏪 Gestão de Categorias ←─── Administrador            │ │
│     │ 👥 Gestão de Clientes ←─── Vendedor, Gerente         │ │
│     │ 💰 Processamento de Vendas ←─── Vendedor              │ │
│     │ 📊 Visualização de Relatórios ←─── Gerente            │ │
│     │ 📈 Dashboard Analítico ←─── Gerente                   │ │
│     │ 🔍 Consulta de Estoque ←─── Vendedor, Gerente        │ │
│     │ ⚠️  Alertas de Estoque ←─── Gerente                  │ │
│     │                                                       │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Atores e Responsabilidades

#### 👤 **Administrador**
- Gerenciar usuários do sistema
- Configurar categorias de produtos
- Definir permissões e acessos
- Manutenção geral do sistema

#### 👤 **Vendedor**
- Processar vendas e pedidos
- Consultar produtos e estoque
- Gerenciar dados de clientes
- Emitir relatórios de vendas

#### 👤 **Gerente**
- Visualizar dashboards analíticos
- Gerenciar produtos e categorias
- Acompanhar métricas de performance
- Receber alertas de estoque baixo

## 🌐 Fluxo de Arquitetura de Dados

### Fluxo de Requisição Típico

```
1. 🖥️  CLIENT REQUEST
   │
   │ HTTPS
   ▼
2. 🛡️  MIDDLEWARE
   │ • Authentication
   │ • Rate Limiting
   │ • CORS
   ▼
3. 📡 API ROUTE
   │ • Validation (Zod)
   │ • Business Logic
   │ • Error Handling
   ▼
4. 🗄️  PRISMA ORM
   │ • Query Building
   │ • Type Safety
   │ • Connection Pool
   ▼
5. 🐘 POSTGRESQL
   │ • Data Persistence
   │ • ACID Transactions
   │ • Referential Integrity
   ▼
6. 📤 RESPONSE
   │ • JSON Serialization
   │ • Error Formatting
   │ • Status Codes
   ▼
7. ⚛️  REACT COMPONENT
   │ • State Update
   │ • UI Re-render
   │ • User Feedback
```

## 📁 Estrutura do Projeto

### Organização de Diretórios

```
comercial-pereira-sistema/
│
├── 📱 app/                          # App Router (Next.js 14)
│   ├── 🔐 (auth)/                  # Grupo de rotas - Autenticação
│   │   ├── login/
│   │   ├── register/
│   │   └── layout.tsx
│   │
│   ├── 📊 (dashboard)/             # Grupo de rotas - Sistema Principal
│   │   ├── produtos/
│   │   ├── vendas/
│   │   ├── clientes/
│   │   ├── relatorios/
│   │   └── layout.tsx
│   │
│   ├── 🔌 api/                     # API Routes
│   │   ├── auth/
│   │   ├── products/
│   │   ├── sales/
│   │   ├── customers/
│   │   └── dashboard/
│   │
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── 🧩 components/                  # Componentes React
│   ├── ui/                        # Componentes base
│   ├── forms/                     # Formulários
│   ├── charts/                    # Gráficos
│   └── layout/                    # Layout components
│
├── 📚 lib/                        # Bibliotecas e utilitários
│   ├── auth.ts                    # NextAuth config
│   ├── db.ts                      # Prisma client
│   ├── validations/               # Schemas Zod
│   └── utils.ts
│
├── 🗄️ prisma/                     # Banco de dados
│   ├── schema.prisma              # Schema
│   ├── migrations/                # Migrações
│   └── seed.ts                    # Dados iniciais
│
├── 🏷️ types/                       # Tipos TypeScript
│   └── index.ts
│
└── ⚙️ middleware.ts               # Middleware global
```

## 🚀 Funcionalidades Principais

### 📦 **Módulo de Produtos**
- **CRUD Completo:** Criar, visualizar, editar e excluir produtos
- **Categorização:** Organização por categorias da empresa
- **Busca Avançada:** Filtros por nome, categoria e código
- **Controle de Estoque:** Integração com inventário
- **Validações:** Dados obrigatórios e formatos corretos

### 💰 **Módulo de Vendas**
- **Carrinho de Compras:** Interface intuitiva para seleção
- **Processamento:** Cálculos automáticos de totais
- **Status:** Controle de status de pedidos
- **Histórico:** Registro completo de transações
- **Integração:** Atualização automática do estoque

### 👥 **Módulo de Clientes**
- **Cadastro Completo:** Dados pessoais e comerciais
- **Histórico de Compras:** Rastreamento de relacionamento
- **Segmentação:** Classificação por perfil
- **Busca:** Localização rápida por diversos critérios

### 📈 **Dashboard Analítico**
- **Métricas em Tempo Real:** KPIs principais
- **Gráficos Interativos:** Visualizações dinâmicas
- **Relatórios:** Análises de vendas e estoque
- **Alertas:** Notificações de estoque baixo

## 🛡️ Segurança e Autenticação

### Estratégia de Segurança

#### 🔐 **Autenticação**
- **NextAuth.js:** Framework robusto e seguro
- **JWT Tokens:** Sessões stateless
- **Bcrypt:** Hash seguro de senhas
- **Rate Limiting:** Proteção contra ataques

#### 🔒 **Autorização**
- **Role-Based Access:** Controle por perfis
- **Route Protection:** Middleware de proteção
- **API Security:** Validação em todas as rotas
- **CORS:** Configuração adequada

#### 🛡️ **Validação de Dados**
- **Zod Schemas:** Validação type-safe
- **Client + Server:** Validação dupla camada
- **Sanitização:** Prevenção de XSS
- **SQL Injection:** Proteção via Prisma ORM

## 📊 Performance e Otimização

### Estratégias de Performance

#### ⚡ **Next.js Optimizations**
- **Server-Side Rendering (SSR):** Carregamento inicial otimizado
- **Incremental Static Regeneration (ISR):** Cache inteligente
- **Automatic Code Splitting:** Bundles otimizados
- **Image Optimization:** Otimização automática de imagens

#### 🗄️ **Database Optimizations**
- **Connection Pooling:** Gerenciamento eficiente de conexões
- **Query Optimization:** Queries otimizadas pelo Prisma
- **Indexing:** Índices adequados para performance
- **Caching:** Estratégias de cache para dados frequentes

## 🎓 Aspectos Acadêmicos

### Conceitos de Engenharia de Software Aplicados

#### 📋 **Levantamento de Requisitos**
- **Funcionais:** CRUD, relatórios, autenticação
- **Não-Funcionais:** Performance, segurança, usabilidade
- **Regras de Negócio:** Específicas da Comercial Pereira

#### 🏗️ **Arquitetura de Software**
- **Padrões:** MVC adaptado, Repository Pattern
- **Princípios SOLID:** Aplicados na estruturação
- **Clean Architecture:** Separação de responsabilidades

#### 🔄 **Metodologia de Desenvolvimento**
- **Iterativo e Incremental:** Desenvolvimento por sprints
- **Versionamento:** Git com workflow estruturado
- **Documentação:** Código autodocumentado e README

### Justificativas Técnicas

#### ✅ **Por que Next.js Full-Stack?**
1. **Produtividade:** Desenvolvimento mais rápido
2. **Type Safety:** Redução significativa de bugs
3. **Performance:** Otimizações automáticas
4. **Escalabilidade:** Arquitetura serverless
5. **Manutenibilidade:** Código organizado e tipado

#### ✅ **Por que PostgreSQL?**
1. **ACID Compliance:** Transações seguras
2. **Relacionamentos Complexos:** Adequado para o domínio
3. **Performance:** Otimizado para consultas complexas
4. **Confiabilidade:** Banco maduro e estável

## 🎯 Resultados Esperados

### Métricas de Sucesso

#### 📈 **Operacionais**
- ⏱️ **70% redução** no tempo de cadastro de produtos
- 🎯 **100% eliminação** de erros de cálculo manual
- 🚀 **40% aumento** na velocidade de atendimento
- 📊 **Visibilidade em tempo real** do status de estoque

#### 🏆 **Técnicas**
- ⚡ **< 2 segundos** tempo de carregamento de páginas
- 📱 **100% responsivo** em dispositivos móveis
- 🛡️ **Zero vulnerabilidades** conhecidas
- 📊 **99% uptime** de disponibilidade

### Benefícios para a Comercial Pereira

#### 💼 **Operacionais**
- Automatização de processos manuais
- Centralização de informações
- Redução de erros operacionais
- Melhoria na experiência do cliente

#### 📊 **Estratégicos**
- Dados para tomada de decisão
- Visibilidade completa do negócio
- Escalabilidade para crescimento
- Modernização da operação
