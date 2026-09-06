import React, { useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import StockSearch from './pages/StockSearch'
import MarketEducation from './pages/MarketEducation'
import CompetitorComparison from './pages/CompetitorComparison'
import SectorAnalysis from './pages/SectorAnalysis'
import Portfolio from './pages/Portfolio'
import Recommendations from './pages/Recommendations'
import PriceAlerts from './pages/PriceAlerts'
import TransactionHistory from './pages/TransactionHistory'
import ReturnSimulator from './pages/ReturnSimulator'
import FinancialNews from './pages/FinancialNews'
import Auth from './pages/Auth'
import { authService } from './services/authService'
import { isSupabaseConfigured } from './services/supabaseClient'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')
  const [session, setSession] = useState(null)
  const [authLoading, setAuthLoading] = useState(isSupabaseConfigured)

  useEffect(() => {
    if (!isSupabaseConfigured) return undefined

    authService.getSession()
      .then(({ data, error }) => {
        if (error) throw error
        setSession(data.session)
      })
      .catch(error => console.error('No se pudo recuperar la sesión:', error))
      .finally(() => setAuthLoading(false))

    const { data } = authService.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setAuthLoading(false)
    })

    return () => data.subscription.unsubscribe()
  }, [])

  const pages = {
    dashboard: <Dashboard />,
    search: <StockSearch />,
    education: <MarketEducation />,
    comparison: <CompetitorComparison />,
    sectors: <SectorAnalysis />,
    portfolio: <Portfolio />,
    recommendations: <Recommendations />,
    alerts: <PriceAlerts />,
    history: <TransactionHistory />,
    simulator: <ReturnSimulator />,
    news: <FinancialNews />
  }

  if (authLoading) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">Cargando sesión...</div>
  }

  if (isSupabaseConfigured && !session) {
    return <Auth />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        userEmail={session?.user?.email}
        onSignOut={isSupabaseConfigured ? () => authService.signOut() : undefined}
      />
      <main className="pt-28 lg:pt-24">
        {pages[currentPage]}
      </main>
    </div>
  )
}
