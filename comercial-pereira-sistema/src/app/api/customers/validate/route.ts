// app/api/customers/validate-document/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth";
import { CustomerService } from "@/lib/services/customers";
import { ApiError } from "@/lib/api-error";

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    await getAuthenticatedUser();

    // Get request body
    const body = await request.json();

    // Validate document using service
    const result = await CustomerService.validateDocument(body);

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
