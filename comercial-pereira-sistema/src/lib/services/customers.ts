// lib/services/customer.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  // Validation schemas and types
  type CreateCustomerInput,
  type UpdateCustomerInput,
  type CustomerFiltersInput,
  type ValidateDocumentInput,
  type CustomerResponse,

  // Validation schemas
  createCustomerSchema,
  updateCustomerSchema,
  customerFiltersSchema,
  validateDocumentSchema,

  // Error messages
  CUSTOMER_ERROR_MESSAGES,
  validateCustomerBusinessRules,
} from "@/lib/validations/customer";

import {
  // Types from types file
  CustomerType,
  type CustomerSelectOption,
  type CustomerMetric,
  CustomerSegment,

  // Utility functions
  cleanDocument,
  formatCPF,
  formatCNPJ,
  isValidCPF,
  isValidCNPJ,

  // Constants
  CUSTOMER_CONSTRAINTS,
  BRAZIL_STATES,
} from "@/types/customer";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Tipos específicos para match com os routes existentes
export interface CustomerListItem extends CustomerResponse {
  salesCount: number;
  lastPurchase?: {
    date: Date;
    amount: number;
  };
}

export interface CustomerWithStatistics extends CustomerResponse {
  statistics: {
    totalSales: number;
    totalSpent: number;
    averageOrderValue: number;
    firstPurchase?: Date;
    lastPurchase?: Date;
    favoriteCategories: Array<{
      categoryName: string;
      purchaseCount: number;
      totalSpent: number;
    }>;
  };
  recentSales: Array<{
    id: number;
    total: number;
    saleDate: Date;
    itemCount: number;
  }>;
}

export interface CustomerSalesFilters {
  status?:
    | "DRAFT"
    | "PENDING"
    | "CONFIRMED"
    | "COMPLETED"
    | "CANCELLED"
    | "REFUNDED";
  dateFrom?: Date;
  dateTo?: Date;
  minTotal?: number;
  maxTotal?: number;
  page: number;
  limit: number;
  sortBy: "saleDate" | "total" | "status";
  sortOrder: "asc" | "desc";
  includeItems: boolean;
}

export interface CustomerSalesResponse {
  customer: {
    id: number;
    name: string;
    type: CustomerType;
    isActive: boolean;
  };
  sales: Array<{
    id: number;
    total: number;
    discount: number;
    tax: number;
    status: string;
    notes?: string;
    saleDate: Date;
    createdAt: Date;
    itemCount: number;
    user: {
      id: number;
      name: string;
    };
    items?: Array<{
      id: number;
      quantity: number;
      unitPrice: number;
      total: number;
      discount: number;
      product: {
        id: number;
        name: string;
        code: string;
        category: {
          name: string;
        };
      };
    }>;
  }>;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
  summary: {
    totalSales: number;
    totalSpent: number;
    averageOrderValue: number;
    minOrderValue: number;
    maxOrderValue: number;
  };
  filters: {
    status?: string;
    dateFrom?: Date;
    dateTo?: Date;
    minTotal?: number;
    maxTotal?: number;
  };
}

export class CustomerService {
  // Add this helper method
  private static decimalToNumber(value: unknown): number {
    if (typeof value === "number") return value;
    if (value && typeof value === "object" && "toNumber" in value) {
      return (value as Prisma.Decimal).toNumber();
    }
    return Number(value) || 0;
  }

  // =================== LIST CUSTOMERS ===================

