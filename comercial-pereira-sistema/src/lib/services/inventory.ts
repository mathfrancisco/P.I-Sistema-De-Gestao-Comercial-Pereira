// lib/services/inventory.ts
import { prisma } from "@/lib/db";
import {
  // Types
  type InventoryResponse,
  type MovementResponse,
  type InventoryListResponse,
  type MovementListResponse,
  type InventoryStatsResponse,
  type CreateInventoryRequest,
  type UpdateInventoryRequest,
  type StockAdjustmentRequest,
  type StockMovementRequest,
  type InventoryFilters,
  type MovementFilters,
  type StockCheckResponse,
  type InventorySelectOption,
  MovementType,

  // Utility functions
  isLowStock,
  isOutOfStock,

  // Constants
  INVENTORY_CONSTRAINTS,
} from "@/types/inventory";

import {
  // Validation schemas
  createInventorySchema,
  updateInventorySchema,
  stockAdjustmentSchema,
  stockMovementSchema,
  inventoryFiltersSchema,
  movementFiltersSchema,

  // Error messages
  INVENTORY_ERROR_MESSAGES,

  // Validation helpers
  validateStockMovement,
  validateStockAdjustment,
  validateInventoryBusinessRules,
} from "@/lib/validations/inventory";
import { Prisma } from "@prisma/client";

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class InventoryService {
  // =================== CREATE ===================

  static async createForProduct(
    productId: number,
    data?: Partial<CreateInventoryRequest>
  ): Promise<InventoryResponse> {
    try {
      // 1. Validate input data
      const validatedData = createInventorySchema.parse({
        productId,
        ...data,
      });

      // 2. Check business rules
      const businessRuleErrors = validateInventoryBusinessRules(validatedData);
      if (businessRuleErrors.length > 0) {
        throw new ApiError(businessRuleErrors.join(", "), 400);
      }

      // 3. Check if product exists and is active
      const product = await prisma.product.findUnique({
        where: { id: productId },
        include: {
          category: { select: { id: true, name: true } },
          supplier: { select: { id: true, name: true } },
        },
      });

      if (!product) {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 404);
      }

      if (!product.isActive) {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400);
      }

      // 4. Check if inventory already exists for this product
      const existingInventory = await prisma.inventory.findUnique({
        where: { productId },
      });

      if (existingInventory) {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.ALREADY_EXISTS, 409);
      }

      // 5. Create inventory with validated data
      const inventory = await prisma.inventory.create({
        data: {
          productId: validatedData.productId,
          quantity: validatedData.quantity ?? 0,
          minStock:
            validatedData.minStock ?? INVENTORY_CONSTRAINTS.MIN_STOCK_DEFAULT,
          maxStock: validatedData.maxStock,
          location: validatedData.location,
        },
      });

      return this.formatInventoryResponse(inventory, product);
    } catch (error) {
      if (error instanceof ApiError) throw error;

      if ((error as any).code === "P2002") {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.ALREADY_EXISTS, 409);
      }

      throw new ApiError("Erro ao criar registro de estoque", 500);
    }
  }

  // =================== READ ===================

  static async findMany(
    filters: InventoryFilters
  ): Promise<InventoryListResponse> {
    try {
      // Validate filters
      const validatedFilters = inventoryFiltersSchema.parse(filters);

      const {
        search,
        categoryId,
        supplierId,
        lowStock,
        outOfStock,
        hasStock,
        location,
        minQuantity,
        maxQuantity,
        lastUpdateAfter,
        lastUpdateBefore,
        page,
        limit,
        sortBy,
        sortOrder,
      } = validatedFilters;

      // Build WHERE clause
      const where: any = {
        product: {
          isActive: true,
          ...(search && {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { code: { contains: search, mode: "insensitive" as const } },
            ],
          }),
          ...(categoryId && { categoryId }),
          ...(supplierId && { supplierId }),
        },
        ...(location && {
          location: { contains: location, mode: "insensitive" as const },
        }),
        ...(minQuantity !== undefined && { quantity: { gte: minQuantity } }),
        ...(maxQuantity !== undefined && { quantity: { lte: maxQuantity } }),
        ...(lastUpdateAfter && { lastUpdate: { gte: lastUpdateAfter } }),
        ...(lastUpdateBefore && { lastUpdate: { lte: lastUpdateBefore } }),
        ...(outOfStock && { quantity: 0 }),
        ...(hasStock && { quantity: { gt: 0 } }),
      };

      // Add low stock filter using raw SQL
      if (lowStock) {
        where.quantity = { lte: prisma.inventory.fields.minStock };
      }

      // Define ordering
      const orderBy = this.buildInventoryOrderBy(sortBy, sortOrder);

      // Fetch data and total in parallel
      const [inventories, total, alerts] = await Promise.all([
        prisma.inventory.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            product: {
              include: {
                category: { select: { id: true, name: true } },
                supplier: { select: { id: true, name: true } },
              },
            },
          },
        }),
        prisma.inventory.count({ where }),
        this.getInventoryAlerts(),
      ]);

      // Calculate pagination info
      const pages = Math.ceil(total / limit);
      const hasNext = page < pages;
      const hasPrev = page > 1;

      return {
        data: inventories.map((inventory: any) =>
          this.formatInventoryResponse(inventory, inventory.product)
        ),
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext,
          hasPrev,
        },
        filters: validatedFilters,
        alerts,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao buscar registros de estoque", 500);
    }
  }

  static async findByProductId(productId: number): Promise<InventoryResponse> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId },
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true } },
              supplier: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!inventory) {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404);
      }

      return this.formatInventoryResponse(inventory, inventory.product);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao buscar registro de estoque", 500);
    }
  }

  static async findById(id: number): Promise<InventoryResponse> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { id },
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true } },
              supplier: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!inventory) {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404);
      }

      return this.formatInventoryResponse(inventory, inventory.product);
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao buscar registro de estoque", 500);
    }
  }

  // =================== UPDATE ===================

  static async update(
    id: number,
    data: UpdateInventoryRequest,
    currentUserId: number
  ): Promise<InventoryResponse> {
    try {
      // 1. Validate input data
      const validatedData = updateInventorySchema.parse(data);

      // 2. Check business rules
      const businessRuleErrors = validateInventoryBusinessRules(validatedData);
      if (businessRuleErrors.length > 0) {
        throw new ApiError(businessRuleErrors.join(", "), 400);
      }

      // 3. Check if inventory exists
      const existingInventory = await prisma.inventory.findUnique({
        where: { id },
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true } },
              supplier: { select: { id: true, name: true } },
            },
          },
        },
      });

      if (!existingInventory) {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404);
      }

      // 4. Check if product is active
      if (!existingInventory.product.isActive) {
        throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400);
      }

      // 5. Update inventory
      const updatedInventory = await prisma.inventory.update({
        where: { id },
        data: {
          ...validatedData,
          lastUpdate: new Date(),
        },
      });

      // 6. Log operation
      await this.logInventoryOperation(currentUserId, "UPDATE", id, {
        old: {
          quantity: existingInventory.quantity,
          minStock: existingInventory.minStock,
          maxStock: existingInventory.maxStock,
          location: existingInventory.location,
        },
        new: validatedData,
      });

      return this.formatInventoryResponse(
        updatedInventory,
        existingInventory.product
      );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao atualizar registro de estoque", 500);
    }
  }

  // =================== STOCK MOVEMENTS ===================

  static async adjustStock(
    data: StockAdjustmentRequest,
    currentUserId: number
  ): Promise<InventoryResponse> {
    try {
      // 1. Validate input data
      const validatedData = stockAdjustmentSchema.parse(data);
      const { productId, quantity, reason } = validatedData;

      return await prisma.$transaction(async (tx) => {
        // 2. Check if product exists and is active
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: {
            category: { select: { id: true, name: true } },
            supplier: { select: { id: true, name: true } },
          },
        });

        if (!product) {
          throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 404);
        }

        if (!product.isActive) {
          throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400);
        }

        // 3. Get current inventory
        const inventory = await tx.inventory.findUnique({
          where: { productId },
        });

        if (!inventory) {
          throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404);
        }

        // 4. Validate adjustment
        const validationErrors = validateStockAdjustment(
          validatedData,
          inventory.quantity
        );
        if (validationErrors.length > 0) {
          throw new ApiError(validationErrors.join(", "), 400);
        }

        // 5. Calculate new quantity
        const newQuantity = inventory.quantity + quantity;

        if (newQuantity < 0) {
          throw new ApiError(INVENTORY_ERROR_MESSAGES.NEGATIVE_STOCK, 400);
        }

        // 6. Update inventory
        const updatedInventory = await tx.inventory.update({
          where: { productId },
          data: {
            quantity: newQuantity,
            lastUpdate: new Date(),
          },
        });

        // 7. Record movement
        await tx.inventoryMovement.create({
          data: {
            productId,
            type: MovementType.ADJUSTMENT,
            quantity: Math.abs(quantity),
            reason,
            userId: currentUserId,
          },
        });

        return this.formatInventoryResponse(updatedInventory, product);
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao ajustar estoque", 500);
    }
  }

  static async addStock(
    productId: number,
    quantity: number,
    reason: string,
    currentUserId: number
  ): Promise<InventoryResponse> {
    const movement: StockMovementRequest = {
      productId,
      type: MovementType.IN,
      quantity,
      reason,
    };
    return this.processStockMovement(movement, currentUserId);
  }

  static async removeStock(
    productId: number,
    quantity: number,
    reason: string,
    currentUserId: number,
    saleId?: number
  ): Promise<InventoryResponse> {
    const movement: StockMovementRequest = {
      productId,
      type: MovementType.OUT,
      quantity,
      reason,
      saleId,
    };
    return this.processStockMovement(movement, currentUserId);
  }

  static async processStockMovement(
    data: StockMovementRequest,
    currentUserId: number
  ): Promise<InventoryResponse> {
    try {
      // 1. Validate input data
      const validatedData = stockMovementSchema.parse(data);
      const { productId, type, quantity, reason, saleId } = validatedData;

      return await prisma.$transaction(async (tx) => {
        // 2. Check product
        const product = await tx.product.findUnique({
          where: { id: productId },
          include: {
            category: { select: { id: true, name: true } },
            supplier: { select: { id: true, name: true } },
          },
        });

        if (!product) {
          throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_NOT_FOUND, 404);
        }

        if (!product.isActive) {
          throw new ApiError(INVENTORY_ERROR_MESSAGES.PRODUCT_INACTIVE, 400);
        }

        // 3. Get current inventory
        const inventory = await tx.inventory.findUnique({
          where: { productId },
        });

        if (!inventory) {
          throw new ApiError(INVENTORY_ERROR_MESSAGES.NOT_FOUND, 404);
        }

        // 4. Validate movement
        const validationErrors = validateStockMovement(
          validatedData,
          inventory.quantity
        );
        if (validationErrors.length > 0) {
          throw new ApiError(validationErrors.join(", "), 400);
        }

        // 5. Calculate new quantity
        let newQuantity: number;
        if (type === MovementType.IN) {
          newQuantity = inventory.quantity + quantity;
        } else if (type === MovementType.OUT) {
          newQuantity = inventory.quantity - quantity;
          if (newQuantity < 0) {
            throw new ApiError(
              INVENTORY_ERROR_MESSAGES.INSUFFICIENT_STOCK,
              400
            );
          }
        } else {
          throw new ApiError(
            INVENTORY_ERROR_MESSAGES.INVALID_MOVEMENT_TYPE,
            400
          );
        }

        // 6. Update inventory
        const updatedInventory = await tx.inventory.update({
          where: { productId },
          data: {
            quantity: newQuantity,
            lastUpdate: new Date(),
          },
        });

        // 7. Record movement
        await tx.inventoryMovement.create({
          data: {
            productId,
            type,
            quantity,
            reason,
            userId: currentUserId,
            saleId,
          },
        });

        return this.formatInventoryResponse(updatedInventory, product);
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao processar movimentação de estoque", 500);
    }
  }

  // =================== MOVEMENTS HISTORY ===================

  static async getMovements(
    filters: MovementFilters
  ): Promise<MovementListResponse> {
    try {
      // Validate filters
      const validatedFilters = movementFiltersSchema.parse(filters);

      const {
        productId,
        type,
        userId,
        saleId,
        reason,
        dateFrom,
        dateTo,
        page,
        limit,
        sortBy,
        sortOrder,
      } = validatedFilters;

      // Build WHERE clause
      const where: any = {
        ...(productId && { productId }),
        ...(type !== "ALL" && { type }),
        ...(userId && { userId }),
        ...(saleId && { saleId }),
        ...(reason && {
          reason: { contains: reason, mode: "insensitive" as const },
        }),
        ...(dateFrom && { createdAt: { gte: dateFrom } }),
        ...(dateTo && { createdAt: { lte: dateTo } }),
      };

      // Define ordering
      const orderBy = this.buildMovementOrderBy(sortBy, sortOrder);

      // Fetch data and total in parallel
      const [movements, total] = await Promise.all([
        prisma.inventoryMovement.findMany({
          where,
          skip: (page - 1) * limit,
          take: limit,
          orderBy,
          include: {
            product: { select: { id: true, name: true, code: true } },
            user: { select: { id: true, name: true } },
          },
        }),
        prisma.inventoryMovement.count({ where }),
      ]);

      // Calculate pagination info
      const pages = Math.ceil(total / limit);
      const hasNext = page < pages;
      const hasPrev = page > 1;

      return {
        data: movements.map(this.formatMovementResponse),
        pagination: {
          page,
          limit,
          total,
          pages,
          hasNext,
          hasPrev,
        },
        filters: validatedFilters,
      };
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError("Erro ao buscar movimentações de estoque", 500);
    }
  }

  static async getProductMovements(
    productId: number,
    limit: number = 20
  ): Promise<MovementResponse[]> {
    try {
      const movements = await prisma.inventoryMovement.findMany({
        where: { productId },
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          product: { select: { id: true, name: true, code: true } },
          user: { select: { id: true, name: true } },
        },
      });

      return movements.map(this.formatMovementResponse);
    } catch (error) {
      throw new ApiError("Erro ao buscar movimentações do produto", 500);
    }
  }

  // =================== ANALYTICS ===================

  static async getStatistics(): Promise<InventoryStatsResponse> {
    try {
      const [totalProducts, inventoryData, lowStockProducts, recentMovements] =
        await Promise.all([
          prisma.inventory.count({
            where: { product: { isActive: true } },
          }),
          prisma.inventory.findMany({
            where: { product: { isActive: true } },
            include: {
              product: { select: { name: true, price: true } },
            },
          }),
          prisma.inventory.findMany({
            where: {
              product: { isActive: true },
              quantity: { lte: prisma.inventory.fields.minStock },
            },
            include: {
              product: { select: { id: true, name: true } },
            },
            take: 10,
            orderBy: { quantity: "asc" },
          }),
          prisma.inventoryMovement.findMany({
            take: 10,
            orderBy: { createdAt: "desc" },
            include: {
              product: { select: { id: true, name: true, code: true } },
              user: { select: { id: true, name: true } },
            },
          }),
        ]);

      // Calculate statistics
      const totalValue = inventoryData.reduce(
        (sum: number, item: any) =>
          sum + item.quantity * Number(item.product.price),
        0
      );

      const lowStockCount = inventoryData.filter((item: any) =>
        isLowStock(item)
      ).length;

      const outOfStockCount = inventoryData.filter((item: any) =>
        isOutOfStock(item)
      ).length;

      const averageStock =
        totalProducts > 0
          ? inventoryData.reduce(
              (sum: number, item: any) => sum + item.quantity,
              0
            ) / totalProducts
          : 0;

      // Top products by inventory value
      const topProducts = inventoryData
        .map((item: any) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          value: item.quantity * Number(item.product.price),
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 10);

      return {
        totalProducts,
        totalValue,
        lowStockCount,
        outOfStockCount,
        averageStock,
        topProducts,
        lowStockProducts: lowStockProducts.map((item: any) => ({
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          minStock: item.minStock,
          location: item.location,
        })),
        recentMovements: recentMovements.map(this.formatMovementResponse),
      };
    } catch (error) {
      throw new ApiError("Erro ao obter estatísticas de estoque", 500);
    }
  }

  static async getLowStockAlert(): Promise<InventoryResponse[]> {
    try {
      const lowStockItems = await prisma.inventory.findMany({
        where: {
          product: { isActive: true },
          quantity: { lte: prisma.inventory.fields.minStock },
        },
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true } },
              supplier: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { quantity: "asc" },
      });

      return lowStockItems.map((inventory: any) =>
        this.formatInventoryResponse(inventory, inventory.product)
      );
    } catch (error) {
      throw new ApiError("Erro ao buscar alertas de estoque baixo", 500);
    }
  }

  static async getOutOfStockProducts(): Promise<InventoryResponse[]> {
    try {
      const outOfStockItems = await prisma.inventory.findMany({
        where: {
          product: { isActive: true },
          quantity: 0,
        },
        include: {
          product: {
            include: {
              category: { select: { id: true, name: true } },
              supplier: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { lastUpdate: "desc" },
      });

      return outOfStockItems.map((inventory: any) =>
        this.formatInventoryResponse(inventory, inventory.product)
      );
    } catch (error) {
      throw new ApiError("Erro ao buscar produtos sem estoque", 500);
    }
  }

  // =================== UTILITIES ===================

  static async checkStock(productId: number): Promise<StockCheckResponse> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId },
        select: { quantity: true, minStock: true },
      });

      if (!inventory) {
        return { available: false, quantity: 0, isLowStock: true };
      }

      return {
        available: inventory.quantity > 0,
        quantity: inventory.quantity,
        isLowStock: isLowStock(inventory),
      };
    } catch {
      return { available: false, quantity: 0, isLowStock: true };
    }
  }

  static async hasInventory(productId: number): Promise<boolean> {
    try {
      const inventory = await prisma.inventory.findUnique({
        where: { productId },
        select: { id: true },
      });
      return !!inventory;
    } catch {
      return false;
    }
  }

  static async reserveStock(
    productId: number,
    quantity: number
  ): Promise<boolean> {
    // This function can be used for more advanced systems with inventory reservation
    // For now, just check if there's available stock
    const { available, quantity: availableQty } =
      await this.checkStock(productId);
    return available && availableQty >= quantity;
  }

  static formatInventoryForSelect(inventory: any): InventorySelectOption {
    return {
      value: inventory.productId,
      label: `${inventory.product.name} - ${inventory.quantity} un.`,
      quantity: inventory.quantity,
      isLowStock: isLowStock(inventory),
    };
  }

  // =================== PRIVATE METHODS ===================

  private static formatInventoryResponse(
    inventory: any,
    product: any
  ): InventoryResponse {
    return {
      id: inventory.id,
      productId: inventory.productId,
      quantity: inventory.quantity,
      minStock: inventory.minStock,
      maxStock: inventory.maxStock,
      location: inventory.location,
      lastUpdate: inventory.lastUpdate,
      product: {
        id: product.id,
        name: product.name,
        code: product.code,
        price: Number(product.price),
        category: product.category,
        supplier: product.supplier,
      },
    };
  }

  private static formatMovementResponse(movement: any): MovementResponse {
    return {
      id: movement.id,
      productId: movement.productId,
      type: movement.type as MovementType,
      quantity: movement.quantity,
      reason: movement.reason,
      userId: movement.userId,
      saleId: movement.saleId,
      createdAt: movement.createdAt,
      product: movement.product,
      user: movement.user,
    };
  }

  private static buildInventoryOrderBy(
    sortBy: string,
    sortOrder: string
  ): Prisma.InventoryOrderByWithRelationInput {
    const order = sortOrder as Prisma.SortOrder;

    switch (sortBy) {
      case "productName":
        return { product: { name: order } };
      case "quantity":
        return { quantity: order };
      case "minStock":
        return { minStock: order };
      case "location":
        return { location: order };
      case "lastUpdate":
        return { lastUpdate: order };
      default:
        return { product: { name: "asc" } };
    }
  }

  private static buildMovementOrderBy(
    sortBy: string,
    sortOrder: string
  ): Prisma.InventoryMovementOrderByWithRelationInput {
    const order = sortOrder as Prisma.SortOrder;

    switch (sortBy) {
      case "createdAt":
        return { createdAt: order };
      case "productName":
        return { product: { name: order } };
      case "type":
        return { type: order };
      case "quantity":
        return { quantity: order };
      default:
        return { createdAt: "desc" };
    }
  }

  private static async getInventoryAlerts() {
    const [lowStock, outOfStock, totalProducts] = await Promise.all([
      prisma.inventory.count({
        where: {
          product: { isActive: true },
          quantity: { lte: prisma.inventory.fields.minStock },
        },
      }),
      prisma.inventory.count({
        where: {
          product: { isActive: true },
          quantity: 0,
        },
      }),
      prisma.inventory.count({
        where: { product: { isActive: true } },
      }),
    ]);

    return { lowStock, outOfStock, totalProducts };
  }

  private static async logInventoryOperation(
    currentUserId: number,
    action: string,
    targetInventoryId?: number,
    data?: any
  ): Promise<void> {
    try {
      console.log(
        `[INVENTORY_AUDIT] User ${currentUserId} performed ${action} on inventory ${targetInventoryId}`,
        {
          timestamp: new Date(),
          currentUserId,
          action,
          targetInventoryId,
          data,
        }
      );

      // TODO: Implement audit table in database if needed
    } catch (error) {
      console.error("Erro ao registrar log de auditoria:", error);
    }
  }
}
