import React, { useMemo, useState } from 'react'
import { mockStocks } from '../services/stockService'

const descriptions = {
  Technology: 'Software, hardware y servicios digitales. Suele ofrecer crecimiento, aunque con sensibilidad a tasas y valoración.',
  'Consumer Cyclical': 'Consumo discrecional y retail. Depende del ciclo económico, empleo y confianza del consumidor.',
  Automotive: 'Fabricantes y movilidad. Es intensivo en capital y atraviesa una transición tecnológica.',
  default: 'Empresas con dinámicas, riesgos y motores de crecimiento propios. Compará sus métricas antes de invertir.'
}

const riskBySector = { Technology: 'Media-alta', 'Consumer Cyclical': 'Media', Automotive: 'Alta' }

export default function SectorAnalysis() {
  const [selectedSector, setSelectedSector] = useState('Technology')
  const [query, setQuery] = useState('')

  const sectors = useMemo(() => Object.values(mockStocks).reduce((groups, stock) => {
    const name = stock.sector || 'Otros'
    groups[name] = [...(groups[name] || []), stock]
    return groups
  }, {}), [])

  const sectorStats = useMemo(() => Object.entries(sectors).map(([sector, stocks]) => {
    const averageChange = stocks.reduce((sum, stock) => sum + Number(stock.changePercent || 0), 0) / stocks.length
    const averagePe = stocks.reduce((sum, stock) => sum + Number(stock.pe || 0), 0) / stocks.filter(stock => stock.pe).length || 0
    return { sector, stocks, averageChange, averagePe }
  }).sort((a, b) => b.averageChange - a.averageChange), [sectors])

  const selected = sectors[selectedSector] || []
  const filtered = selected.filter(stock => `${stock.symbol} ${stock.company}`.toLowerCase().includes(query.toLowerCase()))
  const bestSector = sectorStats[0]

  return (
    <div className="max-w-[1250px] mx-auto px-4 lg:px-8 py-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-3">Mapa del mercado</p>
        <h2 className="text-4xl font-semibold tracking-tight text-white">Sectores</h2>
        <p className="text-slate-400 mt-3 max-w-3xl">Observá qué industrias concentran oportunidades, qué riesgos tienen y qué empresas integran cada grupo. Los rendimientos mostrados son de referencia.</p>
      </header>

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Sectores disponibles</p><p className="text-3xl font-semibold text-white mt-2">{sectorStats.length}</p></div>
        <div className="border border-emerald-500/30 rounded-xl bg-emerald-500/5 p-5"><p className="text-xs uppercase tracking-wider text-emerald-300">Mejor momentum</p><p className="text-2xl font-semibold text-white mt-2">{bestSector?.sector || 'N/D'}</p><p className="text-sm text-emerald-400 mt-1">{bestSector ? `+${bestSector.averageChange.toFixed(2)}% promedio` : 'N/D'}</p></div>
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Criterio de lectura</p><p className="text-sm text-slate-300 mt-3">Momentum no equivale a calidad ni garantiza rendimientos futuros.</p></div>
      </div>

      <section className="grid lg:grid-cols-[300px_1fr] gap-6">
        <aside className="space-y-2">
          <h3 className="text-sm uppercase tracking-wider text-slate-500 mb-3">Ranking por variación</h3>
          {sectorStats.map(item => <button key={item.sector} onClick={() => { setSelectedSector(item.sector); setQuery('') }} className={`w-full text-left p-4 rounded-xl border transition-colors ${selectedSector === item.sector ? 'border-cyan-400/50 bg-cyan-400/10' : 'border-slate-800 bg-[#0c1422] hover:border-slate-600'}`}><div className="flex justify-between gap-3"><span className="font-semibold text-white">{item.sector}</span><span className={item.averageChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{item.averageChange >= 0 ? '+' : ''}{item.averageChange.toFixed(2)}%</span></div><p className="text-xs text-slate-500 mt-2">{item.stocks.length} empresas · Riesgo {riskBySector[item.sector] || 'Variable'}</p></button>)}
        </aside>

        <div className="border border-slate-800 rounded-2xl bg-[#0c1422] p-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-6"><div><h3 className="text-2xl font-semibold text-white">{selectedSector}</h3><p className="text-slate-400 mt-2 max-w-2xl">{descriptions[selectedSector] || descriptions.default}</p></div><div className="text-left md:text-right"><p className="text-xs text-slate-500">P/E promedio</p><p className="text-xl text-white font-semibold">{sectorStats.find(item => item.sector === selectedSector)?.averagePe.toFixed(2) || 'N/D'}</p></div></div>
          <div className="flex flex-col sm:flex-row gap-3 mb-5"><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Filtrar empresas del sector..." className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /><span className="px-4 py-3 rounded-lg bg-slate-900 text-sm text-slate-400">{filtered.length} resultados</span></div>
          <div className="grid md:grid-cols-2 gap-3">{filtered.map(stock => <article key={stock.symbol} className="border border-slate-800 rounded-xl p-4 hover:border-cyan-500/50 transition-colors"><div className="flex justify-between"><div><p className="font-semibold text-cyan-300">{stock.symbol}</p><p className="text-sm text-slate-400 mt-1">{stock.company}</p></div><p className="text-white font-semibold">${stock.price?.toFixed(2) || 'N/D'}</p></div><div className="flex gap-5 mt-4 text-sm"><span className={stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{stock.changePercent >= 0 ? '+' : ''}{stock.changePercent}%</span><span className="text-slate-500">P/E {stock.pe || 'N/D'}</span></div></article>)}</div>
          {filtered.length === 0 && <p className="text-center text-slate-500 py-10">No hay empresas que coincidan con la búsqueda.</p>}
        </div>
      </section>
    </div>
  )
}
