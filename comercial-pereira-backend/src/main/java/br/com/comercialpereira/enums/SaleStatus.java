package br.com.comercialpereira.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum SaleStatus {
    DRAFT("Rascunho", "Venda em elaboração"),
    PENDING("Pendente", "Aguardando confirmação"),
    CONFIRMED("Confirmada", "Venda confirmada"),
    COMPLETED("Concluída", "Venda finalizada"),
    CANCELLED("Cancelada", "Venda cancelada"),
    REFUNDED("Reembolsada", "Venda reembolsada");

    private final String displayName;
    private final String description;
}