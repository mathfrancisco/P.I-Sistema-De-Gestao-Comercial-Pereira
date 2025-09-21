// hooks/use-suppliers.ts
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useToast } from '@/hooks/use-toast'
import {
    SupplierResponse,
    SuppliersListResponse,
    SupplierFilters,
    CreateSupplierRequest,
    UpdateSupplierRequest,
    SupplierStats,
    SupplierPerformance,
    SupplierWithProducts,
    SupplierSearchParams
} from '@/types/supplier'

const SUPPLIERS_KEY = 'suppliers'
const SUPPLIER_STATS_KEY = 'supplier-stats'

interface ApiResponse<T> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

// Hook principal para gerenciar fornecedores
export function useSuppliers(filters: SupplierFilters = {}) {
    const queryClient = useQueryClient()
    const { toast } = useToast()
    const [isCreating, setIsCreating] = useState(false)
    const [isUpdating, setIsUpdating] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Buscar lista de fornecedores
    const {
        data: suppliersData,
        isLoading,
        error,
        refetch
    } = useQuery<SuppliersListResponse>({
        queryKey: [SUPPLIERS_KEY, filters],
        queryFn: async () => {
            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value))
                }
            })

            const response = await fetch(`/api/suppliers?${params}`)
            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Erro ao buscar fornecedores')
            }

            return data
        }
    })

    // Buscar fornecedor por ID
    const getSupplierById = async (id: number): Promise<SupplierResponse> => {
        const response = await fetch(`/api/suppliers/${id}`)
        const data = await response.json()

        if (!data.success) {
            throw new Error(data.error || 'Erro ao buscar fornecedor')
        }

        return data.data
    }

    // Criar fornecedor
    const createMutation = useMutation({
        mutationFn: async (supplier: CreateSupplierRequest) => {
            setIsCreating(true)
            const response = await fetch('/api/suppliers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(supplier)
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Erro ao criar fornecedor')
            }

            return data.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] })
            toast({
                title: 'Fornecedor criado',
                description: 'Fornecedor criado com sucesso!'
            })
            setIsCreating(false)
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao criar fornecedor',
                description: error.message,
                variant: 'destructive'
            })
            setIsCreating(false)
        }
    })

    // Atualizar fornecedor
    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: number; data: UpdateSupplierRequest }) => {
            setIsUpdating(true)
            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Erro ao atualizar fornecedor')
            }

            return result.data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] })
            toast({
                title: 'Fornecedor atualizado',
                description: 'Fornecedor atualizado com sucesso!'
            })
            setIsUpdating(false)
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao atualizar fornecedor',
                description: error.message,
                variant: 'destructive'
            })
            setIsUpdating(false)
        }
    })

    // Deletar fornecedor
    const deleteMutation = useMutation({
        mutationFn: async ({ id, reason }: { id: number; reason?: string }) => {
            setIsDeleting(true)
            const response = await fetch(`/api/suppliers/${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ reason })
            })

            const data = await response.json()

            if (!data.success) {
                throw new Error(data.error || 'Erro ao excluir fornecedor')
            }

            return data
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: [SUPPLIERS_KEY] })
            toast({
                title: 'Fornecedor excluído',
                description: 'Fornecedor excluído com sucesso!'
            })
            setIsDeleting(false)
        },
        onError: (error: Error) => {
            toast({
                title: 'Erro ao excluir fornecedor',
                description: error.message,
                variant: 'destructive'
            })
            setIsDeleting(false)
        }
    })

    return {
        suppliers: suppliersData?.data || [],
        pagination: suppliersData?.pagination,
        filters: suppliersData?.filters,
        isLoading,
        error,
        isCreating,
        isUpdating,
        isDeleting,
        refetch,
        getSupplierById,
        createSupplier: createMutation.mutate,
        updateSupplier: updateMutation.mutate,
        deleteSupplier: deleteMutation.mutate
    }
}

// Hook para buscar fornecedor com produtos
export function useSupplierWithProducts(id: number | null) {
    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery<SupplierWithProducts>({
        queryKey: [SUPPLIERS_KEY, id, 'products'],
        queryFn: async () => {
            if (!id) throw new Error('ID do fornecedor é obrigatório')

            const response = await fetch(`/api/suppliers/${id}/products`)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Erro ao buscar fornecedor com produtos')
            }

            return result.data
        },
        enabled: !!id
    })

    return {
        supplier: data,
        isLoading,
        error,
        refetch
    }
}

// Hook para estatísticas de fornecedores
export function useSupplierStats() {
    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery<SupplierStats>({
        queryKey: [SUPPLIER_STATS_KEY],
        queryFn: async () => {
            const response = await fetch('/api/suppliers/stats')
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Erro ao buscar estatísticas')
            }

            return result.data
        }
    })

    return {
        stats: data,
        isLoading,
        error,
        refetch
    }
}

// Hook para performance de fornecedor
export function useSupplierPerformance(id: number | null) {
    const {
        data,
        isLoading,
        error,
        refetch
    } = useQuery<SupplierPerformance>({
        queryKey: [SUPPLIERS_KEY, id, 'performance'],
        queryFn: async () => {
            if (!id) throw new Error('ID do fornecedor é obrigatório')

            const response = await fetch(`/api/suppliers/performance/${id}`)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Erro ao buscar performance do fornecedor')
            }

            return result.data
        },
        enabled: !!id
    })

    return {
        performance: data,
        isLoading,
        error,
        refetch
    }
}

// Hook para busca rápida de fornecedores
export function useSupplierSearch(searchParams: SupplierSearchParams | null) {
    const {
        data,
        isLoading,
        error
    } = useQuery<SupplierResponse[]>({
        queryKey: [SUPPLIERS_KEY, 'search', searchParams],
        queryFn: async () => {
            if (!searchParams?.q) return []

            const params = new URLSearchParams()
            params.append('q', searchParams.q)
            if (searchParams.limit) params.append('limit', String(searchParams.limit))
            if (searchParams.includeInactive) params.append('includeInactive', 'true')

            const response = await fetch(`/api/suppliers/search?${params}`)
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Erro ao buscar fornecedores')
            }

            return result.data
        },
        enabled: !!searchParams?.q
    })

    return {
        suppliers: data || [],
        isLoading,
        error
    }
}

// Hook para fornecedores ativos (para dropdowns)
export function useActiveSuppliers() {
    const {
        data,
        isLoading,
        error
    } = useQuery<SupplierResponse[]>({
        queryKey: [SUPPLIERS_KEY, 'active'],
        queryFn: async () => {
            const response = await fetch('/api/suppliers/active')
            const result = await response.json()

            if (!result.success) {
                throw new Error(result.error || 'Erro ao buscar fornecedores ativos')
            }

            return result.data
        }
    })

    return {
        suppliers: data || [],
        isLoading,
        error
    }
}

// Hook para exportar fornecedores
export function useExportSuppliers() {
    const { toast } = useToast()
    const [isExporting, setIsExporting] = useState(false)

    const exportSuppliers = async (filters: SupplierFilters = {}) => {
        try {
            setIsExporting(true)

            const params = new URLSearchParams()
            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== '') {
                    params.append(key, String(value))
                }
            })

            const response = await fetch(`/api/suppliers/export?${params}`)

            if (!response.ok) {
                throw new Error('Erro ao exportar fornecedores')
            }

            // Fazer download do arquivo
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `fornecedores_${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            window.URL.revokeObjectURL(url)
            document.body.removeChild(a)

            toast({
                title: 'Exportação concluída',
                description: 'Arquivo CSV gerado com sucesso!'
            })
        } catch (error) {
            toast({
                title: 'Erro ao exportar',
                description: 'Não foi possível exportar os fornecedores',
                variant: 'destructive'
            })
        } finally {
            setIsExporting(false)
        }
    }

    return {
        exportSuppliers,
        isExporting
    }
}