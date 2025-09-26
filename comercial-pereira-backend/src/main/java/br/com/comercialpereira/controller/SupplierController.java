package br.com.comercialpereira.controller;

import br.com.comercialpereira.dto.supplier.*;
import br.com.comercialpereira.services.SupplierService;
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
@RequestMapping("/api/suppliers")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class SupplierController {

    private final SupplierService supplierService;

    @PostMapping
    public ResponseEntity<SupplierResponse> createSupplier(@Valid @RequestBody CreateSupplierRequest request) {
        log.info("Creating new supplier: {}", request.getName());

        SupplierResponse response = supplierService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<Page<SupplierResponse>> getSuppliers(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) String state,
            @RequestParam(required = false) Boolean hasEmail,
            @RequestParam(required = false) Boolean hasCnpj,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(defaultValue = "name") String sortBy,
            @RequestParam(defaultValue = "asc") String sortOrder) {

        log.debug("Getting suppliers with filters - page: {}, size: {}", page, size);

        SupplierFilters filters = SupplierFilters.builder()
                .search(search)
                .isActive(isActive)
                .state(state)
                .hasEmail(hasEmail)
                .hasCnpj(hasCnpj)
                .page(page)
                .size(size)
                .sortBy(sortBy)
                .sortOrder(sortOrder)
                .build();

        Page<SupplierResponse> response = supplierService.findByFilters(filters);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SupplierResponse> getSupplierById(@PathVariable Long id) {
        log.debug("Getting supplier by ID: {}", id);

        SupplierResponse response = supplierService.findById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/cnpj/{cnpj}")
    public ResponseEntity<SupplierResponse> getSupplierByCnpj(@PathVariable String cnpj) {
        log.debug("Getting supplier by CNPJ: {}", cnpj);

        SupplierResponse response = supplierService.findByCnpj(cnpj);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Long id,
            @Valid @RequestBody UpdateSupplierRequest request) {

        log.info("Updating supplier with ID: {}", id);

        SupplierResponse response = supplierService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSupplier(@PathVariable Long id) {
        log.info("Deleting supplier with ID: {}", id);

        supplierService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/search")
    public ResponseEntity<List<SupplierResponse>> searchSuppliers(
            @RequestParam String q,
            @RequestParam(defaultValue = "20") Integer limit,
            @RequestParam(defaultValue = "false") Boolean includeInactive) {

        log.debug("Searching suppliers with query: {}", q);

        List<SupplierResponse> response = supplierService.search(q, limit, includeInactive);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/active")
    public ResponseEntity<List<SupplierResponse>> getActiveSuppliers() {
        log.debug("Getting all active suppliers");

        List<SupplierResponse> response = supplierService.getActiveSuppliers();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<SupplierResponse>> getSuppliersByState(@PathVariable String state) {
        log.debug("Getting suppliers by state: {}", state);

        List<SupplierResponse> response = supplierService.getSuppliersByState(state);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/with-products")
    public ResponseEntity<List<SupplierResponse>> getSuppliersWithProducts() {
        log.debug("Getting suppliers with products");

        List<SupplierResponse> response = supplierService.getSuppliersWithProducts();
        return ResponseEntity.ok(response);
    }

    @GetMapping("/statistics")
    public ResponseEntity<Map<String, Object>> getStatistics() {
        log.debug("Getting supplier statistics");

        Map<String, Object> response = supplierService.getStatistics();
        return ResponseEntity.ok(response);
    }

    // Endpoints adicionais para relatórios e operações especiais

    @GetMapping("/reports/summary")
    public ResponseEntity<Map<String, Object>> getSuppliersSummary() {
        log.debug("Getting suppliers summary");

        Map<String, Object> statistics = supplierService.getStatistics();

        // Criar um resumo simplificado
        Map<String, Object> summary = Map.of(
                "totalSuppliers", statistics.get("total"),
                "activeSuppliers", statistics.get("active"),
                "inactiveSuppliers", statistics.get("inactive"),
                "suppliersWithProducts", statistics.get("withProducts"),
                "suppliersWithoutProducts", statistics.get("withoutProducts")
        );

        return ResponseEntity.ok(summary);
    }

    @GetMapping("/states")
    public ResponseEntity<List<String>> getAvailableStates() {
        log.debug("Getting available states");

        // Lista dos estados brasileiros
        List<String> brazilianStates = List.of(
                "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
                "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
                "RS", "RO", "RR", "SC", "SP", "SE", "TO"
        );

        return ResponseEntity.ok(brazilianStates);
    }

    @PatchMapping("/{id}/toggle-status")
    public ResponseEntity<SupplierResponse> toggleSupplierStatus(@PathVariable Long id) {
        log.info("Toggling status for supplier with ID: {}", id);

        SupplierResponse currentSupplier = supplierService.findById(id);

        UpdateSupplierRequest request = UpdateSupplierRequest.builder()
                .isActive(!currentSupplier.getIsActive())
                .build();

        SupplierResponse response = supplierService.update(id, request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/batch-update-status")
    public ResponseEntity<Map<String, Object>> batchUpdateStatus(
            @RequestBody Map<String, Object> request) {

        log.info("Batch updating supplier status");

        @SuppressWarnings("unchecked")
        List<Long> supplierIds = (List<Long>) request.get("supplierIds");
        Boolean isActive = (Boolean) request.get("isActive");

        int successCount = 0;
        int errorCount = 0;

        for (Long supplierId : supplierIds) {
            try {
                UpdateSupplierRequest updateRequest = UpdateSupplierRequest.builder()
                        .isActive(isActive)
                        .build();

                supplierService.update(supplierId, updateRequest);
                successCount++;
            } catch (Exception e) {
                log.error("Error updating supplier {}: {}", supplierId, e.getMessage());
                errorCount++;
            }
        }

        Map<String, Object> result = Map.of(
                "success", successCount,
                "errors", errorCount,
                "total", supplierIds.size()
        );

        return ResponseEntity.ok(result);
    }

    @GetMapping("/validation/cnpj")
    public ResponseEntity<Map<String, Boolean>> validateCnpj(
            @RequestParam String cnpj,
            @RequestParam(required = false) Long excludeId) {

        log.debug("Validating CNPJ: {}", cnpj);

        try {
            if (excludeId != null) {
                // Verificar se o CNPJ pertence ao próprio fornecedor sendo editado
                SupplierResponse supplier = supplierService.findById(excludeId);
                if (cnpj.equals(supplier.getCnpj())) {
                    return ResponseEntity.ok(Map.of("available", true));
                }
            }

            // Tentar encontrar fornecedor com o CNPJ
            supplierService.findByCnpj(cnpj);
            // Se encontrou, CNPJ não está disponível
            return ResponseEntity.ok(Map.of("available", false));

        } catch (Exception e) {
            // Se não encontrou, CNPJ está disponível
            return ResponseEntity.ok(Map.of("available", true));
        }
    }

    @GetMapping("/export")
    public ResponseEntity<List<SupplierResponse>> exportSuppliers(
            @RequestParam(required = false) Boolean activeOnly) {

        log.info("Exporting suppliers - activeOnly: {}", activeOnly);

        List<SupplierResponse> suppliers;

        if (activeOnly != null && activeOnly) {
            suppliers = supplierService.getActiveSuppliers();
        } else {
            // Buscar todos os fornecedores
            SupplierFilters filters = SupplierFilters.builder()
                    .page(0)
                    .size(Integer.MAX_VALUE)
                    .sortBy("name")
                    .sortOrder("asc")
                    .build();

            Page<SupplierResponse> page = supplierService.findByFilters(filters);
            suppliers = page.getContent();
        }

        return ResponseEntity.ok(suppliers);
    }

    @PostMapping("/validate")
    public ResponseEntity<Map<String, Object>> validateSupplierData(
            @RequestBody CreateSupplierRequest request) {

        log.debug("Validating supplier data");

        Map<String, Object> validation = Map.of(
                "valid", true,
                "errors", List.of()
        );

        // A validação será feita automaticamente pelo @Valid no endpoint de criação
        // Este endpoint pode ser usado para validações customizadas se necessário

        return ResponseEntity.ok(validation);
    }
}