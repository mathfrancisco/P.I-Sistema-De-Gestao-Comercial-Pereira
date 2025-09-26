package br.com.comercialpereira.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "inventory")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false, unique = true)
    private Product product;

    @NotNull
    @Min(value = 0, message = "Quantidade não pode ser negativa")
    @Column(nullable = false)
    private Integer quantity = 0;

    @NotNull
    @Min(value = 0, message = "Estoque mínimo não pode ser negativo")
    @Column(name = "min_stock", nullable = false)
    private Integer minStock = 10;

    @Min(value = 0, message = "Estoque máximo não pode ser negativo")
    @Column(name = "max_stock")
    private Integer maxStock;

    @Size(min = 2, max = 100)
    private String location;

    @Column(name = "last_update", nullable = false)
    private LocalDateTime lastUpdate;

    // Relacionamentos
    @OneToMany(mappedBy = "inventory", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<InventoryMovement> movements;

    @PrePersist
    @PreUpdate
    private void updateLastUpdate() {
        this.lastUpdate = LocalDateTime.now();
    }

    // Métodos utilitários
    public boolean isLowStock() {
        return quantity <= minStock;
    }

    public boolean isOutOfStock() {
        return quantity == 0;
    }

    public boolean isOverstock() {
        return maxStock != null && quantity > maxStock;
    }
}