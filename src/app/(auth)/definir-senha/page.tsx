'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Church, Loader2 } from 'lucide-react'

export default function DefinirSenhaPage() {
  const router = useRouter()
  const supabase = createClient()
  const [pronto, setPronto] = useState(false)
  const [semSessao, setSemSessao] = useState(false)
  const [senha, setSenha] = useState('')
  const [confirmar, setConfirmar] = useState('')
  const [erro, setErro] = useState('')
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    let ativo = true
    async function checar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!ativo) return
      if (!user) {
        setSemSessao(true)
        setPronto(true)
        return
      }
      setPronto(true)
    }
    checar()
    return () => { ativo = false }
  }, [supabase])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (senha !== confirmar) {
      setErro('As senhas não coincidem.')
      return
    }
    if (senha.length < 6) {
      setErro('Mínimo 6 caracteres.')
      return
    }

    setSalvando(true)
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      setErro('Sessão expirada. Solicite um novo link.')
      setSalvando(false)
      return
    }

    const { error } = await supabase.auth.updateUser({
      password: senha,
      data: { must_set_password: false },
    })

    if (error) {
      setErro('Não foi possível salvar a senha. Tente novamente.')
      setSalvando(false)
      return
    }

    await supabase
      .from('perfis')
      .update({ convite_pendente: false })
      .eq('id', user.id)

    await supabase.auth.refreshSession()
    router.replace('/dashboard')
    router.refresh()
  }

  if (!pronto) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <Loader2 size={24} className="animate-spin text-indigo-600" />
      </div>
    )
  }

  if (semSessao) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md text-center">
          <h1 className="text-lg font-semibold text-gray-900 mb-2">Link inválido ou expirado</h1>
          <p className="text-sm text-gray-500 mb-6">
            Solicite um novo convite ou use “Esqueci minha senha”. O link vale por 24 horas.
          </p>
          <div className="flex flex-col gap-2">
            <Link href="/login" className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
              Ir para o login
            </Link>
            <Link href="/esqueci-senha" className="text-sm text-gray-500 hover:text-gray-700">
              Esqueci minha senha
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="bg-indigo-600 text-white rounded-2xl p-4 mb-4">
            <Church size={32} />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Definir senha</h1>
          <p className="text-gray-500 text-sm mt-1 text-center">
            Crie a senha que você usará para entrar no sistema
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              placeholder="Mínimo 6 caracteres"
              required
              className="w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha</label>
            <input
              type="password"
              value={confirmar}
              onChange={(e) => setConfirmar(e.target.value)}
              placeholder="Repita a senha"
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
            disabled={salvando}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium rounded-lg py-2.5 text-sm transition-colors flex items-center justify-center gap-2"
          >
            {salvando ? (
              <><Loader2 size={16} className="animate-spin" /> Salvando...</>
            ) : (
              'Salvar senha e entrar'
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
