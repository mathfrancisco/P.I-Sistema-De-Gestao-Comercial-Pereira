
import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, handleApiError } from '@/lib/api-auth'
import { SupplierService } from '@/lib/services/suppliers'
import { supplierSearchSchema, SupplierSearchInput } from '@/lib/validations/suppliers'

// GET /api/suppliers/search - Buscar fornecedores (todos os roles)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação (todos os roles podem consultar)
        const currentUser = await getAuthenticatedUser()

        // 2. Extrair e validar parâmetros de busca
        const searchParams = request.nextUrl.searchParams
        const queryParams = Object.fromEntries(searchParams.entries())

        const searchData: SupplierSearchInput = supplierSearchSchema.parse(queryParams)

        // 3. Realizar busca
        const suppliers = await SupplierService.search(searchData)

        // 4. Resposta de sucesso
        return NextResponse.json({
            success: true,
            data: suppliers,
            query: searchData.q,
            limit: searchData.limit
        })

    } catch (error) {
        console.error('❌ GET /api/suppliers/search error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}