package br.com.comercialpereira.controller;

import br.com.comercialpereira.dto.product.*;
import br.com.comercialpereira.services.ProductService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/products")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    public ResponseEntity<ProductResponse> createProduct(@Valid @RequestBody CreateProductRequest request) {
        log.info("Creating new product: {}", request.getName());

        ProductResponse response = productService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<ProductResponse>> getProducts(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean hasStock,
            @RequestParam(required = false) Boolean lowStock,
            @RequestParam(required = false) Boolean noStock,
            @RequestParam(required = false) java.math.BigDecimal minPrice,
            @RequestParam(required = false) java.math.BigDecimal maxPrice,
            @RequestParam(required = false) Boolean hasBarcode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        log.debug("Getting products with filters - page: {}, size: {}", page, size);

        ProductFilters filters = ProductFilters.builder()
                .search(search)
                .categoryId(categoryId)
                .supplierId(supplierId)
                .isActive(isActive)
                .hasStock(hasStock)
                .lowStock(lowStock)
                .noStock(noStock)
                .minPrice(minPrice)
                .maxPrice(maxPrice)
                .hasBarcode(hasBarcode)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .build();

        Page<ProductResponse> response = productService.findByFilters(filters);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProductResponse> getProductById(@PathVariable Long id) {
        log.debug("Getting product by ID: {}", id);

        ProductResponse response = productService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/code/{code}")
    public ResponseEntity<ProductResponse> getProductByCode(@PathVariable String code) {
        log.debug("Getting product by code: {}", code);

        ProductResponse response = productService.findByCode(code);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<ProductResponse> updateProduct(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProductRequest request) {

        log.info("Updating product with ID: {}", id);

        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        log.info("Deleting product with ID: {}", id);

        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<ProductResponse>> searchProducts(
            @RequestParam String q,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "false") Boolean includeInactive) {

        log.debug("Searching products with query: {}", q);

        List<ProductResponse> response = productService.search(q, categoryId, limit, includeInactive);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<ProductResponse>> getActiveProducts() {
        log.debug("Getting all active products");

        List<ProductResponse> response = productService.getActiveProducts();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<ProductResponse>> getProductsByCategory(@PathVariable Long categoryId) {
        log.debug("Getting products by category: {}", categoryId);

        List<ProductResponse> response = productService.getProductsByCategory(categoryId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/supplier/{supplierId}")
    public ResponseEntity<List<ProductResponse>> getProductsBySupplier(@PathVariable Long supplierId) {
        log.debug("Getting products by supplier: {}", supplierId);

        List<ProductResponse> response = productService.getProductsBySupplier(supplierId);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/low-stock")
    public ResponseEntity<List<ProductResponse>> getLowStockProducts() {
        log.debug("Getting products with low stock");

        List<ProductResponse> response = productService.getLowStockProducts();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/out-of-stock")
    public ResponseEntity<List<ProductResponse>> getOutOfStockProducts() {
        log.debug("Getting products out of stock");

        List<ProductResponse> response = productService.getOutOfStockProducts();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/check-code")
    public ResponseEntity<Map<String, Boolean>> checkCodeAvailability(
            @RequestParam String code,
            @RequestParam(required = false) Long excludeId) {

        log.debug("Checking code availability: {}", code);

        boolean available = productService.checkCodeAvailability(code, excludeId);
        return ResponseEntity.ok(Map.of("available", available));
    }

    // Endpoints adicionais para relatórios e estatísticas

    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getProductsSummary() {
        log.debug("Getting products summary");

        // Implementação básica - pode ser expandida conforme necessário
        List<ProductResponse> allProducts = productService.getActiveProducts();
        List<ProductResponse> lowStock = productService.getLowStockProducts();
        List<ProductResponse> outOfStock = productService.getOutOfStockProducts();

        Map<String, Object> summary = Map.of(
                "totalProducts", allProducts.size(),
                "lowStockProducts", lowStock.size(),
                "outOfStockProducts", outOfStock.size()
        );

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<ProductResponse> getProductByBarcode(@PathVariable String barcode) {
        log.debug("Getting product by barcode: {}", barcode);

        // Implementação utilizando busca por código de barras
        // Como não temos um método específico no repository, vamos fazer uma busca genérica
        List<ProductResponse> products = productService.search(barcode, null, 1, false);

        if (products.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        // Filtrar pelo barcode exato
        ProductResponse product = products.stream()
                .filter(p -> barcode.equals(p.getBarcode()))
                .findFirst()
                .orElse(null);

        if (product == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(product);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<ProductResponse> toggleProductStatus(@PathVariable Long id) {
        log.info("Toggling status for product with ID: {}", id);

        ProductResponse currentProduct = productService.findById(id);

        UpdateProductRequest request = UpdateProductRequest.builder()
                .isActive(!currentProduct.getIsActive())
                .build();

        ProductResponse response = productService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch-update-status")
    public ResponseEntity<Map<String, Object>> batchUpdateStatus(
            @RequestBody Map<String, Object> request) {

        log.info("Batch updating product status");

        @SuppressWarnings("unchecked")
        List<Long> productIds = (List<Long>) request.get("productIds");
        Boolean isActive = (Boolean) request.get("isActive");

        int successCount = 0;
        int errorCount = 0;

        for (Long productId : productIds) {
            try {
                UpdateProductRequest updateRequest = UpdateProductRequest.builder()
                        .isActive(isActive)
                        .build();

                productService.update(productId, updateRequest);
                successCount++;
            } catch (Exception e) {
                log.error("Error updating product {}: {}", productId, e.getMessage());
                errorCount++;
            }
        }

        Map<String, Object> result = Map.of(
                "success", successCount,
                "errors", errorCount,
                "total", productIds.size()
        );

        return ResponseEntity.ok(result);
    }
}