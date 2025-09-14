// lib/validations/customer.ts
import { z } from 'zod'
import {
  CustomerType,
  type CreateCustomerRequest,
  type UpdateCustomerRequest,
  type CustomerFilters,
  type ValidateDocumentRequest,
  CUSTOMER_CONSTRAINTS,
  BRAZIL_STATES,
  cleanDocument,
  isValidCPF,
  isValidCNPJ,
  formatCPF,
  formatCNPJ,
  isValidTypeDocumentCombination
} from '@/types/customer'

// Enum Zod baseado nos types
const CustomerTypeEnum = z.enum([CustomerType.RETAIL, CustomerType.WHOLESALE])
const BrazilStateEnum = z.enum(BRAZIL_STATES)

// Schema para criação de cliente usando o type
export const createCustomerSchema = z.object({
  name: z.string()
    .min(CUSTOMER_CONSTRAINTS.NAME_MIN_LENGTH, `Nome deve ter pelo menos ${CUSTOMER_CONSTRAINTS.NAME_MIN_LENGTH} caracteres`)
    .max(CUSTOMER_CONSTRAINTS.NAME_MAX_LENGTH, `Nome deve ter no máximo ${CUSTOMER_CONSTRAINTS.NAME_MAX_LENGTH} caracteres`)
    .trim(),
  
  email: z.string()
    .email("Email inválido")
    .max(CUSTOMER_CONSTRAINTS.EMAIL_MAX_LENGTH, `Email deve ter no máximo ${CUSTOMER_CONSTRAINTS.EMAIL_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
  
  phone: z.string()
    .regex(CUSTOMER_CONSTRAINTS.PHONE_REGEX, "Telefone deve estar no formato (11) 99999-9999")
    .optional()
    .nullable(),
  
  document: z.string()
    .optional()
    .nullable()
    .transform((doc) => doc ? cleanDocument(doc) : null)
    .refine((doc) => {
      if (!doc) return true
      return doc.length === CUSTOMER_CONSTRAINTS.CPF_LENGTH ? isValidCPF(doc) : 
             doc.length === CUSTOMER_CONSTRAINTS.CNPJ_LENGTH ? isValidCNPJ(doc) : false
    }, "CPF ou CNPJ inválido"),
  
  type: CustomerTypeEnum,
  
  // Endereço
  address: z.string()
    .max(CUSTOMER_CONSTRAINTS.ADDRESS_MAX_LENGTH, `Endereço deve ter no máximo ${CUSTOMER_CONSTRAINTS.ADDRESS_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  city: z.string()
    .max(CUSTOMER_CONSTRAINTS.CITY_MAX_LENGTH, `Cidade deve ter no máximo ${CUSTOMER_CONSTRAINTS.CITY_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  state: z.string()
    .length(CUSTOMER_CONSTRAINTS.STATE_LENGTH, `Estado deve ter ${CUSTOMER_CONSTRAINTS.STATE_LENGTH} caracteres`)
    .refine((state) => !state || BRAZIL_STATES.includes(state as any), "Estado inválido")
    .optional()
    .nullable(),
    
  zipCode: z.string()
    .regex(CUSTOMER_CONSTRAINTS.CEP_REGEX, "CEP deve estar no formato 12345-678")
    .optional()
    .nullable(),
    
  neighborhood: z.string()
    .max(CUSTOMER_CONSTRAINTS.NEIGHBORHOOD_MAX_LENGTH, `Bairro deve ter no máximo ${CUSTOMER_CONSTRAINTS.NEIGHBORHOOD_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
  
  isActive: z.boolean().default(true)
})
// Validação cruzada: tipo vs documento
.refine((data) => {
  return isValidTypeDocumentCombination(data.type, data.document || undefined)
}, {
  message: "Tipo de cliente incompatível com documento: Varejo requer CPF, Atacado requer CNPJ",
  path: ["type"]
}) satisfies z.ZodType<CreateCustomerRequest>

// Schema para atualização de cliente usando o type
export const updateCustomerSchema = z.object({
  name: z.string()
    .min(CUSTOMER_CONSTRAINTS.NAME_MIN_LENGTH, `Nome deve ter pelo menos ${CUSTOMER_CONSTRAINTS.NAME_MIN_LENGTH} caracteres`)
    .max(CUSTOMER_CONSTRAINTS.NAME_MAX_LENGTH, `Nome deve ter no máximo ${CUSTOMER_CONSTRAINTS.NAME_MAX_LENGTH} caracteres`)
    .trim()
    .optional(),
  
  email: z.string()
    .email("Email inválido")
    .max(CUSTOMER_CONSTRAINTS.EMAIL_MAX_LENGTH, `Email deve ter no máximo ${CUSTOMER_CONSTRAINTS.EMAIL_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
  
  phone: z.string()
    .regex(CUSTOMER_CONSTRAINTS.PHONE_REGEX, "Telefone deve estar no formato (11) 99999-9999")
    .optional()
    .nullable(),
  
  document: z.string()
    .optional()
    .nullable()
    .transform((doc) => doc ? cleanDocument(doc) : null)
    .refine((doc) => {
      if (!doc) return true
      return doc.length === CUSTOMER_CONSTRAINTS.CPF_LENGTH ? isValidCPF(doc) : 
             doc.length === CUSTOMER_CONSTRAINTS.CNPJ_LENGTH ? isValidCNPJ(doc) : false
    }, "CPF ou CNPJ inválido"),
  
  type: CustomerTypeEnum.optional(),
  
  // Endereço
  address: z.string()
    .max(CUSTOMER_CONSTRAINTS.ADDRESS_MAX_LENGTH, `Endereço deve ter no máximo ${CUSTOMER_CONSTRAINTS.ADDRESS_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  city: z.string()
    .max(CUSTOMER_CONSTRAINTS.CITY_MAX_LENGTH, `Cidade deve ter no máximo ${CUSTOMER_CONSTRAINTS.CITY_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
    
  state: z.string()
    .length(CUSTOMER_CONSTRAINTS.STATE_LENGTH, `Estado deve ter ${CUSTOMER_CONSTRAINTS.STATE_LENGTH} caracteres`)
    .refine((state) => !state || BRAZIL_STATES.includes(state as any), "Estado inválido")
    .optional()
    .nullable(),
    
  zipCode: z.string()
    .regex(CUSTOMER_CONSTRAINTS.CEP_REGEX, "CEP deve estar no formato 12345-678")
    .optional()
    .nullable(),
    
  neighborhood: z.string()
    .max(CUSTOMER_CONSTRAINTS.NEIGHBORHOOD_MAX_LENGTH, `Bairro deve ter no máximo ${CUSTOMER_CONSTRAINTS.NEIGHBORHOOD_MAX_LENGTH} caracteres`)
    .optional()
    .nullable(),
  
  isActive: z.boolean().optional()
})
// Validação cruzada: tipo vs documento
.refine((data) => {
  if (data.type && data.document !== undefined) {
    return isValidTypeDocumentCombination(data.type, data.document || undefined)
  }
  return true
}, {
  message: "Tipo de cliente incompatível com documento: Varejo requer CPF, Atacado requer CNPJ",
  path: ["type"]
}) satisfies z.ZodType<UpdateCustomerRequest>

// Schema para busca de clientes usando o type
export const customerFiltersSchema = z.object({
  search: z.string()
    .max(100, "Busca deve ter no máximo 100 caracteres")
    .optional(),
    
  type: CustomerTypeEnum.optional(),
  
  city: z.string()
    .max(CUSTOMER_CONSTRAINTS.CITY_MAX_LENGTH)
    .optional(),
    
  state: BrazilStateEnum.optional(),
  
  isActive: z.coerce.boolean().optional(),
  
  hasEmail: z.coerce.boolean().optional(),
  
  hasDocument: z.coerce.boolean().optional(),
  
  hasPurchases: z.coerce.boolean().optional(),
  
  page: z.coerce.number()
    .int()
    .min(1, "Página deve ser maior que 0")
    .default(1),
    
  limit: z.coerce.number()
    .int()
    .min(1, "Limite deve ser maior que 0")
    .max(100, "Limite máximo é 100")
    .default(10),
    
  sortBy: z.enum(['name', 'createdAt', 'lastPurchase', 'totalSpent'])
    .default('name'),
    
  sortOrder: z.enum(['asc', 'desc'])
    .default('asc')
}) satisfies z.ZodType<CustomerFilters>

// Schema para validação de documento usando o type
export const validateDocumentSchema = z.object({
  document: z.string()
    .min(1, "Documento é obrigatório"),
    
  type: z.enum(['CPF', 'CNPJ']).optional()
}) satisfies z.ZodType<ValidateDocumentRequest>

// Schema para parâmetros de ID
export const customerIdSchema = z.object({
  id: z.coerce.number()
    .int()
    .min(1, "ID deve ser um número positivo")
})

// Tipos derivados dos schemas
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type CustomerFiltersInput = z.infer<typeof customerFiltersSchema>
export type ValidateDocumentInput = z.infer<typeof validateDocumentSchema>
export type CustomerIdInput = z.infer<typeof customerIdSchema>

// SCHEMAS E TIPOS DE RESPOSTA
export const customerResponseSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string().nullable(),
  phone: z.string().nullable(),
  document: z.string().nullable(),
  type: CustomerTypeEnum,
  address: z.string().nullable(),
  city: z.string().nullable(),
  state: z.string().nullable(),
  zipCode: z.string().nullable(),
  neighborhood: z.string().nullable(),
  isActive: z.boolean(),
  createdAt: z.date(),
  updatedAt: z.date()
})

export const customersListResponseSchema = z.object({
  data: z.array(customerResponseSchema),
  pagination: z.object({
    page: z.number(),
    limit: z.number(),
    total: z.number(),
    pages: z.number(),
    hasNext: z.boolean(),
    hasPrev: z.boolean()
  }),
  filters: customerFiltersSchema
})

export const customerWithStatsSchema = customerResponseSchema.extend({
  stats: z.object({
    totalPurchases: z.number(),
    purchaseCount: z.number(),
    averageOrderValue: z.number(),
    lastPurchaseDate: z.date().nullable(),
    frequency: z.number(),
    preferredCategories: z.array(z.string()),
    totalSavings: z.number()
  })
})

export const customerStatsSchema = z.object({
  totalCustomers: z.number(),
  activeCustomers: z.number(),
  inactiveCustomers: z.number(),
  newCustomersThisMonth: z.number(),
  customersByType: z.record(CustomerTypeEnum, z.number()),
  customersByState: z.record(z.string(), z.number()),
  topCustomers: z.array(z.object({
    customerId: z.number(),
    customerName: z.string(),
    customerType: CustomerTypeEnum,
    totalPurchases: z.number(),
    purchaseCount: z.number(),
    averageOrderValue: z.number(),
    lastPurchaseDate: z.date().nullable(),
    frequency: z.number()
  })),
  vipCustomers: z.array(customerResponseSchema)
})

export const validateDocumentResponseSchema = z.object({
  isValid: z.boolean(),
  type: z.enum(['CPF', 'CNPJ', 'INVALID']),
  formatted: z.string()
})

// ===== TIPOS DE RESPOSTA EXPORTADOS =====
export type CustomerResponse = z.infer<typeof customerResponseSchema>
export type CustomersListResponse = z.infer<typeof customersListResponseSchema>
export type CustomerWithStats = z.infer<typeof customerWithStatsSchema>
export type CustomerStats = z.infer<typeof customerStatsSchema>
export type ValidateDocumentResponse = z.infer<typeof validateDocumentResponseSchema>

// Mensagens de erro padronizadas
export const CUSTOMER_ERROR_MESSAGES = {
  NOT_FOUND: "Cliente não encontrado",
  ALREADY_EXISTS: "Cliente já existe com este documento",
  DOCUMENT_IN_USE: "Documento já está sendo usado por outro cliente",
  EMAIL_IN_USE: "Email já está sendo usado por outro cliente",
  INVALID_CPF: "CPF inválido",
  INVALID_CNPJ: "CNPJ inválido",
  INVALID_DOCUMENT: "Documento inválido",
  INVALID_TYPE_DOCUMENT: "Tipo de cliente incompatível com documento",
  INVALID_EMAIL: "Email inválido",
  INVALID_PHONE: "Telefone inválido",
  INVALID_CEP: "CEP inválido",
  INVALID_STATE: "Estado inválido",
  REQUIRED_NAME: "Nome é obrigatório",
  REQUIRED_TYPE: "Tipo de cliente é obrigatório",
  OPERATION_NOT_ALLOWED: "Operação não permitida para este cliente",
  HAS_ACTIVE_SALES: "Cliente possui vendas ativas e não pode ser excluído"
} as const

// Constantes para validação (re-exportadas dos types)
export { 
  CustomerType,
  CUSTOMER_CONSTRAINTS,
  BRAZIL_STATES,
  cleanDocument,
  formatCPF,
  formatCNPJ,
  isValidCPF,
  isValidCNPJ,
  isValidTypeDocumentCombination
}

// Constantes para paginação
export const DEFAULT_PAGE_SIZE = 10
export const MAX_PAGE_SIZE = 100
export const DEFAULT_SORT = 'name'
export const DEFAULT_ORDER = 'asc'

// Helper para validar documento
export const validateDocument = (document: string, expectedType?: 'CPF' | 'CNPJ'): ValidateDocumentResponse => {
  const clean = cleanDocument(document)
  
  if (clean.length === CUSTOMER_CONSTRAINTS.CPF_LENGTH) {
    const isValid = isValidCPF(clean)
    return {
      isValid: isValid && (!expectedType || expectedType === 'CPF'),
      type: 'CPF',
      formatted: isValid ? formatCPF(clean) : document
    }
  }
  
  if (clean.length === CUSTOMER_CONSTRAINTS.CNPJ_LENGTH) {
    const isValid = isValidCNPJ(clean)
    return {
      isValid: isValid && (!expectedType || expectedType === 'CNPJ'),
      type: 'CNPJ',
      formatted: isValid ? formatCNPJ(clean) : document
    }
  }
  
  return {
    isValid: false,
    type: 'INVALID',
    formatted: document
  }
}

// Helper para validar combinação tipo-documento
export const validateTypeDocumentCombination = (type: CustomerType, document?: string): string[] => {
  const errors: string[] = []
  
  if (!document) return errors
  
  const validation = validateDocument(document)
  
  if (!validation.isValid) {
    errors.push(`${validation.type} inválido`)
    return errors
  }
  
  if (type === CustomerType.RETAIL && validation.type !== 'CPF') {
    errors.push("Cliente de varejo deve ter CPF")
  }
  
  if (type === CustomerType.WHOLESALE && validation.type !== 'CNPJ') {
    errors.push("Cliente de atacado deve ter CNPJ")
  }
  
  return errors
}

// Helper para validar dados do cliente
export const validateCustomerBusinessRules = (data: CreateCustomerRequest | UpdateCustomerRequest): string[] => {
  const errors: string[] = []
  
  // Validar combinação tipo-documento
  if (data.type && data.document !== undefined) {
    const typeDocErrors = validateTypeDocumentCombination(data.type, data.document || undefined)
    errors.push(...typeDocErrors)
  }
  
  // Validar se tem endereço completo ou nenhum
  const addressFields = [data.address, data.city, data.state]
  const hasAnyAddress = addressFields.some(field => field && field.trim())
  const hasCompleteAddress = data.address && data.city && data.state
  
  if (hasAnyAddress && !hasCompleteAddress) {
    errors.push("Para cadastrar endereço, informe pelo menos logradouro, cidade e estado")
  }
  
  return errors
}

// Helper para formatar dados do cliente para exibição
export const formatCustomerForDisplay = (customer: CustomerResponse) => {
  return {
    ...customer,
    formattedDocument: customer.document ? 
      (customer.document.length === 11 ? formatCPF(customer.document) : formatCNPJ(customer.document)) : 
      null,
    typeLabel: customer.type === CustomerType.RETAIL ? 'Varejo' : 'Atacado',
    fullAddress: [customer.address, customer.neighborhood, customer.city, customer.state, customer.zipCode]
      .filter(Boolean)
      .join(', ') || null
  }
}

// Helper para verificar se cliente pode ser excluído
export const canDeleteCustomer = async (customerId: number): Promise<boolean> => {
  // Esta verificação seria feita no service consultando vendas ativas
  // Por enquanto retorna true, mas o service implementará a lógica real
  return true
}

// Helper para calcular score do cliente
export const calculateCustomerScore = (stats: CustomerWithStats['stats']): number => {
  const { totalPurchases, purchaseCount, frequency, lastPurchaseDate } = stats
  
  let score = 0
  
  // Valor total (40%)
  score += Math.min((totalPurchases / 10000) * 40, 40)
  
  // Frequência (30%)
  score += Math.min(frequency * 10, 30)
  
  // Quantidade de compras (20%)
  score += Math.min(purchaseCount * 2, 20)
  
  // Recência (10%)
  if (lastPurchaseDate) {
    const daysSinceLastPurchase = Math.floor(
      (new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
    )
    score += Math.max(10 - (daysSinceLastPurchase / 30), 0)
  }
  
  return Math.min(Math.round(score), 100)
}