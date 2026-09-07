import React, { Suspense, lazy, useState } from 'react'

// Se divide en chunks separados con React.lazy: estas pestañas ya se cargan como páginas independientes
// desde App.jsx, así que reutilizar lazy() aquí evita duplicar ese código en el bundle del centro de inversión.
const Portfolio = lazy(() => import('./Portfolio'))
const TradingSimulator = lazy(() => import('./TradingSimulator'))
const StockSearch = lazy(() => import('./StockSearch'))
const TransactionHistory = lazy(() => import('./TransactionHistory'))
const SectorAnalysis = lazy(() => import('./SectorAnalysis'))
const CompetitorComparison = lazy(() => import('./CompetitorComparison'))
const IolPortfolio = lazy(() => import('../components/IolPortfolio'))

const tabs = [
  ['portfolio', 'Mi portafolio'],
  ['trading', 'Comprar y vender'],
  ['companies', 'Empresas'],
  ['sectors', 'Sectores y pares'],
  ['comparison', 'Comparar'],
  ['history', 'Historial'],
  ['iol', 'IOL']
]

export default function InvestmentCenter() {
  const [activeTab, setActiveTab] = useState('portfolio')
  const content = {
    portfolio: <Portfolio />,
    trading: <TradingSimulator />,
    companies: <StockSearch />,
    sectors: <SectorAnalysis />,
    comparison: <CompetitorComparison />,
    history: <TransactionHistory />,
    iol: <IolPortfolio />
  }

  return (
    <div>
      <div className="max-w-[1250px] mx-auto px-4 lg:px-8 pt-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-2">Herramientas personales</p>
        <h2 className="text-4xl font-semibold tracking-tight text-white">Centro de inversión</h2>
        <p className="text-slate-400 mt-3 max-w-2xl">Investiga empresas, practica operaciones y seguí la evolución de tus tenencias desde un mismo lugar.</p>
        <div className="flex gap-2 overflow-x-auto mt-6 border-b border-slate-800 pb-px" role="tablist" aria-label="Secciones del centro de inversión">
          {tabs.map(([id, label]) => <button type="button" key={id} role="tab" aria-selected={activeTab === id} onClick={() => setActiveTab(id)} className={`px-4 py-3 whitespace-nowrap text-sm font-medium border-b-2 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-cyan-400 ${activeTab === id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-500 hover:text-white'}`}>{label}</button>)}
        </div>
      </div>
      <Suspense fallback={<div role="status" aria-live="polite" className="min-h-[30vh] flex items-center justify-center text-slate-300">Cargando pestaña...</div>}>
        {content[activeTab]}
      </Suspense>
    </div>
  )
}
