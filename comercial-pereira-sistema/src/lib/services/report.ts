// lib/services/report.ts
import { prisma } from '@/lib/db'
import { Prisma } from '@prisma/client'
import {
    type SalesReportData,
    type ProductReportData,
    type FinancialReportData,
    type CustomerReportData,
    type InventoryReportData,
    type ReportResponse,
    type ReportMetadata,
    REPORT_TITLES,
    REPORT_DESCRIPTIONS
} from '@/types/report'
import {
    type SalesReportFiltersInput,
    type ProductReportFiltersInput,
    type FinancialReportFiltersInput,
    type CustomerReportFiltersInput,
    type InventoryReportFiltersInput,
    salesReportFiltersSchema,
    productReportFiltersSchema,
    financialReportFiltersSchema,
    customerReportFiltersSchema,
    inventoryReportFiltersSchema,
    calculateDateRange,
    REPORT_ERROR_MESSAGES
} from '@/lib/validations/report'

export class ReportError extends Error {
    constructor(message: string, public statusCode: number = 500) {
        super(message)
        this.name = 'ReportError'
    }
}

export class ReportService {
    // =================== SALES REPORT ===================

    static async generateSalesReport(
        filters: SalesReportFiltersInput,
        userId: string
    ): Promise<ReportResponse<SalesReportData>> {
        try {
            const validatedFilters = salesReportFiltersSchema.parse(filters)

            // Calculate date range
            const { startDate, endDate } = validatedFilters.period
                ? calculateDateRange(validatedFilters.period)
                : { startDate: validatedFilters.startDate!, endDate: validatedFilters.endDate! }

            // Build where clause
            const where: Prisma.SaleWhereInput = {
                saleDate: {
                    gte: startDate,
                    lte: endDate
                },
                ...(validatedFilters.status && { status: validatedFilters.status }),
                ...(validatedFilters.vendorId && { userId: validatedFilters.vendorId }),
                ...(validatedFilters.customerId && { customerId: validatedFilters.customerId }),
                ...(validatedFilters.minValue && { total: { gte: validatedFilters.minValue } }),
                ...(validatedFilters.maxValue && { total: { lte: validatedFilters.maxValue } })
            }

            // Get sales data
            const sales = await prisma.sale.findMany({
                where,
                include: {
                    user: { select: { id: true, name: true } },
                    customer: { select: { id: true, name: true, type: true } },
                    items: {
                        include: {
                            product: {
                                include: {
                                    category: { select: { id: true, name: true } }
                                }
                            }
                        }
                    }
                }
            })

            // Calculate summary
            const summary = {
                totalSales: sales.length,
                totalRevenue: sales.reduce((sum: number, sale: { total: any }) => sum + Number(sale.total), 0),
                averageTicket: sales.length > 0
                    ? sales.reduce((sum, sale) => sum + Number(sale.total), 0) / sales.length
                    : 0,
                totalCustomers: new Set(sales.map(s => s.customerId)).size,
                totalProducts: new Set(sales.flatMap(s => s.items.map(i => i.productId))).size,
                period: `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`
            }

            // Group by period (daily)
            const byPeriod = this.groupSalesByPeriod(sales, startDate, endDate)

            // Group by vendor
            const byVendor = validatedFilters.groupBy?.includes('vendor')
                ? this.groupSalesByVendor(sales)
                : undefined

            // Group by category
            const byCategory = validatedFilters.groupBy?.includes('category')
                ? this.groupSalesByCategory(sales)
                : undefined

            // Top products
            const topProducts = validatedFilters.includeDetails
                ? this.getTopProducts(sales)
                : undefined

            // Top customers
            const topCustomers = validatedFilters.includeDetails
                ? this.getTopCustomers(sales)
                : undefined

            const data: SalesReportData = {
                summary,
                byPeriod,
                byVendor,
                byCategory,
                topProducts,
                topCustomers
            }

            const metadata: ReportMetadata = {
                id: `sales_${Date.now()}`,
                type: 'sales',
                title: REPORT_TITLES.sales,
                description: REPORT_DESCRIPTIONS.sales,
                generatedAt: new Date(),
                generatedBy: userId,
                filters: validatedFilters,
                rowCount: sales.length
            }

            return { metadata, data }

        } catch (error) {
            if (error instanceof ReportError) throw error
            throw new ReportError('Erro ao gerar relatório de vendas', 500)
        }
    }

    // =================== PRODUCT REPORT ===================

