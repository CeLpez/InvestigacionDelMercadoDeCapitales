import React, { useEffect, useMemo, useState } from 'react'
import { mockStocks, stockService } from '../services/stockService'

const fallbackAdvantages = {
  AAPL: ['Ecosistema integrado', 'Marca y fidelidad', 'Márgenes sólidos'],
  MSFT: ['Diversificación', 'Azure y servicios cloud', 'Ingresos recurrentes'],
  GOOGL: ['Publicidad dominante', 'Escala en datos e IA', 'Balance robusto'],
  AMZN: ['AWS', 'Logística integrada', 'Crecimiento del comercio online'],
  TSLA: ['Innovación en vehículos eléctricos', 'Marca global', 'Capacidad de crecimiento']
}

const fallbackRisks = {
  AAPL: ['Dependencia del iPhone', 'Valoración exigente', 'Presión competitiva'],
  MSFT: ['Competencia cloud', 'Riesgo regulatorio', 'Dependencia del gasto corporativo'],
  GOOGL: ['Dependencia publicitaria', 'Regulación', 'Competencia en IA'],
  AMZN: ['Márgenes retail bajos', 'Regulación', 'Alta inversión de capital'],
  TSLA: ['Alta volatilidad', 'Competencia creciente', 'Sensibilidad a las tasas']
}

const formatNumber = value => value == null || value === 'N/D' ? 'N/D' : typeof value === 'number' ? value.toLocaleString('es-AR', { maximumFractionDigits: 2 }) : value

