// types/customer.ts
import { Customer } from '@prisma/client'

// Enums
export enum CustomerType {
  RETAIL = 'RETAIL',
  WHOLESALE = 'WHOLESALE'
}

// Tipos básicos baseados no Prisma
export type CustomerModel = Customer

export interface CustomerBase {
  id: number
  name: string
  email?: string | null
  phone?: string | null
  address?: string | null
  neighborhood?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  document?: string | null
  type: CustomerType
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipo para resposta da API
export interface CustomerResponse extends CustomerBase {}

// Tipo para criação de cliente
export interface CreateCustomerRequest {
  name: string
  email?: string | null
  phone?: string | null
  document?: string | null
  type: CustomerType
  // Endereço
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  neighborhood?: string | null
  isActive?: boolean
}

// Tipo para atualização de cliente
export interface UpdateCustomerRequest {
  name?: string
  email?: string | null
  phone?: string | null
  document?: string | null
  type?: CustomerType
  // Endereço
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  neighborhood?: string | null
  isActive?: boolean
}

// Filtros para busca
export interface CustomerFilters {
  search?: string
  type?: CustomerType
  city?: string
  state?: string
  isActive?: boolean
  hasEmail?: boolean
  hasDocument?: boolean
  hasPurchases?: boolean
  page?: number
  limit?: number
  sortBy?: 'name' | 'createdAt' | 'lastPurchase' | 'totalSpent'
  sortOrder?: 'asc' | 'desc'
}

// Response de lista paginada
export interface CustomersListResponse {
  data: CustomerResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: CustomerFilters
}

// Cliente com estatísticas de compras
export interface CustomerWithStats extends CustomerResponse {
  stats: {
    totalPurchases: number
    purchaseCount: number
    averageOrderValue: number
    lastPurchaseDate?: Date | null
    frequency: number // Compras por mês
    preferredCategories: string[]
    totalSavings: number
  }
}

// Métrica de cliente
export interface CustomerMetric {
  customerId: number
  customerName: string
  customerType: CustomerType
  totalPurchases: number
  purchaseCount: number
  averageOrderValue: number
  lastPurchaseDate?: Date | null
  frequency: number
}

// Validação de documento
export interface ValidateDocumentRequest {
  document: string
  type?: 'CPF' | 'CNPJ'
}

export interface ValidateDocumentResponse {
  isValid: boolean
  type: 'CPF' | 'CNPJ' | 'INVALID'
  formatted: string
}

// Endereço completo
export interface CustomerAddress {
  address?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  fullAddress: string
}

// Histórico de compras
export interface CustomerPurchaseHistory {
  customerId: number
  purchases: {
    saleId: number
    date: Date
    total: number
    status: string
    itemsCount: number
  }[]
  summary: {
    totalSpent: number
    totalOrders: number
    averageOrderValue: number
    firstPurchase: Date
    lastPurchase?: Date
    monthlyAverage: number
  }
}

// Estatísticas de clientes
export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  inactiveCustomers: number
  newCustomersThisMonth: number
  customersByType: Record<CustomerType, number>
  customersByState: Record<string, number>
  topCustomers: CustomerMetric[]
  vipCustomers: CustomerResponse[]
}

// Select option para dropdowns
export interface CustomerSelectOption {
  value: number
  label: string
  type: CustomerType
  document?: string
  isActive: boolean
}

// Segmentação de clientes
export enum CustomerSegment {
  VIP = 'VIP',           // Alto valor
  FREQUENT = 'FREQUENT', // Compra frequente
  REGULAR = 'REGULAR',   // Cliente regular
  NEW = 'NEW',          // Cliente novo
  INACTIVE = 'INACTIVE'  // Cliente inativo
}

export interface CustomerSegmentation {
  customerId: number
  segment: CustomerSegment
  score: number
  criteria: {
    recency: number      // Dias desde última compra
    frequency: number    // Frequência de compras
    monetary: number     // Valor gasto
  }
  recommendations: string[]
}

// Constantes para validação
export const CUSTOMER_CONSTRAINTS = {
  NAME_MIN_LENGTH: 2,
  NAME_MAX_LENGTH: 255,
  EMAIL_MAX_LENGTH: 255,
  ADDRESS_MAX_LENGTH: 255,
  CITY_MAX_LENGTH: 100,
  NEIGHBORHOOD_MAX_LENGTH: 100,
  STATE_LENGTH: 2,
  PHONE_REGEX: /^\(\d{2}\)\s\d{4,5}-\d{4}$/,
  CEP_REGEX: /^\d{5}-?\d{3}$/,
  CPF_LENGTH: 11,
  CNPJ_LENGTH: 14
} as const

// Estados brasileiros válidos
export const BRAZIL_STATES = [
  'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
  'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
  'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
] as const

export type BrazilState = typeof BRAZIL_STATES[number]

// Tipos para formulários
export interface CustomerFormData extends CreateCustomerRequest {}

export interface CustomerFormErrors {
  name?: string
  email?: string
  phone?: string
  document?: string
  type?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  neighborhood?: string
}

// Funções utilitárias para documentos
export function cleanDocument(document: string): string {
  return document.replace(/[^\d]/g, '')
}

export function formatCPF(cpf: string): string {
  const clean = cleanDocument(cpf)
  return clean.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

export function formatCNPJ(cnpj: string): string {
  const clean = cleanDocument(cnpj)
  return clean.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
}

export function formatDocument(document: string): string {
  const clean = cleanDocument(document)
  if (clean.length === 11) return formatCPF(document)
  if (clean.length === 14) return formatCNPJ(document)
  return document
}

export function getDocumentType(document: string): 'CPF' | 'CNPJ' | 'INVALID' {
  const clean = cleanDocument(document)
  if (clean.length === 11) return 'CPF'
  if (clean.length === 14) return 'CNPJ'
  return 'INVALID'
}

export function isValidCPF(cpf: string): boolean {
  const cleanCpf = cleanDocument(cpf)
  
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

export function isValidCNPJ(cnpj: string): boolean {
  const cleanCnpj = cleanDocument(cnpj)
  
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

export function isValidDocument(document: string): boolean {
  const clean = cleanDocument(document)
  if (clean.length === 11) return isValidCPF(document)
  if (clean.length === 14) return isValidCNPJ(document)
  return false
}

// Validação cruzada tipo vs documento
export function isValidTypeDocumentCombination(type: CustomerType, document?: string): boolean {
  if (!document) return true
  
  const clean = cleanDocument(document)
  if (type === CustomerType.RETAIL && clean.length !== 11) return false
  if (type === CustomerType.WHOLESALE && clean.length !== 14) return false
  
  return true
}

// Função para obter endereço completo
export function getFullAddress(customer: CustomerBase): string {
  const parts = [
    customer.address,
    customer.neighborhood,
    customer.city,
    customer.state,
    customer.zipCode
  ].filter(Boolean)
  
  return parts.join(', ')
}

// Função para determinar segmento do cliente
export function getCustomerSegment(stats: CustomerWithStats['stats']): CustomerSegment {
  const { totalPurchases, purchaseCount, lastPurchaseDate, frequency } = stats
  
  if (!lastPurchaseDate) return CustomerSegment.NEW
  
  const daysSinceLastPurchase = Math.floor(
    (new Date().getTime() - lastPurchaseDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceLastPurchase > 90) return CustomerSegment.INACTIVE
  if (totalPurchases > 10000 && frequency > 2) return CustomerSegment.VIP
  if (frequency > 1) return CustomerSegment.FREQUENT
  
  return CustomerSegment.REGULAR
}