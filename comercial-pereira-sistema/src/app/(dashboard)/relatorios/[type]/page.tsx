'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, Play } from 'lucide-react'
import { ReportType, REPORT_TITLES } from '@/types/report'
import { useReports } from '@/lib/hooks/useReports'
import { useReportFilters } from '@/lib/hooks/useReportFilters'
import { ReportFilters } from '@/components/report/ReportFilters'
import { ReportViewer } from '@/components/report/ReportViewer'
import { ReportScheduler } from '@/components/report/ReportScheduler'

export default function ReportTypePage() {
  const params = useParams()
  const router = useRouter()
  const reportType = params.type as ReportType
  
  const { currentReport, generateReport, exportReport, loading } = useReports()
  const reportFilters = useReportFilters(reportType)
  const [showFilters, setShowFilters] = useState(true)

  const handleGenerateReport = async (filters?: any) => {
    await generateReport(reportType, filters || reportFilters.filters)
  }

  const handleExport = async (format: any) => {
    await exportReport(format)
  }

  useEffect(() => {
    // Reset filters when report type changes
    reportFilters.resetFilters()
  }, [reportType])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/reports')}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{REPORT_TITLES[reportType]}</h1>
          <p className="text-muted-foreground">
            Configure e visualize relatórios de {reportType}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="generate" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="generate">Gerar Relatório</TabsTrigger>
          <TabsTrigger value="schedule">Agendar</TabsTrigger>
          <TabsTrigger value="history">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="generate" className="space-y-6">
          <div className="grid grid-cols-12 gap-6">
            {/* Filters Panel */}
            {showFilters && (
              <div className="col-span-12 lg:col-span-3">
                <Card className="p-4 sticky top-6">
                  <h3 className="font-semibold mb-4">Filtros</h3>
                  <ReportFilters
                    reportType={reportType}
                    onApply={handleGenerateReport}
                  />
                </Card>
              </div>
            )}

            {/* Report Viewer */}
            <div className={showFilters ? "col-span-12 lg:col-span-9" : "col-span-12"}>
              <ReportViewer
                report={currentReport}
                loading={loading}
                onRefresh={() => handleGenerateReport()}
                onExport={handleExport}
                onToggleFilters={() => setShowFilters(!showFilters)}
                showFilters={showFilters}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="schedule">
          <div className="max-w-3xl mx-auto">
            <ReportScheduler 
              reportType={reportType}
              filters={reportFilters.filters}
            />
          </div>
        </TabsContent>

        <TabsContent value="history">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Histórico de Relatórios</h3>
            <div className="space-y-3">
              {/* Mock history data */}
              {[
                { id: 1, name: `${REPORT_TITLES[reportType]} - Janeiro`, date: '2025-01-20', size: '2.3 MB' },
                { id: 2, name: `${REPORT_TITLES[reportType]} - Dezembro`, date: '2024-12-31', size: '1.8 MB' },
                { id: 3, name: `${REPORT_TITLES[reportType]} - Novembro`, date: '2024-11-30', size: '2.1 MB' },
              ].map(item => (
                <div key={item.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {item.date} • {item.size}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}