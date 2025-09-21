'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { 
  ArrowLeft, 
  Calendar,
  Clock,
  Mail,
  MoreVertical,
  Play,
  Trash2,
  Plus
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { REPORT_TITLES } from '@/types/report'
import { useReportSchedule } from '@/lib/hooks/useReportSchedule'

export default function ScheduledReportsPage() {
  const router = useRouter()
  const { schedules, toggleSchedule, deleteSchedule, testSchedule, loading } = useReportSchedule()

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push('/reports')}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Relatórios Agendados</h1>
            <p className="text-muted-foreground">
              Gerencie seus relatórios automáticos
            </p>
          </div>
        </div>

        <Button onClick={() => router.push('/reports')}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Agendamento
        </Button>
      </div>

      {/* Schedules Table */}
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Próxima Execução</TableHead>
              <TableHead>Destinatários</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {schedules.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                  Nenhum agendamento configurado
                </TableCell>
              </TableRow>
            ) : (
              schedules.map((schedule) => (
                <TableRow key={schedule.id}>
                  <TableCell className="font-medium">{schedule.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {REPORT_TITLES[schedule.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3" />
                      {schedule.schedule.frequency === 'daily' && 'Diário'}
                      {schedule.schedule.frequency === 'weekly' && 'Semanal'}
                      {schedule.schedule.frequency === 'monthly' && 'Mensal'}
                    </div>
                  </TableCell>
                  <TableCell>
                    {schedule.nextRun 
                      ? format(schedule.nextRun, 'dd/MM/yyyy HH:mm', { locale: ptBR })
                      : 'N/A'
                    }
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3" />
                      {schedule.recipients.length}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={schedule.isActive}
                      onCheckedChange={() => toggleSchedule(schedule.id)}
                      disabled={loading}
                    />
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => testSchedule(schedule.id)}>
                          <Play className="h-4 w-4 mr-2" />
                          Testar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => deleteSchedule(schedule.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  )
}