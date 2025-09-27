export interface CategoryResponse {
    id: number
    name: string
    description?: string
    cnae?: string
    isActive: boolean
    productCount?: number
    createdAt: string
    updatedAt: string
}

export interface CreateCategoryRequest {
    name: string
    description?: string
    cnae?: string
    isActive?: boolean
}

export interface UpdateCategoryRequest extends Partial<CreateCategoryRequest> {}

export interface CategoryFilters {
    search?: string
    isActive?: boolean
    hasCnae?: boolean
    includeProductCount?: boolean
    page?: number
    size?: number
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
}