package br.com.comercialpereira.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.List;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product extends BaseEntity {

    @NotBlank
    @Size(min = 3, max = 255)
    @Pattern(regexp = "^[a-zA-ZÀ-ÿ0-9\\s&.(),\\-]+$", message = "Nome do produto contém caracteres inválidos")
    @Column(nullable = false)
    private String name;

    @Size(min = 10, max = 1000)
    private String description;

    @NotNull
    @DecimalMin(value = "0.01", message = "Preço deve ser maior que zero")
    @DecimalMax(value = "999999.99", message = "Preço muito alto")
    @Digits(integer = 6, fraction = 2)
    @Column(nullable = false, precision = 8, scale = 2)
    private BigDecimal price;

    @NotBlank
    @Size(min = 3, max = 20)
    @Pattern(regexp = "^[A-Z0-9\\-_]{3,20}$", message = "Código deve conter apenas letras maiúsculas, números, hífen e underscore")
    @Column(nullable = false, unique = true, length = 20)
    private String code;

    @Pattern(regexp = "^\\d{8,14}$", message = "Código de barras deve ter entre 8 e 14 dígitos")
    private String barcode;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Relacionamentos
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "supplier_id")
    private Supplier supplier;

    @OneToOne(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Inventory inventory;

    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<SaleItem> saleItems;
}