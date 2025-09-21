'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import {SupplierForm} from "@/components/suppliers/SupplierForm";

export default function NewSupplierPage() {
    const router = useRouter()

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

                <h1 className="text-3xl font-bold">Novo Fornecedor</h1>
                <p className="text-muted-foreground mt-2">
                    Cadastre um novo fornecedor no sistema
                </p>
            </div>

            <div className="max-w-4xl">
                <SupplierForm mode="create" />
            </div>
        </div>
    )
}
