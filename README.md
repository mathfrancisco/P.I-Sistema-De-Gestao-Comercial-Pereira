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

### Cenário Atual da Empresa

A Comercial Pereira possui uma base sólida de clientes e fornecedores estabelecida ao longo dos anos, mas enfrenta desafios operacionais típicos de empresas que ainda dependem de processos manuais:

- **Controle de Estoque Manual:** Planilhas Excel sujeitas a erros e desatualizações
- **Processo de Vendas Fragmentado:** Informações dispersas entre cadernos, fichas e sistemas isolados
- **Gestão de Clientes Limitada:** Dificuldade para acompanhar histórico e preferências
- **Relatórios Demorados:** Consolidação manual de dados para tomada de decisão
- **Falta de Integração:** Departamentos trabalhando com informações desencontradas

### Problema Identificado

A empresa necessita substituir processos manuais e planilhas por um sistema digital integrado que gerencie produtos, vendas, estoque, clientes e forneça relatórios analíticos para tomada de decisão estratégica, mantendo a agilidade operacional que caracteriza o negócio.

### Questão de Negócio Central

**“Como otimizar o controle de estoque, vendas e relacionamento com clientes da Comercial Pereira através de um sistema digital integrado que preserve a agilidade operacional e forneça informações estratégicas em tempo real?”**

## 🎯 Objetivos

### Objetivo Geral

Desenvolver um sistema web full-stack moderno que integre a gestão completa das operações comerciais da Comercial Pereira, digitalizando processos e centralizando informações para melhorar a eficiência operacional e suporte à decisão.

### Objetivos Específicos

- **Digitalizar o controle de produtos e estoque** com alertas automáticos e rastreabilidade
- **Automatizar o processo de vendas e faturamento** reduzindo erros e tempo de processamento
- **Centralizar a gestão de clientes e fornecedores** com histórico completo de relacionamento
- **Fornecer dashboards analíticos** para decisões estratégicas baseadas em dados
- **Garantir controles de acesso e segurança** adequados ao ambiente empresarial
- **Implementar interface intuitiva** que facilite a adoção pelos colaboradores

## 🏗️ Arquitetura do Sistema

