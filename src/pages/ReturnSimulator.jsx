import React, { useState } from 'react'
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

export default function ReturnSimulator() {
  const [initialInvestment, setInitialInvestment] = useState(10000)
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [years, setYears] = useState(10)
  const [annualReturn, setAnnualReturn] = useState(8)
  const [compounding, setCompounding] = useState('annual')

  const calculateReturns = () => {
    const data = []
    const labels = []
    let balance = initialInvestment
    const monthlyRate = annualReturn / 100 / 12
    const months = years * 12

    for (let month = 0; month <= months; month++) {
      labels.push(`Mes ${month}`)
      data.push(parseFloat(balance.toFixed(2)))

      if (month < months) {
        balance += monthlyContribution
        balance = balance * (1 + monthlyRate)
      }
    }

    return { labels, data }
  }

  const { labels, data } = calculateReturns()
  const finalBalance = data[data.length - 1]
  const totalContributed = initialInvestment + (monthlyContribution * years * 12)
  const totalGain = finalBalance - totalContributed
  const gainPercent = ((totalGain / totalContributed) * 100).toFixed(2)

  const chartData = {
    labels,
    datasets: [
      {
        label: 'Valor del Portafolio',
        data,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 6
      }
    ]
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        display: true,
        labels: { color: '#e2e8f0', font: { size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#e2e8f0',
        borderColor: '#475569',
        borderWidth: 1,
        padding: 12
      }
    },
    scales: {
      y: {
        grid: { color: 'rgba(148, 163, 184, 0.1)' },
        ticks: { color: '#94a3b8', font: { size: 11 } }
      },
      x: {
        grid: { display: false },
        ticks: {
          color: '#94a3b8',
          font: { size: 10 },
          maxRotation: 45,
          minRotation: 0
        }
      }
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">📈 Simulador de Rentabilidad</h2>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Controles */}
        <div className="md:col-span-1">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 space-y-6">
            <div>
              <label className="block text-sm font-bold mb-2">Inversión Inicial</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">$</span>
                <input
                  type="number"
                  value={initialInvestment}
                  onChange={(e) => setInitialInvestment(parseFloat(e.target.value))}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <input
                type="range"
                min="1000"
                max="100000"
                step="1000"
                value={initialInvestment}
                onChange={(e) => setInitialInvestment(parseFloat(e.target.value))}
                className="w-full mt-2 accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Aporte Mensual</label>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">$</span>
                <input
                  type="number"
                  value={monthlyContribution}
                  onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <input
                type="range"
                min="0"
                max="5000"
                step="100"
                value={monthlyContribution}
                onChange={(e) => setMonthlyContribution(parseFloat(e.target.value))}
                className="w-full mt-2 accent-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Retorno Anual Esperado</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={annualReturn}
                  onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
                  step="0.5"
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400">%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(parseFloat(e.target.value))}
                className="w-full mt-2 accent-blue-500"
              />
              <div className="text-xs text-slate-400 mt-2">
                Histórico: Acciones 10%, Bonos 5%, Mixto 7%
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold mb-2">Horizonte Temporal</label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={years}
                  onChange={(e) => setYears(parseFloat(e.target.value))}
                  min="1"
                  max="50"
                  className="flex-1 px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                />
                <span className="text-slate-400">años</span>
              </div>
              <input
                type="range"
                min="1"
                max="50"
                value={years}
                onChange={(e) => setYears(parseFloat(e.target.value))}
                className="w-full mt-2 accent-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Gráfico y Resultados */}
        <div className="md:col-span-2">
          <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-6">
            <Line data={chartData} options={chartOptions} height={300} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm">Inversión Total</p>
              <p className="text-3xl font-bold text-blue-400">${totalContributed.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm">Valor Final</p>
              <p className="text-3xl font-bold text-green-400">${finalBalance.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm">Ganancia</p>
              <p className="text-3xl font-bold text-cyan-400">${totalGain.toFixed(2)}</p>
            </div>
            <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
              <p className="text-slate-400 text-sm">Retorno Total %</p>
              <p className="text-3xl font-bold text-emerald-400">{gainPercent}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Escenarios comparativos */}
      <div className="mt-8 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
        <h3 className="text-2xl font-bold mb-4">📊 Comparación de Escenarios</h3>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: 'Conservador (5%)', rate: 5 },
            { name: 'Balanceado (8%)', rate: 8 },
            { name: 'Agresivo (12%)', rate: 12 }
          ].map((scenario, idx) => {
            let balance = initialInvestment
            const monthlyRate = scenario.rate / 100 / 12
            const months = years * 12
            for (let i = 0; i < months; i++) {
              balance += monthlyContribution
              balance = balance * (1 + monthlyRate)
            }
            return (
              <div key={idx} className="bg-slate-900/50 p-4 rounded-lg">
                <p className="font-bold text-slate-300 mb-2">{scenario.name}</p>
                <p className="text-2xl font-bold text-blue-400 mb-1">${balance.toFixed(2)}</p>
                <p className="text-sm text-slate-400">
                  Ganancia: ${(balance - totalContributed).toFixed(2)}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
