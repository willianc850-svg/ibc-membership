'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Settings, User, Lock, Save, Loader2, CheckCircle } from 'lucide-react'

export default function ConfiguracoesPage() {
  const [email, setEmail] = useState('')
  const [senhaAtual, setSenhaAtual] = useState('')
  const [novaSenha, setNovaSenha] = useState('')
  const [confirmarSenha, setConfirmarSenha] = useState('')
  const [salvandoPerfil, setSalvandoPerfil] = useState(false)
  const [salvandoSenha, setSalvandoSenha] = useState(false)
  const [msgPerfil, setMsgPerfil] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const [msgSenha, setMsgSenha] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null)
  const supabase = createClient()

  useEffect(() => {
    async function carregar() {
      const { data: { user } } = await supabase.auth.getUser()
      if (user?.email) setEmail(user.email)
    }
    carregar()
  }, [])

  async function salvarPerfil(e: React.FormEvent) {
    e.preventDefault()
    setSalvandoPerfil(true)
    setMsgPerfil(null)

    const { error } = await supabase.auth.updateUser({ email })

    if (error) {
      setMsgPerfil({ tipo: 'erro', texto: 'Erro ao atualizar e-mail.' })
    } else {
      setMsgPerfil({ tipo: 'sucesso', texto: 'E-mail atualizado! Verifique sua caixa de entrada.' })
    }
    setSalvandoPerfil(false)
  }

  async function salvarSenha(e: React.FormEvent) {
    e.preventDefault()
    setMsgSenha(null)

    if (novaSenha !== confirmarSenha) {
      setMsgSenha({ tipo: 'erro', texto: 'As senhas não coincidem.' })
      return
    }
    if (novaSenha.length < 6) {
      setMsgSenha({ tipo: 'erro', texto: 'A senha deve ter pelo menos 6 caracteres.' })
      return
    }

    setSalvandoSenha(true)
    const { error } = await supabase.auth.updateUser({ password: novaSenha })

    if (error) {
      setMsgSenha({ tipo: 'erro', texto: 'Erro ao atualizar senha.' })
    } else {
      setMsgSenha({ tipo: 'sucesso', texto: 'Senha atualizada com sucesso!' })
      setSenhaAtual('')
      setNovaSenha('')
      setConfirmarSenha('')
    }
    setSalvandoSenha(false)
  }

  const inputClass = "w-full border border-gray-300 rounded-lg px-3 py-2.5 text-sm text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"

  function Mensagem({ msg }: { msg: { tipo: 'sucesso' | 'erro'; texto: string } }) {
    return (
      <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
        msg.tipo === 'sucesso'
          ? 'bg-green-50 border border-green-200 text-green-700'
          : 'bg-red-50 border border-red-200 text-red-600'
      }`}>
        {msg.tipo === 'sucesso' && <CheckCircle size={16} />}
        {msg.texto}
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Título */}
      <div className="flex items-center gap-3 mb-2">
        <Settings size={24} className="text-indigo-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
          <p className="text-sm text-gray-500">Gerencie sua conta</p>
        </div>
      </div>

      {/* Perfil */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <User size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Dados da conta</h2>
        </div>
        <form onSubmit={salvarPerfil} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
            <input
              type="email"
              className={inputClass}
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <p className="text-xs text-gray-400 mt-1">
              Ao alterar, um e-mail de confirmação será enviado para o novo endereço.
            </p>
          </div>
          {msgPerfil && <Mensagem msg={msgPerfil} />}
          <button
            type="submit"
            disabled={salvandoPerfil}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {salvandoPerfil
              ? <><Loader2 size={16} className="animate-spin" /> Salvando...</>
              : <><Save size={16} /> Salvar e-mail</>
            }
          </button>
        </form>
      </div>

      {/* Senha */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
          <Lock size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-gray-900">Alterar senha</h2>
        </div>
        <form onSubmit={salvarSenha} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Mínimo 6 caracteres"
              value={novaSenha}
              onChange={e => setNovaSenha(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar nova senha</label>
            <input
              type="password"
              className={inputClass}
              placeholder="Repita a nova senha"
              value={confirmarSenha}
              onChange={e => setConfirmarSenha(e.target.value)}
              required
            />
          </div>
          {msgSenha && <Mensagem msg={msgSenha} />}
          <button
            type="submit"
            disabled={salvandoSenha}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-xl transition-colors"
          >
            {salvandoSenha
              ? <><Loader2 size={16} className="animate-spin" /> Salvando...</>
              : <><Save size={16} /> Alterar senha</>
            }
          </button>
        </form>
      </div>

      {/* Informações do sistema */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Sobre o sistema</h2>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Sistema</span>
            <span className="font-medium">IBC Membership</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Versão</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-gray-500">Banco de dados</span>
            <span className="font-medium">Supabase (PostgreSQL)</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Framework</span>
            <span className="font-medium">Next.js 16</span>
          </div>
        </div>
      </div>

    </div>
  )
}