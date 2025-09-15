// app/api/reports/[type]/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { ReportService, ReportError } from "@/lib/services/report"
import { REPORT_TYPES } from "@/types/report"

interface RouteParams {
    params: {
        type: string
    }
}

export async function GET(request: NextRequest, { params }: RouteParams) {
    try {
        // Verify permissions
        const user = await getAuthenticatedUser()
        if (!['ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json(
                { error: 'Permissão insuficiente para gerar relatórios' },
                { status: 403 }
            )
        }

        // Validate report type
        if (!REPORT_TYPES.includes(params.type as any)) {
            return NextResponse.json(
                { error: 'Tipo de relatório inválido' },
                { status: 400 }
            )
        }

        // Extract query parameters as filters
        const { searchParams } = new URL(request.url)
        const filters = Object.fromEntries(searchParams)
        filters.type = params.type

        // Generate report
        let report
        switch (params.type) {
            case 'sales':
                report = await ReportService.generateSalesReport(filters as any, user.email)
                break
            case 'products':
                report = await ReportService.generateProductReport(filters as any, user.email)
                break
            case 'financial':
                report = await ReportService.generateFinancialReport(filters as any, user.email)
                break
            case 'customers':
                report = await ReportService.generateCustomerReport(filters as any, user.email)
                break
            case 'inventory':
                report = await ReportService.generateInventoryReport(filters as any, user.email)
                break
            default:
                return NextResponse.json(
                    { error: 'Tipo de relatório não implementado' },
                    { status: 501 }
                )
        }

        console.log(`✅ [${user.role}] ${user.email} gerou relatório ${params.type} via GET`)

        return NextResponse.json(report)

    } catch (error) {
        if (error instanceof ReportError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode })
        }

        const { error: errorMessage, statusCode } = handleApiError(error)
        return NextResponse.json({ error: errorMessage }, { status: statusCode })
    }
}