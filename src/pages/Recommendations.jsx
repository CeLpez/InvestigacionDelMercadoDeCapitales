import React, { useMemo, useState } from 'react'
import { mockStocks } from '../services/stockService'

const ideas = [
  { symbol: 'AAPL', thesis: 'Ecosistema, servicios y capacidad de monetizar una base de usuarios global.', profile: 'Calidad', risk: 'Moderado', horizon: 'Largo plazo', tags: ['Tecnología', 'Calidad'] },
  { symbol: 'MSFT', thesis: 'Ingresos recurrentes y exposición a nube, software empresarial e inteligencia artificial.', profile: 'Crecimiento', risk: 'Moderado', horizon: 'Largo plazo', tags: ['Tecnología', 'Crecimiento'] },
  { symbol: 'GOOGL', thesis: 'Escala en publicidad y opcionalidad en nube e inteligencia artificial.', profile: 'Valor', risk: 'Moderado', horizon: 'Mediano plazo', tags: ['Tecnología', 'Valor'] },
  { symbol: 'AMZN', thesis: 'AWS y logística aportan motores distintos, aunque el retail mantiene márgenes ajustados.', profile: 'Crecimiento', risk: 'Alto', horizon: 'Largo plazo', tags: ['Consumo', 'Crecimiento'] },
  { symbol: 'TSLA', thesis: 'Potencial de movilidad eléctrica y energía, con elevada sensibilidad a competencia y ejecución.', profile: 'Crecimiento', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Automotriz', 'Crecimiento'] },
  { symbol: 'JPM', thesis: 'Escala, diversificación y franquicia bancaria para seguir el ciclo financiero.', profile: 'Valor', risk: 'Moderado', horizon: 'Mediano plazo', tags: ['Finanzas', 'Valor'], type: 'Acción' },
  { symbol: 'NVDA', thesis: 'Exposición a infraestructura de inteligencia artificial, con valoración y competencia como riesgos principales.', profile: 'Crecimiento', risk: 'Alto', horizon: 'Largo plazo', tags: ['Tecnología', 'IA'], type: 'Acción' },
  { symbol: 'JNJ', thesis: 'Negocio diversificado de salud y perfil defensivo, sujeto a litigios y regulación.', profile: 'Calidad', risk: 'Bajo', horizon: 'Largo plazo', tags: ['Salud', 'Defensiva'], type: 'Acción' },
  { symbol: 'XOM', thesis: 'Exposición a energía y generación de caja, con sensibilidad al precio del petróleo y transición energética.', profile: 'Valor', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Energía', 'Dividendos'], type: 'Acción' },
  { symbol: 'AL30.BA', thesis: 'Bono soberano hard-dollar de referencia para analizar riesgo argentino, duration y paridad.', profile: 'Renta fija', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Argentina', 'Hard-dollar'], type: 'Bono' },
  { symbol: 'GD30.BA', thesis: 'Bono global argentino emitido bajo ley extranjera; compará jurisdicción, paridad y vencimiento.', profile: 'Renta fija', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Argentina', 'Ley extranjera'], type: 'Bono' },
  { symbol: 'TZX26.BA', thesis: 'Instrumento CER para estudiar cobertura frente a inflación, duration y riesgo de reinversión.', profile: 'Renta fija', risk: 'Moderado', horizon: 'Corto plazo', tags: ['Argentina', 'CER'], type: 'Bono' },
  { symbol: 'TX28.BA', thesis: 'Bono ajustable por CER con vencimiento posterior; evaluar inflación esperada, liquidez y tasa real.', profile: 'Renta fija', risk: 'Moderado', horizon: 'Mediano plazo', tags: ['Argentina', 'CER'], type: 'Bono' },
  { symbol: 'YPF', thesis: 'ADR argentino vinculado a energía y Vaca Muerta; analizá producción, deuda, regulación y precio del petróleo.', profile: 'ADR argentino', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Argentina', 'Energía'], type: 'ADR' },
  { symbol: 'GGAL', thesis: 'ADR de Grupo Financiero Galicia; evaluar crecimiento del crédito, morosidad, regulación y exposición al ciclo argentino.', profile: 'ADR argentino', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Argentina', 'Finanzas'], type: 'ADR' },
  { symbol: 'PAM', thesis: 'ADR de Pampa Energía con exposición a electricidad, gas y generación; revisar regulación y precios de energía.', profile: 'ADR argentino', risk: 'Alto', horizon: 'Largo plazo', tags: ['Argentina', 'Energía'], type: 'ADR' },
  { symbol: 'TGS', thesis: 'ADR de Transportadora de Gas del Sur; estudiar tarifas, transporte de gas, inversiones y marco regulatorio.', profile: 'ADR argentino', risk: 'Alto', horizon: 'Largo plazo', tags: ['Argentina', 'Gas'], type: 'ADR' },
  { symbol: 'BMA', thesis: 'ADR de Banco Macro; comparar rentabilidad, liquidez, calidad de cartera y sensibilidad al ciclo local.', profile: 'ADR argentino', risk: 'Alto', horizon: 'Mediano plazo', tags: ['Argentina', 'Finanzas'], type: 'ADR' },
  { symbol: 'CRESY', thesis: 'ADR de Cresud con exposición agropecuaria e inmobiliaria; revisar precios de commodities, tierras y clima.', profile: 'ADR argentino', risk: 'Alto', horizon: 'Largo plazo', tags: ['Argentina', 'Agro'], type: 'ADR' }
]

const riskClass = { Bajo: 'text-emerald-400 bg-emerald-500/10', Moderado: 'text-amber-300 bg-amber-500/10', Alto: 'text-rose-400 bg-rose-500/10' }

const checklistByType = {
  Acción: [
    ['Tesis', '¿Podés explicar en una frase cómo gana dinero la empresa y cuál es su ventaja competitiva?', 'Revisá crecimiento de ingresos, márgenes, flujo de caja y posición frente a competidores.'],
    ['Valoración', '¿El precio actual deja margen de seguridad frente a tus supuestos?', 'Contrastá P/E, crecimiento esperado, flujo de caja y múltiplos de empresas comparables.'],
    ['Riesgo', '¿Qué evento podría invalidar la tesis?', 'Considerá deuda, regulación, concentración de clientes, competencia, moneda y volatilidad.'],
    ['Catalizadores', '¿Qué dato futuro confirmaría o debilitaría la idea?', 'Definí resultados, lanzamientos, guidance, cambios regulatorios o métricas operativas concretas.']
  ],
  ADR: [
    ['Tesis', '¿Qué exposición argentina o sectorial estás comprando a través del ADR?', 'Separá el desempeño de la empresa del riesgo país, tipo de cambio, regulación y liquidez.'],
    ['Valoración', '¿La cotización compensa la volatilidad y el riesgo de mercado donde opera?', 'Compará múltiplos, crecimiento, deuda y valuación con pares regionales e internacionales.'],
    ['Riesgo', '¿Qué impacto tendrían una devaluación, controles o cambios regulatorios?', 'Revisá jurisdicción, liquidez del ADR, deuda, ingresos en moneda extranjera y riesgo político.'],
    ['Catalizadores', '¿Qué cambio operativo o macroeconómico podría mejorar la cotización?', 'Anotá resultados, tarifas, producción, crédito, commodities, elecciones o reformas relevantes.']
  ],
  Bono: [
    ['Tesis', '¿Qué función cumple el bono en tu cartera: renta, cobertura o recuperación de capital?', 'Definí moneda, vencimiento, flujo de pagos y si buscás mantenerlo o venderlo antes.'],
    ['Valoración', '¿La paridad y el rendimiento compensan el riesgo asumido?', 'Compará precio, TIR, duration, ley aplicable, cupón y alternativas con vencimientos similares.'],
    ['Riesgo', '¿Qué ocurre si suben las tasas, cambia la inflación o se deteriora el crédito?', 'Medí duration, riesgo de default, liquidez, moneda y sensibilidad a escenarios adversos.'],
    ['Catalizadores', '¿Qué evento podría mover la paridad o comprimir el spread?', 'Seguí pagos, canjes, resultado fiscal, reservas, riesgo país y cambios en la curva soberana.']
  ]
}

export default function Recommendations() {
  const [filter, setFilter] = useState('Todas')
  const [selected, setSelected] = useState(null)
  const [checklist, setChecklist] = useState({})
  const filters = ['Todas', 'Acciones', 'ADR argentinos', 'Bonos', 'Calidad', 'Crecimiento', 'Valor', 'Renta fija', 'Bajo riesgo']
  const filteredIdeas = useMemo(() => ideas.filter(idea => filter === 'Todas' || (filter === 'Acciones' && idea.type === 'Acción') || (filter === 'ADR argentinos' && idea.type === 'ADR') || (filter === 'Bonos' && idea.type === 'Bono') || idea.profile === filter || (filter === 'Bajo riesgo' && idea.risk === 'Bajo')), [filter])

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
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-5"><p className="text-xs uppercase tracking-wider text-slate-500">Universo ampliado</p><p className="text-sm text-slate-300 mt-3">Incluye acciones globales, ADR argentinos y bonos para comparar riesgo, plazo, moneda y liquidez.</p></div>
      </section>

      <div className="flex flex-wrap gap-2 mb-5">{filters.map(item => <button key={item} onClick={() => setFilter(item)} className={`px-4 py-2 rounded-full text-sm ${filter === item ? 'bg-cyan-400 text-slate-950 font-semibold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>{item}</button>)}</div>
      <section className="grid md:grid-cols-2 gap-4 mb-10">
        {filteredIdeas.map(idea => {
          const stock = mockStocks[idea.symbol] || {}
          const upside = stock.price ? ((idea.symbol === 'AAPL' ? 210 : idea.symbol === 'MSFT' ? 420 : stock.price * 1.12) / stock.price - 1) * 100 : null
          return <article key={idea.symbol} className="border border-slate-800 rounded-2xl bg-[#0c1422] p-5 hover:border-cyan-500/40 transition-colors">
            <div className="flex items-start justify-between gap-3"><div><span className="text-2xl font-semibold text-white">{idea.symbol}</span><p className="text-sm text-slate-500 mt-1">{idea.type} · {stock.company || 'Instrumento argentino'}</p></div><span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskClass[idea.risk]}`}>Riesgo {idea.risk}</span></div>
            <div className="grid grid-cols-3 gap-2 mt-5"><div><p className="text-xs text-slate-500">Precio</p><p className="text-white font-semibold">{stock.price ? `$${stock.price}` : 'Consultar'}</p></div><div><p className="text-xs text-slate-500">{idea.type === 'Bono' ? 'Moneda' : idea.type === 'ADR' ? 'Mercado' : 'P/E'}</p><p className="text-white font-semibold">{idea.type === 'Bono' ? 'ARS / USD' : idea.type === 'ADR' ? 'NYSE / Nasdaq' : (stock.pe || 'N/D')}</p></div><div><p className="text-xs text-slate-500">Cambio</p><p className={stock.changePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}>{stock.changePercent == null ? 'N/D' : `${stock.changePercent >= 0 ? '+' : ''}${stock.changePercent}%`}</p></div></div>
            <p className="text-sm text-slate-300 leading-relaxed mt-5">{idea.thesis}</p>
            <div className="flex flex-wrap gap-2 mt-4">{idea.tags.map(tag => <span key={tag} className="text-xs px-2 py-1 rounded bg-slate-900 text-slate-400">{tag}</span>)}<span className="text-xs px-2 py-1 rounded bg-slate-900 text-slate-400">{idea.horizon}</span></div>
            <button onClick={() => { setSelected({ ...idea, stock, upside }); setChecklist({}) }} className="w-full mt-5 py-2.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-cyan-500 hover:text-slate-950 font-medium transition-colors">Ver tesis y checklist</button>
          </article>
        })}
      </section>

      {selected && <section className="border border-cyan-500/30 rounded-2xl bg-cyan-500/5 p-6 mb-10">
        <div className="flex justify-between items-start"><div><p className="text-xs uppercase tracking-wider text-cyan-300">Evaluación guiada · {selected.type}</p><h3 className="text-2xl text-white font-semibold mt-2">{selected.symbol} · {selected.profile}</h3></div><button onClick={() => setSelected(null)} className="text-slate-400 hover:text-white">×</button></div>
        <div className="mt-5 border border-slate-800 bg-slate-900/50 rounded-xl p-4"><p className="text-xs uppercase tracking-wider text-slate-500">Tesis de trabajo</p><p className="text-white leading-relaxed mt-2">{selected.thesis}</p><p className="text-sm text-slate-400 mt-3">Antes de decidir, escribí qué tendría que ocurrir para que esta tesis sea correcta y qué evidencia te haría cambiar de opinión.</p></div>
        <div className="flex items-center justify-between mt-6 mb-3"><div><h4 className="text-lg font-semibold text-white">Checklist de decisión</h4><p className="text-sm text-slate-400">Marcá cada eje solo cuando hayas verificado la información.</p></div><span className="text-sm text-cyan-300">{Object.values(checklist).filter(Boolean).length}/4 completos</span></div>
        <div className="space-y-3">{(checklistByType[selected.type] || checklistByType.Acción).map(([title, question, guidance]) => <div key={title} className={`border rounded-xl p-4 ${checklist[title] ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-slate-800 bg-slate-900/40'}`}><div className="flex items-start gap-3"><input type="checkbox" checked={Boolean(checklist[title])} onChange={event => setChecklist({ ...checklist, [title]: event.target.checked })} className="mt-1 accent-emerald-400" /><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold text-white">{title}</p><span className="text-xs text-slate-500">{checklist[title] ? 'Verificado' : 'Pendiente'}</span></div><p className="text-sm text-slate-300 mt-2">{question}</p><p className="text-xs text-slate-500 mt-2">Guía: {guidance}</p></div></div></div>)}</div>
        <div className="grid md:grid-cols-3 gap-3 mt-6"><div className="bg-slate-900/60 rounded-lg p-4"><p className="text-xs text-slate-500">Preparación</p><p className="text-xl font-semibold text-white mt-1">{Object.values(checklist).filter(Boolean).length < 4 ? 'En análisis' : 'Checklist completo'}</p></div><div className="bg-slate-900/60 rounded-lg p-4"><p className="text-xs text-slate-500">Riesgo declarado</p><p className={`text-xl font-semibold mt-1 ${riskClass[selected.risk].split(' ')[0]}`}>{selected.risk}</p></div><div className="bg-slate-900/60 rounded-lg p-4"><p className="text-xs text-slate-500">Horizonte</p><p className="text-xl font-semibold text-white mt-1">{selected.horizon}</p></div></div>
        {selected.upside != null && <p className="text-xs text-slate-500 mt-5">El potencial orientativo calculado no es un precio objetivo ni una promesa de rendimiento: {selected.upside >= 0 ? '+' : ''}{selected.upside.toFixed(1)}%.</p>}
      </section>}

      <div className="border border-amber-500/30 bg-amber-500/5 rounded-xl p-5 text-sm text-slate-300">⚠️ Estas ideas son educativas y pueden estar desactualizadas. Verificá estados financieros, noticias, liquidez, comisiones, impuestos y tu tolerancia al riesgo antes de operar.</div>
    </div>
  )
}
