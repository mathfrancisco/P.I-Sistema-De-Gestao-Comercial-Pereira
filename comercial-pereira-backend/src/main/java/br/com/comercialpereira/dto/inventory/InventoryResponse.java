package br.com.comercialpereira.dto.inventory;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private Integer quantity;
    private Integer minStock;
    private Integer maxStock;
    private String location;
    private LocalDateTime lastUpdate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Campos calculados
    private Boolean isLowStock;
    private Boolean isOutOfStock;
    private Boolean isOverstock;
    private String status; // OK, LOW, CRITICAL, OUT, OVERSTOCK

    // Produto relacionado
    private ProductInfo product;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
        private String code;
        private BigDecimal price;
        private CategoryInfo category;
        private SupplierInfo supplier;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class CategoryInfo {
            private Long id;
            private String name;
        }

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class SupplierInfo {
            private Long id;
            private String name;
        }
    }
}