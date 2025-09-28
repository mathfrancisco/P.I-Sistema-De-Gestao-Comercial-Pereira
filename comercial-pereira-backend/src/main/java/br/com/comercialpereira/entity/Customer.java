package br.com.comercialpereira.entity;

import br.com.comercialpereira.enums.CustomerType;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "customers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer extends BaseEntity {

    @NotBlank
    @Size(min = 2, max = 255)
    @Column(nullable = false)
    private String name;

    @Email
    @Size(max = 255)
    private String email;

    @Pattern(regexp = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$", message = "Telefone deve seguir o padrão (XX) XXXXX-XXXX")
    private String phone;

    @Size(max = 255)
    private String address;

    @Size(max = 100)
    private String neighborhood;

    @Size(max = 100)
    private String city;

    @Size(min = 2, max = 2)
    @Pattern(regexp = "^[A-Z]{2}$", message = "Estado deve ter 2 letras maiúsculas")
    private String state;

    @Pattern(regexp = "^\\d{5}-?\\d{3}$", message = "CEP deve seguir o padrão XXXXX-XXX")
    @Column(name = "zip_code")
    private String zipCode;

    @Size(min = 11, max = 18)
    private String document; // CPF ou CNPJ

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CustomerType type = CustomerType.RETAIL;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Relacionamentos
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Sale> sales;
}