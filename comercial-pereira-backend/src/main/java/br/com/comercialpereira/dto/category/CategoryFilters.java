package br.com.comercialpereira.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryFilters {
    private String search;
    private Boolean isActive;
    private Boolean hasCnae;
    private int page = 0;
    private int size = 20;
    private String sortBy = "name";
    private String sortOrder = "asc";
    private Boolean includeProductCount = false;
}