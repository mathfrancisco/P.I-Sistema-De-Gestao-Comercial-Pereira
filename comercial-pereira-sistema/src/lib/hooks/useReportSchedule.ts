import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { ScheduledReport, ReportType, ReportFormat } from '@/types/report'

interface ScheduleFormData {
    name: string
    type: ReportType
    filters: any
    frequency: 'daily' | 'weekly' | 'monthly'
    time: string
    dayOfWeek?: number
    dayOfMonth?: number
    recipients: string[]
    format: ReportFormat
    isActive: boolean
}

interface UseReportScheduleReturn {
    schedules: ScheduledReport[]
    loading: boolean
    createSchedule: (data: ScheduleFormData) => Promise<void>
    updateSchedule: (id: number, data: Partial<ScheduleFormData>) => Promise<void>
    deleteSchedule: (id: number) => Promise<void>
    toggleSchedule: (id: number) => Promise<void>
    testSchedule: (id: number) => Promise<void>
    fetchSchedules: () => Promise<void>
}

export function useReportSchedule(): UseReportScheduleReturn {
    const [schedules, setSchedules] = useState<ScheduledReport[]>([])
    const [loading, setLoading] = useState(false)

    // Buscar agendamentos
    const fetchSchedules = useCallback(async () => {
        try {
            setLoading(true)

            // Simular busca - em produção seria uma chamada à API
            await new Promise(resolve => setTimeout(resolve, 500))

            // Mock data
            const mockSchedules: ScheduledReport[] = []
            setSchedules(mockSchedules)
        } catch (err) {
            toast.error('Erro ao buscar agendamentos')
        } finally {
            setLoading(false)
        }
    }, [])

    // Criar agendamento
    const createSchedule = useCallback(async (data: ScheduleFormData) => {
        try {
            setLoading(true)

            // Simular criação - em produção seria POST para API
            await new Promise(resolve => setTimeout(resolve, 1000))

            const newSchedule: ScheduledReport = {
                id: Date.now(),
                name: data.name,
                type: data.type,
                filters: data.filters,
                schedule: {
                    frequency: data.frequency,
                    time: data.time,
                    dayOfWeek: data.dayOfWeek,
                    dayOfMonth: data.dayOfMonth
                },
                recipients: data.recipients,
                format: data.format,
                isActive: data.isActive,
                createdAt: new Date(),
                updatedAt: new Date()
            }

            setSchedules(prev => [...prev, newSchedule])
            toast.success('Agendamento criado com sucesso!')
        } catch (err) {
            toast.error('Erro ao criar agendamento')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Atualizar agendamento
    const updateSchedule = useCallback(async (id: number, data: Partial<ScheduleFormData>) => {
        try {
            setLoading(true)

            await new Promise(resolve => setTimeout(resolve, 500))

            setSchedules(prev => prev.map(schedule => {
                if (schedule.id === id) {
                    return {
                        ...schedule,
                        ...data,
                        updatedAt: new Date()
                    }
                }
                return schedule
            }))

            toast.success('Agendamento atualizado!')
        } catch (err) {
            toast.error('Erro ao atualizar agendamento')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Deletar agendamento
    const deleteSchedule = useCallback(async (id: number) => {
        try {
            setLoading(true)

            await new Promise(resolve => setTimeout(resolve, 500))

            setSchedules(prev => prev.filter(s => s.id !== id))
            toast.success('Agendamento removido!')
        } catch (err) {
            toast.error('Erro ao remover agendamento')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Ativar/desativar agendamento
    const toggleSchedule = useCallback(async (id: number) => {
        try {
            setLoading(true)

            await new Promise(resolve => setTimeout(resolve, 500))

            setSchedules(prev => prev.map(schedule => {
                if (schedule.id === id) {
                    return {
                        ...schedule,
                        isActive: !schedule.isActive,
                        updatedAt: new Date()
                    }
                }
                return schedule
            }))

            toast.success('Status do agendamento atualizado!')
        } catch (err) {
            toast.error('Erro ao alterar status')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Testar agendamento
    const testSchedule = useCallback(async (id: number) => {
        try {
            setLoading(true)
            toast.info('Enviando relatório de teste...')

            await new Promise(resolve => setTimeout(resolve, 2000))

            toast.success('Relatório de teste enviado! Verifique seu email.')
        } catch (err) {
            toast.error('Erro ao enviar teste')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Carregar agendamentos ao montar
    useEffect(() => {
        fetchSchedules()
    }, [fetchSchedules])

    return {
        schedules,
        loading,
        createSchedule,
        updateSchedule,
        deleteSchedule,
        toggleSchedule,
        testSchedule,
        fetchSchedules
    }
}