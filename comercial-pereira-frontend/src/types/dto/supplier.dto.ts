export interface SupplierResponse {
    id: number
    name: string
    cnpj?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    contactPerson?: string
    website?: string
    observations?: string
    isActive: boolean
    productCount?: number
    createdAt: string
    updatedAt: string
}

export interface CreateSupplierRequest {
    name: string
    cnpj?: string
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    zipCode?: string
    contactPerson?: string
    website?: string
    observations?: string
    isActive?: boolean
}

export interface UpdateSupplierRequest extends Partial<CreateSupplierRequest> {}

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