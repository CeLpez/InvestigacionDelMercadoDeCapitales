import React, { useState } from 'react'
import { stockService } from '../services/stockService'

const INITIAL_BALANCE = 1000000
const ACCOUNT_KEY = 'capital-markets-trading-account'

function loadAccount() {
  try {
    const stored = localStorage.getItem(ACCOUNT_KEY)
    if (stored) return JSON.parse(stored)
  } catch {
    // Start with a clean demo account when local storage is unavailable.
  }
  return { balance: INITIAL_BALANCE, orders: [] }
}

export default function TradingSimulator() {
  const [account, setAccount] = useState(loadAccount)
  const [symbol, setSymbol] = useState('')
  const [asset, setAsset] = useState(null)
  const [side, setSide] = useState('BUY')
  const [orderType, setOrderType] = useState('MARKET')
  const [quantity, setQuantity] = useState('1')
  const [limitPrice, setLimitPrice] = useState('')
  const [searching, setSearching] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const persist = nextAccount => {
    setAccount(nextAccount)
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextAccount))
  }

  const searchAsset = async () => {
    const query = symbol.trim()
    if (!query) return
    setSearching(true)
    setError('')
    setMessage('')
    try {
      const results = await stockService.searchSymbol(query)
      const candidate = results[0]?.symbol || query.toUpperCase()
      setAsset(await stockService.getStockData(candidate))
    } catch {
      setError('No se encontró el activo. Prueba con un ticker exacto como YPF, GGAL, AAPL o NVDA.')
      setAsset(null)
    } finally {
      setSearching(false)
    }
  }

  const executionPrice = orderType === 'LIMIT' ? Number(limitPrice) : Number(asset?.price)
  const total = executionPrice * Number(quantity)

  const submitOrder = event => {
    event.preventDefault()
    setError('')
    setMessage('')
    const shares = Number(quantity)
    if (!asset || !Number.isFinite(shares) || shares <= 0 || !Number.isFinite(executionPrice) || executionPrice <= 0) {
      setError('Selecciona un activo e indica una cantidad y precio válidos.')
      return
    }
    if (side === 'BUY' && total > account.balance) {
      setError('El saldo virtual no alcanza para completar esta orden.')
      return
    }

    const order = {
      id: `${asset.symbol}-${Date.now()}`,
      symbol: asset.symbol,
      company: asset.company,
      side,
      orderType,
      quantity: shares,
      price: executionPrice,
      total,
      status: orderType === 'MARKET' ? 'Ejecutada' : 'Pendiente',
      date: new Date().toLocaleString('es-AR')
    }
    const nextBalance = side === 'BUY' ? account.balance - total : account.balance + total
    persist({ balance: nextBalance, orders: [order, ...account.orders] })
    setMessage(orderType === 'MARKET' ? 'Orden ejecutada en la cuenta virtual.' : 'Orden límite registrada como pendiente.')
  }

  const resetAccount = () => {
    const confirmed = window.confirm('¿Restablecer el saldo y borrar las órdenes virtuales?')
    if (confirmed) persist({ balance: INITIAL_BALANCE, orders: [] })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-3">Práctica sin riesgo</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-white">Mesa de operaciones</h2>
            <p className="text-slate-400 mt-3 max-w-2xl">Simula compras y ventas con dinero ficticio. No conecta con un broker ni envía órdenes reales.</p>
          </div>
          <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-xl px-5 py-3">
            <p className="text-xs uppercase tracking-wider text-emerald-300">Saldo virtual</p>
            <p className="text-2xl font-semibold text-white">${account.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </header>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <form onSubmit={submitOrder} className="border border-slate-800 rounded-2xl bg-[#0c1422] p-6">
          <div className="flex gap-2 mb-6">
            {['BUY', 'SELL'].map(option => (
              <button type="button" key={option} onClick={() => setSide(option)} className={`flex-1 py-3 rounded-lg font-semibold ${side === option ? (option === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white') : 'bg-slate-900 text-slate-400'}`}>
                {option === 'BUY' ? 'Comprar' : 'Vender'}
              </button>
            ))}
          </div>
          <label className="block text-sm text-slate-300 mb-2">Activo</label>
          <div className="flex gap-2">
            <input value={symbol} onChange={event => setSymbol(event.target.value)} onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), searchAsset())} placeholder="Ticker: YPF, GGAL, AAPL..." className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <button type="button" onClick={searchAsset} disabled={searching} className="px-5 rounded-lg bg-cyan-600 text-white disabled:opacity-50">{searching ? '...' : 'Buscar'}</button>
          </div>
          {asset && <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4"><strong className="text-cyan-300">{asset.symbol}</strong><span className="text-slate-300 ml-2">{asset.company}</span><p className="text-sm text-slate-400 mt-1">Último precio: ${asset.price?.toFixed(2) || 'N/D'}</p></div>}

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div><label className="block text-sm text-slate-300 mb-2">Tipo de orden</label><select value={orderType} onChange={event => setOrderType(event.target.value)} className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="MARKET">A mercado</option><option value="LIMIT">Límite</option></select></div>
            <div><label className="block text-sm text-slate-300 mb-2">Cantidad</label><input type="number" min="0.0001" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label className="block text-sm text-slate-300 mb-2">Precio límite</label><input type="number" min="0.0001" step="any" disabled={orderType !== 'LIMIT'} value={limitPrice} onChange={event => setLimitPrice(event.target.value)} placeholder={asset?.price?.toFixed(2) || 'Solo límite'} className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-40" /></div>
          </div>
          <div className="flex items-center justify-between border-t border-slate-800 mt-6 pt-5"><span className="text-slate-400">Total estimado</span><strong className="text-2xl text-white">${Number.isFinite(total) ? total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0,00'}</strong></div>
          {error && <p className="text-rose-400 text-sm mt-4">{error}</p>}
          {message && <p className="text-emerald-400 text-sm mt-4">{message}</p>}
          <button type="submit" className={`w-full mt-5 py-3 rounded-lg font-semibold ${side === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>Confirmar orden virtual</button>
        </form>

        <aside className="border border-slate-800 rounded-2xl bg-[#0c1422] p-6 h-fit">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-white">Últimas órdenes</h3><button onClick={resetAccount} className="text-xs text-slate-500 hover:text-rose-300">Restablecer</button></div>
          {account.orders.length === 0 ? <p className="text-sm text-slate-500">Todavía no registraste operaciones.</p> : <div className="space-y-3 max-h-[420px] overflow-y-auto">{account.orders.slice(0, 8).map(order => <div key={order.id} className="border-b border-slate-800 pb-3"><div className="flex justify-between"><span className={order.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{order.side === 'BUY' ? 'Compra' : 'Venta'} {order.symbol}</span><span className="text-xs text-slate-500">{order.status}</span></div><p className="text-xs text-slate-500 mt-1">{order.quantity} × ${order.price.toFixed(2)} · ${order.total.toFixed(2)}</p></div>)}</div>}
        </aside>
      </div>
    </div>
  )
}
