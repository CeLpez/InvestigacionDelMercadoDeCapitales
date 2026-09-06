import React, { useEffect, useState } from 'react'
import { mockStocks, stockService } from '../services/stockService'

export default function CompetitorComparison() {
  const [selectedStocks, setSelectedStocks] = useState(['AAPL', 'MSFT'])
  const [quotes, setQuotes] = useState(mockStocks)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    stockService.getMultipleStocks(selectedStocks).then(results => {
      if (!cancelled) {
        setQuotes(current => ({
          ...current,
          ...Object.fromEntries(results.map(stock => [stock.symbol, { ...current[stock.symbol], ...stock }]))
        }))
      }
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedStocks])

  const toggleStock = (symbol) => {
    setSelectedStocks(prev =>
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    )
  }

  const comparisonData = [
    { label: 'Precio Actual', key: 'price' },
    { label: 'Market Cap', key: 'marketCap' },
    { label: 'P/E Ratio', key: 'pe' },
    { label: 'Dividendo', key: 'dividend' },
    { label: 'Cambio %', key: 'changePercent' }
  ]

  const advantages = {
    'AAPL': ['Ecosistema único', 'Margen de ganancias alto', 'Lealtad de clientes'],
    'MSFT': ['Diversificación empresarial', 'Cloud computing (Azure)', 'Dividendos consistentes'],
    'GOOGL': ['Publicidad digital dominante', 'Innovación AI', 'Servicios integrados'],
    'AMZN': ['E-commerce líder', 'AWS dominante', 'Logística integrada'],
    'TSLA': ['Innovación en EV', 'Energías renovables', 'Crecimiento acelerado']
  }

  const disadvantages = {
    'AAPL': ['Dependencia del iPhone', 'Precio elevado', 'Competencia creciente'],
    'MSFT': ['Competencia en cloud', 'Legacy en software', 'Regulación antitrust'],
    'GOOGL': ['Dependencia de publicidad', 'Privacidad regulatoria', 'Competencia AI'],
    'AMZN': ['Márgenes bajos e-commerce', 'Presión regulatoria', 'Competencia retail'],
    'TSLA': ['Volatilidad accionaria', 'Capex intensivo', 'Competencia EV global']
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">⚖️ Comparador de Empresas</h2>

      {/* Selector de acciones */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
        <h3 className="text-xl font-bold mb-4">Selecciona empresas para comparar (máx 3)</h3>
        <div className="grid md:grid-cols-5 gap-3">
          {Object.entries(mockStocks).map(([symbol, stock]) => (
            <button
              key={symbol}
              onClick={() => toggleStock(symbol)}
              disabled={selectedStocks.length === 3 && !selectedStocks.includes(symbol)}
              className={`p-4 rounded-lg transition-all font-medium ${
                selectedStocks.includes(symbol)
                  ? 'bg-blue-600 border border-blue-400'
                  : 'bg-slate-700 border border-slate-600 hover:border-slate-500'
              } ${selectedStocks.length === 3 && !selectedStocks.includes(symbol) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla comparativa */}
      {selectedStocks.length > 0 && (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8 overflow-x-auto">
          <h3 className="text-xl font-bold mb-4">Métricas Comparativas {loading && <span className="text-sm text-slate-500 font-normal">Actualizando...</span>}</h3>
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-600">
                <th className="px-4 py-3 font-bold">Métrica</th>
                {selectedStocks.map(symbol => (
                  <th key={symbol} className="px-4 py-3 font-bold text-blue-400">{symbol}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {comparisonData.map(metric => (
                <tr key={metric.key} className="border-b border-slate-700 hover:bg-slate-700/20">
                  <td className="px-4 py-3 font-medium">{metric.label}</td>
                  {selectedStocks.map(symbol => (
                    <td key={`${symbol}-${metric.key}`} className="px-4 py-3">
                      {metric.key === 'price' && (quotes[symbol]?.price ? `$${quotes[symbol].price.toFixed(2)}` : 'N/D')}
                      {metric.key === 'marketCap' && (quotes[symbol]?.marketCap || 'N/D')}
                      {metric.key === 'pe' && (quotes[symbol]?.pe ?? 'N/D')}
                      {metric.key === 'dividend' && (quotes[symbol]?.dividend == null ? 'N/D' : `$${quotes[symbol].dividend}`)}
                      {metric.key === 'changePercent' && (
                        <span className={quotes[symbol]?.changePercent > 0 ? 'text-green-400' : 'text-red-400'}>
                          {quotes[symbol]?.changePercent > 0 ? '+' : ''}{Number(quotes[symbol]?.changePercent || 0).toFixed(2)}%
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Ventajas y desventajas */}
      <div className="grid md:grid-cols-2 gap-6">
        {selectedStocks.map(symbol => (
          <div key={symbol} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
            <h3 className="text-2xl font-bold text-blue-400 mb-4">{symbol}</h3>

            <div className="mb-6">
              <h4 className="font-bold text-green-400 mb-3">✅ Ventajas</h4>
              <ul className="space-y-2">
                {(advantages[symbol] || []).map((adv, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">•</span>
                    <span className="text-slate-300">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-red-400 mb-3">⚠️ Desventajas</h4>
              <ul className="space-y-2">
                {(disadvantages[symbol] || []).map((dis, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">•</span>
                    <span className="text-slate-300">{dis}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      {selectedStocks.length === 0 && (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
          <p className="text-slate-400">Selecciona al menos una empresa para comenzar la comparación</p>
        </div>
      )}
    </div>
  )
}
