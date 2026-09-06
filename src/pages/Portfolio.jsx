import React, { useState } from 'react'
import { usePortfolioStore } from '../store/index'
import { mockStocks, stockService } from '../services/stockService'
import { exportPortfolioToCSV } from '../services/exportService'

export default function Portfolio() {
  const { portfolio, addStock, removeStock, updateStock } = usePortfolioStore()
  const [showAddForm, setShowAddForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [selectedStock, setSelectedStock] = useState(null)
  const [quantity, setQuantity] = useState('1')
  const [purchasePrice, setPurchasePrice] = useState('')
  const [searching, setSearching] = useState(false)
  const [formError, setFormError] = useState('')

  const searchStocks = async () => {
    const query = searchTerm.trim()
    if (query.length < 1) return
    setSearching(true)
    setFormError('')
    try {
      const remote = await stockService.searchSymbol(query)
      const results = remote.length
        ? await Promise.all(remote.slice(0, 8).map(async result => {
          try {
            return await stockService.getStockData(result.symbol)
          } catch {
            return { ...result, ...(mockStocks[result.symbol] || {}) }
          }
        }))
        : Object.values(mockStocks).filter(stock => stock.symbol.includes(query.toUpperCase()))
      setSearchResults(results)
    } catch {
      setSearchResults(Object.values(mockStocks).filter(stock =>
        stock.symbol.includes(query.toUpperCase()) ||
        stock.company.toLowerCase().includes(query.toLowerCase())
      ))
      setFormError('No se pudo consultar el proveedor; puedes usar una coincidencia local.')
    } finally {
      setSearching(false)
    }
  }

  const selectStock = (stock) => {
    setSelectedStock(stock)
    setPurchasePrice(stock.price ? String(stock.price) : '')
    setSearchResults([])
  }

  const handleAddStock = () => {
    const price = Number(purchasePrice)
    const shares = Number(quantity)
    if (!selectedStock || !Number.isFinite(price) || price <= 0 || !Number.isFinite(shares) || shares <= 0) {
      setFormError('Selecciona una acción e indica una cantidad y precio válidos.')
      return
    }
    addStock(selectedStock, shares, price)
    setShowAddForm(false)
    setSelectedStock(null)
    setSearchTerm('')
    setQuantity('1')
    setPurchasePrice('')
  }

  const handleExport = () => {
    exportPortfolioToCSV(portfolio, `portafolio-${new Date().toISOString().split('T')[0]}.csv`)
  }

  const totalValue = portfolio.reduce((sum, s) => sum + (s.price * s.quantity), 0)
  const totalCost = portfolio.reduce((sum, s) => sum + (s.purchasePrice * s.quantity), 0)
  const totalGain = totalValue - totalCost
  const gainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">💼 Mi Portafolio</h2>
        <div className="flex gap-2">
          {portfolio.length > 0 && (
            <button
              onClick={handleExport}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-all"
            >
              📥 Exportar CSV
            </button>
          )}
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all"
          >
            ➕ Agregar Acción
          </button>
        </div>
      </div>

      {/* Resumen del portafolio */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Valor Total</p>
          <p className="text-3xl font-bold text-blue-400">${totalValue.toFixed(2)}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Costo Total</p>
          <p className="text-3xl font-bold">${totalCost.toFixed(2)}</p>
        </div>
        <div className={`bg-slate-800/50 backdrop-blur border rounded-xl p-6 ${totalGain >= 0 ? 'border-green-700' : 'border-red-700'}`}>
          <p className="text-slate-400 text-sm">Ganancia/Pérdida</p>
          <p className={`text-3xl font-bold ${totalGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {totalGain >= 0 ? '+' : ''}${totalGain.toFixed(2)}
          </p>
        </div>
        <div className={`bg-slate-800/50 backdrop-blur border rounded-xl p-6 ${gainPercent >= 0 ? 'border-green-700' : 'border-red-700'}`}>
          <p className="text-slate-400 text-sm">Retorno %</p>
          <p className={`text-3xl font-bold ${gainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
            {gainPercent >= 0 ? '+' : ''}{gainPercent.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Formulario para agregar acción */}
      {showAddForm && (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-2">Agregar cualquier acción</h3>
          <p className="text-sm text-slate-400 mb-4">Busca por ticker o nombre en los mercados disponibles.</p>
          <div className="flex flex-col md:flex-row gap-3">
            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchStocks()}
              placeholder="Ej.: YPF, GGAL, NVDA, Coca-Cola..."
              className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white"
            />
            <button onClick={searchStocks} disabled={searching} className="bg-cyan-600 hover:bg-cyan-700 disabled:opacity-50 px-5 py-2 rounded-lg font-medium">
              {searching ? 'Buscando...' : 'Buscar'}
            </button>
          </div>
          {formError && <p className="text-amber-400 text-sm mt-3">{formError}</p>}
          {searchResults.length > 0 && (
            <div className="mt-3 grid md:grid-cols-2 gap-2">
              {searchResults.map(stock => (
                <button key={stock.symbol} onClick={() => selectStock(stock)} className="text-left p-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-500">
                  <span className="font-bold text-cyan-400">{stock.symbol}</span>
                  <span className="text-sm text-slate-400 ml-2">{stock.company}</span>
                  <span className="block text-xs text-slate-500 mt-1">{stock.exchange || 'Mercado público'} · ${stock.price?.toFixed?.(2) || 'N/D'}</span>
                </button>
              ))}
            </div>
          )}
          {selectedStock && (
            <div className="mt-4 grid md:grid-cols-3 gap-3">
              <div className="md:col-span-1 p-3 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <p className="font-bold text-cyan-300">{selectedStock.symbol}</p>
                <p className="text-sm text-slate-400">{selectedStock.company}</p>
              </div>
              <input type="number" min="0.0001" step="any" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="Cantidad" className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white" />
              <input type="number" min="0.0001" step="any" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} placeholder="Precio de compra" className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white" />
            </div>
          )}
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleAddStock}
              disabled={!selectedStock}
              className="bg-green-600 hover:bg-green-700 px-6 py-2 rounded-lg font-medium transition-all"
            >
              Agregar al portafolio
            </button>
            <button
              onClick={() => setShowAddForm(false)}
              className="bg-slate-700 hover:bg-slate-600 px-6 py-2 rounded-lg font-medium transition-all"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de acciones en portafolio */}
      {portfolio.length > 0 ? (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-900/50 border-b border-slate-700">
                <th className="px-6 py-3 text-left font-bold">Acción</th>
                <th className="px-6 py-3 text-left font-bold">Cantidad</th>
                <th className="px-6 py-3 text-left font-bold">Precio Actual</th>
                <th className="px-6 py-3 text-left font-bold">Precio Compra</th>
                <th className="px-6 py-3 text-left font-bold">Valor Total</th>
                <th className="px-6 py-3 text-left font-bold">Ganancia/Pérdida</th>
                <th className="px-6 py-3 text-center font-bold">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock, idx) => {
                const stockValue = stock.price * stock.quantity
                const stockCost = stock.purchasePrice * stock.quantity
                const stockGain = stockValue - stockCost
                const stockGainPercent = (stockGain / stockCost) * 100

                return (
                  <tr key={stock.id} className="border-b border-slate-700 hover:bg-slate-700/20 transition-all">
                    <td className="px-6 py-4">
                      <p className="font-bold text-blue-400">{stock.symbol}</p>
                      <p className="text-sm text-slate-400">{stock.company}</p>
                    </td>
                    <td className="px-6 py-4">
                      <input
                        type="number"
                        value={stock.quantity}
                        onChange={(e) => updateStock(stock.id, { quantity: parseInt(e.target.value) })}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-600 rounded text-white"
                        min="1"
                      />
                    </td>
                    <td className="px-6 py-4">${stock.price.toFixed(2)}</td>
                    <td className="px-6 py-4">${stock.purchasePrice.toFixed(2)}</td>
                    <td className="px-6 py-4 font-bold">${stockValue.toFixed(2)}</td>
                    <td className="px-6 py-4">
                      <div>
                        <p className={`font-bold ${stockGain >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stockGain >= 0 ? '+' : ''}${stockGain.toFixed(2)}
                        </p>
                        <p className={`text-sm ${stockGainPercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {stockGainPercent >= 0 ? '+' : ''}{stockGainPercent.toFixed(2)}%
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => removeStock(stock.id)}
                        className="text-red-400 hover:text-red-300 font-medium"
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
          <p className="text-slate-400 mb-4">Aún no has agregado acciones a tu portafolio</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all"
          >
            Agregar Primera Acción
          </button>
        </div>
      )}
    </div>
  )
}
