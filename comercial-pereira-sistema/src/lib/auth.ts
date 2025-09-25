import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"
import { prisma } from "./db"
import { z } from "zod"

// Schema de validação do login
const loginSchema = z.object({
    email: z.string().email("Email inválido"),
    password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres")
})

export const authOptions: NextAuthOptions = {
    // REMOVER PrismaAdapter temporariamente para testar
    // adapter: PrismaAdapter(prisma),

    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: {
                    label: "Email",
                    type: "email",
                    placeholder: "admin@comercialpereira.com"
                },
                password: {
                    label: "Senha",
                    type: "password",
                    placeholder: "Digite sua senha"
                }
            },
            async authorize(credentials) {
                try {
                    console.log("🔍 Tentando autorizar:", credentials?.email)

                    // Validar credenciais com Zod
                    const { email, password } = loginSchema.parse(credentials)

                    // Buscar usuário no banco
                    const user = await prisma.user.findUnique({
                        where: {
                            email,
                            isActive: true // Apenas usuários ativos
                        }
                    })

                    // Verificar se usuário existe
                    if (!user) {
                        console.log("❌ Usuário não encontrado:", email)
                        return null
                    }

                    // Verificar senha
                    const isPasswordValid = await bcrypt.compare(password, user.password)

                    if (!isPasswordValid) {
                        console.log("❌ Senha inválida para:", email)
                        return null
                    }

                    console.log("✅ Login bem-sucedido:", email, "- Role:", user.role)

                    // Retornar dados do usuário para a sessão
                    return {
                        id: user.id.toString(),
                        email: user.email,
                        name: user.name,
                        role: user.role
                    }
                } catch (error) {
                    console.error("❌ Erro na autenticação:", error)
                    return null
                }
            }
        })
    ],

    session: {
        strategy: "jwt",
        maxAge: 24 * 60 * 60, // 24 horas
    },

    callbacks: {
        async jwt({ token, user }) {
            // Adicionar role ao token na primeira autenticação
            if (user) {
                token.role = user.role
                token.id = user.id
            }
            return token
        },
        async session({ session, token }) {
            // Adicionar role e id à sessão
            if (session.user) {
                session.user.id = token.id as string
                session.user.role = token.role as any
            }
            return session
        },
    },

    pages: {
        signIn: '/login',
        error: '/login',
    },

    events: {
        async signIn({ user }) {
            console.log("🔓 Login realizado:", user.email, "- Role:", user.role)
        },
        async signOut({ session }) {
            console.log("🔒 Logout realizado:", session?.user?.email)
        }
    },

    debug: process.env.NODE_ENV === 'development',

    // Configurações extras para resolver problemas de sessão
    secret: process.env.NEXTAUTH_SECRET
}