package br.com.comercialpereira.dto.inventory;

import br.com.comercialpereira.dto.movement.MovementResponse;
import java.math.BigDecimal;
import java.util.List;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class InventoryStatsResponse {
    private Long totalProducts;
    private BigDecimal totalValue;
    private Long lowStockCount;
    private Long outOfStockCount;
    private Double averageStock;
    private List<InventoryResponse> lowStockProducts;
    private List<MovementResponse> recentMovements;
}