import React, { useEffect, useState } from 'react'

export default function TransactionHistory() {
  // Mock transaction history
  const [transactions] = useState(() => {
    try {
      const stored = localStorage.getItem('capital-markets-transactions')
      if (stored) return JSON.parse(stored)
    } catch {
      // Use the demo history when stored data is unavailable or invalid.
    }

    return [
    {
      id: 1,
      symbol: 'AAPL',
      type: 'BUY',
      shares: 10,
      price: 150.25,
      total: 1502.50,
      date: '2026-09-01 10:30',
      status: 'Completada'
    },
    {
      id: 2,
      symbol: 'MSFT',
      type: 'BUY',
      shares: 5,
      price: 380.00,
      total: 1900.00,
      date: '2026-09-01 14:15',
      status: 'Completada'
    },
    {
      id: 3,
      symbol: 'GOOGL',
      type: 'SELL',
      shares: 3,
      price: 140.50,
      total: 421.50,
      date: '2026-09-02 09:45',
      status: 'Completada'
    },
    {
      id: 4,
      symbol: 'AAPL',
      type: 'BUY',
      shares: 5,
      price: 189.95,
      total: 949.75,
      date: '2026-09-03 11:20',
      status: 'Completada'
    },
    {
      id: 5,
      symbol: 'TSLA',
      type: 'BUY',
      shares: 2,
      price: 242.84,
      total: 485.68,
      date: '2026-09-04 16:00',
      status: 'Completada'
    },
    {
      id: 6,
      symbol: 'AMZN',
      type: 'BUY',
      shares: 8,
      price: 171.41,
      total: 1371.28,
      date: '2026-09-05 13:30',
      status: 'Completada'
    }
    ]
  })

  const [filterType, setFilterType] = useState('ALL')
  const [filterSymbol, setFilterSymbol] = useState('ALL')

  useEffect(() => {
    localStorage.setItem('capital-markets-transactions', JSON.stringify(transactions))
  }, [transactions])

  const filteredTransactions = transactions.filter(t => {
    const typeMatch = filterType === 'ALL' || t.type === filterType
    const symbolMatch = filterSymbol === 'ALL' || t.symbol === filterSymbol
    return typeMatch && symbolMatch
  })

  const buyTotal = transactions
    .filter(t => t.type === 'BUY')
    .reduce((sum, t) => sum + t.total, 0)

  const sellTotal = transactions
    .filter(t => t.type === 'SELL')
    .reduce((sum, t) => sum + t.total, 0)

  const symbols = [...new Set(transactions.map(t => t.symbol))]

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-8">📜 Historial de Transacciones</h2>

      {/* Resumen */}
      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Total Compras</p>
          <p className="text-3xl font-bold text-green-400">${buyTotal.toFixed(2)}</p>
          <p className="text-sm text-slate-400 mt-2">{transactions.filter(t => t.type === 'BUY').length} operaciones</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Total Ventas</p>
          <p className="text-3xl font-bold text-blue-400">${sellTotal.toFixed(2)}</p>
          <p className="text-sm text-slate-400 mt-2">{transactions.filter(t => t.type === 'SELL').length} operaciones</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6">
          <p className="text-slate-400 text-sm">Neto Invertido</p>
          <p className="text-3xl font-bold text-cyan-400">${(buyTotal - sellTotal).toFixed(2)}</p>
          <p className="text-sm text-slate-400 mt-2">{transactions.length} transacciones totales</p>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 mb-8">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold mb-2">Filtrar por Tipo</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Todas las transacciones</option>
              <option value="BUY">Solo Compras</option>
              <option value="SELL">Solo Ventas</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Filtrar por Acción</label>
            <select
              value={filterSymbol}
              onChange={(e) => setFilterSymbol(e.target.value)}
              className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
            >
              <option value="ALL">Todas las acciones</option>
              {symbols.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Tabla de transacciones */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700">
              <th className="px-6 py-3 text-left font-bold">Fecha</th>
              <th className="px-6 py-3 text-left font-bold">Acción</th>
              <th className="px-6 py-3 text-left font-bold">Tipo</th>
              <th className="px-6 py-3 text-left font-bold">Acciones</th>
              <th className="px-6 py-3 text-left font-bold">Precio</th>
              <th className="px-6 py-3 text-left font-bold">Total</th>
              <th className="px-6 py-3 text-left font-bold">Estado</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((transaction, idx) => (
              <tr key={transaction.id} className="border-b border-slate-700 hover:bg-slate-700/20 transition-all">
                <td className="px-6 py-4 text-sm">{transaction.date}</td>
                <td className="px-6 py-4 font-bold text-blue-400">{transaction.symbol}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                    transaction.type === 'BUY'
                      ? 'bg-green-600/30 text-green-400'
                      : 'bg-blue-600/30 text-blue-400'
                  }`}>
                    {transaction.type === 'BUY' ? '📈 Compra' : '📉 Venta'}
                  </span>
                </td>
                <td className="px-6 py-4">{transaction.shares}</td>
                <td className="px-6 py-4">${transaction.price.toFixed(2)}</td>
                <td className="px-6 py-4 font-bold">${transaction.total.toFixed(2)}</td>
                <td className="px-6 py-4">
                  <span className="px-3 py-1 bg-green-600/30 text-green-400 rounded-full text-sm font-bold">
                    ✓ {transaction.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredTransactions.length === 0 && (
        <div className="text-center py-12 bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl">
          <p className="text-slate-400">No hay transacciones que coincidan con los filtros</p>
        </div>
      )}
    </div>
  )
}
