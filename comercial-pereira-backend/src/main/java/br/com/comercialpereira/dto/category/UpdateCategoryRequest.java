package br.com.comercialpereira.dto.category;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateCategoryRequest {

    @Size(min = 1, max = 100, message = "Nome deve ter entre 1 e 100 caracteres")
    private String name;

    @Size(max = 500, message = "Descrição deve ter no máximo 500 caracteres")
    private String description;

    @Pattern(regexp = "^\\d{2}\\.\\d{2}-\\d-\\d{2}$", message = "CNAE deve seguir o padrão XX.XX-X-XX")
    private String cnae;

    private Boolean isActive;
}