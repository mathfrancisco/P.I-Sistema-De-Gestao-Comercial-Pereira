package br.com.comercialpereira.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryFilters {
    private String search;
    private Long categoryId;
    private Long supplierId;
    private String location;
    private Boolean lowStock;
    private Boolean outOfStock;
    private Boolean hasStock;
    private Integer minQuantity;
    private Integer maxQuantity;
    private int page = 0;
    private int size = 20;
    private String sortBy = "productName";
    private String sortOrder = "asc";
}