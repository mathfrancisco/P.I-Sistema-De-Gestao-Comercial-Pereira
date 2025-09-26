package br.com.comercialpereira.controller;

import br.com.comercialpereira.dto.inventory.*;
import br.com.comercialpereira.dto.movement.*;
import br.com.comercialpereira.services.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Gestão de Estoque", description = "Endpoints para gerenciamento de estoque e movimentações")
public class InventoryController {

    private final InventoryService inventoryService;

    // =================== CRUD BÁSICO ===================

    @PostMapping
    @Operation(summary = "Criar estoque para produto",
            description = "Cria um novo registro de estoque para um produto específico")
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Estoque criado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Produto não encontrado"),
            @ApiResponse(responseCode = "409", description = "Estoque já existe para este produto")
    })
    public ResponseEntity<InventoryResponse> createInventory(
            @Valid @RequestBody CreateInventoryRequest request) {

        log.info("Criando estoque para produto ID: {}", request.getProductId());
        InventoryResponse response = inventoryService.createForProduct(request.getProductId(), request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    @Operation(summary = "Listar estoques",
            description = "Busca estoques com filtros e paginação")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de estoques retornada com sucesso")
    })
    public ResponseEntity<Page<InventoryResponse>> getInventories(
            @Parameter(description = "Termo de busca (nome ou código do produto)")
            @RequestParam(required = false) String search,

            @Parameter(description = "ID da categoria")
            @RequestParam(required = false) Long categoryId,

            @Parameter(description = "ID do fornecedor")
            @RequestParam(required = false) Long supplierId,

            @Parameter(description = "Localização do estoque")
            @RequestParam(required = false) String location,

            @Parameter(description = "Filtrar apenas produtos com estoque baixo")
            @RequestParam(required = false) Boolean lowStock,

            @Parameter(description = "Filtrar apenas produtos sem estoque")
            @RequestParam(required = false) Boolean outOfStock,

            @Parameter(description = "Filtrar apenas produtos com estoque disponível")
            @RequestParam(required = false) Boolean hasStock,

            @Parameter(description = "Quantidade mínima")
            @RequestParam(required = false) Integer minQuantity,

            @Parameter(description = "Quantidade máxima")
            @RequestParam(required = false) Integer maxQuantity,

            @Parameter(description = "Página (iniciando em 0)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Tamanho da página")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Campo para ordenação")
            @RequestParam(defaultValue = "productName") String sortBy,

            @Parameter(description = "Direção da ordenação (asc/desc)")
            @RequestParam(defaultValue = "asc") String sortOrder) {

        InventoryFilters filters = InventoryFilters.builder()
                .search(search)
                .categoryId(categoryId)
                .supplierId(supplierId)
                .location(location)
                .lowStock(lowStock)
                .outOfStock(outOfStock)
                .hasStock(hasStock)
                .minQuantity(minQuantity)
                .maxQuantity(maxQuantity)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .build();

        Page<InventoryResponse> response = inventoryService.findMany(filters);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Buscar estoque por ID",
            description = "Retorna os detalhes de um estoque específico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estoque encontrado"),
            @ApiResponse(responseCode = "404", description = "Estoque não encontrado")
    })
    public ResponseEntity<InventoryResponse> getInventoryById(
            @Parameter(description = "ID do estoque")
            @PathVariable Long id) {

        InventoryResponse response = inventoryService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}")
    @Operation(summary = "Buscar estoque por produto",
            description = "Retorna o estoque de um produto específico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estoque do produto encontrado"),
            @ApiResponse(responseCode = "404", description = "Estoque não encontrado para este produto")
    })
    public ResponseEntity<InventoryResponse> getInventoryByProduct(
            @Parameter(description = "ID do produto")
            @PathVariable Long productId) {

        InventoryResponse response = inventoryService.findByProductId(productId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Atualizar configurações do estoque",
            description = "Atualiza as configurações de um estoque (min/max/localização)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estoque atualizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Estoque não encontrado")
    })
    public ResponseEntity<InventoryResponse> updateInventory(
            @Parameter(description = "ID do estoque")
            @PathVariable Long id,

            @Valid @RequestBody UpdateInventoryRequest request,
            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        InventoryResponse response = inventoryService.update(id, request, currentUserId);
        return ResponseEntity.ok(response);
    }

    // =================== MOVIMENTAÇÕES DE ESTOQUE ===================

    @PostMapping("/adjust")
    @Operation(summary = "Ajustar estoque",
            description = "Realiza ajuste manual do estoque (positivo ou negativo)")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Ajuste realizado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou estoque insuficiente"),
            @ApiResponse(responseCode = "404", description = "Produto ou estoque não encontrado")
    })
    public ResponseEntity<InventoryResponse> adjustStock(
            @Valid @RequestBody StockAdjustmentRequest request,
            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        InventoryResponse response = inventoryService.adjustStock(request, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/add")
    @Operation(summary = "Adicionar estoque",
            description = "Adiciona quantidade ao estoque de um produto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estoque adicionado com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos"),
            @ApiResponse(responseCode = "404", description = "Produto ou estoque não encontrado")
    })
    public ResponseEntity<InventoryResponse> addStock(
            @Parameter(description = "ID do produto")
            @RequestParam Long productId,

            @Parameter(description = "Quantidade a adicionar")
            @RequestParam Integer quantity,

            @Parameter(description = "Motivo da adição")
            @RequestParam String reason,

            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        InventoryResponse response = inventoryService.addStock(productId, quantity, reason, currentUserId);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/remove")
    @Operation(summary = "Remover estoque",
            description = "Remove quantidade do estoque de um produto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estoque removido com sucesso"),
            @ApiResponse(responseCode = "400", description = "Dados inválidos ou estoque insuficiente"),
            @ApiResponse(responseCode = "404", description = "Produto ou estoque não encontrado")
    })
    public ResponseEntity<InventoryResponse> removeStock(
            @Parameter(description = "ID do produto")
            @RequestParam Long productId,

            @Parameter(description = "Quantidade a remover")
            @RequestParam Integer quantity,

            @Parameter(description = "Motivo da remoção")
            @RequestParam String reason,

            @Parameter(description = "ID da venda (opcional)")
            @RequestParam(required = false) Long saleId,

            Authentication authentication) {

        Long currentUserId = getCurrentUserId(authentication);
        InventoryResponse response = inventoryService.removeStock(productId, quantity, reason, currentUserId, saleId);
        return ResponseEntity.ok(response);
    }

    // =================== HISTÓRICO DE MOVIMENTAÇÕES ===================

    @GetMapping("/movements")
    @Operation(summary = "Listar movimentações",
            description = "Busca histórico de movimentações com filtros")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Lista de movimentações retornada com sucesso")
    })
    public ResponseEntity<Page<MovementResponse>> getMovements(
            @Parameter(description = "ID do produto")
            @RequestParam(required = false) Long productId,

            @Parameter(description = "Tipo de movimentação")
            @RequestParam(required = false) String type,

            @Parameter(description = "ID do usuário")
            @RequestParam(required = false) Long userId,

            @Parameter(description = "ID da venda")
            @RequestParam(required = false) Long saleId,

            @Parameter(description = "Termo de busca no motivo")
            @RequestParam(required = false) String reason,

            @Parameter(description = "Data início (yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,

            @Parameter(description = "Data fim (yyyy-MM-dd'T'HH:mm:ss)")
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,

            @Parameter(description = "Página (iniciando em 0)")
            @RequestParam(defaultValue = "0") int page,

            @Parameter(description = "Tamanho da página")
            @RequestParam(defaultValue = "20") int size,

            @Parameter(description = "Campo para ordenação")
            @RequestParam(defaultValue = "createdAt") String sortBy,

            @Parameter(description = "Direção da ordenação (asc/desc)")
            @RequestParam(defaultValue = "desc") String sortOrder) {

        MovementFilters filters = MovementFilters.builder()
                .productId(productId)
                .type(type != null ? br.com.comercialpereira.enums.MovementType.valueOf(type) : null)
                .userId(userId)
                .saleId(saleId)
                .reason(reason)
                .dateFrom(dateFrom)
                .dateTo(dateTo)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .build();

        Page<MovementResponse> response = inventoryService.getMovements(filters);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/product/{productId}/movements")
    @Operation(summary = "Movimentações do produto",
            description = "Retorna as últimas movimentações de um produto específico")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Movimentações do produto retornadas com sucesso")
    })
    public ResponseEntity<List<MovementResponse>> getProductMovements(
            @Parameter(description = "ID do produto")
            @PathVariable Long productId,

            @Parameter(description = "Limite de registros")
            @RequestParam(defaultValue = "20") Integer limit) {

        List<MovementResponse> response = inventoryService.getProductMovements(productId, limit);
        return ResponseEntity.ok(response);
    }

    // =================== ESTATÍSTICAS E RELATÓRIOS ===================

    @GetMapping("/statistics")
    @Operation(summary = "Estatísticas do estoque",
            description = "Retorna estatísticas gerais do estoque")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Estatísticas retornadas com sucesso")
    })
    public ResponseEntity<InventoryStatsResponse> getStatistics() {
        InventoryStatsResponse response = inventoryService.getStatistics();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alerts/low-stock")
    @Operation(summary = "Alertas de estoque baixo",
            description = "Retorna produtos com estoque abaixo do mínimo")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Alertas de estoque baixo retornados com sucesso")
    })
    public ResponseEntity<List<InventoryResponse>> getLowStockAlert() {
        List<InventoryResponse> response = inventoryService.getLowStockAlert();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/alerts/out-of-stock")
    @Operation(summary = "Produtos sem estoque",
            description = "Retorna produtos com estoque zerado")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Produtos sem estoque retornados com sucesso")
    })
    public ResponseEntity<List<InventoryResponse>> getOutOfStockProducts() {
        List<InventoryResponse> response = inventoryService.getOutOfStockProducts();
        return ResponseEntity.ok(response);
    }

    // =================== UTILITÁRIOS ===================

    @GetMapping("/check/{productId}")
    @Operation(summary = "Verificar estoque",
            description = "Verifica disponibilidade e quantidade em estoque")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Informações de estoque retornadas com sucesso")
    })
    public ResponseEntity<StockCheckResponse> checkStock(
            @Parameter(description = "ID do produto")
            @PathVariable Long productId) {

        StockCheckResponse response = inventoryService.checkStock(productId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/exists/{productId}")
    @Operation(summary = "Verificar se produto tem estoque",
            description = "Verifica se existe registro de estoque para o produto")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Verificação realizada com sucesso")
    })
    public ResponseEntity<Boolean> hasInventory(
            @Parameter(description = "ID do produto")
            @PathVariable Long productId) {

        boolean hasInventory = inventoryService.hasInventory(productId);
        return ResponseEntity.ok(hasInventory);
    }

    @PostMapping("/reserve")
    @Operation(summary = "Reservar estoque",
            description = "Verifica se é possível reservar quantidade específica")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Verificação de reserva realizada com sucesso")
    })
    public ResponseEntity<Boolean> reserveStock(
            @Parameter(description = "ID do produto")
            @RequestParam Long productId,

            @Parameter(description = "Quantidade a reservar")
            @RequestParam Integer quantity) {

        boolean canReserve = inventoryService.reserveStock(productId, quantity);
        return ResponseEntity.ok(canReserve);
    }

    // =================== MÉTODOS AUXILIARES ===================

    private Long getCurrentUserId(Authentication authentication) {
        // Implementar conforme sua estratégia de autenticação
        // Exemplo com JWT ou User Details:
        if (authentication != null && authentication.isAuthenticated()) {
            // Se usando UserDetails customizado
            // UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            // return principal.getId();

            // Se usando JWT com claims
            // return Long.parseLong(authentication.getName());

            // Temporário - retorna 1L para testes
            return 1L;
        }
        throw new RuntimeException("Usuário não autenticado");
    }
}

// =================== EXCEPTION HANDLER ESPECÍFICO ===================

@RestControllerAdvice
@Slf4j
class InventoryControllerAdvice {

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException ex) {
        log.warn("Argumento inválido: {}", ex.getMessage());

        ErrorResponse error = ErrorResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(400)
                .error("Bad Request")
                .message(ex.getMessage())
                .build();

        return ResponseEntity.badRequest().body(error);
    }
}

// =================== DTOs DE RESPOSTA AUXILIARES ===================

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
class ErrorResponse {
    private LocalDateTime timestamp;
    private Integer status;
    private String error;
    private String message;
    private java.util.Map<String, String> validationErrors;
}