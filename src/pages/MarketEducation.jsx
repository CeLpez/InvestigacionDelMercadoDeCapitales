import React, { useState } from 'react'

const topics = [
  ['01', 'Mercado de capitales', 'Cómo las empresas se financian y cómo los inversores participan mediante acciones, bonos y fondos.'],
  ['02', 'Instrumentos', 'Acciones, bonos, CEDEARs, ADRs, ETFs y derivados: qué representa cada uno y qué riesgos tiene.'],
  ['03', 'Análisis fundamental', 'Ingresos, márgenes, deuda, flujo de caja, valoración y ventajas competitivas de una empresa.'],
  ['04', 'Análisis técnico', 'Tendencias, soportes, resistencias, volumen y volatilidad para interpretar el comportamiento del precio.'],
  ['05', 'Gestión del riesgo', 'Diversificación, tamaño de posición, liquidez, horizonte temporal y pérdida máxima tolerable.'],
  ['06', 'Estrategias', 'Largo plazo, value, growth, dividendos y aportes periódicos: cuándo tiene sentido cada enfoque.']
]

const glossary = [
  ['P/E', 'Precio de la acción dividido por las ganancias por acción.'],
  ['Beta', 'Sensibilidad histórica de un activo frente a los movimientos del mercado.'],
  ['Volatilidad', 'Magnitud y frecuencia con la que cambia el precio de un activo.'],
  ['ADR', 'Certificado negociado en EE. UU. que representa acciones de una empresa extranjera.'],
  ['CEDEAR', 'Certificado local que representa acciones o ETFs del exterior.'],
  ['CER', 'Índice que ajusta ciertos instrumentos argentinos por inflación.']
]

