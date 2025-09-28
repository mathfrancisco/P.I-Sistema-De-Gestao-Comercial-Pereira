export const API_CONFIG = {
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
    timeout: 30000,
    headers: {
        'Content-Type': 'application/json',
    },
}

export const ENDPOINTS = {
    // Auth
    auth: {
        login: '/auth/login',
        refresh: '/auth/refresh',
        logout: '/auth/logout',
    },

    // Users
    users: {
        base: '/users',
        byId: (id: number) => `/users/${id}`,
        password: (id: number) => `/users/${id}/password`,
        search: '/users/search',
        active: '/users/active',
        byRole: (role: string) => `/users/by-role/${role}`,
        statistics: '/users/statistics',
    },

    // Sales
    sales: {
        base: '/v1/sales',
        byId: (id: number) => `/v1/sales/${id}`,
        cancel: (id: number) => `/v1/sales/${id}/cancel`,
        items: (saleId: number) => `/v1/sales/${saleId}/items`,
        itemById: (saleId: number, itemId: number) => `/v1/sales/${saleId}/items/${itemId}`,
    },

    // Customers
    customers: {
        base: '/customers',
        byId: (id: number) => `/customers/${id}`,
    },

    // Products
    products: {
        base: '/products',
        byId: (id: number) => `/products/${id}`,
        byCode: (code: string) => `/products/code/${code}`,
        byBarcode: (barcode: string) => `/products/barcode/${barcode}`,
        search: '/products/search',
        active: '/products/active',
        byCategory: (id: number) => `/products/category/${id}`,
        bySupplier: (id: number) => `/products/supplier/${id}`,
        lowStock: '/products/low-stock',
        outOfStock: '/products/out-of-stock',
        checkCode: '/products/check-code',
        toggleStatus: (id: number) => `/products/${id}/toggle-status`,
        batchUpdateStatus: '/products/batch-update-status',
    },

    // Inventory
    inventory: {
        base: '/inventory',
        byId: (id: number) => `/inventory/${id}`,
        byProduct: (productId: number) => `/inventory/product/${productId}`,
        adjust: '/inventory/adjust',
        add: '/inventory/add',
        remove: '/inventory/remove',
        movements: '/inventory/movements',
        productMovements: (productId: number) => `/inventory/product/${productId}/movements`,
        statistics: '/inventory/statistics',
        lowStock: '/inventory/alerts/low-stock',
        outOfStock: '/inventory/alerts/out-of-stock',
        check: (productId: number) => `/inventory/check/${productId}`,
        exists: (productId: number) => `/inventory/exists/${productId}`,
        reserve: '/inventory/reserve',
    },

    // Suppliers
    suppliers: {
        base: '/suppliers',
        byId: (id: number) => `/suppliers/${id}`,
        byCnpj: (cnpj: string) => `/suppliers/cnpj/${cnpj}`,
        search: '/suppliers/search',
        active: '/suppliers/active',
        byState: (state: string) => `/suppliers/state/${state}`,
        withProducts: '/suppliers/with-products',
        statistics: '/suppliers/statistics',
        states: '/suppliers/states',
        toggleStatus: (id: number) => `/suppliers/${id}/toggle-status`,
        validateCnpj: '/suppliers/validation/cnpj',
    },

    // Categories
    categories: {
        base: '/categories',
        byId: (id: number) => `/categories/${id}`,
        search: '/categories/search',
        active: '/categories/active',
        withCnae: '/categories/with-cnae',
        forSelect: '/categories/for-select',
        statistics: '/categories/statistics',
        byName: (name: string) => `/categories/by-name/${name}`,
        byCnae: (cnae: string) => `/categories/by-cnae/${cnae}`,
    },
}