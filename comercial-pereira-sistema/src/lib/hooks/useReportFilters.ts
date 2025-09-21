import { useState, useCallback, useMemo } from 'react'
import {
    ReportType,
    ReportPeriod,
    ReportFilters,
    SalesReportFilters,
    ProductReportFilters,
    FinancialReportFilters,
    CustomerReportFilters,
    InventoryReportFilters
} from '@/types/report'
import {
    startOfDay,
    endOfDay,
    subDays,
    startOfMonth,
    endOfMonth,
    startOfQuarter,
    endOfQuarter,
    startOfYear,
    endOfYear
} from 'date-fns'

type SpecificFilters =
    | SalesReportFilters
    | ProductReportFilters
    | FinancialReportFilters
    | CustomerReportFilters
    | InventoryReportFilters

interface UseReportFiltersReturn<T extends SpecificFilters> {
    filters: T
    updateFilter: <K extends keyof T>(key: K, value: T[K]) => void
    setPeriod: (period: ReportPeriod) => void
    setDateRange: (startDate: Date | null, endDate: Date | null) => void
    resetFilters: () => void
    validateFilters: () => boolean
    getQueryParams: () => URLSearchParams
}

const getInitialFilters = <T extends SpecificFilters>(type: ReportType): T => {
    const baseFilters: ReportFilters = {
        type,
        period: 'last30days',
        format: 'json',
        includeDetails: true
    }

    // Aplicar período padrão
    const dates = getPeriodDates('last30days')
    baseFilters.startDate = dates.startDate
    baseFilters.endDate = dates.endDate

    return baseFilters as T
}

const getPeriodDates = (period: ReportPeriod) => {
    const now = new Date()
    let startDate: Date
    let endDate: Date

    switch (period) {
        case 'today':
            startDate = startOfDay(now)
            endDate = endOfDay(now)
            break
        case 'yesterday':
            startDate = startOfDay(subDays(now, 1))
            endDate = endOfDay(subDays(now, 1))
            break
        case 'last7days':
            startDate = startOfDay(subDays(now, 6))
            endDate = endOfDay(now)
            break
        case 'last30days':
            startDate = startOfDay(subDays(now, 29))
            endDate = endOfDay(now)
            break
        case 'thisMonth':
            startDate = startOfMonth(now)
            endDate = endOfMonth(now)
            break
        case 'lastMonth':
            const lastMonth = subDays(startOfMonth(now), 1)
            startDate = startOfMonth(lastMonth)
            endDate = endOfMonth(lastMonth)
            break
        case 'thisQuarter':
            startDate = startOfQuarter(now)
            endDate = endOfQuarter(now)
            break
        case 'lastQuarter':
            const lastQuarter = subDays(startOfQuarter(now), 1)
            startDate = startOfQuarter(lastQuarter)
            endDate = endOfQuarter(lastQuarter)
            break
        case 'thisYear':
            startDate = startOfYear(now)
            endDate = endOfYear(now)
            break
        case 'lastYear':
            const lastYear = subDays(startOfYear(now), 1)
            startDate = startOfYear(lastYear)
            endDate = endOfYear(lastYear)
            break
        default:
            startDate = startOfDay(subDays(now, 29))
            endDate = endOfDay(now)
    }

    return { startDate, endDate }
}

export function useReportFilters<T extends SpecificFilters>(
    type: ReportType
): UseReportFiltersReturn<T> {
    const [filters, setFilters] = useState<T>(() => getInitialFilters<T>(type))

    // Atualizar filtro específico
    const updateFilter = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
        setFilters(prev => ({
            ...prev,
            [key]: value
        }))
    }, [])

    // Definir período
    const setPeriod = useCallback((period: ReportPeriod) => {
        const { startDate, endDate } = getPeriodDates(period)
        setFilters(prev => ({
            ...prev,
            period,
            startDate,
            endDate
        }))
    }, [])

    // Definir range de datas customizado
    const setDateRange = useCallback((startDate: Date | null, endDate: Date | null) => {
        setFilters(prev => ({
            ...prev,
            period: 'custom',
            startDate: startDate || undefined,
            endDate: endDate || undefined
        }))
    }, [])

    // Resetar filtros
    const resetFilters = useCallback(() => {
        setFilters(getInitialFilters<T>(type))
    }, [type])

    // Validar filtros
    const validateFilters = useCallback(() => {
        if (!filters.type) return false

        if (filters.period === 'custom') {
            if (!filters.startDate || !filters.endDate) return false
            if (filters.startDate > filters.endDate) return false
        }

        return true
    }, [filters])

    // Converter filtros para query params
    const getQueryParams = useCallback(() => {
        const params = new URLSearchParams()

        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (value instanceof Date) {
                    params.append(key, value.toISOString())
                } else {
                    params.append(key, String(value))
                }
            }
        })

        return params
    }, [filters])

    return {
        filters,
        updateFilter,
        setPeriod,
        setDateRange,
        resetFilters,
        validateFilters,
        getQueryParams
    }
}