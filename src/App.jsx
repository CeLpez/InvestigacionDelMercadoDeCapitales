import React, { useState } from 'react'
import Navbar from './components/Navbar'
import Dashboard from './pages/Dashboard'
import StockSearch from './pages/StockSearch'
import MarketEducation from './pages/MarketEducation'
import CompetitorComparison from './pages/CompetitorComparison'
import SectorAnalysis from './pages/SectorAnalysis'
import Portfolio from './pages/Portfolio'
import Recommendations from './pages/Recommendations'

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard')

  const pages = {
    dashboard: <Dashboard />,
    search: <StockSearch />,
    education: <MarketEducation />,
    comparison: <CompetitorComparison />,
    sectors: <SectorAnalysis />,
    portfolio: <Portfolio />,
    recommendations: <Recommendations />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <Navbar currentPage={currentPage} setCurrentPage={setCurrentPage} />
      <main className="pt-20">
        {pages[currentPage]}
      </main>
    </div>
  )
}
