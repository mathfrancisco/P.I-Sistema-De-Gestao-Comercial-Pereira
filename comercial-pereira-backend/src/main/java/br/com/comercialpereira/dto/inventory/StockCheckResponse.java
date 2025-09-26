package br.com.comercialpereira.dto.inventory;

@lombok.Data
@lombok.Builder
@lombok.NoArgsConstructor
@lombok.AllArgsConstructor
public class StockCheckResponse {
    private Boolean available;
    private Integer quantity;
    private Boolean isLowStock;
}
