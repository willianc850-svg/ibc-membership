'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Church, Loader2 } from 'lucide-react'

export default function EsqueciSenhaPage() {
  const [email, setEmail] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [enviado, setEnviado] = useState(false)
  const [erro, setErro] = useState('')
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)

    const origin = window.location.origin
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${origin}/auth/callback`,
    })

    setEnviando(false)
    if (error) {
      setErro('Não foi possível enviar o e-mail. Tente novamente.')
      return
    }
    setEnviado(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 text-white rounded-2xl p-4 mb-4">
            <Church size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Esqueci minha senha</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Enviaremos um link válido por 24 horas
          </p>
        </div>

        {enviado ? (
          <div className="space-y-4">
            <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded-lg px-4 py-3">
              Se o e-mail estiver cadastrado, você receberá o link para definir uma nova senha.
            </div>
            <Link
              href="/login"
              className="block text-center text-sm text-indigo-600 hover:text-indigo-700 font-medium"
            >
              Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
                required
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={enviando}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
            >
              {enviando ? (
                <><Loader2 size={16} className="animate-spin" /> Enviando...</>
              ) : (
                'Enviar link'
              )}
            </button>

            <Link
              href="/login"
              className="block text-center text-sm text-gray-500 hover:text-gray-700"
            >
              Voltar ao login
            </Link>
          </form>
        )}
      </div>
    </div>
  )
}
