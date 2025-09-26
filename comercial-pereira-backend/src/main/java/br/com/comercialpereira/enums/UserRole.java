package br.com.comercialpereira.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum UserRole {
    ADMIN("Administrador", "Acesso completo ao sistema"),
    MANAGER("Gerente", "Acesso a relatórios e gestão de produtos"),
    SALESPERSON("Vendedor", "Acesso a vendas e clientes");

    private final String displayName;
    private final String description;
}