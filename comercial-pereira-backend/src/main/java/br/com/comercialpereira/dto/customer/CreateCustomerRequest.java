package br.com.comercialpereira.dto.customer;

import br.com.comercialpereira.enums.CustomerType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomerRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 2, max = 255, message = "Nome deve ter entre 2 e 255 caracteres")
    private String name;

    @Email(message = "Email deve ter formato válido")
    @Size(max = 255, message = "Email deve ter no máximo 255 caracteres")
    private String email;

    @Pattern(regexp = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$", message = "Telefone deve seguir o padrão (XX) XXXXX-XXXX")
    private String phone;

    @Size(max = 255, message = "Endereço deve ter no máximo 255 caracteres")
    private String address;

    @Size(max = 100, message = "Bairro deve ter no máximo 100 caracteres")
    private String neighborhood;

    @Size(max = 100, message = "Cidade deve ter no máximo 100 caracteres")
    private String city;

    @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
    @Pattern(regexp = "^[A-Z]{2}$", message = "Estado deve conter apenas letras maiúsculas")
    private String state;

    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "CEP deve seguir o padrão XXXXX-XXX")
    private String zipCode;

    @Size(min = 11, max = 18, message = "Documento deve ter entre 11 e 18 caracteres")
    private String document;

    @NotNull(message = "Tipo de cliente é obrigatório")
    private CustomerType type;

    @Builder.Default
    private Boolean isActive = true;
}