### Visão Geral da Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│              ARQUITETURA MICROSERVIÇOS                      │
│                    (Docker Containers)                      │
├─────────────────────┬─────────────────────┬─────────────────┤
│    PRESENTATION     │      BUSINESS       │      DATA       │
│     (Frontend)      │     (Backend)       │   (Database)    │
│                     │                     │                 │
│ • React + MUI       │ • Spring Boot       │ • PostgreSQL    │
│ • TypeScript        │ • Java 17+          │ • JPA/Hibernate │
│ • Axios HTTP        │ • REST APIs         │ • Relationships │
│ • React Router      │ • Spring Security   │ • Transactions  │
│ • React Query       │ • Bean Validation   │ • Data Integrity│
│ • Material-UI       │ • JWT Authentication│ • Constraints   │
└─────────────────────┴─────────────────────┴─────────────────┘
```

### Arquitetura em Camadas

#### 1. **Camada de Apresentação (Frontend)**

- **Tecnologia:** React 18 + TypeScript + Material-UI
- **Responsabilidades:**
  - Interface do usuário responsiva e intuitiva
  - Validação client-side com React Hook Form
  - Gerenciamento de estado com React Query
  - Experiência do usuário otimizada para operações comerciais

#### 2. **Camada de Negócio (Backend)**

- **Tecnologia:** Spring Boot 3.2 + Java 17
- **Responsabilidades:**
  - API REST robusta e documentada
  - Implementação de regras de negócio específicas da Comercial Pereira
  - Autenticação e autorização baseada em perfis
  - Validação server-side e tratamento consistente de erros

#### 3. **Camada de Dados (Database)**

- **Tecnologia:** PostgreSQL + JPA/Hibernate
- **Responsabilidades:**
  - Persistência transacional de dados comerciais
  - Integridade referencial e constraints de negócio
  - Histórico completo de operações para auditoria
  - Estrutura otimizada para consultas analíticas

## 🔧 Stack Tecnológica

### Backend (Java + Spring Boot)

- **Java 17:** Linguagem robusta com recursos modernos
- **Spring Boot 3.2:** Framework para desenvolvimento ágil e produtivo
- **Spring Security:** Autenticação e autorização empresarial
- **Spring Data JPA:** Abstração elegante para acesso a dados
- **JWT:** Tokens seguros para autenticação stateless
- **Bean Validation:** Validação declarativa das regras de negócio
- **Swagger/OpenAPI:** Documentação automática e interativa da API

### Frontend (React + Material-UI)

- **React 18:** Biblioteca moderna para interfaces reativas
- **TypeScript:** Tipagem estática para maior robustez
- **Material-UI (MUI):** Componentes profissionais seguindo Material Design
- **React Router:** Navegação SPA otimizada
- **React Hook Form:** Gerenciamento eficiente de formulários comerciais
- **React Query:** Sincronização inteligente com backend
- **Recharts:** Visualização de dados para dashboards analíticos

### Banco de Dados e Infraestrutura

- **PostgreSQL:** SGBD robusto para dados transacionais
- **JPA/Hibernate:** ORM maduro para mapeamento objeto-relacional
- **Docker:** Containerização para ambientes consistentes
- **Docker Compose:** Orquestração simplificada de serviços

## 📊 Modelagem de Dados

### Diagrama Entidade-Relacionamento

```
┌─────────────┐    ┌──────────────┐    ┌─────────────┐
│    USER     │    │   CATEGORY   │    │  SUPPLIER   │
│             │    │              │    │             │
│ • id        │    │ • id         │    │ • id        │
│ • email     │    │ • name       │    │ • name      │
│ • password  │    │ • description│    │ • contact   │
│ • name      │    │ • active     │    │ • address   │
│ • role      │    │ • createdAt  │    │ • cnpj      │
│ • active    │    └──────────────┘    └─────────────┘
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
│ • discount  │   ││ • price      │         │ • phone     │
│ • createdAt │   ││ • code       │         │ • document  │
│ • userId    │   ││ • barcode    │         │ • address   │
│ • customerId│   │└──────────────┘         │ • createdAt │
└─────────────┘   │         │ 1:1           └─────────────┘
       │          │         ▼                       │
       │ 1:N      │  ┌──────────────┐               │ 1:N
       ▼          │  │  INVENTORY   │               │
