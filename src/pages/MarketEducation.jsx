import React from 'react'

export default function MarketEducation() {
  const sections = [
    {
      title: '¿Qué es el Mercado de Capitales?',
      icon: '📚',
      content: 'El mercado de capitales es un conjunto de instituciones y sistemas mediante los cuales se emiten y negocian valores a mediano y largo plazo, como acciones y bonos. Permite a las empresas obtener financiamiento y a los inversionistas diversificar sus carteras.',
      key: 'definition'
    },
    {
      title: 'Tipos de Instrumentos',
      icon: '📈',
      content: 'Acciones (equity): Representan propiedad en la empresa. Bonos (fixed income): Son préstamos a la empresa. ETFs: Fondos que rastrean índices. Opciones: Derivados para estrategias avanzadas.',
      key: 'instruments'
    },
    {
      title: 'Análisis Fundamental vs Técnico',
      icon: '🔍',
      content: 'Fundamental: Evalúa la salud financiera, P/E ratio, crecimiento. Técnico: Analiza gráficos, patrones y tendencias. Ambos son herramientas complementarias.',
      key: 'analysis'
    },
    {
      title: 'Gestión de Riesgo',
      icon: '🛡️',
      content: 'Diversificación: No concentrar en una sola acción. Stop-loss: Límites para pérdidas. Hedging: Usar derivados para protegerse. Mantén un fondo de emergencia.',
      key: 'risk'
    },
    {
      title: 'Indicadores Clave',
      icon: '📊',
      content: 'P/E Ratio: Precio vs Ganancia. ROE: Retorno sobre el capital. Debt/Equity: Apalancamiento. Free Cash Flow: Flujo de caja disponible.',
      key: 'indicators'
    },
    {
      title: 'Estrategias de Inversión',
      icon: '💡',
      content: 'Buy & Hold: Comprar y mantener largo plazo. Value Investing: Buscar acciones subvaluadas. Growth Investing: Enfocarse en potencial de crecimiento. Dividend Strategy: Generar ingresos pasivos.',
      key: 'strategies'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h2 className="text-4xl font-bold mb-2">📚 Educación del Mercado de Capitales</h2>
        <p className="text-slate-400">Aprende los conceptos fundamentales para invertir con confianza</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {sections.map(section => (
          <div key={section.key} className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-6 hover:border-blue-500 transition-all">
            <div className="flex items-start gap-4">
              <span className="text-4xl">{section.icon}</span>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">{section.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{section.content}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Sección de Glosario */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-6">📖 Glosario Financiero</h3>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            { term: 'Bull Market', def: 'Mercado alcista con precios en aumento' },
            { term: 'Bear Market', def: 'Mercado bajista con precios en caída' },
            { term: 'Volatilidad', def: 'Medida de fluctuación de precios' },
            { term: 'Dividendo', def: 'Pago de ganancias a accionistas' },
            { term: 'IPO', def: 'Primera oferta pública de acciones' },
            { term: 'Índice', def: 'Medida del desempeño del mercado' }
          ].map((item, idx) => (
            <div key={idx} className="bg-slate-900/50 p-4 rounded-lg">
              <p className="font-bold text-blue-400 mb-1">{item.term}</p>
              <p className="text-slate-400 text-sm">{item.def}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Consejos para principiantes */}
      <div className="mt-8 bg-blue-900/30 border border-blue-700/50 rounded-xl p-8">
        <h3 className="text-2xl font-bold mb-4">💡 Consejos para Principiantes</h3>
        <ul className="space-y-3 text-slate-300">
          <li>✅ Empieza pequeño y aprende mientras inviertes</li>
          <li>✅ Diversifica tu portafolio en diferentes sectores y empresas</li>
          <li>✅ No intentes "timing the market" - es impredecible</li>
          <li>✅ Mantén una perspectiva de largo plazo (5+ años)</li>
          <li>✅ Estudia las empresas antes de invertir</li>
          <li>✅ Sigue noticias financieras y eventos económicos</li>
          <li>✅ No inviertas dinero que necesites en corto plazo</li>
        </ul>
      </div>
    </div>
  )
}