    static async generateProductReport(
        filters: ProductReportFiltersInput,
        userId: string
    ): Promise<ReportResponse<ProductReportData>> {
        try {
            const validatedFilters = productReportFiltersSchema.parse(filters)

            // Build where clause
            const where: Prisma.ProductWhereInput = {
                ...(validatedFilters.categoryId && { categoryId: validatedFilters.categoryId }),
                ...(validatedFilters.supplierId && { supplierId: validatedFilters.supplierId }),
                ...(!validatedFilters.includeInactive && { isActive: true })
            }

            // Get products with inventory
            const products = await prisma.product.findMany({
                where,
                include: {
                    category: { select: { name: true } },
                    inventory: true,
                    saleItems: validatedFilters.includeDetails ? {
                        where: {
                            sale: {
                                status: 'COMPLETED',
                                saleDate: {
                                    gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // Last 30 days
                                }
                            }
                        },
                        select: {
                            quantity: true,
                            total: true
                        }
                    } : false
                }
            })

            // Filter by stock status
            const filteredProducts = this.filterProductsByStock(products, validatedFilters.stockStatus)

            // Calculate summary
            const summary = {
                totalProducts: filteredProducts.length,
                activeProducts: filteredProducts.filter(p => p.isActive).length,
                lowStockProducts: filteredProducts.filter(p =>
                    p.inventory && p.inventory.quantity <= p.inventory.minStock
                ).length,
                outOfStockProducts: filteredProducts.filter(p =>
                    !p.inventory || p.inventory.quantity === 0
                ).length,
                totalInventoryValue: filteredProducts.reduce((sum, p) =>
                    sum + (Number(p.price) * (p.inventory?.quantity || 0)), 0
                )
            }

            // Format products
            const formattedProducts = filteredProducts.map(p => ({
                id: p.id,
                code: p.code,
                name: p.name,
                category: p.category.name,
                currentStock: p.inventory?.quantity || 0,
                minStock: p.inventory?.minStock || 0,
                stockStatus: this.getStockStatus(p.inventory),
                price: Number(p.price),
                inventoryValue: Number(p.price) * (p.inventory?.quantity || 0),
                salesLast30Days: (p.saleItems as any[])?.reduce((sum: number, item: any) =>
                    sum + item.quantity, 0
                ) || 0
            }))

            // ABC Analysis if requested
            const abcAnalysis = validatedFilters.includeDetails
                ? await this.generateABCAnalysis()
                : undefined

            const data: ProductReportData = {
                summary,
                products: formattedProducts,
                abcAnalysis
            }

            const metadata: ReportMetadata = {
                id: `products_${Date.now()}`,
                type: 'products',
                title: REPORT_TITLES.products,
                description: REPORT_DESCRIPTIONS.products,
                generatedAt: new Date(),
                generatedBy: userId,
                filters: validatedFilters,
                rowCount: formattedProducts.length
            }

            return { metadata, data }

        } catch (error) {
            if (error instanceof ReportError) throw error
            throw new ReportError('Erro ao gerar relatório de produtos', 500)
        }
    }

    // =================== FINANCIAL REPORT ===================

