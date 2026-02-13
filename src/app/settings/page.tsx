'use client'

import { useState, useEffect } from 'react'
import { Save, ShieldCheck } from 'lucide-react'

export default function Settings() {
  const [loading, setLoading] = useState(false)
  const [configs, setConfigs] = useState({
    mercadoLivre: '',
    shopee: '',
    shopeeShopId: ''
  })

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      const res = await fetch('/api/marketplaces/config')
      const data = await res.json()
      const ml = data.find((c: any) => c.name === 'Mercado Livre')?.accessToken || ''
      const shConfig = data.find((c: any) => c.name === 'Shopee')
      const sh = shConfig?.accessToken || ''
      const shId = shConfig?.refreshToken || '' // Reusing refreshToken field to store Shop ID for simplicity in this demo
      setConfigs({ mercadoLivre: ml, shopee: sh, shopeeShopId: shId })
    } catch (error) {
      console.error('Error fetching configs:', error)
    }
  }

  const handleSave = async (name: string, token: string, extra?: string) => {
    setLoading(true)
    try {
      await fetch('/api/marketplaces/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          name, 
          accessToken: token,
          refreshToken: extra // Using refreshToken field for shopId
        })
      })
      alert(`Configuração de ${name} salva!`)
    } catch (error) {
      alert('Erro ao salvar.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-2">Configurações</h2>
      <p className="text-gray-600 mb-8">Conecte suas contas de Marketplace via Token de API.</p>

      <div className="space-y-6">
        {/* Mercado Livre */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center font-bold text-xs">ML</div>
            <h3 className="font-bold text-lg">Mercado Livre</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
              <input
                type="password"
                value={configs.mercadoLivre}
                onChange={(e) => setConfigs({ ...configs, mercadoLivre: e.target.value })}
                className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="APP_USR-..."
              />
            </div>
            <button
              onClick={() => handleSave('Mercado Livre', configs.mercadoLivre)}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              Salvar ML
            </button>
          </div>
        </div>

        {/* Shopee */}
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center font-bold text-xs text-white">S</div>
            <h3 className="font-bold text-lg">Shopee</h3>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
                <input
                  type="password"
                  value={configs.shopee}
                  onChange={(e) => setConfigs({ ...configs, shopee: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="Shopee Token..."
                />
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Shop ID</label>
                <input
                  type="text"
                  value={configs.shopeeShopId}
                  onChange={(e) => setConfigs({ ...configs, shopeeShopId: e.target.value })}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  placeholder="123456"
                />
              </div>
            </div>
            <button
              onClick={() => handleSave('Shopee', configs.shopee, configs.shopeeShopId)}
              disabled={loading}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <Save size={18} />
              Salvar Shopee
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500 justify-center mt-8">
          <ShieldCheck size={16} className="text-green-500" />
          Seus tokens são armazenados com segurança e usados apenas para exportação.
        </div>
      </div>
    </div>
  )
}
