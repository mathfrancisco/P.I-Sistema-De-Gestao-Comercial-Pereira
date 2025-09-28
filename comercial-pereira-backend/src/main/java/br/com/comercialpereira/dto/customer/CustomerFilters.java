package br.com.comercialpereira.dto.customer;

import br.com.comercialpereira.enums.CustomerType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CustomerFilters {
    private String search;
    private CustomerType type;
    private String city;
    private String state;
    private Boolean isActive;
    private Boolean hasEmail;
    private Boolean hasDocument;
    private int page = 0;
    private int size = 20;
    private String sortBy = "name";
    private String sortOrder = "asc";
}