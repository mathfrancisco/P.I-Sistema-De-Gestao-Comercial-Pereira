// lib/validations/suppliers.ts
import { z } from 'zod'

// Validação de CNPJ brasileiro
const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/
const cnpjOnlyNumbers = /^\d{14}$/

// Validação de telefone brasileiro
const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/

// Validação de CEP brasileiro
const cepRegex = /^\d{5}-\d{3}$/

// Schema para criação de fornecedor
export const createSupplierSchema = z.object({
    name: z.string()
        .min(3, "Nome deve ter pelo menos 3 caracteres")
        .max(255, "Nome deve ter no máximo 255 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ0-9\s&.-]+$/, "Nome contém caracteres inválidos"),

    contactPerson: z.string()
        .min(3, "Nome do contato deve ter pelo menos 3 caracteres")
        .max(100, "Nome do contato deve ter no máximo 100 caracteres")
        .regex(/^[a-zA-ZÀ-ÿ\s]+$/, "Nome do contato deve conter apenas letras e espaços")
        .optional()
        .nullable(),

    email: z.string()
        .email("Email inválido")
        .toLowerCase()
        .max(255, "Email deve ter no máximo 255 caracteres")
        .optional()
        .nullable(),

    phone: z.string()
        .regex(phoneRegex, "Telefone deve estar no formato (11) 99999-9999")
        .optional()
        .nullable(),

    address: z.string()
        .min(10, "Endereço deve ter pelo menos 10 caracteres")
        .max(500, "Endereço deve ter no máximo 500 caracteres")
        .optional()
        .nullable(),

    city: z.string()
        .min(2, "Cidade deve ter pelo menos 2 caracteres")
        .max(100, "Cidade deve ter no máximo 100 caracteres")
        .optional()
        .nullable(),

    state: z.string()
        .length(2, "Estado deve ter 2 caracteres (ex: SP)")
        .regex(/^[A-Z]{2}$/, "Estado deve ser em maiúsculas (ex: SP)")
        .optional()
        .nullable(),

    zipCode: z.string()
        .regex(cepRegex, "CEP deve estar no formato 00000-000")
        .optional()
        .nullable(),

    cnpj: z.string()
        .refine((cnpj) => {
            if (!cnpj) return true // CNPJ é opcional
            // Aceita tanto formato com máscara quanto só números
            return cnpjRegex.test(cnpj) || cnpjOnlyNumbers.test(cnpj)
        }, "CNPJ deve estar no formato 00.000.000/0000-00 ou conter 14 dígitos")
        .optional()
        .nullable(),

    website: z.string()
        .url("Website deve ser uma URL válida")
        .max(255, "Website deve ter no máximo 255 caracteres")
        .optional()
        .nullable(),

    notes: z.string()
        .max(1000, "Observações devem ter no máximo 1000 caracteres")
        .optional()
        .nullable(),

    isActive: z.boolean().default(true)
})

// Schema para atualização de fornecedor
export const updateSupplierSchema = createSupplierSchema.partial()

// Schema para filtros de busca
export const supplierFiltersSchema = z.object({
    search: z.string()
        .max(100, "Busca deve ter no máximo 100 caracteres")
        .optional(),

    isActive: z.coerce.boolean().optional(),

    state: z.string()
        .length(2, "Estado deve ter 2 caracteres")
        .regex(/^[A-Z]{2}$/, "Estado deve ser em maiúsculas")
        .optional(),

    hasEmail: z.coerce.boolean().optional(),

    hasPhone: z.coerce.boolean().optional(),

    hasCnpj: z.coerce.boolean().optional(),

    createdAfter: z.coerce.date().optional(),

    createdBefore: z.coerce.date().optional(),

    page: z.coerce.number()
        .min(1, "Página deve ser maior que 0")
        .default(1),

    limit: z.coerce.number()
        .min(1, "Limite deve ser maior que 0")
        .max(100, "Limite máximo é 100")
        .default(20),

    sortBy: z.enum(['name', 'contactPerson', 'city', 'state', 'createdAt', 'updatedAt'])
        .default('name'),

    sortOrder: z.enum(['asc', 'desc'])
        .default('asc')
})

// Schema para parâmetros de ID
export const supplierIdSchema = z.object({
    id: z.coerce.number()
        .min(1, "ID deve ser um número positivo")
})

// Schema para busca
export const supplierSearchSchema = z.object({
    q: z.string()
        .min(2, "Query deve ter pelo menos 2 caracteres")
        .max(100, "Query deve ter no máximo 100 caracteres"),

    limit: z.coerce.number()
        .min(1, "Limite deve ser maior que 0")
        .max(50, "Limite máximo é 50")
        .default(10),

    includeInactive: z.coerce.boolean().default(false)
})

// Tipos derivados dos schemas
export type CreateSupplierInput = z.infer<typeof createSupplierSchema>
export type UpdateSupplierInput = z.infer<typeof updateSupplierSchema>
export type SupplierFiltersInput = z.infer<typeof supplierFiltersSchema>
export type SupplierIdInput = z.infer<typeof supplierIdSchema>
export type SupplierSearchInput = z.infer<typeof supplierSearchSchema>

// Schema para resposta do fornecedor
export const supplierResponseSchema = z.object({
    id: z.number(),
    name: z.string(),
    contactPerson: z.string().nullable(),
    email: z.string().nullable(),
    phone: z.string().nullable(),
    address: z.string().nullable(),
    city: z.string().nullable(),
    state: z.string().nullable(),
    zipCode: z.string().nullable(),
    cnpj: z.string().nullable(),
    website: z.string().nullable(),
    notes: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date()
})

export type SupplierResponse = z.infer<typeof supplierResponseSchema>

// Schema para lista de fornecedores com paginação
export const suppliersListResponseSchema = z.object({
    data: z.array(supplierResponseSchema),
    pagination: z.object({
        page: z.number(),
        limit: z.number(),
        total: z.number(),
        pages: z.number(),
        hasNext: z.boolean(),
        hasPrev: z.boolean()
    }),
    filters: supplierFiltersSchema
})

export type SuppliersListResponse = z.infer<typeof suppliersListResponseSchema>

// Schema para fornecedor com produtos
export const supplierWithProductsSchema = supplierResponseSchema.extend({
    products: z.array(z.object({
        id: z.number(),
        name: z.string(),
        code: z.string(),
        price: z.number(),
        isActive: z.boolean()
    })),
    _count: z.object({
        products: z.number()
    })
})

export type SupplierWithProducts = z.infer<typeof supplierWithProductsSchema>

// Validações customizadas
export const validateCNPJ = (cnpj: string): boolean => {
    if (!cnpj) return true // CNPJ é opcional

    // Remove formatação
    const numbers = cnpj.replace(/[^\d]/g, '')

    if (numbers.length !== 14) return false

    // Verifica sequências inválidas
    if (/^(\d)\1{13}$/.test(numbers)) return false

    // Calcula dígitos verificadores
    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]

    const calculateDigit = (base: string, weights: number[]): number => {
        const sum = base
            .split('')
            .reduce((acc, digit, index) => acc + parseInt(digit) * weights[index], 0)
        const remainder = sum % 11
        return remainder < 2 ? 0 : 11 - remainder
    }

    const base = numbers.slice(0, 12)
    const digit1 = calculateDigit(base, weights1)
    const digit2 = calculateDigit(base + digit1, weights2)

    return numbers === base + digit1 + digit2
}

