import { useState, useCallback, useEffect } from 'react'
import { toast } from 'sonner'
import { ReportTemplate } from '@/types/report'

interface UseReportTemplatesReturn {
    templates: ReportTemplate[]
    loading: boolean
    fetchTemplates: () => Promise<void>
    saveTemplate: (template: Omit<ReportTemplate, 'id' | 'createdAt' | 'usageCount'>) => Promise<void>
    deleteTemplate: (id: number) => Promise<void>
    useTemplate: (id: number) => Promise<ReportTemplate>
}

export function useReportTemplates(): UseReportTemplatesReturn {
    const [templates, setTemplates] = useState<ReportTemplate[]>([])
    const [loading, setLoading] = useState(false)

    // Buscar templates
    const fetchTemplates = useCallback(async () => {
        try {
            setLoading(true)

            // Simular busca - em produção seria GET da API
            await new Promise(resolve => setTimeout(resolve, 500))

            // Mock data
            const mockTemplates: ReportTemplate[] = [
                {
                    id: 1,
                    name: 'Vendas Mensais Detalhado',
                    description: 'Relatório completo de vendas com análise por vendedor e produto',
                    type: 'sales',
                    filters: {
                        type: 'sales',
                        period: 'thisMonth',
                        includeDetails: true
                    },
                    isPublic: true,
                    createdBy: 'admin@example.com',
                    createdAt: new Date('2025-01-01'),
                    usageCount: 45
                },
                {
                    id: 2,
                    name: 'Estoque Crítico',
                    description: 'Produtos com estoque abaixo do mínimo',
                    type: 'inventory',
                    filters: {
                        type: 'inventory',
                        includeDetails: true
                    },
                    isPublic: true,
                    createdBy: 'admin@example.com',
                    createdAt: new Date('2025-01-05'),
                    usageCount: 23
                }
            ]

            setTemplates(mockTemplates)
        } catch (err) {
            toast.error('Erro ao buscar templates')
        } finally {
            setLoading(false)
        }
    }, [])

    // Salvar template
    const saveTemplate = useCallback(async (
        template: Omit<ReportTemplate, 'id' | 'createdAt' | 'usageCount'>
    ) => {
        try {
            setLoading(true)

            await new Promise(resolve => setTimeout(resolve, 1000))

            const newTemplate: ReportTemplate = {
                ...template,
                id: Date.now(),
                createdAt: new Date(),
                usageCount: 0
            }

            setTemplates(prev => [...prev, newTemplate])
            toast.success('Template salvo com sucesso!')
        } catch (err) {
            toast.error('Erro ao salvar template')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Deletar template
    const deleteTemplate = useCallback(async (id: number) => {
        try {
            setLoading(true)

            await new Promise(resolve => setTimeout(resolve, 500))

            setTemplates(prev => prev.filter(t => t.id !== id))
            toast.success('Template removido!')
        } catch (err) {
            toast.error('Erro ao remover template')
            throw err
        } finally {
            setLoading(false)
        }
    }, [])

    // Usar template
    const useTemplate = useCallback(async (id: number): Promise<ReportTemplate> => {
        const template = templates.find(t => t.id === id)

        if (!template) {
            throw new Error('Template não encontrado')
        }

        // Incrementar contador de uso
        setTemplates(prev => prev.map(t =>
            t.id === id
                ? { ...t, usageCount: t.usageCount + 1 }
                : t
        ))

        toast.success('Template carregado!')
        return template
    }, [templates])

    // Carregar templates ao montar
    useEffect(() => {
        fetchTemplates()
    }, [fetchTemplates])

    return {
        templates,
        loading,
        fetchTemplates,
        saveTemplate,
        deleteTemplate,
        useTemplate
    }
}