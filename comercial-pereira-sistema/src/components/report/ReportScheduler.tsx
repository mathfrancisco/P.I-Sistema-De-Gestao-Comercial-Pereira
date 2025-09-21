'use client'

import { useState } from 'react'
import {
    Clock,
    Mail,
    Plus,
    X,
    Play
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'

import { ReportType, ReportFormat } from '@/types/report'
import { toast } from 'sonner'
import {useReportSchedule} from "@/lib/hooks/useReportSchedule";

interface ReportSchedulerProps {
    reportType: ReportType
    filters: any
}

export function ReportScheduler({ reportType, filters }: ReportSchedulerProps) {
    const { createSchedule, testSchedule } = useReportSchedule()

    const [name, setName] = useState('')
    const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily')
    const [time, setTime] = useState('09:00')
    const [dayOfWeek, setDayOfWeek] = useState(1)
    const [dayOfMonth, setDayOfMonth] = useState(1)
    const [recipients, setRecipients] = useState<string[]>([])
    const [emailInput, setEmailInput] = useState('')
    const [format, setFormat] = useState<ReportFormat>('pdf')
    const [isActive, setIsActive] = useState(true)

    const addRecipient = () => {
        const email = emailInput.trim()
        if (!email) return

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast.error('Email inválido')
            return
        }

        if (recipients.includes(email)) {
            toast.error('Email já adicionado')
            return
        }

        setRecipients([...recipients, email])
        setEmailInput('')
    }

    const removeRecipient = (email: string) => {
        setRecipients(recipients.filter(r => r !== email))
    }

    const handleSubmit = async () => {
        if (!name) {
            toast.error('Digite o nome do agendamento')
            return
        }

        if (recipients.length === 0) {
            toast.error('Adicione pelo menos um destinatário')
            return
        }

        await createSchedule({
            name,
            type: reportType,
            filters,
            frequency,
            time,
            dayOfWeek: frequency === 'weekly' ? dayOfWeek : undefined,
            dayOfMonth: frequency === 'monthly' ? dayOfMonth : undefined,
            recipients,
            format,
            isActive
        })

        // Reset form
        setName('')
        setRecipients([])
        setEmailInput('')
    }

    const handleTest = async () => {
        if (recipients.length === 0) {
            toast.error('Adicione destinatários para testar')
            return
        }
        await testSchedule(1) // Mock ID
    }

    return (
        <Card className="p-6">
            <h3 className="text-lg font-semibold mb-6">Agendar Relatório</h3>

            <div className="space-y-4">
                {/* Nome */}
                <div>
                    <Label>Nome do Agendamento</Label>
                    <Input
                        placeholder="Ex: Relatório Semanal de Vendas"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1"
                    />
                </div>

                {/* Frequência e Horário */}
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label>Frequência</Label>
                        <Select value={frequency} onValueChange={(v: any) => setFrequency(v)}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="daily">Diário</SelectItem>
                                <SelectItem value="weekly">Semanal</SelectItem>
                                <SelectItem value="monthly">Mensal</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Label>Horário</Label>
                        <Input
                            type="time"
                            value={time}
                            onChange={(e) => setTime(e.target.value)}
                            className="mt-1"
                        />
                    </div>
                </div>

                {/* Dia específico */}
                {frequency === 'weekly' && (
                    <div>
                        <Label>Dia da Semana</Label>
                        <Select value={dayOfWeek.toString()} onValueChange={(v) => setDayOfWeek(parseInt(v))}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="0">Domingo</SelectItem>
                                <SelectItem value="1">Segunda</SelectItem>
                                <SelectItem value="2">Terça</SelectItem>
                                <SelectItem value="3">Quarta</SelectItem>
                                <SelectItem value="4">Quinta</SelectItem>
                                <SelectItem value="5">Sexta</SelectItem>
                                <SelectItem value="6">Sábado</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {frequency === 'monthly' && (
                    <div>
                        <Label>Dia do Mês</Label>
                        <Select value={dayOfMonth.toString()} onValueChange={(v) => setDayOfMonth(parseInt(v))}>
                            <SelectTrigger className="mt-1">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {[...Array(31)].map((_, i) => (
                                    <SelectItem key={i + 1} value={(i + 1).toString()}>
                                        Dia {i + 1}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                )}

                {/* Destinatários */}
                <div>
                    <Label>Destinatários</Label>
                    <div className="flex gap-2 mt-1">
                        <Input
                            type="email"
                            placeholder="email@exemplo.com"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRecipient())}
                        />
                        <Button type="button" onClick={addRecipient}>
                            <Plus className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                        {recipients.map(email => (
                            <Badge key={email} variant="secondary" className="pr-1">
                                <span>{email}</span>
                                <button
                                    onClick={() => removeRecipient(email)}
                                    className="ml-2 hover:text-destructive"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </Badge>
                        ))}
                    </div>
                </div>

                {/* Formato */}
                <div>
                    <Label>Formato</Label>
                    <Select value={format} onValueChange={(v: any) => setFormat(v)}>
                        <SelectTrigger className="mt-1">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="pdf">PDF</SelectItem>
                            <SelectItem value="excel">Excel</SelectItem>
                            <SelectItem value="csv">CSV</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Ativo */}
                <div className="flex items-center justify-between">
                    <Label>Ativo</Label>
                    <Switch checked={isActive} onCheckedChange={setIsActive} />
                </div>

                {/* Ações */}
                <div className="flex gap-2 pt-4">
                    <Button variant="outline" onClick={handleTest}>
                        <Play className="h-4 w-4 mr-2" />
                        Testar
                    </Button>
                    <Button onClick={handleSubmit} className="flex-1">
                        <Clock className="h-4 w-4 mr-2" />
                        Criar Agendamento
                    </Button>
                </div>
            </div>
        </Card>
    )
}
