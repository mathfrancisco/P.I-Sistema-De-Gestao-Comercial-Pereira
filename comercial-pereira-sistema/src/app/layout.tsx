import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/providers/auth-provider'
import { Toaster } from 'sonner'
import QueryProvider from '@/components/providers/QueryProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sistema de Gestão - Comercial Pereira',
  description: 'Sistema completo de gestão comercial para Comercial Pereira',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <QueryProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: 'white',
                color: 'black',
                border: '1px solid #e5e5e5'
              }
            }}
          />
        </QueryProvider>
      </body>
    </html>
  )
}