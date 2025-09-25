"use client";

import React, { useState, useCallback, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { useDashboard } from "@/hooks/useDashboard";

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const [isPending, startTransition] = useTransition();
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    // Hook para dados da dashboard (usado para notificações)
    const { inventoryAlerts } = useDashboard({}, false);

    // Função para gerar breadcrumbs baseado na rota
    const getBreadcrumbs = useCallback(() => {
        const paths = pathname.split('/').filter(Boolean);
        const breadcrumbs = [];

        // Mapeamento de rotas para nomes mais amigáveis
        const routeNames: Record<string, string> = {
            'dashboard': 'Dashboard',
            'produtos': 'Produtos',
            'categorias': 'Categorias',
            'vendas': 'Vendas',
            'clientes': 'Clientes',
            'fornecedores': 'Fornecedores',
            'usuarios': 'Usuários',
            'relatorios': 'Relatórios',
            'estoque': 'Estoque',
            'movimentacoes': 'Movimentações',
            'alertas': 'Alertas',
            'configuracoes': 'Configurações',
            'ajuda': 'Ajuda',
            'nova': 'Nova',
            'pdv': 'PDV',
            'builder': 'Construtor'
        };

        paths.forEach((path, index) => {
            const label = routeNames[path] || path.charAt(0).toUpperCase() + path.slice(1);
            const href = index === paths.length - 1 ? undefined : `/${paths.slice(0, index + 1).join('/')}`;

            breadcrumbs.push({ label, href });
        });

        if (breadcrumbs.length === 0) {
            breadcrumbs.push({ label: 'Dashboard' });
        }

        return breadcrumbs;
    }, [pathname]);

    // Função otimizada para navegação com transition
    const handleNavigation = useCallback((href: string) => {
        if (href === pathname) return; // Não navegar se já está na página

        startTransition(() => {
            try {
                router.push(href);
            } catch (error) {
                console.error('Erro na navegação:', error);
                window.location.href = href;
            }
        });
    }, [router, pathname]);

    // Função para busca global com debounce implícito
    const handleGlobalSearch = useCallback((query: string) => {
        if (!query.trim()) return;

        const searchParams = new URLSearchParams({
            q: query,
            timestamp: Date.now().toString() // Evitar cache em buscas
        });

        startTransition(() => {
            router.push(`/search?${searchParams.toString()}`);
        });
    }, [router]);

    // Prefetch de rotas importantes
    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            // Prefetch das rotas mais acessadas
            const criticalRoutes = [
                '/dashboard',
                '/vendas',
                '/produtos',
                '/estoque',
                '/clientes'
            ];

            criticalRoutes.forEach(route => {
                router.prefetch(route);
            });
        }
    }, [router]);

    // Tela de loading durante autenticação
    if (status === 'loading') {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Verificando autenticação...</p>
                </div>
            </div>
        );
    }

    // Redirect para login se não autenticado
    if (status === 'unauthenticated' || !session) {
        return (
            <div className="flex h-screen items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Acesso Restrito</h2>
                    <p className="text-gray-600 mb-4">Você precisa estar logado para acessar esta área.</p>
                    <Link
                        href="/auth/signin"
                        className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        Fazer Login
                    </Link>
                </div>
            </div>
        );
    }



    // Converter user da sessão para formato do componente
    const userForComponents = {
        id: session.user.id.toString(),
        name: session.user.name,
        email: session.user.email,
        role: session.user.role,
        avatar: undefined
    };

    // Calcular notificações
    const notificationCount = inventoryAlerts.filter(
        (alert: { urgencyLevel: string; }) => alert.urgencyLevel === 'CRITICAL' || alert.urgencyLevel === 'HIGH'
    ).length;

    // Determinar features baseado no role
    const showQuickCart = ['MANAGER', 'SALESPERSON'].includes(session.user.role);

    return (
        <div className={`flex h-screen bg-gray-50 ${isDarkMode ? 'dark' : ''} ${isPending ? 'cursor-wait' : ''}`}>
            {/* Loading overlay durante transições */}
            {isPending && (
                <div className="fixed inset-0 bg-black/10 z-50 flex items-center justify-center">
                    <div className="bg-white rounded-lg p-4 shadow-lg">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-2 text-sm text-gray-600">Navegando...</p>
                    </div>
                </div>
            )}

            {/* Sidebar */}
            <Sidebar
                isCollapsed={isSidebarCollapsed}
                onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                user={userForComponents}
                activeItem={pathname}
                onItemClick={handleNavigation}
                className="z-30"
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header */}
                <Header
                    breadcrumbs={getBreadcrumbs()}
                    onSearch={handleGlobalSearch}
                    searchPlaceholder="Buscar produtos, clientes, pedidos..."
                    notificationCount={notificationCount}
                    user={userForComponents}
                    onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                    isDarkMode={isDarkMode}
                    onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
                    showQuickCart={showQuickCart}
                    cartItemCount={0}
                />

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="h-full">
                        {children}
                    </div>
                </main>
            </div>

            {/* Toast Notifications Container */}
            <div id="toast-container" className="fixed top-4 right-4 space-y-2 z-40">
                {/* Toasts do Sonner serão renderizados aqui */}
            </div>

            {/* Mobile Overlay para Sidebar */}
            {!isSidebarCollapsed && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 md:hidden"
                    onClick={() => setIsSidebarCollapsed(true)}
                />
            )}

            {/* Critical Alerts Notification */}
            {inventoryAlerts.filter((alert: { urgencyLevel: string; }) => alert.urgencyLevel === 'CRITICAL').length > 0 && (
                <div className="fixed bottom-4 right-4 max-w-sm bg-red-600 text-white p-4 rounded-lg shadow-xl z-40 animate-in slide-in-from-right">
                    <div className="flex items-center justify-between">
                        <div className="flex-1">
                            <h4 className="font-semibold flex items-center">
                                <span className="animate-pulse w-2 h-2 bg-red-300 rounded-full mr-2"></span>
                                Alerta Crítico!
                            </h4>
                            <p className="text-sm text-red-100">
                                {inventoryAlerts.filter((alert: { urgencyLevel: string; }) => alert.urgencyLevel === 'CRITICAL').length} produtos críticos
                            </p>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                            <Link
                                href="/estoque/alertas"
                                className="text-red-100 hover:text-white text-sm font-medium border border-red-400 px-2 py-1 rounded hover:bg-red-500 transition-colors"
                            >
                                Ver
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}