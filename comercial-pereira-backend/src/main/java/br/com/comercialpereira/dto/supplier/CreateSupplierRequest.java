package br.com.comercialpereira.dto.supplier;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateSupplierRequest {

    @NotBlank(message = "Nome é obrigatório")
    @Size(min = 3, max = 255, message = "Nome deve ter entre 3 e 255 caracteres")
    private String name;

    @Size(min = 3, max = 100, message = "Pessoa de contato deve ter entre 3 e 100 caracteres")
    private String contactPerson;

    @Email(message = "Email deve ter formato válido")
    @Size(max = 255, message = "Email deve ter no máximo 255 caracteres")
    private String email;

    @Pattern(regexp = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$", message = "Telefone deve seguir o padrão (XX) XXXXX-XXXX")
    private String phone;

    @Size(min = 10, max = 500, message = "Endereço deve ter entre 10 e 500 caracteres")
    private String address;

    @Size(min = 2, max = 100, message = "Cidade deve ter entre 2 e 100 caracteres")
    private String city;

    @Size(min = 2, max = 2, message = "Estado deve ter 2 caracteres")
    @Pattern(regexp = "^[A-Z]{2}$", message = "Estado deve conter apenas letras maiúsculas")
    private String state;

    @Pattern(regexp = "^\\d{5}-\\d{3}$", message = "CEP deve seguir o padrão XXXXX-XXX")
    private String zipCode;

    @Pattern(regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$", message = "CNPJ deve seguir o padrão XX.XXX.XXX/XXXX-XX")
    private String cnpj;

    @Size(max = 255, message = "Website deve ter no máximo 255 caracteres")
    private String website;

    @Size(max = 1000, message = "Observações devem ter no máximo 1000 caracteres")
    private String notes;

    @Builder.Default
    private Boolean isActive = true;
}