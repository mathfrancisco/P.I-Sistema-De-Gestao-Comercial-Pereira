export interface PageResponse<T> {
    content: T[]
    totalElements: number
    totalPages: number
    size: number
    number: number
    first: boolean
    last: boolean
    empty: boolean
}

export interface ApiError {
    message: string
    status: number
    timestamp: string
    path?: string
    errors?: Record<string, string>
}

export interface SelectOption {
    value: number | string
    label: string
}

export interface Statistics {
    total: number
    active: number
    inactive: number
    [key: string]: any
}