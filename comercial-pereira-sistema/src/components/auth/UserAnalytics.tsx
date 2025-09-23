import {Skeleton} from "@/components/ui/loading";
import React from "react";
import {Crown, UserCheck, Users, UserX} from "lucide-react";

interface UserAnalyticsPanelProps {
    statistics: {
        total: number;
        active: number;
        inactive: number;
        byRole: Record<string, number>;
    };
    loading?: boolean;
}

export const UserAnalyticsPanel: React.FC<UserAnalyticsPanelProps> = ({
                                                                          statistics,
                                                                          loading = false
                                                                      }) => {
    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
                        <Skeleton lines={3} />
                    </div>
                ))}
            </div>
        );
    }

    const cards = [
        {
            title: 'Total de Usuários',
            value: statistics.total || 0,
            icon: Users,
            color: 'text-blue-600',
            bgColor: 'bg-blue-100'
        },
        {
            title: 'Usuários Ativos',
            value: statistics.active || 0,
            icon: UserCheck,
            color: 'text-green-600',
            bgColor: 'bg-green-100'
        },
        {
            title: 'Usuários Inativos',
            value: statistics.inactive || 0,
            icon: UserX,
            color: 'text-red-600',
            bgColor: 'bg-red-100'
        },
        {
            title: 'Administradores',
            value: statistics.byRole?.ADMIN || 0,
            icon: Crown,
            color: 'text-purple-600',
            bgColor: 'bg-purple-100'
        }
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {cards.map((card, index) => (
                <div key={index} className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-600">{card.title}</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">{card.value}</p>
                        </div>
                        <div className={`w-12 h-12 ${card.bgColor} rounded-lg flex items-center justify-center`}>
                            <card.icon className={`w-6 h-6 ${card.color}`} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};