import React, { useState } from 'react';
import {
    Grid, LayoutDashboard, Package, Receipt, Users, BarChart3,
    Settings, HelpCircle, Moon, Sun, ChevronDown, ChevronRight,
    ShoppingCart, Warehouse, FileText, UserPlus, Menu, X,
    Bell, AlertCircle
} from 'lucide-react';

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
    icon: React.ComponentType<{ className?: string }>;
    href: string;
    badge?: number;
    children?: MenuItem[];
    isSection?: boolean;
}

interface SidebarProps {
    isCollapsed?: boolean;
    onToggle?: () => void;
    user?: User;
    activeItem?: string;
    onItemClick?: (href: string) => void;
    className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
                                                            isCollapsed = false,
                                                            onToggle,
                                                            user = { id: '1', name: 'João Silva', email: 'joao@exemplo.com', role: 'Administrador' },
                                                            activeItem = '/dashboard',
                                                            onItemClick,
                                                            className = ''
                                                        }) => {
    const [expandedItems, setExpandedItems] = useState<string[]>(['general', 'sales', 'people']);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [showTooltip, setShowTooltip] = useState<string | null>(null);

    // Estrutura de menu corrigida com navegação funcional
    const menuItems: MenuItem[] = [
        {
            id: 'general',
            label: 'GERAL',
            icon: Grid,
            href: '',
            isSection: true,
            children: [
                {
                    id: 'dashboard',
                    label: 'Dashboard',
                    icon: LayoutDashboard,
                    href: '/dashboard'
                }
            ]
        },
        {
            id: 'catalog',
            label: 'CATÁLOGO',
            icon: Package,
            href: '',
            isSection: true,
            children: [
                {
                    id: 'produtos',
                    label: 'Produtos',
                    icon: Package,
                    href: '/produtos'
                },
                {
                    id: 'categorias',
                    label: 'Categorias',
                    icon: Grid,
                    href: '/categorias'
                }
            ]
        },
        {
            id: 'sales',
            label: 'VENDAS',
            icon: ShoppingCart,
            href: '',
            isSection: true,
            children: [
                {
                    id: 'vendas',
                    label: 'Todas Vendas',
                    icon: Receipt,
                    href: '/vendas'
                },
                {
                    id: 'nova-venda',
                    label: 'Nova Venda',
                    icon: Receipt,
                    href: '/vendas/nova'
                },
                {
                    id: 'pdv',
                    label: 'PDV',
                    icon: ShoppingCart,
                    href: '/vendas/pdv'
                }
            ]
        },
        {
            id: 'inventory',
            label: 'ESTOQUE',
            icon: Warehouse,
            href: '',
            isSection: true,
            children: [
                {
                    id: 'estoque',
                    label: 'Controle de Estoque',
                    icon: Package,
                    href: '/estoque'
                },
                {
                    id: 'movimentacoes',
                    label: 'Movimentações',
                    icon: FileText,
                    href: '/estoque/movimentacoes'
                },
                {
                    id: 'alertas',
                    label: 'Alertas',
                    icon: AlertCircle,
                    href: '/estoque/alertas',
                    badge: 3
                }
            ]
        },
        {
            id: 'people',
            label: 'PESSOAS',
            icon: Users,
            href: '',
            isSection: true,
            children: [
                {
                    id: 'clientes',
                    label: 'Clientes',
                    icon: Users,
                    href: '/clientes'
                },
                {
                    id: 'fornecedores',
                    label: 'Fornecedores',
                    icon: Users,
                    href: '/fornecedores'
                },
                {
                    id: 'usuarios',
                    label: 'Usuários',
                    icon: Users,
                    href: '/usuarios'
                }
            ]
        },
        {
            id: 'reports',
            label: 'RELATÓRIOS',
            icon: BarChart3,
            href: '',
            isSection: true,
            children: [
                {
                    id: 'relatorios',
                    label: 'Todos Relatórios',
                    icon: BarChart3,
                    href: '/relatorios'
                },
                {
                    id: 'construtor',
                    label: 'Construtor de Relatórios',
                    icon: Settings,
                    href: '/relatorios/builder'
                }
            ]
        },
        {
            id: 'tools',
            label: 'FERRAMENTAS',
            icon: Settings,
            href: '',
            isSection: true,
            children: [
                {
                    id: 'configuracoes',
                    label: 'Configurações',
                    icon: Settings,
                    href: '/configuracoes'
                },
                {
                    id: 'ajuda',
                    label: 'Ajuda e Suporte',
                    icon: HelpCircle,
                    href: '/ajuda'
                }
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

    // Lógica corrigida de navegação
    const handleItemClick = (item: MenuItem, e?: React.MouseEvent) => {
        e?.preventDefault();

        const hasChildren = item.children && item.children.length > 0;
        const isSection = item.isSection;

        if (hasChildren || isSection) {
            // Se tem filhos ou é seção, toggle expansão
            toggleExpanded(item.id);
        } else if (item.href && item.href !== '') {
            // Se tem href válido, navegar
            if (onItemClick) {
                onItemClick(item.href);
            } else {
                // Fallback: usar window.location se não tem callback
                console.log('Navegando para:', item.href);
                // window.location.href = item.href; // Descomentarr para navegação real
            }
        }
    };

    const renderMenuItem = (item: MenuItem, level = 0) => {
        const isActive = activeItem === item.href;
        const isExpanded = expandedItems.includes(item.id);
        const hasChildren = item.children && item.children.length > 0;
        const isSection = item.isSection;

        return (
            <div key={item.id} className="relative">
                {isSection && level === 0 ? (
                    // Header de seção
                    <div className="px-6 py-3 flex items-center justify-between">
                        {!isCollapsed && (
                            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                {item.label}
                            </span>
                        )}
                        {hasChildren && (
                            <button
                                onClick={() => toggleExpanded(item.id)}
                                className="p-1 rounded hover:bg-gray-100 transition-colors"
                            >
                                <ChevronRight
                                    className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
                                        isExpanded ? 'rotate-90' : ''
                                    }`}
                                />
                            </button>
                        )}
                    </div>
                ) : (
                    // Item normal do menu
                    <div
                        className="relative"
                        onMouseEnter={() => isCollapsed && setShowTooltip(item.id)}
                        onMouseLeave={() => setShowTooltip(null)}
                    >
                        <button
                            onClick={(e) => handleItemClick(item, e)}
                            className={`
                                w-full flex items-center px-6 py-3 text-left transition-all duration-200
                                hover:bg-blue-50 hover:text-blue-600 hover:border-r-2 hover:border-blue-600
                                ${isActive ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600 font-medium' : 'text-gray-700'}
                                ${level > 0 ? 'pl-12' : ''}
                                ${isCollapsed ? 'justify-center px-3' : ''}
                            `}
                        >
                            <item.icon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'} flex-shrink-0`} />

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
                                            className={`w-4 h-4 ml-2 transition-transform duration-200 ${
                                                isExpanded ? 'rotate-90' : ''
                                            }`}
                                        />
                                    )}
                                </>
                            )}
                        </button>

                        {/* Tooltip para modo colapsado */}
                        {isCollapsed && showTooltip === item.id && (
                            <div className="absolute left-full top-1/2 transform -translate-y-1/2 ml-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg shadow-lg z-50 whitespace-nowrap">
                                {item.label}
                                {item.badge && (
                                    <span className="ml-2 px-2 py-1 text-xs bg-red-500 text-white rounded-full">
                                        {item.badge}
                                    </span>
                                )}
                                <div className="absolute right-full top-1/2 transform -translate-y-1/2 w-0 h-0 border-4 border-transparent border-r-gray-900"></div>
                            </div>
                        )}
                    </div>
                )}

                {/* Submenu */}
                {hasChildren && (isExpanded || (isSection && isExpanded)) && (
                    <div className={`${isCollapsed ? 'hidden' : ''}`}>
                        {item.children?.map(child => renderMenuItem(child, level + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className={`
            h-screen bg-white border-r border-gray-200 flex flex-col transition-all duration-300 shadow-lg
            ${isCollapsed ? 'w-16' : 'w-70'}
            ${className}
        `}>
            {/* Header */}
            <div className="h-16 px-4 flex items-center justify-center border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
                {!isCollapsed ? (
                    <div className="text-center">
                        <h1 className="font-bold text-lg text-white">Comercial Pereira</h1>
                        <p className="text-xs text-blue-100">Sistema de Gestão</p>
                    </div>
                ) : (
                    <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                        <span className="text-blue-600 font-bold text-sm">CP</span>
                    </div>
                )}

                {/* Toggle button */}
                {onToggle && (
                    <button
                        onClick={onToggle}
                        className="absolute top-4 -right-3 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-md hover:shadow-lg transition-all duration-200"
                    >
                        {isCollapsed ? (
                            <Menu className="w-3 h-3 text-gray-600" />
                        ) : (
                            <X className="w-3 h-3 text-gray-600" />
                        )}
                    </button>
                )}
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
                <nav>
                    {menuItems.map(section => (
                        <div key={section.id} className="mb-2">
                            {renderMenuItem(section)}
                        </div>
                    ))}
                </nav>

                {/* Dark Mode Toggle */}
                <div className="px-4 py-3 border-t border-gray-100 mt-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`
                            w-full flex items-center text-gray-600 hover:text-gray-900 hover:bg-gray-50 
                            transition-colors duration-200 p-2 rounded-lg
                            ${isCollapsed ? 'justify-center' : ''}
                        `}
                    >
                        {isDarkMode ? (
                            <Sun className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                        ) : (
                            <Moon className={`w-5 h-5 ${isCollapsed ? '' : 'mr-3'}`} />
                        )}
                        {!isCollapsed && <span>Modo {isDarkMode ? 'Claro' : 'Escuro'}</span>}
                    </button>
                </div>
            </div>

            {/* User Footer */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
                <div className="flex items-center">
                    <div className="relative">
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <span className="text-white font-medium text-sm">
                                    {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                </span>
                            )}
                        </div>
                        {/* Status online */}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>

                    {!isCollapsed && (
                        <>
                            <div className="ml-3 flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{user.name}</p>
                                <p className="text-xs text-gray-500 truncate">{user.role}</p>
                            </div>
                            <button className="p-1 hover:bg-gray-200 rounded transition-colors">
                                <ChevronDown className="w-4 h-4 text-gray-400" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};