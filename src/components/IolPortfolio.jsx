import React, { useState } from 'react'
import { iolService } from '../services/iolService'

export default function IolPortfolio() {
  const [portfolio, setPortfolio] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const loadPortfolio = async () => {
    setLoading(true)
    setError('')
    try {
      setPortfolio(await iolService.getPortfolio())
    } catch (requestError) {
      setError(requestError.response?.data?.error || 'No se pudo consultar la cartera de InvertirOnline.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
      <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white">Cartera de InvertirOnline</h3>
            <p className="text-sm text-slate-300 mt-1">Consulta de solo lectura. No se envían órdenes.</p>
          </div>
          <button type="button" onClick={loadPortfolio} disabled={loading} className="rounded-lg bg-cyan-500 px-4 py-2 font-semibold text-slate-950 disabled:opacity-50">
            {loading ? 'Consultando...' : 'Consultar cartera'}
          </button>
        </div>
        {error && <p role="alert" className="mt-4 text-sm text-amber-300">{error}</p>}
        {portfolio && (
          <pre className="mt-4 max-h-96 overflow-auto rounded-lg bg-slate-950/70 p-4 text-xs text-slate-200">
            {JSON.stringify(portfolio, null, 2)}
          </pre>
        )}
      </div>
    </section>
  )
}
