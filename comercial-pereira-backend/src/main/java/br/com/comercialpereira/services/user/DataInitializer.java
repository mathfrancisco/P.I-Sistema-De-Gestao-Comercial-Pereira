package br.com.comercialpereira.services.user;

import br.com.comercialpereira.entity.*;
import br.com.comercialpereira.enums.*;
import br.com.comercialpereira.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@Profile("!test") // Não executa durante os testes
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final SupplierRepository supplierRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (isDatabaseEmpty()) {
            log.info("Inicializando dados no banco...");
            initializeData();
            log.info("Dados inicializados com sucesso!");
        } else {
            log.info("Banco de dados já contém dados. Pulando inicialização.");
        }
    }

    private boolean isDatabaseEmpty() {
        return userRepository.count() == 0;
    }

    private void initializeData() {
        // 1. Criar usuários
        List<User> users = createUsers();

        // 2. Criar categorias
        List<Category> categories = createCategories();

        // 3. Criar fornecedores
        List<Supplier> suppliers = createSuppliers();

        // 4. Criar clientes
        List<Customer> customers = createCustomers();

        // 5. Criar produtos
        List<Product> products = createProducts(categories, suppliers);

        // 6. Criar inventário
        createInventory(products);
    }

    private List<User> createUsers() {
        log.info("Criando usuários...");

        List<User> users = Arrays.asList(
                User.builder()
                        .name("Administrador")
                        .email("admin@comercialpereira.com.br")
                        .password(passwordEncoder.encode("admin123"))
                        .role(UserRole.ADMIN)
                        .isActive(true)
                        .build(),

                User.builder()
                        .name("João Silva")
                        .email("joao.silva@comercialpereira.com.br")
                        .password(passwordEncoder.encode("gerente123"))
                        .role(UserRole.MANAGER)
                        .isActive(true)
                        .build(),

                User.builder()
                        .name("Maria Santos")
                        .email("maria.santos@comercialpereira.com.br")
                        .password(passwordEncoder.encode("vendedor123"))
                        .role(UserRole.SALESPERSON)
                        .isActive(true)
                        .build(),

                User.builder()
                        .name("Pedro Oliveira")
                        .email("pedro.oliveira@comercialpereira.com.br")
                        .password(passwordEncoder.encode("vendedor123"))
                        .role(UserRole.SALESPERSON)
                        .isActive(true)
                        .build()
        );

        return userRepository.saveAll(users);
    }

    private List<Category> createCategories() {
        log.info("Criando categorias...");

        List<Category> categories = Arrays.asList(
                Category.builder()
                        .name("Eletrônicos")
                        .description("Produtos eletrônicos em geral")
                        .cnae("26.10-8-01")
                        .isActive(true)
                        .build(),

                Category.builder()
                        .name("Informática")
                        .description("Equipamentos e acessórios de informática")
                        .cnae("26.20-4-00")
                        .isActive(true)
                        .build(),

                Category.builder()
                        .name("Casa e Jardim")
                        .description("Produtos para casa e jardim")
                        .cnae("47.59-8-99")
                        .isActive(true)
                        .build(),

                Category.builder()
                        .name("Esportes e Lazer")
                        .description("Artigos esportivos e de lazer")
                        .cnae("47.63-6-07")
                        .isActive(true)
                        .build(),

                Category.builder()
                        .name("Livros e Papelaria")
                        .description("Livros, revistas e material de papelaria")
                        .cnae("47.61-0-02")
                        .isActive(true)
                        .build()
        );

        return categoryRepository.saveAll(categories);
    }

    private List<Supplier> createSuppliers() {
        log.info("Criando fornecedores...");

        List<Supplier> suppliers = Arrays.asList(
                Supplier.builder()
                        .name("Tech Solutions Ltda")
                        .contactPerson("Carlos Mendes")
                        .email("contato@techsolutions.com.br")
                        .phone("(11) 3456-7890")
                        .address("Rua das Tecnologias, 123")
                        .city("São Paulo")
                        .state("SP")
                        .zipCode("01234-567")
                        .cnpj("12.345.678/0001-90")
                        .website("www.techsolutions.com.br")
                        .notes("Fornecedor especializado em produtos eletrônicos")
                        .isActive(true)
                        .build(),

                Supplier.builder()
                        .name("Distribuidora Central")
                        .contactPerson("Ana Costa")
                        .email("vendas@distribuidoracentral.com.br")
                        .phone("(11) 2345-6789")
                        .address("Av. Industrial, 456")
                        .city("Guarulhos")
                        .state("SP")
                        .zipCode("07123-456")
                        .cnpj("98.765.432/0001-10")
                        .website("www.distribuidoracentral.com.br")
                        .notes("Distribuidora com ampla variedade de produtos")
                        .isActive(true)
                        .build(),

                Supplier.builder()
                        .name("Casa & Cia Fornecimentos")
                        .contactPerson("Roberto Lima")
                        .email("roberto@casaecia.com.br")
                        .phone("(11) 4567-8901")
                        .address("Rua dos Comerciantes, 789")
                        .city("Osasco")
                        .state("SP")
                        .zipCode("06234-789")
                        .cnpj("11.222.333/0001-44")
                        .notes("Especialista em produtos para casa e jardim")
                        .isActive(true)
                        .build()
        );

        return supplierRepository.saveAll(suppliers);
    }

    private List<Customer> createCustomers() {
        log.info("Criando clientes...");

        List<Customer> customers = Arrays.asList(
                Customer.builder()
                        .name("José da Silva")
                        .email("jose.silva@email.com")
                        .phone("(11) 99876-5432")
                        .address("Rua das Flores, 123")
                        .neighborhood("Centro")
                        .city("São João da Boa Vista")
                        .state("SP")
                        .zipCode("13870-123")
                        .document("123.456.789-01")
                        .type(CustomerType.RETAIL)
                        .isActive(true)
                        .build(),

                Customer.builder()
                        .name("Maria Oliveira")
                        .email("maria.oliveira@email.com")
                        .phone("(11) 98765-4321")
                        .address("Av. Principal, 456")
                        .neighborhood("Vila Nova")
                        .city("São João da Boa Vista")
                        .state("SP")
                        .zipCode("13870-456")
                        .document("987.654.321-09")
                        .type(CustomerType.RETAIL)
                        .isActive(true)
                        .build(),

                Customer.builder()
                        .name("Empresa ABC Ltda")
                        .email("contato@empresaabc.com.br")
                        .phone("(19) 3456-7890")
                        .address("Rua Comercial, 789")
                        .neighborhood("Distrito Industrial")
                        .city("Aguaí")
                        .state("SP")
                        .zipCode("13860-789")
                        .document("12.345.678/0001-90")
                        .type(CustomerType.WHOLESALE)
                        .isActive(true)
                        .build(),

                Customer.builder()
                        .name("Carlos Santos")
                        .email("carlos.santos@email.com")
                        .phone("(19) 97654-3210")
                        .address("Rua das Palmeiras, 321")
                        .neighborhood("Jardim América")
                        .city("Mogi Guaçu")
                        .state("SP")
                        .zipCode("13840-321")
                        .document("456.789.123-45")
                        .type(CustomerType.RETAIL)
                        .isActive(true)
                        .build()
        );

        return customerRepository.saveAll(customers);
    }

    private List<Product> createProducts(List<Category> categories, List<Supplier> suppliers) {
        log.info("Criando produtos...");

        Category eletronicos = categories.get(0);
        Category informatica = categories.get(1);
        Category casaJardim = categories.get(2);
        Category esportesLazer = categories.get(3);
        Category livrosPapelaria = categories.get(4);

        Supplier techSolutions = suppliers.get(0);
        Supplier distribuidora = suppliers.get(1);
        Supplier casaCia = suppliers.get(2);

        List<Product> products = Arrays.asList(
                // Eletrônicos
                Product.builder()
                        .name("Smartphone Samsung Galaxy A54")
                        .description("Smartphone com tela de 6.4 polegadas, 128GB de armazenamento e câmera tripla")
                        .price(new BigDecimal("1299.99"))
                        .code("SMSG-A54-128")
                        .barcode("7891234567890")
                        .category(eletronicos)
                        .supplier(techSolutions)
                        .isActive(true)
                        .build(),

                Product.builder()
                        .name("Fone de Ouvido Bluetooth JBL")
                        .description("Fone de ouvido sem fio com cancelamento de ruído ativo")
                        .price(new BigDecimal("299.90"))
                        .code("JBL-BT-500")
                        .barcode("7891234567891")
                        .category(eletronicos)
                        .supplier(techSolutions)
                        .isActive(true)
                        .build(),

                // Informática
                Product.builder()
                        .name("Notebook Dell Inspiron 15")
                        .description("Notebook com processador Intel Core i5, 8GB RAM, SSD 256GB")
                        .price(new BigDecimal("2499.99"))
                        .code("DELL-INS15-I5")
                        .barcode("7891234567892")
                        .category(informatica)
                        .supplier(techSolutions)
                        .isActive(true)
                        .build(),

                Product.builder()
                        .name("Mouse Gamer Logitech G203")
                        .description("Mouse óptico para jogos com sensor de 8000 DPI")
                        .price(new BigDecimal("89.90"))
                        .code("LOGI-G203-BK")
                        .barcode("7891234567893")
                        .category(informatica)
                        .supplier(distribuidora)
                        .isActive(true)
                        .build(),

                Product.builder()
                        .name("Teclado Mecânico RGB")
                        .description("Teclado mecânico com iluminação RGB e switches azuis")
                        .price(new BigDecimal("199.99"))
                        .code("TEC-RGB-BLUE")
                        .barcode("7891234567894")
                        .category(informatica)
                        .supplier(distribuidora)
                        .isActive(true)
                        .build(),

                // Casa e Jardim
                Product.builder()
                        .name("Aspirador de Pó Electrolux")
                        .description("Aspirador de pó com saco, 1400W de potência")
                        .price(new BigDecimal("199.90"))
                        .code("ELUX-ASP-1400")
                        .barcode("7891234567895")
                        .category(casaJardim)
                        .supplier(casaCia)
                        .isActive(true)
                        .build(),

                Product.builder()
                        .name("Jogo de Panelas Antiaderente")
                        .description("Kit com 5 peças em alumínio com revestimento antiaderente")
                        .price(new BigDecimal("149.90"))
                        .code("PANELA-SET-5PC")
                        .barcode("7891234567896")
                        .category(casaJardim)
                        .supplier(casaCia)
                        .isActive(true)
                        .build(),

                // Esportes e Lazer
                Product.builder()
                        .name("Tênis Nike Air Max")
                        .description("Tênis esportivo unissex com tecnologia Air Max")
                        .price(new BigDecimal("399.99"))
                        .code("NIKE-AIRMAX-42")
                        .barcode("7891234567897")
                        .category(esportesLazer)
                        .supplier(distribuidora)
                        .isActive(true)
                        .build(),

                Product.builder()
                        .name("Bola de Futebol Oficial")
                        .description("Bola de futebol oficial tamanho padrão FIFA")
                        .price(new BigDecimal("79.90"))
                        .code("BOLA-FUT-FIFA")
                        .barcode("7891234567898")
                        .category(esportesLazer)
                        .supplier(distribuidora)
                        .isActive(true)
                        .build(),

                // Livros e Papelaria
                Product.builder()
                        .name("Caderno Universitário 200 Folhas")
                        .description("Caderno espiral universitário com 200 folhas pautadas")
                        .price(new BigDecimal("12.90"))
                        .code("CAD-UNI-200F")
                        .barcode("7891234567899")
                        .category(livrosPapelaria)
                        .supplier(distribuidora)
                        .isActive(true)
                        .build(),

                Product.builder()
                        .name("Kit Canetas BIC 12 Cores")
                        .description("Kit com 12 canetas esferográficas coloridas")
                        .price(new BigDecimal("24.90"))
                        .code("BIC-12CORES")
                        .barcode("7891234567800")
                        .category(livrosPapelaria)
                        .supplier(distribuidora)
                        .isActive(true)
                        .build()
        );

        return productRepository.saveAll(products);
    }

    private void createInventory(List<Product> products) {
        log.info("Criando inventário...");

        List<Inventory> inventories = Arrays.asList(
                // Smartphone Samsung
                Inventory.builder()
                        .product(products.get(0))
                        .quantity(25)
                        .minStock(5)
                        .maxStock(50)
                        .location("A-01-01")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Fone JBL
                Inventory.builder()
                        .product(products.get(1))
                        .quantity(40)
                        .minStock(10)
                        .maxStock(100)
                        .location("A-01-02")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Notebook Dell
                Inventory.builder()
                        .product(products.get(2))
                        .quantity(8)
                        .minStock(3)
                        .maxStock(20)
                        .location("A-02-01")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Mouse Logitech
                Inventory.builder()
                        .product(products.get(3))
                        .quantity(60)
                        .minStock(15)
                        .maxStock(120)
                        .location("A-02-02")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Teclado RGB
                Inventory.builder()
                        .product(products.get(4))
                        .quantity(30)
                        .minStock(8)
                        .maxStock(60)
                        .location("A-02-03")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Aspirador Electrolux
                Inventory.builder()
                        .product(products.get(5))
                        .quantity(15)
                        .minStock(5)
                        .maxStock(30)
                        .location("B-01-01")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Jogo de Panelas
                Inventory.builder()
                        .product(products.get(6))
                        .quantity(22)
                        .minStock(10)
                        .maxStock(40)
                        .location("B-01-02")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Tênis Nike
                Inventory.builder()
                        .product(products.get(7))
                        .quantity(18)
                        .minStock(5)
                        .maxStock(35)
                        .location("C-01-01")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Bola de Futebol
                Inventory.builder()
                        .product(products.get(8))
                        .quantity(35)
                        .minStock(10)
                        .maxStock(70)
                        .location("C-01-02")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Caderno Universitário
                Inventory.builder()
                        .product(products.get(9))
                        .quantity(100)
                        .minStock(25)
                        .maxStock(200)
                        .location("D-01-01")
                        .lastUpdate(LocalDateTime.now())
                        .build(),

                // Kit Canetas BIC
                Inventory.builder()
                        .product(products.get(10))
                        .quantity(80)
                        .minStock(20)
                        .maxStock(150)
                        .location("D-01-02")
                        .lastUpdate(LocalDateTime.now())
                        .build()
        );

        inventoryRepository.saveAll(inventories);
    }
}