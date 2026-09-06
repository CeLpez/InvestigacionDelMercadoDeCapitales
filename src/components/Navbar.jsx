import React from 'react'

export default function Navbar({ currentPage, setCurrentPage, userEmail, onSignOut }) {
  const navItems = [
    { id: 'dashboard', label: '📊 Dashboard' },
    { id: 'search', label: '🔍 Buscar' },
    { id: 'education', label: '📚 Educación' },
    { id: 'comparison', label: '⚖️ Comparar' },
    { id: 'sectors', label: '🏢 Sectores' },
    { id: 'portfolio', label: '💼 Portafolio' },
    { id: 'history', label: '📜 Historial' },
    { id: 'alerts', label: '🔔 Alertas' },
    { id: 'simulator', label: '📈 Simulador' },
    { id: 'news', label: '📰 Noticias' },
    { id: 'recommendations', label: '💡 Recomendaciones' }
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 bg-[#080d18]/95 backdrop-blur-xl border-b border-slate-800 z-50">
      <div className="max-w-[1600px] mx-auto px-4 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          <h1 className="text-lg lg:text-xl font-semibold tracking-tight text-white whitespace-nowrap">
            <span className="text-cyan-400">◆</span> Capitales
          </h1>
          {onSignOut && (
            <div className="flex items-center gap-3 text-sm">
              <span className="hidden md:inline text-slate-400">{userEmail}</span>
              <button
                onClick={onSignOut}
                className="px-3 py-1.5 rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 transition-colors"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
        <div className="flex gap-1.5 overflow-x-auto pt-3 scrollbar-thin">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setCurrentPage(item.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                currentPage === item.id
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
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
