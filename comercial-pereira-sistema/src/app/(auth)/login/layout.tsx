export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Formulário de Login */}
      <div className="flex-1 flex items-center justify-center bg-gray-50 p-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
                <span className="text-white font-bold text-xl">CP</span>
              </div>
              <span className="text-2xl font-bold text-gray-900">Comercial Pereira</span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900">Sign In</h2>
            <p className="text-gray-600 mt-2">
              Acesse o sistema de gestão
            </p>
          </div>
          {children}
        </div>
      </div>

      {/* Lado direito - Preview do Dashboard */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        
        {/* Elementos decorativos hexagonais */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 transform rotate-45 translate-x-32 -translate-y-32"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 transform rotate-45 -translate-x-48 translate-y-48"></div>
        
        <div className="relative z-10 flex flex-col items-center justify-center w-full p-12">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-2xl w-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-800">Dashboard</h3>
              <div className="flex space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            
            {/* Preview de métricas */}
            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-xs text-blue-600 mb-1">Vendas Hoje</p>
                <p className="text-2xl font-bold text-gray-900">R$ 12.500</p>
                <p className="text-xs text-green-600 mt-1">+15%</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <p className="text-xs text-green-600 mb-1">Pedidos</p>
                <p className="text-2xl font-bold text-gray-900">42</p>
                <p className="text-xs text-green-600 mt-1">+8%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <p className="text-xs text-purple-600 mb-1">Clientes</p>
                <p className="text-2xl font-bold text-gray-900">1.234</p>
                <p className="text-xs text-green-600 mt-1">+23%</p>
              </div>
            </div>
            
            {/* Preview de gráfico */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-lg text-white">
              <h4 className="font-semibold mb-2">Aumente suas vendas</h4>
              <p className="text-sm opacity-90">
                Sistema completo para gestão do seu negócio
              </p>
              <button className="mt-4 bg-white text-blue-600 px-4 py-2 rounded-lg text-sm font-medium">
                Saiba Mais
              </button>
            </div>
          </div>
          
          <div className="text-center mt-8 text-white">
            <h2 className="text-3xl font-bold mb-2">
              Dashboard Fácil de Usar
            </h2>
            <p className="text-white/80">
              Gerencie seu negócio com eficiência
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}