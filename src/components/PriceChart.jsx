import React, { useEffect, useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { stockService } from '../services/stockService'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function PriceChart({ symbol }) {
  const [chart, setChart] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setChart(null)
    setError('')

    stockService.getHistoricalData(symbol, '1d', '1mo')
      .then(result => {
        if (cancelled) return
        const timestamps = result.timestamp || []
        const closes = result.indicators?.quote?.[0]?.close || []
        const points = timestamps
          .map((timestamp, index) => ({
            date: new Date(timestamp * 1000).toLocaleDateString('es-ES'),
            price: closes[index]
          }))
          .filter(point => Number.isFinite(point.price))
        if (points.length === 0) throw new Error('No hay precios históricos')
        setChart({
          labels: points.map(point => point.date),
          prices: points.map(point => point.price)
        })
      })
      .catch(fetchError => {
        if (!cancelled) setError(fetchError.message || 'No se pudo cargar el gráfico')
      })

    return () => {
      cancelled = true
    }
  }, [symbol])

  if (error) {
    return <p className="py-12 text-center text-amber-400">{error}</p>
  }

  if (!chart) {
    return <p className="py-12 text-center text-slate-400">Cargando datos históricos...</p>
  }

  const { labels, prices } = chart

  const data = {
    labels,
    datasets: [
      {
        label: `${symbol} Precio (USD)`,
        data: prices,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#3b82f6',
        pointBorderColor: '#fff',
        pointHoverRadius: 6,
        pointRadius: 3
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#e2e8f0',
          font: { size: 12 }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 12,
        displayColors: false
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(148, 163, 184, 0.1)'
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 11 }
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0
        }
      }
    }
  }

  return <Line data={data} options={options} height={300} />
}
