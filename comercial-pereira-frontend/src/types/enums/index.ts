export enum UserRole {
    ADMIN = 'ADMIN',
    MANAGER = 'MANAGER',
    SALESPERSON = 'SALESPERSON',
}

export enum CustomerType {
    RETAIL = 'RETAIL',      // Era FISICA
    WHOLESALE = 'WHOLESALE'  // Era JURIDICA
}

export enum SaleStatus {
    PENDING = 'PENDING',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED',
    DRAFT = 'DRAFT',
}

export enum MovementType {
    ENTRADA = 'ENTRADA',
    SAIDA = 'SAIDA',
    AJUSTE = 'AJUSTE',
}

export enum PaymentMethod {
    DINHEIRO = 'DINHEIRO',
    CARTAO_CREDITO = 'CARTAO_CREDITO',
    CARTAO_DEBITO = 'CARTAO_DEBITO',
    PIX = 'PIX',
    BOLETO = 'BOLETO',
}