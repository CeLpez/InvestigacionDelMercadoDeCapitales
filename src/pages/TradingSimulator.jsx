import React, { useState } from 'react'
import { stockService } from '../services/stockService'

const INITIAL_BALANCE = 1000000
const ACCOUNT_KEY = 'capital-markets-trading-account'
const DEFAULT_COMMISSION_RATE = 0.5 // % por operación, editable por el usuario

function loadAccount() {
  try {
    const stored = localStorage.getItem(ACCOUNT_KEY)
    if (stored) {
      const account = JSON.parse(stored)
      const positions = Object.fromEntries(Object.entries(account.positions || {}).map(([key, position]) => [key, {
        ...position,
        stopLoss: position.stopLoss ?? null,
        takeProfit: position.takeProfit ?? null
      }]))
      return {
        balance: account.balance ?? INITIAL_BALANCE,
        orders: account.orders || [],
        positions,
        commissionRate: account.commissionRate ?? DEFAULT_COMMISSION_RATE
      }
    }
  } catch {
    // Start with a clean demo account when local storage is unavailable.
  }
  return { balance: INITIAL_BALANCE, orders: [], positions: {}, commissionRate: DEFAULT_COMMISSION_RATE }
}

export default function TradingSimulator() {
  const [account, setAccount] = useState(loadAccount)
  const [symbol, setSymbol] = useState('')
  const [asset, setAsset] = useState(null)
  const [side, setSide] = useState('BUY')
  const [orderType, setOrderType] = useState('MARKET')
  const [quantity, setQuantity] = useState('1')
  const [limitPrice, setLimitPrice] = useState('')
  const [stopLoss, setStopLoss] = useState('')
  const [takeProfit, setTakeProfit] = useState('')
  const [searching, setSearching] = useState(false)
  const [checkingStops, setCheckingStops] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const persist = nextAccount => {
    setAccount(nextAccount)
    localStorage.setItem(ACCOUNT_KEY, JSON.stringify(nextAccount))
  }

  const updateCommissionRate = value => {
    const parsed = Number(value)
    const safeRate = Number.isFinite(parsed) ? Math.min(Math.max(parsed, 0), 5) : DEFAULT_COMMISSION_RATE
    persist({ ...account, commissionRate: safeRate })
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
  const commissionRate = account.commissionRate ?? DEFAULT_COMMISSION_RATE
  const commissionAmount = Number.isFinite(total) ? Math.abs(total) * (commissionRate / 100) : 0
  const netTotal = side === 'BUY' ? total + commissionAmount : total - commissionAmount

  const submitOrder = event => {
    event.preventDefault()
    setError('')
    setMessage('')
    const shares = Number(quantity)
    if (!asset || !Number.isFinite(shares) || shares <= 0) {
      setError('Selecciona un activo e indica una cantidad válida.')
      return
    }
    if (orderType === 'LIMIT' && (!Number.isFinite(Number(limitPrice)) || Number(limitPrice) <= 0)) {
      setError('Indica un precio límite mayor a cero.')
      return
    }
    if (!Number.isFinite(executionPrice) || executionPrice <= 0) {
      setError('No hay un precio disponible para ejecutar la orden.')
      return
    }
    const stopLossValue = stopLoss === '' ? null : Number(stopLoss)
    const takeProfitValue = takeProfit === '' ? null : Number(takeProfit)
    if (side === 'BUY') {
      if (stopLossValue !== null && (!Number.isFinite(stopLossValue) || stopLossValue <= 0 || stopLossValue >= executionPrice)) {
        setError('El stop-loss debe ser un valor positivo menor al precio de ejecución.')
        return
      }
      if (takeProfitValue !== null && (!Number.isFinite(takeProfitValue) || takeProfitValue <= executionPrice)) {
        setError('El take-profit debe ser un valor mayor al precio de ejecución.')
        return
      }
    }
    if (side === 'BUY' && netTotal > account.balance) {
      setError('El saldo virtual no alcanza para completar esta orden, incluida la comisión.')
      return
    }
    const currentPosition = account.positions[asset.symbol]?.quantity || 0
    if (side === 'SELL' && orderType === 'MARKET' && shares > currentPosition) {
      setError(`No puedes vender ${shares} unidades: solo tienes ${currentPosition} de ${asset.symbol}.`)
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
      commission: commissionAmount,
      netTotal,
      status: orderType === 'MARKET' ? 'Ejecutada' : 'Pendiente',
      date: new Date().toLocaleString('es-AR')
    }
    const nextPositions = { ...account.positions }
    if (order.status === 'Ejecutada') {
      const nextQuantity = currentPosition + (side === 'BUY' ? shares : -shares)
      const previous = account.positions[asset.symbol]
      if (nextQuantity > 0) {
        nextPositions[asset.symbol] = {
          symbol: asset.symbol,
          company: asset.company,
          quantity: nextQuantity,
          averagePrice: side === 'BUY'
            ? ((currentPosition * (previous?.averagePrice || 0)) + total) / nextQuantity
            : previous?.averagePrice || executionPrice,
          price: asset.price,
          stopLoss: side === 'BUY' ? (stopLossValue ?? previous?.stopLoss ?? null) : previous?.stopLoss ?? null,
          takeProfit: side === 'BUY' ? (takeProfitValue ?? previous?.takeProfit ?? null) : previous?.takeProfit ?? null
        }
      } else {
        delete nextPositions[asset.symbol]
      }
    }
    const nextBalance = order.status === 'Ejecutada' && side === 'BUY' ? account.balance - netTotal
      : order.status === 'Ejecutada' && side === 'SELL' ? account.balance + netTotal
      : account.balance
    persist({ ...account, balance: nextBalance, orders: [order, ...account.orders], positions: nextPositions })
    setMessage(orderType === 'MARKET'
      ? `Orden ejecutada en la cuenta virtual. Comisión aplicada: $${commissionAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}.`
      : 'Orden límite registrada como pendiente.')
  }

  const resetAccount = () => {
    const confirmed = window.confirm('¿Restablecer el saldo y borrar las órdenes virtuales?')
    if (confirmed) persist({ balance: INITIAL_BALANCE, orders: [], positions: {}, commissionRate: DEFAULT_COMMISSION_RATE })
  }

  const updatePositionStops = (targetSymbol, field, value) => {
    const numericValue = value === '' ? null : Number(value)
    if (numericValue !== null && !Number.isFinite(numericValue)) return
    const current = account.positions[targetSymbol]
    if (!current) return
    persist({
      ...account,
      positions: {
        ...account.positions,
        [targetSymbol]: { ...current, [field]: numericValue }
      }
    })
  }

  const checkStopsAndTakeProfits = async () => {
    const watched = Object.values(account.positions).filter(position => position.stopLoss || position.takeProfit)
    if (watched.length === 0) {
      setMessage('No hay posiciones con stop-loss o take-profit configurados.')
      return
    }
    setCheckingStops(true)
    setError('')
    setMessage('')
    try {
      const triggeredOrders = []
      let nextPositions = { ...account.positions }
      let nextBalance = account.balance
      const rate = account.commissionRate ?? DEFAULT_COMMISSION_RATE
      for (const position of watched) {
        let latestPrice = position.price
        try {
          const quote = await stockService.getStockData(position.symbol)
          latestPrice = Number(quote?.price) || latestPrice
        } catch {
          continue
        }
        const hitStopLoss = position.stopLoss && latestPrice <= position.stopLoss
        const hitTakeProfit = position.takeProfit && latestPrice >= position.takeProfit
        if (!hitStopLoss && !hitTakeProfit) continue
        const saleTotal = latestPrice * position.quantity
        const commission = Math.abs(saleTotal) * (rate / 100)
        const netSale = saleTotal - commission
        const order = {
          id: `${position.symbol}-${Date.now()}-auto`,
          symbol: position.symbol,
          company: position.company,
          side: 'SELL',
          orderType: 'MARKET',
          quantity: position.quantity,
          price: latestPrice,
          total: saleTotal,
          commission,
          netTotal: netSale,
          status: hitStopLoss ? 'Ejecutada (stop-loss)' : 'Ejecutada (take-profit)',
          date: new Date().toLocaleString('es-AR')
        }
        triggeredOrders.push(order)
        nextBalance += netSale
        delete nextPositions[position.symbol]
      }
      if (triggeredOrders.length === 0) {
        setMessage('Ninguna posición alcanzó su nivel de stop-loss o take-profit todavía.')
      } else {
        persist({ ...account, balance: nextBalance, orders: [...triggeredOrders, ...account.orders], positions: nextPositions })
        setMessage(`Se ejecutaron ${triggeredOrders.length} orden(es) automática(s) por stop-loss/take-profit.`)
      }
    } finally {
      setCheckingStops(false)
    }
  }

  const positions = Object.values(account.positions)
  const investedValue = positions.reduce((sum, position) => sum + position.quantity * (position.price || position.averagePrice), 0)
  const accountValue = account.balance + investedValue
  const pendingOrders = account.orders.filter(order => order.status === 'Pendiente').length

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
      <header className="mb-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-3">Práctica sin riesgo</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h2 className="text-4xl font-semibold tracking-tight text-white">Mesa de operaciones</h2>
            <p className="text-slate-400 mt-3 max-w-2xl">Simula compras y ventas con dinero ficticio. No conecta con un broker ni envía órdenes reales.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 text-right">
            <div className="border border-emerald-500/30 bg-emerald-500/10 rounded-xl px-4 py-3"><p className="text-xs uppercase tracking-wider text-emerald-300">Disponible</p><p className="text-xl font-semibold text-white">${account.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p></div>
            <div className="border border-slate-700 bg-slate-900/60 rounded-xl px-4 py-3"><p className="text-xs uppercase tracking-wider text-slate-400">Patrimonio</p><p className="text-xl font-semibold text-white">${accountValue.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</p></div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-4"><p className="text-xs text-slate-500 uppercase tracking-wider">Activos en cartera</p><p className="text-2xl font-semibold text-white mt-2">{positions.length}</p></div>
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-4"><p className="text-xs text-slate-500 uppercase tracking-wider">Valor invertido</p><p className="text-2xl font-semibold text-white mt-2">${investedValue.toLocaleString('es-AR', { maximumFractionDigits: 2 })}</p></div>
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-4"><p className="text-xs text-slate-500 uppercase tracking-wider">Órdenes pendientes</p><p className="text-2xl font-semibold text-amber-300 mt-2">{pendingOrders}</p></div>
        <div className="border border-slate-800 rounded-xl bg-[#0c1422] p-4">
          <label htmlFor="commission-rate" className="text-xs text-slate-500 uppercase tracking-wider block">Comisión por operación (%)</label>
          <input
            id="commission-rate"
            type="number"
            min="0"
            max="5"
            step="0.05"
            value={commissionRate}
            onChange={event => updateCommissionRate(event.target.value)}
            className="w-full mt-2 px-2 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white text-lg font-semibold"
            aria-describedby="commission-rate-help"
          />
          <p id="commission-rate-help" className="text-[11px] text-slate-600 mt-1">Configurable entre 0% y 5%, se aplica sobre cada compra y venta.</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_360px] gap-8">
        <form onSubmit={submitOrder} className="border border-slate-800 rounded-2xl bg-[#0c1422] p-6">
          <div className="flex gap-2 mb-6">
            {['BUY', 'SELL'].map(option => (
              <button type="button" key={option} aria-pressed={side === option} onClick={() => setSide(option)} className={`flex-1 py-3 rounded-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${side === option ? (option === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white') : 'bg-slate-900 text-slate-400'}`}>
                {option === 'BUY' ? 'Comprar' : 'Vender'}
              </button>
            ))}
          </div>
          <label htmlFor="order-symbol" className="block text-sm text-slate-300 mb-2">Activo</label>
          <div className="flex gap-2">
            <input id="order-symbol" value={symbol} onChange={event => setSymbol(event.target.value)} onKeyDown={event => event.key === 'Enter' && (event.preventDefault(), searchAsset())} placeholder="Ticker: YPF, GGAL, AAPL..." className="flex-1 px-4 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white" />
            <button type="button" onClick={searchAsset} disabled={searching} className="px-5 rounded-lg bg-cyan-600 text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400">{searching ? '...' : 'Buscar'}</button>
          </div>
          {asset && <div className="mt-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 p-4"><strong className="text-cyan-300">{asset.symbol}</strong><span className="text-slate-300 ml-2">{asset.company}</span><p className="text-sm text-slate-400 mt-1">Último precio: ${asset.price?.toFixed(2) || 'N/D'}</p></div>}

          <div className="grid md:grid-cols-3 gap-4 mt-6">
            <div><label htmlFor="order-type" className="block text-sm text-slate-300 mb-2">Tipo de orden</label><select id="order-type" value={orderType} onChange={event => setOrderType(event.target.value)} className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white"><option value="MARKET">A mercado</option><option value="LIMIT">Límite</option></select></div>
            <div><label htmlFor="order-quantity" className="block text-sm text-slate-300 mb-2">Cantidad</label><input id="order-quantity" type="number" min="0.0001" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white" /></div>
            <div><label htmlFor="order-limit-price" className="block text-sm text-slate-300 mb-2">Precio límite</label><input id="order-limit-price" type="number" min="0.0001" step="any" disabled={orderType !== 'LIMIT'} value={limitPrice} onChange={event => setLimitPrice(event.target.value)} placeholder={asset?.price?.toFixed(2) || 'Solo límite'} className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-40" /></div>
          </div>
          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="order-stop-loss" className="block text-sm text-slate-300 mb-2">Stop-loss (opcional)</label>
              <input id="order-stop-loss" type="number" min="0.0001" step="any" disabled={side !== 'BUY'} value={stopLoss} onChange={event => setStopLoss(event.target.value)} placeholder="Precio de salida por pérdida" className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-40" />
            </div>
            <div>
              <label htmlFor="order-take-profit" className="block text-sm text-slate-300 mb-2">Take-profit (opcional)</label>
              <input id="order-take-profit" type="number" min="0.0001" step="any" disabled={side !== 'BUY'} value={takeProfit} onChange={event => setTakeProfit(event.target.value)} placeholder="Precio de salida por ganancia" className="w-full px-3 py-3 bg-slate-900 border border-slate-700 rounded-lg text-white disabled:opacity-40" />
            </div>
          </div>
          <p className="text-[11px] text-slate-600 mt-2">El stop-loss y el take-profit se guardan junto a la posición y se ejecutan al presionar "Verificar niveles" en la sección de posiciones; no hay monitoreo en tiempo real.</p>
          <div className="border-t border-slate-800 mt-6 pt-5 space-y-1">
            <div className="flex items-center justify-between text-sm text-slate-500"><span>Subtotal</span><span>${Number.isFinite(total) ? total.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0,00'}</span></div>
            <div className="flex items-center justify-between text-sm text-slate-500"><span>Comisión ({commissionRate}%)</span><span>${commissionAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span></div>
            <div className="flex items-center justify-between"><span className="text-slate-400">Total {side === 'BUY' ? 'a pagar' : 'a recibir'}</span><strong className="text-2xl text-white">${Number.isFinite(netTotal) ? netTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 }) : '0,00'}</strong></div>
          </div>
          <div role="alert" aria-live="assertive">{error && <p className="text-rose-400 text-sm mt-4">{error}</p>}</div>
          <div role="status" aria-live="polite">{message && <p className="text-emerald-400 text-sm mt-4">{message}</p>}</div>
          <button type="submit" className={`w-full mt-5 py-3 rounded-lg font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${side === 'BUY' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>Confirmar orden virtual</button>
        </form>

        <aside className="border border-slate-800 rounded-2xl bg-[#0c1422] p-6 h-fit">
          <div className="flex items-center justify-between mb-4"><h3 className="font-semibold text-white">Últimas órdenes</h3><button type="button" onClick={resetAccount} className="text-xs text-slate-500 hover:text-rose-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 rounded">Restablecer</button></div>
          {account.orders.length === 0 ? <p className="text-sm text-slate-500">Todavía no registraste operaciones.</p> : <div className="space-y-3 max-h-[420px] overflow-y-auto">{account.orders.slice(0, 8).map(order => <div key={order.id} className="border-b border-slate-800 pb-3"><div className="flex justify-between"><span className={order.side === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}>{order.side === 'BUY' ? 'Compra' : 'Venta'} {order.symbol}</span><span className="text-xs text-slate-500">{order.status}</span></div><p className="text-xs text-slate-500 mt-1">{order.quantity} × ${order.price.toFixed(2)} · ${order.total.toFixed(2)}{order.commission ? ` · comisión $${order.commission.toFixed(2)}` : ''}</p></div>)}</div>}
        </aside>
      </div>
      <section className="border border-slate-800 rounded-2xl bg-[#0c1422] p-6 mt-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div><h3 className="text-xl font-semibold text-white">Mis posiciones virtuales</h3><p className="text-sm text-slate-500 mt-1">Las ventas a mercado solo se permiten sobre activos que ya compraste. Configura stop-loss / take-profit por posición y presioná "Verificar niveles" para simular su ejecución.</p></div>
          <button
            type="button"
            onClick={checkStopsAndTakeProfits}
            disabled={checkingStops}
            className="px-4 py-2 rounded-lg border border-amber-500/40 text-amber-300 text-sm hover:bg-amber-500/10 disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400"
          >
            {checkingStops ? 'Verificando…' : 'Verificar niveles'}
          </button>
        </div>
        {positions.length === 0 ? <p className="text-sm text-slate-500">Todavía no tienes posiciones. Ejecutá una compra para comenzar.</p> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">{positions.map(position => (
          <div key={position.symbol} className="border border-slate-800 rounded-xl p-4">
            <div className="flex justify-between"><span className="font-semibold text-cyan-300">{position.symbol}</span><span className="text-white">{position.quantity}</span></div>
            <p className="text-xs text-slate-500 mt-2">Precio promedio ${position.averagePrice.toFixed(2)}</p>
            <p className="text-xs text-slate-500">Valor actual ${((position.price || position.averagePrice) * position.quantity).toFixed(2)}</p>
            <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800">
              <div>
                <label htmlFor={`sl-${position.symbol}`} className="text-[11px] text-slate-500 block mb-1">Stop-loss</label>
                <input
                  id={`sl-${position.symbol}`}
                  type="number"
                  min="0"
                  step="any"
                  defaultValue={position.stopLoss ?? ''}
                  onBlur={event => updatePositionStops(position.symbol, 'stopLoss', event.target.value)}
                  placeholder="N/D"
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                />
              </div>
              <div>
                <label htmlFor={`tp-${position.symbol}`} className="text-[11px] text-slate-500 block mb-1">Take-profit</label>
                <input
                  id={`tp-${position.symbol}`}
                  type="number"
                  min="0"
                  step="any"
                  defaultValue={position.takeProfit ?? ''}
                  onBlur={event => updatePositionStops(position.symbol, 'takeProfit', event.target.value)}
                  placeholder="N/D"
                  className="w-full px-2 py-1.5 bg-slate-900 border border-slate-700 rounded text-white text-xs"
                />
              </div>
            </div>
          </div>
        ))}</div>}
      </section>
    </div>
  )
}
