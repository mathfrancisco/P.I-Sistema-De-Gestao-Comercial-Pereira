import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

// Definir permissões específicas por rota
const ROUTE_PERMISSIONS = {
    // Dashboard - todos autenticados
    '/dashboard': ['ADMIN', 'MANAGER', 'SALESPERSON'],

    // Gestão de usuários - apenas admin
    '/dashboard/usuarios': ['ADMIN'],
    '/api/users': ['ADMIN'],

    // Gestão de produtos - admin e manager
    '/dashboard/produtos': ['ADMIN', 'MANAGER'],
    '/api/products': ['ADMIN', 'MANAGER', 'SALESPERSON'], // GET para todos, POST/PUT/DELETE para admin/manager

    // Categorias - admin e manager
    '/dashboard/categorias': ['ADMIN', 'MANAGER'],
    '/api/categories': ['ADMIN', 'MANAGER'],

    // Vendas - todos podem acessar
    '/dashboard/vendas': ['ADMIN', 'MANAGER', 'SALESPERSON'],
    '/api/sales': ['ADMIN', 'MANAGER', 'SALESPERSON'],

    // Clientes - vendedores, managers e admin
    '/dashboard/clientes': ['ADMIN', 'MANAGER', 'SALESPERSON'],
    '/api/customers': ['ADMIN', 'MANAGER', 'SALESPERSON'],

    // Relatórios - apenas admin e manager
    '/dashboard/relatorios': ['ADMIN', 'MANAGER'],
    '/api/dashboard': ['ADMIN', 'MANAGER'],
    '/api/reports': ['ADMIN', 'MANAGER'],

    // Estoque - admin e manager
    '/dashboard/estoque': ['ADMIN', 'MANAGER'],
    '/api/inventory': ['ADMIN', 'MANAGER'],

    // Fornecedores - admin e manager
    '/dashboard/fornecedores': ['ADMIN', 'MANAGER'],
    '/api/suppliers': ['ADMIN', 'MANAGER']
} as const

function hasRoutePermission(pathname: string, userRole: string, method: string = 'GET') {
    // Verificar permissões específicas por rota
    for (const [route, allowedRoles] of Object.entries(ROUTE_PERMISSIONS)) {
        if (pathname.startsWith(route)) {
            // Regras especiais para API de produtos
            if (route === '/api/products') {
                if (method === 'GET') {
                    // Todos podem listar/visualizar produtos
                    return ['ADMIN', 'MANAGER', 'SALESPERSON'].includes(userRole)
                } else {
                    // Apenas admin e manager podem modificar
                    return ['ADMIN', 'MANAGER'].includes(userRole)
                }
            }

            return allowedRoles.includes(userRole as any)
        }
    }

    // Se não encontrou regra específica, permitir acesso
    return true
}

export default withAuth(
    function middleware(req) {
        const { pathname } = req.nextUrl
        const { token } = req.nextauth
        const method = req.method

        // IGNORAR COMPLETAMENTE as rotas do NextAuth
        if (pathname.startsWith('/api/auth')) {
            return NextResponse.next()
        }

        // Log apenas em desenvolvimento e apenas para rotas relevantes
        if (process.env.NODE_ENV === 'development' && !pathname.includes('_next')) {
            console.log(`🛡️  [${method}] ${pathname} - User: ${token?.email || 'anonymous'} - Role: ${token?.role || 'none'}`)
        }

        // Verificar se usuário tem permissão para a rota
        if (!hasRoutePermission(pathname, token?.role || '', method)) {
            console.log(`❌ Acesso negado para ${token?.email} em ${pathname} (${method})`)

            // Para APIs, retornar 403
            if (pathname.startsWith('/api/')) {
                return NextResponse.json(
                    { error: 'Permissão insuficiente', required: 'Admin ou Manager' },
                    { status: 403 }
                )
            }

            // Para páginas, redirecionar para dashboard
            return NextResponse.redirect(new URL('/dashboard', req.url))
        }

        // Verificações específicas por método HTTP para produtos
        if (pathname.startsWith('/api/products')) {
            if (['POST', 'PUT', 'DELETE'].includes(method)) {
                if (!['ADMIN', 'MANAGER'].includes(token?.role || '')) {
                    console.log(`❌ Método ${method} negado para ${token?.role} em /api/products`)
                    return NextResponse.json(
                        { error: 'Permissão insuficiente para modificar produtos' },
                        { status: 403 }
                    )
                }
            }
        }

        if (process.env.NODE_ENV === 'development' && !pathname.includes('_next')) {
            console.log(`✅ Acesso permitido para ${token?.email} em ${pathname}`)
        }

        return NextResponse.next()
    },
    {
        callbacks: {
            authorized: ({ token, req }) => {
                const { pathname } = req.nextUrl

                // SEMPRE permitir rotas do NextAuth - CRÍTICO
                if (pathname.startsWith('/api/auth')) {
                    return true
                }

                // Rotas públicas (não precisam de autenticação)
                const publicRoutes = ['/', '/login', '/favicon.ico']
                if (publicRoutes.some(route => pathname === route || pathname.startsWith(route))) {
                    return true
                }

                // Ignorar arquivos estáticos
                if (pathname.startsWith('/_next') || pathname.startsWith('/public')) {
                    return true
                }

                // Todas as outras rotas protegidas precisam de autenticação
                if (pathname.startsWith('/dashboard') || pathname.startsWith('/api/')) {
                    return !!token
                }

                return true
            }
        }
    }
)

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - public folder
         */
        '/((?!_next/static|_next/image|favicon.ico|public/).*)',
    ]
}