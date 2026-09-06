import React from 'react'
import { mockStocks } from '../services/stockService'

export default function Recommendations() {
  const recommendations = [
    {
      symbol: 'AAPL',
      rating: 'BUY',
      targetPrice: 210,
      reason: 'Fuerte posición de mercado en tecnología, ecosistema integrado',
      riskLevel: 'Moderado',
      timeframe: '12 meses'
    },
    {
      symbol: 'MSFT',
      rating: 'BUY',
      targetPrice: 420,
      reason: 'Crecimiento en cloud computing (Azure), AI integration en Office',
      riskLevel: 'Bajo',
      timeframe: '12 meses'
    },
    {
      symbol: 'GOOGL',
      rating: 'HOLD',
      targetPrice: 150,
      reason: 'Saturación en búsqueda, pero oportunidades en AI y publicidad',
      riskLevel: 'Moderado',
      timeframe: '6 meses'
    },
    {
      symbol: 'TSLA',
      rating: 'BUY',
      targetPrice: 300,
      reason: 'Liderazgo en vehículos eléctricos, potencial de energía renovable',
      riskLevel: 'Alto',
      timeframe: '18 meses'
    },
    {
      symbol: 'AMZN',
      rating: 'HOLD',
      targetPrice: 185,
      reason: 'AWS dominante pero e-commerce con márgenes bajos',
      riskLevel: 'Moderado',
      timeframe: '12 meses'
    }
  ]

  const strategies = [
    {
      title: 'Estrategia de Crecimiento',
      description: 'Enfócate en empresas tech con alto potencial de crecimiento',
      stocks: ['AAPL', 'MSFT', 'TSLA'],
      risk: 'Alto'
    },
    {
      title: 'Estrategia de Valor',
      description: 'Empresas establecidas con dividendos consistentes',
      stocks: ['MSFT', 'AMZN'],
      risk: 'Bajo'
    },
    {
      title: 'Estrategia Balanceada',
      description: 'Mezcla de crecimiento e ingresos pasivos',
      stocks: ['AAPL', 'MSFT', 'GOOGL'],
      risk: 'Moderado'
    }
  ]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">💡 Recomendaciones de Inversión</h2>

      {/* Recomendaciones individuales */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {recommendations.map(rec => {
          const stock = mockStocks[rec.symbol]
          const ratingColor = rec.rating === 'BUY' ? 'green' : rec.rating === 'HOLD' ? 'yellow' : 'red'

          return (
            <div key={rec.symbol} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-blue-400">{rec.symbol}</h3>
                  <p className="text-slate-400">{stock.company}</p>
                </div>
                <span className={`px-3 py-1 rounded-full font-bold text-white ${
                  ratingColor === 'green' && 'bg-green-600'
                } ${
                  ratingColor === 'yellow' && 'bg-yellow-600'
                } ${
                  ratingColor === 'red' && 'bg-red-600'
                }`}>
                  {rec.rating}
                </span>
              </div>

              <div className="space-y-3 mb-4">
                <div className="bg-slate-900/50 p-3 rounded">
                  <p className="text-slate-400 text-sm">Precio Actual / Target</p>
                  <p className="font-bold">${stock.price} → ${rec.targetPrice}</p>
                </div>

                <div className="bg-slate-900/50 p-3 rounded">
                  <p className="text-slate-400 text-sm">Razón</p>
                  <p className="text-sm">{rec.reason}</p>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900/50 p-3 rounded">
                    <p className="text-slate-400 text-sm">Riesgo</p>
                    <p className={`font-bold text-sm ${
                      rec.riskLevel === 'Bajo' && 'text-green-400'
                    } ${
                      rec.riskLevel === 'Moderado' && 'text-yellow-400'
                    } ${
                      rec.riskLevel === 'Alto' && 'text-red-400'
                    }`}>
                      {rec.riskLevel}
                    </p>
                  </div>
                  <div className="bg-slate-900/50 p-3 rounded">
                    <p className="text-slate-400 text-sm">Horizonte</p>
                    <p className="font-bold text-sm">{rec.timeframe}</p>
                  </div>
                </div>
              </div>

              <button className="w-full bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all">
                Ver Análisis Completo
              </button>
            </div>
          )
        })}
      </div>

      {/* Estrategias de cartera */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 mb-8">
        <h3 className="text-2xl font-bold mb-6">📊 Estrategias de Cartera Sugeridas</h3>
        <div className="grid md:grid-cols-3 gap-6">
          {strategies.map((strat, idx) => (
            <div key={idx} className="bg-slate-900/50 p-6 rounded-lg border border-slate-700">
              <h4 className="text-xl font-bold mb-2">{strat.title}</h4>
              <p className="text-slate-400 text-sm mb-4">{strat.description}</p>

              <div className="mb-4">
                <p className="text-sm font-bold text-slate-400 mb-2">Composición:</p>
                <div className="flex flex-wrap gap-2">
                  {strat.stocks.map(s => (
                    <span key={s} className="px-3 py-1 bg-blue-600/30 text-blue-300 rounded-full text-sm">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className={`p-3 rounded text-sm font-bold ${
                strat.risk === 'Bajo' && 'bg-green-600/20 text-green-400'
              } ${
                strat.risk === 'Moderado' && 'bg-yellow-600/20 text-yellow-400'
              } ${
                strat.risk === 'Alto' && 'bg-red-600/20 text-red-400'
              }`}>
                Riesgo: {strat.risk}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Factores macroeconómicos */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-6">🌍 Factores Macroeconómicos a Monitorear</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { factor: 'Tasas de Interés', impact: 'Afecta valuaciones y borrowing costs', direction: '⬆️ Al alza' },
            { factor: 'Inflación', impact: 'Reduce ganancias reales y márgenes', direction: '➡️ Estable' },
            { factor: 'Ciclo Económico', impact: 'Afecta ganancias corporativas', direction: '⬆️ Expansión' },
            { factor: 'USD Strength', impact: 'Afecta exportaciones de empresas US', direction: '⬆️ Fuerte' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 p-4 rounded-lg">
              <p className="font-bold text-blue-400 mb-1">{item.factor}</p>
              <p className="text-sm text-slate-400 mb-2">{item.impact}</p>
              <p className="text-sm font-bold">{item.direction}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 bg-blue-900/30 border border-blue-700/50 rounded-xl p-6">
        <p className="text-sm text-slate-300">
          ⚠️ <strong>Disclaimer:</strong> Estas recomendaciones son solo educativas. No constituyen asesoramiento financiero.
          Consulta con un asesor financiero calificado antes de tomar decisiones de inversión.
        </p>
      </div>
    </div>
  )
}
