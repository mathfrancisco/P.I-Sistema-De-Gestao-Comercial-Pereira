import React, { useState } from 'react';
import {
    Grid, LayoutDashboard, Package, Receipt, Users, BarChart3,
    Settings, HelpCircle, Moon, Sun, ChevronDown, ChevronRight
} from 'lucide-react';
import {cn} from "@/lib/utils/utils";

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface MenuItem {
    id: string;
    label: string;
    icon: React.ComponentType;
    href: string;
    badge?: number;
    children?: MenuItem[];
}


interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    user?: User;
    activeItem?: string;
    onItemClick?: (href: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
                                                    isCollapsed = false,
                                                    onToggle,
                                                    user = { id: '1', name: 'João Silva', email: 'joao@exemplo.com', role: 'Administrador' },
                                                    activeItem = '/dashboard',
                                                    onItemClick
                                                }) => {
    const [expandedItems, setExpandedItems] = useState<string[]>([]);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const menuItems: MenuItem[] = [
        {
            id: 'general',
            label: 'GENERAL',
            icon: Grid,
            href: '',
            children: [
                { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
                {
                    id: 'produtos',
                    label: 'Produtos',
                    icon: Package,
                    href: '/produtos',
                    children: [
                        { id: 'todos-produtos', label: 'Todos Produtos', icon: Package, href: '/produtos' },
                        { id: 'categorias', label: 'Categorias', icon: Grid, href: '/produtos/categorias' }
                    ]
                },
                { id: 'transacoes', label: 'Transações', icon: Receipt, href: '/transacoes', badge: 12 },
                { id: 'clientes', label: 'Clientes', icon: Users, href: '/clientes' },
                { id: 'relatorios', label: 'Relatórios de Vendas', icon: BarChart3, href: '/relatorios' }
            ]
        },
        {
            id: 'tools',
            label: 'TOOLS',
            icon: Grid,
            href: '',
            children: [
                { id: 'configuracoes', label: 'Configurações da Conta', icon: Settings, href: '/configuracoes' },
                { id: 'ajuda', label: 'Ajuda e Suporte', icon: HelpCircle, href: '/ajuda' }
            ]
        }
    ];

    const toggleExpanded = (itemId: string) => {
        setExpandedItems(prev =>
            prev.includes(itemId)
                ? prev.filter(id => id !== itemId)
                : [...prev, itemId]
        );
    };

    const handleItemClick = (href: string, hasChildren?: boolean, itemId?: string) => {
        if (hasChildren && itemId) {
            toggleExpanded(itemId);
        } else if (href && onItemClick) {
            onItemClick(href);
        }
    };

    const renderMenuItem = (item: MenuItem, level = 0) => {
        const isActive = activeItem === item.href;
        const isExpanded = expandedItems.includes(item.id);
        const hasChildren = item.children && item.children.length > 0;

        return (
            <div key={item.id}>
                {level === 0 && item.label && !item.href ? (
                    <div className="px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        {!isCollapsed && item.label}
                    </div>
                ) : (
                    <button
                        onClick={() => handleItemClick(item.href, hasChildren, item.id)}
                        className={cn(
                            'w-full flex items-center px-6 py-3 text-left transition-all duration-200',
                            'hover:bg-blue-50 hover:text-blue-600',
                            isActive && 'bg-blue-50 text-blue-600 border-r-2 border-blue-600',
                            level > 0 && 'pl-12'
                        )}
                    >
                        {!isCollapsed && (
                            <>
                                <span className="flex-1 font-medium">{item.label}</span>
                                {item.badge && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                    {item.badge > 9 ? '9+' : item.badge}
                  </span>
                                )}
                                {hasChildren && (
                                    <ChevronRight
                                        className={cn(
                                            'w-4 h-4 ml-2 transition-transform duration-200',
                                            isExpanded && 'rotate-90'
                                        )}
                                    />
                                )}
                            </>
                        )}
                    </button>
                )}

                {hasChildren && (isExpanded || isCollapsed) && (
                    <div className={cn(isCollapsed && 'hidden')}>
                        {item.children?.map(child => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={cn(
            'h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300',
            isCollapsed ? 'w-16' : 'w-70'
        )}>
            {/* Header */}
            <div className="h-16 px-6 flex items-center justify-center border-b border-gray-200">
                {!isCollapsed ? (
                    <div className="text-center">
                        <h1 className="font-bold text-xl text-gray-900">Comercial Pereira</h1>
                        <p className="text-xs text-gray-500">Sistema de Gestão</p>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-sm">CP</span>
                    </div>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-4">
                {menuItems.map(section => (
                    <div key={section.id} className="mb-4">
                        {section.children?.map(item => renderMenuItem(item))}
                    </div>
                ))}

                {/* Dark Mode Toggle */}
                <div className="px-6 py-3">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="w-full flex items-center text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        {isDarkMode ? <Sun className="w-5 h-5 mr-3" /> : <Moon className="w-5 h-5 mr-3" />}
                        {!isCollapsed && <span>Toggle Dark Mode</span>}
                    </button>
                </div>
            </div>

            {/* User Footer */}
            <div className="border-t border-gray-200 p-4">
                <div className="flex items-center">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-white font-medium">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
                        )}
                    </div>
                    {!isCollapsed && (
                        <>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.role}</p>
                            </div>
                            <ChevronDown className="w-4 h-4 text-gray-400" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};