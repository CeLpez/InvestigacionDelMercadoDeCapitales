import React, { Suspense, lazy, useEffect, useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import Auth from './pages/Auth'
import { authService } from './services/authService'
import { isSupabaseConfigured } from './services/supabaseClient'

// Páginas secundarias divididas en chunks separados con React.lazy para reducir el bundle inicial.
const StockSearch = lazy(() => import('./pages/StockSearch'))
const MarketEducation = lazy(() => import('./pages/MarketEducation'))
const CompetitorComparison = lazy(() => import('./pages/CompetitorComparison'))
const SectorAnalysis = lazy(() => import('./pages/SectorAnalysis'))
const Portfolio = lazy(() => import('./pages/Portfolio'))
const TradingSimulator = lazy(() => import('./pages/TradingSimulator'))
const InvestmentCenter = lazy(() => import('./pages/InvestmentCenter'))
const Recommendations = lazy(() => import('./pages/Recommendations'))
const PriceAlerts = lazy(() => import('./pages/PriceAlerts'))
const TransactionHistory = lazy(() => import('./pages/TransactionHistory'))
const ReturnSimulator = lazy(() => import('./pages/ReturnSimulator'))
const FinancialNews = lazy(() => import('./pages/FinancialNews'))
const TechnicalAnalysis = lazy(() => import('./pages/TechnicalAnalysis'))

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
    trading: <TradingSimulator />,
    center: <InvestmentCenter />,
    recommendations: <Recommendations />,
    alerts: <PriceAlerts />,
    history: <TransactionHistory />,
    simulator: <ReturnSimulator />,
    news: <FinancialNews />,
    analysis: <TechnicalAnalysis />
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
        <Suspense fallback={<div role="status" aria-live="polite" className="min-h-[40vh] flex items-center justify-center text-slate-300">Cargando sección...</div>}>
          {pages[currentPage]}
        </Suspense>
      </main>
    </div>
  )
}
