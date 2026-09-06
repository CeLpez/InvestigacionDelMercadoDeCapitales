import React, { useState } from 'react'
import { mockStocks } from '../services/stockService'

export default function FinancialNews() {
  // Mock news data
  const [allNews] = useState([
    {
      id: 1,
      symbol: 'AAPL',
      title: 'Apple presenta nuevo iPhone 16 con AI integrada',
      summary: 'Apple anunció su nuevo iPhone 16 con capacidades de inteligencia artificial avanzadas que cambian el juego.',
      date: '2026-09-05',
      time: '14:30',
      source: 'Reuters',
      impact: 'positive',
      category: 'Producto'
    },
    {
      id: 2,
      symbol: 'MSFT',
      title: 'Microsoft reporta crecimiento del 15% en Azure',
      summary: 'Microsoft anunció un aumento del 15% en los ingresos de Azure impulsado por la demanda de servicios en la nube.',
      date: '2026-09-05',
      time: '13:15',
      source: 'Bloomberg',
      impact: 'positive',
      category: 'Resultados'
    },
    {
      id: 3,
      symbol: 'GOOGL',
      title: 'Reguladores investigan prácticas de privacidad de Google',
      summary: 'Reguladores europeos investigan las prácticas de recopilación de datos de Google en publicidad digital.',
      date: '2026-09-04',
      time: '10:45',
      source: 'Financial Times',
      impact: 'negative',
      category: 'Regulación'
    },
    {
      id: 4,
      symbol: 'TSLA',
      title: 'Tesla anuncia nueva Gigafactory en México',
      summary: 'Tesla anunció planes para construir una nueva gigafactory en México con capacidad para 500,000 vehículos anuales.',
      date: '2026-09-04',
      time: '16:00',
      source: 'Reuters',
      impact: 'positive',
      category: 'Expansión'
    },
    {
      id: 5,
      symbol: 'AMZN',
      title: 'Amazon enfrenta nuevas acusaciones antimonopolio',
      summary: 'Autoridades estadounidenses presentan nuevas acusaciones de prácticas anticompetencia contra Amazon.',
      date: '2026-09-03',
      time: '12:30',
      source: 'CNBC',
      impact: 'negative',
      category: 'Legal'
    },
    {
      id: 6,
      symbol: 'AAPL',
      title: 'Analistas elevan precio objetivo de Apple a $220',
      summary: 'Múltiples analistas de Wall Street elevan sus precios objetivo para Apple después de la presentación de producto.',
      date: '2026-09-03',
      time: '09:15',
      source: 'MarketWatch',
      impact: 'positive',
      category: 'Análisis'
    },
    {
      id: 7,
      symbol: 'MSFT',
      title: 'Microsoft invierte $10 mil millones en OpenAI',
      summary: 'Microsoft invierte $10 mil millones adicionales en OpenAI para acelerar desarrollo de IA empresarial.',
      date: '2026-09-02',
      time: '11:00',
      source: 'Bloomberg',
      impact: 'positive',
      category: 'Inversión'
    }
  ])

  const [selectedSymbol, setSelectedSymbol] = useState('ALL')
  const [selectedCategory, setSelectedCategory] = useState('ALL')

  const filteredNews = allNews.filter(news => {
    const symbolMatch = selectedSymbol === 'ALL' || news.symbol === selectedSymbol
    const categoryMatch = selectedCategory === 'ALL' || news.category === selectedCategory
    return symbolMatch && categoryMatch
  })

  const categories = [...new Set(allNews.map(n => n.category))]
  const symbols = [...new Set(allNews.map(n => n.symbol))]

  const getImpactColor = (impact) => {
    return impact === 'positive'
      ? 'bg-green-600/30 text-green-400'
      : impact === 'negative'
      ? 'bg-red-600/30 text-red-400'
      : 'bg-slate-600/30 text-slate-400'
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">📰 Noticias Financieras</h2>

      {/* Filtros */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
          <label className="block text-sm font-bold mb-2">Filtrar por Acción</label>
          <select
            value={selectedSymbol}
            onChange={(e) => setSelectedSymbol(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todas las acciones</option>
            {symbols.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-4">
          <label className="block text-sm font-bold mb-2">Filtrar por Categoría</label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
          >
            <option value="ALL">Todas las categorías</option>
            {categories.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Noticias */}
      <div className="space-y-4">
        {filteredNews.map(news => (
          <div
            key={news.id}
            className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-3">
              <div>
                <h3 className="text-xl font-bold text-blue-400 mb-1">{news.title}</h3>
                <p className="text-slate-400 text-sm">{news.summary}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap ml-4 ${getImpactColor(news.impact)}`}>
                {news.impact === 'positive' && '📈 Positivo'}
                {news.impact === 'negative' && '📉 Negativo'}
                {news.impact === 'neutral' && '➡️ Neutral'}
              </span>
            </div>

            <div className="flex flex-wrap gap-3 items-center pt-3 border-t border-slate-700">
              <span className="px-3 py-1 bg-blue-600/30 text-blue-400 rounded-full text-sm font-bold">
                {news.symbol}
              </span>
              <span className="px-3 py-1 bg-slate-700 rounded-full text-sm text-slate-300">
                {news.category}
              </span>
              <span className="text-sm text-slate-400">
                {news.date} {news.time}
              </span>
              <span className="text-sm text-slate-500">
                • Fuente: {news.source}
              </span>
            </div>
          </div>
        ))}
      </div>

      {filteredNews.length === 0 && (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
          <p className="text-slate-400">No hay noticias que coincidan con los filtros</p>
        </div>
      )}

      {/* Resumen de tendencias */}
      <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4">📊 Resumen de Sentimiento</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Noticias Positivas</p>
            <p className="text-3xl font-bold text-green-400">
              {allNews.filter(n => n.impact === 'positive').length}
            </p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Noticias Negativas</p>
            <p className="text-3xl font-bold text-red-400">
              {allNews.filter(n => n.impact === 'negative').length}
            </p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-lg">
            <p className="text-slate-400 text-sm">Total de Noticias</p>
            <p className="text-3xl font-bold text-cyan-400">
              {allNews.length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
