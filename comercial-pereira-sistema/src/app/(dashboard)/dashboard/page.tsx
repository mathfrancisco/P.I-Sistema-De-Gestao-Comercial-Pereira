import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session) {
    redirect('/login')
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Dashboard - Comercial Pereira
        </h1>
        <p className="mt-2 text-gray-600">
          Bem-vindo(a), {session.user.name}!
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de informações do usuário */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Suas Informações
          </h2>
          <div className="space-y-2 text-sm">
            <p><strong>Nome:</strong> {session.user.name}</p>
            <p><strong>Email:</strong> {session.user.email}</p>
            <p><strong>Perfil:</strong> {session.user.role}</p>
          </div>
        </div>

        {/* Card de permissões */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Suas Permissões
          </h2>
          <div className="space-y-1 text-sm">
            {session.user.role === 'ADMIN' && (
              <>
                <p className="text-green-600">✓ Gerenciar usuários</p>
                <p className="text-green-600">✓ Gerenciar produtos</p>
                <p className="text-green-600">✓ Ver relatórios</p>
                <p className="text-green-600">✓ Todas as funcionalidades</p>
              </>
            )}
            {session.user.role === 'MANAGER' && (
              <>
                <p className="text-green-600">✓ Gerenciar produtos</p>
                <p className="text-green-600">✓ Ver relatórios</p>
                <p className="text-green-600">✓ Gerenciar vendas</p>
                <p className="text-red-600">✗ Gerenciar usuários</p>
              </>
            )}
            {session.user.role === 'SALESPERSON' && (
              <>
                <p className="text-green-600">✓ Ver produtos</p>
                <p className="text-green-600">✓ Gerenciar vendas</p>
                <p className="text-green-600">✓ Gerenciar clientes</p>
                <p className="text-red-600">✗ Ver relatórios</p>
              </>
            )}
          </div>
        </div>

        {/* Card de próximas funcionalidades */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Sistema em Desenvolvimento
          </h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p>🔄 Gestão de Produtos</p>
            <p>🔄 Processamento de Vendas</p>
            <p>🔄 Relatórios e Dashboard</p>
            <p>🔄 Gestão de Clientes</p>
          </div>
        </div>
      </div>

      {/* Botão de logout */}
      <div className="mt-8">
        <form action="/api/auth/signout" method="post">
          <button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
          >
            Sair do Sistema
          </button>
        </form>
      </div>
    </div>
  )
}
