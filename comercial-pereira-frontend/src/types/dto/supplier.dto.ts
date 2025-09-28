
/**
 * Representa a resposta completa de um Fornecedor vinda da API.
 * Corresponde ao `SupplierResponse` do backend.
 */
export interface SupplierResponse {
  id: number
  name: string
  contactPerson: string | null
  email: string | null
  phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  cnpj: string | null
  website: string | null
  notes: string | null
  isActive: boolean
  createdAt: string // Datas são recebidas como string no formato ISO
  updatedAt: string
  productCount: number | null
}

/**
 * Dados necessários para criar um novo Fornecedor.
 * Corresponde ao `CreateSupplierRequest` do backend.
 */
export interface CreateSupplierRequest {
  name: string
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
  isActive?: boolean
}

/**
 * Dados que podem ser enviados para atualizar um Fornecedor.
 * Todos os campos são opcionais. Corresponde ao `UpdateSupplierRequest`.
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

/**
 * Filtros disponíveis para a busca paginada de Fornecedores.
 * Corresponde ao `SupplierFilters` do backend.
 */
export interface SupplierFilters {
  search?: string
  isActive?: boolean
  state?: string
  hasEmail?: boolean
  hasCnpj?: boolean
  page?: number
  size?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * Representa a resposta da API de estatísticas de fornecedores.
 * Corresponde à resposta de `GET /api/suppliers/statistics`.
 */
export interface SupplierStatisticsResponse {
  total: number
  active: number
  inactive: number
  withProducts: number
  withoutProducts: number
  byState: Record<string, number> // Ex: { "SP": 10, "RJ": 5 }
}