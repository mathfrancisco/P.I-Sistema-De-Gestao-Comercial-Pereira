import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser, requireAdminOrManager, handleApiError } from '@/lib/api-auth'
import { SupplierService } from '@/lib/services/suppliers'
import { supplierFiltersSchema } from '@/lib/validations/suppliers'

// GET /api/suppliers/export - Exportar fornecedores (ADMIN e MANAGER)
export async function GET(request: NextRequest) {
    try {
        // 1. Autenticação e autorização
        const currentUser = await requireAdminOrManager()

        // 2. Extrair filtros (sem paginação para exportação)
        const searchParams = request.nextUrl.searchParams
        const queryParams = Object.fromEntries(searchParams.entries())

        // Remover paginação para exportar todos
        const filters = supplierFiltersSchema.parse({
            ...queryParams,
            page: 1,
            limit: 10000 // Limite alto para exportação
        })

        // 3. Buscar todos os fornecedores
        const result = await SupplierService.findMany(filters)

        // 4. Preparar dados para exportação (formato CSV)
        const csvHeaders = [
            'ID', 'Nome', 'Contato', 'Email', 'Telefone', 'Cidade', 'Estado',
            'CEP', 'CNPJ', 'Website', 'Ativo', 'Data Criação'
        ].join(',')

        const csvData = result.data.map(supplier => [
            supplier.id,
            `"${supplier.name}"`,
            `"${supplier.contactPerson || ''}"`,
            supplier.email || '',
            supplier.phone || '',
            `"${supplier.city || ''}"`,
            supplier.state || '',
            supplier.zipCode || '',
            supplier.cnpj || '',
            supplier.website || '',
            supplier.isActive ? 'Sim' : 'Não',
            supplier.createdAt.toISOString().split('T')[0]
        ].join(',')).join('\n')

        const csvContent = csvHeaders + '\n' + csvData

        // 5. Resposta com arquivo CSV
        return new NextResponse(csvContent, {
            status: 200,
            headers: {
                'Content-Type': 'text/csv; charset=utf-8',
                'Content-Disposition': `attachment; filename="fornecedores_${new Date().toISOString().split('T')[0]}.csv"`
            }
        })

    } catch (error) {
        console.error('❌ GET /api/suppliers/export error:', error)
        const { error: message, statusCode } = handleApiError(error)
        return NextResponse.json({
            success: false,
            error: message
        }, { status: statusCode })
    }
}