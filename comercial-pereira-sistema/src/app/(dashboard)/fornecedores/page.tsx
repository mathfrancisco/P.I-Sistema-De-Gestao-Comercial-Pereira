'use client'



import {SupplierList} from "@/components/suppliers/SupplierList";

export default function SuppliersPage() {
    return (
        <div className="container mx-auto p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Fornecedores</h1>
                <p className="text-muted-foreground mt-2">
                    Gerencie os fornecedores e suas informações de contato
                </p>
            </div>

            <SupplierList />
        </div>
    )
}