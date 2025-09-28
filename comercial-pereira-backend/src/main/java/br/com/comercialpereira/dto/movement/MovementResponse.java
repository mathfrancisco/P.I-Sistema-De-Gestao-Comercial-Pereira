package br.com.comercialpereira.dto.movement;

import br.com.comercialpereira.enums.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovementResponse {
    private Long id;
    private MovementType type;
    private Integer quantity;
    private String reason;
    private LocalDateTime createdAt;

    // Relacionamentos
    private ProductInfo product;
    private UserInfo user;
    private SaleInfo sale;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ProductInfo {
        private Long id;
        private String name;
        private String code;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private Long id;
        private String name;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleInfo {
        private Long id;
        private String customerName;
    }
}