import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { 
  validateDocumentSchema, 
  isValidCPF, 
  isValidCNPJ, 
  cleanDocument, 
  formatCPF, 
  formatCNPJ 
} from "@/lib/validations/customer"

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticação
    await getAuthenticatedUser()

    // Validar dados de entrada
    const body = await request.json()
    const { document, type } = validateDocumentSchema.parse(body)

    const cleanDoc = cleanDocument(document)
    
    // Determinar tipo automaticamente se não fornecido
    let documentType = type
    if (!documentType) {
      if (cleanDoc.length === 11) {
        documentType = 'CPF'
      } else if (cleanDoc.length === 14) {
        documentType = 'CNPJ'
      } else {
        return NextResponse.json({
          isValid: false,
          error: 'Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)',
          document: cleanDoc
        }, { status: 400 })
      }
    }

    // Validar documento
    let isValid = false
    let formattedDocument = cleanDoc
    let errorMessage = ''

    if (documentType === 'CPF') {
      if (cleanDoc.length !== 11) {
        errorMessage = 'CPF deve ter exatamente 11 dígitos'
      } else {
        isValid = isValidCPF(cleanDoc)
        formattedDocument = formatCPF(cleanDoc)
        if (!isValid) {
          errorMessage = 'CPF inválido'
        }
      }
    } else if (documentType === 'CNPJ') {
      if (cleanDoc.length !== 14) {
        errorMessage = 'CNPJ deve ter exatamente 14 dígitos'
      } else {
        isValid = isValidCNPJ(cleanDoc)
        formattedDocument = formatCNPJ(cleanDoc)
        if (!isValid) {
          errorMessage = 'CNPJ inválido'
        }
      }
    }

    const response = {
      isValid,
      type: documentType,
      document: cleanDoc,
      formattedDocument,
      ...(errorMessage && { error: errorMessage })
    }

    return NextResponse.json(response)

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}
