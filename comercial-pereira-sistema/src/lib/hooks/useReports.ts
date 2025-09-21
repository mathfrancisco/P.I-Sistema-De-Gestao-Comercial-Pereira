import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import {
    ReportType,
    ReportFormat,
    ReportResponse,
    REPORT_TITLES
} from '@/types/report'

interface ReportInfo {
    type: ReportType
    title: string
    description: string
    available: boolean
}

interface UseReportsReturn {
    reports: ReportInfo[]
    currentReport: ReportResponse | null
    loading: boolean
    error: string | null
    fetchAvailableReports: () => Promise<void>
    generateReport: (type: ReportType, filters: any) => Promise<void>
    clearReport: () => void
    exportReport: (format: ReportFormat) => Promise<void>
}

export function useReports(): UseReportsReturn {
    const [reports, setReports] = useState<ReportInfo[]>([])
    const [currentReport, setCurrentReport] = useState<ReportResponse | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Buscar relatórios disponíveis
    const fetchAvailableReports = useCallback(async () => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/reports', {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erro ao buscar relatórios')
            }

            const data = await response.json()
            setReports(data.reports)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro desconhecido'
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Gerar relatório
    const generateReport = useCallback(async (type: ReportType, filters: any) => {
        try {
            setLoading(true)
            setError(null)

            const response = await fetch('/api/reports', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, ...filters })
            })

            if (!response.ok) {
                const data = await response.json()
                throw new Error(data.error || 'Erro ao gerar relatório')
            }

            const report = await response.json()
            setCurrentReport(report)
            toast.success(`${REPORT_TITLES[type]} gerado com sucesso!`)
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Erro ao gerar relatório'
            setError(message)
            toast.error(message)
        } finally {
            setLoading(false)
        }
    }, [])

    // Limpar relatório atual
    const clearReport = useCallback(() => {
        setCurrentReport(null)
    }, [])

    // Exportar relatório
    const exportReport = useCallback(async (format: ReportFormat) => {
        if (!currentReport) {
            toast.error('Nenhum relatório para exportar')
            return
        }

        try {
            setLoading(true)

            // Simular exportação - em produção seria uma chamada real
            await new Promise(resolve => setTimeout(resolve, 1000))

            toast.success(`Relatório exportado em formato ${format.toUpperCase()}`)
        } catch (err) {
            toast.error('Erro ao exportar relatório')
        } finally {
            setLoading(false)
        }
    }, [currentReport])

    // Carregar relatórios disponíveis ao montar
    useEffect(() => {
        fetchAvailableReports()
    }, [fetchAvailableReports])

    return {
        reports,
        currentReport,
        loading,
        error,
        fetchAvailableReports,
        generateReport,
        clearReport,
        exportReport
    }
}