export const formatCNPJ = (cnpj: string): string => {
    if (!cnpj) return ''

    const numbers = cnpj.replace(/[^\d]/g, '')

    if (numbers.length === 14) {
        return numbers.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, '$1.$2.$3/$4-$5')
    }

    return cnpj
}

export const formatPhone = (phone: string): string => {
    if (!phone) return ''

    const numbers = phone.replace(/[^\d]/g, '')

    if (numbers.length === 10) {
        return numbers.replace(/^(\d{2})(\d{4})(\d{4})$/, '($1) $2-$3')
    } else if (numbers.length === 11) {
        return numbers.replace(/^(\d{2})(\d{5})(\d{4})$/, '($1) $2-$3')
    }

    return phone
}

export const formatCEP = (cep: string): string => {
    if (!cep) return ''

    const numbers = cep.replace(/[^\d]/g, '')

    if (numbers.length === 8) {
        return numbers.replace(/^(\d{5})(\d{3})$/, '$1-$2')
    }

    return cep
}

// Mensagens de erro padronizadas
export const SUPPLIER_ERROR_MESSAGES = {
    NOT_FOUND: "Fornecedor não encontrado",
    EMAIL_IN_USE: "Este email já está sendo usado por outro fornecedor",
    CNPJ_IN_USE: "Este CNPJ já está sendo usado por outro fornecedor",
    CNPJ_INVALID: "CNPJ inválido",
    HAS_PRODUCTS: "Não é possível excluir fornecedor que possui produtos cadastrados",
    OPERATION_NOT_ALLOWED: "Operação não permitida para este fornecedor"
} as const

// Constantes para validação
export const BRAZIL_STATES = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 20
export const MAX_PAGE_SIZE = 100
export const DEFAULT_SORT = 'name'
export const DEFAULT_ORDER = 'asc'