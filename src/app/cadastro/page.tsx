'use client'

import { useState } from 'react'
import Link from 'next/link'
import LogoIbc from '@/components/LogoIbc'
import BotaoTema from '@/components/BotaoTema'
import { Loader2 } from 'lucide-react'

function mascaraTelefone(valor: string) {
  return valor
    .replace(/\D/g, '')
    .replace(/^(\d{2})(\d)/g, '($1) $2')
    .replace(/(\d{5})(\d)/, '$1-$2')
    .slice(0, 15)
}

export default function CadastroPublicoPage() {
  const [nome, setNome] = useState('')
  const [telefone, setTelefone] = useState('')
  const [email, setEmail] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [enviando, setEnviando] = useState(false)
  const [ok, setOk] = useState(false)
  const [erro, setErro] = useState('')

  async function enviar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const body = new FormData()
    body.set('nome_completo', nome)
    body.set('telefone', telefone)
    body.set('email', email)
    body.set('website', '')
    if (foto) body.set('foto', foto)

    const res = await fetch('/api/cadastro', { method: 'POST', body })
    const data = await res.json()
    setEnviando(false)
    if (!res.ok) {
      setErro(data.error ?? 'Não foi possível enviar.')
      return
    }
    setOk(true)
  }

  return (
    <div
      className="min-h-dvh flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4 py-8"
      style={{
        paddingTop: 'max(2rem, env(safe-area-inset-top))',
        paddingBottom: 'max(2rem, env(safe-area-inset-bottom))',
      }}
    >
      <div className="absolute top-4 right-4">
        <BotaoTema compacto />
      </div>
      <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <LogoIbc size={64} className="mb-3" />
          <h1 className="text-xl font-bold text-gray-900 text-center">Cadastro de membro</h1>
          <p className="text-sm text-gray-500 text-center mt-1">
            Igreja Batista Central — a diretoria confirma o cadastro antes de entrar na lista.
          </p>
        </div>

        {ok ? (
          <div className="space-y-4 text-center">
            <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-xl px-4 py-3">
              Cadastro enviado! Aguarde a diretoria aprovar. Se informou e-mail, você receberá o convite para acessar o sistema.
            </p>
            <Link href="/login" className="inline-flex min-h-11 items-center text-sm font-medium text-indigo-600">
              Ir para o login
            </Link>
          </div>
        ) : (
          <form onSubmit={enviar} className="space-y-4">
            <div className="hidden" aria-hidden>
              <input name="website" tabIndex={-1} autoComplete="off" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
              <input
                required
                minLength={3}
                autoComplete="name"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full min-h-11 border border-gray-300 rounded-lg px-4 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone / WhatsApp</label>
              <input
                type="tel"
                inputMode="numeric"
                autoComplete="tel"
                placeholder="(00) 00000-0000"
                value={telefone}
                onChange={(e) => setTelefone(mascaraTelefone(e.target.value))}
                className="w-full min-h-11 border border-gray-300 rounded-lg px-4 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full min-h-11 border border-gray-300 rounded-lg px-4 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto (opcional)</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFoto(e.target.files?.[0] ?? null)}
                className="w-full text-sm text-gray-600"
              />
            </div>
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-lg px-4 py-2.5">{erro}</div>
            )}
            <button
              type="submit"
              disabled={enviando}
              className="w-full min-h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2"
            >
              {enviando ? <><Loader2 size={16} className="animate-spin" /> Enviando...</> : 'Enviar cadastro'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
