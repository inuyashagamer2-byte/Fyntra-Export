import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { exportToMercadoLivre, exportToShopee, MarketplaceProduct, MarketplaceConfig } from '@/lib/marketplaces'

export const dynamic = 'force-dynamic'

interface ExportResult {
  productId: string
  status: 'success' | 'partial_error'
  markets: string[]
  error?: string
}

export async function POST() {
  try {
    const products = await prisma.product.findMany({
      where: { status: 'pending' }
    })

    if (products.length === 0) {
      return NextResponse.json({ message: 'No pending products to export' })
    }

    const configs = await prisma.marketplaceConfig.findMany()
    const mlConfig = configs.find((c: any) => c.name === 'Mercado Livre')
    const shopeeConfig = configs.find((c: any) => c.name === 'Shopee')

    const results: ExportResult[] = []

    for (const product of products) {
      const exportResults: ExportResult = { productId: product.id, status: 'success', markets: [] }
      
      try {
        const productData: MarketplaceProduct = {
          name: product.name,
          description: product.description || '',
          category: product.category || '',
          price: product.price || 0,
          imageUrl: product.imageUrl || ''
        }

        if (mlConfig) {
          await exportToMercadoLivre(productData, {
            accessToken: mlConfig.accessToken || '',
          })
          exportResults.markets.push('Mercado Livre')
        }
        
        if (shopeeConfig) {
          await exportToShopee(productData, {
            accessToken: shopeeConfig.accessToken || '',
            shopId: shopeeConfig.refreshToken || '' // We stored shopId in refreshToken
          })
          exportResults.markets.push('Shopee')
        }

        await prisma.product.update({
          where: { id: product.id },
          data: { status: 'exported' }
        })
      } catch (err: any) {
        exportResults.status = 'partial_error'
        exportResults.error = err.message
      }

      results.push(exportResults)
    }

    return NextResponse.json({ results })
  } catch (error: any) {
    console.error('Global Export Error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
