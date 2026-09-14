'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'
import LogoIbc from '@/components/LogoIbc'
import type { EmailOtpType } from '@supabase/supabase-js'

export default function AuthCallbackPage() {
  const router = useRouter()
  const [erro, setErro] = useState('')

  useEffect(() => {
    const supabase = createClient()
    let cancelado = false

    async function ir() {
      if (!cancelado) router.replace('/definir-senha')
    }

    function falhar(mensagem?: string) {
      if (!cancelado) {
        setErro(mensagem ?? 'Link inválido ou expirado. Peça um novo e-mail.')
      }
    }

    async function handle() {
      const query = new URLSearchParams(window.location.search)
      const hash = new URLSearchParams(window.location.hash.replace(/^#/, ''))

      const access_token = hash.get('access_token')
      const refresh_token = hash.get('refresh_token')
      if (access_token && refresh_token) {
        const { error } = await supabase.auth.setSession({ access_token, refresh_token })
        if (error) falhar(error.message)
        else await ir()
        return
      }

      const token_hash = query.get('token_hash') ?? hash.get('token_hash')
      const type = (query.get('type') ?? hash.get('type')) as EmailOtpType | null
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ type, token_hash })
        if (error) falhar(error.message)
        else await ir()
        return
      }

      const code = query.get('code')
      if (code) {
        const viaServidor = await fetch('/api/auth/callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code }),
        })
        if (viaServidor.ok) {
          await ir()
          return
        }

        const { error } = await supabase.auth.exchangeCodeForSession(code)
        if (error) falhar(error.message)
        else await ir()
        return
      }

      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        await ir()
        return
      }

      falhar()
    }

    handle()
    return () => { cancelado = true }
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
        <div className="mb-4 inline-flex">
          <LogoIbc size={72} />
        </div>
        {erro ? (
          <>
            <h1 className="text-lg font-semibold text-gray-900 mb-2">Não foi possível entrar</h1>
            <p className="text-sm text-red-600 mb-6">{erro}</p>
            <a
              href="/esqueci-senha"
              className="inline-block bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg px-4 py-2.5"
            >
              Pedir novo e-mail
            </a>
          </>
        ) : (
          <>
            <Loader2 size={24} className="animate-spin text-indigo-600 mx-auto mb-3" />
            <p className="text-sm text-gray-500">Validando seu acesso...</p>
          </>
        )}
      </div>
    </div>
  )
}
