import React, { useMemo, useState } from 'react'
import { mockStocks } from '../services/stockService'

const ideas = [
  { symbol: 'AAPL', thesis: 'Ecosistema, servicios y capacidad de monetizar una base de usuarios global.', profile: 'Calidad', risk: 'Moderado', horizon: 'Largo plazo', tags: ['Tecnología', 'Calidad'] },
  { symbol: 'MSFT', thesis: 'Ingresos recurrentes y exposición a nube, software empresarial e inteligencia artificial.', profile: 'Crecimiento', risk: 'Moderado', horizon: 'Largo plazo', tags: ['Tecnología', 'Crecimiento'] },
  { symbol: 'GOOGL', thesis: 'Escala en publicidad y opcionalidad en nube e inteligencia artificial.', profile: 'Valor', risk: 'Moderado', horizon: 'Mediano plazo', tags: ['Tecnología', 'Valor'] },
  { symbol: 'AMZN', thesis: 'AWS y logística aportan motores distintos, aunque el retail mantiene márgenes ajustados.', profile: 'Crecimiento', risk: 'Alto', horizon: 'Largo plazo', tags: ['Consumo', 'Crecimiento'] },
  { symbol: 'TSLA', thesis: 'Potencial de movilidad eléctrica y energía, con elevada sensibilidad a competencia y ejecución.', profile: 'Crecimiento', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Automotriz', 'Crecimiento'] },
  { symbol: 'JPM', thesis: 'Escala, diversificación y franquicia bancaria para seguir el ciclo financiero.', profile: 'Valor', risk: 'Moderado', horizon: 'Mediano plazo', tags: ['Finanzas', 'Valor'] }
]

const riskClass = { Bajo: 'text-emerald-400 bg-emerald-500/10', Moderado: 'text-amber-300 bg-amber-500/10', Alto: 'text-rose-400 bg-rose-500/10' }

export default function Recommendations() {
  const [filter, setFilter] = useState('Todas')
  const [selected, setSelected] = useState(null)
  const filters = ['Todas', 'Calidad', 'Crecimiento', 'Valor', 'Bajo riesgo']
  const filteredIdeas = useMemo(() => ideas.filter(idea => filter === 'Todas' || idea.profile === filter || (filter === 'Bajo riesgo' && idea.risk === 'Bajo')), [filter])

  return (
    <div className="max-w-[1250px] mx-auto px-4 lg:px-8 py-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-3">Ideas para investigar</p>
        <h2 className="text-4xl font-semibold tracking-tight text-white">Recomendaciones</h2>
        <p className="text-slate-400 mt-3 max-w-3xl">Un punto de partida para investigar empresas según perfil, riesgo y horizonte. No son señales automáticas de compra ni asesoramiento financiero.</p>
      </header>

      <section className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Cómo se construyen</p><p className="text-sm text-slate-300 mt-3">Combinan sector, calidad del negocio, valoración orientativa, momentum y riesgos.</p></div>
        <div className="border border-cyan-500/30 rounded-xl bg-cyan-500/5 p-5"><p className="text-xs uppercase tracking-wider text-cyan-300">Regla de uso</p><p className="text-sm text-slate-300 mt-3">Compará la idea con sus competidores antes de decidir.</p></div>
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Horizontes</p><p className="text-sm text-slate-300 mt-3">Una tesis de largo plazo no se evalúa con el mismo criterio que una operación táctica.</p></div>
      </section>

      <div className="flex flex-wrap gap-2 mb-5">{filters.map(item => <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2 rounded-full text-sm ${filter === item ? 'bg-cyan-400 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{item}</button>)}</div>
      <section className="grid md:grid-cols-2 gap-4 mb-10">
        {filteredIdeas.map(idea => {
          const stock = mockStocks[idea.symbol] || {}
          const upside = stock.price ? ((idea.symbol === 'AAPL' ? 210 : idea.symbol === 'MSFT' ? 420 : stock.price * 1.12) / stock.price - 1) * 100 : null
          return <article key={idea.symbol} className="border border-slate-800 rounded-2xl bg-[#0c1422] p-5 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-start justify-between gap-3"><div><span className="text-2xl font-semibold text-white">{idea.symbol}</span><p className="text-sm text-slate-500 mt-1">{stock.company || 'Empresa'}</p></div><span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskClass[idea.risk]}`}>Riesgo {idea.risk}</span></div>
            <div className="grid grid-cols-3 gap-2 mt-5"><div><p className="text-xs text-slate-500">Precio</p><p className="text-white font-semibold">{stock.price ? `$${stock.price}` : 'N/D'}</p></div><div><p className="text-xs text-slate-500">P/E</p><p className="text-white font-semibold">{stock.pe || 'N/D'}</p></div><div><p className="text-xs text-slate-500">Cambio</p><p className={stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{stock.changePercent == null ? 'N/D' : `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%`}</p></div></div>
            <p className="text-sm text-slate-300 leading-relaxed mt-5">{idea.thesis}</p>
            <div className="flex flex-wrap gap-2 mt-4">{idea.tags.map(tag => <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-900 text-slate-400">{tag}</span>)}<span className="text-xs px-2 py-1 rounded bg-slate-900 text-slate-400">{idea.horizon}</span></div>
            <button onClick={() => setSelected({ ...idea, stock, upside })} className="w-full mt-5 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-cyan-500 hover:text-slate-950 font-medium transition-colors">Ver tesis y checklist</button>
          </article>
        })}
      </section>

      {selected && <section className="border border-cyan-500/30 rounded-2xl bg-cyan-500/5 p-6 mb-10">
        <div className="flex justify-between items-start"><div><p className="text-xs uppercase tracking-wider text-cyan-300">Checklist de investigación</p><h3 className="text-2xl text-white font-semibold mt-2">{selected.symbol} · {selected.profile}</h3></div><button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">×</button></div>
        <p className="text-slate-300 mt-4 max-w-3xl">{selected.thesis}</p>
        <div className="grid md:grid-cols-4 gap-3 mt-5">{[['Tesis', '¿Qué motor puede hacer crecer el negocio?'], ['Valoración', '¿El precio contempla demasiado optimismo?'], ['Riesgos', '¿Qué escenario invalida la idea?'], ['Catalizadores', '¿Qué dato debería mejorar para confirmarla?']].map(([title, text]) => <div key={title} className="bg-slate-900/60 rounded-lg p-4"><p className="text-cyan-300 font-semibold">{title}</p><p className="text-sm text-slate-400 mt-2">{text}</p></div>)}</div>
        {selected.upside != null && <p className="text-xs text-slate-500 mt-5">El potencial orientativo calculado no es un precio objetivo ni una promesa de rendimiento: {selected.upside >= 0 ? '+' : ''}{selected.upside.toFixed(1)}%.</p>}
      </section>}

      <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-5 text-sm text-slate-300">⚠️ Estas ideas son educativas y pueden estar desactualizadas. Verificá estados financieros, noticias, liquidez, comisiones, impuestos y tu tolerancia al riesgo antes de operar.</div>
    </div>
  )
}
