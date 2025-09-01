export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          Sistema de Gestão Comercial Pereira
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Sistema completo de gestão para atacado e varejo
        </p>
        <div className="flex justify-center space-x-4">
          <a 
            href="/login" 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Fazer Login
          </a>
        </div>
      </div>
    </main>
  )
}