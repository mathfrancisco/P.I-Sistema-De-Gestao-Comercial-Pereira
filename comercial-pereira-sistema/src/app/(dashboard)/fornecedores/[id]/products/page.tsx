'use client'

import { useRouter, useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { ArrowLeft, Building2 } from 'lucide-react'
import {useSuppliers} from "@/lib/hooks/useSuppliers";
import {SupplierProductsTable} from "@/components/suppliers/SupplierProductsTable";
import {SupplierContactCard} from "@/components/suppliers/SupplierContactCard";

export default function SupplierProductsPage() {
    const router = useRouter()
    const params = useParams()
    const supplierId = Number(params?.id)

    const [activeTab, setActiveTab] = useState('products')
    const { getSupplierById } = useSuppliers()

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
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Building2 className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{supplier.name}</h1>
                            <p className="text-muted-foreground mt-2">
                                Produtos fornecidos e condições comerciais
                            </p>
                        </div>
                    </div>

                    <Button
                        variant="outline"
                        onClick={() => router.push(`/suppliers/${supplierId}`)}
                    >
                        Ver Detalhes
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="products">Produtos</TabsTrigger>
                    <TabsTrigger value="info">Informações</TabsTrigger>
                </TabsList>

                <TabsContent value="products" className="space-y-4">
                    <SupplierProductsTable supplierId={supplierId} />
                </TabsContent>

                <TabsContent value="info" className="space-y-4">
                    <SupplierContactCard supplier={supplier} />
                </TabsContent>
            </Tabs>
        </div>
    )
}