    static async generateFinancialReport(
        filters: FinancialReportFiltersInput,
        userId: string
    ): Promise<ReportResponse<FinancialReportData>> {
        try {
            const validatedFilters = financialReportFiltersSchema.parse(filters)

            // Calculate date range
            const { startDate, endDate } = validatedFilters.period
                ? calculateDateRange(validatedFilters.period)
                : { startDate: validatedFilters.startDate!, endDate: validatedFilters.endDate! }

            // Get sales for period
            const sales = await prisma.sale.findMany({
                where: {
                    saleDate: {
                        gte: startDate,
                        lte: endDate
                    },
                    status: 'COMPLETED'
                },
                include: {
                    items: {
                        include: {
                            product: true
                        }
                    }
                }
            })

            // Calculate financial metrics
            const grossRevenue = sales.reduce((sum, sale) => sum + Number(sale.total), 0)
            const totalDiscounts = sales.reduce((sum, sale) => sum + Number(sale.discount || 0), 0)
            const totalTaxes = validatedFilters.includeTaxes
                ? sales.reduce((sum, sale) => sum + Number(sale.tax || 0), 0)
                : 0
            const netRevenue = grossRevenue - totalDiscounts - totalTaxes

            // Calculate costs (simplified - would need purchase data)
            const totalCosts = sales.reduce((sum, sale) => {
                return sum + sale.items.reduce((itemSum, item) => {
                    // Assuming 30% margin for simplification
                    const cost = Number(item.unitPrice) * 0.7 * item.quantity
                    return itemSum + cost
                }, 0)
            }, 0)

            const grossProfit = netRevenue - totalCosts
            const grossMargin = netRevenue > 0 ? (grossProfit / netRevenue) * 100 : 0
            const netProfit = grossProfit // Simplified
            const netMargin = netRevenue > 0 ? (netProfit / netRevenue) * 100 : 0

            const summary = {
                grossRevenue,
                netRevenue,
                totalCosts,
                grossProfit,
                grossMargin,
                netProfit,
                netMargin
            }

            // Cash flow by day
            const cashFlow = this.calculateCashFlow(sales, startDate, endDate)

            // Receivables
            const receivables = await this.calculateReceivables()

            // Payment methods
            const paymentMethods = this.analyzePaymentMethods(sales)

            const data: FinancialReportData = {
                summary,
                cashFlow,
                receivables,
                paymentMethods
            }

            const metadata: ReportMetadata = {
                id: `financial_${Date.now()}`,
                type: 'financial',
                title: REPORT_TITLES.financial,
                description: REPORT_DESCRIPTIONS.financial,
                generatedAt: new Date(),
                generatedBy: userId,
                filters: validatedFilters
            }

            return { metadata, data }

        } catch (error) {
            if (error instanceof ReportError) throw error
            throw new ReportError('Erro ao gerar relatório financeiro', 500)
        }
    }

    // =================== CUSTOMER REPORT ===================

    static async generateCustomerReport(
        filters: CustomerReportFiltersInput,
        userId: string
    ): Promise<ReportResponse<CustomerReportData>> {
        try {
            const validatedFilters = customerReportFiltersSchema.parse(filters)

            // Calculate date range for analysis
            const { startDate, endDate } = validatedFilters.period
                ? calculateDateRange(validatedFilters.period)
                : {
                    startDate: validatedFilters.startDate || new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
                    endDate: validatedFilters.endDate || new Date()
                }

            // Build where clause
            const where: Prisma.CustomerWhereInput = {
                ...(validatedFilters.customerType && { type: validatedFilters.customerType }),
                ...(validatedFilters.onlyActive && { isActive: true }),
                ...(validatedFilters.city && { city: validatedFilters.city }),
                ...(validatedFilters.state && { state: validatedFilters.state })
            }

            // Get customers with sales
            const customers = await prisma.customer.findMany({
                where,
                include: {
                    sales: {
                        where: {
                            saleDate: {
                                gte: startDate,
                                lte: endDate
                            },
                            status: 'COMPLETED'
                        }
                    }
                }
            })

            // Filter by min purchases if specified
            const filteredCustomers = validatedFilters.minPurchases
                ? customers.filter(c => c.sales.length >= validatedFilters.minPurchases!)
                : customers

            // Calculate summary
            const totalRevenue = filteredCustomers.reduce((sum, c) =>
                sum + c.sales.reduce((saleSum, sale) => saleSum + Number(sale.total), 0), 0
            )

            const activeCustomers = filteredCustomers.filter(c => c.sales.length > 0).length

            const summary = {
                totalCustomers: filteredCustomers.length,
                newCustomers: filteredCustomers.filter(c =>
                    c.createdAt >= startDate
                ).length,
                activeCustomers,
                averagePurchaseValue: activeCustomers > 0 ? totalRevenue / activeCustomers : 0,
                totalRevenue
            }

            // Segmentation
            const segmentation = {
                byType: this.segmentCustomersByType(filteredCustomers),
                byLocation: this.segmentCustomersByLocation(filteredCustomers)
            }

            // Ranking
            const ranking = this.rankCustomers(filteredCustomers)

            // RFM Analysis if requested
            const rfmAnalysis = validatedFilters.includeDetails
                ? this.generateRFMAnalysis(filteredCustomers)
                : undefined

            const data: CustomerReportData = {
                summary,
                segmentation,
                ranking,
                rfmAnalysis
            }

            const metadata: ReportMetadata = {
                id: `customers_${Date.now()}`,
                type: 'customers',
                title: REPORT_TITLES.customers,
                description: REPORT_DESCRIPTIONS.customers,
                generatedAt: new Date(),
                generatedBy: userId,
                filters: validatedFilters,
                rowCount: filteredCustomers.length
            }

            return { metadata, data }

        } catch (error) {
            if (error instanceof ReportError) throw error
            throw new ReportError('Erro ao gerar relatório de clientes', 500)
        }
    }

