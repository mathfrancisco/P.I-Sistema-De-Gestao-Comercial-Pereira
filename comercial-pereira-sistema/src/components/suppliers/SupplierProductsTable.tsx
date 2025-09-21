// components/suppliers/supplier-products-table.tsx
'use client'

import { useState } from 'react'
import {
    Edit2,
    Trash2,
    Save,
    X,
    Plus,
    Package,
    DollarSign,
    Calendar,
    TrendingUp,
    AlertTriangle
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table'
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Skeleton } from '@/components/ui/skeleton'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {useSupplierWithProducts} from "@/lib/hooks/useSuppliers";
import {formatCurrency} from "@/lib/utils/categoryUtils";

interface SupplierProductsTableProps {
    supplierId: number
}

interface EditingProduct {
    id: number
    price: number
    supplierCode?: string
}

export function SupplierProductsTable({ supplierId }: SupplierProductsTableProps) {
    const { supplier, isLoading, error, refetch } = useSupplierWithProducts(supplierId)
    const [editingProduct, setEditingProduct] = useState<EditingProduct | null>(null)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [priceHistory, setPriceHistory] = useState<any[]>([])
    const [showPriceHistory, setShowPriceHistory] = useState(false)

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <Skeleton className="h-6 w-48" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-12 w-full" />
                        ))}
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (error || !supplier) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                        <p className="text-lg font-semibold mb-2">Erro ao carregar produtos</p>
                        <p className="text-muted-foreground mb-4">
                            Não foi possível carregar os produtos deste fornecedor
                        </p>
                        <Button onClick={() => refetch()}>Tentar Novamente</Button>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const handleEditPrice = (product: any) => {
        setEditingProduct({
            id: product.id,
            price: product.price,
            supplierCode: product.supplierCode
        })
    }

    const handleSavePrice = async () => {
        if (!editingProduct) return

        try {
            // Aqui você implementaria a chamada à API para atualizar o preço
            console.log('Atualizando preço:', editingProduct)

            // Simular sucesso
            setTimeout(() => {
                setEditingProduct(null)
                refetch()
            }, 500)
        } catch (error) {
            console.error('Erro ao atualizar preço:', error)
        }
    }

    const handleCancelEdit = () => {
        setEditingProduct(null)
    }

    const handleRemoveProduct = async (productId: number) => {
        try {
            // Aqui você implementaria a chamada à API para remover o vínculo
            console.log('Removendo produto:', productId)

            // Simular sucesso
            setTimeout(() => {
                setShowDeleteDialog(false)
                setSelectedProductId(null)
                refetch()
            }, 500)
        } catch (error) {
            console.error('Erro ao remover produto:', error)
        }
    }

    const handleShowPriceHistory = (productId: number) => {
        // Simular histórico de preços
        const history = [
            { date: new Date('2024-01-15'), price: 25.90, user: 'João Silva' },
            { date: new Date('2024-02-20'), price: 27.50, user: 'Maria Santos' },
            { date: new Date('2024-03-10'), price: 26.00, user: 'Pedro Costa' },
        ]
        setPriceHistory(history)
        setShowPriceHistory(true)
    }

    const products = supplier.products || []
    const hasProducts = products.length > 0

    return (
        <>
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <Package className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                                <CardTitle>Produtos Fornecidos</CardTitle>
                                <CardDescription>
                                    {hasProducts
                                        ? `${products.length} produto${products.length > 1 ? 's' : ''} vinculado${products.length > 1 ? 's' : ''}`
                                        : 'Nenhum produto vinculado'
                                    }
                                </CardDescription>
                            </div>
                        </div>
                        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                            <DialogTrigger asChild>
                                <Button>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Vincular Produto
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>Vincular Produto</DialogTitle>
                                    <DialogDescription>
                                        Selecione um produto para vincular a este fornecedor
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="py-4">
                                    {/* Aqui você implementaria o formulário de vinculação */}
                                    <p className="text-muted-foreground text-center py-8">
                                        Formulário de vinculação de produtos
                                    </p>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </CardHeader>

                <CardContent>
                    {hasProducts ? (
                        <div className="rounded-md border">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Produto</TableHead>
                                        <TableHead>Código</TableHead>
                                        <TableHead>Cód. Fornecedor</TableHead>
                                        <TableHead>Preço Compra</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Última Compra</TableHead>
                                        <TableHead className="text-right">Ações</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((product) => (
                                        <TableRow key={product.id}>
                                            <TableCell className="font-medium">
                                                {product.name}
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                                                    {product.code}
                                                </code>
                                            </TableCell>
                                            <TableCell>
                                                {editingProduct?.id === product.id ? (
                                                    <Input
                                                        value={editingProduct.supplierCode || ''}
                                                        onChange={(e) => setEditingProduct({
                                                            ...editingProduct,
                                                            supplierCode: e.target.value
                                                        })}
                                                        className="h-8 w-32"
                                                    />
                                                ) : (
                                                    <code className="text-xs bg-blue-50 px-2 py-1 rounded">
                                                        {product.code || '-'}
                                                    </code>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {editingProduct?.id === product.id ? (
                                                    <div className="flex items-center gap-1">
                                                        <span className="text-sm">R$</span>
                                                        <Input
                                                            type="number"
                                                            step="0.01"
                                                            value={editingProduct.price}
                                                            onChange={(e) => setEditingProduct({
                                                                ...editingProduct,
                                                                price: parseFloat(e.target.value)
                                                            })}
                                                            className="h-8 w-24"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2">
                            <span className="font-medium">
                              {formatCurrency(product.price)}
                            </span>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            className="h-6 w-6 p-0"
                                                            onClick={() => handleShowPriceHistory(product.id)}
                                                        >
                                                            <TrendingUp className="h-3 w-3" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={product.isActive ? 'default' : 'secondary'}>
                                                    {product.isActive ? 'Ativo' : 'Inativo'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(new Date(), 'dd/MM/yyyy')}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {editingProduct?.id === product.id ? (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={handleSavePrice}
                                                        >
                                                            <Save className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={handleCancelEdit}
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <div className="flex justify-end gap-1">
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => handleEditPrice(product)}
                                                        >
                                                            <Edit2 className="h-4 w-4" />
                                                        </Button>
                                                        <Button
                                                            size="sm"
                                                            variant="ghost"
                                                            onClick={() => {
                                                                setSelectedProductId(product.id)
                                                                setShowDeleteDialog(true)
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Package className="h-16 w-16 text-gray-300 mb-4" />
                            <p className="text-lg font-semibold mb-2">Nenhum produto vinculado</p>
                            <p className="text-muted-foreground text-center mb-6">
                                Vincule produtos a este fornecedor para gerenciar preços e condições comerciais
                            </p>
                        </div>
                    )}

                    {hasProducts && (
                        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                                            <Package className="h-5 w-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Total de Produtos</p>
                                            <p className="text-2xl font-bold">{products.length}</p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center">
                                            <DollarSign className="h-5 w-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Valor Total</p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(
                                                    products.reduce((acc, p) => acc + p.price, 0)
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardContent className="pt-6">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                            <TrendingUp className="h-5 w-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-muted-foreground">Ticket Médio</p>
                                            <p className="text-2xl font-bold">
                                                {formatCurrency(
                                                    products.reduce((acc, p) => acc + p.price, 0) / products.length
                                                )}
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Dialog de confirmação de exclusão */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remover produto</AlertDialogTitle>
                        <AlertDialogDescription>
                            Tem certeza que deseja remover este produto do fornecedor?
                            O produto continuará existente no sistema, apenas o vínculo será removido.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => selectedProductId && handleRemoveProduct(selectedProductId)}
                        >
                            Remover
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Dialog de histórico de preços */}
            <Dialog open={showPriceHistory} onOpenChange={setShowPriceHistory}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>Histórico de Preços</DialogTitle>
                        <DialogDescription>
                            Alterações de preço realizadas para este produto
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Data</TableHead>
                                    <TableHead>Preço</TableHead>
                                    <TableHead>Alterado por</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {priceHistory.map((item, index) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            {format(item.date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {formatCurrency(item.price)}
                                        </TableCell>
                                        <TableCell>{item.user}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}