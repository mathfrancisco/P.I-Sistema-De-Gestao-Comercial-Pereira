// lib/api-error.ts
import { Prisma } from '@prisma/client'
import { ZodError } from 'zod'

// Classe base para erros da API
export class ApiError extends Error {
  constructor(
    message: string, 
    public statusCode: number = 500,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

// Classe específica para erros de autenticação
export class ApiAuthError extends ApiError {
  constructor(message: string, statusCode: number = 401) {
    super(message, statusCode, 'AUTH_ERROR')
    this.name = 'ApiAuthError'
  }
}

// Classe específica para erros de autorização
export class ApiAuthorizationError extends ApiError {
  constructor(message: string = 'Permissão insuficiente', statusCode: number = 403) {
    super(message, statusCode, 'AUTHORIZATION_ERROR')
    this.name = 'ApiAuthorizationError'
  }
}

// Classe específica para erros de validação
export class ApiValidationError extends ApiError {
  constructor(message: string, details?: any, statusCode: number = 400) {
    super(message, statusCode, 'VALIDATION_ERROR', details)
    this.name = 'ApiValidationError'
  }
}

// Classe específica para erros de negócio
export class ApiBusinessError extends ApiError {
  constructor(message: string, statusCode: number = 400) {
    super(message, statusCode, 'BUSINESS_ERROR')
    this.name = 'ApiBusinessError'
  }
}

// Classe específica para erros de não encontrado
export class ApiNotFoundError extends ApiError {
  constructor(message: string = 'Recurso não encontrado') {
    super(message, 404, 'NOT_FOUND_ERROR')
    this.name = 'ApiNotFoundError'
  }
}

// Classe específica para erros de conflito
export class ApiConflictError extends ApiError {
  constructor(message: string) {
    super(message, 409, 'CONFLICT_ERROR')
    this.name = 'ApiConflictError'
  }
}

// Interface para resposta de erro padronizada
export interface ApiErrorResponse {
  error: string
  statusCode: number
  code?: string
  details?: any
  timestamp: string
  path?: string
}

// Interface para resultado do tratamento de erro
export interface ErrorHandlerResult {
  error: string
  statusCode: number
  code?: string
  details?: any
}

// Mapeamento de códigos de erro do Prisma para mensagens amigáveis
const PRISMA_ERROR_MESSAGES: Record<string, string> = {
  'P2002': 'Dados duplicados. Verifique campos únicos.',
  'P2014': 'A operação falhou devido a uma violação de relação.',
  'P2003': 'Falha na restrição de chave estrangeira.',
  'P2025': 'Registro não encontrado.',
  'P2016': 'Erro de interpretação da consulta.',
  'P2017': 'Os registros para a relação não estão conectados.',
  'P2018': 'Os registros requeridos para conectar não foram encontrados.',
  'P2019': 'Erro de entrada.',
  'P2020': 'Valor fora do intervalo para o tipo.',
  'P2021': 'A tabela não existe no banco de dados atual.',
  'P2022': 'A coluna não existe no banco de dados atual.',
  'P2023': 'Dados inconsistentes na coluna.',
  'P2024': 'Tempo limite esgotado para obter uma conexão do pool.',
  'P2026': 'O provedor de banco de dados atual não suporta uma funcionalidade usada na consulta.',
  'P2027': 'Múltiplos erros ocorreram no banco de dados durante a execução da consulta.'
}

// Função principal para tratamento de erros
export function handleApiError(error: unknown, context?: string): ErrorHandlerResult {
  // Log do erro para debugging
  logError(error, context)

  // Instâncias de ApiError já formatadas
  if (error instanceof ApiError) {
    return {
      error: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details
    }
  }

  // Erros de validação Zod
  if (error instanceof ZodError) {
    return handleZodError(error)
  }

  // Erros do Prisma
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return handlePrismaKnownError(error)
  }

  if (error instanceof Prisma.PrismaClientUnknownRequestError) {
    return handlePrismaUnknownError(error)
  }

  if (error instanceof Prisma.PrismaClientRustPanicError) {
    return handlePrismaRustPanicError(error)
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return handlePrismaInitError(error)
  }

  if (error instanceof Prisma.PrismaClientValidationError) {
    return handlePrismaValidationError(error)
  }

  // Erros padrão do JavaScript
  if (error instanceof Error) {
    return handleGenericError(error)
  }

  // Erros desconhecidos
  return handleUnknownError(error)
}

// Tratamento específico para erros Zod
function handleZodError(error: ZodError): ErrorHandlerResult {
  const details = error.errors.map((err: { path: any[]; message: any; code: any }) => ({
    field: err.path.join('.'),
    message: err.message,
    code: err.code
  }))

  return {
    error: 'Dados de entrada inválidos',
    statusCode: 400,
    code: 'VALIDATION_ERROR',
    details
  }
}

// Tratamento para erros conhecidos do Prisma
function handlePrismaKnownError(error: Prisma.PrismaClientKnownRequestError): ErrorHandlerResult {
  const message = PRISMA_ERROR_MESSAGES[error.code] || 'Erro no banco de dados'
  
  let statusCode = 500
  let code = 'DATABASE_ERROR'

  // Ajustar status code baseado no tipo de erro
  switch (error.code) {
    case 'P2002': // Unique constraint
      statusCode = 409
      code = 'DUPLICATE_DATA'
      break
    case 'P2025': // Record not found
      statusCode = 404
      code = 'NOT_FOUND'
      break
    case 'P2003': // Foreign key constraint
      statusCode = 400
      code = 'CONSTRAINT_VIOLATION'
      break
    case 'P2014': // Relation violation
      statusCode = 400
      code = 'RELATION_VIOLATION'
      break
  }

  return {
    error: message,
    statusCode,
    code,
    details: {
      prismaCode: error.code,
      meta: error.meta
    }
  }
}

// Tratamento para erros desconhecidos do Prisma
function handlePrismaUnknownError(error: Prisma.PrismaClientUnknownRequestError): ErrorHandlerResult {
  return {
    error: 'Erro interno no banco de dados',
    statusCode: 500,
    code: 'DATABASE_UNKNOWN_ERROR'
  }
}

// Tratamento para erro de panic do Rust (Prisma)
function handlePrismaRustPanicError(error: Prisma.PrismaClientRustPanicError): ErrorHandlerResult {
  return {
    error: 'Erro crítico no banco de dados',
    statusCode: 500,
    code: 'DATABASE_CRITICAL_ERROR'
  }
}

// Tratamento para erro de inicialização do Prisma
function handlePrismaInitError(error: Prisma.PrismaClientInitializationError): ErrorHandlerResult {
  return {
    error: 'Erro de conexão com o banco de dados',
    statusCode: 503,
    code: 'DATABASE_CONNECTION_ERROR'
  }
}

// Tratamento para erro de validação do Prisma
function handlePrismaValidationError(error: Prisma.PrismaClientValidationError): ErrorHandlerResult {
  return {
    error: 'Dados inválidos para o banco de dados',
    statusCode: 400,
    code: 'DATABASE_VALIDATION_ERROR'
  }
}

// Tratamento para erros genéricos do JavaScript
function handleGenericError(error: Error): ErrorHandlerResult {
  // Verificar se é erro de conexão de rede
  if (error.message.includes('ECONNREFUSED') || error.message.includes('ENOTFOUND')) {
    return {
      error: 'Erro de conexão com serviços externos',
      statusCode: 503,
      code: 'SERVICE_UNAVAILABLE'
    }
  }

  // Verificar se é erro de timeout
  if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
    return {
      error: 'Operação expirou. Tente novamente.',
      statusCode: 408,
      code: 'REQUEST_TIMEOUT'
    }
  }

