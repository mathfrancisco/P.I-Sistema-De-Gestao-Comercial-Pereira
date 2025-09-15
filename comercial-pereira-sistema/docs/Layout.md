# 📦 **COMPONENTES, LAYOUTS E MÓDULOS - SISTEMA COMERCIAL PEREIRA**

## **PARTE 1: COMPONENTES BASE DO SISTEMA**

### **1.1 SIDEBAR COMPONENT**

#### **Estrutura e Hierarquia**

O Sidebar será o elemento de navegação principal, ocupando 280px de largura em desktop. Terá estrutura vertical dividida em três seções principais: header com branding, menu de navegação e footer com informações do usuário.

**Header Section**: Logo da Comercial Pereira centralizado com altura de 60px. Nome da empresa abaixo em fonte menor. Linha divisória sutil separando do menu.

**Navigation Section**: Dividida em dois grupos - GENERAL e TOOLS. Cada item terá ícone à esquerda (20px), label e contador opcional à direita. Padding vertical de 12px por item para área de clique confortável. Item ativo com background azul claro (#EBF5FF) e texto azul (#0066FF). Hover states com transição suave de 200ms.

**Itens do Menu GENERAL**:
- Dashboard (ícone de grid)
- Produtos com submenu expansível para categorias
- Transações com badge contador
- Clientes
- Relatórios de Vendas

**Itens do Menu TOOLS**:
- Configurações da Conta
- Ajuda e Suporte
- Toggle Dark Mode

**Footer Section**: Avatar circular do usuário (40px). Nome e role em duas linhas. Ícone de chevron indicando menu dropdown. Dropdown com opções de Perfil, Configurações e Logout.

#### **Comportamentos e Estados**

**Responsividade**: Em tablets (768px-1024px), sidebar colapsa mostrando apenas ícones. Tooltip aparece no hover com nome completo. Em mobile (<768px), transforma em drawer que sobrepõe conteúdo.

**Persistência**: Estado expandido/colapsado salvo no localStorage. Última página ativa destacada ao retornar. Scroll position mantida em menus longos.

**Animações**: Slide-in da esquerda ao abrir em mobile. Fade-in dos itens sequencialmente no primeiro load. Micro-animações nos ícones ao hover.

### **1.2 HEADER COMPONENT**

#### **Layout e Elementos**

Altura fixa de 70px com background branco e sombra sutil inferior. Grid de três colunas: breadcrumb (25%), busca (50%), ações (25%).

**Breadcrumb Navigation**: Mostra até 3 níveis de navegação. Home sempre como primeiro item. Separadores com ícone chevron-right. Último item em negrito sem link. Truncate com ellipsis em textos longos.

**Search Global**: Input centralizado com largura máxima de 500px. Ícone de lupa à esquerda dentro do input. Placeholder contextual baseado na página atual. Shortcut indicator (Cmd+K ou Ctrl+K). Dropdown de resultados com categorização.

**Actions Area**: Ícone de sino com badge vermelho para notificações. Contador até 9, depois mostra 9+. Ícone de carrinho para vendas rápidas. Avatar do usuário com status online indicator. Nome do usuário em desktop, apenas avatar em mobile.

#### **Funcionalidades Avançadas**

**Search Behavior**: Debounce de 300ms para evitar requests excessivos. Mínimo de 2 caracteres para iniciar busca. Resultados agrupados por tipo (Produtos, Clientes, Pedidos). Máximo de 5 resultados por categoria. Link "Ver todos" para busca completa.

**Notifications Dropdown**: Lista de até 10 notificações recentes. Agrupamento por tipo com ícones diferentes. Time ago format (há 2 minutos, ontem, etc). Mark all as read action. Link para centro de notificações completo.

### **1.3 DATA TABLE COMPONENT**

#### **Estrutura da Tabela**

Container com background branco e border-radius de 12px. Padding interno de 20px. Header da tabela com background cinza claro (#F8F9FA).

**Table Header**: Checkbox master para seleção total. Colunas com labels em fonte semi-bold. Ícones de sort (up/down/both) alinhados à direita. Larguras de coluna ajustáveis via drag. Menu de colunas visíveis via botão de configuração.

**Table Body**: Linhas com altura mínima de 56px. Hover state com background cinza muito claro. Seleção múltipla com checkbox em cada linha. Células com padding horizontal de 16px. Alinhamento baseado no tipo de dado.

**Table Footer**: Informação de registros (1-10 de 256 itens). Seletor de itens por página (10, 25, 50, 100). Paginação com botões previous/next. Input direto de página para navegação rápida.

#### **Tipos de Células Especiais**

**Status Badges**: Pills com 8px de border-radius. Texto em uppercase com font-size menor. Cores semânticas mantendo acessibilidade. Ícone opcional à esquerda do texto.

**Action Buttons**: Grupo de 3 ícones (view, edit, delete). Tooltip no hover explicando ação. Modal de confirmação para ações destrutivas. Loading state durante processamento.

**Data Formatting**: Datas em formato DD/MM/YYYY. Valores monetários com R$ e separadores. Percentuais com indicador de tendência. Textos longos com truncate e tooltip.

### **1.4 FORM COMPONENTS**

#### **Input Component**

**Estrutura Base**: Label acima do campo com asterisco vermelho se obrigatório. Input com border cinza (#E0E0E0) de 1px. Height de 44px para boa área de toque. Border-radius de 8px para consistência. Focus state com border azul e sombra sutil.

**Validação Visual**: Border vermelha para campos com erro. Texto de erro abaixo em vermelho (#F44336). Ícone de check verde para campos válidos. Mensagem de ajuda em cinza abaixo quando necessário.

**Tipos Especializados**:
- **Money Input**: Máscara automática com R$ prefix. Separadores de milhares e decimais. Limite de casas decimais configurável
- **Phone Input**: Máscara (00) 00000-0000. Validação de número brasileiro. Suporte a números fixos e móveis
- **Document Input**: Máscaras para CPF/CNPJ. Validação de dígitos verificadores. Switch automático baseado em quantidade de caracteres

#### **Select Component**

**Design**: Aparência similar ao input padrão. Ícone chevron-down à direita. Dropdown com máxima altura de 300px. Scroll interno quando necessário.

**Funcionalidades**: Search dentro do dropdown para listas grandes. Grupos de opções com headers. Multi-select com checkboxes. Selected items como tags removíveis. Empty state quando sem opções.

#### **Button Component**

**Variantes Visuais**:
- **Primary**: Background azul #0066FF, texto branco. Hover com shade mais escuro. Active com scale de 0.98
- **Secondary**: Border azul, background transparente. Hover com background azul claro
- **Danger**: Background vermelho para ações destrutivas. Modal de confirmação obrigatório
- **Ghost**: Sem border, apenas texto. Útil para ações terciárias

**Estados**: Loading com spinner substituindo texto. Disabled com opacity 0.5 e cursor not-allowed. Success temporário com check icon. Ripple effect ao clicar.

**Tamanhos**: Small (32px), Medium (40px), Large (48px). Full-width option para formulários. Icon-only variant com tooltip.

### **1.5 FEEDBACK COMPONENTS**

#### **Toast Notifications**

Posicionamento top-right da tela. Stack de até 3 toasts simultâneos. Auto-dismiss após 5 segundos (configurável). Swipe para dismiss em mobile.

**Tipos**:
- Success: Background verde, ícone de check
- Error: Background vermelho, ícone de X
- Warning: Background amarelo, ícone de alerta
- Info: Background azul, ícone de info

**Estrutura**: Título em negrito. Descrição opcional em fonte menor. Action button opcional. Progress bar para auto-dismiss.

#### **Loading States**

**Skeleton Loading**: Usado durante fetch inicial de dados. Shapes que correspondem ao conteúdo final. Animação de shimmer da esquerda para direita. Hierarquia visual mantida.

**Spinner Loading**: Para ações pontuais. Overlay com background semi-transparente. Spinner centralizado com texto opcional. Prevent clicks durante loading.

#### **Empty States**

Ilustração SVG relevante ao contexto. Título descritivo do estado. Texto explicativo com sugestões. Call-to-action quando aplicável. Altura mínima de 400px para consistência.

---

## **PARTE 2: LAYOUTS DO SISTEMA**

### **2.1 AUTHENTICATED LAYOUT**

#### **Estrutura Principal**

Layout em grid com duas colunas em desktop. Sidebar fixa com 280px de largura. Main content area flexível ocupando espaço restante. Header fixo no topo da content area. Padding de 24px no conteúdo principal.

**Breakpoints Responsivos**:
- Desktop (>1280px): Layout completo
- Laptop (1024-1280px): Sidebar colapsável
- Tablet (768-1024px): Sidebar como drawer
- Mobile (<768px): Layout stack vertical

**Scroll Behavior**: Sidebar com scroll independente se necessário. Header permanece fixo durante scroll. Conteúdo principal com scroll natural. Back-to-top button após 200px de scroll.

### **2.2 AUTH LAYOUT**

#### **Split Screen Design**

Divisão 40/60 em desktop. Lado esquerdo com formulário. Lado direito com hero section azul. Em mobile, apenas formulário visível.

**Left Section (Form)**: Background branco. Padding de 48px. Logo no topo. Formulário centralizado vertical e horizontalmente. Footer com links auxiliares.

**Right Section (Hero)**: Gradient azul diagonal. Pattern decorativo sutil. Heading motivacional. Features highlights em bullets. Screenshot do dashboard em perspectiva. Indicadores de páginas (dots) se múltiplos slides.

### **2.3 DASHBOARD LAYOUT**

#### **Grid System**

Grid de 12 colunas com gap de 24px. Métricas principais em 4 colunas (3 cols cada). Gráficos principais em 8 + 4 colunas. Tabelas em full width.

**Metric Cards Row**: 4 cards iguais em largura. Em tablet, 2x2 grid. Em mobile, stack vertical. Height consistente de 120px.

**Charts Section**: Sales chart ocupando 66% da largura. Geographic map ou pie chart nos 33% restantes. Ambos com height de 400px. Em mobile, stack com charts full width.

**Tables Section**: Full width com scroll horizontal se necessário. Alternativa: versão card em mobile. Máximo de 10 rows por padrão. Load more ou paginação.

### **2.4 FORM LAYOUTS**

#### **Single Column Form**

Usado para formulários simples. Máxima largura de 600px. Centralizado horizontalmente. Labels acima dos campos. Spacing de 20px entre campos.

#### **Two Column Form**

Para formulários complexos. Campos relacionados agrupados. Seções com títulos e separadores. Campos de endereço em section própria. Em mobile, colapsa para single column.

#### **Wizard Form**

Steps indicator no topo. Progress bar mostrando avanço. Navegação previous/next. Validação por step antes de avançar. Summary na última etapa.

---

# 📦 **MÓDULOS FUNCIONAIS COM COMPONENTES - SISTEMA COMERCIAL PEREIRA**

## **3.1 MÓDULO DE DASHBOARD (UC09)**

### **Componentes do Dashboard**

#### **DashboardMetricCard Component**
Card individual para cada KPI com estrutura padronizada. Container de 120px de altura com padding interno de 20px. Ícone no canto superior direito (40px) com cor suave correspondente ao tipo de métrica. Label em texto cinza pequeno (14px) na parte superior. Valor principal em fonte large (32px) e bold centralizado. Indicador de variação com seta colorida (verde para positivo, vermelho para negativo). Texto comparativo "From last week" em fonte pequena. Skeleton loading durante atualização de dados.

#### **SalesTargetBar Component**
Barra de progresso horizontal mostrando meta vs realizado. Container com altura de 80px e largura total. Texto "Sales Target" à esquerda com valor da meta. Progress bar com duas cores (azul para realizado, cinza para restante). Percentual atingido exibido sobre a barra. Valores absolutos embaixo (atual/meta). Animação suave ao carregar e atualizar valores.

#### **SalesChart Component**
Gráfico de linha/área ocupando 66% da largura em desktop. Header com título e controles de período (tabs: Day, Week, Month, Year). Área do gráfico com Recharts mostrando vendas vs período anterior. Tooltip customizado ao hover com valores detalhados. Legenda interativa permitindo ocultar/mostrar séries. Footer com mini cards de média, total e projeção. Export button para salvar como imagem.

#### **GeographicMapBrazil Component**
Mapa SVG interativo do Brasil com todos os estados. Heat map com gradiente de cores baseado em valores de vendas. Tooltip ao hover mostrando estado, valor total e percentual. Zoom e pan controlados por botões ou scroll. Legenda lateral com ranges de valores. Drill-down ao clicar para ver cidades (modal ou nova view).

#### **ProductPopularTable Component**
Tabela compacta com máximo 10 produtos. Colunas: imagem thumbnail (40px), nome/código, preço, vendas, estoque. Badge de status do estoque com cores semânticas. Sparkline mostrando tendência de vendas (opcional). Link em cada linha para página do produto. Footer com link "Ver todos produtos".

#### **DashboardPromoCard Component**
Card promocional com gradiente roxo/azul. Altura de 200px com ilustração de fundo. Título chamativo em fonte grande branca. Descrição em até 3 linhas. CTA button contrastante. Dismiss button discreto no canto.

---

## **3.2 MÓDULO DE PRODUTOS (UC02)**

### **Componentes de Produtos**

#### **ProductHeader Component**
Barra superior fixa com breadcrumb navegável. Contador de produtos "Showing X of Y products". SearchBar com ícone e placeholder contextual. Filtros rápidos em chips (categoria, status, preço). Botão primário "Novo Produto" alinhado à direita. Toggle de visualização (grid/list) com ícones.

#### **CategoryTabs Component**
Tabs horizontais scrolláveis com as 8 categorias CNAE. Cada tab com nome da categoria e contador entre parênteses. Tab ativa com underline azul e background sutil. Ícone representativo opcional antes do nome. Scroll buttons nas extremidades em mobile. All tab como primeira opção padrão.

#### **ProductCard Component**
Card de 200x280px para grid view. Imagem do produto ocupando 60% superior com lazy loading. Badge de status no canto superior direito. Nome do produto truncado em 2 linhas. Código em texto menor cinza. Preço em destaque com formatação monetária. Quick actions no hover (view, edit, duplicate). Checkbox para seleção múltipla no canto superior esquerdo.

#### **ProductTable Component**
DataTable responsiva com colunas configuráveis. Checkbox de seleção em cada linha. Imagem thumbnail (40px) na primeira coluna. Células editáveis inline para preço e estoque. Status badges coloridos para disponibilidade. Actions menu com três pontos na última coluna. Row hover com background sutil. Pagination controls no footer.

#### **ProductForm Component**
Formulário em steps ou tabs para organização. Step 1: Informações básicas (nome, código, descrição, categoria). Step 2: Precificação (custo, venda, margem calculada). Step 3: Estoque (quantidade, mínimo, localização). Step 4: Imagens (upload drag-and-drop com preview). Step 5: Fornecedor (seleção e dados de compra). Validação por step antes de avançar. Save draft automático a cada 30 segundos.

#### **ProductImageUploader Component**
Área drag-and-drop com border dashed. Preview grid das imagens uploaded. Drag handles para reordenar imagens. Star icon para marcar imagem principal. Crop/rotate tools básicos. Progress bar durante upload. Limite de tamanho e quantidade configurável.

#### **ProductBulkActions Component**
Barra que aparece quando items são selecionados. Contador de items selecionados à esquerda. Botões de ação: Delete, Export, Change Category, Update Price. Confirmação modal para ações destrutivas. Clear selection link para desmarcar todos.

---

## **3.3 MÓDULO DE CATEGORIAS (UC03)**

### **Componentes de Categorias**

#### **CategoryGrid Component**
Grid de cards 3x3 em desktop, stack em mobile. Cada card com 180px de altura. Ícone grande representativo da categoria (60px). Nome da categoria em fonte medium. Código CNAE em texto pequeno cinza. Contador de produtos ativos. Toggle switch para ativar/desativar. Mini gráfico de vendas do mês.

#### **CategoryDetailPanel Component**
Painel lateral ou modal para edição. Header com nome e status da categoria. Tabs: Configurações, Produtos, Análise. Form fields para descrição e regras de negócio. Lista de produtos vinculados com paginação. Gráficos de performance da categoria. Save e Cancel buttons fixos no footer.

#### **CategoryAnalytics Component**
Dashboard específico da categoria selecionada. Pie chart de participação nas vendas totais. Bar chart dos top 10 produtos. Line chart de evolução temporal. Métricas: margem média, ticket médio, giro. Comparativo com outras categorias. Export para relatório PDF.

---

## **3.4 MÓDULO DE CLIENTES (UC04)**

### **Componentes de Clientes**

#### **CustomerListHeader Component**
Barra de ações superior com título e contador. Search input com busca por nome/documento. Filter dropdown com opções avançadas. Segmentação buttons (Todos, Atacado, Varejo). Import/Export buttons. New Customer button primário.

#### **CustomerTable Component**
Tabela responsiva com avatar/inicial na primeira coluna. Nome com tipo de cliente em badge (PF/PJ). Documento mascarado (CPF: xxx.xxx.xxx-xx). Contato principal clicável (email/telefone). Valor total de compras formatado. Status badge (Active, Inactive, Blocked). Actions menu contextual.

#### **CustomerForm Component**
Formulário em accordion sections. Section 1: Dados principais (nome, documento, tipo). Section 2: Contatos (múltiplos emails/telefones). Section 3: Endereços (com CEP lookup). Section 4: Dados comerciais (limite, condições). Validação em tempo real com feedback visual. Save button sticky no scroll.

#### **CustomerProfileHeader Component**
Header card com 120px de altura. Avatar grande (80px) ou inicial colorida. Nome e razão social em destaque. Badges de classificação (VIP, New, Regular). Tipo de cliente e documento. Quick stats (compras, tickets, última compra). Action buttons (Nova Venda, Mensagem, Editar).

#### **CustomerPurchaseHistory Component**
Timeline vertical de transações. Cada item com data, número do pedido, valor. Status badges para cada transação. Expandable para ver produtos comprados. Filtros por período e status. Load more pagination. Summary cards no topo (total, média, frequência).

#### **CustomerAnalyticsPanel Component**
Cards com métricas RFM calculadas. Recency gauge mostrando dias desde última compra. Frequency chart com compras por mês. Monetary value com evolução e total. Score geral com classificação (Bronze, Silver, Gold). Recommendations baseadas no perfil.

---

## **3.5 MÓDULO DE VENDAS (UC06)**

### **Componentes de PDV**

#### **POSLayout Component**
Container split-screen com resize handle. Left panel (60%) para produtos. Right panel (40%) para carrinho. Height 100vh com scrolls independentes. Responsive: stack vertical em mobile.

#### **ProductSearchPanel Component**
Search bar com autocomplete no topo. Category filter buttons horizontais. Product grid com cards compactos (150px). Cada card: imagem, nome, preço, stock badge. Add to cart button em cada produto. Pagination ou infinite scroll. Favorites section para produtos frequentes.

#### **ShoppingCart Component**
Customer selector/display no header. Lista de items com estrutura consistente. Cada item: imagem mini, nome, quantidade input, preço unit, subtotal. Remove button discreto em cada linha. Discount input (percentage ou value). Summary section com subtotal, desconto, total. Payment method selector com ícones. Confirm sale button largo e destacado.

#### **CustomerQuickSelect Component**
Search dropdown com debounce. Resultados mostrando nome e documento. New customer quick add option. Customer card quando selecionado. Edit/change customer buttons. Credit limit indicator se aplicável.

#### **PaymentMethodSelector Component**
Grid de botões com ícones grandes. Opções: Dinheiro, Cartão, PIX, Boleto, Crediário. Seleção destacada com border azul. Campos adicionais aparecem conforme método. Installments selector para cartão. Change calculator para dinheiro.

#### **SaleConfirmationModal Component**
Modal com resumo completo da venda. Cliente, items, valores, pagamento. Print options (cupom, nota fiscal). Email/WhatsApp sending options. New sale button para recomeçar. Close and finish para concluir.

---

## **3.6 MÓDULO DE ESTOQUE (UC05 e UC07)**

### **Componentes de Estoque**

#### **StockDashboard Component**
Grid 2x2 de metric cards no topo. Cards: Total Items, Out of Stock, Low Stock, Stock Value. Alerta banner se items críticos. Quick actions: Adjust Stock, Stock Count, Reports.

#### **StockTable Component**
Tabela com visual indicators para níveis. Código e nome do produto. Quantidade com edit inline capability. Min/Max com indicators visuais. Status column com badges coloridos. Progress bar mostrando nível atual. Last movement timestamp. Quick adjust button por linha.

#### **StockMovementsList Component**
Lista cronológica de movimentações. Cada item: tipo (icon), produto, quantidade (+/-), usuário, timestamp. Filtros por tipo de movimento. Color coding: green (entrada), red (saída), blue (ajuste). Documento relacionado como link. Pagination com load more.

#### **StockAlertPanel Component**
Lista de produtos em alerta. Severity badges (Critical, Low, Warning). Produto, quantidade atual, mínimo, sugestão pedido. Supplier info para cada produto. Batch select para criar pedido. Dismiss option por item. Auto-refresh cada minuto.

#### **StockAdjustmentForm Component**
Modal ou página para ajustes. Product selector com search. Current stock display (read-only). New quantity input com validação. Reason selector dropdown. Notes textarea opcional. Confirm com dupla verificação. History do produto visível.

---

## **3.7 MÓDULO DE FORNECEDORES (UC11)**

### **Componentes de Fornecedores**

#### **SupplierList Component**
Cards em grid ou lista conforme preferência. Cada card: logo/inicial, razão social, CNPJ, contato, telefone. Badge com número de produtos fornecidos. Status indicator (active/inactive). Quick actions: view, edit, products. Hover effect com sombra elevada.

#### **SupplierForm Component**
Formulário em sections colapsáveis. Section 1: Dados empresariais. Section 2: Contatos (múltiplos). Section 3: Endereço completo. Section 4: Informações comerciais. Section 5: Produtos vinculados. Validação CNPJ em tempo real. Save progress indicator.

#### **SupplierProductsTable Component**
Tabela de produtos do fornecedor. Colunas: produto, código fornecedor, nosso código, preço compra, última compra. Inline edit para preços negociados. Add product button para vincular. Remove com confirmação. Histórico de preços por produto.

#### **SupplierContactCard Component**
Card com informações de contato. Nome do contato principal. Múltiplos telefones com labels. Email clicável. Website com link externo. WhatsApp button se disponível. Edit mode inline.

---

## **3.8 MÓDULO DE RELATÓRIOS (UC08)**

### **Componentes de Relatórios**

#### **ReportCategoryGrid Component**
Grid de cards para categorias de relatórios. Ícone grande representativo. Nome da categoria. Descrição breve. Contador de relatórios disponíveis. Últimos relatórios gerados. Click para expandir categoria.

#### **ReportBuilder Component**
Interface drag-and-drop para customização. Painel de campos disponíveis à esquerda. Área de construção central. Configurações à direita. Preview em tempo real. Filtros e agregações configuráveis. Save template option.

#### **ReportViewer Component**
Container com toolbar superior. Título e período selecionado. Botões: Refresh, Export, Print, Share. Área de conteúdo com gráficos/tabelas. Filtros dinâmicos laterais. Footer com metadata. Full-screen toggle.

#### **ReportScheduler Component**
Formulário para agendamento. Frequência selector (diário, semanal, mensal). Time picker para horário. Recipients list com emails. Format selector (PDF, Excel). Conditions para envio. Test run button.

#### **ReportFilters Component**
Painel lateral ou superior com filtros. Date range picker sempre presente. Dropdowns contextuais ao relatório. Multi-select para categorias. Sliders para ranges numéricos. Apply e Reset buttons. Save filter preset option.

---

## **3.9 MÓDULO DE USUÁRIOS (UC01)**

### **Componentes de Usuários**

#### **UserListCard Component**
Card por usuário com layout horizontal. Avatar ou inicial (60px). Nome e email empilhados. Role badge colorido. Status indicator (online/offline). Last login timestamp. Actions: edit, reset password, toggle status.

#### **UserForm Component**
Formulário em tabs verticais. Tab 1: Informações pessoais. Tab 2: Dados de acesso. Tab 3: Permissões especiais. Tab 4: Configurações. Password strength indicator. Role selector com descrições. Permission checkboxes agrupados.

#### **UserActivityLog Component**
Timeline de atividades do usuário. Login/logout events. Ações importantes realizadas. IP e dispositivo utilizado. Filtros por tipo de ação. Export para auditoria.

#### **UserPermissionMatrix Component**
Tabela de permissões por módulo. Checkboxes para cada permissão. Agrupamento por categoria. Templates de roles predefinidos. Copy permissions from user. Bulk apply options.

---

## **3.10 MÓDULO DE CONFIGURAÇÕES (UC12)**

### **Componentes de Configurações**

#### **SettingsSidebar Component**
Menu lateral com categorias. Ícones para cada seção. Active state highlighted. Breadcrumb trail. Search settings functionality. Recently changed indicator.

#### **CompanySettingsForm Component**
Formulário com dados da empresa. Logo upload com preview. Campos de identificação fiscal. Timezone e locale selectors. Business hours configuration. Save com validação completa.

#### **SystemPreferences Component**
Switches e selects para preferências. Temas e aparência. Notificações e alertas. Formatos de data/moeda. Language selector. Reset to defaults option.

#### **IntegrationsList Component**
Cards para cada integração disponível. Status indicator (connected/disconnected). Configuration button. Test connection feature. Logs de sincronização. Enable/disable toggle.

#### **AuditLogViewer Component**
Tabela de logs do sistema. Filtros avançados (user, action, date). Severity levels com cores. Expandable para detalhes. Export functionality. Real-time updates via websocket.

#### **BackupManager Component**
Status do último backup. Schedule configuration. Manual backup trigger. Restore interface. Download backups. Retention policy settings.

---

Cada componente descrito foi pensado para ser reutilizável, acessível e performático, seguindo as melhores práticas de UX/UI e alinhado com o design system definido para o Sistema Comercial Pereira.