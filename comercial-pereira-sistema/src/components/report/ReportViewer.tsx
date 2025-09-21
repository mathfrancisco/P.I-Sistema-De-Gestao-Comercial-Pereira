'use client'

import { useState } from 'react'
import {
    RefreshCw,
    Download,
    Printer,
    Share2,
    Maximize2,
    Filter,
    FileText
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ReportResponse, ReportFormat } from '@/types/report'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { toast } from 'sonner'

interface ReportViewerProps {
    report: ReportResponse | null
    loading?: boolean
    onRefresh?: () => void
    onExport?: (format: ReportFormat) => void
    onToggleFilters?: () => void
    showFilters?: boolean
}

export function ReportViewer({
                                 report,
                                 loading,
                                 onRefresh,
                                 onExport,
                                 onToggleFilters,
                                 showFilters
                             }: ReportViewerProps) {
    const [isFullscreen, setIsFullscreen] = useState(false)

    const handlePrint = () => {
        window.print()
        toast.info('Preparando impressão...')
    }

    const handleShare = async () => {
        try {
            await navigator.share({
                title: report?.metadata.title || 'Relatório',
                text: report?.metadata.description || '',
                url: window.location.href,
            })
        } catch {
            await navigator.clipboard.writeText(window.location.href)
            toast.success('Link copiado!')
        }
    }

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
            setIsFullscreen(true)
        } else {
            document.exitFullscreen()
            setIsFullscreen(false)
        }
    }

    if (!report) {
        return (
            <Card className="p-12">
                <div className="text-center">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                        Nenhum relatório gerado. Configure os filtros e clique em "Gerar Relatório".
                    </p>
                </div>
            </Card>
        )
    }

    return (
        <Card className="overflow-hidden">
            {/* Toolbar */}
            <div className="border-b px-6 py-4 bg-gray-50">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-xl font-semibold">{report.metadata.title}</h2>
                        <div className="flex items-center gap-4 mt-1">
                            <Badge variant="outline">{report.metadata.type}</Badge>
                            <span className="text-sm text-muted-foreground">
                Gerado em {format(new Date(report.metadata.generatedAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
              </span>
                            {report.metadata.rowCount && (
                                <span className="text-sm text-muted-foreground">
                  {report.metadata.rowCount} registros
                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {onToggleFilters && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onToggleFilters}
                                className={showFilters ? 'bg-accent' : ''}
                            >
                                <Filter className="h-4 w-4 mr-1" />
                                Filtros
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onRefresh}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                        </Button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Download className="h-4 w-4 mr-1" />
                                    Exportar
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => onExport?.('pdf')}>
                                    PDF
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onExport?.('excel')}>
                                    Excel
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => onExport?.('csv')}>
                                    CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="outline" size="sm" onClick={handlePrint}>
                            <Printer className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" onClick={handleShare}>
                            <Share2 className="h-4 w-4" />
                        </Button>

                        <Button variant="outline" size="sm" onClick={toggleFullscreen}>
                            <Maximize2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="p-6">
                {/* Summary Cards */}
                {report.data.summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        {Object.entries(report.data.summary).slice(0, 4).map(([key, value]) => (
                            <Card key={key} className="p-4">
                                <p className="text-sm text-muted-foreground capitalize">
                                    {key.replace(/([A-Z])/g, ' $1').trim()}
                                </p>
                                <p className="text-2xl font-bold mt-1">
                                    {typeof value === 'number'
                                        ? value.toLocaleString('pt-BR', {
                                            minimumFractionDigits: 0,
                                            maximumFractionDigits: 2
                                        })
                                        : value
                                    }
                                </p>
                            </Card>
                        ))}
                    </div>
                )}

                {/* Placeholder for charts/tables */}
                <Card className="p-6 bg-gray-50">
                    <p className="text-center text-muted-foreground">
                        Área de visualização de dados (gráficos e tabelas)
                    </p>
                </Card>
            </div>

            {/* Footer */}
            <div className="border-t px-6 py-3 bg-gray-50">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Gerado por: {report.metadata.generatedBy}</span>
                    <span>ID: {report.metadata.id}</span>
                </div>
            </div>
        </Card>
    )
}