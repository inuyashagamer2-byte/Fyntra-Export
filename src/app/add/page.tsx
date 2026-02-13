'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sparkles, Save, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AddProduct() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    imageUrl: '',
    description: '',
    category: '',
    price: '' // string no input, mas vamos converter no submit
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleMagicFill = async () => {
    if (!formData.name || !formData.imageUrl) {
      alert('Preencha pelo menos o Nome e o Link da Imagem para usar a IA.')
      return
    }

    setAnalyzing(true)
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formData.name, imageUrl: formData.imageUrl })
      })

      const data = await res.json().catch(() => ({}))

      if (!res.ok) {
        throw new Error(data?.error || data?.message || 'Falha ao analisar imagem.')
      }

      setFormData((prev) => ({
        ...prev,
        description: data.description || prev.description,
        category: data.category || prev.category,
        price: (data.suggested_price ?? '').toString() || prev.price
      }))
    } catch (error: any) {
      alert('Erro na análise IA: ' + (error?.message || 'desconhecido'))
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // ✅ Converte preço para number (backend geralmente espera number)
      const payload = {
        name: formData.name.trim(),
        imageUrl: formData.imageUrl.trim(),
        description: formData.description.trim(),
        category: formData.category.trim(),
        price: Number(String(formData.price).replace(',', '.')) || 0
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      const data = await res.json().catch(() => ({}))

      // ✅ MOSTRA o erro real se falhar
      if (!res.ok) {
        console.error('POST /api/products failed:', res.status, data)
        alert(data?.error || data?.message || `Erro ao salvar (status ${res.status}).`)
        return
      }

      // ✅ sucesso
      alert('Produto salvo!')
      router.push('/')
      router.refresh()
    } catch (error) {
      console.error(error)
      alert('Erro ao salvar produto (rede/servidor).')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Link href="/" className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors">
        <ArrowLeft size={18} />
        Voltar ao Dashboard
      </Link>

      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">Adicionar Novo Produto</h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome do Produto</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Teclado Mecânico RGB"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Link da Foto (URL)</label>
              <div className="flex gap-2">
                <input
                  type="url"
                  name="imageUrl"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="https://exemplo.com/foto.jpg"
                />
                <button
                  type="button"
                  onClick={handleMagicFill}
                  disabled={analyzing}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2 whitespace-nowrap disabled:opacity-50"
                >
                  <Sparkles size={18} />
                  {analyzing ? 'Analisando...' : 'Preencher com IA'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full p-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Ex: Eletrônicos"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço (R$)</label>
              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                required
                className="w-full p-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="0,00"
                inputMode="decimal"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full p-2 border rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="Conte detalhes do produto..."
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Save size={20} />
            {loading ? 'Salvando...' : 'Salvar Produto'}
          </button>
        </form>
      </div>
    </div>
  )
}
