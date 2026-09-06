import React, { useEffect, useState } from 'react'
import { mockStocks, stockService } from '../services/stockService'
import PriceChart from '../components/PriceChart'

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [stocks, setStocks] = useState(Object.values(mockStocks))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    const symbols = Object.keys(mockStocks)

    Promise.all(symbols.map(async symbol => {
      try {
        return await stockService.getStockData(symbol)
      } catch {
        return mockStocks[symbol]
      }
    })).then(results => {
      if (!cancelled) {
        setStocks(results)
        setLoading(false)
      }
    }).catch(fetchError => {
      if (!cancelled) {
        setError(fetchError.message || 'No se pudo cargar el mercado')
        setLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [])

  const selected = stocks.find(stock => stock.symbol === selectedStock) || mockStocks[selectedStock]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        {/* Gráfico principal */}
        <div className="md:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{selectedStock}</h2>
              <span className={`text-3xl font-bold ${selected.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${selected.price.toFixed(2)}
              </span>
            </div>
            <PriceChart symbol={selectedStock} />
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-slate-400">Cambio</p>
                <p className="text-lg font-bold text-green-400">
                  {selected.change >= 0 ? '+' : ''}{selected.changePercent.toFixed(2)}%
                </p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-slate-400">P/E Ratio</p>
                <p className="text-lg font-bold">{selected.pe ?? 'N/D'}</p>
              </div>
              <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-slate-400">Dividendo</p>
                <p className="text-lg font-bold">{selected.dividend == null ? 'N/D' : `$${selected.dividend}`}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Stocks destacados */}
        <div>
          <h3 className="text-xl font-bold mb-4">Principales Acciones</h3>
          {loading && <p className="text-sm text-slate-400 mb-3">Actualizando cotizaciones...</p>}
          {error && <p className="text-sm text-amber-400 mb-3">{error}</p>}
          <div className="space-y-3">
            {stocks.map(stock => (
              <button
                key={stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                className={`w-full p-4 rounded-lg transition-all text-left ${
                  selectedStock === stock.symbol
                    ? 'bg-blue-600 border border-blue-400'
                    : 'bg-slate-800/50 border border-slate-700 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-bold">{stock.symbol}</p>
                    <p className="text-sm text-slate-400">{stock.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">${stock.price.toFixed(2)}</p>
                    <p className={`text-sm ${stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Resumen de mercado */}
      <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-bold mb-4">📊 Resumen del Mercado</h3>
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">S&P 500</p>
            <p className="text-2xl font-bold">4,657.41</p>
            <p className="text-green-400 text-sm">+0.52%</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Dow Jones</p>
            <p className="text-2xl font-bold">36,236.47</p>
            <p className="text-green-400 text-sm">+0.45%</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Nasdaq</p>
            <p className="text-2xl font-bold">14,533.48</p>
            <p className="text-green-400 text-sm">+0.68%</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">VIX (Volatilidad)</p>
            <p className="text-2xl font-bold">14.32</p>
            <p className="text-green-400 text-sm">-2.15%</p>
          </div>
        </div>
      </div>
    </div>
  )
}
