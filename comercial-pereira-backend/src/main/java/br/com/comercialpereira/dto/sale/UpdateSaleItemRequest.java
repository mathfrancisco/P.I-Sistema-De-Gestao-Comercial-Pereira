package br.com.comercialpereira.dto.sale;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSaleItemRequest {
    @Min(value = 1, message = "Quantidade deve ser maior que zero")
    private Integer quantity;

    @DecimalMin(value = "0.01", message = "Preço unitário deve ser maior que zero")
    private BigDecimal unitPrice;

    @DecimalMin(value = "0.00", message = "Desconto não pode ser negativo")
    private BigDecimal discount;
}