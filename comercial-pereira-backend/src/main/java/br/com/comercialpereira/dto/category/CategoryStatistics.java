package br.com.comercialpereira.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryStatistics {
    private Integer totalProducts;
    private Double totalValue;
    private Double averagePrice;
    private Integer lowStockProducts;
    private Double totalInventoryValue;
}
