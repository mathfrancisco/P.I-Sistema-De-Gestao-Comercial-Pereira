package br.com.comercialpereira.dto.movement;

import br.com.comercialpereira.enums.MovementType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MovementFilters {
    private Long productId;
    private MovementType type;
    private Long userId;
    private Long saleId;
    private String reason;
    private LocalDateTime dateFrom;
    private LocalDateTime dateTo;
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortOrder = "desc";
}