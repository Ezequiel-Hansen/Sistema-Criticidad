import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import { loginWithEmail } from '../lib/auth'

export function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) {
      toast.error('Completá email y contraseña')
      return
    }
    setBusy(true)
    try {
      await loginWithEmail(email, password)
      toast.success('Sesión iniciada')
      navigate('/', { state: { editable: true } })
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Credenciales incorrectas')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-off-white flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="bg-paper border border-line rounded-[14px] shadow-[0_1px_3px_rgba(20,32,43,.07)] p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-navy-deep mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <h1 className="font-display text-xl font-bold text-navy-deep m-0">Iniciar sesión</h1>
            <p className="text-[13px] text-ink-soft mt-1 m-0">Modo administrador</p>
          </div>

          <form onSubmit={(e) => void handleSubmit(e)} className="flex flex-col gap-4">
            <div>
              <label htmlFor="email" className="block text-[12px] font-medium text-ink-soft mb-1.5">Email</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full h-10 rounded-lg border border-line px-3 text-[13px] bg-white text-ink outline-none focus:border-navy-deep transition-colors"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-[12px] font-medium text-ink-soft mb-1.5">Contraseña</label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-10 rounded-lg border border-line px-3 text-[13px] bg-white text-ink outline-none focus:border-navy-deep transition-colors"
              />
            </div>

            <button
              type="submit"
              disabled={busy}
              className="w-full h-10 rounded-lg bg-teal text-white text-[13.5px] font-semibold hover:cursor-pointer hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity mt-2"
            >
              {busy ? 'Entrando…' : 'Ingresar'}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-full mt-4 h-9 rounded-lg border border-line text-ink-soft text-[12.5px] font-medium hover:bg-paper hover:cursor-pointer transition-colors"
        >
          ← Volver al inicio
        </button>
      </div>
    </div>
  )
}
