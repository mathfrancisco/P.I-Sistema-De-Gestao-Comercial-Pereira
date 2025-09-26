package br.com.comercialpereira.controller;

import br.com.comercialpereira.dto.PageResponse;
import br.com.comercialpereira.dto.sale.CreateSaleRequest;
import br.com.comercialpereira.dto.sale.SaleResponse;
import br.com.comercialpereira.dto.sale.UpdateSaleItemRequest;
import br.com.comercialpereira.dto.sale.UpdateSaleRequest;
import br.com.comercialpereira.dto.sale.AddSaleItemRequest;
import br.com.comercialpereira.enums.SaleStatus;
import br.com.comercialpereira.services.SaleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/sales")
@RequiredArgsConstructor
public class SaleController {

    private final SaleService saleService;

    /**
     * Endpoint para criar uma nova venda.
     */
    @PostMapping
    public ResponseEntity<SaleResponse> createSale(@Valid @RequestBody CreateSaleRequest request) {
        SaleResponse createdSale = saleService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSale);
    }

    /**
     * Endpoint para buscar uma venda pelo seu ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<SaleResponse> getSaleById(@PathVariable Long id) {
        SaleResponse sale = saleService.findById(id);
        return ResponseEntity.ok(sale);
    }

    /**
     * Endpoint para listar vendas com filtros e paginação.
     * Exemplo: /api/v1/sales?customerId=1&status=COMPLETED&page=0&size=10&sort=saleDate,desc
     */
    @GetMapping
    public ResponseEntity<PageResponse<SaleResponse>> getAllSales(
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) SaleStatus status,
            @PageableDefault(size = 10, sort = "saleDate") Pageable pageable) {
        PageResponse<SaleResponse> response = saleService.findAll(customerId, userId, status, pageable);
        return ResponseEntity.ok(response);
    }

    /**
     * Endpoint para atualizar os dados de uma venda.
     */
    @PutMapping("/{id}")
    public ResponseEntity<SaleResponse> updateSale(@PathVariable Long id, @Valid @RequestBody UpdateSaleRequest request) {
        SaleResponse updatedSale = saleService.update(id, request);
        return ResponseEntity.ok(updatedSale);
    }

    /**
     * Endpoint para cancelar uma venda.
     */
    @PatchMapping("/{id}/cancel") // Usando PATCH, pois é uma alteração parcial de estado
    public ResponseEntity<SaleResponse> cancelSale(@PathVariable Long id) {
        SaleResponse cancelledSale = saleService.cancel(id);
        return ResponseEntity.ok(cancelledSale);
    }
    /**
     * Endpoint para adicionar um item a uma venda existente.
     */
    @PostMapping("/{saleId}/items")
    public ResponseEntity<SaleResponse> addItemToSale(
            @PathVariable Long saleId,
            @Valid @RequestBody AddSaleItemRequest itemRequest) {
        SaleResponse updatedSale = saleService.addItem(saleId, itemRequest);
        return ResponseEntity.ok(updatedSale);
    }

    /**
     * Endpoint para atualizar um item específico de uma venda.
     */
    @PutMapping("/{saleId}/items/{itemId}")
    public ResponseEntity<SaleResponse> updateSaleItem(
            @PathVariable Long saleId,
            @PathVariable Long itemId,
            @Valid @RequestBody UpdateSaleItemRequest itemRequest) {
        SaleResponse updatedSale = saleService.updateItem(saleId, itemId, itemRequest);
        return ResponseEntity.ok(updatedSale);
    }

    /**
     * Endpoint para remover um item de uma venda.
     */
    @DeleteMapping("/{saleId}/items/{itemId}")
    public ResponseEntity<SaleResponse> removeSaleItem(
            @PathVariable Long saleId,
            @PathVariable Long itemId) {
        SaleResponse updatedSale = saleService.removeItem(saleId, itemId);
        return ResponseEntity.ok(updatedSale);
    }
}