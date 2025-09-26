package br.com.comercialpereira.dto.sale;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateSaleRequest {

    private Long customerId;

    @Size(max = 1000, message = "Observações devem ter no máximo 1000 caracteres")
    private String notes;

    @DecimalMin(value = "0.00", message = "Desconto não pode ser negativo")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal discount;

    @DecimalMin(value = "0.00", message = "Taxa não pode ser negativa")
    @Digits(integer = 8, fraction = 2)
    private BigDecimal tax;
}