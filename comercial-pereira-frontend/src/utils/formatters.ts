// src/utils/formatters.ts

/**
 * Formata telefone para o padrão (XX) XXXXX-XXXX ou (XX) XXXX-XXXX
 */
export const formatPhone = (phone: string): string => {
    if (!phone) return '';

    // Remove tudo que não é número
    const numbers = phone.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    // (XX) XXXXX-XXXX para celular
    if (numbers.length === 11) {
        return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    }

    // (XX) XXXX-XXXX para telefone fixo
    if (numbers.length === 10) {
        return numbers.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    // Retorna como está se não tiver formato válido
    return phone;
};

/**
 * Formata CEP para o padrão XXXXX-XXX
 */
export const formatZipCode = (zipCode: string): string => {
    if (!zipCode) return '';

    const numbers = zipCode.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    if (numbers.length === 8) {
        return numbers.replace(/(\d{5})(\d{3})/, '$1-$2');
    }

    return zipCode;
};

/**
 * Formata CPF para o padrão XXX.XXX.XXX-XX
 */
export const formatCPF = (cpf: string): string => {
    if (!cpf) return '';

    const numbers = cpf.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    if (numbers.length === 11) {
        return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
    }

    return cpf;
};

/**
 * Formata CNPJ para o padrão XX.XXX.XXX/XXXX-XX
 */
export const formatCNPJ = (cnpj: string): string => {
    if (!cnpj) return '';

    const numbers = cnpj.replace(/\D/g, '');

    if (numbers.length === 0) return '';

    if (numbers.length === 14) {
        return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
    }

    return cnpj;
};

/**
 * Remove formatação mantendo apenas números
 */
export const removeFormatting = (value: string): string => {
    if (!value) return '';
    return value.replace(/\D/g, '');
};

/**
 * Limpa string vazia ou null/undefined para null
 */
export const cleanEmptyString = (value: string | null | undefined): string | null => {
    if (!value || value.trim() === '') return null;
    return value.trim();
};