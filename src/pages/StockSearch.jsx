import React, { useState } from 'react'
import { mockStocks } from '../services/stockService'

export default function StockSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])

  const handleSearch = (e) => {
    const value = e.target.value
    setQuery(value)

    if (value.length > 0) {
      const filtered = Object.values(mockStocks).filter(stock =>
        stock.symbol.includes(value.toUpperCase()) ||
        stock.company.toLowerCase().includes(value.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6">🔍 Buscar Acciones</h2>

        <div className="mb-8">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Buscar por símbolo o empresa..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {query && results.length === 0 && (
          <p className="text-slate-400 text-center py-8">No se encontraron resultados</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {results.length > 0 ? (
            results.map(stock => (
              <div key={stock.symbol} className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-400">{stock.symbol}</h3>
                    <p className="text-slate-400">{stock.company}</p>
                  </div>
                  <span className="text-3xl font-bold">${stock.price}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Cambio</p>
                    <p className={`text-lg font-bold ${stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Market Cap</p>
                    <p className="text-lg font-bold">{stock.marketCap}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">P/E Ratio</p>
                    <p className="text-lg font-bold">{stock.pe}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Sector</p>
                    <p className="text-lg font-bold text-cyan-400">{stock.sector}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all">
                    Ver Detalles
                  </button>
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-all">
                    ⭐ Watchlist
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-slate-400">Comienza a buscar acciones por símbolo o nombre</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
