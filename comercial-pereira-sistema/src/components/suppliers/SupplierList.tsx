// components/suppliers/supplier-list.tsx
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
    Search,
    Plus,
    Edit,
    Trash2,
    Eye,
    Package,
    Download,
    Filter,
    Building2,
    Phone,
    Mail,
    MapPin
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from '@/components/ui/select'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { SupplierFilters, SupplierResponse } from '@/types/supplier'
import { BRAZIL_STATES, STATE_NAMES } from '@/types/supplier'
import {useExportSuppliers, useSuppliers} from "@/lib/hooks/useSuppliers";
import {formatCNPJ, formatPhone} from "@/lib/validations/suppliers";


interface SupplierListProps {
    view?: 'grid' | 'list'
}

export function SupplierList({ view = 'grid' }: SupplierListProps) {
    const router = useRouter()
    const [filters, setFilters] = useState<SupplierFilters>({
        page: 1,
        limit: 12,
        sortBy: 'name',
        sortOrder: 'asc'
    })
    const [selectedSupplier, setSelectedSupplier] = useState<SupplierResponse | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>(view)

    const {
        suppliers,
        pagination,
        isLoading,
        error,
        isDeleting,
        deleteSupplier
    } = useSuppliers(filters)

    const { exportSuppliers, isExporting } = useExportSuppliers()

    const handleSearch = (value: string) => {
        setFilters(prev => ({ ...prev, search: value, page: 1 }))
    }

    const handleFilterChange = (key: keyof SupplierFilters, value: any) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }))
    }

    const handlePageChange = (page: number) => {
        setFilters(prev => ({ ...prev, page }))
    }

    const handleDelete = async () => {
        if (selectedSupplier) {
            deleteSupplier({ id: selectedSupplier.id })
            setShowDeleteDialog(false)
            setSelectedSupplier(null)
        }
    }

    const handleExport = () => {
        exportSuppliers(filters)
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <p className="text-red-500">Erro ao carregar fornecedores</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header com ações */}
            <div className="flex flex-col lg:flex-row gap-4 justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                    {/* Busca */}
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Buscar fornecedores..."
                            value={filters.search || ''}
                            onChange={(e) => handleSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Filtros */}
                    <Select
                        value={filters.state || 'all'}
                        onValueChange={(value) => handleFilterChange('state', value === 'all' ? undefined : value)}
                    >
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Estado" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos os estados</SelectItem>
                            {BRAZIL_STATES.map(state => (
                                <SelectItem key={state} value={state}>
                                    {STATE_NAMES[state]}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select
                        value={filters.isActive !== undefined ? String(filters.isActive) : 'all'}
                        onValueChange={(value) => handleFilterChange('isActive', value === 'all' ? undefined : value === 'true')}
                    >
                        <SelectTrigger className="w-[150px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="true">Ativos</SelectItem>
                            <SelectItem value="false">Inativos</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Ações */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                    >
                        {viewMode === 'grid' ? '☰' : '⊞'}
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        disabled={isExporting}
                    >
                        <Download className="mr-2 h-4 w-4" />
                        Exportar
                    </Button>
                    <Button onClick={() => router.push('/suppliers/new')}>
                        <Plus className="mr-2 h-4 w-4" />
                        Novo Fornecedor
                    </Button>
                </div>
            </div>

            {/* Lista de fornecedores */}
            {isLoading ? (
                <div className={viewMode === 'grid'
                    ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    : "space-y-4"
                }>
                    {[...Array(8)].map((_, i) => (
                        <Card key={i}>
                            <CardHeader>
                                <Skeleton className="h-6 w-3/4" />
                            </CardHeader>
                            <CardContent>
                                <Skeleton className="h-4 w-full mb-2" />
                                <Skeleton className="h-4 w-2/3" />
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {suppliers.map((supplier) => (
                        <Card
                            key={supplier.id}
                            className="hover:shadow-lg transition-shadow cursor-pointer"
                            onClick={() => router.push(`/suppliers/${supplier.id}`)}
                        >
                            <CardHeader className="pb-3">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-5 w-5 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <CardTitle className="text-base truncate">
                                                {supplier.name}
                                            </CardTitle>
                                            {supplier.cnpj && (
                                                <p className="text-xs text-muted-foreground">
                                                    {formatCNPJ(supplier.cnpj)}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                                        {supplier.isActive ? 'Ativo' : 'Inativo'}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                {supplier.contactPerson && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <span className="text-muted-foreground">Contato:</span>
                                        <span className="font-medium truncate">{supplier.contactPerson}</span>
                                    </div>
                                )}

                                {supplier.phone && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Phone className="h-3 w-3 text-muted-foreground" />
                                        <span className="truncate">{formatPhone(supplier.phone)}</span>
                                    </div>
                                )}

                                {supplier.email && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Mail className="h-3 w-3 text-muted-foreground" />
                                        <span className="truncate">{supplier.email}</span>
                                    </div>
                                )}

                                {supplier.city && supplier.state && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <MapPin className="h-3 w-3 text-muted-foreground" />
                                        <span className="truncate">{supplier.city}/{supplier.state}</span>
                                    </div>
                                )}

                                <div className="flex gap-2 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => router.push(`/suppliers/${supplier.id}/products`)}
                                    >
                                        <Package className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => router.push(`/suppliers/${supplier.id}`)}
                                    >
                                        <Edit className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => {
                                            setSelectedSupplier(supplier)
                                            setShowDeleteDialog(true)
                                        }}
                                    >
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="space-y-4">
                    {suppliers.map((supplier) => (
                        <Card
                            key={supplier.id}
                            className="hover:shadow-lg transition-shadow"
                        >
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                                            <Building2 className="h-6 w-6 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg">{supplier.name}</h3>
                                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                                                {supplier.cnpj && <span>{formatCNPJ(supplier.cnpj)}</span>}
                                                {supplier.contactPerson && <span>{supplier.contactPerson}</span>}
                                                {supplier.phone && <span>{formatPhone(supplier.phone)}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge variant={supplier.isActive ? 'default' : 'secondary'}>
                                            {supplier.isActive ? 'Ativo' : 'Inativo'}
                                        </Badge>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => router.push(`/suppliers/${supplier.id}/products`)}
                                        >
                                            <Package className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => router.push(`/suppliers/${supplier.id}`)}
                                        >
                                            <Edit className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            onClick={() => {
                                                setSelectedSupplier(supplier)
                                                setShowDeleteDialog(true)
                                            }}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Paginação */}
            {pagination && pagination.pages > 1 && (
                <div className="flex justify-center gap-2">
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={!pagination.hasPrev}
                    >
                        Anterior
                    </Button>
                    <span className="py-2 px-4">
            Página {pagination.page} de {pagination.pages}
          </span>
                    <Button
                        variant="outline"
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                    >
                        Próxima
                    </Button>
                </div>
            )}

            {/* Dialog de confirmação de exclusão */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja excluir o fornecedor "{selectedSupplier?.name}"?
                            Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Excluindo...' : 'Excluir'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}