// app/api/customers/route.ts
import { NextRequest, NextResponse } from "next/server"
import { getAuthenticatedUser, handleApiError } from "@/lib/api-auth"
import { CustomerService } from "@/lib/services/customers"
import { ApiError } from "@/lib/api-error"


export async function GET(request: NextRequest) {
  try {
    // Verify authentication (everyone can list customers)
    const user = await getAuthenticatedUser()
    
    // Extract search parameters
    const { searchParams } = new URL(request.url)
    const params = Object.fromEntries(searchParams)
    
    // Get customers using service
    const result = await CustomerService.findMany(params, user.role)

    console.log(`✅ [${user.role}] ${user.email} listou ${result.customers.length} clientes`)

    return NextResponse.json({
      customers: result.customers,
      pagination: result.pagination,
      filters: result.filters
    })

  } catch (error) {
    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify permissions (SALESPERSON, MANAGER and ADMIN can create customers)
    const user = await getAuthenticatedUser()
    if (!['ADMIN', 'MANAGER', 'SALESPERSON'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Permissão insuficiente para criar clientes' },
        { status: 403 }
      )
    }

    // Get request body
    const body = await request.json()
    
    // Create customer using service
    const customer = await CustomerService.create(body)

    console.log(`✅ [${user.role}] ${user.email} criou cliente: ${customer.name} (${customer.type})`)

    return NextResponse.json(customer, { status: 201 })

  } catch (error) {
    if (error instanceof ApiError) {
      // Handle specific business errors
      if (error.statusCode === 409) {
        if (error.message.includes('Email')) {
          const email = (error as any).email || 'N/A'
          return NextResponse.json(
            { error: error.message, email },
            { status: 409 }
          )
        }
        if (error.message.includes('Documento')) {
          const document = (error as any).document || 'N/A'
          return NextResponse.json(
            { error: error.message, document },
            { status: 409 }
          )
        }
      }
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }

    const { error: errorMessage, statusCode } = handleApiError(error)
    return NextResponse.json({ error: errorMessage }, { status: statusCode })
  }
}