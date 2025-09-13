// types/supplier.ts
import { Supplier } from '@prisma/client'

// Tipos básicos baseados no Prisma
export type SupplierModel = Supplier

export interface SupplierBase {
  id: number
  name: string
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  cnpj?: string | null
  website?: string | null
  notes?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipo para resposta da API
export interface SupplierResponse extends SupplierBase {}

// Tipo para criação de fornecedor
export interface CreateSupplierRequest {
  name: string
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  cnpj?: string | null
  website?: string | null
  notes?: string | null
  isActive?: boolean
}

// Tipo para atualização de fornecedor
export interface UpdateSupplierRequest {
  name?: string
  contactPerson?: string | null
  email?: string | null
  phone?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  cnpj?: string | null
  website?: string | null
  notes?: string | null
  isActive?: boolean
}

// Filtros para busca
export interface SupplierFilters {
  search?: string
  isActive?: boolean
  state?: string
  hasEmail?: boolean
  hasPhone?: boolean
  hasCnpj?: boolean
  createdAfter?: Date
  createdBefore?: Date
  page?: number
  limit?: number
  sortBy?: 'name' | 'contactPerson' | 'city' | 'state' | 'createdAt' | 'updatedAt'
  sortOrder?: 'asc' | 'desc'
}

// Response de lista paginada
export interface SuppliersListResponse {
  data: SupplierResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: SupplierFilters
}

// Fornecedor com produtos
export interface SupplierWithProducts extends SupplierResponse {
  products: {
    id: number
    name: string
    code: string
    price: number
    isActive: boolean
  }[]
  _count: {
    products: number
  }
}

// Filtros para busca rápida
export interface SupplierSearchParams {
  q: string
  limit?: number
  includeInactive?: boolean
}

// Estatísticas de fornecedor
export interface SupplierStats {
  totalSuppliers: number
  activeSuppliers: number
  inactiveSuppliers: number
  withProducts: number
  withoutProducts: number
  byState: Record<string, number>
}

// Performance de fornecedor
export interface SupplierPerformance {
  supplierId: number
  supplierName: string
  totalProducts: number
  totalSales: number
  totalRevenue: number
  totalQuantity: number
  averageSaleValue: number
  lastSaleDate?: Date
  isActive: boolean
}

// Select option para dropdowns
export interface SupplierSelectOption {
  value: number
  label: string
  isActive: boolean
}

// Informações de contato
export interface SupplierContact {
  contactPerson?: string
  email?: string
  phone?: string
  website?: string
}

// Endereço do fornecedor
export interface SupplierAddress {
  address?: string
  city?: string
  state?: string
  zipCode?: string
}

// Estados brasileiros válidos
export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

export type BrazilState = typeof BRAZIL_STATES[number]

// Mapeamento de nomes de estados
export const STATE_NAMES: Record<BrazilState, string> = {
  'AC': 'Acre',
  'AL': 'Alagoas',
  'AP': 'Amapá',
  'AM': 'Amazonas',
  'BA': 'Bahia',
  'CE': 'Ceará',
  'DF': 'Distrito Federal',
  'ES': 'Espírito Santo',
  'GO': 'Goiás',
  'MA': 'Maranhão',
  'MT': 'Mato Grosso',
  'MS': 'Mato Grosso do Sul',
  'MG': 'Minas Gerais',
  'PA': 'Pará',
  'PB': 'Paraíba',
  'PR': 'Paraná',
  'PE': 'Pernambuco',
  'PI': 'Piauí',
  'RJ': 'Rio de Janeiro',
  'RN': 'Rio Grande do Norte',
  'RS': 'Rio Grande do Sul',
  'RO': 'Rondônia',
  'RR': 'Roraima',
  'SC': 'Santa Catarina',
  'SP': 'São Paulo',
  'SE': 'Sergipe',
  'TO': 'Tocantins'
}

// Constantes para validação
export const SUPPLIER_CONSTRAINTS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 255,
  CONTACT_PERSON_MIN_LENGTH: 3,
  CONTACT_PERSON_MAX_LENGTH: 100,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MIN_LENGTH: 10,
  ADDRESS_MAX_LENGTH: 500,
  CITY_MIN_LENGTH: 2,
  CITY_MAX_LENGTH: 100,
  WEBSITE_MAX_LENGTH: 255,
  NOTES_MAX_LENGTH: 1000,
  STATE_LENGTH: 2,
  CNPJ_LENGTH: 14,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CEP_REGEX: /^\d{5}-\d{3}$/,
  CNPJ_REGEX: /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/,
  CNPJ_ONLY_NUMBERS_REGEX: /^\d{14}$/
} as const

// Funções utilitárias
export function isValidBrazilState(state: string): state is BrazilState {
  return BRAZIL_STATES.includes(state as BrazilState)
}

export function getStateName(state: BrazilState): string {
  return STATE_NAMES[state]
}

// Tipos para formulários
export interface SupplierFormData extends CreateSupplierRequest {}

export interface SupplierFormErrors {
  name?: string
  contactPerson?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  cnpj?: string
  website?: string
  notes?: string
}