import React, { useEffect, useRef, useState } from 'react'
import { Line, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { stockService } from '../services/stockService'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function TechnicalAnalysis() {
  const [symbol, setSymbol] = useState('AAPL')
  const [timeframe, setTimeframe] = useState('1mo')
  const [chartData, setChartData] = useState(null)
  const [fundamentals, setFundamentals] = useState(null)
  const [technicalIndicators, setTechnicalIndicators] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [fundamentalLoading, setFundamentalLoading] = useState(false)
  const [fundamentalError, setFundamentalError] = useState('')
  const requestId = useRef(0)

  const timeframes = [
    { label: '1D', value: '1d' },
    { label: '1W', value: '5d' },
    { label: '1M', value: '1mo' },
    { label: '3M', value: '3mo' },
    { label: '6M', value: '6mo' },
    { label: '1Y', value: '1y' }
  ]

  const fetchAnalysisData = async (sym, tf) => {
    if (!sym) return
    const currentRequest = ++requestId.current
    setLoading(true)
    setError(null)
    setFundamentalError('')
    setChartData(null)
    setFundamentals(null)
    try {
      const intervalByRange = {
        '1d': '5m',
        '5d': '30m',
        '1mo': '1d',
        '3mo': '1d',
        '6mo': '1d',
        '1y': '1d'
      }
      let data
      try {
        data = await stockService.getHistoricalData(sym, intervalByRange[tf] || '1d', tf)
      } catch (intradayError) {
        // Yahoo puede rechazar datos intradía fuera del horario de mercado.
        // Se mantiene el análisis con velas diarias como respaldo.
        if (tf !== '1d' && tf !== '5d') throw intradayError
        data = await stockService.getHistoricalData(sym, '1d', '1mo')
      }
      const timestamps = data.timestamp || []
      const quote = data.indicators?.quote?.[0] || {}
      const validPoints = timestamps
        .map((timestamp, index) => ({
          timestamp,
          close: quote.close?.[index],
          volume: quote.volume?.[index] || 0
        }))
        .filter(point => Number.isFinite(point.close))

      if (validPoints.length === 0) {
        setError('No hay datos de precios disponibles')
        return
      }

      // Calcular indicadores técnicos
      const closeData = validPoints.map(point => point.close)
      const indicators = calculateTechnicalIndicators(closeData)

      // Graficar últimos 60 puntos para mejor visualización
      const limit = 60
      const startIdx = Math.max(0, validPoints.length - limit)
      const displayPoints = validPoints.slice(startIdx)
      const displayTimestamps = displayPoints.map(point => new Date(point.timestamp * 1000).toLocaleDateString())
      const displayClose = displayPoints.map(point => point.close)
      const displayVolume = displayPoints.map(point => point.volume)
      const movingAverage20 = displayClose.map((_, index) => {
        const values = closeData.slice(Math.max(0, startIdx + index - 19), startIdx + index + 1)
        return values.length >= 20 ? values.reduce((sum, value) => sum + value, 0) / values.length : null
      })
      const bollingerUpper = displayClose.map((_, index) => {
        const values = closeData.slice(Math.max(0, startIdx + index - 19), startIdx + index + 1)
        if (values.length < 20) return null
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length
        const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length)
        return mean + deviation * 2
      })
      const bollingerLower = displayClose.map((_, index) => {
        const values = closeData.slice(Math.max(0, startIdx + index - 19), startIdx + index + 1)
        if (values.length < 20) return null
        const mean = values.reduce((sum, value) => sum + value, 0) / values.length
        const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length)
        return mean - deviation * 2
      })

      setChartData({
        labels: displayTimestamps,
        closes: displayClose,
        volumes: displayVolume,
        movingAverage20,
        bollingerUpper,
        bollingerLower,
        timestamps: displayPoints.map(point => point.timestamp)
      })

      setTechnicalIndicators(indicators)

      // Obtener datos fundamentales
      setLoading(false)
      setFundamentalLoading(true)
      const profile = await stockService.getCompanyProfile(sym)
      if (currentRequest !== requestId.current) return
      setFundamentals(profile)
      if (!profile) setFundamentalError('Los datos fundamentales no están disponibles para este símbolo.')
    } catch (err) {
      console.error('Error al cargar datos:', err)
      setError(`No se pudieron cargar los datos de ${sym}. Comprueba el ticker e inténtalo nuevamente.`)
    } finally {
      setFundamentalLoading(false)
      setLoading(false)
    }
  }

  const calculateTechnicalIndicators = (closes) => {
    if (!closes || closes.length === 0) return {}

    const latest = closes[closes.length - 1]
    const previous = closes[Math.max(0, closes.length - 2)]
    const change = previous ? ((latest - previous) / previous) * 100 : 0

    // Media móvil 20
    const ma20 = closes.length >= 20
      ? closes.slice(-20).reduce((a, b) => a + b, 0) / 20
      : null

    // Media móvil 50
    const ma50 = closes.length >= 50
      ? closes.slice(-50).reduce((a, b) => a + b, 0) / 50
      : null

    // Máximo y mínimo
    const high = Math.max(...closes.filter(c => c !== null))
    const low = Math.min(...closes.filter(c => c !== null))

    // Soporte (último bajo significativo)
    const support = closes.length >= 5
      ? Math.min(...closes.slice(-5).filter(c => c !== null))
      : low

    // Resistencia (último alto significativo)
    const resistance = closes.length >= 5
      ? Math.max(...closes.slice(-5).filter(c => c !== null))
      : high

    // Volatilidad (desviación estándar)
    const mean = closes.reduce((a, b) => a + b) / closes.length
    const variance = closes.reduce((a, c) => a + Math.pow(c - mean, 2), 0) / closes.length
    const volatility = Math.sqrt(variance)

    // RSI (14 períodos, usando únicamente la ventana más reciente).
    let rsi = 50
    if (closes.length >= 14) {
      const changes = closes.slice(-15).slice(1).map((value, index) => value - closes.slice(-15)[index])
      const gains = changes.filter(c => c > 0).reduce((a, b) => a + b, 0) / changes.length
      const losses = Math.abs(changes.filter(c => c < 0).reduce((a, b) => a + b, 0)) / changes.length
      rsi = losses === 0 ? 100 : 100 - (100 / (1 + (gains / losses)))
    }

    // MACD (12, 26, 9) y señal
    const average = (values) => values.reduce((sum, value) => sum + value, 0) / values.length
    const ema = (values, period) => {
      if (values.length < period) return null
      const multiplier = 2 / (period + 1)
      let current = average(values.slice(0, period))
      values.slice(period).forEach(value => {
        current = (value - current) * multiplier + current
      })
      return current
    }
    const ema12 = ema(closes, 12)
    const ema26 = ema(closes, 26)
    const macd = ema12 !== null && ema26 !== null ? ema12 - ema26 : null
    const macdValues = closes.map((_, index) => {
      const values = closes.slice(0, index + 1)
      const short = ema(values, 12)
      const long = ema(values, 26)
      return short !== null && long !== null ? short - long : null
    }).filter(value => value !== null)
    const macdSignal = macdValues.length >= 9 ? ema(macdValues, 9) : null

    // Tendencia
    const trend = ma20 && latest > ma20 ? '↑ Alcista' : '↓ Bajista'
    const trendColor = ma20 && latest > ma20 ? 'text-green-400' : 'text-red-400'

    return {
      latest,
      change,
      ma20: ma20?.toFixed(2),
      ma50: ma50?.toFixed(2),
      high: high.toFixed(2),
      low: low.toFixed(2),
      support: support.toFixed(2),
      resistance: resistance.toFixed(2),
      volatility: volatility.toFixed(2),
      rsi: rsi.toFixed(1),
      macd: macd?.toFixed(2),
      macdSignal: macdSignal?.toFixed(2),
      macdHistogram: macd !== null && macdSignal !== null ? (macd - macdSignal).toFixed(2) : null,
      trend,
      trendColor
    }
  }

  useEffect(() => {
    fetchAnalysisData(symbol, timeframe)
  }, [symbol, timeframe])

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">📊 Análisis Técnico y Fundamental</h1>
          <p className="text-slate-400">Analiza empresas a corto y largo plazo</p>
        </div>

        {/* Controles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Símbolo</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="ej: AAPL, YPF, GGAL"
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white placeholder-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Período</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white focus:border-cyan-500 focus:outline-none"
            >
              {timeframes.map(tf => (
                <option key={tf.value} value={tf.value}>{tf.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Períodos disponibles</label>
            <div className="flex gap-2 flex-wrap">
              {timeframes.map(tf => (
                <button
                  key={tf.value}
                  onClick={() => setTimeframe(tf.value)}
                  className={`px-2 py-1 text-sm rounded transition-colors ${
                    timeframe === tf.value
                      ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-300'
                      : 'bg-slate-800 border border-slate-700 text-slate-400 hover:border-slate-600'
                  }`}
                >
                  {tf.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {loading ? (
          <div className="bg-slate-800/50 rounded-lg p-8 text-center text-slate-400">
            Cargando datos...
          </div>
        ) : chartData && technicalIndicators ? (
          <>
            {/* Indicadores Técnicos Principales */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Precio Actual</p>
                <p className="text-2xl font-bold text-white">
                  ${technicalIndicators.latest.toFixed(2)}
                </p>
                <p className={`text-sm ${technicalIndicators.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {technicalIndicators.change >= 0 ? '+' : ''}{technicalIndicators.change.toFixed(2)}%
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Tendencia</p>
                <p className={`text-2xl font-bold ${technicalIndicators.trendColor}`}>
                  {technicalIndicators.trend}
                </p>
                <p className="text-slate-400 text-xs mt-1">MA(20): ${technicalIndicators.ma20}</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">RSI (14)</p>
                <p className="text-2xl font-bold text-white">{technicalIndicators.rsi}</p>
                <p className="text-xs text-slate-400 mt-1">
                  {technicalIndicators.rsi > 70 ? '⚠️ Sobrecomprado' : technicalIndicators.rsi < 30 ? '⚠️ Sobrevendido' : '✓ Neutral'}
                </p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Volatilidad</p>
                <p className="text-2xl font-bold text-white">{technicalIndicators.volatility}</p>
                <p className="text-slate-400 text-xs mt-1">Desv. Estándar</p>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                <p className="text-slate-400 text-sm">MACD (12,26)</p>
                <p className="text-2xl font-bold text-white">{technicalIndicators.macd ?? 'N/D'}</p>
                <p className="text-slate-400 text-xs mt-1">Señal: {technicalIndicators.macdSignal ?? 'N/D'}</p>
              </div>
            </div>

            {/* Niveles Técnicos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Niveles Técnicos</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Resistencia</span>
                    <span className="text-yellow-400 font-semibold">${technicalIndicators.resistance}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Máximo (período)</span>
                    <span className="text-cyan-300">${technicalIndicators.high}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Precio Actual</span>
                    <span className="text-white font-bold">${technicalIndicators.latest.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Mínimo (período)</span>
                    <span className="text-orange-300">${technicalIndicators.low}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Soporte</span>
                    <span className="text-red-400 font-semibold">${technicalIndicators.support}</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-4">Medias Móviles</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">MA(20)</span>
                    <span className="text-blue-400">${technicalIndicators.ma20}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">MA(50)</span>
                    <span className="text-purple-400">${technicalIndicators.ma50}</span>
                  </div>
                  <div className="mt-4 p-3 bg-slate-700/50 rounded text-sm text-slate-300">
                    <p className="font-medium mb-1">💡 Estrategia:</p>
                    <p>Precio por encima de MA(20/50) = Tendencia alcista / Precio por debajo = Tendencia bajista</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Precios */}
            <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6 mb-6">
              <h3 className="text-white font-semibold mb-4">Gráfico de Precios</h3>
              <Line
                data={{
                  labels: chartData.labels,
                  datasets: [
                    {
                      label: 'Precio de Cierre',
                      data: chartData.closes,
                      borderColor: '#06b6d4',
                      backgroundColor: 'rgba(6, 182, 212, 0.1)',
                      tension: 0.4,
                      fill: true,
                      pointRadius: 1,
                      pointHoverRadius: 4
                    },
                    {
                      label: 'MA(20)',
                      data: chartData.movingAverage20,
                      borderColor: '#a78bfa',
                      borderWidth: 2,
                      pointRadius: 0,
                      spanGaps: true,
                      fill: false
                    },
                    {
                      label: 'Banda superior',
                      data: chartData.bollingerUpper,
                      borderColor: 'rgba(250, 204, 21, 0.65)',
                      borderDash: [5, 5],
                      pointRadius: 0,
                      spanGaps: true,
                      fill: false
                    },
                    {
                      label: 'Banda inferior',
                      data: chartData.bollingerLower,
                      borderColor: 'rgba(250, 204, 21, 0.65)',
                      borderDash: [5, 5],
                      pointRadius: 0,
                      spanGaps: true,
                      fill: false
                    }
                  ]
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                  plugins: {
                    legend: { display: true, labels: { color: '#cbd5e1' } }
                  },
                  scales: {
                    y: {
                      ticks: { color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    },
                    x: {
                      ticks: { color: '#94a3b8' },
                      grid: { color: 'rgba(148, 163, 184, 0.1)' }
                    }
                  }
                }}
              />
            </div>

            {/* Gráfico de Volumen */}
            {chartData.volumes && chartData.volumes.length > 0 && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6 mb-6">
                <h3 className="text-white font-semibold mb-4">Volumen de Negociación</h3>
                <Bar
                  data={{
                    labels: chartData.labels,
                    datasets: [
                      {
                        label: 'Volumen',
                        data: chartData.volumes,
                        backgroundColor: 'rgba(8, 145, 178, 0.5)',
                        borderColor: '#0891b2',
                        borderRadius: 2
                      }
                    ]
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                      legend: { display: true, labels: { color: '#cbd5e1' } }
                    },
                    scales: {
                      y: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                      },
                      x: {
                        ticks: { color: '#94a3b8' },
                        grid: { color: 'rgba(148, 163, 184, 0.1)' }
                      }
                    }
                  }}
                />
              </div>
            )}

            {/* Análisis Fundamental */}
            {fundamentalLoading && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6 text-slate-400">
                Cargando datos fundamentales...
              </div>
            )}
            {fundamentalError && !fundamentalLoading && (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4 mb-6 text-amber-300">
                {fundamentalError}
              </div>
            )}
            {fundamentals && (
              <div className="bg-slate-800/60 border border-slate-700 rounded-lg p-6">
                <h3 className="text-white font-semibold mb-4">📈 Análisis Fundamental (Largo Plazo)</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {fundamentals.sector && (
                    <div>
                      <p className="text-slate-400 text-sm">Sector</p>
                      <p className="text-white font-semibold">{fundamentals.sector}</p>
                    </div>
                  )}
                  {fundamentals.industry && (
                    <div>
                      <p className="text-slate-400 text-sm">Industria</p>
                      <p className="text-white font-semibold">{fundamentals.industry}</p>
                    </div>
                  )}
                  {fundamentals.marketCap && (
                    <div>
                      <p className="text-slate-400 text-sm">Capitalización de Mercado</p>
                      <p className="text-white font-semibold">${(fundamentals.marketCap / 1e9).toFixed(2)}B</p>
                    </div>
                  )}
                  {fundamentals.pe && (
                    <div>
                      <p className="text-slate-400 text-sm">P/E (Ratio Precio/Ganancia)</p>
                      <p className="text-white font-semibold">{fundamentals.pe.toFixed(2)}</p>
                    </div>
                  )}
                  {fundamentals.dividendYield && (
                    <div>
                      <p className="text-slate-400 text-sm">Dividend Yield</p>
                      <p className="text-white font-semibold">{(fundamentals.dividendYield * 100).toFixed(2)}%</p>
                    </div>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-4">
                  Los indicadores sirven como apoyo educativo y no constituyen una recomendación de compra o venta.
                </p>
              </div>
            )}
          </>
        ) : null}
      </div>
    </div>
  )
}
