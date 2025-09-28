package br.com.comercialpereira.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum MovementType {
    IN("Entrada", "Entrada de produtos no estoque"),
    OUT("Saída", "Saída de produtos do estoque"),
    ADJUSTMENT("Ajuste", "Ajuste de estoque");

    private final String displayName;
    private final String description;
}