  static async findMany(
  filters: unknown, // Changed from CustomerFiltersInput
  userRole: string
): Promise<{
  customers: CustomerListItem[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
  filters: CustomerFiltersInput  // Return complete validated filters
}> {
  try {
    // Validate filters - Zod will handle defaults and coercion
    const validatedFilters = customerFiltersSchema.parse(filters)

    const {
      search,
      type,
      city,
      state,
      isActive,
      hasEmail,
      hasDocument,
      hasPurchases,
      page,
      limit,
      sortBy,
      sortOrder
    } = validatedFilters

    // Build WHERE clause
    const where: Prisma.CustomerWhereInput = {
      // Default to active customers only
      isActive: isActive ?? true,
      
      // Type filter
      ...(type && { type }),
      
      // Location filters
      ...(city && { city: { contains: city, mode: 'insensitive' } }),
      ...(state && { state: { equals: state, mode: 'insensitive' } }),
      
      // Conditional filters
      ...(hasEmail !== undefined && {
        email: hasEmail ? { not: null } : null
      }),
      ...(hasDocument !== undefined && {
        document: hasDocument ? { not: null } : null
      }),
      
      // Text search
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
          { document: { contains: cleanDocument(search) } },
          { phone: { contains: search } }
        ]
      })
    }

    // Filter for customers with/without purchases
    if (hasPurchases !== undefined) {
      if (hasPurchases) {
        where.sales = { some: {} }
      } else {
        where.sales = { none: {} }
      }
    }

    // Configure ordering
    let orderBy: Prisma.CustomerOrderByWithRelationInput = {}

    if (sortBy === 'lastPurchase') {
      orderBy = {
        sales: {
          _count: sortOrder as Prisma.SortOrder
        }
      }
    } else {
      orderBy = { [sortBy]: sortOrder as Prisma.SortOrder }
    }

    // Calculate offset for pagination
    const offset = (page - 1) * limit

