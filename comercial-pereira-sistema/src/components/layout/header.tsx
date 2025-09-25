import React, { useState, useEffect, useRef } from 'react';
import {
    Bell, ChevronRight, Menu, Search, ShoppingCart, User,
    Settings, LogOut, Moon, Sun, ChevronDown, Package,
    Users, FileText, X, Command
} from 'lucide-react';

interface User {
    id: string;
    name: string;
    email: string;
    role: string;
    avatar?: string;
}

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface SearchResult {
    id: string;
    title: string;
    description: string;
    category: string;
    href: string;
    icon: React.ComponentType<{ className?: string }>;
}

interface HeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    notificationCount?: number;
    user?: User;
    onToggleSidebar?: () => void;
    isDarkMode?: boolean;
    onToggleDarkMode?: () => void;
    showQuickCart?: boolean;
    cartItemCount?: number;
}

export const Header: React.FC<HeaderProps> = ({
                                                          breadcrumbs = [{ label: 'Dashboard' }],
                                                          onSearch,
                                                          searchPlaceholder = "Buscar produtos, clientes...",
                                                          notificationCount = 3,
                                                          user = { id: '1', name: 'João Silva', email: 'joao@exemplo.com', role: 'Admin' },
                                                          onToggleSidebar,
                                                          isDarkMode = false,
                                                          onToggleDarkMode,
                                                          showQuickCart = true,
                                                          cartItemCount = 0
                                                      }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);

    // Mock search results - replace with real API call
    const mockSearchResults: SearchResult[] = [
        {
            id: '1',
            title: 'iPhone 13 Pro',
            description: 'Smartphone Apple com tela de 6.1"',
            category: 'Produtos',
            href: '/produtos/1',
            icon: Package
        },
        {
            id: '2',
            title: 'Maria Silva',
            description: 'Cliente ativa desde 2021',
            category: 'Clientes',
            href: '/clientes/2',
            icon: Users
        },
        {
            id: '3',
            title: 'Relatório de Vendas',
            description: 'Relatório mensal de janeiro',
            category: 'Relatórios',
            href: '/relatorios/vendas-jan',
            icon: FileText
        }
    ];

    // Handle search with debounce
    useEffect(() => {
        const debounceTimer = setTimeout(() => {
            if (searchQuery.length >= 2) {
                // Mock search - replace with real API call
                const filtered = mockSearchResults.filter(item =>
                    item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    item.description.toLowerCase().includes(searchQuery.toLowerCase())
                );
                setSearchResults(filtered);
                setShowSearchResults(true);
            } else {
                setShowSearchResults(false);
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(debounceTimer);
    }, [searchQuery]);

    // Handle search input
    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    // Handle keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                setIsSearchOpen(true);
                searchInputRef.current?.focus();
            }
            if (e.key === 'Escape') {
                setIsSearchOpen(false);
                setShowSearchResults(false);
                setShowUserMenu(false);
                setShowNotifications(false);
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Close menus when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setShowUserMenu(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearchResultClick = (result: SearchResult) => {
        setSearchQuery('');
        setShowSearchResults(false);
        setIsSearchOpen(false);
        // Navigate to result - implement your navigation logic here
        console.log('Navigating to:', result.href);
    };

    const clearSearch = () => {
        setSearchQuery('');
        setShowSearchResults(false);
    };

    const notifications = [
        {
            id: 1,
            title: 'Nova venda registrada',
            description: 'Pedido #1234 foi criado por Maria Silva',
            time: '2 min atrás',
            type: 'success'
        },
        {
            id: 2,
            title: 'Estoque baixo',
            description: 'iPhone 13 Pro com apenas 3 unidades',
            time: '1 hora atrás',
            type: 'warning'
        },
        {
            id: 3,
            title: 'Relatório disponível',
            description: 'Relatório mensal de vendas foi gerado',
            time: '3 horas atrás',
            type: 'info'
        }
    ];

    return (
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 flex items-center justify-between relative z-40">
            {/* Left Section - Breadcrumb */}
            <div className="flex items-center flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 mr-4 md:hidden transition-colors"
                >
                    <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                <nav className="flex items-center text-sm">
                    {breadcrumbs.map((item, index) => (
                        <div key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
                            {item.href ? (
                                <button
                                    className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                    onClick={() => console.log('Navigate to:', item.href)}
                                >
                                    {item.label}
                                </button>
                            ) : (
                                <span className="font-medium text-gray-900 dark:text-gray-100">{item.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-md mx-8 hidden md:block relative">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-20 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                 focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                 placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200"
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
                        {searchQuery && (
                            <button
                                onClick={clearSearch}
                                className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                            >
                                <X className="w-3 h-3 text-gray-400" />
                            </button>
                        )}
                        <kbd className="hidden sm:inline-flex items-center px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 rounded">
                            <Command className="w-3 h-3 mr-1" />K
                        </kbd>
                    </div>
                </div>

                {/* Search Results Dropdown */}
                {showSearchResults && searchResults.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                        <div className="p-2">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2 px-2">
                                Resultados da busca ({searchResults.length})
                            </div>
                            {searchResults.map((result) => (
                                <button
                                    key={result.id}
                                    onClick={() => handleSearchResultClick(result)}
                                    className="w-full flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition-colors text-left"
                                >
                                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3 flex-shrink-0">
                                        <result.icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                            {result.title}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {result.description}
                                        </div>
                                    </div>
                                    <div className="text-xs text-gray-400 dark:text-gray-500 ml-2">
                                        {result.category}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-2">
                {/* Mobile Search */}
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 md:hidden transition-colors"
                >
                    <Search className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>

                {/* Dark Mode Toggle */}
                {onToggleDarkMode && (
                    <button
                        onClick={onToggleDarkMode}
                        className="p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                        title={`Alternar para modo ${isDarkMode ? 'claro' : 'escuro'}`}
                    >
                        {isDarkMode ? (
                            <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        ) : (
                            <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        )}
                    </button>
                )}

                {/* Quick Cart */}
                {showQuickCart && (
                    <button className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                        <ShoppingCart className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        {cartItemCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {cartItemCount > 9 ? '9+' : cartItemCount}
                            </span>
                        )}
                    </button>
                )}

                {/* Notifications */}
                <div className="relative">
                    <button
                        onClick={() => setShowNotifications(!showNotifications)}
                        className="relative p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        {notificationCount > 0 && (
                            <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
                                {notificationCount > 9 ? '9+' : notificationCount}
                            </span>
                        )}
                    </button>

                    {/* Notifications Dropdown */}
                    {showNotifications && (
                        <div className="absolute top-full right-0 mt-1 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center justify-between">
                                    <h3 className="font-medium text-gray-900 dark:text-gray-100">Notificações</h3>
                                    <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
                                        Marcar todas como lidas
                                    </button>
                                </div>
                            </div>
                            <div className="max-h-64 overflow-y-auto">
                                {notifications.map((notification) => (
                                    <div key={notification.id} className="p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                        <div className="flex items-start">
                                            <div className={`w-2 h-2 rounded-full mt-2 mr-3 ${
                                                notification.type === 'success' ? 'bg-green-500' :
                                                    notification.type === 'warning' ? 'bg-yellow-500' : 'bg-blue-500'
                                            }`}></div>
                                            <div className="flex-1">
                                                <div className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                                                    {notification.title}
                                                </div>
                                                <div className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                                    {notification.description}
                                                </div>
                                                <div className="text-gray-500 dark:text-gray-500 text-xs mt-1">
                                                    {notification.time}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                    <button
                        onClick={() => setShowUserMenu(!showUserMenu)}
                        className="flex items-center space-x-3 p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                        <div className="hidden md:block text-right">
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                        </div>
                        <div className="relative">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center">
                                {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                ) : (
                                    <span className="text-white font-medium text-sm">
                                        {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                                    </span>
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white dark:border-gray-900 rounded-full"></div>
                        </div>
                        <ChevronDown className="w-4 h-4 text-gray-400 hidden md:block" />
                    </button>

                    {/* User Dropdown */}
                    {showUserMenu && (
                        <div className="absolute top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                                <div className="font-medium text-gray-900 dark:text-gray-100">{user.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                            </div>
                            <div className="p-2">
                                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                    <User className="w-4 h-4 mr-3" />
                                    Meu Perfil
                                </button>
                                <button className="w-full flex items-center px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
                                    <Settings className="w-4 h-4 mr-3" />
                                    Configurações
                                </button>
                                <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                <button className="w-full flex items-center px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors">
                                    <LogOut className="w-4 h-4 mr-3" />
                                    Sair
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {isSearchOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 p-4 md:hidden z-50">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder={searchPlaceholder}
                            className="w-full pl-10 pr-10 py-2 border border-gray-300 dark:border-gray-600 rounded-lg
                                     bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100
                                     focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                        <button
                            onClick={() => setIsSearchOpen(false)}
                            className="absolute right-3 top-1/2 transform -translate-y-1/2"
                        >
                            <X className="w-4 h-4 text-gray-400" />
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};