  // Verificar se é erro de parsing JSON
  if (error.message.includes('JSON') || error.message.includes('parse')) {
    return {
      error: 'Formato de dados inválido',
      statusCode: 400,
      code: 'INVALID_FORMAT'
    }
  }

  return {
    error: 'Erro interno do servidor',
    statusCode: 500,
    code: 'INTERNAL_SERVER_ERROR'
  }
}

// Tratamento para erros completamente desconhecidos
function handleUnknownError(error: unknown): ErrorHandlerResult {
  return {
    error: 'Erro interno do servidor',
    statusCode: 500,
    code: 'UNKNOWN_ERROR'
  }
}

// Função para criar resposta de erro padronizada
export function createErrorResponse(
  error: string,
  statusCode: number = 500,
  code?: string,
  details?: any,
  path?: string
): ApiErrorResponse {
  return {
    error,
    statusCode,
    code,
    details,
    timestamp: new Date().toISOString(),
    path
  }
}

// Função para log de erros
function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString()
  
  if (error instanceof ApiError) {
    // Log estruturado para erros da API
    console.error(`[${timestamp}] API Error ${context ? `(${context})` : ''}:`, {
      name: error.name,
      message: error.message,
      statusCode: error.statusCode,
      code: error.code,
      details: error.details,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  } else if (error instanceof Error) {
    // Log para erros padrão
    console.error(`[${timestamp}] Error ${context ? `(${context})` : ''}:`, {
      name: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  } else {
    // Log para erros desconhecidos
    console.error(`[${timestamp}] Unknown Error ${context ? `(${context})` : ''}:`, error)
  }
}

// Função auxiliar para determinar se o erro deve ser reportado ao usuário
export function shouldExposeError(error: unknown): boolean {
  // Em desenvolvimento, expor todos os erros
  if (process.env.NODE_ENV === 'development') {
    return true
  }

  // Em produção, expor apenas erros seguros
  if (error instanceof ApiError) {
    return true
  }

  if (error instanceof ZodError) {
    return true
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // Expor apenas alguns códigos específicos
    const safeCodes = ['P2002', 'P2025', 'P2003', 'P2014']
    return safeCodes.includes(error.code)
  }

  return false
}

// Função para tratamento de erros em contextos específicos
export function handleDomainError(error: unknown, domain: string): ErrorHandlerResult {
  const context = `Domain: ${domain}`
  return handleApiError(error, context)
}

// Middleware para tratamento de erros em APIs
export function withErrorHandler<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  context?: string
) {
  return async (...args: T): Promise<R> => {
    try {
      return await fn(...args)
    } catch (error) {
      throw error // Re-throw para ser tratado pela camada superior
    }
  }
}

// Constantes para códigos de erro comuns
export const ERROR_CODES = {
  // Autenticação
  UNAUTHORIZED: 'UNAUTHORIZED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',
  TOKEN_INVALID: 'TOKEN_INVALID',
  
  // Autorização
  FORBIDDEN: 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS: 'INSUFFICIENT_PERMISSIONS',
  
  // Validação
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INVALID_FORMAT: 'INVALID_FORMAT',
  REQUIRED_FIELD: 'REQUIRED_FIELD',
  
  // Negócio
  BUSINESS_RULE_VIOLATION: 'BUSINESS_RULE_VIOLATION',
  OPERATION_NOT_ALLOWED: 'OPERATION_NOT_ALLOWED',
  RESOURCE_IN_USE: 'RESOURCE_IN_USE',
  
  // Dados
  NOT_FOUND: 'NOT_FOUND',
  DUPLICATE_DATA: 'DUPLICATE_DATA',
  CONSTRAINT_VIOLATION: 'CONSTRAINT_VIOLATION',
  
  // Sistema
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR: 'DATABASE_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR'
} as const

// Type para os códigos de erro
export type ErrorCode = typeof ERROR_CODES[keyof typeof ERROR_CODES]

// Função helper para criar erros específicos rapidamente
export const createError = {
  notFound: (message: string = 'Recurso não encontrado') => 
    new ApiNotFoundError(message),
  
  conflict: (message: string) => 
    new ApiConflictError(message),
  
  validation: (message: string, details?: any) => 
    new ApiValidationError(message, details),
  
  business: (message: string) => 
    new ApiBusinessError(message),
  
  auth: (message: string = 'Não autorizado') => 
    new ApiAuthError(message),
  
  forbidden: (message: string = 'Permissão insuficiente') => 
    new ApiAuthorizationError(message),
  
  internal: (message: string = 'Erro interno do servidor') => 
    new ApiError(message, 500, ERROR_CODES.INTERNAL_SERVER_ERROR)
}

// Export de conveniência
export {
  handleApiError as default,
  ZodError,
  Prisma
}