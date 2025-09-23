import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center mr-3">
            <span className="text-white font-bold text-xl">CP</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900">
            Comercial Pereira
          </h1>
        </div>
        <p className="text-center text-gray-600 mb-8 text-lg">
          Sistema completo de gestão para atacado e varejo
        </p>
        <div className="flex justify-center space-x-4">
          <Link
            href="/login"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Fazer Login
          </Link>
        </div>
      </div>
    </main>
  )
}