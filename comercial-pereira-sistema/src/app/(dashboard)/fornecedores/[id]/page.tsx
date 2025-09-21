'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
    ArrowLeft,
    Edit,
    Package,
    TrendingUp,
    DollarSign,
    Calendar,
    Activity
} from 'lucide-react'

import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {useSupplierPerformance, useSuppliers} from "@/lib/hooks/useSuppliers";
import {SupplierContactCard} from "@/components/suppliers/SupplierContactCard";
import {formatCurrency} from "@/lib/utils/categoryUtils";
import {SupplierForm} from "@/components/suppliers/SupplierForm";

export default function SupplierDetailPage() {
    const router = useRouter()
    const params = useParams()
    const supplierId = Number(params?.id)

    const [activeTab, setActiveTab] = useState('overview')
    const [isEditing, setIsEditing] = useState(false)

    const { getSupplierById } = useSuppliers()
    const { performance, isLoading: isLoadingPerformance } = useSupplierPerformance(supplierId)

    const [supplier, setSupplier] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const loadSupplier = async () => {
            if (supplierId) {
                try {
                    setIsLoading(true)
                    const data = await getSupplierById(supplierId)
                    setSupplier(data)
                } catch (error) {
                    console.error('Erro ao carregar fornecedor:', error)
                } finally {
                    setIsLoading(false)
                }
            }
        }

        loadSupplier()
    }, [supplierId])

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <Skeleton className="h-8 w-64 mb-4" />
                <div className="space-y-4">
                    <Skeleton className="h-32 w-full" />
                    <Skeleton className="h-64 w-full" />
                </div>
            </div>
        )
    }

    if (!supplier) {
        return (
            <div className="container mx-auto p-6">
                <p className="text-center text-muted-foreground">
                    Fornecedor não encontrado
                </p>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <Button
                    variant="ghost"
                    onClick={() => router.back()}
                    className="mb-4"
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Voltar
                </Button>

                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">{supplier.name}</h1>
                        <p className="text-muted-foreground mt-2">
                            Detalhes e informações do fornecedor
                        </p>
                    </div>

                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => router.push(`/suppliers/${supplierId}/products`)}
                        >
                            <Package className="mr-2 h-4 w-4" />
                            Ver Produtos
                        </Button>
                        {!isEditing && (
                            <Button onClick={() => setIsEditing(true)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Editar
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="edit">Editar</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                    <SupplierContactCard
                        supplier={supplier}
                        editable={!isEditing}
                    />
                </TabsContent>

                <TabsContent value="performance" className="space-y-4">
                    {isLoadingPerformance ? (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[...Array(6)].map((_, i) => (
                                <Card key={i}>
                                    <CardHeader>
                                        <Skeleton className="h-4 w-24" />
                                    </CardHeader>
                                    <CardContent>
                                        <Skeleton className="h-8 w-32" />
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    ) : performance ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total de Produtos
                                        </CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {performance.totalProducts}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Produtos ativos
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Total de Vendas
                                        </CardTitle>
                                        <Activity className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {performance.totalSales}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Vendas realizadas
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Receita Total
                                        </CardTitle>
                                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(performance.totalRevenue)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Valor gerado
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Quantidade Total
                                        </CardTitle>
                                        <Package className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {performance.totalQuantity}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Unidades vendidas
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Ticket Médio
                                        </CardTitle>
                                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {formatCurrency(performance.averageSaleValue)}
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Por venda
                                        </p>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                        <CardTitle className="text-sm font-medium">
                                            Última Venda
                                        </CardTitle>
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                    </CardHeader>
                                    <CardContent>
                                        <div className="text-2xl font-bold">
                                            {performance.lastSaleDate
                                                ? format(new Date(performance.lastSaleDate), 'dd/MM/yyyy')
                                                : 'N/A'
                                            }
                                        </div>
                                        <p className="text-xs text-muted-foreground">
                                            Data da última venda
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="flex items-center justify-center py-8">
                                <p className="text-muted-foreground">
                                    Nenhum dado de performance disponível
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>

                <TabsContent value="edit">
                    <div className="max-w-4xl">
                        <SupplierForm
                            supplier={supplier}
                            mode="edit"
                            onSuccess={() => setIsEditing(false)}
                            onCancel={() => setIsEditing(false)}
                        />
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    )
}
