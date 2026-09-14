'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import LogoIbc from '@/components/LogoIbc'
import BotaoTema from '@/components/BotaoTema'
import CampoSenha from '@/components/CampoSenha'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [carregando, setCarregando] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const motivo = new URLSearchParams(window.location.search).get('erro')
    if (motivo === 'link-invalido') {
      setErro('Link inválido ou expirado. Peça um novo e-mail e abra o link no mesmo navegador.')
    }
  }, [])

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setCarregando(true)

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password: senha,
    })

    if (error) {
      setErro('E-mail ou senha incorretos.')
      setCarregando(false)
      return
    }

    router.push('/')
    router.refresh()
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 relative px-4 py-8" style={{ paddingTop: 'max(2rem, env(safe-area-inset-top))', paddingBottom: 'max(2rem, env(safe-area-inset-bottom))' }}>
      <div className="absolute top-4 right-4" style={{ top: 'max(1rem, env(safe-area-inset-top))', right: 'max(1rem, env(safe-area-inset-right))' }}>
        <BotaoTema compacto />
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <LogoIbc size={72} className="mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">IBC Membership</h1>
          <p className="text-gray-500 text-sm mt-1">Sistema de Gestão de Membros</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">
              E-mail
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="username"
              inputMode="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              required
              className="w-full min-h-11 border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>

          <CampoSenha
            id="login-senha"
            label="Senha"
            value={senha}
            onChange={setSenha}
            placeholder="••••••••"
            autoComplete="current-password"
            required
          />

          <div className="text-right">
            <Link href="/esqueci-senha" className="inline-flex items-center min-h-11 text-sm text-indigo-600 hover:text-indigo-700">
              Esqueci minha senha
            </Link>
          </div>

          {erro && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">
              {erro}
            </div>
          )}

          <button
            type="submit"
            disabled={carregando}
            className="w-full min-h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {carregando ? (
              <><Loader2 size={16} className="animate-spin" /> Entrando...</>
            ) : (
              'Entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
