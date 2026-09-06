import React, { useState } from 'react'
import { mockStocks } from '../services/stockService'

export default function PriceAlerts() {
  const [alerts, setAlerts] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [targetPrice, setTargetPrice] = useState('')
  const [alertType, setAlertType] = useState('above')

  const addAlert = () => {
    if (targetPrice) {
      setAlerts([
        ...alerts,
        {
          id: Date.now(),
          symbol: selectedSymbol,
          targetPrice: parseFloat(targetPrice),
          type: alertType,
          createdAt: new Date().toLocaleString(),
          triggered: false
        }
      ])
      setTargetPrice('')
      setShowForm(false)
    }
  }

  const removeAlert = (id) => {
    setAlerts(alerts.filter(a => a.id !== id))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold">🔔 Alertas de Precio</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 hover:bg-blue-700 px-6 py-2 rounded-lg font-medium transition-all"
        >
          ➕ Nueva Alerta
        </button>
      </div>

      {showForm && (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-xl font-bold mb-4">Crear Nueva Alerta</h3>
          <div className="grid md:grid-cols-4 gap-4">
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              {Object.keys(mockStocks).map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <select
              value={alertType}
              onChange={(e) => setAlertType(e.target.value)}
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="above">Por encima de</option>
              <option value="below">Por debajo de</option>
            </select>

            <input
              type="number"
              value={targetPrice}
              onChange={(e) => setTargetPrice(e.target.value)}
              placeholder="Precio objetivo"
              step="0.01"
              className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />

            <div className="flex gap-2">
              <button
                onClick={addAlert}
                className="flex-1 bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg font-medium transition-all"
              >
                Crear
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-all"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {alerts.length > 0 ? (
        <div className="space-y-4">
          {alerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-slate-800/50 backdrop-blur border rounded-xl p-6 flex justify-between items-center ${
                alert.triggered
                  ? 'border-green-700 bg-green-900/20'
                  : 'border-slate-700'
              }`}
            >
              <div>
                <h3 className="text-2xl font-bold text-blue-400">{alert.symbol}</h3>
                <p className="text-slate-400 text-sm">
                  Alertar cuando el precio sea {alert.type === 'above' ? '🔺' : '🔻'} ${alert.targetPrice}
                </p>
                <p className="text-slate-500 text-xs mt-1">Creada: {alert.createdAt}</p>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-slate-400 text-sm">Precio actual</p>
                  <p className="text-2xl font-bold">${mockStocks[alert.symbol].price}</p>
                </div>
                <button
                  onClick={() => removeAlert(alert.id)}
                  className="text-red-400 hover:text-red-300 font-bold text-2xl"
                >
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
          <p className="text-slate-400">No hay alertas activas. Crea una para monitorear precios.</p>
        </div>
      )}
    </div>
  )
}
