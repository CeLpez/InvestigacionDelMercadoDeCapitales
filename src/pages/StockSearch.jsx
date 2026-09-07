import React, { useState } from 'react'
import { mockStocks, stockService } from '../services/stockService'

export default function StockSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [profile, setProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)

  const handleSearch = async (e) => {
    const value = e.target.value
    setQuery(value)
    setError('')

    if (value.trim().length < 2) {
      setResults([])
      return
    }

    const showProfile = async (symbol) => {
      setProfileLoading(true)
      setProfile(null)
      try {
        const result = await stockService.getCompanyProfile(symbol)
        if (!result) throw new Error('Perfil no disponible')
        setProfile(result)
      } catch (profileError) {
        setError(profileError.message || 'No se pudo cargar el perfil')
      } finally {
        setProfileLoading(false)
      }
    }

    setLoading(true)
    try {
      const remoteResults = await stockService.searchSymbol(value.trim())
      const enrichedResults = await Promise.all(remoteResults.slice(0, 10).map(async result => {
        try {
          return await stockService.getStockData(result.symbol)
        } catch {
          return { ...result, ...(mockStocks[result.symbol] || {}) }
        }
      }))
      setResults(enrichedResults)
    } catch (searchError) {
      const fallback = Object.values(mockStocks).filter(stock =>
        stock.symbol.includes(value.toUpperCase()) ||
        stock.company.toLowerCase().includes(value.toLowerCase())
      )
      setResults(fallback)
      setError('No se pudo consultar el proveedor; mostrando coincidencias locales.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
        <h2 className="text-3xl font-bold mb-6">🔍 Buscar Acciones</h2>

        <div className="mb-8">
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Buscar por símbolo o empresa..."
            className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        {loading && <p className="text-slate-400 text-center pb-4">Buscando en el mercado...</p>}
        {error && <p className="text-amber-400 text-center pb-4">{error}</p>}
        {query && results.length === 0 && (
          <p className="text-slate-400 text-center py-8">No se encontraron resultados</p>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          {results.length > 0 ? (
            results.map(stock => (
              <div key={stock.symbol} className="bg-slate-900/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500 transition-all">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-blue-400">{stock.symbol}</h3>
                    <p className="text-slate-400">{stock.company}</p>
                  </div>
                  <span className="text-3xl font-bold">{stock.price ? `$${stock.price.toFixed(2)}` : 'N/D'}</span>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <p className="text-slate-400 text-sm">Cambio</p>
                    <p className={`text-lg font-bold ${stock.changePercent > 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stock.changePercent > 0 ? '+' : ''}{Number(stock.changePercent || 0).toFixed(2)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Market Cap</p>
                    <p className="text-lg font-bold">{stock.marketCap || 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">P/E Ratio</p>
                    <p className="text-lg font-bold">{stock.pe ?? 'N/D'}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 text-sm">Sector</p>
                    <p className="text-lg font-bold text-cyan-400">{stock.sector}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => showProfile(stock.symbol)} className="flex-1 bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg font-medium transition-all">
                    Ver Detalles
                  </button>
                  <button className="flex-1 bg-slate-700 hover:bg-slate-600 px-4 py-2 rounded-lg font-medium transition-all">
                    ⭐ Watchlist
                  </button>
                </div>

                {profileLoading && <div className="mt-6 text-center text-slate-400">Cargando información empresarial...</div>}
                {profile && (
                  <div className="mt-6 bg-slate-800/70 border border-cyan-500/30 rounded-xl p-6">
                    <div className="flex items-start justify-between gap-4 mb-5">
                      <div>
                        <p className="text-cyan-400 text-sm font-semibold">{profile.symbol}</p>
                        <h3 className="text-2xl font-bold">{profile.company}</h3>
                        <p className="text-slate-400">{profile.sector} · {profile.industry}</p>
                      </div>
                      <button onClick={() => setProfile(null)} className="text-slate-400 hover:text-white">✕</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
                      {[
                        ['Market cap', profile.marketCap ? profile.marketCap.toLocaleString() : 'N/D'],
                        ['P/E', profile.pe ?? 'N/D'],
                        ['Forward P/E', profile.forwardPe ?? 'N/D'],
                        ['Beta', profile.beta ?? 'N/D'],
                        ['EPS', profile.eps ?? 'N/D'],
                        ['Dividendo', profile.dividend ?? 'N/D'],
                        ['Yield', profile.dividendYield ? `${(profile.dividendYield * 100).toFixed(2)}%` : 'N/D'],
                        ['Empleados', profile.employees?.toLocaleString() || 'N/D']
                      ].map(([label, value]) => (
                        <div key={label} className="bg-slate-900/60 rounded-lg p-3">
                          <p className="text-xs text-slate-500">{label}</p>
                          <p className="font-semibold mt-1">{value}</p>
                        </div>
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-300">
                      {profile.summary || 'El proveedor no entregó una descripción empresarial para este símbolo.'}
                    </p>
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="inline-block mt-4 text-cyan-400 hover:text-cyan-300 text-sm">
                        Visitar sitio oficial →
                      </a>
                    )}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <p className="text-slate-400">Comienza a buscar acciones por símbolo o nombre</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
