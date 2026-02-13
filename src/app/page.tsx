'use client'

import { useEffect, useMemo, useState } from 'react'
import { CheckCircle, Clock, Send } from 'lucide-react'

type Product = {
  id: string
  name: string
  category?: string
  price?: number
  status?: 'pending' | 'exported' | string
  createdAt?: string
  imageUrl?: string
}

type ProductsApiResponse =
  | Product[]
  | { products: Product[] }
  | { data: Product[] }
  | { items: Product[] }

function normalizeProducts(payload: ProductsApiResponse): Product[] {
  if (Array.isArray(payload)) return payload
  if (payload && Array.isArray((payload as any).products)) return (payload as any).products
  if (payload && Array.isArray((payload as any).data)) return (payload as any).data
  if (payload && Array.isArray((payload as any).items)) return (payload as any).items
  return []
}

export default function Dashboard() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)

  const fetchProducts = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/products', { cache: 'no-store' })
      const data: ProductsApiResponse = await res.json()
      setProducts(normalizeProducts(data))
    } catch (error) {
      console.error('Error fetching products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const pendingCount = useMemo(
    () => products.filter((p) => (p.status ?? 'pending') === 'pending').length,
    [products]
  )

  const handleExport = async () => {
    setExporting(true)
    try {
      const res = await fetch('/api/export', { method: 'POST' })
      const data = await res.json().catch(() => ({}))

      if (Array.isArray((data as any)?.results)) {
        const total = (data as any).results.length
        const success = (data as any).results.filter((r: any) => r.status === 'success').length
        alert(`Exportação concluída!\nSucesso: ${success}/${total} produtos.`)
      } else {
        alert((data as any)?.message || 'Exportação concluída!')
      }

      await fetchProducts()
    } catch (error) {
      console.error(error)
      alert('Erro ao exportar. Verifique suas configurações de API.')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold">Meus Itens</h2>
          <p className="text-gray-600">Gerencie seus produtos e exporte para marketplaces.</p>
        </div>

        <button
          onClick={handleExport}
          disabled={exporting || pendingCount === 0}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
        >
          {exporting ? (
            'Exportando...'
          ) : (
            <>
              <Send size={18} />
              Exportar Tudo
            </>
          )}
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20">Carregando itens...</div>
      ) : products.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-20 text-center border-2 border-dashed border-gray-200">
          <p className="text-gray-500 mb-4">Você ainda não tem itens adicionados.</p>
          <a href="/add" className="text-blue-600 font-semibold hover:underline">
            Adicionar meu primeiro item
          </a>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-4 font-semibold text-gray-700">Produto</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Categoria</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Preço</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Status</th>
                <th className="px-6 py-4 font-semibold text-gray-700">Data</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.imageUrl ? (
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 rounded-md object-cover"
                        />
                      ) : null}
                      <span className="font-medium text-gray-900">{product.name}</span>
                    </div>
                  </td>

                  <td className="px-6 py-4 text-gray-600">{product.category ?? '-'}</td>

                  <td className="px-6 py-4 text-gray-600">
                    R$ {typeof product.price === 'number' ? product.price.toFixed(2) : '0,00'}
                  </td>

                  <td className="px-6 py-4">
                    {(product.status ?? 'pending') === 'exported' ? (
                      <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                        <CheckCircle size={14} /> Exportado
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-amber-600 text-sm font-medium">
                        <Clock size={14} /> Pendente
                      </span>
                    )}
                  </td>

                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {product.createdAt ? new Date(product.createdAt).toLocaleDateString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
