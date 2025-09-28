package br.com.comercialpereira.dto.category;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategorySelectOption {
    private Long value;
    private String label;
    private String cnae;
    private Boolean isActive;
}
