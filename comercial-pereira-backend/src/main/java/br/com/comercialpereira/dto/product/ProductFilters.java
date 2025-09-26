package br.com.comercialpereira.dto.product;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProductFilters {
    private String search;
    private Long categoryId;
    private Long supplierId;
    private Boolean isActive;
    private Boolean hasStock;
    private Boolean lowStock;
    private Boolean noStock;
    private BigDecimal minPrice;
    private BigDecimal maxPrice;
    private Boolean hasBarcode;
    private int page = 0;
    private int size = 20;
    private String sortBy = "name";
    private String sortOrder = "asc";
}