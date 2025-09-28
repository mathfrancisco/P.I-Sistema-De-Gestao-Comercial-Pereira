package br.com.comercialpereira.dto.inventory;
import br.com.comercialpereira.enums.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementRequest {
    private Long productId;
    private MovementType type;
    private Integer quantity;
    private String reason;
    private Long saleId;
}
