export interface ProductResponse {
    id: number
    code: string
    name: string
    description?: string
    barcode?: string
    price: number  // ← Mudou de unitPrice para price
    isActive: boolean
    createdAt: string
    updatedAt: string

    // Objetos aninhados
    category: {
        id: number
        name: string
        description?: string
    }

    supplier: {
        id: number
        name: string
        contactPerson?: string
    }

    inventory: {
        quantity: number
        minStock: number
        maxStock: number
        location: string
        isLowStock: boolean
        isOutOfStock: boolean
    }
}

export interface CreateProductRequest {
    code: string
    name: string
    description?: string
    barcode?: string
    price: number  // ← Mudou
    categoryId: number
    supplierId: number
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