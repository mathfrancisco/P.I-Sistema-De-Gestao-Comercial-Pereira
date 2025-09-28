package br.com.comercialpereira.dto.inventory;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateInventoryRequest {

    @Min(value = 0, message = "Quantidade não pode ser negativa")
    private Integer quantity;

    @Min(value = 0, message = "Estoque mínimo não pode ser negativo")
    private Integer minStock;

    @Min(value = 1, message = "Estoque máximo deve ser positivo")
    private Integer maxStock;

    @Size(min = 2, max = 100, message = "Localização deve ter entre 2 e 100 caracteres")
    private String location;
}