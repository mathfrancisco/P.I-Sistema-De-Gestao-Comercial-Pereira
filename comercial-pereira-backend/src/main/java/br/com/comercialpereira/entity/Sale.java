package br.com.comercialpereira.entity;

import br.com.comercialpereira.enums.SaleStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "sales")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sale extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @NotNull
    @DecimalMin(value = "0.01", message = "Total deve ser maior que zero")
    @Digits(integer = 8, fraction = 2)
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @DecimalMin(value = "0.00", message = "Desconto não pode ser negativo")
    @Digits(integer = 8, fraction = 2)
    @Column(precision = 10, scale = 2)
    private BigDecimal discount = BigDecimal.ZERO;

    @DecimalMin(value = "0.00", message = "Taxa não pode ser negativa")
    @Digits(integer = 8, fraction = 2)
    @Column(precision = 10, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SaleStatus status = SaleStatus.DRAFT;

    @Size(max = 1000)
    private String notes;

    @Column(name = "sale_date", nullable = false)
    private LocalDateTime saleDate;

    // Relacionamentos
    @OneToMany(mappedBy = "sale", cascade = CascadeType.ALL, fetch = FetchType.LAZY, orphanRemoval = true)
    private List<SaleItem> items;

    @PrePersist
    private void prePersist() {
        if (saleDate == null) {
            saleDate = LocalDateTime.now();
        }
    }

    // Métodos utilitários
    public BigDecimal calculateSubtotal() {
        if (items == null || items.isEmpty()) {
            return BigDecimal.ZERO;
        }

        return items.stream()
                .map(item -> {
                    // Se o total estiver null, calcular dinamicamente
                    if (item.getTotal() == null) {
                        if (item.getUnitPrice() != null && item.getQuantity() != null) {
                            BigDecimal subtotal = item.getUnitPrice().multiply(BigDecimal.valueOf(item.getQuantity()));
                            BigDecimal discount = item.getDiscount() != null ? item.getDiscount() : BigDecimal.ZERO;
                            return subtotal.subtract(discount);
                        }
                        return BigDecimal.ZERO;
                    }
                    return item.getTotal();
                })
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void recalculateTotal() {
        BigDecimal subtotal = calculateSubtotal();
        this.total = subtotal.subtract(discount).add(tax);
    }

    public boolean isEditable() {
        return status == SaleStatus.DRAFT || status == SaleStatus.PENDING;
    }

    public boolean isCancellable() {
        return status != SaleStatus.CANCELLED && status != SaleStatus.COMPLETED;
    }
}