┌─────────────┐   │  │              │               ▼
│  SALE_ITEM  │───┘  │ • productId  │         ┌─────────────┐
│             │      │ • quantity   │         │    SALE     │
│ • id        │      │ • minStock   │         │  (referência)│
│ • saleId    │      │ • maxStock   │         └─────────────┘
│ • productId │      │ • updatedAt  │
│ • quantity  │      │ • updatedBy  │
│ • unitPrice │      └──────────────┘
│ • total     │
└─────────────┘
```

### Principais Relacionamentos

- **User → Sale (1:N):** Rastreamento de vendas por usuário
- **Category → Product (1:N):** Organização por categorias comerciais
- **Product → Inventory (1:1):** Controle de estoque por produto
- **Customer → Sale (1:N):** Histórico completo de compras
- **Sale → SaleItem (1:N):** Detalhamento de itens vendidos
- **Product → SaleItem (1:N):** Análise de performance por produto

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
│     │ 🏭 Gestão de Fornecedores ←─── Administrador, Gerente│ │
│     │                                                       │ │
│     └─────────────────────────────────────────────────────────┘ │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Atores e Responsabilidades Específicas

#### 👤 **Administrador**

- Configurar usuários do sistema e definir permissões
- Manter categorias de produtos alinhadas com CNAEs da empresa
- Configurar fornecedores e parcerias comerciais
- Supervisionar integridade geral do sistema

#### 👤 **Vendedor**

- Processar vendas diárias com agilidade
- Consultar disponibilidade de produtos em tempo real
- Manter relacionamento atualizado com clientes
- Gerar relatórios de vendas por período

#### 👤 **Gerente**

- Acompanhar performance através de dashboards
- Analisar tendências de vendas e sazonalidade
- Gerenciar níveis de estoque e reposição
- Tomar decisões estratégicas baseadas em dados

## 🚀 Funcionalidades Principais

### 📦 **Módulo de Produtos**

- **Cadastro Completo:** Nome, descrição, código, código de barras, preço
- **Categorização:** Organização conforme segmentos da Comercial Pereira
- **Controle de Estoque:** Quantidades mínimas/máximas, alertas automáticos
- **Busca Inteligente:** Filtros por múltiplos critérios simultaneamente
- **Histórico de Preços:** Rastreamento de alterações para análise

### 💰 **Módulo de Vendas**

- **Interface de Venda:** Carrinho intuitivo com busca rápida de produtos
- **Cálculos Automáticos:** Totais, descontos, impostos conforme legislação
- **Gestão de Status:** Controle de fluxo (orçamento → venda → entrega)
- **Impressão:** Cupons, orçamentos e documentos fiscais
- **Integração de Estoque:** Atualização automática após confirmação

### 👥 **Módulo de Clientes**

- **Cadastro Detalhado:** Dados pessoais, comerciais e preferências
- **Histórico Completo:** Todas as transações e interações
- **Segmentação:** Classificação por volume, frequência e perfil
- **Relacionamento:** Anotações e observações para atendimento personalizado

### 📈 **Dashboard e Relatórios**

- **Visão Executiva:** KPIs principais em tempo real
- **Análise de Vendas:** Por período, produto, vendedor e cliente
- **Controle de Estoque:** Posição atual, movimentação e alertas
- **Indicadores Financeiros:** Faturamento, margem e lucratividade

## 🎓 Aspectos Acadêmicos

### Conceitos de Engenharia de Software Aplicados

#### 📋 **Levantamento e Análise de Requisitos**

**Requisitos Funcionais Identificados:**

- RF01: Sistema deve permitir autenticação de usuários por perfil
- RF02: Sistema deve gerenciar produtos com controle de estoque
- RF03: Sistema deve processar vendas com cálculo automático
- RF04: Sistema deve manter histórico completo de clientes
- RF05: Sistema deve gerar relatórios analíticos personalizáveis
- RF06: Sistema deve emitir alertas de estoque mínimo
- RF07: Sistema deve registrar todas as operações para auditoria

**Requisitos Não-Funcionais Prioritários:**

- RNF01: **Usabilidade** - Interface intuitiva para usuários não técnicos
- RNF02: **Confiabilidade** - Disponibilidade de 99% durante horário comercial
- RNF03: **Performance** - Tempo de resposta inferior a 3 segundos
- RNF04: **Segurança** - Autenticação robusta e controle de acesso
- RNF05: **Manutenibilidade** - Código documentado e estruturado

**Regras de Negócio da Comercial Pereira:**

- RN01: Venda só pode ser finalizada com produtos em estoque
- RN02: Preços podem ter descontos até limite por perfil de usuário
- RN03: Estoque mínimo deve disparar alerta automático
- RN04: Relatórios financeiros restritos a gerentes e administradores
- RN05: Backup automático de dados críticos

#### 🏗️ **Padrões de Arquitetura Implementados**

**Padrão MVC (Model-View-Controller):**

- **Model:** Entidades JPA representando regras de negócio
- **View:** Componentes React para apresentação
- **Controller:** Spring Controllers gerenciando requisições

**Padrão Repository:**

- Abstração da camada de dados com Spring Data JPA
- Centralização de queries e operações de banco
- Facilita testes unitários e manutenção

**Padrão DTO (Data Transfer Object):**

- Objetos específicos para transferência entre camadas
- Controle fino sobre dados expostos na API
- Validação centralizada com Bean Validation

#### 🔬 **Princípios SOLID Aplicados**

**Single Responsibility Principle (SRP):**

- Cada classe/serviço possui responsabilidade única e bem definida
- Controllers apenas gerenciam requisições HTTP
- Services implementam lógica de negócio específica

**Open/Closed Principle (OCP):**

- Sistema extensível via interfaces bem definidas
- Novos tipos de relatório podem ser adicionados sem modificar código existente

**Liskov Substitution Principle (LSP):**

- Implementações de interfaces são intercambiáveis
- Facilita testes com mocks e stubs

**Interface Segregation Principle (ISP):**

- Interfaces específicas e coesas
- Clientes não dependem de métodos que não utilizam

**Dependency Inversion Principle (DIP):**

- Dependências injetadas via Spring Framework
- Acoplamento reduzido entre camadas

#### 📚 **Metodologia de Desenvolvimento**

**Processo Iterativo e Incremental:**

- Desenvolvimento em sprints de 2 semanas
- Entrega contínua de valor para validação
- Feedback constante dos usuários da Comercial Pereira

**Versionamento e Colaboração:**

- Git com workflow estruturado (feature branches)
- Code review obrigatório antes de merge
- Documentação técnica atualizada continuamente

**Qualidade de Software:**

- Testes unitários para lógica de negócio crítica
- Testes de integração para APIs
- Análise estática de código com SonarQube

### Justificativas Técnicas e Acadêmicas

#### ✅ **Por que Spring Boot + React?**

**Do ponto de vista acadêmico:**

1. **Arquitetura Bem Definida:** Separação clara de responsabilidades
1. **Padrões Consolidados:** MVC, Repository, Dependency Injection
1. **Maturidade Tecnológica:** Frameworks testados em ambiente empresarial
1. **Curva de Aprendizado:** Tecnologias amplamente documentadas
1. **Escalabilidade:** Preparado para crescimento da Comercial Pereira

**Do ponto de vista empresarial:**

1. **Produtividade:** Desenvolvimento rápido com convenções
1. **Manutenibilidade:** Código organizado e padronizado
1. **Comunidade:** Vasto ecossistema e suporte técnico
1. **Integração:** Facilidade para integrar com sistemas terceiros
1. **Custos:** Tecnologias open-source reduzem investimento

#### ✅ **Por que PostgreSQL?**

**Características técnicas relevantes:**

1. **ACID Compliance:** Garante integridade das transações comerciais
1. **Relacionamentos Complexos:** Adequado para modelo de negócio da empresa
1. **Performance:** Otimizado para consultas analíticas complexas
1. **Extensibilidade:** Suporte a tipos de dados específicos do negócio
1. **Confiabilidade:** Histórico comprovado em aplicações críticas

#### ✅ **Por que Material-UI?**

**Benefícios para o projeto:**

1. **Consistência Visual:** Design system profissional
1. **Acessibilidade:** Componentes compatíveis com WCAG
1. **Produtividade:** Componentes prontos e customizáveis
1. **Responsividade:** Adaptação automática a dispositivos
1. **Documentação:** Guias completos e exemplos práticos

## 🎯 Resultados Esperados

### Impactos Operacionais na Comercial Pereira

#### 📈 **Melhorias Quantitativas**

- **70% redução** no tempo de processamento de vendas
- **100% eliminação** de erros de cálculo manual
- **50% redução** no tempo de consulta de estoque
- **90% redução** no tempo para gerar relatórios gerenciais

#### 🏆 **Melhorias Qualitativas**

- **Padronização** de processos operacionais
- **Rastreabilidade** completa de operações
- **Visibilidade** em tempo real do negócio
- **Profissionalização** da gestão comercial

### Contribuições Acadêmicas

#### 📚 **Aprendizado em Engenharia de Software**

- Aplicação prática de padrões arquiteturais
- Implementação de princípios de design de software
- Experiência com desenvolvimento full-stack moderno
- Compreensão de requisitos de sistemas empresariais

#### 🔬 **Competências Técnicas Desenvolvidas**

- Domínio de frameworks empresariais (Spring Boot)
- Expertise em desenvolvimento frontend moderno (React)
- Experiência com bancos de dados relacionais
- Conhecimento em containerização e DevOps

-----

**💡 Este projeto demonstra a aplicação efetiva de conceitos de engenharia de software para resolver problemas reais de negócio, combinando rigor acadêmico com valor prático para a Comercial Pereira.**- Redução de erros operacionais
- Melhoria na experiência do cliente

#### 📊 **Estratégicos**
- Dados para tomada de decisão
- Visibilidade completa do negócio
- Escalabilidade para crescimento
- Modernização da operação
