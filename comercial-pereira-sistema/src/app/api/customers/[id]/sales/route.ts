// app/api/customers/[id]/sales/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth";
import {
  CustomerService,
  type CustomerSalesFilters,
} from "@/lib/services/customers";
import { z } from "zod";
import { ApiError } from "@/lib/api-error";

interface RouteParams {
  params: {
    id: string;
  };
}

// Schema for customer sales filters
const customerSalesSchema = z.object({
  status: z
    .enum([
      "DRAFT",
      "PENDING",
      "CONFIRMED",
      "COMPLETED",
      "CANCELLED",
      "REFUNDED",
    ])
    .optional(),
  dateFrom: z.coerce.date().optional(),
  dateTo: z.coerce.date().optional(),
  minTotal: z.coerce.number().positive().optional(),
  maxTotal: z.coerce.number().positive().optional(),
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  sortBy: z.enum(["saleDate", "total", "status"]).default("saleDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeItems: z.coerce.boolean().default(false),
});

export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify authentication
    const user = await getAuthenticatedUser();

    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "ID do cliente inválido" },
        { status: 400 }
      );
    }

    // Extract search parameters
    const { searchParams } = new URL(request.url);
    const params_obj = Object.fromEntries(searchParams);

    // Validate parameters
    const validatedFilters = customerSalesSchema.parse(params_obj);

    // Get customer sales using service
    const result = await CustomerService.getCustomerSales(
      customerId,
      validatedFilters as CustomerSalesFilters
    );

    console.log(
      `✅ [${user.role}] ${user.email} consultou ${result.sales.length} vendas do cliente: ${result.customer.name}`
    );

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    const { error: errorMessage, statusCode } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}
