-- Dados iniciais para o sistema Comercial Pereira

-- Inserir usuário administrador padrão
INSERT INTO users (name, email, password, role, is_active) VALUES
('Administrador', 'admin@comercialpereira.com.br', '$2a$10$N9qo8uLOickgx2ZMRZoMye.K6AXfhORS.YQUKaE8lMGbw7OUG8qZ.', 'ADMIN', true);
-- Senha padrão: admin123

-- Inserir categorias baseadas nos CNAEs da empresa
INSERT INTO categories (name, description, cnae, is_active) VALUES
('Equipamentos Domésticos', 'Comércio atacadista de equipamentos e artigos de uso pessoal e doméstico', '46.49-4-99', true),
('Embalagens', 'Comércio atacadista de embalagens', '46.86-9-02', true),
('Cosméticos e Higiene', 'Comércio varejista de cosméticos, produtos de perfumaria e de higiene pessoal', '47.72-5-00', true),
('Cama, Mesa e Banho', 'Comércio atacadista de artigos de cama, mesa e banho', '46.41-9-02', true),
('Papelaria', 'Comércio atacadista de artigos de escritório e de papelaria', '46.47-8-01', true),
('Ferragens', 'Comércio atacadista de ferragens e ferramentas', '46.72-9-00', true),
('Material Elétrico', 'Comércio atacadista de material elétrico', '46.73-7-00', true),
('Armarinho', 'Comércio atacadista de artigos de armarinho', '46.41-9-03', true);

-- Inserir fornecedores exemplo
INSERT INTO suppliers (name, contact_person, email, phone, city, state, is_active) VALUES
('Distribuidora Central Ltda', 'João Silva', 'contato@distribuidoracentral.com.br', '(11) 3456-7890', 'São Paulo', 'SP', true),
('Atacado Nordeste SA', 'Maria Santos', 'vendas@atacadonordeste.com.br', '(85) 2345-6789', 'Fortaleza', 'CE', true),
('Importadora Sul', 'Carlos Oliveira', 'comercial@importadorasul.com.br', '(51) 4567-8901', 'Porto Alegre', 'RS', true);

-- Inserir produtos exemplo para cada categoria
INSERT INTO products (name, description, price, code, category_id, supplier_id, is_active) VALUES
-- Equipamentos Domésticos
('Aspirador de Pó Portátil', 'Aspirador compacto para uso doméstico', 129.90, 'ASP001', 1, 1, true),
('Ferro de Passar a Vapor', 'Ferro com base antiaderente e controle de vapor', 89.90, 'FER001', 1, 1, true),

-- Embalagens
('Saco Plástico Transparente 30x40', 'Embalagem plástica resistente', 25.50, 'SAC001', 2, 2, true),
('Caixa de Papelão 20x30x15', 'Caixa para embalagem e transporte', 3.75, 'CXP001', 2, 2, true),

-- Cosméticos e Higiene
('Shampoo Anticaspa 400ml', 'Shampoo para tratamento de caspa', 12.90, 'SHA001', 3, 3, true),
('Creme Hidratante Corporal 250ml', 'Hidratante para pele seca', 18.50, 'CRE001', 3, 3, true),

-- Papelaria
('Caneta Esferográfica Azul', 'Caneta com tinta azul duradoura', 2.50, 'CAN001', 5, 1, true),
('Caderno Universitário 200 Folhas', 'Caderno espiral com pauta', 15.90, 'CAD001', 5, 1, true);

-- Inserir registros de estoque para os produtos
INSERT INTO inventory (product_id, quantity, min_stock, max_stock, location) VALUES
(1, 50, 10, 200, 'A1-01'),
(2, 75, 15, 150, 'A1-02'),
(3, 1000, 100, 5000, 'B2-01'),
(4, 500, 50, 2000, 'B2-02'),
(5, 300, 50, 1000, 'C3-01'),
(6, 200, 30, 800, 'C3-02'),
(7, 2000, 200, 10000, 'D4-01'),
(8, 150, 25, 500, 'D4-02');

-- Inserir cliente exemplo
INSERT INTO customers (name, email, phone, address, city, state, type, document, is_active) VALUES
('Loja do Bairro Ltda', 'contato@lojadobairro.com.br', '(85) 3456-7890', 'Rua das Flores, 123', 'Americana', 'SP', 'WHOLESALE', '12.345.678/0001-90', true),
('Maria da Silva', 'maria.silva@email.com', '(85) 9876-5432', 'Av. Principal, 456', 'Americana', 'SP', 'RETAIL', '123.456.789-01', true);