    // Fetch customers and total
    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where,
        include: {
          _count: {
            select: { sales: true }
          },
          // For admins/managers, include basic statistics
          ...((['ADMIN', 'MANAGER'].includes(userRole)) && {
            sales: {
              where: { status: 'COMPLETED' },
              select: {
                total: true,
                saleDate: true
              },
              orderBy: { saleDate: 'desc' },
              take: 1 // Last purchase
            }
          })
        },
        orderBy,
        skip: offset,
        take: limit
      }),
      prisma.customer.count({ where })
    ]);

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPrevPage = page > 1;

      // Format customers for response
      const formattedCustomers = customers.map(
        (customer: any): CustomerListItem => {
          const lastSale = customer.sales?.[0];

          return {
            id: customer.id,
            name: customer.name,
            email: customer.email,
            phone: customer.phone,
            document: customer.document
              ? customer.document.length === 11
                ? formatCPF(customer.document)
                : formatCNPJ(customer.document)
              : null,
            type: customer.type as CustomerType,
            address: customer.address,
            neighborhood: customer.neighborhood,
            city: customer.city,
            state: customer.state,
            zipCode: customer.zipCode,
            isActive: customer.isActive,
            createdAt: customer.createdAt,
            updatedAt: customer.updatedAt,
            salesCount: customer._count.sales,
            // Include purchase data for admins/managers
            ...(lastSale && {
              lastPurchase: {
                date: lastSale.saleDate,
                amount: this.decimalToNumber(lastSale.total), // Convert Decimal
              },
            }),
          };
        }
      );

      return {
        customers: formattedCustomers,
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
        filters: validatedFilters, // Return complete validated filters
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao buscar clientes", 500);
    }
  }

  // =================== CREATE CUSTOMER ===================

  static async create(data: CreateCustomerInput): Promise<CustomerListItem> {
    try {
      // Validate input data
      const validatedData = createCustomerSchema.parse(data);

      // Check business rules
      const businessRuleErrors = validateCustomerBusinessRules(validatedData);
      if (businessRuleErrors.length > 0) {
        throw new ApiError(businessRuleErrors.join(", "), 400);
      }

      // Check if email already exists (if provided)
      if (validatedData.email) {
        const existingEmail = await prisma.customer.findUnique({
          where: { email: validatedData.email },
        });

        if (existingEmail) {
          throw new ApiError(
            "Email já está sendo usado por outro cliente",
            409
          );
        }
      }

      // Check if document already exists (if provided)
      if (validatedData.document) {
        const existingDocument = await prisma.customer.findUnique({
          where: { document: validatedData.document },
        });

        if (existingDocument) {
          throw new ApiError(
            "Documento já está sendo usado por outro cliente",
            409
          );
        }
      }

      // Create customer with neighborhood field
      const customer = await prisma.customer.create({
        data: {
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
          document: validatedData.document,
          type: validatedData.type,
          address: validatedData.address,
          neighborhood: validatedData.neighborhood,
          city: validatedData.city,
          state: validatedData.state,
          zipCode: validatedData.zipCode,
          isActive: validatedData.isActive,
        },
        include: {
          _count: {
            select: { sales: true },
          },
        },
      });

      // Format response with proper typing
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document
          ? customer.document.length === 11
            ? formatCPF(customer.document)
            : formatCNPJ(customer.document)
          : null,
        type: customer.type as CustomerType,
        address: customer.address,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,
        salesCount: customer._count.sales,
      } as CustomerListItem;
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if ((error as any).code === "P2002") {
        const meta = (error as any).meta;
        if (meta?.target?.includes("email")) {
          throw new ApiError(
            "Email já está sendo usado por outro cliente",
            409
          );
        }
        if (meta?.target?.includes("document")) {
          throw new ApiError(
            "Documento já está sendo usado por outro cliente",
            409
          );
        }
      }

      throw new ApiError("Erro ao criar cliente", 500);
    }
  }

  // =================== GET CUSTOMER WITH STATISTICS ===================

  static async findByIdWithStats(
    customerId: number
  ): Promise<CustomerWithStatistics> {
    try {
      // Find customer with statistics
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          _count: {
            select: { sales: true },
          },
          // Detailed sales data for analysis
          sales: {
            where: { status: "COMPLETED" },
            select: {
              id: true,
              total: true,
              saleDate: true,
              items: {
                select: {
                  quantity: true,
                  total: true,
                  product: {
                    select: {
                      name: true,
                      category: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            },
            orderBy: { saleDate: "desc" },
          },
        },
      });

      if (!customer) {
        throw new ApiError(CUSTOMER_ERROR_MESSAGES.NOT_FOUND, 404);
      }

      // Calculate statistics with Decimal conversion
      const completedSales = customer.sales;
      const totalSpent = completedSales.reduce(
        (sum: number, sale: any) => sum + this.decimalToNumber(sale.total),
        0
      );
      const averageOrderValue =
        completedSales.length > 0 ? totalSpent / completedSales.length : 0;

      // First and last purchase
      const sortedSales = [...completedSales].sort(
        (a, b) =>
          new Date(a.saleDate).getTime() - new Date(b.saleDate).getTime()
      );
      const firstPurchase = sortedSales[0]?.saleDate;
      const lastPurchase = sortedSales[sortedSales.length - 1]?.saleDate;

      // Most purchased categories
      const categoryPurchases = new Map<
        string,
        { count: number; total: number }
      >();

      completedSales.forEach((sale: any) => {
        sale.items.forEach((item: any) => {
          const categoryName = item.product.category.name;
          const existing = categoryPurchases.get(categoryName) || {
            count: 0,
            total: 0,
          };
          existing.count += item.quantity;
          existing.total += Number(item.total);
          categoryPurchases.set(categoryName, existing);
        });
      });

      const favoriteCategories = Array.from(categoryPurchases.entries())
        .map(([categoryName, data]) => ({
          categoryName,
          purchaseCount: data.count,
          totalSpent: data.total,
        }))
        .sort((a, b) => b.totalSpent - a.totalSpent)
        .slice(0, 5); // Top 5 categories

      // Format response with proper typing including neighborhood
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        document: customer.document
          ? customer.document.length === 11
            ? formatCPF(customer.document)
            : formatCNPJ(customer.document)
          : null,
        type: customer.type as CustomerType,
        address: customer.address,
        neighborhood: customer.neighborhood,
        city: customer.city,
        state: customer.state,
        zipCode: customer.zipCode,
        isActive: customer.isActive,
        createdAt: customer.createdAt,
        updatedAt: customer.updatedAt,

        // Statistics
        statistics: {
          totalSales: customer._count.sales,
          totalSpent,
          averageOrderValue,
          firstPurchase,
          lastPurchase,
          favoriteCategories,
        },

        // Recent sales (last 5)
        recentSales: completedSales.slice(0, 5).map((sale: any) => ({
          id: sale.id,
          total: this.decimalToNumber(sale.total),
          saleDate: sale.saleDate,
          itemCount: sale.items.length,
        })),
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao buscar cliente", 500);
    }
  }

  // =================== UPDATE CUSTOMER ===================

  static async update(
    customerId: number,
    data: UpdateCustomerInput
  ): Promise<CustomerListItem> {
    try {
      // Validate input data
      const validatedData = updateCustomerSchema.parse({
        ...data,
        id: customerId,
      });

      // Check business rules
      const businessRuleErrors = validateCustomerBusinessRules(validatedData);
      if (businessRuleErrors.length > 0) {
        throw new ApiError(businessRuleErrors.join(", "), 400);
      }

      // Check if customer exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!existingCustomer) {
        throw new ApiError(CUSTOMER_ERROR_MESSAGES.NOT_FOUND, 404);
      }

      // Check if email already exists (if being changed)
      if (
        validatedData.email &&
        validatedData.email !== existingCustomer.email
      ) {
        const emailExists = await prisma.customer.findUnique({
          where: { email: validatedData.email },
        });

        if (emailExists) {
          throw new ApiError(
            "Email já está sendo usado por outro cliente",
            409
          );
        }
      }

      // Check if document already exists (if being changed)
      if (
        validatedData.document &&
        validatedData.document !== existingCustomer.document
      ) {
        const documentExists = await prisma.customer.findUnique({
          where: { document: validatedData.document },
        });

        if (documentExists) {
          throw new ApiError(
            "Documento já está sendo usado por outro cliente",
            409
          );
        }
      }

      // Update customer
      const updatedCustomer = await prisma.customer.update({
        where: { id: customerId },
        data: {
          ...(validatedData.name && { name: validatedData.name }),
          ...(validatedData.email !== undefined && {
            email: validatedData.email,
          }),
          ...(validatedData.phone !== undefined && {
            phone: validatedData.phone,
          }),
          ...(validatedData.document !== undefined && {
            document: validatedData.document,
          }),
          ...(validatedData.type && { type: validatedData.type }),
          ...(validatedData.address !== undefined && {
            address: validatedData.address,
          }),
          ...(validatedData.city !== undefined && { city: validatedData.city }),
          ...(validatedData.state !== undefined && {
            state: validatedData.state,
          }),
          ...(validatedData.zipCode !== undefined && {
            zipCode: validatedData.zipCode,
          }),
          ...(validatedData.neighborhood !== undefined && {
            neighborhood: validatedData.neighborhood,
          }),
          ...(validatedData.isActive !== undefined && {
            isActive: validatedData.isActive,
          }),
        },
        include: {
          _count: {
            select: { sales: true },
          },
        },
      });

      // Format response with proper typing
      return {
        id: updatedCustomer.id,
        name: updatedCustomer.name,
        email: updatedCustomer.email,
        phone: updatedCustomer.phone,
        document: updatedCustomer.document
          ? updatedCustomer.document.length === 11
            ? formatCPF(updatedCustomer.document)
            : formatCNPJ(updatedCustomer.document)
          : null,
        type: updatedCustomer.type as CustomerType,
        address: updatedCustomer.address,
        neighborhood: updatedCustomer.neighborhood,
        city: updatedCustomer.city,
        state: updatedCustomer.state,
        zipCode: updatedCustomer.zipCode,
        isActive: updatedCustomer.isActive,
        createdAt: updatedCustomer.createdAt,
        updatedAt: updatedCustomer.updatedAt,
        salesCount: updatedCustomer._count.sales,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if ((error as any).code === "P2002") {
        const meta = (error as any).meta;
        if (meta?.target?.includes("email")) {
          throw new ApiError(
            "Email já está sendo usado por outro cliente",
            409
          );
        }
        if (meta?.target?.includes("document")) {
          throw new ApiError(
            "Documento já está sendo usado por outro cliente",
            409
          );
        }
      }

      throw new ApiError("Erro ao atualizar cliente", 500);
    }
  }

  // =================== DELETE CUSTOMER ===================

  static async delete(customerId: number): Promise<{
    message: string;
    customer: {
      id: number;
      name: string;
      isActive?: boolean;
    };
  }> {
    try {
      // Check if customer exists
      const existingCustomer = await prisma.customer.findUnique({
        where: { id: customerId },
        include: {
          _count: {
            select: { sales: true },
          },
        },
      });

      if (!existingCustomer) {
        throw new ApiError(CUSTOMER_ERROR_MESSAGES.NOT_FOUND, 404);
      }

      // Check if customer has sales (soft delete only)
      if (existingCustomer._count.sales > 0) {
        // Soft delete - just deactivate
        const deactivatedCustomer = await prisma.customer.update({
          where: { id: customerId },
          data: { isActive: false },
        });

        return {
          message:
            "Cliente desativado com sucesso (possui histórico de vendas)",
          customer: {
            id: deactivatedCustomer.id,
            name: deactivatedCustomer.name,
            isActive: deactivatedCustomer.isActive,
          },
        };
      } else {
        // Hard delete if no sales
        await prisma.customer.delete({
          where: { id: customerId },
        });

        return {
          message: "Cliente deletado com sucesso",
          customer: {
            id: existingCustomer.id,
            name: existingCustomer.name,
          },
        };
      }
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao excluir cliente", 500);
    }
  }

  // =================== GET CUSTOMER SALES ===================

  // Fix the CustomerSalesFilters interface to match Prisma enums
  static async getCustomerSales(
    customerId: number,
    filters: CustomerSalesFilters
  ): Promise<CustomerSalesResponse> {
    try {
      // Check if customer exists
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true, name: true, type: true, isActive: true },
      });

      if (!customer) {
        throw new ApiError(CUSTOMER_ERROR_MESSAGES.NOT_FOUND, 404);
      }

      const {
        status,
        dateFrom,
        dateTo,
        minTotal,
        maxTotal,
        page,
        limit,
        sortBy,
        sortOrder,
        includeItems,
      } = filters;

      // Build filters with correct status values
      const where: Prisma.SaleWhereInput = {
        customerId: customerId,
        // Filter out invalid status values for Prisma
        ...(status &&
          ["PENDING", "COMPLETED", "CANCELLED", "REFUNDED"].includes(
            status
          ) && {
            status: status as
              | "PENDING"
              | "COMPLETED"
              | "CANCELLED"
              | "REFUNDED",
          }),
        ...(dateFrom && { saleDate: { gte: dateFrom } }),
        ...(dateTo && { saleDate: { lte: dateTo } }),
        ...(minTotal && { total: { gte: minTotal } }),
        ...(maxTotal && { total: { lte: maxTotal } }),
      };

      // Calculate offset for pagination
      const offset = (page - 1) * limit;

      // Fetch sales and total
      const [sales, total] = await Promise.all([
        prisma.sale.findMany({
          where,
          include: {
            user: {
              select: { id: true, name: true },
            },
            ...(includeItems && {
              items: {
                include: {
                  product: {
                    select: {
                      id: true,
                      name: true,
                      code: true,
                      category: {
                        select: { name: true },
                      },
                    },
                  },
                },
              },
            }),
            _count: {
              select: { items: true },
            },
          },
          orderBy: { [sortBy]: sortOrder as Prisma.SortOrder },
          skip: offset,
          take: limit,
        }),
        prisma.sale.count({ where }),
      ]);

      // Calculate period statistics
      const periodStats = await prisma.sale.aggregate({
        where,
        _count: { id: true },
        _sum: { total: true },
        _avg: { total: true },
        _min: { total: true },
        _max: { total: true },
      });

      // Calculate pagination info
      const totalPages = Math.ceil(total / limit);

      return {
        customer: {
          id: customer.id,
          name: customer.name,
          type: customer.type as CustomerType,
          isActive: customer.isActive,
        },
        sales: sales.map((sale: any) => ({
          id: sale.id,
          total: this.decimalToNumber(sale.total), // Convert Decimal
          discount: this.decimalToNumber(sale.discount), // Convert Decimal
          tax: this.decimalToNumber(sale.tax), // Convert Decimal
          status: sale.status,
          notes: sale.notes,
          saleDate: sale.saleDate,
          createdAt: sale.createdAt,
          itemCount: sale._count.items,
          user: sale.user,
          ...(includeItems && {
            items: sale.items?.map((item: any) => ({
              id: item.id,
              quantity: item.quantity,
              unitPrice: this.decimalToNumber(item.unitPrice), // Convert Decimal
              total: this.decimalToNumber(item.total), // Convert Decimal
              discount: this.decimalToNumber(item.discount), // Convert Decimal
              product: item.product,
            })),
          }),
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1,
        },
        summary: {
          totalSales: periodStats._count.id || 0,
          totalSpent: this.decimalToNumber(periodStats._sum.total), // Convert Decimal
          averageOrderValue: this.decimalToNumber(periodStats._avg.total), // Convert Decimal
          minOrderValue: this.decimalToNumber(periodStats._min.total), // Convert Decimal
          maxOrderValue: this.decimalToNumber(periodStats._max.total), // Convert Decimal
        },
        filters: {
          status,
          dateFrom,
          dateTo,
          minTotal,
          maxTotal,
        },
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao buscar vendas do cliente", 500);
    }
  }

  // =================== VALIDATE DOCUMENT ===================

  static async validateDocument(data: ValidateDocumentInput): Promise<{
    isValid: boolean;
    type: string;
    document: string;
    formattedDocument: string;
    error?: string;
  }> {
    try {
      // Validate input data
      const { document, type } = validateDocumentSchema.parse(data);

      const cleanDoc = cleanDocument(document);

      // Determine type automatically if not provided
      let documentType = type;
      if (!documentType) {
        if (cleanDoc.length === 11) {
          documentType = "CPF";
        } else if (cleanDoc.length === 14) {
          documentType = "CNPJ";
        } else {
          return {
            isValid: false,
            type: "INVALID",
            document: cleanDoc,
            formattedDocument: cleanDoc,
            error: "Documento deve ter 11 dígitos (CPF) ou 14 dígitos (CNPJ)",
          };
        }
      }

      // Validate document
      let isValid = false;
      let formattedDocument = cleanDoc;
      let errorMessage = "";

      if (documentType === "CPF") {
        if (cleanDoc.length !== 11) {
          errorMessage = "CPF deve ter exatamente 11 dígitos";
        } else {
          isValid = isValidCPF(cleanDoc);
          formattedDocument = formatCPF(cleanDoc);
          if (!isValid) {
            errorMessage = "CPF inválido";
          }
        }
      } else if (documentType === "CNPJ") {
        if (cleanDoc.length !== 14) {
          errorMessage = "CNPJ deve ter exatamente 14 dígitos";
        } else {
          isValid = isValidCNPJ(cleanDoc);
          formattedDocument = formatCNPJ(cleanDoc);
          if (!isValid) {
            errorMessage = "CNPJ inválido";
          }
        }
      }

      return {
        isValid,
        type: documentType,
        document: cleanDoc,
        formattedDocument,
        ...(errorMessage && { error: errorMessage }),
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro na validação do documento", 400);
    }
  }
}
