import React, { useState } from 'react'
import { mockStocks } from '../services/stockService'

export default function SectorAnalysis() {
  const [selectedSector, setSelectedSector] = useState(null)

  // Agrupar acciones por sector
  const sectors = {}
  Object.values(mockStocks).forEach(stock => {
    if (!sectors[stock.sector]) {
      sectors[stock.sector] = []
    }
    sectors[stock.sector].push(stock)
  })

  const sectorDescriptions = {
    'Technology': 'Empresas de software, hardware y servicios tecnológicos. Alta volatilidad pero potencial de crecimiento significativo.',
    'Consumer Cyclical': 'Minoristas, fabricantes de bienes de consumo. Sensibles a ciclos económicos y confianza del consumidor.',
    'Automotive': 'Fabricantes de vehículos y componentes. Sector en transición hacia vehículos eléctricos.'
  }

  const sectorPerformance = {
    'Technology': { change: 15.2, momentum: 'strong' },
    'Consumer Cyclical': { change: -2.1, momentum: 'weak' },
    'Automotive': { change: 8.5, momentum: 'moderate' }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6">🏢 Análisis por Sectores</h2>

      {/* Selector de sectores */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {Object.entries(sectors).map(([sector, stocks]) => {
          const performance = sectorPerformance[sector]
          const isSelected = selectedSector === sector

          return (
            <button
              key={sector}
              onClick={() => setSelectedSector(isSelected ? null : sector)}
              className={`p-6 rounded-xl transition-all border-2 text-left ${
                isSelected
                  ? 'border-blue-500 bg-blue-600/20'
                  : 'border-slate-700 bg-slate-800/50 hover:border-slate-600'
              }`}
            >
              <h3 className="text-xl font-bold mb-2">{sector}</h3>
              <p className="text-slate-400 mb-3">{stocks.length} empresas</p>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-400">Rendimiento:</span>
                <span className={`font-bold ${performance.change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {performance.change > 0 ? '+' : ''}{performance.change}%
                </span>
              </div>
            </button>
          )
        })}
      </div>

      {/* Detalles del sector seleccionado */}
      {selectedSector && (
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8 mb-8">
          <div className="mb-8">
            <h3 className="text-2xl font-bold mb-2">{selectedSector}</h3>
            <p className="text-slate-400 mb-4">{sectorDescriptions[selectedSector]}</p>

            <div className="grid md:grid-cols-3 gap-4 mt-6">
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Rendimiento del Sector</p>
                <p className={`text-2xl font-bold ${sectorPerformance[selectedSector].change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sectorPerformance[selectedSector].change > 0 ? '+' : ''}{sectorPerformance[selectedSector].change}%
                </p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Momentum</p>
                <p className="text-2xl font-bold capitalize">
                  {sectorPerformance[selectedSector].momentum === 'strong' && '📈 Fuerte'}
                  {sectorPerformance[selectedSector].momentum === 'moderate' && '➡️ Moderado'}
                  {sectorPerformance[selectedSector].momentum === 'weak' && '📉 Débil'}
                </p>
              </div>
              <div className="bg-slate-900/50 p-4 rounded-lg">
                <p className="text-slate-400 text-sm">Volatilidad</p>
                <p className="text-2xl font-bold">
                  {selectedSector === 'Technology' && '🔴 Alta'}
                  {selectedSector === 'Consumer Cyclical' && '🟡 Media'}
                  {selectedSector === 'Automotive' && '🟡 Media'}
                </p>
              </div>
            </div>
          </div>

          {/* Empresas en el sector */}
          <div>
            <h4 className="text-xl font-bold mb-4">Empresas en este sector</h4>
            <div className="grid md:grid-cols-2 gap-4">
              {sectors[selectedSector].map(stock => (
                <div key={stock.symbol} className="bg-slate-900/50 p-4 rounded-lg hover:bg-slate-900/70 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-bold text-blue-400">{stock.symbol}</p>
                      <p className="text-sm text-slate-400">{stock.company}</p>
                    </div>
                    <span className="font-bold">${stock.price}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <p className="text-slate-400">Cambio</p>
                      <p className={stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}>
                        {stock.changePercent > 0 ? '+' : ''}{stock.changePercent}%
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400">P/E</p>
                      <p className="text-slate-300">{stock.pe}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Resumen de sectores */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-6">📊 Resumen de Sectores</h3>
        <div className="space-y-4">
          {Object.entries(sectors).map(([sector, stocks]) => (
            <div key={sector} className="flex items-center justify-between bg-slate-900/50 p-4 rounded-lg">
              <div>
                <p className="font-bold">{sector}</p>
                <p className="text-sm text-slate-400">{stocks.length} empresas</p>
              </div>
              <div className="text-right">
                <p className={`font-bold ${sectorPerformance[sector].change > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {sectorPerformance[sector].change > 0 ? '+' : ''}{sectorPerformance[sector].change}%
                </p>
                <p className="text-sm text-slate-400">últimas 12 meses</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
