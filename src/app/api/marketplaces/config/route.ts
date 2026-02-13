export const dynamic = "force-dynamic"
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET() {
  try {
    const configs = await prisma.marketplaceConfig.findMany()
    return NextResponse.json(configs)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch configs' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const { name, accessToken, refreshToken, expiresAt } = await request.json()

    const config = await prisma.marketplaceConfig.upsert({
      where: { name },
      update: {
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
      create: {
        name,
        accessToken,
        refreshToken,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    })

    return NextResponse.json(config)
  } catch (error) {
    console.error('Config error:', error)
    return NextResponse.json({ error: 'Failed to save config' }, { status: 500 })
  }
}
