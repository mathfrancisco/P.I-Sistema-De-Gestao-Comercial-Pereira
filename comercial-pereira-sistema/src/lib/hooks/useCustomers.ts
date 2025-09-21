// lib/hooks/useCustomers.ts
import { useState, useEffect, useCallback } from 'react'
import {
    CustomerResponse,
    CustomerFilters,
    CreateCustomerRequest,
    UpdateCustomerRequest,
    CustomerWithStats,
    CustomerSelectOption,
    CustomerType
} from '@/types/customer'

interface UseCustomersOptions {
    type?: 'RETAIL' | 'WHOLESALE'
    isActive?: boolean
    city?: string
    state?: string
    autoFetch?: boolean
}

interface UseCustomersReturn {
    customers: CustomerResponse[]
    pagination: {
        page: number
        limit: number
        total: number
        totalPages: number
        hasNextPage: boolean
        hasPrevPage: boolean
    }
    filters: CustomerFilters
    loading: boolean
    error: string | null
    updateFilters: (newFilters: Partial<CustomerFilters>) => void
    changePage: (page: number) => void
    changeSort: (column: string, direction: 'asc' | 'desc') => void
    refresh: () => void
}

export const useCustomers = (options: UseCustomersOptions = {}): UseCustomersReturn => {
    const [customers, setCustomers] = useState<CustomerResponse[]>([])
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    })
    const [filters, setFilters] = useState<CustomerFilters>({
        page: 1,
        limit: 20,
        sortBy: 'name',
        sortOrder: 'asc',
        isActive: options.isActive ?? true,
        type: options.type as CustomerType | undefined,
        city: options.city,
        state: options.state
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCustomers = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams()

            // Add all filters to params
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    params.set(key, String(value))
                }
            })

            const response = await fetch(`/api/customers?${params}`)

            if (!response.ok) {
                throw new Error('Erro ao buscar clientes')
            }

            const data = await response.json()

            setCustomers(data.customers || [])
            setPagination(data.pagination || {
                page: 1,
                limit: 20,
                total: 0,
                totalPages: 0,
                hasNextPage: false,
                hasPrevPage: false
            })
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }, [filters])

    useEffect(() => {
        if (options.autoFetch !== false) {
            fetchCustomers()
        }
    }, [fetchCustomers, options.autoFetch])

    const updateFilters = useCallback((newFilters: Partial<CustomerFilters>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page || 1 // Reset to page 1 when filters change
        }))
    }, [])

    const changePage = useCallback((page: number) => {
        setFilters(prev => ({ ...prev, page }))
    }, [])

    const changeSort = useCallback((column: string, direction: 'asc' | 'desc') => {
        setFilters(prev => ({
            ...prev,
            sortBy: column as any,
            sortOrder: direction,
            page: 1
        }))
    }, [])

    const refresh = useCallback(() => {
        fetchCustomers()
    }, [fetchCustomers])

    return {
        customers,
        pagination,
        filters,
        loading,
        error,
        updateFilters,
        changePage,
        changeSort,
        refresh
    }
}

// Hook para criar cliente
export const useCreateCustomer = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const createCustomer = async (data: CreateCustomerRequest): Promise<CustomerResponse> => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Erro ao criar cliente')
            }

            return await response.json()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { createCustomer, loading, error }
}

// Hook para atualizar cliente
export const useUpdateCustomer = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const updateCustomer = async (id: number, data: UpdateCustomerRequest): Promise<CustomerResponse> => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Erro ao atualizar cliente')
            }

            return await response.json()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { updateCustomer, loading, error }
}

