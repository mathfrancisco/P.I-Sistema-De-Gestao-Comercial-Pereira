package br.com.comercialpereira.dto.user;

import br.com.comercialpereira.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserFilters {
    private String search;
    private UserRole role;
    private Boolean isActive;
    private int page = 0;
    private int size = 20;
    private String sortBy = "name";
    private String sortOrder = "asc";
}