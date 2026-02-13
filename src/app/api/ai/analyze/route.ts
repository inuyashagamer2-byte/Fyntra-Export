import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, imageUrl } = await request.json()

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: 'Name and imageUrl are required' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(
      process.env.GEMINI_API_KEY || 'AIzaSyBZJaEhdkM96qoJIwohWGN7bPmJIkEQ7uI'
    )

    const model = genAI.getGenerativeModel({
      model: 'gemini-3-flash-preview'
    })

    const prompt = `
You are a product expert for e-commerce (Mercado Livre, Shopee).

Given:
Product Name: ${name}
Product Image: ${imageUrl}

Return ONLY a valid JSON object with:
{
  "description": "professional description, max 500 chars",
  "category": "most accurate marketplace category",
  "suggested_price": number (BRL)
}
`

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: await fetchImageAsBase64(imageUrl)
        }
      }
    ])

    const response = await result.response
    const text = response.text()

    const cleaned = text.replace(/```json|```/g, '').trim()
    const details = JSON.parse(cleaned)

    return NextResponse.json(details)

  } catch (error: any) {
    console.error('Gemini Analysis Error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to analyze product' },
      { status: 500 }
    )
  }
}


// 🔥 Helper para converter imagem URL em base64
async function fetchImageAsBase64(url: string) {
  const res = await fetch(url)
  const buffer = await res.arrayBuffer()
  return Buffer.from(buffer).toString('base64')
}
