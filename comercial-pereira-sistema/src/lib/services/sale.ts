// lib/services/sale.service.ts
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";
import {
  // Schemas
  createSaleSchema,
  updateSaleSchema,
  addSaleItemSchema,
  updateSaleItemSchema,
  saleFiltersSchema,
  validateStockSchema,
  applySaleDiscountSchema,
  changeSaleStatusSchema,

  // Types
  CreateSaleInput,
  UpdateSaleInput,
  AddSaleItemInput,
  UpdateSaleItemInput,
  SaleFiltersInput,
  ValidateStockInput,
  ApplySaleDiscountInput,
  ChangeSaleStatusInput,
  SaleResponse,
  SalesListResponse,
  ValidateStockResponse,

  // Utilities
  SaleStatus,
  DiscountType,
  SALE_CONSTRAINTS,
  SALE_ERROR_MESSAGES,
  canTransitionStatus,
  isSaleEditable,
  isSaleCancellable,
  calculateItemTotal,
  calculateSaleSubtotal,
  calculateSaleTotal,
  calculateDiscountAmount,
  canAccessSale,
  canEditSale,
  canPerformSpecialOperations,
  formatSaleNumber,
  getNextValidStatuses,
} from "@/lib/validations/sale";

export interface AuthUser {
  id: string;
  role: string;
  email: string;
}

export interface SaleServiceError {
  message: string;
  statusCode: number;
  details?: any;
}

export class SaleService {
  // ===== OPERAÇÕES BÁSICAS =====