    // =================== INVENTORY REPORT ===================

    static async generateInventoryReport(
        filters: InventoryReportFiltersInput,
        userId: string
    ): Promise<ReportResponse<InventoryReportData>> {
        try {
            const validatedFilters = inventoryReportFiltersSchema.parse(filters)

            // Build where clause
            const where: Prisma.InventoryWhereInput = {
                ...(validatedFilters.categoryId && {
                    product: { categoryId: validatedFilters.categoryId }
                }),
                ...(validatedFilters.location && { location: validatedFilters.location })
            }

            // Get inventory with products
            const inventory = await prisma.inventory.findMany({
                where,
                include: {
                    product: {
                        include: {
                            category: { select: { name: true } },
                            supplier: { select: { name: true } }
                        }
                    }
                }
            })

            // Calculate summary
            const summary = {
                totalItems: inventory.length,
                totalQuantity: inventory.reduce((sum, i) => sum + i.quantity, 0),
                totalValue: inventory.reduce((sum, i) =>
                    sum + (i.quantity * Number(i.product.price)), 0
                ),
                itemsLowStock: inventory.filter(i => i.quantity <= i.minStock).length,
                itemsOutOfStock: inventory.filter(i => i.quantity === 0).length,
                itemsOverstock: inventory.filter(i =>
                    i.maxStock && i.quantity > i.maxStock
                ).length
            }

            // Format inventory items
            const inventoryItems = inventory.map(i => ({
                productId: i.product.id,
                productCode: i.product.code,
                productName: i.product.name,
                category: i.product.category.name,
                quantity: i.quantity,
                minStock: i.minStock,
                maxStock: i.maxStock,
                value: i.quantity * Number(i.product.price),
                status: this.getStockStatus(i),
                lastMovement: i.lastUpdate,
                location: i.location
            }))

            // Get movements if requested
            const movements = validatedFilters.includeMovements
                ? await this.getInventoryMovements(validatedFilters)
                : undefined

            // Reorder list
            const reorderList = inventory
                .filter(i => i.quantity <= i.minStock)
                .map(i => ({
                    productId: i.product.id,
                    productName: i.product.name,
                    currentStock: i.quantity,
                    minStock: i.minStock,
                    suggestedOrder: (i.minStock * 2) - i.quantity,
                    supplier: i.product.supplier?.name
                }))

            // Valuation
            const valuation = {
                byCategory: this.valuateByCategory(inventory),
                byLocation: validatedFilters.location
                    ? undefined
                    : this.valuateByLocation(inventory)
            }

            const data: InventoryReportData = {
                summary,
                inventory: inventoryItems,
                movements,
                reorderList,
                valuation
            }

            const metadata: ReportMetadata = {
                id: `inventory_${Date.now()}`,
                type: 'inventory',
                title: REPORT_TITLES.inventory,
                description: REPORT_DESCRIPTIONS.inventory,
                generatedAt: new Date(),
                generatedBy: userId,
                filters: validatedFilters,
                rowCount: inventory.length
            }

            return { metadata, data }

        } catch (error) {
            if (error instanceof ReportError) throw error
            throw new ReportError('Erro ao gerar relatório de estoque', 500)
        }
    }

    // =================== HELPER METHODS ===================

    private static groupSalesByPeriod(sales: any[], startDate: Date, endDate: Date) {
        const grouped: Record<string, any> = {}

        sales.forEach(sale => {
            const date = sale.saleDate.toISOString().split('T')[0]
            if (!grouped[date]) {
                grouped[date] = {
                    date,
                    sales: 0,
                    revenue: 0,
                    tickets: []
                }
            }
            grouped[date].sales++
            grouped[date].revenue += Number(sale.total)
            grouped[date].tickets.push(Number(sale.total))
        })

        return Object.values(grouped).map((g: any) => ({
            date: g.date,
            sales: g.sales,
            revenue: g.revenue,
            averageTicket: g.revenue / g.sales
        }))
    }

    private static groupSalesByVendor(sales: any[]) {
        const grouped: Record<number, any> = {}

        sales.forEach(sale => {
            if (!grouped[sale.userId]) {
                grouped[sale.userId] = {
                    vendorId: sale.userId,
                    vendorName: sale.user.name,
                    totalSales: 0,
                    totalRevenue: 0
                }
            }
            grouped[sale.userId].totalSales++
            grouped[sale.userId].totalRevenue += Number(sale.total)
        })

        return Object.values(grouped)
    }

