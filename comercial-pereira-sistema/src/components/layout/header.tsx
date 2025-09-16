import React, { useState } from 'react';
import {
    Bell,
    ChevronRight, Menu, Search, ShoppingCart
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

interface HeaderProps {
    breadcrumbs?: BreadcrumbItem[];
    onSearch?: (query: string) => void;
    searchPlaceholder?: string;
    notificationCount?: number;
    user?: User;
    onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
                                                  breadcrumbs = [{ label: 'Dashboard' }],
                                                  onSearch,
                                                  searchPlaceholder = "Buscar produtos, clientes...",
                                                  notificationCount = 3,
                                                  user = { id: '1', name: 'João Silva', email: 'joao@exemplo.com', role: 'Admin' },
                                                  onToggleSidebar
                                              }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        if (onSearch) {
            onSearch(value);
        }
    };

    return (
        <header className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between">
            {/* Left Section - Breadcrumb */}
            <div className="flex items-center flex-1">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-md hover:bg-gray-100 mr-4 md:hidden"
                >
                    <Menu className="w-5 h-5" />
                </button>

                <nav className="flex items-center text-sm">
                    {breadcrumbs.map((item, index) => (
                        <div key={index} className="flex items-center">
                            {index > 0 && <ChevronRight className="w-4 h-4 mx-2 text-gray-400" />}
                            {item.href ? (
                                <a href={item.href} className="text-gray-500 hover:text-gray-700">
                                    {item.label}
                                </a>
                            ) : (
                                <span className="font-medium text-gray-900">{item.label}</span>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            {/* Center Section - Search */}
            <div className="flex-1 max-w-md mx-8 hidden md:block">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={handleSearch}
                        placeholder={searchPlaceholder}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <kbd className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                        ⌘K
                    </kbd>
                </div>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center space-x-4">
                {/* Mobile Search */}
                <button
                    onClick={() => setIsSearchOpen(!isSearchOpen)}
                    className="p-2 rounded-md hover:bg-gray-100 md:hidden"
                >
                    <Search className="w-5 h-5" />
                </button>

                {/* Notifications */}
                <button className="relative p-2 rounded-md hover:bg-gray-100">
                    <Bell className="w-5 h-5" />
                    {notificationCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {notificationCount > 9 ? '9+' : notificationCount}
            </span>
                    )}
                </button>

                {/* Quick Cart */}
                <button className="p-2 rounded-md hover:bg-gray-100">
                    <ShoppingCart className="w-5 h-5" />
                </button>

                {/* User Menu */}
                <div className="flex items-center space-x-3">
                    <div className="hidden md:block text-right">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-xs text-gray-500">{user.role}</p>
                    </div>
                    <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                            <span className="text-white font-medium text-sm">
                {user.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </span>
                        )}
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-white rounded-full"></div>
                    </div>
                </div>
            </div>

            {/* Mobile Search Overlay */}
            {isSearchOpen && (
                <div className="absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4 md:hidden">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={handleSearch}
                            placeholder={searchPlaceholder}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>
                </div>
            )}
        </header>
    );
};