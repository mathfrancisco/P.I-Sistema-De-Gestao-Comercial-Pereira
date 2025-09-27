export interface ProductResponse {
    id: number
    code: string
    name: string
    description?: string
    barcode?: string
    unitPrice: number
    costPrice?: number
    categoryId: number
    categoryName: string
    supplierId: number
    supplierName: string
    unit: string
    isActive: boolean
    currentStock?: number
    minStock?: number
    maxStock?: number
    createdAt: string
    updatedAt: string
}

export interface CreateProductRequest {
    code: string
    name: string
    description?: string
    barcode?: string
    unitPrice: number
    costPrice?: number
    categoryId: number
    supplierId: number
    unit: string
    isActive?: boolean
}

export interface UpdateProductRequest extends Partial<CreateProductRequest> {}

export interface ProductFilters {
    search?: string
    categoryId?: number
    supplierId?: number
    isActive?: boolean
    hasStock?: boolean
    lowStock?: boolean
    noStock?: boolean
    minPrice?: number
    maxPrice?: number
    hasBarcode?: boolean
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}