export default function CompetitorComparison() {
  const [selectedStocks, setSelectedStocks] = useState(['AAPL', 'MSFT'])
  const [quotes, setQuotes] = useState(mockStocks)
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [searching, setSearching] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      stockService.getMultipleStocks(selectedStocks),
      Promise.all(selectedStocks.map(symbol => stockService.getCompanyProfile(symbol)))
    ]).then(([stockResults, profiles]) => {
      if (cancelled) return
      const merged = {}
      stockResults.forEach(stock => { merged[stock.symbol] = { ...stock } })
      profiles.forEach((profile, index) => {
        if (profile) merged[selectedStocks[index]] = { ...merged[selectedStocks[index]], ...profile }
      })
      setQuotes(current => ({ ...current, ...merged }))
    }).finally(() => {
      if (!cancelled) setLoading(false)
    })
    return () => { cancelled = true }
  }, [selectedStocks])

  const searchCompanies = async () => {
    if (!searchTerm.trim()) return
    setSearching(true)
    setError('')
    try {
      const results = await stockService.searchSymbol(searchTerm.trim())
      setSearchResults(results.slice(0, 6))
      if (!results.length) setError('No se encontraron empresas con esa búsqueda.')
    } catch {
      setError('No se pudo consultar el buscador. Prueba con el ticker exacto.')
    } finally {
      setSearching(false)
    }
  }

  const addCompany = symbol => {
    if (selectedStocks.includes(symbol)) return
    if (selectedStocks.length >= 3) {
      setError('Puedes comparar hasta 3 empresas.')
      return
    }
    setSelectedStocks(previous => [...previous, symbol])
    setSearchResults([])
    setSearchTerm('')
    setError('')
  }

  const removeCompany = symbol => setSelectedStocks(previous => previous.filter(item => item !== symbol))

  const comparisonData = [
    { label: 'Precio actual', key: 'price', suffix: '$' },
    { label: 'Cambio diario', key: 'changePercent', suffix: '%' },
    { label: 'Capitalización', key: 'marketCap' },
    { label: 'P/E (trailing)', key: 'pe' },
    { label: 'P/E forward', key: 'forwardPe' },
    { label: 'Dividendo anual', key: 'dividend', suffix: '$' },
    { label: 'Beta', key: 'beta' },
    { label: 'Sector', key: 'sector' }
  ]

  const strongestMomentum = useMemo(() => selectedStocks.reduce((winner, symbol) => {
    return Number(quotes[symbol]?.changePercent || -Infinity) > Number(quotes[winner]?.changePercent || -Infinity) ? symbol : winner
  }, selectedStocks[0]), [selectedStocks, quotes])

  return (
    <div className="max-w-[1250px] mx-auto px-4 lg:px-8 py-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-3">Análisis relativo</p>
        <h2 className="text-4xl font-semibold tracking-tight text-white">Comparar empresas</h2>
        <p className="text-slate-400 mt-3 max-w-3xl">Contrasta valoración, movimiento de precio, escala y riesgos. Los datos son informativos y no constituyen una recomendación de inversión.</p>
      </header>

      <section className="border border-slate-800 rounded-2xl bg-[#0c1422] p-5 mb-8">
        <div className="flex flex-col md:flex-row gap-3">
          <input value={searchTerm} onChange={event => setSearchTerm(event.target.value)} onKeyDown={event => event.key === 'Enter' && searchCompanies()} placeholder="Añadir empresa por ticker o nombre: NVDA, YPF, Coca-Cola..." className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
          <button onClick={searchCompanies} disabled={searching} className="px-5 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold disabled:opacity-50">{searching ? 'Buscando...' : 'Añadir empresa'}</button>
        </div>
        {searchResults.length > 0 && <div className="grid md:grid-cols-2 gap-2 mt-3">{searchResults.map(result => <button key={result.symbol} onClick={() => addCompany(result.symbol)} className="text-left px-4 py-3 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400"><strong className="text-cyan-300">{result.symbol}</strong><span className="text-sm text-slate-400 ml-2">{result.company}</span><span className="block text-xs text-slate-500 mt-1">{result.exchange || 'Mercado público'}</span></button>)}</div>}
        {error && <p className="text-amber-400 text-sm mt-3">{error}</p>}
        <div className="flex flex-wrap gap-2 mt-5">
          {selectedStocks.map(symbol => <span key={symbol} className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-200">{symbol}<button onClick={() => removeCompany(symbol)} aria-label={`Quitar ${symbol}`} className="text-cyan-400 hover:text-white">×</button></span>)}
          <span className="text-xs text-slate-500 self-center ml-1">{selectedStocks.length}/3 seleccionadas</span>
        </div>
      </section>

      {selectedStocks.length > 0 && <section className="mb-8">
        <div className="flex items-center justify-between mb-4"><h3 className="text-xl font-semibold text-white">Vista rápida {loading && <span className="text-sm text-slate-500 font-normal">Actualizando...</span>}</h3><span className="text-xs text-slate-500">Comparación orientativa</span></div>
        <div className="grid md:grid-cols-3 gap-4">{selectedStocks.map(symbol => {
          const quote = quotes[symbol] || {}
          return <article key={symbol} className={`border rounded-xl p-5 ${symbol === strongestMomentum ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-slate-800 bg-[#0c1422]'}`}>
            <div className="flex justify-between items-start"><div><p className="text-2xl font-semibold text-white">{symbol}</p><p className="text-xs text-slate-500 mt-1">{quote.company || 'Empresa seleccionada'}</p></div><button onClick={() => removeCompany(symbol)} className="text-slate-500 hover:text-white">×</button></div>
            <p className="text-3xl font-semibold text-cyan-300 mt-5">{quote.price ? `$${formatNumber(quote.price)}` : 'N/D'}</p>
            <p className={`text-sm mt-1 ${Number(quote.changePercent) >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>{quote.changePercent == null ? 'N/D' : `${Number(quote.changePercent) >= 0 ? '+' : ''}${formatNumber(quote.changePercent)}% hoy`}</p>
            {symbol === strongestMomentum && <span className="inline-block text-xs text-emerald-300 mt-4">Mejor momentum diario del grupo</span>}
          </article>
        })}</div>
      </section>}

      {selectedStocks.length > 0 && <section className="border border-slate-800 rounded-2xl bg-[#0c1422] p-5 mb-8 overflow-x-auto">
        <h3 className="text-xl font-semibold text-white mb-4">Métricas lado a lado</h3>
        <table className="w-full min-w-[700px] text-left"><thead><tr className="border-b border-slate-700"><th className="px-4 py-3 text-sm text-slate-500">Métrica</th>{selectedStocks.map(symbol => <th key={symbol} className="px-4 py-3 text-cyan-300">{symbol}</th>)}</tr></thead><tbody>{comparisonData.map(metric => <tr key={metric.key} className="border-b border-slate-800"><td className="px-4 py-3 text-sm text-slate-300">{metric.label}</td>{selectedStocks.map(symbol => { const value = quotes[symbol]?.[metric.key]; return <td key={`${symbol}-${metric.key}`} className="px-4 py-3 text-sm text-white">{value == null ? 'N/D' : `${metric.suffix === '$' ? '$' : ''}${formatNumber(value)}${metric.suffix === '%' ? '%' : ''}`}</td> })}</tr>)}</tbody></table>
      </section>}

      {selectedStocks.length > 0 && <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {selectedStocks.map(symbol => <article key={symbol} className="border border-slate-800 rounded-xl bg-[#0c1422] p-5"><h3 className="text-xl font-semibold text-white mb-4">{symbol}</h3><div className="mb-5"><h4 className="text-sm font-semibold text-emerald-400 mb-2">Fortalezas</h4><ul className="space-y-1 text-sm text-slate-400">{(fallbackAdvantages[symbol] || ['Consultar perfil y analizar el sector', 'Evaluar resultados y generación de caja', 'Comparar valoración con pares']).map(item => <li key={item}>+ {item}</li>)}</ul></div><div><h4 className="text-sm font-semibold text-rose-400 mb-2">Riesgos a revisar</h4><ul className="space-y-1 text-sm text-slate-400">{(fallbackRisks[symbol] || ['Volatilidad del precio', 'Riesgo del sector', 'Liquidez y tipo de cambio']).map(item => <li key={item}>− {item}</li>)}</ul></div></article>)}
      </section>}
    </div>
  )
}
