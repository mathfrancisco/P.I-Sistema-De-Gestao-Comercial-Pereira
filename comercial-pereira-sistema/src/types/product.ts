// types/product.ts


// Tipos básicos baseados no Prisma
export type ProductModel = Product

export interface ProductBase {
  id: number
  name: string
  description?: string | null
  price: number
  code: string
  barcode?: string | null
  categoryId: number
  supplierId?: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

// Tipo para resposta da API
export interface ProductResponse extends ProductBase {
  category: {
    id: number
    name: string
    description?: string | null
  }
  supplier?: {
    id: number
    name: string
    contactPerson?: string | null
  } | null
  inventory?: {
    quantity: number
    minStock: number
    maxStock?: number | null
    location?: string | null
    isLowStock: boolean
  }
}

// Tipo para criação de produto
export interface CreateProductRequest {
  name: string
  description?: string | null
  price: number
  code: string
  barcode?: string | null
  categoryId: number
  supplierId?: number | null
  isActive?: boolean
  // Configurações iniciais de estoque
  initialStock?: number
  minStock?: number
  maxStock?: number | null
  location?: string | null
}

// Tipo para atualização de produto
export interface UpdateProductRequest {
  name?: string
  description?: string | null
  price?: number
  code?: string
  barcode?: string | null
  categoryId?: number
  supplierId?: number | null
  isActive?: boolean
}

// Filtros para busca
export interface ProductFilters {
  search?: string
  categoryId?: number
  supplierId?: number
  isActive?: boolean
  hasStock?: boolean
  lowStock?: boolean
  noStock?: boolean
  minPrice?: number
  maxPrice?: number
  hasBarcode?: boolean
  createdAfter?: Date
  createdBefore?: Date
  page?: number
  limit?: number
  sortBy?: 'name' | 'code' | 'price' | 'categoryName' | 'supplierName' | 'createdAt' | 'updatedAt' | 'stock'
  sortOrder?: 'asc' | 'desc'
}

// Response de lista paginada
export interface ProductsListResponse {
  data: ProductResponse[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
  filters: ProductFilters
  summary: {
    totalProducts: number
    activeProducts: number
    inactiveProducts: number
    lowStockProducts: number
    outOfStockProducts: number
    totalValue: number
  }
}

// Produto com estatísticas de vendas
export interface ProductWithStats extends ProductResponse {
  stats: {
    totalSales: number
    totalRevenue: number
    totalQuantitySold: number
    averageSalePrice: number
    lastSaleDate?: Date | null
    isTopSelling: boolean
  }
}

// Filtros para busca rápida
export interface ProductSearchParams {
  q: string
  categoryId?: number
  limit?: number
  includeInactive?: boolean
  withStock?: boolean
}

// Verificação de código
export interface CheckCodeRequest {
  code: string
  excludeId?: number
}

export interface CheckCodeResponse {
  available: boolean
}

// Estatísticas de produtos
export interface ProductStats {
  totalProducts: number
  activeProducts: number
  inactiveProducts: number
  averagePrice: number
  totalInventoryValue: number
  topSellingProducts: {
    id: number
    name: string
    code: string
    totalSales: number
    revenue: number
  }[]
  lowStockProducts: {
    id: number
    name: string
    code: string
    currentStock: number
    minStock: number
  }[]
  productsByCategory: Record<string, number>
  productsBySupplier: Record<string, number>
  recentProducts: ProductResponse[]
}

// Performance de vendas por produto
export interface ProductSalesMetric {
  productId: number
  productName: string
  productCode: string
  categoryName: string
  totalQuantitySold: number
  totalRevenue: number
  salesCount: number
  averageQuantityPerSale: number
  lastSaleDate?: Date | null
  trend: 'UP' | 'DOWN' | 'STABLE'
}

// Importação em lote
export interface BulkImportRequest {
  products: Omit<CreateProductRequest, 'initialStock' | 'minStock' | 'maxStock' | 'location'>[]
}

export interface BulkImportResponse {
  success: number
  errors: string[]
}

// Select option para dropdowns
export interface ProductSelectOption {
  value: number
  label: string
  code: string
  price: number
  hasStock: boolean
  stockQuantity?: number
}

// Informações de estoque básicas
export interface ProductStock {
  quantity: number
  minStock: number
  maxStock?: number | null
  location?: string | null
  isLowStock: boolean
  isOutOfStock: boolean
}

// Histórico de preços
export interface ProductPriceHistory {
  id: number
  productId: number
  oldPrice: number
  newPrice: number
  changedBy: number
  changedAt: Date
  reason?: string
}

// Constantes para validação
export const PRODUCT_CONSTRAINTS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 255,
  DESCRIPTION_MIN_LENGTH: 10,
  DESCRIPTION_MAX_LENGTH: 1000,
  CODE_MIN_LENGTH: 3,
  CODE_MAX_LENGTH: 20,
  BARCODE_MIN_LENGTH: 8,
  BARCODE_MAX_LENGTH: 14,
  MIN_PRICE: 0.01,
  MAX_PRICE: 999999.99,
  MIN_STOCK: 0,
  MAX_STOCK_QUANTITY: 1000000,
  LOCATION_MIN_LENGTH: 2,
  LOCATION_MAX_LENGTH: 100,
  CODE_REGEX: /^[A-Z0-9-_]{3,20}$/,
  BARCODE_REGEX: /^\d{8,14}$/,
  NAME_REGEX: /^[a-zA-ZÀ-ÿ0-9\s&.,()-]+$/
} as const

// Tipos para formulários
export interface ProductFormData extends CreateProductRequest {}

export interface ProductFormErrors {
  name?: string
  description?: string
  price?: string
  code?: string
  barcode?: string
  categoryId?: string
  supplierId?: string
  initialStock?: string
  minStock?: string
  maxStock?: string
  location?: string
}

// Status de disponibilidade
export enum ProductAvailability {
  IN_STOCK = 'IN_STOCK',
  LOW_STOCK = 'LOW_STOCK',
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

// Funções utilitárias
export function getProductAvailability(product: ProductResponse): ProductAvailability {
  if (!product.isActive) return ProductAvailability.DISCONTINUED
  if (!product.inventory) return ProductAvailability.OUT_OF_STOCK
  
  const { quantity, minStock } = product.inventory
  if (quantity === 0) return ProductAvailability.OUT_OF_STOCK
  if (quantity <= minStock) return ProductAvailability.LOW_STOCK
  return ProductAvailability.IN_STOCK
}

export function formatProductCode(code: string): string {
  return code.trim().toUpperCase()
}

export function calculateDiscountedPrice(price: number, discountPercent: number): number {
  if (discountPercent < 0 || discountPercent > 100) {
    throw new Error("Desconto deve estar entre 0 e 100%")
  }
  return price * (1 - discountPercent / 100)
}

export function isValidProductCode(code: string): boolean {
  return PRODUCT_CONSTRAINTS.CODE_REGEX.test(code.toUpperCase())
}

export function isValidBarcode(barcode: string): boolean {
  return PRODUCT_CONSTRAINTS.BARCODE_REGEX.test(barcode)
}

// Tipos para relatórios
export interface ProductSalesReport {
  productId: number
  productName: string
  productCode: string
  period: {
    from: Date
    to: Date
  }
  sales: {
    quantity: number
    revenue: number
    count: number
  }
  inventory: {
    initial: number
    final: number
    movements: number
  }
  profitability: {
    margin: number
    profit: number
  }
}