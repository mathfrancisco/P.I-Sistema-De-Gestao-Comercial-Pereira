package br.com.comercialpereira.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.util.List;

@Entity
@Table(name = "categories")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Category extends BaseEntity {

    @NotBlank
    @Size(min = 1, max = 100)
    @Column(nullable = false)
    private String name;

    @Size(max = 500)
    private String description;

    @Pattern(regexp = "^\\d{2}\\.\\d{2}-\\d-\\d{2}$", message = "CNAE deve seguir o padrão XX.XX-X-XX")
    @Column(length = 12)
    private String cnae;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    // Relacionamentos
    @OneToMany(mappedBy = "category", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Product> products;
}