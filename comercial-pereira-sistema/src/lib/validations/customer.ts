import { z } from "zod"

// Função para validar CPF
function isValidCPF(cpf: string): boolean {
  const cleanCpf = cpf.replace(/[^\d]/g, '')
  
  if (cleanCpf.length !== 11 || /^(\d)\1{10}$/.test(cleanCpf)) {
    return false
  }
  
  // Validar primeiro dígito
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (10 - i)
  }
  let remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  if (remainder !== parseInt(cleanCpf.charAt(9))) return false
  
  // Validar segundo dígito
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCpf.charAt(i)) * (11 - i)
  }
  remainder = (sum * 10) % 11
  if (remainder === 10 || remainder === 11) remainder = 0
  return remainder === parseInt(cleanCpf.charAt(10))
}

// Função para validar CNPJ
function isValidCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/[^\d]/g, '')
  
  if (cleanCnpj.length !== 14) {
    return false
  }
  
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  
  const validateDigit = (digits: string, weights: number[]) => {
    const sum = digits.split('').reduce((acc, digit, i) => 
      acc + parseInt(digit) * weights[i], 0
    )
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }
  
  const firstDigit = validateDigit(cleanCnpj.substring(0, 12), weights1)
  const secondDigit = validateDigit(cleanCnpj.substring(0, 13), weights2)
  
  return parseInt(cleanCnpj.charAt(12)) === firstDigit && 
         parseInt(cleanCnpj.charAt(13)) === secondDigit
}

// Função para limpar documento
function cleanDocument(document: string): string {
  return document.replace(/[^\d]/g, '')
}

// Função para formatar CPF
function formatCPF(cpf: string): string {
  const clean = cleanDocument(cpf)
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

// Função para formatar CNPJ
function formatCNPJ(cnpj: string): string {
  const clean = cleanDocument(cnpj)
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

// Schema para criar cliente
export const createCustomerSchema = z.object({
  name: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(255, "Nome deve ter no máximo 255 caracteres")
    .trim(),
  
  email: z.string()
    .email("Email inválido")
    .max(255)
    .optional()
    .nullable(),
  
  phone: z.string()
    .regex(/^\(\d{2}\)\s\d{4,5}-\d{4}$/, "Telefone deve estar no formato (11) 99999-9999")
    .optional()
    .nullable(),
  
  document: z.string()
    .optional()
    .nullable()
    .transform((doc) => doc ? cleanDocument(doc) : null)
    .refine((doc) => {
      if (!doc) return true
      return doc.length === 11 ? isValidCPF(doc) : 
             doc.length === 14 ? isValidCNPJ(doc) : false
    }, "CPF ou CNPJ inválido"),
  
  type: z.enum(['RETAIL', 'WHOLESALE'], {
    required_error: "Tipo de cliente é obrigatório"
  }),
  
  // Endereço
  address: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  state: z.string().length(2, "Estado deve ter 2 caracteres").optional().nullable(),
  zipCode: z.string()
    .regex(/^\d{5}-?\d{3}$/, "CEP deve estar no formato 12345-678")
    .optional()
    .nullable(),
  neighborhood: z.string().max(100).optional().nullable(),
  
  isActive: z.boolean().default(true)
})
// Validação cruzada: tipo vs documento
.refine((data) => {
  if (!data.document) return true
  
  if (data.type === 'RETAIL' && data.document.length !== 11) {
    return false // Varejo deve ter CPF (11 dígitos)
  }
  if (data.type === 'WHOLESALE' && data.document.length !== 14) {
    return false // Atacado deve ter CNPJ (14 dígitos)
  }
  return true
}, {
  message: "Tipo de cliente incompatível com documento: Varejo requer CPF, Atacado requer CNPJ",
  path: ["type"]
})

// Schema para atualizar cliente
export const updateCustomerSchema = createCustomerSchema.partial().extend({
  id: z.number().int().positive()
})

// Schema para busca de clientes
export const customerSearchSchema = z.object({
  search: z.string().optional(),
  type: z.enum(['RETAIL', 'WHOLESALE']).optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  isActive: z.coerce.boolean().optional(),
  hasEmail: z.coerce.boolean().optional(),
  hasDocument: z.coerce.boolean().optional(),
  hasPurchases: z.coerce.boolean().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(['name', 'createdAt', 'lastPurchase', 'totalSpent']).default('name'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Schema para validação de documento
export const validateDocumentSchema = z.object({
  document: z.string().min(1, "Documento é obrigatório"),
  type: z.enum(['CPF', 'CNPJ']).optional()
})

export type CreateCustomerData = z.infer<typeof createCustomerSchema>
export type UpdateCustomerData = z.infer<typeof updateCustomerSchema>
export type CustomerSearchParams = z.infer<typeof customerSearchSchema>
export type ValidateDocumentData = z.infer<typeof validateDocumentSchema>

// Exportar funções auxiliares
export { isValidCPF, isValidCNPJ, cleanDocument, formatCPF, formatCNPJ }