  /**
   * Lista vendas com filtros e paginação
   */
  async listSales(
    filters: SaleFiltersInput,
    user: AuthUser
  ): Promise<SalesListResponse> {
    // Validar filtros
    const validatedFilters = saleFiltersSchema.parse(filters);

    const {
      customerId,
      userId,
      status,
      dateFrom,
      dateTo,
      minTotal,
      maxTotal,
      search,
      page = 1,
      limit = 10,
      sortBy = "saleDate",
      sortOrder = "desc",
      includeItems = false,
    } = validatedFilters;

    // Construir filtros do Prisma
    const where: Prisma.SaleWhereInput = {
      ...(customerId && { customerId }),
      ...(status && { status }),
      ...(dateFrom && { saleDate: { gte: dateFrom } }),
      ...(dateTo && { saleDate: { lte: dateTo } }),
      ...(minTotal && { total: { gte: minTotal } }),
      ...(maxTotal && { total: { lte: maxTotal } }),
      ...(search && {
        OR: [
          { notes: { contains: search, mode: "insensitive" } },
          { customer: { name: { contains: search, mode: "insensitive" } } },
        ],
      }),
    };

    // Filtro por usuário (vendedores só veem suas vendas)
    if (user.role === "SALESPERSON") {
      where.userId = parseInt(user.id);
    } else if (userId) {
      where.userId = userId;
    }

    // Calcular offset para paginação
    const offset = (page - 1) * limit;

    // Buscar vendas e total
    const [sales, total, summary] = await Promise.all([
      prisma.sale.findMany({
        where,
        include: {
          customer: {
            select: { id: true, name: true, type: true, document: true },
          },
          user: {
            select: { id: true, name: true, role: true },
          },
          _count: {
            select: { items: true },
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
                      select: { id: true, name: true },
                    },
                  },
                },
              },
            },
          }),
        },
        orderBy: { [sortBy]: sortOrder },
        skip: offset,
        take: limit,
      }),
      prisma.sale.count({ where }),
      this.calculateSalesSummary(where),
    ]);

    // Calcular informações de paginação
    const pages = Math.ceil(total / limit);

    return {
      data: sales.map((sale) => this.formatSaleResponse(sale)),
      pagination: {
        page,
        limit,
        total,
        pages,
        hasNext: page < pages,
        hasPrev: page > 1,
      },
      filters: validatedFilters,
      summary,
    };
  }

  /**
   * Busca uma venda por ID
   */
  async getSaleById(saleId: number, user: AuthUser): Promise<SaleResponse> {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: true,
        user: {
          select: { id: true, name: true, role: true },
        },
        items: {
          include: {
            product: {
              include: {
                category: {
                  select: { id: true, name: true },
                },
                inventory: {
                  select: { quantity: true },
                },
              },
            },
          },
        },
      },
    });

    if (!sale) {
      throw this.createError(SALE_ERROR_MESSAGES.NOT_FOUND, 404);
    }

    // Verificar permissões
    if (!canAccessSale(user.role, parseInt(user.id), sale.userId)) {
      throw this.createError(SALE_ERROR_MESSAGES.ACCESS_DENIED, 403);
    }

    return this.formatSaleResponse(sale);
  }

  /**
   * Cria uma nova venda
   */
  async createSale(
    data: CreateSaleInput,
    user: AuthUser
  ): Promise<SaleResponse> {
    // Validar dados
    const validatedData = createSaleSchema.parse(data);

    // Verificar se cliente existe e está ativo
    const customer = await prisma.customer.findUnique({
      where: { id: validatedData.customerId, isActive: true },
    });

    if (!customer) {
      throw this.createError(SALE_ERROR_MESSAGES.CUSTOMER_NOT_FOUND, 400);
    }

    // Validar produtos e estoque
    await this.validateProductsAndStock(validatedData.items);

    // Preparar itens com preços corretos
    const itemsWithPrices = await this.prepareItemsWithPrices(
      validatedData.items
    );

    // Calcular totais da venda
    const subtotal = calculateSaleSubtotal(itemsWithPrices);
    const total = calculateSaleTotal(
      subtotal,
      validatedData.discount,
      validatedData.tax
    );

    // Criar venda com transação
    const sale = await prisma.$transaction(async (tx) => {
      // Criar venda
      const newSale = await tx.sale.create({
        data: {
          userId: parseInt(user.id),
          customerId: validatedData.customerId,
          total,
          discount: validatedData.discount || 0,
          tax: validatedData.tax || 0,
          status: SaleStatus.DRAFT,
          notes: validatedData.notes,
          saleDate: new Date(),
        },
      });

      // Criar itens da venda
      await tx.saleItem.createMany({
        data: itemsWithPrices.map((item) => ({
          saleId: newSale.id,
          ...item,
        })),
      });

      return newSale;
    });

    // Buscar venda completa para resposta
    return await this.getSaleById(sale.id, user);
  }

  /**
   * Atualiza uma venda existente
   */
  async updateSale(
    saleId: number,
    data: UpdateSaleInput,
    user: AuthUser
  ): Promise<SaleResponse> {
    // Validar dados
    const validatedData = updateSaleSchema.parse(data);

    // Verificar se venda existe
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!existingSale) {
      throw this.createError(SALE_ERROR_MESSAGES.NOT_FOUND, 404);
    }

    // Verificar permissões
    if (
      !canEditSale(
        user.role,
        parseInt(user.id),
        existingSale.userId,
        existingSale.status as SaleStatus
      )
    ) {
      throw this.createError(
        !canAccessSale(user.role, parseInt(user.id), existingSale.userId)
          ? SALE_ERROR_MESSAGES.ACCESS_DENIED
          : SALE_ERROR_MESSAGES.SALE_NOT_EDITABLE,
        403
      );
    }

    // Verificar se cliente existe (se está sendo alterado)
    if (validatedData.customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: validatedData.customerId, isActive: true },
      });

      if (!customer) {
        throw this.createError(SALE_ERROR_MESSAGES.CUSTOMER_NOT_FOUND, 400);
      }
    }

    // Atualizar venda
    await prisma.sale.update({
      where: { id: saleId },
      data: {
        ...(validatedData.customerId && {
          customerId: validatedData.customerId,
        }),
        ...(validatedData.notes !== undefined && {
          notes: validatedData.notes,
        }),
        ...(validatedData.discount !== undefined && {
          discount: validatedData.discount,
        }),
        ...(validatedData.tax !== undefined && { tax: validatedData.tax }),
      },
    });

    return await this.getSaleById(saleId, user);
  }

  /**
   * Cancela uma venda (soft delete)
   */
  async cancelSale(
    saleId: number,
    user: AuthUser,
    reason?: string
  ): Promise<{ message: string; sale: any }> {
    // Verificar se venda existe
    const existingSale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: { select: { name: true } },
        items: true,
      },
    });

    if (!existingSale) {
      throw this.createError(SALE_ERROR_MESSAGES.NOT_FOUND, 404);
    }

    // Verificar permissões
    if (!canAccessSale(user.role, parseInt(user.id), existingSale.userId)) {
      throw this.createError(SALE_ERROR_MESSAGES.ACCESS_DENIED, 403);
    }

    // Verificar se venda pode ser cancelada
    if (!isSaleCancellable(existingSale.status as SaleStatus)) {
      throw this.createError(SALE_ERROR_MESSAGES.SALE_NOT_CANCELLABLE, 409);
    }

    // Cancelar venda (liberar estoque se estava reservado)
    const cancelledSale = await prisma.$transaction(async (tx) => {
      // Se venda estava confirmada, liberar estoque
      if (existingSale.status === SaleStatus.CONFIRMED) {
        for (const item of existingSale.items) {
          await tx.inventory.update({
            where: { productId: item.productId },
            data: {
              quantity: { increment: item.quantity },
            },
          });
        }
      }

      // Atualizar status para cancelado
      return await tx.sale.update({
        where: { id: saleId },
        data: { status: SaleStatus.CANCELLED },
      });
    });

    return {
      message: "Venda cancelada com sucesso",
      sale: {
        id: cancelledSale.id,
        status: cancelledSale.status,
        customer: existingSale.customer.name,
      },
    };
  }

  // ===== OPERAÇÕES DE ITENS =====

  /**
   * Adiciona um item à venda
   */
  async addSaleItem(
    saleId: number,
    data: AddSaleItemInput,
    user: AuthUser
  ): Promise<any> {
    // Validar dados
    const validatedData = addSaleItemSchema.parse(data);

    // Verificar se venda existe e pode ser editada
    const sale = await this.validateSaleEditability(saleId, user);

    // Verificar se produto existe e está ativo
    const product = await prisma.product.findUnique({
      where: { id: validatedData.productId, isActive: true },
      include: { inventory: true },
    });

    if (!product) {
      throw this.createError(SALE_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 400);
    }

    // Verificar estoque disponível
    if (
      product.inventory &&
      product.inventory.quantity < validatedData.quantity
    ) {
      throw this.createError(
        `${SALE_ERROR_MESSAGES.INSUFFICIENT_STOCK}. Disponível: ${product.inventory.quantity}, Solicitado: ${validatedData.quantity}`,
        400
      );
    }

    // Verificar se produto já está na venda
    const existingItem = await prisma.saleItem.findFirst({
      where: {
        saleId: saleId,
        productId: validatedData.productId,
      },
    });

    if (existingItem) {
      throw this.createError(SALE_ERROR_MESSAGES.ITEM_ALREADY_EXISTS, 409);
    }

    // Calcular preço e total
    const unitPrice = validatedData.unitPrice || Number(product.price);
    const total = calculateItemTotal(
      validatedData.quantity,
      unitPrice,
      validatedData.discount || 0
    );

    // Adicionar item à venda com transação
    const saleItem = await prisma.$transaction(async (tx) => {
      // Criar item
      const newItem = await tx.saleItem.create({
        data: {
          saleId: saleId,
          productId: validatedData.productId,
          quantity: validatedData.quantity,
          unitPrice: unitPrice,
          discount: validatedData.discount || 0,
          total: total,
        },
        include: {
          product: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      // Recalcular total da venda
      await this.recalculateSaleTotal(tx, saleId);

      return newItem;
    });

    return saleItem;
  }

  /**
   * Atualiza um item da venda
   */
  async updateSaleItem(
    saleId: number,
    itemId: number,
    data: UpdateSaleItemInput,
    user: AuthUser
  ): Promise<any> {
    // Validar dados
    const validatedData = updateSaleItemSchema.parse(data);

    // Verificar se venda existe e pode ser editada
    await this.validateSaleEditability(saleId, user);

    // Verificar se item existe
    const existingItem = await prisma.saleItem.findFirst({
      where: { id: itemId, saleId: saleId },
      include: { product: { include: { inventory: true } } },
    });

    if (!existingItem) {
      throw this.createError(SALE_ERROR_MESSAGES.ITEM_NOT_FOUND, 404);
    }

    // Verificar estoque se quantidade foi alterada
    if (
      validatedData.quantity &&
      validatedData.quantity !== existingItem.quantity
    ) {
      const product = existingItem.product;
      if (
        product.inventory &&
        product.inventory.quantity < validatedData.quantity
      ) {
        throw this.createError(
          `${SALE_ERROR_MESSAGES.INSUFFICIENT_STOCK}. Disponível: ${product.inventory.quantity}`,
          400
        );
      }
    }

    // Atualizar item com transação
    const updatedItem = await prisma.$transaction(async (tx) => {
      // Calcular novo total se necessário
      const quantity = validatedData.quantity ?? existingItem.quantity;
      const unitPrice = validatedData.unitPrice ?? existingItem.unitPrice;
      const discount = validatedData.discount ?? existingItem.discount;
      const total = calculateItemTotal(
        quantity,
        Number(unitPrice),
        Number(discount)
      );

      // Atualizar item
      const updated = await tx.saleItem.update({
        where: { id: itemId },
        data: {
          ...(validatedData.quantity && { quantity: validatedData.quantity }),
          ...(validatedData.unitPrice && {
            unitPrice: validatedData.unitPrice,
          }),
          ...(validatedData.discount !== undefined && {
            discount: validatedData.discount,
          }),
          total,
        },
        include: {
          product: {
            select: { id: true, name: true, code: true },
          },
        },
      });

      // Recalcular total da venda
      await this.recalculateSaleTotal(tx, saleId);

      return updated;
    });

    return updatedItem;
  }

  /**
   * Remove um item da venda
   */
  async removeSaleItem(
    saleId: number,
    itemId: number,
    user: AuthUser
  ): Promise<{ message: string }> {
    // Verificar se venda existe e pode ser editada
    await this.validateSaleEditability(saleId, user);

    // Verificar se item existe
    const existingItem = await prisma.saleItem.findFirst({
      where: { id: itemId, saleId: saleId },
    });

    if (!existingItem) {
      throw this.createError(SALE_ERROR_MESSAGES.ITEM_NOT_FOUND, 404);
    }

    // Remover item com transação
    await prisma.$transaction(async (tx) => {
      // Remover item
      await tx.saleItem.delete({
        where: { id: itemId },
      });

      // Recalcular total da venda
      await this.recalculateSaleTotal(tx, saleId);
    });

    return { message: "Item removido com sucesso" };
  }

  // ===== OPERAÇÕES DE STATUS =====

  /**
   * Confirma uma venda (reserva estoque)
   */
  async confirmSale(
    saleId: number,
    user: AuthUser
  ): Promise<{ message: string; sale: any }> {
    // Buscar venda com itens
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        items: {
          include: {
            product: {
              include: { inventory: true },
            },
          },
        },
        customer: { select: { name: true } },
      },
    });

    if (!sale) {
      throw this.createError(SALE_ERROR_MESSAGES.NOT_FOUND, 404);
    }

    // Verificar permissões
    if (!canAccessSale(user.role, parseInt(user.id), sale.userId)) {
      throw this.createError(SALE_ERROR_MESSAGES.ACCESS_DENIED, 403);
    }

    // Verificar se pode confirmar
    if (!canTransitionStatus(sale.status as SaleStatus, SaleStatus.CONFIRMED)) {
      throw this.createError(
        SALE_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
        409
      );
    }

    // Verificar se há itens
    if (sale.items.length === 0) {
      throw this.createError(SALE_ERROR_MESSAGES.NO_ITEMS, 400);
    }

    // Re-validar estoque
    await this.validateItemsStock(sale.items);

    // Confirmar venda e reservar estoque
    const confirmedSale = await prisma.$transaction(async (tx) => {
      // Reservar estoque
      for (const item of sale.items) {
        await tx.inventory.update({
          where: { productId: item.productId },
          data: { quantity: { decrement: item.quantity } },
        });
      }

      // Atualizar status
      return await tx.sale.update({
        where: { id: saleId },
        data: { status: SaleStatus.CONFIRMED },
      });
    });

    return {
      message: "Venda confirmada e estoque reservado com sucesso",
      sale: {
        id: confirmedSale.id,
        status: confirmedSale.status,
        total: confirmedSale.total,
        customer: sale.customer.name,
        itemCount: sale.items.length,
      },
    };
  }

  /**
   * Completa uma venda
   */
  async completeSale(
    saleId: number,
    user: AuthUser
  ): Promise<{ message: string; sale: any }> {
    // Buscar venda
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
      include: {
        customer: { select: { name: true } },
        items: { include: { product: { select: { name: true } } } },
      },
    });

    if (!sale) {
      throw this.createError(SALE_ERROR_MESSAGES.NOT_FOUND, 404);
    }

    // Verificar permissões
    if (!canAccessSale(user.role, parseInt(user.id), sale.userId)) {
      throw this.createError(SALE_ERROR_MESSAGES.ACCESS_DENIED, 403);
    }

    // Verificar se pode completar
    if (!canTransitionStatus(sale.status as SaleStatus, SaleStatus.COMPLETED)) {
      throw this.createError(
        SALE_ERROR_MESSAGES.INVALID_STATUS_TRANSITION,
        409
      );
    }

    // Completar venda
    const completedSale = await prisma.sale.update({
      where: { id: saleId },
      data: {
        status: SaleStatus.COMPLETED,
        saleDate: new Date(),
      },
    });

    return {
      message: "Venda completada com sucesso",
      sale: {
        id: completedSale.id,
        status: completedSale.status,
        total: completedSale.total,
        saleDate: completedSale.saleDate,
        customer: sale.customer.name,
        itemCount: sale.items.length,
      },
    };
  }

  // ===== OPERAÇÕES DE VALIDAÇÃO =====

  /**
   * Valida estoque para uma lista de itens
   */
  async validateStock(
    data: ValidateStockInput,
    user: AuthUser
  ): Promise<ValidateStockResponse> {
    // Validar dados
    const { items } = validateStockSchema.parse(data);

    // Buscar produtos e seus estoques
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: { inventory: true },
    });

    // Validar cada item
    const validationResults = items.map((item) => {
      const product = products.find((p) => p.id === item.productId);

      if (!product) {
        return {
          productId: item.productId,
          isValid: false,
          error: "Produto não encontrado ou inativo",
          requestedQuantity: item.quantity,
          availableQuantity: 0,
        };
      }

      if (!product.inventory) {
        return {
          productId: item.productId,
          productName: product.name,
          productCode: product.code,
          isValid: false,
          error: "Produto sem controle de estoque",
          requestedQuantity: item.quantity,
          availableQuantity: 0,
        };
      }

      const isValid = product.inventory.quantity >= item.quantity;

      return {
        productId: item.productId,
        productName: product.name,
        productCode: product.code,
        isValid,
        requestedQuantity: item.quantity,
        availableQuantity: product.inventory.quantity,
        ...(isValid
          ? {}
          : {
              error: "Estoque insuficiente",
              shortfall: item.quantity - product.inventory.quantity,
            }),
      };
    });

    // Calcular estatísticas
    const allValid = validationResults.every((result) => result.isValid);
    const invalidCount = validationResults.filter(
      (result) => !result.isValid
    ).length;

    return {
      isValid: allValid,
      totalItems: items.length,
      validItems: items.length - invalidCount,
      invalidItems: invalidCount,
      validationResults,
      summary: {
        canProceed: allValid,
        message: allValid
          ? "Todos os itens têm estoque suficiente"
          : `${invalidCount} item(ns) com estoque insuficiente`,
      },
    };
  }

  // ===== MÉTODOS AUXILIARES =====

  private async validateSaleEditability(saleId: number, user: AuthUser) {
    const sale = await prisma.sale.findUnique({
      where: { id: saleId },
    });

    if (!sale) {
      throw this.createError(SALE_ERROR_MESSAGES.NOT_FOUND, 404);
    }

    if (
      !canEditSale(
        user.role,
        parseInt(user.id),
        sale.userId,
        sale.status as SaleStatus
      )
    ) {
      throw this.createError(
        !canAccessSale(user.role, parseInt(user.id), sale.userId)
          ? SALE_ERROR_MESSAGES.ACCESS_DENIED
          : SALE_ERROR_MESSAGES.SALE_NOT_EDITABLE,
        403
      );
    }

    return sale;
  }

  private async validateProductsAndStock(items: CreateSaleInput["items"]) {
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
      include: { inventory: true },
    });

    if (products.length !== productIds.length) {
      throw this.createError(SALE_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 400);
    }

    // Validar estoque
    const stockErrors = [];
    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (product?.inventory && product.inventory.quantity < item.quantity) {
        stockErrors.push({
          productId: item.productId,
          productName: product.name,
          requested: item.quantity,
          available: product.inventory.quantity,
        });
      }
    }

    if (stockErrors.length > 0) {
      throw this.createError(
        `${SALE_ERROR_MESSAGES.INSUFFICIENT_STOCK}`,
        400,
        stockErrors
      );
    }
  }

  private async validateItemsStock(items: any[]) {
    const stockErrors = [];
    for (const item of items) {
      if (
        item.product.inventory &&
        item.product.inventory.quantity < item.quantity
      ) {
        stockErrors.push({
          productId: item.productId,
          productName: item.product.name,
          requested: item.quantity,
          available: item.product.inventory.quantity,
        });
      }
    }

    if (stockErrors.length > 0) {
      throw this.createError(
        `${SALE_ERROR_MESSAGES.INSUFFICIENT_STOCK}`,
        400,
        stockErrors
      );
    }
  }

  private async prepareItemsWithPrices(items: CreateSaleInput["items"]) {
    const productIds = items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    return items.map((item) => {
      const product = products.find((p) => p.id === item.productId)!;
      const unitPrice = item.unitPrice || Number(product.price);
      const total = calculateItemTotal(
        item.quantity,
        unitPrice,
        item.discount || 0
      );

      return {
        productId: item.productId,
        quantity: item.quantity,
        unitPrice,
        discount: item.discount || 0,
        total,
      };
    });
  }

  private async recalculateSaleTotal(tx: any, saleId: number) {
    const sale = await tx.sale.findUnique({
      where: { id: saleId },
      include: { items: true },
    });

    const subtotal = sale.items.reduce(
      (sum: number, item: any) => sum + Number(item.total),
      0
    );

    const total = calculateSaleTotal(
      subtotal,
      Number(sale.discount || 0),
      Number(sale.tax || 0)
    );

    await tx.sale.update({
      where: { id: saleId },
      data: { total },
    });
  }

  private async calculateSalesSummary(where: Prisma.SaleWhereInput) {
    const summary = await prisma.sale.aggregate({
      where,
      _count: { id: true },
      _sum: { total: true },
      _avg: { total: true },
    });

    const totalQuantity = await prisma.saleItem.aggregate({
      where: {
        sale: where,
      },
      _sum: { quantity: true },
    });

    return {
      totalSales: summary._count.id,
      totalRevenue: Number(summary._sum.total || 0),
      averageOrderValue: Number(summary._avg.total || 0),
      totalQuantity: totalQuantity._sum.quantity || 0,
    };
  }

  private formatSaleResponse(sale: any): SaleResponse {
    return {
      id: sale.id,
      userId: sale.userId,
      customerId: sale.customerId,
      total: Number(sale.total),
      discount: sale.discount ? Number(sale.discount) : undefined,
      tax: sale.tax ? Number(sale.tax) : undefined,
      status: sale.status,
      notes: sale.notes,
      saleDate: sale.saleDate,
      createdAt: sale.createdAt,
      updatedAt: sale.updatedAt,
      user: sale.user,
      customer: sale.customer,
      items: sale.items?.map((item: any) => ({
        id: item.id,
        saleId: item.saleId,
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
        total: Number(item.total),
        discount: Number(item.discount),
        product: item.product,
      })),
      _count: sale._count,
    };
  }

  private createError(
    message: string,
    statusCode: number,
    details?: any
  ): SaleServiceError {
    const error = new Error(message) as any;
    error.statusCode = statusCode;
    error.details = details;
    return error;
  }
}

// Instância singleton do service
export const saleService = new SaleService();
