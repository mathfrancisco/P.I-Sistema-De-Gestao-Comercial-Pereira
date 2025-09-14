// app/api/customers/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth";
import { CustomerService } from "@/lib/services/customers";
import { ApiError } from "@/lib/api-error";

interface RouteParams {
  params: {
    id: string;
  };
}

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

    // Get customer with statistics using service
    const customer = await CustomerService.findByIdWithStats(customerId);

    console.log(
      `✅ [${user.role}] ${user.email} consultou cliente: ${customer.name}`
    );

    return NextResponse.json(customer);
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

export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify permissions
    const user = await getAuthenticatedUser();
    if (!["ADMIN", "MANAGER", "SALESPERSON"].includes(user.role)) {
      return NextResponse.json(
        { error: "Permissão insuficiente para editar clientes" },
        { status: 403 }
      );
    }

    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "ID do cliente inválido" },
        { status: 400 }
      );
    }

    // Get request body
    const body = await request.json();

    // Update customer using service
    const updatedCustomer = await CustomerService.update(customerId, body);

    console.log(
      `✅ [${user.role}] ${user.email} atualizou cliente: ${updatedCustomer.name}`
    );

    return NextResponse.json(updatedCustomer);
  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific business errors
      if (error.statusCode === 409) {
        if (error.message.includes("Email")) {
          const email = (error as any).email || "N/A";
          return NextResponse.json(
            { error: error.message, email },
            { status: 409 }
          );
        }
        if (error.message.includes("Documento")) {
          const document = (error as any).document || "N/A";
          return NextResponse.json(
            { error: error.message, document },
            { status: 409 }
          );
        }
      }
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }

    const { error: errorMessage, statusCode } = handleApiError(error);
    return NextResponse.json({ error: errorMessage }, { status: statusCode });
  }
}

export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Verify permissions (only ADMIN and MANAGER can deactivate)
    const user = await getAuthenticatedUser();
    if (!["ADMIN", "MANAGER"].includes(user.role)) {
      return NextResponse.json(
        { error: "Permissão insuficiente para desativar clientes" },
        { status: 403 }
      );
    }

    const customerId = parseInt(params.id);

    if (isNaN(customerId)) {
      return NextResponse.json(
        { error: "ID do cliente inválido" },
        { status: 400 }
      );
    }

    // Delete/deactivate customer using service
    const result = await CustomerService.delete(customerId);

    console.log(
      `✅ [${user.role}] ${user.email} ${result.message.includes("desativou") ? "desativou" : "deletou"} cliente: ${result.customer.name}`
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
