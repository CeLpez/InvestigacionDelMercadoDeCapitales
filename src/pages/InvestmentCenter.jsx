import React, { useState } from 'react'
import Portfolio from './Portfolio'
import TradingSimulator from './TradingSimulator'
import StockSearch from './StockSearch'
import TransactionHistory from './TransactionHistory'

const tabs = [
  ['portfolio', 'Mi portafolio'],
  ['trading', 'Comprar y vender'],
  ['companies', 'Empresas'],
  ['history', 'Historial']
]

export default function InvestmentCenter() {
  const [activeTab, setActiveTab] = useState('portfolio')
  const content = {
    portfolio: <Portfolio />,
    trading: <TradingSimulator />,
    companies: <StockSearch />,
    history: <TransactionHistory />
  }

  return (
    <div>
      <div className="max-w-[1250px] mx-auto px-4 lg:px-8 pt-8">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-2">Herramientas personales</p>
        <h2 className="text-4xl font-semibold tracking-tight text-white">Centro de inversión</h2>
        <p className="text-slate-400 mt-3 max-w-2xl">Investiga empresas, practica operaciones y seguí la evolución de tus tenencias desde un mismo lugar.</p>
        <div className="flex gap-2 overflow-x-auto mt-6 border-b border-slate-800 pb-px">
          {tabs.map(([id, label]) => <button key={id} onClick={() => setActiveTab(id)} className={`px-4 py-3 whitespace-nowrap text-sm font-medium border-b-2 transition-colors ${activeTab === id ? 'border-cyan-400 text-cyan-300' : 'border-transparent text-slate-500 hover:text-white'}`}>{label}</button>)}
        </div>
      </div>
      {content[activeTab]}
    </div>
  )
}
