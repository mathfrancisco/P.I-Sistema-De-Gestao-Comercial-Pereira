package br.com.comercialpereira.dto.supplier;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SupplierFilters {
    private String search;
    private Boolean isActive;
    private String state;
    private Boolean hasEmail;
    private Boolean hasCnpj;
    private int page = 0;
    private int size = 20;
    private String sortBy = "name";
    private String sortOrder = "asc";
}