    private static groupSalesByCategory(sales: any[]) {
        const grouped: Record<number, any> = {}
        const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0)

        sales.forEach(sale => {
            sale.items.forEach((item: any) => {
                const categoryId = item.product.category.id
                if (!grouped[categoryId]) {
                    grouped[categoryId] = {
                        categoryId,
                        categoryName: item.product.category.name,
                        quantitySold: 0,
                        revenue: 0
                    }
                }
                grouped[categoryId].quantitySold += item.quantity
                grouped[categoryId].revenue += Number(item.total)
            })
        })

        return Object.values(grouped).map((g: any) => ({
            ...g,
            percentage: total > 0 ? (g.revenue / total) * 100 : 0
        }))
    }

    private static getTopProducts(sales: any[], limit = 10) {
        const products: Record<number, any> = {}

        sales.forEach(sale => {
            sale.items.forEach((item: any) => {
                if (!products[item.productId]) {
                    products[item.productId] = {
                        productId: item.productId,
                        productName: item.product.name,
                        productCode: item.product.code,
                        quantitySold: 0,
                        revenue: 0
                    }
                }
                products[item.productId].quantitySold += item.quantity
                products[item.productId].revenue += Number(item.total)
            })
        })

        return Object.values(products)
            .sort((a, b) => b.revenue - a.revenue)
            .slice(0, limit)
    }

    private static getTopCustomers(sales: any[], limit = 10) {
        const customers: Record<number, any> = {}

        sales.forEach(sale => {
            if (!customers[sale.customerId]) {
                customers[sale.customerId] = {
                    customerId: sale.customerId,
                    customerName: sale.customer.name,
                    customerType: sale.customer.type,
                    purchases: 0,
                    totalSpent: 0
                }
            }
            customers[sale.customerId].purchases++
            customers[sale.customerId].totalSpent += Number(sale.total)
        })

        return Object.values(customers)
            .sort((a, b) => b.totalSpent - a.totalSpent)
            .slice(0, limit)
    }

    private static filterProductsByStock(products: any[], stockStatus: string) {
        if (stockStatus === 'all') return products

        return products.filter(p => {
            const status = this.getStockStatus(p.inventory)

            switch (stockStatus) {
                case 'low':
                    return status === 'low' || status === 'critical'
                case 'out':
                    return status === 'out'
                case 'normal':
                    return status === 'normal'
                default:
                    return true
            }
        })
    }

    private static getStockStatus(inventory: any): 'normal' | 'low' | 'critical' | 'out' | 'overstock' {
    if (!inventory || inventory.quantity === 0) return 'out'
    if (inventory.quantity <= inventory.minStock / 2) return 'critical'
    if (inventory.quantity <= inventory.minStock) return 'low'
    if (inventory.maxStock && inventory.quantity > inventory.maxStock) return 'overstock'
    return 'normal'
}

    private static async generateABCAnalysis() {
        // Simplified ABC analysis
        // Would need more complex logic with sales history
        return {
            classA: [],
            classB: [],
            classC: []
        }
    }

    private static calculateCashFlow(sales: any[], startDate: Date, endDate: Date) {
        const flow: Record<string, any> = {}
        let balance = 0

        sales.forEach(sale => {
            const date = sale.saleDate.toISOString().split('T')[0]
            if (!flow[date]) {
                flow[date] = {
                    date,
                    inflow: 0,
                    outflow: 0,
                    balance: 0
                }
            }
            flow[date].inflow += Number(sale.total)
        })

        return Object.values(flow).map((f: any) => {
            balance += f.inflow - f.outflow
            return {
                ...f,
                balance
            }
        })
    }

    private static async calculateReceivables() {
        // Simplified - would need payment tracking
        return {
            total: 0,
            overdue: 0,
            toReceive: 0,
            byPeriod: []
        }
    }

    private static analyzePaymentMethods(sales: any[]) {
        // Simplified - would need payment method tracking
        const total = sales.reduce((sum, sale) => sum + Number(sale.total), 0)

        return [
            {
                method: 'Dinheiro',
                amount: total * 0.3,
                percentage: 30,
                transactionCount: Math.floor(sales.length * 0.3)
            },
            {
                method: 'Cartão',
                amount: total * 0.5,
                percentage: 50,
                transactionCount: Math.floor(sales.length * 0.5)
            },
            {
                method: 'PIX',
                amount: total * 0.2,
                percentage: 20,
                transactionCount: Math.floor(sales.length * 0.2)
            }
        ]
    }

    private static segmentCustomersByType(customers: any[]) {
        const segments: Record<string, any> = {}

        customers.forEach(customer => {
            if (!segments[customer.type]) {
                segments[customer.type] = {
                    type: customer.type,
                    count: 0,
                    revenue: 0
                }
            }
            segments[customer.type].count++
            segments[customer.type].revenue += customer.sales.reduce(
                (sum: number, sale: any) => sum + Number(sale.total), 0
            )
        })

        const total = Object.values(segments).reduce((sum: number, s: any) => sum + s.revenue, 0)

        return Object.values(segments).map((s: any) => ({
            ...s,
            percentage: total > 0 ? (s.revenue / total) * 100 : 0
        }))
    }

    private static segmentCustomersByLocation(customers: any[]) {
        const locations: Record<string, any> = {}

        customers.forEach(customer => {
            const key = customer.state || 'Unknown'
            if (!locations[key]) {
                locations[key] = {
                    state: key,
                    customers: 0,
                    revenue: 0
                }
            }
            locations[key].customers++
            locations[key].revenue += customer.sales.reduce(
                (sum: number, sale: any) => sum + Number(sale.total), 0
            )
        })

        return Object.values(locations)
    }

    private static rankCustomers(customers: any[]) {
        return customers
            .map(customer => {
                const totalPurchases = customer.sales.length
                const totalSpent = customer.sales.reduce(
                    (sum: number, sale: any) => sum + Number(sale.total), 0
                )
                const lastPurchase = customer.sales.length > 0
                    ? new Date(Math.max(...customer.sales.map((s: any) => s.saleDate.getTime())))
                    : customer.createdAt

                return {
                    customerId: customer.id,
                    name: customer.name,
                    type: customer.type,
                    totalPurchases,
                    totalSpent,
                    averageTicket: totalPurchases > 0 ? totalSpent / totalPurchases : 0,
                    lastPurchase,
                    daysInactive: Math.floor((Date.now() - lastPurchase.getTime()) / (1000 * 60 * 60 * 24))
                }
            })
            .sort((a, b) => b.totalSpent - a.totalSpent)
    }

    private static generateRFMAnalysis(customers: any[]) {
        // Simplified RFM scoring
        // Would need more sophisticated algorithm
        return {
            champions: [],
            loyal: [],
            potential: [],
            new: [],
            lapsing: [],
            lost: []
        }
    }

    private static async getInventoryMovements(filters: any) {
        const movements = await prisma.inventoryMovement.findMany({
            where: {
                ...(filters.categoryId && {
                    product: { categoryId: filters.categoryId }
                })
            },
            include: {
                product: { select: { name: true } },
                user: { select: { name: true } }
            },
            orderBy: { createdAt: 'desc' },
            take: 100
        })

        return movements.map(m => ({
            date: m.createdAt,
            productId: m.productId,
            productName: m.product.name,
            type: m.type as 'IN' | 'OUT' | 'ADJUSTMENT',
            quantity: m.quantity,
            reason: m.reason,
            user: m.user?.name || 'Sistema'
        }))
    }

    private static valuateByCategory(inventory: any[]) {
        const categories: Record<string, any> = {}
        const total = inventory.reduce((sum, i) =>
            sum + (i.quantity * Number(i.product.price)), 0
        )

        inventory.forEach(item => {
            const category = item.product.category.name
            if (!categories[category]) {
                categories[category] = {
                    category,
                    items: 0,
                    quantity: 0,
                    value: 0
                }
            }
            categories[category].items++
            categories[category].quantity += item.quantity
            categories[category].value += item.quantity * Number(item.product.price)
        })

        return Object.values(categories).map((c: any) => ({
            ...c,
            percentage: total > 0 ? (c.value / total) * 100 : 0
        }))
    }

    private static valuateByLocation(inventory: any[]) {
        const locations: Record<string, any> = {}

        inventory.forEach(item => {
            const location = item.location || 'Não especificado'
            if (!locations[location]) {
                locations[location] = {
                    location,
                    items: 0,
                    value: 0
                }
            }
            locations[location].items++
            locations[location].value += item.quantity * Number(item.product.price)
        })

        return Object.values(locations)
    }
}