package br.com.comercialpereira.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum CustomerType {
    RETAIL("Varejo", "Cliente pessoa física"),
    WHOLESALE("Atacado", "Cliente pessoa jurídica");

    private final String displayName;
    private final String description;
}