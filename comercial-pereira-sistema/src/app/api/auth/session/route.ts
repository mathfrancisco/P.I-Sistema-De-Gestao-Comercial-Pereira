import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { error: "Não autenticado" }, 
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: session.user,
      expires: session.expires
    })
  } catch (error) {
    console.error("Erro ao obter sessão:", error)
    return NextResponse.json(
      { error: "Erro interno do servidor" }, 
      { status: 500 }
    )
  }
}
