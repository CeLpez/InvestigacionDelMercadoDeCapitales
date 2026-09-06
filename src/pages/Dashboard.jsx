import React, { useEffect, useState } from 'react'
import { getMarketUniverse, marketUniverse, mockStocks, stockService } from '../services/stockService'
import PriceChart from '../components/PriceChart'

export default function Dashboard() {
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [stocks, setStocks] = useState(Object.values(mockStocks))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [marketQuotes, setMarketQuotes] = useState({})
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const symbols = Object.keys(mockStocks)

    stockService.getMultipleStocks(symbols).then(results => {
      if (!cancelled) {
        const bySymbol = Object.fromEntries(results.map(stock => [stock.symbol, stock]))
        setStocks(symbols.map(symbol => bySymbol[symbol] || mockStocks[symbol]))
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
  }, [refreshKey])

  useEffect(() => {
    let cancelled = false
    const universe = getMarketUniverse()

    stockService.getMultipleStocks(universe.map(instrument => instrument.symbol)).then(results => {
      if (!cancelled) {
        const bySymbol = Object.fromEntries(results.map(result => [result.symbol, result]))
        setMarketQuotes(Object.fromEntries(universe.map(instrument => [
          instrument.symbol,
          { ...instrument, ...(bySymbol[instrument.symbol] || {}) }
        ])))
      }
    })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const selected = stocks.find(stock => stock.symbol === selectedStock) || mockStocks[selectedStock]
  const quote = (instrument) => marketQuotes[instrument.symbol] || instrument
  const formatPrice = (value) => Number.isFinite(value) ? `$${value.toFixed(2)}` : 'Sin datos'
  const formatChange = (value) => Number.isFinite(value)
    ? `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
    : 'N/D'
  const changeClass = (value) => value >= 0 ? 'text-emerald-400' : 'text-rose-400'
  const renderQuoteCard = (instrument) => {
    const item = quote(instrument)
    return (
      <div key={instrument.symbol} className="bg-[#0c1422] border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{instrument.symbol}</p>
            <p className="text-xs text-slate-500 truncate">{instrument.name || item.company}</p>
          </div>
          <span className="text-[10px] uppercase tracking-wider text-slate-500">{instrument.type}</span>
        </div>
        <p className="text-xl font-semibold text-slate-100 mt-4">{formatPrice(item.price)}</p>
        <p className={`text-sm mt-1 ${changeClass(item.changePercent)}`}>{formatChange(item.changePercent)}</p>
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-2">Market overview</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">Panel de mercado</h2>
          <p className="text-slate-500 mt-2">Cotizaciones y tendencias para tomar mejores decisiones.</p>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-xs text-slate-500">Última actualización</p>
          <div className="flex items-center gap-3 lg:justify-end">
            <p className="text-sm text-slate-300">{loading ? 'Sincronizando...' : 'Datos públicos disponibles'}</p>
            <button
              type="button"
              onClick={() => setRefreshKey(value => value + 1)}
              disabled={loading}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 disabled:opacity-50 transition-colors"
            >
              ↻ Actualizar
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          ['Mercado', 'Abierto', 'text-emerald-400'],
          ['Acciones', `${stocks.length}`, 'text-cyan-400'],
          ['Tendencia', selected.change >= 0 ? 'Alcista' : 'Bajista', selected.change >= 0 ? 'text-emerald-400' : 'text-rose-400'],
          ['Moneda', selected.currency || 'USD', 'text-slate-300']
        ].map(([label, value, color]) => (
          <div key={label} className="bg-[#0c1422] border border-slate-800 rounded-xl p-4">
            <p className="text-xs uppercase tracking-wider text-slate-500">{label}</p>
            <p className={`text-lg font-semibold mt-2 ${color}`}>{value}</p>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {/* Gráfico principal */}
        <div className="md:col-span-2">
          <div className="bg-[#0c1422] border border-slate-800 rounded-2xl p-5 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-500">Activo seleccionado</p>
                <h2 className="text-2xl font-semibold text-white mt-1">{selectedStock}</h2>
              </div>
              <span className={`text-3xl font-semibold ${selected.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
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
          <h3 className="text-lg font-semibold mb-4 text-white">Activos destacados</h3>
          {loading && <p className="text-sm text-slate-400 mb-3">Actualizando cotizaciones...</p>}
          {error && <p className="text-sm text-amber-400 mb-3">{error}</p>}
          <div className="space-y-3">
            {stocks.map(stock => (
              <button
                key={stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                className={`w-full p-4 rounded-lg transition-all text-left ${
                  selectedStock === stock.symbol
                    ? 'bg-cyan-500/10 border border-cyan-500/40'
                    : 'bg-[#0c1422] border border-slate-800 hover:border-slate-600'
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
      <div className="mt-6 bg-[#0c1422] border border-slate-800 rounded-2xl p-5 lg:p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Índices de referencia</h3>
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

        <section className="mt-6">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-1">Global markets</p>
                <h3 className="text-xl font-semibold text-white">Principales mercados</h3>
              </div>
              <p className="text-xs text-slate-500">Índices de referencia</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
              {marketUniverse.global.map(renderQuoteCard)}
            </div>
        </section>

        <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-1">Argentina</p>
              <h3 className="text-xl font-semibold text-white">MERVAL, ADRs y bonos</h3>
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Índice MERVAL</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {marketUniverse.argentina.index.map(renderQuoteCard)}
              </div>
            </div>
            <div className="mb-5">
              <h4 className="text-sm font-medium text-slate-400 mb-3">ADRs argentinos</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {marketUniverse.argentina.adrs.map(renderQuoteCard)}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium text-slate-400 mb-3">Bonos soberanos</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {marketUniverse.argentina.bonds.map(renderQuoteCard)}
              </div>
            </div>
        </section>

        <section className="mt-8">
            <div className="mb-4">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-1">Estados Unidos</p>
              <h3 className="text-xl font-semibold text-white">20 empresas destacadas del S&P 500</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {marketUniverse.sp500.map(renderQuoteCard)}
            </div>
        </section>
      </div>
    </div>
  )
}
