import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(products)
  } catch (error: any) {
    console.error('GET /api/products error:', error)

    return NextResponse.json(
      {
        error: 'Failed to fetch products',
        detail: error?.message ?? String(error)
      },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const name = String(body?.name ?? '').trim()
    const description = body?.description ? String(body.description) : null
    const category = body?.category ? String(body.category) : null
    const imageUrl = body?.imageUrl ? String(body.imageUrl) : null

    const rawPrice = body?.price
    const parsedPrice =
      typeof rawPrice === 'number'
        ? rawPrice
        : Number(String(rawPrice ?? '').replace(',', '.'))

    const product = await prisma.product.create({
      data: {
        name,
        description,
        category,
        imageUrl,
        price: Number.isFinite(parsedPrice) ? parsedPrice : null,
        status: 'pending'
      }
    })

    return NextResponse.json(product, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/products error:', error)

    return NextResponse.json(
      {
        error: 'Failed to create product',
        detail: error?.message ?? String(error)
      },
      { status: 500 }
    )
  }
}
