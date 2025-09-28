package br.com.comercialpereira.dto.movement;

import br.com.comercialpereira.enums.MovementType;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateMovementRequest {

    @NotNull(message = "Produto é obrigatório")
    private Long productId;

    @NotNull(message = "Tipo de movimentação é obrigatório")
    private MovementType type;

    @NotNull(message = "Quantidade é obrigatória")
    @Min(value = 1, message = "Quantidade deve ser maior que zero")
    private Integer quantity;

    @Size(min = 3, max = 500, message = "Motivo deve ter entre 3 e 500 caracteres")
    private String reason;

    private Long saleId; // Para movimentações relacionadas a vendas
}