export default function MarketEducation() {
  const [activeLevel, setActiveLevel] = useState('principiante')
  const [showAnswer, setShowAnswer] = useState(false)
  const [examStarted, setExamStarted] = useState(false)
  const [examAnswers, setExamAnswers] = useState({})
  const [examSubmitted, setExamSubmitted] = useState(false)

  const examQuestions = [
    { question: '¿Qué función cumple principalmente el mercado de capitales?', options: ['Conectar ahorro e inversión', 'Garantizar ganancias', 'Eliminar toda volatilidad'], answer: 0 },
    { question: '¿Qué representa una acción?', options: ['Una deuda del Estado', 'Una participación en una empresa', 'Un depósito bancario'], answer: 1 },
    { question: '¿Qué práctica ayuda a reducir el riesgo no sistemático?', options: ['Concentrar todo en una empresa', 'Diversificar entre activos y sectores', 'Comprar solo lo que subió'], answer: 1 },
    { question: '¿Qué describe mejor una orden límite?', options: ['Se ejecuta a cualquier precio', 'Se ejecuta solo al precio indicado o uno mejor', 'No necesita saldo'], answer: 1 },
    { question: 'Antes de invertir, ¿qué debería definir una persona?', options: ['Objetivo, plazo y tolerancia al riesgo', 'La recomendación de un influencer', 'El activo con mayor rumor'], answer: 0 }
  ]
  const examScore = examQuestions.reduce((score, item, index) => score + (examAnswers[index] === item.answer ? 1 : 0), 0)

  const learningPaths = {
    principiante: {
      title: 'Cómo empezar sin improvisar',
      description: 'Define objetivo, plazo, moneda y pérdida máxima tolerable antes de elegir un activo.',
      items: ['Fondo de emergencia', 'Asignación diversificada', 'Aportes periódicos']
    },
    intermedio: {
      title: 'Cómo leer una empresa',
      description: 'Combina crecimiento, rentabilidad, deuda, valoración y generación de caja.',
      items: ['Ingresos y crecimiento', 'Margen operativo', 'Deuda neta / EBITDA', 'Flujo de caja libre']
    },
    argentina: {
      title: 'Particularidades de Argentina',
      description: 'Considera inflación, riesgo soberano, tipo de cambio, liquidez y la diferencia entre cotización local, ADR y CEDEAR.',
      items: ['Acciones y ADRs', 'Bonos hard-dollar y CER', 'Dólar, inflación y tasas']
    }
  }
  const path = learningPaths[activeLevel]

  return (
    <div className="max-w-[1200px] mx-auto px-4 lg:px-8 py-8">
      <header className="mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.22em] text-cyan-400 mb-3">Academia de mercado</p>
        <h2 className="text-4xl lg:text-5xl font-semibold tracking-tight text-white">Aprender antes de invertir</h2>
        <p className="text-slate-400 mt-4 text-lg leading-relaxed">Una guía práctica para entender instrumentos, analizar empresas y tomar decisiones con un proceso repetible.</p>
      </header>

      <section className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold text-white">Ruta de aprendizaje</h3>
          <span className="text-xs text-slate-500">3 niveles</span>
        </div>
        <div className="flex flex-wrap gap-2 mb-5">
          {[['principiante', 'Empezar'], ['intermedio', 'Analizar'], ['argentina', 'Argentina']].map(([level, label]) => (
            <button key={level} onClick={() => setActiveLevel(level)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeLevel === level ? 'bg-cyan-400 text-slate-950' : 'bg-slate-800 text-slate-400 hover:text-white'}`}>
              {label}
            </button>
          ))}
        </div>
        <div className="border-l-2 border-cyan-400/60 pl-5 py-2">
          <h4 className="text-2xl font-semibold text-white">{path.title}</h4>
          <p className="text-slate-400 mt-2 max-w-3xl">{path.description}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2 mt-5 text-sm text-slate-300">
            {path.items.map((item, index) => <span key={item}><span className="text-cyan-400 mr-2">{index + 1}.</span>{item}</span>)}
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h3 className="text-xl font-semibold text-white mb-5">Conceptos esenciales</h3>
        <div className="divide-y divide-slate-800 border-y border-slate-800">
          {topics.map(([number, title, description]) => (
            <article key={number} className="grid md:grid-cols-[70px_260px_1fr] gap-4 py-5 items-start">
              <span className="text-sm font-mono text-cyan-400">{number}</span>
              <h4 className="font-semibold text-white">{title}</h4>
              <p className="text-sm text-slate-400 leading-relaxed">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid lg:grid-cols-[1fr_360px] gap-8">
        <div>
          <h3 className="text-xl font-semibold text-white mb-5">Glosario rápido</h3>
          <div className="grid sm:grid-cols-2 gap-x-8">
            {glossary.map(([term, definition]) => (
              <div key={term} className="py-4 border-b border-slate-800">
                <p className="font-semibold text-cyan-300">{term}</p>
                <p className="text-sm text-slate-400 mt-1 leading-relaxed">{definition}</p>
              </div>
            ))}
          </div>
        </div>
        <aside className="border border-slate-800 rounded-2xl p-6 bg-[#0c1422]">
          <p className="text-xs uppercase tracking-wider text-cyan-400 mb-3">Autoevaluación</p>
          <h3 className="text-xl font-semibold text-white">¿Qué reduce el riesgo específico?</h3>
          <p className="text-sm text-slate-400 mt-3">Elige una opción para comprobar tu comprensión.</p>
          <div className="space-y-2 mt-5">
            {['Comprar después de una subida', 'Diversificar activos y sectores', 'Elegir siempre la acción de moda'].map(option => (
              <button key={option} onClick={() => setShowAnswer(option === 'Diversificar activos y sectores')} className="w-full text-left text-sm px-3 py-2.5 rounded-lg bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors">
                {option}
              </button>
            ))}
          </div>
          {showAnswer && <p className="text-sm text-emerald-400 mt-4">Correcto. Diversificar reduce la dependencia de un único emisor o sector.</p>}
        </aside>
      </section>

      <section className="mt-12 border-t border-slate-800 pt-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-5">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-amber-400 mb-2">Preparación</p>
            <h3 className="text-2xl font-semibold text-white">Simulacro de examen CNV</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-2xl">Preguntas de práctica sobre conceptos del mercado de capitales. No es el examen oficial ni otorga certificación.</p>
          </div>
          {!examStarted && <button onClick={() => { setExamStarted(true); setExamSubmitted(false); setExamAnswers({}) }} className="px-5 py-3 rounded-lg bg-amber-400 text-slate-950 font-semibold">Comenzar simulacro</button>}
        </div>
        {examStarted && <div className="border border-slate-800 rounded-2xl bg-[#0c1422] p-6">
          <div className="space-y-7">
            {examQuestions.map((item, index) => <fieldset key={item.question}><legend className="text-white font-medium mb-3">{index + 1}. {item.question}</legend><div className="grid md:grid-cols-3 gap-2">{item.options.map((option, optionIndex) => <label key={option} className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer ${examAnswers[index] === optionIndex ? 'border-amber-400 bg-amber-400/10 text-white' : 'border-slate-700 text-slate-400'}`}><input type="radio" name={`exam-${index}`} checked={examAnswers[index] === optionIndex} onChange={() => { setExamAnswers({ ...examAnswers, [index]: optionIndex }); setExamSubmitted(false) }} />{option}</label>)}</div></fieldset>)}
          </div>
          <div className="flex flex-wrap items-center gap-4 mt-8"><button onClick={() => setExamSubmitted(true)} className="px-5 py-3 rounded-lg bg-cyan-500 text-slate-950 font-semibold">Ver resultado</button><button onClick={() => setExamStarted(false)} className="px-5 py-3 rounded-lg bg-slate-800 text-slate-300">Cerrar</button>{examSubmitted && <p className="text-emerald-400 font-semibold">Resultado: {examScore}/{examQuestions.length} respuestas correctas.</p>}</div>
        </div>}
      </section>
    </div>
  )
}
