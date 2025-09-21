'use client'

import { motion } from 'framer-motion'
import {
    TrendingUp,
    Package,
    DollarSign,
    Users,
    Archive,
    ChevronRight,
    FileText,
    Clock
} from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ReportType, REPORT_TITLES, REPORT_DESCRIPTIONS } from '@/types/report'
import {useReports} from "@/lib/hooks/useReports";


interface ReportCategoryGridProps {
    onCategorySelect: (type: ReportType) => void
}

const REPORT_ICONS: Record<ReportType, React.ElementType> = {
    sales: TrendingUp,
    products: Package,
    financial: DollarSign,
    customers: Users,
    inventory: Archive
}

const REPORT_COLORS: Record<ReportType, string> = {
    sales: 'from-blue-500 to-blue-600',
    products: 'from-purple-500 to-purple-600',
    financial: 'from-green-500 to-green-600',
    customers: 'from-orange-500 to-orange-600',
    inventory: 'from-indigo-500 to-indigo-600'
}

// Mock data para demonstração
const REPORT_STATS: Record<ReportType, { count: number; lastGenerated: string }> = {
    sales: { count: 15, lastGenerated: 'Há 2 horas' },
    products: { count: 8, lastGenerated: 'Ontem' },
    financial: { count: 12, lastGenerated: 'Há 3 dias' },
    customers: { count: 5, lastGenerated: 'Semana passada' },
    inventory: { count: 10, lastGenerated: 'Hoje' }
}

export function ReportCategoryGrid({ onCategorySelect }: ReportCategoryGridProps) {
    const { reports, loading } = useReports()

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(5)].map((_, i) => (
                    <Card key={i} className="p-6 animate-pulse">
                        <div className="h-32 bg-gray-200 rounded" />
                    </Card>
                ))}
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reports.map((report) => {
                const Icon = REPORT_ICONS[report.type]
                const stats = REPORT_STATS[report.type]

                return (
                    <motion.div
                        key={report.type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card
                            className="relative overflow-hidden cursor-pointer hover:shadow-xl transition-shadow"
                            onClick={() => onCategorySelect(report.type)}
                        >
                            {/* Gradient Background */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${REPORT_COLORS[report.type]} opacity-5`} />

                            <div className="relative p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`p-3 rounded-lg bg-gradient-to-br ${REPORT_COLORS[report.type]}`}>
                                        <Icon className="h-6 w-6 text-white" />
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-muted-foreground" />
                                </div>

                                {/* Content */}
                                <h3 className="font-semibold text-lg mb-2">{report.title}</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    {report.description}
                                </p>

                                {/* Stats */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Disponíveis
                    </span>
                                        <Badge variant="secondary">{stats.count}</Badge>
                                    </div>

                                    <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2 text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      Último
                    </span>
                                        <span className="font-medium">{stats.lastGenerated}</span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <Button className="w-full mt-4" variant="outline">
                                    Acessar Relatórios
                                </Button>
                            </div>
                        </Card>
                    </motion.div>
                )
            })}
        </div>
    )
}