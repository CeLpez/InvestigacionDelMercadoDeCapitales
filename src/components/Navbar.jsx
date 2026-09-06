import React from 'react'

export default function Navbar({ currentPage, setCurrentPage }) {
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'search', label: '🔍 Buscar' },
    { id: 'education', label: '📚 Educación' },
    { id: 'comparison', label: '⚖️ Comparar' },
    { id: 'sectors', label: '🏢 Sectores' },
    { id: 'portfolio', label: '💼 Portafolio' },
    { id: 'recommendations', label: '💡 Recomendaciones' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-slate-900/95 backdrop-blur border-b border-slate-700 shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            📈 Mercado de Capitales
          </h1>
        </div>
        <div className="flex flex-wrap gap-2 overflow-x-auto pb-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </nav>
  )
}
