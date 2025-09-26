package br.com.comercialpereira.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "suppliers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Supplier extends BaseEntity {

    @NotBlank
    @Size(min = 3, max = 255)
    @Column(nullable = false)
    private String name;

    @Size(min = 3, max = 100)
    @Column(name = "contact_person")
    private String contactPerson;

    @Email
    @Size(max = 255)
    private String email;

    @Pattern(regexp = "^\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}$", message = "Telefone deve seguir o padrão (XX) XXXXX-XXXX")
    private String phone;

    @Size(min = 10, max = 500)
    private String address;

    @Size(min = 2, max = 100)
    private String city;

    @Size(min = 2, max = 2)
    @Pattern(regexp = "^[A-Z]{2}$", message = "Estado deve ter 2 letras maiúsculas")
    private String state;

    @Pattern(regexp = "^\\d{5}-\\d{3}$", message = "CEP deve seguir o padrão XXXXX-XXX")
    @Column(name = "zip_code")
    private String zipCode;

    @Pattern(regexp = "^\\d{2}\\.\\d{3}\\.\\d{3}/\\d{4}-\\d{2}$", message = "CNPJ deve seguir o padrão XX.XXX.XXX/XXXX-XX")
    private String cnpj;

    @Size(max = 255)
    private String website;

    @Size(max = 1000)
    private String notes;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Relacionamentos
    @OneToMany(mappedBy = "supplier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products;
}