package br.com.comercialpereira.dto.sale;

import br.com.comercialpereira.enums.SaleStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SaleFilters {
    private Long customerId;
    private Long userId;
    private SaleStatus status;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private BigDecimal minTotal;
    private BigDecimal maxTotal;
    private String search; // Busca em notas ou nome do cliente
    private int page = 0;
    private int size = 20;
    private String sortBy = "saleDate";
    private String sortOrder = "desc";
    private Boolean includeItems = false;
}