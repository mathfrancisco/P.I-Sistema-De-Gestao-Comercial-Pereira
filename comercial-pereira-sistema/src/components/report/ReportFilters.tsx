'use client'

import {
    Calendar,
    Filter,
    RotateCcw,
    ChevronDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ReportType, ReportPeriod } from '@/types/report'

import { toast } from 'sonner'
import {cn} from "@/lib/utils/utils";
import {useReportFilters} from "@/lib/hooks/useReportFilters";

interface ReportFiltersProps {
    reportType: ReportType
    onApply: (filters: any) => void
    className?: string
}

const PERIODS: { value: ReportPeriod; label: string }[] = [
    { value: 'today', label: 'Hoje' },
    { value: 'yesterday', label: 'Ontem' },
    { value: 'last7days', label: 'Últimos 7 dias' },
    { value: 'last30days', label: 'Últimos 30 dias' },
    { value: 'thisMonth', label: 'Este mês' },
    { value: 'lastMonth', label: 'Mês passado' },
    { value: 'thisQuarter', label: 'Este trimestre' },
    { value: 'lastQuarter', label: 'Trimestre passado' },
    { value: 'thisYear', label: 'Este ano' },
    { value: 'lastYear', label: 'Ano passado' },
    { value: 'custom', label: 'Personalizado' }
]

export function ReportFilters({ reportType, onApply, className }: ReportFiltersProps) {
    const {
        filters,
        updateFilter,
        setPeriod,
        setDateRange,
        resetFilters,
        validateFilters
    } = useReportFilters(reportType)

    const handleApply = () => {
        if (!validateFilters()) {
            toast.error('Verifique os filtros selecionados')
            return
        }
        onApply(filters)
    }

    return (
        <div className={cn("space-y-4", className)}>
            {/* Período */}
            <div>
                <Label>Período</Label>
                <Select
                    value={filters.period}
                    onValueChange={(v: ReportPeriod) => setPeriod(v)}
                >
                    <SelectTrigger className="mt-1">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {PERIODS.map(period => (
                            <SelectItem key={period.value} value={period.value}>
                                {period.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {/* Date Range Custom */}
            {filters.period === 'custom' && (
                <>
                    <div>
                        <Label>Data Início</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal mt-1",
                                        !filters.startDate && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {filters.startDate
                                        ? format(filters.startDate, 'dd/MM/yyyy')
                                        : 'Selecione'
                                    }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                    mode="single"
                                    selected={filters.startDate}
                                    onSelect={(date) => setDateRange(date || null, filters.endDate || null)}
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>

                    <div>
                        <Label>Data Fim</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full justify-start text-left font-normal mt-1",
                                        !filters.endDate && "text-muted-foreground"
                                    )}
                                >
                                    <Calendar className="mr-2 h-4 w-4" />
                                    {filters.endDate
                                        ? format(filters.endDate, 'dd/MM/yyyy')
                                        : 'Selecione'
                                    }
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <CalendarComponent
                                    mode="single"
                                    selected={filters.endDate}
                                    onSelect={(date) => setDateRange(filters.startDate || null, date || null)}
                                    locale={ptBR}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                </>
            )}

            {/* Filtros específicos por tipo */}
            {reportType === 'sales' && (
                <>
                    <div>
                        <Label>Status</Label>
                        <Select
                            value={(filters as any).status || 'all'}
                            onValueChange={(v) => updateFilter('status' as any, v === 'all' ? undefined : v)}
                        >
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todos</SelectItem>
                                <SelectItem value="PENDING">Pendente</SelectItem>
                                <SelectItem value="COMPLETED">Concluído</SelectItem>
                                <SelectItem value="CANCELLED">Cancelado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Valor Mínimo</Label>
                        <Input
                            type="number"
                            placeholder="0,00"
                            value={(filters as any).minValue || ''}
                            onChange={(e) => updateFilter('minValue' as any, e.target.value ? parseFloat(e.target.value) : undefined)}
                            className="mt-1"
                        />
                    </div>
                </>
            )}

            {reportType === 'products' && (
                <div>
                    <Label>Status do Estoque</Label>
                    <Select
                        value={(filters as any).stockStatus || 'all'}
                        onValueChange={(v) => updateFilter('stockStatus' as any, v)}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="low">Estoque Baixo</SelectItem>
                            <SelectItem value="out">Sem Estoque</SelectItem>
                            <SelectItem value="normal">Normal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            {reportType === 'customers' && (
                <div>
                    <Label>Tipo de Cliente</Label>
                    <Select
                        value={(filters as any).customerType || 'all'}
                        onValueChange={(v) => updateFilter('customerType' as any, v === 'all' ? undefined : v)}
                    >
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos</SelectItem>
                            <SelectItem value="RETAIL">Varejo</SelectItem>
                            <SelectItem value="WHOLESALE">Atacado</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            )}

            <Separator />

            {/* Ações */}
            <div className="flex gap-2">
                <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="flex-1"
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Resetar
                </Button>
                <Button
                    onClick={handleApply}
                    className="flex-1"
                >
                    <Filter className="h-4 w-4 mr-2" />
                    Aplicar
                </Button>
            </div>
        </div>
    )
}