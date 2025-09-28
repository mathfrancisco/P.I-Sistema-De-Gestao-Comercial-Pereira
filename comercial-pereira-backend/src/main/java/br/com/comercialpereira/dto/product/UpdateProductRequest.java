package br.com.comercialpereira.dto.product;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateProductRequest {

    @Size(min = 3, max = 255, message = "Nome deve ter entre 3 e 255 caracteres")
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ0-9\\s&.(),\\-]+$", message = "Nome contém caracteres inválidos")
    private String name;

    @Size(min = 10, max = 1000, message = "Descrição deve ter entre 10 e 1000 caracteres")
    private String description;

    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    @DecimalMax(value = "999999.99", message = "Preço muito alto")
    @Digits(integer = 6, fraction = 2, message = "Preço deve ter no máximo 6 dígitos inteiros e 2 decimais")
    private BigDecimal price;

    @Size(min = 3, max = 20, message = "Código deve ter entre 3 e 20 caracteres")
    @Pattern(regexp = "^[A-Z0-9\\-_]{3,20}$", message = "Código deve conter apenas letras maiúsculas, números, hífen e underscore")
    private String code;

    @Pattern(regexp = "^\\d{8,14}$", message = "Código de barras deve ter entre 8 e 14 dígitos")
    private String barcode;

    private Long categoryId;

    private Long supplierId;

    private Boolean isActive;
}