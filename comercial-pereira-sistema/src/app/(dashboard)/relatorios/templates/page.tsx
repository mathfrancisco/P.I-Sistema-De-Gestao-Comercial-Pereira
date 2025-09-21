'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { 
  ArrowLeft, 
  Search,
  FileText,
  Star,
  Users,
  Lock,
  Globe,
  Plus,
  MoreVertical,
  Trash2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { REPORT_TITLES } from '@/types/report'
import { toast } from 'sonner'
import { useReportTemplates } from '@/lib/hooks/useReportTemplates'

export default function ReportTemplatesPage() {
  const router = useRouter()
  const { templates, deleteTemplate, useTemplate } = useReportTemplates()
  const [searchTerm, setSearchTerm] = useState('')

  const filteredTemplates = templates.filter(t => 
    t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleUseTemplate = async (id: number) => {
    try {
      const template = await useTemplate(id)
      router.push(`/reports/${template.type}`)
      toast.success('Template carregado com sucesso!')
    } catch (error) {
      toast.error('Erro ao carregar template')
    }
  }

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
            <h1 className="text-2xl font-bold">Templates de Relatórios</h1>
            <p className="text-muted-foreground">
              Use templates prontos ou crie seus próprios
            </p>
          </div>
        </div>

        <Button onClick={() => router.push('/reports/builder')}>
          <Plus className="h-4 w-4 mr-2" />
          Criar Template
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Buscar templates..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="p-4 hover:shadow-lg transition-shadow">
            <div className="space-y-3">
              {/* Header */}
              <div className="flex items-start justify-between">
                <h3 className="font-semibold line-clamp-1">{template.name}</h3>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleUseTemplate(template.id)}>
                      Usar Template
                    </DropdownMenuItem>
                    {!template.isPublic && (
                      <DropdownMenuItem 
                        onClick={() => deleteTemplate(template.id)}
                        className="text-red-600"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Excluir
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Description */}
              <p className="text-sm text-muted-foreground line-clamp-2">
                {template.description}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="outline">
                  {REPORT_TITLES[template.type]}
                </Badge>
                {template.isPublic ? (
                  <Badge variant="secondary">
                    <Globe className="h-3 w-3 mr-1" />
                    Público
                  </Badge>
                ) : (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    Privado
                  </Badge>
                )}
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  {template.usageCount} usos
                </span>
                <span className="text-xs">
                  Por {template.createdBy.split('@')[0]}
                </span>
              </div>

              {/* Action */}
              <Button 
                className="w-full"
                variant="outline"
                onClick={() => handleUseTemplate(template.id)}
              >
                Usar Template
              </Button>
            </div>
          </Card>
        ))}

        {filteredTemplates.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum template encontrado</p>
          </div>
        )}
      </div>
    </div>
  )
}