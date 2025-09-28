package br.com.comercialpereira.dto.sale;

import br.com.comercialpereira.enums.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleResponse {
    private Long id;
    private BigDecimal total;
    private BigDecimal discount;
    private BigDecimal tax;
    private SaleStatus status;
    private String notes;
    private LocalDateTime saleDate;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Relacionamentos
    private UserInfo user;
    private CustomerInfo customer;
    private List<SaleItemInfo> items;
    private Integer itemCount;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
        private String role;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerInfo {
        private Long id;
        private String name;
        private String type;
        private String document;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItemInfo {
        private Long id;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal total;
        private BigDecimal discount;
        private ProductInfo product;

        @Data
        @Builder
        @NoArgsConstructor
        @AllArgsConstructor
        public static class ProductInfo {
            private Long id;
            private String name;
            private String code;
            private String categoryName;
        }
    }
}