// Hook para deletar cliente
export const useDeleteCustomer = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const deleteCustomer = async (id: number): Promise<{ message: string }> => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/customers/${id}`, {
                method: 'DELETE'
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Erro ao deletar cliente')
            }

            return await response.json()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { deleteCustomer, loading, error }
}

// Hook para buscar cliente com estatísticas
export const useCustomerWithStats = (customerId: number | null) => {
    const [customer, setCustomer] = useState<CustomerWithStats | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchCustomer = useCallback(async () => {
        if (!customerId) return

        try {
            setLoading(true)
            setError(null)

            const response = await fetch(`/api/customers/${customerId}`)

            if (!response.ok) {
                throw new Error('Erro ao buscar cliente')
            }

            const data = await response.json()
            setCustomer(data)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }, [customerId])

    useEffect(() => {
        fetchCustomer()
    }, [fetchCustomer])

    return { customer, loading, error, refresh: fetchCustomer }
}

// Hook para validar documento
export const useValidateDocument = () => {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const validateDocument = async (document: string, type?: 'CPF' | 'CNPJ') => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/customers/validate-document', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ document, type })
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.error || 'Erro ao validar documento')
            }

            return await response.json()
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
            setError(errorMessage)
            throw err
        } finally {
            setLoading(false)
        }
    }

    return { validateDocument, loading, error }
}

// Define the proper interface for customer sales filters
interface CustomerSalesFilters {
    status?: 'DRAFT' | 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
    dateFrom?: Date;
    dateTo?: Date;
    minTotal?: number;
    maxTotal?: number;
    page: number;
    limit: number;
    sortBy: 'saleDate' | 'total' | 'status';
    sortOrder: 'asc' | 'desc';
    includeItems: boolean;
}

// Hook para buscar vendas de um cliente
export const useCustomerSales = (customerId: number | null) => {
    const [sales, setSales] = useState<any[]>([])
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false
    })
    const [summary, setSummary] = useState({
        totalSales: 0,
        totalSpent: 0,
        averageOrderValue: 0,
        minOrderValue: 0,
        maxOrderValue: 0
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [filters, setFilters] = useState<CustomerSalesFilters>({
        page: 1,
        limit: 10,
        sortBy: 'saleDate',
        sortOrder: 'desc',
        includeItems: false,
        // Initialize optional filter properties
        status: undefined,
        dateFrom: undefined,
        dateTo: undefined,
        minTotal: undefined,
        maxTotal: undefined
    })

    const fetchSales = useCallback(async () => {
        if (!customerId) return

        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    if (value instanceof Date) {
                        params.set(key, value.toISOString())
                    } else {
                        params.set(key, String(value))
                    }
                }
            })

            const response = await fetch(`/api/customers/${customerId}/sales?${params}`)

            if (!response.ok) {
                throw new Error('Erro ao buscar vendas do cliente')
            }

            const data = await response.json()

            setSales(data.sales || [])
            setPagination(data.pagination || pagination)
            setSummary(data.summary || summary)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }, [customerId, filters])

    useEffect(() => {
        fetchSales()
    }, [fetchSales])

    const updateFilters = useCallback((newFilters: Partial<CustomerSalesFilters>) => {
        setFilters(prev => ({
            ...prev,
            ...newFilters,
            page: newFilters.page || 1
        }))
    }, [])

    return {
        sales,
        pagination,
        summary,
        loading,
        error,
        filters,
        updateFilters,
        refresh: fetchSales
    }
}

// Hook para clientes em formato de seleção
export const useCustomersForSelect = (type?: 'RETAIL' | 'WHOLESALE') => {
    const [options, setOptions] = useState<CustomerSelectOption[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchOptions = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const params = new URLSearchParams({
                limit: '100',
                isActive: 'true',
                sortBy: 'name',
                sortOrder: 'asc'
            })

            if (type) {
                params.set('type', type)
            }

            const response = await fetch(`/api/customers?${params}`)

            if (!response.ok) {
                throw new Error('Erro ao buscar clientes')
            }

            const data = await response.json()

            const customerOptions: CustomerSelectOption[] = data.customers.map((customer: CustomerResponse) => ({
                value: customer.id,
                label: customer.name,
                type: customer.type,
                document: customer.document,
                isActive: customer.isActive
            }))

            setOptions(customerOptions)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Erro desconhecido')
        } finally {
            setLoading(false)
        }
    }, [type])

    useEffect(() => {
        fetchOptions()
    }, [fetchOptions])

    return { options, loading, error, refresh: fetchOptions }
}