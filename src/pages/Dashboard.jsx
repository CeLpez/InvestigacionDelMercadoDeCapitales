import React, { useEffect, useState } from 'react'
import { clearMarketCache, getMarketUniverse, marketUniverse, mockStocks, stockService } from '../services/stockService'
import PriceChart from '../components/PriceChart'
import { usePortfolioStore } from '../store/index'

export default function Dashboard() {
  const { portfolio, watchlist, addToWatchlist, removeFromWatchlist } = usePortfolioStore()
  const [selectedStock, setSelectedStock] = useState('AAPL')
  const [stocks, setStocks] = useState(Object.values(mockStocks))
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [marketQuotes, setMarketQuotes] = useState({})
  const [marketLoading, setMarketLoading] = useState(true)
  const [marketError, setMarketError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let cancelled = false
    const symbols = Object.keys(mockStocks)

    stockService.getMultipleStocks(symbols).then(results => {
      if (!cancelled) {
        const bySymbol = Object.fromEntries(results.map(stock => [stock.symbol, stock]))
        setStocks(symbols.map(symbol => bySymbol[symbol] || mockStocks[symbol]))
        if (results.length === 0) setError('No se pudieron actualizar las cotizaciones; se muestran datos de referencia.')
        setLastUpdated(new Date())
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
    setMarketLoading(true)
    setMarketError('')

    stockService.getMultipleStocks(universe.map(instrument => instrument.symbol)).then(results => {
      if (!cancelled) {
        const bySymbol = Object.fromEntries(results.map(result => [result.symbol, result]))
        setMarketQuotes(Object.fromEntries(universe.map(instrument => [
          instrument.symbol,
          { ...instrument, ...(bySymbol[instrument.symbol] || {}) }
        ])))
        if (results.length === 0) setMarketError('No se pudieron cargar los mercados. Reintentá actualizar más tarde.')
        setLastUpdated(new Date())
        setMarketLoading(false)
      }
    }).catch(fetchError => {
      if (!cancelled) {
        setMarketError(fetchError.message || 'No se pudo cargar el resumen del mercado')
        setMarketLoading(false)
      }
    })

    return () => {
      cancelled = true
    }
  }, [refreshKey])

  const selected = stocks.find(stock => stock.symbol === selectedStock) || mockStocks[selectedStock] || stocks[0]
  const quote = (instrument) => marketQuotes[instrument.symbol] || instrument
  const formatPrice = (value) => Number.isFinite(Number(value)) ? `$${Number(value).toFixed(2)}` : 'Sin datos'
  const formatChange = (value) => Number.isFinite(Number(value))
    ? `${value >= 0 ? '+' : ''}${Number(value).toFixed(2)}%`
    : 'N/D'
  const changeClass = (value) => value >= 0 ? 'text-emerald-400' : 'text-rose-400'
  const portfolioValue = portfolio.reduce((total, item) => total + (Number(item.price) || 0) * (Number(item.quantity) || 0), 0)
  const portfolioCost = portfolio.reduce((total, item) => total + (Number(item.purchasePrice) || 0) * (Number(item.quantity) || 0), 0)
  const portfolioReturn = portfolioValue - portfolioCost
  const isFavorite = symbol => watchlist.some(item => item.symbol === symbol)
  const toggleFavorite = stock => {
    const existing = watchlist.find(item => item.symbol === stock.symbol)
    if (existing) removeFromWatchlist(existing.id)
    else addToWatchlist(stock)
  }
  const isBondInstrument = (instrument) => Boolean(instrument.type && instrument.type.startsWith('Bono'))
  const formatBondField = (value, suffix = '') => (value === null || value === undefined) ? 'N/D' : `${value}${suffix}`
  const renderQuoteCard = (instrument) => {
    const item = quote(instrument)
    const isBond = isBondInstrument(instrument)
    const displayCurrency = instrument.currency || item.currency
    return (
      <div key={instrument.symbol} className="bg-[#0c1422] border border-slate-800 rounded-xl p-4 hover:border-slate-600 transition-colors">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="font-semibold text-white truncate">{instrument.symbol}</p>
            <p className="text-xs text-slate-500 truncate">{instrument.name || item.company}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label={isFavorite(item.symbol || instrument.symbol) ? `Quitar ${instrument.symbol} de favoritos` : `Agregar ${instrument.symbol} a favoritos`}
              aria-pressed={isFavorite(item.symbol || instrument.symbol)}
              onClick={() => toggleFavorite({ ...instrument, ...item })}
              className="text-lg leading-none text-slate-500 hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 rounded"
            >
              {isFavorite(item.symbol || instrument.symbol) ? '★' : '☆'}
            </button>
            <span className="text-[10px] uppercase tracking-wider text-slate-500">{instrument.type}</span>
          </div>
        </div>
        <p className="text-xl font-semibold text-slate-100 mt-4">{formatPrice(item.price)}</p>
        <p className={`text-sm mt-1 ${changeClass(item.changePercent)}`}>{formatChange(item.changePercent)}</p>
        {isBond ? (
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1.5 mt-3 pt-3 border-t border-slate-800 text-[11px]">
            <div><dt className="text-slate-600">Moneda</dt><dd className="text-slate-300">{instrument.currency || 'N/D'}</dd></div>
            <div><dt className="text-slate-600">Vencimiento</dt><dd className="text-slate-300">{formatBondField(instrument.maturityYear)} · {instrument.law || 'N/D'}</dd></div>
            <div><dt className="text-slate-600">Cupón</dt><dd className="text-slate-300">{formatBondField(instrument.couponRate, '%')}</dd></div>
            <div><dt className="text-slate-600">TIR / Duration</dt><dd className="text-slate-300">{instrument.tir == null && instrument.duration == null ? 'N/D' : `${formatBondField(instrument.tir, '%')} / ${formatBondField(instrument.duration, 'a')}`}</dd></div>
          </dl>
        ) : displayCurrency && (
          <p className="text-[11px] text-slate-500 mt-2">Moneda: {displayCurrency}</p>
        )}
      </div>
    )
  }

  return (
    <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-6 lg:py-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 mb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-2">Resumen del mercado</p>
          <h2 className="text-3xl lg:text-4xl font-semibold tracking-tight text-white">Panel de mercado</h2>
          <p className="text-slate-500 mt-2">Cotizaciones y tendencias para tomar mejores decisiones.</p>
        </div>
        <div className="text-left lg:text-right">
          <p className="text-xs text-slate-500">Última actualización</p>
          <div className="flex items-center gap-3 lg:justify-end">
            <p className="text-sm text-slate-300" role="status" aria-live="polite">
              {loading || marketLoading ? 'Sincronizando...' : lastUpdated ? `Actualizado ${lastUpdated.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}` : 'Datos públicos disponibles'}
            </p>
            <button
              type="button"
              onClick={() => {
                clearMarketCache()
                setRefreshKey(value => value + 1)
              }}
              disabled={loading || marketLoading}
              className="px-3 py-1.5 text-xs rounded-md border border-slate-700 text-slate-300 hover:border-cyan-500/50 hover:text-cyan-300 disabled:opacity-50 transition-colors"
            >
              ↻ Actualizar
            </button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          ['Mercado', marketLoading ? 'Cargando' : 'Disponible', marketLoading ? 'text-amber-300' : 'text-emerald-400'],
          ['Acciones', `${stocks.length}`, 'text-cyan-400'],
          ['Portafolio', formatPrice(portfolioValue), portfolioReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'],
          ['Favoritos', `${watchlist.length}`, 'text-amber-300']
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
              <span className={`text-3xl font-semibold ${selected?.change >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {formatPrice(selected?.price)}
              </span>
            </div>
            <PriceChart symbol={selectedStock} />
            <div className="mt-4 grid grid-cols-3 gap-4 text-sm">
              <div className="bg-slate-900/50 p-3 rounded">
                <p className="text-slate-400">Cambio</p>
                <p className="text-lg font-bold text-green-400">
                  {formatChange(selected?.changePercent)}
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
          <div role="status" aria-live="polite">
            {loading && <p className="text-sm text-slate-400 mb-3">Actualizando cotizaciones...</p>}
            {error && <p className="text-sm text-amber-400 mb-3">{error}</p>}
            {marketError && <p className="text-sm text-amber-400 mb-3">{marketError}</p>}
          </div>
          <div className="space-y-3">
            {stocks.map(stock => (
              <button
                key={stock.symbol}
                type="button"
                aria-pressed={selectedStock === stock.symbol}
                onClick={() => setSelectedStock(stock.symbol)}
                className={`w-full p-4 rounded-lg transition-all text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${
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
                    <p className="font-bold">{formatPrice(stock.price)}</p>
                    <p className={`text-sm ${changeClass(stock.changePercent)}`}>
                      {formatChange(stock.changePercent)}
                    </p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 bg-[#0c1422] border border-slate-800 rounded-2xl p-5 lg:p-6">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-1">Seguimiento personal</p>
              <h3 className="text-xl font-semibold text-white">Favoritos</h3>
            </div>
            <span className="text-sm text-slate-500">{watchlist.length} activos</span>
          </div>
          {watchlist.length === 0 ? (
            <p className="text-sm text-slate-500">Marcá la estrella en cualquier cotización para verla aquí.</p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {watchlist.slice(0, 6).map(stock => (
                <button key={stock.id} type="button" onClick={() => setSelectedStock(stock.symbol)} className="text-left rounded-lg border border-slate-800 bg-slate-900/50 p-3 hover:border-cyan-500/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-cyan-300">{stock.symbol}</span>
                    <span className={changeClass(stock.changePercent)}>{formatChange(stock.changePercent)}</span>
                  </div>
                  <p className="text-sm text-slate-400 mt-2">{formatPrice(stock.price)}</p>
                </button>
              ))}
            </div>
          )}
        </section>
        <section className="bg-[#0c1422] border border-slate-800 rounded-2xl p-5 lg:p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-1">Resumen</p>
          <h3 className="text-xl font-semibold text-white mb-4">Mi portafolio</h3>
          <p className="text-3xl font-semibold text-white">{formatPrice(portfolioValue)}</p>
          <p className={`text-sm mt-1 ${portfolioReturn >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {portfolioReturn >= 0 ? '+' : ''}{formatPrice(portfolioReturn)} desde la compra
          </p>
          <p className="text-xs text-slate-500 mt-4">{portfolio.length} posiciones · costo {formatPrice(portfolioCost)}</p>
        </section>
      </div>

      {/* Resumen de mercado */}
      <div className="mt-6 bg-[#0c1422] border border-slate-800 rounded-2xl p-5 lg:p-6">
        <h3 className="text-lg font-semibold mb-4 text-white">Índices de referencia</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            ['S&P 500', '^GSPC'],
            ['Dow Jones', '^DJI'],
            ['Nasdaq', '^IXIC'],
            ['MERVAL', '^MERV']
          ].map(([label, symbol]) => {
            const item = marketQuotes[symbol]
            return (
              <div key={symbol} className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">{label}</p>
                <p className="text-2xl font-bold mt-1">{formatPrice(item?.price)}</p>
                <p className={`text-sm ${changeClass(item?.changePercent)}`}>{formatChange(item?.changePercent)}</p>
              </div>
            )
          })}
        </div>

        <section className="mt-6">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-400 mb-1">Mercados globales</p>
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
            <div className="mb-5">
              <h4 className="text-sm font-medium text-slate-400 mb-3">Acciones locales</h4>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {marketUniverse.argentina.localStocks.map(renderQuoteCard)}
              </div>
            </div>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-medium text-slate-400">Bonos soberanos</h4>
                <p className="text-[11px] text-slate-600">Cupón, TIR y duration muestran N/D cuando no hay datos de mercado en tiempo real disponibles.</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {marketUniverse.argentina.bonds.map(renderQuoteCard)}
              </div>
              <div className="mt-5">
                <h4 className="text-sm font-medium text-slate-400 mb-3">Referencias y macro</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {marketUniverse.argentina.macro.map(renderQuoteCard)}
                </div>
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
