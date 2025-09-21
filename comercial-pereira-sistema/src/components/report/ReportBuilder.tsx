'use client'

import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import {
    GripVertical,
    Plus,
    X,
    Settings,
    Eye,
    Save
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { ReportType } from '@/types/report'

interface Field {
    id: string
    name: string
    label: string
    type: 'metric' | 'dimension' | 'filter'
    aggregation?: 'sum' | 'avg' | 'count' | 'min' | 'max'
}

interface ReportBuilderProps {
    reportType: ReportType
    onSave?: (config: any) => void
    onPreview?: (config: any) => void
}

const AVAILABLE_FIELDS: Record<ReportType, Field[]> = {
    sales: [
        { id: 'revenue', name: 'revenue', label: 'Receita', type: 'metric' },
        { id: 'quantity', name: 'quantity', label: 'Quantidade', type: 'metric' },
        { id: 'date', name: 'date', label: 'Data', type: 'dimension' },
        { id: 'vendor', name: 'vendor', label: 'Vendedor', type: 'dimension' },
        { id: 'customer', name: 'customer', label: 'Cliente', type: 'dimension' },
        { id: 'status', name: 'status', label: 'Status', type: 'filter' }
    ],
    products: [
        { id: 'stock', name: 'stock', label: 'Estoque', type: 'metric' },
        { id: 'value', name: 'value', label: 'Valor', type: 'metric' },
        { id: 'category', name: 'category', label: 'Categoria', type: 'dimension' },
        { id: 'supplier', name: 'supplier', label: 'Fornecedor', type: 'dimension' },
        { id: 'status', name: 'status', label: 'Status', type: 'filter' }
    ],
    financial: [
        { id: 'revenue', name: 'revenue', label: 'Receita', type: 'metric' },
        { id: 'costs', name: 'costs', label: 'Custos', type: 'metric' },
        { id: 'profit', name: 'profit', label: 'Lucro', type: 'metric' },
        { id: 'period', name: 'period', label: 'Período', type: 'dimension' },
        { id: 'method', name: 'method', label: 'Método', type: 'dimension' }
    ],
    customers: [
        { id: 'count', name: 'count', label: 'Total', type: 'metric' },
        { id: 'revenue', name: 'revenue', label: 'Receita', type: 'metric' },
        { id: 'type', name: 'type', label: 'Tipo', type: 'dimension' },
        { id: 'location', name: 'location', label: 'Localização', type: 'dimension' },
        { id: 'active', name: 'active', label: 'Ativo', type: 'filter' }
    ],
    inventory: [
        { id: 'quantity', name: 'quantity', label: 'Quantidade', type: 'metric' },
        { id: 'value', name: 'value', label: 'Valor', type: 'metric' },
        { id: 'category', name: 'category', label: 'Categoria', type: 'dimension' },
        { id: 'location', name: 'location', label: 'Local', type: 'dimension' },
        { id: 'status', name: 'status', label: 'Status', type: 'filter' }
    ]
}

export function ReportBuilder({ reportType, onSave, onPreview }: ReportBuilderProps) {
    const [reportName, setReportName] = useState('')
    const [selectedFields, setSelectedFields] = useState<Field[]>([])
    const [autoRefresh, setAutoRefresh] = useState(false)
    const [refreshInterval, setRefreshInterval] = useState('30')

    const availableFields = AVAILABLE_FIELDS[reportType]

    const handleDragEnd = (result: any) => {
        if (!result.destination) return

        const items = Array.from(selectedFields)
        const [reorderedItem] = items.splice(result.source.index, 1)
        items.splice(result.destination.index, 0, reorderedItem)

        setSelectedFields(items)
    }

    const addField = (field: Field) => {
        if (selectedFields.find(f => f.id === field.id)) {
            toast.error('Campo já adicionado')
            return
        }
        setSelectedFields([...selectedFields, field])
    }

    const removeField = (fieldId: string) => {
        setSelectedFields(selectedFields.filter(f => f.id !== fieldId))
    }

    const handleSave = () => {
        if (!reportName) {
            toast.error('Digite o nome do relatório')
            return
        }

        const config = {
            name: reportName,
            type: reportType,
            fields: selectedFields,
            settings: {
                autoRefresh,
                refreshInterval: autoRefresh ? parseInt(refreshInterval) : null
            }
        }

        onSave?.(config)
        toast.success('Relatório salvo!')
    }

    const handlePreview = () => {
        const config = {
            name: reportName || 'Preview',
            type: reportType,
            fields: selectedFields
        }
        onPreview?.(config)
    }

    return (
        <div className="grid grid-cols-12 gap-6">
            {/* Painel de Campos */}
            <div className="col-span-3">
                <Card className="p-4">
                    <h3 className="font-semibold mb-4">Campos Disponíveis</h3>
                    <div className="space-y-2">
                        {availableFields.map(field => (
                            <div
                                key={field.id}
                                onClick={() => addField(field)}
                                className="p-2 border rounded hover:bg-gray-50 cursor-pointer flex items-center justify-between"
                            >
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${
                                        field.type === 'metric' ? 'bg-blue-500' :
                                            field.type === 'dimension' ? 'bg-green-500' :
                                                'bg-yellow-500'
                                    }`} />
                                    <span className="text-sm">{field.label}</span>
                                </div>
                                <Plus className="h-4 w-4" />
                            </div>
                        ))}
                    </div>
                </Card>
            </div>

            {/* Área Central */}
            <div className="col-span-6">
                <Card className="p-6">
                    <div className="mb-4">
                        <Label>Nome do Relatório</Label>
                        <Input
                            placeholder="Ex: Vendas Mensais"
                            value={reportName}
                            onChange={(e) => setReportName(e.target.value)}
                            className="mt-1"
                        />
                    </div>

                    <Tabs defaultValue="fields">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="fields">Campos</TabsTrigger>
                            <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>

                        <TabsContent value="fields" className="mt-4">
                            <DragDropContext onDragEnd={handleDragEnd}>
                                <Droppable droppableId="selected-fields">
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="min-h-[400px] space-y-2"
                                        >
                                            {selectedFields.length === 0 ? (
                                                <div className="border-2 border-dashed rounded p-12 text-center text-muted-foreground">
                                                    Arraste campos aqui
                                                </div>
                                            ) : (
                                                selectedFields.map((field, index) => (
                                                    <Draggable key={field.id} draggableId={field.id} index={index}>
                                                        {(provided) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                className="p-3 border rounded bg-white flex items-center justify-between"
                                                            >
                                                                <div className="flex items-center gap-3">
                                                                    <div {...provided.dragHandleProps}>
                                                                        <GripVertical className="h-4 w-4 text-gray-400" />
                                                                    </div>
                                                                    <span className="font-medium">{field.label}</span>
                                                                    RBadge variant="outline" className="text-xs">
                                                                        {field.type}
                                                                    </Badge>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    variant="ghost"
                                                                    onClick={() => removeField(field.id)}
                                                                >
                                                                    <X className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </DragDropContext>
                        </TabsContent>

                        <TabsContent value="preview">
                            <div className="min-h-[400px] border rounded p-6 bg-gray-50">
                                <p className="text-center text-muted-foreground">
                                    Preview do relatório aparecerá aqui
                                </p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </Card>
            </div>

            {/* Configurações */}
            <div className="col-span-3">
                <Card className="p-4">
                    <h3 className="font-semibold mb-4 flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Configurações
                    </h3>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label>Auto-atualização</Label>
                                <Switch
                                    checked={autoRefresh}
                                    onCheckedChange={setAutoRefresh}
                                />
                            </div>

                            {autoRefresh && (
                                <div>
                                    <Label>Intervalo (min)</Label>
                                    <Input
                                        type="number"
                                        value={refreshInterval}
                                        onChange={(e) => setRefreshInterval(e.target.value)}
                                        className="mt-1"
                                    />
                                </div>
                            )}
                        </div>

                        <div className="pt-4 border-t space-y-2">
                            <Button
                                className="w-full"
                                variant="outline"
                                onClick={handlePreview}
                            >
                                <Eye className="h-4 w-4 mr-2" />
                                Visualizar
                            </Button>
                            <Button
                                className="w-full"
                                onClick={handleSave}
                            >
                                <Save className="h-4 w-4 mr-2" />
                                Salvar Template
                            </Button>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    )
}