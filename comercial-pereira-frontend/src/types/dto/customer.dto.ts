import { CustomerType } from '../enums'

export interface CustomerResponse {
    id: number
    name: string
    email?: string
    phone?: string
    address?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    document?: string
    type: CustomerType
    isActive: boolean
    createdAt: string
    updatedAt: string
}

export interface CreateCustomerRequest {
    name: string
    email?: string
    phone?: string
    address?: string
    neighborhood?: string
    city?: string
    state?: string
    zipCode?: string
    document?: string
    type: CustomerType
    isActive?: boolean
}

export interface UpdateCustomerRequest extends Partial<CreateCustomerRequest> {}

export interface CustomerFilters {
    search?: string
    type?: CustomerType
    city?: string
    state?: string
    isActive?: boolean
}