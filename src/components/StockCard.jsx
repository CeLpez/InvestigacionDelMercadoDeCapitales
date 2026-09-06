import React from 'react'

export default function StockCard({ stock, onClick }) {
  return (
    <div
      onClick={onClick}
      className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-lg p-4 hover:border-blue-500 hover:bg-slate-800/70 transition-all cursor-pointer"
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-blue-400">{stock.symbol}</h3>
          <p className="text-sm text-slate-400">{stock.company}</p>
        </div>
        <span className="text-2xl font-bold">${stock.price}</span>
      </div>

      <div className="flex justify-between items-center pt-2 border-t border-slate-700">
        <span className={`font-bold text-sm ${stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {stock.changePercent > 0 ? '📈 ' : '📉 '}{stock.changePercent}%
        </span>
        <span className="text-xs text-slate-400">{stock.sector}</span>
      </div>
    </div>
  )
}
