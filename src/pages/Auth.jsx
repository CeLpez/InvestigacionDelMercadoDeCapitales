import React, { useState } from 'react'
import { authService } from '../services/authService'

export default function Auth() {
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event) => {
    event.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      const result = mode === 'signin'
        ? await authService.signIn(email, password)
        : await authService.signUp(email, password)

      if (result.error) throw result.error
      if (mode === 'signup' && !result.data.session) {
        setMessage('Cuenta creada. Revisa tu correo para confirmar la dirección.')
      }
    } catch (authError) {
      setError(authError.message || 'No se pudo completar la operación')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md bg-slate-800/70 border border-slate-700 rounded-2xl p-8 shadow-xl">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">📈</p>
          <h1 className="text-3xl font-bold">Mercado de Capitales</h1>
          <p className="text-slate-400 mt-2">
            {mode === 'signin' ? 'Inicia sesión para acceder a tu cuenta' : 'Crea tu cuenta para guardar tus inversiones'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="block">
            <span className="block text-sm font-medium mb-2">Correo electrónico</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="tu@correo.com"
            />
          </label>

          <label className="block">
            <span className="block text-sm font-medium mb-2">Contraseña</span>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg focus:outline-none focus:border-blue-500"
              placeholder="Mínimo 6 caracteres"
            />
          </label>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {message && <p className="text-sm text-green-400">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 px-4 py-3 rounded-lg font-semibold transition-all"
          >
            {loading ? 'Procesando...' : mode === 'signin' ? 'Iniciar sesión' : 'Crear cuenta'}
          </button>
        </form>

        <button
          type="button"
          onClick={() => {
            setMode(mode === 'signin' ? 'signup' : 'signin')
            setError('')
            setMessage('')
          }}
          className="w-full mt-5 text-sm text-blue-400 hover:text-blue-300"
        >
          {mode === 'signin' ? '¿No tienes cuenta? Crear una' : '¿Ya tienes cuenta? Iniciar sesión'}
        </button>
      </div>
    </main>
  )
}
