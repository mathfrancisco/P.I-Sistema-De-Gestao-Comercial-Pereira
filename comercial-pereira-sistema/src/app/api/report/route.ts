// app/api/reports/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { ReportService, ReportError } from "@/lib/services/report"
import {REPORT_DESCRIPTIONS, REPORT_TITLES, REPORT_TYPES} from "@/types/report"

export async function POST(request: NextRequest) {
    try {
        // Verify permissions (only MANAGER and ADMIN can generate reports)
        const user = await getAuthenticatedUser()
        if (!['ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json(
                { error: 'Apenas gerentes e administradores podem gerar relatórios' },
                { status: 403 }
            )
        }

        // Get request body
        const body = await request.json()

        // Validate report type
        if (!body.type || !REPORT_TYPES.includes(body.type)) {
            return NextResponse.json(
                { error: 'Tipo de relatório inválido' },
                { status: 400 }
            )
        }

        // Generate report based on type
        let report
        switch (body.type) {
            case 'sales':
                report = await ReportService.generateSalesReport(body, user.email)
                break
            case 'products':
                report = await ReportService.generateProductReport(body, user.email)
                break
            case 'financial':
                report = await ReportService.generateFinancialReport(body, user.email)
                break
            case 'customers':
                report = await ReportService.generateCustomerReport(body, user.email)
                break
            case 'inventory':
                report = await ReportService.generateInventoryReport(body, user.email)
                break
            default:
                return NextResponse.json(
                    { error: 'Tipo de relatório não implementado' },
                    { status: 501 }
                )
        }

        console.log(`✅ [${user.role}] ${user.email} gerou relatório: ${body.type}`)

        return NextResponse.json(report)

    } catch (error) {
        if (error instanceof ReportError) {
            return NextResponse.json({ error: error.message }, { status: error.statusCode })
        }

        const { error: errorMessage, statusCode } = handleApiError(error)
        return NextResponse.json({ error: errorMessage }, { status: statusCode })
    }
}

export async function GET(request: NextRequest) {
    try {
        // Verify permissions
        const user = await getAuthenticatedUser()
        if (!['ADMIN', 'MANAGER'].includes(user.role)) {
            return NextResponse.json(
                { error: 'Permissão insuficiente' },
                { status: 403 }
            )
        }

        // Return available report types and descriptions
        const availableReports = REPORT_TYPES.map(type => ({
            type,
            title: REPORT_TITLES[type],
            description: REPORT_DESCRIPTIONS[type],
            available: true
        }))

        return NextResponse.json({
            reports: availableReports,
            userRole: user.role
        })

    } catch (error) {
        const { error: errorMessage, statusCode } = handleApiError(error)
        return NextResponse.json({ error: errorMessage }, { status: statusCode })
    }
}