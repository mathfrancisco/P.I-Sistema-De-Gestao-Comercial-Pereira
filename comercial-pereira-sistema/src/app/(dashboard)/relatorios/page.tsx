'use client'

import { useRouter } from 'next/navigation'
import { 
  FileText, 
  TrendingUp,
  Calendar,
  Settings,
  Clock,
  BarChart3
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { ReportType } from '@/types/report'
import { ReportCategoryGrid } from '@/components/report/ReportCategoryGrid'

export default function ReportsPage() {
  const router = useRouter()

  const handleCategorySelect = (type: ReportType) => {
    router.push(`/reports/${type}`)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Central de Relatórios</h1>
          <p className="text-muted-foreground mt-2">
            Gere relatórios detalhados e insights sobre seu negócio
          </p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button 
            variant="outline" 
            onClick={() => router.push('/reports/builder')}
          >
            <Settings className="h-4 w-4 mr-2" />
            Construtor
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/reports/scheduled')}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Agendados
          </Button>
          <Button 
            variant="outline"
            onClick={() => router.push('/reports/templates')}
          >
            <FileText className="h-4 w-4 mr-2" />
            Templates
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Relatórios este mês</p>
              <p className="text-3xl font-bold mt-2">32</p>
            </div>
            <BarChart3 className="h-8 w-8 text-blue-200" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Agendados ativos</p>
              <p className="text-3xl font-bold mt-2">8</p>
            </div>
            <Calendar className="h-8 w-8 text-purple-200" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Templates salvos</p>
              <p className="text-3xl font-bold mt-2">15</p>
            </div>
            <FileText className="h-8 w-8 text-green-200" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100">Média diária</p>
              <p className="text-3xl font-bold mt-2">1.2</p>
            </div>
            <TrendingUp className="h-8 w-8 text-orange-200" />
          </div>
        </Card>
      </div>

      {/* Últimos Relatórios Gerados */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Últimos Relatórios Gerados</h2>
          <Button variant="ghost" size="sm">Ver todos</Button>
        </div>
        <div className="space-y-3">
          {[
            { name: 'Vendas Janeiro 2025', type: 'sales', date: 'Há 2 horas' },
            { name: 'Estoque Crítico', type: 'inventory', date: 'Hoje, 14:30' },
            { name: 'Análise Financeira Q4', type: 'financial', date: 'Ontem' },
            { name: 'Top Clientes', type: 'customers', date: '2 dias atrás' },
          ].map((report, i) => (
            <div key={i} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <div>
                  <p className="font-medium">{report.name}</p>
                  <p className="text-sm text-muted-foreground">{report.date}</p>
                </div>
              </div>
              <Button variant="ghost" size="sm">Visualizar</Button>
            </div>
          ))}
        </div>
      </Card>

      {/* Report Categories */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Categorias de Relatórios</h2>
        <ReportCategoryGrid onCategorySelect={handleCategorySelect} />
      </div>
    </div>
  )
}