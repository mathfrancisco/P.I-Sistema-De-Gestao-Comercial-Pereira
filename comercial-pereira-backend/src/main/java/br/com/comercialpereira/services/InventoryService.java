package br.com.comercialpereira.services;

import br.com.comercialpereira.dto.inventory.*;
import br.com.comercialpereira.dto.movement.*;
import br.com.comercialpereira.entity.*;
import br.com.comercialpereira.enums.MovementType;
import br.com.comercialpereira.exception.ApiException;
import br.com.comercialpereira.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class InventoryService {

    private final InventoryRepository inventoryRepository;
    private final InventoryMovementRepository movementRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final SaleRepository saleRepository;

    // =================== CREATE ===================

    public InventoryResponse createForProduct(Long productId, CreateInventoryRequest request) {
        log.info("Criando estoque para produto ID: {}", productId);

        // Verificar se produto existe e está ativo
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND));

        if (!product.getIsActive()) {
            throw new ApiException("Produto inativo não pode ter estoque criado", HttpStatus.BAD_REQUEST);
        }

        // Verificar se já existe estoque para este produto
        if (inventoryRepository.findByProductId(productId).isPresent()) {
            throw new ApiException("Estoque já existe para este produto", HttpStatus.CONFLICT);
        }

        // Validar regras de negócio
        validateInventoryBusinessRules(request);

        // Criar estoque
        Inventory inventory = Inventory.builder()
                .product(product)
                .quantity(Optional.ofNullable(request.getQuantity()).orElse(0))
                .minStock(Optional.ofNullable(request.getMinStock()).orElse(10))
                .maxStock(request.getMaxStock())
                .location(request.getLocation())
                .build();

        inventory = inventoryRepository.save(inventory);
        log.info("Estoque criado com sucesso. ID: {}", inventory.getId());

        return mapToInventoryResponse(inventory);
    }

    // =================== READ ===================

    @Transactional(readOnly = true)
    public Page<InventoryResponse> findMany(InventoryFilters filters) {
        log.debug("Buscando estoques com filtros: {}", filters);

        Pageable pageable = createPageable(filters.getPage(), filters.getSize(),
                filters.getSortBy(), filters.getSortOrder());

        Page<Inventory> inventories = inventoryRepository.findByFilters(
                filters.getSearch(),
                filters.getCategoryId(),
                filters.getSupplierId(),
                filters.getLocation(),
                filters.getLowStock(),
                filters.getOutOfStock(),
                pageable
        );

        return inventories.map(this::mapToInventoryResponse);
    }

    @Transactional(readOnly = true)
    public InventoryResponse findByProductId(Long productId) {
        log.debug("Buscando estoque para produto ID: {}", productId);

        Inventory inventory = inventoryRepository.findByProductId(productId)
                .orElseThrow(() -> new ApiException("Estoque não encontrado para este produto", HttpStatus.NOT_FOUND));

        return mapToInventoryResponse(inventory);
    }

    @Transactional(readOnly = true)
    public InventoryResponse findById(Long id) {
        log.debug("Buscando estoque ID: {}", id);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Estoque não encontrado", HttpStatus.NOT_FOUND));

        return mapToInventoryResponse(inventory);
    }

    // =================== UPDATE ===================

    public InventoryResponse update(Long id, UpdateInventoryRequest request, Long currentUserId) {
        log.info("Atualizando estoque ID: {} por usuário ID: {}", id, currentUserId);

        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ApiException("Estoque não encontrado", HttpStatus.NOT_FOUND));

        if (!inventory.getProduct().getIsActive()) {
            throw new ApiException("Produto inativo não pode ter estoque atualizado", HttpStatus.BAD_REQUEST);
        }

        validateInventoryBusinessRules(request);

        // Capturar valores antigos para log
        Integer oldQuantity = inventory.getQuantity();
        Integer oldMinStock = inventory.getMinStock();
        Integer oldMaxStock = inventory.getMaxStock();
        String oldLocation = inventory.getLocation();

        // Atualizar apenas campos não nulos
        if (request.getQuantity() != null) {
            inventory.setQuantity(request.getQuantity());
        }
        if (request.getMinStock() != null) {
            inventory.setMinStock(request.getMinStock());
        }
        if (request.getMaxStock() != null) {
            inventory.setMaxStock(request.getMaxStock());
        }
        if (request.getLocation() != null) {
            inventory.setLocation(request.getLocation());
        }

        inventory = inventoryRepository.save(inventory);

        logInventoryOperation(currentUserId, "UPDATE", id,
                String.format("Antigo: qty=%d, min=%d, max=%d, loc=%s | Novo: qty=%d, min=%d, max=%d, loc=%s",
                        oldQuantity, oldMinStock, oldMaxStock, oldLocation,
                        inventory.getQuantity(), inventory.getMinStock(), inventory.getMaxStock(), inventory.getLocation()));

        log.info("Estoque atualizado com sucesso. ID: {}", inventory.getId());
        return mapToInventoryResponse(inventory);
    }

    // =================== STOCK MOVEMENTS ===================

    public InventoryResponse adjustStock(StockAdjustmentRequest request, Long currentUserId) {
        log.info("Ajustando estoque do produto ID: {} em {} unidades por usuário ID: {}",
                request.getProductId(), request.getQuantity(), currentUserId);

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND));

        if (!product.getIsActive()) {
            throw new ApiException("Produto inativo não pode ter estoque ajustado", HttpStatus.BAD_REQUEST);
        }

        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new ApiException("Estoque não encontrado para este produto", HttpStatus.NOT_FOUND));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND));

        Integer oldQuantity = inventory.getQuantity();
        Integer newQuantity = oldQuantity + request.getQuantity();

        if (newQuantity < 0) {
            throw new ApiException("Ajuste resultaria em estoque negativo", HttpStatus.BAD_REQUEST);
        }

        inventory.setQuantity(newQuantity);
        inventory = inventoryRepository.save(inventory);

        // Registrar movimentação
        InventoryMovement movement = InventoryMovement.builder()
                .inventory(inventory)
                .product(product)
                .type(MovementType.ADJUSTMENT)
                .quantity(Math.abs(request.getQuantity()))
                .reason(request.getReason())
                .user(user)
                .build();

        movementRepository.save(movement);

        log.info("Ajuste de estoque realizado com sucesso. Produto ID: {}, Quantidade anterior: {}, Nova quantidade: {}",
                request.getProductId(), oldQuantity, newQuantity);

        return mapToInventoryResponse(inventory);
    }

    public InventoryResponse addStock(Long productId, Integer quantity, String reason, Long currentUserId) {
        return processStockMovement(StockMovementRequest.builder()
                .productId(productId)
                .type(MovementType.IN)
                .quantity(quantity)
                .reason(reason)
                .build(), currentUserId);
    }

    public InventoryResponse removeStock(Long productId, Integer quantity, String reason, Long currentUserId, Long saleId) {
        return processStockMovement(StockMovementRequest.builder()
                .productId(productId)
                .type(MovementType.OUT)
                .quantity(quantity)
                .reason(reason)
                .saleId(saleId)
                .build(), currentUserId);
    }

    public InventoryResponse processStockMovement(StockMovementRequest request, Long currentUserId) {
        log.info("Processando movimentação de estoque. Produto ID: {}, Tipo: {}, Quantidade: {}",
                request.getProductId(), request.getType(), request.getQuantity());

        Product product = productRepository.findById(request.getProductId())
                .orElseThrow(() -> new ApiException("Produto não encontrado", HttpStatus.NOT_FOUND));

        if (!product.getIsActive()) {
            throw new ApiException("Produto inativo não pode ter estoque movimentado", HttpStatus.BAD_REQUEST);
        }

        Inventory inventory = inventoryRepository.findByProductId(request.getProductId())
                .orElseThrow(() -> new ApiException("Estoque não encontrado para este produto", HttpStatus.NOT_FOUND));

        User user = userRepository.findById(currentUserId)
                .orElseThrow(() -> new ApiException("Usuário não encontrado", HttpStatus.NOT_FOUND));

        Integer oldQuantity = inventory.getQuantity();
        Integer newQuantity;

        if (request.getType() == MovementType.IN) {
            newQuantity = oldQuantity + request.getQuantity();
        } else if (request.getType() == MovementType.OUT) {
            newQuantity = oldQuantity - request.getQuantity();
            if (newQuantity < 0) {
                throw new ApiException("Estoque insuficiente para a operação", HttpStatus.BAD_REQUEST);
            }
        } else {
            throw new ApiException("Tipo de movimentação inválido", HttpStatus.BAD_REQUEST);
        }

        inventory.setQuantity(newQuantity);
        inventory = inventoryRepository.save(inventory);

        // Registrar movimentação
        InventoryMovement movement = InventoryMovement.builder()
                .inventory(inventory)
                .product(product)
                .type(request.getType())
                .quantity(request.getQuantity())
                .reason(request.getReason())
                .user(user)
                .sale(request.getSaleId() != null ?
                        saleRepository.getReferenceById(request.getSaleId()) : null)
                .build();


        movementRepository.save(movement);

        log.info("Movimentação de estoque processada com sucesso. Produto ID: {}, Quantidade anterior: {}, Nova quantidade: {}",
                request.getProductId(), oldQuantity, newQuantity);

        return mapToInventoryResponse(inventory);
    }

    // =================== MOVEMENTS HISTORY ===================

    @Transactional(readOnly = true)
    public Page<MovementResponse> getMovements(MovementFilters filters) {
        log.debug("Buscando movimentações com filtros: {}", filters);

        Pageable pageable = createPageable(filters.getPage(), filters.getSize(),
                filters.getSortBy(), filters.getSortOrder());

        Page<InventoryMovement> movements = movementRepository.findByFilters(
                filters.getProductId(),
                filters.getType(),
                filters.getUserId(),
                filters.getSaleId(),
                filters.getDateFrom(),
                filters.getDateTo(),
                pageable
        );

        return movements.map(this::mapToMovementResponse);
    }

    @Transactional(readOnly = true)
    public List<MovementResponse> getProductMovements(Long productId, Integer limit) {
        log.debug("Buscando movimentações do produto ID: {}, limite: {}", productId, limit);

        List<InventoryMovement> movements = movementRepository.findByProductIdOrderByCreatedAtDesc(productId);

        return movements.stream()
                .limit(Optional.ofNullable(limit).orElse(20))
                .map(this::mapToMovementResponse)
                .collect(Collectors.toList());
    }

    // =================== ANALYTICS ===================

    @Transactional(readOnly = true)
    public InventoryStatsResponse getStatistics() {
        log.debug("Calculando estatísticas de estoque");

        Long totalProducts = inventoryRepository.count();
        List<Inventory> allInventories = inventoryRepository.findAll();

        BigDecimal totalValue = allInventories.stream()
                .map(inv -> inv.getProduct().getPrice().multiply(BigDecimal.valueOf(inv.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Long lowStockCount = inventoryRepository.countLowStockItems();
        Long outOfStockCount = inventoryRepository.countOutOfStockItems();

        Double averageStock = totalProducts > 0 ?
                allInventories.stream().mapToInt(Inventory::getQuantity).average().orElse(0.0) : 0.0;

        List<InventoryResponse> lowStockProducts = inventoryRepository.findLowStockItems()
                .stream()
                .limit(10)
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());

        List<MovementResponse> recentMovements = movementRepository.findRecentMovements(PageRequest.of(0, 10))
                .stream()
                .map(this::mapToMovementResponse)
                .collect(Collectors.toList());

        return InventoryStatsResponse.builder()
                .totalProducts(totalProducts)
                .totalValue(totalValue)
                .lowStockCount(lowStockCount)
                .outOfStockCount(outOfStockCount)
                .averageStock(averageStock)
                .lowStockProducts(lowStockProducts)
                .recentMovements(recentMovements)
                .build();
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getLowStockAlert() {
        log.debug("Buscando alertas de estoque baixo");

        return inventoryRepository.findLowStockItems()
                .stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<InventoryResponse> getOutOfStockProducts() {
        log.debug("Buscando produtos sem estoque");

        return inventoryRepository.findOutOfStockItems()
                .stream()
                .map(this::mapToInventoryResponse)
                .collect(Collectors.toList());
    }

    // =================== UTILITIES ===================

    @Transactional(readOnly = true)
    public StockCheckResponse checkStock(Long productId) {
        Optional<Inventory> inventoryOpt = inventoryRepository.findByProductId(productId);

        if (inventoryOpt.isEmpty()) {
            return StockCheckResponse.builder()
                    .available(false)
                    .quantity(0)
                    .isLowStock(true)
                    .build();
        }

        Inventory inventory = inventoryOpt.get();
        return StockCheckResponse.builder()
                .available(inventory.getQuantity() > 0)
                .quantity(inventory.getQuantity())
                .isLowStock(inventory.isLowStock())
                .build();
    }

    @Transactional(readOnly = true)
    public boolean hasInventory(Long productId) {
        return inventoryRepository.findByProductId(productId).isPresent();
    }

    @Transactional(readOnly = true)
    public boolean reserveStock(Long productId, Integer quantity) {
        StockCheckResponse stockCheck = checkStock(productId);
        return stockCheck.getAvailable() && stockCheck.getQuantity() >= quantity;
    }

    // =================== PRIVATE METHODS ===================

    private void validateInventoryBusinessRules(Object request) {
        // Implementar validações de regras de negócio específicas
        if (request instanceof CreateInventoryRequest createRequest) {
            if (createRequest.getMaxStock() != null && createRequest.getMinStock() != null) {
                if (createRequest.getMaxStock() <= createRequest.getMinStock()) {
                    throw new ApiException("Estoque máximo deve ser maior que o mínimo", HttpStatus.BAD_REQUEST);
                }
            }
        } else if (request instanceof UpdateInventoryRequest updateRequest) {
            if (updateRequest.getMaxStock() != null && updateRequest.getMinStock() != null) {
                if (updateRequest.getMaxStock() <= updateRequest.getMinStock()) {
                    throw new ApiException("Estoque máximo deve ser maior que o mínimo", HttpStatus.BAD_REQUEST);
                }
            }
        }
    }

    private InventoryResponse mapToInventoryResponse(Inventory inventory) {
        Product product = inventory.getProduct();

        // Calcular status do estoque
        String status = "OK";
        if (inventory.isOutOfStock()) {
            status = "OUT";
        } else if (inventory.isLowStock()) {
            status = "LOW";
        } else if (inventory.isOverstock()) {
            status = "OVERSTOCK";
        }

        return InventoryResponse.builder()
                .id(inventory.getId())
                .quantity(inventory.getQuantity())
                .minStock(inventory.getMinStock())
                .maxStock(inventory.getMaxStock())
                .location(inventory.getLocation())
                .lastUpdate(inventory.getLastUpdate())
                .createdAt(inventory.getCreatedAt())
                .updatedAt(inventory.getUpdatedAt())
                .isLowStock(inventory.isLowStock())
                .isOutOfStock(inventory.isOutOfStock())
                .isOverstock(inventory.isOverstock())
                .status(status)
                .product(InventoryResponse.ProductInfo.builder()
                        .id(product.getId())
                        .name(product.getName())
                        .code(product.getCode())
                        .price(product.getPrice())
                        .category(product.getCategory() != null ?
                                InventoryResponse.ProductInfo.CategoryInfo.builder()
                                        .id(product.getCategory().getId())
                                        .name(product.getCategory().getName())
                                        .build() : null)
                        .supplier(product.getSupplier() != null ?
                                InventoryResponse.ProductInfo.SupplierInfo.builder()
                                        .id(product.getSupplier().getId())
                                        .name(product.getSupplier().getName())
                                        .build() : null)
                        .build())
                .build();
    }

    private MovementResponse mapToMovementResponse(InventoryMovement movement) {
        return MovementResponse.builder()
                .id(movement.getId())
                .type(movement.getType())
                .quantity(movement.getQuantity())
                .reason(movement.getReason())
                .createdAt(movement.getCreatedAt())
                .product(movement.getProduct() != null ?
                        MovementResponse.ProductInfo.builder()
                                .id(movement.getProduct().getId())
                                .name(movement.getProduct().getName())
                                .code(movement.getProduct().getCode())
                                .build() : null)
                .user(movement.getUser() != null ?
                        MovementResponse.UserInfo.builder()
                                .id(movement.getUser().getId())
                                .name(movement.getUser().getName())
                                .build() : null)
                .sale(movement.getSale() != null ?
                        MovementResponse.SaleInfo.builder()
                                .id(movement.getSale().getId())
                                .customerName(movement.getSale().getCustomer().getName())
                                .build() : null)
                .build();
    }

    private Pageable createPageable(int page, int size, String sortBy, String sortOrder) {
        Sort.Direction direction = "desc".equalsIgnoreCase(sortOrder) ?
                Sort.Direction.DESC : Sort.Direction.ASC;

        // Mapear campos de ordenação
        String actualSortBy = switch (sortBy) {
            case "productName" -> "product.name";
            case "quantity" -> "quantity";
            case "minStock" -> "minStock";
            case "location" -> "location";
            case "lastUpdate" -> "lastUpdate";
            default -> "product.name";
        };

        return PageRequest.of(page, size, Sort.by(direction, actualSortBy));
    }

    private void logInventoryOperation(Long userId, String action, Long targetId, String details) {
        log.info("[INVENTORY_AUDIT] User {} performed {} on inventory {} - {}",
                userId, action, targetId, details);

        // TODO: Implementar tabela de auditoria se necessário
    }
}






