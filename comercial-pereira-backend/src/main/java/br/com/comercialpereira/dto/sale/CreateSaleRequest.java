package br.com.comercialpereira.dto.sale;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSaleRequest {

    @NotNull(message = "Cliente é obrigatório")
    private Long customerId;

    @Size(max = 1000, message = "Observações devem ter no máximo 1000 caracteres")
    private String notes;

    @DecimalMin(value = "0.00", message = "Desconto não pode ser negativo")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Taxa não pode ser negativa")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @NotEmpty(message = "Venda deve ter pelo menos um item")
    @Valid
    private List<SaleItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SaleItemRequest {

        @NotNull(message = "Produto é obrigatório")
        private Long productId;

        @NotNull(message = "Quantidade é obrigatória")
        @Min(value = 1, message = "Quantidade deve ser maior que zero")
        @Max(value = 10000, message = "Quantidade muito alta")
        private Integer quantity;

        @DecimalMin(value = "0.01", message = "Preço unitário deve ser maior que zero")
        @Digits(integer = 6, fraction = 2)
        private BigDecimal unitPrice; // Se não fornecido, usar preço atual do produto

        @DecimalMin(value = "0.00", message = "Desconto não pode ser negativo")
        @Digits(integer = 8, fraction = 2)
        private BigDecimal discount = BigDecimal.ZERO;
    }
}